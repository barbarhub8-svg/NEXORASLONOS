import React, { useState } from 'react';
import { Shield, Store, Users, Lock, Sparkles, Mail, Eye, EyeOff } from 'lucide-react';
import { UserRole } from '../types';

interface AuthScreenProps {
  onLogin: (role: UserRole) => void;
}

export default function AuthScreen({ onLogin }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<UserRole>('SUPER_ADMIN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick credentials mapping
  const quickCreds = {
    SUPER_ADMIN: { email: 'admin@nexorasalon.com', pass: '••••••••', name: 'Althea Crown' },
    SHOP_OWNER: { email: 'owner@atelier.salon.os', pass: '••••••••', name: 'Alastair Kingsley' },
    CUSTOMER: { email: 'client@vanderbilt.net', pass: '••••••••', name: 'Victoria Vanderbilt' }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate real JWT/OAuth token verification & tenancy matching middleware delay
    setTimeout(() => {
      setIsSubmitting(false);
      onLogin(activeTab);
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-45px)] w-full flex items-center justify-center p-6 md:p-12 bg-[#0a0a0a] relative overflow-hidden">
      {/* Decorative Brand Ambient Pattern/Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(212,175,55,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.015)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-gold-500/5 to-transparent rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-1 px-1 bg-white/10 items-stretch relative z-10 my-8">
        
        {/* Brand Showcase Section (Left 7 Columns on Large Screens) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#0a0a0a] border border-white/10 p-8 sm:p-12 text-left relative">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-none w-fit">
              <Sparkles className="h-3.5 w-3.5 gold-text animate-pulse" />
              <span className="text-[10px] uppercase tracking-widest gold-text font-bold">
                White-Label Master Architecture
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-normal tracking-tight text-white leading-[1.1]">
              Your Salon.<br />
              <span className="brand-serif italic gold-text font-bold">
                Your Brand.
              </span><br />
              Your Success.
            </h1>

            <p className="text-zinc-400 text-sm max-w-md leading-relaxed font-sans">
              Nexora SalonOS is a multi-tenant enterprise engine designed for luxury style boutiques, barbers, and spas. Deploy fully custom booking structures, staff timetables, and point-of-sale services instantly.
            </p>
          </div>

          {/* Module Specs Grid */}
          <div className="grid grid-cols-2 gap-px bg-white/10 mt-12 font-mono">
            <div className="p-4 bg-[#0a0a0a]">
              <span className="label-caps block text-zinc-500 mb-1">Multi-Tenancy</span>
              <span className="text-xs text-white">Dynamic Routing Subdomain Matcher</span>
            </div>
            <div className="p-4 bg-[#0a0a0a]">
              <span className="label-caps block text-zinc-500 mb-1">Database Engine</span>
              <span className="text-xs text-white">Prisma DB Sync / PG-SQL Schema</span>
            </div>
            <div className="p-4 bg-[#0a0a0a]">
              <span className="label-caps block text-zinc-500 mb-1">Authentication</span>
              <span className="text-xs text-white">Role-Based RBAC JWT Simulation</span>
            </div>
            <div className="p-4 bg-[#0a0a0a]">
              <span className="label-caps block text-zinc-500 mb-1">White Label</span>
              <span className="text-xs text-white">Theme Hex Color Injection Mapping</span>
            </div>
          </div>
        </div>

        {/* Login Form Box (Right 5 Columns on Large Screens) */}
        <div className="lg:col-span-5 bg-[#0d0d0d] border border-white/10 p-8 sm:p-10 relative flex flex-col justify-between">
          <div className="space-y-6">
            <div className="text-center md:text-left border-b border-white/10 pb-6">
              <span className="label-caps gold-text block mb-1">Authorization Gateway</span>
              <h2 className="brand-serif text-2xl font-normal italic text-white tracking-tight">Access Control Center</h2>
            </div>

            {/* Role Choice Selectors */}
            <div className="grid grid-cols-3 gap-px bg-white/10 p-px rounded-none">
              <button
                onClick={() => {
                  setActiveTab('SUPER_ADMIN');
                  setEmail(quickCreds.SUPER_ADMIN.email);
                }}
                className={`py-3.5 px-1 font-mono font-medium tracking-tight transition-all flex flex-col items-center gap-2 rounded-none text-[9px] uppercase ${
                  activeTab === 'SUPER_ADMIN' 
                    ? 'bg-[#0a0a0a] text-gold-500 border-t-2 gold-border font-bold' 
                    : 'bg-[#111111] text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Admin</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('SHOP_OWNER');
                  setEmail(quickCreds.SHOP_OWNER.email);
                }}
                className={`py-3.5 px-1 font-mono font-medium tracking-tight transition-all flex flex-col items-center gap-2 rounded-none text-[9px] uppercase ${
                  activeTab === 'SHOP_OWNER' 
                    ? 'bg-[#0a0a0a] text-gold-500 border-t-2 gold-border font-bold' 
                    : 'bg-[#111111] text-zinc-400 hover:text-zinc-300'
                }`}
              >
                <Store className="h-3.5 w-3.5" />
                <span>Owner</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab('CUSTOMER');
                  setEmail(quickCreds.CUSTOMER.email);
                }}
                className={`py-3.5 px-1 font-mono font-medium tracking-tight transition-all flex flex-col items-center gap-2 rounded-none text-[9px] uppercase ${
                  activeTab === 'CUSTOMER' 
                    ? 'bg-[#0a0a0a] text-gold-500 border-t-2 gold-border font-bold' 
                    : 'bg-[#111111] text-zinc-400 hover:text-zinc-300'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                <span>Customer</span>
              </button>
            </div>

            {/* Live credentials showcase badge */}
            <div className="p-4 bg-[#050505] border border-white/5 rounded-none select-all relative overflow-hidden">
              <div className="absolute top-0 right-0 py-0.5 px-1.5 bg-gold-500/10 text-gold-400 text-[8px] tracking-widest font-mono">
                SIMULATED PROFILE
              </div>
              <span className="label-caps text-zinc-500 block mb-1">
                Profile Focus: {quickCreds[activeTab].name}
              </span>
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-2 text-xs font-mono gap-1.5">
                <span className="text-zinc-300">{email || quickCreds[activeTab].email}</span>
                <span className="text-zinc-500">{quickCreds[activeTab].pass}</span>
              </div>
              <div 
                className="mt-3 text-[9px] font-mono gold-text hover:underline cursor-pointer flex items-center gap-1 uppercase tracking-wider" 
                onClick={() => setEmail(quickCreds[activeTab].email)}
              >
                ⚡ Click to auto-fill these profile values
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-caps block text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
                  <input
                    type="email"
                    required
                    placeholder={quickCreds[activeTab].email}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 py-3 pl-11 pr-4 text-xs rounded-none text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="label-caps block text-zinc-400 mb-1.5">
                  Secret Access Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 py-3 pl-11 pr-11 text-xs rounded-none text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/20 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-neutral-200 text-black font-bold uppercase tracking-widest text-[11px] py-4 rounded-none transition-all hover:shadow-lg active:scale-[0.99] mt-6 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Configuring Session...</span>
                  </>
                ) : (
                  <>
                    <span>Initialize {activeTab === 'SUPER_ADMIN' ? 'Admin OS' : activeTab === 'SHOP_OWNER' ? 'Atelier Portal' : 'Booking View'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* White label credential notice footer */}
          <div className="mt-8 pt-4 border-t border-white/10 text-center text-[9px] text-zinc-500 font-mono leading-relaxed uppercase tracking-widest">
            SSL GUARD SECURED. TENANCY INTEGRITY SECURED.
          </div>
        </div>

      </div>
    </div>
  );
}
