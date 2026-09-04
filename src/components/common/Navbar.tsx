import React from 'react';
import { useApp } from '../../context/AppContext';
import { Menu, Search, Calendar, Plus } from 'lucide-react';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onOpenCreateRental: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleMobileMenu,
  onOpenCreateRental,
}) => {
  const { searchTerm, setSearchTerm, activeTab } = useApp();

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Panel Principal';
      case 'rentals':
        return 'Gestión de Rentas & Pedidos';
      case 'inventory':
        return 'Inventario de Mobiliario';
      case 'clients':
        return 'Directorio de Clientes';
      case 'logistics':
        return 'Calendario & Logística de Rutas';
      case 'finances':
        return 'Caja, Anticipos y Garantías';
      case 'settings':
        return 'Configuración & Empresa';
      default:
        return 'RentaFácil';
    }
  };

  const todayFormatted = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu trigger + Section title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight leading-tight">
              {getTabTitle(activeTab)}
            </h2>
            <p className="text-xs text-slate-500 capitalize hidden sm:flex items-center gap-1.5 font-medium mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              {todayFormatted}
            </p>
          </div>
        </div>

        {/* Global Search & Quick Actions */}
        <div className="flex items-center gap-3">
          <div className="relative w-44 sm:w-64 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar folio, cliente, mueble..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-xs sm:text-sm rounded-xl border border-transparent focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={onOpenCreateRental}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Renta</span>
          </button>
        </div>
      </div>
    </header>
  );
};
