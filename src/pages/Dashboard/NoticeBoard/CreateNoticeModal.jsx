import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { noticeApi } from '../../../services/noticeApi';
import { blockApi } from '../../../services/blockApi';

const CreateNoticeModal = ({ onClose, onSuccess, noticeToEdit }) => {
  const [formData, setFormData] = useState({
    title: noticeToEdit?.title || '',
    description: noticeToEdit?.description || '',
    type: noticeToEdit?.type || 'general',
    targetType: noticeToEdit?.targetType || 'ALL',
    targetBlockId: noticeToEdit?.targetBlockId || '',
    attachmentUrl: noticeToEdit?.attachmentUrl || '',
  });
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        const data = await blockApi.getWings();
        setBlocks(data.data?.blockDoc?.wings || []);
      } catch (error) {
        console.error('Failed to fetch blocks', error);
      }
    };
    fetchBlocks();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (noticeToEdit) {
        await noticeApi.updateNotice(noticeToEdit._id, formData);
      } else {
        await noticeApi.createNotice(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save notice', error);
      alert('Failed to save notice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">{noticeToEdit ? 'Edit Notice' : 'Create New Notice'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full">
            <FaTimes />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="createNoticeForm" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notice Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
              >
                <option value="general">General Notice</option>
                <option value="circular">Circular</option>
                <option value="emergency">Emergency</option>
                <option value="maintenance">Maintenance</option>
                <option value="event">Event</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                required
                placeholder="Enter notice title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                required
                rows="4"
                placeholder="Enter notice description..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="ALL"
                    checked={formData.targetType === 'ALL'}
                    onChange={handleChange}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">All Residents</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="targetType"
                    value="BLOCK"
                    checked={formData.targetType === 'BLOCK'}
                    onChange={handleChange}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-gray-700">Specific Block</span>
                </label>
              </div>
            </div>

            {formData.targetType === 'BLOCK' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Block</label>
                <select
                  name="targetBlockId"
                  required
                  value={formData.targetBlockId}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                >
                  <option value="">Select a block</option>
                  {blocks.map(block => (
                    <option key={block._id} value={block._id}>{block.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Attachment (Optional)</label>
              <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer">
                <FaUpload className="text-2xl mb-2 text-gray-400" />
                <span className="text-sm">Click to select file (PDF, Image)</span>
                <input type="file" className="hidden" onChange={(e) => {
                  if (e.target.files.length > 0) {
                    setFormData({ ...formData, attachmentUrl: URL.createObjectURL(e.target.files[0]) });
                  }
                }} />
              </label>
              {formData.attachmentUrl && <p className="text-sm text-green-600 mt-2">File selected successfully.</p>}
              <p className="text-xs text-gray-400 mt-1">Uploads are simulated locally in this phase.</p>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="createNoticeForm"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (noticeToEdit ? 'Updating...' : 'Publishing...') : (noticeToEdit ? 'Update Notice' : 'Publish Notice')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNoticeModal;
