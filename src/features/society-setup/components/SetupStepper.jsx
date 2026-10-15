import React from 'react';
import { FiCheck } from 'react-icons/fi';
import { useSetupWizard } from '../hooks/useSetupWizard';

const SetupStepper = () => {
  const { steps, currentStep, completedSteps, goToStep } = useSetupWizard();

  return (
    <div className="w-full bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs mb-6 overflow-x-auto">
      <div className="min-w-[760px] flex items-center justify-between">
        {steps.map((s, index) => {
          const isCompleted = completedSteps.includes(s.step) && s.step !== currentStep;
          const isCurrent = s.step === currentStep;
          const isPending = !isCompleted && !isCurrent;
          const isClickable = isCompleted || s.step < currentStep;

          return (
            <React.Fragment key={s.step}>
              {/* Step item */}
              <div
                onClick={() => isClickable && goToStep(s.step)}
                className={`flex items-center gap-3 transition-all ${
                  isClickable ? 'cursor-pointer hover:opacity-85' : 'cursor-default'
                }`}
              >
                {/* Circle Icon / Number */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-[#EA580C] text-white shadow-xs shadow-orange-500/30'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {isCompleted ? <FiCheck className="text-lg stroke-[3]" /> : s.step}
                </div>

                {/* Step Labels */}
                <div className="flex flex-col">
                  <span
                    className={`text-xs sm:text-sm font-semibold truncate max-w-[130px] ${
                      isCurrent
                        ? 'text-[#EA580C]'
                        : isCompleted
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}
                  >
                    {s.title}
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      isCurrent
                        ? 'text-[#EA580C]'
                        : isCompleted
                        ? 'text-emerald-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-3 h-[2px] bg-gray-200 min-w-[20px]" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default SetupStepper;
