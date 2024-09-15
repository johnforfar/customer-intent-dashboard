// Repo: @johnforfar/aws-intent-dashboard File: /packages/backend/src/utils/uploadData.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import * as fs from 'fs';
import * as uuid from 'uuid';
import * as path from 'path';

console.log('AWS_DEFAULT_REGION:', process.env.AWS_DEFAULT_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
console.log('AWS_ENDPOINT_URL:', process.env.AWS_ENDPOINT_URL);

const isLocal = process.env.IS_LOCAL === 'true';

const client = new DynamoDBClient({
  region: process.env.AWS_DEFAULT_REGION || 'ap-southeast-4',
  endpoint: isLocal ? 'http://localhost:4566' : undefined,
  credentials: isLocal ? {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  } : undefined,
});

const docClient = DynamoDBDocumentClient.from(client);
const tableName = 'Intents';

interface Intent {
  id: string;
  intent: string;
}

const uploadData = async () => {
  const data = fs.readFileSync(path.join(__dirname, '..', '..', '..', '..', 'dataset.txt'), 'utf8');
  const intents: Intent[] = data.split('\n').map((intent: string) => ({
    id: uuid.v4(),
    intent: intent.trim(),
  }));

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  // First, scan the table to get all existing intents
  const existingIntents = new Set();
  let exclusiveStartKey;

  do {
    const scanCommand: ScanCommand = new ScanCommand({
      TableName: tableName,
      ProjectionExpression: 'intent',
      ExclusiveStartKey: exclusiveStartKey,
    });

    try {
      const response = await docClient.send(scanCommand);
      response.Items?.forEach(item => existingIntents.add(item.intent));
      exclusiveStartKey = response.LastEvaluatedKey;
    } catch (err) {
      console.error('Error scanning table:', err);
      return;
    }
  } while (exclusiveStartKey);

  // Now process the intents
  for (let i = 0; i < intents.length; i++) {
    const item = intents[i];

    if (existingIntents.has(item.intent)) {
      skipCount++;
      continue;
    }

    const putCommand = new PutCommand({
      TableName: tableName,
      Item: item,
      ConditionExpression: 'attribute_not_exists(intent)', // Extra precaution
    });

    try {
      await docClient.send(putCommand);
      successCount++;
    } catch (err) {
      if ((err as any).name === 'ConditionalCheckFailedException') {
        skipCount++;
      } else {
        console.error(`Error adding item: ${item.intent}. Error:`, err);
        failCount++;
      }
    }

    if ((i + 1) % 10 === 0 || i === intents.length - 1) {
      process.stdout.write(`\rProgress: ${i + 1}/${intents.length} items processed. Success: ${successCount}, Failed: ${failCount}, Skipped: ${skipCount}`);
    }
  }

  console.log('\nUpload completed.');
};

uploadData();