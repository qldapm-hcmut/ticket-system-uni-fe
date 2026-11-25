import { Spinner } from './Spinner';

// Spec mục 7: radius 10, focus ring brand-400, active:scale, disabled opacity 60%.
const VARIANTS = {
  primary: 'bg-brand-700 text-white hover:bg-brand-600',
  secondary: 'bg-white text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50',
  ghost: 'bg-transparent text-brand-700 hover:bg-brand-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

// Large h48 / Medium h40 / Small h32 (chữ Label 13, Large 15).
const SIZES = {
  lg: 'h-12 px-5 text-[15px]',
  md: 'h-10 px-4 text-[13px]',
  sm: 'h-8 px-3 text-[13px]',
};

/**
 * Nút chuẩn: tự disable + hiện spinner khi `loading` (UX bắt buộc khi submit).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-control font-semibold transition-[color,background-color,box-shadow,transform] duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner className="h-4 w-4" />}
      {children}
    </button>
  );
}
