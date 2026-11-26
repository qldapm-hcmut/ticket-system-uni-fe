import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Ticket, ClipboardList, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import { Button } from '../ui/Button';
import { BrandLogo } from '../ui/BrandLogo';

// Nav theo vai trò. Thứ tự cố định; user nhiều role được hợp mục (tối đa 5).
const NAV_ITEMS = [
  { key: 'events', to: '/events', label: 'Sự kiện', longLabel: 'Sự kiện', icon: Home },
  {
    key: 'tickets',
    to: '/my-registrations',
    label: 'Vé của tôi',
    longLabel: 'Đăng ký của tôi',
    icon: Ticket,
    requires: [ROLES.STUDENT],
  },
  {
    key: 'manage',
    to: '/manage/events',
    label: 'Quản lý',
    longLabel: 'Quản lý sự kiện',
    icon: ClipboardList,
    requires: [ROLES.ORGANIZER, ROLES.ADMIN],
  },
  {
    key: 'approve',
    to: '/admin/approvals',
    label: 'Duyệt',
    longLabel: 'Duyệt sự kiện',
    icon: ShieldCheck,
    requires: [ROLES.ADMIN],
  },
  { key: 'account', to: '/account', label: 'Tài khoản', icon: User, mobileOnly: true },
];

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  return parts
    .slice(-2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

function Avatar({ name, className = '' }) {
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-[13px] font-semibold text-brand-700 ${className}`}
      aria-hidden="true"
    >
      {initialsOf(name)}
    </span>
  );
}

function deskNavClass({ isActive }) {
  return `rounded-control px-3.5 py-2 text-[13px] font-medium transition-colors ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-100'
  }`;
}

/** Khung chung sau khi đăng nhập: header desktop + app bar/bottom nav mobile theo vai trò. */
// Route có CTA cố định ở đáy (ẩn bottom nav để CTA không chồng nav) — vd chi tiết sự kiện.
const FIXED_CTA_ROUTES = [/^\/events\/[^/]+$/];
function hasFixedBottomCta(pathname) {
  return FIXED_CTA_ROUTES.some((re) => re.test(pathname));
}

export function AppLayout() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const hideBottomNav = hasFixedBottomCta(location.pathname);
  const items = NAV_ITEMS.filter((it) => !it.requires || it.requires.some((r) => hasRole(r)));
  const roleText = (user?.roles ?? []).map((r) => ROLE_LABELS[r] ?? r).join(' · ') || '—';

  return (
    <div className="min-h-full">
      {/* ===== Header desktop (≥1024) ===== */}
      <header className="sticky top-0 z-30 hidden border-b border-slate-200 bg-white/90 backdrop-blur lg:block">
        <div className="mx-auto flex h-18 max-w-6xl items-center gap-8 px-10">
          <Link to="/events" aria-label="HCMUT Events — Trang chủ">
            <BrandLogo size={40} withText />
          </Link>
          <nav className="flex flex-1 items-center gap-1">
            {items
              .filter((it) => !it.mobileOnly)
              .map((it) => (
                <NavLink key={it.key} to={it.to} className={deskNavClass}>
                  {it.longLabel}
                </NavLink>
              ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              to="/account"
              className="flex items-center gap-2.5 rounded-control px-1.5 py-1 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <span className="text-right">
                <span className="block text-[13px] font-semibold text-slate-900">
                  {user?.fullName}
                </span>
                <span className="block text-xs text-slate-500">{roleText}</span>
              </span>
              <Avatar name={user?.fullName} />
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      {/* ===== App bar mobile (<1024) ===== */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link to="/events" aria-label="HCMUT Events — Trang chủ">
            <BrandLogo size={40} withText />
          </Link>
          <Link
            to="/account"
            aria-label="Tài khoản"
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <Avatar name={user?.fullName} />
          </Link>
        </div>
      </header>

      {/* ===== Nội dung ===== */}
      <main
        className={`mx-auto max-w-6xl px-4 py-6 lg:px-10 lg:pb-10 ${
          hideBottomNav ? 'pb-6' : 'pb-[88px]'
        }`}
      >
        <Outlet />
      </main>

      {/* ===== Bottom nav mobile (<1024) — ẩn ở route có CTA cố định ===== */}
      {!hideBottomNav && (
        <nav
          aria-label="Điều hướng chính"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white px-3 lg:hidden"
          style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
        >
        <ul className="mx-auto flex max-w-md items-stretch justify-around">
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <li key={it.key} className="flex-1">
                <NavLink
                  to={it.to}
                  className="flex min-h-[48px] flex-col items-center gap-1 pt-2 focus-visible:outline-none"
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`flex h-7 items-center rounded-full px-4 transition-colors ${
                          isActive ? 'bg-brand-100' : ''
                        }`}
                      >
                        <Icon
                          size={22}
                          className={isActive ? 'text-brand-700' : 'text-slate-500'}
                          aria-hidden="true"
                        />
                      </span>
                      <span
                        className={`text-xs ${
                          isActive ? 'font-semibold text-brand-700' : 'text-slate-500'
                        }`}
                      >
                        {it.label}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
        </nav>
      )}
    </div>
  );
}
