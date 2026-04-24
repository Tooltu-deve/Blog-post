output "database_url_secret_arn" {
  value = aws_secretsmanager_secret.database_url.arn
}

output "google_oauth_secret_arn" {
  value = aws_secretsmanager_secret.google_oauth.arn
  # Force consumers to wait until the initial version is written, so the
  # cognito module's data source can read it on the same apply.
  depends_on = [aws_secretsmanager_secret_version.google_oauth_placeholder]
}

output "facebook_oauth_secret_arn" {
  value      = aws_secretsmanager_secret.facebook_oauth.arn
  depends_on = [aws_secretsmanager_secret_version.facebook_oauth_placeholder]
}
