"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/(shared)/ui/card";
import { Button } from "@/components/(shared)/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { validateEmail, validatePhone } from "@/lib/validation";
import { useCalendlyIntegration } from "@/hooks/useCalendlyIntegration";
import { ContactStep } from "@/components/(web)/assessment/ContactStep";
import { CalendlyStep } from "@/components/(web)/assessment/CalendlyStep";
import { BenefitsSection } from "@/components/(web)/assessment/BenefitsSection";

const Assessment = () => {
  const [step, setStep] = useState(1);
  const [contactData, setContactData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    communicationMethod: "google-meet",
    industry: "",
    otherIndustry: "",
    companySize: "",
    currentChallenges: [] as string[],
    otherChallenge: "",
    budgetRange: "",
    timeline: "",
    projectDescription: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: "",
    phone: ""
  });

  const calendlyIntegration = useCalendlyIntegration();

  const handleCalendlyError = useCallback((error: string) => {
    console.error('[Calendly] Assessment iframe error:', error);
  }, []);

  const handleCalendlyLoad = useCallback(() => {
    console.log('[Calendly] Assessment iframe loaded successfully');
  }, []);

  const isEmailValid = (email: string) => validateEmail(email).isValid;
  const isPhoneValid = (phone: string) => validatePhone(phone, true).isValid;

  const handleInputChange = (field: string, value: string) => {
    setContactData(prev => ({ ...prev, [field]: value }));

    if (field === 'email' || field === 'phone') {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }

    if (field === 'email' && value) {
      const emailValidation = validateEmail(value);
      if (!emailValidation.isValid) {
        setValidationErrors(prev => ({ ...prev, email: emailValidation.errorMessage || "" }));
      }
    }

    if (field === 'phone' && value) {
      const phoneValidation = validatePhone(value, true);
      if (!phoneValidation.isValid) {
        setValidationErrors(prev => ({ ...prev, phone: phoneValidation.errorMessage || "" }));
      }
    }
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setContactData(prev => ({
      ...prev,
      [field]: checked
        ? [...(prev[field as keyof typeof prev] as string[]), value]
        : ((prev[field as keyof typeof prev] as string[]).filter((item: string) => item !== value))
    }));
  };

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailValidation = validateEmail(contactData.email);
    const phoneValidation = validatePhone(contactData.phone, true);

    const newErrors = {
      email: !emailValidation.isValid ? emailValidation.errorMessage || "" : "",
      phone: !phoneValidation.isValid ? phoneValidation.errorMessage || "" : ""
    };

    setValidationErrors(newErrors);

    if (emailValidation.isValid && phoneValidation.isValid) {
      const submissionData = {
        firstName: contactData.firstName,
        lastName: contactData.lastName,
        fullName: `${contactData.firstName} ${contactData.lastName}`,
        email: contactData.email,
        phone: contactData.phone,
        company: contactData.company,
        jobTitle: contactData.industry === "Other" && contactData.otherIndustry ? contactData.otherIndustry : "",
        industry: contactData.industry === "Other" && contactData.otherIndustry ? contactData.otherIndustry : contactData.industry,
        companySize: contactData.companySize,
        currentChallenges: JSON.stringify(contactData.currentChallenges.includes("Other") && contactData.otherChallenge
          ? [...contactData.currentChallenges.filter(c => c !== "Other"), `Other: ${contactData.otherChallenge}`]
          : contactData.currentChallenges),
        projectTimeline: contactData.timeline,
        budgetRange: contactData.budgetRange,
        requestTypes: "assessment",
        demoFocusAreas: JSON.stringify([]),
        additionalRequirements: `Communication Method: ${contactData.communicationMethod}

Project Description: ${contactData.projectDescription || 'Not provided'}`,
        preferredDate: null
      };

      try {
        const response = await fetch('/api/request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          console.log("Assessment request submitted successfully:", result);
          setIsSubmitted(true);
          setStep(2);
          setTimeout(() => {
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          }, 100);
        } else {
          console.error("Assessment request submission failed:", result);
          alert("Failed to submit assessment request. Please try again.");
        }
      } catch (error) {
        console.error("Network error:", error);
        alert("Network error. Please check your connection and try again.");
      }
    }
  };

  const isContactValid = () => {
    return contactData.firstName &&
           contactData.lastName &&
           contactData.email &&
           isEmailValid(contactData.email) &&
           contactData.company &&
           contactData.phone &&
           isPhoneValid(contactData.phone) &&
           contactData.industry &&
           contactData.companySize;
  };

  return (
    <div className="pt-16 min-h-screen hero-gradient">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight" data-testid="assessment-title">
              Unlock Your Business's <span className="bg-gradient-to-br from-[#ff7033] via-orange-500 to-purple-600 bg-clip-text text-transparent inline-block">AI Advantage</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Discover actionable AI strategies tailored to your company's biggest challenges. Book your complimentary 30-minute assessment today.
            </p>
          </div>

          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-center space-x-4 mb-3 md:mb-4">
              {[1, 2].map((stepNum) => (
                <div
                  key={stepNum}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold transition-all ${
                    stepNum <= step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  data-testid={`step-indicator-${stepNum}`}
                >
                  {stepNum}
                </div>
              ))}
            </div>
            <div className="text-center text-xs md:text-sm text-muted-foreground">
              Step {step} of 2: {step === 1 ? "Contact Information" : "Schedule Meeting"}
            </div>
          </div>

          <Card className="bg-card border-border" style={{ backgroundColor: '#ffffffeb' }}>
            <CardContent className="p-6 md:p-8">
              {step === 1 ? (
                <form onSubmit={handleSubmitContact}>
                  <ContactStep
                    contactData={contactData}
                    validationErrors={validationErrors}
                    onInputChange={handleInputChange}
                    onCheckboxChange={handleCheckboxChange}
                  />

                  <div className="flex justify-end pt-6 md:pt-8">
                    <Button
                      type="submit"
                      disabled={!isContactValid()}
                      className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 md:px-8 h-11 md:h-auto text-sm md:text-base"
                      data-testid="button-proceed-to-scheduling"
                    >
                      Proceed to Scheduling
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </form>
              ) : (
                <CalendlyStep
                  contactData={contactData}
                  calendlyStatus={calendlyIntegration.status}
                  onError={handleCalendlyError}
                  onLoad={handleCalendlyLoad}
                  onRetry={calendlyIntegration.retry}
                  retryCount={calendlyIntegration.retryCount}
                />
              )}
            </CardContent>
          </Card>

          <BenefitsSection />
        </div>
      </div>
    </div>
  );
};

export default Assessment;
