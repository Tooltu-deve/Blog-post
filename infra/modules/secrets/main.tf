# ── Read password from RDS-managed secret ───────────────────

data "aws_secretsmanager_secret_version" "rds_master" {
  secret_id = var.rds_master_secret_arn
}

locals {
  rds_credentials = jsondecode(data.aws_secretsmanager_secret_version.rds_master.secret_string)
}

# ── DATABASE_URL secret ─────────────────────────────────────
# Prisma needs a full connection string, not individual fields.
# We assemble it from the RDS-managed credentials.

resource "aws_secretsmanager_secret" "database_url" {
  name                    = "${var.name_prefix}/database-url"
  description             = "PostgreSQL connection string for Prisma"
  recovery_window_in_days = 0 # Learning: allow immediate delete on terraform destroy

  tags = { Name = "${var.name_prefix}-database-url" }
}

resource "aws_secretsmanager_secret_version" "database_url" {
  secret_id     = aws_secretsmanager_secret.database_url.id
  secret_string = "postgresql://${urlencode(local.rds_credentials["username"])}:${urlencode(local.rds_credentials["password"])}@${var.proxy_endpoint}:${var.proxy_port}/${var.db_name}?schema=public&sslmode=require&uselibpqcompat=true"
}

# ── Google OAuth credentials ────────────────────────────────
# Cognito federation reads these at plan time via the cognito module.
# User populates via console after creating Google OAuth client:
#   { "client_id": "...apps.googleusercontent.com", "client_secret": "..." }

resource "aws_secretsmanager_secret" "google_oauth" {
  name                    = "${var.name_prefix}/google-oauth"
  description             = "Google OAuth client_id + client_secret for Cognito federation"
  recovery_window_in_days = 0

  tags = { Name = "${var.name_prefix}-google-oauth" }
}

resource "aws_secretsmanager_secret_version" "google_oauth_placeholder" {
  secret_id = aws_secretsmanager_secret.google_oauth.id
  secret_string = jsonencode({
    client_id     = "REPLACE_ME"
    client_secret = "REPLACE_ME"
  })

  # After user updates the secret via console, don't overwrite on subsequent applies
  lifecycle {
    ignore_changes = [secret_string]
  }
}

# ── Facebook OAuth credentials ──────────────────────────────
# Shape: { "app_id": "...", "app_secret": "..." }

resource "aws_secretsmanager_secret" "facebook_oauth" {
  name                    = "${var.name_prefix}/facebook-oauth"
  description             = "Facebook app_id + app_secret for Cognito federation"
  recovery_window_in_days = 0

  tags = { Name = "${var.name_prefix}-facebook-oauth" }
}

resource "aws_secretsmanager_secret_version" "facebook_oauth_placeholder" {
  secret_id = aws_secretsmanager_secret.facebook_oauth.id
  secret_string = jsonencode({
    app_id     = "REPLACE_ME"
    app_secret = "REPLACE_ME"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}
