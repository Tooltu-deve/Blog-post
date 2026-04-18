resource "aws_db_subnet_group" "main" {
  name       = "${var.name_prefix}-db-subnet"
  subnet_ids = var.subnet_ids

  tags = { Name = "${var.name_prefix}-db-subnet" }
}

resource "aws_db_instance" "main" {
  identifier = "${var.name_prefix}-postgres"

  # Engine
  engine         = "postgres"
  engine_version = "18"

  # Sizing (learning — smallest possible)
  instance_class        = var.db_instance_class
  allocated_storage     = 20
  storage_type          = "gp3"
  max_allocated_storage = 20 # Disable autoscaling

  # Database
  db_name  = var.db_name
  username = var.db_username

  # Credentials — RDS manages password in Secrets Manager with auto-rotation
  manage_master_user_password = true

  # Network
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [var.security_group_id]
  publicly_accessible    = false
  multi_az               = true

  # Backup & maintenance (learning — minimal)
  backup_retention_period = 1
  skip_final_snapshot     = true
  deletion_protection     = false

  # Encryption (free, no reason to disable)
  storage_encrypted = true

  tags = { Name = "${var.name_prefix}-postgres" }
}

# ── RDS Proxy ───────────────────────────────────────────────

# IAM role allowing RDS Proxy to read credentials from Secrets Manager
resource "aws_iam_role" "rds_proxy" {
  name = "${var.name_prefix}-rds-proxy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "rds.amazonaws.com" }
    }]
  })

  tags = { Name = "${var.name_prefix}-rds-proxy" }
}

resource "aws_iam_role_policy" "rds_proxy_secrets" {
  name = "${var.name_prefix}-proxy-secrets"
  role = aws_iam_role.rds_proxy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = [aws_db_instance.main.master_user_secret[0].secret_arn]
    }]
  })
}

resource "aws_db_proxy" "main" {
  name                   = "${var.name_prefix}-proxy"
  engine_family          = "POSTGRESQL"
  role_arn               = aws_iam_role.rds_proxy.arn
  vpc_subnet_ids         = var.proxy_subnet_ids
  vpc_security_group_ids = [var.proxy_security_group_id]
  require_tls            = true

  auth {
    auth_scheme = "SECRETS"
    iam_auth    = "DISABLED"
    secret_arn  = aws_db_instance.main.master_user_secret[0].secret_arn
  }

  tags = { Name = "${var.name_prefix}-proxy" }
}

resource "aws_db_proxy_default_target_group" "main" {
  db_proxy_name = aws_db_proxy.main.name

  connection_pool_config {
    max_connections_percent = 100
  }
}

resource "aws_db_proxy_target" "main" {
  db_proxy_name          = aws_db_proxy.main.name
  target_group_name      = aws_db_proxy_default_target_group.main.name
  db_instance_identifier = aws_db_instance.main.identifier
}
