// import { Input } from '@/components/ui/input.tsx';
// import { Label } from '@/components/ui/label.tsx';
// import { Button } from '@/components/ui/button.tsx';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Search, X } from 'lucide-react';
// import type { DeviceFilters as Filters } from '../types';

// interface DeviceFiltersProps {
//   filters: Filters;
//   onFiltersChange: (filters: Filters) => void;
//   onReset: () => void;
// }

// export const DeviceFilters = ({ filters, onFiltersChange, onReset }: DeviceFiltersProps) => {
//   return (
//     <div className="space-y-4 p-4 bg-card rounded-lg border">
//       <div className="flex items-center justify-between">
//         <h3 className="font-semibold">Filters</h3>
//         <Button variant="ghost" size="sm" onClick={onReset}>
//           <X className="h-4 w-4 mr-1" />
//           Clear
//         </Button>
//       </div>

//       <div className="space-y-3">
//         <div className="space-y-2">
//           <Label htmlFor="search">Search</Label>
//           <div className="relative">
//             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//             <Input
//               id="search"
//               placeholder="Search devices..."
//               value={filters.search || ''}
//               onChange={(e) =>
//                 onFiltersChange({ ...filters, search: e.target.value })
//               }
//               className="pl-8"
//             />
//           </div>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="type">Device Type</Label>
//           <Select
//             value={filters.type || 'all'}
//             onValueChange={(value) =>
//               onFiltersChange({ ...filters, type: value === 'all' ? undefined : value })
//             }
//           >
//             <SelectTrigger id="type">
//               <SelectValue placeholder="Select type" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Types</SelectItem>
//               <SelectItem value="sensor">Sensor</SelectItem>
//               <SelectItem value="gateway">Gateway</SelectItem>
//               <SelectItem value="actuator">Actuator</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="status">Status</Label>
//           <Select
//             value={filters.active === undefined ? 'all' : filters.active ? 'active' : 'inactive'}
//             onValueChange={(value) =>
//               onFiltersChange({
//                 ...filters,
//                 active: value === 'all' ? undefined : value === 'active',
//               })
//             }
//           >
//             <SelectTrigger id="status">
//               <SelectValue placeholder="Select status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Status</SelectItem>
//               <SelectItem value="active">Active</SelectItem>
//               <SelectItem value="inactive">Inactive</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//       </div>
//     </div>
//   );
// };