import React from 'react';
import { FiSave, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useSetupWizard } from '../hooks/useSetupWizard';

const SetupFooter = () => {
  const {
    currentStep,
    nextStep,
    saveAsDraft,
    activateSociety,
    isSavingDraft,
    isActivating,
  } = useSetupWizard();

  const isLastStep = currentStep === 6;

  return (
    <div className="pt-6 pb-8 flex items-center justify-between mt-6">
      {/* Draft button on bottom left side */}
      <div>
        <button
          type="button"
          onClick={saveAsDraft}
          disabled={isSavingDraft || isActivating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 shadow-2xs active:scale-[0.99]"
        >
          <FiSave className="text-gray-500 text-base" />
          <span>{isSavingDraft ? 'Saving Draft...' : 'Save as Draft'}</span>
        </button>
      </div>

      {/* Save & Continue / Activate button on bottom right side */}
      <div>
        {!isLastStep ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={isActivating}
            className="inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#d94f09] text-white font-semibold text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all active:scale-[0.99]"
          >
            <span>Save & Continue</span>
            <FiArrowRight className="text-base" />
          </button>
        ) : (
          <button
            type="button"
            onClick={activateSociety}
            disabled={isActivating}
            className="inline-flex items-center gap-2 px-7 sm:px-8 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#d94f09] text-white font-semibold text-xs sm:text-sm shadow-md shadow-orange-500/30 transition-all active:scale-[0.99] disabled:opacity-75"
          >
            {isActivating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Activating Society...</span>
              </>
            ) : (
              <>
                <span>Activate Society</span>
                <FiCheckCircle className="text-base" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default SetupFooter;
