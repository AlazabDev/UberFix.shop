import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface RegistrationStepperProps {
  steps: Step[];
  currentStep: number;
}

export function RegistrationStepper({ steps, currentStep }: RegistrationStepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                step.completed || step.current
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {step.completed ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium text-center",
                step.current ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
