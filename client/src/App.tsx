import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animationController } from "./lib/animations";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { StarField } from "@/components/star-field";
import { CosmicCursor } from "@/components/cosmic-cursor";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize animations when app loads
    animationController.init();

    // Initialize scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-indicator';
    document.body.appendChild(progressBar);

    // Cleanup function
    return () => {
      animationController.cleanup();
      const existingProgressBar = document.querySelector('.scroll-indicator');
      if (existingProgressBar) {
        existingProgressBar.remove();
      }
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative">
          <StarField />
          <CosmicCursor />
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
