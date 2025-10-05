import { useState, useCallback, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Play, Settings, ArrowLeft, Plus } from "lucide-react";
import { Link } from "wouter";
import WorkflowCanvas from "@/components/workflow/workflow-canvas";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWorkflowStore } from "@/store/workflow-store";

export default function WorkflowBuilder() {
  const params = useParams();
  const { toast } = useToast();
  const isEditing = !!params.id;
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("DRAFT");

  const { 
    nodes, 
    edges, 
    addNode, 
    updateNode, 
    deleteNode, 
    addEdge, 
    deleteEdge,
    setWorkflow,
    clearWorkflow 
  } = useWorkflowStore();

  // Load existing workflow if editing
  const { data: workflow, isLoading } = useQuery({
    queryKey: ['/api/workflows', params.id],
    enabled: isEditing,
  });

  // Initialize form with existing workflow data
  useEffect(() => {
    if (workflow && isEditing) {
      setName((workflow as any).name);
      setDescription((workflow as any).description || "");
      setStatus((workflow as any).status);
      setWorkflow((workflow as any).nodes || [], (workflow as any).edges || []);
    }
  }, [workflow, isEditing, setWorkflow]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing ? `/api/workflows/${params.id}` : '/api/workflows';
      const method = isEditing ? 'PUT' : 'POST';
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Workflow Updated" : "Workflow Created",
        description: `${name} has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save workflow",
        variant: "destructive",
      });
    }
  });

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Workflow name is required",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate({
      name,
      description,
      status,
      nodes,
      edges,
    });
  }, [name, description, status, nodes, edges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const nodeType = event.dataTransfer.getData('application/reactflow');
    if (!nodeType) return;

    const rect = (event.target as Element).getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const newNode = {
      id: `${nodeType}-${Date.now()}`,
      type: nodeType as any,
      position,
      data: {
        label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
        description: `New ${nodeType} node`,
        config: {},
      },
    };

    addNode(newNode);
  }, [addNode]);

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="workflow-builder">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/workflows" data-testid="button-back">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Workflows
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold neon-text" data-testid="page-title">
              {isEditing ? 'Edit Workflow' : 'New Workflow'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? 'Modify your automation workflow' : 'Design your automation workflow'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={handleSave}
            disabled={saveMutation.isPending}
            data-testid="button-save"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
          <Button 
            className="bg-gradient-to-r from-neon-green to-primary"
            disabled={!name.trim() || nodes.length === 0}
            data-testid="button-run"
          >
            <Play className="w-4 h-4 mr-2" />
            Test Run
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Workflow Settings */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter workflow name"
                  data-testid="input-workflow-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this workflow does"
                  rows={3}
                  data-testid="input-workflow-description"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger data-testid="select-workflow-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="PAUSED">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Node Statistics */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Workflow Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Nodes</span>
                  <Badge variant="outline" data-testid="stat-total-nodes">{nodes.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Connections</span>
                  <Badge variant="outline" data-testid="stat-connections">{edges.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Triggers</span>
                  <Badge variant="outline" data-testid="stat-triggers">
                    {nodes.filter(n => n.type === 'trigger').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">AI Nodes</span>
                  <Badge variant="outline" data-testid="stat-ai-nodes">
                    {nodes.filter(n => n.type === 'ai').length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Canvas */}
        <div className="lg:col-span-3">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Workflow Canvas</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearWorkflow}
                  disabled={nodes.length === 0}
                  data-testid="button-clear-canvas"
                >
                  Clear Canvas
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="h-[600px]"
                onDragOver={onDragOver}
                onDrop={onDrop}
                data-testid="workflow-canvas-container"
              >
                <WorkflowCanvas />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Node Types Legend */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <span className="text-xs px-3 py-1 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30">
              <i className="fas fa-bolt mr-1"></i>
              Trigger - Starts the workflow
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/30">
              <i className="fas fa-brain mr-1"></i>
              AI - AI processing and analysis
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/30">
              <i className="fas fa-database mr-1"></i>
              Action - Perform operations
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-chart-4/10 text-chart-4 border border-chart-4/30">
              <i className="fas fa-code mr-1"></i>
              API - External service calls
            </span>
            <span className="text-xs px-3 py-1 rounded-full bg-neon-violet/10 text-neon-violet border border-neon-violet/30">
              <i className="fas fa-random mr-1"></i>
              Condition - Decision logic
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
