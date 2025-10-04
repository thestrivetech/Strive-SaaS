import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16;  // 128 bits
const AUTH_TAG_LENGTH = 16;

/**
 * Get encryption key from environment variable
 *
 * @throws {Error} If DOCUMENT_ENCRYPTION_KEY is not set or invalid
 * @returns {Buffer} 32-byte encryption key
 */
function getEncryptionKey(): Buffer {
  const key = process.env.DOCUMENT_ENCRYPTION_KEY;

  if (!key) {
    throw new Error('DOCUMENT_ENCRYPTION_KEY environment variable not set');
  }

  // Ensure key is exactly 32 bytes (64 hex characters)
  const keyBuffer = Buffer.from(key, 'hex');

  if (keyBuffer.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes (64 hex chars). Got ${keyBuffer.length} bytes.`);
  }

  return keyBuffer;
}

/**
 * Encrypted data structure
 */
export interface EncryptedData {
  /** Encrypted file content */
  encryptedBuffer: Buffer;
  /** Initialization vector (base64) */
  iv: string;
  /** Authentication tag (base64) */
  authTag: string;
  /** Encryption algorithm used */
  algorithm: string;
}

/**
 * Encrypt a file buffer using AES-256-GCM
 *
 * This provides:
 * - Confidentiality (data is encrypted)
 * - Authenticity (data cannot be tampered with)
 * - Integrity (data cannot be modified without detection)
 *
 * @param fileBuffer - The file content to encrypt
 * @returns {EncryptedData} Encrypted data with IV and auth tag
 *
 * @example
 * ```typescript
 * const fileBuffer = Buffer.from('Sensitive document content');
 * const encrypted = encryptDocument(fileBuffer);
 *
 * // Store encrypted.encryptedBuffer in storage
 * // Store encrypted.iv, encrypted.authTag in database metadata
 * ```
 */
export function encryptDocument(fileBuffer: Buffer): EncryptedData {
  const key = getEncryptionKey();

  // Generate random IV for each encryption (ensures different ciphertext for same plaintext)
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encryptedChunks: Buffer[] = [];
  encryptedChunks.push(cipher.update(fileBuffer));
  encryptedChunks.push(cipher.final());

  // Get authentication tag (ensures data integrity and authenticity)
  const authTag = cipher.getAuthTag();
  const encryptedBuffer = Buffer.concat(encryptedChunks);

  return {
    encryptedBuffer,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    algorithm: ALGORITHM,
  };
}

/**
 * Decrypt a file buffer using AES-256-GCM
 *
 * @param encryptedData - The encrypted data with IV and auth tag
 * @returns {Buffer} Decrypted file content
 * @throws {Error} If decryption fails (wrong key, tampered data, etc.)
 *
 * @example
 * ```typescript
 * const decrypted = decryptDocument({
 *   encryptedBuffer,
 *   iv: 'base64-iv',
 *   authTag: 'base64-auth-tag',
 *   algorithm: 'aes-256-gcm',
 * });
 *
 * // Use decrypted buffer
 * ```
 */
export function decryptDocument(encryptedData: EncryptedData): Buffer {
  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const authTag = Buffer.from(encryptedData.authTag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  // Set auth tag for verification (will throw if data was tampered with)
  decipher.setAuthTag(authTag);

  const decryptedChunks: Buffer[] = [];
  decryptedChunks.push(decipher.update(encryptedData.encryptedBuffer));
  decryptedChunks.push(decipher.final());

  return Buffer.concat(decryptedChunks);
}

/**
 * Generate a secure encryption key for DOCUMENT_ENCRYPTION_KEY
 *
 * Run this once and store the result in your .env.local file.
 * DO NOT commit the generated key to version control.
 *
 * @returns {string} 64-character hex string (32 bytes)
 *
 * @example
 * ```typescript
 * const key = generateEncryptionKey();
 * console.log('DOCUMENT_ENCRYPTION_KEY=' + key);
 * // Add to .env.local
 * ```
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}
