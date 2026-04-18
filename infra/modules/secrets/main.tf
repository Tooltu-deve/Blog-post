resource "random_password" "jwt" {
  length  = 64
  special = false
}

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

# ── JWT_SECRET ──────────────────────────────────────────────

resource "aws_secretsmanager_secret" "jwt_secret" {
  name                    = "${var.name_prefix}/jwt-secret"
  description             = "JWT signing secret"
  recovery_window_in_days = 0

  tags = { Name = "${var.name_prefix}-jwt-secret" }
}

resource "aws_secretsmanager_secret_version" "jwt_secret" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt.result
}
