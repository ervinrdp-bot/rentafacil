import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client } from '../../types';
import { ClientModal } from './ClientModal';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  CalendarCheck,
  Building,
  FileText,
} from 'lucide-react';
import { cleanPhoneForWhatsApp } from '../../utils/whatsapp';

interface ClientListProps {
  onSelectRental?: (id: string) => void;
  onNewRentalForClient?: (clientId: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  onSelectRental,
  onNewRentalForClient,
}) => {
  const { clients, rentals, addClient, updateClient, deleteClient, isAdmin } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingHistoryClient, setViewingHistoryClient] = useState<Client | null>(null);

  const filteredClients = clients.filter((client) => {
    const q = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(q) ||
      (client.businessName && client.businessName.toLowerCase().includes(q)) ||
      client.phone.includes(q) ||
      client.address.toLowerCase().includes(q) ||
      (client.email && client.email.toLowerCase().includes(q))
    );
  });

  const handleOpenNew = () => {
    setEditingClient(null);
    setIsModalOpen(true);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleSave = (
    data: Omit<Client, 'id' | 'createdAt' | 'totalRentalsCount' | 'totalSpent'>
  ) => {
    if (editingClient) {
      updateClient(editingClient.id, data);
    } else {
      addClient(data);
    }
  };

  // Get rentals for client in history view
  const clientRentals = viewingHistoryClient
    ? rentals.filter((r) => r.clientId === viewingHistoryClient.id)
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, empresa, teléfono o dirección..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Nuevo Cliente
            </button>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No se encontraron clientes</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Registra a tus clientes frecuentes para reutilizar sus datos de entrega y consultar su historial de rentas.
          </p>
          <button
            onClick={handleOpenNew}
            className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-all"
          >
            + Registrar Cliente
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClients.map((client) => {
            const cleanPhone = cleanPhoneForWhatsApp(client.whatsapp || client.phone);

            return (
              <div
                key={client.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Header */}
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-base leading-tight">
                        {client.name}
                      </h4>
                      {client.businessName && (
                        <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                          <Building className="w-3.5 h-3.5" />
                          {client.businessName}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(client)}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Editar cliente"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => deleteClient(client.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {client.identificationNumber && (
                    <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      ID: {client.identificationNumber}
                    </span>
                  )}
                </div>

                {/* Contact & Address */}
                <div className="space-y-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {client.phone}
                    </span>
                    <a
                      href={`https://wa.me/${cleanPhone}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>

                  {client.email && (
                    <div className="flex items-center gap-1.5 font-medium text-slate-500 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  )}

                  <div className="flex items-start gap-1.5 font-medium text-slate-600 pt-1 border-t border-slate-200/40">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{client.address}</span>
                  </div>
                </div>

                {/* Metrics & History Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Historial</p>
                    <p className="text-xs font-bold text-slate-800">
                      {client.totalRentalsCount} rentas • ${client.totalSpent.toLocaleString('es-MX')}
                    </p>
                  </div>

                  <button
                    onClick={() => setViewingHistoryClient(client)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    Ver Pedidos
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Client History Modal */}
      {viewingHistoryClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Historial de Rentas: {viewingHistoryClient.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {clientRentals.length} órdenes registradas
                </p>
              </div>
              <button
                onClick={() => setViewingHistoryClient(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                Cerrar
              </button>
            </div>

            {clientRentals.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                Este cliente no tiene rentas registradas aún.
              </p>
            ) : (
              <div className="space-y-3">
                {clientRentals.map((rental) => (
                  <div
                    key={rental.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800">{rental.folio}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                          {rental.status}
                        </span>
                      </div>
                      <p className="text-slate-500 mt-1">
                        📅 {rental.startDate} al {rental.endDate} • {rental.items.reduce((s, i) => s + i.quantity, 0)} piezas
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-extrabold text-sm text-slate-900">
                        ${rental.totalAmount.toLocaleString('es-MX')}
                      </p>
                      {onSelectRental && (
                        <button
                          onClick={() => {
                            setViewingHistoryClient(null);
                            onSelectRental(rental.id);
                          }}
                          className="text-emerald-700 font-bold hover:underline mt-0.5"
                        >
                          Ver detalle
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingClient}
      />
    </div>
  );
};
