import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Settings, Trash2, CheckCircle, XCircle, Clock, Globe, Key, Zap } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const INTEGRATION_PROVIDERS = [
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team communication and notifications',
    icon: '💬',
    category: 'Communication',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Email processing and automation',
    icon: '📧',
    category: 'Email',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'CRM and customer management',
    icon: '☁️',
    category: 'CRM',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Marketing and sales automation',
    icon: '🔶',
    category: 'CRM',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'E-commerce platform integration',
    icon: '🛍️',
    category: 'E-commerce',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'Code repository and automation',
    icon: '🐙',
    category: 'Development',
    color: 'from-gray-700 to-gray-800'
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Knowledge management and notes',
    icon: '📝',
    category: 'Productivity',
    color: 'from-gray-600 to-gray-700'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Workflow automation platform',
    icon: '⚡',
    category: 'Automation',
    color: 'from-orange-400 to-orange-500'
  }
];

const CATEGORIES = ['All', 'Communication', 'Email', 'CRM', 'E-commerce', 'Development', 'Productivity', 'Automation'];

export default function Integrations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const { toast } = useToast();

  const [newIntegration, setNewIntegration] = useState({
    name: "",
    provider: "",
    configuration: {
      apiKey: "",
      webhook: "",
      settings: {}
    }
  });

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['/api/integrations'],
  });

  const createIntegrationMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/integrations', data),
    onSuccess: () => {
      toast({
        title: "Integration Created",
        description: "Integration has been configured successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
      setShowAddDialog(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create integration",
        variant: "destructive",
      });
    }
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/integrations/${id}`),
    onSuccess: () => {
      toast({
        title: "Integration Deleted",
        description: "Integration has been removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete integration",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setNewIntegration({
      name: "",
      provider: "",
      configuration: {
        apiKey: "",
        webhook: "",
        settings: {}
      }
    });
    setSelectedProvider(null);
  };

  const handleProviderSelect = (provider: any) => {
    setSelectedProvider(provider);
    setNewIntegration(prev => ({
      ...prev,
      provider: provider.id,
      name: provider.name
    }));
  };

  const handleCreateIntegration = () => {
    if (!newIntegration.name.trim() || !newIntegration.provider) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createIntegrationMutation.mutate(newIntegration);
  };

  const filteredProviders = INTEGRATION_PROVIDERS.filter((provider) => {
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         provider.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return (
          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'DISCONNECTED':
        return (
          <Badge className="bg-muted/20 text-muted-foreground border-muted/30">
            <XCircle className="w-3 h-3 mr-1" />
            Disconnected
          </Badge>
        );
      case 'ERROR':
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            <XCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-chart-4/20 text-chart-4 border-chart-4/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getProviderInfo = (providerId: string) => {
    return INTEGRATION_PROVIDERS.find(p => p.id === providerId);
  };

  return (
    <div className="space-y-6" data-testid="integrations-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold neon-text" data-testid="page-title">Integrations</h1>
          <p className="text-muted-foreground mt-1">Connect external services to your workflows</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90" data-testid="button-add-integration">
              <Plus className="w-4 h-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border/50 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {!selectedProvider ? (
                <>
                  {/* Provider Selection */}
                  <div>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search providers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-9"
                          data-testid="search-providers"
                        />
                      </div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px]" data-testid="filter-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto scrollbar-thin">
                      {filteredProviders.map((provider) => (
                        <Card 
                          key={provider.id}
                          className="cursor-pointer hover:border-primary/30 transition-all"
                          onClick={() => handleProviderSelect(provider)}
                          data-testid={`provider-${provider.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${provider.color} flex items-center justify-center text-white text-lg`}>
                                {provider.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{provider.name}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                  {provider.description}
                                </p>
                                <Badge variant="outline" className="text-xs mt-2">
                                  {provider.category}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Configuration Form */}
                  <div className="flex items-center space-x-3 p-4 rounded-lg bg-background/50">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${selectedProvider.color} flex items-center justify-center text-white text-xl`}>
                      {selectedProvider.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedProvider.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedProvider.description}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Integration Name</label>
                      <Input
                        value={newIntegration.name}
                        onChange={(e) => setNewIntegration(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={`My ${selectedProvider.name} Integration`}
                        data-testid="input-integration-name"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center">
                        <Key className="w-4 h-4 mr-2" />
                        API Key
                      </label>
                      <Input
                        type="password"
                        value={newIntegration.configuration.apiKey}
                        onChange={(e) => setNewIntegration(prev => ({
                          ...prev,
                          configuration: { ...prev.configuration, apiKey: e.target.value }
                        }))}
                        placeholder="Enter your API key"
                        data-testid="input-api-key"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center">
                        <Globe className="w-4 h-4 mr-2" />
                        Webhook URL (Optional)
                      </label>
                      <Input
                        value={newIntegration.configuration.webhook}
                        onChange={(e) => setNewIntegration(prev => ({
                          ...prev,
                          configuration: { ...prev.configuration, webhook: e.target.value }
                        }))}
                        placeholder="https://your-webhook-url.com"
                        data-testid="input-webhook-url"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedProvider(null)}
                      data-testid="button-back"
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={handleCreateIntegration}
                      disabled={createIntegrationMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-primary to-accent"
                      data-testid="button-create-integration"
                    >
                      {createIntegrationMutation.isPending ? 'Creating...' : 'Create Integration'}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Integrations */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Active Integrations ({Array.isArray(integrations) ? integrations.length : 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-24 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : integrations && Array.isArray(integrations) && integrations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration: any) => {
                const providerInfo = getProviderInfo(integration.provider);
                return (
                  <Card 
                    key={integration.id}
                    className="hover:border-primary/30 transition-all"
                    data-testid={`integration-card-${integration.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${providerInfo?.color || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white`}>
                            {providerInfo?.icon || '🔌'}
                          </div>
                          <div>
                            <h4 className="font-medium" data-testid={`integration-name-${integration.id}`}>
                              {integration.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {providerInfo?.name || integration.provider}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(integration.status)}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>Provider:</span>
                        <span className="capitalize">{integration.provider}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" className="flex-1" data-testid={`button-configure-${integration.id}`}>
                          <Settings className="w-3 h-3 mr-2" />
                          Configure
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive border-destructive/30"
                          onClick={() => deleteIntegrationMutation.mutate(integration.id)}
                          disabled={deleteIntegrationMutation.isPending}
                          data-testid={`button-delete-${integration.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No integrations configured</h3>
              <p className="text-muted-foreground mb-6">
                Connect your first external service to enable powerful workflow automation
              </p>
              <Button onClick={() => setShowAddDialog(true)} data-testid="button-add-first-integration">
                Add Your First Integration
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Providers (when no integrations exist) */}
      {(!integrations || !Array.isArray(integrations) || integrations.length === 0) && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Available Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {INTEGRATION_PROVIDERS.slice(0, 8).map((provider) => (
                <div 
                  key={provider.id}
                  className="flex flex-col items-center p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                  onClick={() => {
                    handleProviderSelect(provider);
                    setShowAddDialog(true);
                  }}
                  data-testid={`available-provider-${provider.id}`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${provider.color} flex items-center justify-center text-white text-xl mb-2`}>
                    {provider.icon}
                  </div>
                  <h4 className="font-medium text-sm text-center">{provider.name}</h4>
                  <p className="text-xs text-muted-foreground text-center mt-1">
                    {provider.category}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
