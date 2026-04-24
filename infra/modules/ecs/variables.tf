variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for ECS tasks"
  type        = list(string)
}

variable "ecs_security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

# ── Container config ────────────────────────────────────────

variable "backend_image" {
  description = "Backend Docker image URI"
  type        = string
}

variable "frontend_image" {
  description = "Frontend Docker image URI"
  type        = string
}

variable "backend_port" {
  type    = number
  default = 3000
}

variable "frontend_port" {
  type    = number
  default = 80
}

variable "backend_cpu" {
  type    = number
  default = 256
}

variable "backend_memory" {
  type    = number
  default = 512
}

variable "frontend_cpu" {
  type    = number
  default = 256
}

variable "frontend_memory" {
  type    = number
  default = 512
}

# ── Secrets ─────────────────────────────────────────────────

variable "database_url_secret_arn" {
  description = "Secrets Manager ARN for DATABASE_URL"
  type        = string
}

# ── Environment ─────────────────────────────────────────────

variable "cognito_user_pool_id" {
  description = "Cognito User Pool ID (backend verifies tokens against this pool)"
  type        = string
}

variable "cognito_user_pool_client_id" {
  description = "Cognito App Client ID (used as token audience)"
  type        = string
}

variable "cognito_region" {
  description = "Region where the Cognito User Pool lives"
  type        = string
}

variable "alb_dns_name" {
  description = "ALB DNS name for CORS / VITE_API_URL"
  type        = string
}

variable "domain_name" {
  description = "Domain name for HTTPS (e.g., blog.example.com)"
  type        = string
}

# ── Target groups ───────────────────────────────────────────

variable "backend_target_group_arn" {
  description = "Backend blue target group ARN"
  type        = string
}

variable "frontend_target_group_arn" {
  description = "Frontend blue target group ARN"
  type        = string
}
