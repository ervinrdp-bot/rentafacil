import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RentalOrder,
  RentalOrderItem,
  FurnitureItem,
  RentalStatus,
} from '../../types';
import { Modal } from '../common/Modal';
import { SignaturePad } from '../common/SignaturePad';
import { ClientModal } from '../clients/ClientModal';
import {
  Calendar,
  User,
  Plus,
  Trash2,
  DollarSign,
  Truck,
  Armchair,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RentalCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdOrder: RentalOrder) => void;
}

export const RentalCreateModal: React.FC<RentalCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    clients,
    furniture,
    addRental,
    addClient,
    getFurnitureAvailability,
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Form State
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || ''
  );
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Dates & Logistics
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(tomorrowStr);
  const [deliveryTime, setDeliveryTime] = useState('09:00 AM');
  const [pickupTime, setPickupTime] = useState('07:00 PM');
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventNotes, setEventNotes] = useState('');

  // Selected Items
  const [selectedItems, setSelectedItems] = useState<
    {
      furniture: FurnitureItem;
      quantity: number;
      customPrice: number;
    }[]
  >([]);

  // Extra fees
  const [deliveryFee, setDeliveryFee] = useState<number>(350);
  const [setupFee, setSetupFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [guaranteeDeposit, setGuaranteeDeposit] = useState<number>(1000);
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [status, setStatus] = useState<RentalStatus>('Reservado');

  // Digital Signature
  const [captureSignature, setCaptureSignature] = useState(false);
  const [signatureData, setSignatureData] = useState<{ url: string; signer: string } | null>(null);

  // Calculations
  const itemsSubtotal = selectedItems.reduce(
    (sum, i) => sum + i.quantity * i.customPrice,
    0
  );
  const totalAmount = Math.max(
    0,
    itemsSubtotal + deliveryFee + setupFee - discount
  );
  const balanceDue = Math.max(0, totalAmount - amountPaid);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleAddItem = (furnitureItem: FurnitureItem) => {
    const existingIndex = selectedItems.findIndex(
      (i) => i.furniture.id === furnitureItem.id
    );
    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          furniture: furnitureItem,
          quantity: 1,
          customPrice: furnitureItem.rentalPricePerDay,
        },
      ]);
    }
  };

  const handleUpdateQuantity = (index: number, qty: number) => {
    if (qty <= 0) {
      handleRemoveItem(index);
      return;
    }
    const updated = [...selectedItems];
    updated[index].quantity = qty;
    setSelectedItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleCreateClientQuick = (clientData: any) => {
    const newClient = addClient(clientData);
    setSelectedClientId(newClient.id);
    setIsClientModalOpen(false);
    if (!eventLocation) {
      setEventLocation(newClient.address);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    if (selectedItems.length === 0) {
      alert('Por favor agrega al menos un mueble a la orden.');
      return;
    }

    const orderItems: RentalOrderItem[] = selectedItems.map((item) => ({
      furnitureId: item.furniture.id,
      furnitureName: item.furniture.name,
      furnitureCode: item.furniture.code,
      furnitureImage: item.furniture.imageUrl,
      category: item.furniture.category,
      quantity: item.quantity,
      unitPrice: item.customPrice,
      subtotal: item.quantity * item.customPrice,
      replacementValue: item.furniture.replacementValue || 0,
    }));

    const createdOrder = addRental({
      clientId: selectedClient.id,
      clientName: selectedClient.name + (selectedClient.businessName ? ` (${selectedClient.businessName})` : ''),
      clientPhone: selectedClient.phone,
      clientAddress: selectedClient.address,
      eventName: eventName.trim() || 'Renta de Mobiliario',
      eventLocation: eventLocation.trim() || selectedClient.address,
      eventNotes,
      startDate,
      endDate,
      deliveryTime,
      pickupTime,
      items: orderItems,
      itemsSubtotal,
      deliveryFee,
      setupFee,
      discount,
      tax: 0,
      totalAmount,
      guaranteeDeposit,
      isDepositReturned: false,
      amountPaid,
      balanceDue,
      status,
      signatureDataUrl: signatureData?.url || '',
      signedByName: signatureData?.signer || '',
      signedAt: signatureData ? new Date().toISOString() : undefined,
    });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore
    }

    if (onSuccess) {
      onSuccess(createdOrder);
    }
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Crear Nueva Renta Digital (Paperless)"
        subtitle="Verificación automática de disponibilidad, cotización y firma digital"
        maxWidth="4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Client & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
            {/* Client selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Cliente *
                </label>
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(true)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" /> + Nuevo Cliente
                </button>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => {
                    setSelectedClientId(e.target.value);
                    const cl = clients.find((c) => c.id === e.target.value);
                    if (cl && !eventLocation) setEventLocation(cl.address);
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.businessName ? `(${c.businessName})` : ''} - 📞 {c.phone}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Event Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nombre / Motivo del Evento
              </label>
              <input
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="Ej: Boda Alejandra & Carlos / Fiesta Privada"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Date Start / Delivery */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  📅 Fecha Entrega *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  🕒 Hora Entrega
                </label>
                <input
                  type="text"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  placeholder="Ej: 10:00 AM"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Date End / Pickup */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  🔄 Fecha Recolección *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  🕒 Hora Recolección
                </label>
                <input
                  type="text"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  placeholder="Ej: 08:00 PM"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Event Location */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lugar / Dirección de Entrega y Montaje
              </label>
              <input
                type="text"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Calle, colonia, salón o referencias de acceso..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Step 2: Item Selection & Availability */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Armchair className="w-4 h-4 text-emerald-600" />
                  Mobiliario a Rentar
                </h4>
                <p className="text-xs text-slate-500">
                  Disponibilidad calculada automáticamente para las fechas seleccionadas ({startDate} al {endDate})
                </p>
              </div>
            </div>

            {/* Quick Furniture Picker horizontal list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1 bg-slate-50/50 rounded-2xl border border-slate-200">
              {furniture.map((item) => {
                const avail = getFurnitureAvailability(item.id, startDate, endDate);
                const isSelected = selectedItems.some((i) => i.furniture.id === item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAddItem(item)}
                    disabled={avail.available <= 0}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between text-xs ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 shadow-xs ring-1 ring-emerald-500'
                        : avail.available > 0
                        ? 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        : 'bg-slate-100 border-slate-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400">{item.code}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[11px]">
                      <span className="font-extrabold text-slate-900">${item.rentalPricePerDay}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-bold ${
                          avail.available > 0
                            ? 'text-emerald-700 bg-emerald-100/80'
                            : 'text-rose-700 bg-rose-100'
                        }`}
                      >
                        {avail.available} disp.
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Items Table */}
            {selectedItems.length > 0 && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/90 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Mobiliario</th>
                      <th className="p-3 text-center">Cantidad</th>
                      <th className="p-3 text-right">Precio Unitario</th>
                      <th className="p-3 text-right">Subtotal</th>
                      <th className="p-3 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {selectedItems.map((item, idx) => {
                      const avail = getFurnitureAvailability(
                        item.furniture.id,
                        startDate,
                        endDate
                      );
                      const isExceeding = item.quantity > avail.available;

                      return (
                        <tr key={item.furniture.id} className="bg-white hover:bg-slate-50/60">
                          <td className="p-3 flex items-center gap-2.5">
                            <img
                              src={item.furniture.imageUrl}
                              alt={item.furniture.name}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                            />
                            <div>
                              <p className="font-bold text-slate-800">{item.furniture.name}</p>
                              <span className="text-[10px] text-slate-400">
                                {item.furniture.code} • Disp: {avail.available}
                              </span>
                              {isExceeding && (
                                <span className="block text-[10px] text-rose-600 font-bold">
                                  ⚠️ Cantidad mayor a stock disponible ({avail.available})
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(idx, item.quantity - 1)}
                                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateQuantity(idx, parseInt(e.target.value) || 1)
                                }
                                className="w-14 text-center py-1 bg-slate-50 border rounded-lg font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => handleUpdateQuantity(idx, item.quantity + 1)}
                                className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="p-3 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.customPrice}
                              onChange={(e) => {
                                const newPrice = parseFloat(e.target.value) || 0;
                                const updated = [...selectedItems];
                                updated[idx].customPrice = newPrice;
                                setSelectedItems(updated);
                              }}
                              className="w-20 text-right px-2 py-1 bg-slate-50 border rounded-lg font-bold"
                            />
                          </td>

                          <td className="p-3 text-right font-extrabold text-slate-900">
                            ${(item.quantity * item.customPrice).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>

                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Step 3: Fees & Summary Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider">
                Cargos Adicionales & Descuentos
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    🚚 Flete / Transporte ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    🏗️ Montaje / Maniobra ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={setupFee}
                    onChange={(e) => setSetupFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    🏷️ Descuento Especial ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border rounded-xl font-bold text-rose-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    🛡️ Depósito Garantía / Fianza ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={guaranteeDeposit}
                    onChange={(e) => setGuaranteeDeposit(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-white border rounded-xl font-bold text-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  💵 Anticipo Inicial Pagado Hoy ($)
                </label>
                <input
                  type="number"
                  min="0"
                  max={totalAmount}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border rounded-xl font-bold text-emerald-700"
                />
              </div>
            </div>

            {/* Summary Box */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between space-y-3 text-xs">
              <div className="space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal Mobiliario:</span>
                  <span>${itemsSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Flete:</span>
                    <span>${deliveryFee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {setupFee > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span>Montaje:</span>
                    <span>${setupFee.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-rose-400">
                    <span>Descuento:</span>
                    <span>-${discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-700 flex justify-between text-base font-extrabold text-white">
                  <span>Total Contrato:</span>
                  <span className="text-emerald-400">
                    ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-amber-300">
                  <span>Fianza en Custodia:</span>
                  <span>${guaranteeDeposit.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold">
                  <span className="text-slate-400">Saldo a Liquidar:</span>
                  <span className="text-amber-400 font-extrabold">
                    ${balanceDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Digital signature trigger */}
              <div className="pt-2 border-t border-slate-800">
                {!signatureData ? (
                  <button
                    type="button"
                    onClick={() => setCaptureSignature(true)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    ✍️ Firmar Digitalmente en Pantalla (Opcional)
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-950/60 p-2 rounded-xl border border-emerald-500/30">
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Firmado por: {signatureData.signer}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCaptureSignature(true)}
                      className="text-[10px] text-slate-300 underline"
                    >
                      Cambiar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Signature modal popup if requested */}
          {captureSignature && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 animate-fade-in">
              <h4 className="font-bold text-slate-800 text-xs">Captura de Firma Digital</h4>
              <SignaturePad
                initialSignerName={selectedClient?.name || ''}
                onSave={(url, signer) => {
                  setSignatureData({ url, signer });
                  setCaptureSignature(false);
                }}
                onCancel={() => setCaptureSignature(false)}
              />
            </div>
          )}

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
              disabled={selectedItems.length === 0}
              className={`px-6 py-2.5 rounded-xl text-sm font-extrabold shadow-md transition-all flex items-center gap-2 ${
                selectedItems.length > 0
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Guardar Renta Digital
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Client Modal */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleCreateClientQuick}
      />
    </>
  );
};
