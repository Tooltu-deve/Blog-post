variable "name_prefix" {
  description = "Resource name prefix, e.g. blog-dev"
  type        = string
}

variable "domain_prefix" {
  description = "Prefix for the Cognito hosted domain (becomes <prefix>.auth.<region>.amazoncognito.com)"
  type        = string
}

variable "callback_urls" {
  description = "List of allowed OAuth callback URLs (frontend /auth/callback)"
  type        = list(string)
}

variable "logout_urls" {
  description = "List of allowed logout redirect URLs"
  type        = list(string)
}

variable "google_oauth_secret_arn" {
  description = "ARN of Secrets Manager secret holding {\"client_id\":..., \"client_secret\":...} for Google"
  type        = string
}

variable "facebook_oauth_secret_arn" {
  description = "ARN of Secrets Manager secret holding {\"app_id\":..., \"app_secret\":...} for Facebook"
  type        = string
}
