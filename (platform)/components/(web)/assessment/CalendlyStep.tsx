"use client";

import React, { useState, useCallback, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, Target, AlertCircle, Video, Phone, MapPin } from "lucide-react";
import { CalendlyFallback } from "@/components/ui/calendly-fallback";
import type { CalendlyStatus } from "@/hooks/useCalendlyIntegration";

interface CalendlyStepProps {
  contactData: {
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    phone: string;
    communicationMethod: string;
    industry: string;
  };
  calendlyStatus: CalendlyStatus;
  onError: (error: string) => void;
  onLoad: () => void;
  onRetry: () => void;
  retryCount: number;
}

const communicationMethods = [
  { id: "google-meet", name: "Google Meet", icon: <Video className="w-4 h-4" /> },
  { id: "zoom", name: "Zoom", icon: <Video className="w-4 h-4" /> },
  { id: "phone", name: "Phone Call", icon: <Phone className="w-4 h-4" /> },
  { id: "in-person", name: "In-Person Meeting", icon: <MapPin className="w-4 h-4" /> }
];

// Enhanced Calendly Iframe Component
const CalendlyIframe = React.memo(({ onError, onLoad, contactData }: {
  onError: (error: string) => void;
  onLoad: () => void;
  contactData: any;
}) => {
  const [iframeStatus, setIframeStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  const [loadTimeout, setLoadTimeout] = React.useState<NodeJS.Timeout | null>(null);

  const handleIframeLoad = React.useCallback(() => {
    console.log('[Calendly] Assessment iframe loaded successfully');
    setIframeStatus('loaded');
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      setLoadTimeout(null);
    }
    onLoad();
  }, [onLoad, loadTimeout]);

  const handleIframeError = React.useCallback(() => {
    console.error('[Calendly] Assessment iframe failed to load');
    setIframeStatus('error');
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      setLoadTimeout(null);
    }
    onError('Assessment calendar failed to load properly');
  }, [onError, loadTimeout]);

  const buildCalendlyUrl = React.useCallback(() => {
    const baseUrl = "https://calendly.com/strivetech";
    const params = new URLSearchParams();

    if (contactData?.firstName && contactData?.lastName) {
      params.append('name', `${contactData.firstName} ${contactData.lastName}`);
    }
    if (contactData?.email) {
      params.append('email', contactData.email);
    }
    if (contactData?.company) {
      params.append('a1', contactData.company);
    }
    if (contactData?.phone) {
      params.append('a2', contactData.phone);
    }
    if (contactData?.industry) {
      params.append('a3', `Industry: ${contactData.industry}`);
    }

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }, [contactData]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (iframeStatus === 'loading') {
        console.warn('[Calendly] Assessment iframe loading timeout');
        setIframeStatus('error');
        onError('Assessment calendar is taking too long to load');
      }
    }, 15000);

    setLoadTimeout(timeout);

    return () => {
      clearTimeout(timeout);
    };
  }, [iframeStatus, onError]);

  return (
    <div className="w-full rounded-none md:rounded-lg overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
      {iframeStatus === 'loading' && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground">Loading assessment calendar...</p>
          </div>
        </div>
      )}
      <iframe
        src={buildCalendlyUrl()}
        width="100%"
        height="500"
        frameBorder="0"
        title="Schedule Your Assessment - Strive Tech"
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

export function CalendlyStep({ contactData, calendlyStatus, onError, onLoad, onRetry, retryCount }: CalendlyStepProps) {
  const handleCalendlyError = useCallback((error: string) => {
    console.error('[Calendly] Assessment iframe error:', error);
    onError(error);
  }, [onError]);

  const handleCalendlyLoad = useCallback(() => {
    console.log('[Calendly] Assessment iframe loaded successfully');
    onLoad();
  }, [onLoad]);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-card rounded-lg border">
        <CardHeader className="p-3 md:p-6">
          <CardTitle className="text-center flex items-center justify-center gap-2 text-base md:text-lg">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            Schedule Your Assessment
          </CardTitle>
          <p className="text-center text-muted-foreground text-xs md:text-sm">
            Choose a convenient time for your 30-minute assessment
          </p>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {calendlyStatus === 'loaded' ? (
            <CalendlyIframe
              onError={handleCalendlyError}
              onLoad={handleCalendlyLoad}
              contactData={contactData}
            />
          ) : (
            <CalendlyFallback
              status={calendlyStatus}
              error={calendlyStatus === 'error' ? 'Failed to load calendar' : undefined}
              onRetry={onRetry}
              retryCount={retryCount}
            />
          )}
          <div className="mt-3 md:mt-4 mx-3 md:mx-0 p-3 md:p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="space-y-2 md:space-y-3 text-sm">
              <h4 className="text-center font-semibold text-lg mb-3" style={{ color: '#ff7033' }}>— Your Details —</h4>
              <div className="space-y-1">
                <p><span className="font-medium" style={{ color: '#ff7033' }}>Communication Method:</span> <span className="font-medium" style={{ color: '#020a1c' }}>
                  {communicationMethods.find(m => m.id === contactData.communicationMethod)?.name}
                </span></p>
                <p><span className="font-medium" style={{ color: '#ff7033' }}>Contact:</span> <span className="font-medium" style={{ color: '#020a1c' }}>{contactData.firstName} {contactData.lastName}</span></p>
                <p><span className="font-medium" style={{ color: '#ff7033' }}>Email:</span> <span className="font-medium" style={{ color: '#020a1c' }}>{contactData.email}</span></p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4 md:mt-6 text-center mx-3 md:mx-0">
            <div className="flex items-center justify-center space-x-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-xs md:text-sm">30 minutes</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs md:text-sm">1-on-1 Session</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs md:text-sm">Tailored Solutions</span>
            </div>
          </div>
        </CardContent>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900">Email Confirmations</h4>
            <p className="text-sm text-blue-700 mt-1">
              You'll receive email confirmations immediately after booking, plus reminders 24 hours before, 2 hours before, and 15 minutes before your scheduled meeting time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
