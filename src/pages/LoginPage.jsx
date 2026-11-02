import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../features/auth/AuthContext';
import { useGoogleSignIn } from '../features/auth/useGoogleSignIn';
import { loginWithGoogle } from '../features/auth/auth.api';
import { env } from '../config/env';
import { setTokens } from '../utils/tokenStorage';
import { Button } from '../components/ui/Button';
import { Field, Input, Textarea } from '../components/ui/Field';
import { toast } from '../lib/toast';

export function LoginPage() {
  const { isAuthenticated, bootstrapping, login, refreshUser } = useAuth();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/events';

  // Đổi Google ID token -> AuthTokens -> set phiên.
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
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">🎟️</div>
          <h1 className="text-xl font-semibold text-slate-800">HCMUT Events</h1>
          <p className="mt-1 text-sm text-slate-500">
            Đăng nhập bằng tài khoản trường (@hcmut.edu.vn)
          </p>
        </div>

        {/* Nút Google chính chủ (A26) */}
        {googleAvailable ? (
          <div className="flex justify-center">
            {googleLogin.isPending ? (
              <Button loading disabled>
                Đang đăng nhập…
              </Button>
            ) : (
              <div ref={buttonRef} />
            )}
          </div>
        ) : (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
            Chưa cấu hình <code>VITE_GOOGLE_CLIENT_ID</code> — dùng đăng nhập dev bên dưới.
          </p>
        )}

        {env.enableDevLogin && (
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
        )}
      </div>
    </div>
  );
}

/** Panel chỉ dành cho dev khi test với backend local. */
function DevLoginPanel({ onIdToken, onDirectTokens, busy }) {
  const [tab, setTab] = useState('idToken');
  const [idToken, setIdToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [submitting, setSubmitting] = useState(false);

  return (
    <div className="mt-6 border-t border-dashed border-slate-200 pt-5">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
        Đăng nhập dev (local)
      </p>

      <div className="mb-3 flex gap-1 rounded-lg bg-slate-100 p-1 text-xs">
        <button
          className={`flex-1 rounded-md py-1.5 ${tab === 'idToken' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
          onClick={() => setTab('idToken')}
        >
          Google ID token
        </button>
        <button
          className={`flex-1 rounded-md py-1.5 ${tab === 'direct' ? 'bg-white shadow-sm' : 'text-slate-500'}`}
          onClick={() => setTab('direct')}
        >
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
