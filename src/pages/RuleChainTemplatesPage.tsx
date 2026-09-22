import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Download,
  Upload,
  ExternalLink,
  Edit2,
} from 'lucide-react';

interface RuleChainTemplate {
  id: string;
  name: string;
  category: string;
  created: string;
  usedCount: number;
}

const templates: RuleChainTemplate[] = [
  {
    id: '1',
    name: 'Basic Data Processing',
    category: 'Data Processing',
    created: '2 Days Ago',
    usedCount: 47,
  },
  {
    id: '2',
    name: 'MQTT Integration',
    category: 'Connectivity',
    created: '5 Days Ago',
    usedCount: 124,
  },
  {
    id: '3',
    name: 'Anomaly Detection',
    category: 'Analytics',
    created: '1 Week Ago',
    usedCount: 89,
  },
  {
    id: '4',
    name: 'Cloud Synchronization',
    category: 'Data Sync',
    created: '3 Weeks Ago',
    usedCount: 215,
  },
];

export default function RuleChainTemplatesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
            Rule Chain Templates
          </h1>
          <p className="">
            Manage And Organize Your Rule Chain Templates For Edge Deployment
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => navigate('/edge-management/create-rule-chain')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <Input
            placeholder="Search templates"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-full md:w-[180px] h-11 bg-white border-slate-200 shadow-sm">
            <SelectValue placeholder="Category All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Category All</SelectItem>
            <SelectItem value="processing">Data Processing</SelectItem>
            <SelectItem value="connectivity">Connectivity</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="name">
          <SelectTrigger className="w-full md:w-[180px] h-11 bg-white border-slate-200 shadow-sm">
            <SelectValue placeholder="Sort Name" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Sort Name</SelectItem>
            <SelectItem value="date">Sort Date</SelectItem>
            <SelectItem value="usage">Sort Usage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="overflow-hidden border-slate-200 hover:shadow-xl hover:border-indigo-100 transition-all group"
          >
            <CardContent className="p-8 space-y-3">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                  {template.name}
                </h3>
                <p className=" font-medium text-sm">Flow Diagram Preview</p>
              </div>

              {/* In-Card Selects */}
              <div className="flex flex-wrap gap-2">
                <Select defaultValue="export">
                  <SelectTrigger className="h-9 text-xs bg-white border-slate-100 shadow-sm w-fit gap-2">
                    <SelectValue placeholder="Export All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="export">Export All</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="parse">
                  <SelectTrigger className="h-9 text-xs bg-white border-slate-100 shadow-sm w-fit gap-2">
                    <SelectValue placeholder="Parse" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parse">Parse</SelectItem>
                  </SelectContent>
                </Select>
                <Select defaultValue="store">
                  <SelectTrigger className="h-9 text-xs bg-white border-slate-100 shadow-sm w-fit gap-2">
                    <SelectValue placeholder="Store" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="store">Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Metadata */}
              <div className="space-y-3 pt-2">
                <div className="space-y-0.5">
                  <p className="text-slate-400 text-sm font-medium">Category</p>
                  <p className="text-slate-700 font-semibold">
                    {template.category}{' '}
                    <span className="font-medium">Created:</span>
                  </p>
                  <p className="text-slate-600 text-xs">{template.created}</p>
                </div>
                <p className="text-slate-600 font-medium">
                  Used: {template.usedCount} Times
                </p>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-3 pt-4">
                <Button variant="primary">Use</Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/edge-management/create-rule-chain')}
                >
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
