import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Home from "@/pages/home";
import Gallery from "@/pages/gallery";
import ISSTracker from "@/pages/iss-tracker";
import Aurora from "@/pages/aurora";
import Asteroids from "@/pages/asteroids";
import Missions from "@/pages/missions";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/iss-tracker" component={ISSTracker} />
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
      <div className="min-h-screen bg-gradient-to-b from-neutral-900 via-neutral-800 to-black">
        <Toaster />
        <Router />
      </div>
    </QueryClientProvider>
  );
}

export default App;
