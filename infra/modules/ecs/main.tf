# ── ECS Cluster ──────────────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "${var.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled" # Learning: save cost
  }

  tags = { Name = "${var.name_prefix}-cluster" }
}

# Use Fargate Spot by default (up to 70% cheaper)
resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name = aws_ecs_cluster.main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 1
  }
}

# ── CloudWatch Log Groups ───────────────────────────────────

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.name_prefix}-backend"
  retention_in_days = 7 # Learning: short retention

  tags = { Name = "${var.name_prefix}-backend-logs" }
}

resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.name_prefix}-frontend"
  retention_in_days = 7

  tags = { Name = "${var.name_prefix}-frontend-logs" }
}

# ── IAM: Task Execution Role ────────────────────────────────
# Used by ECS agent to pull images, fetch secrets, push logs

resource "aws_iam_role" "ecs_execution" {
  name = "${var.name_prefix}-ecs-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })

  tags = { Name = "${var.name_prefix}-ecs-execution" }
}

resource "aws_iam_role_policy_attachment" "ecs_execution_base" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Additional policy: read secrets from Secrets Manager
resource "aws_iam_role_policy" "ecs_execution_secrets" {
  name = "${var.name_prefix}-secrets-access"
  role = aws_iam_role.ecs_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["secretsmanager:GetSecretValue"]
      Resource = [
        var.database_url_secret_arn,
      ]
    }]
  })
}

# ── IAM: Task Role ──────────────────────────────────────────
# Used by the container at runtime for AWS API calls (minimal for now)

resource "aws_iam_role" "ecs_task" {
  name = "${var.name_prefix}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })

  tags = { Name = "${var.name_prefix}-ecs-task" }
}

# ── Backend Task Definition ─────────────────────────────────

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.name_prefix}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  runtime_platform {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([{
    name      = "${var.name_prefix}-backend"
    image     = var.backend_image
    essential = true

    portMappings = [{
      containerPort = var.backend_port
      protocol      = "tcp"
    }]

    # Secrets injected from Secrets Manager
    secrets = [
      {
        name      = "DATABASE_URL"
        valueFrom = var.database_url_secret_arn
      },
    ]

    # Plaintext environment variables
    environment = [
      { name = "PORT", value = tostring(var.backend_port) },
      { name = "NODE_ENV", value = "production" },
      { name = "FRONTEND_URL", value = "https://${var.domain_name}" },
      { name = "COGNITO_USER_POOL_ID", value = var.cognito_user_pool_id },
      { name = "COGNITO_CLIENT_ID", value = var.cognito_user_pool_client_id },
      { name = "COGNITO_REGION", value = var.cognito_region },
    ]

    # Health check: wget because node:24-alpine has wget but not curl
    healthCheck = {
      command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:${var.backend_port}/api/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 60 # NestJS needs time to boot + connect to RDS
    }

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "backend"
      }
    }
  }])

  tags = { Name = "${var.name_prefix}-backend-task" }
}

# ── Frontend Task Definition ────────────────────────────────

resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.name_prefix}-frontend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  runtime_platform {
    cpu_architecture        = "ARM64"
    operating_system_family = "LINUX"
  }

  container_definitions = jsonencode([{
    name      = "${var.name_prefix}-frontend"
    image     = var.frontend_image
    essential = true

    portMappings = [{
      containerPort = var.frontend_port
      protocol      = "tcp"
    }]

    # No secrets needed — API URL is baked into JS bundle at build time

    healthCheck = {
      command     = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:${var.frontend_port}/health || exit 1"]
      interval    = 30
      timeout     = 5
      retries     = 3
      startPeriod = 10 # nginx starts nearly instantly
    }

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "frontend"
      }
    }
  }])

  tags = { Name = "${var.name_prefix}-frontend-task" }
}

# ── Backend Service ─────────────────────────────────────────

resource "aws_ecs_service" "backend" {
  name            = "${var.name_prefix}-backend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1

  # Blue/Green deployment via CodeDeploy
  deployment_controller {
    type = "CODE_DEPLOY"
  }

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.backend_target_group_arn
    container_name   = "${var.name_prefix}-backend"
    container_port   = var.backend_port
  }

  # CodeDeploy manages task definition and target group — ignore drift
  lifecycle {
    ignore_changes = [task_definition, load_balancer]
  }

  tags = { Name = "${var.name_prefix}-backend-svc" }
}

# ── Frontend Service ────────────────────────────────────────

resource "aws_ecs_service" "frontend" {
  name            = "${var.name_prefix}-frontend"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1

  deployment_controller {
    type = "CODE_DEPLOY"
  }

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.frontend_target_group_arn
    container_name   = "${var.name_prefix}-frontend"
    container_port   = var.frontend_port
  }

  lifecycle {
    ignore_changes = [task_definition, load_balancer]
  }

  tags = { Name = "${var.name_prefix}-frontend-svc" }
}
