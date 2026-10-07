import { useState } from 'react';
import toast from 'react-hot-toast';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { usePermissions } from '../../../../context/PermissionsContext';
import BudgetMainView from './BudgetMainView';
import CreateBudgetView from './CreateBudgetView';
import ApproveBudgetView from './ApproveBudgetView';
import RejectBudgetModal from './RejectBudgetModal';
import { INITIAL_BUDGET_DATA } from './mockBudgetData';

export default function BudgetingContainer({ onBack }) {
  const { permissions } = usePermissions();

  // Role resolution following the existing MySocietySuite RBAC pattern
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  })();

  const storedRoleKeys = (() => {
    try {
      return JSON.parse(localStorage.getItem('roleKeys') || '[]');
    } catch {
      return [];
    }
  })();

  // Support active role override if specified (e.g. for testing role switching)
  const activeRoleOverride = localStorage.getItem('activeRole');
  const role = activeRoleOverride || currentUser.role || '';
  const userRoleKeys = Array.isArray(currentUser.roleKeys) ? currentUser.roleKeys : [];
  const allRoleKeys = Array.from(new Set([role, ...userRoleKeys, ...storedRoleKeys].filter(Boolean)));

  const isAdmin =
    allRoleKeys.some((r) => ['admin', 'super_admin', 'committee_admin'].includes(r)) ||
    Boolean(permissions?.['billing.budget.approve']?.enabled);

  const isAccountant =
    allRoleKeys.some((r) => ['accountant'].includes(r)) ||
    Boolean(permissions?.['billing.budget.create']?.enabled);

  // Strict role boundaries:
  // - Accountant: Can view, Can Create/Edit/Save Draft, Cannot Approve or Reject
  // - Committee Admin/Admin: Can view, Can Approve or Reject, Cannot Create/Edit Draft
  // - Other roles (Resident, Tenant, Staff, Guard): Cannot access Budgeting
  const canViewBudgeting = isAdmin || isAccountant;
  const canCreateBudget = isAccountant && !isAdmin;
  const canApproveBudget = isAdmin;

  // Navigation view state: 'main' (Screen 1) | 'create' (Screen 2) | 'approve' (Screen 3)
  const [activeView, setActiveView] = useState('main');

  // Shared budget data state
  const [budgetData, setBudgetData] = useState(INITIAL_BUDGET_DATA);

  // Reject dialog modal state (Screen 3a)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Handler: Open Create View (Accountant only)
  const handleOpenCreateView = () => {
    if (!canCreateBudget) {
      toast.error('Access Denied: Only Accountants can create or edit budget drafts.');
      return;
    }
    setActiveView('create');
  };

  // Handler: Open Approve View (Committee Admin only)
  const handleOpenApproveView = () => {
    if (!canApproveBudget) {
      toast.error('Access Denied: Only Committee Administrators can approve or reject budgets.');
      return;
    }
    setActiveView('approve');
  };

  // Handler: Save draft from Screen 2 (Accountant only)
  const handleSaveDraft = (updatedBudget) => {
    if (!canCreateBudget) {
      toast.error('Access Denied: You do not have permission to save budget drafts.');
      return;
    }
    setBudgetData((prev) => ({
      ...prev,
      ...updatedBudget,
      status: 'Draft',
    }));
    toast.success('Budget draft saved successfully!');
    setActiveView('main');
  };

  // Handler: Approve budget from Screen 3 (Committee Admin only)
  const handleApproveBudget = () => {
    if (!canApproveBudget) {
      toast.error('Access Denied: Only Committee Administrators can approve budgets.');
      return;
    }
    setBudgetData((prev) => ({
      ...prev,
      status: 'Approved',
    }));
    toast.success(`Budget for FY ${budgetData.financialYear} approved successfully!`);
    setActiveView('main');
  };

  // Handler: Confirm rejection from Screen 3a modal (Committee Admin only)
  const handleConfirmReject = (reason) => {
    if (!canApproveBudget) {
      toast.error('Access Denied: Only Committee Administrators can reject budgets.');
      return;
    }
    setBudgetData((prev) => ({
      ...prev,
      status: 'Draft',
      rejectionReason: reason,
    }));
    setIsRejectModalOpen(false);
    toast.error('Budget rejected. Sent back to Accountant as a draft.');
    setActiveView('main');
  };

  // Handler: Change financial year
  const handleFinancialYearChange = (fy) => {
    setBudgetData((prev) => ({
      ...prev,
      financialYear: fy,
    }));
  };

  // Access Guard: Block unauthorized roles (Residents, Tenants, Staff, Guards)
  if (!canViewBudgeting) {
    return (
      <div className="animate-fade-in pb-12 max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600 transition-colors cursor-pointer"
          >
            <FaArrowLeft className="text-xs" /> Back to Billing Hub
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-md mx-auto shadow-2xs mt-8">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock className="text-lg" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">Access Restricted</h3>
          <p className="text-xs text-gray-500 mb-6">
            Only Accountants and Committee Administrators have permission to view or manage society budgets.
          </p>
          <button
            onClick={onBack}
            className="bg-[#18191b] hover:bg-black text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Return to Billing Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Screen 1: Main Budgeting View */}
      {activeView === 'main' && (
        <BudgetMainView
          budgetData={budgetData}
          onBackToHub={onBack}
          onCreateBudgetClick={handleOpenCreateView}
          onApproveBudgetClick={handleOpenApproveView}
          onFinancialYearChange={handleFinancialYearChange}
          canCreateBudget={canCreateBudget}
          canApproveBudget={canApproveBudget}
        />
      )}

      {/* Screen 2: Create Budget (Accountant only) */}
      {activeView === 'create' && canCreateBudget && (
        <CreateBudgetView
          budgetData={budgetData}
          onBackToBudgeting={() => setActiveView('main')}
          onSaveDraft={handleSaveDraft}
          canCreateBudget={canCreateBudget}
        />
      )}

      {/* Screen 3: Approve Budget (Committee Admin only) */}
      {activeView === 'approve' && canApproveBudget && (
        <ApproveBudgetView
          budgetData={budgetData}
          onBackToBudgeting={() => setActiveView('main')}
          onApproveClick={handleApproveBudget}
          onRejectClick={() => setIsRejectModalOpen(true)}
          canApproveBudget={canApproveBudget}
        />
      )}

      {/* Screen 3a: Rejection Reason Dialog Modal (Committee Admin only) */}
      {canApproveBudget && (
        <RejectBudgetModal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onConfirmReject={handleConfirmReject}
          financialYear={budgetData.financialYear}
          initialReason={budgetData.rejectionReason}
        />
      )}
    </div>
  );
}
