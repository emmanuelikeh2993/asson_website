import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  saveOnboardingStatus,
  shouldShowOnboardingOnBoot,
} from '../lib/onboardingStorage';
import { trackEvent } from '../lib/telemetry';

export const TOTAL_ONBOARDING_STEPS = 5;

interface OnboardingContextType {
  isOpen: boolean;
  currentStep: number;
  totalSteps: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  restartOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous lazy initializer guarantees zero first-visit flash before render
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return shouldShowOnboardingOnBoot(window.location.pathname);
  });

  const [currentStep, setCurrentStep] = useState<number>(0);

  const completeOnboarding = useCallback(() => {
    saveOnboardingStatus('completed');
    trackEvent('onboarding_completed');
    setIsOpen(false);
    setCurrentStep(0);
  }, []);

  const skipOnboarding = useCallback(() => {
    saveOnboardingStatus('skipped');
    trackEvent('onboarding_skipped', { step: currentStep + 1 });
    setIsOpen(false);
    setCurrentStep(0);
  }, [currentStep]);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev >= TOTAL_ONBOARDING_STEPS - 1) {
        saveOnboardingStatus('completed');
        trackEvent('onboarding_completed');
        setIsOpen(false);
        return 0;
      }
      return prev + 1;
    });
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    const clamped = Math.max(0, Math.min(TOTAL_ONBOARDING_STEPS - 1, step));
    setCurrentStep(clamped);
  }, []);

  const restartOnboarding = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  return (
    <OnboardingContext.Provider
      value={{
        isOpen,
        currentStep,
        totalSteps: TOTAL_ONBOARDING_STEPS,
        nextStep,
        prevStep,
        goToStep,
        skipOnboarding,
        completeOnboarding,
        restartOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return ctx;
};
