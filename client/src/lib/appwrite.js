import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a89594c001ad60f0fbd';

client
  .setEndpoint(endpoint)
  .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Appwrite Schema Constants
export const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'xerox_digital_pro';
export const USERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID || 'users_profile';
export const ORDERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ORDERS_COLLECTION_ID || 'orders';
export const STORAGE_BUCKET_ID = import.meta.env.VITE_APPWRITE_STORAGE_BUCKET_ID || 'print_files';

export { client };
export default client;
