import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cloud,
  Radio,
  Webhook,
  Cpu,
  Layers,
  CheckCircle2,
  Plus,
  Trash2,
  X,
  Zap,
  Sliders,
  Filter,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { useCreateIntegration } from '@/features/integrations/Hooks';
import { PageHeader } from '@/components/common/PageHeader';

interface HeaderItem {
  key: string;
  value: string;
}

const INTEGRATION_TYPES = [
  {
    id: 'cloud',
    name: 'Cloud Platform',
    icon: <Cloud className="h-6 w-6" />,
    defaultProtocol: 'MQTT',
    defaultName: 'AWS IoT Core',
    defaultDescription: 'AWS IoT integration',
    description: 'AWS IoT Core, Azure IoT Hub, GCP IoT platform bridge',
  },
  {
    id: 'mqtt',
    name: 'MQTT Broker',
    icon: <Radio className="h-6 w-6" />,
    defaultProtocol: 'MQTT',
    defaultName: 'Enterprise MQTT Broker',
    defaultDescription: 'External MQTT Broker communication bridge',
    description: 'Connect directly to EMQX, Mosquitto, HiveMQ, or RabbitMQ',
  },
  {
    id: 'webhook',
    name: 'HTTP Webhook',
    icon: <Webhook className="h-6 w-6" />,
    defaultProtocol: 'POST',
    defaultName: 'HTTP Webhook Dispatcher',
    defaultDescription: 'Push telemetry and events to external webhooks',
    description: 'Real-time REST API forwarding to third-party endpoints',
  },
  {
    id: 'tuya',
    name: 'Tuya Smart Life',
    icon: <Cpu className="h-6 w-6" />,
    defaultProtocol: 'HTTPS',
    defaultName: 'Tuya Cloud Connector',
    defaultDescription: 'Sync Tuya ecosystem smart hardware and sensors',
    description: 'Connect Tuya Smart Home and OEM IoT hardware ecosystem',
  },
  {
    id: 'kafka',
    name: 'Apache Kafka',
    icon: <Layers className="h-6 w-6" />,
    defaultProtocol: 'KAFKA',
    defaultName: 'Kafka Event Pipeline',
    defaultDescription: 'Stream device telemetry into Kafka topics',
    description: 'High-throughput event streaming for big data architectures',
  },
];

const PROTOCOLS = ['MQTT', 'HTTP', 'HTTPS', 'COAP', 'WSS', 'KAFKA', 'AMQP'];

const COMMON_KEYS = [
  'temperature',
  'humidity',
  'pressure',
  'voltage',
  'battery',
  'status',
  'motion',
  'power',
];

export default function AddIntegrationPage() {
  const navigate = useNavigate();
  const createMutation = useCreateIntegration();

  // Integration type
  const [selectedType, setSelectedType] = useState('cloud');

  // Basic Info
  const [name, setName] = useState('AWS IoT Core');
  const [protocol, setProtocol] = useState('MQTT');
  const [description, setDescription] = useState('AWS IoT integration');
  const [enabled, setEnabled] = useState(true);

  // Configuration
  const [url, setUrl] = useState('https://webhook.site/your-unique-id');
  const [method, setMethod] = useState('POST');
  const [secret, setSecret] = useState('your-webhook-secret');
  const [timeout, setTimeout] = useState('10000');
  const [headers, setHeaders] = useState<HeaderItem[]>([
    { key: 'X-Source', value: 'SmartLife IoT' },
  ]);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');

  // MQTT specific config fields
  const [host, setHost] = useState('localhost');
  const [port, setPort] = useState('1883');
  const [topicFilter, setTopicFilter] = useState('Sensor/+/Telemetry');
  const [username, setUsername] = useState('localhost');
  const [password, setPassword] = useState('********');
  const [useAuth, setUseAuth] = useState(true);

  // Device Filter
  const [deviceType, setDeviceType] = useState('sensor');

  // Data Filter
  const [filterKeys, setFilterKeys] = useState<string[]>([
    'temperature',
    'humidity',
  ]);
  const [newKeyInput, setNewKeyInput] = useState('');

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
    const template = INTEGRATION_TYPES.find((t) => t.id === typeId);
    if (template) {
      setName(template.defaultName);
      setProtocol(template.defaultProtocol);
      setDescription(template.defaultDescription);
    }
  };

  const handleAddHeader = () => {
    if (!newHeaderKey.trim()) return;
    setHeaders((prev) => [
      ...prev,
      { key: newHeaderKey.trim(), value: newHeaderValue.trim() },
    ]);
    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddKey = (keyToAdd?: string) => {
    const key = (keyToAdd || newKeyInput).trim().toLowerCase();
    if (!key) return;
    if (!filterKeys.includes(key)) {
      setFilterKeys((prev) => [...prev, key]);
    }
    if (!keyToAdd) setNewKeyInput('');
  };

  const handleRemoveKey = (keyToRemove: string) => {
    setFilterKeys((prev) => prev.filter((k) => k !== keyToRemove));
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Integration name is required');
      return;
    }

    // Convert headers array into Record<string, string>
    const headersObject: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.key.trim()) {
        headersObject[h.key.trim()] = h.value;
      }
    });

    const configurationPayload: Record<string, any> = {
      url: url.trim(),
      method,
      headers: headersObject,
      secret: secret.trim(),
      timeout: Number(timeout) || 10000,
    };

    if (selectedType === 'mqtt' || protocol === 'MQTT') {
      configurationPayload.host = host;
      configurationPayload.port = port;
      configurationPayload.topicFilter = topicFilter;
      if (useAuth) {
        configurationPayload.username = username;
        configurationPayload.password = password;
      }
    }

    const payload: any = {
      name: name.trim(),
      type: selectedType,
      protocol: protocol.trim().toUpperCase(),
      description: description.trim(),
      status: enabled ? 'active' : 'inactive',
      enabled,
      configuration: configurationPayload,
      deviceFilter: {
        deviceType: deviceType.trim(),
      },
      dataFilter: {
        keys: filterKeys,
      },
    };

    try {
      await createMutation.mutateAsync(payload);
      toast.success('Integration created successfully');
      navigate('/integrations/overview');
    } catch (error: any) {
      console.error('Create integration error:', error);
      toast.error(
        error?.response?.data?.message || 'Failed to create integration'
      );
    }
  };

  return (
    <div className="space-y-8   min-h-screen pb-24">
      {/* Header Section */}
      <PageHeader
        title="Add Integration"
        description="Configure a new external data flow and IoT platform integration"
        actions={[
          {
            label: 'Back to Integrations',
            onClick: () => navigate('/integrations/overview'),
            variant: 'outline',
            icon: <ArrowLeft className="h-4 w-4 mr-1.5" />,
          },
        ]}
      />

      {/* Integration Type Selector */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            Select Integration Type
          </h2>
          <p className="text-gray-500 text-xs mt-0.5">
            Choose the target platform or connection protocol
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {INTEGRATION_TYPES.map((type) => {
            const isSelected = selectedType === type.id;
            return (
              <Card
                key={type.id}
                className={`cursor-pointer transition-all duration-200 border-2 ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/10 shadow-md bg-primary/[0.02]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-sm'
                }`}
                onClick={() => handleTypeSelect(type.id)}
              >
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected
                          ? 'bg-primary/10 text-primary'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {type.icon}
                    </div>
                    {isSelected && (
                      <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">
                      {type.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {type.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Main Configuration Form Card */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm rounded-xl overflow-hidden bg-white dark:bg-slate-900">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                {selectedType.replace('_', ' ')} Integration Configuration
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Set up payload forwarding, headers, device filters, and data
                keys
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <Label
                htmlFor="enabled-switch"
                className="text-xs font-semibold cursor-pointer"
              >
                Enabled:
              </Label>
              <Switch
                id="enabled-switch"
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Badge
                className={
                  enabled
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white text-[10px]'
                    : 'bg-slate-400 text-white text-[10px]'
                }
              >
                {enabled ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8 space-y-8">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2 border-slate-100 dark:border-slate-800">
              <Sliders className="w-4 h-4 text-primary" /> 1. Basic Information
            </h3>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Integration Name *
                </Label>
                <Input
                  placeholder="e.g. AWS IoT Core"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-50/50 dark:bg-slate-800/50 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Protocol *
                </Label>
                <Select value={protocol} onValueChange={setProtocol}>
                  <SelectTrigger className="bg-slate-50/50 dark:bg-slate-800/50 text-xs">
                    <SelectValue placeholder="Protocol" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROTOCOLS.map((p) => (
                      <SelectItem key={p} value={p} className="text-xs">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description
                </Label>
                <Textarea
                  placeholder="Describe the purpose of this integration..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="bg-slate-50/50 dark:bg-slate-800/50 text-xs resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Endpoint & Configuration */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2 border-slate-100 dark:border-slate-800">
              <Zap className="w-4 h-4 text-primary" /> 2. Endpoint &
              Configuration
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Endpoint / Webhook URL *
                </Label>
                <Input
                  placeholder="https://webhook.site/your-unique-id"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-slate-50/50 dark:bg-slate-800/50 text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  HTTP Method
                </Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="bg-slate-50/50 dark:bg-slate-800/50 text-xs font-mono">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {['POST', 'GET', 'PUT', 'PATCH'].map((m) => (
                      <SelectItem
                        key={m}
                        value={m}
                        className="text-xs font-mono"
                      >
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Timeout (ms)
                </Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={timeout}
                  onChange={(e) => setTimeout(e.target.value)}
                  className="bg-slate-50/50 dark:bg-slate-800/50 text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Secret / Auth Token
                </Label>
                <Input
                  type="password"
                  placeholder="your-webhook-secret"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  className="bg-slate-50/50 dark:bg-slate-800/50 text-xs font-mono"
                />
              </div>
            </div>

            {/* Custom Headers List */}
            <div className="space-y-2 pt-2">
              <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                HTTP Headers (Custom Configuration Headers)
              </Label>
              <div className="space-y-2">
                {headers.map((h, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-xs font-mono font-semibold text-primary min-w-[120px]">
                      {h.key}:
                    </span>
                    <span className="text-xs font-mono text-slate-600 dark:text-slate-300 flex-1 truncate">
                      {h.value}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveHeader(index)}
                      className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-1">
                  <Input
                    placeholder="Header Key (e.g. X-Source)"
                    value={newHeaderKey}
                    onChange={(e) => setNewHeaderKey(e.target.value)}
                    className="text-xs h-9"
                  />
                  <Input
                    placeholder="Header Value (e.g. SmartLife IoT)"
                    value={newHeaderValue}
                    onChange={(e) => setNewHeaderValue(e.target.value)}
                    className="text-xs h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddHeader}
                    className="text-xs h-9 px-3 shrink-0 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </Button>
                </div>
              </div>
            </div>

            {/* MQTT Broker Specific Fields if MQTT is chosen */}
            {(selectedType === 'mqtt' || protocol === 'MQTT') && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  MQTT Broker Settings
                </h4>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-semibold">Broker Host</Label>
                    <Input
                      placeholder="localhost or broker.emqx.io"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Port</Label>
                    <Input
                      placeholder="1883"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-3">
                    <Label className="text-xs font-semibold">
                      Topic Filter
                    </Label>
                    <Input
                      placeholder="Sensor/+/Telemetry"
                      value={topicFilter}
                      onChange={(e) => setTopicFilter(e.target.value)}
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Username</Label>
                    <Input
                      placeholder="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Password</Label>
                    <Input
                      type="password"
                      placeholder="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Device & Data Filters */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2 border-slate-100 dark:border-slate-800">
              <Filter className="w-4 h-4 text-primary" /> 3. Filter Rules
              (deviceFilter & dataFilter)
            </h3>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Device Filter */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Device Type (deviceFilter.deviceType)
                </Label>
                <Select value={deviceType} onValueChange={setDeviceType}>
                  <SelectTrigger className="text-xs bg-slate-50/50 dark:bg-slate-800/50">
                    <SelectValue placeholder="Select Device Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {['sensor', 'actuator', 'gateway', 'controller', 'all'].map(
                      (dt) => (
                        <SelectItem
                          key={dt}
                          value={dt}
                          className="text-xs capitalize"
                        >
                          {dt}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-slate-400">
                  Only devices matching this type will dispatch data to this
                  integration.
                </p>
              </div>

              {/* Data Filter Keys */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Telemetry Keys Filter (dataFilter.keys)
                </Label>

                {/* Active Key Chips */}
                <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700">
                  {filterKeys.map((k) => (
                    <Badge
                      key={k}
                      variant="secondary"
                      className="text-xs px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5"
                    >
                      {k}
                      <button
                        type="button"
                        onClick={() => handleRemoveKey(k)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {filterKeys.length === 0 && (
                    <span className="text-xs text-slate-400 italic">
                      No keys specified (will forward all data)
                    </span>
                  )}
                </div>

                {/* Add Key Input */}
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    placeholder="Type key name (e.g. temperature)..."
                    value={newKeyInput}
                    onChange={(e) => setNewKeyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddKey();
                      }
                    }}
                    className="text-xs h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddKey()}
                    className="text-xs h-9 px-3 shrink-0 flex items-center gap-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Key
                  </Button>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">
                    Quick suggestions:
                  </span>
                  {COMMON_KEYS.map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleAddKey(k)}
                      disabled={filterKeys.includes(k)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                    >
                      +{k}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Footer */}
      <div className="flex justify-end items-center gap-4 pt-2">
        <Button
          variant="outline"
          onClick={() => navigate('/integrations/overview')}
          className="px-6 text-xs font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleCreate}
          disabled={createMutation.isPending}
          className="bg-primary text-white hover:bg-primary/90 px-8 text-xs font-semibold shadow-sm"
        >
          {createMutation.isPending
            ? 'Creating Integration...'
            : 'Create Integration'}
        </Button>
      </div>
    </div>
  );
}
