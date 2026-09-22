import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/util';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { CreateAlarmRuleDialog } from '../components/CreateAlarmRuleDialog';
import { useAlarms } from '../hooks';
import { formatDistanceToNow } from 'date-fns';

export const AlertRulesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>(
    undefined
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');

  const tabs = ['Active', 'Resolved', 'All'];

  // Fetch alarms from API
  const { data: alarmsData, isLoading } = useAlarms();
  const apiAlarms = alarmsData?.data?.data.data || [];

  // Combine or fallback to mock data
  const rulesList = useMemo(() => {
    if (apiAlarms.length > 0) {
      return apiAlarms.map((item: any) => ({
        id: item.id,
        name: item.name || item.type || 'Alert Rule',
        status: item.status === 'CLEARED' ? 'Resolved' : 'Active',
        severity: item.severity || 'WARNING',
        device: item.device?.name || item.originatorId || 'Device',
        message:
          item.description ||
          item.details?.rule ||
          item.type ||
          'Alert trigger condition',
        time: item.createdAt
          ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
          : 'Recent',
      }));
    }
    return [];
  }, [apiAlarms]);

  // Filter rules
  const filteredRules = useMemo(() => {
    return rulesList.filter((rule) => {
      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Active' && rule.status.toLowerCase() === 'active') ||
        (activeTab === 'Resolved' && rule.status.toLowerCase() === 'resolved');

      const matchesSearch =
        searchQuery === '' ||
        rule.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.device?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.message?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSeverity =
        severityFilter === 'all' ||
        rule.severity.toLowerCase() === severityFilter.toLowerCase();

      return matchesTab && matchesSearch && matchesSeverity;
    });
  }, [rulesList, activeTab, searchQuery, severityFilter]);

  const handleCreateNew = () => {
    setSelectedRuleId(undefined);
    setIsCreateOpen(true);
  };

  const handleEditRule = (id: string | number) => {
    setSelectedRuleId(String(id));
    setIsCreateOpen(true);
  };

  const getSeverityBadgeVariant = (sev: string) => {
    const s = sev.toUpperCase();
    if (s === 'CRITICAL') return 'destructive';
    if (s === 'WARNING') return 'warning';
    if (s === 'MAJOR') return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-slate-800">Alert Rules</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab}
            variant="outline"
            className={cn(
              'border-none font-medium',
              activeTab === tab
                ? 'bg-secondary text-white hover:bg-secondary/90'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <Select
          className="w-[140px]"
          value={severityFilter}
          onValueChange={setSeverityFilter}
        >
          <SelectTrigger className="bg-gray-50 border-none">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="info">Info</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="primary"
          onClick={handleCreateNew}
          className="h-10 ml-auto bg-primary hover:bg-primary/90 text-white border-none cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Alert Rule
        </Button>
      </div>

      {/* Table */}
      <Card className="border shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-12"></TableHead>
                <TableHead>RULE NAME</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>SEVERITY</TableHead>
                <TableHead>DEVICE</TableHead>
                <TableHead>CONDITION</TableHead>
                <TableHead>TIME</TableHead>
                <TableHead className="text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-slate-500"
                  >
                    No alert rules found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRules.map((rule) => (
                  <TableRow
                    key={rule.id}
                    className="border-b last:border-none hover:bg-slate-50"
                  >
                    <TableCell></TableCell>
                    <TableCell className="font-medium text-slate-900">
                      {rule.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          rule.status === 'Active' ? 'destructive' : 'success'
                        }
                      >
                        {rule.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getSeverityBadgeVariant(rule.severity) as any}
                      >
                        {rule.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {rule.device}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {rule.message}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {rule.time}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hover:bg-secondary hover:text-white"
                              onClick={() =>
                                navigate(`/alarms/details/${rule.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hover:bg-secondary hover:text-white"
                              onClick={() => handleEditRule(rule.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Alert Rule</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="hover:bg-secondary hover:text-white text-rose-500 hover:text-white hover:bg-rose-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Alert Rule</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-2 py-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400"
          disabled
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400"
          disabled
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600">
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600">
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>

      <CreateAlarmRuleDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        alarmId={selectedRuleId}
      />
    </div>
  );
};

export default AlertRulesPage;
