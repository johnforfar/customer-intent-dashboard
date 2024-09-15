#!/bin/bash

# Repo: @johnforfar/customer-intent-dashboard File: ./deploy-aws.sh

set -e

# Ensure AWS credentials are set
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "Error: AWS credentials are not set. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables."
    exit 1
fi

# Get AWS account ID
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "Deploying to AWS Account: $AWS_ACCOUNT_ID"

# Build the backend
cd packages/backend
npm run build
cd ../..

# Deploy infrastructure
cd packages/infra
npx cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_DEFAULT_REGION
npx cdk deploy --require-approval never --context local=false

# Get the API URL
API_URL=$(aws cloudformation describe-stacks --stack-name InfraStack --query "Stacks[0].Outputs[?OutputKey=='ApiUrl'].OutputValue" --output text)

# Create DynamoDB table and upload data
cd ../backend
npm run create-table
echo "Waiting for table to be fully created..."
sleep 30  # Wait for 30 seconds
npm run upload-data
npm run verify-data

# Update frontend environment
cd ../frontend
npm install
echo "REACT_APP_API_URL=$API_URL" > .env.production
npm run build

# Create S3 bucket (if it doesn't exist)
BUCKET_NAME="customer-intent-dashboard-frontend-$AWS_ACCOUNT_ID"
aws s3 mb s3://$BUCKET_NAME --region $AWS_DEFAULT_REGION || true

# Disable block public access settings for the bucket
aws s3api put-public-access-block --bucket $BUCKET_NAME --public-access-block-configuration '{
    "BlockPublicAcls": false,
    "IgnorePublicAcls": false,
    "BlockPublicPolicy": false,
    "RestrictPublicBuckets": false
}'

# Upload frontend build to S3
aws s3 sync build s3://$BUCKET_NAME

# Enable static website hosting
aws s3 website s3://$BUCKET_NAME --index-document index.html --error-document index.html

# Set bucket policy for public read access
aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy '{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
        }
    ]
}'

FRONTEND_URL="http://$BUCKET_NAME.s3-website-$AWS_DEFAULT_REGION.amazonaws.com"

echo "Deployment complete."
echo "API URL: $API_URL"
echo "Frontend URL: $FRONTEND_URL"