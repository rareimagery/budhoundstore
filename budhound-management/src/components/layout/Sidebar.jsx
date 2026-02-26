import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PERMS, ROLE_LABELS } from '../../utils/permissions';
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  TagIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      {
        label: 'Dashboard',
        path: '/dashboard',
        icon: HomeIcon,
        permission: PERMS.VIEW_DASHBOARD,
      },
      {
        label: 'Orders',
        path: '/orders',
        icon: ClipboardDocumentListIcon,
        permission: null,
      },
    ],
  },
  {
    label: 'Sales',
    items: [
      {
        label: 'New Sale (POS)',
        path: '/pos',
        icon: ShoppingCartIcon,
        permission: PERMS.CREATE_SALES,
      },
      {
        label: 'Sales History',
        path: '/sales',
        icon: CurrencyDollarIcon,
        permission: PERMS.CREATE_SALES,
      },
    ],
  },
  {
    label: 'Catalog',
    items: [
      {
        label: 'Inventory',
        path: '/inventory',
        icon: CubeIcon,
        permission: PERMS.VIEW_INVENTORY,
      },
      {
        label: 'Products',
        path: '/products',
        icon: TagIcon,
        permission: PERMS.VIEW_PRODUCTS,
      },
    ],
  },
  {
    label: 'People',
    items: [
      {
        label: 'Customers',
        path: '/customers',
        icon: UsersIcon,
        permission: null,
      },
      {
        label: 'Staff',
        path: '/staff',
        icon: UserGroupIcon,
        permission: PERMS.VIEW_STAFF,
      },
    ],
  },
  {
    label: 'Insights',
    items: [
      {
        label: 'Reports',
        path: '/reports',
        icon: ChartBarIcon,
        permission: PERMS.VIEW_SALES_REPORTS,
      },
    ],
  },
  {
    label: 'Admin',
    items: [
      {
        label: 'Settings',
        path: '/settings',
        icon: Cog6ToothIcon,
        permission: PERMS.MANAGE_SETTINGS,
      },
    ],
  },
];

export default function Sidebar() {
  const { user, hasPermission } = useAuth();

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Store branding */}
      <div className="h-16 flex items-center px-5 border-b border-gray-700/50">
        <span className="text-xl font-bold text-green-400">BudHound</span>
      </div>

      {/* Store name */}
      <div className="px-5 py-3 border-b border-gray-800">
        <p className="text-sm font-medium text-gray-300 truncate">
          {user?.store?.name || 'No Store'}
        </p>
      </div>

      {/* Navigation sections */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.permission || hasPermission(item.permission)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.label}>
              <p className="px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-green-600/90 text-white'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-5 py-4 border-t border-gray-800">
        <p className="text-sm font-medium text-gray-200 truncate">{user?.name}</p>
        <p className="text-xs text-gray-500">
          {user?.roles?.[0] ? ROLE_LABELS[user.roles[0]] || user.roles[0] : ''}
        </p>
      </div>
    </aside>
  );
}
