import { useEffect, useRef, useCallback } from 'react';
import { env } from '../../config/env';

/**
 * Bọc Google Identity Services (script nạp trong index.html).
 * Render nút Google chính chủ; khi user đăng nhập, trả Google ID token (credential)
 * qua callback để gửi lên POST /auth/google.
 *
 * Nếu chưa cấu hình VITE_GOOGLE_CLIENT_ID thì hook này không render gì (available=false)
 * và màn hình login dùng dev-paste thay thế.
 */
export function useGoogleSignIn({ onCredential, disabled }) {
  const buttonRef = useRef(null);
  const available = Boolean(env.googleClientId);

  const callbackRef = useRef(onCredential);
  callbackRef.current = onCredential;

  const handleCredential = useCallback((response) => {
    if (response?.credential) callbackRef.current?.(response.credential);
  }, []);

  useEffect(() => {
    if (!available || disabled) return;

    let cancelled = false;
    const tryInit = () => {
      const gsi = window.google?.accounts?.id;
      if (!gsi) return false;
      gsi.initialize({
        client_id: env.googleClientId,
        callback: handleCredential,
      });
      if (buttonRef.current) {
        buttonRef.current.innerHTML = '';
        gsi.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          locale: 'vi',
        });
      }
      return true;
    };

    // Script GIS có thể chưa tải xong — thử lại vài lần.
    if (!tryInit()) {
      const timer = setInterval(() => {
        if (cancelled || tryInit()) clearInterval(timer);
      }, 200);
      setTimeout(() => clearInterval(timer), 5000);
      return () => {
        cancelled = true;
        clearInterval(timer);
      };
    }
  }, [available, disabled, handleCredential]);

  return { buttonRef, available };
}
