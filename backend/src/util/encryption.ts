import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits

// Get master key from environment and ensure proper length
const getMasterKey = (): Buffer => {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;
  if (!masterKey) {
    throw new Error('ENCRYPTION_MASTER_KEY environment variable is required');
  }
  
  // If the key is already 32 bytes (64 hex characters), use it directly
  if (masterKey.length === 64 && /^[0-9a-fA-F]+$/.test(masterKey)) {
    return Buffer.from(masterKey, 'hex');
  }
  
  // Otherwise, derive a proper key using PBKDF2
  const salt = 'hedera-master-key-salt'; // Use a fixed salt for master key derivation
  return crypto.pbkdf2Sync(masterKey, salt, 100000, KEY_LENGTH, 'sha512');
};

/**
 * Generate a random encryption key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Generate a proper master key for environment variable
 * This should be used to generate the ENCRYPTION_MASTER_KEY value
 */
export function generateMasterKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Derive encryption key from password using PBKDF2
 */
export function deriveKeyFromPassword(password: string, salt: string): Buffer {
  return crypto.pbkdf2Sync(password, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * Encrypt a private key
 */
export function encryptPrivateKey(privateKey: string, masterKey?: string): string {
  try {
    let key: Buffer;
    if (masterKey) {
      // If masterKey is provided as string, derive it properly
      if (masterKey.length === 64 && /^[0-9a-fA-F]+$/.test(masterKey)) {
        key = Buffer.from(masterKey, 'hex');
      } else {
        const salt = 'hedera-master-key-salt';
        key = crypto.pbkdf2Sync(masterKey, salt, 100000, KEY_LENGTH, 'sha512');
      }
    } else {
      key = getMasterKey();
    }
    
    // Generate random IV
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    cipher.setAAD(Buffer.from('hedera-private-key', 'utf8'));
    
    // Encrypt the private key
    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get authentication tag
    const tag = cipher.getAuthTag();
    
    // Combine IV + tag + encrypted data
    const combined = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
    
    return combined;
  } catch (error) {
    throw new Error(`Failed to encrypt private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt a private key
 */
export function decryptPrivateKey(encryptedPrivateKey: string, masterKey?: string): string {
  try {
    let key: Buffer;
    if (masterKey) {
      // If masterKey is provided as string, derive it properly
      if (masterKey.length === 64 && /^[0-9a-fA-F]+$/.test(masterKey)) {
        key = Buffer.from(masterKey, 'hex');
      } else {
        const salt = 'hedera-master-key-salt';
        key = crypto.pbkdf2Sync(masterKey, salt, 100000, KEY_LENGTH, 'sha512');
      }
    } else {
      key = getMasterKey();
    }
    
    // Split the combined string
    const parts = encryptedPrivateKey.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted private key format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAAD(Buffer.from('hedera-private-key', 'utf8'));
    decipher.setAuthTag(tag);
    
    // Decrypt the private key
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Failed to decrypt private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Hash a private key for verification (one-way)
 */
export function hashPrivateKey(privateKey: string): string {
  return crypto.createHash('sha256').update(privateKey).digest('hex');
}

/**
 * Verify private key hash
 */
export function verifyPrivateKeyHash(privateKey: string, hash: string): boolean {
  const computedHash = hashPrivateKey(privateKey);
  return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(hash, 'hex'));
}

/**
 * Generate a secure random salt
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Encrypt with salt and password
 */
export function encryptWithPassword(data: string, password: string): { encrypted: string; salt: string } {
  const salt = generateSalt();
  const key = deriveKeyFromPassword(password, salt);
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  cipher.setAAD(Buffer.from('hedera-data', 'utf8'));
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  const combined = iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  
  return {
    encrypted: combined,
    salt
  };
}

/**
 * Decrypt with salt and password
 */
export function decryptWithPassword(encryptedData: string, password: string, salt: string): string {
  const key = deriveKeyFromPassword(password, salt);
  
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const tag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAAD(Buffer.from('hedera-data', 'utf8'));
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
