import { encryptDocument, decryptDocument, generateEncryptionKey } from '@/lib/storage/encryption';

describe('Document Encryption', () => {
  beforeAll(() => {
    // Set test encryption key (32 bytes = 64 hex characters)
    process.env.DOCUMENT_ENCRYPTION_KEY =
      '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  afterAll(() => {
    // Clean up environment
    delete process.env.DOCUMENT_ENCRYPTION_KEY;
  });

  describe('encryptDocument', () => {
    it('should encrypt buffer and return encrypted data with IV and auth tag', () => {
      const originalBuffer = Buffer.from('This is a test document content');

      const encrypted = encryptDocument(originalBuffer);

      expect(encrypted.encryptedBuffer).toBeDefined();
      expect(encrypted.encryptedBuffer).toBeInstanceOf(Buffer);
      expect(encrypted.iv).toBeDefined();
      expect(typeof encrypted.iv).toBe('string');
      expect(encrypted.authTag).toBeDefined();
      expect(typeof encrypted.authTag).toBe('string');
      expect(encrypted.algorithm).toBe('aes-256-gcm');
    });

    it('should produce different ciphertexts for same input (different IVs)', () => {
      const buffer = Buffer.from('Same content');

      const encrypted1 = encryptDocument(buffer);
      const encrypted2 = encryptDocument(buffer);

      // Different IVs = different ciphertexts (even for same plaintext)
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.encryptedBuffer.toString('hex')).not.toBe(
        encrypted2.encryptedBuffer.toString('hex')
      );
    });

    it('should encrypt empty buffer', () => {
      const emptyBuffer = Buffer.from('');
      const encrypted = encryptDocument(emptyBuffer);

      expect(encrypted.encryptedBuffer).toBeDefined();
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.authTag).toBeDefined();
    });

    it('should throw error if DOCUMENT_ENCRYPTION_KEY is not set', () => {
      delete process.env.DOCUMENT_ENCRYPTION_KEY;

      expect(() => {
        encryptDocument(Buffer.from('test'));
      }).toThrow('DOCUMENT_ENCRYPTION_KEY environment variable not set');

      // Restore key for other tests
      process.env.DOCUMENT_ENCRYPTION_KEY =
        '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    });
  });

  describe('decryptDocument', () => {
    it('should decrypt buffer and return original content', () => {
      const originalBuffer = Buffer.from('This is a test document content');

      const encrypted = encryptDocument(originalBuffer);
      const decrypted = decryptDocument(encrypted);

      expect(decrypted.toString()).toBe(originalBuffer.toString());
      expect(decrypted).toEqual(originalBuffer);
    });

    it('should fail decryption with wrong auth tag', () => {
      const buffer = Buffer.from('Test content');
      const encrypted = encryptDocument(buffer);

      // Tamper with auth tag
      encrypted.authTag = Buffer.from('wrong-tag-wrong-tag-', 'utf-8').toString('base64');

      expect(() => decryptDocument(encrypted)).toThrow();
    });

    it('should fail decryption with wrong IV', () => {
      const buffer = Buffer.from('Test content');
      const encrypted = encryptDocument(buffer);

      // Tamper with IV
      encrypted.iv = Buffer.from('wrong-iv-1234567', 'utf-8').toString('base64');

      expect(() => decryptDocument(encrypted)).toThrow();
    });

    it('should fail decryption with tampered ciphertext', () => {
      const buffer = Buffer.from('Test content');
      const encrypted = encryptDocument(buffer);

      // Tamper with encrypted buffer
      const tampered = Buffer.from(encrypted.encryptedBuffer);
      tampered[0] = tampered[0] ^ 0xFF; // Flip bits
      encrypted.encryptedBuffer = tampered;

      expect(() => decryptDocument(encrypted)).toThrow();
    });

    it('should decrypt empty encrypted buffer', () => {
      const emptyBuffer = Buffer.from('');
      const encrypted = encryptDocument(emptyBuffer);
      const decrypted = decryptDocument(encrypted);

      expect(decrypted.toString()).toBe('');
    });
  });

  describe('generateEncryptionKey', () => {
    it('should generate 64-character hex string (32 bytes)', () => {
      const key = generateEncryptionKey();

      expect(typeof key).toBe('string');
      expect(key.length).toBe(64); // 32 bytes * 2 hex chars per byte
      expect(key).toMatch(/^[0-9a-f]{64}$/); // Only hex characters
    });

    it('should generate different keys each time', () => {
      const key1 = generateEncryptionKey();
      const key2 = generateEncryptionKey();
      const key3 = generateEncryptionKey();

      expect(key1).not.toBe(key2);
      expect(key2).not.toBe(key3);
      expect(key1).not.toBe(key3);
    });
  });

  describe('Integration: Encrypt/Decrypt Large File', () => {
    it('should handle large files (1MB)', () => {
      // Create 1MB buffer
      const largeBuffer = Buffer.alloc(1024 * 1024, 'a');

      const encrypted = encryptDocument(largeBuffer);
      const decrypted = decryptDocument(encrypted);

      expect(decrypted).toEqual(largeBuffer);
    });
  });
});
