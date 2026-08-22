import { Client, Users, Databases, Storage } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || '6a89594c001ad60f0fbd';
const apiKey = process.env.APPWRITE_API_KEY || 'standard_a7721556f1dbd9be023b7e5958b2a340b554d2cbecbcae0e7a7017b6d7678bdaebf4da4331e1b707cf032d6792b1dd77def2b84da3d047373b9d46447ba9042b378167ffbdfe61566d93bce299959d8c5e5149857462570abf3166679d9357d265a0310fc8064e89fbc5ea6ca1d956853c17e0dfdc9276684b6d6649431061c6';

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
