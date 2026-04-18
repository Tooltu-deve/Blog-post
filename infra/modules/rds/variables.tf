variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database master username"
  type        = string
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet IDs for DB subnet group"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for RDS"
  type        = string
}

variable "proxy_security_group_id" {
  description = "Security group ID for RDS Proxy"
  type        = string
}

variable "proxy_subnet_ids" {
  description = "Subnet IDs for RDS Proxy (app subnets)"
  type        = list(string)
}
