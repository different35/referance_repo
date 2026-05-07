import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '../../data');
mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'swarm.db');
const sqlite = new Database(dbPath);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL,
    email_verified INTEGER DEFAULT 0, name TEXT NOT NULL,
    image TEXT, role TEXT DEFAULT 'operator',
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000)
  );
  CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
    config_schema TEXT, default_config TEXT,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000)
  );
  CREATE TABLE IF NOT EXISTS proxy_profiles (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, protocol TEXT NOT NULL,
    host TEXT NOT NULL, port INTEGER NOT NULL,
    username TEXT, password_enc TEXT,
    is_active INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000)
  );
  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY, name TEXT NOT NULL,
    state TEXT DEFAULT 'idle', mission_id TEXT NOT NULL,
    proxy_profile_id TEXT, error TEXT,
    started_at INTEGER, stopped_at INTEGER,
    created_at INTEGER DEFAULT (unixepoch() * 1000),
    updated_at INTEGER DEFAULT (unixepoch() * 1000),
    FOREIGN KEY (mission_id) REFERENCES missions(id)
  );
  CREATE TABLE IF NOT EXISTS agent_skills (
    id TEXT PRIMARY KEY, agent_id TEXT NOT NULL,
    name TEXT NOT NULL, description TEXT NOT NULL,
    prompt_template TEXT NOT NULL, required_fields TEXT,
    created_at INTEGER DEFAULT (unixepoch() * 1000)
  );
`);

const now = Date.now();

sqlite.exec(`INSERT OR IGNORE INTO users (id, email, name, email_verified, role)
  VALUES ('user-1', 'admin@swarm.local', 'Thomas', 1, 'admin');`);

sqlite.exec(`INSERT OR IGNORE INTO missions (id, name, description, config_schema, default_config) VALUES
  ('mission-strategist', 'STRATEGIST', 'Buyume Stratejisti. Verilen konu hakkinda sirketin buyume stratejisini arastir, rakip analizi yap, P&L incele, somut büyüme önerileri ve öncelikli aksiyonlar sun.', '{"topic": "stratedi konusu"}', '{"topic": "buyume"}'),
  ('mission-hey-sales', 'HEY-SALES', 'Satış Ajanı. Verilen müşteri profili için lead araştırması yap, enriched data ile scoring uygula, BANT qualification tamamla, özelleştirilmiş outreach email yaz.', '{"idealCustomerProfile": "musteri profili", "leadName": "lead adi"}', '{"idealCustomerProfile": "startup"}'),
  ('mission-youtube', 'YOUTUBE', 'YouTube Araştırmacısı. Verilen KONU üzerine YouTube içeriklerini araştır: en iyi kanallar, video sikliği/süresi/formati, like/dislike oranları, yorumlardan izleyici düsüncesi çıkart. Kendi sorularını sor ve cevapla. Sonunda SEO + içerik stratejisi raporu sun.', '{"topic": "arastirilacak konu", "channelUrl": "kanal"}', '{"topic": ""}'),
  ('mission-repurpose', 'REPURPOSE', ' içerik Dönüştürücü. Verilen video/link içeriğini farklı platformlara (Twitter thread, LinkedIn post, Instagram caption) uygun formata dönüştür. Her platform için özelleştir.', '{"sourceContent": "video/link", "targetPlatforms": "twitter,linkedin"}', '{"sourceContent": ""}'),
  ('mission-twitter', 'TWITTER', 'Twitter Büyüme Uzmanı. Verilen konu/hashtag için engagement analizi yap, en başarılı tweet yapılarını incele, viral pattern bul, içerik takvimi oluştur.', '{"topic": "konu", "analysisType": "growth/engagement"}', '{"topic": ""}'),
  ('mission-linkedin', 'LINKEDIN', 'Network Büyüme Uzmanı. Verilen konu için LinkedIn içerik stratejisi yap, en başarılı post türlerini analiz et, company page optimizasyonu öner, network büyüme roadmap sun.', '{"topic": "konu", "networkType": "personal/company"}', '{"topic": ""}'),
  ('mission-visuals', 'VISUALS', 'Visual İçerik Üreticisi. Verilen proje/ozellik için demo animasyonu veya dashboard grafik taslağı üret. Design system kurallarına uygun, deliver edilebilir çıktı sun.', '{"projectType": "demo/dashboard", "feature": "ozellik"}', '{"projectType": "demo"}'),
  ('mission-gram', 'GRAM', 'Instagram Büyüme Uzmanı. Verilen konu/ICP için Instagram içerik analizi yap, en başarılı reels formatlarını bul, hashtag stratejisi öner, audience growth raporu sun.', '{"topic": "konu", "ICP": "hedef kitle"}', '{"topic": ""}');`);

sqlite.exec(`INSERT OR IGNORE INTO activities (id, name, state, mission_id, started_at) VALUES
  ('agent-strategist', 'STRATEGIST', 'idle', 'mission-strategist',  NULL),
  ('agent-hey-sales',  'HEY-SALES',   'idle',    'mission-hey-sales',  NULL),
  ('agent-community', 'COMMUNITY', 'idle',    'mission-strategist', NULL),
  ('agent-youtube',    'YOUTUBE',     'idle',    'mission-youtube', NULL),
  ('agent-repurpose',  'REPURPOSE',   'idle',    'mission-repurpose', NULL),
  ('agent-twitter',    'TWITTER',     'idle',    'mission-twitter', NULL),
  ('agent-linkedin',   'LINKEDIN',    'idle',    'mission-linkedin', NULL),
  ('agent-visuals',    'VISUALS',     'idle',    'mission-visuals', NULL),
  ('agent-gram',       'GRAM-BETA',   'idle',    'mission-gram', NULL);`);

sqlite.exec(`INSERT OR IGNORE INTO agent_skills (id, agent_id, name, description, prompt_template, required_fields) VALUES
  ('skill-yt-channel', 'agent-youtube', 'Kanal Analizi', 'YouTube kanalinin derinlemesine metrik ve icerik analizi yap, rapor uret.', 
   'YouTube Kanal Analizi Yap\n\n1. TOPLA: video listesi, izlenme sayilari, sureleri, like/dislike/yorumlari.\n2. KALIP: video turleri arasindaki etkilesim farklarini bul.\n3. KORELASYON: Yükleme sikligi vs büyüme, video süresi vs retention iliskilerini analiz et.\n4. SORULAR: -Süre arttikca retention düser mi? -Hangi konular daha çok etkilesim alıyor? -En basarili videolar hangi özelliklere sahip?\n5. YORUM: Tekrar eden kelimeler, cozulmemis sorular, duygu skoru.\n6. RAPOR: Benchmark tablo + SWOT + Yapilmasi gerekenler.\n\nKanal: {{channelUrl}}\nKonu: {{topic}}', 
   '["channelUrl", "topic"]'),

  ('skill-yt-content', 'agent-youtube', 'İçerik Stratejisi', 'Verilen konu icin YouTube icerik stratejisi raporu uret.',
   'YouTube Icerik Stratejisi Olustur\n\n1. SEKTOR ANALIZI: Verilen konu hakkinda en basarili kanallar, video sayilari, ortalama sureleri.\n2. INSIDE: Bu konudaki en basarili 5 videonun yapisi: -Süre -Baslik kalıbı -Thumbnail stili -Hook teknigi.\n3. KALIP: Hangi alt konular daha az islenmis? Hangi trendler yukseliyor?\n4. HIPOTEZ: Konuyu X uzunlugunda/Y stiline anlatirsak Z sonucu alabiliriz.\n5. YORUM DOGRULAMA: Bu hipotezi yorumlardaki taleplerle karsilastir.\n6. RAPOR: Pazar özeti + Benchmark + SWOT + 5 somut aksiyon önerisi.\n\nKonu: {{topic}}', 
   '["topic"]'),

  ('skill-yt-rakip', 'agent-youtube', 'Rakip Analizi', 'Verilen rakip kanalin detayli analizini yap.',
   'Rakip Kanal Analizi\n\n1. VERI: Son 20 videonun metrikleri, video süreleri, yükleme tarihleri.\n2. DESEN: Hangi video türü/konusu daha çok izleniyor?\n3. SÜRE/IÇERIK: Hangi süre araliginda en yüksek etkilesim? Hangi konulara öncelik verilmis?\n4. YORUM: Yorumlarda sikca tekrar eden talepler, cozulmemis sorular.\n5. GORSEL: Thumbnail ve baslik kalıpları.\n6. SWOT + Rakiplerin yapmadigi ama yapilmasi gereken 5 sey.\n\nRakip: {{competitorName}}\nAnaliz Konusu: {{topic}}', 
   '["competitorName", "topic"]'),

  ('skill-yt-trend', 'agent-youtube', 'Trend ve Fırsat Analizi', 'Verilen konu icin trend analizi yapip yeni icerik fırsatlarini bul.',
   'YouTube Trend ve Firsat Analizi\n\n1. VERI: Son 6 ayin trend video ve kanalları.\n2. KALIP: Hangi konular yukseliyor, hangileri doygun?\n3. FIRSAT: Henuz dokunulmamis alt konular veya yeni Trend alt basliklar.\n4. YORUM: Yorumlarda en cok sorulan ama cevaplanmayan sorular? (Altin fırsat)\n5. BÖLGESEL: Lokasyona göre farkli mi?\n6. RAPOR: Trend tablo + Firsatlar + Yapilmasi gereken ilk 5 sey.\n\nKonu: {{topic}}', 
   '["topic"]'),

  ('skill-tw-growth', 'agent-twitter', 'Buyume Analizi', 'Twitter profil buyumesini analiz et ve buyume onergeleri sun.',
   'Twitter Buyume Analizi\n\n1. VERI: Son 30 gunun metrikleri, tweet performanslari.\n2. KALIP: En basarili Tweet turleri (tek görsel, thread, retweet, quote).\n3. ZAMAN: Hangi saatlerde daha çok etkilesim?\n4. HASHTAG: En etkili hashtagler ve patternleri.\n5. YORUM: Yorumlardaki talepler ve geri bildirimler.\n6. BUYUME: Profil buyumem icin yapilmasi gereken 5 sey.\n\nKullanici: {{username}}\nDonem: {{days}} gun', 
   '["username", "days"]'),

  ('skill-rep-twitter', 'agent-repurpose', 'Twitter Thread', 'Verilen video/iceriği Twitter thread olarak yeniden yaz.',
   'Twitter Thread Olustur\n\n1. VIDEODAN CIKARM: Video özeti, ana noktalar, dikkat cekici alıntılar.\n2. TWITTER DAGITIM: Ayni içerik 140+ karakterlik parcalara bol.\n3. THREAD: Her tweet 1 konu/argüman olsun, sonunda next action olsun.\n4. ENGAGEMENT: RT/Fav potansiyeli yüksek olsun.\n\nKaynak: {{sourceUrl}}\nKonu: {{topic}}', 
   '["sourceUrl", "topic"]');`);

console.log('✓ DB seeded — 9 agents + skills ready');
sqlite.close();
process.exit(0);