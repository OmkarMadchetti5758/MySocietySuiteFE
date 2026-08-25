import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { pollApi } from '../../../services/pollApi';
import { blockApi } from '../../../services/blockApi';

const CreatePollModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    question: '',
    targetType: 'ALL',
    targetBlockId: '',
    closingDate: '',
  });
  const [options, setOptions] = useState([{ text: '' }, { text: '' }]);
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

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, { text: '' }]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (options.some(opt => !opt.text.trim())) {
      alert("Please fill in all options");
      return;
    }
    setLoading(true);
    try {
      await pollApi.createPoll({ ...formData, options });
      onSuccess();
    } catch (error) {
      console.error('Failed to create poll', error);
      alert('Failed to create poll. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Prevent past datetimes
  const now = new Date();
  // Format: YYYY-MM-DDTHH:MM (required by datetime-local)
  const minDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">Create New Poll</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full">
            <FaTimes />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="createPollForm" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <input
                type="text"
                name="question"
                required
                placeholder="What would you like to ask?"
                value={formData.question}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              <div className="flex flex-col gap-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addOption}
                className="mt-3 text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1"
              >
                <FaPlus className="text-xs" /> Add another option
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target</label>
                <select
                  name="targetType"
                  value={formData.targetType}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                >
                  <option value="ALL">All Residents</option>
                  <option value="BLOCK">Specific Block</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closing Date & Time</label>
                <input
                  type="datetime-local"
                  name="closingDate"
                  min={minDateTime}
                  required
                  value={formData.closingDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                />
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
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-3xl shrink-0">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-medium text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="createPollForm"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Poll'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePollModal;
