import { UserRole } from '@/services/api/users.api';

export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
}

export enum CustomerPlan {
  BASIC = 'Basic',
  STANDARD = 'Standard',
  PREMIUM = 'Premium',
  ENTERPRISE = 'Enterprise',
}

export interface Customer {
  zip: string;
  state: string;
  phone: string;
  id: string;
  name: string;
  email: string;

  phoneNumber: string;
  address?: string;
  address2?: string;
  description?: string;
  role?: UserRole;
  companyName?: string;
  city?: string;
  stateProvince?: string;
  zipPostalCode?: string;
  country: string;
  status: CustomerStatus;
  maxUsers: number;
  plan: CustomerPlan;
  features: string[];
  allocatedLimits?: {
    devices: number;
    dashboards: number;
    assets: number;
    floorPlans: number;
    automations: number;
    users: number;
  };
  usageCounters?: {
    devices?: number;
    dashboards?: number;
    assets?: number;
    floorPlans?: number;
    automations?: number;
    users?: number;
  };
  tenantId?: string;
  tenant?: {
    id: string;
    name: string;
    email?: string;
    phone?: string | null;
    status?: string;
    configuration?: Record<string, unknown>;
  } | null;
  additionalInfo?: {
    notes?: string;
    taxId?: string;
    slaLevel?: string;
    billingCycle?: string;
    contractType?: string;
    customerType?: string;
    paymentTerms?: string;
    annualRevenue?: string;
    employeeCount?: string;
    priorityLevel?: string;
    accountManager?: string;
    contractEndDate?: string;
    industrySegment?: string;
    contractStartDate?: string;
    preferredLanguage?: string;
    commercialRegistration?: string;
    [key: string]: unknown;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  description?: string;
  city?: string;
  address?: string;

  state?: string;
  zip?: string;
  country: string;
  allocatedLimits: {
    devices: number;
    dashboards: number;
    assets: number;
    floorPlans: number;
    automations: number;
    users: number;
  };
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  id: string;
}

export interface CustomerQuery {
  search?: string;
  status?: CustomerStatus;
  plan?: CustomerPlan;
  tenantId?: string;
  page?: number;
  limit?: number;
}
