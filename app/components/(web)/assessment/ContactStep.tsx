"use client";

import { Input } from "@/components/(shared)/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/(shared)/ui/select";
import { Checkbox } from "@/components/(shared)/ui/checkbox";
import { Textarea } from "@/components/(shared)/ui/textarea";
import { Users, Video, Phone, MapPin } from "lucide-react";

interface ContactStepProps {
  contactData: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    phone: string;
    communicationMethod: string;
    industry: string;
    otherIndustry: string;
    companySize: string;
    currentChallenges: string[];
    otherChallenge: string;
    budgetRange: string;
    timeline: string;
    projectDescription: string;
  };
  validationErrors: {
    email: string;
    phone: string;
  };
  onInputChange: (field: string, value: string) => void;
  onCheckboxChange: (field: string, value: string, checked: boolean) => void;
}

const communicationMethods = [
  { id: "google-meet", name: "Google Meet", icon: <Video className="w-4 h-4" /> },
  { id: "zoom", name: "Zoom", icon: <Video className="w-4 h-4" /> },
  { id: "phone", name: "Phone Call", icon: <Phone className="w-4 h-4" /> },
  { id: "in-person", name: "In-Person Meeting", icon: <MapPin className="w-4 h-4" /> }
];

export function ContactStep({ contactData, validationErrors, onInputChange, onCheckboxChange }: ContactStepProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="text-center mb-6 md:mb-8">
        <Users className="w-12 h-12 md:w-16 md:h-16 text-primary mx-auto mb-3 md:mb-4" />
        <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: '#ff7033' }} data-testid="step-title">
          Contact Information
        </h2>
        <p className="text-sm md:text-base text-muted-foreground" style={{ color: '#020a1c' }}>
          Tell us about your goals so we can recommend the ideal AI solution for your unique business needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#020a1c' }}>First Name *</label>
          <Input
            type="text"
            placeholder="John"
            value={contactData.firstName}
            onChange={(e) => onInputChange('firstName', e.target.value)}
            className="h-11 md:h-10"
            style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
            data-testid="input-first-name"
          />
        </div>

        <div>
          <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Last Name *</label>
          <Input
            type="text"
            placeholder="Doe"
            value={contactData.lastName}
            onChange={(e) => onInputChange('lastName', e.target.value)}
            className="h-11 md:h-10"
            style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
            data-testid="input-last-name"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Business Email *</label>
        <Input
          type="email"
          placeholder="john@company.com"
          value={contactData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          className="h-11 md:h-10"
          style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: validationErrors.email ? '#ef4444' : '#ff7033' }}
          data-testid="input-email"
        />
        {validationErrors.email && (
          <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
        )}
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Company Name *</label>
        <Input
          type="text"
          placeholder="Your Company"
          value={contactData.company}
          onChange={(e) => onInputChange('company', e.target.value)}
          className="h-11 md:h-10"
          style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
          data-testid="input-company"
        />
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Phone Number *</label>
        <Input
          type="tel"
          placeholder="(731)-431-2320"
          value={contactData.phone}
          onChange={(e) => onInputChange('phone', e.target.value)}
          className="h-11 md:h-10"
          style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: validationErrors.phone ? '#ef4444' : '#ff7033' }}
          data-testid="input-phone"
        />
        {validationErrors.phone && (
          <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Preferred Communication Method</label>
        <Select value={contactData.communicationMethod} onValueChange={(value) => onInputChange('communicationMethod', value)}>
          <SelectTrigger className="h-11 md:h-10" data-testid="select-communication-method" style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            {communicationMethods.map((method) => (
              <SelectItem key={method.id} value={method.id}>
                <div className="flex items-center gap-2">
                  {method.icon}
                  {method.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Industry *</label>
        <Select value={contactData.industry} onValueChange={(value) => onInputChange('industry', value)}>
          <SelectTrigger className="h-11 md:h-10" data-testid="select-industry" style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}>
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="real-estate">Real Estate</SelectItem>
            <SelectItem value="legal">Legal</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        {contactData.industry === "other" && (
          <Input
            type="text"
            placeholder="Please specify your industry..."
            value={contactData.otherIndustry}
            onChange={(e) => onInputChange('otherIndustry', e.target.value)}
            className="mt-2 h-11 md:h-10"
            style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
            data-testid="input-other-industry"
          />
        )}
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Company Size *</label>
        <Select value={contactData.companySize} onValueChange={(value) => onInputChange('companySize', value)}>
          <SelectTrigger className="h-11 md:h-10" data-testid="select-company-size" style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}>
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-10">1-10 employees</SelectItem>
            <SelectItem value="11-50">11-50 employees</SelectItem>
            <SelectItem value="51-200">51-200 employees</SelectItem>
            <SelectItem value="201-500">201-500 employees</SelectItem>
            <SelectItem value="501-1000">501-1000 employees</SelectItem>
            <SelectItem value="1000+">1000+ employees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Current Challenges (Select all that apply)</label>
        <div className="space-y-2">
          {[
            "Process Automation",
            "Data Analytics",
            "Customer Experience",
            "Operational Efficiency",
            "Cost Reduction",
            "Scalability",
            "Security & Compliance",
            "Digital Transformation",
            "Other"
          ].map((challenge) => (
            <div key={challenge} className="flex items-center space-x-2">
              <Checkbox
                id={challenge}
                checked={contactData.currentChallenges.includes(challenge)}
                onCheckedChange={(checked) => onCheckboxChange('currentChallenges', challenge, checked as boolean)}
              />
              <label htmlFor={challenge} className="text-xs md:text-sm cursor-pointer" style={{ color: '#020a1c' }}>
                {challenge}
              </label>
            </div>
          ))}
        </div>
        {contactData.currentChallenges.includes("Other") && (
          <Input
            type="text"
            placeholder="Please specify your challenge..."
            value={contactData.otherChallenge}
            onChange={(e) => onInputChange('otherChallenge', e.target.value)}
            className="mt-2 h-11 md:h-10"
            style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
            data-testid="input-other-challenge"
          />
        )}
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Budget Range</label>
        <Select value={contactData.budgetRange} onValueChange={(value) => onInputChange('budgetRange', value)}>
          <SelectTrigger className="h-11 md:h-10" data-testid="select-budget" style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}>
            <SelectValue placeholder="Select budget range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-5k">$1,000 - $5,000</SelectItem>
            <SelectItem value="5-10k">$5,000 - $10,000</SelectItem>
            <SelectItem value="10-25k">$10,000 - $25,000</SelectItem>
            <SelectItem value="25-50k">$25,000 - $50,000</SelectItem>
            <SelectItem value="over-50k">Over $50,000</SelectItem>
            <SelectItem value="not-sure">Not sure yet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Project Timeline</label>
        <Select value={contactData.timeline} onValueChange={(value) => onInputChange('timeline', value)}>
          <SelectTrigger className="h-11 md:h-10" data-testid="select-timeline" style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}>
            <SelectValue placeholder="When do you need this?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="immediate">Immediate (ASAP)</SelectItem>
            <SelectItem value="1-3months">1-3 months</SelectItem>
            <SelectItem value="3-6months">3-6 months</SelectItem>
            <SelectItem value="6-12months">6-12 months</SelectItem>
            <SelectItem value="planning">Just planning/researching</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="block text-xs md:text-sm font-medium mb-2" style={{ color: '#020a1c' }}>Project Description</label>
        <Textarea
          placeholder="Please briefly describe your project needs and goals..."
          value={contactData.projectDescription}
          onChange={(e) => onInputChange('projectDescription', e.target.value)}
          className="min-h-[80px] md:min-h-[100px] resize-none"
          style={{ backgroundColor: '#ffffff', color: '#020a1c', borderColor: '#ff7033' }}
          data-testid="textarea-project-description"
        />
      </div>
    </div>
  );
}
