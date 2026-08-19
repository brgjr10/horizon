const { execSync } = require('child_process');

const BASE = 'http://192.168.4.110:8080/v1';
const EMAIL = 'admin@horizon.local';
const PASS = 'Admin123456!';
const PROJ_NAME = 'horizon';
const DB_NAME = 'horizonDB';

function api(path, { method = 'POST', body = null, jwt = null, session = null }) {
  const hdrs = ['-s', '-X', method];
  hdrs.push('-H "Content-Type: application/json"');
  hdrs.push('-H "X-Appwrite-Project: console"');
  if (session) hdrs.push(`-H "X-Appwrite-Session: ${session}"`);
  if (jwt) hdrs.push(`-H "X-Appwrite-JWT: ${jwt}"`);
  let dataFlag = '';
  if (body) dataFlag = `-d '${JSON.stringify(body)}'`;
  const cmd = `curl ${hdrs.join(' ')} ${dataFlag} "${BASE}${path}"`;
  const out = execSync(cmd, { encoding: 'utf8', timeout: 15000 });
  return JSON.parse(out);
}

console.log('--- Step 1: Create admin account ---');
try {
  const account = api('/account', { body: { email: EMAIL, password: PASS, name: 'Admin' } });
  console.log('Account:', account.email || account.message);
} catch(e) {
  console.log('Account may already exist:', e.message);
}

console.log('\n--- Step 2: Create session (login) ---');
const session = api('/account/sessions/email', { body: { email: EMAIL, password: PASS } });
console.log('Session secret:', session.secret ? 'OK' : 'FAILED');

const sessionSecret = session.secret;

console.log('\n--- Step 4: Create project ---');
const proj = api('/projects', { body: { name: PROJ_NAME }, session: sessionSecret });
console.log('Project ID:', proj.$id);
const projectId = proj.$id;

console.log('\n--- Step 5: Create API key ---');
const scopes = ['databases.read','databases.write','collections.read','collections.write','documents.read','documents.write','users.read','users.write','assets.*','buckets.*','functions.*','logs.read','members.*','teams.*','webhooks.*','avatars.read','health.read','locale.read','storage.read','storage.write','realtime.read'];
const keyRes = api('/project-keys', { body: { name: 'horizon-key', scope: scopes }, session: sessionSecret });
console.log('API Key:', keyRes.secret ? 'OK' : 'FAILED');
const apiKey = keyRes.secret;

console.log('\n--- Step 6: Create database ---');
const db = api(`/databases`, { body: { name: DB_NAME, projectId }, session: sessionSecret });
console.log('Database ID:', db.$id);
const databaseId = db.$id;

console.log('\n--- Step 7: Create collections ---');

// users collection
const usersCol = api(`/databases/${databaseId}/collections`, { 
  body: { name: 'users', permissions: ['read("any")','write("any")'], documentSecurity: true }, 
  session: sessionSecret 
});
console.log('Users collection ID:', usersCol.$id);

// banks collection
const banksCol = api(`/databases/${databaseId}/collections`, { 
  body: { name: 'banks', permissions: ['read("any")','write("any")'], documentSecurity: true }, 
  session: sessionSecret 
});
console.log('Banks collection ID:', banksCol.$id);

// transactions collection
const txCol = api(`/databases/${databaseId}/collections`, { 
  body: { name: 'transactions', permissions: ['read("any")','write("any")'], documentSecurity: true }, 
  session: sessionSecret 
});
console.log('Transactions collection ID:', txCol.$id);

// Create attributes for users collection
console.log('\n--- Step 8: Creating attributes for users collection ---');
const userAttrs = [
  { key: 'userId', type: 'string', size: 255, required: true },
  { key: 'firstName', type: 'string', size: 255, required: true },
  { key: 'lastName', type: 'string', size: 255, required: true },
  { key: 'address1', type: 'string', size: 255, required: false },
  { key: 'city', type: 'string', size: 255, required: false },
  { key: 'state', type: 'string', size: 255, required: false },
  { key: 'postalCode', type: 'string', size: 50, required: false },
  { key: 'dateOfBirth', type: 'string', size: 255, required: false },
  { key: 'ssn', type: 'string', size: 255, required: false },
  { key: 'dwollaCustomerId', type: 'string', size: 255, required: false },
  { key: 'dwollaCustomerUrl', type: 'string', size: 500, required: false },
];
for (const attr of userAttrs) {
  try {
    api(`/databases/${databaseId}/collections/${usersCol.$id}/attributes/${attr.type}`, {
      body: { key: attr.key, size: attr.size, required: attr.required },
      session: sessionSecret
    });
    console.log(`  ${attr.key}: OK`);
  } catch(e) {
    console.log(`  ${attr.key}: ${e.message}`);
  }
}

// Create attributes for banks collection
console.log('\n--- Creating attributes for banks collection ---');
const bankAttrs = [
  { key: 'userId', type: 'string', size: 255, required: true },
  { key: 'bankId', type: 'string', size: 255, required: true },
  { key: 'accountId', type: 'string', size: 255, required: true },
  { key: 'accessToken', type: 'string', size: 500, required: false },
  { key: 'fundingSourceUrl', type: 'string', size: 500, required: false },
  { key: 'shareableId', type: 'string', size: 255, required: false },
];
for (const attr of bankAttrs) {
  try {
    api(`/databases/${databaseId}/collections/${banksCol.$id}/attributes/${attr.type}`, {
      body: { key: attr.key, size: attr.size, required: attr.required },
      session: sessionSecret
    });
    console.log(`  ${attr.key}: OK`);
  } catch(e) {
    console.log(`  ${attr.key}: ${e.message}`);
  }
}

// Create attributes for transactions collection
console.log('\n--- Creating attributes for transactions collection ---');
const txAttrs = [
  { key: 'name', type: 'string', size: 255, required: true },
  { key: 'amount', type: 'integer', size: null, required: true },
  { key: 'senderBankId', type: 'string', size: 255, required: false },
  { key: 'receiverBankId', type: 'string', size: 255, required: false },
  { key: 'email', type: 'string', size: 255, required: false },
  { key: 'senderId', type: 'string', size: 255, required: false },
  { key: 'receiverId', type: 'string', size: 255, required: false },
  { key: 'channel', type: 'string', size: 100, required: false },
  { key: 'category', type: 'string', size: 100, required: false },
];
for (const attr of txAttrs) {
  try {
    if (attr.type === 'integer') {
      api(`/databases/${databaseId}/collections/${txCol.$id}/attributes/${attr.type}`, {
        body: { key: attr.key, required: attr.required, range: '0,999999999' },
        session: sessionSecret
      });
    } else {
      api(`/databases/${databaseId}/collections/${txCol.$id}/attributes/${attr.type}`, {
        body: { key: attr.key, size: attr.size, required: attr.required },
        session: sessionSecret
      });
    }
    console.log(`  ${attr.key}: OK`);
  } catch(e) {
    console.log(`  ${attr.key}: ${e.message}`);
  }
}

console.log('\n=== SETUP COMPLETE ===');
console.log('Project ID:', projectId);
console.log('API Key:', apiKey);
console.log('Database ID:', databaseId);
console.log('Users Collection ID:', usersCol.$id);
console.log('Banks Collection ID:', banksCol.$id);
console.log('Transactions Collection ID:', txCol.$id);
console.log('\nUpdate .env.docker with these values.');
