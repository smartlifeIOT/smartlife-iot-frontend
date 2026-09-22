import React, { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Control, Controller, UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  UploadCloud,
  FileText,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { FilterFormValues } from '@/features/floorPlan/types';
import { useFloorMapStore } from '@/features/floorPlan/store';
import apiClient from '@/lib/axios';

interface DwgImportStepProps {
  register: UseFormRegister<FilterFormValues>;
  control: Control<FilterFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

interface UploadedFile {
  id: string;
  file: File;
  floor: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  previewUrl?: string;
  fileUrl?: string;
}

const floorOptions = [
  { value: 'Ground', label: 'Ground Floor' },
  { value: '1st', label: '1st Floor' },
  { value: '2nd', label: '2nd Floor' },
  { value: '3rd', label: '3rd Floor' },
  { value: '4th', label: '4th Floor' },
  { value: '5th', label: '5th Floor' },
];

export const DwgImportStep: React.FC<DwgImportStepProps> = ({
  register,
  control,
  onPrevious,
  onNext,
}) => {
  const { floorPlanId, selectedFloor, setParsedGeometry, setZones } =
    useFloorMapStore();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const isUploading = useMemo(
    () => uploadedFiles.some((f) => f.status === 'uploading'),
    [uploadedFiles]
  );

  // Create preview URL for image files and DWG files
  const createFilePreview = useCallback((file: File): string | undefined => {
    // Create blob URL for images and DWG/DXF files
    // Note: For actual DWG rendering, you'd need a specialized library
    // This creates a blob URL that can be used to reference the file
    if (
      file.name.endsWith('.dwg') ||
      file.name.endsWith('.dxf') ||
      file.type.includes('dwg') ||
      file.type.includes('dxf') ||
      file.type.includes('acad')
    ) {
      return URL.createObjectURL(file);
    }
    return undefined;
  }, []);

  // Format file size
  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }, []);

  // Upload file to API
  const uploadFile = useCallback(
    async (fileItem: UploadedFile) => {
      if (!floorPlanId) {
        toast.error(
          'Floor plan ID is missing. Please go back and create a floor plan first.'
        );
        return;
      }

      // Update status to uploading
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id ? { ...f, status: 'uploading', progress: 0 } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append('file', fileItem.file);
        if (fileItem.floor) {
          formData.append('floor', fileItem.floor);
        }

        const response = await apiClient.post(
          `/floor-plans/${floorPlanId}/dwg-upload`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                setUploadedFiles((prev) =>
                  prev.map((f) =>
                    f.id === fileItem.id ? { ...f, progress } : f
                  )
                );
              }
            },
          }
        );

        // Update status to completed — backend returns { fileUrl, floor?, parsedGeometry? }
        const responseData = response.data?.data;
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id
              ? {
                  ...f,
                  status: 'completed' as const,
                  progress: 100,
                  fileUrl: responseData?.fileUrl,
                }
              : f
          )
        );

        // Store parsed geometry in Zustand so ZoneSetupStep can display it as
        // an architectural reference drawing. Zones are NOT auto-created from
        // parsed rooms — the user draws all zones manually in ZoneSetupStep.
        if (responseData?.parsedGeometry) {
          setParsedGeometry(responseData.parsedGeometry);
          // Clear any previously drawn zones when a new file is uploaded
          setZones([]);
        }

        toast.success(`File "${fileItem.file.name}" uploaded successfully`);
      } catch (error: unknown) {
        // Update status to error
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === fileItem.id ? { ...f, status: 'error', progress: 0 } : f
          )
        );

        const errorMessage =
          error &&
          typeof error === 'object' &&
          'response' in error &&
          error.response &&
          typeof error.response === 'object' &&
          'data' in error.response &&
          error.response.data &&
          typeof error.response.data === 'object' &&
          'message' in error.response.data &&
          typeof error.response.data.message === 'string'
            ? error.response.data.message
            : 'Failed to upload file';
        toast.error(
          `Failed to upload "${fileItem.file.name}": ${errorMessage}`
        );
      }
    },
    [floorPlanId]
  );

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (isUploading) return;

      if (!floorPlanId) {
        toast.error(
          'Floor plan ID is missing. Please go back and create a floor plan first.'
        );
        return;
      }

      // Get next available floor for multiple files
      const getNextFloor = (index: number): string => {
        // If uploading multiple files, assign them to sequential floors
        if (acceptedFiles.length > 1) {
          const floorIndex = floorOptions.findIndex(
            (f) => f.value === selectedFloor
          );
          const nextFloorIndex = (floorIndex + index) % floorOptions.length;
          return floorOptions[nextFloorIndex].value;
        }
        // Single file uses selected floor
        return selectedFloor;
      };

      // Create file items and add to state
      const newFiles: UploadedFile[] = acceptedFiles.map((file, index) => {
        const assignedFloor = getNextFloor(index);
        return {
          id: `file-${Date.now()}-${index}`,
          file,
          floor: assignedFloor,
          progress: 0,
          status: 'pending',
          previewUrl: createFilePreview(file),
        };
      });

      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Start uploading files
      newFiles.forEach((fileItem) => {
        uploadFile(fileItem);
      });
    },
    [isUploading, floorPlanId, selectedFloor, createFilePreview, uploadFile]
  );

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/acad': ['.dwg'],
      'application/x-dwg': ['.dwg'],
      'application/dxf': ['.dxf'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true,
    disabled: isUploading || !floorPlanId,
  });

  // Remove file
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove?.previewUrl) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  }, []);

  // Update floor for a file
  const updateFileFloor = useCallback((fileId: string, newFloor: string) => {
    setUploadedFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, floor: newFloor } : f))
    );
  }, []);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const completed = uploadedFiles.filter(
      (f) => f.status === 'completed'
    ).length;
    const uploading = uploadedFiles.filter(
      (f) => f.status === 'uploading'
    ).length;
    const uploadingFile = uploadedFiles.find((f) => f.status === 'uploading');
    const uploadingProgress = uploadingFile
      ? Math.round(uploadingFile.progress)
      : 0;

    return {
      total: uploadedFiles.length,
      completed,
      uploading,
      uploadingProgress,
    };
  }, [uploadedFiles]);

  return (
    <div className="space-y-6">
      {!floorPlanId && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <p className="text-red-800">
            Floor plan ID is missing. Please go back and create a floor plan
            first.
          </p>
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.4fr)]">
        {/* Left column - upload & options */}
        <div className="space-y-6">
          {/* Dropzone */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Upload DWG Files</h3>
            <div
              {...getRootProps()}
              className={`rounded-2xl border border-dashed p-8 text-center transition-all cursor-pointer ${
                isDragActive
                  ? 'border-primary bg-primary/10'
                  : isUploading || !floorPlanId
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                    : 'border-primary/40 bg-primary/5 hover:border-primary/60 hover:bg-primary/10'
              }`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Loader2 className="h-7 w-7 text-primary animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    Uploading files...
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Please wait while files are being uploaded
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <UploadCloud className="h-7 w-7 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {isDragActive
                      ? 'Drop files here...'
                      : 'Drop DWG Files Here Or Click To Browse.'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Supported formats: .dwg, .dxf , (max 50MB each).
                    <br />
                    You can upload multiple files for different floors.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Upload options */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Upload Options</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pink-500" />
                Auto-detect floor levels from file names
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pink-500" />
                Manual floor assignment
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pink-500" />
                Validate DWG structure before processing
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-pink-500" />
                Generate 3D preview
              </li>
            </ul>
          </div>

          {/* Scale settings */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Scale Settings</h3>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div>
                <span className="mr-2 text-muted-foreground">
                  Drawing Scale:
                </span>
                <Input
                  {...register('drawingScale')}
                  className="inline-flex h-10 w-32 border rounded-md px-2 text-xs"
                  placeholder="1:100"
                />
              </div>
              <div className=" text-sm items-center  w-52 gap-2">
                <span className="text-muted-foreground">Unit:</span>
                <Controller
                  control={control}
                  name="drawingUnit"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      className="w-32"
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="h-8 w-32 border text-xs">
                        <SelectValue placeholder="Meters" />
                      </SelectTrigger>
                      <SelectContent className="">
                        <SelectItem value="meters">Meters</SelectItem>
                        <SelectItem value="feet">Feet</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right column - uploaded files */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Uploaded Files</h3>
          {uploadedFiles.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No files uploaded yet. Use the upload area to add files.
              </p>
            </div>
          ) : (
            <div className="  rounded-xl border border-gray-200 bg-white">
              <div className="grid grid-cols-[3fr_2fr_1fr_1fr_1fr] bg-muted px-4 py-2 text-xs font-semibold text-muted-foreground">
                <span>File Name</span>
                <span>Floor</span>
                <span>Size</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="divide-y text-xs">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="grid grid-cols-[3fr_2fr_1fr_1fr_1fr] items-center px-4 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate" title={file.file.name}>
                        {file.file.name}
                      </span>
                    </div>
                    <div>
                      <Select
                        value={file.floor}
                        onValueChange={(value) =>
                          updateFileFloor(file.id, value)
                        }
                        className="w-32"
                      >
                        <SelectTrigger
                          className="h-6 w-20 text-[10px] p-0 px-1"
                          disabled={file.status === 'uploading'}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {floorOptions.map((floor) => (
                            <SelectItem
                              className="text-xs"
                              key={floor.value}
                              value={floor.value}
                            >
                              {floor.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <span>{formatFileSize(file.file.size)}</span>
                    <div className="flex items-center gap-1">
                      {file.status === 'uploading' && (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                          <span className="text-blue-500">
                            {Math.round(file.progress)}%
                          </span>
                        </>
                      )}
                      {file.status === 'completed' && (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span className="text-emerald-500">Ready</span>
                        </>
                      )}
                      {file.status === 'pending' && (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                          <span className="text-gray-500">Pending</span>
                        </>
                      )}
                      {file.status === 'error' && (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          <span className="text-red-500">Error</span>
                        </>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-7 w-7 p-0 hover:bg-gray-100"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem
                            onClick={() => {
                              // Handle preview action
                              if (file.fileUrl) {
                                window.open(file.fileUrl, '_blank');
                              } else if (file.previewUrl) {
                                window.open(file.previewUrl, '_blank');
                              } else {
                                toast('File preview not available');
                              }
                            }}
                            className="cursor-pointer"
                            disabled={!file.fileUrl && !file.previewUrl}
                          >
                            <Eye className="mr-2 h-3.5 w-3.5" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => removeFile(file.id)}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                            disabled={file.status === 'uploading'}
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary & Quick preview */}
          <div className="grid gap-4">
            <div className="rounded-md border border-gray-200 hover:shadow-md bg-white p-4">
              <h4 className="mb-2 text-sm font-semibold">Upload Summary</h4>
              {uploadedFiles.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No files uploaded yet
                </p>
              ) : (
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {summaryStats.completed > 0 && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {summaryStats.completed} file
                      {summaryStats.completed !== 1 ? 's' : ''} uploaded
                      successfully
                    </li>
                  )}
                  {summaryStats.completed > 0 && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      {summaryStats.completed} file
                      {summaryStats.completed !== 1 ? 's' : ''} validated and
                      ready
                    </li>
                  )}
                  {summaryStats.uploading > 0 && (
                    <li className="flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      {summaryStats.uploading} file
                      {summaryStats.uploading !== 1 ? 's' : ''} still processing
                      ({summaryStats.uploadingProgress}% complete)
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Footer actions */}
      <div className="space-y-3">
        {uploadedFiles.length === 0 && (
          <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800">
              Please upload at least one DWG file to continue to the next step.
            </p>
          </div>
        )}
        <div className="flex flex-wrap  gap-3 pt-2 text-xs">
          <Button variant="outline" type="button">
            Save Draft
          </Button>
          <Button variant="outline" type="button">
            + Add More
          </Button>
          <Button variant="outline" type="button" onClick={onPrevious}>
            Previous
          </Button>
          <Button
            type="button"
            onClick={() => {
              // Check if there are any completed files
              const completedFiles = uploadedFiles.filter(
                (f) => f.status === 'completed'
              );

              if (completedFiles.length === 0) {
                toast.error(
                  'Please upload at least one DWG file before proceeding.'
                );
                return;
              }

              onNext();
            }}
            disabled={uploadedFiles.length === 0 || isUploading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
