import {
  Brain,
  Flag,
  GitCompare,
  LayoutDashboard,
  LogOut,
  Shield,
  User,
  Users,
  Lock,
  LogIn,
  Radio,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS_PUBLIC = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/drivers", label: "Drivers", icon: Users },
  { to: "/races", label: "Races", icon: Flag },
  { to: "/constructors", label: "Constructors", icon: Shield },
  { to: "/delta-analyst", label: "Delta Analyst", icon: GitCompare },
];

const NAV_ITEMS_PROTECTED = [
  { to: "/race-engineer", label: "Race Engineer", icon: Radio },
];

const Sidebar = ({ mobileOpen = false, onNavigate = () => {}, collapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated, user } = useAuth();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-sm transition-all duration-150 ${
      isActive
        ? "border-l-2 border-[var(--color-accent-500)] bg-[var(--color-glass-bg)] text-[var(--color-text-primary)]"
        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-glass-hover)] hover:text-[var(--color-text-primary)]"
    }`;

  const iconClass = "h-5 w-5 shrink-0";
  const labelClass = "font-medium tracking-normal lg:hidden xl:inline whitespace-nowrap";
  const hiddenLabel = collapsed ? "xl:hidden" : "xl:inline";

  return (
    <>
      {mobileOpen ? (
        <button
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onNavigate}
          aria-label="Close navigation"
        />
      ) : null}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 border-r
          bg-[var(--color-base-900)] border-[var(--color-base-600)]
          transition-all duration-200 ease-out
          lg:static lg:top-0 lg:h-screen
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          w-[240px]
          ${collapsed ? "xl:w-[64px]" : "xl:w-[240px]"}
        `}
      >
        <div className="flex h-full flex-col justify-between">
          <div>
            {/* Logo / Brand */}
            <div className="flex items-center gap-3 border-b border-[var(--color-base-600)] px-5 py-5">
              <div className="h-8 w-8 shrink-0 rounded-[var(--radius-md)] bg-[var(--color-accent-500)] flex items-center justify-center">
                <span className="text-[var(--color-text-primary)] font-bold text-sm">D</span>
              </div>
              <div className={`${collapsed ? "xl:hidden" : "xl:block"} hidden`}>
                <span className="text-[var(--color-text-primary)] font-bold text-lg tracking-tight">Delta</span>
                <span className="text-[var(--color-accent-500)] font-bold text-lg tracking-tight">Box</span>
              </div>
            </div>

            <nav className="px-3 py-4 space-y-1">
              {/* Public Navigation Items */}
              {NAV_ITEMS_PUBLIC.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={onNavigate} className="group relative block">
                  {({ isActive }) => (
                    <div className={`${navLinkClass({ isActive })} ${collapsed ? "xl:justify-center" : ""}`}>
                      <Icon className={iconClass} />
                      <span className={`${labelClass} ${hiddenLabel}`}>{label}</span>
                    </div>
                  )}
                </NavLink>
              ))}

              {/* Apex Intelligence */}
              <NavLink to="/ai" onClick={onNavigate} className="group relative block">
                {({ isActive }) => (
                  <div className={`${navLinkClass({ isActive })} ${collapsed ? "xl:justify-center" : ""}`}>
                    <Brain className={iconClass} />
                    <span className={`${labelClass} ${hiddenLabel}`}>Apex Intelligence</span>
                    {!isAuthenticated && <Lock className={`h-3 w-3 text-[var(--color-text-tertiary)] ${collapsed ? "xl:hidden" : ""}`} />}
                  </div>
                )}
              </NavLink>

              {/* Race Engineer - Only if authenticated */}
              {isAuthenticated && NAV_ITEMS_PROTECTED.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} onClick={onNavigate} className="group relative block">
                  {({ isActive }) => (
                    <div className={`${navLinkClass({ isActive })} ${collapsed ? "xl:justify-center" : ""}`}>
                      <Icon className={iconClass} />
                      <span className={`${labelClass} ${hiddenLabel}`}>{label}</span>
                    </div>
                  )}
                </NavLink>
              ))}

              {/* Profile - Only if authenticated */}
              {isAuthenticated && (
                <NavLink to="/profile" onClick={onNavigate} className="group relative block">
                  {({ isActive }) => (
                    <div className={`${navLinkClass({ isActive })} ${collapsed ? "xl:justify-center" : ""}`}>
                      <User className={iconClass} />
                      <span className={`${labelClass} ${hiddenLabel}`}>Profile</span>
                    </div>
                  )}
                </NavLink>
              )}
            </nav>
          </div>

          {/* Bottom section */}
          <div className="border-t border-[var(--color-base-600)] p-3 space-y-1">
            {isAuthenticated ? (
              <>
                <div className={`flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 ${collapsed ? "xl:justify-center" : ""}`}>
                  <div className="h-8 w-8 shrink-0 rounded-full bg-[var(--color-accent-500)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-accent-500)]">
                    {(user?.username || "U")[0].toUpperCase()}
                  </div>
                  <div className={`min-w-0 ${collapsed ? "xl:hidden" : "xl:block"} hidden`}>
                    <p className="text-xs text-[var(--color-text-tertiary)] truncate">Signed in as</p>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{user?.username || "User"}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    logout();
                    navigate("/dashboard");
                  }}
                  className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-sm text-[var(--color-text-accent)] transition hover:bg-[var(--color-accent-500)]/10 ${collapsed ? "xl:justify-center" : ""}`}
                >
                  <LogOut className={iconClass} />
                  <span className={`${labelClass} ${hiddenLabel}`}>Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { navigate("/login"); onNavigate(); }}
                  className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-sm bg-[var(--color-accent-500)] text-[var(--color-text-primary)] font-medium transition hover:brightness-110 hover:shadow-[var(--shadow-glow-sm)] ${collapsed ? "xl:justify-center" : ""}`}
                >
                  <LogIn className={iconClass} />
                  <span className={`${labelClass} ${hiddenLabel}`}>Sign In</span>
                </button>

                <button
                  onClick={() => { navigate("/register"); onNavigate(); }}
                  className={`flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-sm border border-[var(--color-glass-border)] text-[var(--color-text-secondary)] font-medium transition hover:bg-[var(--color-glass-hover)] ${collapsed ? "xl:justify-center" : ""}`}
                >
                  <User className={iconClass} />
                  <span className={`${labelClass} ${hiddenLabel}`}>Sign Up</span>
                </button>
              </>
            )}

            {/* Collapse toggle */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden xl:flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-sm text-[var(--color-text-tertiary)] transition hover:bg-[var(--color-glass-hover)] hover:text-[var(--color-text-secondary)]"
              >
                {collapsed ? (
                  <>
                    <ChevronRight className={iconClass} />
                    <span className="font-medium">Expand</span>
                  </>
                ) : (
                  <>
                    <ChevronLeft className={iconClass} />
                    <span className="font-medium">Collapse</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
