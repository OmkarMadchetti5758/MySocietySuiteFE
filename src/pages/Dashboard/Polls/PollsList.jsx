import React, { useState, useEffect, useCallback } from 'react';
import { FaPlus, FaPoll, FaCheckCircle, FaChartBar, FaCalendarTimes, FaClock, FaLock, FaTrash } from 'react-icons/fa';
import { pollApi } from '../../../services/pollApi';
import CreatePollModal from './CreatePollModal';
import ConfirmModal from '../../../components/common/ConfirmModal';

// Returns { label, expired } based on how much time is left until closingDate
const useCountdown = (closingDate) => {
  const getState = () => {
    const diff = new Date(closingDate) - new Date();
    if (diff <= 0) return { label: 'Closed', expired: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return { label: `${days}d ${hours}h left`, expired: false };
    if (hours > 0) return { label: `${hours}h ${mins}m left`, expired: false };
    return { label: `${mins}m left`, expired: false };
  };
  const [state, setState] = useState(getState);
  useEffect(() => {
    const interval = setInterval(() => setState(getState()), 60000);
    return () => clearInterval(interval);
  }, [closingDate]);
  return state;
};

const PollCard = ({ poll, onVote, onViewResults, onDelete, isAdmin }) => {
  const countdown = useCountdown(poll.closingDate);
  const isClosed = poll.status === 'closed' || countdown.expired;
  const hasVoted = !!poll.myVote;

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border flex flex-col gap-4 transition-all ${isClosed ? 'border-gray-200 opacity-90' : 'border-gray-100 hover:shadow-md'}`}>
      {/* Header */}
      <div className="flex justify-between items-start gap-2">
        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isClosed ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>
          {isClosed ? '🔒 CLOSED' : '🟢 ACTIVE'}
        </span>
        <div className={`text-xs font-medium flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${countdown.expired ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-600'}`}>
          <FaClock className="text-xs" />
          <span>{countdown.label}</span>
        </div>
        {isAdmin && (
          <button
            onClick={() => onDelete(poll._id)}
            className="text-gray-400 hover:text-red-500 transition-colors ml-2"
            title="Delete Poll"
          >
            <FaTrash />
          </button>
        )}
      </div>

      <h3 className="text-base font-bold text-gray-800 leading-snug">{poll.question}</h3>

      {/* Closing date/time */}
      <p className="text-xs text-gray-400 flex items-center gap-1">
        <FaCalendarTimes />
        Closes: {new Date(poll.closingDate).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>

      {/* Options */}
      <div className="flex flex-col gap-2 flex-1">
        {poll.options.map((option) => {
          const isMyVote = hasVoted && poll.myVote === option._id.toString();

          return (
            <button
              key={option._id}
              disabled={isClosed || hasVoted}
              onClick={() => !isClosed && !hasVoted && onVote(poll._id, option._id)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all flex justify-between items-center
                ${isMyVote
                  ? 'bg-orange-500 border-orange-500 text-white shadow-sm shadow-orange-200'
                  : hasVoted || isClosed
                    ? 'bg-gray-50 border-gray-200 text-gray-500 cursor-not-allowed'
                    : 'border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50 cursor-pointer'
                }`}
            >
              <span>{option.text}</span>
              {isMyVote && <FaCheckCircle className="shrink-0 ml-2" />}
              {isClosed && !isMyVote && <FaLock className="shrink-0 ml-2 text-gray-300 text-xs" />}
            </button>
          );
        })}
      </div>

      {/* Voted indicator */}
      {hasVoted && !isClosed && (
        <p className="text-xs text-orange-500 font-medium text-center">
          ✅ Your vote has been recorded
        </p>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          {poll.targetType === 'BLOCK' ? `📍 ${poll.targetBlockName || 'Specific Block'}` : '🏘️ All residents'}
        </span>
        <button
          onClick={() => onViewResults(poll._id)}
          className="text-orange-500 hover:text-orange-600 text-sm font-semibold flex items-center gap-1.5 transition-colors"
        >
          <FaChartBar /> Results
        </button>
      </div>
    </div>
  );
};

const PollsList = () => {
  const [polls, setPolls] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pollResults, setPollResults] = useState(null);
  const [pollToDelete, setPollToDelete] = useState(null);
  const [user, setUser] = useState(null);
  const [voteLoading, setVoteLoading] = useState(null); // pollId being voted on

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'committee_member' || user?.role === 'super_admin';

  const fetchPolls = useCallback(async () => {
    try {
      setLoading(true);
      const data = await pollApi.getPolls();
      setPolls(data.data || []);
    } catch (error) {
      console.error('Failed to fetch polls:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPolls(); }, [fetchPolls]);

  const handleVote = async (pollId, optionId) => {
    if (voteLoading) return;
    setVoteLoading(pollId);
    try {
      await pollApi.votePoll(pollId, optionId);
      // Optimistically update myVote so UI reflects immediately
      setPolls(prev => prev.map(p =>
        p._id === pollId ? { ...p, myVote: optionId } : p
      ));
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cast vote.');
    } finally {
      setVoteLoading(null);
    }
  };

  const viewResults = async (pollId) => {
    try {
      const data = await pollApi.getPollResults(pollId);
      setPollResults(data.data);
    } catch (error) {
      alert('Failed to load results.');
    }
  };

  const confirmDeletePoll = async () => {
    if (!pollToDelete) return;
    try {
      await pollApi.deletePoll(pollToDelete);
      fetchPolls();
    } catch (error) {
      console.error('Failed to delete poll:', error);
      alert('Failed to delete poll.');
    } finally {
      setPollToDelete(null);
    }
  };

  const handleDeleteClick = (pollId) => {
    setPollToDelete(pollId);
  };

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    fetchPolls();
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Community Polls</h2>
          <p className="text-gray-500 text-sm mt-1">Participate in decisions and view community opinions.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-xl text-sm font-semibold transition-colors shadow-sm flex items-center gap-2"
          >
            <FaPlus /> Create Poll
          </button>
        )}
      </div>

      {/* Poll grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading polls...</div>
      ) : polls.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <FaPoll className="text-5xl text-gray-200 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium">No polls available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <PollCard
              key={poll._id}
              poll={poll}
              onVote={handleVote}
              onViewResults={viewResults}
              onDelete={handleDeleteClick}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {isCreateModalOpen && (
        <CreatePollModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Results modal */}
      {pollResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 relative">
            <button
              onClick={() => setPollResults(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-1">Poll Results</h3>
            <p className="text-gray-500 font-medium mb-6 text-sm">{pollResults.poll.question}</p>

            <div className="flex flex-col gap-5">
              {pollResults.results.map((res) => (
                <div key={res.optionId}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold text-gray-700">{res.text}</span>
                    <span className="text-gray-500 font-medium">{res.count} vote{res.count !== 1 ? 's' : ''} · {res.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-700"
                      style={{ width: `${res.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <span className="text-sm text-gray-500 font-medium">Total votes: </span>
              <span className="text-sm font-bold text-gray-800">{pollResults.totalVotes}</span>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!pollToDelete}
        onClose={() => setPollToDelete(null)}
        onConfirm={confirmDeletePoll}
        title="Delete Poll"
        message="Are you sure you want to delete this poll? This action cannot be undone and all votes will be lost."
      />
    </div>
  );
};

export default PollsList;
