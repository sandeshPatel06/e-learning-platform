package services

import (
	"testing"

	"github.com/SHP-Association/E-learningWeb/backend/config"
	"github.com/stretchr/testify/assert"
)

func TestWrapInTemplate(t *testing.T) {
	cfg := &config.Config{}
	cfg.App.Environment = config.EnvLocal

	client, err := NewMailClient(cfg)
	assert.NoError(t, err)

	t.Run("Wraps generic welcome message", func(t *testing.T) {
		body := "Hi testuser,\n\nWelcome to our platform!"
		subject := "Welcome!"
		html := client.wrapInTemplate(subject, body)

		assert.Contains(t, html, "<!DOCTYPE html>")
		assert.Contains(t, html, "SHP Learner")
		assert.Contains(t, html, "Hi testuser")
		assert.Contains(t, html, "Welcome to our platform!")
	})

	t.Run("Renders OTP correctly", func(t *testing.T) {
		body := "Hi testuser,\n\nYour 6-digit verification code is: 123456\n\nBest regards,\nSHP Association Team"
		subject := "Verify your email"
		html := client.wrapInTemplate(subject, body)

		assert.Contains(t, html, "Your 6-digit verification code is")
		assert.Contains(t, html, "123456")
		assert.Contains(t, html, "Best regards")
		assert.Contains(t, html, "SHP Association Team")
	})
}
