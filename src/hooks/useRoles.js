import { useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { rolesApi } from '../services/rolesApi';

export const useRoles = (societyIdProp) => {
  const params = useParams();
  const societyId = useMemo(() => {
    return societyIdProp ||
      params.societyId ||
      JSON.parse(localStorage.getItem('user') || '{}')?.societyId ||
      localStorage.getItem('societyDatabase');
  }, [societyIdProp, params.societyId]);

  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRoles = useCallback(async () => {
    if (!societyId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await rolesApi.getRoles(societyId);
      setRoles(data.data.roles);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, [societyId]);

  const fetchRoleDetails = useCallback(async (roleKey) => {
    if (!societyId || !roleKey) return;
    setLoading(true);
    setError(null);
    try {
      const data = await rolesApi.getRoleByKey(societyId, roleKey);
      setSelectedRole(data.data.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load role details');
    } finally {
      setLoading(false);
    }
  }, [societyId]);

  const updateRole = async (roleKey, permissions) => {
    if (!societyId || !roleKey) {
      toast.error('Unable to update: society ID or role is missing');
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await rolesApi.patchRole(societyId, roleKey, permissions);
      setSelectedRole(data.data.role);
      await fetchRoles(); // Refresh the list
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update role';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetRole = async (roleKey) => {
    if (!societyId || !roleKey) {
      toast.error('Unable to reset: society ID or role is missing');
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await rolesApi.resetRole(societyId, roleKey);
      setSelectedRole(data.data.role);
      await fetchRoles(); // Refresh the list
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset role';
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    roles,
    selectedRole,
    loading,
    error,
    fetchRoles,
    fetchRoleDetails,
    updateRole,
    resetRole,
    setSelectedRole,
    setError
  };
};
