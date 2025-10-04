"use client";

import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ContactInfo() {
  const contactInfo = [
    {
      icon: <MapPin className="text-primary w-6" />,
      title: "Location",
      content: "Nashville, TN"
    },
    {
      icon: <Phone className="text-primary w-6" />,
      title: "Phone",
      content: "(731)-431-2320"
    },
    {
      icon: <Mail className="text-primary w-6" />,
      title: "Email",
      content: "contact@strivetech.ai"
    },
    {
      icon: <Clock className="text-primary w-6" />,
      title: "Business Hours",
      content: "Mon-Fri: 8:00 AM - 8:00 PM EST"
    }
  ];

  return (
    <Card className="p-6 md:p-8" style={{ backgroundColor: '#ffffffeb' }}>
      <CardContent className="p-0">
        <h3
          className="text-lg md:text-xl font-bold mb-4 md:mb-6"
          style={{ color: '#020a1c' }}
          data-testid="text-contact-info-title"
        >
          Connect With Us
        </h3>
        <div className="space-y-4 md:space-y-4">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="flex items-center py-1"
              data-testid={`contact-info-${info.title.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="flex-shrink-0">
                {info.icon}
              </div>
              <div className="ml-4 md:ml-4">
                <div className="font-medium text-sm md:text-base" style={{ color: '#020a1c' }}>{info.title}</div>
                <div className="text-muted-foreground text-sm md:text-base" style={{ color: '#666' }}>{info.content}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
