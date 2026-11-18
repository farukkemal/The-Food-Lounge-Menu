import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Printer,
  Globe,
  Hash,
} from 'lucide-react';

function normalizeBaseUrl(raw) {
  const trimmed = String(raw || '').trim();
  if (!trimmed) return window.location.origin;
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProto.replace(/\/+$/, '');
}

async function generateBrandedCardPng(qrDataUrl, label, targetUrl) {
  const width = 640;
  const height = 820;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Card background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Top crimson accent bar
  ctx.fillStyle = '#CA2F2D';
  ctx.fillRect(0, 0, width, 16);

  // Brand title
  ctx.fillStyle = '#181716';
  ctx.font = 'bold 38px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE FOOD LOUNGE', width / 2, 82);

  ctx.fillStyle = '#7A746C';
  ctx.font = '600 18px system-ui, -apple-system, sans-serif';
  ctx.fillText('DİJİTAL QR MENÜ', width / 2, 114);

  // QR Image
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = qrDataUrl;
  });

  const qrSize = 440;
  const qrX = (width - qrSize) / 2;
  const qrY = 148;

  // Subtle frame around QR
  ctx.strokeStyle = '#EAE6DF';
  ctx.lineWidth = 3;
  ctx.strokeRect(qrX - 18, qrY - 18, qrSize + 36, qrSize + 36);
  ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

  // Table badge pill
  const pillW = 280;
  const pillH = 62;
  const pillX = (width - pillW) / 2;
  const pillY = 636;
  ctx.fillStyle = '#181716';
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 31);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
  ctx.fillText(label.toLocaleUpperCase('tr-TR'), width / 2, pillY + 41);

  // Footer instructions
  ctx.fillStyle = '#6B665F';
  ctx.font = '500 18px system-ui, -apple-system, sans-serif';
  ctx.fillText('Menüyü görmek için telefon kameranızla okutun', width / 2, 744);

  ctx.fillStyle = '#A09990';
  ctx.font = '400 14px system-ui, -apple-system, sans-serif';
  ctx.fillText(targetUrl, width / 2, 778);

  return canvas.toDataURL('image/png');
}

const QrTableCard = memo(function QrTableCard({ entry, onNotify }) {
  const [dataUrl, setDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(entry.url, {
      width: 480,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#181716',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch(() => {
        if (active) setDataUrl('');
      });

    return () => {
      active = false;
    };
  }, [entry.url]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.url);
      setCopied(true);
      onNotify?.(`${entry.label} bağlantısı kopyalandı.`);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      onNotify?.('Bağlantı kopyalanamadı.', 'error');
    }
  };

  const handleDownloadPng = async () => {
    if (!dataUrl) return;
    try {
      const cardPng = await generateBrandedCardPng(dataUrl, entry.label, entry.url);
      const a = document.createElement('a');
      a.href = cardPng;
      a.download = `the-food-lounge-${entry.fileSlug}.png`;
      a.click();
      onNotify?.(`${entry.label} QR kartı indirildi.`);
    } catch {
      onNotify?.('QR görseli oluşturulamadı.', 'error');
    }
  };

  return (
    <div className="print-qr-card flex flex-col items-center rounded-2xl border border-[#EAE6DF] bg-white p-4 text-center shadow-2xs">
      <div className="mb-2 flex w-full items-center justify-between">
        <span className="rounded-full bg-[#181716] px-2.5 py-0.5 text-[11px] font-bold text-white">
          {entry.label}
        </span>
        <span className="text-[10px] font-semibold tracking-wider text-[#CA2F2D] uppercase">
          QR Menü
        </span>
      </div>

      <div className="my-2 flex aspect-square w-full max-w-[180px] items-center justify-center overflow-hidden rounded-xl border border-[#F0ECE5] bg-white p-2">
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`${entry.label} QR Kodu`}
            width={180}
            height={180}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="h-full w-full animate-pulse rounded-lg bg-[#F2EFE9]" />
        )}
      </div>

      <p className="w-full truncate text-[11px] font-medium text-[#7C766E]" title={entry.url}>
        {entry.url}
      </p>

      <div className="no-print mt-3 flex w-full items-center gap-1.5">
        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={!dataUrl}
          className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#CA2F2D] px-2.5 py-2 text-[11px] font-bold text-white transition-all hover:bg-[#B02422] active:scale-[0.97] disabled:opacity-50"
        >
          <Download size={12} />
          PNG İndir
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] text-[#4A4641] transition-colors hover:bg-[#EFECE6]"
          title="Bağlantıyı kopyala"
          aria-label={`${entry.label} bağlantısını kopyala`}
        >
          {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
        </button>
      </div>
    </div>
  );
});

const QrCodeGenerator = memo(function QrCodeGenerator({ onNotify }) {
  const defaultOrigin =
    typeof window !== 'undefined' ? window.location.origin : 'https://thefoodlounge.com';

  const [baseUrl, setBaseUrl] = useState(defaultOrigin);
  const [mode, setMode] = useState('batch'); // 'single' | 'batch'
  const [singleTable, setSingleTable] = useState('1');
  const [startTable, setStartTable] = useState(1);
  const [endTable, setEndTable] = useState(12);

  const normalizedUrl = useMemo(() => normalizeBaseUrl(baseUrl), [baseUrl]);

  const entries = useMemo(() => {
    if (mode === 'single') {
      const clean = String(singleTable || '').trim();
      if (!clean) {
        return [
          {
            id: 'general',
            label: 'Genel Menü',
            fileSlug: 'genel-menu',
            url: `${normalizedUrl}/`,
          },
        ];
      }
      return [
        {
          id: `table-${clean}`,
          label: `Masa ${clean}`,
          fileSlug: `masa-${clean.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          url: `${normalizedUrl}/?table=${encodeURIComponent(clean)}`,
        },
      ];
    }

    const from = Math.max(1, Math.min(200, Number(startTable) || 1));
    const to = Math.max(from, Math.min(from + 49, Number(endTable) || from));
    const list = [];
    for (let n = from; n <= to; n += 1) {
      list.push({
        id: `table-${n}`,
        label: `Masa ${n}`,
        fileSlug: `masa-${n}`,
        url: `${normalizedUrl}/?table=${n}`,
      });
    }
    return list;
  }, [mode, singleTable, startTable, endTable, normalizedUrl]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="space-y-4">
      {/* Controls Card */}
      <div className="no-print rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-2xs sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F2EFEA] pb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#CA2F2D]/10 text-[#CA2F2D]">
              <QrCode size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#181716]">
                Masa QR Kod Üreteci
              </h3>
              <p className="text-[11px] text-[#7C766E]">
                Masalara özel `?table=` bağlantılı yüksek çözünürlüklü baskı kartları oluşturun.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#181716] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#CA2F2D] active:scale-[0.98]"
          >
            <Printer size={14} />
            Tümünü Yazdır ({entries.length})
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-12">
          {/* Base Domain */}
          <div className="sm:col-span-6">
            <label className="mb-1 block text-xs font-semibold text-[#4A4641]">
              Alan Adı / Menü URL
            </label>
            <div className="relative">
              <Globe
                size={14}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#9A938A]"
              />
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://thefoodlounge.com"
                className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] pr-3 pl-9 text-xs font-medium text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
              />
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setBaseUrl(defaultOrigin)}
                className="rounded-lg bg-[#F3F1EC] px-2 py-0.5 text-[10.5px] font-semibold text-[#5E5850] hover:bg-[#E7E3DC]"
              >
                Mevcut Adres
              </button>
              <button
                type="button"
                onClick={() => setBaseUrl('https://thefoodlounge.com')}
                className="rounded-lg bg-[#F3F1EC] px-2 py-0.5 text-[10.5px] font-semibold text-[#5E5850] hover:bg-[#E7E3DC]"
              >
                thefoodlounge.com
              </button>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="sm:col-span-3">
            <label className="mb-1 block text-xs font-semibold text-[#4A4641]">
              Üretim Modu
            </label>
            <div className="grid h-10 grid-cols-2 rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] p-1">
              <button
                type="button"
                onClick={() => setMode('batch')}
                className={`rounded-lg text-xs font-bold transition-all ${
                  mode === 'batch'
                    ? 'bg-[#181716] text-white shadow-2xs'
                    : 'text-[#6B665F]'
                }`}
              >
                Toplu
              </button>
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`rounded-lg text-xs font-bold transition-all ${
                  mode === 'single'
                    ? 'bg-[#181716] text-white shadow-2xs'
                    : 'text-[#6B665F]'
                }`}
              >
                Tek Masa
              </button>
            </div>
          </div>

          {/* Table Range or Single Input */}
          <div className="sm:col-span-3">
            {mode === 'single' ? (
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#4A4641]">
                  Masa No / Kod
                </label>
                <div className="relative">
                  <Hash
                    size={13}
                    className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#9A938A]"
                  />
                  <input
                    type="text"
                    value={singleTable}
                    onChange={(e) => setSingleTable(e.target.value)}
                    placeholder="Örn: 5 veya VIP-1"
                    className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] pr-3 pl-8 text-sm font-bold text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#4A4641]">
                  Masa Aralığı (Maks. 50)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={startTable}
                    onChange={(e) => setStartTable(e.target.value)}
                    aria-label="Başlangıç masa numarası"
                    className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-2.5 text-center text-sm font-bold text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
                  />
                  <span className="text-xs font-bold text-[#9A938A]">–</span>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={endTable}
                    onChange={(e) => setEndTable(e.target.value)}
                    aria-label="Bitiş masa numarası"
                    className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-2.5 text-center text-sm font-bold text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated QR Cards Grid */}
      <div className="print-qr-grid grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {entries.map((entry) => (
          <QrTableCard key={entry.id} entry={entry} onNotify={onNotify} />
        ))}
      </div>
    </div>
  );
});

export default QrCodeGenerator;
