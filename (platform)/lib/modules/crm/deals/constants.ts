/**
 * Deal Pipeline Constants
 *
 * Client-safe constants for the deals pipeline.
 * This file does NOT have 'server-only' so it can be imported by client components.
 */

import { DealStage } from '@prisma/client';

export interface StageConfig {
  id: DealStage;
  title: string;
  probability: number;
  color: string;
  order: number;
}

/**
 * Pipeline stages configuration
 * Ordered from earliest to latest in the sales process
 */
export const PIPELINE_STAGES: StageConfig[] = [
  {
    id: 'LEAD',
    title: 'Lead',
    probability: 10,
    color: 'gray',
    order: 1,
  },
  {
    id: 'QUALIFIED',
    title: 'Qualified',
    probability: 25,
    color: 'blue',
    order: 2,
  },
  {
    id: 'PROPOSAL',
    title: 'Proposal',
    probability: 50,
    color: 'yellow',
    order: 3,
  },
  {
    id: 'NEGOTIATION',
    title: 'Negotiation',
    probability: 75,
    color: 'orange',
    order: 4,
  },
  {
    id: 'CLOSING',
    title: 'Closing',
    probability: 90,
    color: 'green',
    order: 5,
  },
  {
    id: 'CLOSED_WON',
    title: 'Closed Won',
    probability: 100,
    color: 'emerald',
    order: 6,
  },
  {
    id: 'CLOSED_LOST',
    title: 'Closed Lost',
    probability: 0,
    color: 'red',
    order: 7,
  },
];
