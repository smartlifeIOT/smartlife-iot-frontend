import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { createSortableColumn, createActionsColumn } from '@/components/common/DataTable/columns';
import { Code, Plus, Search, Play, Edit, Trash2, Copy } from 'lucide-react';

const scripts = [
  { id: '1', name: 'Data Transformer', language: 'JavaScript', type: 'Processing', lines: 45, lastModified: new Date('2025-01-20') },
  { id: '2', name: 'Alert Filter', language: 'JavaScript', type: 'Filter', lines: 28, lastModified: new Date('2025-01-25') },
  { id: '3', name: 'Aggregation Function', language: 'JavaScript', type: 'Aggregation', lines: 62, lastModified: new Date('2025-01-28') },
];

export default function ScriptLibrary() {
  const [searchQuery, setSearchQuery] = useState('');

  const columns = [
    createSortableColumn('name', 'Name'),
    { accessorKey: 'language', header: 'Language', cell: ({ row }: any) => <Badge variant="outline">{row.getValue('language')}</Badge> },
    { accessorKey: 'type', header: 'Type', cell: ({ row }: any) => <Badge>{row.getValue('type')}</Badge> },
    createSortableColumn('lines', 'Lines'),
    createSortableColumn('lastModified', 'Modified'),
    createActionsColumn((row) => [
      { label: 'Test', onClick: () => {}, icon: <Play className="h-4 w-4" /> },
      { label: 'Edit', onClick: () => {}, icon: <Edit className="h-4 w-4" /> },
      { label: 'Copy', onClick: () => {}, icon: <Copy className="h-4 w-4" /> },
      { label: 'Delete', onClick: () => {}, icon: <Trash2 className="h-4 w-4" />, variant: 'destructive' as const },
    ]),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="JavaScript Library" description="Manage custom scripts and functions" actions={[{ label: 'Create Script', onClick: () => {}, icon: <Plus className="h-4 w-4 mr-2" /> }]} />
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Scripts</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scripts.length}</div>
            <p className="text-xs text-muted-foreground">Custom functions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search scripts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Script Library</CardTitle>
          <CardDescription>Custom JavaScript functions and transformations</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={scripts} searchKey="name" />
        </CardContent>
      </Card>
    </div>
  );
}