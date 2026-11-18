# The Food Lounge — Dijital QR Menü

**The Food Lounge** *(Koza Mah. 1655 Sok. Akbatı AVM No:6, D:3, 34538 Esenyurt/İstanbul)* için geliştirilmiş; kurumsal kırmızı açılış ekranı, tam otomatik saat bazlı akıllı öneri & kombo motoru, öne çıkarılan ürün yönetimi destekli admin paneli, masa QR kod üreteci ve 60 FPS mobil performans optimizasyonlarına sahip modern dijital QR menü uygulaması.

## Özellikler

- **Kurumsal Kimlik & İşletme Bilgileri:**
  - **İşletme:** The Food Lounge
  - **Resmi Adres:** Koza Mah. 1655 Sok. Akbatı AVM No:6, D:3, 34538 Esenyurt/İstanbul
  - **Çalışma Saatleri:** Her gün `08:00 – 24:00` (canlı açık/kapalı durum göstergesi)
- **Açılış Ekranı (Splash Screen):** Kurumsal kırmızı (`#CA2F2D`) tam ekran arka plan, merkezde The Food Lounge logosu ve modern yuvarlak loading spinner; veriler hazır olduğunda akıcı fade-out ile menüye geçiş.
- **Tam Veri Entegrasyonu (`menu_data.json`):** `25` kategori, `22` alt kategori ve `485` ürün (fiyat, açıklama, kalori, diyetetik etiketler ve WebP görseller).
- **Kilitli Otomatik Saat Bazlı Öneri & Kombo Motoru:**
  - **03:00 – 15:00 (`Sabah`):** Serpme Kahvaltı spotlight ve kahvaltı grubu ürünleri.
  - **15:00 – 19:00 (`Öğle`):** Dünya mutfağı makarnaları, atıştırmalıklar ve ana yemekler.
  - **19:00 – 00:00 (`Akşam`):** Alkollü Mekan & Dünya Mutfağı kombinasyonları — dinamik fiyat hesaplamalı **İmza Kokteyl + Özel Soslu Biftek/Steak** komboları (`%10` avantaj ve özel tavsiye rozetleri).
  - Üstteki `Sabah / Öğle / Akşam` göstergesi **salt okunur (read-only)** olup yalnızca sistem saatine (`new Date().getHours()`) göre otomatik güncellenir.
- **Yönetim Paneli (`/admin` — `admin` / `admin123`):**
  - **Öne Çıkarılan Ürünler (`Öne Çıkar / Featured`):** Her ürün satırından veya düzenleme penceresinden tek tıkla ürün öne çıkarılabilir; seçili ürün varsa müşteri ekranında "Günün Önerisi / Öne Çıkanlar" alanında öncelikli sergilenir, yoksa otomatik saat kuralı çalışır.
  - **Canlı CRUD & Satır İçi Fiyat Güncelleme:** Fiyat, ad, açıklama, görsel, pasife alma/silme ve kategori yönetimi doğrudan `menu_data.json` dosyasına (`PUT /api/menu`) yazılır ve açık müşteri sekmeleriyle canlı senkronize olur.
  - **Masa QR Kod Üreteci (`QR Kodları`):** `?table=1`, `?table=2` bağlantılı tekli/toplu QR kod üretimi, marka tasarımlı PNG masa kartı indirme ve toplu yazdırma (`@media print`).
- **60 FPS Mobil Performans & Görsel Optimizasyonu:**
  - React 19, Vite 6, Tailwind CSS v4, Admin için `React.lazy` kod bölme.
  - 25 kategori kapağı (`9.17 MB → 0.75 MB`, **%91.8 tasarruf**) ve marka logosu (`130 KB → 8.2 KB`) WebP formatında optimize edildi.
  - Native `loading="lazy"`, ilk 2–4 above-the-fold görsel için `loading="eager" fetchpriority="high"`, GPU hızlandırma (`transform: translateZ(0)`, `will-change: transform`) ve `ErrorBoundary`.

---

## Kurulum & Çalıştırma

```bash
# Bağımlılıkları kurun
npm install

# Geliştirme sunucusunu başlatın (yerel + mobil Wi-Fi)
npm run dev
```

- **Müşteri QR Menü:** `http://localhost:5173/` *(Masa testi: `http://localhost:5173/?table=5`)*
- **Admin Paneli:** `http://localhost:5173/admin` (`admin` / `admin123`)

### Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Vite geliştirme sunucusunu + canlı `menu_data.json` API katmanını başlatır |
| `npm run build` | Production derlemesini `dist/` klasörüne üretir |
| `npm run preview` | Derlenen production çıktısını yerel olarak önizler |
| `npm run scrape` | Kaynak siteden menü verilerini günceller |
| `npm run optimize:images` | Kategori kapaklarını ve logoyu WebP olarak sıkıştırır |

---

## Canlıya Alma (Vercel / Netlify)

Proje `vercel.json` ve `public/_redirects` SPA yönlendirmeleriyle tek komutta yayına hazırdır:

```bash
npx vercel --prod
```
