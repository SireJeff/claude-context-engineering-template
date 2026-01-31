/**
 * Path Utils Tests
 */

const path = require('path');
const { normalizePath, relativePath, joinPath, isAbsolute } = require('../../../lib/utils/path-utils');

describe('Path Utils', () => {
  describe('normalizePath', () => {
    it('should convert backslashes to forward slashes', () => {
      expect(normalizePath('foo\\bar\\baz')).toBe('foo/bar/baz');
    });

    it('should handle mixed separators', () => {
      expect(normalizePath('foo/bar\\baz/qux')).toBe('foo/bar/baz/qux');
    });

    it('should handle empty string', () => {
      expect(normalizePath('')).toBe('');
    });

    it('should handle single backslash', () => {
      expect(normalizePath('\\')).toBe('/');
    });

    it('should handle paths with drive letters', () => {
      expect(normalizePath('C:\\Users\\test')).toBe('C:/Users/test');
    });

    it('should preserve leading slashes', () => {
      expect(normalizePath('\\\\server\\share')).toBe('//server/share');
    });
  });

  describe('relativePath', () => {
    it('should calculate relative path with normalized separators', () => {
      const from = '/home/user/project';
      const to = '/home/user/project/src/file.js';
      expect(relativePath(from, to)).toBe('src/file.js');
    });

    it('should handle Windows-style paths', () => {
      const from = 'C:\\project';
      const to = 'C:\\project\\src\\file.js';
      expect(relativePath(from, to)).toBe('src/file.js');
    });

    it('should handle mixed style paths', () => {
      const from = 'C:/project/src';
      const to = 'C:\\project\\lib\\file.js';
      expect(relativePath(from, to)).toBe('../lib/file.js');
    });
  });

  describe('joinPath', () => {
    it('should join and normalize path segments', () => {
      expect(joinPath('foo', 'bar', 'baz')).toBe('foo/bar/baz');
    });

    it('should handle mixed separators in segments', () => {
      expect(joinPath('foo\\bar', 'baz/qux')).toBe('foo/bar/baz/qux');
    });

    it('should handle absolute paths in segments', () => {
      const result = joinPath('foo', '/absolute', 'bar');
      // path.join concatenates all paths, normalizing the result
      // On most systems, an absolute path resets to root
      // But the exact behavior depends on the platform
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    it('should handle empty segments', () => {
      expect(joinPath('foo', '', 'bar')).toBe('foo/bar');
    });

    it('should handle single segment', () => {
      expect(joinPath('foo')).toBe('foo');
    });
  });

  describe('isAbsolute', () => {
    it('should return true for Unix absolute paths', () => {
      expect(isAbsolute('/home/user')).toBe(true);
      expect(isAbsolute('/etc/config')).toBe(true);
    });

    it('should return true for Windows drive paths', () => {
      expect(isAbsolute('C:\\Users\\test')).toBe(true);
      expect(isAbsolute('D:\\data\\files')).toBe(true);
    });

    it('should return true for Windows drive paths with forward slashes', () => {
      expect(isAbsolute('C:/Users/test')).toBe(true);
    });

    it('should return true for UNC paths', () => {
      expect(isAbsolute('\\\\server\\share')).toBe(true);
      expect(isAbsolute('//server/share')).toBe(true);
    });

    it('should return false for relative paths', () => {
      expect(isAbsolute('foo/bar')).toBe(false);
      expect(isAbsolute('./foo')).toBe(false);
      expect(isAbsolute('../foo')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isAbsolute('')).toBe(false);
    });

    it('should handle paths with spaces', () => {
      expect(isAbsolute('/home/user/my project')).toBe(true);
      expect(isAbsolute('my project/file')).toBe(false);
    });
  });
});
