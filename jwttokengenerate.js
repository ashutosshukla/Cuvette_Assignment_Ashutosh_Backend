import crypto from 'crypto';
const secret = crypto.randomBytes(64).toString('base64');
console.log(secret);  // Use this key as your JWT secret
