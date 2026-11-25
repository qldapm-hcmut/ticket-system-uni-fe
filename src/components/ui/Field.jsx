/**
 * Field: label + control + lỗi theo field (dùng với details.fields của VALIDATION_ERROR).
 * Spec mục 7: label Label slate-700; field h48, radius 10, focus brand-400 + ring brand-100.
 */
export function Field({ label, htmlFor, error, required, hint, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1.5 text-[13px] text-slate-500">{hint}</p>}
      {error && <p className="mt-1.5 text-[13px] text-red-600">{error}</p>}
    </div>
  );
}

const baseControl =
  'block w-full rounded-control border border-slate-300 bg-white px-3.5 text-[15px] text-slate-800 shadow-sm transition-colors placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-slate-100 disabled:text-slate-400';

export function Input({ className = '', ...props }) {
  return <input className={`${baseControl} h-12 ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${baseControl} py-2.5 ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${baseControl} h-12 ${className}`} {...props}>
      {children}
    </select>
  );
}
