import { Client, Users, Databases, Storage } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || 'xerox-digital-pro';
const apiKey = process.env.APPWRITE_API_KEY || '';

// Server Admin Client
const serverClient = new Client();
serverClient
  .setEndpoint(endpoint)
  .setProject(projectId);

if (apiKey) {
  serverClient.setKey(apiKey);
} else {
  console.warn('⚠️  APPWRITE_API_KEY is not set. Server Appwrite operations requiring API keys will run in fallback mode.');
}

export const users = new Users(serverClient);
export const databases = new Databases(serverClient);
export const storage = new Storage(serverClient);

// Appwrite IDs
export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'xerox_digital_pro';
export const USERS_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID || 'users_profile';
export const ORDERS_COLLECTION_ID = process.env.APPWRITE_ORDERS_COLLECTION_ID || 'orders';
export const STORAGE_BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET_ID || 'print_files';

export { serverClient, endpoint, projectId };
export default serverClient;
