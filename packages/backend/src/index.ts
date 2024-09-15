// Repo: @johnforfar/customer-intent-dashboard File: /packages/backend/src/index.ts

// packages/backend/src/index.ts

import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
// import { ComprehendClient, ClassifyDocumentCommand } from "@aws-sdk/client-comprehend";

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_DEFAULT_REGION || 'ap-southeast-4',
  ...(process.env.IS_LOCAL === 'true' && {
    endpoint: process.env.DYNAMODB_ENDPOINT || 'http://localhost:4566',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  }),
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
// const comprehendClient = new ComprehendClient({ region: process.env.AWS_DEFAULT_REGION || 'ap-southeast-4' });

const intentCategories = {
  'Account Management': ['monthly fee', 'bill', 'charge', 'invoice', 'statement', 'account', 'balance', 'payment', 'due', 'credit', 'refund', 'adjust', 'update', 'review', 'analyze', 'examine', 'scrutinize', 'investigate', 'explore', 'assess', 'evaluate', 'question', 'dispute', 'clarify', 'verify'],

  'Service Changes': ['upgrade', 'change', 'modify', 'switch', 'alter', 'adjust', 'revise', 'transform', 'transition', 'evolve', 'shift', 'replace', 'substitute', 'exchange', 'elevate', 'enhance', 'improve', 'optimize', 'refine', 'advance'],

  'Technical Support': ['technical', 'issue', 'problem', 'error', 'malfunction', 'glitch', 'bug', 'fault', 'trouble', 'difficulty', 'snag', 'complication', 'breakdown', 'failure', 'defect', 'flaw', 'anomaly', 'irregularity', 'resolve', 'fix', 'repair', 'troubleshoot', 'diagnose', 'solve'],

  'New Services': ['new', 'activate', 'start', 'begin', 'initiate', 'launch', 'introduce', 'establish', 'set up', 'implement', 'inaugurate', 'commence', 'kickstart', 'deploy', 'install', 'provision', 'enable', 'onboard', 'acquire', 'obtain'],

  'Cancellation': ['cancel', 'terminate', 'end', 'stop', 'discontinue', 'cease', 'halt', 'suspend', 'interrupt', 'pause', 'deactivate', 'disconnect', 'close', 'remove', 'eliminate', 'withdraw', 'revoke', 'annul', 'nullify', 'void'],

  'Billing Inquiry': ['billing', 'charge', 'fee', 'cost', 'price', 'rate', 'expense', 'payment', 'invoice', 'statement', 'amount', 'balance', 'transaction', 'debit', 'credit', 'refund', 'discount', 'prorate', 'adjustment', 'breakdown', 'detail', 'itemize', 'clarify', 'explain', 'dispute'],

  'Service Interruption': ['outage', 'interruption', 'down', 'not working', 'disruption', 'failure', 'malfunction', 'breakdown', 'disconnection', 'unavailable', 'offline', 'inactive', 'faulty', 'error', 'issue', 'problem', 'glitch', 'disturbance', 'intermittent', 'unstable'],

  'Information Request': ['info', 'information', 'details', 'learn', 'understand', 'inquire', 'ask', 'request', 'query', 'question', 'investigate', 'explore', 'research', 'seek', 'gather', 'collect', 'obtain', 'acquire', 'clarify', 'explain', 'describe', 'elaborate', 'specify', 'elucidate'],

  'Device Issues': ['phone', 'device', 'equipment', 'hardware', 'handset', 'mobile', 'smartphone', 'tablet', 'gadget', 'apparatus', 'instrument', 'appliance', 'tool', 'machinery', 'component', 'accessory', 'peripheral', 'system', 'unit', 'broken', 'damaged', 'faulty', 'malfunctioning', 'defective'],

  'Data Usage': ['data', 'usage', 'consume', 'utilization', 'bandwidth', 'traffic', 'volume', 'quota', 'allowance', 'limit', 'cap', 'threshold', 'overage', 'exceed', 'monitor', 'track', 'measure', 'analyze', 'report', 'statistics', 'metrics', 'consumption', 'roaming', 'international']
};

async function classifyIntent(text: string, method: 'keyword' | 'comprehend' | 'local-model' = 'keyword'): Promise<string> {
  switch (method) {
    case 'keyword':
      return classifyIntentKeyword(text);
    case 'comprehend':
      throw new Error('Comprehend classification not implemented');
    case 'local-model':
      throw new Error('Local model classification not implemented');
    default:
      throw new Error('Invalid classification method');
  }
}

function classifyIntentKeyword(text: string): string {
  const lowerText = text.toLowerCase();
  for (const [category, keywords] of Object.entries(intentCategories)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  return 'Other';
}

// Uncomment and implement these functions for Comprehend or a local model
// async function classifyIntentComprehend(text: string): Promise<string> {
//   const command = new ClassifyDocumentCommand({
//     Text: text,
//     EndpointArn: 'your-comprehend-endpoint-arn'
//   });
//   const response = await comprehendClient.send(command);
//   return response.Classes?.[0]?.Name || 'Unclassified';
// }

// async function classifyIntentLocalModel(text: string): Promise<string> {
//   // Implement local model classification logic here
// }

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Lambda function invoked');
  console.log('Event:', JSON.stringify(event, null, 2));

  const allowedOrigin = process.env.IS_LOCAL === 'true'
    ? 'http://localhost:3000'
    : 'http://customer-intent-dashboard-frontend-565211267331.s3-website.ap-southeast-4.amazonaws.com';

  try {
    const command = new ScanCommand({
      TableName: process.env.TABLE_NAME || 'Intents',
    });

    const result = await docClient.send(command);
    const items = result.Items || [];

    const classifiedIntents = await Promise.all(items.map(async (item) => {
      const intent = item.intent?.S;
      if (!intent) {
        return { ...item, classification: 'Unknown' };
      }
      const classification = await classifyIntent(intent);
      return {
        ...item,
        classification,
      };
    }));

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
      },
      body: JSON.stringify(classifiedIntents),
    };
  } catch (error) {
    console.error('Error in Lambda handler:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': allowedOrigin,
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization'
      },
      body: JSON.stringify({ 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }),
    };
  }
};