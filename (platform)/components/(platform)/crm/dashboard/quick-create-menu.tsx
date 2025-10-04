'use client';

import { useRef } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Plus, Users, Contact, DollarSign, Calendar } from 'lucide-react';
import { LeadFormDialog } from '../leads/lead-form-dialog';
import { ContactFormDialog } from '../contacts/contact-form-dialog';
import { DealFormDialog } from '../deals/deal-form-dialog';
import { AppointmentFormDialog } from '../calendar/appointment-form-dialog';

/**
 * Quick Create Menu Component
 *
 * Dropdown menu for quickly creating CRM entities
 *
 * @example
 * ```tsx
 * <QuickCreateMenu organizationId={currentOrg.id} />
 * ```
 */

interface QuickCreateMenuProps {
  organizationId: string;
}

export function QuickCreateMenu({ organizationId }: QuickCreateMenuProps) {
  const leadTriggerRef = useRef<HTMLButtonElement>(null);
  const contactTriggerRef = useRef<HTMLButtonElement>(null);
  const dealTriggerRef = useRef<HTMLButtonElement>(null);
  const appointmentTriggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Quick Create
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Create New</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => leadTriggerRef.current?.click()}>
            <Users className="h-4 w-4 mr-2" />
            New Lead
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => contactTriggerRef.current?.click()}>
            <Contact className="h-4 w-4 mr-2" />
            New Contact
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dealTriggerRef.current?.click()}>
            <DollarSign className="h-4 w-4 mr-2" />
            New Deal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => appointmentTriggerRef.current?.click()}>
            <Calendar className="h-4 w-4 mr-2" />
            New Appointment
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden Form Dialog Triggers */}
      <div className="hidden">
        <LeadFormDialog
          mode="create"
          organizationId={organizationId}
          trigger={<button ref={leadTriggerRef} />}
        />
        <ContactFormDialog
          mode="create"
          organizationId={organizationId}
          trigger={<button ref={contactTriggerRef} />}
        />
        <DealFormDialog
          mode="create"
          organizationId={organizationId}
          trigger={<button ref={dealTriggerRef} />}
        />
        <AppointmentFormDialog
          organizationId={organizationId}
          trigger={<button ref={appointmentTriggerRef} />}
        />
      </div>
    </>
  );
}
