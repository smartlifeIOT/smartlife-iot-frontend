// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button.tsx';
// import { MoreVertical, Activity, Calendar } from 'lucide-react';
// import type { Device } from '@/services/api/devices.api.ts';
// import { formatDistanceToNow } from 'date-fns';

// interface DeviceCardProps {
//   device: Device;
//   onSelect?: (deviceId: string) => void;
//   onAction?: (action: string, deviceId: string) => void;
// }

// export const DeviceCard = ({ device, onAction }: DeviceCardProps) => {
//   const getStatusColor = (active?: boolean) => {
//     if (active === undefined) return 'default';
//     return active ? 'success' : 'secondary';
//   };

//   return (
//     <Card className="hover:shadow-lg transition-shadow cursor-pointer">
//       <CardHeader className="flex flex-row items-center justify-between pb-2">
//         <CardTitle className="text-base font-medium">{device.name}</CardTitle>
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={(e) => {
//             e.stopPropagation();
//             onAction?.('menu', device.id);
//           }}
//         >
//           <MoreVertical className="h-4 w-4" />
//         </Button>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-3">
//           <div className="flex items-center justify-between">
//             <span className="text-sm text-muted-foreground">Type</span>
//             <Badge variant="outline">{device.type}</Badge>
//           </div>

//           <div className="flex items-center justify-between">
//             <span className="text-sm text-muted-foreground">Status</span>
//             <Badge variant={getStatusColor(device.active) as any}>
//               {device.active ? 'Active' : 'Inactive'}
//             </Badge>
//           </div>

//           {device.lastActivityTime && (
//             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//               <Activity className="h-3 w-3" />
//               <span>
//                 Last seen {formatDistanceToNow(new Date(device.lastActivityTime))} ago
//               </span>
//             </div>
//           )}

//           {device.createdAt && (
//             <div className="flex items-center gap-2 text-sm text-muted-foreground">
//               <Calendar className="h-3 w-3" />
//               <span>
//                 Created {formatDistanceToNow(new Date(device.createdAt))} ago
//               </span>
//             </div>
//           )}

//           {device.label && (
//             <div className="text-sm text-muted-foreground">
//               Label: {device.label}
//             </div>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// };