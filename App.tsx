import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, Upload, Trash2, Search, Loader2, Sparkles, ChevronRight, ArrowLeft,
  TrendingUp, Activity, Stethoscope, Smile, Eye, Users,
  UserCircle, ChevronDown, Banknote, Scale, MapPin, MoreHorizontal, 
  Settings2, ExternalLink, ChevronsRight, ChevronsLeft,
  ChevronLeft, CheckCircle2, ChevronUp, Briefcase, User, Info, FileText, Check, Pencil, AlertCircle,
  PiggyBank, CircleDollarSign, Lock, Mail, Phone, Calendar, Hash, MapPinned, Building2, RefreshCw,
  Settings, History, Clock, X, CheckCircle
} from 'lucide-react';
import { Deduction, DeductionCategory, DeductionStatus, Employee, EnrollmentDetail, EmployeeDemographics } from './types';
import { generateUniqueCode, parseBulkDeductions } from './geminiService';

/**
 * Custom Tooth Icon component to replace the missing lucide-react export
 */
const Tooth = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7 3C5.5 3 4.5 4 4.1 5.3c-.6 2.3-.1 5.4.9 7.7.5 1.1 1 2.2 1 3.5 0 2.2 1.8 4 4 4 .8 0 1.5-.2 2.1-.6.6.4 1.3.6 2.1.6 2.2 0 4-1.8 4-4 0-1.3.5-2.4 1-3.5 1-2.3 1.5-5.4.9-7.7C19.5 4 18.5 3 17 3c-1.8 0-3.5 1.5-5 3C10.5 4.5 8.8 3 7 3z" />
  </svg>
);

// --- CUSTOM DROPDOWN COMPONENT ---
interface Option {
  id: string;
  title: string;
  icon?: React.ElementType;
}

function CustomSelect({ 
  label, 
  value, 
  options, 
  placeholder, 
  onChange, 
  disabled = false,
  stepNumber
}: { 
  label: string, 
  value: string, 
  options: Option[], 
  placeholder: string, 
  onChange: (id: string) => void,
  disabled?: boolean,
  stepNumber: number
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.id === value);

  return (
    <div className={`space-y-3 transition-all duration-300 ${disabled ? 'opacity-30 pointer-events-none' : ''}`} ref={containerRef}>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">{stepNumber}</span>
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-semibold transition-all text-left h-[62px] ${isOpen ? 'border-indigo-600 bg-white shadow-sm' : 'border-slate-300 text-slate-800'}`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            {selectedOption?.icon && (
              <div className="flex-shrink-0 w-7.5 h-7.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm transition-all animate-in fade-in zoom-in duration-300">
                <selectedOption.icon className="w-4 h-4" />
              </div>
            )}
            <span className={`${!selectedOption ? 'text-slate-500 font-medium' : 'text-slate-900'} truncate`}>
              {selectedOption ? selectedOption.title : placeholder}
            </span>
          </div>
          <ChevronDown className={`flex-shrink-0 w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-indigo-600' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-[60] bg-white border border-slate-200 rounded-[20px] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="max-h-60 overflow-y-auto p-2 space-y-1">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${value === opt.id ? 'bg-indigo-50 text-indigo-800' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  <div className="flex items-center gap-3">
                    {opt.icon && (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${value === opt.id ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-400'}`}>
                        <opt.icon className="w-4 h-4" />
                      </div>
                    )}
                    {opt.title}
                  </div>
                  {value === opt.id && <Check className="w-4 h-4 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Mock Initial Data for Deductions
const INITIAL_DEDUCTIONS: Deduction[] = [
  { id: '1', planName: 'Basic PPO', providerName: 'BlueCross BlueShield', category: DeductionCategory.MEDICAL, subtype: 'PPO Plan', payrollCode: 'MED-BCBS-01', status: DeductionStatus.ACTIVE, isPreTax: true, createdAt: new Date().toISOString(), employeeCount: 13 },
  { id: '2', planName: '401k Match', providerName: 'Fidelity', category: DeductionCategory.RETIREMENT, subtype: '401(k)', payrollCode: 'RET-FID-01', status: DeductionStatus.ACTIVE, isPreTax: true, createdAt: new Date().toISOString(), employeeCount: 9 },
  { id: '3', planName: 'Delta Dental Premier', providerName: 'Delta Dental', category: DeductionCategory.DENTAL, subtype: 'Dental PPO', payrollCode: 'DEN-DEL-01', status: DeductionStatus.ACTIVE, isPreTax: true, createdAt: new Date().toISOString(), employeeCount: 11 },
  { id: '4', planName: 'Vision Gold', providerName: 'VSP', category: DeductionCategory.VISION, subtype: 'Vision PPO', payrollCode: 'VIS-VSP-01', status: DeductionStatus.INACTIVE, isPreTax: true, createdAt: new Date().toISOString(), employeeCount: 7 }
];

const NAMES = [
  "Sarah Jenkins", "Michael Chen", "Elena Rodriguez", "David Smith", "Lisa Wong",
  "James Wilson", "Maria Garcia", "Robert Taylor", "Linda Martinez", "William Brown",
  "Elizabeth Davis", "Christopher Miller", "Patricia Wilson", "Matthew Moore", "Jennifer Taylor",
  "Andrew Anderson", "Susan Thomas", "Joshua Jackson", "Margaret White", "Kevin Harris",
  "Dorothy Martin", "Richard Thompson", "Jessica Garcia", "Brian Martinez", "Karen Robinson"
];

const getPastDate = (mins: number) => new Date(Date.now() - mins * 60000).toISOString();

const standardPackage: EnrollmentDetail[] = [
  { name: 'Basic PPO', type: 'Medical', frequency: 'Bi-weekly', startDate: '01/01/2024', endDate: '-', employeeAmount: '$155.00', employerAmount: '$420.00', isSynced: true, lastSynced: getPastDate(5) },
  { name: 'Delta Dental Premier', type: 'Dental', frequency: 'Monthly', startDate: '01/01/2024', endDate: '-', employeeAmount: '$48.50', employerAmount: '$12.00', isSynced: true, lastSynced: getPastDate(120) },
  { name: 'Vision Gold', type: 'Vision', frequency: 'Monthly', startDate: '01/01/2024', endDate: '-', employeeAmount: '$14.20', employerAmount: '$0.00', isSynced: true, lastSynced: getPastDate(1500) },
  { name: '401k Contribution', type: 'Retirement', frequency: 'Monthly', startDate: '01/01/2024', endDate: '-', employeeAmount: '5%', employerAmount: '3%', isSynced: true, lastSynced: getPastDate(45) }
];

const ALL_EMPLOYEES: Employee[] = NAMES.map((name, index) => ({
  id: `EMP${(index + 1).toString().padStart(3, '0')}`,
  name,
  demographics: {
    email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
    phone: `(555) ${100 + index}-${2000 + index}`,
    department: index % 3 === 0 ? 'Engineering' : index % 3 === 1 ? 'Human Resources' : 'Product Design',
    hireDate: 'Mar 12, 2021',
    address1: `${100 + index} Corporate Way`,
    address2: index % 4 === 0 ? 'Suite ' + (index * 10) : '',
    city: 'San Francisco',
    state: 'CA',
    zip: '94105',
    dob: `${Math.floor(Math.random() * 12) + 1}/${Math.floor(Math.random() * 28) + 1}/${1970 + Math.floor(Math.random() * 30)}`,
    sex: index % 2 === 0 ? 'Female' : 'Male',
    ssnLast4: `${1000 + index}`.slice(-4)
  },
  enrollments: standardPackage.map(p => ({ 
    ...p, 
    isSynced: Math.random() > 0.2,
    lastSynced: getPastDate(Math.floor(Math.random() * 4000))
  }))
}));

export default function App() {
  const [activeTab, setActiveTab] = useState<'deductions' | 'employees'>('deductions');
  const [deductions, setDeductions] = useState<Deduction[]>(INITIAL_DEDUCTIONS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<Deduction | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [viewingEmployeesForDeduction, setViewingEmployeesForDeduction] = useState<Deduction | null>(null);
  const [historyModalData, setHistoryModalData] = useState<{ employee: Employee, enrollment: EnrollmentDetail } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set(ALL_EMPLOYEES.slice(0, 10).map(e => e.id)));
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  
  // State for Employees view filter
  const [employeeViewFilter, setEmployeeViewFilter] = useState<'Deductions' | 'Demographic Info'>('Deductions');
  const [isViewFilterOpen, setIsViewFilterOpen] = useState(false);

  const settingsMenuRef = useRef<HTMLDivElement>(null);
  const viewFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target as Node)) {
        setIsSettingsMenuOpen(false);
      }
      if (viewFilterRef.current && !viewFilterRef.current.contains(event.target as Node)) {
        setIsViewFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDeductions = deductions.filter(d => 
    d.planName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.payrollCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEmployeesData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return ALL_EMPLOYEES.filter(emp => selectedEmployeeIds.has(emp.id))
      .map(emp => {
        const matchingEnrollments = emp.enrollments.filter(en => 
          emp.name.toLowerCase().includes(query) || 
          en.name.toLowerCase().includes(query) || 
          en.type.toLowerCase().includes(query)
        );
        return { ...emp, enrollments: matchingEnrollments };
      })
      .filter(emp => emp.enrollments.length > 0 || searchQuery === '');
  }, [selectedEmployeeIds, searchQuery]);

  const handleSaveDeduction = (newDeduction: Deduction) => {
    const isDuplicate = deductions.some(d => d.payrollCode === newDeduction.payrollCode && d.id !== newDeduction.id);
    if (isDuplicate) {
      alert(`The payroll code "${newDeduction.payrollCode}" is already in use by another deduction. Please use a unique code.`);
      return false;
    }

    const deductionWithActiveStatus = {
      ...newDeduction,
      status: DeductionStatus.ACTIVE,
      employeeCount: 0 
    };

    setDeductions(prev => {
      const index = prev.findIndex(d => d.id === deductionWithActiveStatus.id);
      if (index > -1) {
        const updated = [...prev];
        updated[index] = deductionWithActiveStatus;
        return updated;
      }
      return [deductionWithActiveStatus, ...prev];
    });

    setIsAddModalOpen(false);
    setEditingDeduction(null);
    setShowSuccessBanner(true);
    return true;
  };

  const toggleDeductionStatus = (id: string) => {
    setDeductions(prev => prev.map(d => {
      if (d.id === id) {
        return {
          ...d,
          status: d.status === DeductionStatus.ACTIVE ? DeductionStatus.INACTIVE : DeductionStatus.ACTIVE
        };
      }
      return d;
    }));
  };

  const handleBulkAdd = (newDeductions: any[]) => {
    const formatted = newDeductions.map(d => ({
      ...d, 
      id: Math.random().toString(36).substr(2, 9), 
      status: DeductionStatus.ACTIVE, 
      isPreTax: true, 
      subtype: d.category || 'Standard',
      createdAt: new Date().toISOString(),
      employeeCount: 0 
    }));
    
    const existingCodes = new Set(deductions.map(d => d.payrollCode));
    const uniqueFormatted = formatted.filter(d => !existingCodes.has(d.payrollCode));
    
    if (uniqueFormatted.length < formatted.length) {
      alert(`${formatted.length - uniqueFormatted.length} items were skipped because their payroll codes already exist.`);
    }

    setDeductions(prev => [...uniqueFormatted, ...prev]);
    setIsBulkModalOpen(false);
    setShowSuccessBanner(true);
  };

  return (
    <div className="h-screen flex flex-col font-sans bg-[#F8FAFC] overflow-hidden text-slate-900">
      <header className="bg-white border-b border-slate-200 flex-shrink-0 relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-indigo-950 tracking-tight">Payroll Deductions</h1>
          </div>
        </div>
      </header>

      {/* Success Banner */}
      {showSuccessBanner && (
        <div className="bg-white border-b border-slate-100 flex-shrink-0 animate-in slide-in-from-top duration-500 overflow-hidden py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#059669] rounded-[20px] shadow-lg flex items-center justify-between p-4 px-6 gap-6 relative overflow-hidden group">
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/30 shadow-inner">
                  <CheckCircle className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <div className="flex flex-col">
                  <p className="text-[16px] font-bold text-white tracking-tight leading-none mb-1.5">
                    Your new deduction was added to BambooHR successfully!
                  </p>
                  <p className="text-[14px] font-medium text-emerald-50/90 leading-tight">
                    You'll need to map your new deduction inside Employee Navigator.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <button className="flex items-center gap-2.5 px-6 py-2.5 bg-white text-[#059669] text-sm font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-sm active:scale-95">
                  Go to Employee Navigator
                </button>
                <button 
                  onClick={() => setShowSuccessBanner(false)}
                  className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-hidden">
        <div className="flex items-center gap-10 mb-10 border-b border-slate-200 px-1 flex-shrink-0">
          <button 
            onClick={() => setActiveTab('deductions')} 
            className={`pb-4 text-[18px] font-bold transition-all relative ${activeTab === 'deductions' ? 'text-indigo-950' : 'text-[#94A3B8] hover:text-[#64748B]'}`}
          >
            Deductions 
            {activeTab === 'deductions' && (
              <div className="absolute -bottom-[1px] left-0 right-0 h-[3px] bg-indigo-600 rounded-t-full" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('employees')} 
            className={`pb-4 text-[18px] font-bold transition-all relative ${activeTab === 'employees' ? 'text-indigo-950' : 'text-[#94A3B8] hover:text-[#64748B]'}`}
          >
            Employees 
            {activeTab === 'employees' && (
              <div className="absolute -bottom-[1px] left-0 right-0 h-[3px] bg-indigo-600 rounded-t-full" />
            )}
          </button>
        </div>

        <div className="flex flex-col gap-6 mb-6 flex-shrink-0">
          <div className="flex items-center justify-end gap-3">
            {activeTab === 'deductions' ? (
              <button onClick={() => { setEditingDeduction(null); setIsAddModalOpen(true); }} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm">
                <Plus className="w-4 h-4" /> Add Deduction
              </button>
            ) : (
              <button onClick={() => setIsManageModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm">
                <Settings2 className="w-4 h-4" /> Manage Employees
              </button>
            )}

            <div className="relative" ref={settingsMenuRef}>
              <button 
                onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)} 
                className={`flex items-center justify-center p-2.5 text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm ${isSettingsMenuOpen ? 'bg-slate-100 border-indigo-200' : ''}`}
                aria-label="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              {isSettingsMenuOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-max overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  {activeTab === 'deductions' && (
                    <>
                      <button 
                        onClick={() => { setIsBulkModalOpen(true); setIsSettingsMenuOpen(false); }} 
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 transition-colors text-left"
                      >
                        <Upload className="w-4 h-4 text-slate-400" />
                        <span>Bulk Import</span>
                      </button>
                      <div className="h-px bg-slate-100 mx-2" />
                    </>
                  )}
                  <button 
                    onClick={() => { setIsSettingsMenuOpen(false); }} 
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>Go to Employee Navigator</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" placeholder={activeTab === 'deductions' ? "Search deductions..." : "Search name, plan or type..."}
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all shadow-sm placeholder-slate-400"
              />
            </div>

            {activeTab === 'employees' && (
              <div className="relative" ref={viewFilterRef}>
                <button 
                  onClick={() => setIsViewFilterOpen(!isViewFilterOpen)}
                  className={`flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm transition-all hover:bg-slate-50 shadow-sm ${isViewFilterOpen ? 'border-indigo-600' : ''}`}
                >
                  <span className="text-slate-500 font-medium">Showing:</span>
                  <span className="text-slate-900 font-bold">{employeeViewFilter}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isViewFilterOpen ? 'rotate-180 text-indigo-600' : ''}`} />
                </button>
                {isViewFilterOpen && (
                  <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 w-52 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                    {(['Deductions', 'Demographic Info'] as const).map((opt) => (
                      <button 
                        key={opt}
                        onClick={() => { setEmployeeViewFilter(opt); setIsViewFilterOpen(false); }}
                        className={`flex items-center justify-between w-full px-4 py-2.5 text-sm transition-colors text-left ${employeeViewFilter === opt ? 'bg-indigo-50 text-indigo-900 font-bold' : 'text-slate-600 hover:bg-slate-50 font-semibold'}`}
                      >
                        {opt}
                        {employeeViewFilter === opt && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'deductions' ? (
            <div className="bg-white border border-slate-200 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm">
              <div className="overflow-y-auto flex-1">
                <table className="w-full text-left border-collapse min-w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#F8FAFC] border-b border-slate-200">
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Provider</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Payroll Code</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Tax Type</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Employees</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDeductions.length > 0 ? filteredDeductions.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-indigo-950 leading-tight">{d.planName}</span>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-tight">{d.category}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm font-medium text-slate-600 truncate max-w-[180px] inline-block">{d.providerName}</span>
                        </td>
                        <td className="px-6 py-5">
                          <code className="text-xs font-bold font-mono bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-200 uppercase tracking-widest">
                            {d.payrollCode}
                          </code>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${d.isPreTax ? 'bg-indigo-50 text-indigo-800 border-indigo-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {d.isPreTax ? 'Pre-Tax' : 'Post-Tax'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <button 
                            onClick={() => setViewingEmployeesForDeduction(d)} 
                            className="flex items-center gap-2 group/btn"
                          >
                            <Users className="w-4 h-4 text-indigo-300 group-hover/btn:text-indigo-600 transition-colors" />
                            <span className="text-sm font-bold text-indigo-600 group-hover/btn:underline">{d.employeeCount}</span>
                          </button>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${d.status === DeductionStatus.ACTIVE ? 'text-indigo-600' : 'text-slate-400'}`}>
                              {d.status}
                            </span>
                            <button 
                              onClick={() => toggleDeductionStatus(d.id)}
                              className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${d.status === DeductionStatus.ACTIVE ? 'bg-indigo-600' : 'bg-slate-200'}`}
                            >
                              <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${d.status === DeductionStatus.ACTIVE ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={6} className="p-12 text-center text-slate-400 italic">No deductions found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-sm">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#F8FAFC] border-b border-slate-200">
                      {employeeViewFilter === 'Demographic Info' ? (
                        <>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Social</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">DOB</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Sex</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Email</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Phone</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Address</th>
                          <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Hire Date</th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Employee / Plan Name</th>
                          <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Type</th>
                          <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Freq</th>
                          <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Start</th>
                          <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">End</th>
                          <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Employee Amt</th>
                          <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Employer Amt</th>
                          <th className="px-4 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEmployeesData.length > 0 ? filteredEmployeesData.map((emp) => (
                      <React.Fragment key={emp.id}>
                        <tr className="bg-white">
                          <td colSpan={employeeViewFilter === 'Demographic Info' ? 7 : 8} className="px-6 py-4 border-t border-slate-100">
                            <button className="text-sm font-bold text-indigo-600 tracking-tight hover:underline">
                              {emp.name}
                            </button>
                          </td>
                        </tr>

                        {employeeViewFilter === 'Demographic Info' ? (
                          <tr className="bg-white hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-5">
                              <code className="text-sm font-bold font-mono text-slate-700 rounded uppercase tracking-wider w-fit">
                                ***-**-{emp.demographics.ssnLast4}
                              </code>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-medium text-slate-600">{emp.demographics.dob}</span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">{emp.demographics.sex}</span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-medium text-indigo-600 truncate max-w-[150px] inline-block hover:underline cursor-pointer">{emp.demographics.email}</span>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-medium text-slate-600 whitespace-nowrap">{emp.demographics.phone}</span>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex flex-col min-w-[200px]">
                                <span className="text-sm font-medium text-slate-900 truncate">{emp.demographics.address1}</span>
                                <span className="text-[11px] font-medium text-slate-500">
                                  {emp.demographics.address2 ? `${emp.demographics.address2}, ` : ''}{emp.demographics.city}, {emp.demographics.state} {emp.demographics.zip}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className="text-sm font-bold text-slate-900 whitespace-nowrap">{emp.demographics.hireDate}</span>
                            </td>
                          </tr>
                        ) : (
                          emp.enrollments.map((en, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-4 py-4 pl-10">
                                <span className="text-sm font-bold text-indigo-950">{en.name}</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-[10px] text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 font-bold uppercase tracking-wider">
                                  {en.type}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm text-slate-500 font-medium">{en.frequency}</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm text-slate-500 font-medium">{en.startDate}</span>
                              </td>
                              <td className="px-4 py-4">
                                <span className="text-sm text-slate-500 font-medium">{en.endDate}</span>
                              </td>
                              <td className="px-4 py-4 text-right whitespace-nowrap">
                                <div className="flex items-baseline justify-end gap-1">
                                  <span className="text-sm font-bold text-slate-900">{en.employeeAmount}</span>
                                  <span className="text-[10px] text-indigo-300 font-bold tracking-tight">/pay period</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right whitespace-nowrap">
                                <div className="flex items-baseline justify-end gap-1">
                                  <span className="text-sm font-bold text-slate-900">{en.employerAmount}</span>
                                  <span className="text-[10px] text-indigo-300 font-bold tracking-tight">/pay period</span>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <button 
                                  onClick={() => setHistoryModalData({ employee: emp, enrollment: en })}
                                  className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"
                                  title="View Deduction History"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </React.Fragment>
                    )) : (
                      <tr><td colSpan={employeeViewFilter === 'Demographic Info' ? 7 : 8} className="p-12 text-center text-slate-400 italic">No integrated employees found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {isAddModalOpen && <QuickBuildDeductionModal initialDeduction={editingDeduction} onClose={() => { setIsAddModalOpen(false); setEditingDeduction(null); }} onSave={handleSaveDeduction} />}
      {isBulkModalOpen && <BulkImportModal onClose={() => setIsBulkModalOpen(false)} onImport={handleBulkAdd} />}
      {isManageModalOpen && <ManageEmployeesModal allEmployees={ALL_EMPLOYEES} currentSelectedIds={selectedEmployeeIds} onClose={() => setIsManageModalOpen(false)} onSave={(ids) => { setSelectedEmployeeIds(ids); setIsManageModalOpen(false); }} />}
      {viewingEmployeesForDeduction && <EmployeeListModal deduction={viewingEmployeesForDeduction} onClose={() => setViewingEmployeesForDeduction(null)} />}
      {historyModalData && <DeductionHistoryModal data={historyModalData} onClose={() => setHistoryModalData(null)} />}
    </div>
  );
}

// --- DEDUCTION HISTORY SNAPSHOT MODAL ---
function DeductionHistoryModal({ data, onClose }: { data: { employee: Employee, enrollment: EnrollmentDetail }, onClose: () => void }) {
  const isRetirement = data.enrollment.type.toLowerCase().includes('retirement') || data.enrollment.name.toLowerCase().includes('401k');
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-300 border border-slate-200">
        
        {/* Header */}
        <div className="px-10 py-8 flex justify-between items-center bg-white border-b border-slate-50">
          <h2 className="text-2xl font-bold text-indigo-950 tracking-tight">Deduction History Snapshot</h2>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-full transition-colors text-slate-400 border border-slate-100 shadow-sm">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-10 pb-10 space-y-8 mt-6">
          <div className="flex items-center justify-between pb-8 border-b border-slate-100">
            <div className="flex items-center gap-5">
               <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <UserCircle className="w-8 h-8" />
               </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">{data.employee.name}</h3>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">{data.employee.demographics.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">View Range</span>
              <div className="relative">
                <select className="appearance-none bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/10 min-w-[200px]">
                  <option>2025 Year-To-Date</option>
                  <option>2024 Full Year</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
              {isRetirement ? <PiggyBank className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div className="flex flex-col">
              <h4 className="text-xl font-bold text-indigo-950 leading-tight">{data.enrollment.name}</h4>
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Benefit Plan</p>
            </div>
          </div>

          <div className="p-8 rounded-[24px] border border-slate-100 bg-white shadow-sm space-y-5">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <TrendingUp className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h5 className="text-base font-bold text-indigo-950">Employee Contributions</h5>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">$10,000 left to reach the {data.enrollment.name} contribution limit for this year.</p>
              </div>
            </div>
            <div className="flex items-center gap-5 text-[13px] font-bold">
              <span className="text-slate-400 tracking-tight">$18,000.00 Paid</span>
              <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '75%' }} />
              </div>
              <span className="text-slate-400 tracking-tight">of $24,000.00 Limit</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 rounded-[24px] border border-slate-100 bg-white shadow-sm flex flex-col h-full hover:border-indigo-100 transition-colors">
               <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
                 <CheckCircle2 className="w-5 h-5" />
               </div>
               <div className="flex-1 space-y-1">
                 <p className="text-sm font-bold text-indigo-600">Active</p>
                 <p className="text-sm font-bold text-slate-900">{data.enrollment.startDate} - 07/31/25</p>
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Plan Status</p>
            </div>
            
            <div className="p-6 rounded-[24px] border border-slate-100 bg-white shadow-sm flex flex-col h-full hover:border-indigo-100 transition-colors">
               <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
                 <Scale className="w-5 h-5" />
               </div>
               <div className="flex-1">
                 <p className="text-sm font-bold text-indigo-950">{data.enrollment.name}</p>
                 <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-tight">{data.enrollment.type}</p>
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Deduction Type</p>
            </div>

            <div className="p-6 rounded-[24px] border border-slate-100 bg-white shadow-sm flex flex-col h-full hover:border-indigo-100 transition-colors">
               <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
                 <Calendar className="w-5 h-5" />
               </div>
               <div className="flex-1 space-y-2">
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-400">EMP:</span>
                    <span className="text-sm font-bold text-indigo-600">{data.enrollment.employeeAmount}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-400">CO:</span>
                    <span className="text-sm font-bold text-indigo-600">{data.enrollment.employerAmount}</span>
                 </div>
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Contribution</p>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-[24px] border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-100/50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Agent</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Event</th>
                  <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-600">
                <tr>
                  <td className="px-6 py-5 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    06/28/2026
                  </td>
                  <td className="px-6 py-5 font-bold text-indigo-950">System</td>
                  <td className="px-6 py-5">Sync Triggered</td>
                  <td className="px-6 py-5 text-slate-400 font-medium italic">Federal Limit Reached</td>
                </tr>
                <tr>
                  <td className="px-6 py-5">06/28/2026</td>
                  <td className="px-6 py-5 font-bold text-indigo-950">HR Admin</td>
                  <td className="px-6 py-5">Amount Adjusted</td>
                  <td className="px-6 py-5">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">EE $500.00 / CO $130.00</span>
                      <button className="flex items-center gap-1 text-indigo-600 font-bold hover:underline transition-all">
                        Details <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-10 py-8 border-t border-slate-100 flex justify-end gap-5 bg-slate-50/20">
          <button className="px-8 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            Edit Employee Profile
          </button>
          <button onClick={onClose} className="px-12 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-100">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// --- EMPLOYEE LIST MODAL ---
function EmployeeListModal({ deduction, onClose }: { deduction: Deduction, onClose: () => void }) {
  const enrolledEmployees = useMemo(() => NAMES.slice(0, 12).map((name, i) => ({ id: `EMP${(deduction.id.length + i).toString().padStart(3, '0')}`, name })), [deduction]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[70vh] animate-in fade-in zoom-in duration-300 border border-slate-200">
        <div className="px-10 pt-10 pb-6 border-b border-slate-50 bg-slate-50/30 flex-shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-indigo-950 tracking-tight">Enrolled Employees</h2>
              <p className="text-sm font-semibold text-indigo-400 mt-1 uppercase tracking-widest">{deduction.planName} • {deduction.providerName}</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 text-slate-300 hover:text-indigo-600 rounded-full transition-all shadow-sm"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex items-center gap-2"><div className="px-4 py-1.5 bg-indigo-600 text-white text-[11px] font-bold rounded-xl uppercase tracking-wider shadow-sm shadow-indigo-100">Count: {deduction.employeeCount} Total</div></div>
        </div>
        <div className="flex-1 overflow-y-auto px-10 py-8">
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Directory Listings</h3>
            {enrolledEmployees.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between py-3.5 group hover:bg-indigo-50/50 -mx-4 px-4 rounded-2xl transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors"><User className="w-5 h-5" /></div>
                  <div className="flex flex-col"><span className="text-sm font-bold text-slate-700 group-hover:text-indigo-900">{emp.name}</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{emp.id}</span></div>
                </div>
                <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all"><ExternalLink className="w-4.5 h-4.5" /></button>
              </div>
            ))}
            <div className="py-8 text-center"><p className="text-xs text-slate-400 font-bold italic uppercase tracking-wider">... and {deduction.employeeCount - enrolledEmployees.length} others</p></div>
          </div>
        </div>
        <div className="p-10 border-t border-slate-100 bg-white flex justify-end">
           <button onClick={onClose} className="px-12 py-3.5 rounded-2xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Close Directory</button>
        </div>
      </div>
    </div>
  );
}

// --- VERTICAL QUICK BUILD MODAL ---
function QuickBuildDeductionModal({ initialDeduction, onClose, onSave }: { initialDeduction: Deduction | null, onClose: () => void, onSave: (d: Deduction) => boolean }) {
  const initialCategory = useMemo(() => {
    if (!initialDeduction) return '';
    return CATEGORIES.find(c => c.title === initialDeduction.category)?.id || '';
  }, [initialDeduction]);

  const [category, setCategory] = useState<string>(initialCategory);
  const [subtype, setSubtype] = useState<string>(initialDeduction?.subtype || '');
  const [details, setDetails] = useState({ 
    planName: initialDeduction?.planName || '', 
    providerName: initialDeduction?.providerName || '', 
    payrollCode: initialDeduction?.payrollCode || '', 
    isPreTax: initialDeduction?.isPreTax ?? true 
  });
  
  const activeCategoryObj = useMemo(() => CATEGORIES.find(c => c.id === category), [category]);

  const categoryOptions = useMemo(() => CATEGORIES.map(c => ({ id: c.id, title: c.title, icon: c.icon })), []);
  const subtypeOptions = useMemo(() => activeCategoryObj?.subtypes.map(s => ({ id: s, title: s })) || [], [activeCategoryObj]);

  const handleCategoryChange = (val: string) => {
    setCategory(val);
    setSubtype('');
    setDetails(prev => ({ 
      ...prev, 
      isPreTax: !(val === 'STATUTORY' || val === 'GARNISHMENT') 
    }));
  };

  const deriveCode = (provider: string, plan: string) => {
    const clean = (s: string) => s.trim().split(' ')[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
    const p1 = clean(provider);
    const p2 = clean(plan);
    if (!p1 && !p2) return '';
    return p1 && p2 ? `${p1}-${p2}` : (p1 || p2);
  };

  useEffect(() => {
    if (!initialDeduction && (details.providerName || details.planName) && !details.payrollCode.includes('-')) {
       const code = deriveCode(details.providerName, details.planName);
       if (code) setDetails(prev => ({ ...prev, payrollCode: code }));
    }
  }, [details.providerName, details.planName, initialDeduction]);

  const handleFinish = () => {
    if (!activeCategoryObj || !subtype) return;
    onSave({
      id: initialDeduction?.id || Math.random().toString(36).substr(2, 9),
      category: activeCategoryObj.title,
      subtype: subtype,
      status: initialDeduction?.status || DeductionStatus.ACTIVE,
      createdAt: initialDeduction?.createdAt || new Date().toISOString(),
      employeeCount: initialDeduction?.employeeCount || 0,
      ...details
    });
  };

  const isReady = !!(category && subtype && details.planName && details.providerName && details.payrollCode);
  const providerPlaceholder = activeCategoryObj?.exampleProvider || "e.g. Insurance Provider Name";
  const planPlaceholder = activeCategoryObj?.examplePlan || "e.g. Standard Advantage Plan";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-xl overflow-hidden flex flex-col h-fit max-h-[90vh] animate-in fade-in zoom-in duration-300 border border-slate-200">
        <div className="px-12 py-10 border-b border-slate-50 flex-shrink-0 flex justify-between items-center bg-white">
          <div>
            <h2 className="text-2xl font-bold text-indigo-950 tracking-tight">{initialDeduction ? 'Update Deduction' : 'New Deduction Entry'}</h2>
            <p className="text-sm font-semibold text-slate-500 mt-2 max-w-md leading-relaxed">
              Define your deduction details to sync with Payroll and Reports in BambooHR.
            </p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-indigo-50 rounded-full transition-all text-slate-300 hover:text-indigo-600 border border-slate-100">
             <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12 space-y-10 bg-white">
          {/* Step 1 */}
          <CustomSelect 
            label="Deduction Category"
            value={category}
            options={categoryOptions}
            placeholder="Select a category..."
            onChange={handleCategoryChange}
            stepNumber={1}
            disabled={!!initialDeduction}
          />

          {/* Step 2 */}
          <CustomSelect 
            label="Plan Type"
            value={subtype}
            options={subtypeOptions}
            placeholder="Choose plan type..."
            onChange={(id) => setSubtype(id)}
            disabled={!category || !!initialDeduction}
            stepNumber={2}
          />

          {/* Step 3 */}
          <div className={`space-y-8 transition-all duration-300 ${!subtype ? 'opacity-30 pointer-events-none' : ''}`}>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-slate-600 font-bold">3</span>
              Deduction Details
            </label>

            <div className="space-y-6">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Insurance Provider</span>
                <input 
                  placeholder={providerPlaceholder}
                  className="w-full px-4 py-4 h-[62px] bg-slate-50 border-2 border-slate-300 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm placeholder-slate-400"
                  value={details.providerName}
                  onChange={e => setDetails({...details, providerName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase ml-1 tracking-widest">Plan Display Name</span>
                <input 
                  placeholder={planPlaceholder}
                  className="w-full px-4 py-4 h-[62px] bg-slate-50 border-2 border-slate-300 rounded-2xl text-sm font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm placeholder-slate-400"
                  value={details.planName}
                  onChange={e => setDetails({...details, planName: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase ml-1 flex items-center gap-2 tracking-widest">
                    Payroll Code {initialDeduction && <Lock className="w-3 h-3" />}
                  </span>
                </div>
                <input 
                  placeholder="E.G. MED-01"
                  readOnly={!!initialDeduction}
                  className={`w-full px-4 py-4 h-[62px] border-2 rounded-2xl text-sm font-bold font-mono uppercase tracking-[0.2em] outline-none transition-all shadow-sm ${initialDeduction ? 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-300 focus:border-indigo-600 focus:bg-white'}`}
                  value={details.payrollCode}
                  onChange={e => setDetails({...details, payrollCode: e.target.value.toUpperCase()})}
                />
              </div>

              <div className="space-y-4 pt-2">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-widest block">
                  Pre-tax Deduction
                </label>
                <div className="flex items-center gap-4">
                  <button 
                    type="button"
                    onClick={() => setDetails(d => ({ ...d, isPreTax: !d.isPreTax }))}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none shadow-sm ${details.isPreTax ? 'bg-indigo-600' : 'bg-slate-300'}`}
                  >
                    <span
                      className={`${
                        details.isPreTax ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm`}
                    />
                  </button>
                  <span className={`text-[13px] font-semibold leading-none ${details.isPreTax ? 'text-indigo-600' : 'text-slate-500'}`}>
                    {details.isPreTax ? 'Deduction is Pre-Tax' : 'Deduction is Post-Tax'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-12 py-10 border-t border-slate-100 flex justify-end gap-6 bg-white flex-shrink-0">
          <button onClick={onClose} className="px-8 py-4 text-sm font-bold text-slate-400 hover:text-indigo-950 transition-colors uppercase tracking-widest">Discard</button>
          <button 
            disabled={!isReady}
            onClick={handleFinish}
            className="px-16 py-4.5 rounded-[20px] bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-xl shadow-indigo-100 active:scale-95 uppercase tracking-widest"
          >
            {initialDeduction ? 'Update Deduction' : 'Save To Payroll'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ManageEmployeesModal({ allEmployees, currentSelectedIds, onClose, onSave }: { 
  allEmployees: Employee[], 
  currentSelectedIds: Set<string>,
  onClose: () => void, 
  onSave: (ids: Set<string>) => void 
}) {
  const [selectedInModal, setSelectedInModal] = useState<Set<string>>(new Set(currentSelectedIds));
  const [leftSearch, setLeftSearch] = useState('');
  const [highlightedLeft, setHighlightedLeft] = useState<Set<string>>(new Set());
  const [highlightedRight, setHighlightedRight] = useState<Set<string>>(new Set());

  const availableEmployees = allEmployees.filter(e => !selectedInModal.has(e.id) && e.name.toLowerCase().includes(leftSearch.toLowerCase()));
  const selectedEmployees = allEmployees.filter(e => selectedInModal.has(e.id));

  const toggleLeftHighlight = (id: string) => { setHighlightedLeft(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const toggleRightHighlight = (id: string) => { setHighlightedRight(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };
  const moveAllRight = () => { setSelectedInModal(new Set(allEmployees.map(e => e.id))); setHighlightedLeft(new Set()); };
  const moveAllLeft = () => { setSelectedInModal(new Set()); setHighlightedRight(new Set()); };
  const moveSelectedRight = () => { if (highlightedLeft.size > 0) { setSelectedInModal(p => { const n = new Set(p); highlightedLeft.forEach(id => n.add(id)); return n; }); setHighlightedLeft(new Set()); } };
  const moveSelectedLeft = () => { if (highlightedRight.size > 0) { setSelectedInModal(p => { const n = new Set(p); highlightedRight.forEach(id => n.delete(id)); return n; }); setHighlightedRight(new Set()); } };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[700px] animate-in fade-in zoom-in duration-200 border border-slate-200">
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
          <div>
             <h2 className="text-2xl font-bold text-indigo-950 tracking-tight">Access Management</h2>
             <p className="text-sm font-semibold text-indigo-400 mt-1 uppercase tracking-widest">Define which employees can see these deductions.</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-indigo-50 rounded-full transition-all text-slate-300 hover:text-indigo-600 border border-slate-100">
             <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 p-10 grid grid-cols-[1fr,80px,1fr] gap-10 min-h-0 bg-slate-50/30">
          <div className="flex flex-col min-h-0">
            <h3 className="text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-widest">Available Workforce</h3>
            <div className="flex-1 bg-white border border-slate-200 rounded-[24px] flex flex-col min-h-0 shadow-sm overflow-hidden">
              <div className="p-5 bg-slate-50/50 border-b border-slate-100">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Search Names..." value={leftSearch} onChange={(e) => setLeftSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 text-sm font-bold border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-600/10 transition-all bg-white placeholder-slate-300" /></div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">{availableEmployees.map(e => ( <button key={e.id} onClick={() => toggleLeftHighlight(e.id)} className={`w-full flex items-center justify-between px-6 py-4 transition-all text-left group ${highlightedLeft.has(e.id) ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50/50'}`}><span className={`text-sm font-bold ${highlightedLeft.has(e.id) ? 'text-white' : 'text-slate-700'}`}>{e.name}</span></button> ))}</div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-5">
            <button onClick={moveAllRight} className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center bg-white text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm group active:scale-95"><ChevronsRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" /></button>
            <button onClick={moveSelectedRight} className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center bg-white text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm group active:scale-95"><ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-0.5" /></button>
            <button onClick={moveSelectedLeft} className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center bg-white text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm group active:scale-95"><ChevronLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" /></button>
            <button onClick={moveAllLeft} className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center bg-white text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm group active:scale-95"><ChevronsLeft className="w-6 h-6 transition-transform group-hover:-translate-x-0.5" /></button>
          </div>
          <div className="flex flex-col min-h-0">
            <h3 className="text-[11px] font-bold text-slate-400 mb-4 uppercase tracking-widest">Permitted Group</h3>
            <div className="flex-1 bg-white border border-slate-200 rounded-[24px] flex flex-col min-h-0 shadow-sm overflow-hidden">
              <div className="flex-1 overflow-y-auto divide-y divide-slate-50">{selectedEmployees.length > 0 ? selectedEmployees.map(e => ( <button key={e.id} onClick={() => toggleRightHighlight(e.id)} className={`w-full flex items-center justify-between px-6 py-4 transition-all text-left ${highlightedRight.has(e.id) ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50/50'}`}><span className={`text-sm font-bold ${highlightedRight.has(e.id) ? 'text-white' : 'text-slate-700'}`}>{e.name}</span></button> )) : <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-300"><Users className="w-12 h-12 mb-4 opacity-20" /><p className="text-sm font-bold uppercase tracking-widest">No Selection</p></div>}</div>
            </div>
          </div>
        </div>
        <div className="px-10 py-8 border-t border-slate-100 flex justify-end gap-5 bg-white">
          <button onClick={onClose} className="px-8 py-3.5 text-sm font-bold text-slate-400 hover:text-indigo-950 transition-colors uppercase tracking-widest">Cancel</button>
          <button onClick={() => onSave(selectedInModal)} className="px-12 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-xl shadow-indigo-100 active:scale-95 uppercase tracking-widest">Apply Permissions</button>
        </div>
      </div>
    </div>
  );
}

function BulkImportModal({ onClose, onImport }: { onClose: () => void, onImport: (d: any[]) => void }) {
  const [inputText, setInputText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const handleParse = async () => { if (!inputText.trim()) return; setIsParsing(true); try { const results = await parseBulkDeductions(inputText); onImport(results); } catch (e) { alert("Error parsing input."); } finally { setIsParsing(false); } };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo-950/30 backdrop-blur-md p-4 overflow-hidden">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200 border border-slate-200">
        <div className="p-10 pb-6">
           <h3 className="text-2xl font-bold text-indigo-950 tracking-tight">AI Parser</h3>
           <p className="text-sm font-semibold text-indigo-400 mt-1 uppercase tracking-widest">Paste raw plan details to extract objects.</p>
        </div>
        <div className="px-10 py-4 flex-1 overflow-hidden flex flex-col"><textarea className="w-full flex-1 p-6 rounded-[24px] border-2 border-slate-50 bg-slate-50 text-slate-900 focus:ring-2 focus:ring-indigo-600/10 focus:bg-white focus:border-indigo-600 outline-none text-sm shadow-inner resize-none font-bold placeholder-slate-300 transition-all" placeholder="E.G. PLAN: DELTA GOLD PPO, CATEGORY: DENTAL..." value={inputText} onChange={e => setInputText(e.target.value)} /></div>
        <div className="p-10 flex gap-4"><button onClick={onClose} className="flex-1 px-4 py-4 text-sm font-bold text-slate-400 hover:bg-slate-50 rounded-2xl transition-all uppercase tracking-widest">Cancel</button><button onClick={handleParse} disabled={isParsing || inputText.trim().length === 0} className="flex-1 px-4 py-4 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest">{isParsing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}Run Extraction</button></div>
      </div>
    </div>
  );
}

const CATEGORIES = [
  { id: 'MEDICAL', title: 'Medical', desc: 'Health insurance premiums.', icon: Stethoscope, subtypes: ['HMO Plan', 'PPO Plan', 'HDHP Plan', 'EPO Plan'], exampleProvider: "e.g. Aetna or BlueCross", examplePlan: "e.g. Bronze PPO High Deductible" },
  { id: 'DENTAL', title: 'Dental', desc: 'Dental insurance premiums.', icon: Tooth, subtypes: ['Dental HMO', 'Dental PPO', 'Dental Indemnity'], exampleProvider: "e.g. MetLife or Delta Dental", examplePlan: "e.g. Dental Advantage Premier" },
  { id: 'VISION', title: 'Vision', desc: 'Vision insurance premiums.', icon: Eye, subtypes: ['Vision PPO', 'Vision Discount Plan'], exampleProvider: "e.g. VSP or EyeMed", examplePlan: "e.g. Signature Gold Vision" },
  { id: 'RETIREMENT', title: 'Retirement Contribution', desc: '401k/403b contributions.', icon: PiggyBank, subtypes: ['401(k)', 'Roth 401(k)', '403(b)', 'SIMPLE IRA'], exampleProvider: "e.g. Fidelity or Vanguard", examplePlan: "e.g. 401k Employee Pre-Tax" },
  { id: 'BENEFITS', title: 'Tax-Advantaged Benefits', desc: 'FSA, HSA, etc.', icon: CircleDollarSign, subtypes: ['HSA Contribution', 'FSA Medical', 'FSA Dependent Care', 'Commuter Transit'], exampleProvider: "e.g. HealthEquity or Wex", examplePlan: "e.g. Health Savings Account" },
  { id: 'GARNISHMENT', title: 'Garnishment', desc: 'Court ordered withholdings.', icon: Scale, subtypes: ['Child Support', 'Tax Levy', 'Creditor Garnishment'], exampleProvider: "e.g. Department of Revenue", examplePlan: "e.g. Child Support Withholding" },
  { id: 'LOAN', title: 'Loan Repayment', desc: 'Plan or company loans.', icon: Banknote, subtypes: ['401(k) Loan', 'Company Loan', 'Student Loan'], exampleProvider: "e.g. Company Credit Union", examplePlan: "e.g. Relocation Loan Repayment" },
  { id: 'STATUTORY', title: 'Statutory', desc: 'Mandatory state programs.', icon: MapPin, subtypes: ['PFML', 'SUI', 'Disability Insurance'], exampleProvider: "e.g. State Tax Board", examplePlan: "e.g. SUI/SDI Withholding" },
  { id: 'OTHER', title: 'Generic / Other', desc: 'Miscellaneous deductions.', icon: MoreHorizontal, subtypes: ['Life Insurance', 'Gym Membership', 'Dues'], exampleProvider: "e.g. LifeCare or Equinox", examplePlan: "e.g. Basic Group Life Policy" },
];
