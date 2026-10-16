import React from 'react';
import { useParams } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { SetupProvider, useSetupWizard } from './context/SetupContext';
import SetupLayout from './components/SetupLayout';
import SetupStepper from './components/SetupStepper';
import SetupFooter from './components/SetupFooter';

// Step components
import Step1SocietyDetails from './steps/Step1SocietyDetails';
import Step2PropertyInventory from './steps/Step2PropertyInventory';
import Step3Amenities from './steps/Step3Amenities';
import Step4Contacts from './steps/Step4Contacts';
import Step5Documents from './steps/Step5Documents';
import Step6ReviewActivate from './steps/Step6ReviewActivate';

const WizardContent = () => {
  const { currentStep, prevStep, isDraftLoading } = useSetupWizard();

  if (isDraftLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-[#EA580C] rounded-full animate-spin mb-4" />
        <h2 className="text-lg font-bold text-gray-800">Loading Society Setup...</h2>
        <p className="text-xs text-gray-400 mt-1">Fetching your latest progress and society configuration</p>
      </div>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1SocietyDetails />;
      case 2:
        return <Step2PropertyInventory />;
      case 3:
        return <Step3Amenities />;
      case 4:
        return <Step4Contacts />;
      case 5:
        return <Step5Documents />;
      case 6:
        return <Step6ReviewActivate />;
      default:
        return <Step2PropertyInventory />;
    }
  };

  return (
    <SetupLayout>
      <SetupStepper />
      {currentStep > 1 && (
        <div className="mb-4">
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-50 hover:border-gray-300 transition-all shadow-2xs active:scale-[0.98]"
          >
            <FiArrowLeft className="text-gray-500 text-sm" />
            <span>Back</span>
          </button>
        </div>
      )}
      {renderStep()}
      <SetupFooter />
    </SetupLayout>
  );
};

const SocietySetupWizardPage = () => {
  const { societyId } = useParams();

  return (
    <SetupProvider initialSocietyId={societyId}>
      <WizardContent />
    </SetupProvider>
  );
};

export default SocietySetupWizardPage;
