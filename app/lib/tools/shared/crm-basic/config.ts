/**
 * CRM Basic Tool - Configuration
 */

import type { ToolSetting } from '../../types';

export const CRM_BASIC_SETTINGS: ToolSetting[] = [
  {
    key: 'autoAssignLeads',
    label: 'Auto-assign Leads',
    type: 'boolean',
    defaultValue: true,
    description: 'Automatically assign new leads to team members',
    required: false,
  },
  {
    key: 'leadScoring',
    label: 'Lead Scoring',
    type: 'boolean',
    defaultValue: false,
    description: 'Enable automatic lead scoring based on criteria',
    required: false,
  },
  {
    key: 'notifyOnNewLead',
    label: 'New Lead Notifications',
    type: 'boolean',
    defaultValue: true,
    description: 'Send notifications when new leads are created',
    required: false,
  },
  {
    key: 'roundRobinAssignment',
    label: 'Round Robin Assignment',
    type: 'boolean',
    defaultValue: false,
    description: 'Distribute leads evenly among team members',
    required: false,
  },
];

export const DEFAULT_CRM_SETTINGS = {
  autoAssignLeads: true,
  leadScoring: false,
  notifyOnNewLead: true,
  roundRobinAssignment: false,
};
