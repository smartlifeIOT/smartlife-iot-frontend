import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ChevronRight,
  Edit,
  Trash2,
  Search,
  Plus,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/lib/util';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/common/PageHeader';

interface Converter {
  id: string;
  name: string;
  type: string;
  typeColor: string;
  usedBy: number;
  status: string;
  statusColor: string;
  modified: string;
}

const convertersData: Converter[] = [
  {
    id: '1',
    name: 'JSON Uplink Converter',
    type: 'UPLINK',
    typeColor: 'bg-green-100 text-green-700',
    usedBy: 3,
    status: 'ACTIVE',
    statusColor: 'text-orange-500',
    modified: '2 days ago',
  },
  {
    id: '2',
    name: 'Binary Downlink Converter',
    type: 'DOWNLINK',
    typeColor: 'bg-pink-100 text-pink-700',
    usedBy: 1,
    status: 'PENDING',
    statusColor: 'text-cyan-400',
    modified: '1 week ago',
  },
  {
    id: '3',
    name: 'Custom Protocol Parser',
    type: 'UPLINK',
    typeColor: 'bg-orange-100 text-orange-700',
    usedBy: 0,
    status: 'ERROR',
    statusColor: 'text-purple-500',
    modified: '3 days ago',
  },
  {
    id: '4',
    name: 'LoRa WAN Uplink Parser',
    type: 'UPLINK',
    typeColor: 'bg-blue-100 text-blue-700',
    usedBy: 5,
    status: 'ACTIVE',
    statusColor: 'text-green-500',
    modified: '5 days ago',
  },
];

export default function DataConvertersPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Data Converters"
        description="Transform And Process Incoming Data"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-4">
        <Link to="/integrations/data-converters/create">
          <Button variant="secondary">
            <Plus className="h-4 w-4 mr-2" /> Add Converter
          </Button>
        </Link>
        <Button variant="primary">All Types</Button>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search Converters.."
            className="pl-9 border-slate-200 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Table Card */}
      <Card className=" border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
        <div className="overflow-x-auto p-4">
          <Table>
            <TableHeader className=" ">
              <TableRow>
                <TableHead scope="col" className="px-6 py-4 font-medium">
                  NAME
                </TableHead>
                <TableHead
                  scope="col"
                  className="px-6 py-4 font-medium text-center"
                >
                  TYPE
                </TableHead>
                <TableHead
                  scope="col"
                  className="px-6 py-4 font-medium text-center"
                >
                  USED BY
                </TableHead>
                <TableHead
                  scope="col"
                  className="px-6 py-4 font-medium text-center"
                >
                  STATUS
                </TableHead>
                <TableHead
                  scope="col"
                  className="px-6 py-4 font-medium text-center"
                >
                  MODIFIED
                </TableHead>
                <TableHead
                  scope="col"
                  className="px-6 py-4  font-medium text-right"
                >
                  ACTIONS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className=" ">
              {convertersData.map((converter) => (
                <TableRow
                  key={converter.id}
                  className="bg-white hover:bg-slate-50"
                >
                  <TableCell className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">
                    {converter.name}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span
                      className={cn(
                        'text-xs font-semibold px-3 py-1 rounded-full',
                        converter.typeColor
                      )}
                    >
                      {converter.type}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center text-slate-500">
                    {converter.usedBy} integration
                    {converter.usedBy !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <span
                      className={cn(
                        'text-xs font-semibold',
                        converter.statusColor
                      )}
                    >
                      {converter.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center text-slate-500">
                    {converter.modified}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right border-r border-slate-200">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant={'destructive'}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Converter Usage */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-700 mb-6">
              Converter Usage
            </h3>
            <div className="space-y-3 text-sm text-slate-500">
              <div className="flex justify-between">
                <span>Total Converters:</span>
                <span>8</span>
              </div>
              <div className="flex justify-between">
                <span>Active:</span>
                <span>6</span>
              </div>
              <div className="flex justify-between">
                <span>Draft:</span>
                <span>2</span>
              </div>
              <div className="flex justify-between">
                <span>Uplink:</span>
                <span>5</span>
              </div>
              <div className="flex justify-between">
                <span>Downlink:</span>
                <span>3</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-700 mb-6">
              Recent Activity
            </h3>
            <ul className="space-y-4 text-sm text-slate-500 list-disc pl-4">
              <li className="pl-1">JSON Uplink modified 2 days ago</li>
              <li className="pl-1">Custom Parser created 3 days ago</li>
              <li className="pl-1">LoRaWAN Parser updated 5 days ago</li>
              <li className="pl-1">Binary Downlink tested 1 week ago</li>
            </ul>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="border border-slate-200 shadow-sm rounded-2xl">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-slate-700 mb-6">
              Performance
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  Messages processed today
                </p>
                <p className="text-2xl font-bold text-[#4b3c8f]">1,247</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">
                  Average processing time
                </p>
                <p className="text-2xl font-bold text-[#4b3c8f]">12ms</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Success rate: 99.8%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-slate-500 pt-4">
        <span>Showing 4 of 8 converters</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-600"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-600"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-600"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-600"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
