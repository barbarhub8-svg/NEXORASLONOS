import { Tenant, Service, Staff, Appointment, DatabaseMeta, SQLQueryLog } from '../types';

// Prisma Schema as a string for Super Admin database explorer
export const PRISMA_SCHEMA_CODE = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  SUPER_ADMIN
  SHOP_OWNER
  CUSTOMER
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum TransactionType {
  CREDIT
  DEBIT
}

enum WithdrawStatus {
  PENDING
  APPROVED
  REJECTED
}

model User {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  email     String   @unique
  role      UserRole @default(SHOP_OWNER)
  shop      Shop?
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}

model Shop {
  id        String     @id @default(uuid()) @db.Uuid
  name      String
  subdomain String     @unique
  logoUrl   String?    @map("logo_url")
  bannerUrl String?    @map("banner_url")
  address   String
  phone     String
  email     String
  ownerId   String     @unique @map("owner_id") @db.Uuid
  owner     User       @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  services  Service[]
  staff     Staff[]
  customers Customer[]
  bookings  Booking[]
  wallet    Wallet?
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime   @updatedAt @map("updated_at")

  @@map("shops")
}

model Service {
  id          String    @id @default(uuid()) @db.Uuid
  shopId      String    @map("shop_id") @db.Uuid
  shop        Shop      @relation(fields: [shopId], references: [id], onDelete: Cascade)
  name        String
  category    String
  duration    Int       // in minutes
  price       Decimal   @db.Decimal(10, 2)
  description String
  bookings    Booking[]
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  @@map("services")
}

model Staff {
  id        String    @id @default(uuid()) @db.Uuid
  shopId    String    @map("shop_id") @db.Uuid
  shop      Shop      @relation(fields: [shopId], references: [id], onDelete: Cascade)
  name      String
  role      String
  rating    Float     @default(5.0)
  bio       String
  avatarUrl String?   @map("avatar_url")
  bookings  Booking[]
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@map("staff")
}

model Customer {
  id        String    @id @default(uuid()) @db.Uuid
  shopId    String    @map("shop_id") @db.Uuid
  shop      Shop      @relation(fields: [shopId], references: [id], onDelete: Cascade)
  name      String
  email     String
  phone     String
  bookings  Booking[]
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")

  @@unique([shopId, email])
  @@map("customers")
}

model Booking {
  id          String        @id @default(uuid()) @db.Uuid
  shopId      String        @map("shop_id") @db.Uuid
  shop        Shop          @relation(fields: [shopId], references: [id], onDelete: Cascade)
  serviceId   String        @map("service_id") @db.Uuid
  service     Service       @relation(fields: [serviceId], references: [id])
  staffId     String        @map("staff_id") @db.Uuid
  staff       Staff         @relation(fields: [staffId], references: [id])
  customerId  String        @map("customer_id") @db.Uuid
  customer    Customer      @relation(fields: [customerId], references: [id])
  dateTime    DateTime      @map("date_time")
  status      BookingStatus @default(PENDING)
  totalAmount Decimal       @map("total_amount") @db.Decimal(10, 2)
  notes       String?
  createdAt   DateTime      @default(now()) @map("created_at")
  updatedAt   DateTime      @updatedAt @map("updated_at")

  @@map("bookings")
}

model Wallet {
  id           String              @id @default(uuid()) @db.Uuid
  shopId       String              @unique @map("shop_id") @db.Uuid
  shop         Shop                @relation(fields: [shopId], references: [id], onDelete: Cascade)
  balance      Decimal             @default(0.0) @db.Decimal(10, 2)
  transactions WalletTransaction[]
  withdrawals  WithdrawRequest[]
  createdAt    DateTime            @default(now()) @map("created_at")
  updatedAt    DateTime            @updatedAt @map("updated_at")

  @@map("wallets")
}

model WalletTransaction {
  id        String          @id @default(uuid()) @db.Uuid
  walletId  String          @map("wallet_id") @db.Uuid
  wallet    Wallet          @relation(fields: [walletId], references: [id], onDelete: Cascade)
  amount    Decimal         @db.Decimal(10, 2)
  type      TransactionType
  reference String?
  createdAt DateTime        @default(now()) @map("created_at")
  updatedAt DateTime        @updatedAt @map("updated_at")

  @@map("wallet_transactions")
}

model WithdrawRequest {
  id          String         @id @default(uuid()) @db.Uuid
  walletId    String         @map("wallet_id") @db.Uuid
  wallet      Wallet         @relation(fields: [walletId], references: [id], onDelete: Cascade)
  amount      Decimal        @db.Decimal(10, 2)
  status      WithdrawStatus @default(PENDING)
  bankAccount String         @map("bank_account")
  notes       String?
  createdAt   DateTime       @default(now()) @map("created_at")
  updatedAt   DateTime       @updatedAt @map("updated_at")

  @@map("withdraw_requests")
}`;

export const POSTGRESQL_METADATA: DatabaseMeta[] = [
  {
    tableName: 'users',
    rowCount: 3,
    description: 'System-wide accounts defining credentials, contact details, and platform access roles.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'name', type: 'VARCHAR(100)', nullable: false },
      { name: 'email', type: 'VARCHAR(150)', nullable: false },
      { name: 'role', type: 'UserRole (ENUM)', nullable: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ]
  },
  {
    tableName: 'shops',
    rowCount: 2,
    description: 'Bespoke salon and wellness studios with unique subdomain routing and brand identities.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'name', type: 'VARCHAR(100)', nullable: false },
      { name: 'subdomain', type: 'VARCHAR(50)', nullable: false },
      { name: 'logo_url', type: 'VARCHAR(255)', nullable: true },
      { name: 'banner_url', type: 'VARCHAR(255)', nullable: true },
      { name: 'address', type: 'TEXT', nullable: false },
      { name: 'phone', type: 'VARCHAR(20)', nullable: false },
      { name: 'email', type: 'VARCHAR(100)', nullable: false },
      { name: 'owner_id', type: 'UUID', nullable: false, isForeignKey: true },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ]
  },
  {
    tableName: 'services',
    rowCount: 6,
    description: 'Salon product treatment items with custom time durations and luxury price rates.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'shop_id', type: 'UUID', nullable: false, isForeignKey: true },
      { name: 'name', type: 'VARCHAR(100)', nullable: false },
      { name: 'category', type: 'VARCHAR(50)', nullable: false },
      { name: 'duration', type: 'INTEGER', nullable: false },
      { name: 'price', type: 'DECIMAL(10,2)', nullable: false },
      { name: 'description', type: 'TEXT', nullable: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ]
  },
  {
    tableName: 'staff',
    rowCount: 4,
    description: 'Dynamic salon professionals assigned to design bookings and customer treatments.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'shop_id', type: 'UUID', nullable: false, isForeignKey: true },
      { name: 'name', type: 'VARCHAR(100)', nullable: false },
      { name: 'role', type: 'VARCHAR(50)', nullable: false },
      { name: 'rating', type: 'DOUBLE PRECISION', nullable: false },
      { name: 'bio', type: 'TEXT', nullable: false },
      { name: 'avatar_url', type: 'VARCHAR(255)', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ]
  },
  {
    tableName: 'customers',
    rowCount: 5,
    description: 'Guest entities maintaining profiles and preferences associated per salon shop.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'shop_id', type: 'UUID', nullable: false, isForeignKey: true },
      { name: 'name', type: 'VARCHAR(100)', nullable: false },
      { name: 'email', type: 'VARCHAR(150)', nullable: false },
      { name: 'phone', type: 'VARCHAR(20)', nullable: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ]
  },
  {
    tableName: 'bookings',
    rowCount: 8,
    description: 'Reservation transactions linking shop, customer, treatment service, and stylist schedule.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'shop_id', type: 'UUID', nullable: false, isForeignKey: true },
      { name: 'service_id', type: 'UUID', nullable: false, isForeignKey: true },
      { name: 'staff_id', type: 'UUID', nullable: false, isForeignKey: true },
      { name: 'customer_id', type: 'UUID', nullable: false, isForeignKey: true },
      { name: 'date_time', type: 'TIMESTAMP', nullable: false },
      { name: 'status', type: 'BookingStatus (ENUM)', nullable: false },
      { name: 'total_amount', type: 'DECIMAL(10,2)', nullable: false },
      { name: 'notes', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ]
  },
  {
    tableName: 'wallets',
    rowCount: 2,
    description: 'Financial ledger accounts recording dynamic salon studio balances and fund transactions.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'shop_id', type: 'UUID', nullable: false, isForeignKey: true },
      { name: 'balance', type: 'DECIMAL(10,2)', nullable: false },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ]
  },
  {
    tableName: 'wallet_transactions',
    rowCount: 14,
    description: 'Ledger detail items representing credit/debit entries, e.g., payout, billing, or subscription deduction.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'wallet_id', type: 'UUID', nullable: false, isForeignKey: true },
      { name: 'amount', type: 'DECIMAL(10,2)', nullable: false },
      { name: 'type', type: 'TransactionType (ENUM)', nullable: false },
      { name: 'reference', type: 'VARCHAR(100)', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ]
  },
  {
    tableName: 'withdraw_requests',
    rowCount: 2,
    description: 'Payout ticket requests submitted by shop owners to transfer funds from sub-wallet to external banking.',
    columns: [
      { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true },
      { name: 'wallet_id', type: 'UUID', nullable: false, isForeignKey: true },
      { name: 'amount', type: 'DECIMAL(10,2)', nullable: false },
      { name: 'status', type: 'WithdrawStatus (ENUM)', nullable: false },
      { name: 'bank_account', type: 'TEXT', nullable: false },
      { name: 'notes', type: 'TEXT', nullable: true },
      { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      { name: 'updated_at', type: 'TIMESTAMP', nullable: false }
    ]
  }
];

// Initial Seed Data
const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-1',
    name: 'Nexora Gold Atelier',
    subdomain: 'atelier',
    tagline: 'Precision Styling & Supreme Luxury Treatments',
    logoUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=200&h=200',
    bannerUrl: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200&h=400',
    primaryColor: '#D4AF37', // Gold
    secondaryColor: '#0A0A0A', // Pure Black
    textColor: '#FFFFFF',
    fontFamily: 'serif',
    address: 'Vanderbilt Ave 45, luxury Suite 4, Manhattan, NY',
    phone: '+1 (555) 725-6672',
    email: 'booking@nexora-atelier.com',
    isActive: true,
    createdAt: '2026-01-10T11:00:00Z',
    mrr: 249.0
  },
  {
    id: 'tenant-2',
    name: 'Aeros Hair Lab',
    subdomain: 'aeros',
    tagline: 'Modern, Cutting-Edge Hair Care & Colorways',
    logoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=200&h=200',
    bannerUrl: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200&h=400',
    primaryColor: '#6B7280', // Platinum Silver
    secondaryColor: '#111827', // Obsidian Grey
    textColor: '#F3F4F6',
    fontFamily: 'sans',
    address: 'Melrose Ave 820, West Hollywood, CA',
    phone: '+1 (323) 555-0144',
    email: 'info@aeroshair.com',
    isActive: true,
    createdAt: '2026-03-05T09:30:00Z',
    mrr: 149.0
  }
];

const INITIAL_SERVICES: Service[] = [
  // Tenant 1 (Atelier)
  {
    id: 'service-1-1',
    tenantId: 'tenant-1',
    name: 'Signature Executive Cut',
    category: 'Haircuts',
    duration: 45,
    price: 95.0,
    description: 'Hot towel prep, precision scissor trim, scalp massage and custom styling styling using royal gold pomades.'
  },
  {
    id: 'service-1-2',
    tenantId: 'tenant-1',
    name: 'Balayage Premium Treatment',
    category: 'Color',
    duration: 120,
    price: 250.0,
    description: 'Freehand sweeping coloring to achieve organic gradients, standard including intensive amino hydration pack.'
  },
  {
    id: 'service-1-3',
    tenantId: 'tenant-1',
    name: 'Kérastase Gold Ritual',
    category: 'Spa',
    duration: 60,
    price: 150.0,
    description: 'Premium luxury restructuring ritual for cellular level capillary fiber fortification.'
  },

  // Tenant 2 (Aeros)
  {
    id: 'service-2-1',
    tenantId: 'tenant-2',
    name: 'Modern Crop & Barbering',
    category: 'Haircuts',
    duration: 30,
    price: 55.0,
    description: 'Contemporary fade or high precision crop completed with organic oil finish styling.'
  },
  {
    id: 'service-2-2',
    tenantId: 'tenant-2',
    name: 'Neon/Platinizing Double Bleach',
    category: 'Color',
    duration: 150,
    price: 195.0,
    description: 'Platinum bleach and glaze toning with protective plex reinforcement bond compound.'
  },
  {
    id: 'service-2-3',
    tenantId: 'tenant-2',
    name: 'Keratin Revitalizer Smoothing',
    category: 'Spa',
    duration: 90,
    price: 120.0,
    description: 'Anti-humidity sealant smoothing treatment for up to 6 weeks of sleek control.'
  }
];

const INITIAL_STAFF: Staff[] = [
  // Tenant 1 (Atelier)
  {
    id: 'staff-1-1',
    tenantId: 'tenant-1',
    name: 'Alastair Kingsley',
    role: 'Art Director',
    rating: 4.97,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Over 15 years master styling in Milan and London. Specializes in luxury structural shapes.',
    specialties: ['Precision Cuts', 'Styling Consultation']
  },
  {
    id: 'staff-1-2',
    tenantId: 'tenant-1',
    name: 'Seraphina Du Soleil',
    role: 'Master Colorist',
    rating: 4.91,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'L’Oréal Certified National Color expert. Artisan of balayage tone layering and glosses.',
    specialties: ['Balayage', 'Capillary Restoration']
  },

  // Tenant 2 (Aeros)
  {
    id: 'staff-2-1',
    tenantId: 'tenant-2',
    name: 'Kai Thorne',
    role: 'Lead Stylist',
    rating: 4.88,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Avid stylist of street-high fashion. Expert in hyper-textured layers and shags.',
    specialties: ['Texture Crops', 'Razoring']
  },
  {
    id: 'staff-2-2',
    tenantId: 'tenant-2',
    name: 'Elena Rostova',
    role: 'Bleach & Tint Chemist',
    rating: 4.85,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    bio: 'Color chemist expert in high-lift blonde transitions and pastel gradients.',
    specialties: ['High-Blondes', 'Creative Tinting']
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  // Tenant 1
  {
    id: 'apt-1-1',
    tenantId: 'tenant-1',
    serviceId: 'service-1-1',
    customerName: 'Marcus Sterling',
    customerEmail: 'marcus@sterling.co',
    customerPhone: '+1 (405) 555-8822',
    staffId: 'staff-1-1',
    date: '2026-06-02',
    time: '11:30',
    status: 'CONFIRMED',
    totalAmount: 95.0,
    notes: 'Likes high-fade look. Prepare hot mint towels beforehand.',
    createdAt: '2026-05-28T09:12:00Z'
  },
  {
    id: 'apt-1-2',
    tenantId: 'tenant-1',
    serviceId: 'service-1-2',
    customerName: 'Victoria Vanderbilt',
    customerEmail: 'vicky@vanderbilt.net',
    customerPhone: '+1 (212) 555-0990',
    staffId: 'staff-1-2',
    date: '2026-06-02',
    time: '14:00',
    status: 'PENDING',
    totalAmount: 250.0,
    notes: 'Requires subtle honey-blonde highlights. Soft styling afterward.',
    createdAt: '2026-05-30T14:45:00Z'
  },
  {
    id: 'apt-1-3',
    tenantId: 'tenant-1',
    serviceId: 'service-1-3',
    customerName: 'Arabella Dupont',
    customerEmail: 'arabella@dupont.org',
    customerPhone: '+1 (917) 555-2244',
    staffId: 'staff-1-2',
    date: '2026-06-03',
    time: '10:00',
    status: 'CONFIRMED',
    totalAmount: 150.0,
    notes: 'Pre-wedding hair repair treatment.',
    createdAt: '2026-05-29T10:30:00Z'
  },
  {
    id: 'apt-1-4',
    tenantId: 'tenant-1',
    serviceId: 'service-1-1',
    customerName: 'Harrison Ford',
    customerEmail: 'harrison@actors.com',
    customerPhone: '+1 (310) 555-4321',
    staffId: 'staff-1-1',
    date: '2026-06-01',
    time: '16:00',
    status: 'COMPLETED',
    totalAmount: 95.0,
    notes: 'Regular trim setup, quick style.',
    createdAt: '2026-05-25T11:00:00Z'
  },

  // Tenant 2
  {
    id: 'apt-2-1',
    tenantId: 'tenant-2',
    serviceId: 'service-2-1',
    customerName: 'Zachary Cole',
    customerEmail: 'zach@cole.tech',
    customerPhone: '+1 (415) 555-6677',
    staffId: 'staff-2-1',
    date: '2026-06-02',
    time: '10:00',
    status: 'CONFIRMED',
    totalAmount: 55.0,
    notes: 'Textured crop styling advice requested.',
    createdAt: '2026-05-31T08:15:00Z'
  },
  {
    id: 'apt-2-2',
    tenantId: 'tenant-2',
    serviceId: 'service-2-2',
    customerName: 'Maya Rin',
    customerEmail: 'maya@rin.style',
    customerPhone: '+1 (310) 555-1234',
    staffId: 'staff-2-2',
    date: '2026-06-02',
    time: '13:00',
    status: 'PENDING',
    totalAmount: 195.0,
    notes: 'Wants vibrant pastel violet neon finish.',
    createdAt: '2026-06-01T15:20:00Z'
  }
];

const INITIAL_SQL_LOGS: SQLQueryLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-02T09:00:00Z',
    type: 'PRISMA',
    query: 'prisma.tenant.findMany({ include: { services: true, staff: true } })',
    durationMs: 4,
    rowsAffected: 2
  },
  {
    id: 'log-2',
    timestamp: '2026-06-02T09:00:05Z',
    type: 'SQL',
    query: 'SELECT * FROM "Tenant" WHERE "isActive" = true LIMIT 100;',
    durationMs: 2,
    rowsAffected: 2
  }
];

// Database state management with localStorage synchronization
class LocalSaaSDatabase {
  private tenants: Tenant[] = [];
  private services: Service[] = [];
  private staff: Staff[] = [];
  private appointments: Appointment[] = [];
  private sqlLogs: SQLQueryLog[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') {
      this.tenants = INITIAL_TENANTS;
      this.services = INITIAL_SERVICES;
      this.staff = INITIAL_STAFF;
      this.appointments = INITIAL_APPOINTMENTS;
      this.sqlLogs = INITIAL_SQL_LOGS;
      return;
    }

    try {
      const storedTenants = localStorage.getItem('nexora_tenants');
      const storedServices = localStorage.getItem('nexora_services');
      const storedStaff = localStorage.getItem('nexora_staff');
      const storedAppointments = localStorage.getItem('nexora_appointments');
      const storedLogs = localStorage.getItem('nexora_sql_logs');

      this.tenants = storedTenants ? JSON.parse(storedTenants) : INITIAL_TENANTS;
      this.services = storedServices ? JSON.parse(storedServices) : INITIAL_SERVICES;
      this.staff = storedStaff ? JSON.parse(storedStaff) : INITIAL_STAFF;
      this.appointments = storedAppointments ? JSON.parse(storedAppointments) : INITIAL_APPOINTMENTS;
      this.sqlLogs = storedLogs ? JSON.parse(storedLogs) : INITIAL_SQL_LOGS;

      // Ensure some logs on start
      if (this.sqlLogs.length === 0) {
        this.sqlLogs = INITIAL_SQL_LOGS;
      }
    } catch (e) {
      console.error('Error reading localStorage for Nexora database:', e);
      this.tenants = INITIAL_TENANTS;
      this.services = INITIAL_SERVICES;
      this.staff = INITIAL_STAFF;
      this.appointments = INITIAL_APPOINTMENTS;
      this.sqlLogs = INITIAL_SQL_LOGS;
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('nexora_tenants', JSON.stringify(this.tenants));
      localStorage.setItem('nexora_services', JSON.stringify(this.services));
      localStorage.setItem('nexora_staff', JSON.stringify(this.staff));
      localStorage.setItem('nexora_appointments', JSON.stringify(this.appointments));
      localStorage.setItem('nexora_sql_logs', JSON.stringify(this.sqlLogs));
    } catch (e) {
      console.error('Error saving state to localStorage:', e);
    }
  }

  private addLog(type: 'PRISMA' | 'SQL', query: string, rowsAffected: number) {
    const newLog: SQLQueryLog = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      query,
      durationMs: Math.floor(Math.random() * 8) + 1,
      rowsAffected
    };
    this.sqlLogs = [newLog, ...this.sqlLogs].slice(0, 50); // Keep last 50 queries
    this.saveToStorage();
  }

  // --- API / Prisma Simulators ---

  // Tenants
  async getTenants(): Promise<Tenant[]> {
    this.addLog('PRISMA', 'prisma.tenant.findMany({ order: { createdAt: "desc" } })', this.tenants.length);
    return [...this.tenants];
  }

  async getTenant(id: string): Promise<Tenant | null> {
    this.addLog('PRISMA', `prisma.tenant.findUnique({ where: { id: "${id}" } })`, 1);
    const tenant = this.tenants.find(t => t.id === id);
    return tenant ? { ...tenant } : null;
  }

  async getTenantBySubdomain(subdomain: string): Promise<Tenant | null> {
    this.addLog('PRISMA', `prisma.tenant.findUnique({ where: { subdomain: "${subdomain}" } })`, 1);
    const tenant = this.tenants.find(t => t.subdomain.toLowerCase() === subdomain.toLowerCase());
    return tenant ? { ...tenant } : null;
  }

  async createTenant(tenantData: Omit<Tenant, 'id' | 'createdAt' | 'isActive'>): Promise<Tenant> {
    const newTenant: Tenant = {
      ...tenantData,
      id: `tenant-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isActive: true
    };
    this.tenants.push(newTenant);
    this.saveToStorage();
    this.addLog('PRISMA', `prisma.tenant.create({ data: { name: "${newTenant.name}", subdomain: "${newTenant.subdomain}" } })`, 1);
    
    // Seed default services for this new tenant
    const defaultServices: Omit<Service, 'id'>[] = [
      {
        tenantId: newTenant.id,
        name: 'Essential Cut & Finish',
        category: 'Haircuts',
        duration: 30,
        price: 45.0,
        description: 'Quality foundational hair shaping and standard quick dry styling.'
      },
      {
        tenantId: newTenant.id,
        name: 'Express Detox Treatment',
        category: 'Spa',
        duration: 20,
        price: 35.0,
        description: 'Scalp cleansing treatment utilizing essential tea tree oils.'
      }
    ];

    for (const svc of defaultServices) {
      await this.createService(svc);
    }

    // Seed default staff
    await this.createStaff({
      tenantId: newTenant.id,
      name: 'Taylor Brooks',
      role: 'Creative Stylist',
      rating: 4.8,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150',
      bio: 'Enthusiastic and certified cosmetologist specializing in all hair types.',
      specialties: ['Precision Cuts', 'Beard Care']
    });

    return newTenant;
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant> {
    const index = this.tenants.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Tenant not found');

    this.tenants[index] = { ...this.tenants[index], ...updates };
    this.saveToStorage();
    this.addLog('PRISMA', `prisma.tenant.update({ where: { id: "${id}" }, data: { ... } })`, 1);
    return this.tenants[index];
  }

  // Services
  async getServicesByTenant(tenantId: string): Promise<Service[]> {
    this.addLog('PRISMA', `prisma.service.findMany({ where: { tenantId: "${tenantId}" } })`, 
      this.services.filter(s => s.tenantId === tenantId).length);
    return this.services.filter(s => s.tenantId === tenantId);
  }

  async createService(serviceData: Omit<Service, 'id'>): Promise<Service> {
    const newService: Service = {
      ...serviceData,
      id: `service-${Math.random().toString(36).substr(2, 9)}`
    };
    this.services.push(newService);
    this.saveToStorage();
    this.addLog('PRISMA', `prisma.service.create({ data: { name: "${newService.name}", tenantId: "${newService.tenantId}" } })`, 1);
    return newService;
  }

  async updateService(id: string, updates: Partial<Service>): Promise<Service> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Service not found');

    this.services[index] = { ...this.services[index], ...updates };
    this.saveToStorage();
    this.addLog('PRISMA', `prisma.service.update({ where: { id: "${id}" }, data: { ... } })`, 1);
    return this.services[index];
  }

  async deleteService(id: string): Promise<void> {
    this.services = this.services.filter(s => s.id !== id);
    this.saveToStorage();
    this.addLog('PRISMA', `prisma.service.delete({ where: { id: "${id}" } })`, 1);
  }

  // Staff
  async getStaffByTenant(tenantId: string): Promise<Staff[]> {
    this.addLog('PRISMA', `prisma.staff.findMany({ where: { tenantId: "${tenantId}" } })`, 
      this.staff.filter(st => st.tenantId === tenantId).length);
    return this.staff.filter(st => st.tenantId === tenantId);
  }

  async createStaff(staffData: Omit<Staff, 'id'>): Promise<Staff> {
    const newStaff: Staff = {
      ...staffData,
      id: `staff-${Math.random().toString(36).substr(2, 9)}`
    };
    this.staff.push(newStaff);
    this.saveToStorage();
    this.addLog('PRISMA', `prisma.staff.create({ data: { name: "${newStaff.name}", tenantId: "${newStaff.tenantId}" } })`, 1);
    return newStaff;
  }

  async updateStaff(id: string, updates: Partial<Staff>): Promise<Staff> {
    const index = this.staff.findIndex(st => st.id === id);
    if (index === -1) throw new Error('Staff not found');

    this.staff[index] = { ...this.staff[index], ...updates };
    this.saveToStorage();
    this.addLog('PRISMA', `prisma.staff.update({ where: { id: "${id}" }, data: { ... } })`, 1);
    return this.staff[index];
  }

  async deleteStaff(id: string): Promise<void> {
    this.staff = this.staff.filter(st => st.id !== id);
    this.saveToStorage();
    this.addLog('PRISMA', `prisma.staff.delete({ where: { id: "${id}" } })`, 1);
  }

  // Appointments
  async getAppointmentsByTenant(tenantId: string): Promise<Appointment[]> {
    this.addLog('PRISMA', `prisma.appointment.findMany({ where: { tenantId: "${tenantId}" } })`, 
      this.appointments.filter(a => a.tenantId === tenantId).length);
    return this.appointments.filter(a => a.tenantId === tenantId);
  }

  async createAppointment(aptData: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<Appointment> {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'CONFIRMED' // Default confirmed in simulated system for client delight
    };
    this.appointments.push(newApt);
    this.saveToStorage();
    this.addLog('PRISMA', `prisma.appointment.create({ data: { customerName: "${newApt.customerName}", amount: ${newApt.totalAmount} } })`, 1);
    return newApt;
  }

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    const index = this.appointments.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Appointment not found');

    this.appointments[index].status = status;
    this.saveToStorage();
    this.addLog('PRISMA', `prisma.appointment.update({ where: { id: "${id}" }, data: { status: "${status}" } })`, 1);
    return this.appointments[index];
  }

  // SQL console runner simulation
  async runRawSQL(query: string): Promise<{ rows: any[]; error?: string; log?: SQLQueryLog }> {
    const lower = query.toLowerCase().trim();
    this.addLog('SQL', query, 0);
    const lastLog = this.sqlLogs[0];

    try {
      if (lower.startsWith('select * from "tenant"') || lower.startsWith('select * from tenant')) {
        return { rows: this.tenants, log: lastLog };
      }
      if (lower.startsWith('select * from "service"') || lower.startsWith('select * from service')) {
        return { rows: this.services, log: lastLog };
      }
      if (lower.startsWith('select * from "staff"') || lower.startsWith('select * from staff')) {
        return { rows: this.staff, log: lastLog };
      }
      if (lower.startsWith('select * from "appointment"') || lower.startsWith('select * from appointment')) {
        return { rows: this.appointments, log: lastLog };
      }
      if (lower.startsWith('select * from "sqlquerylog"') || lower.startsWith('select * from sqlquerylog')) {
        return { rows: this.sqlLogs, log: lastLog };
      }
      
      // Generic mock response for inserts or updates
      if (lower.startsWith('insert') || lower.startsWith('update') || lower.startsWith('delete')) {
        return { rows: [{ success: true, message: 'Simulated operation successfully executed locally' }], log: lastLog };
      }

      return { rows: [], error: `Execution completed: returned 0 rows. (HINT: Supported read tables on postgresql are "Tenant", "Service", "Staff", "Appointment", "SQLQueryLog")`, log: lastLog };
    } catch (e: any) {
      return { rows: [], error: e.message, log: lastLog };
    }
  }

  getSqlLogs() {
    return this.sqlLogs;
  }

  reset() {
    localStorage.removeItem('nexora_tenants');
    localStorage.removeItem('nexora_services');
    localStorage.removeItem('nexora_staff');
    localStorage.removeItem('nexora_appointments');
    localStorage.removeItem('nexora_sql_logs');
    this.loadFromStorage();
  }
}

export const dbSim = new LocalSaaSDatabase();
