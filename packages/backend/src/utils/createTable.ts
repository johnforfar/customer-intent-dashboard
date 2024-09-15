// Repo: @johnforfar/customer-intent-dashboard File: /packages/backend/src/utils/createTable.ts
import { DynamoDBClient, CreateTableCommand, CreateTableCommandInput } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_DEFAULT_REGION || 'ap-southeast-4',
  endpoint: process.env.AWS_ENDPOINT_URL || 'http://localhost:4566',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
});

const params: CreateTableCommandInput = {
  TableName: 'Intents',
  KeySchema: [
    { AttributeName: 'id', KeyType: 'HASH' },  // Partition key
  ],
  AttributeDefinitions: [
    { AttributeName: 'id', AttributeType: 'S' },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
};

const createTable = async () => {
  try {
    const command = new CreateTableCommand(params);
    const data = await client.send(command);
    console.log('Created table. Table description JSON:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Unable to create table. Error JSON:', JSON.stringify(err, null, 2));
  }
};

createTable();