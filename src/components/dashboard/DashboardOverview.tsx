import React from 'react';
import { useApp } from '../../context/AppContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import {
  CalendarCheck2,
  Truck,
  RotateCcw,
  DollarSign,
  Armchair,
  CheckCircle2,
  FileText,
  Phone,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { generateRentalContractPdf, generateDeliveryChecklistPdf } from '../../utils/pdfGenerator';
import {
  getWhatsAppLink,
  createWhatsAppDeliveryReminderMessage,
} from '../../utils/whatsapp';
import { MagicRings } from '../common/MagicRings';


interface DashboardOverviewProps {
  onOpenCreateRental: () => void;
  onSelectRental: (id: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onOpenCreateRental,
  onSelectRental,
}) => {
  const {
    rentals,
    furniture,
    clients,
    businessProfile,
    updateRentalStatus,
    setActiveTab,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const activeRentals = rentals.filter((r) =>
    ['Reservado', 'En Camino', 'Entregado', 'En Recolección'].includes(r.status)
  );

  const deliveriesToday = rentals.filter(
    (r) => r.startDate === todayStr && ['Reservado', 'En Camino'].includes(r.status)
  );

  const pickupsToday = rentals.filter(
    (r) => r.endDate === todayStr && ['Entregado', 'En Recolección'].includes(r.status)
  );

  const totalMonthlyIncome = rentals
    .filter((r) => r.status !== 'Cancelado')
    .reduce((sum, r) => sum + r.amountPaid, 0);

  const totalPendingBalance = rentals
    .filter((r) => r.status !== 'Cancelado')
    .reduce((sum, r) => sum + r.balanceDue, 0);

  const totalDepositsInCustody = rentals
    .filter((r) => !r.isDepositReturned && r.guaranteeDeposit > 0 && r.status !== 'Cancelado')
    .reduce((sum, r) => sum + r.guaranteeDeposit, 0);

  // Total items rented currently
  let totalItemsRentedNow = 0;
  activeRentals.forEach((r) => {
    r.items.forEach((item) => {
      totalItemsRentedNow += item.quantity;
    });
  });

  // Low stock items
  const itemsUnderMaintenance = furniture.filter((f) => f.maintenanceStock > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner / Welcome with MagicRings interactive background */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden group">
        {/* React Bits MagicRings Interactive Three.js canvas */}
        <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-75 transition-opacity duration-700 pointer-events-none">
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

        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Control de Mobiliario y Rentas
          </h2>
          <p className="text-emerald-100/90 text-sm sm:text-base mt-2 leading-relaxed">
            Bienvenido. Tienes <strong className="text-white underline decoration-emerald-400 decoration-2">{deliveriesToday.length} entregas</strong> y{' '}
            <strong className="text-white underline decoration-emerald-400 decoration-2">{pickupsToday.length} recolecciones</strong> programadas para hoy. Todo organizado desde tu pantalla.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <button
              onClick={onOpenCreateRental}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-extrabold rounded-2xl text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              + Nueva Renta Digital
            </button>
            <button
              onClick={() => setActiveTab('logistics')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl text-sm transition-all flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-emerald-300" />
              Ver Rutas de Choferes
            </button>
          </div>
        </div>

        {/* Ambient decorative graphic */}
        <div className="absolute right-0 bottom-0 opacity-5 translate-x-12 translate-y-8 pointer-events-none z-0">
          <Armchair className="w-80 h-80 text-white" />
        </div>
      </div>


      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Rentas Activas"
          value={activeRentals.length}
          subtitle="En curso o confirmadas"
          icon={CalendarCheck2}
          color="emerald"
          onClick={() => setActiveTab('rentals')}
        />
        <StatCard
          title="Entregas Hoy"
          value={deliveriesToday.length}
          subtitle="Por salir o en camino"
          icon={Truck}
          color="blue"
          onClick={() => setActiveTab('logistics')}
        />
        <StatCard
          title="Recolecciones Hoy"
          value={pickupsToday.length}
          subtitle="Por inspeccionar y recibir"
          icon={RotateCcw}
          color="purple"
          onClick={() => setActiveTab('logistics')}
        />
        <StatCard
          title="Saldos por Cobrar"
          value={`$${totalPendingBalance.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
          subtitle={`Garantías en custodia: $${totalDepositsInCustody.toLocaleString('es-MX')}`}
          icon={DollarSign}
          color={totalPendingBalance > 0 ? 'amber' : 'emerald'}
          onClick={() => setActiveTab('finances')}
        />
      </div>

      {/* Main Section: Deliveries & Logistics for Today */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deliveries & Pickups Today List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                Logística y Entregas de Hoy
              </h3>
              <p className="text-xs text-slate-500">
                Acciones rápidas para choferes y control de salida sin hojas físicas.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('logistics')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
            >
              Ver calendario completo <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {deliveriesToday.length === 0 && pickupsToday.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">¡Al día con las entregas de hoy!</p>
              <p className="text-xs text-slate-500 mt-1">
                No hay entregas pendientes urgentes programadas para esta fecha.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {deliveriesToday.map((rental) => (
                <div
                  key={rental.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900">
                        {rental.folio}
                      </span>
                      <Badge status={rental.status} />
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        🕒 {rental.deliveryTime || 'Hoy'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">{rental.clientName}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      📍 {rental.eventLocation || rental.clientAddress}
                    </p>
                    <p className="text-xs font-medium text-slate-600">
                      📦 {rental.items.reduce((sum, i) => sum + i.quantity, 0)} artículos (
                      {rental.items.map((i) => `${i.quantity}x ${i.furnitureName}`).slice(0, 2).join(', ')}
                      {rental.items.length > 2 ? '...' : ''})
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={getWhatsAppLink(
                        rental.clientPhone,
                        createWhatsAppDeliveryReminderMessage(rental, businessProfile)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
                      title="Enviar recordatorio por WhatsApp"
                    >
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span className="hidden md:inline">WhatsApp</span>
                    </a>

                    <button
                      onClick={() => generateDeliveryChecklistPdf(rental, businessProfile)}
                      className="p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
                      title="Descargar Hoja de Ruta PDF"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="hidden md:inline">Hoja Ruta</span>
                    </button>

                    {rental.status === 'Reservado' && (
                      <button
                        onClick={() => updateRentalStatus(rental.id, 'En Camino')}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        Despachar
                      </button>
                    )}

                    {rental.status === 'En Camino' && (
                      <button
                        onClick={() => updateRentalStatus(rental.id, 'Entregado')}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        Entregado
                      </button>
                    )}

                    <button
                      onClick={() => onSelectRental(rental.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {pickupsToday.map((rental) => (
                <div
                  key={rental.id}
                  className="p-4 rounded-2xl border border-purple-200 bg-purple-50/30 hover:bg-purple-50/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900">
                        {rental.folio}
                      </span>
                      <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                        🔄 Recolección Hoy: {rental.pickupTime || 'Tarde'}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800">{rental.clientName}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      📍 {rental.eventLocation || rental.clientAddress}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSelectRental(rental.id)}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Inspeccionar y Recibir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Quick Stats & Maintenance Alerts */}
        <div className="space-y-6">
          {/* Paperless Quick Actions */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              ⚡ Acciones Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={onOpenCreateRental}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-2xl font-bold text-xs text-left transition-all border border-emerald-100 flex flex-col justify-between h-20"
              >
                <span>+ Crear Renta</span>
                <span className="text-[10px] text-emerald-600 font-normal">Contrato y cotización</span>
              </button>

              <button
                onClick={() => setActiveTab('inventory')}
                className="p-3 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-2xl font-bold text-xs text-left transition-all border border-blue-100 flex flex-col justify-between h-20"
              >
                <span>🪑 Ver Inventario</span>
                <span className="text-[10px] text-blue-600 font-normal">Disponibilidad y stock</span>
              </button>

              <button
                onClick={() => setActiveTab('clients')}
                className="p-3 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-2xl font-bold text-xs text-left transition-all border border-purple-100 flex flex-col justify-between h-20"
              >
                <span>👥 Clientes</span>
                <span className="text-[10px] text-purple-600 font-normal">Directorio y teléfonos</span>
              </button>

              <button
                onClick={() => setActiveTab('finances')}
                className="p-3 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-2xl font-bold text-xs text-left transition-all border border-amber-100 flex flex-col justify-between h-20"
              >
                <span>💰 Caja y Fianzas</span>
                <span className="text-[10px] text-amber-600 font-normal">Pagos y devoluciones</span>
              </button>
            </div>
          </div>

          {/* Maintenance & Damages Notification */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Mobiliario en Taller ({itemsUnderMaintenance.length})
              </h3>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Gestionar
              </button>
            </div>

            {itemsUnderMaintenance.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">
                ✅ Todo el mobiliario está en óptimas condiciones de renta.
              </p>
            ) : (
              <div className="space-y-2">
                {itemsUnderMaintenance.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs"
                  >
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500">{item.code}</p>
                    </div>
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md shrink-0">
                      {item.maintenanceStock} en reparación
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
