import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentType, PaymentMethod } from '../../types';
import { StatCard } from '../common/StatCard';
import {
  WalletCards,
  DollarSign,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Calendar,
} from 'lucide-react';

export const FinancesView: React.FC = () => {
  const { payments, rentals, deletePayment, isAdmin } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('Todos');

  // Calculations
  const totalRentalsAmount = rentals
    .filter((r) => r.status !== 'Cancelado')
    .reduce((sum, r) => sum + r.totalAmount, 0);

  const totalCollected = rentals
    .filter((r) => r.status !== 'Cancelado')
    .reduce((sum, r) => sum + r.amountPaid, 0);

  const totalPendingBalance = rentals
    .filter((r) => r.status !== 'Cancelado')
    .reduce((sum, r) => sum + r.balanceDue, 0);

  const totalDepositsCustody = rentals
    .filter((r) => !r.isDepositReturned && r.guaranteeDeposit > 0 && r.status !== 'Cancelado')
    .reduce((sum, r) => sum + r.guaranteeDeposit, 0);

  const filteredPayments = payments.filter((payment) => {
    const rental = rentals.find((r) => r.id === payment.rentalOrderId);
    const folio = rental ? rental.folio : '';
    const client = rental ? rental.clientName : '';

    const matchesSearch =
      folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.method.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.notes && payment.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'Todos' || payment.type === selectedType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Cobrado"
          value={`$${totalCollected.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
          subtitle="Ingresos por rentas recibidos"
          icon={ArrowDownLeft}
          color="emerald"
        />
        <StatCard
          title="Cuentas por Cobrar"
          value={`$${totalPendingBalance.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
          subtitle="Saldos pendientes al entregar"
          icon={AlertCircle}
          color={totalPendingBalance > 0 ? 'amber' : 'emerald'}
        />
        <StatCard
          title="Fianzas en Custodia"
          value={`$${totalDepositsCustody.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
          subtitle="Depósitos de garantía a devolver"
          icon={ShieldCheck}
          color="purple"
        />
        <StatCard
          title="Total Facturado"
          value={`$${totalRentalsAmount.toLocaleString('es-MX', { minimumFractionDigits: 0 })}`}
          subtitle="Valor total de contratos"
          icon={WalletCards}
          color="blue"
        />
      </div>

      {/* Payments History Table */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Libro Diario de Movimientos & Pagos
            </h3>
            <p className="text-xs text-slate-500">
              Registro histórico de anticipos, liquidaciones, depósitos y devoluciones de fianza.
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pago, folio, cliente..."
              className="w-full pl-9 pr-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          {['Todos', 'Anticipo', 'Liquidación', 'Depósito Garantía', 'Devolución Garantía', 'Cargo por Daños'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition-all ${
                selectedType === type
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Fecha / Hora</th>
                <th className="py-3 px-4">Folio / Cliente</th>
                <th className="py-3 px-4">Concepto</th>
                <th className="py-3 px-4">Método</th>
                <th className="py-3 px-4">Notas</th>
                <th className="py-3 px-4 text-right">Monto</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No se encontraron movimientos registrados.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const rental = rentals.find((r) => r.id === p.rentalOrderId);
                  const isExpense = p.type === 'Devolución Garantía';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(p.date).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900 block">
                          {rental?.folio || 'N/A'}
                        </span>
                        <span className="text-[11px] text-slate-500 truncate block max-w-xs">
                          {rental?.clientName || 'Cliente'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            p.type === 'Liquidación'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.type === 'Anticipo'
                              ? 'bg-blue-100 text-blue-800'
                              : p.type === 'Depósito Garantía'
                              ? 'bg-purple-100 text-purple-800'
                              : p.type === 'Devolución Garantía'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {p.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-600">{p.method}</td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs truncate">
                        {p.notes || '-'}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-extrabold text-sm ${
                          isExpense ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {isExpense ? '-' : '+'}${p.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isAdmin && (
                          <button
                            onClick={() => deletePayment(p.id)}
                            className="p-1 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                            title="Eliminar movimiento"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
