import { ReactNode } from "react";

interface HeroSectionProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function HeroSection({ title, description, children }: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-16 bg-gradient-to-br from-primary/10 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            {description}
          </p>
          {children}
        </div>
      </div>
    </section>
  );
}
