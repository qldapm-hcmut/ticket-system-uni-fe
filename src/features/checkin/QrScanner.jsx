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
    let started = false;

    const starting = scanner
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
      .then(() => {
        started = true;
      })
      .catch((err) => {
        setError(
          err?.name === 'NotAllowedError'
            ? 'Bạn cần cấp quyền camera để quét QR.'
            : 'Không mở được camera trên thiết bị này.',
        );
      });

    return () => {
      // Chờ start() xong rồi mới dừng, và chỉ dừng khi camera đã chạy:
      // html5-qrcode ném lỗi đồng bộ nếu gọi stop() khi scanner chưa chạy
      // (không có camera / bị từ chối quyền), làm trắng cả trang check-in (D03).
      starting
        .then(() => {
          if (!started) return undefined;
          return scanner.stop().then(() => scanner.clear());
        })
        .catch(() => {
          /* bỏ qua lỗi khi dừng camera lúc unmount */
        });
    };
    // Chỉ khởi tạo camera một lần.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-[20px] border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-700">
        {error}
      </div>
    );
  }

  return (
    <div
      className="relative h-[300px] overflow-hidden rounded-[20px]"
      style={{ background: 'radial-gradient(circle at center, #1e293b, #020617)' }}
    >
      <div
        id={elementId}
        className="absolute inset-0 [&_video]:h-full [&_video]:w-full [&_video]:object-cover"
      />

      {/* Khung ngắm + vạch quét */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="relative h-[220px] w-[220px]">
          <span className="absolute left-0 top-0 h-6 w-6 rounded-tl-[12px] border-l-4 border-t-4 border-brand-400" />
          <span className="absolute right-0 top-0 h-6 w-6 rounded-tr-[12px] border-r-4 border-t-4 border-brand-400" />
          <span className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-[12px] border-b-4 border-l-4 border-brand-400" />
          <span className="absolute bottom-0 right-0 h-6 w-6 rounded-br-[12px] border-b-4 border-r-4 border-brand-400" />
          <div className="animate-qr-scanline absolute inset-x-2 top-0 h-0.5 rounded-full bg-brand-400 shadow-[0_0_10px_2px_rgba(20,136,219,0.7)]" />
        </div>
      </div>

      <p className="absolute inset-x-0 bottom-3 text-center text-xs text-white/80">
        Đưa mã QR vào khung · tự quét, chống trùng 2.5s
      </p>

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
