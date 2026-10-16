import { FaExclamationCircle, FaSave } from 'react-icons/fa';
import { Loader2 } from 'lucide-react';

const UnsavedChangesBar = ({
  hasChanges = false,
  onSave,
  onCancel,
  saving = false,
}) => {
  if (!hasChanges) return null;

  return (
    <div className="sticky bottom-0 z-20 mt-4 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl px-4 py-2.5 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Left: Warning Icon + Text */}
      <div className="flex items-center gap-2 text-[#C2410C]">
        <FaExclamationCircle className="text-sm shrink-0" />
        <span className="text-xs font-bold">You have unsaved changes</span>
      </div>

      {/* Right: Cancel & Save Buttons */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-3.5 py-1.5 text-xs font-semibold text-[#475569] bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="px-4 py-1.5 text-xs font-bold text-white bg-[#EA580C] hover:bg-[#C2410C] rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FaSave className="text-xs" />
          )}
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
};

export default UnsavedChangesBar;
