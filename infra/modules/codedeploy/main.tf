# ── IAM Role for CodeDeploy ──────────────────────────────────

resource "aws_iam_role" "codedeploy" {
  name = "${var.name_prefix}-codedeploy"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "codedeploy.amazonaws.com" }
    }]
  })

  tags = { Name = "${var.name_prefix}-codedeploy" }
}

resource "aws_iam_role_policy_attachment" "codedeploy_ecs" {
  role       = aws_iam_role.codedeploy.name
  policy_arn = "arn:aws:iam::aws:policy/AWSCodeDeployRoleForECS"
}

# ── CodeDeploy Application ──────────────────────────────────

resource "aws_codedeploy_app" "main" {
  name             = "${var.name_prefix}-deploy"
  compute_platform = "ECS"
}

# ── Backend Deployment Group ────────────────────────────────

resource "aws_codedeploy_deployment_group" "backend" {
  app_name               = aws_codedeploy_app.main.name
  deployment_group_name  = "${var.name_prefix}-backend-dg"
  deployment_config_name = "CodeDeployDefault.ECSAllAtOnce"
  service_role_arn       = aws_iam_role.codedeploy.arn

  ecs_service {
    cluster_name = var.ecs_cluster_name
    service_name = var.backend_service_name
  }

  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "BLUE_GREEN"
  }

  blue_green_deployment_config {
    deployment_ready_option {
      action_on_timeout = "CONTINUE_DEPLOYMENT"
    }

    terminate_blue_instances_on_deployment_success {
      action                           = "TERMINATE"
      termination_wait_time_in_minutes = 5
    }
  }

  load_balancer_info {
    target_group_pair_info {
      prod_traffic_route {
        listener_arns = [var.alb_listener_arn]
      }

      target_group {
        name = var.backend_tg_blue_name
      }

      target_group {
        name = var.backend_tg_green_name
      }
    }
  }

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }
}

# ── Frontend Deployment Group ───────────────────────────────

resource "aws_codedeploy_deployment_group" "frontend" {
  app_name               = aws_codedeploy_app.main.name
  deployment_group_name  = "${var.name_prefix}-frontend-dg"
  deployment_config_name = "CodeDeployDefault.ECSAllAtOnce"
  service_role_arn       = aws_iam_role.codedeploy.arn

  ecs_service {
    cluster_name = var.ecs_cluster_name
    service_name = var.frontend_service_name
  }

  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "BLUE_GREEN"
  }

  blue_green_deployment_config {
    deployment_ready_option {
      action_on_timeout = "CONTINUE_DEPLOYMENT"
    }

    terminate_blue_instances_on_deployment_success {
      action                           = "TERMINATE"
      termination_wait_time_in_minutes = 5
    }
  }

  load_balancer_info {
    target_group_pair_info {
      prod_traffic_route {
        listener_arns = [var.alb_listener_arn]
      }

      target_group {
        name = var.frontend_tg_blue_name
      }

      target_group {
        name = var.frontend_tg_green_name
      }
    }
  }

  auto_rollback_configuration {
    enabled = true
    events  = ["DEPLOYMENT_FAILURE"]
  }
}
