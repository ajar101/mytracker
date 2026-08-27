'use client';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, CalendarCheck, History, BarChart2, Settings } from 'lucide-react';

const TABS = [
  { href: '/',            icon: LayoutDashboard, label: 'Home'      },
  { href: '/today',       icon: CalendarCheck,   label: 'Today'     },
  { href: '/history',     icon: History,         label: 'History'   },
  { href: '/statistics',  icon: BarChart2,        label: 'Stats'     },
  { href: '/settings',    icon: Settings,         label: 'Settings'  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        {TABS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <button
              key={href}
              onClick={() => router.push(href)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.2rem',
                padding: '0.5rem 0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              <div
                style={{
                  width: '2.25rem',
                  height: '1.75rem',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive ? 'var(--primary-glow)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span style={{ fontSize: '0.6rem', fontWeight: isActive ? 700 : 500 }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
