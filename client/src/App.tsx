import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Gallery from "@/pages/gallery";
import ISSTracker from "@/pages/iss-tracker";
import SolarSystem from "@/pages/solar-system";
import Aurora from "@/pages/aurora";
import Asteroids from "@/pages/asteroids";
import Missions from "@/pages/missions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/iss-tracker" component={ISSTracker} />
      <Route path="/solar-system" component={SolarSystem} />
      <Route path="/aurora" component={Aurora} />
      <Route path="/asteroids" component={Asteroids} />
      <Route path="/missions" component={Missions} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative min-h-screen">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
