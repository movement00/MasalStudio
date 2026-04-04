import { AnimatePresence, motion } from "framer-motion";
import { BottomNav, type WizardStep } from "./BottomNav";
import { StepIndicator } from "./StepIndicator";

const STEP_LABELS = ["Yükle", "Mod", "Ayarlar", "Üret"];
const STEP_ORDER: WizardStep[] = ["upload", "mode", "settings", "generate"];

interface MobileWizardProps {
  currentStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
  uploadContent: React.ReactNode;
  modeContent: React.ReactNode;
  settingsContent: React.ReactNode;
  generateContent: React.ReactNode;
}

export function MobileWizard({
  currentStep,
  onStepChange,
  uploadContent,
  modeContent,
  settingsContent,
  generateContent,
}: MobileWizardProps) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);

  const contentMap: Record<WizardStep, React.ReactNode> = {
    upload: uploadContent,
    mode: modeContent,
    settings: settingsContent,
    generate: generateContent,
  };

  return (
    <div className="md:hidden flex flex-col min-h-screen pb-20">
      <StepIndicator steps={STEP_LABELS} currentStep={currentIndex} />

      <div className="flex-1 px-4 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {contentMap[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav currentStep={currentStep} onStepChange={onStepChange} />
    </div>
  );
}
