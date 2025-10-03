"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Label } from "@/components/(shared)/ui/label";
import { Checkbox } from "@/components/(shared)/ui/checkbox";
import { Input } from "@/components/(shared)/ui/input";
import { Textarea } from "@/components/(shared)/ui/textarea";
import { Calendar } from "lucide-react";
import { CalendlyFallback } from "@/components/(shared)/ui/calendly-fallback";
import type { CalendlyStatus } from "@/hooks/useCalendlyIntegration";

interface DemoStepProps {
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    requestTypes: string[];
    demoFocusAreas: string[];
    otherDemoFocusText: string;
    additionalRequirements: string;
  };
  calendlyStatus: CalendlyStatus;
  onInputChange: (field: string, value: string) => void;
  onCheckboxChange: (field: string, value: string, checked: boolean) => void;
  onError: (error: string) => void;
  onLoad: () => void;
  onRetry: () => void;
  retryCount: number;
}

const inputStyle = {
  backgroundColor: '#ffffff',
  color: '#020a1c',
  borderColor: '#ff7033'
};

const demoFocusOptions = [
  "AI-Powered Dashboard", "Team Collaboration Tools", "Business Intelligence",
  "Security & Compliance", "Automation Solutions", "Analytics & Reporting",
  "Custom AI Models", "Integration Capabilities", "Other"
];

const CalendlyIframe = React.memo(({
  onError,
  onLoad,
  formData
}: {
  onError: (error: string) => void;
  onLoad: () => void;
  formData: any;
}) => {
  const [iframeStatus, setIframeStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  const [loadTimeout, setLoadTimeout] = React.useState<NodeJS.Timeout | null>(null);

  const handleIframeLoad = React.useCallback(() => {
    setIframeStatus('loaded');
    if (loadTimeout) clearTimeout(loadTimeout);
    onLoad();
  }, [onLoad, loadTimeout]);

  const handleIframeError = React.useCallback(() => {
    setIframeStatus('error');
    if (loadTimeout) clearTimeout(loadTimeout);
    onError('Iframe failed to load properly');
  }, [onError, loadTimeout]);

  const buildCalendlyUrl = React.useCallback(() => {
    const baseUrl = "https://calendly.com/strivetech";
    const params = new URLSearchParams();

    if (formData.firstName && formData.lastName) {
      params.append('name', `${formData.firstName} ${formData.lastName}`);
    }
    if (formData.email) params.append('email', formData.email);
    if (formData.companyName) params.append('a1', formData.companyName);
    if (formData.phone) params.append('a2', formData.phone);
    if (formData.requestTypes?.length > 0) {
      params.append('a3', formData.requestTypes.join(', '));
    }

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }, [formData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (iframeStatus === 'loading') {
        setIframeStatus('error');
        onError('Calendar is taking too long to load');
      }
    }, 15000);
    setLoadTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [iframeStatus, onError]);

  return (
    <div className="w-full rounded-none md:rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
      {iframeStatus === 'loading' && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading calendar...</p>
          </div>
        </div>
      )}
      <iframe
        src={buildCalendlyUrl()}
        width="100%"
        height="500"
        frameBorder="0"
        title="Schedule Your Showcase - Strive Tech"
        className="md:h-[630px]"
        style={{ borderRadius: '0px' }}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allow="camera; microphone; geolocation"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        loading="lazy"
      />
    </div>
  );
});

CalendlyIframe.displayName = 'CalendlyIframe';

export function DemoStep({
  formData,
  calendlyStatus,
  onInputChange,
  onCheckboxChange,
  onError,
  onLoad,
  onRetry,
  retryCount
}: DemoStepProps) {
  const handleCalendlyError = useCallback((error: string) => {
    onError(error);
  }, [onError]);

  const handleCalendlyLoad = useCallback(() => {
    onLoad();
  }, [onLoad]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <Label className="text-white text-sm md:text-base">Solution Focus Areas * (Select all that interest you)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mt-3">
          {demoFocusOptions.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={option}
                checked={formData.demoFocusAreas.includes(option)}
                onCheckedChange={(checked) => {
                  onCheckboxChange("demoFocusAreas", option, checked as boolean);
                  if (option === "Other" && !checked) {
                    onInputChange("otherDemoFocusText", "");
                  }
                }}
              />
              <Label
                htmlFor={option}
                className="text-xs md:text-sm font-normal cursor-pointer text-white"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
        {formData.demoFocusAreas.includes("Other") && (
          <div className="mt-4">
            <Input
              placeholder="Please specify your additional demo focus areas..."
              value={formData.otherDemoFocusText}
              onChange={(e) => onInputChange("otherDemoFocusText", e.target.value)}
              className="w-full h-11 md:h-10"
              style={inputStyle}
            />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="additionalRequirements" className="text-white text-sm md:text-base">
          Additional Requirements or Questions
        </Label>
        <Textarea
          id="additionalRequirements"
          value={formData.additionalRequirements}
          onChange={(e) => onInputChange("additionalRequirements", e.target.value)}
          placeholder="Tell us about any specific features you'd like to see or questions you have..."
          rows={4}
          style={inputStyle}
        />
      </div>

      <div>
        <div className="bg-card rounded-lg border">
          <div className="p-3 md:p-4">
            <h4 className="text-center flex items-center justify-center gap-2 font-semibold mb-2 text-base md:text-lg">
              <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              Schedule Your Showcase
            </h4>
            <p className="text-center text-muted-foreground mb-3 md:mb-4 text-xs md:text-sm">
              Choose a convenient time for your personalized solution Showcase
            </p>
          </div>
          <div className="px-0 md:px-4 pb-3 md:pb-4">
            {calendlyStatus === 'loaded' ? (
              <CalendlyIframe
                onError={handleCalendlyError}
                onLoad={handleCalendlyLoad}
                formData={formData}
              />
            ) : (
              <CalendlyFallback
                status={calendlyStatus}
                error={calendlyStatus === 'error' ? 'Failed to load calendar' : undefined}
                onRetry={onRetry}
                retryCount={retryCount}
              />
            )}
            <div className="mt-3 md:mt-4 p-3 md:p-4 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="space-y-2 md:space-y-3 text-sm">
                <h4 className="text-center font-semibold text-lg mb-3" style={{ color: '#ff7033' }}>— Your Details —</h4>
                <div className="space-y-1">
                  <p><span className="font-medium" style={{ color: '#ff7033' }}>Communication Method:</span> <span className="font-medium" style={{ color: '#020a1c' }}>Google Meet</span></p>
                  <p><span className="font-medium" style={{ color: '#ff7033' }}>Contact:</span> <span className="font-medium" style={{ color: '#020a1c' }}>{formData.firstName} {formData.lastName}</span></p>
                  <p><span className="font-medium" style={{ color: '#ff7033' }}>Email:</span> <span className="font-medium" style={{ color: '#020a1c' }}>{formData.email}</span></p>
                  <p><span className="font-medium" style={{ color: '#ff7033' }}>Company:</span> <span className="font-medium" style={{ color: '#020a1c' }}>{formData.companyName}</span></p>
                </div>
              </div>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-2 text-center">
              * You'll receive a calendar invite and confirmation email after scheduling, plus 3 reminders: 24 hours before, 2 hours before, and 15 minutes before your meeting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
