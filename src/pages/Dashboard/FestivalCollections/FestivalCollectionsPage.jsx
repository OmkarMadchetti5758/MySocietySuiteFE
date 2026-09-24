import React, { useState, useEffect } from 'react';
import { FaPlus, FaCalendarAlt, FaMoneyBillWave, FaUsers, FaEye, FaSearch, FaCheckCircle, FaExclamationCircle, FaGift } from 'react-icons/fa';
import { festivalCollectionApi } from '../../../services/festivalCollectionApi';
import { usePermissions } from '../../../context/PermissionsContext';
import toast from 'react-hot-toast';
import CreateCollectionModal from './CreateCollectionModal';
import CollectionDetailsDrawer from './CollectionDetailsDrawer';
import ResidentPayNowModal from './ResidentPayNowModal';

const FestivalCollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { permissions } = usePermissions();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [selectedCollection, setSelectedCollection] = useState(null);
  
  const canManage = permissions?.community_events?.level >= 2; 

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await festivalCollectionApi.getCollections();
      if (res.status === 'success' || res.success) {
        setCollections(res.data);
      }
    } catch (error) {
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  const handleCreate = () => {
    setEditingCollection(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (collection) => {
    setEditingCollection(collection);
    setIsCreateModalOpen(true);
  };

  const handleView = (collection) => {
    setSelectedCollection(collection);
  };

  const filteredCollections = collections.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.purpose.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Festival Collections</h1>
          <p className="text-gray-500 text-sm mt-1">Manage society fundraisers and event collections</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {canManage && (
            <button onClick={handleCreate} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all w-full sm:w-auto font-medium shadow-sm">
              <FaPlus /> Create Collection
            </button>
          )}
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500/20 text-sm"
          />
        </div>
      </div>

      {/* Grid view */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 h-48 animate-pulse shadow-sm border border-gray-100"></div>
          ))}
        </div>
      ) : filteredCollections.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <FaGift className="mx-auto text-4xl text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No collections found</h3>
          <p className="text-gray-500 mt-1">No active fundraisers at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map(collection => (
            <div key={collection._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-xl">
                      <FaGift />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 line-clamp-1">{collection.title}</h3>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        collection.status === 'ACTIVE' ? 'bg-green-50 text-green-700' :
                        collection.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {collection.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMoneyBillWave className="w-4 h-4 mr-3 text-gray-400" />
                    Target: ₹{collection.targetAmount?.toLocaleString() || 0}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaCalendarAlt className="w-4 h-4 mr-3 text-gray-400" />
                    Due: {new Date(collection.dueDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaUsers className="w-4 h-4 mr-3 text-gray-400" />
                    {collection.applicableType === 'ALL' ? 'All Residents' : 
                     collection.applicableType === 'SPECIFIC_BLOCK' ? 'Specific Blocks' : 'Specific Flats'}
                  </div>
                </div>
                
                {canManage && (
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Collected</span>
                      <span className="font-bold text-gray-900">₹{collection.collectedAmount?.toLocaleString() || 0}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                      <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, ((collection.collectedAmount || 0) / (collection.targetAmount || 1)) * 100)}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 flex gap-2 border-t border-gray-100">
                <button onClick={() => handleView(collection)} className="flex-1 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-xl text-sm transition-colors border border-gray-200 flex items-center justify-center gap-2">
                  <FaEye /> Details
                </button>
                {canManage && (
                  <button onClick={() => handleEdit(collection)} className="flex-1 bg-white hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-xl text-sm transition-colors border border-gray-200">
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateCollectionModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
          onSuccess={fetchCollections}
          editData={editingCollection}
        />
      )}

      {selectedCollection && (
        <CollectionDetailsDrawer 
          isOpen={!!selectedCollection}
          onClose={() => setSelectedCollection(null)}
          collection={selectedCollection}
          canManage={canManage}
          onRefresh={fetchCollections}
        />
      )}

    </div>
  );
};

export default FestivalCollectionsPage;
