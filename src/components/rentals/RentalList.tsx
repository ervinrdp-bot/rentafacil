import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RentalOrder, RentalStatus } from '../../types';
import { Badge } from '../common/Badge';
import {
  CalendarCheck2,
  Search,
  Plus,
  Phone,
  FileText,
  Truck,
  Eye,
  Trash2,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { generateRentalContractPdf, generateDeliveryChecklistPdf } from '../../utils/pdfGenerator';
import {
  getWhatsAppLink,
  createWhatsAppConfirmationMessage,
} from '../../utils/whatsapp';

interface RentalListProps {
  onOpenCreateRental: () => void;
  onSelectRental: (id: string) => void;
}

const STATUS_FILTERS: ('Todos' | RentalStatus)[] = [
  'Todos',
  'Cotización',
  'Reservado',
  'En Camino',
  'Entregado',
  'En Recolección',
  'Devuelto',
  'Con Incidencia',
];

export const RentalList: React.FC<RentalListProps> = ({
  onOpenCreateRental,
  onSelectRental,
}) => {
  const { rentals, deleteRental, updateRentalStatus, businessProfile } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<'Todos' | RentalStatus>('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRentals = rentals.filter((rental) => {
    const matchesStatus =
      selectedStatus === 'Todos' || rental.status === selectedStatus;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      rental.folio.toLowerCase().includes(q) ||
      rental.clientName.toLowerCase().includes(q) ||
      rental.clientPhone.includes(q) ||
      (rental.eventName && rental.eventName.toLowerCase().includes(q)) ||
      (rental.eventLocation && rental.eventLocation.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por folio (REN-2026-001), cliente, teléfono o salón..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <button
            onClick={onOpenCreateRental}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nueva Renta Digital
          </button>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedStatus === st
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredRentals.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <CalendarCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No se encontraron órdenes</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Crea una nueva orden de renta para gestionar fechas, inventario reservado y contratos digitales sin usar papel.
          </p>
          <button
            onClick={onOpenCreateRental}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all"
          >
            + Crear Renta Digital
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRentals.map((rental) => {
            const totalPieces = rental.items.reduce((sum, i) => sum + i.quantity, 0);

            return (
              <div
                key={rental.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold text-slate-900 tracking-tight">
                      {rental.folio}
                    </span>
                    <Badge status={rental.status} />
                    {rental.signatureDataUrl && (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Firmado
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={getWhatsAppLink(
                        rental.clientPhone,
                        createWhatsAppConfirmationMessage(rental, businessProfile)
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
                      title="Enviar confirmación por WhatsApp"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden md:inline">WhatsApp</span>
                    </a>

                    <button
                      onClick={() => generateRentalContractPdf(rental, businessProfile)}
                      className="p-2 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
                      title="Descargar Contrato PDF"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-600" />
                      <span className="hidden md:inline">Contrato PDF</span>
                    </button>

                    <button
                      onClick={() => generateDeliveryChecklistPdf(rental, businessProfile)}
                      className="p-2 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-xl transition-all text-xs font-bold flex items-center gap-1.5"
                      title="Descargar Hoja de Ruta"
                    >
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden md:inline">Hoja Ruta</span>
                    </button>

                    <button
                      onClick={() => onSelectRental(rental.id)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Ver Detalle
                    </button>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  {/* Client */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Cliente</span>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{rental.clientName}</p>
                    <p className="text-slate-500">📞 {rental.clientPhone}</p>
                  </div>

                  {/* Dates */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Fechas de Renta</span>
                    <p className="font-bold text-slate-800 mt-0.5">
                      📅 {rental.startDate} al {rental.endDate}
                    </p>
                    <p className="text-slate-500">
                      🕒 Entregar: {rental.deliveryTime || 'A acordar'}
                    </p>
                  </div>

                  {/* Mobiliario */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Mobiliario</span>
                    <p className="font-bold text-slate-800 mt-0.5">{totalPieces} piezas en total</p>
                    <p className="text-slate-500 truncate">
                      {rental.items.map((i) => `${i.quantity}x ${i.furnitureName}`).slice(0, 2).join(', ')}
                      {rental.items.length > 2 ? '...' : ''}
                    </p>
                  </div>

                  {/* Total & Balance */}
                  <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Total:</span>
                      <span className="text-slate-900 font-extrabold text-sm">
                        ${rental.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] mt-1">
                      <span className="text-slate-500">Saldo:</span>
                      <span
                        className={`font-bold ${
                          rental.balanceDue > 0 ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        ${rental.balanceDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Logistics notes */}
                {rental.eventLocation && (
                  <div className="text-[11px] text-slate-500 bg-slate-50/50 px-3 py-1.5 rounded-xl flex items-center justify-between">
                    <span className="truncate">📍 Lugar: {rental.eventLocation}</span>
                    <span className="text-slate-400 shrink-0">
                      Fianza: ${rental.guaranteeDeposit.toLocaleString('es-MX')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
