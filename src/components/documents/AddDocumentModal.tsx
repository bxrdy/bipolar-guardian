
import { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MobileDialog,
  MobileDialogContent,
  MobileDialogHeader,
  MobileDialogTitle,
  MobileDialogBody,
  MobileDialogFooter,
} from "@/components/ui/mobile-dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Upload, File, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from "@/hooks/use-toast";

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddDocumentModal = ({ isOpen, onClose }: AddDocumentModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadDocument, isUploading, uploadProgress, validateFile } = useDocuments();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleFileValidation = useCallback((file: File) => {
    const error = validateFile(file);
    setValidationError(error);
    
    if (!error) {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: error,
        variant: "destructive"
      });
    }
  }, [validateFile, toast]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileValidation(file);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileValidation(files[0]);
    }
  }, [handleFileValidation]);

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await uploadDocument(selectedFile);
      setSelectedFile(null);
      setValidationError(null);
      onClose();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Upload failed:', error);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setValidationError(null);
      onClose();
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setValidationError(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    return '📋';
  };

  return (
    <MobileDialog open={isOpen} onOpenChange={handleClose}>
      <MobileDialogContent className={cn(isMobile ? "w-[calc(100vw-2rem)]" : "max-w-lg w-full")}>
        <MobileDialogHeader className="pb-6">
          <MobileDialogTitle className="text-xl font-semibold">Upload Document</MobileDialogTitle>
        </MobileDialogHeader>
        
        <MobileDialogBody className="px-6 py-2">
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                Upload medical documents, lab results, prescriptions, or other health-related files.
              </p>
              <p className="text-xs text-gray-500">
                Supported formats: PDF, JPEG, PNG, GIF, WebP (max 10MB)
              </p>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Uploading...</span>
                  <span className="text-gray-600">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {!selectedFile && !isUploading ? (
              <div
                onClick={triggerFileSelect}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200",
                  isDragOver 
                    ? "border-purple-400 bg-purple-50" 
                    : "border-gray-300 hover:border-purple-400 hover:bg-gray-50"
                )}
              >
                <Upload className={cn(
                  "w-12 h-12 mx-auto mb-4 transition-colors",
                  isDragOver ? "text-purple-500" : "text-gray-400"
                )} />
                <p className="text-gray-600 mb-2">
                  {isDragOver ? "Drop your file here" : "Click to select a file"}
                </p>
                <p className="text-sm text-gray-500">or drag and drop here</p>
              </div>
            ) : selectedFile && !isUploading ? (
              <div className={cn(
                "border rounded-lg p-4 transition-colors",
                validationError ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"
              )}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 text-2xl">
                    {getFileTypeIcon(selectedFile.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1].toUpperCase()}
                        </p>
                        {validationError && (
                          <div className="flex items-center mt-2 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>{validationError}</span>
                          </div>
                        )}
                        {!validationError && (
                          <div className="flex items-center mt-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>Ready to upload</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        className="text-gray-400 hover:text-red-600 ml-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </MobileDialogBody>

        <MobileDialogFooter className="pt-6 space-y-3 sm:space-y-0 sm:space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose} 
            className="w-full sm:w-auto h-12 text-sm font-medium"
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || !!validationError || isUploading}
            className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto h-12 text-sm font-medium"
          >
            {isUploading ? `Uploading ${uploadProgress}%` : 'Upload Document'}
          </Button>
        </MobileDialogFooter>
      </MobileDialogContent>
    </MobileDialog>
  );
};

export default AddDocumentModal;
