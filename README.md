# Customer Intent Dashboard

## Overview

This project is an enterprise-grade solution for analyzing and visualizing customer service call intents using AWS technologies and TypeScript. It showcases advanced usage of serverless architecture, infrastructure as code, and full-stack TypeScript development, all implemented within a monorepo structure.

## Tech Stack

- **Frontend**: React with TypeScript
- **Backend**: AWS Lambda with TypeScript
- **Infrastructure**: AWS CDK with TypeScript
- **Database**: Amazon DynamoDB
- **API**: Amazon API Gateway
- **Local Development**: LocalStack
- **Monorepo Management**: Lerna

## Key Features

1. **Serverless Architecture**: Uses AWS Lambda for scalable, event-driven backend processing.
2. **Infrastructure as Code**: Employs AWS CDK for defining and provisioning AWS resources using TypeScript.
3. **Type-safe Development**: Leverages TypeScript across the entire stack.
4. **Scalable Data Storage**: Uses DynamoDB for efficient NoSQL data management.
5. **Local Development Environment**: Utilizes LocalStack to emulate AWS services locally.
6. **Monorepo Architecture**: Uses Lerna for managing multiple packages in a single repository.

## Project Structure
customer-intent-dashboard/
├── packages/
│ ├── frontend/ # React TypeScript application
│ ├── backend/ # AWS Lambda functions
│ └── infra/ # AWS CDK infrastructure code
├── package.json # Root package.json for monorepo management
├── Makefile # Commands for building, testing, and deploying
├── docker-compose.yml # LocalStack configuration

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start LocalStack: `docker-compose up -d localstack`
4. Deploy to LocalStack: `make deploy-local`
5. Start the frontend: `npm run start:frontend`

## Local Development

This project uses LocalStack to emulate AWS services locally, allowing for faster development and testing cycles without incurring AWS costs.

## Deployment

- Local deployment: `docker compose build` & `docker compose up -d`
- AWS deployment: `make deploy-aws-with-env` (Ensure AWS credentials are configured)

## Advanced Features

- **Custom CDK Constructs**: Implements reusable CDK constructs for common infrastructure patterns.
- **Type-safe Lambda Functions**: Utilizes TypeScript for writing type-safe AWS Lambda functions.
- **Local AWS Emulation**: Uses LocalStack to emulate AWS services in the local development environment.

## Challenges Overcome

- Implemented a solution to categorize and group similar intents to create a cleaner dashboard.
- Set up a local development environment using LocalStack to emulate AWS services.
- Configured CDK to work with both LocalStack and real AWS environments using the same codebase.

## Future Improvements

- Implement more sophisticated NLP algorithms for better intent categorization.
- Add user authentication using Amazon Cognito.
- Implement real-time updates using WebSockets.