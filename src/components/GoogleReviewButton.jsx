import { memo } from 'react';
import { Star, ExternalLink } from 'lucide-react';

const DEFAULT_REVIEW_URL = 'https://maps.google.com/?cid=15489077177326640443';

function GoogleGIcon({ size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.08 3.56-5.15 3.56-8.65z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.28v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.38-2.29v-3.1H1.28a12 12 0 0 0 0 10.78l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.61 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4 3.1c.95-2.84 3.6-4.95 6.72-4.95z"
      />
    </svg>
  );
}

const GoogleReviewButton = memo(function GoogleReviewButton({
  href = DEFAULT_REVIEW_URL,
  variant = 'card', // 'card' (footer showcase) | 'button' (compact modal CTA)
}) {
  const reviewHref = href || DEFAULT_REVIEW_URL;

  if (variant === 'button') {
    return (
      <a
        href={reviewHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#E7E3DC] bg-white px-4 py-3 text-left shadow-2xs transition-transform duration-150 hover:border-[#FBBC05] active:scale-[0.985]"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <GoogleGIcon size={18} />
          <div className="min-w-0">
            <span className="block text-xs font-bold text-[#181716]">
              Google&apos;da Değerlendir / Yorum Bırak
            </span>
            <span className="mt-0.5 flex items-center gap-0.5 text-[10.5px] font-medium text-[#7A746C]">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  size={10}
                  className="fill-[#FBBC05] text-[#FBBC05]"
                />
              ))}
              <span className="ml-1">Görüşleriniz bizim için değerli</span>
            </span>
          </div>
        </div>
        <ExternalLink size={14} className="shrink-0 text-[#8C857C]" />
      </a>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#EAE6DF] bg-[#FAF9F6] p-4 text-center shadow-2xs">
      <div className="flex items-center justify-center gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            size={15}
            className="fill-[#FBBC05] text-[#FBBC05]"
          />
        ))}
      </div>
      <p className="mt-2 text-xs font-bold text-[#181716]">
        The Food Lounge deneyiminiz nasıldı?
      </p>
      <p className="mt-0.5 text-[11px] text-[#7A746C]">
        Bizi Google Haritalar&apos;da değerlendirerek destek olabilirsiniz.
      </p>
      <a
        href={reviewHref}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#E5E1D9] bg-white px-4 py-2.5 text-xs font-bold text-[#181716] shadow-xs transition-transform duration-150 hover:border-[#CA2F2D]/40 active:scale-[0.98]"
      >
        <GoogleGIcon size={17} />
        <span>Google&apos;da Değerlendir / Yorum Bırak</span>
        <ExternalLink size={13} className="text-[#8C857C]" />
      </a>
    </div>
  );
});

export default GoogleReviewButton;
