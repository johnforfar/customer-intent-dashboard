#!/usr/bin/env node
// Repo: @johnforfar/customer-intent-dashboard File: /packages/infra/bin/infra.ts
/// <reference types="node" />

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';

// Initialize the CDK app
const app = new cdk.App();

// Determine if we're running in local mode
const isLocal = app.node.tryGetContext('local') === 'true';

// Define the environment for deployment
const env: cdk.Environment = isLocal
  ? {
      account: '000000000000',
      region: 'ap-southeast-4',
    }
  : {
      account: process.env.AWS_ACCOUNT_ID,
      region: process.env.AWS_DEFAULT_REGION || 'ap-southeast-4',
    };

// Log the deployment environment
console.log('Deploying to environment:', env);

// Set up local environment variables if running locally
if (isLocal) {
  process.env.CDK_DEPLOY_ACCOUNT = env.account;
  process.env.CDK_DEPLOY_REGION = env.region;
  process.env.JSII_SILENCE_WARNING_DEPRECATED_NODE_VERSION = '1';
  process.env.CDK_DISABLE_ASSET_STAGING_CONTEXT = '1';
  process.env.AWS_ACCESS_KEY_ID = 'test';
  process.env.AWS_SECRET_ACCESS_KEY = 'test';
  process.env.AWS_DEFAULT_REGION = 'ap-southeast-4';
  process.env.AWS_ENDPOINT_URL = 'http://localhost:4566';
}

// Create the main infrastructure stack
const stack = new InfraStack(app, 'InfraStack', { env });

// Add a tag to the stack if running locally
if (isLocal) {
  cdk.Tags.of(stack).add('deployment', 'local');
}

// Synthesize the CloudFormation template
app.synth();