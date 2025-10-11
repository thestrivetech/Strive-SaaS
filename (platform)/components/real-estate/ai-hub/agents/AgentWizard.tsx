'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedCard, CardContent, CardHeader, CardTitle } from '@/components/shared/dashboard/EnhancedCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ChevronLeft, ChevronRight, Check, Bot } from 'lucide-react';
import { createAgent } from '@/lib/modules/ai-hub/agents/actions';
import { AI_PROVIDERS, AI_MODELS } from '@/lib/modules/ai-hub/agents/schemas';
import { toast } from 'sonner';
import type { EnhancedUser } from '@/lib/auth/types';

interface AgentWizardProps {
  user: EnhancedUser;
}

export function AgentWizard({ user }: AgentWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    description: '',
    avatar: '',

    // Step 2: Personality
    tone: 'professional' as 'professional' | 'casual' | 'friendly' | 'technical' | 'creative',
    traits: [] as string[],
    expertise: [] as string[],

    // Step 3: Model Config
    provider: 'openai' as typeof AI_PROVIDERS[number],
    model: 'gpt-4',
    temperature: 0.7,
    max_tokens: 4000,
    top_p: 1,

    // Step 4: Capabilities
    capabilities: [] as string[],

    // Step 5: Memory Settings
    context_window: 10,
  });

  const steps = [
    { title: 'Basic Info', description: 'Name and description' },
    { title: 'Personality', description: 'Traits and tone' },
    { title: 'Model Config', description: 'AI provider and settings' },
    { title: 'Capabilities', description: 'Tools and functions' },
    { title: 'Review', description: 'Review and create' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await createAgent({
        name: formData.name,
        description: formData.description,
        avatar: formData.avatar || undefined,
        personality: {
          tone: formData.tone,
          traits: formData.traits,
          expertise: formData.expertise,
        },
        model_config: {
          provider: formData.provider,
          model: formData.model,
          temperature: formData.temperature,
          max_tokens: formData.max_tokens,
          top_p: formData.top_p,
        },
        capabilities: formData.capabilities,
        memory: {
          context_window: formData.context_window,
          conversation_history: [],
          knowledge_base: [],
        },
        is_active: true,
        organizationId: user.organizationId,
      });

      toast.success('Agent created successfully!');
      router.push(`/real-estate/ai-hub/agents/${result.id}`);
    } catch (error) {
      toast.error('Failed to create agent');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-white">Agent Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Lead Qualifier Agent"
                className="bg-slate-800/50 border-slate-700 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this agent does..."
                className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="avatar" className="text-white">Avatar URL (optional)</Label>
              <Input
                id="avatar"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://..."
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>
        );

      case 1: // Personality
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tone" className="text-white">Communication Tone</Label>
              <Select
                value={formData.tone}
                onValueChange={(value: typeof formData.tone) => setFormData({ ...formData, tone: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Personality Traits (comma-separated)</Label>
              <Input
                value={formData.traits.join(', ')}
                onChange={(e) => setFormData({ ...formData, traits: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="helpful, analytical, patient..."
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            <div>
              <Label className="text-white">Areas of Expertise (comma-separated)</Label>
              <Input
                value={formData.expertise.join(', ')}
                onChange={(e) => setFormData({ ...formData, expertise: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="real estate, lead qualification, customer service..."
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>
        );

      case 2: // Model Config
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider" className="text-white">AI Provider</Label>
              <Select
                value={formData.provider}
                onValueChange={(value: typeof formData.provider) => {
                  const firstModel = AI_MODELS[value][0];
                  setFormData({ ...formData, provider: value, model: firstModel });
                }}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="groq">Groq</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="model" className="text-white">Model</Label>
              <Select
                value={formData.model}
                onValueChange={(value) => setFormData({ ...formData, model: value })}
              >
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS[formData.provider].map((model) => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-white">Temperature: {formData.temperature}</Label>
              <Slider
                value={[formData.temperature]}
                onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
                min={0}
                max={2}
                step={0.1}
                className="mt-2"
              />
              <p className="text-xs text-slate-400 mt-1">Higher = more creative, Lower = more focused</p>
            </div>

            <div>
              <Label htmlFor="max_tokens" className="text-white">Max Tokens</Label>
              <Input
                id="max_tokens"
                type="number"
                value={formData.max_tokens}
                onChange={(e) => setFormData({ ...formData, max_tokens: parseInt(e.target.value) })}
                min={1}
                max={32000}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>
        );

      case 3: // Capabilities
        return (
          <div className="space-y-4">
            <div>
              <Label className="text-white">Agent Capabilities (comma-separated)</Label>
              <Textarea
                value={formData.capabilities.join(', ')}
                onChange={(e) => setFormData({ ...formData, capabilities: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                placeholder="lead_scoring, email_drafting, data_analysis..."
                className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
              />
              <p className="text-xs text-slate-400 mt-1">
                Tools and functions this agent can perform
              </p>
            </div>

            <div>
              <Label className="text-white">Context Window: {formData.context_window} messages</Label>
              <Slider
                value={[formData.context_window]}
                onValueChange={([value]) => setFormData({ ...formData, context_window: value })}
                min={1}
                max={50}
                step={1}
                className="mt-2"
              />
              <p className="text-xs text-slate-400 mt-1">
                Number of previous messages the agent remembers
              </p>
            </div>
          </div>
        );

      case 4: // Review
        return (
          <div className="space-y-4">
            <div className="glass-strong rounded-xl p-6 space-y-4">
              <h3 className="text-xl font-bold text-white">Review Agent Configuration</h3>

              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-slate-400">Name</p>
                  <p className="text-white font-medium">{formData.name}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Description</p>
                  <p className="text-white">{formData.description || 'None'}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Model</p>
                  <p className="text-white font-medium">{formData.provider.toUpperCase()} - {formData.model}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Tone</p>
                  <p className="text-white capitalize">{formData.tone}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Capabilities</p>
                  <p className="text-white">{formData.capabilities.join(', ') || 'None'}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <EnhancedCard glassEffect="strong" neonBorder="cyan" className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 text-cyan-400" />
          <div>
            <CardTitle className="text-white text-2xl">Create AI Agent</CardTitle>
            <p className="text-slate-400 text-sm mt-1">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    index <= currentStep
                      ? 'bg-cyan-500 border-cyan-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className="text-xs text-slate-400 text-center hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step Content */}
        <div className="min-h-[300px]">{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4 border-t border-slate-700">
          <Button
            onClick={handleBack}
            disabled={currentStep === 0}
            variant="outline"
            className="border-slate-700 text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={currentStep === 0 && !formData.name}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600"
            >
              {isSubmitting ? 'Creating...' : 'Create Agent'}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </CardContent>
    </EnhancedCard>
  );
}
