import React from 'react';
import { useParams } from 'react-router-dom';
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
  const { currentStep } = useSetupWizard();

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
