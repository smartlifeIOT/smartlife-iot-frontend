import React, { useState } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image, Plus, Search, Upload, Trash2, Download } from 'lucide-react';

const images = [
  { id: '1', name: 'device-icon.png', size: '24 KB', uploaded: new Date('2025-01-15'), url: '/placeholder.png' },
  { id: '2', name: 'logo.svg', size: '12 KB', uploaded: new Date('2025-01-20'), url: '/placeholder.png' },
  { id: '3', name: 'dashboard-bg.jpg', size: '156 KB', uploaded: new Date('2025-01-25'), url: '/placeholder.png' },
];

export default function ImageLibrary() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <PageHeader title="Image Library" description="Manage dashboard images and icons" actions={[{ label: 'Upload Image', onClick: () => {}, icon: <Upload className="h-4 w-4 mr-2" /> }]} />
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Images</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{images.length}</div>
            <p className="text-xs text-muted-foreground">In library</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search images..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-square bg-muted flex items-center justify-center">
              <Image className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm truncate">{image.name}</h3>
              <p className="text-xs text-muted-foreground">{image.size}</p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" className="flex-1"><Download className="h-3 w-3" /></Button>
                <Button size="sm" variant="outline" className="flex-1"><Trash2 className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}