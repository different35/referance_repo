export const AD_PLATFORMS = [
  'google',
  'meta',
  'twitter',
  'linkedin',
  'tiktok',
  'custom',
] as const;

export type AdPlatform = (typeof AD_PLATFORMS)[number];

export const AD_FORMATS = ['text', 'image', 'video', 'carousel'] as const;

export type AdFormat = (typeof AD_FORMATS)[number];

export const AD_TONES = ['professional', 'casual', 'urgent', 'friendly'] as const;

export type AdTone = (typeof AD_TONES)[number];
