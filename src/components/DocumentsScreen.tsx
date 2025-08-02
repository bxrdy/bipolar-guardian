import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Plus, FileText, Calendar, Trash2, Eye, Search, Filter, ArrowLeft } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { useIsMobile } from '@/hooks/use-mobile';
import AddDocumentModal from './documents/AddDocumentModal';
import DocumentPreviewModal from './documents/DocumentPreviewModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Document {
  id: string;
  user_id: string;
  doc_type: string;
  file_path: string;
  extracted_text?: string;
  uploaded_at: string;
}

interface DocumentsScreenProps {
  onBack: () => void;
  showAddModal: boolean;
  onCloseAddModal: () => void;
  onOpenAddModal: () => void;
}

const DocumentsScreen = ({ onBack, showAddModal, onCloseAddModal, onOpenAddModal }: DocumentsScreenProps) => {
  const { documents, isLoading, deleteDocument } = useDocuments();
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const isMobile = useIsMobile();

  // Filter and search documents
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(doc => {
        if (filterType === 'images') return doc.doc_type.includes('image');
        if (filterType === 'pdfs') return doc.doc_type.includes('pdf');
        return true;
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(doc => {
        const fileName = doc.file_path.split('/').pop()?.toLowerCase() || '';
        const extractedText = doc.extracted_text?.toLowerCase() || '';
        return fileName.includes(query) || extractedText.includes(query);
      });
    }

    return filtered;
  }, [documents, searchQuery, filterType]);

  const handlePreviewDocument = (document: Document) => {
    // Transform document to match the expected interface
    const documentForPreview = {
      id: document.id,
      name: document.file_path.split('/').pop()?.split('.')[0] || 'Document',
      file_path: document.file_path,
      file_type: document.doc_type,
      created_at: document.uploaded_at,
      file_size: undefined,
      doc_type: document.doc_type,
      uploaded_at: document.uploaded_at,
      extracted_text: document.extracted_text
    };
    
    setSelectedDocument(documentForPreview as any);
    setShowPreviewModal(true);
  };

  const handleDeleteDocument = async (document: Document) => {
    await deleteDocument(document.id, document.file_path);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (docType: string) => {
    if (docType.includes('pdf')) return '📄';
    if (docType.includes('image')) return '🖼️';
    return '📋';
  };

  const getFileTypeLabel = (docType: string) => {
    if (docType.includes('pdf')) return 'PDF';
    if (docType.includes('image')) return 'Image';
    return 'Document';
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mr-4 p-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {!isMobile && "Back"}
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">My Documents</h1>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mr-4 p-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {!isMobile && "Back"}
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">My Documents</h1>
          </div>
          {documents.length > 0 && (
            <Button
              onClick={onOpenAddModal}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Upload
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className={`px-6 py-6 space-y-6 max-w-2xl mx-auto ${isMobile ? 'pb-24' : 'pb-8'}`}>
            
            {/* Header Actions and Search */}
            {documents.length > 0 && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-32">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="images">Images</SelectItem>
                        <SelectItem value="pdfs">PDFs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Results count */}
                {(searchQuery || filterType !== 'all') && (
                  <div className="text-sm text-gray-600">
                    {filteredDocuments.length} of {documents.length} documents
                    {searchQuery && ` matching "${searchQuery}"`}
                  </div>
                )}
              </div>
            )}

            {/* Documents List */}
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Documents Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Upload your medical documents, lab results, or prescriptions to keep them organized and easily accessible.
                </p>
                <Button
                  onClick={onOpenAddModal}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Your First Document
                </Button>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search or filter settings
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterType('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((document) => (
                  <div
                    key={document.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-all duration-200 hover:border-gray-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 text-2xl">
                          {getFileIcon(document.doc_type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {document.file_path.split('/').pop()?.split('.')[0] || 'Document'}
                            </h4>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {getFileTypeLabel(document.doc_type)}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(document.uploaded_at)}
                          </div>
                          {document.extracted_text && (
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                              {document.extracted_text.substring(0, 150)}
                              {document.extracted_text.length > 150 && '...'}
                            </p>
                          )}
                          {!document.extracted_text && (
                            <p className="text-sm text-blue-600 italic">
                              Text extraction in progress...
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreviewDocument(document)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="sr-only">Preview</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Document</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{document.file_path.split('/').pop()?.split('.')[0] || 'this document'}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteDocument(document)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Add Document Modal */}
      <AddDocumentModal
        isOpen={showAddModal}
        onClose={onCloseAddModal}
      />

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        document={selectedDocument}
      />
    </div>
  );
};

export default DocumentsScreen;
