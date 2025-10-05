import { useState } from "react";
import { HolographicCard } from "@/components/HolographicCard";
import { ModelCard } from "@/components/ModelCard";
import { AgentAvatar } from "@/components/AgentAvatar";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles, Brain, Zap, X } from "lucide-react";

export default function AgentBuilder() {
  const [selectedModel, setSelectedModel] = useState("gpt-4");
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const [creativity, setCreativity] = useState([50]);
  const [expertise, setExpertise] = useState([75]);
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);

  //todo: remove mock functionality
  const models = [
    { id: "gpt-4", name: "GPT-4 Turbo", provider: "OpenAI", speed: 85, accuracy: 95 },
    { id: "claude", name: "Claude 3 Opus", provider: "Anthropic", speed: 90, accuracy: 98 },
    { id: "gemini", name: "Gemini Pro", provider: "Google", speed: 92, accuracy: 93 },
    { id: "groq", name: "Llama 3 70B", provider: "Groq", speed: 98, accuracy: 88 },
  ];

  const traits = [
    "Analytical", "Creative", "Friendly", "Professional", 
    "Technical", "Empathetic", "Concise", "Detailed"
  ];

  const toggleTrait = (trait: string) => {
    setSelectedTraits(prev => 
      prev.includes(trait) 
        ? prev.filter(t => t !== trait)
        : [...prev, trait]
    );
    console.log(`Trait ${trait} toggled`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
              <Bot className="w-7 h-7 text-violet-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Agent Builder Studio</h1>
              <p className="text-muted-foreground">Design your custom AI agent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <HolographicCard glowColor="violet">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    data-testid="input-agent-name"
                    placeholder="Enter agent name..."
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-description">Description</Label>
                  <Textarea
                    id="agent-description"
                    data-testid="input-agent-description"
                    placeholder="Describe your agent's purpose..."
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                    className="mt-2 min-h-24"
                  />
                </div>
              </CardContent>
            </HolographicCard>

            {/* Personality Configuration */}
            <HolographicCard glowColor="cyan">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-cyan-400" />
                  Personality Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Creativity</Label>
                    <span className="text-sm font-medium text-cyan-400">{creativity[0]}%</span>
                  </div>
                  <Slider
                    data-testid="slider-creativity"
                    value={creativity}
                    onValueChange={setCreativity}
                    max={100}
                    step={1}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label>Expertise Level</Label>
                    <span className="text-sm font-medium text-violet-400">{expertise[0]}%</span>
                  </div>
                  <Slider
                    data-testid="slider-expertise"
                    value={expertise}
                    onValueChange={setExpertise}
                    max={100}
                    step={1}
                  />
                </div>

                <div>
                  <Label className="mb-3 block">Personality Traits</Label>
                  <div className="flex flex-wrap gap-2">
                    {traits.map((trait) => (
                      <Badge
                        key={trait}
                        variant="outline"
                        className={`cursor-pointer transition-all hover-elevate ${
                          selectedTraits.includes(trait)
                            ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                            : ""
                        }`}
                        onClick={() => toggleTrait(trait)}
                        data-testid={`badge-trait-${trait.toLowerCase()}`}
                      >
                        {trait}
                        {selectedTraits.includes(trait) && (
                          <X className="w-3 h-3 ml-1" />
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </HolographicCard>

            {/* Model Selection */}
            <HolographicCard glowColor="emerald">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400" />
                  AI Model Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {models.map((model) => (
                    <ModelCard
                      key={model.id}
                      name={model.name}
                      provider={model.provider}
                      speed={model.speed}
                      accuracy={model.accuracy}
                      selected={selectedModel === model.id}
                      onClick={() => setSelectedModel(model.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </HolographicCard>
          </div>

          {/* Preview */}
          <div className="space-y-6">
            <HolographicCard glowColor="violet">
              <CardHeader>
                <CardTitle>Agent Preview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center text-center">
                  <AgentAvatar size="lg" status="active" className="mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {agentName || "Unnamed Agent"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {agentDescription || "No description provided"}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Model</span>
                    <span className="font-medium text-foreground">
                      {models.find(m => m.id === selectedModel)?.name || "None"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Creativity</span>
                    <span className="font-medium text-cyan-400">{creativity[0]}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expertise</span>
                    <span className="font-medium text-violet-400">{expertise[0]}%</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-sm text-muted-foreground mb-2 block">Traits</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedTraits.length > 0 ? (
                        selectedTraits.map((trait) => (
                          <Badge key={trait} variant="outline" className="text-xs">
                            {trait}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No traits selected</span>
                      )}
                    </div>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="default"
                  data-testid="button-create-agent"
                  onClick={() => console.log("Creating agent:", { agentName, selectedModel, creativity, expertise, selectedTraits })}
                >
                  Create Agent
                </Button>
              </CardContent>
            </HolographicCard>
          </div>
        </div>
      </div>
    </div>
  );
}
