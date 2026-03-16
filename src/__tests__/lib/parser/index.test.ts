import { getFileTypeFromExt, getMimeTypeFromExt } from '@/lib/parser';

describe('parser utils', () => {
  describe('getFileTypeFromExt', () => {
    it('should return correct file type for text files', () => {
      expect(getFileTypeFromExt('.txt')).toBe('text');
      expect(getFileTypeFromExt('.md')).toBe('text');
      expect(getFileTypeFromExt('.csv')).toBe('text');
      expect(getFileTypeFromExt('.json')).toBe('text');
      expect(getFileTypeFromExt('.xml')).toBe('text');
      expect(getFileTypeFromExt('.html')).toBe('text');
      expect(getFileTypeFromExt('.htm')).toBe('text');
    });

    it('should return correct file type for spreadsheet files', () => {
      expect(getFileTypeFromExt('.xls')).toBe('spreadsheet');
      expect(getFileTypeFromExt('.xlsx')).toBe('spreadsheet');
    });

    it('should return correct file type for image files', () => {
      expect(getFileTypeFromExt('.jpg')).toBe('image');
      expect(getFileTypeFromExt('.jpeg')).toBe('image');
      expect(getFileTypeFromExt('.png')).toBe('image');
      expect(getFileTypeFromExt('.gif')).toBe('image');
      expect(getFileTypeFromExt('.bmp')).toBe('image');
      expect(getFileTypeFromExt('.webp')).toBe('image');
    });

    it('should return correct file type for audio files', () => {
      expect(getFileTypeFromExt('.mp3')).toBe('audio');
      expect(getFileTypeFromExt('.wav')).toBe('audio');
      expect(getFileTypeFromExt('.flac')).toBe('audio');
      expect(getFileTypeFromExt('.aac')).toBe('audio');
      expect(getFileTypeFromExt('.ogg')).toBe('audio');
      expect(getFileTypeFromExt('.wma')).toBe('audio');
    });

    it('should return correct file type for video files', () => {
      expect(getFileTypeFromExt('.mp4')).toBe('video');
      expect(getFileTypeFromExt('.avi')).toBe('video');
      expect(getFileTypeFromExt('.mkv')).toBe('video');
      expect(getFileTypeFromExt('.mov')).toBe('video');
      expect(getFileTypeFromExt('.wmv')).toBe('video');
      expect(getFileTypeFromExt('.flv')).toBe('video');
      expect(getFileTypeFromExt('.webm')).toBe('video');
    });

    it('should return "unknown" for unknown file types', () => {
      expect(getFileTypeFromExt('.xyz')).toBe('unknown');
      expect(getFileTypeFromExt('.exe')).toBe('unknown');
      expect(getFileTypeFromExt('.zip')).toBe('unknown');
    });

    it('should be case insensitive', () => {
      expect(getFileTypeFromExt('.TXT')).toBe('text');
      expect(getFileTypeFromExt('.JPG')).toBe('image');
      expect(getFileTypeFromExt('.MP3')).toBe('audio');
      expect(getFileTypeFromExt('.MP4')).toBe('video');
    });
  });

  describe('getMimeTypeFromExt', () => {
    it('should return correct mime type for common files', () => {
      expect(getMimeTypeFromExt('.txt')).toBe('text/plain');
      expect(getMimeTypeFromExt('.jpg')).toBe('image/jpeg');
      expect(getMimeTypeFromExt('.jpeg')).toBe('image/jpeg');
      expect(getMimeTypeFromExt('.png')).toBe('image/png');
      expect(getMimeTypeFromExt('.mp3')).toBe('audio/mpeg');
      expect(getMimeTypeFromExt('.mp4')).toBe('video/mp4');
      expect(getMimeTypeFromExt('.pdf')).toBe('application/octet-stream'); // 默认类型
    });

    it('should be case insensitive', () => {
      expect(getMimeTypeFromExt('.TXT')).toBe('text/plain');
      expect(getMimeTypeFromExt('.JPG')).toBe('image/jpeg');
    });

    it('should return default mime type for unknown extensions', () => {
      expect(getMimeTypeFromExt('.unknown')).toBe('application/octet-stream');
      expect(getMimeTypeFromExt('.xyz123')).toBe('application/octet-stream');
    });
  });
});
