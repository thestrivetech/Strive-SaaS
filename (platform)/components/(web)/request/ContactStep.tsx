"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactStepProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    companyName: string;
    jobTitle: string;
  };
  validationErrors: {
    email: string;
    phone: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const inputStyle = {
  backgroundColor: '#ffffff',
  color: '#020a1c',
  borderColor: '#ff7033'
};

export function ContactStep({ formData, validationErrors, onInputChange }: ContactStepProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <Label htmlFor="firstName" className="text-white text-sm md:text-base">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => onInputChange("firstName", e.target.value)}
            placeholder="John"
            className="h-11 md:h-10"
            style={inputStyle}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-white text-sm md:text-base">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => onInputChange("lastName", e.target.value)}
            placeholder="Doe"
            className="h-11 md:h-10"
            style={inputStyle}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email" className="text-white text-sm md:text-base">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onInputChange("email", e.target.value)}
          placeholder="john@company.com"
          className="h-11 md:h-10"
          style={{
            ...inputStyle,
            borderColor: validationErrors.email ? '#ef4444' : '#ff7033'
          }}
          required
        />
        {validationErrors.email && (
          <p className="text-sm text-red-400 mt-1">{validationErrors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <Label htmlFor="phone" className="text-white text-sm md:text-base">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => onInputChange("phone", e.target.value)}
            placeholder="(731)-431-2320"
            className="h-11 md:h-10"
            style={{
              ...inputStyle,
              borderColor: validationErrors.phone ? '#ef4444' : '#ff7033'
            }}
            required
          />
          {validationErrors.phone && (
            <p className="text-sm text-red-400 mt-1">{validationErrors.phone}</p>
          )}
        </div>
        <div>
          <Label htmlFor="companyName" className="text-white text-sm md:text-base">Company Name *</Label>
          <Input
            id="companyName"
            value={formData.companyName}
            onChange={(e) => onInputChange("companyName", e.target.value)}
            placeholder="Acme Corporation"
            className="h-11 md:h-10"
            style={inputStyle}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="jobTitle" className="text-white text-sm md:text-base">Job Title</Label>
        <Input
          id="jobTitle"
          value={formData.jobTitle}
          onChange={(e) => onInputChange("jobTitle", e.target.value)}
          placeholder="Chief Technology Officer"
          className="h-11 md:h-10"
          style={inputStyle}
        />
      </div>
    </div>
  );
}
