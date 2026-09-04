import React, { useState } from 'react';
import { RentalOrder, InspectionReport } from '../../types';
import { Modal } from '../common/Modal';
import { ShieldCheck, AlertTriangle, DollarSign, CheckCircle2 } from 'lucide-react';

interface ReturnInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: RentalOrder;
  onComplete: (report: InspectionReport) => void;
}

export const ReturnInspectionModal: React.FC<ReturnInspectionModalProps> = ({
  isOpen,
  onClose,
  rental,
  onComplete,
}) => {
  const [inspectedBy, setInspectedBy] = useState('Encargado de Almacén');
  const [hasDamages, setHasDamages] = useState(false);
  const [damageFeeCharged, setDamageFeeCharged] = useState(0);
  const [notes, setNotes] = useState('');
  const [itemStatuses, setItemStatuses] = useState<
    { furnitureId: string; returnedQty: number; damagedQty: number; notes: string }[]
  >(() =>
    rental.items.map((i) => ({
      furnitureId: i.furnitureId,
      returnedQty: i.quantity,
      damagedQty: 0,
      notes: '',
    }))
  );

  const initialDeposit = rental.guaranteeDeposit || 0;
  const depositRefund = Math.max(0, initialDeposit - damageFeeCharged);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const report: InspectionReport = {
      inspectedAt: new Date().toISOString(),
      inspectedBy: inspectedBy.trim() || 'Encargado de Recepción',
      hasDamages: hasDamages || damageFeeCharged > 0,
      notes: notes.trim() || (hasDamages ? 'Mobiliario devuelto con incidencias registradas.' : 'Mobiliario devuelto completo y en perfectas condiciones.'),
      evidenceImages: [],
      depositRefundedAmount: depositRefund,
      damageFeeCharged: damageFeeCharged,
    };

    onComplete(report);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Inspección de Devolución - ${rental.folio}`}
      subtitle="Verificación física del mobiliario, revisión de daños y finiquito de fianza"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Info Banner */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-extrabold text-slate-800 text-sm">{rental.clientName}</p>
            <p className="text-slate-500">Evento: {rental.eventName || 'Renta de Mobiliario'}</p>
          </div>
          <div className="bg-white px-3 py-2 rounded-xl border border-slate-200 text-right">
            <span className="text-slate-500 font-semibold block">Depósito en Garantía en Custodia:</span>
            <span className="font-extrabold text-base text-emerald-700">
              ${initialDeposit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Items Checklist Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 text-[11px] font-extrabold text-slate-600 uppercase flex items-center justify-between">
            <span>Artículo Rentado</span>
            <span className="pr-4">Cantidad Entregada vs Devuelta</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {rental.items.map((item, idx) => (
              <div key={item.furnitureId} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.furnitureImage}
                    alt={item.furnitureName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <p className="font-bold text-slate-800">{item.furnitureName}</p>
                    <p className="text-slate-400 text-[11px]">
                      Valor reposición: ${item.replacementValue} c/u • Entregados: {item.quantity} pzas
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="flex items-center gap-1.5">
                    <label className="text-slate-500 text-[11px] font-bold">Devueltos OK:</label>
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={itemStatuses[idx]?.returnedQty ?? item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const newStatuses = [...itemStatuses];
                        newStatuses[idx].returnedQty = val;
                        newStatuses[idx].damagedQty = Math.max(0, item.quantity - val);
                        if (newStatuses[idx].damagedQty > 0) setHasDamages(true);
                        setItemStatuses(newStatuses);
                      }}
                      className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-center font-bold"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Damages toggle & charge calculation */}
        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasDamages}
                onChange={(e) => {
                  setHasDamages(e.target.checked);
                  if (!e.target.checked) setDamageFeeCharged(0);
                }}
                className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
              />
              <span className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                ¿Hubo daños, roturas, manchas permanentes o piezas faltantes?
              </span>
            </label>
          </div>

          {hasDamages && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Monto a Cobrar / Descontar por Daños:
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={damageFeeCharged}
                    onChange={(e) => setDamageFeeCharged(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-3 py-2 bg-white border border-amber-300 rounded-xl text-sm font-bold text-rose-700 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción del Daño / Incidencia:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: 1 silla con pata rota, 2 manteles con cera"
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Deposit settlement summary */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="text-slate-400 text-[11px] font-semibold uppercase">Liquidación de Garantía</p>
            <p className="text-sm font-bold">
              Depósito Inicial: ${initialDeposit.toLocaleString('es-MX')} - Daños: ${damageFeeCharged.toLocaleString('es-MX')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-slate-400 font-semibold block text-[11px]">Monto a Devolver en Efectivo al Cliente:</span>
            <span className="text-xl font-extrabold text-emerald-400">
              ${depositRefund.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Signer inspector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre del Inspector / Almacenista:
            </label>
            <input
              type="text"
              value={inspectedBy}
              onChange={(e) => setInspectedBy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-sm shadow-md flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Finalizar Inspección & Devolución
          </button>
        </div>
      </form>
    </Modal>
  );
};
