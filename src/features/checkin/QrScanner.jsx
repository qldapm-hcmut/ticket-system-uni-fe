import { useEffect, useId, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Spinner } from '../../components/ui/Spinner';

/**
 * Trình quét QR bằng camera (html5-qrcode).
 *
 * Chống spam request (A35):
 * - `paused` = true (đang chờ API) -> bỏ qua mọi khung hình quét được.
 * - Debounce: cùng một mã quét lại trong 2.5s sẽ bị bỏ qua.
 * Camera vẫn chạy liên tục để không giật; việc "chặn" nằm ở lớp callback.
 */
export function QrScanner({ onScan, paused }) {
  const rawId = useId();
  const elementId = `qr-reader-${rawId.replace(/[:]/g, '')}`;

  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const lastRef = useRef({ text: null, at: 0 });

  const [error, setError] = useState(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(elementId, { verbose: false });
    let stopped = false;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          if (pausedRef.current) return; // đang chờ API -> chặn
          const now = Date.now();
          const last = lastRef.current;
          if (last.text === decodedText && now - last.at < 2500) return; // debounce trùng mã
          lastRef.current = { text: decodedText, at: now };
          onScanRef.current?.(decodedText);
        },
        () => {}, // lỗi giải mã từng khung hình -> bỏ qua
      )
      .catch((err) => {
        setError(
          err?.name === 'NotAllowedError'
            ? 'Bạn cần cấp quyền camera để quét QR.'
            : 'Không mở được camera trên thiết bị này.',
        );
      });

    return () => {
      stopped = true;
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {
          /* camera có thể chưa start xong khi unmount */
        });
      void stopped;
    };
    // Chỉ khởi tạo camera một lần.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-700">
        {error}
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-sm overflow-hidden rounded-xl bg-black">
      <div id={elementId} className="w-full" />
      {/* Lớp phủ khi đang gọi API: chặn thao tác + báo loading */}
      {paused && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white">
          <Spinner className="h-6 w-6" />
          <span className="text-sm">Đang xử lý…</span>
        </div>
      )}
    </div>
  );
}
