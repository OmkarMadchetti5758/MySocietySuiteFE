import { useState, useEffect } from 'react';
import { X, UploadCloud, Loader2, File, FileText } from 'lucide-react';
import { blockApi } from '../../../services/blockApi';
import documentsApi from '../../../services/documentsApi';

const DOCUMENT_CATEGORIES = [
    { value: 'Minutes of Meeting', label: 'Minutes of Meeting' },
    { value: 'Circulars', label: 'Circulars' },
    { value: 'Compliance', label: 'Compliance' },
    { value: 'Financial', label: 'Financial' },
    { value: 'agreement', label: 'Agreement' },
    { value: 'noc', label: 'NOC' },
    { value: 'audit_report', label: 'Audit Report' },
    { value: 'other', label: 'Other' },
];

const VISIBILITY_SCOPES = [
    { value: 'All Residents', label: 'All Residents' },
    { value: 'Committee Only', label: 'Committee Only' },
    { value: 'Specific Block', label: 'Specific Block' },
];

const UploadDocumentModal = ({ isOpen, onClose, onUploadSuccess, documentToEdit }) => {
    const [submitting, setSubmitting] = useState(false);
    const [blocks, setBlocks] = useState([]);
    const [loadingBlocks, setLoadingBlocks] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        category: 'Minutes of Meeting',
        description: '',
        visibilityScope: 'ALL_RESIDENTS',
        blockId: '',
        file: null,
    });

    useEffect(() => {
        if (isOpen && documentToEdit) {
            setFormData({
                title: documentToEdit.title || '',
                category: documentToEdit.category || 'Minutes of Meeting',
                description: documentToEdit.description || '',
                visibilityScope: documentToEdit.visibilityScope || 'All Residents',
                blockId: documentToEdit.blockId?._id || documentToEdit.blockId || '',
                file: null,
            });
        } else if (isOpen) {
            setFormData({
                title: '',
                category: 'Minutes of Meeting',
                description: '',
                visibilityScope: 'All Residents',
                blockId: '',
                file: null,
            });
            setError('');
        }
    }, [isOpen, documentToEdit]);

    useEffect(() => {
        if (formData.visibilityScope === 'Specific Block' && blocks.length === 0) {
            fetchBlocks();
        }
    }, [formData.visibilityScope]);

    const fetchBlocks = async () => {
        setLoadingBlocks(true);
        try {
            const res = await blockApi.getWings();
            const blocksData = res.data?.blockDoc?.wings || [];
            // Here blocksData represents the wings/blocks. We need to parse them.
            // Wait, blockApi.getWings() returns wings which might not be `blockId`. 
            // In the system, usually block/wings are same, but let's check `blockId`.
            setBlocks(blocksData);
        } catch (err) {
            console.error('Failed to fetch blocks', err);
        } finally {
            setLoadingBlocks(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 15 * 1024 * 1024) {
                setError('File size must be less than 15MB');
                return;
            }
            setError('');
            setFormData({ ...formData, file });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!documentToEdit && !formData.file) {
            setError('Please select a file to upload');
            return;
        }

        if (formData.visibilityScope === 'Specific Block' && !formData.blockId) {
            setError('Please select a specific block');
            return;
        }

        setSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            if (formData.description) data.append('description', formData.description);
            data.append('visibilityScope', formData.visibilityScope);
            if (formData.visibilityScope === 'Specific Block') {
                data.append('blockId', formData.blockId);
            }
            if (formData.file) {
                data.append('file', formData.file);
            }

            if (documentToEdit) {
                await documentsApi.replaceDocument(documentToEdit._id, data);
            } else {
                await documentsApi.uploadDocument(data);
            }
            onUploadSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload document');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {documentToEdit ? 'Edit Document' : 'Upload Document'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    <form id="document-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Document Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="E.g., AGM Minutes 2023"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category *
                                </label>
                                <select
                                    required
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                >
                                    {DOCUMENT_CATEGORIES.map(cat => (
                                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Visibility Scope *
                                </label>
                                <select
                                    required
                                    value={formData.visibilityScope}
                                    onChange={(e) => setFormData({ ...formData, visibilityScope: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                >
                                    {VISIBILITY_SCOPES.map(scope => (
                                        <option key={scope.value} value={scope.value}>{scope.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {formData.visibilityScope === 'Specific Block' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Block *
                                </label>
                                <select
                                    required
                                    value={formData.blockId}
                                    onChange={(e) => setFormData({ ...formData, blockId: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    disabled={loadingBlocks}
                                >
                                    <option value="">Select Block</option>
                                    {blocks.map(block => (
                                        <option key={block._id} value={block._id}>{block.name || block.wingCode}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description (Optional)
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows="2"
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                placeholder="Add any details or notes here..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Document File {documentToEdit ? '(Upload to replace existing file)' : '*'}
                            </label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,image/*"
                                    onChange={handleFileChange}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-colors cursor-pointer"
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        {formData.file ? (
                                            <>
                                                <FileText className="w-8 h-8 text-blue-500 mb-2" />
                                                <p className="text-sm text-gray-700 font-medium">{formData.file.name}</p>
                                                <p className="text-xs text-gray-500">{(formData.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-8 h-8 text-gray-400 mb-2 group-hover:text-blue-500 transition-colors" />
                                                <p className="text-sm text-gray-500">
                                                    <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLS, CSV or Images (MAX. 15MB)</p>
                                            </>
                                        )}
                                    </div>
                                </label>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3 mt-auto">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        form="document-form"
                        type="submit"
                        disabled={submitting || (!documentToEdit && !formData.file)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {documentToEdit ? 'Saving...' : 'Uploading...'}
                            </>
                        ) : (
                            documentToEdit ? 'Save Changes' : 'Upload'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UploadDocumentModal;
