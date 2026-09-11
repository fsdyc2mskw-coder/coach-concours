import type { AppRoute } from '../app/router';
import { navigate } from '../app/router';

const items = [
  { name: 'dashboard', label: 'Aujourd’hui', path: '/dashboard', icon: '⌂' },
  { name: 'plan', label: 'Plan', path: '/plan', icon: '▦' },
  { name: 'trails', label: 'Parcours', path: '/trails', icon: '⌖' },
  { name: 'activities', label: 'Activités', path: '/activities', icon: '↗' },
  { name: 'settings', label: 'Réglages', path: '/settings', icon: '⚙' }
] as const;

export function BottomNav({ route }: { route: AppRoute }) {
  const activeName = route.name === 'session' ? 'plan' : route.name;
  return (
    <nav className="bottom-nav" aria-label="Navigation principale" data-no-capture="true">
      {items.map((item) => (
        <button
          key={item.name}
          className={activeName === item.name ? 'bottom-nav__item is-active' : 'bottom-nav__item'}
          type="button"
          onClick={() => navigate(item.path)}
        >
          <span className="bottom-nav__icon" aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
