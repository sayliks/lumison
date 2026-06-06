/**
 * ID3 Tag Lyrics Parser
 * Extracts embedded lyrics from audio files (MP3, FLAC, etc.)
 * Supports:
 * - ID3v2 USLT (Unsynchronized Lyrics)
 * - ID3v2 SYLT (Synchronized Lyrics)
 * - FLAC Vorbis Comments (LYRICS tag)
 */

import { LyricLine } from './types';
import { parseLyrics } from './index';

import jsmediatags from 'jsmediatags';

export interface AudioTagExtractionResult {
  title?: string;
  artist?: string;
  picture?: string;
  lyrics: LyricLine[];
  source: 'id3' | 'flac' | 'none';
}

const extractPictureFromTags = (tags: any): string | undefined => {
  if (!tags?.picture?.data || !tags?.picture?.format) {
    return undefined;
  }

  try {
    const { data, format } = tags.picture;
    // Use Uint8Array + TextDecoder-safe approach via Blob URL to handle
    // arbitrary binary data without btoa's Latin-1 restriction
    const uint8 = new Uint8Array(data);
    const blob = new Blob([uint8], { type: format });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn('Failed to extract cover art from tags:', error);
    return undefined;
  }
};

const extractLyricsFromTags = (tags: any, fileName: string): { lyrics: LyricLine[]; source: 'id3' | 'flac' | 'none' } => {
  // Try USLT (Unsynchronized Lyrics) - most common
  if (tags.USLT) {
    const usltData = Array.isArray(tags.USLT) ? tags.USLT[0] : tags.USLT;
    // jsmediatags returns USLT as { lyrics, description, language } or as a plain string
    const lyricsText =
      (typeof usltData === 'object' ? (usltData.lyrics ?? usltData.text ?? usltData.data) : usltData);

    if (typeof lyricsText === 'string' && lyricsText.trim()) {
      console.log(`✓ Found ID3 USLT lyrics in: ${fileName}`);
      return { lyrics: parseLyrics(lyricsText), source: 'id3' };
    }
  }

  // Try SYLT (Synchronized Lyrics)
  if (tags.SYLT) {
    const syltData = Array.isArray(tags.SYLT) ? tags.SYLT[0] : tags.SYLT;
    const lyrics = parseSYLT(syltData);

    if (lyrics.length > 0) {
      console.log(`✓ Found ID3 SYLT synchronized lyrics in: ${fileName}`);
      return { lyrics, source: 'id3' };
    }
  }

  // Try generic LYRICS tag (some taggers use this)
  if (tags.LYRICS) {
    const lyricsText = tags.LYRICS;
    if (typeof lyricsText === 'string' && lyricsText.trim()) {
      console.log(`✓ Found ID3 LYRICS tag in: ${fileName}`);
      return { lyrics: parseLyrics(lyricsText), source: 'id3' };
    }
  }

  // Try Vorbis Comments (FLAC)
  if (tags.comment && typeof tags.comment === 'object') {
    const comment = tags.comment as any;

    // Check for LYRICS field
    if (comment.LYRICS) {
      const lyricsText = Array.isArray(comment.LYRICS)
        ? comment.LYRICS[0]
        : comment.LYRICS;

      if (typeof lyricsText === 'string' && lyricsText.trim()) {
        console.log(`✓ Found FLAC LYRICS comment in: ${fileName}`);
        return { lyrics: parseLyrics(lyricsText), source: 'flac' };
      }
    }

    // Check for UNSYNCEDLYRICS field (alternative)
    if (comment.UNSYNCEDLYRICS) {
      const lyricsText = Array.isArray(comment.UNSYNCEDLYRICS)
        ? comment.UNSYNCEDLYRICS[0]
        : comment.UNSYNCEDLYRICS;

      if (typeof lyricsText === 'string' && lyricsText.trim()) {
        console.log(`✓ Found FLAC UNSYNCEDLYRICS comment in: ${fileName}`);
        return { lyrics: parseLyrics(lyricsText), source: 'flac' };
      }
    }
  }

  return { lyrics: [], source: 'none' };
};

export const extractAudioTagData = async (
  file: File
): Promise<AudioTagExtractionResult> => {
  try {
    if (!jsmediatags || typeof jsmediatags.read !== 'function') {
      console.warn('jsmediatags not properly loaded');
      return { lyrics: [], source: 'none' };
    }

    const timeoutPromise = new Promise<AudioTagExtractionResult>((resolve) => {
      setTimeout(() => {
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
        console.warn(`Local metadata parsing timeout (10s) for: ${file.name} (${fileSizeMB}MB). Skipping embedded lyrics.`);
        resolve({ lyrics: [], source: 'none' });
      }, 10000);
    });

    const parsePromise = new Promise<AudioTagExtractionResult>((resolve) => {
      jsmediatags.read(file, {
        onSuccess: (tag: any) => {
          const tags = tag.tags;

          const { lyrics, source } = extractLyricsFromTags(tags, file.name);

          resolve({
            title: tags.title,
            artist: tags.artist,
            picture: extractPictureFromTags(tags),
            lyrics,
            source,
          });
        },
        onError: (error: any) => {
          console.warn(`ID3 tag reading failed for ${file.name}:`, error.type || error);
          resolve({ lyrics: [], source: 'none' });
        },
      });
    });

    return await Promise.race([parsePromise, timeoutPromise]);
  } catch (error) {
    console.warn(`jsmediatags error for ${file.name}:`, error);
    return { lyrics: [], source: 'none' };
  }
};

/**
 * Extract lyrics from audio file metadata
 * Uses jsmediatags library for ID3 parsing
 * Optimized with timeout and better error handling
 */
export const extractEmbeddedLyrics = async (
  file: File
): Promise<{ lyrics: LyricLine[]; source: 'id3' | 'flac' | 'none' }> => {
  const result = await extractAudioTagData(file);
  return { lyrics: result.lyrics, source: result.source };
};

/**
 * Parse SYLT (Synchronized Lyrics) format
 * SYLT contains time-stamped lyrics
 */
const parseSYLT = (syltData: any): LyricLine[] => {
  try {
    if (!syltData || !syltData.lyrics) {
      return [];
    }

    const lyrics: LyricLine[] = [];
    const syltLyrics = Array.isArray(syltData.lyrics)
      ? syltData.lyrics
      : [syltData.lyrics];

    for (const item of syltLyrics) {
      if (item.text && typeof item.timestamp === 'number') {
        // SYLT timestamps are in milliseconds
        const timeInSeconds = item.timestamp / 1000;
        lyrics.push({
          time: timeInSeconds,
          text: item.text.trim(),
          isPreciseTiming: true,
        });
      }
    }

    // Sort by time
    lyrics.sort((a, b) => a.time - b.time);

    return lyrics;
  } catch (error) {
    console.warn('Failed to parse SYLT data:', error);
    return [];
  }
};

