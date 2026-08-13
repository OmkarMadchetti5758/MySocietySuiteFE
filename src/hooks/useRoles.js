import { useState, useCallback } from 'react';
import { rolesApi } from '../services/rolesApi';

export const useRoles = (societyId) => {
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
    if (!societyId || !roleKey) return;
    setLoading(true);
    setError(null);
    try {
      const data = await rolesApi.patchRole(societyId, roleKey, permissions);
      setSelectedRole(data.data.role);
      await fetchRoles(); // Refresh the list
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetRole = async (roleKey) => {
    if (!societyId || !roleKey) return;
    setLoading(true);
    setError(null);
    try {
      const data = await rolesApi.resetRole(societyId, roleKey);
      setSelectedRole(data.data.role);
      await fetchRoles(); // Refresh the list
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset role');
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
