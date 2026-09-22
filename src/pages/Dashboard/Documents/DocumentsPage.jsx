import { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Download, Trash2, Edit, FileText, ChevronLeft, ChevronRight, File, Eye } from 'lucide-react';
import { usePermissions } from '../../../context/PermissionsContext';
import documentsApi from '../../../services/documentsApi';
import UploadDocumentModal from './UploadDocumentModal';

const DOCUMENT_CATEGORIES = [
    { value: '', label: 'All Categories' },
    { value: 'Minutes of Meeting', label: 'Minutes of Meeting' },
    { value: 'Circulars', label: 'Circulars' },
    { value: 'Compliance', label: 'Compliance' },
    { value: 'Financial', label: 'Financial' },
    { value: 'agreement', label: 'Agreement' },
    { value: 'noc', label: 'NOC' },
    { value: 'audit_report', label: 'Audit Report' },
    { value: 'other', label: 'Other' },
];

const DocumentsPage = () => {
    const { hasModuleAccess, PERMISSION_LEVELS } = usePermissions();
    const canManageDocuments = hasModuleAccess('documents_manager', PERMISSION_LEVELS.MANAGE);

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [documentToEdit, setDocumentToEdit] = useState(null);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchDocuments(pagination.page);
        }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedCategory, pagination.page]);

    const fetchDocuments = async (page) => {
        setLoading(true);
        try {
            const params = { page, limit: pagination.limit };
            if (searchTerm) params.search = searchTerm;
            if (selectedCategory) params.category = selectedCategory;

            const res = await documentsApi.getDocuments(params);
            const { data, pagination: pagData } = res.data.data;
            setDocuments(data || []);
            setPagination(pagData);
        } catch (err) {
            console.error('Failed to fetch documents', err);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (doc) => {
        if (window.confirm(`Are you sure you want to delete "${doc.title}"?`)) {
            try {
                await documentsApi.deleteDocument(doc._id);
                fetchDocuments(pagination.page);
            } catch (err) {
                alert(err.response?.data?.message || 'Failed to delete document');
            }
        }
    };

    const handleEdit = (doc) => {
        setDocumentToEdit(doc);
        setIsModalOpen(true);
    };

    const handleUploadClick = () => {
        setDocumentToEdit(null);
        setIsModalOpen(true);
    };

    const handlePrev = () => {
        if (pagination.page > 1) {
            setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
        }
    };

    const handleNext = () => {
        if (pagination.page < pagination.totalPages) {
            setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatSize = (bytes) => {
        if (!bytes) return '—';
        const mb = bytes / (1024 * 1024);
        if (mb < 1) {
            return (bytes / 1024).toFixed(1) + ' KB';
        }
        return mb.toFixed(1) + ' MB';
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Documents Manager</h1>
                    <p className="text-gray-500 mt-1">Manage society bye-laws, circulars, and meeting minutes.</p>
                </div>
                {canManageDocuments && (
                    <button
                        onClick={handleUploadClick}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
                    >
                        <Plus className="w-5 h-5" />
                        Upload Document
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search documents by title..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPagination((prev) => ({ ...prev, page: 1 }));
                            }}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setPagination((prev) => ({ ...prev, page: 1 }));
                        }}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                    >
                        {DOCUMENT_CATEGORIES.map(cat => (
                            <option key={cat.value} value={cat.value}>{cat.label}</option>
                        ))}
                    </select>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                                <th className="px-6 py-4 font-semibold">Title</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Category</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Visibility</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Uploaded By</th>
                                <th className="px-6 py-4 font-semibold whitespace-nowrap">Date</th>
                                <th className="px-6 py-4 font-semibold text-center whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500 mb-2" />
                                        <p>Loading documents...</p>
                                    </td>
                                </tr>
                            ) : documents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FileText className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <p className="font-medium text-gray-900">No documents found</p>
                                        <p className="text-sm mt-1">Adjust search or upload a new document.</p>
                                    </td>
                                </tr>
                            ) : (
                                documents.map((doc) => (
                                    <tr key={doc._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                                    <File className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <a 
                                                        href={doc.fileUrl} 
                                                        target="_blank" 
                                                        rel="noreferrer" 
                                                        className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
                                                    >
                                                        {doc.title}
                                                    </a>
                                                    {doc.description && <div className="text-sm text-gray-500 truncate max-w-xs">{doc.description}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{doc.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                                                doc.visibilityScope === 'All Residents' ? 'bg-green-100 text-green-700' :
                                                doc.visibilityScope === 'Committee Only' ? 'bg-red-100 text-red-700' :
                                                'bg-purple-100 text-purple-700'
                                            }`}>
                                                {doc.visibilityScope === 'All Residents' ? 'All Residents' :
                                                doc.visibilityScope === 'Committee Only' ? 'Committee Only' :
                                                `Specific Block (${doc.blockId?.name || ''})`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            {doc.uploadedBy?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                            {formatDate(doc.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <a
                                                    href={doc.fileUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </a>
                                                {canManageDocuments && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(doc)}
                                                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(doc)}
                                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && documents.length > 0 && pagination.totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white mt-auto">
                        <span className="text-sm text-gray-500">
                            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrev}
                                disabled={pagination.page === 1}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-medium text-gray-700">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={handleNext}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <UploadDocumentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUploadSuccess={() => fetchDocuments(pagination.page)}
                documentToEdit={documentToEdit}
            />
        </div>
    );
};

export default DocumentsPage;
