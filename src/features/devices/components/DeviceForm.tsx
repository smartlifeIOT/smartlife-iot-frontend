// import { useForm } from 'react-hook-form';
// import { Button } from '@/components/ui/button.tsx';
// import { Input } from '@/components/ui/input.tsx';
// import { Label } from '@/components/ui/label.tsx';
// import { Textarea } from '@/components/ui/textarea.tsx';
// import type { DeviceFormData } from '../types/index.ts';

// interface DeviceFormProps {
//   initialData?: Partial<DeviceFormData>;
//   onSubmit: (data: DeviceFormData) => void;
//   onCancel?: () => void;
//   isLoading?: boolean;
// }

// export const DeviceForm = ({
//   initialData,
//   onSubmit,
//   onCancel,
//   isLoading,
// }: DeviceFormProps) => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<DeviceFormData>({
//     defaultValues: initialData,
//   });

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//       <div className="space-y-2">
//         <Label htmlFor="name">Device Name *</Label>
//         <Input
//           id="name"
//           {...register('name', { required: 'Device name is required' })}
//           placeholder="Enter device name"
//         />
//         {errors.name && (
//           <p className="text-sm text-destructive">{errors.name.message}</p>
//         )}
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="type">Device Type *</Label>
//         <Input
//           id="type"
//           {...register('type', { required: 'Device type is required' })}
//           placeholder="Enter device type"
//         />
//         {errors.type && (
//           <p className="text-sm text-destructive">{errors.type.message}</p>
//         )}
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="label">Label</Label>
//         <Input
//           id="label"
//           {...register('label')}
//           placeholder="Enter device label (optional)"
//         />
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="deviceProfileId">Device Profile ID</Label>
//         <Input
//           id="deviceProfileId"
//           {...register('deviceProfileId')}
//           placeholder="Enter device profile ID (optional)"
//         />
//       </div>

//       <div className="space-y-2">
//         <Label htmlFor="description">Description</Label>
//         <Textarea
//           id="description"
//           {...register('description')}
//           placeholder="Enter device description (optional)"
//           rows={3}
//         />
//       </div>

//       <div className="flex gap-2 justify-end">
//         {onCancel && (
//           <Button type="button" variant="outline" onClick={onCancel}>
//             Cancel
//           </Button>
//         )}
//         <Button type="submit" disabled={isLoading}>
//           {isLoading ? 'Saving...' : 'Save Device'}
//         </Button>
//       </div>
//     </form>
//   );
// };