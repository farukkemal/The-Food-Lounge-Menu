# The Food Lounge — Dijital QR Menü

**The Food Lounge** için geliştirilmiş; mobil öncelikli, yüksek performanslı, saat bazlı akıllı öneri motoruna, canlı admin yönetim paneline ve masa bazlı QR kod üretecine sahip modern dijital QR menü uygulaması.

## Özellikler

- **Tam Veri Entegrasyonu (`menu_data.json`):** `25` kategori, `22` alt kategori ve `485` ürün (fiyat, açıklama, kalori, diyetetik etiketler, yüksek çözünürlüklü görseller ve işletme bilgileri).
- **Saat Bazlı Akıllı Öneri Motoru:**
  - **03:00 – 15:00 (Sabah / Öğle Öncesi):** *Kahvaltı Keyfi* — Serpme Kahvaltı spotlight ve seçkin kahvaltı tabakları.
  - **15:00 – 19:00 (Öğle / Akşamüstü):** *Dünya Mutfağı & Hafif Seçkiler* — Makarnalar, atıştırmalıklar, kaseler ve hafif tabaklar.
  - **19:00 – 00:00 (Akşam / Gece):** *Uyumlu Kombolar (Food & Cocktail Pairings)* — Steak çeşitleri + imza kokteyl eşleştirmeleri.
- **Yönetim Paneli (`/admin`):**
  - Yetki korumalı giriş (`admin` / `admin123`) ve tarayıcı oturumu kalıcılığı.
  - Satır içi (**inline**) anlık fiyat güncelleme, ürün ekleme/düzenleme/pasife alma/silme ve kategori yönetimi.
  - Yapılan değişiklikleri dahili API (`PUT /api/menu`) ile doğrudan `menu_data.json` dosyasına yazma ve açık müşteri sekmeleriyle `BroadcastChannel` üzerinden canlı senkronizasyon.
- **Masa QR Kod Üreteci (Admin → QR Kodları):**
  - `?table=1`, `?table=2` gibi masa parametreli tekli veya toplu (50 masaya kadar) QR kod üretimi.
  - Marka tasarımlı baskıya hazır PNG kart indirme ve tek tıkla toplu yazdırma (`@media print`).
  - Müşteri `?table=5` QR kodunu okuttuğunda üst çubukta otomatik **Masa 5** rozeti görünür.
- **Mobil 60 FPS Performans & Dayanıklılık:**
  - React 19, Vite 6, Tailwind CSS v4.
  - Admin paneli ve QR kütüphanesi için `React.lazy` kod bölme (code splitting).
  - Tüm görsellerde `loading="lazy"`, `decoding="async"`, sabit `aspect-ratio` (CLS = 0) ve kırık görsel yedeği.
  - iOS Safari & Android Chrome için momentum scrolling, `touch-action: manipulation`, safe-area desteği ve `ErrorBoundary`.

---

## Kurulum & Yerel Çalıştırma

**Gereksinimler:** Node.js `v20+` ve npm.

```bash
# 1. Bağımlılıkları kurun
npm install

# 2. Geliştirme sunucusunu başlatın (yerel + aynı Wi-Fi mobil erişim)
npm run dev
```

Varsayılan adresler:
- **Müşteri QR Menü:** `http://localhost:5173/`
- **Masa Parametreli Menü Örneği:** `http://localhost:5173/?table=5`
- **Admin Paneli:** `http://localhost:5173/admin` (`admin` / `admin123`)

### Kullanılabilir Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Vite geliştirme sunucusunu + canlı `menu_data.json` API katmanını başlatır |
| `npm run build` | Production (canlı ortam) derlemesini `dist/` klasörüne üretir |
| `npm run preview` | Derlenen production çıktısını yerel olarak önizler (`/api/menu` destekli) |
| `npm run scrape` | Kaynak siteden menü verilerini ve logoyu yeniden çekerek `menu_data.json` dosyasını günceller |

---

## Proje Yapısı

```text
├── menu_data.json                  # Tüm restoran, kategori ve 485 ürün verisi
├── scripts/
│   └── scrape-menu.mjs             # Tekrar çalıştırılabilir menü veri kazıyıcı
├── server/
│   └── menuApiPlugin.mjs           # GET/PUT /api/menu ve POST /api/auth/login katmanı
├── src/
│   ├── assets/logo.png             # The Food Lounge resmi logosu
│   ├── context/MenuContext.jsx     # Reaktif menü state & canlı sekme senkronizasyonu
│   ├── hooks/useTimeSlot.js        # Saat dilimi kontrol hook'u
│   ├── services/
│   │   ├── menuRepository.js       # İndeksleme, arama, fallback & API istemcisi
│   │   └── recommendationEngine.js # Saat bazlı öneri ve kombo motoru
│   └── components/
│       ├── ErrorBoundary.jsx       # Uygulama çökme koruma katmanı
│       ├── Header.jsx              # Logo, masa rozeti, arama ve canlı durum
│       ├── CategoryNav.jsx         # Yatay dokunmatik kategori şeridi
│       ├── SmartRecommendations.jsx# Dinamik saat bazlı öneri & kombo kartları
│       ├── CategoryShowcase.jsx    # Görsel kategori vitrini
│       ├── ProductCard.jsx         # Optimize ürün kartı
│       ├── ProductModal.jsx        # Mobil bottom-sheet ürün detayı
│       ├── InfoModal.jsx           # İşletme bilgileri & çalışma saatleri
│       ├── LazyImage.jsx           # Lazy-load, aspect-ratio ve fallback bileşeni
│       └── admin/
│           ├── AdminLogin.jsx      # Şifre korumalı giriş ekranı
│           ├── AdminDashboard.jsx  # Satır içi fiyat, CRUD ve sekmeli yönetim paneli
│           ├── ProductFormModal.jsx# Ürün ekleme & düzenleme formu
│           ├── CategoryManager.jsx # Kategori & alt kategori yönetimi
│           └── QrCodeGenerator.jsx # Masa QR kod üreteci & baskı kartı indirici
├── vercel.json                     # Vercel SPA yönlendirme yapılandırması
└── public/_redirects               # Netlify SPA yönlendirme yapılandırması
```

---

## Canlıya Alma (Deployment)

Proje **Vercel** ve **Netlify** için SPA yönlendirmeleriyle (`vercel.json` ve `public/_redirects`) doğrudan hazır durumdadır.

### Vercel ile Tek Komutta Yayınlama

```bash
npx vercel --prod
```

*(Veya GitHub reposunu Vercel'e bağlayın — Framework Preset: **Vite**, Build Command: `npm run build`, Output Directory: `dist` otomatik algılanır.)*

### Netlify ile Yayınlama

1. Repoyu Netlify'a bağlayın veya `npm run build` sonrası `dist/` klasörünü yükleyin.
2. Build Command: `npm run build` · Publish Directory: `dist`.
3. `public/_redirects` dosyası sayesinde `/admin` rotası doğrudan çalışır.

> **Canlı Ortamda Veri Kalıcılığı Notu:** Statik hosting (Vercel / Netlify) üzerinde Admin Panelindeki değişiklikler otomatik olarak tarayıcı belleğine (`localStorage`) yedeklenir ve uygulama kesintisiz çalışır. Tüm müşterilerin canlı ortamda ortak veri görmesi için `server/menuApiPlugin.mjs` içindeki `/api/menu` uç noktalarının bir veritabanına (örn. Supabase, Firebase veya Vercel KV/Postgres) bağlanması önerilir.
