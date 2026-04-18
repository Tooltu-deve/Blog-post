variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "proxy_endpoint" {
  description = "RDS Proxy endpoint address (app connects here, not RDS directly)"
  type        = string
}

variable "proxy_port" {
  description = "RDS Proxy port"
  type        = number
  default     = 5432
}

variable "rds_master_secret_arn" {
  description = "ARN of the RDS-managed Secrets Manager secret containing master credentials"
  type        = string
}
