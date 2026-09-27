import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaBullseye, FaGift, FaUsers, FaBuilding, FaHome, FaMoneyBillWave } from 'react-icons/fa';
import { blockApi } from '../../../services/blockApi';
import { flatApi } from '../../../services/flatApi';
import toast from 'react-hot-toast';
import { festivalCollectionApi } from '../../../services/festivalCollectionApi';

const CreateCollectionModal = ({ isOpen, onClose, onSuccess, editData }) => {
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const [flats, setFlats] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    purpose: '',
    description: '',
    targetAmount: '',
    suggestedAmount: '',
    amountPerFlat: '',
    startDate: '',
    dueDate: '',
    eventDate: '',
    applicableType: 'ALL',
    applicableBlocks: [],
    applicableFlats: []
  });

  useEffect(() => {
    if (isOpen) {
      fetchBlocks();
      fetchFlats();
      if (editData) {
        setFormData({
          title: editData.title || '',
          purpose: editData.purpose || '',
          description: editData.description || '',
          targetAmount: editData.targetAmount || '',
          suggestedAmount: editData.suggestedAmount || '',
          amountPerFlat: editData.amountPerFlat || '',
          startDate: editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : '',
          dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString().split('T')[0] : '',
          eventDate: editData.eventDate ? new Date(editData.eventDate).toISOString().split('T')[0] : '',
          applicableType: editData.applicableType || 'ALL',
          applicableBlocks: editData.applicableBlocks || [],
          applicableFlats: editData.applicableFlats || []
        });
      } else {
        setFormData({
          title: '', purpose: '', description: '', targetAmount: '', suggestedAmount: '', amountPerFlat: '',
          startDate: '', dueDate: '', eventDate: '', applicableType: 'ALL', applicableBlocks: [], applicableFlats: []
        });
      }
    }
  }, [isOpen, editData]);

  const fetchBlocks = async () => {
    try {
      const res = await blockApi.getBlocks();
      if (res.status === 'success' || res.success) setBlocks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFlats = async () => {
    try {
      const res = await flatApi.getFlats();
      if (res.status === 'success' || res.success) setFlats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (e, field) => {
    const value = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editData) {
        await festivalCollectionApi.updateCollection(editData._id, formData);
        toast.success('Collection updated successfully');
      } else {
        await festivalCollectionApi.createCollection(formData);
        toast.success('Collection created successfully');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900/75 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl text-left transition-all transform bg-white rounded-2xl shadow-xl sm:my-8">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaGift className="text-orange-500" />
              {editData ? 'Edit Festival Collection' : 'Create New Collection'}
            </h3>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col">
            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Festival / Event Name *</label>
                <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="e.g. Ganesh Chaturthi" />
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Purpose *</label>
                <input required type="text" name="purpose" value={formData.purpose} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500" placeholder="e.g. Decoration and Prasad" />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="2" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"></textarea>
              </div>

              <div className="col-span-2 bg-gradient-to-br from-orange-50 to-amber-50/50 p-5 rounded-2xl border border-orange-100 shadow-sm">
                <h4 className="text-sm font-bold text-orange-800 mb-4 flex items-center gap-2">
                  <FaMoneyBillWave className="text-orange-600" /> Financial Rules
                </h4>

                <div className="mb-5 bg-orange-100/50 p-3.5 rounded-xl border border-orange-200 flex items-start gap-3">
                  <div className="mt-0.5 text-orange-600 shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-[13px] text-orange-900 leading-relaxed">
                    <strong>Note:</strong> This section sets the rules for the fundraiser. You are <strong>not</strong> making a payment here. 
                    Once this collection is saved, residents will be able to pay via the <strong>"Pay Now"</strong> button.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Target Amount */}
                  <div className="bg-white p-4 rounded-xl border border-orange-100/50 shadow-sm hover:shadow-md transition-all duration-200 group">
                    <label className="block text-sm font-bold text-gray-800 mb-1">Total Target *</label>
                    <p className="text-[11px] text-gray-500 mb-3 leading-tight group-hover:text-gray-700 transition-colors">Overall expected budget (e.g. ₹50,000).</p>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-orange-600 font-semibold">₹</span>
                      <input required type="number" name="targetAmount" value={formData.targetAmount} onChange={handleChange} className="w-full pl-8 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-colors" placeholder="0" />
                    </div>
                  </div>

                  {/* Fixed Amount */}
                  <div className="bg-white p-4 rounded-xl border border-orange-100/50 shadow-sm hover:shadow-md transition-all duration-200 group">
                    <label className="block text-sm font-bold text-gray-800 mb-1">Fixed Contribution</label>
                    <p className="text-[11px] text-gray-500 mb-3 leading-tight group-hover:text-gray-700 transition-colors">Mandatory amount per flat (e.g. ₹1,000).</p>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-orange-600 font-semibold">₹</span>
                      <input type="number" name="amountPerFlat" value={formData.amountPerFlat} onChange={handleChange} className="w-full pl-8 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-colors" placeholder="0" />
                    </div>
                  </div>

                  {/* Suggested Amount */}
                  <div className="bg-white p-4 rounded-xl border border-orange-100/50 shadow-sm hover:shadow-md transition-all duration-200 group">
                    <label className="block text-sm font-bold text-gray-800 mb-1">Suggested Amount</label>
                    <p className="text-[11px] text-gray-500 mb-3 leading-tight group-hover:text-gray-700 transition-colors">Optional donation guide (e.g. ₹501).</p>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-orange-600 font-semibold">₹</span>
                      <input type="number" name="suggestedAmount" value={formData.suggestedAmount} onChange={handleChange} className="w-full pl-8 pr-4 py-2 bg-gray-50/50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-colors" placeholder="0" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                <input required type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Date *</label>
                <input required type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
              </div>

              <div className="col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <FaUsers className="text-gray-400" /> Applicable To *
                </label>
                <select name="applicableType" value={formData.applicableType} onChange={handleChange} className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option value="ALL">All Residents</option>
                  <option value="SPECIFIC_BLOCK">Specific Block(s)</option>
                  <option value="SPECIFIC_FLAT">Specific Flat(s)</option>
                </select>

                {formData.applicableType === 'SPECIFIC_BLOCK' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Select Blocks</label>
                    <select multiple name="applicableBlocks" value={formData.applicableBlocks} onChange={(e) => handleMultiSelect(e, 'applicableBlocks')} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 h-24">
                      {blocks.map(b => (
                        <option key={b._id} value={b._id}>{b.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                )}

                {formData.applicableType === 'SPECIFIC_FLAT' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Select Flats</label>
                    <select multiple name="applicableFlats" value={formData.applicableFlats} onChange={(e) => handleMultiSelect(e, 'applicableFlats')} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 h-32">
                      {flats.map(f => (
                        <option key={f._id} value={f._id}>{f.flatNumber} - {f.blockId?.name}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                )}
              </div>
            </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button type="button" onClick={onClose} disabled={loading} className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium text-white bg-orange-600 rounded-xl hover:bg-orange-700 flex items-center">
                {loading ? 'Saving...' : 'Save Collection'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCollectionModal;
