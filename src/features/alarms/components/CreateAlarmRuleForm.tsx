import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bell,
  CheckCircle2,
  Flame,
  Mail,
  MessageSquare,
  Radio,
  Plus,
  X,
  Layers,
  Cpu,
  User,
  Sliders,
  Sparkles,
  Link,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAlarm, useCreateAlarmRule, useUpdateAlarmRule } from '../hooks';
import { useDevices } from '@/features/devices/hooks/useDevices';
import { useAssets } from '@/features/assets/hooks';
import { useUsers } from '@/features/users/hooks';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { CreateAlarmRulePayload } from '@/services/api/alarms.api';
import toast from 'react-hot-toast';

export interface CreateAlarmRuleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  isModal?: boolean;
  alarmId?: string;
}

const COMMON_TELEMETRY_KEYS = [
  { value: 'temperature', label: 'Temperature (°C)', icon: Flame },
  { value: 'humidity', label: 'Humidity (%)', icon: Radio },
  { value: 'batteryLevel', label: 'Battery Level (%)', icon: Sliders },
  { value: 'voltage', label: 'Voltage (V)', icon: Sparkles },
  { value: 'pressure', label: 'Pressure (hPa)', icon: Layers },
  { value: 'co2', label: 'CO2 (ppm)', icon: Radio },
  { value: 'vibration', label: 'Vibration (mm/s)', icon: Radio },
];

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: 'bg-rose-500 text-white' },
  { value: 'warning', label: 'Warning', color: 'bg-amber-500 text-white' },
  { value: 'major', label: 'Major', color: 'bg-orange-500 text-white' },
  { value: 'minor', label: 'Minor', color: 'bg-blue-500 text-white' },
  { value: 'info', label: 'Info', color: 'bg-slate-500 text-white' },
  {
    value: 'indeterminate',
    label: 'Indeterminate',
    color: 'bg-neutral-500 text-white',
  },
];

const OPERATION_OPTIONS = [
  { value: 'GREATER', label: 'Greater than (>)', symbol: '>' },
  { value: 'LESS', label: 'Less than (<)', symbol: '<' },
  { value: 'GREATER_OR_EQUAL', label: 'Greater or Equal (≥)', symbol: '≥' },
  { value: 'LESS_OR_EQUAL', label: 'Less or Equal (≤)', symbol: '≤' },
  { value: 'EQUAL', label: 'Equal to (=)', symbol: '=' },
  { value: 'NOT_EQUAL', label: 'Not Equal to (≠)', symbol: '≠' },
];

export const normalizeOperation = (op?: string): string => {
  if (!op) return 'GREATER';
  const clean = String(op).toUpperCase().trim();
  switch (clean) {
    case 'GREATER_THAN':
    case 'GREATER':
    case '>':
      return 'GREATER';
    case 'LESS_THAN':
    case 'LESS':
    case '<':
      return 'LESS';
    case 'GREATER_THAN_OR_EQUAL':
    case 'GREATER_OR_EQUAL':
    case 'GREATER_EQUAL':
    case '>=':
    case '≥':
      return 'GREATER_OR_EQUAL';
    case 'LESS_THAN_OR_EQUAL':
    case 'LESS_OR_EQUAL':
    case 'LESS_EQUAL':
    case '<=':
    case '≤':
      return 'LESS_OR_EQUAL';
    case 'EQUAL':
    case 'EQUALS':
    case '=':
    case '==':
      return 'EQUAL';
    case 'NOT_EQUAL':
    case 'NOT_EQUALS':
    case '!=':
    case '≠':
      return 'NOT_EQUAL';
    default:
      return clean;
  }
};

export const CreateAlarmRuleForm: React.FC<CreateAlarmRuleFormProps> = ({
  onSuccess,
  onCancel,
  isModal = false,
  alarmId,
}) => {
  const { t } = useTranslation();
  const isEditing = Boolean(alarmId);
  const [activeTab, setActiveTab] = useState<
    'basic' | 'condition' | 'notifications' | 'recipients'
  >('basic');

  // Query details if in edit mode (GET /alarms/{id})
  const { data: alarmDetails, isLoading: isLoadingAlarm } = useAlarm(
    alarmId || ''
  );

  // Form States matching exact payload
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isEnabled, setIsEnabled] = useState(true);
  const [autoClear, setAutoClear] = useState(true);
  const [deviceId, setDeviceId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [details, setDetails] = useState('');

  // Rule condition state
  const [alarmType, setAlarmType] = useState('');
  const [ruleSeverity, setRuleSeverity] = useState('');
  const [conditionKey, setConditionKey] = useState('');
  const [conditionOperation, setConditionOperation] = useState('');
  const [conditionValue, setConditionValue] = useState<string | number>('');
  const [propagateToParent, setPropagateToParent] = useState(true);

  // Notification channels
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');

  // Recipients
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmailInput, setNewEmailInput] = useState('');
  const [phones, setPhones] = useState<string[]>([]);
  const [newPhoneInput, setNewPhoneInput] = useState('');

  // Prefill data when alarmDetails loads
  useEffect(() => {
    if (alarmDetails) {
      const raw: any = alarmDetails;
      setName(raw.name || raw.type || '');
      setDescription(raw.description || raw.details?.description || '');

      // Normalize severity to lowercase to match SEVERITY_OPTIONS
      const normSev = (raw.severity || '').toLowerCase() || 'warning';
      setSeverity(normSev);

      setStatus(
        (raw.status || 'active').toLowerCase() === 'active'
          ? 'active'
          : 'inactive'
      );
      setIsEnabled(raw.isEnabled !== undefined ? Boolean(raw.isEnabled) : true);
      setAutoClear(raw.autoClear !== undefined ? Boolean(raw.autoClear) : true);
      setDeviceId(raw.deviceId || raw.originatorId || '');
      setAssetId(raw.assetId || '');
      setDetails(
        typeof raw.details === 'string'
          ? raw.details
          : raw.details?.notes || raw.details?.escalation || ''
      );

      // Rule condition
      if (raw.rule) {
        setAlarmType(raw.rule.alarmType || raw.type || '');
        setRuleSeverity(
          (raw.rule.severity || raw.severity || 'critical').toLowerCase()
        );
        if (raw.rule.createCondition) {
          setConditionKey(raw.rule.createCondition.key || 'temperature');
          setConditionOperation(
            normalizeOperation(raw.rule.createCondition.operation)
          );
          setConditionValue(raw.rule.createCondition.value ?? '');
        } else if (raw.rule.condition) {
          setConditionKey(raw.rule.telemetryKey || 'temperature');
          setConditionOperation(normalizeOperation(raw.rule.condition));
          setConditionValue(raw.rule.value ?? '');
        } else if (raw.rule.telemetryKey) {
          setConditionKey(raw.rule.telemetryKey);
          setConditionOperation(normalizeOperation(raw.rule.condition));
          setConditionValue(raw.rule.value ?? '');
        }
        setPropagateToParent(
          raw.rule.propagateToParent !== undefined
            ? Boolean(raw.rule.propagateToParent)
            : true
        );
      } else if (raw.type) {
        setAlarmType(raw.type);
        setConditionOperation('GREATER');
      }

      // Notification channels
      setEmailEnabled(
        raw.email !== undefined
          ? Boolean(raw.email)
          : Boolean(raw.notifications?.email)
      );
      setPushEnabled(
        raw.push !== undefined
          ? Boolean(raw.push)
          : Boolean(raw.notifications?.push)
      );
      setSmsEnabled(Boolean(raw.sms));
      setWebhookUrl(raw.webhook || raw.notifications?.webhook || '');

      // Tags
      if (Array.isArray(raw.tags)) {
        setTags(raw.tags);
      }

      // Recipients
      const userList = raw.userIds || raw.recipients?.userIds || [];
      setSelectedUserIds(Array.isArray(userList) ? userList : []);
      const emailList = raw.emails || raw.recipients?.emails || [];
      setEmails(Array.isArray(emailList) ? emailList : []);
      const phoneList = raw.phones || [];
      setPhones(Array.isArray(phoneList) ? phoneList : []);
    }
  }, [alarmDetails]);

  // Queries for entities
  const { data: devicesData } = useDevices({ limit: 100 });
  const { data: assetsData } = useAssets({ limit: 100 });
  const { data: usersData } = useUsers({ limit: 100 });
  const devicesList = devicesData?.data?.data.data;
  const assetsList = assetsData?.data?.data?.data;

  const usersList = Array.isArray(usersData?.data) ? usersData.data : [];

  // Mutations
  const createAlarmRule = useCreateAlarmRule();
  const updateAlarmRule = useUpdateAlarmRule();
  const isSubmitting = createAlarmRule.isPending || updateAlarmRule.isPending;

  // Tag helper
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Email helper
  const handleAddEmail = () => {
    const trimmed = newEmailInput.trim();
    if (trimmed && !emails.includes(trimmed)) {
      setEmails([...emails, trimmed]);
      setNewEmailInput('');
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter((e) => e !== emailToRemove));
  };

  // Phone helper
  const handleAddPhone = () => {
    const trimmed = newPhoneInput.trim();
    if (trimmed && !phones.includes(trimmed)) {
      setPhones([...phones, trimmed]);
      setNewPhoneInput('');
    }
  };

  const handleRemovePhone = (phoneToRemove: string) => {
    setPhones(phones.filter((p) => p !== phoneToRemove));
  };

  // User select helper
  const handleToggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
    } else {
      setSelectedUserIds([...selectedUserIds, userId]);
    }
  };

  // Submit handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter an alert rule name');
      setActiveTab('basic');
      return;
    }

    if (!alarmType.trim()) {
      toast.error('Please specify an alarm type in condition tab');
      setActiveTab('condition');
      return;
    }

    const payload: CreateAlarmRulePayload = {
      name: name.trim(),
      description: description.trim(),
      severity,
      deviceId: deviceId || undefined,
      assetId: assetId || undefined,
      rule: {
        alarmType: alarmType.trim(),
        severity: ruleSeverity,
        createCondition: {
          key: conditionKey.trim(),
          operation: conditionOperation,
          value:
            conditionValue !== '' && !isNaN(Number(conditionValue))
              ? Number(conditionValue)
              : conditionValue,
        },
        propagateToParent,
      },
      isEnabled,
      autoClear,
      email: emailEnabled,
      sms: smsEnabled,
      push: pushEnabled,
      webhook: webhookUrl.trim() || undefined,
      notifications: {
        email: emailEnabled,
        push: pushEnabled,
        webhook: webhookUrl.trim() || undefined,
      },
      userIds: selectedUserIds,
      emails,
      phones,
      recipients: {
        userIds: selectedUserIds.length > 0 ? selectedUserIds : [''],
        emails: emails.length > 0 ? emails : [''],
      },
      tags,
      details: details.trim(),
      status,
    };

    if (isEditing && alarmId) {
      updateAlarmRule.mutate(
        { id: alarmId, data: payload },
        {
          onSuccess: () => {
            onSuccess?.();
          },
        }
      );
    } else {
      createAlarmRule.mutate(payload, {
        onSuccess: () => {
          onSuccess?.();
        },
      });
    }
  };

  if (isEditing && isLoadingAlarm) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3">
        <LoadingSpinner />
        <p className="text-sm text-slate-500">Loading alert rule details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Rule Condition Highlight Banner */}

      {/* Tabs Navigation */}
      <Tabs
        defaultValue="basic"
        value={activeTab}
        onValueChange={(val) =>
          setActiveTab(
            val as 'basic' | 'condition' | 'notifications' | 'recipients'
          )
        }
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
          <TabsTrigger
            value="basic"
            className="flex items-center gap-2 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all"
          >
            <Sliders className="h-4 w-4" />
            <span>1. Basic & Target</span>
          </TabsTrigger>
          <TabsTrigger
            value="condition"
            className="flex items-center gap-2 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all"
          >
            <Flame className="h-4 w-4" />
            <span>2. Trigger Condition</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all"
          >
            <Bell className="h-4 w-4" />
            <span>3. Channels</span>
          </TabsTrigger>
          <TabsTrigger
            value="recipients"
            className="flex items-center gap-2 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all"
          >
            <User className="h-4 w-4" />
            <span>4. Recipients</span>
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: BASIC & TARGET ================= */}
        <TabsContent value="basic" className="space-y-5 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Info Card */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-primary" />
                  General Information
                </CardTitle>
                <CardDescription>
                  Define the primary identification and severity for this alarm
                  rule.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="rule-name"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Rule Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="rule-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. High Temperature Alert"
                    className="h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="rule-desc"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="rule-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what triggers this alert..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Severity
                    </Label>
                    <Select value={severity} onValueChange={setSeverity}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEVERITY_OPTIONS.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            textValue={opt.label}
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${opt.color}`}
                              />
                              <span>{opt.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      Status
                    </Label>
                    <Select
                      value={status}
                      onValueChange={(val) =>
                        setStatus(val as 'active' | 'inactive')
                      }
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active" textValue="Active">
                          Active
                        </SelectItem>
                        <SelectItem value="inactive" textValue="Inactive">
                          Inactive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Enable Rule
                      </p>
                      <p className="text-xs text-slate-500">
                        Run evaluations continuously
                      </p>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={setIsEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Auto Clear
                      </p>
                      <p className="text-xs text-slate-500">
                        Clear alarm automatically when readings normalize
                      </p>
                    </div>
                    <Switch
                      checked={autoClear}
                      onCheckedChange={setAutoClear}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Target Entities & Details Card */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-primary" />
                  Target Entity & Tags
                </CardTitle>
                <CardDescription>
                  Associate this alert with specific devices, assets, and
                  operational tags.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Target Device
                  </Label>
                  <Select value={deviceId} onValueChange={setDeviceId}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Devices / Select Device" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" textValue="All / None">
                        All / None
                      </SelectItem>
                      {devicesList?.map((dev: any) => (
                        <SelectItem
                          key={dev.id}
                          value={dev.id}
                          textValue={dev.name || dev.label || dev.id}
                        >
                          {dev.name || dev.label || dev.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or enter device UUID manually..."
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Target Asset
                  </Label>
                  <Select value={assetId} onValueChange={setAssetId}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="All Assets / Select Asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" textValue="All / None">
                        All / None
                      </SelectItem>
                      {assetsList?.map((asset: any) => (
                        <SelectItem
                          key={asset.id}
                          value={asset.id}
                          textValue={asset.name || asset.id}
                        >
                          {asset.name || asset.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or enter asset UUID manually..."
                    value={assetId}
                    onChange={(e) => setAssetId(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>

                {/* Tags Management */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Tags
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag (e.g. critical, zone-A)..."
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      className="h-9 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                      className="h-9 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full border border-slate-200"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Escalation details */}
                <div className="space-y-1.5 pt-1">
                  <Label
                    htmlFor="details-notes"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Escalation Instructions & Details
                  </Label>
                  <Textarea
                    id="details-notes"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="e.g. Escalate to facilities team if it persists past 15 minutes."
                    rows={2}
                    className="text-xs resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================= TAB 2: TRIGGER CONDITION ================= */}
        <TabsContent value="condition" className="space-y-5 pt-4">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Flame className="h-4 w-4 text-rose-500" />
                Condition & Evaluation Logic
              </CardTitle>
              <CardDescription>
                Configure the telemetry key, threshold values, and trigger
                conditions for this rule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Alarm Type Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    value={alarmType}
                    onChange={(e) => setAlarmType(e.target.value)}
                    placeholder="e.g. High Temperature"
                    className="h-10"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Rule Trigger Severity
                  </Label>
                  <Select value={ruleSeverity} onValueChange={setRuleSeverity}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select rule severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${opt.color}`}
                            />
                            <span>{opt.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Telemetry Presets & Custom Input */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Telemetry Key
                </Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TELEMETRY_KEYS.map((item) => {
                    const isSelected = conditionKey === item.value;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setConditionKey(item.value)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <Input
                  value={conditionKey}
                  onChange={(e) => setConditionKey(e.target.value)}
                  placeholder="Or enter custom telemetry key (e.g. current_amp)..."
                  className="h-10 mt-2 font-mono text-sm"
                />
              </div>

              {/* Operator and Value */}
              <div className="grid gap-4 md:grid-cols-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Evaluation Operation
                  </Label>
                  <Select
                    value={conditionOperation}
                    onValueChange={setConditionOperation}
                  >
                    <SelectTrigger className="h-10 bg-white">
                      <SelectValue placeholder="Select Operation" />
                    </SelectTrigger>
                    <SelectContent>
                      {OPERATION_OPTIONS?.map((op) => (
                        <SelectItem
                          key={op.value}
                          value={op.value}
                          textValue={`${op.symbol} ${op.label}`}
                        >
                          <span className="font-semibold text-primary">
                            {op.symbol}
                          </span>{' '}
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Threshold Value
                  </Label>
                  <Input
                    type="number"
                    value={conditionValue}
                    onChange={(e) => setConditionValue(e.target.value)}
                    placeholder="e.g. 30"
                    className="h-10 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Propagate to Parent */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Propagate To Parent
                  </p>
                  <p className="text-xs text-slate-500">
                    Forward this alarm event up the asset hierarchy / building
                    tree
                  </p>
                </div>
                <Switch
                  checked={propagateToParent}
                  onCheckedChange={setPropagateToParent}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TAB 3: NOTIFICATIONS & CHANNELS ================= */}
        <TabsContent value="notifications" className="space-y-5 pt-4">
          <Card className="shadow-xs border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Notification Channels & Dispatch
              </CardTitle>
              <CardDescription>
                Select which alerting channels should fire when this rule is
                triggered.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                {/* Email Channel Card */}
                <div
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    emailEnabled
                      ? 'border-primary/50 bg-primary/5 text-primary shadow-xs'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                  onClick={() => setEmailEnabled(!emailEnabled)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Mail className="h-5 w-5" />
                    <Switch
                      checked={emailEnabled}
                      onCheckedChange={setEmailEnabled}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Email Alerts
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Send structured alert emails
                  </p>
                </div>

                {/* Push Notification Card */}
                <div
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    pushEnabled
                      ? 'border-primary/50 bg-primary/5 text-primary shadow-xs'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                  onClick={() => setPushEnabled(!pushEnabled)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Bell className="h-5 w-5" />
                    <Switch
                      checked={pushEnabled}
                      onCheckedChange={setPushEnabled}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Push Notifications
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    In-app & mobile push alerts
                  </p>
                </div>

                {/* SMS Channel Card */}
                <div
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    smsEnabled
                      ? 'border-primary/50 bg-primary/5 text-primary shadow-xs'
                      : 'border-slate-200 bg-white text-slate-500'
                  }`}
                  onClick={() => setSmsEnabled(!smsEnabled)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <MessageSquare className="h-5 w-5" />
                    <Switch
                      checked={smsEnabled}
                      onCheckedChange={setSmsEnabled}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    SMS Alerts
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Direct SMS text messages
                  </p>
                </div>
              </div>

              {/* Webhook Endpoint Configuration */}
              <div className="space-y-2 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="webhook-url"
                    className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
                  >
                    <Link className="h-3.5 w-3.5 text-primary" />
                    Webhook Endpoint URL
                  </Label>
                  <span className="text-[11px] text-slate-400">
                    Optional REST callback
                  </span>
                </div>
                <Input
                  id="webhook-url"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://example.com/api/webhook"
                  className="h-10 font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TAB 4: RECIPIENTS & CONTACTS ================= */}
        <TabsContent value="recipients" className="space-y-5 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Users Picker */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Assigned Users
                </CardTitle>
                <CardDescription>
                  Select platform users to receive escalation notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                  {usersList.length === 0 ? (
                    <p className="text-xs text-slate-400 py-3 text-center">
                      No users available
                    </p>
                  ) : (
                    usersList.map((user: any) => {
                      const isSelected = selectedUserIds.includes(user.id);
                      return (
                        <div
                          key={user.id}
                          onClick={() => handleToggleUser(user.id)}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-primary/5 border-primary text-primary font-medium'
                              : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs">
                              {(user.name ||
                                user.email ||
                                'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {user.name || user.email}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {user.email || user.id}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Direct Emails & Phones */}
            <Card className="shadow-xs border-slate-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Direct Email & Phone Lists
                </CardTitle>
                <CardDescription>
                  Add external email addresses and SMS phone numbers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Emails list */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">
                    Recipient Emails
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      value={newEmailInput}
                      onChange={(e) => setNewEmailInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddEmail();
                        }
                      }}
                      className="h-9 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddEmail}
                      className="h-9 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                    {emails.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs px-2.5 py-1 rounded-full border border-emerald-200"
                      >
                        <Mail className="h-3 w-3" />
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveEmail(email)}
                          className="hover:text-rose-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Phones list */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <Label className="text-xs font-semibold text-slate-700">
                    SMS Phone Numbers
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="tel"
                      placeholder="+966500000000"
                      value={newPhoneInput}
                      onChange={(e) => setNewPhoneInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddPhone();
                        }
                      }}
                      className="h-9 text-xs"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddPhone}
                      className="h-9 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
                    {phones.map((phone) => (
                      <span
                        key={phone}
                        className="inline-flex items-center gap-1 bg-blue-50 text-blue-800 text-xs px-2.5 py-1 rounded-full border border-blue-200"
                      >
                        <MessageSquare className="h-3 w-3" />
                        {phone}
                        <button
                          type="button"
                          onClick={() => handleRemovePhone(phone)}
                          className="hover:text-rose-500 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Navigation & Submit */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <div className="flex items-center gap-2">
          {activeTab !== 'basic' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (activeTab === 'recipients') setActiveTab('notifications');
                else if (activeTab === 'notifications')
                  setActiveTab('condition');
                else if (activeTab === 'condition') setActiveTab('basic');
              }}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
          )}
          {activeTab !== 'recipients' && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                if (activeTab === 'basic') setActiveTab('condition');
                else if (activeTab === 'condition')
                  setActiveTab('notifications');
                else if (activeTab === 'notifications')
                  setActiveTab('recipients');
              }}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button
            type="button"
            variant="default"
            className="bg-primary hover:bg-primary/90 text-white min-w-[140px]"
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {isEditing ? 'Update Alert Rule' : 'Create Alert Rule'}
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
