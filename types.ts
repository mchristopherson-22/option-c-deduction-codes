export enum DeductionCategory {
  GARNISHMENT = 'Garnishment / Court Order',
  LOAN = 'Loan Repayment',
  RETIREMENT = 'Retirement Contribution',
  MEDICAL = 'Medical',
  DENTAL = 'Dental',
  VISION = 'Vision',
  BENEFITS = 'Tax-Advantaged Benefits',
  STATUTORY = 'State Program / Statutory',
  OTHER = 'Generic / Other'
}

export enum DeductionStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending'
}

export interface Deduction {
  id: string;
  planName: string;
  providerName: string;
  category: string;
  subtype: string;
  payrollCode: string;
  status: DeductionStatus;
  isPreTax: boolean;
  createdAt: string;
  employeeCount: number;
}

export interface EnrollmentDetail {
  name: string;
  type: string;
  frequency: string;
  startDate: string;
  endDate: string;
  employeeAmount: string;
  employerAmount: string;
  isSynced?: boolean;
  lastSynced: string;
}

export interface EmployeeDemographics {
  email: string;
  phone: string;
  department: string;
  hireDate: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  dob: string;
  sex: string;
  ssnLast4: string;
}

export interface Employee {
  id: string;
  name: string;
  demographics: EmployeeDemographics;
  enrollments: EnrollmentDetail[];
}