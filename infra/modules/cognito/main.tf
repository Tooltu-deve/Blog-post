# ── Read OAuth credentials from Secrets Manager ─────────────
# Secrets are created empty by the secrets module; user populates
# them via console after creating Google/Facebook dev apps.

data "aws_secretsmanager_secret_version" "google" {
  secret_id = var.google_oauth_secret_arn
}

data "aws_secretsmanager_secret_version" "facebook" {
  secret_id = var.facebook_oauth_secret_arn
}

locals {
  google_creds   = jsondecode(data.aws_secretsmanager_secret_version.google.secret_string)
  facebook_creds = jsondecode(data.aws_secretsmanager_secret_version.facebook.secret_string)
}

# ── User Pool ───────────────────────────────────────────────

resource "aws_cognito_user_pool" "main" {
  name = "${var.name_prefix}-users"

  # Username attributes — users sign in with email
  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  password_policy {
    minimum_length                   = 8
    require_lowercase                = true
    require_uppercase                = true
    require_numbers                  = true
    require_symbols                  = false
    temporary_password_validity_days = 7
  }

  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Required standard attributes
  schema {
    name                = "email"
    attribute_data_type = "String"
    required            = true
    mutable             = true
  }

  schema {
    name                = "given_name"
    attribute_data_type = "String"
    required            = false
    mutable             = true
  }

  schema {
    name                = "family_name"
    attribute_data_type = "String"
    required            = false
    mutable             = true
  }

  # Email verification via Cognito (SES integration optional; default uses Cognito's sender)
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Cognito normalizes standard-attribute schema at creation (adds default
  # string length constraints, etc.). Once a pool exists, its schema is
  # immutable — ignore drift here or every future apply will fail with
  # "cannot modify or remove schema items".
  lifecycle {
    ignore_changes = [schema]
  }

  tags = { Name = "${var.name_prefix}-user-pool" }
}

# ── Hosted Domain (used only for OAuth redirect endpoints) ──

resource "aws_cognito_user_pool_domain" "main" {
  domain       = var.domain_prefix
  user_pool_id = aws_cognito_user_pool.main.id
}

# ── Identity Providers ──────────────────────────────────────

resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    client_id                     = local.google_creds.client_id
    client_secret                 = local.google_creds.client_secret
    authorize_scopes              = "openid email profile"
    attributes_url_add_attributes = "true"
  }

  attribute_mapping = {
    email       = "email"
    given_name  = "given_name"
    family_name = "family_name"
    username    = "sub"
  }
}

resource "aws_cognito_identity_provider" "facebook" {
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Facebook"
  provider_type = "Facebook"

  provider_details = {
    client_id        = local.facebook_creds.app_id
    client_secret    = local.facebook_creds.app_secret
    authorize_scopes = "email,public_profile"
    api_version      = "v18.0"
  }

  attribute_mapping = {
    email       = "email"
    given_name  = "first_name"
    family_name = "last_name"
    username    = "id"
  }
}

# ── App Client (used by the React SPA via Amplify) ──────────

resource "aws_cognito_user_pool_client" "spa" {
  name         = "${var.name_prefix}-spa"
  user_pool_id = aws_cognito_user_pool.main.id

  # Public SPA client — no secret
  generate_secret = false

  # Allow username/password (for custom Login form) and SRP auth
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
  ]

  # OAuth flows for social login
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_scopes                 = ["openid", "email", "profile"]

  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  supported_identity_providers = [
    "COGNITO",
    aws_cognito_identity_provider.google.provider_name,
    aws_cognito_identity_provider.facebook.provider_name,
  ]

  # Prevent user enumeration
  prevent_user_existence_errors = "ENABLED"

  # Token validity
  access_token_validity  = 60 # minutes
  id_token_validity      = 60 # minutes
  refresh_token_validity = 30 # days

  token_validity_units {
    access_token  = "minutes"
    id_token      = "minutes"
    refresh_token = "days"
  }
}
