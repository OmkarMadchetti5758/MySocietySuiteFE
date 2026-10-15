import React from 'react';
import { FiSave, FiArrowLeft, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import { useSetupWizard } from '../hooks/useSetupWizard';

const SetupFooter = () => {
  const {
    currentStep,
    prevStep,
    nextStep,
    saveAsDraft,
    activateSociety,
    isSavingDraft,
    isActivating,
  } = useSetupWizard();

  const isLastStep = currentStep === 6;

  return (
    <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3.5 px-4 sm:px-8 mt-10 -mx-4 sm:-mx-8 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      {/* Left: Save as Draft */}
      <div>
        <button
          type="button"
          onClick={saveAsDraft}
          disabled={isSavingDraft || isActivating}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50"
        >
          <FiSave className="text-gray-500 text-base" />
          <span>{isSavingDraft ? 'Saving Draft...' : 'Save as Draft'}</span>
        </button>
      </div>

      {/* Right: Back & Continue / Activate */}
      <div className="flex items-center gap-3">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
            disabled={isActivating}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 transition-all"
          >
            <FiArrowLeft className="text-gray-500 text-base" />
            <span>Back</span>
          </button>
        )}

        {!isLastStep ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={isActivating}
            className="inline-flex items-center gap-2 px-6 sm:px-7 py-2.5 rounded-xl bg-[#EA580C] hover:bg-[#d94f09] text-white font-semibold text-xs sm:text-sm shadow-sm shadow-orange-500/30 transition-all active:scale-[0.99]"
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
