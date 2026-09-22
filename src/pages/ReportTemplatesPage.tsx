import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Save,
  Clock,
  Eye,
  Sparkles,
  Download,
  BookOpen,
  Video,
  MessageCircle,
  FileQuestion,
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  subtitle: string;
  visual: 'bars' | 'rectangles' | 'circles' | 'buttons';
  colors: string[];
}

const reportTemplates: ReportTemplate[] = [
  {
    id: 'floor-map',
    title: 'Floor Map Overview',
    subtitle: 'Device Status Report',
    description: 'Building overview with device status',
    visual: 'rectangles',
    colors: ['bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-blue-500'],
  },
  {
    id: 'device-analytics',
    title: 'Device Analytics',
    subtitle: 'Performance Metrics',
    description: 'Detailed device analytics and trends',
    visual: 'bars',
    colors: ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-cyan-400'],
  },
  {
    id: 'alert-summary',
    title: 'Alert Summary',
    subtitle: 'Alert History',
    description: 'Historical alert data and trends',
    visual: 'circles',
    colors: ['bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-purple-500'],
  },
  {
    id: 'asset-hierarchy',
    title: 'Asset Hierarchy',
    subtitle: 'Asset Structure',
    description: 'Complete building and room structure',
    visual: 'rectangles',
    colors: ['bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-blue-500'],
  },
  {
    id: 'custom-report',
    title: 'Custom Report',
    subtitle: 'Custom Layout',
    description: 'Build your own custom report',
    visual: 'rectangles',
    colors: ['bg-purple-500', 'bg-green-500', 'bg-red-500', 'bg-blue-500'],
  },
  {
    id: 'maintenance',
    title: 'Maintenance Schedule',
    subtitle: 'Maintenance Report',
    description: 'Device maintenance schedules and history',
    visual: 'circles',
    colors: ['bg-green-500', 'bg-blue-500', 'bg-red-500', 'bg-purple-500'],
  },
];

const VisualPreview = ({
  type,
  colors,
}: {
  type: 'bars' | 'rectangles' | 'circles' | 'buttons';
  colors: string[];
}) => {
  if (type === 'bars') {
    return (
      <div className="flex items-end gap-1 h-12">
        <div
          className={`${colors[0]} w-10 rounded-t`}
          style={{ height: '60%' }}
        />
        <div
          className={`${colors[1]} w-10 rounded-t`}
          style={{ height: '90%' }}
        />
        <div
          className={`${colors[2]} w-10 rounded-t`}
          style={{ height: '40%' }}
        />
        <div
          className={`${colors[3]} w-10 rounded-t`}
          style={{ height: '75%' }}
        />
      </div>
    );
  }

  if (type === 'rectangles') {
    return (
      <div className="flex gap-1 h-12">
        {colors.map((color, idx) => (
          <div key={idx} className={`${color} flex-1 rounded`} />
        ))}
      </div>
    );
  }

  if (type === 'circles') {
    return (
      <div className="flex gap-2 h-12 items-center">
        {colors.map((color, idx) => (
          <div key={idx} className={`${color} w-8 h-8 rounded-full`} />
        ))}
      </div>
    );
  }

  return null;
};

const QuickActionButton = ({
  label,
  icon: Icon,
  color,
  onClick,
}: {
  label: string | React.ReactNode;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`${color} text-white px-3 py-2 rounded text-xs font-medium hover:opacity-90 transition-opacity`}
  >
    <div className="flex flex-col items-center gap-1">
      {/* <Icon className="h-4 w-4" /> */}
      <span>{label}</span>
    </div>
  </button>
);

export default function ReportTemplatesPage() {
  const navigate = useNavigate();

  const handleUseTemplate = (templateId: string) => {
    // Navigate to template editor or preview
    console.log('Use template:', templateId);
  };

  const recentExports = [
    { name: 'Floor_Map_Summary_2024-07-01.pdf', date: '2024-07-01' },
    { name: 'Device_Analytics_2024-06-28.xlsx', date: '2024-06-28' },
    { name: 'Alert_History_2024-06-25.csv', date: '2024-06-25' },
    { name: 'Asset_Report_2024-06-20.json', date: '2024-06-20' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Report Templates"
        actions={[
          {
            label: 'Back',
            onClick: () => navigate('/analytics'),
          },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Report Template Cards */}
        {reportTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col overflow-hidden">
            <CardHeader className="bg-gray-900 text-white py-3">
              <CardTitle className="text-sm text-white font-semibold">
                {template.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4">
              <div className="mb-3">
                <VisualPreview
                  type={template.visual}
                  colors={template.colors}
                />
              </div>
              <div className="flex-1 space-y-1 mb-4">
                <p className="text-sm font-medium text-gray-900">
                  {template.subtitle}
                </p>
                <p className="text-xs text-gray-600">{template.description}</p>
                {template.id === 'alert-summary' && (
                  <p className="text-xs text-gray-600 mt-2">
                    Critical: 2 | Warning: 5 | Info: 12
                  </p>
                )}
              </div>
              <Button
                onClick={() => handleUseTemplate(template.id)}
                className="  w-32 bg-gray-900 hover:bg-gray-800 text-white"
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Quick Actions Card */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="bg-gray-900 text-white py-3">
            <CardTitle className="text-sm text-white font-semibold">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionButton
                label="Save Template"
                icon={Save}
                color="bg-purple-600"
                onClick={() => console.log('Save Template')}
              />
              <QuickActionButton
                label="Schedule Report"
                icon={Clock}
                color="bg-green-600"
                onClick={() => console.log('Schedule Report')}
              />
              <QuickActionButton
                label="Preview"
                icon={Eye}
                color="bg-red-600"
                onClick={() => console.log('Preview')}
              />
              <QuickActionButton
                label="Clear AI"
                icon={Sparkles}
                color="bg-blue-600"
                onClick={() => console.log('Clear AI')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Exports Card */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="bg-gray-900 text-white py-3">
            <CardTitle className="text-sm font-semibold text-white">
              Recent Exports
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <div className="space-y-3">
              {recentExports.map((exportItem, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs text-gray-700 hover:bg-gray-50 p-2 rounded cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{exportItem.name}</span>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {exportItem.date}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Help and Support Card */}
        <Card className="flex flex-col overflow-hidden">
          <CardHeader className="bg-gray-900 text-white py-3">
            <CardTitle className="text-sm font-semibold text-white">
              Help and Support
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-4">
            <div className="grid grid-cols-2 gap-2">
              <QuickActionButton
                label="User Guide"
                icon={BookOpen}
                color="bg-purple-600"
                onClick={() => console.log('User Guide')}
              />
              <QuickActionButton
                label="Video Tutorial"
                icon={Video}
                color="bg-green-600"
                onClick={() => console.log('Video Tutorial')}
              />
              <QuickActionButton
                label="Contact Support"
                icon={MessageCircle}
                color="bg-red-600"
                onClick={() => console.log('Contact Support')}
              />
              <QuickActionButton
                label="FAQ"
                icon={FileQuestion}
                color="bg-blue-600"
                onClick={() => console.log('FAQ')}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
