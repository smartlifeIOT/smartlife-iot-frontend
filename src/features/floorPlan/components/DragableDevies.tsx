//   DragableDevies
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Device } from '../types';

const DragableDevies = ({
  device,
  handleDragStart,
  getStatusColor,
}: {
  device: Device;
  handleDragStart: (e: React.DragEvent, device: Device) => void;
  getStatusColor: (status: string) => string;
}) => {
  // Remove react-dnd since we're using native HTML5 drag and drop
  // const ref = useRef<HTMLDivElement>(null);
  // const [{ isDragging }, drag] = useDrag(() => ({
  //   type: 'device',
  //   item: { device },
  //   collect: (monitor) => ({
  //     isDragging: monitor.isDragging(),
  //   }),
  // }));
  // drag(ref);

  return (
    <div 
      style={{
        cursor: 'move',
      }}
    >
      <Card
        key={device.id}
        draggable={true}
        onDragStart={(e) => {
          e.stopPropagation();
          handleDragStart(e, device);
        }}
        className="cursor-move hover:shadow-md transition-shadow border-gray-200"
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <span
                className={`inline-block w-3 h-3 rounded-full ${getStatusColor(
                  device.status
                )}`}
                title={device.status}
              />
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">
                  {device.name}
                </p>
                <p className="text-xs text-gray-600">
                  Status:{' '}
                  {device.status.charAt(0).toUpperCase() +
                    device.status.slice(1)}{' '}
                  | Type: {device.type}
                  {device.assignedTo && <> | Assigned to zone</>}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DragableDevies;
