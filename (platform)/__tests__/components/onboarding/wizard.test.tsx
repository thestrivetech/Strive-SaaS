import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrgDetailsForm } from '@/components/features/onboarding/org-details-form';
import { PlanSelectionForm } from '@/components/features/onboarding/plan-selection-form';
import { OnboardingProgress } from '@/components/features/onboarding/onboarding-progress';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
  })),
}));

describe('OnboardingProgress', () => {
  it('should render all steps', () => {
    const steps = ['Organization', 'Plan', 'Payment', 'Complete'];
    render(
      <OnboardingProgress currentStep={1} totalSteps={4} steps={steps} />
    );

    steps.forEach((step) => {
      expect(screen.getByText(step)).toBeInTheDocument();
    });
  });

  it('should highlight current step', () => {
    const steps = ['Organization', 'Plan', 'Payment', 'Complete'];
    render(
      <OnboardingProgress currentStep={2} totalSteps={4} steps={steps} />
    );

    const currentStepNumber = screen.getByText('2');
    expect(currentStepNumber.closest('div')).toHaveClass('border-primary');
  });

  it('should show check marks for completed steps', () => {
    const steps = ['Organization', 'Plan', 'Payment', 'Complete'];
    const { container } = render(
      <OnboardingProgress currentStep={3} totalSteps={4} steps={steps} />
    );

    // Should have check marks for steps 1 and 2
    const checkIcons = container.querySelectorAll('svg');
    expect(checkIcons.length).toBeGreaterThan(0);
  });
});

describe('OrgDetailsForm', () => {
  it('should render form fields', () => {
    render(<OrgDetailsForm onNext={jest.fn()} />);

    expect(screen.getByLabelText(/organization name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/website/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty name', async () => {
    const onNext = jest.fn();
    render(<OrgDetailsForm onNext={onNext} />);

    const submitButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/organization name must be at least 2 characters/i)
      ).toBeInTheDocument();
    });

    expect(onNext).not.toHaveBeenCalled();
  });

  it('should call onNext with valid data', async () => {
    const onNext = jest.fn();
    render(<OrgDetailsForm onNext={onNext} />);

    const nameInput = screen.getByLabelText(/organization name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Org' } });

    const submitButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onNext).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Org',
        })
      );
    });
  });

  it('should show validation error for invalid URL', async () => {
    const onNext = jest.fn();
    render(<OrgDetailsForm onNext={onNext} />);

    const nameInput = screen.getByLabelText(/organization name/i);
    const websiteInput = screen.getByLabelText(/website/i);

    fireEvent.change(nameInput, { target: { value: 'Test Org' } });
    fireEvent.change(websiteInput, { target: { value: 'not-a-url' } });

    const submitButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/must be a valid url/i)).toBeInTheDocument();
    });

    expect(onNext).not.toHaveBeenCalled();
  });
});

describe('PlanSelectionForm', () => {
  it('should render plan cards', () => {
    render(
      <PlanSelectionForm
        onNext={jest.fn()}
        onBack={jest.fn()}
        selectedTier={null}
      />
    );

    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Growth')).toBeInTheDocument();
    expect(screen.getByText('Elite')).toBeInTheDocument();
  });

  it('should call onBack when back button clicked', () => {
    const onBack = jest.fn();
    render(
      <PlanSelectionForm
        onNext={jest.fn()}
        onBack={onBack}
        selectedTier={null}
      />
    );

    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    expect(onBack).toHaveBeenCalled();
  });

  it('should enable continue button when plan selected', () => {
    render(
      <PlanSelectionForm
        onNext={jest.fn()}
        onBack={jest.fn()}
        selectedTier={null}
      />
    );

    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).toBeDisabled();

    // Click on Starter plan
    const starterCard = screen.getByText('Starter').closest('.cursor-pointer');
    if (starterCard) {
      fireEvent.click(starterCard);
    }

    expect(continueButton).not.toBeDisabled();
  });

  it('should pre-select tier from prop', () => {
    const { container } = render(
      <PlanSelectionForm
        onNext={jest.fn()}
        onBack={jest.fn()}
        selectedTier="GROWTH"
      />
    );

    // Continue button should be enabled
    const continueButton = screen.getByRole('button', { name: /continue/i });
    expect(continueButton).not.toBeDisabled();
  });
});
