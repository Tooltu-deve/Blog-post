output "endpoint" {
  value = aws_db_instance.main.address
}

output "port" {
  value = aws_db_instance.main.port
}

output "master_user_secret_arn" {
  description = "ARN of the Secrets Manager secret containing RDS master credentials"
  value       = aws_db_instance.main.master_user_secret[0].secret_arn
}

output "db_instance_id" {
  value = aws_db_instance.main.id
}

# Proxy outputs — app connects to proxy, not RDS directly
output "proxy_endpoint" {
  description = "RDS Proxy endpoint — use this in DATABASE_URL instead of RDS endpoint"
  value       = aws_db_proxy.main.endpoint
}

output "proxy_port" {
  value = 5432
}
