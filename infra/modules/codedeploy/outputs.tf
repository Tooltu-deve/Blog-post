output "app_name" {
  value = aws_codedeploy_app.main.name
}

output "backend_deployment_group_name" {
  value = aws_codedeploy_deployment_group.backend.deployment_group_name
}

output "frontend_deployment_group_name" {
  value = aws_codedeploy_deployment_group.frontend.deployment_group_name
}
