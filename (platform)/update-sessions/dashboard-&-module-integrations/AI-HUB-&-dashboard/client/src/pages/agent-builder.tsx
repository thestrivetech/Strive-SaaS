import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Save, ArrowLeft, Brain, Sparkles, Settings } from "lucide-react";
import { Link } from "wouter";
import AgentAvatar from "@/components/agents/agent-avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AI_PROVIDERS, getModelOptions } from "@/lib/ai-providers";

const PERSONALITY_TRAITS = [
  "Professional", "Friendly", "Analytical", "Creative", "Empathetic",
  "Detail-oriented", "Strategic", "Proactive", "Patient", "Efficient",
  "Innovative", "Diplomatic", "Results-driven", "Collaborative", "Adaptable"
];

const COMMUNICATION_STYLES = [
  "Formal and professional",
  "Friendly and conversational", 
  "Direct and concise",
  "Detailed and thorough",
  "Casual and relaxed"
];

const EXPERTISE_AREAS = [
  "Sales", "Customer Support", "Marketing", "Data Analysis", "Content Creation",
  "Project Management", "Research", "Finance", "Legal", "HR", "IT Support",
  "Quality Assurance", "Business Strategy", "Training", "Operations"
];

const CAPABILITIES = [
  "Email Processing", "Data Analysis", "Content Generation", "Web Scraping",
  "API Integration", "File Processing", "Image Analysis", "Sentiment Analysis",
  "Language Translation", "Code Generation", "Report Creation", "Task Scheduling",
  "CRM Integration", "Calendar Management", "Document Processing"
];

export default function AgentBuilder() {
  const params = useParams();
  const { toast } = useToast();
  const isEditing = !!params.id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "IDLE",
    personality: {
      traits: [] as string[],
      communicationStyle: "",
      expertise: [] as string[],
    },
    modelConfig: {
      provider: "openai",
      model: "gpt-5",
      parameters: {
        max_completion_tokens: 4096,
      },
    },
    capabilities: [] as string[],
  });

  // Load existing agent if editing
  const { data: agent, isLoading } = useQuery({
    queryKey: ['/api/agents', params.id],
    enabled: isEditing,
  });

  useEffect(() => {
    if (agent && isEditing) {
      setFormData({
        name: (agent as any).name,
        description: (agent as any).description || "",
        status: (agent as any).status,
        personality: (agent as any).personality,
        modelConfig: (agent as any).modelConfig,
        capabilities: (agent as any).capabilities,
      });
    }
  }, [agent, isEditing]);

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = isEditing ? `/api/agents/${params.id}` : '/api/agents';
      const method = isEditing ? 'PUT' : 'POST';
      return apiRequest(method, url, data);
    },
    onSuccess: () => {
      toast({
        title: isEditing ? "Agent Updated" : "Agent Created",
        description: `${formData.name} has been ${isEditing ? 'updated' : 'created'} successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save agent",
        variant: "destructive",
      });
    }
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Agent name is required",
        variant: "destructive",
      });
      return;
    }

    if (formData.personality.traits.length === 0) {
      toast({
        title: "Validation Error", 
        description: "Please select at least one personality trait",
        variant: "destructive",
      });
      return;
    }

    saveMutation.mutate(formData);
  };

  const toggleTrait = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personality: {
        ...prev.personality,
        traits: prev.personality.traits.includes(trait)
          ? prev.personality.traits.filter(t => t !== trait)
          : [...prev.personality.traits, trait]
      }
    }));
  };

  const toggleExpertise = (expertise: string) => {
    setFormData(prev => ({
      ...prev,
      personality: {
        ...prev.personality,
        expertise: prev.personality.expertise.includes(expertise)
          ? prev.personality.expertise.filter(e => e !== expertise)
          : [...prev.personality.expertise, expertise]
      }
    }));
  };

  const toggleCapability = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }));
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading agent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="agent-builder">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/agents" data-testid="button-back">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Agents
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold neon-text" data-testid="page-title">
              {isEditing ? 'Edit Agent' : 'New Agent'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditing ? 'Modify your AI agent' : 'Create a new AI agent'}
            </p>
          </div>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          data-testid="button-save"
        >
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? 'Saving...' : 'Save Agent'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Preview */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Agent Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <AgentAvatar 
                agent={{
                  id: 'preview',
                  name: formData.name || 'New Agent',
                  status: formData.status
                }} 
                size="xl" 
                showStatus
                className="mx-auto mb-4"
              />
              <h3 className="font-semibold text-lg" data-testid="preview-name">
                {formData.name || 'Agent Name'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4" data-testid="preview-description">
                {formData.description || 'No description provided'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {formData.personality.traits.slice(0, 3).map((trait, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {trait}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agent Stats */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Configuration Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Personality Traits</span>
                  <Badge variant="outline" data-testid="stat-traits">
                    {formData.personality.traits.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Expertise Areas</span>
                  <Badge variant="outline" data-testid="stat-expertise">
                    {formData.personality.expertise.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Capabilities</span>
                  <Badge variant="outline" data-testid="stat-capabilities">
                    {formData.capabilities.length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">AI Provider</span>
                  <Badge variant="outline" data-testid="stat-provider">
                    {formData.modelConfig.provider}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter agent name"
                    data-testid="input-agent-name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger data-testid="select-agent-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IDLE">Idle</SelectItem>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="OFFLINE">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this agent does"
                  rows={3}
                  data-testid="input-agent-description"
                />
              </div>
            </CardContent>
          </Card>

          {/* Personality Configuration */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Personality & Expertise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Communication Style */}
              <div>
                <label className="text-sm font-medium mb-2 block">Communication Style</label>
                <Select 
                  value={formData.personality.communicationStyle} 
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    personality: { ...prev.personality, communicationStyle: value }
                  }))}
                >
                  <SelectTrigger data-testid="select-communication-style">
                    <SelectValue placeholder="Select communication style" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMUNICATION_STYLES.map((style) => (
                      <SelectItem key={style} value={style}>{style}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Personality Traits */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Personality Traits ({formData.personality.traits.length} selected)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {PERSONALITY_TRAITS.map((trait) => (
                    <div key={trait} className="flex items-center space-x-2">
                      <Checkbox
                        id={trait}
                        checked={formData.personality.traits.includes(trait)}
                        onCheckedChange={() => toggleTrait(trait)}
                        data-testid={`checkbox-trait-${trait.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                      <label htmlFor={trait} className="text-sm cursor-pointer">
                        {trait}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expertise Areas */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Expertise Areas ({formData.personality.expertise.length} selected)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {EXPERTISE_AREAS.map((expertise) => (
                    <div key={expertise} className="flex items-center space-x-2">
                      <Checkbox
                        id={expertise}
                        checked={formData.personality.expertise.includes(expertise)}
                        onCheckedChange={() => toggleExpertise(expertise)}
                        data-testid={`checkbox-expertise-${expertise.toLowerCase().replace(/\s+/g, '-')}`}
                      />
                      <label htmlFor={expertise} className="text-sm cursor-pointer">
                        {expertise}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Model Configuration */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>AI Model Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Provider</label>
                  <Select 
                    value={formData.modelConfig.provider} 
                    onValueChange={(value) => {
                      const provider = AI_PROVIDERS.find(p => p.id === value);
                      const defaultModel = provider?.models[0];
                      setFormData(prev => ({
                        ...prev,
                        modelConfig: {
                          ...prev.modelConfig,
                          provider: value,
                          model: defaultModel?.id || '',
                        }
                      }));
                    }}
                  >
                    <SelectTrigger data-testid="select-ai-provider">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_PROVIDERS.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Model</label>
                  <Select 
                    value={formData.modelConfig.model} 
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      modelConfig: { ...prev.modelConfig, model: value }
                    }))}
                  >
                    <SelectTrigger data-testid="select-ai-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getModelOptions(formData.modelConfig.provider).map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Model Parameters */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Max Tokens: {formData.modelConfig.parameters.max_completion_tokens}
                </label>
                <Slider
                  value={[formData.modelConfig.parameters.max_completion_tokens]}
                  onValueChange={([value]) => setFormData(prev => ({
                    ...prev,
                    modelConfig: {
                      ...prev.modelConfig,
                      parameters: { ...prev.modelConfig.parameters, max_completion_tokens: value }
                    }
                  }))}
                  max={8192}
                  min={256}
                  step={256}
                  className="w-full"
                  data-testid="slider-max-tokens"
                />
              </div>
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>
                Capabilities ({formData.capabilities.length} selected)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CAPABILITIES.map((capability) => (
                  <div key={capability} className="flex items-center space-x-2">
                    <Checkbox
                      id={capability}
                      checked={formData.capabilities.includes(capability)}
                      onCheckedChange={() => toggleCapability(capability)}
                      data-testid={`checkbox-capability-${capability.toLowerCase().replace(/\s+/g, '-')}`}
                    />
                    <label htmlFor={capability} className="text-sm cursor-pointer">
                      {capability}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
