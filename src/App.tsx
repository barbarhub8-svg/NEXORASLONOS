import React, { useState, useEffect } from 'react';
import { LogOut, Layout, Terminal, HelpCircle, Activity, Globe, Database, Sparkles } from 'lucide-react';
import { UserRole, Tenant } from './types';
import { dbSim } from './data/mockDatabase';
import RoleSwitcher from './components/RoleSwitcher';
import AuthScreen from './components/AuthScreen';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import ShopOwnerDashboard from './components/ShopOwnerDashboard';
import CustomerBookingPortal from './components/CustomerBookingPortal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeRole, setActiveRole] = useState<UserRole>('SUPER_ADMIN');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [activeTenant, setActiveTenant] = useState<Tenant | null>(null);
  const [systemLogsOpen, setSystemLogsOpen] = useState(false);

  // Load Tenants Fleet index from local PG VM simulator on start
  const fetchTenants = async () => {
    const list = await dbSim.getTenants();
    setTenants(list);
    
    // Default to first tenant if not set or if current active tenant list changed
    if (list.length > 0) {
      setActiveTenant(prev => {
        if (!prev) return list[0];
        const match = list.find(t => t.id === prev.id);
        return match || list[0];
      });
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const handleLogin = (role: UserRole) => {
    setActiveRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Switcher triggers
  const handleTenantChange = (tenantId: string) => {
    const found = tenants.find(t => t.id === tenantId);
    if (found) {
      setActiveTenant(found);
    }
  };

  const handleTenantCreated = (newTenant: Tenant) => {
    fetchTenants();
  };

  const handleTenantUpdated = (updatedTenant: Tenant) => {
    // Refresh fleet collection and update local active instance
    fetchTenants();
    setActiveTenant(updatedTenant);
  };

  const handleDatabaseReset = () => {
    dbSim.reset();
    fetchTenants();
    alert('Relational PostgreSQL tables successfully seeded with default structures.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-zinc-100">
      
      {/* 1. If not logged in, render the luxury credentials gateway */}
      {!isLoggedIn ? (
        <AuthScreen onLogin={handleLogin} />
      ) : (
        <>
          {/* 2. PERSISTENT SYSTEM EXECUTIVE HUD SWITCHER HEADER */}
          <RoleSwitcher
            currentRole={activeRole}
            currentTenant={activeTenant || (tenants[0] as Tenant)}
            tenants={tenants}
            onRoleChange={setActiveRole}
            onTenantChange={handleTenantChange}
            onReset={handleDatabaseReset}
          />

          {/* User Status Bar with Log out capabilities */}
          <div className="bg-[#0e0e0e] border-b border-white/10 px-6 py-3 flex justify-between items-center text-xs font-mono select-none">
            <div className="flex items-center gap-4 text-zinc-500">
              <span className="flex items-center gap-2 text-gold-500/80 font-bold uppercase tracking-wider text-[10px]">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
                <span>ROLE: {activeRole}</span>
              </span>
              
              {activeRole !== 'SUPER_ADMIN' && activeTenant && (
                <span className="hidden md:inline-flex items-center gap-1.5 text-zinc-500 border border-white/5 px-2.5 py-1 rounded-none bg-black">
                  <Globe className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="tracking-widest uppercase text-[9px] font-bold">https://{activeTenant.subdomain}.salon.os</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Optional diagnostics popup helper */}
              <button
                onClick={() => setSystemLogsOpen(!systemLogsOpen)}
                className="hidden sm:flex text-zinc-550 hover:text-zinc-200 items-center gap-1.5 px-3 py-1.5 border border-white/10 hover:border-white/20 rounded-none cursor-pointer uppercase tracking-widest text-[9px]"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Diagnostics Drawer</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-neutral-200 text-black border border-white rounded-none transition-all font-bold uppercase tracking-widest text-[9px] cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5 text-black" />
                <span>Disconnect</span>
              </button>
            </div>
          </div>

          {/* Core content workspace depending on active persona role */}
          <main className="flex-grow">
            {activeRole === 'SUPER_ADMIN' && (
              <SuperAdminDashboard
                tenants={tenants}
                onTenantCreated={handleTenantCreated}
              />
            )}

            {activeRole === 'SHOP_OWNER' && activeTenant && (
              <ShopOwnerDashboard
                tenant={activeTenant}
                onTenantUpdate={handleTenantUpdated}
              />
            )}

            {activeRole === 'CUSTOMER' && activeTenant && (
              <CustomerBookingPortal
                tenant={activeTenant}
              />
            )}
          </main>

          {/* Quick reference Drawer diagnostics help drawer */}
          {systemLogsOpen && (
            <div className="fixed bottom-0 right-0 max-w-lg w-full bg-[#0d0d0d] border-t border-l border-white/10 shadow-2xl z-50 p-8 space-y-4 font-mono text-[11px] select-none text-left animate-slide-up">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-zinc-300 font-bold uppercase block text-xs flex items-center gap-1.5 text-gold-500 tracking-wider">
                  <Database className="h-4 w-4" />
                  <span>Prisma PG Engine Logs</span>
                </span>
                <button
                  onClick={() => setSystemLogsOpen(false)}
                  className="text-zinc-500 hover:text-white text-[10px] uppercase font-bold tracking-widest cursor-pointer"
                >
                  [Dismiss]
                </button>
              </div>

              <div className="space-y-1.5 text-zinc-400">
                <p><span className="text-zinc-550 font-bold label-caps">Platform:</span> Nexora SalonOS</p>
                <p><span className="text-zinc-550 font-bold label-caps">SQL Database:</span> PostgreSQL Cluster V15</p>
                <p><span className="text-zinc-550 font-bold label-caps">Tenant Isolation:</span> TenantId foreign-key checks matching standard routing patterns</p>
              </div>

              <div className="p-4 bg-white/5 rounded-none border border-white/10 space-y-1 text-zinc-400 leading-relaxed">
                <span className="text-gold-500 uppercase font-bold tracking-widest text-[9px] block mb-1">Developer Multi-Tenancy Architecture Tip</span>
                Like real-life Prisma + Express middleware, this dashboard utilizes tenancy filtering inside standard SQL calls:
                <code className="block bg-[#050505] p-2 text-purple-400 rounded-none text-[10px] mt-2 select-all border border-white/5">
                  prisma.service.findMany(&#123; where: &#123; tenantId: activeTenant.id &#125; &#125;)
                </code>
              </div>

              <div className="text-[9px] text-zinc-600 text-center uppercase font-bold tracking-wider select-none pt-4 border-t border-white/5">
                Secure SSL VPC Layer Secured
              </div>
            </div>
          )}
        </>
      )}

      {/* FOOTER */}
      <footer className="py-8 border-t border-white/10 bg-[#050505] text-center text-xs text-zinc-550 font-mono uppercase tracking-widest text-[9px]">
        <p>© 2026 Nexora SalonOS. Your Salon. Your Brand. Your Success.</p>
        <p className="text-[8px] text-zinc-650 mt-1">Multi-Tenant Scalable Enterprise Platform Cluster • NYS Cloud Nodes</p>
      </footer>
    </div>
  );
}
