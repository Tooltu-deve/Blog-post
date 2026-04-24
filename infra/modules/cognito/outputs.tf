output "user_pool_id" {
  description = "Cognito User Pool ID (backend uses this to build the JWKS URL)"
  value       = aws_cognito_user_pool.main.id
}

output "user_pool_arn" {
  description = "Cognito User Pool ARN"
  value       = aws_cognito_user_pool.main.arn
}

output "user_pool_client_id" {
  description = "Cognito App Client ID (frontend Amplify config)"
  value       = aws_cognito_user_pool_client.spa.id
}

output "user_pool_domain" {
  description = "Full Cognito hosted domain (e.g. blog-dev-auth.auth.ap-southeast-1.amazoncognito.com)"
  value       = "${aws_cognito_user_pool_domain.main.domain}.auth.${data.aws_region.current.name}.amazoncognito.com"
}

data "aws_region" "current" {}
