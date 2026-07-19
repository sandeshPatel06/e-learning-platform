package services

import (
	"bytes"
	"crypto/tls"
	"errors"
	"fmt"
	"net/smtp"
	"strings"

	"github.com/SHP-Association/E-learningWeb/backend/config"
	"github.com/SHP-Association/E-learningWeb/backend/pkg/log"
	"maragu.dev/gomponents"

	"github.com/labstack/echo/v4"
)

type (
	// MailClient provides a client for sending email
	// This is purposely not completed because there are many different methods and services
	// for sending email, many of which are very different. Choose what works best for you
	// and populate the methods below. For now, emails will just be logged.
	MailClient struct {
		// config stores application configuration.
		config *config.Config
	}

	// mail represents an email to be sent.
	mail struct {
		client    *MailClient
		from      string
		to        string
		subject   string
		body      string
		component gomponents.Node
	}
)

// NewMailClient creates a new MailClient.
func NewMailClient(cfg *config.Config) (*MailClient, error) {
	return &MailClient{
		config: cfg,
	}, nil
}

// Compose creates a new email.
func (m *MailClient) Compose() *mail {
	return &mail{
		client: m,
		from:   m.config.Mail.FromAddress,
	}
}

// skipSend determines if mail sending should be skipped.
func (m *MailClient) skipSend() bool {
	return m.config.App.Environment == config.EnvTest
}

// send attempts to send the email.
func (m *MailClient) send(email *mail, ctx echo.Context) error {
	switch {
	case email.to == "":
		return errors.New("email cannot be sent without a to address")
	case email.body == "" && email.component == nil:
		return errors.New("email cannot be sent without a body or component to render")
	}

	// Check if a component was supplied.
	if email.component != nil {
		// Render the component and use as the body.
		// TODO pool the buffers?
		buf := bytes.NewBuffer(nil)
		if err := email.component.Render(buf); err != nil {
			return err
		}

		email.body = buf.String()
	}

	// Check if mail sending should be skipped.
	if m.skipSend() {
		log.Ctx(ctx).Debug("skipping email delivery",
			"to", email.to,
		)
		return nil
	}

	// Wrap body in the premium HTML/CSS email template if it's not already HTML.
	var htmlBody string
	if email.component != nil || strings.Contains(email.body, "<html") || strings.Contains(email.body, "<body") {
		htmlBody = email.body
	} else {
		htmlBody = m.wrapInTemplate(email.subject, email.body)
	}

	// Construct SMTP message with headers
	var msg bytes.Buffer
	msg.WriteString(fmt.Sprintf("From: %s\r\n", email.from))
	msg.WriteString(fmt.Sprintf("To: %s\r\n", email.to))
	msg.WriteString(fmt.Sprintf("Subject: %s\r\n", email.subject))
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/html; charset=UTF-8\r\n")
	msg.WriteString("\r\n")
	msg.WriteString(htmlBody)

	addr := fmt.Sprintf("%s:%d", m.config.Mail.Hostname, m.config.Mail.Port)
	auth := smtp.PlainAuth("", m.config.Mail.User, m.config.Mail.Password, m.config.Mail.Hostname)

	log.Ctx(ctx).Info("attempting to send email via SMTP", "to", email.to, "addr", addr)

	// Since Gmail uses Port 465 (SMTP over SSL), we need to dial with a TLS configuration directly.
	if m.config.Mail.Port == 465 {
		tlsConfig := &tls.Config{
			InsecureSkipVerify: false,
			ServerName:         m.config.Mail.Hostname,
		}
		conn, err := tls.Dial("tcp", addr, tlsConfig)
		if err != nil {
			return fmt.Errorf("failed to connect to SMTP server via TLS: %w", err)
		}
		defer conn.Close()

		client, err := smtp.NewClient(conn, m.config.Mail.Hostname)
		if err != nil {
			return fmt.Errorf("failed to create SMTP client: %w", err)
		}
		defer client.Close()

		if err = client.Auth(auth); err != nil {
			return fmt.Errorf("failed to authenticate SMTP: %w", err)
		}

		if err = client.Mail(email.from); err != nil {
			return fmt.Errorf("failed to set SMTP sender: %w", err)
		}

		if err = client.Rcpt(email.to); err != nil {
			return fmt.Errorf("failed to add SMTP recipient: %w", err)
		}

		w, err := client.Data()
		if err != nil {
			return fmt.Errorf("failed to open SMTP data writer: %w", err)
		}

		_, err = w.Write(msg.Bytes())
		if err != nil {
			return fmt.Errorf("failed to write SMTP message body: %w", err)
		}

		err = w.Close()
		if err != nil {
			return fmt.Errorf("failed to close SMTP data writer: %w", err)
		}

		err = client.Quit()
		if err != nil {
			log.Ctx(ctx).Debug("SMTP client quit error ignored", "error", err)
		}
	} else {
		// Fallback for port 587 (STARTTLS) or port 25
		err := smtp.SendMail(addr, auth, email.from, []string{email.to}, msg.Bytes())
		if err != nil {
			return fmt.Errorf("failed to send SMTP email: %w", err)
		}
	}

	log.Ctx(ctx).Info("email sent successfully", "to", email.to)
	return nil
}

// wrapInTemplate renders a responsive and modern HTML email using tailwind-like colors/styling.
func (m *MailClient) wrapInTemplate(subject, body string) string {
	var contentHTML strings.Builder

	paragraphs := strings.Split(body, "\n")
	for _, p := range paragraphs {
		trimmed := strings.TrimSpace(p)
		if trimmed == "" {
			continue
		}

		// Check for verification code pattern
		if strings.Contains(trimmed, "verification code is:") {
			parts := strings.Split(trimmed, ":")
			code := ""
			if len(parts) > 1 {
				code = strings.TrimSpace(parts[1])
			}
			contentHTML.WriteString(fmt.Sprintf(`
				<p style="font-size: 16px; line-height: 24px; color: #4b5563; margin: 0 0 16px 0;">%s:</p>
				<div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; border: 1px dashed #cbd5e1;">
					<span style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 6px; color: #4f46e5; text-shadow: 0 2px 4px rgba(79, 70, 229, 0.1);">%s</span>
				</div>
			`, htmlEscape(parts[0]), htmlEscape(code)))
		} else if strings.HasPrefix(trimmed, "Hi ") {
			contentHTML.WriteString(fmt.Sprintf(`<h2 style="font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 20px 0;">%s</h2>`, htmlEscape(trimmed)))
		} else if strings.Contains(trimmed, "Best regards,") {
			sig := strings.ReplaceAll(trimmed, "Best regards,", "")
			contentHTML.WriteString(fmt.Sprintf(`<p style="font-size: 15px; color: #6b7280; margin: 32px 0 0 0; line-height: 24px;">Best regards,<br><strong style="color: #4f46e5;">%s</strong></p>`, htmlEscape(strings.TrimSpace(sig))))
		} else {
			contentHTML.WriteString(fmt.Sprintf(`<p style="font-size: 16px; line-height: 24px; color: #4b5563; margin: 0 0 16px 0;">%s</p>`, htmlEscape(trimmed)))
		}
	}

	return fmt.Sprintf(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%[1]s</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            -webkit-font-smoothing: antialiased;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%%, #7c3aed 100%%);
            padding: 32px;
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.5px;
            margin: 0;
        }
        .content {
            padding: 40px 32px;
            color: #1e293b;
        }
        .footer {
            background-color: #f8fafc;
            padding: 24px 32px;
            text-align: center;
            border-top: 1px solid #f1f5f9;
            font-size: 13px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="logo">SHP Learner</h1>
        </div>
        <div class="content">
            %[2]s
        </div>
        <div class="footer">
            <p style="margin: 0 0 8px 0;">&copy; 2026 SHP Association. All rights reserved.</p>
            <p style="margin: 0;">You are receiving this email because you signed up on our platform.</p>
        </div>
    </div>
</body>
</html>`, htmlEscape(subject), contentHTML.String())
}

// Simple HTML escaping helper
func htmlEscape(s string) string {
	r := strings.NewReplacer(
		"&", "&amp;",
		"<", "&lt;",
		">", "&gt;",
		`"`, "&quot;",
		"'", "&#39;",
	)
	return r.Replace(s)
}

// From sets the email from address.
func (m *mail) From(from string) *mail {
	m.from = from
	return m
}

// To sets the email address this email will be sent to.
func (m *mail) To(to string) *mail {
	m.to = to
	return m
}

// Subject sets the subject line of the email.
func (m *mail) Subject(subject string) *mail {
	m.subject = subject
	return m
}

// Body sets the body of the email.
// This is not required and will be ignored if a component is set via Component().
func (m *mail) Body(body string) *mail {
	m.body = body
	return m
}

// Component sets a renderable component to use as the body of the email.
func (m *mail) Component(component gomponents.Node) *mail {
	m.component = component
	return m
}

// Send attempts to send the email.
func (m *mail) Send(ctx echo.Context) error {
	return m.client.send(m, ctx)
}
