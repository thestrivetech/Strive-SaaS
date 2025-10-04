"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProfessionalBrochure from "@/components/ui/professional-brochure";
import { generateProfessionalBrochurePDF } from "@/lib/pdf-generator";
import { ContactForm } from "@/components/(web)/contact/ContactForm";
import { ContactInfo } from "@/components/(web)/contact/ContactInfo";
import { QuickActions } from "@/components/(web)/contact/QuickActions";
import { FAQSection } from "@/components/(web)/contact/FAQSection";

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    companySize: "",
    message: "",
    privacyConsent: false
  });
  const [isBrochureModalOpen, setIsBrochureModalOpen] = useState(false);

  // Load saved form data from localStorage on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('contactFormData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          firstName: parsed.firstName || prev.firstName,
          lastName: parsed.lastName || prev.lastName,
          email: parsed.email || prev.email,
          company: parsed.company || prev.company,
          phone: parsed.phone || prev.phone,
          companySize: parsed.companySize || prev.companySize
        }));
      }
    } catch (error) {
      console.error('Failed to load saved contact form data:', error);
    }
  }, []);

  // Save form data to localStorage when it changes (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        if (formData.firstName || formData.lastName || formData.email || formData.company) {
          const dataToSave = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            company: formData.company,
            phone: formData.phone,
            companySize: formData.companySize
          };
          localStorage.setItem('contactFormData', JSON.stringify(dataToSave));
        }
      } catch (error) {
        console.error('Failed to save contact form data:', error);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [formData]);

  const handleSubmitSuccess = () => {
    try {
      localStorage.removeItem('contactFormData');
    } catch (error) {
      console.error('Failed to clear contact form data:', error);
    }

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      phone: "",
      companySize: "",
      message: "",
      privacyConsent: false
    });
  };

  const handleDownloadBrochure = async () => {
    try {
      toast({
        title: "Generating PDF...",
        description: "Please wait while we prepare your brochure download."
      });

      await generateProfessionalBrochurePDF({
        filename: 'Strive-Business-Solutions-Brochure.pdf'
      });

      toast({
        title: "Brochure Downloaded!",
        description: "The Strive brochure has been downloaded to your device."
      });
    } catch (error) {
      console.error('Error downloading brochure:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the brochure. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="pt-16">
      <section className="hero-gradient pt-16 md:pt-20 pb-12 md:pb-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h1
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight"
              data-testid="text-contact-title"
            >
              Accelerate Your <span className="bg-gradient-to-br from-[#ff7033] via-orange-500 to-purple-600 bg-clip-text text-transparent inline-block">Business Success</span> with AI
            </h1>
            <p
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
              data-testid="text-contact-subtitle"
            >
              Your challenges are unique, so let's talk about how custom AI solutions can unlock your next level of performance. Tell us where you want to go, and we'll help you get there.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Form */}
            <Card className="p-6 md:p-8" style={{ backgroundColor: '#ffffffeb' }}>
              <CardContent className="p-0">
                <h2
                  className="text-xl md:text-2xl font-bold mb-4 md:mb-6"
                  style={{ color: '#ff7033' }}
                  data-testid="text-form-title"
                >
                  Begin Your AI Transformation
                </h2>
                <ContactForm
                  formData={formData}
                  onFormDataChange={setFormData}
                  onSubmitSuccess={handleSubmitSuccess}
                />
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6 md:space-y-8">
              <ContactInfo />
              <QuickActions onBrochureClick={() => setIsBrochureModalOpen(true)} />
            </div>
          </div>

          <FAQSection />
        </div>
      </section>

      {/* Brochure Modal */}
      <Dialog open={isBrochureModalOpen} onOpenChange={setIsBrochureModalOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] w-[95vw] sm:w-auto overflow-y-auto modal-scrollbar">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Strive Business Solutions Brochure
            </DialogTitle>
          </DialogHeader>

          <ProfessionalBrochure onDownload={handleDownloadBrochure} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
