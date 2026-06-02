import React, { useState, useEffect } from 'react';
import { 
  Check, Calendar, Clock, Sparkles, MapPin, 
  Phone, Mail, Star, ArrowRight, ArrowLeft, CheckCircle2 
} from 'lucide-react';
import { Tenant, Service, Staff } from '../types';
import { dbSim } from '../data/mockDatabase';

interface CustomerBookingPortalProps {
  tenant: Tenant;
}

export default function CustomerBookingPortal({ tenant }: CustomerBookingPortalProps) {
  // Wizard Steps: 1: Service, 2: Staff, 3: Schedule, 4: Complete
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Mapped Active Datasets
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // Selection configurations
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Form Details
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custNotes, setCustNotes] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [bookedAptId, setBookedAptId] = useState<string | null>(null);

  // Load datasets mapped specifically to this Salon Tenant
  const loadTenantPublicData = async () => {
    const svcs = await dbSim.getServicesByTenant(tenant.id);
    const stf = await dbSim.getStaffByTenant(tenant.id);
    setServices(svcs);
    setStaffList(stf);
  };

  useEffect(() => {
    loadTenantPublicData();
    // Reset wizard flow when swapping active tenant context
    setStep(1);
    setSelectedService(null);
    setSelectedStaff(null);
    setSelectedDate('');
    setSelectedTime('');
    setBookedAptId(null);
    setCustNotes('');
  }, [tenant]);

  // Handle book finalization
  const handleFinalizeBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime || !custName) return;

    setIsFinishing(true);

    setTimeout(async () => {
      try {
        const apt = await dbSim.createAppointment({
          tenantId: tenant.id,
          serviceId: selectedService.id,
          customerName: custName,
          customerEmail: custEmail || 'anonymous@guest.com',
          customerPhone: custPhone || '+1 (555) 0100',
          staffId: selectedStaff.id,
          date: selectedDate,
          time: selectedTime,
          totalAmount: selectedService.price,
          notes: custNotes
        });

        setIsFinishing(false);
        setBookedAptId(apt.id);
        setStep(4);
      } catch (err) {
        console.error(err);
        setIsFinishing(false);
      }
    }, 900);
  };

  // Generate dynamic upcoming dates for selector
  const getUpcomingDates = () => {
    const dates = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      
      const dayName = days[d.getDay()];
      const dateNum = d.getDate();
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      
      // ISO Date String format YYYY-MM-DD
      const isoFormat = `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;

      dates.push({
        iso: isoFormat,
        display: `${dayName}, ${monthName} ${dateNum}`
      });
    }
    return dates;
  };

  // Predefined luxury time scheduling intervals
  const AVAILABLE_HOURS = ['09:30', '10:15', '11:00', '11:45', '13:00', '13:45', '14:30', '15:15', '16:00', '16:45'];

  return (
    <div 
      className="min-h-[calc(100vh-45px)] w-full py-12 px-4 transition-all duration-300 select-none"
      style={{ 
        fontFamily: tenant.fontFamily === 'serif' ? 'var(--font-serif)' : tenant.fontFamily === 'mono' ? 'var(--font-mono)' : 'var(--font-sans)',
        backgroundColor: '#050505'
      }}
    >
      <div className="max-w-4xl mx-auto space-y-8 relative">
        
        {/* White-label dynamic decorative ambient beam */}
        <div 
          className="absolute top-10 left-1/2 -translate-x-1/2 w-80 h-80 opacity-5 pointer-events-none filter blur-3xl"
          style={{ backgroundColor: tenant.primaryColor }}
        />

        {/* Dynamic White-Label Brand Header block */}
        <div className="text-center space-y-4 relative z-10 animate-fade-in">
          {tenant.logoUrl && (
            <img 
              src={tenant.logoUrl} 
              alt="Brand logo representation"
              referrerPolicy="no-referrer"
              className="h-20 w-20 rounded-none mx-auto object-cover border shadow-md mb-2"
              style={{ borderColor: tenant.primaryColor }}
            />
          )}

          <div>
            <h1 className="text-4xl md:text-5xl font-normal text-white tracking-tight leading-none brand-serif italic">
              {tenant.name}
            </h1>
            <p className="text-zinc-400 text-sm italic brand-serif opacity-80 mt-2">
              "{tenant.tagline}"
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 pt-2 text-zinc-500 text-xs font-mono uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" style={{ color: tenant.primaryColor }} />
              <span>{tenant.address}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" style={{ color: tenant.primaryColor }} />
              <span>{tenant.phone}</span>
            </span>
          </div>
        </div>

        {/* Wizard Progress Stepper Hub */}
        {step < 4 && (
          <div className="flex items-center justify-between font-mono text-[9px] bg-[#0d0d0d] p-4 rounded-none border border-white/10 max-w-lg mx-auto uppercase tracking-wider font-bold">
            <div className="flex items-center gap-1.5 step-indicator">
              <span 
                className="h-5 w-5 rounded-none flex items-center justify-center font-bold"
                style={{ 
                  backgroundColor: step >= 1 ? tenant.primaryColor : '#111111', 
                  color: step >= 1 ? '#000' : '#888' 
                }}
              >
                1
              </span>
              <span className={step === 1 ? 'text-white' : 'text-zinc-650'}>TREATMENT</span>
            </div>
            
            <span className="text-zinc-800">———</span>

            <div className="flex items-center gap-1.5 step-indicator">
              <span 
                className="h-5 w-5 rounded-none flex items-center justify-center font-bold"
                style={{ 
                  backgroundColor: step >= 2 ? tenant.primaryColor : '#111111', 
                  color: step >= 2 ? '#000' : '#888' 
                }}
              >
                2
              </span>
              <span className={step === 2 ? 'text-white' : 'text-zinc-650'}>ARTIST</span>
            </div>

            <span className="text-zinc-800">———</span>

            <div className="flex items-center gap-1.5 step-indicator">
              <span 
                className="h-5 w-5 rounded-none flex items-center justify-center font-bold"
                style={{ 
                  backgroundColor: step >= 3 ? tenant.primaryColor : '#111111', 
                  color: step >= 3 ? '#000' : '#888' 
                }}
              >
                3
              </span>
              <span className={step === 3 ? 'text-white' : 'text-zinc-650'}>SCHEDULE</span>
            </div>
          </div>
        )}

        {/* STEP 1: Treatments Select Index */}
        {step === 1 && (
          <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 sm:p-8 space-y-6 text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: tenant.primaryColor }} />
            
            <div>
              <h2 className="text-xl sm:text-2xl brand-serif text-white font-normal italic">Select Luxury Treatment Option</h2>
              <p className="text-zinc-500 text-xs mt-1 font-mono">Bespoke hair restoration, styling scissor sculpting and scalp wellness rituals.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(svc => {
                const isSelected = selectedService?.id === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc)}
                    className="p-5 rounded-none text-left bg-black border hover:border-white/20 transition-all flex flex-col justify-between h-44 group select-none relative cursor-pointer"
                    style={{ 
                      borderColor: isSelected ? tenant.primaryColor : 'rgba(255,255,255,0.08)'
                    }}
                  >
                    {/* Tick icon indicator for verified choice */}
                    {isSelected && (
                      <span className="absolute top-4 right-4 text-black p-0.5 rounded-none" style={{ backgroundColor: tenant.primaryColor }}>
                        <Check className="h-3 w-3 text-black font-extrabold" />
                      </span>
                    )}

                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono tracking-widest uppercase font-bold block" style={{ color: tenant.primaryColor }}>
                        {svc.category}
                      </span>
                      <span className="text-base font-bold text-white block group-hover:text-gold-200 truncate pr-6">{svc.name}</span>
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed line-clamp-2 mt-1">{svc.description}</p>
                    </div>

                    <div className="flex justify-between items-center border-t border-white/5 pt-3 text-[10px] font-mono w-full">
                      <span className="flex items-center gap-1.5 text-zinc-550 uppercase font-bold tracking-wider text-[9px]">
                        <Clock className="h-3.5 w-3.5 text-zinc-650" />
                        <span>{svc.duration} minutes</span>
                      </span>
                      <span className="text-sm font-serif font-bold text-white tracking-widest">${svc.price.toFixed(2)}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                disabled={!selectedService}
                onClick={() => setStep(2)}
                className="px-6 py-3 font-bold uppercase text-xs tracking-widest rounded-none font-mono flex items-center gap-2 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-black"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                <span>Select Artist Choice</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Artists Choice Catalog */}
        {step === 2 && (
          <div className="bg-[#0d0d0d] border border-white/10 rounded-none p-6 sm:p-8 space-y-6 text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: tenant.primaryColor }} />
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setStep(1)}
                className="px-3.5 py-2 text-[10px] uppercase tracking-widest font-mono text-zinc-400 hover:text-white hover:bg-black border border-white/10 rounded-none flex items-center gap-1.5 cursor-pointer mr-2 transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Go Back</span>
              </button>
              <div>
                <h2 className="text-xl sm:text-2xl brand-serif text-white font-normal italic">Select Assigned Artist</h2>
                <p className="text-zinc-500 text-xs mt-0.5 font-mono">Select dynamic salon professionals dedicated for luxury wellness care.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staffList.map(member => {
                const isSelected = selectedStaff?.id === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedStaff(member)}
                    className="p-5 rounded-none text-left bg-black border hover:border-white/15 transition-all flex gap-4 select-none relative cursor-pointer"
                    style={{ 
                      borderColor: isSelected ? tenant.primaryColor : 'rgba(255,255,255,0.08)'
                    }}
                  >
                    {isSelected && (
                      <span className="absolute top-4 right-4 text-black p-0.5 rounded-none animate-fade-in" style={{ backgroundColor: tenant.primaryColor }}>
                        <Check className="h-3 w-3 text-black font-extrabold" />
                      </span>
                    )}

                    <img 
                      src={member.avatarUrl} 
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 rounded-none border border-white/10 object-cover"
                      style={{ borderColor: isSelected ? tenant.primaryColor : 'rgba(255,255,255,0.1)' }}
                    />
                    <div className="space-y-1.5 flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white block truncate text-base leading-none">{member.name}</span>
                        <span className="flex items-center gap-0.5 text-gold-400 font-mono text-[10.5px]">
                          <Star className="h-3 w-3 fill-current" />
                          <span>{member.rating}</span>
                        </span>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-500 uppercase font-bold tracking-widest block leading-none">{member.role}</span>
                      <p className="text-xs text-zinc-400 font-sans leading-relaxed line-clamp-2">{member.bio}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-between items-center border-t border-white/5 pt-5">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest leading-none">
                Selected: <strong className="text-white hover:text-gold-400 transition-all font-bold">{selectedStaff?.name || 'None'}</strong>
              </span>
              <button
                disabled={!selectedStaff}
                onClick={() => setStep(3)}
                className="px-6 py-3 font-bold uppercase text-xs tracking-widest rounded-none font-mono flex items-center gap-2 active:scale-[0.98] transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer text-black"
                style={{ backgroundColor: tenant.primaryColor }}
              >
                <span>Select Calendar</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Complete Schedule Book & Contact form details */}
        {step === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side schedules & form details (Col span 7) */}
            <div className="lg:col-span-7 bg-[#0d0d0d] border border-white/10 rounded-none p-6 sm:p-8 space-y-6 text-left relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px]" style={{ backgroundColor: tenant.primaryColor }} />

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setStep(2)}
                  className="px-3.5 py-2 text-[10px] uppercase tracking-widest font-mono text-zinc-400 hover:text-white hover:bg-black border border-white/10 rounded-none flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Go Back</span>
                </button>
                <div>
                  <h2 className="text-xl sm:text-2xl brand-serif text-white font-normal italic">Confirm Reservation Slot</h2>
                  <p className="text-zinc-500 text-xs mt-0.5 font-mono">Select dynamic dates and times specifically verified with active staff cycles.</p>
                </div>
              </div>

              {/* Day Selection calendar mock cards */}
              <div className="space-y-3">
                <label className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest block">1. Available Days Slot</label>
                <div className="grid grid-cols-4 gap-2">
                  {getUpcomingDates().map((dt, idx) => {
                    const isSelected = selectedDate === dt.iso;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedDate(dt.iso)}
                        className="p-3 text-center rounded-none bg-black border hover:border-white/20 transition-all font-mono text-xs select-none cursor-pointer"
                        style={{ 
                          borderColor: isSelected ? tenant.primaryColor : 'rgba(255,255,255,0.08)',
                          color: isSelected ? tenant.primaryColor : '#aaa'
                        }}
                      >
                        <span className="block text-[8px] text-zinc-550 uppercase leading-none font-sans font-bold">{dt.display.split(',')[0]}</span>
                        <span className="block font-bold mt-1.5 text-sm">{dt.display.split(',')[1].split(' ')[2]}</span>
                        <span className="block text-[8px] text-zinc-600 mt-1 leading-none font-bold uppercase tracking-wider">{dt.display.split(',')[1].split(' ')[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots selector */}
              {selectedDate && (
                <div className="space-y-3 animate-fade-in pt-2">
                  <label className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-widest block">2. Select Hour Segment</label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVAILABLE_HOURS.map((hr, idx) => {
                      const isSelected = selectedTime === hr;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedTime(hr)}
                          className="py-2.5 text-center rounded-none bg-black border hover:border-white/20 transition-all font-mono text-[11px] cursor-pointer"
                          style={{ 
                            borderColor: isSelected ? tenant.primaryColor : 'rgba(255,255,255,0.08)',
                            color: isSelected ? tenant.primaryColor : '#aaa'
                          }}
                        >
                          {hr}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Form client info inputs */}
              {selectedDate && selectedTime && (
                <form onSubmit={handleFinalizeBooking} className="space-y-4 pt-6 border-t border-white/10 select-none animate-fade-in">
                  <span className="text-[10px] text-zinc-500 font-mono font-bold block uppercase tracking-widest mb-1 font-bold">3. Guest Personal Credentials</span>
                  
                  <div className="space-y-3.5 font-mono text-[11px]">
                    <div>
                      <label className="text-[9px] text-zinc-500 uppercase tracking-wider block mb-1.5">Full Guest Name</label>
                      <input
                        type="text"
                        required
                        value={custName}
                        onChange={(e) => setCustName(e.target.value)}
                        placeholder="Victoria Vanderbilt"
                        className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs rounded-none text-white focus:outline-none focus:border-gold-500 text-sans font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[9px] text-zinc-500 uppercase tracking-wider block mb-1.5">Contact Email Address</label>
                        <input
                          type="email"
                          required
                          value={custEmail}
                          onChange={(e) => setCustEmail(e.target.value)}
                          placeholder="client@net.com"
                          className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs rounded-none text-white focus:outline-none focus:border-gold-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-zinc-500 uppercase tracking-wider block mb-1.5">Cell Mobile Phone</label>
                        <input
                          type="text"
                          required
                          value={custPhone}
                          onChange={(e) => setCustPhone(e.target.value)}
                          placeholder="+1 (555) 0120"
                          className="w-full bg-black border border-white/10 px-3.5 py-2.5 text-xs rounded-none text-white focus:outline-none focus:border-gold-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] text-zinc-500 uppercase tracking-wider block mb-1.5">Special Treatment Notes / Styled direction</label>
                      <textarea
                        value={custNotes}
                        onChange={(e) => setCustNotes(e.target.value)}
                        placeholder="Directions guidelines. Hot mint towels preference..."
                        className="w-full h-16 bg-black border border-white/10 px-3.5 py-2.5 text-xs rounded-none text-white focus:outline-none focus:border-gold-500 text-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isFinishing}
                    className="w-full py-4 mt-4 font-mono font-bold text-xs uppercase tracking-widest rounded-none flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer text-black"
                    style={{ backgroundColor: tenant.primaryColor }}
                  >
                    {isFinishing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Synchronizing relational records...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Confirm Booking</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right side cart checkout receipt preview (Col span 5) */}
            <div className="lg:col-span-5 bg-[#0d0d0d] border border-white/10 rounded-none p-6 text-left relative overflow-hidden flex flex-col justify-between h-auto space-y-6">
              <div>
                <span className="text-[9px] text-zinc-500 block uppercase font-mono font-bold tracking-widest mb-4">Reservation Cart Review</span>
                
                <div className="divide-y divide-white/5 space-y-4">
                  {selectedService && (
                    <div className="py-2 flex justify-between items-start gap-4 animate-fade-in">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono">Product treatment</span>
                        <h4 className="text-sm font-bold text-white font-sans mt-0.5">{selectedService.name}</h4>
                        <span className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-1">
                          <Clock className="h-3.5 w-3.5 text-zinc-500" />
                          <span>{selectedService.duration} mins treatment</span>
                        </span>
                      </div>
                      <span className="font-serif font-bold text-white">${selectedService.price.toFixed(2)}</span>
                    </div>
                  )}

                  {selectedStaff && (
                    <div className="py-4 flex items-center gap-3 animate-fade-in border-t border-white/5">
                      <img 
                        src={selectedStaff.avatarUrl} 
                        alt="Staff specialist chosen"
                        referrerPolicy="no-referrer"
                        className="h-10 w-10 rounded-none object-cover border border-white/10"
                        style={{ borderColor: tenant.primaryColor }}
                      />
                      <div>
                        <span className="text-[8px] text-zinc-500 font-mono uppercase font-bold tracking-widest block">Assigned Specialist</span>
                        <h4 className="text-xs font-bold font-mono text-zinc-100 mt-0.5">{selectedStaff.name}</h4>
                        <span className="text-[10px] text-zinc-400 font-mono">{selectedStaff.role}</span>
                      </div>
                    </div>
                  )}

                  {selectedDate && selectedTime && (
                    <div className="py-4 flex items-center gap-2 font-mono text-xs text-zinc-350 border-t border-white/5 uppercase tracking-wider text-[9px] font-bold">
                      <Calendar className="h-4 w-4 text-zinc-650" style={{ color: tenant.primaryColor }} />
                      <span>{selectedDate} at <strong className="text-white">{selectedTime}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {selectedService && (
                <div className="border-t border-white/5 pt-5 mt-6 space-y-1.5 font-mono">
                  <div className="flex justify-between items-center text-zinc-500 text-[10px] uppercase tracking-wider">
                    <span>Platform Setup Charge</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-bold text-base text-white pt-1">
                    <span className="font-serif italic font-normal">Est. Total Due At Salon</span>
                    <span className="font-bold font-serif" style={{ color: tenant.primaryColor }}>${selectedService.price.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* STEP 4: Success confirmation screen */}
        {step === 4 && (
          <div className="max-w-md mx-auto bg-[#0d0d0d] border border-white/10 rounded-none p-8 space-y-6 text-center relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-[3px]" style={{ backgroundColor: tenant.primaryColor }} />

            <div className="h-12 w-12 rounded-none mx-auto flex items-center justify-center border" style={{ borderColor: tenant.primaryColor, backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <CheckCircle2 className="h-6 w-6" style={{ color: tenant.primaryColor }} />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-normal font-serif italic text-white tracking-tight">Booking Confirmed</h2>
              <p className="text-zinc-500 text-xs">Your bespoke reservation record has been dynamically compiled and written to Nexora PostgreSQL cluster.</p>
            </div>

            <div className="p-5 bg-black border border-white/5 rounded-none space-y-2.5 font-mono text-[10px] text-left uppercase tracking-wider">
              <div className="flex justify-between text-zinc-500">
                <span>RESERVATION RECORD ID</span>
                <span className="text-white font-bold">{bookedAptId || 'APT-ID'}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>ASSIGNED CLASS SERVICE</span>
                <span className="text-white font-bold">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>STYLING SPECIALIST</span>
                <span className="text-white font-bold">{selectedStaff?.name}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>SCHEDULED DATE SLOT</span>
                <span className="text-white font-bold">{selectedDate} - {selectedTime}</span>
              </div>
              <div className="border-t border-white/5 pt-3.5 flex justify-between uppercase font-bold text-zinc-400 mt-2 text-[11px]">
                <span className="font-serif italic font-normal text-zinc-500">ESTIMATED TOTAL</span>
                <span className="font-serif font-bold text-white" style={{ color: tenant.primaryColor }}>${selectedService?.price.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setStep(1);
                setSelectedService(null);
                setSelectedStaff(null);
                setSelectedDate('');
                setSelectedTime('');
                setBookedAptId(null);
              }}
              className="w-full font-bold uppercase text-xs py-3.5 rounded-none tracking-widest font-mono transition-all active:scale-[0.98] cursor-pointer text-black"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              Configure Another Treatment
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
