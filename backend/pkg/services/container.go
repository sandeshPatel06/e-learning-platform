package services

import (
	"context"
	"database/sql"
	"fmt"
	"log/slog"
	"math/rand"
	"os"
	"strings"

	entsql "entgo.io/ent/dialect/sql"
	"github.com/SHP-Association/E-learningWeb/backend/config"
	"github.com/SHP-Association/E-learningWeb/backend/ent"
	"github.com/SHP-Association/E-learningWeb/backend/pkg/log"
	"github.com/labstack/echo/v4"
	_ "github.com/lib/pq"
	_ "github.com/mattn/go-sqlite3"
	"github.com/mikestefanello/backlite"
	"github.com/spf13/afero"

	"github.com/SHP-Association/E-learningWeb/backend/ent/hook"
	"golang.org/x/crypto/bcrypt"

	// Required by ent.
	_ "github.com/SHP-Association/E-learningWeb/backend/ent/runtime"
)

// Container contains all services used by the application and provides an easy way to handle dependency
// injection including within tests.
type Container struct {
	// Validator stores a validator
	Validator *Validator

	// Web stores the web framework.
	Web *echo.Echo

	// Config stores the application configuration.
	Config *config.Config

	// Cache contains the cache client.
	Cache *CacheClient

	// Database stores the connection to the database.
	Database *sql.DB

	// Files stores the file system.
	Files afero.Fs

	// ORM stores a client to the ORM.
	ORM *ent.Client

	// Mail stores an email sending client.
	Mail *MailClient

	// Auth stores an authentication client.
	Auth *AuthClient

	// Tasks stores the task client.
	Tasks *backlite.Client

	// TaskDB stores the separate SQLite database used for tasks.
	TaskDB *sql.DB
}

// NewContainer creates and initializes a new Container.
func NewContainer() *Container {
	c := new(Container)
	c.initConfig()
	c.initValidator()
	c.initWeb()
	c.initCache()
	c.initDatabase()
	c.initFiles()
	c.initORM()
	c.initAuth()
	c.initMail()
	c.initTasks()
	return c
}

// Shutdown gracefully shuts the Container down and disconnects all connections.
func (c *Container) Shutdown() error {
	// Shutdown the web server.
	webCtx, webCancel := context.WithTimeout(context.Background(), c.Config.HTTP.ShutdownTimeout)
	defer webCancel()
	if err := c.Web.Shutdown(webCtx); err != nil {
		return err
	}

	// Shutdown the task runner.
	taskCtx, taskCancel := context.WithTimeout(context.Background(), c.Config.Tasks.ShutdownTimeout)
	defer taskCancel()
	c.Tasks.Stop(taskCtx)

	// Shutdown the task database.
	if c.TaskDB != nil {
		if err := c.TaskDB.Close(); err != nil {
			return err
		}
	}

	// Shutdown the ORM.
	if err := c.ORM.Close(); err != nil {
		return err
	}

	// Shutdown the database.
	if err := c.Database.Close(); err != nil {
		return err
	}

	// Shutdown the cache.
	c.Cache.Close()

	return nil
}

// initConfig initializes configuration.
func (c *Container) initConfig() {
	cfg, err := config.GetConfig()
	if err != nil {
		panic(fmt.Sprintf("failed to load config: %v", err))
	}

	c.Config = &cfg

	if err := config.GenerateConfigYAML("config/config.yaml"); err != nil {
		panic(fmt.Sprintf("failed to generate config.yaml: %v", err))
	}

	// Configure logging.
	switch cfg.App.Environment {
	case config.EnvProduction:
		slog.SetLogLoggerLevel(slog.LevelInfo)
	default:
		slog.SetLogLoggerLevel(slog.LevelDebug)
	}
}

// initValidator initializes the validator.
func (c *Container) initValidator() {
	c.Validator = NewValidator()
}

// initWeb initializes the web framework.
func (c *Container) initWeb() {
	c.Web = echo.New()
	c.Web.HideBanner = true
	c.Web.Validator = c.Validator
}

// initCache initializes the cache.
func (c *Container) initCache() {
	store, err := newInMemoryCache(c.Config.Cache.Capacity)
	if err != nil {
		panic(err)
	}

	c.Cache = NewCacheClient(store)
}

// initDatabase initializes the database.
func (c *Container) initDatabase() {
	var err error
	var connection string
	var driver string

	switch c.Config.App.Environment {
	case config.EnvTest:
		// TODO: Drop/recreate the DB, if this isn't in memory?
		connection = c.Config.Database.TestConnection
		if strings.HasPrefix(connection, "file:") || strings.Contains(connection, "sqlite") {
			driver = "sqlite3"
		} else {
			driver = c.Config.Database.Driver
		}
	default:
		connection = c.Config.Database.Connection
		driver = c.Config.Database.Driver
	}

	c.Database, err = openDB(driver, connection)
	if err != nil {
		panic(err)
	}
}

// initFiles initializes the file system.
func (c *Container) initFiles() {
	// Use in-memory storage for tests.
	if c.Config.App.Environment == config.EnvTest {
		c.Files = afero.NewMemMapFs()
		return
	}

	fs := afero.NewOsFs()
	if err := fs.MkdirAll(c.Config.Files.Directory, 0755); err != nil {
		panic(err)
	}
	c.Files = afero.NewBasePathFs(fs, c.Config.Files.Directory)
}

// initORM initializes the ORM.
func (c *Container) initORM() {
	driver := c.Config.Database.Driver
	if c.Config.App.Environment == config.EnvTest {
		connection := c.Config.Database.TestConnection
		if strings.HasPrefix(connection, "file:") || strings.Contains(connection, "sqlite") {
			driver = "sqlite3"
		}
	}
	drv := entsql.OpenDB(driver, c.Database)
	c.ORM = ent.NewClient(ent.Driver(drv))

	// Apply runtime hooks to solve import cycles in schema definitions.
	// User hooks: Normalize email and hash password.
	c.ORM.User.Use(hook.On(
		func(next ent.Mutator) ent.Mutator {
			return hook.UserFunc(func(ctx context.Context, m *ent.UserMutation) (ent.Value, error) {
				if v, exists := m.Email(); exists {
					m.SetEmail(strings.ToLower(v))
				}
				if v, exists := m.Password(); exists {
					hash, err := bcrypt.GenerateFromPassword([]byte(v), bcrypt.DefaultCost)
					if err != nil {
						return "", err
					}
					m.SetPassword(string(hash))
				}
				return next.Mutate(ctx, m)
			})
		},
		ent.OpCreate|ent.OpUpdate|ent.OpUpdateOne,
	))

	// PasswordToken hooks: Hash token.
	c.ORM.PasswordToken.Use(hook.On(
		func(next ent.Mutator) ent.Mutator {
			return hook.PasswordTokenFunc(func(ctx context.Context, m *ent.PasswordTokenMutation) (ent.Value, error) {
				if v, exists := m.Token(); exists {
					hash, err := bcrypt.GenerateFromPassword([]byte(v), bcrypt.DefaultCost)
					if err != nil {
						return "", err
					}
					m.SetToken(string(hash))
				}
				return next.Mutate(ctx, m)
			})
		},
		ent.OpCreate|ent.OpUpdate|ent.OpUpdateOne,
	))

	// Run the auto migration tool.
	if err := c.ORM.Schema.Create(context.Background()); err != nil {
		panic(err)
	}
}

// initAuth initializes the authentication client.
func (c *Container) initAuth() {
	c.Auth = NewAuthClient(c.Config, c.ORM)
}

// initMail initialize the mail client.
func (c *Container) initMail() {
	var err error
	c.Mail, err = NewMailClient(c.Config)
	if err != nil {
		panic(fmt.Sprintf("failed to create mail client: %v", err))
	}
}

// initTasks initializes the task client.
func (c *Container) initTasks() {
	var err error

	// Backlite currently only supports SQLite and uses SQLite-specific syntax (STRICT tables).
	// We use a separate SQLite database for tasks to allow the main database to be Postgres.
	c.TaskDB, err = openDB("sqlite3", "tasks.sqlite?cache=shared&_fk=true")
	if err != nil {
		panic(fmt.Sprintf("failed to open task database: %v", err))
	}

	c.Tasks, err = backlite.NewClient(backlite.ClientConfig{
		DB:              c.TaskDB,
		Logger:          log.Default(),
		NumWorkers:      c.Config.Tasks.Goroutines,
		ReleaseAfter:    c.Config.Tasks.ReleaseAfter,
		CleanupInterval: c.Config.Tasks.CleanupInterval,
	})

	if err != nil {
		panic(fmt.Sprintf("failed to create task client: %v", err))
	}

	if err = c.Tasks.Install(); err != nil {
		panic(fmt.Sprintf("failed to install task schema: %v", err))
	}
}

// openDB opens a database connection.
func openDB(driver, connection string) (*sql.DB, error) {
	if driver == "sqlite3" {
		// Helper to automatically create the directories that the specified sqlite file
		// should reside in, if one.
		d := strings.Split(connection, "/")
		if len(d) > 1 {
			dirpath := strings.Join(d[:len(d)-1], "/")

			if err := os.MkdirAll(dirpath, 0755); err != nil {
				return nil, err
			}
		}

		// Check if a random value is required, which is often used for in-memory test databases.
		if strings.Contains(connection, "$RAND") {
			connection = strings.Replace(connection, "$RAND", fmt.Sprint(rand.Int()), 1)
		}
	}

	return sql.Open(driver, connection)
}
