import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import ScrollToTop from "@/components/scroll-to-top";
import PageSkeleton from "@/components/ui/page-skeleton";
import ErrorBoundary from "@/components/ui/error-boundary";

// Lazy load layout components for better performance
const Navigation = lazy(() => import("@/components/layout/navigation"));
const Footer = lazy(() => import("@/components/layout/footer"));
const FloatingChat = lazy(() => import("@/components/ui/floating-chat"));

// Keep home page loaded immediately for best UX
import Home from "@/pages/home";

// Lazy load all other pages for optimal performance
const Portfolio = lazy(() => import("@/pages/portfolio"));
const Solutions = lazy(() => import("@/pages/solutions"));
const Resources = lazy(() => import("@/pages/resources"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const GetStarted = lazy(() => import("@/pages/get-started"));
const Onboarding = lazy(() => import("@/pages/onboarding"));
const Demo = lazy(() => import("@/pages/demo"));
const Login = lazy(() => import("@/pages/login"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Privacy = lazy(() => import("@/pages/privacy"));
const Terms = lazy(() => import("@/pages/terms"));
const Cookies = lazy(() => import("@/pages/cookies"));

// Lazy load solution pages (most likely to be large)
const Healthcare = lazy(() => import("@/pages/solutions/healthcare"));
const Financial = lazy(() => import("@/pages/solutions/financial"));
const Manufacturing = lazy(() => import("@/pages/solutions/manufacturing"));
const Retail = lazy(() => import("@/pages/solutions/retail"));
const Technology = lazy(() => import("@/pages/solutions/technology"));
const Education = lazy(() => import("@/pages/solutions/education"));
const AIAutomation = lazy(() => import("@/pages/solutions/ai-automation"));
const DataAnalytics = lazy(() => import("@/pages/solutions/data-analytics"));
const Blockchain = lazy(() => import("@/pages/solutions/blockchain"));
const SmartBusiness = lazy(() => import("@/pages/solutions/smart-business"));
const ComputerVision = lazy(() => import("@/pages/solutions/computer-vision"));
const SecurityCompliance = lazy(() => import("@/pages/solutions/security-compliance"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollToTop />
      <Suspense fallback={<div className="h-16 w-full bg-background border-b animate-pulse" />}>
        <Navigation />
      </Suspense>
      <main>
        <Suspense fallback={<PageSkeleton />}>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/solutions" component={Solutions} />
            <Route path="/resources" component={Resources} />
            <Route path="/about" component={About} />
            <Route path="/contact" component={Contact} />
            <Route path="/get-started" component={GetStarted} />
            <Route path="/onboarding" component={Onboarding} />
            <Route path="/demo" component={Demo} />
            <Route path="/login" component={Login} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/terms" component={Terms} />
            <Route path="/cookies" component={Cookies} />
            <Route path="/solutions/healthcare" component={Healthcare} />
            <Route path="/solutions/financial" component={Financial} />
            <Route path="/solutions/manufacturing" component={Manufacturing} />
            <Route path="/solutions/retail" component={Retail} />
            <Route path="/solutions/technology" component={Technology} />
            <Route path="/solutions/education" component={Education} />
            <Route path="/solutions/ai-automation" component={AIAutomation} />
            <Route path="/solutions/data-analytics" component={DataAnalytics} />
            <Route path="/solutions/blockchain" component={Blockchain} />
            <Route path="/solutions/smart-business" component={SmartBusiness} />
            <Route path="/solutions/computer-vision" component={ComputerVision} />
            <Route path="/solutions/security-compliance" component={SecurityCompliance} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Suspense fallback={<div className="h-20 w-full bg-muted/10 animate-pulse" />}>
        <Footer />
      </Suspense>
      <Suspense fallback={null}>
        <FloatingChat />
      </Suspense>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
