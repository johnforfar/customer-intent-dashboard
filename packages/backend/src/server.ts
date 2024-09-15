// Repo: @johnforfar/aws-intent-dashboard // File: /packages/backend/src/server.ts

import express from 'express';
import cors from 'cors';
import { handler } from './index';
import { APIGatewayProxyEvent, Context, Callback, APIGatewayProxyResult } from 'aws-lambda';

const app = express();
const port = 4000;

// Enable CORS for all routes
app.use(cors());

app.get('/api/intents', async (req, res) => {
  console.log('Environment variables in server:', process.env);
  const event: APIGatewayProxyEvent = {
    httpMethod: 'GET',
    path: '/api/intents',
    headers: req.headers as { [name: string]: string },
    multiValueHeaders: {},
    queryStringParameters: req.query as { [name: string]: string } | null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
    body: null,
    isBase64Encoded: false
  };

  const context: Context = {
    callbackWaitsForEmptyEventLoop: true,
    functionName: '',
    functionVersion: '',
    invokedFunctionArn: '',
    memoryLimitInMB: '',
    awsRequestId: '',
    logGroupName: '',
    logStreamName: '',
    getRemainingTimeInMillis: () => 0,
    done: () => {},
    fail: () => {},
    succeed: () => {},
  };

  const callback: Callback<APIGatewayProxyResult> = (error, result) => {
    if (error) {
      console.error('Lambda function error:', error);
      res.status(500).send('Internal Server Error');
    } else if (result) {
      res.status(result.statusCode).set(result.headers).send(result.body);
    } else {
      res.status(500).send('Internal Server Error');
    }
  };

  try {
    const result = await handler(event, context, callback);
    if (result) {
      console.log('Handler result:', JSON.stringify(result, null, 2));
      res.status(result.statusCode).set(result.headers).send(result.body);
    } else {
      console.error('Handler returned no result');
      res.status(500).send('Internal Server Error');
    }
  } catch (error: unknown) {
    console.error('Error invoking Lambda handler:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});