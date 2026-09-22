import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import type { Layout } from 'react-grid-layout';
import {
  WidgetCanvas,
  Widget,
} from '@/components/common/WidgetCanvas/WidgetCanvas';
import { useTemplatePreview } from '../hooks/useSolutionTemplatePrevies';
import WarningMessage from '@/components/ui/WarningMessage';
import { useTempInstallation } from '../hooks/useTempInstallation';

export default function TemplatePreviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: templateId } = useParams<{ id: string }>();
  const installTemp = useTempInstallation();
  const { data, isLoading, isError } = useTemplatePreview(templateId);

  const handleCancel = () => {
    navigate('/solution-templates');
  };

  const handleActivate = (id: string, installationName: string) => {
    installTemp.mutate({ id, installationName });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
        <div className="h-[600px] bg-gray-200 dark:bg-gray-800 rounded-xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
          Failed to load template preview
        </h2>
        <p className="text-sm text-gray-500">
          The requested solution template could not be loaded or does not exist.
        </p>
        <Button onClick={handleCancel} variant="outline" className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Templates
        </Button>
      </div>
    );
  }

  const {
    templateName,
    alreadyInstalled,
    canInstall,
    quotaWarnings: warning = [],
    willCreate,
  } = data;

  const dashboard = willCreate?.dashboards?.[0];
  const templateWidgets = dashboard?.widgets || [];

  // Map API widgets into WidgetCanvas Widget items with WidgetRenderer styles
  const mappedWidgets: Widget[] = templateWidgets.map((w, idx) => {
    // Convert preview widget type to WidgetRenderer classification alias
    const alias =
      w.type === 'map'
        ? 'device-map'
        : w.type === 'timeseries'
          ? 'line-chart'
          : w.type === 'gauge'
            ? 'analog-gauge'
            : w.type === 'alarm-widget' || w.type === 'alarm'
              ? 'alarms-table'
              : w.type;

    return {
      id: `preview-widget-${idx}`,
      type: alias,
      title: w.title,
      description: w.description,
      position: {
        x: w.col ?? (idx * 4) % 12,
        y: w.row ?? Math.floor((idx * 4) / 12) * 4,
        w: w.width ?? 6,
        h: w.height ?? 4,
      },
      dataSource: {
        deviceIds: ['preview-device-1'],
        deviceName: 'Smart City Node 001',
        telemetryKeys:
          w.type === 'gauge'
            ? ['fill_level']
            : w.type === 'timeseries'
              ? ['aqi', 'pm25']
              : ['temperature', 'humidity', 'status'],
        timeRange: '24h',
      },
      visualization: {
        chartType: alias,
        colors: ['#3b82f6', '#10b981'],
        showLegend: true,
      },
      config: {
        chartType: alias,
        showLegend: true,
      },
    };
  });

  const mappedLayout: Layout[] = mappedWidgets.map((w) => ({
    i: w.id,
    x: w.position?.x ?? 0,
    y: w.position?.y ?? 0,
    w: w.position?.w ?? 6,
    h: w.position?.h ?? 4,
  }));

  return (
    <div className="space-y-6 pb-8">
      {/* Navigation & Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {t('solutionTemplates.templatePreview.back', 'Back to Templates')}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {alreadyInstalled ? (
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 font-semibold px-3 py-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Installed
            </Badge>
          ) : canInstall ? (
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 font-semibold px-3 py-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Ready to Install
            </Badge>
          ) : (
            <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 font-semibold px-3 py-1">
              Quota Limit Reached
            </Badge>
          )}
        </div>
      </div>

      {/* Header Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {t('solutionTemplates.templatePreview.title', 'Template Preview')} -{' '}
            {templateName}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {dashboard?.name?.replace('{installName}', templateName) ||
              `${templateName} Dashboard`}{' '}
            • {mappedWidgets.length} Visualizer Widgets
          </p>
        </div>
      </div>

      {/* Quota Warning Message */}
      {!!warning?.length && (
        <WarningMessage className="my-2">
          {warning.map((val, i) => (
            <p key={i} className="text-sm font-medium">
              {i + 1}. {val}
            </p>
          ))}
        </WarningMessage>
      )}

      {/* Main Dashboard Preview Board with WidgetRenderer Styles */}
      <Card className="shadow-lg rounded-xl border border-secondary/60 dark:border-gray-800 p-4">
        <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-lg p-2 min-h-[600px]">
          <WidgetCanvas
            initialWidgets={mappedWidgets}
            initialLayout={mappedLayout}
            readOnly={true}
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={handleCancel}
          className="px-6 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700 dark:bg-gray-800 dark:text-gray-300"
        >
          {/* working now */}
          {t('solutionTemplates.templatePreview.cancel', 'Cancel')}
        </Button>
        <Button
          type="button"
          disabled={!canInstall || alreadyInstalled}
          onClick={() => handleActivate(templateId!, templateName)}
          className="bg-gray-900 hover:bg-gray-800 text-white rounded-md px-6 dark:bg-primary dark:hover:bg-primary/90"
        >
          {alreadyInstalled
            ? 'Already Installed'
            : t(
                'solutionTemplates.templatePreview.activateTemplate',
                'Activate Template'
              )}
        </Button>
      </div>
    </div>
  );
}
