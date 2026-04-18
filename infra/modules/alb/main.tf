# ── ALB ──────────────────────────────────────────────────────

resource "aws_lb" "main" {
  name               = "${var.name_prefix}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.security_group_id]
  subnets            = var.public_subnet_ids

  tags = { Name = "${var.name_prefix}-alb" }
}

# ── Target Groups (Blue/Green pairs) ───────────────────────

# Backend — Blue (active)
resource "aws_lb_target_group" "backend_blue" {
  name        = "${var.name_prefix}-be-blue"
  port        = var.backend_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip" # Required for Fargate (awsvpc mode)

  health_check {
    path                = "/api/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
    matcher             = "200"
  }

  tags = { Name = "${var.name_prefix}-be-blue" }
}

# Backend — Green (standby, used during blue/green switch)
resource "aws_lb_target_group" "backend_green" {
  name        = "${var.name_prefix}-be-green"
  port        = var.backend_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
    matcher             = "200"
  }

  tags = { Name = "${var.name_prefix}-be-green" }
}

# Frontend — Blue (active)
resource "aws_lb_target_group" "frontend_blue" {
  name        = "${var.name_prefix}-fe-blue"
  port        = var.frontend_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
    matcher             = "200"
  }

  tags = { Name = "${var.name_prefix}-fe-blue" }
}

# Frontend — Green (standby)
resource "aws_lb_target_group" "frontend_green" {
  name        = "${var.name_prefix}-fe-green"
  port        = var.frontend_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    port                = "traffic-port"
    protocol            = "HTTP"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
    timeout             = 5
    matcher             = "200"
  }

  tags = { Name = "${var.name_prefix}-fe-green" }
}

# ── HTTP Listener (redirect to HTTPS) ───────────────────────

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ── HTTPS Listener (production — receives all real traffic) ─

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.acm_certificate_arn

  # Default action: forward to frontend (catch-all)
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend_blue.arn
  }

  # CodeDeploy manages target group switching — ignore drift
  lifecycle {
    ignore_changes = [default_action]
  }
}

# ── Listener Rules (on HTTPS listener) ─────────────────────

# Rule: /api/* → backend
resource "aws_lb_listener_rule" "backend_api" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 1

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_blue.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"]
    }
  }

  lifecycle {
    ignore_changes = [action]
  }
}

# Rule: /docs* → backend (Swagger UI — not under /api prefix)
resource "aws_lb_listener_rule" "backend_docs" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 2

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_blue.arn
  }

  condition {
    path_pattern {
      values = ["/docs*"]
    }
  }

  lifecycle {
    ignore_changes = [action]
  }
}
