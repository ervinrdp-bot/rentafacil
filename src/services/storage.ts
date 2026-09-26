import { FurnitureItem, Client, RentalOrder, PaymentRecord, BusinessProfile } from '../types';

const STORAGE_KEYS = {
  FURNITURE: 'rentafacil_furniture_v1',
  CLIENTS: 'rentafacil_clients_v1',
  RENTALS: 'rentafacil_rentals_v1',
  PAYMENTS: 'rentafacil_payments_v1',
  BUSINESS: 'rentafacil_business_v1',
};

export const defaultBusinessProfile: BusinessProfile = {
  name: 'Mobiliario & Eventos Premier',
  slogan: 'Renta de Muebles Finos, Toldos y Montajes para Eventos',
  phone: '+52 55 4123 4567',
  whatsapp: '5215541234567',
  email: 'contacto@mobiliariopremier.com',
  address: 'Av. Insurgentes Sur 1450, Col. Actipan, CDMX',
  rfcOrTaxId: 'MEP-240101-AB1',
  logoUrl: '',
  currency: 'MXN',
  currencySymbol: '$',
  termsAndConditions: `1. El arrendatario se compromete a cuidar el mobiliario y devolverlo en las mismas condiciones en que fue entregado.
2. Todo daño, faltante, quemadura o mancha permanente será descontado del depósito de garantía o cobrado al costo de reposición.
3. El horario de entrega y recolección debe respetarse. Retrasos imputables al cliente generarán cargos adicionales.
4. Para formalizar la reserva se requiere un anticipo mínimo del 50% y el depósito de garantía.
5. El saldo total debe ser liquidado antes o al momento de la entrega de los muebles.`,
};

export const defaultFurniture: FurnitureItem[] = [
  {
    id: 'f-1',
    name: 'Silla Crossback Madera Nogal',
    code: 'SIL-001',
    category: 'Sillas',
    description: 'Silla rústica elegante de madera de roble con acabado nogal y cojín de lino beige.',
    imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80',
    totalStock: 150,
    maintenanceStock: 4,
    rentalPricePerDay: 45,
    replacementValue: 650,
    dimensions: '45cm x 45cm x 88cm',
    color: 'Nogal / Lino',
    material: 'Madera de Roble',
    condition: 'Excelente',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'f-2',
    name: 'Silla Tiffany Blanca Clásica',
    code: 'SIL-002',
    category: 'Sillas',
    description: 'Silla de resina de alta resistencia con cojín vinipiel blanco. Ideal para bodas y galas.',
    imageUrl: 'https://images.unsplash.com/photo-1580481077195-c9a89d701cb1?auto=format&fit=crop&w=600&q=80',
    totalStock: 200,
    maintenanceStock: 0,
    rentalPricePerDay: 35,
    replacementValue: 480,
    dimensions: '40cm x 40cm x 92cm',
    color: 'Blanco',
    material: 'Resina Monobloque',
    condition: 'Excelente',
    createdAt: '2026-01-12T10:00:00Z',
    updatedAt: '2026-01-12T10:00:00Z',
  },
  {
    id: 'f-3',
    name: 'Mesa Tablón Madera Rústica (10 personas)',
    code: 'MES-001',
    category: 'Mesas',
    description: 'Tablón de madera maciza de pino con patas abatibles reforzadas. 2.40m de largo.',
    imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80',
    totalStock: 25,
    maintenanceStock: 1,
    rentalPricePerDay: 280,
    replacementValue: 3200,
    dimensions: '2.40m x 1.00m x 0.75m',
    color: 'Madera Natural Encerada',
    material: 'Pino Tratado',
    condition: 'Excelente',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'f-4',
    name: 'Mesa Redonda Banquete (10 personas)',
    code: 'MES-002',
    category: 'Mesas',
    description: 'Mesa circular de madera con recubrimiento vinílico y cantos protegidos en aluminio.',
    imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=600&q=80',
    totalStock: 30,
    maintenanceStock: 0,
    rentalPricePerDay: 180,
    replacementValue: 2400,
    dimensions: 'Diámetro 1.50m x 0.75m alto',
    color: 'Blanco / Madera',
    material: 'Triplay y Marco de Acero',
    condition: 'Excelente',
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'f-5',
    name: 'Sala Lounge Chesterfield Blanco (8 personas)',
    code: 'SAL-001',
    category: 'Salas Lounge',
    description: 'Set completo incluye: 1 Sillón triple, 1 Love seat, 2 Sillones individuales y mesa de centro con iluminación LED.',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    totalStock: 8,
    maintenanceStock: 0,
    rentalPricePerDay: 1200,
    replacementValue: 14500,
    dimensions: 'Set modular 3.2m x 2.8m',
    color: 'Blanco Capitonado',
    material: 'Vinipiel náutico y madera estufada',
    condition: 'Excelente',
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'f-6',
    name: 'Set Periquera Alta Madera y Metal (4 bancos)',
    code: 'BAR-001',
    category: 'Barras y Periqueras',
    description: 'Mesa alta tipo cóctel con base de herrería negra mate y 4 bancos tipo Tolix de madera y metal.',
    imageUrl: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=600&q=80',
    totalStock: 16,
    maintenanceStock: 2,
    rentalPricePerDay: 350,
    replacementValue: 4200,
    dimensions: 'Mesa 0.80m x 0.80m x 1.05m',
    color: 'Negro / Madera Parota',
    material: 'Acero y Madera',
    condition: 'Excelente',
    createdAt: '2026-01-22T10:00:00Z',
    updatedAt: '2026-01-22T10:00:00Z',
  },
  {
    id: 'f-7',
    name: 'Toldo Panorámico Elegance 6x12m',
    code: 'TOL-001',
    category: 'Toldos y Carpas',
    description: 'Carpa estructural de lona blackout impermeable blanca a 4 aguas con cubrepostes de tela.',
    imageUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=600&q=80',
    totalStock: 4,
    maintenanceStock: 0,
    rentalPricePerDay: 3800,
    replacementValue: 38000,
    dimensions: '6.00m x 12.00m (Capacidad ~80 personas)',
    color: 'Blanco Puro',
    material: 'Aluminio estructural y Lona Blockout 650g',
    condition: 'Excelente',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'f-8',
    name: 'Calentador Exterior Tipo Hongo Acero Inox',
    code: 'DEC-001',
    category: 'Iluminación y Decoración',
    description: 'Calefactor de patio a gas LP con encendido electrónico y radio de calor de 5 metros.',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
    totalStock: 12,
    maintenanceStock: 1,
    rentalPricePerDay: 450,
    replacementValue: 5500,
    dimensions: '2.20m altura x 0.80m campana',
    color: 'Acero Inoxidable',
    material: 'Acero Inoxidable 304',
    condition: 'Excelente',
    createdAt: '2026-01-28T10:00:00Z',
    updatedAt: '2026-01-28T10:00:00Z',
  }
];

export const defaultClients: Client[] = [
  {
    id: 'c-1',
    name: 'Sofía Martínez Velasco',
    businessName: 'Bodas & Glam Eventos',
    phone: '55 1234 5678',
    whatsapp: '5215512345678',
    email: 'sofia@bodasglam.com',
    address: 'Camino Real a Toluca 340, Álvaro Obregón, CDMX',
    city: 'CDMX',
    notes: 'Organizadora de bodas VIP. Siempre solicita entrega puntual a primera hora.',
    identificationNumber: 'INE-89412356890',
    totalRentalsCount: 5,
    totalSpent: 42800,
    createdAt: '2026-01-05T12:00:00Z',
  },
  {
    id: 'c-2',
    name: 'Rodrigo Garza Treviño',
    businessName: 'Restaurante Terraza Jardín',
    phone: '55 8765 4321',
    whatsapp: '5215587654321',
    email: 'rodrigo.garza@terrazajardin.com',
    address: 'Av. Altavista 88, San Ángel, CDMX',
    city: 'CDMX',
    notes: 'Renta continua para eventos privados de fin de semana.',
    identificationNumber: 'INE-7412589630',
    totalRentalsCount: 3,
    totalSpent: 18500,
    createdAt: '2026-01-15T14:30:00Z',
  },
  {
    id: 'c-3',
    name: 'Mariana Delgado Rios',
    businessName: '',
    phone: '55 3344 5566',
    whatsapp: '5215533445566',
    email: 'mariana.delgado@gmail.com',
    address: 'Paseo de las Palmas 750, Lomas de Chapultepec, CDMX',
    city: 'CDMX',
    notes: 'Evento de XV años residencial. Acceso por caseta de vigilancia.',
    identificationNumber: 'INE-1234567890',
    totalRentalsCount: 1,
    totalSpent: 9200,
    createdAt: '2026-02-01T09:15:00Z',
  }
];

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

const todayStr = formatDate(today);
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const tomorrowStr = formatDate(tomorrow);

const inTwoDays = new Date(today);
inTwoDays.setDate(inTwoDays.getDate() + 2);
const inTwoDaysStr = formatDate(inTwoDays);

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = formatDate(yesterday);

export const defaultRentals: RentalOrder[] = [
  {
    id: 'r-101',
    folio: 'REN-2026-001',
    clientId: 'c-1',
    clientName: 'Sofía Martínez Velasco (Bodas & Glam)',
    clientPhone: '55 1234 5678',
    clientAddress: 'Hacienda de los Morales, Polanco, CDMX',
    eventName: 'Boda Alejandra & Fernando',
    eventLocation: 'Jardín Principal de la Hacienda',
    eventNotes: 'Entrega por la puerta de proveedores lateral. Montar antes de las 12:00 PM.',
    startDate: todayStr,
    endDate: tomorrowStr,
    deliveryTime: '08:30 AM',
    pickupTime: '10:00 PM',
    items: [
      {
        furnitureId: 'f-1',
        furnitureName: 'Silla Crossback Madera Nogal',
        furnitureCode: 'SIL-001',
        furnitureImage: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=80',
        category: 'Sillas',
        quantity: 80,
        unitPrice: 45,
        subtotal: 3600,
        replacementValue: 650,
      },
      {
        furnitureId: 'f-3',
        furnitureName: 'Mesa Tablón Madera Rústica (10 personas)',
        furnitureCode: 'MES-001',
        furnitureImage: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=600&q=80',
        category: 'Mesas',
        quantity: 8,
        unitPrice: 280,
        subtotal: 2240,
        replacementValue: 3200,
      },
      {
        furnitureId: 'f-5',
        furnitureName: 'Sala Lounge Chesterfield Blanco (8 personas)',
        furnitureCode: 'SAL-001',
        furnitureImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
        category: 'Salas Lounge',
        quantity: 2,
        unitPrice: 1200,
        subtotal: 2400,
        replacementValue: 14500,
      }
    ],
    itemsSubtotal: 8240,
    deliveryFee: 600,
    setupFee: 400,
    discount: 240,
    tax: 0,
    totalAmount: 9000,
    guaranteeDeposit: 2500,
    isDepositReturned: false,
    amountPaid: 9000,
    balanceDue: 0,
    status: 'En Camino',
    signatureDataUrl: '',
    createdAt: '2026-02-25T11:00:00Z',
    updatedAt: todayStr + 'T07:00:00Z',
  },
  {
    id: 'r-102',
    folio: 'REN-2026-002',
    clientId: 'c-2',
    clientName: 'Rodrigo Garza Treviño (Restaurante Terraza Jardín)',
    clientPhone: '55 8765 4321',
    clientAddress: 'Av. Altavista 88, San Ángel, CDMX',
    eventName: 'Aniversario Corporativo TechCorp',
    eventLocation: 'Terraza Principal Nivel 2',
    eventNotes: 'Subir por montacargas trasero.',
    startDate: todayStr,
    endDate: inTwoDaysStr,
    deliveryTime: '02:00 PM',
    pickupTime: '11:00 AM',
    items: [
      {
        furnitureId: 'f-6',
        furnitureName: 'Set Periquera Alta Madera y Metal (4 bancos)',
        furnitureCode: 'BAR-001',
        furnitureImage: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?auto=format&fit=crop&w=600&q=80',
        category: 'Barras y Periqueras',
        quantity: 6,
        unitPrice: 350,
        subtotal: 2100,
        replacementValue: 4200,
      },
      {
        furnitureId: 'f-8',
        furnitureName: 'Calentador Exterior Tipo Hongo Acero Inox',
        furnitureCode: 'DEC-001',
        furnitureImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80',
        category: 'Iluminación y Decoración',
        quantity: 4,
        unitPrice: 450,
        subtotal: 1800,
        replacementValue: 5500,
      }
    ],
    itemsSubtotal: 3900,
    deliveryFee: 450,
    setupFee: 150,
    discount: 0,
    tax: 0,
    totalAmount: 4500,
    guaranteeDeposit: 1500,
    isDepositReturned: false,
    amountPaid: 2500,
    balanceDue: 2000,
    status: 'Reservado',
    createdAt: '2026-02-28T16:00:00Z',
    updatedAt: '2026-02-28T16:00:00Z',
  },
  {
    id: 'r-100',
    folio: 'REN-2026-000',
    clientId: 'c-3',
    clientName: 'Mariana Delgado Rios',
    clientPhone: '55 3344 5566',
    clientAddress: 'Paseo de las Palmas 750, Lomas de Chapultepec, CDMX',
    eventName: 'Cena de Graduación',
    eventLocation: 'Jardín trasero de la residencia',
    startDate: yesterdayStr,
    endDate: todayStr,
    deliveryTime: '11:00 AM',
    pickupTime: '04:00 PM',
    items: [
      {
        furnitureId: 'f-2',
        furnitureName: 'Silla Tiffany Blanca Clásica',
        furnitureCode: 'SIL-002',
        furnitureImage: 'https://images.unsplash.com/photo-1580481077195-c9a89d701cb1?auto=format&fit=crop&w=600&q=80',
        category: 'Sillas',
        quantity: 40,
        unitPrice: 35,
        subtotal: 1400,
        replacementValue: 480,
      },
      {
        furnitureId: 'f-4',
        furnitureName: 'Mesa Redonda Banquete (10 personas)',
        furnitureCode: 'MES-002',
        furnitureImage: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=600&q=80',
        category: 'Mesas',
        quantity: 4,
        unitPrice: 180,
        subtotal: 720,
        replacementValue: 2400,
      }
    ],
    itemsSubtotal: 2120,
    deliveryFee: 400,
    setupFee: 200,
    discount: 0,
    tax: 0,
    totalAmount: 2720,
    guaranteeDeposit: 1000,
    isDepositReturned: false,
    amountPaid: 2720,
    balanceDue: 0,
    status: 'En Recolección',
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: todayStr + 'T08:00:00Z',
  }
];

export const defaultPayments: PaymentRecord[] = [
  {
    id: 'pay-1',
    rentalOrderId: 'r-101',
    amount: 5000,
    type: 'Anticipo',
    method: 'Transferencia',
    date: '2026-02-25T11:30:00Z',
    reference: 'SPEI-78945612',
    notes: 'Anticipo del 50% para apartado de fecha',
    receivedBy: 'Caja Principal',
  },
  {
    id: 'pay-2',
    rentalOrderId: 'r-101',
    amount: 4000,
    type: 'Liquidación',
    method: 'Transferencia',
    date: '2026-02-28T09:00:00Z',
    reference: 'SPEI-99881122',
    notes: 'Liquidación de saldo total',
    receivedBy: 'Caja Principal',
  },
  {
    id: 'pay-3',
    rentalOrderId: 'r-101',
    amount: 2500,
    type: 'Depósito Garantía',
    method: 'Efectivo',
    date: todayStr + 'T08:00:00Z',
    notes: 'Fianza recibida en efectivo al salir camión',
    receivedBy: 'Chofer Repartidor',
  },
  {
    id: 'pay-4',
    rentalOrderId: 'r-102',
    amount: 2500,
    type: 'Anticipo',
    method: 'Transferencia',
    date: '2026-02-28T16:15:00Z',
    reference: 'BBVA-334455',
    notes: 'Apartado de pedido',
    receivedBy: 'Caja Principal',
  }
];

export const storageService = {
  getFurniture(): FurnitureItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.FURNITURE);
    if (!data) {
      this.saveFurniture(defaultFurniture);
      return defaultFurniture;
    }
    return JSON.parse(data);
  },
  saveFurniture(items: FurnitureItem[]) {
    localStorage.setItem(STORAGE_KEYS.FURNITURE, JSON.stringify(items));
  },

  getClients(): Client[] {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!data) {
      this.saveClients(defaultClients);
      return defaultClients;
    }
    return JSON.parse(data);
  },
  saveClients(clients: Client[]) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },

  getRentals(): RentalOrder[] {
    const data = localStorage.getItem(STORAGE_KEYS.RENTALS);
    if (!data) {
      this.saveRentals(defaultRentals);
      return defaultRentals;
    }
    return JSON.parse(data);
  },
  saveRentals(rentals: RentalOrder[]) {
    localStorage.setItem(STORAGE_KEYS.RENTALS, JSON.stringify(rentals));
  },

  getPayments(): PaymentRecord[] {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!data) {
      this.savePayments(defaultPayments);
      return defaultPayments;
    }
    return JSON.parse(data);
  },
  savePayments(payments: PaymentRecord[]) {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  },

  getBusinessProfile(): BusinessProfile {
    const data = localStorage.getItem(STORAGE_KEYS.BUSINESS);
    if (!data) {
      this.saveBusinessProfile(defaultBusinessProfile);
      return defaultBusinessProfile;
    }
    return JSON.parse(data);
  },
  saveBusinessProfile(profile: BusinessProfile) {
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(profile));
  },

  exportDatabase(): string {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      furniture: this.getFurniture(),
      clients: this.getClients(),
      rentals: this.getRentals(),
      payments: this.getPayments(),
      business: this.getBusinessProfile(),
    };
    return JSON.stringify(dump, null, 2);
  },

  importDatabase(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.furniture) this.saveFurniture(data.furniture);
      if (data.clients) this.saveClients(data.clients);
      if (data.rentals) this.saveRentals(data.rentals);
      if (data.payments) this.savePayments(data.payments);
      if (data.business) this.saveBusinessProfile(data.business);
      return true;
    } catch (e) {
      console.error('Failed to import database', e);
      return false;
    }
  },

  resetToDefaults() {
    this.saveFurniture(defaultFurniture);
    this.saveClients(defaultClients);
    this.saveRentals(defaultRentals);
    this.savePayments(defaultPayments);
    this.saveBusinessProfile(defaultBusinessProfile);
  },

  clearAllData() {
    this.saveFurniture([]);
    this.saveClients([]);
    this.saveRentals([]);
    this.savePayments([]);
  },

  clearOperationsData() {
    this.saveRentals([]);
    this.savePayments([]);
  }
};
