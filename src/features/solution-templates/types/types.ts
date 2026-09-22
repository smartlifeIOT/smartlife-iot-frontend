export interface DeviceTemplate {
  namePattern: string;
  type: string;
  count: number;
  protocol: string;
  telemetryKeys: string[];
}

export interface DashboardTemplate {
  name: string;
  widgetCount: number;
}

export interface RuleChainTemplate {
  name: string;
  nodeCount: number;
  connectionCount: number;
}

export interface AlarmTemplate {
  name: string;
  severity: 'critical' | 'warning' | 'info' | string;
  condition: string;
}

export interface TemplateSummary {
  totalDevices: number;
  totalDashboards: number;
  totalRuleChains: number;
  totalAlarms: number;
}

export interface WillCreate {
  devices: DeviceTemplate[];
  dashboards: DashboardTemplate[];
  ruleChains: RuleChainTemplate[];
  alarms: AlarmTemplate[];
  summary: TemplateSummary;
}

export interface TemplatePreviewData {
  templateId: string;
  templateName: string;
  category: string;
  hasConfiguration: boolean;
  alreadyInstalled: boolean;
  installationId: string | null;
  canInstall: boolean;
  quotaWarnings: string[];
  willCreate: WillCreate;
}

export interface TemplateConfiguration {
  devices?: any[];
  dashboards?: any[];
  rules?: any[];
  assets?: any[];
}

export enum TemplateCategory {
  SMART_HOME = 'smart_home',
  AGRICULTURE = 'agriculture',
  SMART_CITY = 'smart_city',
  HEALTHCARE = 'healthcare',
  ENERGY = 'energy',
  TRANSPORTATION = 'transportation',
  RETAIL = 'retail',
  SMART_FACTORY = 'smart_factory',
  SMART_BUILDING = 'smart_building',
  LOGISTICS = 'logistics',
  WATER = 'water',
  CLIMATE = 'climate',
  EDUCATION = 'education',
}

export interface SolutionTemplate {
  id: string;
  name: string;
  title: string;
  description?: string;
  category: TemplateCategory;
  tags?: string[];
  configuration: TemplateConfiguration;
  thumbnail?: string;
  isPublic: boolean;
  installCount: number;
  rating?: number;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateQuery {
  search?: string;
  category?: TemplateCategory;
  tags?: string[];
  isPublic?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}
