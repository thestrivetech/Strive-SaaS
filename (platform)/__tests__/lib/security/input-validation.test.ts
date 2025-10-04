import {
  sanitizeHtml,
  sanitizeRichText,
  stripHtml,
  sanitizeText,
  escapeHtml,
  validateFile,
  validateUrl,
  containsSqlInjectionPattern,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZES,
} from '@/lib/security/input-validation';

describe('Input Validation & Sanitization', () => {
  describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
      const input = '<p>Hello <strong>World</strong>!</p>';
      const output = sanitizeHtml(input);
      expect(output).toBe('<p>Hello <strong>World</strong>!</p>');
    });

    it('should remove script tags (XSS prevention)', () => {
      const input = '<script>alert("xss")</script><p>Safe content</p>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain('<script>');
      expect(output).not.toContain('alert');
      expect(output).toContain('Safe content');
    });

    it('should remove dangerous attributes', () => {
      const input = '<p onclick="alert(\'xss\')">Click me</p>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain('onclick');
    });

    it('should allow safe links', () => {
      const input = '<a href="https://example.com">Link</a>';
      const output = sanitizeHtml(input);
      expect(output).toContain('href="https://example.com"');
    });

    it('should block javascript: URLs', () => {
      const input = '<a href="javascript:alert(\'xss\')">Bad Link</a>';
      const output = sanitizeHtml(input);
      expect(output).not.toContain('javascript:');
    });
  });

  describe('sanitizeRichText', () => {
    it('should allow rich text formatting', () => {
      const input = '<h1>Title</h1><blockquote>Quote</blockquote><code>code</code>';
      const output = sanitizeRichText(input);
      expect(output).toContain('<h1>');
      expect(output).toContain('<blockquote>');
      expect(output).toContain('<code>');
    });

    it('should still block XSS in rich text', () => {
      const input = '<script>alert("xss")</script><h1>Title</h1>';
      const output = sanitizeRichText(input);
      expect(output).not.toContain('<script>');
      expect(output).toContain('Title');
    });
  });

  describe('stripHtml', () => {
    it('should remove all HTML tags', () => {
      const input = '<p>Hello <strong>World</strong>!</p>';
      const output = stripHtml(input);
      expect(output).toBe('Hello World!');
    });

    it('should handle nested tags', () => {
      const input = '<div><p>Nested <span>content</span></p></div>';
      const output = stripHtml(input);
      expect(output).toBe('Nested content');
    });
  });

  describe('sanitizeText', () => {
    it('should remove control characters', () => {
      const input = 'Hello\x00World\x1F!';
      const output = sanitizeText(input);
      expect(output).toBe('HelloWorld!');
    });

    it('should normalize whitespace', () => {
      const input = 'Hello    World\n\n\n!';
      const output = sanitizeText(input);
      expect(output).toBe('Hello World !');
    });

    it('should trim leading/trailing spaces', () => {
      const input = '   Hello World   ';
      const output = sanitizeText(input);
      expect(output).toBe('Hello World');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const input = '<script>"alert"&\'test\'</script>';
      const output = escapeHtml(input);
      expect(output).toBe('&lt;script&gt;&quot;alert&quot;&amp;&#x27;test&#x27;&lt;&#x2F;script&gt;');
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });
  });

  describe('validateFile', () => {
    it('should accept valid image files', () => {
      const file = {
        name: 'photo.jpg',
        size: 1024 * 1024, // 1MB
        type: 'image/jpeg',
      };

      const result = validateFile(file, {
        allowedTypes: ALLOWED_FILE_TYPES.images,
        maxSize: MAX_FILE_SIZES.image,
      });

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files that are too large', () => {
      const file = {
        name: 'huge.jpg',
        size: 100 * 1024 * 1024, // 100MB
        type: 'image/jpeg',
      };

      const result = validateFile(file, {
        maxSize: MAX_FILE_SIZES.image, // 5MB
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('should reject disallowed file types', () => {
      const file = {
        name: 'script.exe',
        size: 1024,
        type: 'application/x-msdownload',
      };

      const result = validateFile(file, {
        allowedTypes: ALLOWED_FILE_TYPES.images,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('not allowed');
    });

    it('should reject files with mismatched extensions', () => {
      const file = {
        name: 'photo.pdf', // PDF extension
        size: 1024,
        type: 'image/jpeg', // But JPEG MIME type
      };

      const result = validateFile(file);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('does not match');
    });

    it('should accept PDF documents', () => {
      const file = {
        name: 'document.pdf',
        size: 2 * 1024 * 1024, // 2MB
        type: 'application/pdf',
      };

      const result = validateFile(file, {
        allowedTypes: ALLOWED_FILE_TYPES.documents,
      });

      expect(result.valid).toBe(true);
    });
  });

  describe('validateUrl', () => {
    it('should accept valid HTTPS URLs', () => {
      const result = validateUrl('https://example.com');
      expect(result.valid).toBe(true);
      expect(result.url).toBe('https://example.com');
    });

    it('should accept valid HTTP URLs', () => {
      const result = validateUrl('http://localhost:3000');
      expect(result.valid).toBe(true);
    });

    it('should reject javascript: URLs', () => {
      const result = validateUrl('javascript:alert("xss")');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('HTTP');
    });

    it('should reject data: URLs', () => {
      const result = validateUrl('data:text/html,<script>alert("xss")</script>');
      expect(result.valid).toBe(false);
    });

    it('should reject invalid URLs', () => {
      const result = validateUrl('not a url');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject empty strings', () => {
      const result = validateUrl('');
      expect(result.valid).toBe(false);
    });
  });

  describe('containsSqlInjectionPattern', () => {
    it('should detect SELECT statements', () => {
      expect(containsSqlInjectionPattern('SELECT * FROM users')).toBe(true);
      expect(containsSqlInjectionPattern('select * from users')).toBe(true);
    });

    it('should detect SQL comments', () => {
      expect(containsSqlInjectionPattern('test -- comment')).toBe(true);
      expect(containsSqlInjectionPattern('test /* comment */')).toBe(true);
    });

    it('should detect dangerous characters', () => {
      expect(containsSqlInjectionPattern("test' OR '1'='1")).toBe(true);
      expect(containsSqlInjectionPattern('test; DROP TABLE users')).toBe(true);
    });

    it('should allow safe input', () => {
      expect(containsSqlInjectionPattern('John Doe')).toBe(false);
      expect(containsSqlInjectionPattern('test@example.com')).toBe(false);
      expect(containsSqlInjectionPattern('My company name')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(containsSqlInjectionPattern('')).toBe(false);
    });
  });
});
