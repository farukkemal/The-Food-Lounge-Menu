import { memo, useEffect, useRef, useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';

const LazyImage = memo(function LazyImage({
  src,
  alt,
  width,
  height,
  sizes,
  className = '',
  containerClassName = '',
  priority = false,
  fallbackIconSize = 22,
}) {
  const imgRef = useRef(null);
  const [status, setStatus] = useState(src ? 'loading' : 'empty');

  useEffect(() => {
    if (!src) {
      setStatus('empty');
      return;
    }
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setStatus('loaded');
    } else {
      setStatus('loading');
    }
  }, [src]);

  if (!src || status === 'error' || status === 'empty') {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden bg-[#ECE9E3] text-[#A8A29A] ${containerClassName}`}
        aria-hidden="true"
      >
        <UtensilsCrossed size={fallbackIconSize} strokeWidth={1.6} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-[#ECE9E3] ${containerClassName}`}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        draggable={false}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'low'}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        className={`h-full w-full object-cover transition-opacity duration-200 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
});

export default LazyImage;
