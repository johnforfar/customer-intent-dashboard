# Repo: @johnforfar/aws-intent-dashboard File: ./Makefile

# Makefile for aws-intent-dashboard

# Variables
DOCKER_COMPOSE := docker compose
CDK := npx cdk
PROJECT_NAME := aws-intent-dashboard

# Phony targets
.PHONY: install start stop deploy-local deploy-aws test build build-no-cache clean clean-docker dev-backend dev-frontend help

# Install dependencies
install:
	npm install
	npx lerna exec -- npm install

# Start local development environment
start:
	$(DOCKER_COMPOSE) up -d

# Stop local development environment
stop:
	$(DOCKER_COMPOSE) down

# Deploy to local environment using LocalStack
deploy-local: build
	clear
	$(DOCKER_COMPOSE) up -d localstack
	sh deploy-local.sh

# Build Docker images
build:
	$(DOCKER_COMPOSE) build
	$(DOCKER_COMPOSE) up -d

# Build Docker images with no cache
build-no-cache:
	$(DOCKER_COMPOSE) build --no-cache
	$(DOCKER_COMPOSE) up -d

# Clean Docker containers, images, and volumes
clean-docker:
	$(DOCKER_COMPOSE) down -v --rmi all --remove-orphans
	docker system prune -f
	docker volume prune -f
	docker network prune -f
	docker image prune -f

# Deploy to AWS
deploy-aws: build-all
	cd packages/infra && \
	$(CDK) deploy \
		--require-approval never \
		--context local=false

# Run tests
test:
	npx lerna run test

# Build all packages
build-all:
	npx lerna run build

# Clean up
clean:
	$(DOCKER_COMPOSE) down -v
	rm -rf node_modules packages/*/node_modules
	rm -rf packages/*/dist

# Development shortcuts
dev-backend:
	cd packages/backend && npm run start

dev-frontend:
	cd packages/frontend && npm run start

# Help command
help:
	@echo "Available commands:"
	@echo "  make install         - Install all dependencies"
	@echo "  make start           - Start local development environment"
	@echo "  make stop            - Stop local development environment"
	@echo "  make deploy-local    - Deploy to local environment (LocalStack)"
	@echo "  make deploy-aws      - Deploy to AWS"
	@echo "  make test            - Run tests for all packages"
	@echo "  make build           - Build Docker images"
	@echo "  make build-no-cache  - Build Docker images with no cache"
	@echo "  make clean           - Clean up containers and node_modules"
	@echo "  make clean-docker    - Clean Docker containers, images, and volumes"
	@echo "  make dev-backend     - Start backend in development mode"
	@echo "  make dev-frontend    - Start frontend in development mode"

# Default target
.DEFAULT_GOAL := help