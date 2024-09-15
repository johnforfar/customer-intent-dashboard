// Repo: @johnforfar/customer-intent-dashboard File: /packages/infra/lib/infra-stack.ts
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { Construct } from 'constructs';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const isLocal = this.node.tryGetContext('local') === 'true';

    console.log('Deploying to environment:', { account: this.account, region: this.region, isLocal });

    // DynamoDB table
    const table = new dynamodb.Table(this, 'IntentsTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'intent', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    if (isLocal) {
      (table.node.defaultChild as dynamodb.CfnTable).addPropertyOverride('TableName', 'Intents');
    }

    // Lambda function
    const lambdaFunction = new lambda.Function(this, 'IntentProcessorFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', '..', 'backend')),
      environment: {
        TABLE_NAME: table.tableName,
        IS_LOCAL: isLocal ? 'true' : 'false',
        DYNAMODB_ENDPOINT: isLocal ? 'http://localhost:4566' : '',
      },
    });

    // Grant the Lambda function read-write access to the DynamoDB table
    table.grantReadWriteData(lambdaFunction);

    // API Gateway
    const api = new apigateway.RestApi(this, 'IntentsApi', {
      restApiName: 'Intents Service',
      deployOptions: {
        stageName: isLocal ? 'local' : 'prod',
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    const intentsResource = api.root.addResource('intents');
    intentsResource.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunction));

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API URL',
    });

    if (isLocal) {
      (api.node.defaultChild as apigateway.CfnRestApi).addPropertyOverride('EndpointConfiguration', {
        Types: ['EDGE'],
      });
      const policy = new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        actions: ['execute-api:Invoke'],
        resources: ['execute-api:/*/*/*'],
      });
      (api.node.defaultChild as apigateway.CfnRestApi).addPropertyOverride('Policy', {
        Version: '2012-10-17',
        Statement: [policy.toJSON()],
      });
    }
  }
}