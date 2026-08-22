import { Client, Databases, Storage, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'xerox_digital_pro';
const USERS_COLLECTION_ID = process.env.APPWRITE_USERS_COLLECTION_ID || 'users_profile';
const ORDERS_COLLECTION_ID = process.env.APPWRITE_ORDERS_COLLECTION_ID || 'orders';
const STORAGE_BUCKET_ID = process.env.APPWRITE_STORAGE_BUCKET_ID || 'print_files';

if (!projectId || !apiKey) {
  console.error('\n❌ Missing required configuration!');
  console.error('Please ensure APPWRITE_PROJECT_ID and APPWRITE_API_KEY are set in your .env file before running this script.\n');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);
const storage = new Storage(client);

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function setupDatabase() {
  console.log('\n🚀 Starting automated Appwrite schema provisioning...\n');

  // 1. Create or verify Database
  try {
    console.log(`📦 Creating Database: "${DATABASE_ID}"...`);
    await databases.create(DATABASE_ID, 'Xerox Digital Pro');
    console.log('✅ Database created successfully.');
  } catch (err) {
    if (err.code === 409) {
      console.log('ℹ️  Database already exists, skipping creation.');
    } else {
      console.warn('⚠️  Database creation notice:', err.message);
    }
  }

  // 2. Create Users Profile Collection
  try {
    console.log(`\n📋 Creating Collection: "${USERS_COLLECTION_ID}"...`);
    await databases.createCollection(
      DATABASE_ID,
      USERS_COLLECTION_ID,
      'Users Profile',
      [
        Permission.read(Role.any()),
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
      ]
    );
    console.log('✅ Users Profile Collection created.');
  } catch (err) {
    if (err.code === 409) {
      console.log('ℹ️  Users Profile Collection already exists.');
    } else {
      console.warn('⚠️  Notice:', err.message);
    }
  }

  // Add attributes to users_profile
  const userAttributes = [
    { key: 'userId', type: 'string', size: 255, required: true },
    { key: 'email', type: 'email', required: true },
    { key: 'full_name', type: 'string', size: 255, required: true },
    { key: 'company_name', type: 'string', size: 255, required: false },
    { key: 'mobile', type: 'string', size: 50, required: false },
    { key: 'business_details', type: 'string', size: 2000, required: false },
    { key: 'created_at', type: 'string', size: 100, required: false },
  ];

  for (const attr of userAttributes) {
    try {
      if (attr.type === 'string') {
        await databases.createStringAttribute(DATABASE_ID, USERS_COLLECTION_ID, attr.key, attr.size, attr.required);
      } else if (attr.type === 'email') {
        await databases.createEmailAttribute(DATABASE_ID, USERS_COLLECTION_ID, attr.key, attr.required);
      }
      console.log(`  + Added attribute: ${attr.key}`);
      await wait(300); // small delay to allow Appwrite queue to process
    } catch (err) {
      if (err.code === 409) {
        console.log(`  ℹ️  Attribute "${attr.key}" already exists.`);
      } else {
        console.log(`  ⚠️  Attribute "${attr.key}": ${err.message}`);
      }
    }
  }

  // 3. Create Orders Collection
  try {
    console.log(`\n📋 Creating Collection: "${ORDERS_COLLECTION_ID}"...`);
    await databases.createCollection(
      DATABASE_ID,
      ORDERS_COLLECTION_ID,
      'Orders',
      [
        Permission.read(Role.any()),
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
      ]
    );
    console.log('✅ Orders Collection created.');
  } catch (err) {
    if (err.code === 409) {
      console.log('ℹ️  Orders Collection already exists.');
    } else {
      console.warn('⚠️  Notice:', err.message);
    }
  }

  // Add attributes to orders
  const orderAttributes = [
    { key: 'user_id', type: 'string', size: 255, required: true },
    { key: 'file_name', type: 'string', size: 255, required: true },
    { key: 'file_url', type: 'string', size: 2000, required: false },
    { key: 'file_id', type: 'string', size: 255, required: false },
    { key: 'print_type', type: 'string', size: 50, required: true },
    { key: 'copies', type: 'integer', required: true, default: 1, min: 1 },
    { key: 'paper_size', type: 'string', size: 50, required: true, default: 'A4' },
    { key: 'binding', type: 'string', size: 50, required: false, default: 'none' },
    { key: 'total_price', type: 'float', required: true, default: 0.0 },
    { key: 'status', type: 'string', size: 50, required: true, default: 'Pending' },
    { key: 'created_at', type: 'string', size: 100, required: true },
    { key: 'updated_at', type: 'string', size: 100, required: false },
  ];

  for (const attr of orderAttributes) {
    try {
      if (attr.type === 'string') {
        await databases.createStringAttribute(DATABASE_ID, ORDERS_COLLECTION_ID, attr.key, attr.size, attr.required, attr.required ? undefined : attr.default);
      } else if (attr.type === 'integer') {
        await databases.createIntegerAttribute(DATABASE_ID, ORDERS_COLLECTION_ID, attr.key, attr.required, attr.min, undefined, attr.required ? undefined : attr.default);
      } else if (attr.type === 'float') {
        await databases.createFloatAttribute(DATABASE_ID, ORDERS_COLLECTION_ID, attr.key, attr.required, undefined, undefined, attr.required ? undefined : attr.default);
      }
      console.log(`  + Added attribute: ${attr.key}`);
      await wait(300);
    } catch (err) {
      if (err.code === 409) {
        console.log(`  ℹ️  Attribute "${attr.key}" already exists.`);
      } else {
        console.log(`  ⚠️  Attribute "${attr.key}": ${err.message}`);
      }
    }
  }

  // Add indexes to orders
  try {
    await wait(1000);
    await databases.createIndex(DATABASE_ID, ORDERS_COLLECTION_ID, 'user_id_idx', 'key', ['user_id']);
    console.log('  + Added index: user_id_idx');
  } catch (err) {
    if (err.code !== 409) console.log(`  ⚠️  Index user_id_idx: ${err.message}`);
  }

  // 4. Create Storage Bucket
  try {
    console.log(`\n🗄️  Creating Storage Bucket: "${STORAGE_BUCKET_ID}"...`);
    await storage.createBucket(
      STORAGE_BUCKET_ID,
      'Print Files',
      [
        Permission.read(Role.any()),
        Permission.read(Role.users()),
        Permission.create(Role.users()),
        Permission.update(Role.users()),
        Permission.delete(Role.users()),
      ],
      false, // fileSecurity
      true,  // enabled
      50 * 1024 * 1024, // 50 MB
      ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
    );
    console.log('✅ Storage Bucket created successfully.');
  } catch (err) {
    if (err.code === 409) {
      console.log('ℹ️  Storage Bucket already exists.');
    } else {
      console.warn('⚠️  Notice:', err.message);
    }
  }

  console.log('\n🎉 Done! All Appwrite Databases, Collections, Attributes, and Storage Buckets are ready!\n');
}

setupDatabase().catch(err => {
  console.error('\n❌ Setup error:', err);
  process.exit(1);
});
