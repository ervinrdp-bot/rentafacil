import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { ToastContainer } from './components/common/ToastContainer';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { InventoryList } from './components/inventory/InventoryList';
import { ClientList } from './components/clients/ClientList';
import { RentalList } from './components/rentals/RentalList';
import { RentalCreateModal } from './components/rentals/RentalCreateModal';
import { RentalDetailModal } from './components/rentals/RentalDetailModal';
import { LogisticsCalendar } from './components/logistics/LogisticsCalendar';
import { FinancesView } from './components/finances/FinancesView';
import { BusinessSettings } from './components/settings/BusinessSettings';
import { MagicRings } from './components/common/MagicRings';
import { Armchair, LockKeyhole, UserRound } from 'lucide-react';

const LoginScreen: React.FC<{ onLogin: (username: string, pin: string) => boolean }> = ({ onLogin }) => {
  const [username, setUsername] = useState('admin');
  const [pin, setPin] = useState('1234');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const success = onLogin(username, pin);
    if (!success) {
      setError('Usuario o PIN incorrectos.');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-55 pointer-events-none">
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

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-slate-950/75 backdrop-blur-xl border border-emerald-400/25 shadow-2xl shadow-emerald-950/50 p-6 sm:p-8">
        <div className="text-center mb-7">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-300 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30">
            <Armchair className="w-8 h-8" />
          </div>
          <h1 className="mt-4 text-2xl font-black text-white">RentaFácil</h1>
          <p className="mt-2 text-sm text-emerald-100/70">Acceso seguro al sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-100/80 mb-1">
              Usuario
            </label>
            <div className="relative">
              <UserRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white/10 border border-emerald-300/20 rounded-xl text-white placeholder:text-emerald-100/35 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="admin o user1"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-100/80 mb-1">
              PIN
            </label>
            <div className="relative">
              <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-300/60" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white/10 border border-emerald-300/20 rounded-xl text-white placeholder:text-emerald-100/35 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Ingresa tu PIN"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-semibold">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[.98] text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
          >
            {isSubmitting ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>

      </div>
    </div>
  );
};

const MainContent: React.FC = () => {
  const { activeTab, openRentalModalWithId, setOpenRentalModalWithId } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateRentalOpen, setIsCreateRentalOpen] = useState(false);
  const [selectedRentalId, setSelectedRentalId] = useState<string | undefined>();

  const handleOpenRentalDetail = (id: string) => {
    setSelectedRentalId(id);
  };

  const handleCloseRentalDetail = () => {
    setSelectedRentalId(undefined);
    setOpenRentalModalWithId(undefined);
  };

  // Render current tab
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardOverview
            onOpenCreateRental={() => setIsCreateRentalOpen(true)}
            onSelectRental={handleOpenRentalDetail}
          />
        );
      case 'rentals':
        return (
          <RentalList
            onOpenCreateRental={() => setIsCreateRentalOpen(true)}
            onSelectRental={handleOpenRentalDetail}
          />
        );
      case 'inventory':
        return <InventoryList />;
      case 'clients':
        return <ClientList onSelectRental={handleOpenRentalDetail} />;
      case 'logistics':
        return <LogisticsCalendar onSelectRental={handleOpenRentalDetail} />;
      case 'finances':
        return <FinancesView />;
      case 'settings':
        return <BusinessSettings />;
      default:
        return (
          <DashboardOverview
            onOpenCreateRental={() => setIsCreateRentalOpen(true)}
            onSelectRental={handleOpenRentalDetail}
          />
        );
    }
  };

  const effectiveSelectedRentalId = selectedRentalId || openRentalModalWithId;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Navigation Sidebar */}
      <Sidebar
        onOpenCreateRental={() => setIsCreateRentalOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <Navbar
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenCreateRental={() => setIsCreateRentalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Global Modals */}
      <RentalCreateModal
        isOpen={isCreateRentalOpen}
        onClose={() => setIsCreateRentalOpen(false)}
        onSuccess={(created) => setSelectedRentalId(created.id)}
      />

      {effectiveSelectedRentalId && (
        <RentalDetailModal
          isOpen={!!effectiveSelectedRentalId}
          rentalId={effectiveSelectedRentalId}
          onClose={handleCloseRentalDetail}
        />
      )}

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

const AppShell: React.FC = () => {
  const { currentUser, loginUser, logoutUser } = useApp();

  if (!currentUser) {
    return <LoginScreen onLogin={loginUser} />;
  }

  return (
    <div>
      <MainContent />
      <button
        onClick={logoutUser}
        className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg hover:bg-slate-800"
      >
        Cerrar sesión ({currentUser.username})
      </button>
    </div>
  );
};

export default App;
