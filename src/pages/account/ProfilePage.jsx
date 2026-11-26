import { Mail, IdCard, Building2, LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { ROLE_LABELS } from '../../constants/roles';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(-2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-700"
        aria-hidden="true"
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="truncate text-[15px] font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

/** Trang Tài khoản (A26) — thông tin từ GET /me; chứa nút Đăng xuất (đặc biệt cho mobile). */
export function ProfilePage() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const roleBadges = user.roles ?? [];

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tài khoản</h1>

      {/* Thẻ hồ sơ */}
      <div className="mt-4 flex items-center gap-4 rounded-card border border-slate-200 bg-white p-5 shadow-e1">
        <span
          className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-xl font-bold text-brand-700"
          aria-hidden="true"
        >
          {initialsOf(user.fullName)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-slate-900">{user.fullName}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {roleBadges.length > 0 ? (
              roleBadges.map((r) => (
                <Badge key={r} tone="blue">
                  {ROLE_LABELS[r] ?? r}
                </Badge>
              ))
            ) : (
              <Badge tone="gray">Chưa có vai trò</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Thông tin chi tiết */}
      <div className="mt-4 divide-y divide-slate-100 overflow-hidden rounded-card border border-slate-200 bg-white shadow-e1">
        <InfoRow icon={Mail} label="Email" value={user.email} />
        {user.studentCode && <InfoRow icon={IdCard} label="MSSV" value={user.studentCode} />}
        {(user.units ?? []).map((u) => (
          <InfoRow
            key={u.unit.id}
            icon={Building2}
            label={`Đơn vị · ${ROLE_LABELS[u.memberRole] ?? u.memberRole}`}
            value={u.unit.name}
          />
        ))}
      </div>

      {/* Đăng xuất (hữu ích trên mobile vì header mobile không có nút) */}
      <Button
        variant="secondary"
        size="lg"
        className="mt-5 w-full"
        onClick={logout}
      >
        <LogOut size={18} aria-hidden="true" />
        Đăng xuất
      </Button>
    </div>
  );
}
