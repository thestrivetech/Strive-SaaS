'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Target } from 'lucide-react';
import { getMilestonesForType, getCurrentMilestone, getNextMilestone } from '@/lib/modules/milestones';
import type { TransactionType } from '@prisma/client';
import type { Milestone } from '@/lib/modules/milestones';
import { cn } from '@/lib/utils';

interface MilestoneTimelineProps {
  transactionType: TransactionType;
  currentProgress: number; // 0-100
  showTitle?: boolean;
}

export function MilestoneTimeline({
  transactionType,
  currentProgress,
  showTitle = true,
}: MilestoneTimelineProps) {
  const milestones = getMilestonesForType(transactionType);
  const currentMilestone = getCurrentMilestone(transactionType, currentProgress);
  const nextMilestone = getNextMilestone(transactionType, currentProgress);

  if (milestones.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No milestones defined for this transaction type.
        </CardContent>
      </Card>
    );
  }

  function getMilestoneStatus(
    milestone: Milestone
  ): 'completed' | 'current' | 'upcoming' {
    if (currentProgress >= milestone.completedPercentage) {
      return 'completed';
    }
    if (
      nextMilestone &&
      milestone.completedPercentage === nextMilestone.completedPercentage
    ) {
      return 'current';
    }
    return 'upcoming';
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Milestones
            </CardTitle>
            <Badge variant="outline">{currentProgress}% Complete</Badge>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-6">
        {/* Overall progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-medium">{currentProgress}%</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
          {currentMilestone && (
            <p className="text-sm text-muted-foreground">
              Current: <span className="font-medium">{currentMilestone.name}</span>
            </p>
          )}
          {nextMilestone && (
            <p className="text-sm text-muted-foreground">
              Next: <span className="font-medium">{nextMilestone.name}</span>
            </p>
          )}
        </div>

        {/* Milestone timeline */}
        <div className="relative space-y-4">
          {/* Vertical line */}
          <div className="absolute left-3 top-3 bottom-3 w-0.5 bg-border" />

          {milestones.map((milestone, index) => {
            const status = getMilestoneStatus(milestone);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';

            return (
              <div key={index} className="relative flex gap-4">
                {/* Milestone icon */}
                <div className="relative z-10 flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600 fill-green-50" />
                  ) : (
                    <Circle
                      className={cn(
                        'h-6 w-6',
                        isCurrent
                          ? 'text-primary fill-primary/10'
                          : 'text-muted-foreground fill-background'
                      )}
                    />
                  )}
                </div>

                {/* Milestone content */}
                <div
                  className={cn(
                    'flex-1 pb-4 space-y-1',
                    !isCompleted && 'opacity-70'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className={cn(
                        'font-medium text-sm',
                        isCurrent && 'text-primary'
                      )}
                    >
                      {milestone.name}
                    </h4>
                    <Badge
                      variant={isCompleted ? 'default' : isCurrent ? 'secondary' : 'outline'}
                      className="text-xs"
                    >
                      {milestone.completedPercentage}%
                    </Badge>
                  </div>

                  {/* Required items */}
                  {(milestone.requiredDocuments.length > 0 ||
                    milestone.requiredTasks.length > 0) && (
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      {milestone.requiredDocuments.length > 0 && (
                        <p>
                          Required documents: {milestone.requiredDocuments.join(', ')}
                        </p>
                      )}
                      {milestone.requiredTasks.length > 0 && (
                        <p>
                          Required tasks: {milestone.requiredTasks.length} task
                          {milestone.requiredTasks.length === 1 ? '' : 's'}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status indicator */}
                  {isCurrent && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-xs text-primary font-medium">
                        In Progress
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion message */}
        {currentProgress === 100 && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
            <p className="font-medium text-green-900 dark:text-green-100">
              All milestones completed!
            </p>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              This transaction has reached 100% completion.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
