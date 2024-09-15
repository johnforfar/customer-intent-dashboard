#!/bin/bash

# Repo: @johnforfar/aws-intent-dashboard File: ./package-lambda.sh

set -e

# Navigate to the backend package
cd packages/backend

# Ensure all dependencies are installed
npm install

# Build the Lambda function
npm run build

# Create DynamoDB table and upload data
npx ts-node src/utils/createTable.ts
npx ts-node src/utils/uploadData.ts
npx ts-node src/utils/verifyData.ts

# Zip the contents (including node_modules)
zip -r function.zip dist/* node_modules/@aws-sdk/*

# Navigate back to the root
cd ../..

# Check if the Lambda function exists, create it if it doesn't
if ! aws --endpoint-url=http://localhost:4566 --no-cli-pager lambda get-function --function-name IntentProcessorFunction &>/dev/null; then
    echo "Creating Lambda function..."
    aws --endpoint-url=http://localhost:4566 --no-cli-pager lambda create-function \
        --function-name IntentProcessorFunction \
        --runtime nodejs18.x \
        --role arn:aws:iam::000000000000:role/lambda-role \
        --handler dist/index.handler \
        --zip-file fileb://packages/backend/function.zip
else
    echo "Updating Lambda function code..."
    aws --endpoint-url=http://localhost:4566 --no-cli-pager lambda update-function-code \
        --function-name IntentProcessorFunction \
        --zip-file fileb://packages/backend/function.zip
fi

echo "Waiting for Lambda update to complete..."
sleep 10

# Update the Lambda function configuration
echo "Updating Lambda function configuration..."
aws --endpoint-url=http://localhost:4566 --no-cli-pager lambda update-function-configuration \
    --function-name IntentProcessorFunction \
    --handler dist/index.handler \
    --environment "Variables={IS_LOCAL=true,DYNAMODB_ENDPOINT=http://localstack:4566,TABLE_NAME=Intents,AWS_DEFAULT_REGION=ap-southeast-4,AWS_ACCESS_KEY_ID=test,AWS_SECRET_ACCESS_KEY=test}"

echo "Waiting for Lambda configuration update to complete..."
sleep 10

# Invoke the Lambda function to test
echo "Invoking Lambda function..."
aws --endpoint-url=http://localhost:4566 --no-cli-pager lambda invoke \
    --function-name IntentProcessorFunction \
    --payload '{"path": "/api/intents", "httpMethod": "GET"}' \
    --cli-binary-format raw-in-base64-out \
    --log-type Tail \
    output.txt

echo "Lambda function response:"
cat output.txt

echo "Lambda function logs (base64 decoded):"
aws --endpoint-url=http://localhost:4566 --no-cli-pager lambda invoke \
    --function-name IntentProcessorFunction \
    --payload '{"path": "/api/intents", "httpMethod": "GET"}' \
    --cli-binary-format raw-in-base64-out \
    --log-type Tail \
    /dev/null | jq -r '.LogResult' | base64 -d