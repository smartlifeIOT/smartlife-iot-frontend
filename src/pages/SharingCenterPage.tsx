import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/common/PageHeader';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/common/DataTable/DataTable';
import {
  createSortableColumn,
  createActionsColumn,
} from '@/components/common/DataTable/columns';
import {
  Share2,
  Plus,
  Search,
  Link as LinkIcon,
  Mail,
  Users,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  UserCheck,
  Shield,
} from 'lucide-react';

interface SharedItem {
  id: string;
  name: string;
  type: 'Dashboard' | 'Device' | 'Asset' | 'Report';
  sharedWith: string;
  accessLevel: 'View' | 'Edit' | 'Admin';
  sharedBy: string;
  sharedDate: Date;
  expiresAt?: Date;
  isPublic: boolean;
  views: number;
}

const sharedItems: SharedItem[] = [
  {
    id: '1',
    name: 'Factory Dashboard',
    type: 'Dashboard',
    sharedWith: 'john.doe@example.com',
    accessLevel: 'View',
    sharedBy: 'admin@company.com',
    sharedDate: new Date('2025-01-25'),
    expiresAt: new Date('2025-02-25'),
    isPublic: false,
    views: 45,
  },
  {
    id: '2',
    name: 'Temperature Sensor #123',
    type: 'Device',
    sharedWith: 'Public Link',
    accessLevel: 'View',
    sharedBy: 'admin@company.com',
    sharedDate: new Date('2025-01-20'),
    isPublic: true,
    views: 128,
  },
  {
    id: '3',
    name: 'Building A - Floor 3',
    type: 'Asset',
    sharedWith: 'team@company.com',
    accessLevel: 'Edit',
    sharedBy: 'manager@company.com',
    sharedDate: new Date('2025-01-15'),
    isPublic: false,
    views: 67,
  },
  {
    id: '4',
    name: 'Monthly Energy Report',
    type: 'Report',
    sharedWith: 'stakeholders@company.com',
    accessLevel: 'View',
    sharedBy: 'admin@company.com',
    sharedDate: new Date('2025-01-10'),
    expiresAt: new Date('2025-02-10'),
    isPublic: false,
    views: 89,
  },
];

export default function SharingCenter() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareType, setShareType] = useState<'email' | 'link'>('email');
  const [activeTab, setActiveTab] = useState('shared-by-me');

  const columns = [
    createSortableColumn('name', t('common.name')),
    {
      accessorKey: 'type',
      header: t('common.type'),
      cell: ({ row }: any) => {
        const type = row.getValue('type') as string;
        const colors: Record<string, string> = {
          Dashboard: 'bg-blue-500',
          Device: 'bg-green-500',
          Asset: 'bg-purple-500',
          Report: 'bg-orange-500',
        };
        return <Badge className={`${colors[type]} text-white`}>{type}</Badge>;
      },
    },
    {
      accessorKey: 'sharedWith',
      header: t('sharing.table.sharedWith'),
      cell: ({ row }: any) => {
        const isPublic = row.original.isPublic;
        return (
          <div className="flex items-center gap-2">
            {isPublic ? (
              <>
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                <span>{t('sharing.stats.publicLinks')}</span>
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{row.getValue('sharedWith')}</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'accessLevel',
      header: t('sharing.table.access'),
      cell: ({ row }: any) => {
        const level = row.getValue('accessLevel') as string;
        const variant =
          level === 'Admin'
            ? 'default'
            : level === 'Edit'
              ? 'secondary'
              : 'outline';
        return <Badge variant={variant}>{level}</Badge>;
      },
    },
    {
      accessorKey: 'views',
      header: t('sharing.table.views'),
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue('views')}</span>
        </div>
      ),
    },
    createSortableColumn('sharedDate', t('sharing.table.sharedDate')),
    {
      accessorKey: 'expiresAt',
      header: t('sharing.table.expires'),
      cell: ({ row }: any) => {
        const expires = row.getValue('expiresAt') as Date | undefined;
        if (!expires)
          return (
            <span className="text-muted-foreground">{t('common.never')}</span>
          );
        return <span>{expires.toLocaleDateString()}</span>;
      },
    },
    createActionsColumn((row: any) => [
      {
        label: t('sharing.table.actions.copyLink'),
        onClick: () => console.log('Copy link', row.id),
        icon: <Copy className="h-4 w-4" />,
      },
      {
        label: t('common.view'),
        onClick: () => console.log('View', row.id),
        icon: <ExternalLink className="h-4 w-4" />,
      },
      {
        label: t('sharing.table.actions.revokeAccess'),
        onClick: () => console.log('Revoke', row.id),
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'destructive' as const,
      },
    ]),
  ];

  const filteredItems = sharedItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('sharing.title')}
        description={t('sharing.description')}
        actions={[
          {
            label: t('sharing.actions.shareResource'),
            onClick: () => setIsShareOpen(true),
            icon: <Plus className="h-4 w-4 mr-2" />,
          },
        ]}
      />

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('sharing.stats.totalShares')}
            </CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharedItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {t('sharing.stats.activeItems')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('sharing.stats.publicLinks')}
            </CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sharedItems.filter((i) => i.isPublic).length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('sharing.stats.publiclyAccessible')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('sharing.stats.totalViews')}
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sharedItems.reduce((sum, i) => sum + i.views, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {t('sharing.stats.allTimeViews')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('sharing.stats.activeUsers')}
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              {t('sharing.stats.withAccess')}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('sharing.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="shared-by-me">
            {t('sharing.tabs.sharedByMe')}
          </TabsTrigger>
          <TabsTrigger value="shared-with-me">
            {t('sharing.tabs.sharedWithMe')}
          </TabsTrigger>
          <TabsTrigger value="public">
            {t('sharing.tabs.publicLinks')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shared-by-me" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('sharing.content.sharedByYou.title')}</CardTitle>
              <CardDescription>
                {t('sharing.content.sharedByYou.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={filteredItems}
                searchKey="name"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared-with-me" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('sharing.content.sharedWithYou.title')}</CardTitle>
              <CardDescription>
                {t('sharing.content.sharedWithYou.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={filteredItems.filter((i) => !i.isPublic)}
                searchKey="name"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="public" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('sharing.content.publicLinks.title')}</CardTitle>
              <CardDescription>
                {t('sharing.content.publicLinks.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={filteredItems.filter((i) => i.isPublic)}
                searchKey="name"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('sharing.dialog.title')}</DialogTitle>
            <DialogDescription>
              {t('sharing.dialog.description')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Share Type Toggle */}
            <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
              <Button
                variant={shareType === 'email' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setShareType('email')}
              >
                <Mail className="h-4 w-4 mr-2" />
                {t('sharing.dialog.shareViaEmail')}
              </Button>
              <Button
                variant={shareType === 'link' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setShareType('link')}
              >
                <LinkIcon className="h-4 w-4 mr-2" />
                {t('sharing.dialog.createPublicLink')}
              </Button>
            </div>

            {/* Resource Selection */}
            <div className="space-y-2">
              <Label htmlFor="resource">
                {t('sharing.dialog.selectResource')} *
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('sharing.dialog.chooseResourcePlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dashboard-1">Factory Dashboard</SelectItem>
                  <SelectItem value="device-1">
                    Temperature Sensor #123
                  </SelectItem>
                  <SelectItem value="asset-1">Building A - Floor 3</SelectItem>
                  <SelectItem value="report-1">
                    Monthly Energy Report
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {shareType === 'email' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {t('sharing.dialog.emailAddresses')} *
                  </Label>
                  <Input
                    id="email"
                    placeholder={t('sharing.dialog.emailPlaceholder')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="access">
                    {t('sharing.dialog.accessLevel')} *
                  </Label>
                  <Select defaultValue="view">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">
                        {t('sharing.dialog.accessLevels.viewOnly')}
                      </SelectItem>
                      <SelectItem value="edit">
                        {t('sharing.dialog.accessLevels.canEdit')}
                      </SelectItem>
                      <SelectItem value="admin">
                        {t('sharing.dialog.accessLevels.admin')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Label>{t('sharing.dialog.publicLink')}</Label>
                    <Button variant="outline" size="sm" type="button">
                      <Copy className="h-4 w-4 mr-2" />
                      {t('common.copy')}
                    </Button>
                  </div>
                  <Input
                    readOnly
                    value="https://iot.platform.com/share/abc123xyz"
                    className="font-mono text-sm"
                  />
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {t('sharing.dialog.anyoneWithLink')}
                    </span>
                  </div>
                  <Select defaultValue="view">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">{t('common.view')}</SelectItem>
                      <SelectItem value="edit">{t('common.edit')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Expiration */}
            <div className="space-y-2">
              <Label htmlFor="expiry">{t('sharing.dialog.expiration')}</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder={t('sharing.dialog.neverExpires')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">{t('common.never')}</SelectItem>
                  <SelectItem value="1h">{t('common.time.oneHour')}</SelectItem>
                  <SelectItem value="1d">{t('common.time.oneDay')}</SelectItem>
                  <SelectItem value="7d">
                    {t('common.time.sevenDays')}
                  </SelectItem>
                  <SelectItem value="30d">
                    {t('common.time.thirtyDays')}
                  </SelectItem>
                  <SelectItem value="custom">
                    {t('common.time.customDate')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">{t('sharing.dialog.message')}</Label>
              <Textarea
                id="message"
                placeholder={t('sharing.dialog.messagePlaceholder')}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button>
              <Share2 className="h-4 w-4 mr-2" />
              {shareType === 'email'
                ? t('sharing.dialog.sendInvitation')
                : t('sharing.dialog.createLink')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
