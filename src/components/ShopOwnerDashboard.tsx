import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Users, Scissors, Calendar, Sliders, Palette, 
  Trash, Plus, Check, Undo, RefreshCw, UploadCloud, 
  Sparkles, CheckCircle2, Star, Clock, MapPin, Eye,
  Download, User, Save, CalendarRange, Lock, Unlock
} from 'lucide-react';
import { Tenant, Service, Staff, Appointment } from '../types';
import { dbSim } from '../data/mockDatabase';

interface ShopOwnerDashboardProps {
  tenant: Tenant;
  onTenantUpdate: (updatedTenant: Tenant) => void;
}

export default function ShopOwnerDashboard({ tenant, onTenantUpdate }: ShopOwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'styling' | 'services' | 'appointments' | 'staff' | 'customers'>('overview');
  
  // Local active datasets
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Staff management input states
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffBio, setStaffBio] = useState('');
  const [staffRating, setStaffRating] = useState('5.0');
  const [staffAvatarUrl, setStaffAvatarUrl] = useState('');
  const [staffSpecialties, setStaffSpecialties] = useState('');

  // Staff Schedule & Availability States
  const [selectedStaffIdForSchedule, setSelectedStaffIdForSchedule] = useState<string | null>(null);
  const [scheduleWeeklyHours, setScheduleWeeklyHours] = useState<Record<string, { start: string; end: string; active: boolean }>>({
    'Monday': { start: '09:00', end: '17:00', active: true },
    'Tuesday': { start: '09:00', end: '17:00', active: true },
    'Wednesday': { start: '09:00', end: '17:00', active: true },
    'Thursday': { start: '09:00', end: '19:00', active: true },
    'Friday': { start: '09:00', end: '19:00', active: true },
    'Saturday': { start: '10:00', end: '16:00', active: true },
    'Sunday': { start: '00:00', end: '00:00', active: false },
  });
  const [scheduleExceptions, setScheduleExceptions] = useState<string[]>([]);
  const [scheduleViewType, setScheduleViewType] = useState<'weekly' | 'calendar'>('weekly');
  const [scheduleSuccessMessage, setScheduleSuccessMessage] = useState<string | null>(null);

  const [customerSearch, setCustomerSearch] = useState('');

  // White label customization inputs
  const [tenantName, setTenantName] = useState(tenant.name);
  const [tagline, setTagline] = useState(tenant.tagline);
  const [address, setAddress] = useState(tenant.address);
  const [phone, setPhone] = useState(tenant.phone);
  const [email, setEmail] = useState(tenant.email);
  const [primaryColor, setPrimaryColor] = useState(tenant.primaryColor);
  const [fontFamily, setFontFamily] = useState(tenant.fontFamily);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New service input states
  const [newSvcName, setNewSvcName] = useState('');
  const [newSvcCategory, setNewSvcCategory] = useState('Haircuts');
  const [newSvcPrice, setNewSvcPrice] = useState('');
  const [newSvcDuration, setNewSvcDuration] = useState('45');
  const [newSvcDesc, setNewSvcDesc] = useState('');

  // Upload simulation states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<'logo' | 'banner'>('logo');
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>('');

  // Load datasets mapped specifically to this Salon Tenant
  const loadTenantData = async () => {
    const svcs = await dbSim.getServicesByTenant(tenant.id);
    const stf = await dbSim.getStaffByTenant(tenant.id);
    const apts = await dbSim.getAppointmentsByTenant(tenant.id);
    setServices(svcs);
    setStaff(stf);
    setAppointments(apts);
  };

  useEffect(() => {
    loadTenantData();
    // Sync state if tenant shifts via switcher
    setTenantName(tenant.name);
    setTagline(tenant.tagline);
    setAddress(tenant.address);
    setPhone(tenant.phone);
    setEmail(tenant.email);
    setPrimaryColor(tenant.primaryColor);
    setFontFamily(tenant.fontFamily);
  }, [tenant]);

  useEffect(() => {
    if (staff.length > 0 && !selectedStaffIdForSchedule) {
      setSelectedStaffIdForSchedule(staff[0].id);
    }
  }, [staff]);

  useEffect(() => {
    if (!selectedStaffIdForSchedule) return;
    const currentMember = staff.find(st => st.id === selectedStaffIdForSchedule);
    if (currentMember) {
      if (currentMember.workingHours) {
        setScheduleWeeklyHours(currentMember.workingHours);
      } else {
        setScheduleWeeklyHours({
          'Monday': { start: '09:00', end: '17:00', active: true },
          'Tuesday': { start: '09:00', end: '17:00', active: true },
          'Wednesday': { start: '09:00', end: '17:00', active: true },
          'Thursday': { start: '09:00', end: '19:05', active: true },
          'Friday': { start: '09:00', end: '19:00', active: true },
          'Saturday': { start: '10:00', end: '16:00', active: true },
          'Sunday': { start: '00:00', end: '00:00', active: false },
        });
      }
      setScheduleExceptions(currentMember.blockedDates || []);
    }
  }, [selectedStaffIdForSchedule, staff]);

  // Color Presets mapping
  const COLOR_PRESETS = [
    { name: 'Nexora Gold Elite', primary: '#D4AF37', secondary: '#0A0A0A' },
    { name: 'Emerald Atelier', primary: '#047857', secondary: '#0F172A' },
    { name: 'Aeros Platinum', primary: '#6B7280', secondary: '#111827' },
    { name: 'Sapphire Royal', primary: '#2563EB', secondary: '#030712' },
    { name: 'Cabernet Velvet', primary: '#991B1B', secondary: '#0F0505' }
  ];

  const handleSaveBrandSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await dbSim.updateTenant(tenant.id, {
        name: tenantName,
        tagline,
        address,
        phone,
        email,
        primaryColor,
        fontFamily
      });
      onTenantUpdate(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  // Service Creation CRUD Handler
  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSvcName || !newSvcPrice) return;

    try {
      await dbSim.createService({
        tenantId: tenant.id,
        name: newSvcName,
        category: newSvcCategory,
        price: parseFloat(newSvcPrice),
        duration: parseInt(newSvcDuration, 10),
        description: newSvcDesc || 'Professional classic customized style option.'
      });
      
      // Reset form & Refetch
      setNewSvcName('');
      setNewSvcPrice('');
      setNewSvcDuration('45');
      setNewSvcDesc('');
      await loadTenantData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteService = async (serviceId: string) => {
    if (confirm('Are you sure you want to permanently delete this service from the PostgreSQL registry?')) {
      await dbSim.deleteService(serviceId);
      await loadTenantData();
    }
  };

  // Appointment Status Updater
  const handleUpdateAptStatus = async (id: string, status: Appointment['status']) => {
    await dbSim.updateAppointmentStatus(id, status);
    await loadTenantData();
  };

  // Staff CRUD Handlers
  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName || !staffRole) return;

    const specialtiesArray = staffSpecialties
      ? staffSpecialties.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    
    // Choose an elegant avatar from unsplash preset list if empty
    const avatar = staffAvatarUrl || `https://images.unsplash.com/photo-${[
      '1534528741775-53994a69daeb', 
      '1507003211169-0a1dd7228f2d', 
      '1500648767791-00dcc994a43e', 
      '1494790108377-be9c29b29330'
    ][Math.floor(Math.random() * 4)]}?auto=format&fit=crop&q=80&w=150&h=150`;

    try {
      if (editingStaffId) {
        await dbSim.updateStaff(editingStaffId, {
          name: staffName,
          role: staffRole,
          bio: staffBio || 'Dedicated wellness specialist dedicated to luxury client service and treatment designs.',
          rating: parseFloat(staffRating) || 5.0,
          avatarUrl: avatar,
          specialties: specialtiesArray
        });
      } else {
        await dbSim.createStaff({
          tenantId: tenant.id,
          name: staffName,
          role: staffRole,
          bio: staffBio || 'Dedicated wellness specialist dedicated to luxury client service and treatment designs.',
          rating: parseFloat(staffRating) || 5.0,
          avatarUrl: avatar,
          specialties: specialtiesArray
        });
      }

      handleResetStaffForm();
      await loadTenantData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditStaffClick = (member: Staff) => {
    setEditingStaffId(member.id);
    setStaffName(member.name);
    setStaffRole(member.role);
    setStaffBio(member.bio);
    setStaffRating(String(member.rating));
    setStaffAvatarUrl(member.avatarUrl || '');
    setStaffSpecialties(member.specialties ? member.specialties.join(', ') : '');
    
    // Smooth scroll to the form
    const formElement = document.getElementById('staff-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetStaffForm = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffRole('');
    setStaffBio('');
    setStaffRating('5.0');
    setStaffAvatarUrl('');
    setStaffSpecialties('');
  };

  const handleDeleteStaff = async (staffId: string) => {
    if (confirm('Are you sure you want to permanently remove this stylist specialist from the database?')) {
      await dbSim.deleteStaff(staffId);
      await loadTenantData();
    }
  };

  // Staff Schedule & Availability Handlers
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffIdForSchedule) return;
    try {
      await dbSim.updateStaff(selectedStaffIdForSchedule, {
        workingHours: scheduleWeeklyHours,
        blockedDates: scheduleExceptions
      });
      setScheduleSuccessMessage("Success: Specialist working hours and custom availability limits updated.");
      setTimeout(() => setScheduleSuccessMessage(null), 4000);
      await loadTenantData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDayActive = (day: string) => {
    setScheduleWeeklyHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        active: !prev[day].active
      }
    }));
  };

  const handleHourChange = (day: string, type: 'start' | 'end', val: string) => {
    setScheduleWeeklyHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: val
      }
    }));
  };

  const toggleExceptionDate = (dateStr: string) => {
    setScheduleExceptions(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };

  // Customers Helper & CSV Export Handler
  const getUniqueCustomers = () => {
    const customerMap = new Map<string, {
      name: string;
      email: string;
      phone: string;
      totalBookings: number;
      totalSpend: number;
      lastBookingDate: string;
    }>();

    appointments.forEach(apt => {
      const emailKey = (apt.customerEmail || '').trim().toLowerCase();
      const phoneKey = (apt.customerPhone || '').trim().replace(/[^0-9]/g, '');
      const key = emailKey || phoneKey || apt.customerName.trim().toLowerCase();
      
      const existing = customerMap.get(key);
      if (existing) {
        existing.totalBookings += 1;
        existing.totalSpend += apt.totalAmount;
        if (apt.date > existing.lastBookingDate) {
          existing.lastBookingDate = apt.date;
        }
      } else {
        customerMap.set(key, {
          name: apt.customerName,
          email: apt.customerEmail || 'anonymous@guest.com',
          phone: apt.customerPhone || 'N/A',
          totalBookings: 1,
          totalSpend: apt.totalAmount,
          lastBookingDate: apt.date
        });
      }
    });

    return Array.from(customerMap.values());
  };

  const handleExportCSV = () => {
    const uniqueCustomers = getUniqueCustomers();
    if (uniqueCustomers.length === 0) {
      alert("No customer records found to export at this time.");
      return;
    }

    const headers = ["Customer Name", "Email Address", "Phone Number", "Total Bookings", "Total Spend ($)", "Last Booking Date"];
    
    const escapeCSVField = (val: any) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = uniqueCustomers.map(c => [
      escapeCSVField(c.name),
      escapeCSVField(c.email),
      escapeCSVField(c.phone),
      escapeCSVField(c.totalBookings),
      escapeCSVField(c.totalSpend.toFixed(2)),
      escapeCSVField(c.lastBookingDate)
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `customers_export_${tenant.subdomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Simulated live file upload
  const handleSimulateUpload = (type: 'logo' | 'banner') => {
    setUploadType(type);
    setIsUploading(true);
    setUploadProgress(0);

    // Some luxury placeholder items depending on type
    const presets = type === 'logo' 
      ? [
          'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&q=80&w=200&h=200',
          'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&q=80&w=200&h=200'
        ]
      : [
          'https://images.unsplash.com/photo-1600948836101-f9ffda59d151?auto=format&fit=crop&q=80&w=1200&h=400',
          'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=1200&h=400'
        ];

    const chosen = presets[Math.floor(Math.random() * presets.length)];
    setSelectedPresetImage(chosen);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            // Apply logo updates
            const field = type === 'logo' ? { logoUrl: chosen } : { bannerUrl: chosen };
            const updated = await dbSim.updateTenant(tenant.id, field);
            onTenantUpdate(updated);
            setIsUploading(false);
          }, 300);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  // Aggregated shop metrics
  const shopSales = appointments.filter(a => a.status === 'COMPLETED' || a.status === 'CONFIRMED').reduce((acc, c) => acc + c.totalAmount, 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 select-none">
      {/* Shop Specific Brand Jumbotron header */}
      <div className="relative rounded-none overflow-hidden border border-white/10 bg-[#0d0d0d] p-8 sm:p-12 flex flex-col sm:flex-row justify-between items-center gap-6">
        {/* White-Label background tint reflecting primary color */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none filter blur-2xl"
          style={{ backgroundImage: `radial-gradient(circle at 10% 20%, ${tenant.primaryColor} 0%, transparent 60%)` }}
        />
        
        <div className="flex items-center gap-6 z-10 relative text-left">
          {tenant.logoUrl ? (
            <img 
              src={tenant.logoUrl} 
              alt="Brand logo" 
              referrerPolicy="no-referrer"
              className="h-16 w-16 sm:h-20 sm:w-20 rounded-none border object-cover shadow-md"
              style={{ borderColor: tenant.primaryColor }}
            />
          ) : (
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-none border border-dashed border-white/10 flex items-center justify-center text-[10px] text-zinc-500 font-mono">
              [LOGO URL]
            </div>
          )}
          
          <div className="space-y-1.5 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono tracking-widest px-2.5 py-1 border text-sans font-bold uppercase" style={{ color: tenant.primaryColor, borderColor: `${tenant.primaryColor}30`, backgroundColor: `${tenant.primaryColor}05` }}>
                TENANT CLUSTER GATEWAY
              </span>
              <span className="text-zinc-500 text-xs font-mono">{tenant.subdomain}.salon.os</span>
            </div>
            
            <h1 className="text-3xl brand-serif italic text-white font-normal tracking-tight">{tenantName || tenant.name}</h1>
            <p className="text-zinc-400 text-sm italic brand-serif opacity-80 leading-none">"{tagline || tenant.tagline}"</p>
          </div>
        </div>

        {/* Brand Theme quick display block */}
        <div className="z-10 relative flex flex-col items-center sm:items-end space-y-1.5 text-center sm:text-right">
          <span className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase font-bold">Live Corporate Theme</span>
          <div className="flex items-center gap-2 p-1.5 px-3 bg-black border border-white/10 rounded-none font-mono">
            <span className="h-3 w-3 rounded-none border border-white/10" style={{ backgroundColor: tenant.primaryColor }} />
            <span className="text-[10px] text-zinc-300 uppercase tracking-widest font-bold">{tenant.primaryColor}</span>
          </div>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10 pb-0 mb-6 font-mono text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3.5 px-1 border-b-2 font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview' ? 'text-gold-500 font-bold border-gold-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Atelier Desk</span>
        </button>

        <button
          onClick={() => setActiveTab('styling')}
          className={`pb-3.5 px-1 border-b-2 font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'styling' ? 'text-gold-500 font-bold border-gold-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Palette className="h-3.5 w-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Branding Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('services')}
          className={`pb-3.5 px-1 border-b-2 font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'services' ? 'text-gold-500 font-bold border-gold-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Scissors className="h-3.5 w-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Service Catalog</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3.5 px-1 border-b-2 font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'appointments' ? 'text-gold-500 font-bold border-gold-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Clock className="h-3.5 w-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Reservations Desk</span>
        </button>

        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3.5 px-1 border-b-2 font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'staff' ? 'text-gold-500 font-bold border-gold-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Staff Specialists</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`pb-3.5 px-1 border-b-2 font-medium transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'customers' ? 'text-gold-500 font-bold border-gold-500' : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <User className="h-3.5 w-3.5" />
          <span className="uppercase tracking-widest text-[10px]">Customer Directory</span>
        </button>
      </div>

      {/* Tab Panel 1: Shop Dashboard Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Internal quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 flex flex-col justify-between h-32 select-text">
              <span className="label-caps font-mono">Total Revenue Sales</span>
              <div>
                <span className="text-3xl brand-serif font-normal italic text-white font-bold leading-none">${shopSales.toFixed(2)}</span>
                <p className="text-zinc-500 text-[9px] font-mono uppercase tracking-widest leading-none mt-2">Historical receipts</p>
              </div>
            </div>

            <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 flex flex-col justify-between h-32">
              <span className="label-caps font-mono">Active Bookings</span>
              <div>
                <span className="text-3xl brand-serif font-normal italic text-white font-bold leading-none">{appointments.filter(a => a.status === 'CONFIRMED' || a.status === 'PENDING').length}</span>
                <p className="text-zinc-500 text-[9px] font-mono uppercase tracking-widest leading-none mt-2">Active appointments</p>
              </div>
            </div>

            <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 flex flex-col justify-between h-32">
              <span className="label-caps font-mono">Staff Artisans</span>
              <div>
                <span className="text-3xl brand-serif font-normal italic text-white font-bold leading-none">{staff.length} Masters</span>
                <p className="text-zinc-500 text-[9px] font-mono uppercase tracking-widest leading-none mt-2">Registered stylist roster</p>
              </div>
            </div>

            <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 flex flex-col justify-between h-32">
              <span className="label-caps font-mono">Average Impression rating</span>
              <div>
                <span className="text-3xl brand-serif text-white font-bold flex items-center leading-none mt-1">
                  <span>4.91</span>
                  <Star className="h-4.5 w-4.5 text-gold-500 fill-current ml-2" />
                </span>
                <p className="text-zinc-500 text-[9px] font-mono uppercase tracking-widest leading-none mt-2">Live feed feedback</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Quick staff bios roster (Col span 5) */}
            <div className="lg:col-span-5 bg-[#0d0d0d] border border-white/10 rounded-none p-6 space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="brand-serif italic text-lg text-white font-normal">Our Master Artisans</h3>
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{staff.length} mapped on db</span>
              </div>

              <div className="space-y-4">
                {staff.map(member => (
                  <div key={member.id} className="flex gap-4 p-4 hover:bg-white/5 rounded-none border border-white/5 transition-all items-start">
                    <img 
                      src={member.avatarUrl} 
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="h-12 w-12 rounded-none object-cover border"
                      style={{ borderColor: tenant.primaryColor }}
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white leading-none">{member.name}</span>
                        <span className="flex items-center gap-0.5 text-gold-500 font-mono text-[10px] font-bold">
                          <Star className="h-3 w-3 fill-current text-gold-500" />
                          <span>{member.rating}</span>
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold tracking-widest block">{member.role}</span>
                      <p className="text-xs text-zinc-400 leading-relaxed">{member.bio}</p>
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.specialties.map((s, i) => (
                          <span key={i} className="text-[9px] font-mono px-2 py-0.5 border border-white/10 rounded-none bg-white/5 text-zinc-400">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick bookings view (Col span 7) */}
            <div className="lg:col-span-7 bg-[#0d0d0d] border border-white/10 rounded-none p-6 space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h3 className="brand-serif italic text-lg text-white font-normal">Upcoming Appointments Desk</h3>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="text-[9px] text-zinc-500 hover:text-white flex items-center gap-1 font-mono uppercase tracking-widest hover:underline cursor-pointer"
                >
                  <span>Go to full desk</span>
                </button>
              </div>

              <div className="space-y-3">
                {appointments.slice(0, 4).map(apt => {
                  const correlatedSvc = services.find(s => s.id === apt.serviceId);
                  const correlatedStaff = staff.find(st => st.id === apt.staffId);
                  return (
                    <div key={apt.id} className="p-4 rounded-none bg-[#111111] border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white font-sans">{apt.customerName}</span>
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-none border ${
                            apt.status === 'CONFIRMED' ? 'bg-emerald-950/45 text-emerald-400 border-emerald-850/35' : 
                            apt.status === 'COMPLETED' ? 'bg-blue-950/45 text-blue-400 border-blue-800/25' : 'bg-amber-950/45 text-amber-500 border-amber-800/25'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        
                        <div className="text-[11px] font-mono text-zinc-400">
                          {correlatedSvc?.name} with <span className="text-gold-400 font-bold">{correlatedStaff?.name}</span>
                        </div>
                        <p className="text-[10px] text-zinc-500 truncate max-w-sm font-sans">{apt.notes || 'No customer comments'}</p>
                      </div>

                      <div className="flex items-center gap-1.5 md:self-center font-mono text-[10px]">
                        <Clock className="h-3.5 w-3.5 text-zinc-550" />
                        <div>
                          <p className="text-white font-bold leading-tight">{apt.date}</p>
                          <p className="text-zinc-550 leading-none">{apt.time}</p>
                        </div>
                        <div className="border-l border-white/10 pl-3 ml-2">
                          <p className="text-white font-bold font-serif text-sm">${apt.totalAmount}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Panel 2: Live Brand Customization */}
      {activeTab === 'styling' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Customizer properties form */}
          <div className="lg:col-span-7 bg-[#0d0d0d] border border-white/10 rounded-none p-8 space-y-6">
            <div>
              <h3 className="brand-serif italic text-xl text-white font-normal">White-Label Digital Identity</h3>
              <p className="text-zinc-500 text-xs font-mono">Modulating parameters propagates styles instantly matching routing prefixes.</p>
            </div>

            {saveSuccess && (
              <div className="p-4 bg-emerald-950/45 text-emerald-400 rounded-none border border-emerald-800/35 text-xs font-mono flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span className="uppercase tracking-wider text-[10px] font-bold">Theme assets saved successfully! PostgreSQL configuration state modified dynamically.</span>
              </div>
            )}

            <form onSubmit={handleSaveBrandSettings} className="space-y-6 font-mono select-none">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Brand Name</label>
                  <input
                    type="text"
                    required
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs rounded-none text-white focus:outline-none focus:border-gold-500 text-sans font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-1">Theme Color Hue</label>
                  <div className="flex items-center bg-black border border-white/10 rounded-none px-2 text-xs text-white">
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="bg-transparent border-0 outline-none w-8 h-8 rounded-none cursor-pointer mr-2"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="bg-transparent text-white focus:outline-none w-full uppercase font-bold tracking-widest text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Tagline</label>
                <input
                  type="text"
                  required
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs rounded-none text-white focus:outline-none focus:border-gold-500 text-sans"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as any)}
                    className="w-full bg-black border border-white/10 p-2.5 text-xs rounded-none text-white focus:outline-none focus:border-gold-500 font-mono"
                  >
                    <option value="serif">Cormorant (Serif)</option>
                    <option value="sans">Jakarta (Sans)</option>
                    <option value="mono">JetBrains (Mono)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs rounded-none text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Support Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs rounded-none text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-2">Physical Location</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs rounded-none text-white focus:outline-none focus:border-gold-500 text-sans"
                  />
                </div>
              </div>

              {/* Predefined aesthetic schemas */}
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Preset Curated Hex Palettes</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(preset.primary);
                      }}
                      className="px-3 py-2 rounded-none bg-black border border-white/15 hover:border-gold-500 flex items-center gap-2 text-[10px] cursor-pointer transition-all"
                    >
                      <span className="h-3 w-3 rounded-none" style={{ backgroundColor: preset.primary }} />
                      <span className="text-zinc-300 font-mono font-medium uppercase tracking-widest text-[9px]">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-white text-black font-bold uppercase text-xs rounded-none tracking-widest hover:bg-zinc-200 cursor-pointer active:scale-[0.99] transition-all flex items-center gap-1.5 ml-auto font-mono"
              >
                <span>Save Client Config</span>
              </button>
            </form>
          </div>

          {/* Simulated File upload panel (Col span 5) */}
          <div className="lg:col-span-5 bg-[#0d0d0d] border border-white/10 rounded-none p-8 space-y-6 text-left">
            <div>
              <h3 className="brand-serif italic text-xl text-white font-normal">S3 Cloud Storage Bucket</h3>
              <p className="text-zinc-500 text-xs font-mono">Simulated multi-tenant AWS S3/Cloud Storage object buckets explorer.</p>
            </div>

            {/* Simulated file dropping field */}
            <div className="border border-dashed border-white/15 hover:border-gold-500 bg-black/40 rounded-none p-8 text-center space-y-4 transition-all">
              <UploadCloud className="h-10 w-10 text-zinc-500 mx-auto" />
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Upload Salon Identity Assets</p>
                <p className="text-[10px] text-zinc-500 font-mono mt-1">Drag & Drop brand JPG, PNG. Isolated AWS namespace.</p>
              </div>

              {isUploading ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-gold-400">Uploading {uploadType.toUpperCase()} chunks...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-zinc-950 h-1.5 rounded-none overflow-hidden border border-white/5">
                    <div className="bg-gold-500 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => handleSimulateUpload('logo')}
                    className="px-4 py-2 bg-black border border-white/10 hover:border-gold-500 hover:text-gold-400 rounded-none text-[10px] font-mono cursor-pointer uppercase tracking-wider"
                  >
                    ⚡ Brand Logo
                  </button>
                  <button
                    onClick={() => handleSimulateUpload('banner')}
                    className="px-4 py-2 bg-black border border-white/10 hover:border-gold-500 hover:text-gold-400 rounded-none text-[10px] font-mono cursor-pointer uppercase tracking-wider"
                  >
                    ⚡ Page Banner
                  </button>
                </div>
              )}
            </div>

            {/* Asset lists */}
            <div className="space-y-3 font-mono text-[11px] border-t border-white/10 pt-4">
              <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-widest">Storage Registry Logs:</span>
              
              <div className="p-4 rounded-none bg-black border border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-zinc-500 block uppercase font-bold text-[9px] tracking-wider">AWS S3 LOGO BUCKET</span>
                  <span className="text-zinc-300 truncate block max-w-[200px]" title={tenant.logoUrl}>{tenant.logoUrl || 'Empty'}</span>
                </div>
                <span className="text-emerald-400 text-[10px] font-bold">ACTIVE</span>
              </div>

              <div className="p-4 rounded-none bg-black border border-white/10 flex justify-between items-center">
                <div>
                  <span className="text-zinc-500 block uppercase font-bold text-[9px] tracking-wider">AWS S3 BANNER BUCKET</span>
                  <span className="text-zinc-300 truncate block max-w-[200px]" title={tenant.bannerUrl}>{tenant.bannerUrl || 'Empty'}</span>
                </div>
                <span className="text-emerald-400 text-[10px] font-bold">ACTIVE</span>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Tab Panel 3: Luxury Service Listing CRUD interface */}
      {activeTab === 'services' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Create new service form (Col span 4) */}
          <div className="lg:col-span-4 bg-[#0d0d0d] border border-white/10 rounded-none p-6 space-y-4 text-left">
            <h3 className="brand-serif italic text-lg text-white font-normal">Introduce Treatment Tier</h3>
            <p className="text-zinc-500 text-xs font-mono">Creates a service tier entry in the PostgreSQL db referencing catalog.</p>

            <form onSubmit={handleCreateService} className="space-y-4 font-mono select-none text-[11px]">
              <div>
                <label className="text-[10px] text-zinc-550 font-bold block uppercase tracking-widest mb-1.5">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Royal Caviar Ritual"
                  value={newSvcName}
                  onChange={(e) => setNewSvcName(e.target.value)}
                  className="w-full bg-black border border-white/10 px-3 py-2.5 text-xs rounded-none text-white focus:outline-none focus:border-gold-500 text-sans font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-zinc-550 font-bold block uppercase tracking-widest mb-1.5">Category</label>
                  <select
                    value={newSvcCategory}
                    onChange={(e) => setNewSvcCategory(e.target.value)}
                    className="w-full bg-black border border-white/10 p-2.5 text-xs rounded-none text-white focus:outline-none focus:border-gold-500"
                  >
                    <option value="Haircuts">Haircuts</option>
                    <option value="Color">Color</option>
                    <option value="Spa">Spa</option>
                    <option value="Wellness">Wellness</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-550 font-bold block uppercase tracking-widest mb-1.5">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="95.00"
                    value={newSvcPrice}
                    onChange={(e) => setNewSvcPrice(e.target.value)}
                    className="w-full bg-black border border-white/10 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-550 font-bold block uppercase tracking-widest mb-1.5">Duration (Minutes)</label>
                <select
                  value={newSvcDuration}
                  onChange={(e) => setNewSvcDuration(e.target.value)}
                  className="w-full bg-black border border-white/10 p-2.5 text-xs rounded-none text-white focus:outline-none focus:border-gold-500"
                >
                  <option value="20">20 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="90">90 Minutes</option>
                  <option value="120">120 Minutes</option>
                  <option value="150">150 Minutes</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-550 font-bold block uppercase tracking-widest mb-1.5">Aesthetic Description</label>
                <textarea
                  placeholder="e.g. Cleansing, hair massage, detailing style etc..."
                  value={newSvcDesc}
                  onChange={(e) => setNewSvcDesc(e.target.value)}
                  className="w-full h-20 bg-black border border-white/10 px-3 py-2 text-xs rounded-none text-white focus:outline-none focus:border-gold-500 text-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-white text-black font-bold py-2.5 text-xs rounded-none font-mono uppercase tracking-widest hover:bg-zinc-200 cursor-pointer active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="h-4 w-4 text-black" />
                <span>Save Service Tier</span>
              </button>
            </form>
          </div>

          {/* Services list (Col span 8) */}
          <div className="lg:col-span-8 bg-[#0d0d0d] border border-white/10 rounded-none p-6 text-left space-y-4">
            <h3 className="brand-serif italic text-lg text-white font-normal border-b border-white/10 pb-3">Active Service Index</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(svc => (
                <div key={svc.id} className="p-5 rounded-none bg-black border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-1 text-left">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-gold-500 text-[8px] font-mono block uppercase font-bold tracking-widest">{svc.category}</span>
                      <button
                        onClick={() => handleDeleteService(svc.id)}
                        className="text-zinc-600 hover:text-red-400 p-1.5 rounded-none hover:bg-neutral-900 transition-all cursor-pointer"
                        title="Delete this service tier"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-bold text-white block truncate">{svc.name}</span>
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{svc.description}</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/5 pt-3.5 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-zinc-500 font-bold uppercase tracking-wider text-[9px]">
                      <Clock className="h-3.5 w-3.5 text-zinc-600" />
                      <span>{svc.duration} mins</span>
                    </span>
                    <span className="text-sm font-serif font-bold text-white">${svc.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Tab Panel 4: Bookings Reservation index */}
      {activeTab === 'appointments' && (
        <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 text-left space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="brand-serif italic text-lg text-white font-normal">Salon Booking Desk</h3>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block mt-1">{appointments.length} appointments indexed</span>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-black hover:bg-zinc-200 font-mono font-bold tracking-widest rounded-none text-[9px] uppercase cursor-pointer transition-all active:scale-[0.98]"
              title="Export all customers from bookings to CSV"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Customers CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-white/10 text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="pb-3 pl-2">Customer Profile</th>
                  <th className="pb-3">Treatment Tier</th>
                  <th className="pb-3">Booked Schedule</th>
                  <th className="pb-3 text-center">Assigned Stylist</th>
                  <th className="pb-3 text-right">Price</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 pr-2 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments.map(apt => {
                  const correlatedSvc = services.find(s => s.id === apt.serviceId);
                  const correlatedStaff = staff.find(st => st.id === apt.staffId);
                  return (
                    <tr key={apt.id} className="hover:bg-white/5 transition-all">
                      <td className="py-4 pl-pl-2">
                        <p className="font-sans font-bold text-white">{apt.customerName}</p>
                        <p className="text-[10px] text-zinc-500 font-serif lowercase italic">{apt.customerEmail}</p>
                      </td>
                      <td>
                        <span className="text-zinc-300 font-sans font-medium">{correlatedSvc?.name || 'Standard Treatment'}</span>
                        <span className="block text-[8px] text-zinc-500 uppercase tracking-widest font-mono font-bold mt-0.5">{correlatedSvc?.category}</span>
                      </td>
                      <td>
                        <span className="text-white font-bold block">{apt.date}</span>
                        <span className="text-zinc-500 text-[10px] font-bold block">{apt.time}</span>
                      </td>
                      <td className="text-center">
                        <span className="text-gold-400 font-bold">{correlatedStaff?.name}</span>
                      </td>
                      <td className="text-right font-serif font-bold text-sm text-white">
                        ${apt.totalAmount}
                      </td>
                      <td className="text-center">
                        <span className={`px-2 py-0.5 rounded-none text-[8px] font-bold inline-block border font-mono uppercase tracking-widest ${
                          apt.status === 'CONFIRMED' ? 'bg-emerald-950/45 text-emerald-400 border-emerald-850/35' : 
                          apt.status === 'COMPLETED' ? 'bg-blue-950/45 text-blue-400 border-blue-800/25' : 'bg-amber-950/45 text-amber-500 border-amber-800/25'
                        }`}>
                          {apt.status}
                        </span>
                      </td>
                      <td className="text-right pr-2">
                        <div className="flex justify-end gap-1.5">
                          {apt.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleUpdateAptStatus(apt.id, 'COMPLETED')}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold tracking-widest rounded-none text-[9px] uppercase cursor-pointer"
                            >
                              Complete
                            </button>
                          )}
                          {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleUpdateAptStatus(apt.id, 'CANCELLED')}
                              className="px-3 py-1.5 bg-black border border-white/10 hover:border-red-500 hover:text-red-400 text-zinc-500 rounded-none text-[9px] font-mono uppercase tracking-widest cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                          {apt.status === 'COMPLETED' && (
                            <span className="text-[10px] text-zinc-550 italic font-serif block">Archived Receipt</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Panel 5: Staff Specialists Desk */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left animate-fadeIn">
          {/* Left Column: Staff specialists list (2/3 width) */}
          <div className="lg:col-span-2 bg-[#0d0d0d] border border-white/10 rounded-none p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div>
                <h3 className="brand-serif italic text-lg text-white font-normal">Staff Specialist Registry</h3>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-1">
                  Manage stylist credentials, expertise tiers, and portfolio bios.
                </p>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-none uppercase tracking-widest font-bold">
                {staff.length} Active Artists
              </span>
            </div>

            {staff.length === 0 ? (
              <div className="py-12 text-center text-zinc-505 font-mono text-xs">
                No active staff members found. Add your first specialist in the right panel.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs font-mono text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                      <th className="pb-3 pl-2">Specialist Profile</th>
                      <th className="pb-3">Expertise Role</th>
                      <th className="pb-3 text-center">Satisfaction</th>
                      <th className="pb-3 text-center">Core Specialties</th>
                      <th className="pb-3 pr-2 text-right">Administrative Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {staff.map(member => (
                      <tr key={member.id} className="hover:bg-white/5 transition-all">
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-3">
                            <img
                              referrerPolicy="no-referrer"
                              src={member.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"}
                              alt={member.name}
                              className="w-10 h-10 object-cover border border-white/10 grayscale hover:grayscale-0 transition-all rounded-none"
                            />
                            <div>
                              <p className="font-sans font-bold text-white leading-tight">{member.name}</p>
                              <p className="text-[10px] text-zinc-405 font-serif leading-normal italic mt-1 max-w-xs truncate" title={member.bio}>
                                {member.bio}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="text-zinc-300 font-sans font-medium">{member.role}</span>
                        </td>
                        <td className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Star className="h-3.5 w-3.5 text-gold-500 fill-gold-500" />
                            <span className="text-white font-bold">{member.rating.toFixed(1)}</span>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="flex flex-wrap gap-1 justify-center max-w-[200px] mx-auto">
                            {member.specialties && member.specialties.length > 0 ? (
                              member.specialties.map((spec, sidx) => (
                                <span
                                  key={sidx}
                                  className="px-1.5 py-0.5 text-[8px] bg-white/5 text-zinc-400 border border-white/10 tracking-wide font-mono uppercase"
                                >
                                  {spec}
                                </span>
                              ))
                            ) : (
                              <span className="text-zinc-650 text-[9px] italic">General Stylist</span>
                            )}
                          </div>
                        </td>
                        <td className="text-right pr-2">
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => handleEditStaffClick(member)}
                              className="px-2.5 py-1.5 bg-white text-black hover:bg-zinc-200 font-mono font-bold tracking-widest rounded-none text-[8px] uppercase cursor-pointer transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(member.id)}
                              className="px-2.5 py-1.5 bg-black border border-white/10 hover:border-red-500 hover:text-red-400 text-zinc-550 rounded-none text-[8px] font-mono uppercase tracking-widest cursor-pointer transition-all"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column: Add/Edit Staff Form (1/3 width) */}
          <div id="staff-form-container" className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h3 className="brand-serif italic text-lg text-white font-normal">
                {editingStaffId ? 'Update Specialist Card' : 'Add Creative Specialist'}
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-1">
                {editingStaffId ? 'Updating active staff credentials.' : 'Introduce new professional talent to atelier.'}
              </p>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4 font-mono text-xs">
              <div className="space-y-1.5">
                <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold block">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Vanessa Laurent"
                  className="w-full bg-[#141414] border border-white/10 p-3 text-white focus:outline-none focus:border-white transition-all text-xs rounded-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold block">
                  Aesthetic / Practice Role <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  placeholder="e.g. Principle Esthetician"
                  className="w-full bg-[#141414] border border-white/10 p-3 text-white focus:outline-none focus:border-white transition-all text-xs rounded-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold block">
                  Core Specialties (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={staffSpecialties}
                  onChange={(e) => setStaffSpecialties(e.target.value)}
                  placeholder="e.g. French Balayage, Scalp Detox, Precise Cuts"
                  className="w-full bg-[#141414] border border-white/10 p-3 text-white focus:outline-none focus:border-white transition-all text-xs rounded-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold block">
                    Satisfaction Level (Rating)
                  </label>
                  <select
                    value={staffRating}
                    onChange={(e) => setStaffRating(e.target.value)}
                    className="w-full bg-[#141414] border border-[#2d2d2d] focus:border-white p-3 text-white focus:outline-none transition-all text-xs rounded-none cursor-pointer"
                  >
                    <option value="5.0">5.0 Star - Perfect</option>
                    <option value="4.9">4.9 Star - Exceptional</option>
                    <option value="4.8">4.8 Star - Master</option>
                    <option value="4.7">4.7 Star - Distinguished</option>
                    <option value="4.5">4.5 Star - Certified</option>
                    <option value="4.0">4.0 Star - Professional</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold block">
                    Custom Photo URL
                  </label>
                  <input
                    type="url"
                    value={staffAvatarUrl}
                    onChange={(e) => setStaffAvatarUrl(e.target.value)}
                    placeholder="Optional headshot link"
                    className="w-full bg-[#141414] border border-[#2d2d2d] focus:border-white p-3 text-white focus:outline-none transition-all text-xs rounded-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-400 text-[10px] uppercase tracking-wider font-bold block">
                  Biography / Portfolio Statement
                </label>
                <textarea
                  value={staffBio}
                  onChange={(e) => setStaffBio(e.target.value)}
                  placeholder="Brief story highlighting experience, cosmetic certifications, and salon passion."
                  rows={4}
                  className="w-full bg-[#141414] border border-white/10 p-3 text-white focus:outline-none focus:border-white transition-all text-xs rounded-none resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 font-bold uppercase text-[10px] py-3.5 tracking-widest font-mono text-black hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer rounded-none text-center"
                  style={{ backgroundColor: tenant.primaryColor }}
                >
                  {editingStaffId ? 'Save Changes' : 'Register Specialist'}
                </button>
                {(editingStaffId || staffName || staffRole || staffBio || staffSpecialties) && (
                  <button
                    type="button"
                    onClick={handleResetStaffForm}
                    className="px-4 border border-white/10 hover:bg-white/5 font-mono text-[9px] uppercase tracking-widest rounded-none text-zinc-400 hover:text-white transition-all cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Full-width Specialist Staff Scheduling & Calendar Section */}
          <div className="lg:col-span-3 bg-[#0d0d0d] border border-white/10 rounded-none p-6 space-y-6 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-5">
              <div>
                <h3 className="brand-serif italic text-lg text-white font-normal flex items-center gap-2">
                  <CalendarRange className="h-5 w-5 text-gold-500" />
                  <span>Aesthetic Duty Shifts & Availability Planner</span>
                </h3>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-1">
                  Manage weekly hours, toggle duty status, and blacklist specific calendar dates from booking.
                </p>
              </div>

              {staff.length > 0 && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <span className="text-[10px] text-zinc-400 font-mono uppercase font-bold">Specialist Profile:</span>
                  <select
                    value={selectedStaffIdForSchedule || ''}
                    onChange={(e) => setSelectedStaffIdForSchedule(e.target.value)}
                    className="bg-[#141414] border border-white/10 p-2.5 text-white font-mono text-xs rounded-none cursor-pointer focus:outline-none focus:border-white transition-all text-xs"
                  >
                    {staff.map(st => (
                      <option key={st.id} value={st.id}>{st.name} ({st.role})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {selectedStaffIdForSchedule ? (() => {
              const selectedMember = staff.find(st => st.id === selectedStaffIdForSchedule);
              if (!selectedMember) return null;

              return (
                <div className="space-y-6 animate-fadeIn">
                  {/* Select View Toggles & Selected Specialist brief info */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-none">
                    <div className="flex items-center gap-3">
                      <img
                        referrerPolicy="no-referrer"
                        src={selectedMember.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"}
                        alt={selectedMember.name}
                        className="w-10 h-10 object-cover border border-white/10 grayscale hover:grayscale-0 transition-all rounded-none"
                      />
                      <div>
                        <h4 className="font-sans font-bold text-white text-sm">{selectedMember.name}</h4>
                        <p className="text-[10px] text-gold-400 font-mono uppercase tracking-wider">{selectedMember.role}</p>
                      </div>
                    </div>

                    <div className="flex bg-[#000] border border-white/10 p-1">
                      <button
                        type="button"
                        onClick={() => setScheduleViewType('weekly')}
                        className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider cursor-pointer font-bold transition-all ${
                          scheduleViewType === 'weekly' 
                            ? 'bg-white text-black' 
                            : 'text-zinc-500 hover:text-white'
                        }`}
                      >
                        Weekly Duty Hours
                      </button>
                      <button
                        type="button"
                        onClick={() => setScheduleViewType('calendar')}
                        className={`px-4 py-2 text-[10px] font-mono uppercase tracking-wider cursor-pointer font-bold transition-all ${
                          scheduleViewType === 'calendar' 
                            ? 'bg-white text-black' 
                            : 'text-zinc-500 hover:text-white'
                        }`}
                      >
                        Interactive Calendar
                      </button>
                    </div>
                  </div>

                  {/* Schedule View Mode 1: Weekly Duty Hours Configuration list */}
                  {scheduleViewType === 'weekly' && (
                    <form onSubmit={handleSaveSchedule} className="space-y-6">
                      <div className="border border-white/10 overflow-hidden divide-y divide-white/10">
                        {Object.entries(scheduleWeeklyHours || {}).map(([day, val]) => {
                          const config = val as { start: string; end: string; active: boolean };
                          return (
                            <div key={day} className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 bg-[#111] hover:bg-white/[0.01] transition-all gap-4 text-left">
                              {/* Day and Status details */}
                              <div className="flex items-center gap-4">
                                <button
                                  type="button"
                                  onClick={() => toggleDayActive(day)}
                                  className={`w-10 h-6 flex p-0.5 rounded-full transition-all cursor-pointer ${
                                    config.active ? 'bg-emerald-500 justify-end' : 'bg-zinc-850 justify-start'
                                  }`}
                                  style={{ backgroundColor: config.active ? '#10B981' : undefined }}
                                >
                                  <span className="bg-white w-5 h-5 rounded-full shadow-md" />
                                </button>
                                <div>
                                  <span className={`font-sans font-bold text-sm block ${config.active ? 'text-white' : 'text-zinc-500'}`}>{day}</span>
                                  <span className="text-[9px] font-mono uppercase tracking-wider block mt-0.5">
                                    {config.active ? (
                                      <span className="text-emerald-400 font-bold">On Duty / Slots Open</span>
                                    ) : (
                                      <span className="text-zinc-500">Weekend / Off Cycle</span>
                                    )}
                                  </span>
                                </div>
                              </div>

                              {/* Booking Hour Boundaries */}
                              {config.active ? (
                                <div className="flex items-center gap-3 font-mono text-xs">
                                  <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-bold">Shift Frame:</span>
                                  <select
                                    value={config.start}
                                    onChange={(e) => handleHourChange(day, 'start', e.target.value)}
                                    className="bg-black border border-white/10 p-2 text-white font-mono text-xs rounded-none cursor-pointer"
                                  >
                                    {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00'].map(t => (
                                      <option key={t} value={t}>{t} AM</option>
                                    ))}
                                  </select>
                                  <span className="text-zinc-500 font-sans">to</span>
                                  <select
                                    value={config.end}
                                    onChange={(e) => handleHourChange(day, 'end', e.target.value)}
                                    className="bg-black border border-white/10 p-2 text-white font-mono text-xs rounded-none cursor-pointer"
                                  >
                                    {['15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00'].map(t => {
                                      const hr = parseInt(t.split(':')[0], 10);
                                      const pmHr = hr > 12 ? hr - 12 : hr;
                                      return <option key={t} value={t}>{pmHr}:00 PM</option>;
                                    })}
                                  </select>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 text-zinc-550 font-mono text-xs italic">
                                  <Lock className="h-3.5 w-3.5" />
                                  <span>No bookings can be accommodated</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
                          Make sure to click apply to update the core system calendar values.
                        </p>
                        <button
                          type="submit"
                          className="flex items-center justify-center gap-2 font-bold uppercase text-[10px] py-4 px-8 tracking-widest font-mono text-black hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer rounded-none"
                          style={{ backgroundColor: tenant.primaryColor }}
                        >
                          <Save className="h-4 w-4" />
                          <span>Apply Shift Settings</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Schedule View Mode 2: Calendar exceptions interactive dashboard */}
                  {scheduleViewType === 'calendar' && (
                    <form onSubmit={handleSaveSchedule} className="space-y-6">
                      <div className="bg-black border border-white/10 p-5 rounded-none space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                          <div>
                            <h4 className="font-sans font-bold text-white text-sm">Monthly Absence & Specialty Holiday Calendar</h4>
                            <p className="text-[10px] text-zinc-500 font-mono uppercase mt-1">
                              Showing June 2026. Click any cell on the calendar grid to toggle and blacklist scheduling availability.
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-[9px] font-mono uppercase">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-emerald-500 border border-emerald-400 inline-block" />
                              <span className="text-zinc-400">Duty Active</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-red-900 border border-red-500 inline-block" />
                              <span className="text-zinc-400">Custom Offset / Leave</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-[#1a1a1a] border border-white/5 inline-block" />
                              <span className="text-zinc-500">Weekly Off Cycle</span>
                            </div>
                          </div>
                        </div>

                        {/* Calendar Day Header */}
                        <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[9px] text-[#888] uppercase tracking-widest font-bold pb-1">
                          <div>Mon</div>
                          <div>Tue</div>
                          <div>Wed</div>
                          <div>Thu</div>
                          <div>Fri</div>
                          <div>Sat</div>
                          <div>Sun</div>
                        </div>

                        {/* June 2026 Calendar Grid (Starts Mon June 1, 30 days) */}
                        <div className="grid grid-cols-7 gap-1.5">
                          {Array.from({ length: 30 }, (_, index) => {
                            const dayNum = index + 1;
                            const dateString = `2026-06-${String(dayNum).padStart(2, '0')}`;
                            
                            // Determine weekday
                            const weekdayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                            const dayOfWeek = weekdayNames[index % 7];
                            
                            // Check if blocked
                            const isCustomBlocked = scheduleExceptions.includes(dateString);
                            const isWeeklyActive = scheduleWeeklyHours[dayOfWeek]?.active ?? true;
                            
                            let CardStyles = "border cursor-pointer transition-all p-3 min-h-[75px] flex flex-col justify-between text-left ";
                            let statusLabel = "";
                            
                            if (isCustomBlocked) {
                              CardStyles += "bg-red-950/40 border-red-800/40 text-red-100 hover:bg-red-950/60";
                              statusLabel = "Leave Break";
                            } else if (!isWeeklyActive) {
                              CardStyles += "bg-[#111] border-white/5 text-zinc-500 hover:bg-zinc-900/40";
                              statusLabel = "Off-Day";
                            } else {
                              CardStyles += "bg-emerald-950/20 border-emerald-900/30 text-emerald-100 hover:bg-emerald-950/35";
                              statusLabel = "Available";
                            }

                            return (
                              <button
                                key={dayNum}
                                type="button"
                                onClick={() => toggleExceptionDate(dateString)}
                                className={CardStyles}
                                title={`${dateString} (${dayOfWeek}) - Click to toggle custom availability`}
                              >
                                <div className="flex justify-between items-center w-full">
                                  <span className="font-mono font-bold text-xs">{dayNum}</span>
                                  {isCustomBlocked && <Lock className="h-2.5 w-2.5 text-red-400" />}
                                  {!isCustomBlocked && isWeeklyActive && <Unlock className="h-2.5 w-2.5 text-emerald-400" />}
                                </div>
                                <div className="mt-2">
                                  <span className="text-[7px] font-mono uppercase tracking-wider block opacity-75">{statusLabel}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                        <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
                          Updating the dates directly places exceptions inside the checkout portal system registry.
                        </p>
                        <button
                          type="submit"
                          className="flex items-center justify-center gap-2 font-bold uppercase text-[10px] py-4 px-8 tracking-widest font-mono text-black hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer rounded-none animate-fadeIn"
                          style={{ backgroundColor: tenant.primaryColor }}
                        >
                          <Save className="h-4 w-4" />
                          <span>Apply Calendar Exceptions</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Success notification banner */}
                  {scheduleSuccessMessage && (
                    <div className="p-4 bg-emerald-950/65 border border-emerald-800/40 text-emerald-300 font-mono text-xs flex items-center gap-3 animate-fadeIn">
                      <Check className="h-4 w-4 text-emerald-400 animate-bounce" />
                      <span>{scheduleSuccessMessage}</span>
                    </div>
                  )}
                </div>
              );
            })() : (
              <div className="py-12 text-center text-zinc-500 font-mono text-xs">
                Registry list is empty. Create a professional specialist to begin hours mapping.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Panel 6: Customer Directory index & CSV Export */}
      {activeTab === 'customers' && (
        <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 text-left space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-5">
            <div>
              <h3 className="brand-serif italic text-lg text-white font-normal">Customer Relations & Directory</h3>
              <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mt-1">
                Unified index of guest clients, cumulative appointment frequencies, and customer value indexes.
              </p>
            </div>
            
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-black hover:bg-zinc-200 font-mono font-bold tracking-widest rounded-none text-xs uppercase cursor-pointer transition-all active:scale-[0.98]"
            >
              <Download className="h-4 w-4" />
              <span>Export Clients CSV</span>
            </button>
          </div>

          {/* Customer Specific Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/40 border border-white/5 p-4 rounded-none">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Total Registered Clients</span>
              <span className="text-2xl brand-serif italic text-white font-normal mt-1 block">
                {getUniqueCustomers().length} Guests
              </span>
            </div>
            
            <div className="bg-black/40 border border-white/5 p-4 rounded-none">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Core Booking Volume</span>
              <span className="text-2xl brand-serif italic text-white font-normal mt-1 block">
                {appointments.length} Total Visits
              </span>
            </div>

            <div className="bg-black/40 border border-white/5 p-4 rounded-none">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Average LTV (Life Time Value)</span>
              <span className="text-2xl brand-serif italic text-white font-normal mt-1 block">
                ${getUniqueCustomers().length > 0
                  ? (getUniqueCustomers().reduce((sum, c) => sum + c.totalSpend, 0) / getUniqueCustomers().length).toFixed(2)
                  : "0.00"
                }
              </span>
            </div>
          </div>

          {/* Search bar filtering */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search by client name, email address, or phone number..."
              className="flex-1 bg-black border border-white/10 p-3 text-white text-xs font-mono focus:outline-none focus:border-white transition-all rounded-none"
            />
            {customerSearch && (
              <button
                onClick={() => setCustomerSearch('')}
                className="px-3 py-3 border border-white/10 text-zinc-400 hover:text-white font-mono text-xs uppercase rounded-none transition-all cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Customer Table */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs font-mono text-left">
              <thead>
                <tr className="border-b border-white/10 text-zinc-500 uppercase tracking-widest text-[9px] font-bold">
                  <th className="pb-3 pl-2">Client Identity</th>
                  <th className="pb-3">Contact Email</th>
                  <th className="pb-3 text-center">Contact Phone</th>
                  <th className="pb-3 text-center">Visit Count</th>
                  <th className="pb-3 text-right text-gold-400">Total Spend (LTV)</th>
                  <th className="pb-3 pr-2 text-right">Last Visit Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {getUniqueCustomers()
                  .filter(c => {
                    if (!customerSearch) return true;
                    const query = customerSearch.toLowerCase();
                    return (
                      c.name.toLowerCase().includes(query) ||
                      c.email.toLowerCase().includes(query) ||
                      c.phone.toLowerCase().includes(query)
                    );
                  })
                  .map((c, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-all">
                      <td className="py-4 pl-2">
                        <span className="font-sans font-bold text-white block">{c.name}</span>
                        <span className="text-[8px] text-zinc-500 uppercase tracking-wider font-mono mt-0.5 block">Identified Guest</span>
                      </td>
                      <td>
                        <span className="text-zinc-300 font-mono lowercase">{c.email}</span>
                      </td>
                      <td className="text-center text-zinc-300 font-mono">
                        {c.phone}
                      </td>
                      <td className="text-center font-bold text-white">
                        {c.totalBookings}
                      </td>
                      <td className="text-right font-serif font-bold text-sm text-gold-400">
                        ${c.totalSpend.toFixed(2)}
                      </td>
                      <td className="text-right pr-2 text-zinc-400">
                        {c.lastBookingDate}
                      </td>
                    </tr>
                  ))}
                {getUniqueCustomers().filter(c => {
                  if (!customerSearch) return true;
                  const query = customerSearch.toLowerCase();
                  return (
                    c.name.toLowerCase().includes(query) ||
                    c.email.toLowerCase().includes(query) ||
                    c.phone.toLowerCase().includes(query)
                  );
                }).length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-650 font-mono text-xs">
                      No customer records matches the active filter query patterns.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
