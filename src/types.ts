/**
 * Nexora SalonOS - Enterprise Domain Types
 */

export type UserRole = 'SUPER_ADMIN' | 'SHOP_OWNER' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string; // Optional if super admin or general user
  avatarUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  tagline: string;
  logoUrl?: string;
  bannerUrl?: string;
  primaryColor: string; // Tailwind color or hex (e.g., "#D4AF37")
  secondaryColor: string; // e.g., "#0A0A0A"
  textColor: string; // e.g., "#FFFFFF"
  fontFamily: 'sans' | 'serif' | 'mono';
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  mrr: number; // For admin analytics
}

export interface Service {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  duration: number; // in minutes
  price: number;
  description: string;
  imageUrl?: string;
}

export interface Staff {
  id: string;
  tenantId: string;
  name: string;
  role: string;
  rating: number;
  avatarUrl?: string;
  bio: string;
  specialties: string[];
  workingHours?: Record<string, { start: string; end: string; active: boolean }>;
  blockedDates?: string[];
}

export interface Appointment {
  id: string;
  tenantId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  staffId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

// Enterprise schema details for database visualizer
export interface DatabaseMeta {
  tableName: string;
  rowCount: number;
  columns: { name: string; type: string; nullable: boolean; isPrimaryKey?: boolean; isForeignKey?: boolean }[];
  description: string;
}

export interface SQLQueryLog {
  id: string;
  timestamp: string;
  type: 'PRISMA' | 'SQL';
  query: string;
  durationMs: number;
  rowsAffected: number;
}
