import React, { useState, useEffect } from 'react';
import { 
  Building, DollarSign, Layers, CheckCircle2, 
  Plus, Terminal, FileText, Database, Play, 
  Activity, Shield, RefreshCw, Sparkles, Server, Globe 
} from 'lucide-react';
import { Tenant, SQLQueryLog } from '../types';
import { dbSim, PRISMA_SCHEMA_CODE, POSTGRESQL_METADATA } from '../data/mockDatabase';

interface SuperAdminDashboardProps {
  tenants: Tenant[];
  onTenantCreated: (newTenant: Tenant) => void;
}

export default function SuperAdminDashboard({ tenants, onTenantCreated }: SuperAdminDashboardProps) {
  // New Tenant Provision state
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState('149'); // Default tier
  const [msg, setMsg] = useState<{ type: 'success' | 'err'; text: string } | null>(null);

  // SQL/Workspace states
  const [activeTab, setActiveTab] = useState<'tenants' | 'database' | 'logs'>('tenants');
  const [dbSubTab, setDbSubTab] = useState<'prisma' | 'postgres' | 'console'>('prisma');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM "Tenant";');
  const [sqlResult, setSqlResult] = useState<any>(null);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [rawLogs, setRawLogs] = useState<SQLQueryLog[]>([]);

  useEffect(() => {
    setRawLogs(dbSim.getSqlLogs());
  }, [tenants, sqlResult]);

  // Quick statistics
  const totalMRR = tenants.reduce((acc, curr) => acc + curr.mrr, 0);
  const activeCount = tenants.filter(t => t.isActive).length;

  const handleProvisionTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !subdomain) {
      setMsg({ type: 'err', text: 'Please fill name and subdomain identifiers.' });
      return;
    }

    // Validation: check subdomain duplicate
    const normalizedSub = subdomain.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isDup = tenants.some(t => t.subdomain.toLowerCase() === normalizedSub);
    if (isDup) {
      setMsg({ type: 'err', text: `Subdomain "${normalizedSub}" is already registered on Nexora network.` });
      return;
    }

    try {
      const created = await dbSim.createTenant({
        name,
        subdomain: normalizedSub,
        tagline: tagline || 'Exclusive Wellness & Hair Boutique',
        primaryColor: '#D4AF37', // Default classy Gold
        secondaryColor: '#0A0A0A',
        textColor: '#FFFFFF',
        fontFamily: 'serif',
        address: address || 'Main Elite Boulevard 10, Suite A',
        phone: phone || '+1 (555) 0192-9900',
        email: email || `office@${normalizedSub}.salon.os`,
        mrr: Number(tier)
      });

      onTenantCreated(created);
      setMsg({ type: 'success', text: `Shop "${created.name}" successfully provisioned & synced to PostgreSQL cluster!` });
      
      // Reset form
      setName('');
      setSubdomain('');
      setTagline('');
      setAddress('');
      setPhone('');
      setEmail('');
      setTier('149');

      // Clear helper msg
      setTimeout(() => setMsg(null), 5000);
    } catch (err: any) {
      setMsg({ type: 'err', text: err.message || 'Provisioning sequence failure.' });
    }
  };

  const handleRunSQL = async () => {
    setSqlError(null);
    setSqlResult(null);
    const { rows, error } = await dbSim.runRawSQL(sqlQuery);
    if (error) {
      setSqlError(error);
    } else {
      setSqlResult(rows);
    }
    // Refresh log list
    setRawLogs(dbSim.getSqlLogs());
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header and Subheader */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-mono tracking-widest text-emerald-450 font-bold uppercase">PRIMARY CLUSTER STATUS: LIVE</span>
          </div>
          <h1 className="text-3xl brand-serif text-white italic tracking-tight font-bold mt-1">Superplatform Orchestrator</h1>
          <p className="text-zinc-500 text-xs font-mono mt-1">Control panel for multi-tenant accounts, subscription planes and database tables.</p>
        </div>

        {/* DB Connection Indicators */}
        <div className="flex items-center gap-2.5">
          <div className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-none flex items-center gap-2">
            <Server className="h-3.5 w-3.5 text-gold-500" />
            <span className="text-zinc-400 text-[10px] font-mono uppercase tracking-wider font-semibold">PostgreSQL VM Connected</span>
          </div>
          <div className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-none flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-zinc-400 text-[10px] font-mono uppercase tracking-wider font-semibold">Prisma Client</span>
          </div>
        </div>
      </div>

      {/* Grid of Key Platform Indicators (SaaS Metrics) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="geometric-panel p-6 relative overflow-hidden flex flex-col justify-between h-36 rounded-none">
          <div className="flex justify-between items-start">
            <span className="label-caps font-mono">Total Revenue MRR</span>
            <span className="p-1.5 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded-none">
              <DollarSign className="h-4 w-4" />
            </span>
          </div>
          <div>
            <span className="text-3xl brand-serif font-normal text-white italic font-bold leading-none select-all">${totalMRR.toFixed(2)}</span>
            <span className="text-zinc-500 text-[9px] block mt-1.5 font-mono uppercase tracking-widest leading-none">Consolidated billing</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="geometric-panel p-6 relative overflow-hidden flex flex-col justify-between h-36 rounded-none">
          <div className="flex justify-between items-start">
            <span className="label-caps font-mono">Active Tenants</span>
            <span className="p-1.5 bg-white/5 border border-white/10 text-zinc-300 rounded-none">
              <Building className="h-4 w-4" />
            </span>
          </div>
          <div>
            <span className="text-3xl brand-serif font-normal italic select-all text-white font-bold leading-none">{activeCount} / {tenants.length}</span>
            <span className="text-zinc-500 text-[9px] block mt-1.5 font-mono uppercase tracking-widest leading-none">Live sandboxed domains</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="geometric-panel p-6 relative overflow-hidden flex flex-col justify-between h-36 rounded-none">
          <div className="flex justify-between items-start">
            <span className="label-caps font-mono">SQL Queries Executed</span>
            <span className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-none">
              <Terminal className="h-4 w-4" />
            </span>
          </div>
          <div>
            <span className="text-3xl brand-serif font-normal italic select-all text-emerald-400 font-bold leading-none">{rawLogs.length}</span>
            <span className="text-zinc-500 text-[9px] block mt-1.5 font-mono uppercase tracking-widest leading-none">Mutations logged</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="geometric-panel p-6 relative overflow-hidden flex flex-col justify-between h-36 rounded-none">
          <div className="flex justify-between items-start">
            <span className="label-caps font-mono">Platform Integrity</span>
            <span className="p-1.5 bg-white/5 border border-white/10 text-emerald-450 rounded-none">
              <Activity className="h-4 w-4 animate-pulse" />
            </span>
          </div>
          <div>
            <span className="text-lg font-mono text-emerald-400 font-bold tracking-wider leading-none">100% ISSUER OK</span>
            <span className="text-zinc-500 text-[9px] block mt-1.5 font-mono uppercase tracking-widest leading-none">Tenant SSL Isolated</span>
          </div>
        </div>
      </div>

      {/* Main Orchestrator Workspace Cards */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-0 mb-6 font-mono text-xs">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`pb-3.5 px-1 border-b-2 font-medium transition-all flex items-center gap-2 ${
            activeTab === 'tenants' ? 'border-gold-500 text-gold-400 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Building className="h-3.5 w-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Tenant Provisioner</span>
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3.5 px-1 border-b-2 font-medium transition-all flex items-center gap-2 ${
            activeTab === 'database' ? 'border-gold-500 text-gold-400 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Database className="h-3.5 w-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Database Workbench</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3.5 px-1 border-b-2 font-medium transition-all flex items-center gap-2 ${
            activeTab === 'logs' ? 'border-gold-500 text-gold-400 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Audit logs stream</span>
        </button>
      </div>

      {/* Tab Panel 1: Tenants List & Provisioner form */}
      {activeTab === 'tenants' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tenant Provisioner Form (Col span 5) */}
          <div className="lg:col-span-5 bg-[#0d0d0d] border border-white/10 rounded-none p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <Sparkles className="h-5 w-5 text-gold-500 animate-pulse" />
              <h2 className="brand-serif italic text-xl font-normal text-white">Provision Luxury Tenant</h2>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Instantiate a brand new white-label boutique. The cluster dynamically establishes isolated data structures and attaches styling colors.
            </p>

            {msg && (
              <div className={`p-3 rounded-none text-xs leading-relaxed ${
                msg.type === 'success' ? 'bg-emerald-950/55 text-emerald-400 border border-emerald-800/40' : 'bg-red-950/45 text-red-300 border border-red-900/30'
              }`}>
                {msg.text}
              </div>
            )}

            <form onSubmit={handleProvisionTenant} className="space-y-4 font-mono select-none">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-caps block text-zinc-450 mb-1.5">Salon Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Crown Royalty"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      // Dynamic subdomain recommendation
                      if (!subdomain) {
                        setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                      }
                    }}
                    className="w-full bg-[#111111] border border-white/10 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-gold-500 text-sans"
                  />
                </div>
                <div>
                  <label className="label-caps block text-zinc-450 mb-1.5">Subdomain</label>
                  <div className="flex items-center bg-[#111111] border border-white/10 rounded-none px-3 py-2 text-xs text-white focus-within:border-gold-500">
                    <input
                      type="text"
                      required
                      placeholder="crown"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      className="bg-transparent text-white focus:outline-none w-full pr-1 font-mono hover:text-gold-300 transition-all"
                    />
                    <span className="text-zinc-500 text-[10px]">.salon.os</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="label-caps block text-zinc-450 mb-1.5">Premium Tagline (Tagline)</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Organic Treatments & Barber"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-gold-500 text-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-caps block text-zinc-450 mb-1.5">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 0120"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="label-caps block text-zinc-450 mb-1.5">Billing Tier / MRR</label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                    className="w-full bg-[#111111] border border-white/10 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="149">Standard Tier - $149/mo</option>
                    <option value="249">Platinum Tier - $249/mo</option>
                    <option value="499">Enterprise Tier - $499/mo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label-caps block text-zinc-455 mb-1.5 font-bold">Administrative Contact Email</label>
                <input
                  type="email"
                  placeholder="admin@crown.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="label-caps block text-zinc-455 mb-1.5 font-bold">Physical Location Address</label>
                <input
                  type="text"
                  placeholder="Luxury Row 80, Suite A, Manhattan, NY"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-gold-500 text-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white hover:bg-neutral-200 text-black font-bold py-3 text-[10px] rounded-none uppercase tracking-widest hover:bg-gold-400 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 text-black" />
                <span>COMPILE & PROVISION TENANT</span>
              </button>
            </form>
          </div>

          {/* Tenants Fleet Grid (Col span 7) */}
          <div className="lg:col-span-7 space-y-4">
            <h2 className="text-xl font-normal brand-serif italic text-white flex items-center justify-between border-b border-white/10 pb-3">
              <span>Managed Tenants Registry</span>
              <span className="text-[10px] font-mono text-zinc-500 px-3 py-1 border border-white/10 rounded-none bg-white/5 uppercase tracking-wider">
                {tenants.length} clusters active
              </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tenants.map(tenant => {
                return (
                  <div 
                    key={tenant.id} 
                    className="bg-[#0d0d0d] border border-white/10 rounded-none overflow-hidden hover:border-gold-500/30 transition-all flex flex-col justify-between"
                  >
                    {/* Header bar matching tenant styling */}
                    <div className="h-1 w-full" style={{ backgroundColor: tenant.primaryColor }} />
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      
                      {/* Name and subdomain indicators */}
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="brand-serif italic font-normal text-lg text-white tracking-tight">{tenant.name}</h3>
                          <div className="flex items-center gap-2 mt-1 font-mono text-[9px] text-zinc-500 uppercase tracking-wider">
                            <Globe className="h-3 w-3 text-zinc-400" />
                            <span>https://{tenant.subdomain}.salon.os</span>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-none text-[9px] font-mono bg-white/5 border border-white/10 text-gold-500 font-bold uppercase tracking-wider">
                          ${tenant.mrr}/mo
                        </span>
                      </div>

                      {/* Info lines */}
                      <div className="space-y-1 text-xs text-zinc-400 font-sans">
                        <p className="italic text-zinc-400 brand-serif leading-tight">"{tenant.tagline}"</p>
                        <p className="text-[10px] font-mono"><strong className="text-zinc-650 label-caps">ID:</strong> {tenant.id}</p>
                        <p className="text-[10px] font-mono"><strong className="text-zinc-650 label-caps">LOC:</strong> {tenant.address}</p>
                        <p className="text-[10px] font-mono"><strong className="text-zinc-650 label-caps">PHONE:</strong> {tenant.phone}</p>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-between items-center text-[9px] uppercase font-mono tracking-widest">
                        <span className="text-zinc-500">Est. {new Date(tenant.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>LIVE NODE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab Panel 2: Database and Schema Workspace */}
      {activeTab === 'database' && (
        <div className="bg-[#0d0d0d] border border-white/10 rounded-none overflow-hidden flex flex-col text-left">
          {/* Header row inside db dashboard */}
          <div className="bg-white/5 border-b border-white/10 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-gold-500" />
              <div>
                <span className="text-xs font-mono font-bold text-white uppercase block tracking-wider">POSTGRESQL RELATIONAL VIEWER</span>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Live reflection of Prisma Client models & database indices</span>
              </div>
            </div>

            {/* Sub-tab selection hooks */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-none border border-white/10 text-[9px] font-mono uppercase tracking-wider">
              <button
                onClick={() => setDbSubTab('prisma')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none ${
                  dbSubTab === 'prisma' ? 'bg-[#0d0d0d] text-gold-500 font-bold border-l-2 gold-border' : 'text-zinc-450 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>schema.prisma</span>
              </button>
              <button
                onClick={() => setDbSubTab('postgres')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none ${
                  dbSubTab === 'postgres' ? 'bg-[#0d0d0d] text-gold-500 font-bold border-l-2 gold-border' : 'text-zinc-450 hover:text-white'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>PostgreSQL Tables ({POSTGRESQL_METADATA.length})</span>
              </button>
              <button
                onClick={() => setDbSubTab('console')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none ${
                  dbSubTab === 'console' ? 'bg-[#0d0d0d] text-gold-500 font-bold border-l-2 gold-border' : 'text-zinc-450 hover:text-white'
                }`}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>SQL Terminal Console</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Database Sub Panel A: Prisma Schema */}
            {dbSubTab === 'prisma' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-[#111111] border border-white/10 p-4 rounded-none text-xs text-zinc-400 leading-relaxed font-sans">
                  <span>
                    Prisma ORM generates standard TypeScript type-safety wrappers directly from the schema layout below. Changing multi-tenant relationships maps automatically in PostgreSQL via migrations.
                  </span>
                  <span className="hidden md:inline-block px-2 py-1 bg-[#0d0d0d] rounded-none text-[9px] font-mono text-emerald-400 border border-emerald-950/40 uppercase tracking-widest font-bold">
                    PRISMA SCHEMA SYNCED
                  </span>
                </div>

                <div className="bg-[#0b0b0b] rounded-lg border border-zinc-800 overflow-x-auto p-5 font-mono text-xs text-zinc-300 leading-relaxed max-h-[500px]">
                  <pre className="text-zinc-300">
                    {PRISMA_SCHEMA_CODE.split('\n').map((line, i) => {
                      let color = 'text-zinc-400';
                      if (line.trim().startsWith('model') || line.trim().startsWith('enum') || line.trim().startsWith('datasource') || line.trim().startsWith('generator')) {
                        color = 'text-gold-400 font-semibold';
                      } else if (line.trim().startsWith('@relation') || line.includes('@id') || line.includes('@default') || line.includes('@unique')) {
                        color = 'text-purple-400';
                      } else if (line.trim().startsWith('//')) {
                        color = 'text-zinc-600';
                      }
                      return (
                        <div key={i} className="flex hover:bg-zinc-900/35 px-1 py-0.5 rounded">
                          <span className="w-8 text-zinc-700 text-right mr-4 select-none border-r border-zinc-900 pr-2">{i + 1}</span>
                          <span className={color}>{line}</span>
                        </div>
                      );
                    })}
                  </pre>
                </div>
              </div>
            )}

            {/* Database Sub Panel B: PostgreSQL Relational Tables */}
            {dbSubTab === 'postgres' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {POSTGRESQL_METADATA.map((table, tIdx) => (
                    <div key={tIdx} className="bg-[#050505] border border-white/10 rounded-none p-6 space-y-4">
                      <div>
                        <div className="flex justify-between items-center pb-3 border-b border-white/10">
                          <span className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 label-caps col-span-2 text-gold-500">
                            <Server className="h-3.5 w-3.5 text-gold-500" />
                            <span>TABLE "{table.tableName}"</span>
                          </span>
                          <span className="text-[9px] font-mono text-zinc-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-none uppercase tracking-wider">
                            {table.tableName === 'shops' ? tenants.length : table.tableName === 'services' ? 'Dynamic' : 'Simulated'} rows
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs mt-3 leading-relaxed">
                          {table.description}
                        </p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px] font-mono text-left">
                          <thead>
                            <tr className="border-b border-white/10 text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                              <th className="pb-2">COLUMN</th>
                              <th className="pb-2">TYPE</th>
                              <th className="pb-2 text-center">ATTRIBUTES</th>
                            </tr>
                          </thead>
                          <tbody>
                            {table.columns.map((col, cIdx) => (
                              <tr key={cIdx} className="border-b border-white/5 hover:bg-white/5 text-zinc-300">
                                <td className="py-2 font-bold gold-text">{col.name}</td>
                                <td className="py-2 text-zinc-500">{col.type}</td>
                                <td className="py-2 text-center">
                                  {col.isPrimaryKey && <span className="text-gold-500 text-[8px] font-bold border border-gold-500/20 bg-gold-500/5 px-1.5 py-0.5 rounded-none">PK</span>}
                                  {col.isForeignKey && <span className="text-purple-400 text-[8px] font-bold border border-purple-500/20 bg-purple-500/5 px-1.5 py-0.5 rounded-none ml-1">FK</span>}
                                  {!col.isPrimaryKey && !col.isForeignKey && <span className="text-zinc-650 text-[8px] tracking-wider">{col.nullable ? 'NULL' : 'NOT NULL'}</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Database Sub Panel C: Raw SQL Terminal console */}
            {dbSubTab === 'console' && (
              <div className="space-y-4 font-mono text-left">
                <div className="bg-[#111111] p-6 border border-white/10 rounded-none space-y-4">
                  <div className="flex justify-between items-center text-xs text-zinc-400">
                    <span className="flex items-center gap-1.5 text-gold-500 uppercase tracking-widest text-[9px] font-bold">
                      <Terminal className="h-4 w-4" />
                      <span>PostgreSQL v15 Sandbox Shell</span>
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500">Session: root@nexora.cluster</span>
                  </div>

                  {/* Terminal input */}
                  <div className="relative">
                    <textarea
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      className="w-full h-24 bg-[#0d0d0d] border border-white/10 p-4 rounded-none font-mono text-xs text-white focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/10 leading-relaxed"
                      placeholder="Input standard SELECT / UPDATE Query statements here..."
                    />
                    <button
                      onClick={handleRunSQL}
                      className="absolute right-3 bottom-4 bg-white hover:bg-neutral-200 text-black font-bold px-4 py-2 rounded-none text-[10px] uppercase tracking-wider flex items-center gap-1 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-current text-black" />
                      <span>Execute Query</span>
                    </button>
                  </div>

                  {/* Preloaded quick queries helper */}
                  <div className="flex flex-wrap gap-2 text-[9px] uppercase tracking-wider">
                    <span className="text-zinc-500 self-center">Templates:</span>
                    <button
                      onClick={() => setSqlQuery('SELECT * FROM "Tenant" WHERE "isActive" = true;')}
                      className="bg-[#050505] hover:bg-zinc-900 border border-white/10 px-2.5 py-1 rounded-none text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Show active tenants
                    </button>
                    <button
                      onClick={() => setSqlQuery('SELECT * FROM "Service" ORDER BY price DESC;')}
                      className="bg-[#050505] hover:bg-zinc-900 border border-white/10 px-2.5 py-1 rounded-none text-zinc-400 hover:text-white cursor-pointer"
                    >
                      View luxury services
                    </button>
                    <button
                      onClick={() => setSqlQuery('SELECT * FROM "Appointment" LIMIT 5;')}
                      className="bg-[#050505] hover:bg-zinc-900 border border-white/10 px-2.5 py-1 rounded-none text-zinc-400 hover:text-white cursor-pointer"
                    >
                      Retrieve logs
                    </button>
                  </div>
                </div>

                {/* SQL result visualizer */}
                <div className="bg-[#050505] border border-white/10 rounded-none p-6 min-h-[150px]">
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold tracking-widest mb-3">Query Execution Results:</span>
                  
                  {sqlError && (
                    <div className="text-red-400 text-[11px] bg-red-950/25 border border-red-900/35 p-4 rounded-none">
                      ⚠️ SQL Error Code: {sqlError}
                    </div>
                  )}

                  {!sqlError && !sqlResult && (
                    <div className="text-zinc-600 text-xs italic flex justify-center py-8">
                      Type select query above and execute or click any template tab.
                    </div>
                  )}

                  {!sqlError && sqlResult && (
                    <div className="space-y-4">
                      <div className="text-[9px] text-zinc-500 flex justify-between items-center border-b border-white/5 pb-2 uppercase tracking-wide">
                        <span>SUCCESS - rowset returned {sqlResult.length} structures</span>
                        <span>Latency: Simulated local memory seek is 2ms</span>
                      </div>
                      <div className="text-xs text-emerald-400 overflow-x-auto max-h-[300px]">
                        <pre className="p-2 select-all">{JSON.stringify(sqlResult, null, 2)}</pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Panel 3: Live API and Action request logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h2 className="text-xl font-normal brand-serif italic text-white tracking-tight flex items-center gap-2">
              <Activity className="h-5 w-5 text-gold-500" />
              <span>Real-time System Audit Stream</span>
            </h2>
            <button
              onClick={() => setRawLogs(dbSim.getSqlLogs())}
              className="p-1 px-3 bg-white/5 border border-white/10 hover:border-gold-500/40 hover:text-gold-400 rounded-none transition-all text-zinc-400 text-[10px] font-mono uppercase tracking-widest flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="h-3. w-3" />
              <span>Refresh Log Stream</span>
            </button>
          </div>

          <div className="bg-[#0d0d0d] border border-white/10 rounded-none overflow-hidden font-mono text-[11px]">
            <div className="bg-white/5 px-4 py-3 text-zinc-500 uppercase font-bold tracking-widest grid grid-cols-12 gap-2 border-b border-white/10">
              <span className="col-span-2 text-[9px]">Timestamp</span>
              <span className="col-span-1 text-[9px]">Engine</span>
              <span className="col-span-7 text-[9px]">Prisma / SQL Instruction Matcher</span>
              <span className="col-span-1 text-center text-[9px]">Affected</span>
              <span className="col-span-1 text-right text-[9px]">Latency</span>
            </div>

            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
              {rawLogs.length === 0 ? (
                <div className="p-12 text-center text-zinc-500 italic uppercase tracking-wider">No logs currently logged. Run database queries or switch roles to interact.</div>
              ) : (
                rawLogs.map((log) => (
                  <div key={log.id} className="px-4 py-3.5 hover:bg-white/5 grid grid-cols-12 gap-2 text-zinc-300 transition-all select-none">
                    <span className="col-span-2 text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span className="col-span-1 font-bold">
                      {log.type === 'PRISMA' ? (
                        <span className="text-purple-400 px-1.5 py-0.5 rounded-none bg-purple-950/20 border border-purple-900/25 text-[9px] tracking-wider uppercase">PRISMA</span>
                      ) : (
                        <span className="text-emerald-400 px-1.5 py-0.5 rounded-none bg-emerald-950/25 border border-emerald-900/25 text-[9px] tracking-wider uppercase">PG-SQL</span>
                      )}
                    </span>
                    <span className="col-span-7 truncate font-medium text-white hover:text-gold-100" title={log.query}>
                      {log.query}
                    </span>
                    <span className="col-span-1 text-center font-bold text-gold-500">{log.rowsAffected}</span>
                    <span className="col-span-1 text-right text-zinc-500">{log.durationMs}ms</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
