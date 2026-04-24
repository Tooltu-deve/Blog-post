output "database_url_secret_arn" {
  value = aws_secretsmanager_secret.database_url.arn
}

output "google_oauth_secret_arn" {
  value = aws_secretsmanager_secret.google_oauth.arn
}

output "facebook_oauth_secret_arn" {
  value = aws_secretsmanager_secret.facebook_oauth.arn
}
