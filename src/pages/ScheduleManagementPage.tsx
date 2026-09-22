import { useState } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Calendar,
  Plus,
  Search,
  Play,
  Pause,
  Edit,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Textarea } from '@/components/ui/textarea';

const scheduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  type: z.string().min(1, 'Type is required'),
  schedule: z.string().min(1, 'Schedule is required'),
  enabled: z.boolean(),
  configuration: z.any(),
});

type ScheduleFormValues = z.infer<typeof scheduleSchema>;

const DUMMY_SCHEDULES = [
  {
    id: '1',
    name: 'Daily Energy Report',
    type: 'REPORT',
    schedule: 'Daily at 08:00',
    enabled: true,
    lastRun: new Date('2025-01-30T08:00:00'),
    nextRun: new Date('2025-01-31T08:00:00'),
    description: 'Send daily device status report',
  },
  {
    id: '2',
    name: 'Weekly Device Status',
    type: 'REPORT',
    schedule: 'Weekly on Monday',
    enabled: true,
    lastRun: new Date('2025-01-27T09:00:00'),
    nextRun: new Date('2025-02-03T09:00:00'),
    description: 'Weekly summary of device health',
  },
  {
    id: '3',
    name: 'Monthly Analytics',
    type: 'MAINTENANCE',
    schedule: 'Monthly on 1st',
    enabled: false,
    lastRun: new Date('2025-01-01T10:00:00'),
    nextRun: new Date('2025-02-01T10:00:00'),
    description: 'Database maintenance task',
  },
];

export default function ScheduleManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [schedules, setSchedules] = useState(DUMMY_SCHEDULES);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: '',
      description: '',
      type: 'REPORT',
      schedule: new Date().toISOString().slice(0, 16),
      enabled: true,
      configuration: {},
    },
  });

  const onSave: SubmitHandler<ScheduleFormValues> = (data) => {
    console.log('Dummy Create Schedule:', data);
    toast.success('Schedule created (Dummy)');
    setIsCreateOpen(false);
    reset();
  };

  const filteredSchedules = schedules.filter((schedule) =>
    schedule.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedule Management"
        description="Manage scheduled reports and automated tasks"
        actions={[
          {
            label: 'Create Schedule',
            onClick: () => setIsCreateOpen(true),
            icon: <Plus className="h-4 w-4 mr-2" />,
          },
        ]}
      />

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-primary text-white border-none shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-white font-medium">
              Total Schedules
            </CardTitle>
            <Calendar className="h-4 w-4 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {schedules.length}
            </div>
            <p className="text-xs text-white/70">Configured tasks</p>
          </CardContent>
        </Card>
        <Card className="bg-success text-white border-none shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">
              Active
            </CardTitle>
            <Play className="h-4 w-4 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {schedules.filter((s) => s.enabled).length}
            </div>
            <p className="text-xs text-white/70">Running schedules</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 shadow-none overflow-hidden p-6">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold ">Name</TableHead>
              <TableHead className="font-semibold ">Schedule</TableHead>
              <TableHead className="font-semibold ">Type</TableHead>
              <TableHead className="font-semibold ">Next Run</TableHead>
              <TableHead className="font-semibold   text-center">
                Status
              </TableHead>
              <TableHead className="font-semibold   text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSchedules.map((schedule) => (
              <TableRow
                key={schedule.id}
                className="border-slate-100 hover:bg-slate-50/50 transition-colors"
              >
                <TableCell className="font-medium text-slate-800">
                  {schedule.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="font-medium border-slate-200"
                  >
                    {schedule.schedule}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-50 border-none font-medium">
                    {schedule.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {schedule.nextRun
                    ? new Date(schedule.nextRun).toLocaleString()
                    : 'N/A'}
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={schedule.enabled}
                    onCheckedChange={() => {
                      setSchedules((prev) =>
                        prev.map((s) =>
                          s.id === schedule.id
                            ? { ...s, enabled: !s.enabled }
                            : s
                        )
                      );
                    }}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hover:bg-slate-100 text-slate-500"
                      title={schedule.enabled ? 'Pause' : 'Resume'}
                    >
                      {schedule.enabled ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hover:bg-slate-100 text-slate-500"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredSchedules.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-slate-500"
                >
                  No schedules found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <form onSubmit={handleSubmit(onSave)}>
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Create Schedule</DialogTitle>
              <DialogDescription>
                Configure a new scheduled task
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 p-6">
              <div className="space-y-2">
                <Label htmlFor="name">Schedule Name *</Label>
                <Input
                  {...register('name')}
                  placeholder="e.g. Daily Energy Report"
                  className={`border ${errors.name ? 'border-red-500' : 'border-slate-200'}`}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  {...register('description')}
                  placeholder="e.g. Send daily device status report"
                  className={`border ${errors.description ? 'border-red-500' : 'border-slate-200'}`}
                />
                {errors.description && (
                  <p className="text-xs text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Task Type *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="border-slate-200">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REPORT">REPORT</SelectItem>
                        <SelectItem value="BACKUP">BACKUP</SelectItem>
                        <SelectItem value="MAINTENANCE">MAINTENANCE</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-xs text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Schedule Date & Time *</Label>
                <Input
                  type="datetime-local"
                  {...register('schedule')}
                  className={`border ${errors.schedule ? 'border-red-500' : 'border-slate-200'}`}
                />
                {errors.schedule && (
                  <p className="text-xs text-red-500">
                    {errors.schedule.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Schedule</Label>
                  <p className="text-sm text-slate-500">
                    Start executing this task immediately after creation
                  </p>
                </div>
                <Controller
                  name="enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
              </div>
            </div>

            <DialogFooter className="p-6 pt-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
                className="border-slate-200"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Schedule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
