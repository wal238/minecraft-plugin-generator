import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'mpb-tour-completed';

export function useTour(steps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    try {
      const completed = localStorage.getItem(STORAGE_KEY);
      if (!completed) {
        const timer = setTimeout(() => setIsOpen(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const activeSteps = steps.filter((step) => {
    if (!step.optional) return true;
    if (!step.target) return true;
    return document.querySelector(step.target) !== null;
  });

  const currentStep = activeSteps[currentStepIndex] || null;
  const totalSteps = activeSteps.length;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  const goNext = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((i) => i + 1);
    }
  }, [currentStepIndex, totalSteps]);

  const goBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1);
    }
  }, [currentStepIndex]);

  const close = useCallback(() => {
    setIsOpen(false);
    setCurrentStepIndex(0);
    if (dontShowAgain) {
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
      } catch { /* ignore */ }
    }
  }, [dontShowAgain]);

  const finish = useCallback(() => {
    setIsOpen(false);
    setCurrentStepIndex(0);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch { /* ignore */ }
  }, []);

  const start = useCallback(() => {
    setCurrentStepIndex(0);
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    currentStep,
    currentStepIndex,
    totalSteps,
    isFirstStep,
    isLastStep,
    dontShowAgain,
    setDontShowAgain,
    goNext,
    goBack,
    close,
    finish,
    start,
  };
}
