import { motion } from "framer-motion";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-3">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <motion.div
            className={`h-2 rounded-full transition-all duration-300 ${
              i < currentStep
                ? "bg-success w-2"
                : i === currentStep
                ? "bg-accent w-7"
                : "bg-border w-2"
            }`}
            layout
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        </div>
      ))}
      <span className="text-xs text-muted font-medium ml-2">
        {currentStep < steps.length ? `${currentStep + 1}/${steps.length}` : "Tamamlandı"}
      </span>
    </div>
  );
}
