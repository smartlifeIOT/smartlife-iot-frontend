import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { createSortableColumn, createSortableDateColumn, createActionsColumn } from '@/components/common/DataTable/columns';
import { Package, Plus, Search, Copy, Trash2, Edit, Download, BarChart3, Gauge, LineChart, PieChart } from 'lucide-react';

interface WidgetBundle {
  id: string;
  name: string;
  description: string;
  widgets: number;
  isSystem: boolean;
  createdAt: Date;
  author: string;
}

const bundles: WidgetBundle[] = [
  { id: '1', name: 'System Widgets', description: 'Default system widget bundle', widgets: 24, isSystem: true, createdAt: new Date('2025-01-01'), author: 'System' },
  { id: '2', name: 'IoT Dashboard', description: 'Widgets for IoT dashboards', widgets: 15, isSystem: false, createdAt: new Date('2025-01-15'), author: 'Admin' },
  { id: '3', name: 'Analytics Bundle', description: 'Advanced analytics widgets', widgets: 12, isSystem: false, createdAt: new Date('2025-01-20'), author: 'Analytics Team' },
];

export default function WidgetsBundle() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const columns = [
    createSortableColumn('name', 'Name'),
    { accessorKey: 'widgets', header: 'Widgets', cell: ({ row }: any) => <Badge variant="outline">{row.getValue('widgets')} widgets</Badge> },
    { accessorKey: 'isSystem', header: 'Type', cell: ({ row }: any) => row.getValue('isSystem') ? <Badge>System</Badge> : <Badge variant="secondary">Custom</Badge> },
    createSortableColumn('author', 'Author'),
    createSortableDateColumn('createdAt', 'Created'),
    createActionsColumn((row) => [
      { label: 'View Widgets', onClick: () => {}, icon: <Package className="h-4 w-4" /> },
      { label: 'Export', onClick: () => {}, icon: <Download className="h-4 w-4" /> },
      { label: 'Edit', onClick: () => {}, icon: <Edit className="h-4 w-4" /> },
      { label: 'Delete', onClick: () => {}, icon: <Trash2 className="h-4 w-4" />, variant: 'destructive' as const },
    ]),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Widget Bundles" description="Manage widget collections and libraries" actions={[{ label: 'Create Bundle', onClick: () => setIsCreateOpen(true), icon: <Plus className="h-4 w-4 mr-2" /> }]} />
      
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bundles</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bundles.length}</div>
            <p className="text-xs text-muted-foreground">Widget collections</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Widgets</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bundles.reduce((sum, b) => sum + b.widgets, 0)}</div>
            <p className="text-xs text-muted-foreground">Available widgets</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search bundles..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Widget Bundles</CardTitle>
          <CardDescription>Manage your widget collections</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={bundles} searchKey="name" />
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Widget Bundle</DialogTitle>
            <DialogDescription>Create a new widget collection</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Bundle Name *</Label>
              <Input id="name" placeholder="e.g., IoT Dashboard" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Bundle description..." rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button>Create Bundle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}