variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "ecs_cluster_name" {
  description = "ECS cluster name"
  type        = string
}

variable "backend_service_name" {
  description = "Backend ECS service name"
  type        = string
}

variable "frontend_service_name" {
  description = "Frontend ECS service name"
  type        = string
}

variable "alb_listener_arn" {
  description = "ALB HTTP listener ARN"
  type        = string
}

variable "backend_tg_blue_name" {
  type = string
}

variable "backend_tg_green_name" {
  type = string
}

variable "frontend_tg_blue_name" {
  type = string
}

variable "frontend_tg_green_name" {
  type = string
}
