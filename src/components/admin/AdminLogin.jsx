import { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import logoImg from '../../assets/logo.png';
import { authenticateAdmin, writeStoredAuth } from '../../services/menuRepository';

export default function AdminLogin({ onSuccess, onBackToMenu }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [errorTick, setErrorTick] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Lütfen kullanıcı adı ve şifre alanlarını doldurun.');
      setErrorTick((n) => n + 1);
      return;
    }

    setSubmitting(true);

    const res = await authenticateAdmin(username, password);
    setSubmitting(false);

    if (!res.ok) {
      setError(res.error || 'Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.');
      setErrorTick((n) => n + 1);
      return;
    }

    const authObj = {
      token: res.token,
      user: res.user,
      loggedInAt: new Date().toISOString(),
    };
    writeStoredAuth(authObj, remember);
    onSuccess(authObj);
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[#F6F5F1] px-4 py-10 text-[#181716]">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={onBackToMenu}
          className="mb-4 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#6B665F] transition-colors hover:bg-white hover:text-[#181716]"
        >
          <ArrowLeft size={14} />
          Müşteri Menüsüne Dön
        </button>

        <div className="overflow-hidden rounded-3xl border border-[#EAE6DF] bg-white p-6 shadow-[0_12px_36px_rgba(24,23,22,0.08)] sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="h-16 w-16 overflow-hidden rounded-2xl shadow-md ring-2 ring-[#CA2F2D]/20">
              <img
                src={logoImg}
                alt="The Food Lounge"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#CA2F2D]/10 px-3 py-1 text-[11px] font-bold tracking-wider text-[#CA2F2D] uppercase">
              <ShieldCheck size={12} />
              Yönetim Paneli
            </div>

            <h1
              className="mt-2 text-3xl font-bold text-[#181716]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The Food Lounge
            </h1>
            <p className="mt-1 text-xs text-[#7A746C]">
              Menü fiyatları, ürünler ve kategorileri yönetmek için giriş yapın.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="admin-username"
                className="mb-1.5 block text-xs font-semibold text-[#4A4641]"
              >
                Kullanıcı Adı
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#9A938A]"
                />
                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  required
                  className="h-11 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] pr-3.5 pl-10 text-sm text-[#181716] transition-all focus:border-[#CA2F2D] focus:bg-white focus:ring-2 focus:ring-[#CA2F2D]/15 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-1.5 block text-xs font-semibold text-[#4A4641]"
              >
                Şifre
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#9A938A]"
                />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="h-11 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] pr-11 pl-10 text-sm text-[#181716] transition-all focus:border-[#CA2F2D] focus:bg-white focus:ring-2 focus:ring-[#CA2F2D]/15 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-[#8C857C] hover:text-[#181716]"
                  aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs text-[#6B665F]">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-[#D8D3CA] accent-[#CA2F2D]"
              />
              <span>Bu tarayıcıda oturumu açık tut</span>
            </label>

            {error && (
              <div
                key={errorTick}
                role="alert"
                aria-live="assertive"
                className="animate-shake rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-[#CA2F2D]"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-[#181716] text-sm font-bold text-white shadow-sm transition-all hover:bg-[#CA2F2D] active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? 'Giriş yapılıyor...' : 'Yönetim Paneline Gir'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
