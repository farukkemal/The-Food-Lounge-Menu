import { memo, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

const LazyImage = memo(function LazyImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  priority = false,
  fallbackIconSize = 22,
}) {
  const [status, setStatus] = useState(src ? 'loading' : 'empty');

  if (!src || status === 'error' || status === 'empty') {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#F1EFEA] to-[#E6E2DA] text-[#A8A29A] ${containerClassName}`}
        aria-hidden="true"
      >
        <UtensilsCrossed size={fallbackIconSize} strokeWidth={1.6} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#ECE9E3] ${containerClassName}`}>
      {status === 'loading' && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#ECE9E3] via-[#F4F2ED] to-[#ECE9E3]" />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : 'low'}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
});

export default LazyImage;
