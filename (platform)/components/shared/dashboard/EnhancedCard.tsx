'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

export type GlassEffect = 'none' | 'subtle' | 'medium' | 'strong';
export type NeonBorder = 'none' | 'cyan' | 'purple' | 'green' | 'orange';

export interface EnhancedCardProps extends React.ComponentProps<typeof Card> {
  glassEffect?: GlassEffect;
  neonBorder?: NeonBorder;
  hoverEffect?: boolean;
  children: React.ReactNode;
}

const glassEffectMap: Record<GlassEffect, string> = {
  none: '',
  subtle: 'glass-subtle',
  medium: 'glass',
  strong: 'glass-strong',
};

const neonBorderMap: Record<NeonBorder, string> = {
  none: '',
  cyan: 'neon-border-cyan',
  purple: 'neon-border-purple',
  green: 'neon-border-green',
  orange: 'neon-border-orange',
};

const hoverGlowMap: Record<NeonBorder, string> = {
  none: '',
  cyan: '0 10px 30px rgba(0, 210, 255, 0.2)',
  purple: '0 10px 30px rgba(139, 92, 246, 0.2)',
  green: '0 10px 30px rgba(57, 255, 20, 0.2)',
  orange: '0 10px 30px rgba(255, 112, 51, 0.2)',
};

export const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  (
    {
      glassEffect = 'medium',
      neonBorder = 'none',
      hoverEffect = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const glassClass = glassEffectMap[glassEffect];
    const neonClass = neonBorderMap[neonBorder];
    const hoverGlow = hoverGlowMap[neonBorder];

    const cardClassName = cn(glassClass, neonClass, className);

    if (hoverEffect) {
      return (
        <motion.div
          whileHover={{
            y: -4,
            boxShadow: hoverGlow || '0 10px 30px rgba(0, 210, 255, 0.1)',
          }}
          transition={{ duration: 0.2 }}
        >
          <Card ref={ref} className={cardClassName} {...props}>
            {children}
          </Card>
        </motion.div>
      );
    }

    return (
      <Card ref={ref} className={cardClassName} {...props}>
        {children}
      </Card>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

// Export Card sub-components for convenience
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
