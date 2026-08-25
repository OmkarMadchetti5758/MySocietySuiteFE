import React, { useState, useEffect } from 'react';
import { FaPlus, FaBullhorn, FaFileAlt, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { noticeApi } from '../../../services/noticeApi';
import CreateNoticeModal from './CreateNoticeModal';
import NoticeDetailsModal from './NoticeDetailsModal';
import ConfirmModal from '../../../components/common/ConfirmModal';

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [noticeToEdit, setNoticeToEdit] = useState(null);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'committee_member' || user?.role === 'super_admin';

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const data = await noticeApi.getNotices();
      setNotices(data.data || []);
    } catch (error) {
      console.error('Failed to fetch notices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setNoticeToEdit(null);
    fetchNotices();
  };

  const confirmDeleteNotice = async () => {
    if (!noticeToDelete) return;
    try {
      await noticeApi.deleteNotice(noticeToDelete);
      fetchNotices();
    } catch (error) {
      console.error('Failed to delete notice:', error);
      alert('Failed to delete notice.');
    } finally {
      setNoticeToDelete(null);
    }
  };

  const handleDeleteClick = (noticeId) => {
    setNoticeToDelete(noticeId);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Notice Board</h2>
          <p className="text-gray-500 text-sm mt-1">Stay updated with society announcements and circulars.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
          >
            <FaPlus /> Create Notice
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10">Loading notices...</div>
      ) : notices.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <FaBullhorn className="text-4xl text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-lg">No notices available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notices.map((notice) => (
            <div key={notice._id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${notice.type === 'circular' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                  {notice.type.toUpperCase()}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(notice.createdAt).toLocaleDateString()}
                </span>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setNoticeToEdit(notice); setIsCreateModalOpen(true); }}
                      className="text-gray-400 hover:text-blue-500 transition-colors"
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(notice._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{notice.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-3 flex-1">{notice.description}</p>
              
              <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  {notice.attachmentUrl && <FaFileAlt className="text-gray-400" />}
                  <span>{notice.targetType === 'BLOCK' ? `📍 ${notice.targetBlockName || 'Specific Block'}` : '🏘️ All Residents'}</span>
                </div>
                <button
                  onClick={() => setSelectedNotice(notice)}
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1"
                >
                  <FaEye /> View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateNoticeModal
          onClose={() => { setIsCreateModalOpen(false); setNoticeToEdit(null); }}
          onSuccess={handleCreateSuccess}
          noticeToEdit={noticeToEdit}
        />
      )}

      {selectedNotice && (
        <NoticeDetailsModal
          notice={selectedNotice}
          onClose={() => setSelectedNotice(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!noticeToDelete}
        onClose={() => setNoticeToDelete(null)}
        onConfirm={confirmDeleteNotice}
        title="Delete Notice"
        message="Are you sure you want to delete this notice? This action cannot be undone."
      />
    </div>
  );
};

export default NoticeBoard;
