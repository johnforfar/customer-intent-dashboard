#!/bin/sh

# Repo: @johnforfar/aws-intent-dashboard File: ./deploy-local.sh

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=ap-southeast-4
export CDK_DEPLOY_ACCOUNT=000000000000
export CDK_DEPLOY_REGION=ap-southeast-4
export CDK_DEFAULT_ACCOUNT=000000000000
export CDK_DEFAULT_REGION=ap-southeast-4
export AWS_ENDPOINT_URL=http://localhost:4566

echo "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID"
echo "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY"
echo "AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION"
echo "CDK_DEPLOY_ACCOUNT=$CDK_DEPLOY_ACCOUNT"
echo "CDK_DEPLOY_REGION=$CDK_DEPLOY_REGION"
echo "CDK_DEFAULT_ACCOUNT=$CDK_DEFAULT_ACCOUNT"
echo "CDK_DEFAULT_REGION=$CDK_DEFAULT_REGION"
echo "AWS_ENDPOINT_URL=$AWS_ENDPOINT_URL"

# Create IAM role for Lambda if it doesn't exist
aws --endpoint-url=http://localhost:4566 iam create-role \
    --role-name lambda-role \
    --assume-role-policy-document '{"Version": "2012-10-17","Statement": [{ "Effect": "Allow", "Principal": {"Service": "lambda.amazonaws.com"}, "Action": "sts:AssumeRole"}]}' || true

aws --endpoint-url=http://localhost:4566 iam attach-role-policy \
    --role-name lambda-role \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole || true

npx cdk deploy \
    --require-approval never \
    --context local=true \
    --app "npx ts-node packages/infra/bin/infra.ts" \
    --verbose \
    --endpoint-url http://localhost:4566 \
    --no-version-reporting \
    --no-asset-metadata \
    --no-path-metadata \
    --toolkit-stack-name CDKToolkit-local \
    --qualifier local