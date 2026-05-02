import type { AdPlatform } from '../enums/ad-platform.js';

export interface AdPlatformInfo {
  id: AdPlatform;
  label: string;
  maxHeadlineChars: number;
  maxBodyChars: number;
  maxCtaChars: number;
  supportedFormats: ReadonlyArray<'text' | 'image' | 'video' | 'carousel'>;
}

export const AD_PLATFORM_INFO: Record<AdPlatform, AdPlatformInfo> = {
  google: {
    id: 'google',
    label: 'Google Ads',
    maxHeadlineChars: 30,
    maxBodyChars: 90,
    maxCtaChars: 15,
    supportedFormats: ['text', 'image', 'video'],
  },
  meta: {
    id: 'meta',
    label: 'Meta (Facebook/Instagram)',
    maxHeadlineChars: 40,
    maxBodyChars: 125,
    maxCtaChars: 20,
    supportedFormats: ['text', 'image', 'video', 'carousel'],
  },
  twitter: {
    id: 'twitter',
    label: 'X (Twitter)',
    maxHeadlineChars: 50,
    maxBodyChars: 280,
    maxCtaChars: 20,
    supportedFormats: ['text', 'image', 'video'],
  },
  linkedin: {
    id: 'linkedin',
    label: 'LinkedIn Ads',
    maxHeadlineChars: 70,
    maxBodyChars: 600,
    maxCtaChars: 25,
    supportedFormats: ['text', 'image', 'video', 'carousel'],
  },
  tiktok: {
    id: 'tiktok',
    label: 'TikTok Ads',
    maxHeadlineChars: 40,
    maxBodyChars: 100,
    maxCtaChars: 20,
    supportedFormats: ['video'],
  },
  custom: {
    id: 'custom',
    label: 'Özel Platform',
    maxHeadlineChars: 100,
    maxBodyChars: 500,
    maxCtaChars: 30,
    supportedFormats: ['text', 'image', 'video', 'carousel'],
  },
};
