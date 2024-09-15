// Repo: @johnforfar/aws-intent-dashboard File: /packages/backend/src/utils/verifyData.ts
import { DynamoDBClient, ListTablesCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, ScanCommandInput, DeleteCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_DEFAULT_REGION || 'ap-southeast-4',
  endpoint: process.env.AWS_ENDPOINT_URL || 'http://localhost:4566',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const tableName = 'Intents';

// List all tables in the database
const listTables = async () => {
  try {
    const command = new ListTablesCommand({});
    const data = await client.send(command);
    console.log('Tables:', data.TableNames);
  } catch (err) {
    console.error('Error listing tables:', err);
  }
};

// Verify data in the Intents table
const verifyData = async () => {
  const params: ScanCommandInput = {
    TableName: tableName,
    Select: 'COUNT',
  };

  try {
    const command = new ScanCommand(params);
    const data = await docClient.send(command);
    console.log(`Verification complete. Found ${data.Count} entries in the '${tableName}' table.`);
    
    if (data.Count && data.Count > 0) {
      const sampleCommand = new ScanCommand({
        TableName: tableName,
        Limit: 1,
      });
      const sampleData = await docClient.send(sampleCommand);
      if (sampleData.Items && sampleData.Items.length > 0) {
        console.log('Sample entry format:');
        console.log(JSON.stringify(sampleData.Items[0], null, 2));
      }
    }
  } catch (err) {
    console.error('Unable to verify the table. Error:', err);
  }
};

// Remove duplicate entries from the table
const removeDuplicates = async () => {
  const params: ScanCommandInput = {
    TableName: tableName,
  };

  try {
    const command = new ScanCommand(params);
    const data = await docClient.send(command);
    
    if (data.Items) {
      const uniqueIntents = new Map();
      let duplicatesRemoved = 0;

      for (const item of data.Items) {
        if (uniqueIntents.has(item.intent)) {
          const deleteCommand = new DeleteCommand({
            TableName: tableName,
            Key: { id: item.id },
          });
          await docClient.send(deleteCommand);
          duplicatesRemoved++;
        } else {
          uniqueIntents.set(item.intent, item.id);
        }
      }

      console.log(`Removed ${duplicatesRemoved} duplicate entries.`);
    }
  } catch (err) {
    console.error('Unable to remove duplicates. Error:', err);
  }
};

const main = async () => {
  await listTables();
  await removeDuplicates();
  await verifyData();
};

main();