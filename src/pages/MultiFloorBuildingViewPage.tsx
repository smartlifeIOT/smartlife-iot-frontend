import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog/DeleteConfirmationDialog';
import { Edit, Trash2, Download, Box } from 'lucide-react';

interface Floor {
  id: string;
  name: string;
  area: number;
  rooms: number;
  devices: number;
  activeDevices: number;
  offlineDevices: number;
  lastUpdated: string;
  dwgFile: string;
}

interface Room {
  id: string;
  name: string;
  deviceLabel: string;
  deviceType: 'gateway' | 'sensor';
  deviceId: string;
  color: string;
}

interface DeviceSummary {
  type: string;
  status: 'online' | 'offline';
  count: number;
  devices: string[];
  color: string;
}

const mockFloors: Floor[] = [
  {
    id: 'ground',
    name: 'Ground Floor',
    area: 1200,
    rooms: 5,
    devices: 6,
    activeDevices: 4,
    offlineDevices: 2,
    lastUpdated: '2 hours ago',
    dwgFile: 'ground_floor_v2.dwg',
  },
  {
    id: 'second',
    name: 'Second Floor',
    area: 1200,
    rooms: 4,
    devices: 5,
    activeDevices: 5,
    offlineDevices: 0,
    lastUpdated: '1 hour ago',
    dwgFile: 'second_floor_v1.dwg',
  },
];

const mockRooms: Record<string, Room[]> = {
  ground: [
    {
      id: 'room-1',
      name: 'Conference Room',
      deviceLabel: 'GW-01',
      deviceType: 'gateway',
      deviceId: 'gw-01',
      color: 'bg-yellow-100 border-yellow-300',
    },
    {
      id: 'room-2',
      name: 'Office 101',
      deviceLabel: 'S-05',
      deviceType: 'sensor',
      deviceId: 's-05',
      color: 'bg-green-100 border-green-300',
    },
    {
      id: 'room-3',
      name: 'Office 102',
      deviceLabel: 'S-12',
      deviceType: 'sensor',
      deviceId: 's-12',
      color: 'bg-blue-100 border-blue-300',
    },
    {
      id: 'room-4',
      name: 'Conference Room',
      deviceLabel: 'GW-01',
      deviceType: 'gateway',
      deviceId: 'gw-01',
      color: 'bg-purple-100 border-purple-300',
    },
    {
      id: 'room-5',
      name: 'Kitchen',
      deviceLabel: 'S-15',
      deviceType: 'sensor',
      deviceId: 's-15',
      color: 'bg-red-100 border-red-300',
    },
  ],
  second: [
    {
      id: 'room-6',
      name: 'Office 201',
      deviceLabel: 'S-20',
      deviceType: 'sensor',
      deviceId: 's-20',
      color: 'bg-green-100 border-green-300',
    },
    {
      id: 'room-7',
      name: 'Office 202',
      deviceLabel: 'GW-02',
      deviceType: 'gateway',
      deviceId: 'gw-02',
      color: 'bg-yellow-100 border-yellow-300',
    },
    {
      id: 'room-8',
      name: 'Meeting Room',
      deviceLabel: 'S-25',
      deviceType: 'sensor',
      deviceId: 's-25',
      color: 'bg-blue-100 border-blue-300',
    },
    {
      id: 'room-9',
      name: 'Break Room',
      deviceLabel: 'S-30',
      deviceType: 'sensor',
      deviceId: 's-30',
      color: 'bg-purple-100 border-purple-300',
    },
  ],
};

const mockDeviceSummaries: Record<string, DeviceSummary[]> = {
  ground: [
    {
      type: 'Gateways',
      status: 'online',
      count: 1,
      devices: ['GW-01'],
      color: 'bg-blue-100 text-blue-700',
    },
    {
      type: 'Temperature Sensors',
      status: 'online',
      count: 3,
      devices: ['S-05', 'S-08', 'S-12'],
      color: 'bg-pink-100 text-pink-700',
    },
    {
      type: 'Humidity Sensors',
      status: 'offline',
      count: 1,
      devices: ['S-15'],
      color: 'bg-green-100 text-green-700',
    },
    {
      type: 'Motion Sensors',
      status: 'online',
      count: 1,
      devices: ['S-20'],
      color: 'bg-green-100 text-green-700',
    },
  ],
  second: [
    {
      type: 'Gateways',
      status: 'online',
      count: 1,
      devices: ['GW-02'],
      color: 'bg-blue-100 text-blue-700',
    },
    {
      type: 'Temperature Sensors',
      status: 'online',
      count: 2,
      devices: ['S-20', 'S-25'],
      color: 'bg-pink-100 text-pink-700',
    },
    {
      type: 'Motion Sensors',
      status: 'online',
      count: 2,
      devices: ['S-30', 'S-35'],
      color: 'bg-green-100 text-green-700',
    },
  ],
};

const getDeviceDotColor = (deviceType: string): string => {
  if (deviceType === 'gateway') return 'bg-yellow-500';
  if (deviceType === 'sensor') return 'bg-green-500';
  return 'bg-gray-500';
};

export default function MultiFloorBuildingViewPage() {
  const navigate = useNavigate();
  const [selectedFloor, setSelectedFloor] = useState<string>('ground');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [floorToDelete, setFloorToDelete] = useState<string | null>(null);
  const currentFloor = mockFloors.find((f) => f.id === selectedFloor) || mockFloors[0];
  const currentRooms = mockRooms[selectedFloor] || [];
  const currentDeviceSummary = mockDeviceSummaries[selectedFloor] || [];

  const handleDeleteFloor = () => {
    if (floorToDelete) {
      // TODO: Implement delete functionality
      console.log('Deleting floor:', floorToDelete);
      setIsDeleteDialogOpen(false);
      setFloorToDelete(null);
    }
  };

  const handleEditFloor = () => {
    // TODO: Navigate to edit floor page
    console.log('Editing floor:', selectedFloor);
  };

  const handleExportData = () => {
    // TODO: Implement export functionality
    console.log('Exporting data for floor:', selectedFloor);
  };

  const handleView3D = () => {
    // TODO: Navigate to 3D view
    navigate('/floor-plans/create?step=5');
  };

  const handleAddFloor = () => {
    // TODO: Navigate to add floor page
    console.log('Adding new floor');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Multi-Floor Building View - Building A"
        actions={[
          {
            label: 'Back',
            onClick: () => navigate('/floor-plans'),
          },
        ]}
      />

      {/* Floor Navigation Tabs */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Tabs value={selectedFloor} onValueChange={setSelectedFloor} defaultValue={selectedFloor}>
              <TabsList className="grid w-full grid-cols-3">
                {mockFloors.map((floor) => (
                  <TabsTrigger
                    key={floor.id}
                    value={floor.id}
                    className="data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    {floor.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <Button
              variant="outline"
              onClick={handleAddFloor}
              className="whitespace-nowrap"
            >
              + Add Floor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        {/* Left Panel - Floor Plan */}
        <Card>
          <CardHeader>
            <CardTitle>{currentFloor.name} Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2  gap-4">
              {currentRooms.map((room) => (
                <Card
                  key={room.id}
                  className={`${room.color} border-2 cursor-pointer hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${getDeviceDotColor(
                          room.deviceType
                        )}`}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">{room.name}</p>
                        <p className="text-xs text-gray-600">{room.deviceLabel}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Buttons */}
            
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => navigate('/floor-plans')}>
                Back
              </Button>
              <Button variant="outline" onClick={handleEditFloor}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Floor
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFloorToDelete(selectedFloor);
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Floor
              </Button>
              <Button onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Floor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Floor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Floor Details */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-gray-700">
                {currentFloor.name} Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Area:</span>
                  <span className="font-medium">{currentFloor.area.toLocaleString()} sq ft</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rooms:</span>
                  <span className="font-medium">{currentFloor.rooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Devices:</span>
                  <span className="font-medium">
                    {currentFloor.devices} ({currentFloor.activeDevices} Active,{' '}
                    {currentFloor.offlineDevices} Offline)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">{currentFloor.lastUpdated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">DWG File:</span>
                  <span className="font-medium text-xs">{currentFloor.dwgFile}</span>
                </div>
              </div>
            </div>

            {/* Device Summary */}
            <div>
              <h3 className="font-semibold text-sm mb-3 text-gray-700">Device Summary</h3>
              <div className="space-y-2">
                {currentDeviceSummary.map((summary, index) => (
                  <div
                    key={index}
                    className={`${summary.color} rounded-lg p-3 border`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{summary.type}</span>
                      <Badge
                        variant={summary.status === 'online' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {summary.count} {summary.status === 'online' ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{summary.devices.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* View 3D Button */}
            <Button className="w-full" onClick={handleView3D}>
              <Box className="mr-2 h-4 w-4" />
              View 3D
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setFloorToDelete(null);
          }
        }}
        onConfirm={handleDeleteFloor}
        title="Delete Floor"
        description={`Are you sure you want to delete ${currentFloor.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}

