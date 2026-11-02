import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { ROLES } from '../../constants/roles';
import { Button } from '../ui/Button';

function navClass({ isActive }) {
  return `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-100'
  }`;
}

/** Khung chung sau khi đăng nhập: thanh điều hướng theo vai trò + nội dung. */
export function AppLayout() {
  const { user, logout, hasRole } = useAuth();

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to="/events" className="flex items-center gap-2 font-semibold text-brand-600">
            <span className="text-xl">🎟️</span>
            <span className="hidden sm:inline">HCMUT Events</span>
          </Link>

          <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
            <NavLink to="/events" className={navClass}>
              Sự kiện
            </NavLink>
            {hasRole(ROLES.STUDENT) && (
              <NavLink to="/my-registrations" className={navClass}>
                Đăng ký của tôi
              </NavLink>
            )}
            {(hasRole(ROLES.ORGANIZER) || hasRole(ROLES.ADMIN)) && (
              <NavLink to="/manage/events" className={navClass}>
                Quản lý sự kiện
              </NavLink>
            )}
            {hasRole(ROLES.ADMIN) && (
              <NavLink to="/admin/approvals" className={navClass}>
                Duyệt sự kiện
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-700">{user?.fullName}</p>
              <p className="text-xs text-slate-400">{(user?.roles ?? []).join(' · ') || '—'}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={logout}>
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
