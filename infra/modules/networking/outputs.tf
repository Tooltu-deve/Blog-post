output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

# App-tier subnets (ECS Fargate) — route through NAT Gateway
output "app_subnet_ids" {
  value = aws_subnet.app[*].id
}

# Data-tier subnets (RDS) — fully isolated, no internet route
output "data_subnet_ids" {
  value = aws_subnet.data[*].id
}

output "alb_security_group_id" {
  value = aws_security_group.alb.id
}

output "ecs_security_group_id" {
  value = aws_security_group.ecs.id
}

output "proxy_security_group_id" {
  value = aws_security_group.proxy.id
}

output "rds_security_group_id" {
  value = aws_security_group.rds.id
}
