import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Plus,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Sparkles,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AutomationDialog } from '@/features/automation/AutomationDialog';
import { Automation } from '@/features/automation/types';
import { useCreateAutomation } from '@/features/automation/hooks/useAutomation';
import toast from 'react-hot-toast';

export interface AutomationTemplateItem {
  id: string;
  category: string;
  title: string;
  description: string;
  usedCount: number;
  devicesRequired: string;
  tags: {
    primary: { label: string; bg?: string };
    secondary: { label: string; bg?: string };
  };
  useCase: string;
  defaultAutomation: Partial<Automation>;
}

const DEFAULT_TEMPLATES: AutomationTemplateItem[] = [
  {
    id: 'temp-ac-control',
    category: 'Temperature Control',
    title: 'Auto AC Control',
    description:
      'Turn on/off AC based on room temperature and occupancy detection',
    usedCount: 1234,
    devicesRequired: 'Temperature sensor, AC controller',
    useCase: 'HVAC',
    tags: {
      primary: { label: 'HVAC' },
      secondary: { label: 'Climate' },
    },
    defaultAutomation: {
      name: 'Auto AC Control Rule',
      description:
        'Automatically regulates room climate based on temperature sensors and AC unit controls.',
      enabled: true,
      status: 'active',
      trigger: {
        type: 'threshold',
        telemetryKey: 'temperature',
        operator: 'gte',
        value: 26,
        debounce: 60,
      },
      actions: [
        {
          id: '1',
          type: 'control',
          command: 'setPower',
          value: true,
          priority: 'high',
          delay: 0,
        },
      ],
      tags: ['HVAC', 'Climate', 'Template'],
    },
  },
  {
    id: 'security-motion-alert',
    category: 'Security Alert',
    title: 'Motion Detection Alert',
    description:
      'Send notifications when motion is detected after business hours',
    usedCount: 1234,
    devicesRequired: 'Motion sensor, Siren controller',
    useCase: 'Security',
    tags: {
      primary: { label: 'Security' },
      secondary: { label: 'Alert' },
    },
    defaultAutomation: {
      name: 'After-Hours Motion Alert',
      description:
        'Triggers instant push notification and siren when motion is detected.',
      enabled: true,
      status: 'active',
      trigger: {
        type: 'threshold',
        telemetryKey: 'motion',
        operator: 'eq',
        value: 1,
        debounce: 30,
      },
      actions: [
        {
          id: '1',
          type: 'notification',
          message: 'Motion detected after hours in zone 1',
          priority: 'high',
          channel: 'push',
          delay: 0,
        },
      ],
      tags: ['Security', 'Alert', 'Template'],
    },
  },
  {
    id: 'lighting-occupancy',
    category: 'Smart Lighting',
    title: 'Occupancy-Based Lighting',
    description: 'Auto turn on/off lights based on occupancy and time of day',
    usedCount: 3891,
    devicesRequired: 'Motion sensor, Smart lights',
    useCase: 'Lighting',
    tags: {
      primary: { label: 'Lighting' },
      secondary: { label: 'Climate' },
    },
    defaultAutomation: {
      name: 'Occupancy Lighting Automation',
      description:
        'Activates smart lights upon entering the room and turns them off after inactivity.',
      enabled: true,
      status: 'active',
      trigger: {
        type: 'threshold',
        telemetryKey: 'occupancy',
        operator: 'eq',
        value: 1,
        debounce: 10,
      },
      actions: [
        {
          id: '1',
          type: 'control',
          command: 'setBrightness',
          value: 80,
          priority: 'medium',
          delay: 0,
        },
      ],
      tags: ['Lighting', 'Climate', 'Template'],
    },
  },
  {
    id: 'water-management-leak',
    category: 'Water Management',
    title: 'Leak & Flood Prevention',
    description:
      'Instantly shut off main water valve and notify maintenance when a leak is detected',
    usedCount: 1234,
    devicesRequired: 'Water leak sensor, Smart valve',
    useCase: 'Water',
    tags: {
      primary: { label: 'Water' },
      secondary: { label: 'Emergency' },
    },
    defaultAutomation: {
      name: 'Emergency Water Shutoff',
      description:
        'Automatically closes water valve upon leak detection to prevent flooding.',
      enabled: true,
      status: 'active',
      trigger: {
        type: 'threshold',
        telemetryKey: 'water_leak',
        operator: 'eq',
        value: 1,
        debounce: 0,
      },
      actions: [
        {
          id: '1',
          type: 'control',
          command: 'closeValve',
          value: true,
          priority: 'high',
          delay: 0,
        },
      ],
      tags: ['Water', 'Emergency', 'Template'],
    },
  },
  {
    id: 'energy-peak-shedding',
    category: 'Energy Optimization',
    title: 'Peak Load Energy Shedding',
    description:
      'Automatically cycle non-essential high-consumption appliances during peak tariff hours',
    usedCount: 1234,
    devicesRequired: 'Smart energy meter, High-load relays',
    useCase: 'Energy',
    tags: {
      primary: { label: 'Energy' },
      secondary: { label: 'Optimize' },
    },
    defaultAutomation: {
      name: 'Peak Load Power Saver',
      description:
        'Reduces energy usage during peak hours by controlling heavy loads.',
      enabled: true,
      status: 'active',
      trigger: {
        type: 'threshold',
        telemetryKey: 'power_consumption',
        operator: 'gte',
        value: 4500,
        debounce: 120,
      },
      actions: [
        {
          id: '1',
          type: 'control',
          command: 'setEcoMode',
          value: true,
          priority: 'medium',
          delay: 0,
        },
      ],
      tags: ['Energy', 'Optimize', 'Template'],
    },
  },
  {
    id: 'maintenance-filter-reminder',
    category: 'Maintenance Alert',
    title: 'Predictive Filter Replacement',
    description:
      'Track runtime hours & differential pressure to schedule maintenance before breakdown',
    usedCount: 3891,
    devicesRequired: 'Differential pressure sensor, HVAC hub',
    useCase: 'Maintenance',
    tags: {
      primary: { label: 'Maintenance' },
      secondary: { label: 'Monitor' },
    },
    defaultAutomation: {
      name: 'Filter Maintenance Scheduler',
      description:
        'Alerts facility manager when pressure drop exceeds acceptable threshold.',
      enabled: true,
      status: 'active',
      trigger: {
        type: 'threshold',
        telemetryKey: 'pressure_drop',
        operator: 'gte',
        value: 250,
        debounce: 300,
      },
      actions: [
        {
          id: '1',
          type: 'notification',
          message:
            'HVAC air filter replacement required due to high pressure drop.',
          priority: 'medium',
          channel: 'email',
          delay: 0,
        },
      ],
      tags: ['Maintenance', 'Monitor', 'Template'],
    },
  },
  {
    id: 'temp-cold-storage',
    category: 'Temperature Control',
    title: 'Cold Storage Safe Zone',
    description:
      'Maintain strict food and vaccine refrigeration limits with multi-tier alerts',
    usedCount: 2450,
    devicesRequired: 'Freezer temperature probe, Alarm beacon',
    useCase: 'HVAC',
    tags: {
      primary: { label: 'HVAC' },
      secondary: { label: 'Climate' },
    },
    defaultAutomation: {
      name: 'Cold Storage Temperature Guard',
      description:
        'Monitors pharmaceutical or food refrigeration units for temperature excursions.',
      enabled: true,
      status: 'active',
      trigger: {
        type: 'threshold',
        telemetryKey: 'temperature',
        operator: 'gte',
        value: 4,
        debounce: 60,
      },
      actions: [
        {
          id: '1',
          type: 'notification',
          message: 'Cold storage unit temperature rose above safe threshold!',
          priority: 'high',
          channel: 'push',
          delay: 0,
        },
      ],
      tags: ['HVAC', 'Climate', 'Template'],
    },
  },
  {
    id: 'security-perimeter',
    category: 'Security Alert',
    title: 'Perimeter Door Breach Alert',
    description:
      'Immediate alarm and security team notification if exterior doors open unauthenticated',
    usedCount: 1890,
    devicesRequired: 'Door sensor, Access keypad',
    useCase: 'Security',
    tags: {
      primary: { label: 'Security' },
      secondary: { label: 'Alert' },
    },
    defaultAutomation: {
      name: 'Perimeter Door Security Rule',
      description:
        'Monitors perimeter door contacts and verifies authorization state.',
      enabled: true,
      status: 'active',
      trigger: {
        type: 'threshold',
        telemetryKey: 'door_open',
        operator: 'eq',
        value: 1,
        debounce: 5,
      },
      actions: [
        {
          id: '1',
          type: 'notification',
          message: 'Perimeter door opened without authorization.',
          priority: 'high',
          channel: 'push',
          delay: 0,
        },
      ],
      tags: ['Security', 'Alert', 'Template'],
    },
  },
  {
    id: 'lighting-circadian',
    category: 'Smart Lighting',
    title: 'Circadian Rhythm Sync',
    description:
      'Adjust light color temperature and intensity automatically across day and night',
    usedCount: 2780,
    devicesRequired: 'Tunable White LED, Ambient sensor',
    useCase: 'Lighting',
    tags: {
      primary: { label: 'Lighting' },
      secondary: { label: 'Optimize' },
    },
    defaultAutomation: {
      name: 'Circadian Rhythm Daylight Follower',
      description:
        'Synchronizes indoor color temperature with external solar progression.',
      enabled: true,
      status: 'active',
      trigger: {
        type: 'schedule',
        schedule: '0 8 * * 1-5',
      },
      actions: [
        {
          id: '1',
          type: 'control',
          command: 'setColorTemp',
          value: 4000,
          priority: 'low',
          delay: 0,
        },
      ],
      tags: ['Lighting', 'Optimize', 'Template'],
    },
  },
];

const CATEGORIES = [
  'All Categories',
  'Temperature Control',
  'Security Alert',
  'Smart Lighting',
  'Water Management',
  'Energy Optimization',
  'Maintenance Alert',
];

const USE_CASES = [
  'All Use Cases',
  'HVAC',
  'Security',
  'Lighting',
  'Water',
  'Energy',
  'Maintenance',
];

const SORT_OPTIONS = [
  { value: 'popular', label: 'Popular' },
  { value: 'used-desc', label: 'Most Used' },
  { value: 'newest', label: 'Newest' },
  { value: 'name-asc', label: 'Name (A-Z)' },
];

export default function AutomationTemplatesPage() {
  const { t } = useTranslation();
  const createAutomation = useCreateAutomation();

  const [templates, setTemplates] =
    useState<AutomationTemplateItem[]>(DEFAULT_TEMPLATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedUseCase, setSelectedUseCase] = useState('All Use Cases');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Template creation dialog state
  const [isCreateTemplateOpen, setIsCreateTemplateOpen] = useState(false);
  const [newTemplateCategory, setNewTemplateCategory] = useState(
    'Temperature Control'
  );
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateDevices, setNewTemplateDevices] = useState('');
  const [newTemplatePrimaryTag, setNewTemplatePrimaryTag] = useState('');
  const [newTemplateSecondaryTag, setNewTemplateSecondaryTag] = useState('');

  // Automation dialog state for "Use Template"
  const [isAutomationDialogOpen, setIsAutomationDialogOpen] = useState(false);
  const [activeTemplateData, setActiveTemplateData] =
    useState<Automation | null>(null);

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    return templates
      .filter((item) => {
        const matchesSearch =
          !searchQuery.trim() ||
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.devicesRequired
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesCategory =
          selectedCategory === 'All Categories' ||
          item.category === selectedCategory;

        const matchesUseCase =
          selectedUseCase === 'All Use Cases' ||
          item.useCase.toLowerCase() === selectedUseCase.toLowerCase() ||
          item.tags.primary.label.toLowerCase() ===
            selectedUseCase.toLowerCase() ||
          item.tags.secondary.label.toLowerCase() ===
            selectedUseCase.toLowerCase();

        return matchesSearch && matchesCategory && matchesUseCase;
      })
      .sort((a, b) => {
        if (selectedSort === 'popular' || selectedSort === 'used-desc') {
          return b.usedCount - a.usedCount;
        }
        if (selectedSort === 'name-asc') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [templates, searchQuery, selectedCategory, selectedUseCase, selectedSort]);

  // Pagination calculation
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTemplates.length / itemsPerPage)
  );
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTemplates.slice(start, start + itemsPerPage);
  }, [filteredTemplates, currentPage, itemsPerPage]);

  const handleUseTemplate = (template: AutomationTemplateItem) => {
    const initialAutomationData: any = {
      id: '',
      name: template.defaultAutomation.name || template.title,
      description:
        template.defaultAutomation.description || template.description,
      enabled: template.defaultAutomation.enabled ?? true,
      status: template.defaultAutomation.status || 'active',
      trigger: template.defaultAutomation.trigger || {
        type: 'threshold',
        deviceId: '',
        telemetryKey: '',
        operator: 'gte',
        value: 0,
      },
      actions: template.defaultAutomation.actions || [
        {
          id: '1',
          type: 'control',
          deviceId: '',
          command: 'setPower',
          value: true,
          priority: 'high',
          delay: 0,
        },
      ],
      execution: {
        sequence: true,
        parallel: false,
        stopOnError: false,
        retryCount: 3,
      },
      settings: {
        cooldown: 300,
        maxExecutionsPerDay: 10,
        activeHours: { start: '08:00', end: '18:00' },
        activeDays: [1, 2, 3, 4, 5],
        retryOnFailure: true,
        maxRetries: 3,
      },
      tags: template.defaultAutomation.tags || [
        template.tags.primary.label,
        template.tags.secondary.label,
      ],
    };

    setActiveTemplateData(initialAutomationData);
    setIsAutomationDialogOpen(true);
  };

  const handleAutomationSubmit = (data: Partial<Automation>) => {
    createAutomation.mutate(data as any, {
      onSuccess: () => {
        setIsAutomationDialogOpen(false);
        setActiveTemplateData(null);
        toast.success(
          t(
            'automation.createdFromTemplate',
            'Automation rule created from template successfully!'
          )
        );
      },
      onError: (err: any) => {
        console.error(err);
        toast.error(
          t('automation.createError', 'Failed to create automation rule')
        );
      },
    });
  };

  const handleSaveCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateTitle.trim()) {
      toast.error('Please provide a template title');
      return;
    }

    const customItem: AutomationTemplateItem = {
      id: `custom-${Date.now()}`,
      category: newTemplateCategory,
      title: newTemplateTitle.trim(),
      description:
        newTemplateDescription.trim() || 'Custom IoT automation template rule.',
      usedCount: 1,
      devicesRequired: newTemplateDevices.trim() || 'Custom Device',
      useCase: newTemplatePrimaryTag || 'Custom',
      tags: {
        primary: { label: newTemplatePrimaryTag || 'Custom' },
        secondary: { label: newTemplateSecondaryTag || 'Automation' },
      },
      defaultAutomation: {
        name: newTemplateTitle.trim(),
        description: newTemplateDescription.trim(),
        enabled: true,
        status: 'active',
        trigger: {
          type: 'threshold',
          telemetryKey: '',
          operator: 'gte',
          value: 0,
        },
        actions: [
          {
            id: '1',
            type: 'control',
            command: 'execute',
            priority: 'high',
            delay: 0,
          },
        ],
        tags: [
          newTemplatePrimaryTag || 'Custom',
          newTemplateSecondaryTag || 'Automation',
        ],
      },
    };

    setTemplates((prev) => [customItem, ...prev]);
    setIsCreateTemplateOpen(false);
    setNewTemplateTitle('');
    setNewTemplateDescription('');
    setNewTemplateDevices('');
    setNewTemplatePrimaryTag('');
    setNewTemplateSecondaryTag('');
    toast.success('New automation template created successfully!');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Automation Templates
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pre-built automation rules for common IoT use cases
        </p>
      </div>

      {/* Filter and Controls Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[240px] max-w-[280px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg text-sm focus-visible:ring-1"
            />
          </div>

          {/* Category Select */}
          <Select
            value={selectedCategory}
            onValueChange={(val) => {
              setSelectedCategory(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[170px] h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Use Case Select */}
          <Select
            value={selectedUseCase}
            onValueChange={(val) => {
              setSelectedUseCase(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[150px] h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium">
              <SelectValue placeholder="All Use Cases" />
            </SelectTrigger>
            <SelectContent>
              {USE_CASES.map((uc) => (
                <SelectItem key={uc} value={uc} className="text-xs">
                  {uc}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Select */}
          <Select
            value={selectedSort}
            onValueChange={(val) => {
              setSelectedSort(val);
            }}
          >
            <SelectTrigger className="w-[130px] h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium">
              <SelectValue placeholder="Popular" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((sort) => (
                <SelectItem
                  key={sort.value}
                  value={sort.value}
                  className="text-xs"
                >
                  {sort.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Create Template CTA */}
        <div>
          <Button
            onClick={() => setIsCreateTemplateOpen(true)}
            className="bg-[#1c1c24] hover:bg-black text-white px-5 h-10 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Template
          </Button>
        </div>
      </div>

      {/* Cards Grid */}
      {paginatedTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Card Header Banner */}
              <div className="bg-[#483783] text-white px-6 py-4">
                <h3 className="font-bold text-base tracking-wide text-white">
                  {template.category}
                </h3>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {template.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px]">
                    {template.description}
                  </p>
                </div>

                {/* Metadata / Stats */}
                <div className="space-y-1 pt-1">
                  <p className="text-xs font-bold text-[#1d70b8] dark:text-blue-400">
                    Used: {template.usedCount.toLocaleString()} times
                  </p>
                  <p className="text-xs font-bold text-[#1d70b8] dark:text-blue-400">
                    Devices: {template.devicesRequired}
                  </p>
                </div>

                {/* Tags & Action Row */}
                <div className="flex items-center justify-between pt-2">
                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    <span className="bg-[#3b2d6d] text-white text-[11px] font-semibold px-3 py-1 rounded-md tracking-tight">
                      {template.tags.primary.label}
                    </span>
                    <span className="bg-[#ba4484] text-white text-[11px] font-semibold px-3 py-1 rounded-md tracking-tight">
                      {template.tags.secondary.label}
                    </span>
                  </div>

                  {/* Use Template CTA */}
                  <Button
                    onClick={() => handleUseTemplate(template)}
                    className="bg-[#242430] hover:bg-[#12121c] text-white text-xs font-semibold px-4 h-9 rounded-lg shadow-sm transition-all"
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center p-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-800 dark:text-white">
            No templates match your filters
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Try adjusting your search terms or clearing the selected category
            and use cases.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All Categories');
              setSelectedUseCase('All Use Cases');
              setCurrentPage(1);
            }}
            className="mt-4 text-xs font-semibold"
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 pt-6 text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="p-1 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="First Page"
          >
            <ChevronsLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold tracking-wider text-slate-600 dark:text-slate-300">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            title="Last Page"
          >
            <ChevronsRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modal: Use Template with full AutomationDialog */}
      {isAutomationDialogOpen && (
        <AutomationDialog
          open={isAutomationDialogOpen}
          onOpenChange={(open) => {
            setIsAutomationDialogOpen(open);
            if (!open) setActiveTemplateData(null);
          }}
          mode="create"
          initialData={activeTemplateData}
          onSubmit={handleAutomationSubmit}
        />
      )}

      {/* Modal: Create Custom Template */}
      <Dialog
        open={isCreateTemplateOpen}
        onOpenChange={setIsCreateTemplateOpen}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Create Automation Template
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveCustomTemplate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category *</Label>
              <Select
                value={newTemplateCategory}
                onValueChange={setNewTemplateCategory}
              >
                <SelectTrigger className="w-full text-xs">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter((c) => c !== 'All Categories').map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Template Title *</Label>
              <Input
                placeholder="e.g. Server Room Overheat Protection"
                value={newTemplateTitle}
                onChange={(e) => setNewTemplateTitle(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Description</Label>
              <Textarea
                placeholder="Brief description of when this automation triggers and what it executes..."
                value={newTemplateDescription}
                onChange={(e) => setNewTemplateDescription(e.target.value)}
                rows={3}
                className="text-xs resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Required Devices</Label>
              <Input
                placeholder="e.g. Temperature sensor, Cooling fan relay"
                value={newTemplateDevices}
                onChange={(e) => setNewTemplateDevices(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Primary Tag</Label>
                <Input
                  placeholder="e.g. Server"
                  value={newTemplatePrimaryTag}
                  onChange={(e) => setNewTemplatePrimaryTag(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Secondary Tag</Label>
                <Input
                  placeholder="e.g. Emergency"
                  value={newTemplateSecondaryTag}
                  onChange={(e) => setNewTemplateSecondaryTag(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateTemplateOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-primary text-white text-xs font-semibold"
              >
                Save Template
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
