import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  CalendarCheck2,
  Armchair,
  Users,
  Truck,
  WalletCards,
  Settings,
  PlusCircle,
} from 'lucide-react';
import { MagicRings } from './MagicRings';

interface SidebarProps {
  onOpenCreateRental: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenCreateRental,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { activeTab, setActiveTab, rentals, furniture, businessProfile } = useApp();

  const activeRentalsCount = rentals.filter((r) =>
    ['Reservado', 'En Camino', 'Entregado', 'En Recolección'].includes(r.status)
  ).length;

  const lowStockCount = furniture.filter(
    (f) => f.totalStock - f.maintenanceStock <= 2
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Panel Principal',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'rentals',
      label: 'Rentas y Pedidos',
      icon: CalendarCheck2,
      badge: activeRentalsCount > 0 ? activeRentalsCount : null,
      badgeColor: 'bg-emerald-400 text-slate-950',
    },
    {
      id: 'inventory',
      label: 'Inventario de Muebles',
      icon: Armchair,
      badge: lowStockCount > 0 ? `${lowStockCount} bajo` : null,
      badgeColor: 'bg-amber-400 text-slate-950',
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: Users,
      badge: null,
    },
    {
      id: 'logistics',
      label: 'Calendario y Rutas',
      icon: Truck,
      badge: 'Hoy',
      badgeColor: 'bg-sky-400 text-slate-950',
    },
    {
      id: 'finances',
      label: 'Caja y Pagos',
      icon: WalletCards,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Configuración y Empresa',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container matching Dashboard Hero Theme */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 text-white border-r border-emerald-800/40 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 overflow-hidden group shadow-2xl ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* MagicRings Interactive Background */}
        <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-65 transition-opacity duration-700 pointer-events-none">
          <MagicRings
            color="#10b981"
            colorTwo="#38bdf8"
            speed={1.2}
            ringCount={6}
            followMouse={true}
            mouseInfluence={0.25}
            hoverScale={1.35}
            clickBurst={true}
            attenuation={9}
            lineThickness={2.5}
            baseRadius={0.32}
            noiseAmount={0.08}
            opacity={0.85}
          />
        </div>

        {/* Top Content */}
        <div className="relative z-10">
          {/* Brand Header */}
          <div className="p-5 border-b border-emerald-800/40 bg-emerald-950/30 backdrop-blur-md flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/30 shrink-0">
              <Armchair className="w-5 h-5 text-slate-950" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-extrabold text-white text-base leading-tight truncate">
                {businessProfile.name}
              </h1>
            </div>
          </div>

          {/* Action Button matching Dashboard primary button */}
          <div className="p-4">
            <button
              onClick={() => {
                onOpenCreateRental();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 rounded-2xl font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Nueva Renta / Pedido
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    isActive
                      ? 'bg-white/15 text-white font-bold backdrop-blur-md border border-emerald-400/40 shadow-md shadow-emerald-950/40'
                      : 'text-emerald-100/80 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-emerald-300' : 'text-emerald-300/70 group-hover:text-white'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-xs ${
                        item.badgeColor || 'bg-white/20 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>


      </aside>
    </>
  );
};




