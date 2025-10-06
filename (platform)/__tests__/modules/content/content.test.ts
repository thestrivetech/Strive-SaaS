import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { generateUniqueSlug, validateSEO, generateExcerpt, extractKeywords } from '@/lib/modules/content/content/helpers';

/**
 * Content Module Tests
 *
 * Tests for content management functionality including:
 * - Slug generation and uniqueness
 * - SEO validation
 * - Content helpers
 */

describe('Content Module - Helpers', () => {
  describe('generateExcerpt', () => {
    it('should generate excerpt from plain text', () => {
      const content = 'This is a test article with some content that goes beyond 160 characters. ' +
        'It should be trimmed to a reasonable length at a word boundary.';

      const excerpt = generateExcerpt(content, 50);

      expect(excerpt.length).toBeLessThanOrEqual(53); // 50 + '...'
      expect(excerpt.endsWith('...')).toBe(true);
      expect(excerpt).toContain('test article');
    });

    it('should strip HTML tags from content', () => {
      const content = '<p>This is <strong>HTML</strong> content</p>';
      const excerpt = generateExcerpt(content, 100);

      expect(excerpt).toBe('This is HTML content');
      expect(excerpt).not.toContain('<p>');
      expect(excerpt).not.toContain('<strong>');
    });

    it('should return content as-is if under max length', () => {
      const content = 'Short content';
      const excerpt = generateExcerpt(content, 100);

      expect(excerpt).toBe('Short content');
      expect(excerpt.endsWith('...')).toBe(false);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from content', () => {
      const content = 'Real estate investment property management landlord tenant lease ' +
        'rental property investment property real estate';

      const keywords = extractKeywords(content, 5);

      expect(keywords).toBeInstanceOf(Array);
      expect(keywords.length).toBeLessThanOrEqual(5);
      expect(keywords).toContain('property');
      expect(keywords).toContain('investment');
    });

    it('should filter out short words', () => {
      const content = 'The cat sat on the mat and ate the food';
      const keywords = extractKeywords(content, 10);

      // Words like 'the', 'cat', 'sat', 'on', 'mat', 'and', 'ate' should be filtered (length <= 4)
      keywords.forEach(word => {
        expect(word.length).toBeGreaterThan(4);
      });
    });

    it('should return empty array for empty content', () => {
      const keywords = extractKeywords('', 10);
      expect(keywords).toEqual([]);
    });
  });

  describe('validateSEO', () => {
    it('should validate SEO fields and return no issues for valid content', () => {
      // Create content with 300+ words (each repeat = 5 words, 60 repeats = 300 words)
      const contentBody = 'This is the content body text. '.repeat(60);

      const content = {
        title: 'Test Article',
        metaTitle: 'Test Article - Great Content',
        metaDescription: 'This is a great test article about testing with enough characters to pass validation.',
        keywords: ['test', 'article', 'content', 'validation'],
        content: contentBody,
      };

      const result = validateSEO(content);

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.score).toBe(100);
    });

    it('should flag missing meta description', () => {
      const content = {
        title: 'Test',
        metaTitle: 'Test Article',
        keywords: ['test'],
        content: 'Content body. '.repeat(50),
      };

      const result = validateSEO(content);

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Meta description is missing (highly recommended for SEO)');
    });

    it('should flag meta title too long', () => {
      const content = {
        title: 'Test',
        metaTitle: 'This is a very long meta title that exceeds 60 characters limit',
        metaDescription: 'Valid description with enough characters to pass.',
        keywords: ['test'],
        content: 'Content body. '.repeat(50),
      };

      const result = validateSEO(content);

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Meta title exceeds 60 characters');
    });

    it('should flag short content', () => {
      const content = {
        title: 'Test',
        metaTitle: 'Test Article',
        metaDescription: 'Valid description with enough characters.',
        keywords: ['test'],
        content: 'Short content',
      };

      const result = validateSEO(content);

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Content is too short (minimum 300 words recommended for SEO)');
    });

    it('should flag missing keywords', () => {
      const content = {
        title: 'Test',
        metaTitle: 'Test Article',
        metaDescription: 'Valid description with enough characters.',
        keywords: [],
        content: 'Content body. '.repeat(50),
      };

      const result = validateSEO(content);

      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('No keywords defined (recommended for SEO)');
    });

    it('should calculate score based on issues', () => {
      const content = {
        title: 'Test',
        keywords: [],
        content: 'Short',
      };

      const result = validateSEO(content);

      // 3 issues: missing description, no keywords, short content
      expect(result.score).toBe(40); // 100 - (3 * 20)
    });
  });
});

describe('Content Module - Integration Tests', () => {
  // Note: These tests would require mocking Prisma client
  // For now, we're testing the logic-only functions above

  it('should be structured for future integration tests', () => {
    expect(true).toBe(true);
  });
});
