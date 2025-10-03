"use client";

import { Label } from "@/components/(shared)/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/(shared)/ui/select";
import { Checkbox } from "@/components/(shared)/ui/checkbox";
import { Input } from "@/components/(shared)/ui/input";

interface BusinessStepProps {
  formData: {
    industry: string;
    companySize: string;
    currentChallenges: string[];
    otherChallengeText: string;
    projectTimeline: string;
    budgetRange: string;
    requestTypes: string[];
  };
  onInputChange: (field: string, value: string) => void;
  onCheckboxChange: (field: string, value: string, checked: boolean) => void;
}

const inputStyle = {
  backgroundColor: '#ffffff',
  color: '#020a1c',
  borderColor: '#ff7033'
};

const industries = [
  "Healthcare", "Finance", "Manufacturing", "Retail",
  "Technology", "Education", "Real Estate", "Legal", "Other"
];

const companySizes = [
  "1-10 employees", "11-50 employees", "51-200 employees",
  "201-500 employees", "501-1000 employees", "1000+ employees"
];

const challenges = [
  "Process Automation", "Data Analytics", "Customer Experience",
  "Operational Efficiency", "Cost Reduction", "Scalability",
  "Security & Compliance", "Digital Transformation"
];

const projectTimelines = [
  "Immediate (ASAP)",
  "Within 1 month",
  "1-3 months",
  "3-6 months",
  "6-12 months",
  "12+ months",
  "Just exploring"
];

const budgetRanges = [
  "$1,000 - $5,000", "$5,000 - $10,000", "$10,000 - $25,000",
  "$25,000 - $50,000", "Over $50,000", "Not sure yet"
];

const requestTypeOptions = [
  { value: "showcase", label: "Solution Showcase", description: "Tailored presentation with personalized demo of AI solutions customized for your specific business needs" },
  { value: "assessment", label: "AI Assessment", description: "Comprehensive evaluation of your AI readiness and opportunities" }
];

export function BusinessStep({ formData, onInputChange, onCheckboxChange }: BusinessStepProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div>
          <Label htmlFor="industry" className="text-white text-sm md:text-base">Industry *</Label>
          <Select
            value={formData.industry}
            onValueChange={(value) => onInputChange("industry", value)}
          >
            <SelectTrigger className="h-11 md:h-10" style={inputStyle}>
            <SelectValue placeholder="Select your industry" />
            </SelectTrigger>
            <SelectContent>
              {industries.map((industry) => (
                <SelectItem key={industry} value={industry}>
                  {industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="companySize" className="text-white text-sm md:text-base">Company Size *</Label>
          <Select
            value={formData.companySize}
            onValueChange={(value) => onInputChange("companySize", value)}
          >
            <SelectTrigger className="h-11 md:h-10" style={inputStyle}>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              {companySizes.map((size) => (
                <SelectItem key={size} value={size}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-white text-sm md:text-base">Current Challenges * (Select all that apply)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mt-3">
          {challenges.map((challenge) => (
            <div key={challenge} className="flex items-center space-x-2">
              <Checkbox
                id={challenge}
                checked={formData.currentChallenges.includes(challenge)}
                onCheckedChange={(checked) =>
                  onCheckboxChange("currentChallenges", challenge, checked as boolean)
                }
              />
              <Label
                htmlFor={challenge}
                className="text-xs md:text-sm font-normal cursor-pointer text-white"
              >
                {challenge}
              </Label>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="other-challenge"
              checked={formData.currentChallenges.includes("Other")}
              onCheckedChange={(checked) => {
                onCheckboxChange("currentChallenges", "Other", checked as boolean);
                if (!checked) {
                  onInputChange("otherChallengeText", "");
                }
              }}
            />
            <Label
              htmlFor="other-challenge"
              className="text-xs md:text-sm font-normal cursor-pointer text-white"
            >
              Other
            </Label>
          </div>
        </div>
        {formData.currentChallenges.includes("Other") && (
          <div className="mt-4">
            <Input
              placeholder="Please specify your challenge or pain point..."
              value={formData.otherChallengeText}
              onChange={(e) => onInputChange("otherChallengeText", e.target.value)}
              className="w-full h-11 md:h-10"
              style={inputStyle}
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="projectTimeline" className="text-white text-sm md:text-base">Project Timeline *</Label>
        <Select
          value={formData.projectTimeline}
          onValueChange={(value) => onInputChange("projectTimeline", value)}
        >
          <SelectTrigger className="h-11 md:h-10" style={inputStyle}>
            <SelectValue placeholder="Select your project timeline" />
          </SelectTrigger>
          <SelectContent>
            {projectTimelines.map((timeline) => (
              <SelectItem key={timeline} value={timeline}>
                {timeline}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="budgetRange" className="text-white text-sm md:text-base">Budget Range</Label>
        <Select
          value={formData.budgetRange}
          onValueChange={(value) => onInputChange("budgetRange", value)}
        >
          <SelectTrigger className="h-11 md:h-10" style={inputStyle}>
            <SelectValue placeholder="Select budget range" />
          </SelectTrigger>
          <SelectContent>
            {budgetRanges.map((range) => (
              <SelectItem key={range} value={range}>
                {range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-white text-sm md:text-base">Services Requested * (Select all that apply)</Label>
        <div className="grid grid-cols-1 gap-3 md:gap-4 mt-3">
          {requestTypeOptions.map((option) => (
            <div
              key={option.value}
              className="border border-gray-300 rounded-lg p-3 md:p-4 bg-white/10 backdrop-blur-sm"
            >
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={option.value}
                  checked={formData.requestTypes.includes(option.value)}
                  onCheckedChange={(checked) => {
                    onCheckboxChange("requestTypes", option.value, checked as boolean);
                  }}
                  className="border-white data-[state=checked]:bg-[#ff7033] data-[state=checked]:border-[#ff7033]"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={option.value}
                    className="text-white font-semibold cursor-pointer text-sm md:text-base block"
                  >
                    {option.label}
                  </Label>
                  <p className="text-gray-200 text-xs md:text-sm mt-1">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {formData.requestTypes.length === 0 && (
          <p className="text-red-400 text-sm mt-2">Please select at least one service</p>
        )}
      </div>
    </div>
  );
}
