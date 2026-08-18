import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { managersApi } from '../services/managersApi';

export const useManagers = (societyId) => {
  const [managersData, setManagersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchManagers = useCallback(async (filters = {}) => {
    if (!societyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await managersApi.getManagers(societyId, filters);
      setManagersData(data.data.managers);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load managers';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [societyId]);

  const assignExistingResident = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      await managersApi.assignExistingResident(societyId, payload);
      toast.success('Manager assigned successfully');
      await fetchManagers(); // Refresh list
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to assign manager';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const inviteNewManager = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await managersApi.inviteNewManager(societyId, payload);
      toast.success('Manager invite sent successfully');
      await fetchManagers(); // Refresh list
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to invite manager';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deactivateManager = async (assignmentId) => {
    setLoading(true);
    setError(null);
    try {
      await managersApi.deactivateManager(societyId, assignmentId);
      toast.success('Manager deactivated successfully');
      await fetchManagers(); // Refresh list
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to deactivate manager';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resendInvite = async (assignmentId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await managersApi.resendInvite(societyId, assignmentId);
      toast.success(res.message || 'Invite resent successfully');
      await fetchManagers(); // Refresh list
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to resend invite';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    managersData,
    loading,
    error,
    fetchManagers,
    assignExistingResident,
    inviteNewManager,
    deactivateManager,
    resendInvite,
  };
};
