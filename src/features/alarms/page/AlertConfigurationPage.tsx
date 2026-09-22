import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'react-hot-toast';

interface AlertConfigurationForm {
  alertName: string;
  description: string;
  building: string;
  floor: string;
  zoneRoom: string;
  parameter: string;
  condition: string;
  threshold: number;
  duration: string;
  emailNotification: boolean;
  pushNotification: boolean;
}

const defaultValues: AlertConfigurationForm = {
  alertName: 'Viewer',
  description: 'Alert when temperature exceeds threshold',
  building: 'viewer',
  floor: 'floor-1',
  zoneRoom: 'all-rooms',
  parameter: 'temperature',
  condition: 'greater-than',
  threshold: 25,
  duration: '5 minutes',
  emailNotification: true,
  pushNotification: true,
};

const mockRooms = [
  { id: 'room-101-1', name: 'Room 101', status: 'normal' },
  { id: 'room-101-2', name: 'Room 101', status: 'alert' },
  { id: 'room-101-3', name: 'Room 101', status: 'warning' },
  { id: 'room-101-4', name: 'Room 101', status: 'alert' },
  { id: 'room-101-5', name: 'Room 101', status: 'normal' },
];

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'normal':
      return 'bg-green-500';
    case 'warning':
      return 'bg-orange-500';
    case 'alert':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

export default function AlertConfigurationPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, control, watch } =
    useForm<AlertConfigurationForm>({
      defaultValues,
    });

  const onSubmit = async (data: AlertConfigurationForm) => {
    try {
      // TODO: Implement API call to save alert configuration
      console.log('Saving alert configuration:', data);
      toast.success('Alert configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save alert configuration');
      console.error('Error saving alert configuration:', error);
    }
  };

  const handleCancel = () => {
    navigate('/floor-plans/analytics');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alert Configuration"
        actions={[
          {
            label: 'Back',
            onClick: () => navigate('/floor-plans/analytics'),
          },
        ]}
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="alertName">Alert Name</Label>
                <Input
                  id="alertName"
                  {...register('alertName', {
                    required: 'Alert name is required',
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description:</Label>
                <Textarea
                  id="description"
                  rows={4}
                  {...register('description', {
                    required: 'Description is required',
                  })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Floor Map Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Floor Map Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {mockRooms.map((room) => (
                  <div
                    key={room.id}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200"
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${getStatusColor(
                        room.status
                      )}`}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {room.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Legend
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-gray-600">Normal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
                    <span className="text-gray-600">Warning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                    <span className="text-gray-600">Alert</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location and Scope */}
        <Card>
          <CardHeader>
            <CardTitle>Location and Scope</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="building">Building:</Label>
                <Controller
                  control={control}
                  name="building"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="building">
                        <SelectValue placeholder="Select building" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="building-a">Building A</SelectItem>
                        <SelectItem value="building-b">Building B</SelectItem>
                        <SelectItem value="building-c">Building C</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor:</Label>
                <Controller
                  control={control}
                  name="floor"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="floor">
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="floor-1">Floor 1</SelectItem>
                        <SelectItem value="floor-2">Floor 2</SelectItem>
                        <SelectItem value="floor-3">Floor 3</SelectItem>
                        <SelectItem value="ground">Ground Floor</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zoneRoom">Zone/Room:</Label>
                <Controller
                  control={control}
                  name="zoneRoom"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="zoneRoom">
                        <SelectValue placeholder="Select zone/room" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-rooms">All Rooms</SelectItem>
                        <SelectItem value="room-101">Room 101</SelectItem>
                        <SelectItem value="room-102">Room 102</SelectItem>
                        <SelectItem value="room-103">Room 103</SelectItem>
                        <SelectItem value="kitchen">Kitchen</SelectItem>
                        <SelectItem value="reception">Reception</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Alert Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="parameter">Parameter:</Label>
                <Controller
                  control={control}
                  name="parameter"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="parameter">
                        <SelectValue placeholder="Select parameter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temperature">Temperature</SelectItem>
                        <SelectItem value="humidity">Humidity</SelectItem>
                        <SelectItem value="pressure">Pressure</SelectItem>
                        <SelectItem value="motion">Motion</SelectItem>
                        <SelectItem value="battery">Battery</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition:</Label>
                <Controller
                  control={control}
                  name="condition"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="condition">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greater-than">
                          Greater than
                        </SelectItem>
                        <SelectItem value="less-than">Less than</SelectItem>
                        <SelectItem value="equal-to">Equal to</SelectItem>
                        <SelectItem value="not-equal-to">
                          Not equal to
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Threshold:</Label>
                <Input
                  id="threshold"
                  type="number"
                  {...register('threshold', {
                    required: 'Threshold is required',
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Condition:</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 5 minutes"
                  {...register('duration', {
                    required: 'Duration is required',
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Controller
                  control={control}
                  name="emailNotification"
                  render={({ field }) => (
                    <Checkbox
                      id="emailNotification"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <Label
                  htmlFor="emailNotification"
                  className="text-sm font-medium cursor-pointer"
                >
                  Email Notification SMS
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Controller
                  control={control}
                  name="pushNotification"
                  render={({ field }) => (
                    <Checkbox
                      id="pushNotification"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
                <Label
                  htmlFor="pushNotification"
                  className="text-sm font-medium cursor-pointer"
                >
                  Notification Push Notification
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="outline"
            className="bg-gray-100 text-gray-700"
          >
            Save
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            className="bg-primary text-white"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
