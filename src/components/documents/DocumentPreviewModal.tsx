
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
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
import { Download, FileText, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useToast } from "@/hooks/use-toast";
import { reportError } from "@/services/errorTracking";

interface DocumentData {
  id: string;
  name?: string;
  file_path: string;
  file_type?: string;
  doc_type?: string;
  created_at?: string;
  uploaded_at?: string;
  file_size?: number;
  extracted_text?: string;
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentData | null;
}

const DocumentPreviewModal = ({ isOpen, onClose, document }: DocumentPreviewModalProps) => {
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { getDocumentUrl } = useDocuments();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const loadDocumentUrl = async () => {
      if (document && isOpen) {
        setIsLoading(true);
        setLoadError(null);
        setDocumentUrl(null);
        
        try {
          const url = await getDocumentUrl(document.file_path);
          if (url) {
            setDocumentUrl(url);
          } else {
            setLoadError('Unable to load document preview');
          }
        } catch (error) {
          console.error('Error loading document URL:', error);
          setLoadError('Failed to load document');
          
          reportError(error as Error, {
            action: 'load_document_preview',
            documentId: document.id,
            filePath: document.file_path
          });
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadDocumentUrl();
  }, [document, isOpen, getDocumentUrl]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async () => {
    if (!documentUrl) {
      toast({
        title: "Download Failed",
        description: "Document URL not available",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(documentUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document?.file_path.split('/').pop() || 'document';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your document is being downloaded",
      });
    } catch (error) {
      console.error('Download error:', error);
      
      reportError(error as Error, {
        action: 'download_document',
        documentId: document?.id || '',
        filePath: document?.file_path || ''
      });
      
      toast({
        title: "Download Failed",
        description: "Failed to download document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading preview...</p>
          </div>
        </div>
      );
    }

    if (loadError) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Preview unavailable</p>
            <p className="text-sm text-gray-500">{loadError}</p>
          </div>
        </div>
      );
    }

    if (!documentUrl) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No preview available</p>
          </div>
        </div>
      );
    }

    const docType = document?.doc_type || document?.file_type || '';
    
    if (docType.includes('image')) {
      return (
        <img
          src={documentUrl}
          alt="Document preview"
          className="w-full h-full object-contain rounded"
          onError={() => setLoadError('Failed to load image')}
        />
      );
    }

    if (docType.includes('pdf')) {
      return (
        <iframe
          src={documentUrl}
          className="w-full h-full rounded"
          title="PDF preview"
          onError={() => setLoadError('Failed to load PDF')}
        />
      );
    }

    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-2" />
          <p>Preview not available for this file type</p>
        </div>
      </div>
    );
  };

  if (!document) return null;

  const uploadDate = document.uploaded_at || document.created_at || '';

  return (
    <MobileDialog open={isOpen} onOpenChange={onClose}>
      <MobileDialogContent className={cn(isMobile ? "w-[calc(100vw-1rem)] h-[90vh]" : "max-w-4xl w-full h-[80vh]")}>
        <MobileDialogHeader className="pb-4">
          <MobileDialogTitle className="text-lg font-semibold flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            {document.name || document.file_path.split('/').pop()?.split('.')[0] || 'Document'}
          </MobileDialogTitle>
          {uploadDate && (
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              Uploaded {formatDate(uploadDate)}
            </div>
          )}
        </MobileDialogHeader>
        
        <MobileDialogBody className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col space-y-4">
            {/* Document Preview */}
            <div className="bg-gray-50 rounded-lg p-4 flex-1 overflow-hidden">
              {renderPreview()}
            </div>

            {/* Extracted Text */}
            {document.extracted_text && (
              <div className="max-h-48 overflow-hidden">
                <h4 className="font-medium text-gray-900 mb-2">Extracted Text</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {document.extracted_text}
                  </p>
                </div>
              </div>
            )}

            {/* Processing Status */}
            {!document.extracted_text && !isLoading && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600 mr-2" />
                  <p className="text-sm text-blue-700">
                    Text extraction in progress. This may take a few minutes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </MobileDialogBody>
        
        <MobileDialogFooter className="pt-4 space-y-3 sm:space-y-0 sm:space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose} 
            className="w-full sm:w-auto h-12 text-sm font-medium"
          >
            Close
          </Button>
          <Button 
            onClick={handleDownload}
            disabled={!documentUrl || isLoading}
            className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto h-12 text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </MobileDialogFooter>
      </MobileDialogContent>
    </MobileDialog>
  );
};

export default DocumentPreviewModal;
