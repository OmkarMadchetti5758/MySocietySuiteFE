import React from 'react';
import { FaTimes, FaCalendarAlt, FaUser, FaFileDownload, FaBuilding } from 'react-icons/fa';

const NoticeDetailsModal = ({ notice, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-gray-800">Notice Details</h3>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${notice.type === 'circular' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
              {notice.type.toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-2 bg-gray-50 rounded-full">
            <FaTimes />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{notice.title}</h2>

          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500 border-b border-gray-100 pb-6">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-400" />
              <span>{new Date(notice.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaUser className="text-gray-400" />
              <span>Posted by {notice.createdBy?.name || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaBuilding className="text-gray-400" />
              <span>Target: {notice.targetType === 'BLOCK' ? notice.targetBlockName || 'Specific Block' : 'All Residents'}</span>
            </div>
          </div>

          <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap mb-8">
            {notice.description}
          </div>

          {notice.attachmentUrl && (
            <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 text-orange-500 rounded-xl flex items-center justify-center">
                  <FaFileDownload />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Attached Document</p>
                  <p className="text-xs text-gray-500">Click to download</p>
                </div>
              </div>
              <a
                href={notice.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailsModal;
