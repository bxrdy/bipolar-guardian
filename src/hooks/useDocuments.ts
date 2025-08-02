
import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { reportError } from "@/services/errorTracking";
import { logStorageAccess, getStorageConfig } from "@/utils/storageLogger";

interface Document {
  id: string;
  user_id: string;
  doc_type: string;
  file_path: string;
  extracted_text?: string;
  uploaded_at: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const SUPPORTED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

// Simple image compression function
const compressImage = async (file: File): Promise<File> => {
  if (!file.type.startsWith('image/') || file.size <= 2 * 1024 * 1024) {
    return file; // Don't compress if not image or already small
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions (max 1920x1920)
      const maxSize = 1920;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        0.8 // 80% quality
      );
    };
    
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageConfig, setStorageConfig] = useState<any>(null);
  const { toast } = useToast();

  const fetchDocuments = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDocuments([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('medical_docs')
        .select('*')
        .eq('user_id', user.id)
        .order('uploaded_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        
        // Report error to tracking system
        reportError(new Error(`Failed to fetch documents: ${error.message}`), {
          userId: user.id,
          action: 'fetch_documents',
          errorCode: error.code
        });
        
        toast({
          title: "Error",
          description: "Failed to load documents. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('Error:', error);
      
      reportError(error as Error, {
        action: 'fetch_documents_general'
      });
      
      toast({
        title: "Error",
        description: "Failed to load documents. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const validateFile = (file: File): string | null => {
    // Use storage config if available, otherwise use defaults
    const allowedTypes = storageConfig?.allowed_mime_types || SUPPORTED_TYPES;
    const maxSizeMB = storageConfig?.max_file_size_mb || 10;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      return 'Please select a PDF or image file (JPEG, PNG, GIF, WebP)';
    }
    
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }
    
    return null;
  };

  const uploadDocument = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate file
      const validationError = validateFile(file);
      if (validationError) {
        toast({
          title: "Invalid File",
          description: validationError,
          variant: "destructive"
        });
        return;
      }

      setUploadProgress(10);

      // Compress image if needed
      let processedFile = file;
      if (file.type.startsWith('image/')) {
        processedFile = await compressImage(file);
        if (processedFile.size < file.size) {
          toast({
            title: "Image Optimized",
            description: `File size reduced from ${(file.size / 1024 / 1024).toFixed(1)}MB to ${(processedFile.size / 1024 / 1024).toFixed(1)}MB`,
          });
        }
      }

      setUploadProgress(25);

      // Generate unique filename
      const fileExt = processedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      setUploadProgress(50);

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('medical-docs')
        .upload(filePath, processedFile);

      if (uploadError) {
        // Log failed upload
        await logStorageAccess({
          file_path: filePath,
          bucket_name: 'medical-docs',
          access_type: 'upload',
          success: false,
          error_message: uploadError.message,
          file_size: processedFile.size,
          mime_type: processedFile.type
        });
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Log successful upload
      await logStorageAccess({
        file_path: filePath,
        bucket_name: 'medical-docs',
        access_type: 'upload',
        success: true,
        file_size: processedFile.size,
        mime_type: processedFile.type
      });

      setUploadProgress(75);

      // Save document metadata to database
      const { error: dbError } = await supabase
        .from('medical_docs')
        .insert({
          user_id: user.id,
          doc_type: processedFile.type,
          file_path: filePath
        });

      if (dbError) {
        // Clean up uploaded file if database insert fails
        await supabase.storage
          .from('medical-docs')
          .remove([filePath]);
        throw new Error(`Database error: ${dbError.message}`);
      }

      setUploadProgress(90);

      // Trigger text extraction function (background task)
      try {
        const { error: functionError } = await supabase.functions.invoke('extract-doc-text', {
          body: { file_path: filePath }
        });
        
        if (functionError) {
          console.warn('Text extraction failed:', functionError);
          // Don't throw here as the document was uploaded successfully
        }
      } catch (extractError) {
        console.warn('Text extraction request failed:', extractError);
        // Don't throw here as the document was uploaded successfully
      }

      setUploadProgress(100);

      toast({
        title: "Document Uploaded",
        description: "Your document has been uploaded successfully. Text extraction is in progress.",
      });

      await fetchDocuments();
    } catch (error) {
      console.error('Upload error:', error);
      
      reportError(error as Error, {
        action: 'upload_document',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload document. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteDocument = async (documentId: string, filePath: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Delete from storage first
      const { error: storageError } = await supabase.storage
        .from('medical-docs')
        .remove([filePath]);

      if (storageError) {
        console.warn('Storage deletion warning:', storageError);
        // Log failed deletion
        await logStorageAccess({
          file_path: filePath,
          bucket_name: 'medical-docs',
          access_type: 'delete',
          success: false,
          error_message: storageError.message
        });
        // Continue with database deletion even if storage fails
      } else {
        // Log successful deletion
        await logStorageAccess({
          file_path: filePath,
          bucket_name: 'medical-docs',
          access_type: 'delete',
          success: true
        });
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('medical_docs')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id); // Extra security check

      if (dbError) {
        throw new Error(`Delete failed: ${dbError.message}`);
      }

      toast({
        title: "Document Deleted",
        description: "Your document has been deleted successfully",
      });

      await fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      
      reportError(error as Error, {
        action: 'delete_document',
        documentId,
        filePath
      });
      
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete document. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Cache for signed URLs with shorter expiry
  const urlCache = new Map<string, { url: string; expires: number }>();

  const getDocumentUrl = async (filePath: string) => {
    try {
      // Check cache first
      const cached = urlCache.get(filePath);
      if (cached && cached.expires > Date.now()) {
        return cached.url;
      }

      // Get user's storage configuration for expiry time
      const expiryMinutes = storageConfig?.signed_url_expiry_minutes || 15;
      const expirySeconds = expiryMinutes * 60;

      const { data, error } = await supabase.storage
        .from('medical-docs')
        .createSignedUrl(filePath, expirySeconds);

      if (error) {
        console.error('Error getting document URL:', error);
        // Log failed URL generation
        await logStorageAccess({
          file_path: filePath,
          bucket_name: 'medical-docs',
          access_type: 'view',
          success: false,
          error_message: error.message
        });
        reportError(new Error(`Failed to get document URL: ${error.message}`), {
          action: 'get_document_url',
          filePath
        });
        return null;
      }

      // Log successful URL generation
      await logStorageAccess({
        file_path: filePath,
        bucket_name: 'medical-docs',
        access_type: 'view',
        success: true
      });

      // Cache the URL for slightly less than expiry time
      if (data?.signedUrl) {
        const cacheTime = Math.max((expiryMinutes - 2) * 60 * 1000, 5 * 60 * 1000); // Cache for expiry-2 minutes, min 5 minutes
        urlCache.set(filePath, {
          url: data.signedUrl,
          expires: Date.now() + cacheTime
        });
      }

      return data?.signedUrl || null;
    } catch (error) {
      console.error('Error:', error);
      // Log failed URL generation
      await logStorageAccess({
        file_path: filePath,
        bucket_name: 'medical-docs',
        access_type: 'view',
        success: false,
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
      reportError(error as Error, {
        action: 'get_document_url_general',
        filePath
      });
      return null;
    }
  };

  // Load storage configuration on component mount
  useEffect(() => {
    const loadStorageConfig = async () => {
      const config = await getStorageConfig();
      setStorageConfig(config);
    };
    
    loadStorageConfig();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    isLoading,
    isUploading,
    uploadProgress,
    uploadDocument,
    deleteDocument,
    getDocumentUrl,
    refetch: fetchDocuments,
    validateFile,
    storageConfig
  };
};
