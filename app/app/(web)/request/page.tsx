"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { validateEmail, validatePhone } from "@/lib/validation";
import { useCalendlyIntegration } from "@/hooks/useCalendlyIntegration";
import { ContactStep } from "@/components/request/ContactStep";
import { BusinessStep } from "@/components/request/BusinessStep";
import { DemoStep } from "@/components/request/DemoStep";
import { SuccessMessage } from "@/components/request/SuccessMessage";
import { BenefitsSection } from "@/components/request/BenefitsSection";

const Request = () => {
  const router = useRouter();
  const [formStep, setFormStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [validationErrors, setValidationErrors] = useState({ email: "", phone: "" });
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", fullName: "", email: "", phone: "", companyName: "", jobTitle: "",
    industry: "", companySize: "", currentChallenges: [] as string[], otherChallengeText: "",
    projectTimeline: "", budgetRange: "", requestTypes: [] as string[], demoFocusAreas: [] as string[],
    otherDemoFocusText: "", additionalRequirements: ""
  });

  const calendlyIntegration = useCalendlyIntegration();

  const handleCalendlyError = useCallback((error: string) => {
    console.error('[Calendly] Iframe error:', error);
  }, []);

  const handleCalendlyLoad = useCallback(() => {
    console.log('[Calendly] Iframe loaded successfully');
  }, []);

  const isEmailValid = (email: string) => validateEmail(email).isValid;
  const isPhoneValid = (phone: string) => validatePhone(phone, true).isValid;

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

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
    setFormData(prev => {
      const currentArray = prev[field as keyof typeof prev] as string[];
      if (!Array.isArray(currentArray)) return prev;

      return {
        ...prev,
        [field]: checked
          ? [...currentArray, value]
          : currentArray.filter((item: string) => item !== value)
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formStep !== 3) return;

    const submissionData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      company: formData.companyName,
      jobTitle: formData.jobTitle,
      industry: formData.industry,
      companySize: formData.companySize,
      currentChallenges: JSON.stringify(formData.currentChallenges.includes("Other") && formData.otherChallengeText
        ? [...formData.currentChallenges.filter(c => c !== "Other"), `Other: ${formData.otherChallengeText}`]
        : formData.currentChallenges),
      projectTimeline: formData.projectTimeline,
      budgetRange: formData.budgetRange,
      requestTypes: formData.requestTypes.join(','),
      demoFocusAreas: JSON.stringify(formData.demoFocusAreas.includes("Other") && formData.otherDemoFocusText
        ? [...formData.demoFocusAreas.filter(d => d !== "Other"), `Other: ${formData.otherDemoFocusText}`]
        : formData.demoFocusAreas),
      additionalRequirements: formData.additionalRequirements,
      preferredDate: null
    };

    try {
      const response = await fetch('/api/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        console.log("Request submitted successfully:", result);
      } else {
        console.error("Request submission failed:", result);
        alert("Failed to submit request. Please try again.");
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please check your connection and try again.");
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && isEmailValid(formData.email) &&
               formData.companyName && formData.phone && isPhoneValid(formData.phone);
      case 2:
        return formData.industry && formData.companySize && formData.currentChallenges.length > 0 &&
               formData.projectTimeline && formData.requestTypes.length > 0;
      case 3:
        return formData.demoFocusAreas.length > 0;
      default:
        return false;
    }
  };

  if (isSubmitted) {
    return <SuccessMessage onReturnHome={() => router.push("/")} />;
  }

  return (
    <div className="pt-16">
      <section className="py-12 md:py-16 bg-[#ffffffeb]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="relative mb-4">
                <div className="flex justify-between items-center">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold z-10 relative ${
                        formStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
                      } transition-all duration-300`}>
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200">
                  <div className={`h-full bg-primary transition-all duration-300`} style={{ width: `${((formStep - 1) / 2) * 100}%` }} />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className={`text-center flex-1 ${formStep >= 1 ? 'text-primary font-semibold' : 'text-gray-500'}`}>Contact Info</span>
                <span className={`text-center flex-1 ${formStep >= 2 ? 'text-primary font-semibold' : 'text-gray-500'}`}>Business Details</span>
                <span className={`text-center flex-1 ${formStep >= 3 ? 'text-primary font-semibold' : 'text-gray-500'}`}>Customize Your Solution</span>
              </div>
            </div>

            <Card className="hero-gradient shadow-xl">
              <CardHeader className="p-6 md:p-8">
                <CardTitle className="text-xl md:text-2xl text-[#ff7033]">
                  {formStep === 1 && "Ready to See AI in Action?"}
                  {formStep === 2 && "Tell Us About Your Business"}
                  {formStep === 3 && "See Your AI Roadmap"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit}>
                  {formStep === 1 && (
                    <ContactStep
                      formData={formData}
                      validationErrors={validationErrors}
                      onInputChange={handleInputChange}
                    />
                  )}

                  {formStep === 2 && (
                    <BusinessStep
                      formData={formData}
                      onInputChange={handleInputChange}
                      onCheckboxChange={handleCheckboxChange}
                    />
                  )}

                  {formStep === 3 && (
                    <DemoStep
                      formData={formData}
                      calendlyStatus={calendlyIntegration.status}
                      onInputChange={handleInputChange}
                      onCheckboxChange={handleCheckboxChange}
                      onError={handleCalendlyError}
                      onLoad={handleCalendlyLoad}
                      onRetry={calendlyIntegration.retry}
                      retryCount={calendlyIntegration.retryCount}
                    />
                  )}

                  <div className="flex justify-between mt-8">
                    {formStep > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormStep(formStep - 1)}
                      >
                        Previous
                      </Button>
                    )}

                    {formStep < 3 ? (
                      <Button
                        type="button"
                        className="ml-auto bg-primary hover:bg-primary/90"
                        onClick={() => {
                          const nextStep = formStep + 1;
                          setFormStep(nextStep);
                          if (nextStep === 3) {
                            setTimeout(() => {
                              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                            }, 100);
                          }
                        }}
                        disabled={!isStepComplete(formStep)}
                      >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        className="ml-auto text-white px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg relative overflow-hidden group"
                        style={{ background: 'linear-gradient(135deg, #ff7033 0%, #9333ea 50%, #ff7033 100%)' }}
                        disabled={!isStepComplete(3)}
                      >
                        <span className="relative z-10 flex items-center">
                          <Zap className="mr-2 h-5 w-5" />
                          Submit Request
                          <Zap className="ml-2 h-5 w-5" />
                        </span>
                        <div className="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <BenefitsSection />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Request;
