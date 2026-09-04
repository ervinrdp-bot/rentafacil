import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  FurnitureItem,
  Client,
  RentalOrder,
  PaymentRecord,
  BusinessProfile,
  RentalStatus,
  InspectionReport,
} from '../types';
import { storageService } from '../services/storage';
import {
  isFirebaseConfigured,
  saveBusinessProfile,
  saveCollection,
  subscribeToBusinessProfile,
  subscribeToCollection,
} from '../services/firebase';

interface StockAvailability {
  total: number;
  maintenance: number;
  rented: number;
  available: number;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface CurrentUser {
  username: string;
  role: 'admin' | 'operator';
}

interface AppContextType {
  // Authentication
  currentUser: CurrentUser | null;
  isAdmin: boolean;
  loginUser: (username: string, pin: string) => boolean;
  logoutUser: () => void;

  // Navigation & UI
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Data
  furniture: FurnitureItem[];
  clients: Client[];
  rentals: RentalOrder[];
  payments: PaymentRecord[];
  businessProfile: BusinessProfile;

  // Availability & Calculations
  getFurnitureAvailability: (
    furnitureId: string,
    startDate?: string,
    endDate?: string,
    excludeRentalId?: string
  ) => StockAvailability;

  // Furniture CRUD
  addFurniture: (item: Omit<FurnitureItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateFurniture: (id: string, updates: Partial<FurnitureItem>) => void;
  deleteFurniture: (id: string) => boolean;

  // Client CRUD
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'totalRentalsCount' | 'totalSpent'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => boolean;

  // Rental CRUD & Lifecycle
  addRental: (order: Omit<RentalOrder, 'id' | 'folio' | 'createdAt' | 'updatedAt'>) => RentalOrder;
  updateRental: (id: string, updates: Partial<RentalOrder>) => void;
  deleteRental: (id: string) => boolean;
  updateRentalStatus: (id: string, status: RentalStatus) => void;
  signRentalContract: (id: string, signatureDataUrl: string, signedByName: string) => void;
  completeReturnInspection: (id: string, report: InspectionReport) => void;

  // Payments
  addPayment: (payment: Omit<PaymentRecord, 'id'>) => void;
  deletePayment: (id: string) => void;
  refundDeposit: (rentalId: string, refundAmount: number, notes?: string) => void;

  // Settings & System
  updateBusinessProfile: (profile: BusinessProfile) => void;
  exportDatabase: () => void;
  importDatabase: (jsonString: string) => boolean;
  resetAllData: () => void;

  // Modal triggers
  openRentalModalWithId?: string;
  setOpenRentalModalWithId: (id?: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = 'renta_muebles_auth_v1';
const VALID_USERS: Record<string, string> = {
  admin: '1234',
  user1: '5678',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [openRentalModalWithId, setOpenRentalModalWithId] = useState<string | undefined>();
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!saved) return null;

    try {
      return JSON.parse(saved) as CurrentUser;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const isAdmin = currentUser?.role === 'admin';

  const loginUser = (username: string, pin: string): boolean => {
    const normalizedUser = username.trim().toLowerCase();
    const normalizedPin = pin.trim();

    if (!VALID_USERS[normalizedUser]) {
      showToast('Usuario no válido.', 'error');
      return false;
    }

    if (VALID_USERS[normalizedUser] !== normalizedPin) {
      showToast('PIN incorrecto.', 'error');
      return false;
    }

    const nextUser: CurrentUser = {
      username: normalizedUser,
      role: normalizedUser === 'admin' ? 'admin' : 'operator',
    };

    setCurrentUser(nextUser);
    showToast(`Bienvenido ${normalizedUser}.`, 'success');
    return true;
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    showToast('Sesión cerrada.', 'info');
  };

  // State loaded from Storage
  const [furniture, setFurniture] = useState<FurnitureItem[]>(() => storageService.getFurniture());
  const [clients, setClients] = useState<Client[]>(() => storageService.getClients());
  const [rentals, setRentals] = useState<RentalOrder[]>(() => storageService.getRentals());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => storageService.getPayments());
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => storageService.getBusinessProfile());
  const cloudReadyRef = useRef(false);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const handleError = () => {
      showToast('Firestore no está disponible; se mantienen los datos locales.', 'error');
    };

    const unsubscribeFurniture = subscribeToCollection<FurnitureItem>('furniture', (items) => {
      if (items.length > 0) setFurniture(items);
      else void saveCollection('furniture', furniture);
    }, handleError);
    const unsubscribeClients = subscribeToCollection<Client>('clients', (items) => {
      if (items.length > 0) setClients(items);
      else void saveCollection('clients', clients);
    }, handleError);
    const unsubscribeRentals = subscribeToCollection<RentalOrder>('rentals', (items) => {
      if (items.length > 0) setRentals(items);
      else void saveCollection('rentals', rentals);
    }, handleError);
    const unsubscribePayments = subscribeToCollection<PaymentRecord>('payments', (items) => {
      if (items.length > 0) setPayments(items);
      else void saveCollection('payments', payments);
    }, handleError);
    const unsubscribeBusiness = subscribeToBusinessProfile<BusinessProfile>((profile) => {
      if (profile) setBusinessProfile(profile);
      else void saveBusinessProfile(businessProfile);
    }, handleError);

    cloudReadyRef.current = true;

    return () => {
      unsubscribeFurniture();
      unsubscribeClients();
      unsubscribeRentals();
      unsubscribePayments();
      unsubscribeBusiness();
      cloudReadyRef.current = false;
    };
  }, []);

  // Save changes automatically
  useEffect(() => {
    storageService.saveFurniture(furniture);
    if (cloudReadyRef.current) void saveCollection('furniture', furniture);
  }, [furniture]);

  useEffect(() => {
    storageService.saveClients(clients);
    if (cloudReadyRef.current) void saveCollection('clients', clients);
  }, [clients]);

  useEffect(() => {
    storageService.saveRentals(rentals);
    if (cloudReadyRef.current) void saveCollection('rentals', rentals);
  }, [rentals]);

  useEffect(() => {
    storageService.savePayments(payments);
    if (cloudReadyRef.current) void saveCollection('payments', payments);
  }, [payments]);

  useEffect(() => {
    storageService.saveBusinessProfile(businessProfile);
    if (cloudReadyRef.current) void saveBusinessProfile(businessProfile);
  }, [businessProfile]);

  // Toast notification helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Stock availability calculation for any given date range
  const getFurnitureAvailability = (
    furnitureId: string,
    startDate?: string,
    endDate?: string,
    excludeRentalId?: string
  ): StockAvailability => {
    const item = furniture.find((f) => f.id === furnitureId);
    if (!item) {
      return { total: 0, maintenance: 0, rented: 0, available: 0 };
    }

    const total = item.totalStock;
    const maintenance = item.maintenanceStock || 0;

    // Filter rentals that overlap with the queried date range
    // If no dates provided, check currently active rentals (Reservado, En Camino, Entregado, En Recolección)
    let rented = 0;

    const activeStatuses: RentalStatus[] = ['Reservado', 'En Camino', 'Entregado', 'En Recolección'];

    rentals.forEach((rental) => {
      if (rental.id === excludeRentalId) return;
      if (!activeStatuses.includes(rental.status)) return;

      let isOverlapping = true;
      if (startDate && endDate) {
        // Date overlap check: (StartA <= EndB) and (EndA >= StartB)
        const startA = new Date(rental.startDate).getTime();
        const endA = new Date(rental.endDate).getTime();
        const startB = new Date(startDate).getTime();
        const endB = new Date(endDate).getTime();

        isOverlapping = startA <= endB && endA >= startB;
      }

      if (isOverlapping) {
        const lineItem = rental.items.find((i) => i.furnitureId === furnitureId);
        if (lineItem) {
          rented += lineItem.quantity;
        }
      }
    });

    const available = Math.max(0, total - maintenance - rented);

    return { total, maintenance, rented, available };
  };

  // Furniture CRUD
  const addFurniture = (item: Omit<FurnitureItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newItem: FurnitureItem = {
      ...item,
      id: 'f-' + Date.now(),
      createdAt: now,
      updatedAt: now,
    };
    setFurniture((prev) => [newItem, ...prev]);
    showToast(`Artículo "${newItem.name}" agregado al inventario.`, 'success');
  };

  const updateFurniture = (id: string, updates: Partial<FurnitureItem>) => {
    const now = new Date().toISOString();
    setFurniture((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates, updatedAt: now } : item))
    );
    showToast('Inventario actualizado exitosamente.', 'success');
  };

  const deleteFurniture = (id: string): boolean => {
    if (!isAdmin) {
      showToast('Solo el administrador puede eliminar muebles.', 'error');
      return false;
    }

    // Check if in active rental
    const isRented = rentals.some(
      (r) =>
        ['Reservado', 'En Camino', 'Entregado', 'En Recolección'].includes(r.status) &&
        r.items.some((i) => i.furnitureId === id)
    );
    if (isRented) {
      showToast('No se puede eliminar: el mueble está asignado a un pedido activo.', 'error');
      return false;
    }
    setFurniture((prev) => prev.filter((item) => item.id !== id));
    showToast('Mueble eliminado del inventario.', 'info');
    return true;
  };

  // Client CRUD
  const addClient = (
    clientData: Omit<Client, 'id' | 'createdAt' | 'totalRentalsCount' | 'totalSpent'>
  ): Client => {
    const newClient: Client = {
      ...clientData,
      id: 'c-' + Date.now(),
      totalRentalsCount: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };
    setClients((prev) => [newClient, ...prev]);
    showToast(`Cliente "${newClient.name}" registrado correctamente.`, 'success');
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast('Datos de cliente actualizados.', 'success');
  };

  const deleteClient = (id: string): boolean => {
    if (!isAdmin) {
      showToast('Solo el administrador puede eliminar clientes.', 'error');
      return false;
    }

    const hasRentals = rentals.some((r) => r.clientId === id);
    if (hasRentals) {
      showToast('No se puede eliminar: el cliente tiene historial de rentas.', 'error');
      return false;
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
    showToast('Cliente eliminado.', 'info');
    return true;
  };

  // Rental CRUD & Lifecycle
  const addRental = (
    orderData: Omit<RentalOrder, 'id' | 'folio' | 'createdAt' | 'updatedAt'>
  ): RentalOrder => {
    const count = rentals.length + 1;
    const year = new Date().getFullYear();
    const folio = `REN-${year}-${String(count).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newOrder: RentalOrder = {
      ...orderData,
      id: 'r-' + Date.now(),
      folio,
      createdAt: now,
      updatedAt: now,
    };

    setRentals((prev) => [newOrder, ...prev]);

    // Update client stats
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === newOrder.clientId) {
          return {
            ...c,
            totalRentalsCount: c.totalRentalsCount + 1,
            totalSpent: c.totalSpent + newOrder.totalAmount,
          };
        }
        return c;
      })
    );

    // If initial payment was registered with order creation
    if (newOrder.amountPaid > 0) {
      const payment: PaymentRecord = {
        id: 'pay-' + Date.now(),
        rentalOrderId: newOrder.id,
        amount: newOrder.amountPaid,
        type: newOrder.amountPaid >= newOrder.totalAmount ? 'Liquidación' : 'Anticipo',
        method: 'Efectivo',
        date: now,
        notes: `Pago inicial registrado al crear orden ${folio}`,
        receivedBy: 'Sistema',
      };
      setPayments((prev) => [payment, ...prev]);
    }

    // If guarantee deposit was received
    if (newOrder.guaranteeDeposit > 0) {
      const depositPayment: PaymentRecord = {
        id: 'pay-dep-' + Date.now(),
        rentalOrderId: newOrder.id,
        amount: newOrder.guaranteeDeposit,
        type: 'Depósito Garantía',
        method: 'Efectivo',
        date: now,
        notes: `Depósito en garantía registrado para orden ${folio}`,
        receivedBy: 'Sistema',
      };
      setPayments((prev) => [depositPayment, ...prev]);
    }

    showToast(`Renta ${folio} creada exitosamente.`, 'success');
    return newOrder;
  };

  const updateRental = (id: string, updates: Partial<RentalOrder>) => {
    const now = new Date().toISOString();
    setRentals((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: now } : r))
    );
    showToast('Orden de renta actualizada.', 'success');
  };

  const deleteRental = (id: string): boolean => {
    if (!isAdmin) {
      showToast('Solo el administrador puede eliminar rentas.', 'error');
      return false;
    }

    setRentals((prev) => prev.filter((r) => r.id !== id));
    setPayments((prev) => prev.filter((p) => p.rentalOrderId !== id));
    showToast('Orden de renta eliminada.', 'info');
    return true;
  };

  const updateRentalStatus = (id: string, status: RentalStatus) => {
    const now = new Date().toISOString();
    setRentals((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return { ...r, status, updatedAt: now };
        }
        return r;
      })
    );
    showToast(`Estado de la renta cambiado a: ${status}`, 'info');
  };

  const signRentalContract = (id: string, signatureDataUrl: string, signedByName: string) => {
    const now = new Date().toISOString();
    setRentals((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            signatureDataUrl,
            signedByName,
            signedAt: now,
            updatedAt: now,
          };
        }
        return r;
      })
    );
    showToast('¡Contrato firmado digitalmente con éxito!', 'success');
  };

  const completeReturnInspection = (id: string, report: InspectionReport) => {
    const now = new Date().toISOString();
    setRentals((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            status: report.hasDamages ? 'Con Incidencia' : 'Devuelto',
            inspection: report,
            isDepositReturned: report.depositRefundedAmount > 0,
            depositReturnDate: now,
            updatedAt: now,
          };
        }
        return r;
      })
    );

    // Record refund or damage fee in payments
    if (report.depositRefundedAmount > 0) {
      const refundRecord: PaymentRecord = {
        id: 'pay-ref-' + Date.now(),
        rentalOrderId: id,
        amount: report.depositRefundedAmount,
        type: 'Devolución Garantía',
        method: 'Efectivo',
        date: now,
        notes: `Devolución de fianza/garantía tras inspección de devolución.`,
        receivedBy: report.inspectedBy,
      };
      setPayments((prev) => [refundRecord, ...prev]);
    }

    if (report.damageFeeCharged > 0) {
      const damageRecord: PaymentRecord = {
        id: 'pay-dam-' + Date.now(),
        rentalOrderId: id,
        amount: report.damageFeeCharged,
        type: 'Cargo por Daños',
        method: 'Efectivo',
        date: now,
        notes: `Cobro por daños/faltantes: ${report.notes}`,
        receivedBy: report.inspectedBy,
      };
      setPayments((prev) => [damageRecord, ...prev]);
    }

    showToast('Inspección de devolución guardada correctamente.', 'success');
  };

  // Payments
  const addPayment = (paymentData: Omit<PaymentRecord, 'id'>) => {
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: 'pay-' + Date.now(),
    };
    setPayments((prev) => [newPayment, ...prev]);

    // Recalculate balance on the rental
    if (paymentData.type === 'Anticipo' || paymentData.type === 'Liquidación') {
      setRentals((prev) =>
        prev.map((r) => {
          if (r.id === paymentData.rentalOrderId) {
            const newAmountPaid = r.amountPaid + paymentData.amount;
            const newBalanceDue = Math.max(0, r.totalAmount - newAmountPaid);
            return {
              ...r,
              amountPaid: newAmountPaid,
              balanceDue: newBalanceDue,
              updatedAt: new Date().toISOString(),
            };
          }
          return r;
        })
      );
    }

    showToast('Pago registrado correctamente.', 'success');
  };

  const deletePayment = (id: string) => {
    if (!isAdmin) {
      showToast('Solo el administrador puede eliminar movimientos de pago.', 'error');
      return;
    }

    const payment = payments.find((p) => p.id === id);
    if (!payment) return;

    // Adjust rental balance if needed
    if (payment.type === 'Anticipo' || payment.type === 'Liquidación') {
      setRentals((prev) =>
        prev.map((r) => {
          if (r.id === payment.rentalOrderId) {
            const newAmountPaid = Math.max(0, r.amountPaid - payment.amount);
            const newBalanceDue = Math.max(0, r.totalAmount - newAmountPaid);
            return {
              ...r,
              amountPaid: newAmountPaid,
              balanceDue: newBalanceDue,
              updatedAt: new Date().toISOString(),
            };
          }
          return r;
        })
      );
    }

    setPayments((prev) => prev.filter((p) => p.id !== id));
    showToast('Registro de pago eliminado.', 'info');
  };

  const refundDeposit = (rentalId: string, refundAmount: number, notes?: string) => {
    const now = new Date().toISOString();
    const payment: PaymentRecord = {
      id: 'pay-ref-' + Date.now(),
      rentalOrderId: rentalId,
      amount: refundAmount,
      type: 'Devolución Garantía',
      method: 'Efectivo',
      date: now,
      notes: notes || 'Devolución total o parcial de fianza en garantía',
      receivedBy: 'Caja',
    };
    setPayments((prev) => [payment, ...prev]);

    setRentals((prev) =>
      prev.map((r) => {
        if (r.id === rentalId) {
          return {
            ...r,
            isDepositReturned: true,
            depositReturnDate: now,
            updatedAt: now,
          };
        }
        return r;
      })
    );
    showToast('Depósito de garantía devuelto exitosamente.', 'success');
  };

  // Settings & Database Backup
  const updateBusinessProfile = (profile: BusinessProfile) => {
    setBusinessProfile(profile);
    showToast('Datos de la empresa actualizados.', 'success');
  };

  const exportDatabase = () => {
    const jsonStr = storageService.exportDatabase();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rentafacil_respaldo_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Respaldo descargado exitosamente.', 'success');
  };

  const importDatabase = (jsonString: string): boolean => {
    const success = storageService.importDatabase(jsonString);
    if (success) {
      setFurniture(storageService.getFurniture());
      setClients(storageService.getClients());
      setRentals(storageService.getRentals());
      setPayments(storageService.getPayments());
      setBusinessProfile(storageService.getBusinessProfile());
      showToast('Base de datos importada correctamente.', 'success');
      return true;
    } else {
      showToast('Error al importar el archivo de respaldo.', 'error');
      return false;
    }
  };

  const resetAllData = () => {
    if (!isAdmin) {
      showToast('Solo el administrador puede restablecer la base de datos.', 'error');
      return;
    }

    storageService.resetToDefaults();
    setFurniture(storageService.getFurniture());
    setClients(storageService.getClients());
    setRentals(storageService.getRentals());
    setPayments(storageService.getPayments());
    setBusinessProfile(storageService.getBusinessProfile());
    showToast('Sistema restablecido con los datos iniciales de demostración.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAdmin,
        loginUser,
        logoutUser,
        activeTab,
        setActiveTab,
        searchTerm,
        setSearchTerm,
        toasts,
        showToast,
        removeToast,
        furniture,
        clients,
        rentals,
        payments,
        businessProfile,
        getFurnitureAvailability,
        addFurniture,
        updateFurniture,
        deleteFurniture,
        addClient,
        updateClient,
        deleteClient,
        addRental,
        updateRental,
        deleteRental,
        updateRentalStatus,
        signRentalContract,
        completeReturnInspection,
        addPayment,
        deletePayment,
        refundDeposit,
        updateBusinessProfile,
        exportDatabase,
        importDatabase,
        resetAllData,
        openRentalModalWithId,
        setOpenRentalModalWithId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
