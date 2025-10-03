"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/(shared)/ui/button";
import { Input } from "@/components/(shared)/ui/input";
import { Textarea } from "@/components/(shared)/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/(shared)/ui/select";
import { Checkbox } from "@/components/(shared)/ui/checkbox";
import { validatePhone } from "@/lib/validation";
import { useToast } from "@/hooks/use-toast";

interface ContactFormProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    phone: string;
    companySize: string;
    message: string;
    privacyConsent: boolean;
  };
  onFormDataChange: (data: any) => void;
  onSubmitSuccess: () => void;
}

export function ContactForm({ formData, onFormDataChange, onSubmitSuccess }: ContactFormProps) {
  const { toast } = useToast();
  const [validationErrors, setValidationErrors] = useState({ phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.privacyConsent) {
      toast({
        title: "Privacy consent required",
        description: "Please agree to our privacy policy to continue.",
        variant: "destructive"
      });
      return;
    }

    // Validate phone if provided
    if (formData.phone) {
      const phoneValidation = validatePhone(formData.phone, false);
      if (!phoneValidation.isValid) {
        setValidationErrors({ phone: phoneValidation.errorMessage || "" });
        toast({
          title: "Invalid phone number",
          description: "Please enter a valid phone number or leave it blank.",
          variant: "destructive"
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        company: formData.company?.trim() || "",
        phone: formData.phone?.trim() || "",
        companySize: formData.companySize || "",
        message: formData.message.trim(),
        privacyConsent: formData.privacyConsent
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast({
          title: "Message sent successfully!",
          description: result.message || "We'll get back to you within one business day.",
        });
        onSubmitSuccess();
      } else {
        toast({
          title: "Failed to send message",
          description: result.message || "Invalid form data - please check all fields and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#020a1c' }}>First Name *</label>
          <Input
            type="text"
            required
            placeholder="John"
            value={formData.firstName}
            onChange={(e) => onFormDataChange({ ...formData, firstName: e.target.value })}
            style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
            className="focus:ring-primary focus:border-primary h-12 sm:h-11 md:h-10"
            data-testid="input-first-name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Last Name *</label>
          <Input
            type="text"
            required
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => onFormDataChange({ ...formData, lastName: e.target.value })}
            style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
            className="focus:ring-primary focus:border-primary h-12 sm:h-11 md:h-10"
            data-testid="input-last-name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Business Email *</label>
        <Input
          type="email"
          required
          placeholder="john@company.com"
          value={formData.email}
          onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
          style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
          className="focus:ring-primary focus:border-primary h-11 md:h-10"
          data-testid="input-email"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Phone Number</label>
        <Input
          type="tel"
          placeholder="(731)-431-2320"
          value={formData.phone}
          onChange={(e) => {
            const value = e.target.value;
            onFormDataChange({ ...formData, phone: value });
            if (validationErrors.phone) {
              setValidationErrors({ phone: "" });
            }
            if (value) {
              const phoneValidation = validatePhone(value, false);
              if (!phoneValidation.isValid) {
                setValidationErrors({ phone: phoneValidation.errorMessage || "" });
              }
            }
          }}
          style={{
            backgroundColor: '#ffffff',
            color: '#020a1c',
            borderColor: validationErrors.phone ? '#ef4444' : '#ff7033'
          }}
          className="focus:ring-primary focus:border-primary h-11 md:h-10"
          data-testid="input-phone"
        />
        {validationErrors.phone && (
          <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Company Name</label>
        <Input
          type="text"
          placeholder="Your Company"
          value={formData.company}
          onChange={(e) => onFormDataChange({ ...formData, company: e.target.value })}
          style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
          className="focus:ring-primary focus:border-primary h-11 md:h-10"
          data-testid="input-company"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Company Size</label>
        <Select value={formData.companySize} onValueChange={(value) => onFormDataChange({ ...formData, companySize: value })}>
          <SelectTrigger data-testid="select-company-size" className="gap-2 h-12 sm:h-11 md:h-10" style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}>
            <Users className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-10">1-10 employees</SelectItem>
            <SelectItem value="11-50">11-50 employees</SelectItem>
            <SelectItem value="51-200">51-200 employees</SelectItem>
            <SelectItem value="201-1000">201-1000 employees</SelectItem>
            <SelectItem value="1000+">1000+ employees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: '#020a1c' }}>How can we help? *</label>
        <Textarea
          required
          rows={4}
          placeholder="Describe your biggest challenge or opportunity and our team will craft a personalized AI strategy..."
          value={formData.message}
          onChange={(e) => onFormDataChange({ ...formData, message: e.target.value })}
          style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
          className="focus:ring-primary focus:border-primary resize-none"
          data-testid="textarea-message"
        />
      </div>

      <div className="flex items-start space-x-3 py-1">
        <Checkbox
          id="privacy"
          checked={formData.privacyConsent}
          onCheckedChange={(checked) => onFormDataChange({ ...formData, privacyConsent: !!checked })}
          data-testid="checkbox-privacy"
          style={{ borderColor: '#ff7033' }}
        />
        <label htmlFor="privacy" className="text-sm" style={{ color: '#020a1c' }}>
          By submitting, you consent to a follow-up from our AI advisors and agree to our{" "}
          <a href="#" className="text-primary hover:underline" data-testid="link-privacy-policy">
            Privacy Policy
          </a>.
        </label>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground py-3 md:py-3 px-4 text-base md:text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/15 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[3rem]"
        data-testid="button-send-message"
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
