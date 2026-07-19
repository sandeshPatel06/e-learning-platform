package config

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

type environment string

const (
	EnvLocal      environment = "local"
	EnvTest       environment = "test"
	EnvProduction environment = "prod"
)

// SwitchEnvironment switches the environment to the specified one.
func SwitchEnvironment(env environment) {
	os.Setenv("APP_ENVIRONMENT", string(env))
}

type (
	// Config stores complete configuration.
	Config struct {
		HTTP     HTTPConfig
		App      AppConfig
		Cache    CacheConfig
		Database DatabaseConfig
		Files    FilesConfig
		Tasks    TasksConfig
		Mail     MailConfig
		CORS     CORSConfig
	}

	// CORSConfig stores CORS configuration.
	CORSConfig struct {
		AllowOrigins string
		AllowHeaders string
		AllowMethods string
	}

	// HTTPConfig stores HTTP configuration.
	HTTPConfig struct {
		Hostname        string
		Port            uint16
		ReadTimeout     time.Duration
		WriteTimeout    time.Duration
		IdleTimeout     time.Duration
		ShutdownTimeout time.Duration
		TLSEnabled      bool
		TLSCertificate  string
		TLSKey          string
	}

	// AppConfig stores application configuration.
	AppConfig struct {
		Name                             string
		Host                             string
		Environment                      environment
		EncryptionKey                    string
		Timeout                          time.Duration
		PasswordTokenExpiration          time.Duration
		PasswordTokenLength              int
		EmailVerificationTokenExpiration time.Duration
	}

	// CacheConfig stores the cache configuration.
	CacheConfig struct {
		Capacity             int
		ExpirationPublicFile time.Duration
	}

	// DatabaseConfig stores the database configuration.
	DatabaseConfig struct {
		Driver         string
		Connection     string
		TestConnection string
		Host           string
		Port           int
		User           string
		Password       string
		Name           string
	}

	// FilesConfig stores the file system configuration.
	FilesConfig struct {
		Directory string
	}

	// TasksConfig stores the tasks configuration.
	TasksConfig struct {
		Goroutines      int
		ReleaseAfter    time.Duration
		CleanupInterval time.Duration
		ShutdownTimeout time.Duration
	}

	// MailConfig stores the mail configuration.
	MailConfig struct {
		Hostname    string
		Port        uint16
		User        string
		Password    string
		FromAddress string
	}
)

// GetConfig loads and returns configuration.
func GetConfig() (Config, error) {
	var c Config

	// Load .env file manually (project pattern)
	loadDotEnv(".env")

	// Manually populate the config struct (project idea: explicit over implicit)
	c.HTTP.Hostname = getEnv("HTTP_HOSTNAME", "")
	c.HTTP.Port = uint16(getEnvAsInt("HTTP_PORT", 8000))
	c.HTTP.ReadTimeout = getEnvAsDuration("HTTP_READ_TIMEOUT", 5*time.Second)
	c.HTTP.WriteTimeout = getEnvAsDuration("HTTP_WRITE_TIMEOUT", 10*time.Second)
	c.HTTP.IdleTimeout = getEnvAsDuration("HTTP_IDLE_TIMEOUT", 2*time.Minute)
	c.HTTP.ShutdownTimeout = getEnvAsDuration("HTTP_SHUTDOWN_TIMEOUT", 10*time.Second)
	c.HTTP.TLSEnabled = getEnvAsBool("HTTP_TLS_ENABLED", false)
	c.HTTP.TLSCertificate = getEnv("HTTP_TLS_CERTIFICATE", "")
	c.HTTP.TLSKey = getEnv("HTTP_TLS_KEY", "")

	c.App.Name = getEnv("APP_NAME", "Pagoda")
	c.App.Host = getEnv("APP_HOST", "http://localhost:8000")
	c.App.Environment = environment(getEnv("APP_ENVIRONMENT", "local"))
	c.App.EncryptionKey = getEncryptionKey()
	c.App.Timeout = getEnvAsDuration("APP_TIMEOUT", 20*time.Second)
	c.App.PasswordTokenExpiration = getEnvAsDuration("APP_PASSWORD_TOKEN_EXPIRATION", 60*time.Minute)
	c.App.PasswordTokenLength = getEnvAsInt("APP_PASSWORD_TOKEN_LENGTH", 64)
	c.App.EmailVerificationTokenExpiration = getEnvAsDuration("APP_EMAIL_VERIFICATION_TOKEN_EXPIRATION", 12*time.Hour)

	c.Cache.Capacity = getEnvAsInt("CACHE_CAPACITY", 100000)
	c.Cache.ExpirationPublicFile = getEnvAsDuration("CACHE_EXPIRATION_PUBLIC_FILE", 4380*time.Hour)

	c.Database.Driver = getEnv("DATABASE_DRIVER", "postgres")
	c.Database.Host = getEnv("DATABASE_HOST", "localhost")
	c.Database.Port = getEnvAsInt("DATABASE_PORT", 5432)
	c.Database.User = getEnv("DATABASE_USER", "postgres")
	c.Database.Password = getEnv("DATABASE_PASSWORD", "postgres")
	c.Database.Name = getEnv("DATABASE_NAME", "shp_db")
	c.Database.Connection = getEnv("DATABASE_CONNECTION", buildPostgresURL())
	c.Database.TestConnection = getEnv("DATABASE_TEST_CONNECTION", buildPostgresURL())

	c.Files.Directory = getEnv("FILES_DIRECTORY", "uploads")

	c.Tasks.Goroutines = getEnvAsInt("TASKS_GOROUTINES", 1)
	c.Tasks.ReleaseAfter = getEnvAsDuration("TASKS_RELEASE_AFTER", 15*time.Minute)
	c.Tasks.CleanupInterval = getEnvAsDuration("TASKS_CLEANUP_INTERVAL", 1*time.Hour)
	c.Tasks.ShutdownTimeout = getEnvAsDuration("TASKS_SHUTDOWN_TIMEOUT", 10*time.Second)

	c.Mail.Hostname = getEnv("MAIL_HOSTNAME", "localhost")
	c.Mail.Port = uint16(getEnvAsInt("MAIL_PORT", 25))
	c.Mail.User = getEnv("MAIL_USER", "admin")
	c.Mail.Password = getEnv("MAIL_PASSWORD", "admin")
	c.Mail.FromAddress = getEnv("MAIL_FROM_ADDRESS", "admin@localhost")

	c.CORS.AllowOrigins = getEnv("CORS_ALLOW_ORIGINS", "*")
	c.CORS.AllowHeaders = getEnv("CORS_ALLOW_HEADERS", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Cookie")
	c.CORS.AllowMethods = getEnv("CORS_ALLOW_METHODS", "GET, POST, PUT, DELETE, PATCH, OPTIONS")

	if err := c.Validate(); err != nil {
		return c, err
	}

	return c, nil
}

// Validate ensures that essential configuration fields are set.
func (c Config) Validate() error {
	if c.App.EncryptionKey == "" {
		return errors.New("APP_ENCRYPTION_KEY is missing")
	}
	if c.Database.Driver == "postgres" && c.Database.Connection == "" {
		return errors.New("DATABASE connection configuration is incomplete")
	}
	if c.HTTP.Port == 0 {
		return errors.New("HTTP_PORT is missing")
	}
	return nil
}

// findProjectRoot traverses upward to locate the directory containing go.mod, which is the project root.
func findProjectRoot() string {
	curr, err := os.Getwd()
	if err != nil {
		return ""
	}
	for {
		if _, err := os.Stat(filepath.Join(curr, "go.mod")); err == nil {
			return curr
		}
		parent := filepath.Dir(curr)
		if parent == curr {
			return ""
		}
		curr = parent
	}
}

// GenerateConfigYAML builds the configuration map manually from environment variables
// and writes it as a flat YAML file (matches the project implementation idea).
func GenerateConfigYAML(path string) error {
	root := findProjectRoot()
	if root != "" && !filepath.IsAbs(path) {
		path = filepath.Join(root, path)
	}
	cfg := map[string]interface{}{
		"HTTP_HOSTNAME":         getEnv("HTTP_HOSTNAME", ""),
		"HTTP_PORT":             getEnvAsInt("HTTP_PORT", 8000),
		"HTTP_READ_TIMEOUT":     getEnvAsDurationString("HTTP_READ_TIMEOUT", 5*time.Second),
		"HTTP_WRITE_TIMEOUT":    getEnvAsDurationString("HTTP_WRITE_TIMEOUT", 10*time.Second),
		"HTTP_IDLE_TIMEOUT":     getEnvAsDurationString("HTTP_IDLE_TIMEOUT", 2*time.Minute),
		"HTTP_SHUTDOWN_TIMEOUT": getEnvAsDurationString("HTTP_SHUTDOWN_TIMEOUT", 10*time.Second),
		"HTTP_TLS_ENABLED":      getEnvAsBool("HTTP_TLS_ENABLED", false),
		"HTTP_TLS_CERTIFICATE":  getEnv("HTTP_TLS_CERTIFICATE", ""),
		"HTTP_TLS_KEY":          getEnv("HTTP_TLS_KEY", ""),

		"APP_NAME":                             getEnv("APP_NAME", "Pagoda"),
		"APP_HOST":                             getEnv("APP_HOST", "http://localhost:8000"),
		"APP_ENVIRONMENT":                      getEnv("APP_ENVIRONMENT", "local"),
		"APP_ENCRYPTION_KEY":                   getEnv("APP_ENCRYPTION_KEY", ""),
		"APP_TIMEOUT":                          getEnvAsDurationString("APP_TIMEOUT", 20*time.Second),
		"APP_PASSWORD_TOKEN_EXPIRATION":        getEnvAsDurationString("APP_PASSWORD_TOKEN_EXPIRATION", 60*time.Minute),
		"APP_PASSWORD_TOKEN_LENGTH":            getEnvAsInt("APP_PASSWORD_TOKEN_LENGTH", 64),
		"APP_EMAIL_VERIFICATION_TOKEN_EXPIRATION": getEnvAsDurationString("APP_EMAIL_VERIFICATION_TOKEN_EXPIRATION", 12*time.Hour),

		"CACHE_CAPACITY":               getEnvAsInt("CACHE_CAPACITY", 100000),
		"CACHE_EXPIRATION_PUBLIC_FILE": getEnvAsDurationString("CACHE_EXPIRATION_PUBLIC_FILE", 4380*time.Hour),

		"DATABASE_DRIVER":          getEnv("DATABASE_DRIVER", "postgres"),
		"DATABASE_HOST":            getEnv("DATABASE_HOST", "localhost"),
		"DATABASE_PORT":            getEnvAsInt("DATABASE_PORT", 5432),
		"DATABASE_USER":            getEnv("DATABASE_USER", "postgres"),
		"DATABASE_PASSWORD":        getEnv("DATABASE_PASSWORD", "postgres"),
		"DATABASE_NAME":            getEnv("DATABASE_NAME", "shp_db"),
		"DATABASE_CONNECTION":      getEnv("DATABASE_CONNECTION", buildPostgresURL()),
		"DATABASE_TEST_CONNECTION": getEnv("DATABASE_TEST_CONNECTION", buildPostgresURL()),

		"FILES_DIRECTORY": getEnv("FILES_DIRECTORY", "uploads"),

		"TASKS_GOROUTINES":      getEnvAsInt("TASKS_GOROUTINES", 1),
		"TASKS_RELEASE_AFTER":   getEnvAsDurationString("TASKS_RELEASE_AFTER", 15*time.Minute),
		"TASKS_CLEANUP_INTERVAL": getEnvAsDurationString("TASKS_CLEANUP_INTERVAL", 1*time.Hour),
		"TASKS_SHUTDOWN_TIMEOUT": getEnvAsDurationString("TASKS_SHUTDOWN_TIMEOUT", 10*time.Second),

		"MAIL_HOSTNAME":     getEnv("MAIL_HOSTNAME", "localhost"),
		"MAIL_PORT":         getEnvAsInt("MAIL_PORT", 25),
		"MAIL_USER":         getEnv("MAIL_USER", "admin"),
		"MAIL_PASSWORD":     getEnv("MAIL_PASSWORD", "admin"),
		"MAIL_FROM_ADDRESS": getEnv("MAIL_FROM_ADDRESS", "admin@localhost"),

		"CORS_ALLOW_ORIGINS": getEnv("CORS_ALLOW_ORIGINS", "*"),
		"CORS_ALLOW_HEADERS": getEnv("CORS_ALLOW_HEADERS", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, Cookie"),
		"CORS_ALLOW_METHODS": getEnv("CORS_ALLOW_METHODS", "GET, POST, PUT, DELETE, PATCH, OPTIONS"),
	}

	out, err := yaml.Marshal(cfg)
	if err != nil {
		return err
	}

	return os.WriteFile(path, out, 0644)
}

// -------- Helper Functions (Faithful to project) --------

func getEnv(key, fallback string) string {
	if val, exists := os.LookupEnv(key); exists && val != "" {
		return val
	}
	return fallback
}

func getEnvAsInt(key string, fallback int) int {
	if val, exists := os.LookupEnv(key); exists {
		if v, err := strconv.Atoi(val); err == nil {
			return v
		}
	}
	return fallback
}

func getEnvAsBool(key string, fallback bool) bool {
	if val, exists := os.LookupEnv(key); exists {
		if v, err := strconv.ParseBool(val); err == nil {
			return v
		}
	}
	return fallback
}

func getEnvAsDuration(key string, fallback time.Duration) time.Duration {
	if val, exists := os.LookupEnv(key); exists && val != "" {
		if d, err := time.ParseDuration(val); err == nil {
			return d
		}
	}
	return fallback
}

func getEnvAsDurationString(key string, fallback time.Duration) string {
	return getEnvAsDuration(key, fallback).String()
}

func getEncryptionKey() string {
	if val, exists := os.LookupEnv("APP_ENCRYPTION_KEY"); exists && val != "" {
		return val
	}
	// Don't log.Fatal here, let Validate handle it
	return ""
}

func buildPostgresURL() string {
	user := getEnv("DATABASE_USER", "postgres")
	pass := getEnv("DATABASE_PASSWORD", "postgres")
	host := getEnv("DATABASE_HOST", "localhost")
	port := getEnv("DATABASE_PORT", "5432")
	name := getEnv("DATABASE_NAME", "shp_db")
	return fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable", host, port, user, pass, name)
}

func loadDotEnv(path string) {
	root := findProjectRoot()
	if root == "" {
		return
	}

	filePath := filepath.Join(root, path)
	bytes, err := os.ReadFile(filePath)
	if err != nil {
		return
	}

	lines := strings.Split(string(bytes), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			if _, exists := os.LookupEnv(key); exists {
				continue
			}
			value := strings.TrimSpace(parts[1])
			value = strings.Trim(value, `"'`)
			os.Setenv(key, value)
		}
	}
}
