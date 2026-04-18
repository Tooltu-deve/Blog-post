output "alb_dns_name" {
  description = "ALB DNS name — use this to access the application"
  value       = module.alb.dns_name
}

output "backend_ecr_url" {
  description = "ECR repository URL for backend"
  value       = module.ecr.backend_repository_url
}

output "frontend_ecr_url" {
  description = "ECR repository URL for frontend"
  value       = module.ecr.frontend_repository_url
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = module.rds.endpoint
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "backend_service_name" {
  description = "Backend ECS service name"
  value       = module.ecs.backend_service_name
}

output "frontend_service_name" {
  description = "Frontend ECS service name"
  value       = module.ecs.frontend_service_name
}

output "codedeploy_app_name" {
  description = "CodeDeploy application name"
  value       = module.codedeploy.app_name
}

output "backend_task_definition_arn" {
  description = "Backend task definition ARN (used by CI/CD)"
  value       = module.ecs.backend_task_definition_arn
}

output "frontend_task_definition_arn" {
  description = "Frontend task definition ARN (used by CI/CD)"
  value       = module.ecs.frontend_task_definition_arn
}
