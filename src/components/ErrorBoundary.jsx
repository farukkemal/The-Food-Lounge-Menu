import { Component } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Beklenmeyen bir hata oluştu.',
    };
  }

  componentDidCatch(error, info) {
    console.error('[The Food Lounge ErrorBoundary]', error, info?.componentStack);
  }

  handleReload = () => {
    try {
      window.localStorage.removeItem('tfl_menu_data_cache_v1');
    } catch {
      // ignore storage errors
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F8F7F4] px-5 text-center text-[#181716]">
          <div className="w-full max-w-sm rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#CA2F2D]">
              <AlertTriangle size={24} />
            </div>
            <h1
              className="mt-4 text-2xl font-bold text-[#181716]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Bir Sorun Oluştu
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-[#6E6962]">
              Menü görüntülenirken beklenmeyen bir hata meydana geldi. Sayfayı yenileyerek devam edebilirsiniz.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#181716] px-4 py-3 text-xs font-bold text-white transition-colors hover:bg-[#CA2F2D] active:scale-[0.98]"
            >
              <RefreshCw size={14} />
              Menüyü Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
