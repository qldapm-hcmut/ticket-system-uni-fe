const LOGO_ALT = 'Logo Trường Đại học Bách khoa – ĐHQG TP.HCM';

/**
 * Logo trường + (tuỳ chọn) lockup chữ "HCMUT Events".
 * @param {object} props
 * @param {number} [props.size=40]       Cạnh logo (px).
 * @param {boolean} [props.withText]     Hiện khối chữ bên cạnh logo.
 * @param {string} [props.className]
 */
export function BrandLogo({ size = 40, withText = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src="/hcmut-logo.png"
        alt={LOGO_ALT}
        style={{ height: size, width: 'auto' }}
        className="shrink-0 object-contain"
      />
      {withText && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-base font-bold leading-6 text-brand-700">HCMUT Events</span>
          <span className="truncate text-xs text-slate-500">
            Đăng ký sự kiện · ĐH Bách khoa
          </span>
        </span>
      )}
    </span>
  );
}
