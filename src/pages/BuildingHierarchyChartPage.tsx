import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tree, TreeNode } from 'react-organizational-chart';

interface HierarchyNode {
  id: string;
  name: string;
  type: 'building' | 'floor' | 'room' | 'device';
  status?: 'online' | 'offline' | 'warning' | 'error';
  deviceType?: 'sensor' | 'gateway' | 'controller';
  description?: string;
  stats?: string;
  children?: HierarchyNode[];
  expanded?: boolean;
}

const mockHierarchyData: HierarchyNode = {
  id: 'building-a',
  name: 'Building A',
  type: 'building',
  description: 'Main Office',
  stats: '3 Floors | 24 Rooms | 48 Devices',
  expanded: true,
  children: [
    {
      id: 'floor-1',
      name: 'Floor 1',
      type: 'floor',
      stats: '8 Rooms | 16 Devices',
      expanded: true,
      children: [
        {
          id: 'room-105',
          name: 'Room 105',
          type: 'room',
          status: 'online',
          stats: '2 Devices',
          expanded: true,
          children: [
            {
              id: 'device-temp-105',
              name: 'TempSensor',
              type: 'device',
              status: 'online',
              deviceType: 'sensor',
            },
            {
              id: 'device-motion-105',
              name: 'MotionSensor',
              type: 'device',
              status: 'online',
              deviceType: 'sensor',
            },
          ],
        },
        {
          id: 'room-103',
          name: 'Room 103',
          type: 'room',
          status: 'warning',
          stats: '2 Devices',
          expanded: true,
          children: [
            {
              id: 'device-temp-103',
              name: 'TempSensor',
              type: 'device',
              status: 'online',
              deviceType: 'sensor',
            },
            {
              id: 'device-motion-103',
              name: 'MotionSensor',
              type: 'device',
              status: 'warning',
              deviceType: 'sensor',
            },
          ],
        },
        {
          id: 'room-101',
          name: 'Room 101',
          type: 'room',
          status: 'error',
          stats: '2 Devices',
          expanded: false,
          children: [
            {
              id: 'device-temp-101',
              name: 'TempSensor',
              type: 'device',
              status: 'offline',
              deviceType: 'sensor',
            },
            {
              id: 'device-motion-101',
              name: 'MotionSensor',
              type: 'device',
              status: 'online',
              deviceType: 'sensor',
            },
          ],
        },
        {
          id: 'room-109',
          name: 'Room 109',
          type: 'room',
          status: 'online',
          stats: '2 Devices',
          expanded: false,
          children: [
            {
              id: 'device-temp-109',
              name: 'TempSensor',
              type: 'device',
              status: 'online',
              deviceType: 'sensor',
            },
            {
              id: 'device-motion-109',
              name: 'MotionSensor',
              type: 'device',
              status: 'online',
              deviceType: 'sensor',
            },
          ],
        },
      ],
    },
    {
      id: 'floor-2',
      name: 'Floor 2',
      type: 'floor',
      stats: '8 Rooms | 16 Devices',
      expanded: false,
      children: [],
    },
    {
      id: 'floor-3',
      name: 'Floor 3',
      type: 'floor',
      stats: '8 Rooms | 16 Devices',
      expanded: false,
      children: [],
    },
  ],
};

const getNodeColor = (node: HierarchyNode): string => {
  if (node.type === 'building' || node.type === 'floor') {
    return 'bg-purple-700 text-white';
  }

  if (node.type === 'device') {
    if (node.deviceType === 'sensor') {
      return 'bg-blue-400 text-white';
    }
    if (node.deviceType === 'gateway') {
      return 'bg-pink-600 text-white';
    }
    if (node.deviceType === 'controller') {
      return 'bg-orange-600 text-white';
    }
  }

  if (node.type === 'room') {
    if (node.status === 'online') {
      return 'bg-blue-700 text-white';
    }
    if (node.status === 'warning') {
      return 'bg-pink-500 text-white';
    }
    if (node.status === 'error' || node.status === 'offline') {
      return 'bg-orange-500 text-white';
    }
  }

  return 'bg-gray-500 text-white';
};

interface CustomTreeNodeProps {
  node: HierarchyNode;
  onToggle: (nodeId: string) => void;
}

const CustomTreeNode: React.FC<CustomTreeNodeProps> = ({ node, onToggle }) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = node.expanded || false;

  const handleToggle = () => {
    if (hasChildren) {
      onToggle(node.id);
    }
  };

  const nodeLabel = (
    <div className="flex flex-col items-center">
      {/* Node Content */}
      <div
        className={`${getNodeColor(node)} rounded-lg px-4 py-3 shadow-md min-w-[200px] max-w-[250px]`}
      >
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-sm">{node.name}</div>
          {node.description && (
            <div className="text-xs opacity-90">{node.description}</div>
          )}
          {node.stats && (
            <div className="text-xs opacity-80">{node.stats}</div>
          )}
          {node.type === 'device' && node.status && (
            <Badge
              variant="outline"
              className="mt-1 text-xs bg-white/20 text-white border-white/30 w-fit"
            >
              {node.status.charAt(0).toUpperCase() + node.status.slice(1)}
            </Badge>
          )}
        </div>
      </div>

      {/* Expand/Collapse Button for Rooms */}
      {hasChildren && node.type === 'room' && (
        <button
          onClick={handleToggle}
          className="mt-2 text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-700"
        >
          {isExpanded ? '- Hide Devices' : '+ Show Devices'}
        </button>
      )}
    </div>
  );

  if (!hasChildren || !isExpanded) {
    return <TreeNode label={nodeLabel} />;
  }

  return (
    <TreeNode label={nodeLabel}>
      {node.children?.map((child) => (
        <CustomTreeNode key={child.id} node={child} onToggle={onToggle} />
      ))}
    </TreeNode>
  );
};

export default function BuildingHierarchyChartPage() {
  const navigate = useNavigate();
  const [hierarchyData, setHierarchyData] = useState<HierarchyNode>(mockHierarchyData);

  const toggleNode = (nodeId: string) => {
    const updateNode = (node: HierarchyNode): HierarchyNode => {
      if (node.id === nodeId) {
        return { ...node, expanded: !node.expanded };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map(updateNode),
        };
      }
      return node;
    };

    setHierarchyData(updateNode(hierarchyData));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Building A - Hierarchy Chart"
        actions={[
          {
            label: 'Back',
            onClick: () => navigate('/floor-plans/analytics'),
          },
        ]}
      />
      <div className="grid gap-6  ">
        {/* Hierarchy Chart */}
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto overflow-y-auto min-h-[600px] max-h-[800px]">
              <style>
                {`
                  .orgchart {
                    background: transparent;
                  }
                  .orgchart .node {
                    padding: 20px;
                  }
                  .orgchart .lines .topLine {
                    border-top: 2px dashed #9CA3AF;
                  }
                  .orgchart .lines .leftLine {
                    border-left: 2px dashed #9CA3AF;
                  }
                  .orgchart .lines .rightLine {
                    border-right: 2px dashed #9CA3AF;
                  }
                  .orgchart .lines .downLine {
                    background-color: #9CA3AF;
                    height: 2px;
                  }
                `}
              </style>
              <Tree
                label={
                  <div className="flex flex-col items-center">
                    <div
                      className={`${getNodeColor(hierarchyData)} rounded-lg px-4 py-3 shadow-md min-w-[200px] max-w-[250px]`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="font-semibold text-sm">
                          {hierarchyData.name}
                        </div>
                        {hierarchyData.description && (
                          <div className="text-xs opacity-90">
                            {hierarchyData.description}
                          </div>
                        )}
                        {hierarchyData.stats && (
                          <div className="text-xs opacity-80">
                            {hierarchyData.stats}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                }
              >
                {hierarchyData.children?.map((child) => (
                  <CustomTreeNode key={child.id} node={child} onToggle={toggleNode} />
                ))}
              </Tree>
            </div>
          </CardContent>
        </Card>

        {/* Status Legend */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Legend
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-blue-700" />
                <span className="text-sm text-gray-700">All Devices Online</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-blue-400" />
                <span className="text-sm text-gray-700">Sensor Device</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-pink-500" />
                <span className="text-sm text-gray-700">Some Devices Warning</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-pink-600" />
                <span className="text-sm text-gray-700">Gateway Device</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-orange-500" />
                <span className="text-sm text-gray-700">Device(s) Offline/Error</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-orange-600" />
                <span className="text-sm text-gray-700">Controller Device</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded bg-purple-700" />
                <span className="text-sm text-gray-700">Building/Floor</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
