export type FurnitureCategory =
  | 'Sillas'
  | 'Mesas'
  | 'Salas Lounge'
  | 'Mantelería y Textiles'
  | 'Barras y Periqueras'
  | 'Toldos y Carpas'
  | 'Vajilla y Cristalería'
  | 'Iluminación y Decoración'
  | 'Otros';

export type FurnitureCondition = 'Excelente' | 'Bueno' | 'Detalles menores' | 'En Mantenimiento';

export interface FurnitureItem {
  id: string;
  name: string;
  code: string; // ej: SIL-001, MES-002
  category: FurnitureCategory;
  description?: string;
  imageUrl: string;
  totalStock: number; // Inventario físico total
  maintenanceStock: number; // En taller / reparación
  rentalPricePerDay: number; // Precio de renta por día o evento
  replacementValue: number; // Costo de reposición en caso de pérdida o daño total
  dimensions?: string; // ej: 1.80m x 0.80m
  color?: string;
  material?: string;
  condition: FurnitureCondition;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;
  businessName?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  address: string;
  city?: string;
  notes?: string;
  identificationNumber?: string; // INE, DNI, RFC
  totalRentalsCount: number;
  totalSpent: number;
  createdAt: string;
}

export type RentalStatus =
  | 'Cotización'
  | 'Reservado'
  | 'En Camino'
  | 'Entregado'
  | 'En Recolección'
  | 'Devuelto'
  | 'Con Incidencia'
  | 'Cancelado';

export interface RentalOrderItem {
  furnitureId: string;
  furnitureName: string;
  furnitureCode: string;
  furnitureImage: string;
  category: FurnitureCategory;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  replacementValue: number;
  // Inspection check at return:
  returnedQuantity?: number;
  damagedQuantity?: number;
  damageNotes?: string;
  damageCharge?: number;
}

export type PaymentMethod = 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Cheque' | 'Otro';

export type PaymentType = 'Anticipo' | 'Liquidación' | 'Depósito Garantía' | 'Devolución Garantía' | 'Cargo por Daños';

export interface PaymentRecord {
  id: string;
  rentalOrderId: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  date: string;
  reference?: string;
  notes?: string;
  receivedBy?: string;
}

export interface InspectionReport {
  inspectedAt: string;
  inspectedBy: string;
  hasDamages: boolean;
  notes: string;
  evidenceImages: string[];
  depositRefundedAmount: number;
  damageFeeCharged: number;
}

export interface RentalOrder {
  id: string;
  folio: string; // ej: REN-2026-001
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  
  // Event & Delivery Details:
  eventName?: string;
  eventLocation: string;
  eventNotes?: string;
  
  startDate: string; // ISO string or YYYY-MM-DD
  endDate: string;   // ISO string or YYYY-MM-DD
  deliveryTime?: string; // ej: "10:00 AM"
  pickupTime?: string;   // ej: "08:00 PM"
  
  items: RentalOrderItem[];
  
  // Cost breakdown:
  itemsSubtotal: number;
  deliveryFee: number;
  setupFee: number;
  discount: number;
  tax: number;
  totalAmount: number;
  
  // Guarantee Deposit:
  guaranteeDeposit: number;
  isDepositReturned: boolean;
  depositReturnDate?: string;
  
  // Payment tracking:
  amountPaid: number;
  balanceDue: number;
  
  // Status & Lifecycle:
  status: RentalStatus;
  
  // Paperless Digital Signature:
  signatureDataUrl?: string; // Base64 signature
  signedAt?: string;
  signedByName?: string;
  
  // Inspection upon return:
  inspection?: InspectionReport;
  
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  name: string;
  slogan: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  rfcOrTaxId: string;
  logoUrl?: string;
  termsAndConditions: string;
  currency: string;
  currencySymbol: string;
}
