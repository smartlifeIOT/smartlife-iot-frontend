import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';

interface ConverterTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  created: string;
  status: 'ACTIVE' | 'DRAFT';
}

const templates: ConverterTemplate[] = [
  {
    id: '1',
    name: 'JSON To Telemetry',
    type: 'Uplink',
    description: 'Converts JSON payload to telemetry data',
    created: '2024-01-15',
    status: 'ACTIVE',
  },
  {
    id: '2',
    name: 'Binary Data Parser',
    type: 'Uplink',
    description: 'Parses binary sensor data to JSON format',
    created: '2024-01-10',
    status: 'ACTIVE',
  },
  {
    id: '3',
    name: 'COMMAND RESPONSE',
    type: 'Downlink',
    description: 'Formats server commands for device',
    created: '2024-01-08',
    status: 'DRAFT',
  },
  {
    id: '4',
    name: 'LoRaWAN Decoder',
    type: 'Uplink',
    description: 'Decodes LoRaWAN payload format',
    created: '2024-01-05',
    status: 'ACTIVE',
  },
];

export default function ConverterTemplatesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="">
      {/* Breadcrumbs & Title */}
      <div className="space-y-1">
        <PageHeader
          title={'Converter Templates'}
          description={'Select Integration Type'}
        />
      </div>
      {/* Analytics Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
        <Card className="bg-primary text-white border-none shadow-none p-6 space-y-2">
          <p className="font-semibold text-sm  ">Total Templates</p>
          <p className="text-4xl font-semibold  ">12</p>
          <p className="  text-xs font-medium">
            4 Uplink, 3 Downlink, 5 Bidirectional
          </p>
        </Card>
        <Card className="bg-secondary text-white border-none shadow-none p-6 space-y-2">
          <p className="font-semibold text-sm  ">Active Templates</p>
          <p className="text-4xl font-semibold  ">09</p>
          <p className="  text-xs font-medium">75% utilization rate</p>
        </Card>
        <Card className="bg-success text-white border-none shadow-none p-6 space-y-2">
          <p className="font-semibold text-sm  ">Recently Updated</p>
          <p className="text-4xl font-semibold  ">03</p>
          <p className="  text-xs font-medium">Last 7 days</p>
        </Card>
        <Card className="bg-white  -  border-none shadow-none p-6 space-y-2">
          <p className="font-semibold text-sm  ">Template Usage</p>
          <p className="text-4xl font-semibold  ">156</p>
          <p className="  text-xs font-medium">Total deployments</p>
        </Card>
      </div>
      {/* Actions Bar */}
      <div className="flex  my-4 flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-sm group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <Input
              placeholder="Search Instances..."
              className="pl-10 bg-white border-slate-200 shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={() =>
              navigate('/edge-management/create-converter-template')
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary">Action</Button>
          <Button variant="destructive">Delete</Button>
        </div>
      </div>

      {/* Templates Table */}
      <Card className="border-slate-200 shadow-none p-6 overflow-hidden">
        <Table>
          <TableHeader className=" ">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-12 text-center text-white font-semibold uppercase ">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-transparent cursor-pointer"
                />
              </TableHead>
              <TableHead className="text-white font-semibold uppercase  ">
                Name
              </TableHead>
              <TableHead className="text-white font-semibold uppercase  ">
                Type
              </TableHead>
              <TableHead className="text-white font-semibold uppercase  ">
                Description
              </TableHead>
              <TableHead className="text-white font-semibold uppercase  ">
                Created
              </TableHead>
              <TableHead className="text-white font-semibold uppercase  ">
                Status
              </TableHead>
              <TableHead className="text-center text-white font-semibold uppercase  ">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow
                key={template.id}
                className="group transition-colors border-slate-100"
              >
                <TableCell className="text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-slate-300 cursor-pointer"
                  />
                </TableCell>
                <TableCell className="font-semibold text-sm tracking-wide uppercase  ">
                  {template.name}
                </TableCell>
                <TableCell className="font-  text-sm  ">
                  {template.type}
                </TableCell>
                <TableCell className="  text-sm ">
                  {template.description}
                </TableCell>
                <TableCell className="  text-sm ">{template.created}</TableCell>
                <TableCell>
                  <Badge
                    className={`${
                      template.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-100'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-100'
                    } border-none font-semibold text-[10px] px-3 py-0.5 rounded-full`}
                  >
                    {template.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hover:bg-secondary hover:text-white"
                      onClick={() =>
                        navigate(
                          `/edge-management/converter-config/${template.id}`
                        )
                      }
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hover:bg-secondary hover:text-white"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
