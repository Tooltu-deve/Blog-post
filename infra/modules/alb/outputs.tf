output "dns_name" {
  value = aws_lb.main.dns_name
}

output "arn" {
  value = aws_lb.main.arn
}

output "listener_arn" {
  description = "HTTPS listener ARN — production listener used by CodeDeploy"
  value       = aws_lb_listener.https.arn
}

# Blue target groups (attached to ECS services)
output "backend_tg_blue_arn" {
  value = aws_lb_target_group.backend_blue.arn
}

output "frontend_tg_blue_arn" {
  value = aws_lb_target_group.frontend_blue.arn
}

# Target group names (used by CodeDeploy)
output "backend_tg_blue_name" {
  value = aws_lb_target_group.backend_blue.name
}

output "backend_tg_green_name" {
  value = aws_lb_target_group.backend_green.name
}

output "frontend_tg_blue_name" {
  value = aws_lb_target_group.frontend_blue.name
}

output "frontend_tg_green_name" {
  value = aws_lb_target_group.frontend_green.name
}
