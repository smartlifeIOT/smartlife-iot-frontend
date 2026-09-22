import {
  useQuery,
  UseQueryResult,
  UseQueryOptions,
} from '@tanstack/react-query';
import { solutionTemplatesApi } from '../services/solution-templates.api';

// ---- Types matching the API response ----

export interface DeviceTemplate {
  namePattern: string;
  type: string;
  count: number;
  protocol: string;
  telemetryKeys: string[];
  icon?: string;
}

export interface WidgetPreviewItem {
  type: string;
  title: string;
  width: number;
  height: number;
  row: number;
  col: number;
  icon?: string;
  description?: string;
}

export interface DashboardTemplate {
  name: string;
  widgetCount: number;
  widgets?: WidgetPreviewItem[];
  layout?: {
    totalColumns: number;
    estimatedRows: number;
  };
}

export interface RuleChainTemplate {
  name: string;
  nodeCount: number;
  connectionCount: number;
}

export interface AlarmTemplate {
  name: string;
  severity: 'critical' | 'warning' | 'error' | 'info' | string;
  condition: string;
  deviceSelector?: string;
  icon?: string;
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

export interface TemplatePreviewResponse {
  success: boolean;
  data: TemplatePreviewData;
  timestamp: string;
}

// query key factory keeps invalidation/refetch calls consistent
// e.g. queryClient.invalidateQueries({ queryKey: templatePreviewKeys.detail(id) })
export const templatePreviewKeys = {
  all: ['templatePreview'] as const,
  detail: (templateId: string | number) =>
    [...templatePreviewKeys.all, templateId] as const,
};

export function useTemplatePreview(
  templateId: string | number | undefined
  //   options?: Omit<
  //     UseQueryOptions<TemplatePreviewData, Error>,
  //     'queryKey' | 'queryFn'
  //   >
): UseQueryResult<TemplatePreviewData, Error> {
  return useQuery<TemplatePreviewData, Error>({
    queryKey: templatePreviewKeys.detail(templateId ?? ''),
    queryFn: async () => {
      const response = await solutionTemplatesApi.getSolutionTemplatePreview(
        templateId ?? ''
      );
      // Assuming API returns { data: TemplatePreviewData }
      return response.data.data as TemplatePreviewData;
    },
    enabled: Boolean(templateId),
  });
}
