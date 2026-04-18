terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Uncomment after creating the S3 bucket and DynamoDB table (one-time bootstrap)
  # backend "s3" {
  #   bucket         = "blog-terraform-state-ACCOUNT_ID"
  #   key            = "project2/terraform.tfstate"
  #   region         = "ap-southeast-1"
  #   dynamodb_table = "terraform-lock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ── Data sources ────────────────────────────────────────────

data "aws_caller_identity" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  azs         = slice(data.aws_availability_zones.available.names, 0, var.az_count)
  account_id  = data.aws_caller_identity.current.account_id
}

# ── Modules ─────────────────────────────────────────────────

module "networking" {
  source = "./modules/networking"

  name_prefix = local.name_prefix
  vpc_cidr    = var.vpc_cidr
  azs         = local.azs
}

module "ecr" {
  source = "./modules/ecr"

  name_prefix = local.name_prefix
}

module "secrets" {
  source = "./modules/secrets"

  name_prefix           = local.name_prefix
  db_username           = var.db_username
  db_name               = var.db_name
  proxy_endpoint        = module.rds.proxy_endpoint
  proxy_port            = module.rds.proxy_port
  rds_master_secret_arn = module.rds.master_user_secret_arn
}

module "rds" {
  source = "./modules/rds"

  name_prefix             = local.name_prefix
  db_name                 = var.db_name
  db_username             = var.db_username
  db_instance_class       = var.db_instance_class
  subnet_ids              = module.networking.data_subnet_ids
  security_group_id       = module.networking.rds_security_group_id
  proxy_security_group_id = module.networking.proxy_security_group_id
  proxy_subnet_ids        = module.networking.app_subnet_ids
}

module "alb" {
  source = "./modules/alb"

  name_prefix         = local.name_prefix
  vpc_id              = module.networking.vpc_id
  public_subnet_ids   = module.networking.public_subnet_ids
  security_group_id   = module.networking.alb_security_group_id
  backend_port        = var.backend_port
  frontend_port       = var.frontend_port
  acm_certificate_arn = var.acm_certificate_arn
}

module "ecs" {
  source = "./modules/ecs"

  name_prefix           = local.name_prefix
  aws_region            = var.aws_region
  vpc_id                = module.networking.vpc_id
  private_subnet_ids    = module.networking.app_subnet_ids
  ecs_security_group_id = module.networking.ecs_security_group_id

  # Container config
  backend_image   = "${module.ecr.backend_repository_url}:latest"
  frontend_image  = "${module.ecr.frontend_repository_url}:latest"
  backend_port    = var.backend_port
  frontend_port   = var.frontend_port
  backend_cpu     = var.backend_cpu
  backend_memory  = var.backend_memory
  frontend_cpu    = var.frontend_cpu
  frontend_memory = var.frontend_memory

  # Secrets
  database_url_secret_arn = module.secrets.database_url_secret_arn
  jwt_secret_arn          = module.secrets.jwt_secret_arn

  # Environment
  jwt_expire_in = var.jwt_expire_in
  alb_dns_name  = module.alb.dns_name
  domain_name   = var.domain_name

  # Target groups
  backend_target_group_arn  = module.alb.backend_tg_blue_arn
  frontend_target_group_arn = module.alb.frontend_tg_blue_arn
}

module "codedeploy" {
  source = "./modules/codedeploy"

  name_prefix = local.name_prefix

  # ECS
  ecs_cluster_name      = module.ecs.cluster_name
  backend_service_name  = module.ecs.backend_service_name
  frontend_service_name = module.ecs.frontend_service_name

  # ALB
  alb_listener_arn = module.alb.listener_arn

  backend_tg_blue_name   = module.alb.backend_tg_blue_name
  backend_tg_green_name  = module.alb.backend_tg_green_name
  frontend_tg_blue_name  = module.alb.frontend_tg_blue_name
  frontend_tg_green_name = module.alb.frontend_tg_green_name
}
