import React, { useState } from 'react';
import { RentalOrder, RentalStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { SignaturePad } from '../common/SignaturePad';
import { ReturnInspectionModal } from './ReturnInspectionModal';
import {
  Calendar,
  MapPin,
  Phone,
  DollarSign,
  FileText,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  PlusCircle,
  Clock,
  Printer,
  XCircle,
} from 'lucide-react';
import { generateRentalContractPdf, generateDeliveryChecklistPdf } from '../../utils/pdfGenerator';
import {
  getWhatsAppLink,
  createWhatsAppConfirmationMessage,
  createWhatsAppDeliveryReminderMessage,
} from '../../utils/whatsapp';

interface RentalDetailModalProps {
  rentalId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const RentalDetailModal: React.FC<RentalDetailModalProps> = ({
  rentalId,
  isOpen,
  onClose,
}) => {
  const {
    rentals,
    payments,
    businessProfile,
    updateRentalStatus,
    signRentalContract,
    completeReturnInspection,
    addPayment,
    refundDeposit,
  } = useApp();

  const [isSigning, setIsSigning] = useState(false);
  const [isInspecting, setIsInspecting] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'Efectivo' | 'Transferencia' | 'Tarjeta'>('Efectivo');
  const [paymentNotes, setPaymentNotes] = useState('');

  const rental = rentals.find((r) => r.id === rentalId);
  if (!rental || !isOpen) return null;

  const rentalPayments = payments.filter((p) => p.rentalOrderId === rental.id);

  const handleStatusChange = (status: RentalStatus) => {
    updateRentalStatus(rental.id, status);
  };

  const handleSaveSignature = (signatureDataUrl: string, signedByName: string) => {
    signRentalContract(rental.id, signatureDataUrl, signedByName);
    setIsSigning(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    addPayment({
      rentalOrderId: rental.id,
      amount: paymentAmount,
      type: paymentAmount >= rental.balanceDue ? 'Liquidación' : 'Anticipo',
      method: paymentMethod,
      date: new Date().toISOString(),
      notes: paymentNotes || `Abono a orden ${rental.folio}`,
      receivedBy: 'Caja',
    });

    setIsAddingPayment(false);
    setPaymentAmount(0);
    setPaymentNotes('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Orden de Renta ${rental.folio}`}
      subtitle={`Registrada el ${new Date(rental.createdAt).toLocaleDateString('es-MX')}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Top Status & Quick PDF / WhatsApp Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3">
            <Badge status={rental.status} size="md" />
            <span className="text-xs text-slate-500 font-medium">
              Última actualización: {new Date(rental.updatedAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={getWhatsAppLink(
                rental.clientPhone,
                createWhatsAppConfirmationMessage(rental, businessProfile)
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              WhatsApp
            </a>

            <button
              onClick={() => generateRentalContractPdf(rental, businessProfile)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Contrato PDF
            </button>

            <button
              onClick={() => generateDeliveryChecklistPdf(rental, businessProfile)}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 border border-blue-200"
            >
              <Truck className="w-3.5 h-3.5 text-blue-600" />
              Hoja de Ruta PDF
            </button>
          </div>
        </div>

        {/* Workflow Action Bar */}
        <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600" />
            Flujo de Operación:
          </span>

          <div className="flex flex-wrap gap-2">
            {rental.status === 'Cotización' && (
              <button
                onClick={() => handleStatusChange('Reservado')}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Confirmar y Reservar
              </button>
            )}

            {rental.status === 'Reservado' && (
              <button
                onClick={() => handleStatusChange('En Camino')}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                🚚 Despachar a Ruta
              </button>
            )}

            {rental.status === 'En Camino' && (
              <button
                onClick={() => handleStatusChange('Entregado')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                ✅ Marcar como Entregado
              </button>
            )}

            {rental.status === 'Entregado' && (
              <button
                onClick={() => handleStatusChange('En Recolección')}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                🔄 Mandar Chofer a Recolección
              </button>
            )}

            {['Entregado', 'En Recolección'].includes(rental.status) && (
              <button
                onClick={() => setIsInspecting(true)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                Recibir & Inspeccionar Devolución
              </button>
            )}

            {rental.status !== 'Cancelado' && rental.status !== 'Devuelto' && (
              <button
                onClick={() => handleStatusChange('Cancelado')}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl transition-colors border border-rose-200"
              >
                Cancelar Renta
              </button>
            )}
          </div>
        </div>

        {/* Client and Event Logistics Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Client Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 text-emerald-800">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Datos del Cliente
            </h4>
            <p className="font-bold text-slate-900 text-sm">{rental.clientName}</p>
            <p className="text-slate-600">📞 Teléfono: {rental.clientPhone}</p>
            <p className="text-slate-600">📍 Dirección: {rental.clientAddress}</p>
          </div>

          {/* Event Logistics Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 text-blue-800">
              <Calendar className="w-4 h-4 text-blue-600" />
              Fechas y Lugar del Evento
            </h4>
            <p className="font-bold text-slate-900">
              Evento: {rental.eventName || 'Renta Particular'}
            </p>
            <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
              <div>
                <span className="font-bold block text-slate-700">Entrega:</span>
                <span>📅 {rental.startDate}</span>
                <span className="block text-slate-400">🕒 {rental.deliveryTime || 'A acordar'}</span>
              </div>
              <div>
                <span className="font-bold block text-slate-700">Recolección:</span>
                <span>📅 {rental.endDate}</span>
                <span className="block text-slate-400">🕒 {rental.pickupTime || 'A acordar'}</span>
              </div>
            </div>
            {rental.eventLocation && (
              <p className="text-slate-600 pt-1 border-t border-slate-100 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{rental.eventLocation}</span>
              </p>
            )}
          </div>
        </div>

        {/* Furniture Items Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <div className="bg-slate-100/80 px-4 py-2.5 text-[11px] font-extrabold text-slate-600 uppercase flex items-center justify-between">
            <span>Mobiliario Rentado</span>
            <span>{rental.items.reduce((s, i) => s + i.quantity, 0)} piezas totales</span>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {rental.items.map((item) => (
              <div
                key={item.furnitureId}
                className="p-3 bg-white flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.furnitureImage}
                    alt={item.furnitureName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <p className="font-bold text-slate-800">{item.furnitureName}</p>
                    <p className="text-[11px] text-slate-400">
                      {item.furnitureCode} • ${item.unitPrice} / pieza
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-sm text-slate-900 block">
                    {item.quantity} pzas
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    ${item.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Breakdown & Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Balances & Payment Log */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Historial de Pagos & Abonos
              </h4>
              {rental.balanceDue > 0 && !isAddingPayment && (
                <button
                  onClick={() => {
                    setPaymentAmount(rental.balanceDue);
                    setIsAddingPayment(true);
                  }}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-xs"
                >
                  + Registrar Abono
                </button>
              )}
            </div>

            {/* Quick Add Payment Form */}
            {isAddingPayment && (
              <form onSubmit={handleRecordPayment} className="p-3 bg-white rounded-xl border border-emerald-200 space-y-2 animate-fade-in text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Registrar Pago / Liquidación</span>
                  <button
                    type="button"
                    onClick={() => setIsAddingPayment(false)}
                    className="text-slate-400 hover:text-slate-700 text-[11px]"
                  >
                    Cancelar
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Monto ($):</label>
                    <input
                      type="number"
                      step="0.01"
                      max={rental.balanceDue}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Método:</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-2 py-1 border rounded-lg"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">Transferencia</option>
                      <option value="Tarjeta">Tarjeta</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-1.5 bg-emerald-600 text-white font-bold rounded-lg shadow-xs"
                >
                  Guardar Pago
                </button>
              </form>
            )}

            {/* Payment history items */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {rentalPayments.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">Sin pagos registrados.</p>
              ) : (
                rentalPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-2 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{p.type}</span>
                      <span className="text-[11px] text-slate-400 block">
                        {p.method} • {new Date(p.date).toLocaleDateString('es-MX')}
                      </span>
                    </div>
                    <span className="font-extrabold text-emerald-700">
                      ${p.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Cost Totals */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Subtotal Mobiliario:</span>
              <span>${rental.itemsSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            {rental.deliveryFee > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Flete / Envío:</span>
                <span>${rental.deliveryFee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {rental.setupFee > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Montaje:</span>
                <span>${rental.setupFee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {rental.discount > 0 && (
              <div className="flex justify-between text-rose-400">
                <span>Descuento:</span>
                <span>-${rental.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="pt-2 border-t border-slate-700 flex justify-between text-sm font-extrabold text-white">
              <span>Total Renta:</span>
              <span className="text-emerald-400">
                ${rental.totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between text-amber-300 pt-1">
              <span>Fianza / Garantía (Custodia):</span>
              <span>${rental.guaranteeDeposit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold">
              <span className="text-slate-400">Saldo Pendiente:</span>
              <span
                className={`text-base ${
                  rental.balanceDue > 0 ? 'text-amber-400 font-extrabold' : 'text-emerald-400'
                }`}
              >
                ${rental.balanceDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Digital Signature & Contract Acceptance */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                ✍️ Firma Digital del Contrato
              </h4>
              <p className="text-xs text-slate-500">
                Elimina el papel: el cliente firma en la pantalla del celular o computadora.
              </p>
            </div>

            {!isSigning && (
              <button
                onClick={() => setIsSigning(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {rental.signatureDataUrl ? 'Actualizar Firma' : 'Firmar Ahora en Pantalla'}
              </button>
            )}
          </div>

          {isSigning ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 animate-fade-in">
              <SignaturePad
                onSave={handleSaveSignature}
                initialSignerName={rental.signedByName || rental.clientName}
                onCancel={() => setIsSigning(false)}
              />
            </div>
          ) : rental.signatureDataUrl ? (
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Firmado de Conformidad
                </span>
                <p className="text-xs font-bold text-slate-800 mt-2">
                  Firmante: {rental.signedByName || rental.clientName}
                </p>
                {rental.signedAt && (
                  <p className="text-[11px] text-slate-400">
                    Fecha y Hora: {new Date(rental.signedAt).toLocaleString('es-MX')}
                  </p>
                )}
              </div>

              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-xs max-w-xs">
                <img
                  src={rental.signatureDataUrl}
                  alt="Firma del cliente"
                  className="h-16 w-auto object-contain mx-auto"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60 text-xs text-amber-800 flex items-center justify-between">
              <span>⚠️ Contrato pendiente de firma digital por parte del cliente.</span>
              <button
                onClick={() => setIsSigning(true)}
                className="font-bold underline text-amber-900"
              >
                Capturar firma
              </button>
            </div>
          )}
        </div>

        {/* Inspection Report View if completed */}
        {rental.inspection && (
          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-purple-900 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-purple-600" />
                Reporte de Devolución & Inspección
              </h4>
              <span className="text-[11px] text-purple-700">
                {new Date(rental.inspection.inspectedAt).toLocaleDateString('es-MX')}
              </span>
            </div>
            <p className="text-slate-700">
              <strong>Inspector:</strong> {rental.inspection.inspectedBy}
            </p>
            <p className="text-slate-700">
              <strong>Dictamen:</strong> {rental.inspection.notes}
            </p>
            {rental.inspection.damageFeeCharged > 0 && (
              <p className="text-rose-700 font-bold">
                Cargos por daños aplicados: ${rental.inspection.damageFeeCharged.toLocaleString('es-MX')}
              </p>
            )}
            <p className="text-emerald-700 font-bold">
              Depósito de fianza devuelto: ${rental.inspection.depositRefundedAmount.toLocaleString('es-MX')}
            </p>
          </div>
        )}
      </div>

      {/* Return Inspection Modal */}
      {isInspecting && (
        <ReturnInspectionModal
          isOpen={isInspecting}
          onClose={() => setIsInspecting(false)}
          rental={rental}
          onComplete={(report) => completeReturnInspection(rental.id, report)}
        />
      )}
    </Modal>
  );
};
