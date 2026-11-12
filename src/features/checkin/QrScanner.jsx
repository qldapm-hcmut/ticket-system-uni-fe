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
  const [opening, setOpening] = useState(true);

  useEffect(() => {
    let scanner;
    let disposed = false;

    // Defer setup so StrictMode can dispose its initial effect before opening a camera.
    const starting = Promise.resolve().then(async () => {
      if (disposed) return;
      if (!window.isSecureContext) {
        setError('Mở trang qua HTTPS để dùng camera quét QR. Bạn có thể dùng tab Nhập mã hoặc Danh sách.');
        return;
      }
      scanner = new Html5Qrcode(elementId, { verbose: false });
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          if (disposed || pausedRef.current) return;
          const now = Date.now();
          const last = lastRef.current;
          if (last.text === decodedText && now - last.at < 2500) return; // debounce trùng mã
          lastRef.current = { text: decodedText, at: now };
          onScanRef.current?.(decodedText);
        },
        () => {}, // lỗi giải mã từng khung hình -> bỏ qua
      );
      if (!disposed) setOpening(false);
    }).catch((err) => {
      if (disposed) return;
      setError(
        err?.name === 'NotAllowedError'
          ? 'Bạn cần cấp quyền camera để quét QR.'
          : 'Không mở được camera trên thiết bị này.',
      );
    });

    return () => {
      disposed = true;
      // start() must settle before stop(), which can throw synchronously.
      void starting.then(async () => {
        if (!scanner) return;
        if (scanner.isScanning) await scanner.stop();
        scanner.clear();
      }).catch(() => {
        /* The camera may already have been released by the browser. */
      });
    };
  }, [elementId]);

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-700">
        {error}
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-64 max-w-sm overflow-hidden rounded-xl bg-black">
      <div id={elementId} className="w-full" />
      {/* Lớp phủ khi đang gọi API: chặn thao tác + báo loading */}
      {(opening || paused) && (
        <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-white">
          <Spinner className="h-6 w-6" />
          <span className="text-sm">{opening ? 'Đang mở camera…' : 'Đang xử lý…'}</span>
        </div>
      )}
    </div>
  );
}
