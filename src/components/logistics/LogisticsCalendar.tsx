import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RentalOrder } from '../../types';
import { Badge } from '../common/Badge';
import {
  Truck,
  RotateCcw,
  Calendar,
  MapPin,
  Phone,
  FileText,
  CheckCircle2,
  PackageCheck,
  Navigation,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { generateDeliveryChecklistPdf } from '../../utils/pdfGenerator';
import { getWhatsAppLink, createWhatsAppDeliveryReminderMessage } from '../../utils/whatsapp';

interface LogisticsCalendarProps {
  onSelectRental: (id: string) => void;
}

export const LogisticsCalendar: React.FC<LogisticsCalendarProps> = ({ onSelectRental }) => {
  const { rentals, businessProfile, updateRentalStatus } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Deliveries for selected date
  const deliveries = rentals.filter(
    (r) => r.startDate === selectedDate && r.status !== 'Cancelado'
  );

  // Pickups for selected date
  const pickups = rentals.filter(
    (r) => r.endDate === selectedDate && r.status !== 'Cancelado'
  );

  // Consolidate all furniture items to load on truck for deliveries on selected date
  const truckLoadingList: { [name: string]: { code: string; quantity: number; image: string } } = {};
  deliveries.forEach((rental) => {
    rental.items.forEach((item) => {
      if (!truckLoadingList[item.furnitureName]) {
        truckLoadingList[item.furnitureName] = {
          code: item.furnitureCode,
          quantity: 0,
          image: item.furnitureImage,
        };
      }
      truckLoadingList[item.furnitureName].quantity += item.quantity;
    });
  });

  const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date Navigation Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-800 rounded-2xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Agenda de Rutas y Choferes
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-800 capitalize">
              {formattedDate}
            </h3>
          </div>
        </div>

        {/* Date Stepper Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDay}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title="Día anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
          >
            Hoy
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:outline-none"
          />
          <button
            onClick={handleNextDay}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
            title="Día siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Deliveries, Pickups & Truck Loading Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Deliveries & Pickups for the Day */}
        <div className="lg:col-span-2 space-y-6">
          {/* Deliveries Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Entregas Programadas ({deliveries.length})
              </h4>
              <span className="text-xs text-slate-400">Salidas de almacén</span>
            </div>

            {deliveries.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-2xl">
                No hay entregas programadas para esta fecha.
              </p>
            ) : (
              <div className="space-y-3">
                {deliveries.map((rental) => {
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    rental.eventLocation || rental.clientAddress
                  )}`;

                  return (
                    <div
                      key={rental.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">
                            {rental.folio}
                          </span>
                          <Badge status={rental.status} />
                          <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                            🕒 {rental.deliveryTime || '09:00 AM'}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-slate-900">
                          Total: ${rental.totalAmount.toLocaleString('es-MX')}
                        </span>
                      </div>

                      <div>
                        <p className="font-bold text-slate-800 text-sm">{rental.clientName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{rental.eventLocation || rental.clientAddress}</span>
                        </p>
                        {rental.eventNotes && (
                          <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/60 mt-2 font-medium">
                            📝 Nota para chofer: {rental.eventNotes}
                          </p>
                        )}
                      </div>

                      {/* Items Pill Summary */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {rental.items.map((i) => (
                          <span
                            key={i.furnitureId}
                            className="bg-white border border-slate-200 px-2 py-0.5 rounded-lg text-[11px] font-semibold text-slate-700"
                          >
                            <strong>{i.quantity}x</strong> {i.furnitureName}
                          </span>
                        ))}
                      </div>

                      {/* Actions for Driver */}
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            Abrir GPS
                          </a>

                          <a
                            href={getWhatsAppLink(
                              rental.clientPhone,
                              createWhatsAppDeliveryReminderMessage(rental, businessProfile)
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            WhatsApp
                          </a>

                          <button
                            onClick={() => generateDeliveryChecklistPdf(rental, businessProfile)}
                            className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold"
                            title="Hoja de Entrega PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {rental.status === 'Reservado' && (
                            <button
                              onClick={() => updateRentalStatus(rental.id, 'En Camino')}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
                            >
                              Marcar En Camino
                            </button>
                          )}

                          {rental.status === 'En Camino' && (
                            <button
                              onClick={() => updateRentalStatus(rental.id, 'Entregado')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
                            >
                              Marcar Entregado
                            </button>
                          )}

                          <button
                            onClick={() => onSelectRental(rental.id)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
                          >
                            Ver Detalle
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pickups Section */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                Recolecciones Programadas ({pickups.length})
              </h4>
              <span className="text-xs text-slate-400">Retorno a bodega</span>
            </div>

            {pickups.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-2xl">
                No hay recolecciones programadas para esta fecha.
              </p>
            ) : (
              <div className="space-y-3">
                {pickups.map((rental) => (
                  <div
                    key={rental.id}
                    className="p-4 rounded-2xl border border-purple-200 bg-purple-50/30 hover:bg-purple-50/60 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {rental.folio}
                        </span>
                        <Badge status={rental.status} />
                        <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                          🕒 {rental.pickupTime || 'Tarde'}
                        </span>
                      </div>
                      <button
                        onClick={() => onSelectRental(rental.id)}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Recibir & Inspeccionar
                      </button>
                    </div>

                    <p className="font-bold text-slate-800 text-sm">{rental.clientName}</p>
                    <p className="text-xs text-slate-500">
                      📍 {rental.eventLocation || rental.clientAddress} • 📞 {rental.clientPhone}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Truck Loading Sheet for Warehouse Workers */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              Carga Consolidada de Camión
            </h4>
            <p className="text-xs text-slate-500">
              Total de mobiliario a subir a la camioneta/camión para todas las entregas de esta fecha.
            </p>
          </div>

          {Object.keys(truckLoadingList).length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <PackageCheck className="w-8 h-8 text-slate-300 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-600">Sin carga programada hoy</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {Object.entries(truckLoadingList).map(([name, data]) => (
                <div
                  key={name}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <img
                      src={data.image}
                      alt={name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="overflow-hidden">
                      <p className="font-bold text-slate-800 truncate">{name}</p>
                      <p className="text-[11px] text-slate-400">{data.code}</p>
                    </div>
                  </div>

                  <span className="font-extrabold text-base text-emerald-700 bg-emerald-100 px-3 py-1 rounded-xl shrink-0">
                    {data.quantity} pzas
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
