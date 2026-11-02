/**
 * Field: label + control + lỗi theo field (dùng với details.fields của VALIDATION_ERROR).
 */
export function Field({ label, htmlFor, error, required, hint, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const baseControl =
  'block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-slate-100 disabled:text-slate-400';

export function Input({ className = '', ...props }) {
  return <input className={`${baseControl} ${className}`} {...props} />;
}

export function Textarea({ className = '', ...props }) {
  return <textarea className={`${baseControl} ${className}`} {...props} />;
}

export function Select({ className = '', children, ...props }) {
  return (
    <select className={`${baseControl} ${className}`} {...props}>
      {children}
    </select>
  );
}
