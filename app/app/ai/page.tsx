import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { getCurrentUser } from '@/lib/auth/auth-helpers';
import {
  Bot,
  Sparkles,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Code,
  Zap,
  Brain,
} from 'lucide-react';

export default async function AIPage() {
  const user = await getCurrentUser();

  const aiFeatures = [
    {
      title: 'Chat Assistant',
      description: 'Natural language conversations with AI',
      icon: MessageSquare,
      status: 'Coming Soon',
      color: 'text-blue-500',
    },
    {
      title: 'Content Generation',
      description: 'Generate marketing copy and documents',
      icon: FileText,
      status: 'Coming Soon',
      color: 'text-purple-500',
    },
    {
      title: 'Code Assistant',
      description: 'AI-powered code generation and review',
      icon: Code,
      status: 'Coming Soon',
      color: 'text-green-500',
    },
    {
      title: 'Image Analysis',
      description: 'Extract insights from images and documents',
      icon: ImageIcon,
      status: 'Coming Soon',
      color: 'text-orange-500',
    },
    {
      title: 'Automation',
      description: 'Intelligent workflow automation',
      icon: Zap,
      status: 'Coming Soon',
      color: 'text-yellow-500',
    },
    {
      title: 'Data Analysis',
      description: 'AI-driven insights from your data',
      icon: Brain,
      status: 'Coming Soon',
      color: 'text-pink-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            AI Assistant
          </h1>
          <p className="text-muted-foreground">
            Powerful AI tools to enhance your productivity
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Beta
        </Badge>
      </div>

      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            AI Chat (Coming Soon)
          </CardTitle>
          <CardDescription>
            Ask questions, get insights, and automate tasks using natural language
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Ask me anything... (Feature coming soon)"
              className="min-h-[120px] resize-none"
              disabled
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Powered by advanced AI models
              </div>
              <Button disabled>
                <Sparkles className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">AI Features</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {aiFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`rounded-lg bg-secondary p-2 ${feature.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg mt-2">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full" disabled>
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Unlock Full AI Capabilities
          </CardTitle>
          <CardDescription>
            Upgrade your subscription to access advanced AI features and higher usage limits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <p className="font-medium">Current Plan: {user?.subscriptionTier || 'FREE'}</p>
              <p className="text-muted-foreground">
                {user?.subscriptionTier === 'FREE'
                  ? 'Limited AI features available'
                  : 'Full AI access enabled'}
              </p>
            </div>
            <Button>
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}