export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

export interface SubscriptionFeatures {
  userRoles: boolean;
  alerts: boolean;
  integration: boolean;
  edge: boolean;
  solutionDashboards: boolean;
  assetProfiles: boolean;
  deviceProfiles: boolean;
  subscription: boolean;
  resources: boolean;
  overview: boolean;
  profiles: boolean;
  assets: boolean;
  devices: boolean;
  apiAccess: boolean;
  auditLogs: boolean;
  dashboards: boolean;
  floorPlans: boolean;
  whiteLabel: boolean;
  automations: boolean;
  smsNotifications: boolean;
  solutionTemplates: boolean;
  settings: boolean;
  usersManagement: boolean;
  alarms: boolean;
  analytics: boolean;
  reports: boolean;
  edgeManagement: boolean;
  widgets: boolean;
  imageLibrary: boolean;
  scriptLibrary: boolean;
  scheduleManagement: boolean;
  floorMapCreate: boolean;
  floorMapSettings: boolean;
  floorMapHistory: boolean;
  widgetEditor: boolean;
  assetDetails: boolean;
  assetProfileDetails: boolean;
  deviceProfileDetails: boolean;
  emailVerification: boolean;
  customerUserAssociation: boolean;
  editRole: boolean;
  customerAdministrator: boolean;
  rolePermissionManagement: boolean;
  assignPermissions: boolean;
  createCustomer: boolean;
  profileSettings: boolean;
  companyProfile: boolean;
  createRole: boolean;
  customer: boolean;
  customerDetails: boolean;
  editCustomer: boolean;
  notifications: boolean;
  sharingCenter: boolean;
  integrations: boolean;
}

export interface AppState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;

  // Features
  features: SubscriptionFeatures | null;
  setFeatures: (features: SubscriptionFeatures | null) => void;

  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Loading States
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Modal State
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}
