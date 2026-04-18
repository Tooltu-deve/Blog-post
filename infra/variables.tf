variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "blog"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

# ── Networking ──────────────────────────────────────────────

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "az_count" {
  description = "Number of availability zones"
  type        = number
  default     = 2
}

# ── RDS ─────────────────────────────────────────────────────

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "blogdb"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "blogadmin"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t4g.micro"
}

# ── ECS ─────────────────────────────────────────────────────

variable "backend_port" {
  description = "Backend container port"
  type        = number
  default     = 3000
}

variable "frontend_port" {
  description = "Frontend container port"
  type        = number
  default     = 80
}

variable "backend_cpu" {
  description = "Backend task CPU units"
  type        = number
  default     = 256
}

variable "backend_memory" {
  description = "Backend task memory in MB"
  type        = number
  default     = 512
}

variable "frontend_cpu" {
  description = "Frontend task CPU units"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Frontend task memory in MB"
  type        = number
  default     = 512
}

variable "jwt_expire_in" {
  description = "JWT token expiration"
  type        = string
  default     = "1h"
}

# ── HTTPS ───────────────────────────────────────────────────

variable "acm_certificate_arn" {
  description = "ACM certificate ARN for HTTPS (must be in same region as ALB)"
  type        = string
}

variable "domain_name" {
  description = "Domain name for the application (e.g., blog.example.com)"
  type        = string
}
