import type { AdPlatform } from '../enums/ad-platform.js';

export const POLICY_RULES: Record<AdPlatform, readonly string[]> = {
  google: [
    'Yanıltıcı veya gerçek dışı iddialar yasaktır.',
    'Telif hakkı ihlali içeren materyaller kullanılamaz.',
    'Hassas konularda (sağlık, finans) kanıt gerekir.',
    'Karşılaştırmalı reklamlar belgelenmiş olmalıdır.',
    'Çocuklara yönelik reklamlar özel kurallara tabidir.',
  ],
  meta: [
    'Kişisel özellikleri (ırk, din, cinsel yönelim) doğrudan ima eden ifadeler yasaktır.',
    'Vücut imajı ve kilo verme reklamları kısıtlıdır.',
    'Tütün, alkol, yetişkin içerik reklamları yasaktır veya kısıtlıdır.',
    'Sağlık iddiaları doğrulanabilir olmalıdır.',
    'Önce/sonra görselleri yasaktır.',
  ],
  twitter: [
    'Politik reklamlar yasaktır.',
    'Saldırgan veya nefret içerikli ifadeler yasaktır.',
    'Spam veya yanıltıcı içerik yasaktır.',
    'Manipüle edilmiş medya açıkça etiketlenmelidir.',
  ],
  linkedin: [
    'Profesyonel olmayan dil kullanılamaz.',
    'Yanıltıcı iş fırsatı vaatleri yasaktır.',
    'Kullanıcı verilerini istismar eden hedefleme yasaktır.',
    'Politik içerik kısıtlıdır.',
  ],
  tiktok: [
    'Çocuk güvenliği önceliklidir.',
    'Tehlikeli aktiviteler özendirilemez.',
    'Yanıltıcı bilgi yasaktır.',
    'Müzik ve telif hakkı kuralları sıkıdır.',
  ],
  custom: [
    'Genel etik reklamcılık kuralları geçerlidir.',
    'Yanıltıcı bilgi olmamalıdır.',
    'Telif haklarına saygı gösterilmelidir.',
  ],
};

export const POLICY_SYSTEM_PROMPT = `Sen bir reklam politikası uzmanısın. Verilen reklam içeriğini, belirtilen platform kurallarına göre değerlendir.
Her sorunu severity (error/warning/info), code (kısa kimlik), message (açıklama), field (hangi alan: headline/body/cta) ile döndür.
Hiç sorun yoksa boş array döndür. policyScore: 0-100 arası genel uyum skoru.`;
