import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDevice } from '@/features/devices/hooks';
import { devicesApi } from '@/services/api';
import toast from 'react-hot-toast';

interface DeviceGeneralTabProps {
  deviceId: string;
}

export const DeviceGeneralTab: React.FC<DeviceGeneralTabProps> = ({
  deviceId,
}) => {
  const { t } = useTranslation();
  const { data: deviceData } = useDevice(deviceId);
  const device = deviceData?.data?.data;

  const [formData, setFormData] = useState({
    deviceName: '',
    deviceLabel: '',
    deviceType: '',
    deviceProfile: '',
    description: '',
    building: '',
    floor: '',
    room: '',
    gpsLatitude: '',
    gpsLongitude: '',
  });

  // Initialize form data when device data is loaded
  useEffect(() => {
    if (device) {
      setFormData({
        deviceName: device.name || '',
        deviceLabel: device.label || '',
        deviceType: device.type || '',
        deviceProfile: device.deviceProfileId || '',
        description: device.description || '',
        building: device.metadata?.building || '',
        floor: device.metadata?.floor || '',
        room: device.metadata?.room || '',
        gpsLatitude:
          device.metadata?.gpsLatitude || device.location?.split(',')[0] || '',
        gpsLongitude:
          device.metadata?.gpsLongitude || device.location?.split(',')[1] || '',
      });
    }
  }, [device]);

  // Fetch device profiles
  const { data: deviceProfiles } = useQuery({
    queryKey: ['device-profiles'],
    queryFn: async () => {
      const { deviceProfilesApi } = await import('@/services/api/profiles.api');
      const response = await deviceProfilesApi.getAll();
      return response.data;
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      // Prepare update data
      const updateData = {
        name: formData.deviceName,
        label: formData.deviceLabel,
        type: formData.deviceType,
        deviceProfileId: formData.deviceProfile,
        description: formData.description,
        metadata: {
          building: formData.building,
          floor: formData.floor,
          room: formData.room,
          gpsLatitude: formData.gpsLatitude,
          gpsLongitude: formData.gpsLongitude,
        },
        location:
          formData.gpsLatitude && formData.gpsLongitude
            ? `${formData.gpsLatitude},${formData.gpsLongitude}`
            : undefined,
      };

      // await devicesApi.update(deviceId, updateData);
      toast.success(t('devices.details.general.messages.success'));
    } catch (error) {
      console.error('Failed to save device settings:', error);
      toast.error(t('devices.details.general.messages.error'));
    }
  };

  const handleCancel = () => {
    // Reset form to original device data
    if (device) {
      setFormData({
        deviceName: device.name || '',
        deviceLabel: device.label || '',
        deviceType: device.type || '',
        deviceProfile: device.deviceProfileId || '',
        description: device.description || '',
        building: device.metadata?.building || '',
        floor: device.metadata?.floor || '',
        room: device.metadata?.room || '',
        gpsLatitude:
          device.metadata?.gpsLatitude || device.location?.split(',')[0] || '',
        gpsLongitude:
          device.metadata?.gpsLongitude || device.location?.split(',')[1] || '',
      });
    }
    toast(t('devices.details.general.messages.cancelled'), { icon: 'ℹ️' });
  };

  // Mock data for dropdowns (replace with actual API calls)
  const deviceTypes = [
    'Temperature Sensor',
    'Humidity Sensor',
    'Pressure Sensor',
    'Motion Sensor',
    'Gateway',
    'Actuator',
    'Controller',
  ];

  const buildings = ['Building A', 'Building B', 'Building C'];
  const floors = ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'];
  const rooms = ['Room 101', 'Room 201', 'Room 301', 'Room 401'];

  return (
    <div className="space-y-6">
      {/* General Settings Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t('devices.details.general.title')}
          </h2>

          {/* Device Details Section */}
          <div className="space-y-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('devices.details.general.sectionDevice')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="deviceName"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  {t('devices.details.general.name')}
                </Label>
                <Input
                  id="deviceName"
                  name="deviceName"
                  value={formData.deviceName}
                  onChange={handleInputChange}
                  placeholder={t('devices.details.general.namePlaceholder')}
                  className="w-full"
                />
              </div>

              <div>
                <Label
                  htmlFor="deviceLabel"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  {t('devices.details.general.label')}
                </Label>
                <Input
                  id="deviceLabel"
                  name="deviceLabel"
                  value={formData.deviceLabel}
                  onChange={handleInputChange}
                  placeholder={t('devices.details.general.labelPlaceholder')}
                  className="w-full"
                />
              </div>

              <div>
                <Label
                  htmlFor="deviceType"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  {t('devices.details.general.type')}
                </Label>
                <Select
                  value={formData.deviceType}
                  onValueChange={(value) =>
                    handleSelectChange('deviceType', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('devices.details.general.typePlaceholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="deviceProfile"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  {t('devices.details.general.profile')}
                </Label>
                {/* <Select
                  value={formData.deviceProfile}
                  onValueChange={(value) =>
                    handleSelectChange('deviceProfile', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select device profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceProfiles?.data?.data?.map(
                      (profile: { id: string; name: string }) => (
                        <SelectItem key={profile.id} value={profile.id}>
                          {profile.name}
                        </SelectItem>
                      )
                    ) || []}
                  </SelectContent>
                </Select> */}
              </div>
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                {t('devices.details.general.description')}
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t(
                  'devices.details.general.descriptionPlaceholder'
                )}
                className="w-full min-h-[100px]"
                rows={4}
              />
            </div>
          </div>

          {/* Location Settings Section */}
          <div className="space-y-6 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('devices.details.general.sectionLocation')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label
                  htmlFor="building"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  {t('devices.details.general.building')}
                </Label>
                <Select
                  value={formData.building}
                  onValueChange={(value) =>
                    handleSelectChange('building', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        'devices.details.general.buildingPlaceholder'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((building) => (
                      <SelectItem key={building} value={building}>
                        {building}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="floor"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  {t('devices.details.general.floor')}
                </Label>
                <Select
                  value={formData.floor}
                  onValueChange={(value) => handleSelectChange('floor', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        'devices.details.general.floorPlaceholder'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {floors.map((floor) => (
                      <SelectItem key={floor} value={floor}>
                        {floor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="room"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  {t('devices.details.general.room')}
                </Label>
                <Select
                  value={formData.room}
                  onValueChange={(value) => handleSelectChange('room', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('devices.details.general.roomPlaceholder')}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="gpsLatitude"
                  className="text-sm font-medium text-gray-700 mb-2 block"
                >
                  {t('devices.details.general.gpsCoordinates')}
                </Label>
                <Input
                  id="gpsLatitude"
                  name="gpsLatitude"
                  type="number"
                  step="any"
                  value={formData.gpsLatitude}
                  onChange={handleInputChange}
                  placeholder={t('devices.details.general.latitudePlaceholder')}
                  className="w-full"
                />
              </div>

              <div>
                <Label
                  htmlFor="gpsLongitude"
                  className="text-sm font-medium text-gray-700 mb-2 block opacity-0"
                >
                  {t('devices.details.general.gpsCoordinates')}
                </Label>
                <Input
                  id="gpsLongitude"
                  name="gpsLongitude"
                  type="number"
                  step="any"
                  value={formData.gpsLongitude}
                  onChange={handleInputChange}
                  placeholder={t(
                    'devices.details.general.longitudePlaceholder'
                  )}
                  className="w-full "
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={handleCancel}
          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          {t('devices.details.general.cancel')}
        </Button>
        <Button
          onClick={handleSave}
          className="bg-secondary hover:bg-secondary/90 text-white"
        >
          {t('devices.details.general.saveChanges')}
        </Button>
      </div>
    </div>
  );
};
