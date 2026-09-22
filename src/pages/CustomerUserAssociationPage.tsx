import { useState } from 'react';
import { Mail, ScrollText, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUsers } from '@/features/users/hooks';
import {
  useCustomerById,
  useCustomerUsers,
} from '@/features/customer/hooks';
import { useParams } from 'react-router-dom';
import { useAssignUserToCustomer } from '@/features/customerUser/hooks';
import { useTranslation } from 'react-i18next';

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getRoleBadgeVariant = (role?: string) => {
  switch (role) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'secondary';
    default:
      return 'outline';
  }
};

export default function CustomerUserAssociationPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedAvailableUsers, setSelectedAvailableUsers] = useState<
    Set<string>
  >(new Set());
  const [selectedUnAvailableUsers, setSelectedUnAvailableUsers] = useState<
    Set<string>
  >(new Set());
  
  const { id } = useParams();
  const { data: customer } = useCustomerById(id);
  const cutomerData = customer?.data;
  const { data: users } = useUsers({
    search: searchQuery,
    role: 'customer_user',
    status: selectedStatus,
  });

  const { data: customersData } = useCustomerUsers(id || '');

  const toggleAvailableUserSelection = (userId: string) => {
    const newSelection = new Set(selectedAvailableUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedAvailableUsers(newSelection);
  };
  
  const toggleUnAvailableUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUnAvailableUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUnAvailableUsers(newSelection);
  };
  
  const assignedUsers = customersData?.data || [];

  const selectedCustomerInfo = {
    name: cutomerData?.name || t('usersManagement.association.summary.selectToAssign'),
    id: cutomerData?.id || '-',
    status: cutomerData?.status || '-',
  };

  const stats = {
    totalAssigned: assignedUsers.length,
    administrators: assignedUsers.filter((u: any) => u.role === 'admin' || u.role === 'customer_admin').length,
    managers: assignedUsers.filter((u: any) => u.role === 'manager' || u.role === 'customer_manager').length,
    regularUsers: assignedUsers.filter((u: any) => u.role === 'customer_user').length,
    unassigned: users?.data?.length || 0,
    filteredResults: users?.data?.length || 0,
  };
  
  const { mutateAsync: assignUserToCustomer } = useAssignUserToCustomer();
  
  const handleBulkAssign = () => {
    selectedAvailableUsers.forEach((userId) => {
      assignUserToCustomer({
        userId,
        customerId: id || '',
      });
    });
  };

  return (
    <div className="space-y-6 min-h-screen bg-transparent dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <Card className="bg-white dark:bg-gray-800 border-none shadow-sm p-6 overflow-hidden relative">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-primary/10 dark:border-secondary/10 shadow-lg">
            <AvatarFallback className="bg-primary/5 dark:bg-secondary/5 text-primary dark:text-secondary text-3xl font-black">
              {cutomerData?.name?.[0]?.toUpperCase() || 'C'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {cutomerData?.name}
              </h1>
              <Badge
                variant={
                  cutomerData?.status === 'active' ? 'success' : 'destructive'
                }
                className="px-3 py-1 font-bold uppercase tracking-wider text-[10px]"
              >
                {cutomerData?.status}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-slate-500 dark:text-gray-400">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4 text-primary" />
                {cutomerData?.email}
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <ScrollText className="h-4 w-4 text-primary" />
                <span className="line-clamp-1">{cutomerData?.description}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white/50 dark:bg-gray-800/50 p-4 rounded-xl backdrop-blur-sm border border-white dark:border-gray-700">
        <div className="w-full md:flex-1">
          <Input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            iconPosition="left"
            className="bg-white dark:bg-gray-800 border-none shadow-sm"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <Select
            value={selectedRole}
            onValueChange={setSelectedRole}
          >
            <SelectTrigger className="w-full md:w-[160px] bg-white dark:bg-gray-800 border-none shadow-sm">
              <SelectValue placeholder={t('usersManagement.association.summary.bulkAssign')} />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 border-gray-700">
              <SelectItem value="all">{t('usersManagement.users_tab.tabs.all')}</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="User">User</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger className="w-full md:w-[160px] bg-white dark:bg-gray-800 border-none shadow-sm">
              <SelectValue placeholder={t('usersManagement.customer_card.labels.status')} />
            </SelectTrigger>
            <SelectContent className="dark:bg-gray-800 border-gray-700">
              <SelectItem value="">{t('usersManagement.users_tab.tabs.all')}</SelectItem>
              <SelectItem value="active">{t('usersManagement.users_tab.statusConfirm.activate')}</SelectItem>
              <SelectItem value="inactive">{t('usersManagement.users_tab.statusConfirm.deactivate')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content - Three Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Users Panel */}
        <Card className="flex flex-col h-[600px] bg-white dark:bg-gray-800 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="text-xl font-bold dark:text-white">
              {t('usersManagement.association.availableUsers')}
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              {t('usersManagement.association.selectToAssign')}
            </p>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col p-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {users?.data?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50 space-y-2">
                  <Search className="h-10 w-10" />
                  <p className="text-sm font-medium">{t('usersManagement.association.noAvailable')}</p>
                </div>
              ) : (
                users?.data?.map((user: any) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                      selectedAvailableUsers.has(user.id)
                        ? 'border-primary bg-primary/5 dark:bg-primary/20'
                        : 'border-transparent bg-gray-50/50 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-900'
                    }`}
                    onClick={() => toggleAvailableUserSelection(user.id)}
                  >
                    <Avatar className="h-10 w-10 border border-white dark:border-gray-700 shadow-sm transition-transform group-hover:scale-110">
                      <AvatarFallback className="bg-primary/10 dark:bg-primary/30 text-primary dark:text-primary-foreground font-bold text-xs">
                        {getInitials(user.name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate font-medium">
                        {user.email}
                      </p>
                    </div>
                    <Badge 
                      variant={getRoleBadgeVariant(user.status)}
                      className="text-[9px] px-1.5 py-0 font-bold uppercase"
                    >
                      {user.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
              <Button
                className="flex-1 font-bold shadow-md"
                onClick={handleBulkAssign}
                variant="secondary"
                disabled={selectedAvailableUsers.size === 0}
              >
                {t('usersManagement.association.assign')}
              </Button>
              <Button
                variant="outline"
                className="flex-1 font-bold dark:border-gray-700 dark:text-gray-400"
                onClick={() => setSelectedAvailableUsers(new Set())}
                disabled={selectedAvailableUsers.size === 0}
              >
                {t('usersManagement.association.remove')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Assigned Users Panel */}
        <Card className="flex flex-col h-[600px] bg-white dark:bg-gray-800 border-none shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 dark:bg-gray-900/20 border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="text-xl font-bold dark:text-white">
              {t('usersManagement.association.assignedUsers')}
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-gray-400">
              {t('usersManagement.association.selectCustomerToAssign')}
            </p>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-full overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {assignedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-50 space-y-2">
                  <Mail className="h-10 w-10" />
                  <p className="text-sm font-medium">{t('usersManagement.customer_users_list.noUsers')}</p>
                </div>
              ) : (
                assignedUsers.map((user: any) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                      selectedUnAvailableUsers.has(user.id)
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-transparent bg-gray-50/50 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-900'
                    }`}
                    onClick={() => toggleUnAvailableUserSelection(user.id)}
                  >
                    <Avatar className="h-10 w-10 border border-white dark:border-gray-700 shadow-sm transition-transform group-hover:scale-110">
                      <AvatarFallback className="bg-secondary/10 dark:bg-secondary/30 text-secondary dark:text-secondary-foreground font-bold text-xs">
                        {getInitials(user.name || user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-gray-400 truncate font-medium">
                        {user.email}
                      </p>
                    </div>
                    {user.status && (
                      <Badge 
                        variant={getRoleBadgeVariant(user.status)}
                        className="text-[9px] px-1.5 py-0 font-bold uppercase"
                      >
                        {user.status}
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Assignment Summary Panel */}
        <Card className="bg-white dark:bg-gray-800 border-none shadow-sm flex flex-col">
          <CardHeader className="bg-primary hover:bg-primary/90 transition-colors">
            <CardTitle className="text-xl font-bold text-white">
              {t('usersManagement.association.summary.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-8 flex-1">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                  {t('usersManagement.customer_card.labels.name')}
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate" title={selectedCustomerInfo.id}>
                  {selectedCustomerInfo.name}
                </p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                <p className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mb-1">
                  {t('usersManagement.customer_card.labels.status')}
                </p>
                <Badge
                  variant={getRoleBadgeVariant(selectedCustomerInfo.status)}
                  className="px-2 py-0 text-[10px] font-bold"
                >
                  {selectedCustomerInfo.status}
                </Badge>
              </div>
            </div>

            {/* User Statistics */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('usersManagement.association.summary.userStats')}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: t('usersManagement.association.summary.totalAssigned'), value: stats.totalAssigned, color: 'text-primary' },
                  { label: t('usersManagement.association.summary.administrators'), value: stats.administrators, color: 'text-purple-600 dark:text-purple-400' },
                  { label: t('usersManagement.association.summary.managers'), value: stats.managers, color: 'text-yellow-600 dark:text-yellow-400' },
                  { label: t('usersManagement.association.summary.regularUsers'), value: stats.regularUsers, color: 'text-green-600 dark:text-green-400' },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-colors group">
                    <span className="text-slate-600 dark:text-gray-400 font-medium">{stat.label}</span>
                    <span className={`font-black ${stat.color} group-hover:scale-110 transition-transform`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Users Stats */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  {t('usersManagement.association.summary.availableStats')}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: t('usersManagement.association.summary.unassigned'), value: stats.unassigned },
                  { label: t('usersManagement.association.summary.filtered'), value: stats.filteredResults },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded transition-colors">
                    <span className="text-slate-600 dark:text-gray-400 font-medium">{stat.label}</span>
                    <span className="font-black text-slate-900 dark:text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 space-y-3 mt-auto">
              <Button className="w-full font-black shadow-lg uppercase tracking-wider" variant="secondary">
                {t('usersManagement.association.summary.bulkAssign')}
              </Button>
              <Button className="w-full font-black border-2 dark:border-gray-700 dark:text-gray-300 uppercase tracking-wider" variant="outline">
                {t('usersManagement.association.summary.exportNow')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
        <Button
          variant="outline"
          className="px-8 bg-white dark:bg-gray-800 dark:border-gray-700 font-bold uppercase tracking-wider"
        >
          {t('common.cancel')}
        </Button>
        <Button className="px-12 font-black shadow-xl uppercase tracking-wider" variant="secondary">
          {t('common.submit')}
        </Button>
      </div>

      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
        `}
      </style>
    </div>
  );
}
