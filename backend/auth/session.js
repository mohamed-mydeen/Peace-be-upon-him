const crypto = require('crypto');

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

function sessionSecret() {
  const secret = process.env.APP_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('APP_SESSION_SECRET must be at least 32 characters.');
  return secret;
}

function encode(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function sign(value) {
  return crypto.createHmac('sha256', sessionSecret()).update(value).digest('base64url');
}

function issueSession(userId) {
  const payload = encode({ sub: userId, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS });
  return `${payload}.${sign(payload)}`;
}

function verifySession(token) {
  const [payload, signature] = String(token).split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const sameSignature = signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!sameSignature) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.sub && data.exp > Math.floor(Date.now() / 1000) ? data : null;
  } catch { return null; }
}

function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(`scrypt$${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

function verifyPassword(password, storedHash) {
  return new Promise((resolve, reject) => {
    const [algorithm, salt, hash] = String(storedHash || '').split('$');
    if (algorithm !== 'scrypt' || !salt || !hash) return resolve(false);
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(crypto.timingSafeEqual(Buffer.from(hash, 'hex'), derivedKey));
    });
  });
}

module.exports = { hashPassword, issueSession, verifyPassword, verifySession };
