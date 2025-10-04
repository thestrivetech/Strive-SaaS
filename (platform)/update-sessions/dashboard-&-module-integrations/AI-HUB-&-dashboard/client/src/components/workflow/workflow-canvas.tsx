import { useCallback } from 'react';
import { Card } from "@/components/ui/card";
import NodePalette from './node-palette';

interface WorkflowCanvasProps {
  isPreview?: boolean;
}

export default function WorkflowCanvas({ isPreview = false }: WorkflowCanvasProps) {
  const onNodeDragStart = useCallback((event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <div className={`relative ${isPreview ? 'h-80' : 'h-96'} rounded-lg bg-background/30 grid-background overflow-hidden border border-border/30`} data-testid="workflow-canvas">
      {/* Mock Workflow Nodes for Preview */}
      {isPreview && (
        <>
          {/* Trigger Node */}
          <div className="absolute top-8 left-8" data-testid="mock-trigger-node">
            <div className="workflow-node p-4 w-48">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded bg-neon-green/20 flex items-center justify-center">
                  <i className="fas fa-bolt text-neon-green"></i>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">TRIGGER</p>
                  <p className="font-medium text-sm">Webhook</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">On new lead received</p>
              {/* Output connector */}
              <div className="absolute -right-2 top-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background"></div>
            </div>
          </div>

          {/* AI Node */}
          <div className="absolute top-[120px] left-[360px]" data-testid="mock-ai-node">
            <div className="workflow-node p-4 w-48">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                  <i className="fas fa-brain text-primary"></i>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AI</p>
                  <p className="font-medium text-sm">Analyze Lead</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">GPT-5 qualification</p>
              {/* Input connector */}
              <div className="absolute -left-2 top-1/2 w-4 h-4 bg-neon-green rounded-full border-2 border-background"></div>
              {/* Output connector */}
              <div className="absolute -right-2 top-1/2 w-4 h-4 bg-accent rounded-full border-2 border-background"></div>
            </div>
          </div>

          {/* Action Node */}
          <div className="absolute top-[260px] left-8" data-testid="mock-action-node">
            <div className="workflow-node p-4 w-48">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center">
                  <i className="fas fa-database text-accent"></i>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">ACTION</p>
                  <p className="font-medium text-sm">Save to CRM</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Salesforce update</p>
              {/* Input connector */}
              <div className="absolute -left-2 top-1/2 w-4 h-4 bg-accent rounded-full border-2 border-background"></div>
            </div>
          </div>

          {/* Connection Lines */}
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {/* Trigger to AI */}
            <path 
              d="M 200 60 L 280 60 L 280 140 L 360 140" 
              stroke="url(#gradient1)" 
              strokeWidth="2" 
              fill="none" 
              strokeDasharray="5,5"
            />
            {/* AI to Action */}
            <path 
              d="M 552 160 L 620 160 L 620 240 L 120 240 L 120 280" 
              stroke="url(#gradient2)" 
              strokeWidth="2" 
              fill="none" 
              strokeDasharray="5,5"
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#00D2FF', stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: '#39FF14', stopOpacity: 0.5 }} />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: '#00D2FF', stopOpacity: 0.5 }} />
              </linearGradient>
            </defs>
          </svg>
        </>
      )}

      {/* Node Palette */}
      <NodePalette className="absolute bottom-4 right-4" />

      {/* Mini Map for Preview */}
      {isPreview && (
        <div className="absolute top-4 right-4 w-32 h-24 glass-panel rounded-lg p-2 opacity-50 hover:opacity-100 transition-opacity" data-testid="mini-map">
          <div className="relative w-full h-full bg-background/30 rounded">
            <div className="absolute top-1 left-1 w-6 h-4 bg-neon-green/30 rounded-sm"></div>
            <div className="absolute top-6 left-12 w-6 h-4 bg-primary/30 rounded-sm"></div>
            <div className="absolute top-12 left-1 w-6 h-4 bg-accent/30 rounded-sm"></div>
          </div>
        </div>
      )}

      {!isPreview && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-center">
            Drag nodes from the palette to start building your workflow
          </p>
        </div>
      )}
    </div>
  );
}
