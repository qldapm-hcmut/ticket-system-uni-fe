import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext';
import { useGoogleSignIn } from '../features/auth/useGoogleSignIn';
import { loginWithGoogle } from '../features/auth/auth.api';
import { env } from '../config/env';
import { setTokens } from '../utils/tokenStorage';
import { Button } from '../components/ui/Button';
import { Field, Input, Textarea } from '../components/ui/Field';
import { BrandLogo } from '../components/ui/BrandLogo';
import { toast } from '../lib/toast';

export function LoginPage() {
  const { isAuthenticated, bootstrapping, login, refreshUser } = useAuth();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/events';
  const [showDev, setShowDev] = useState(false);

  // Đổi Google ID token -> AuthTokens -> set phiên. (Logic giữ nguyên)
  const googleLogin = useMutation({
    mutationFn: (idToken) => loginWithGoogle(idToken),
    meta: { skipGlobalError: true },
    onSuccess: (tokens) => login(tokens),
    onError: (err) => toast.apiError(err),
  });

  const { buttonRef, available: googleAvailable } = useGoogleSignIn({
    onCredential: (idToken) => googleLogin.mutate(idToken),
    disabled: googleLogin.isPending,
  });

  if (bootstrapping) return null;
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  return (
    <div className="min-h-screen lg:flex lg:items-center lg:justify-center lg:bg-brand-hero lg:p-6">
      <div className="overflow-hidden lg:w-full lg:max-w-md lg:rounded-[28px] lg:bg-white lg:shadow-e2">
        {/* Hero */}
        <div className="bg-brand-hero px-6 pb-16 pt-20 text-center lg:pt-14">
          <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-[32px] bg-white shadow-e2">
            <BrandLogo size={76} />
          </div>
          <h1 className="text-[32px] font-bold leading-10 tracking-tight text-white">
            HCMUT Events
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-[15px] leading-[22px] text-white/85">
            Khám phá, đăng ký và check-in sự kiện của Trường ĐH Bách khoa – ĐHQG TP.HCM
          </p>
        </div>

        {/* Sheet */}
        <div className="-mt-7 rounded-t-[28px] bg-white px-6 pb-10 pt-8 lg:mt-0 lg:rounded-none lg:pb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Đăng nhập</h2>
          <p className="mt-2 text-[13px] leading-[18px] text-slate-500">
            Dùng tài khoản trường @hcmut.edu.vn. Vai trò (Sinh viên / Ban tổ chức / Admin) được lấy
            tự động sau khi đăng nhập.
          </p>

          {/* Nút Google chính chủ (A26) */}
          <div className="mt-5">
            {googleAvailable ? (
              googleLogin.isPending ? (
                <Button loading disabled size="lg" className="w-full">
                  Đang đăng nhập…
                </Button>
              ) : (
                <div ref={buttonRef} className="flex justify-center" />
              )
            ) : (
              <div className="rounded-control bg-amber-50 px-3 py-2.5 text-center text-xs text-amber-700">
                Chưa cấu hình <code>VITE_GOOGLE_CLIENT_ID</code> — dùng đăng nhập dev bên dưới.
              </div>
            )}
          </div>

          {env.enableDevLogin && (
            <div className="mt-6">
              <Divider label="Môi trường dev" />
              <div className="mt-4">
                {showDev ? (
                  <DevLoginPanel
                    onIdToken={(idToken) => googleLogin.mutate(idToken)}
                    onDirectTokens={async (tokens) => {
                      setTokens(tokens);
                      try {
                        await refreshUser();
                      } catch (err) {
                        toast.apiError(err);
                      }
                    }}
                    busy={googleLogin.isPending}
                  />
                ) : (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    onClick={() => setShowDev(true)}
                  >
                    Dán access token để test
                  </Button>
                )}
              </div>
            </div>
          )}

          <p className="mt-5 flex items-center justify-center gap-1.5 text-[13px] text-slate-500">
            <ShieldCheck size={16} className="text-emerald-600" aria-hidden="true" />
            Không lưu mật khẩu · Phiên 15 phút, tự gia hạn
          </p>
        </div>
      </div>
    </div>
  );
}

function Divider({ label }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-slate-200" />
      <span className="text-xs text-slate-400">{label}</span>
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

/** Panel chỉ dành cho dev khi test với backend local. (Logic giữ nguyên) */
function DevLoginPanel({ onIdToken, onDirectTokens, busy }) {
  const [tab, setTab] = useState('idToken');
  const [idToken, setIdToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const tabClass = (active) =>
    `flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
      active ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'
    }`;

  return (
    <div className="rounded-card border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex gap-1 rounded-lg bg-slate-100 p-1">
        <button type="button" className={tabClass(tab === 'idToken')} onClick={() => setTab('idToken')}>
          Google ID token
        </button>
        <button type="button" className={tabClass(tab === 'direct')} onClick={() => setTab('direct')}>
          Dán token trực tiếp
        </button>
      </div>

      {tab === 'idToken' ? (
        <div className="space-y-3">
          <Field label="Google ID token" hint="Gửi lên POST /auth/google như nút Google thật.">
            <Textarea
              rows={3}
              value={idToken}
              onChange={(e) => setIdToken(e.target.value)}
              placeholder="eyJhbGciOi..."
            />
          </Field>
          <Button
            className="w-full"
            loading={busy}
            disabled={!idToken.trim()}
            onClick={() => onIdToken(idToken.trim())}
          >
            Đăng nhập
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Field label="Access token">
            <Input value={accessToken} onChange={(e) => setAccessToken(e.target.value)} />
          </Field>
          <Field label="Refresh token">
            <Input value={refreshToken} onChange={(e) => setRefreshToken(e.target.value)} />
          </Field>
          <Button
            className="w-full"
            loading={submitting}
            disabled={!accessToken.trim()}
            onClick={async () => {
              setSubmitting(true);
              await onDirectTokens({
                accessToken: accessToken.trim(),
                refreshToken: refreshToken.trim(),
              });
              setSubmitting(false);
            }}
          >
            Vào hệ thống
          </Button>
        </div>
      )}
    </div>
  );
}
