import React from 'react';
import { Shield, Store, Users, RefreshCw, Globe } from 'lucide-react';
import { UserRole, Tenant } from '../types';

interface RoleSwitcherProps {
  currentRole: UserRole;
  currentTenant: Tenant;
  tenants: Tenant[];
  onRoleChange: (role: UserRole) => void;
  onTenantChange: (tenantId: string) => void;
  onReset: () => void;
}

export default function RoleSwitcher({
  currentRole,
  currentTenant,
  tenants,
  onRoleChange,
  onTenantChange,
  onReset
}: RoleSwitcherProps) {
  return (
    <div className="w-full bg-[#0a0a0a] border-b border-white/10 text-xs px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 z-50 sticky top-0 backdrop-blur-md bg-opacity-95">
      {/* Platform Title */}
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 gold-bg flex items-center justify-center font-bold text-black text-[10px] rounded-sm select-none">
          N
        </div>
        <div>
          <span className="brand-serif text-lg gold-text italic tracking-tight font-bold">Nexora</span>
          <span className="text-[10px] uppercase tracking-widest opacity-50 ml-1.5 font-bold">SalonOS</span>
          <span className="hidden md:inline px-2 py-0.5 ml-3 rounded-none border border-gold-500/20 bg-gold-500/5 text-gold-400 text-[8px] font-mono tracking-widest">
            V15.0 CORE
          </span>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="flex items-center gap-1 p-0.5 bg-white/5 rounded-none border border-white/10">
        <button
          onClick={() => onRoleChange('SUPER_ADMIN')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-none font-medium text-xs transition-all ${
            currentRole === 'SUPER_ADMIN'
              ? 'bg-[#0d0d0d] text-gold-500 border-l-2 gold-border shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider text-[10px] font-semibold">Super Admin</span>
        </button>

        <button
          onClick={() => onRoleChange('SHOP_OWNER')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-none font-medium text-xs transition-all ${
            currentRole === 'SHOP_OWNER'
              ? 'bg-[#0d0d0d] text-gold-500 border-l-2 gold-border shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Store className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider text-[10px] font-semibold">Shop Owner</span>
        </button>

        <button
          onClick={() => onRoleChange('CUSTOMER')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-none font-medium text-xs transition-all ${
            currentRole === 'CUSTOMER'
              ? 'bg-[#0d0d0d] text-gold-500 border-l-2 gold-border shadow-sm'
              : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wider text-[10px] font-semibold">Customer Portal</span>
        </button>
      </div>

      {/* Contextual Tenant Switcher */}
      <div className="flex items-center gap-3">
        {currentRole !== 'SUPER_ADMIN' && (
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-none border border-white/10">
            <span className="label-caps font-mono text-[9px] uppercase tracking-widest opacity-50">Current Tenant:</span>
            <select
              value={currentTenant.id}
              onChange={(e) => onTenantChange(e.target.value)}
              className="bg-transparent text-gold-500 font-medium focus:outline-none cursor-pointer text-xs pr-1"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id} className="bg-zinc-950 text-white">
                  {t.name}
                </option>
              ))}
            </select>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
          </div>
        )}

        {/* Database Diagnostic Reset */}
        <button
          onClick={() => {
            if (confirm('Reset simulated PostgreSQL database back to core seed state?')) {
              onReset();
            }
          }}
          title="Reset PostgreSQL state & sync with seed properties"
          className="px-2.5 py-1.5 hover:bg-white/5 border border-white/10 hover:border-gold-500 hover:text-gold-400 rounded-none transition-all text-zinc-500 flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider"
        >
          <RefreshCw className="h-3 w-3 animate-pulse text-zinc-600 group-hover:text-gold-400" />
          <span>RESET SEED</span>
        </button>
      </div>
    </div>
  );
}
