import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainLayout from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import Workflows from "@/pages/workflows";
import WorkflowBuilder from "@/pages/workflow-builder";
import Agents from "@/pages/agents";
import AgentBuilder from "@/pages/agent-builder";
import Teams from "@/pages/teams";
import TeamBuilder from "@/pages/team-builder";
import Marketplace from "@/pages/marketplace";
import Analytics from "@/pages/analytics";
import Integrations from "@/pages/integrations";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/workflows" component={Workflows} />
        <Route path="/workflows/new" component={WorkflowBuilder} />
        <Route path="/workflows/:id/edit" component={WorkflowBuilder} />
        <Route path="/agents" component={Agents} />
        <Route path="/agents/new" component={AgentBuilder} />
        <Route path="/agents/:id/edit" component={AgentBuilder} />
        <Route path="/teams" component={Teams} />
        <Route path="/teams/new" component={TeamBuilder} />
        <Route path="/teams/:id/edit" component={TeamBuilder} />
        <Route path="/marketplace" component={Marketplace} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/integrations" component={Integrations} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
