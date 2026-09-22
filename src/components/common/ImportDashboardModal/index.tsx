import React, { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

export interface ImportDashboardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (file: File) => void;
  isLoading?: boolean;
}

export const ImportDashboardModal: React.FC<ImportDashboardModalProps> = ({
  open,
  onOpenChange,
  onImport,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (file: File) => {
      // Validate file type
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        toast.error(
          t('solutionDashboards.invalidFileType') ||
            'Invalid file type. Please select a JSON file.'
        );
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(
          t('solutionDashboards.fileTooLarge') || 'File size exceeds 5MB limit.'
        );
        return;
      }
      setSelectedFile(file);
      toast.success(
        t('solutionDashboards.fileSelected') || 'File selected successfully'
      );
    },
    [t]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      onImport(selectedFile);
      // Reset after import
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="bg-primary text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white text-lg font-semibold">
              {t('solutionDashboards.importDashboard') || 'Import Dashboard'}
            </DialogTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 bg-white">
          <label className="text-sm text-gray-600 mb-4 block">
            {t('solutionDashboards.dashboardFile') || 'Dashboard File'}
          </label>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleBrowseClick}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragging
                  ? 'border-secondary bg-secondary/5'
                  : 'border-gray-300 hover:border-secondary'
              }
              ${selectedFile ? 'border-secondary bg-secondary/5' : ''}
            `}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <Upload className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-gray-700 font-medium mb-1">
                  {t('solutionDashboards.dropFilesHere') ||
                    'Drop Files Here Or Click To Browse'}
                </p>
                <p className="text-sm text-gray-500">
                  {t('solutionDashboards.supportedFormats') ||
                    'Supported Formats: JSON (Max 5MB)'}
                </p>
              </div>
              <Button
                type="button"
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBrowseClick();
                }}
              >
                {t('solutionDashboards.browse') || 'Browse'}
              </Button>
            </div>
          </div>

          {/* File Input (hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Selected File Info */}
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {selectedFile
                ? `${t('solutionDashboards.selectedFile') || 'Selected'}: ${
                    selectedFile.name
                  }`
                : t('solutionDashboards.noFileSelected') || 'No File Selected'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-gray-50 p-4 rounded-b-lg flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            {t('solutionDashboards.cancel') || 'Cancel'}
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedFile || isLoading}
            className="bg-secondary hover:bg-secondary/90 text-white"
            isLoading={isLoading}
          >
            {t('solutionDashboards.import') || 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
