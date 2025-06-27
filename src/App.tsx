
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Conversations } from "./pages/Conversations";
import { Contacts } from "./pages/Contacts";
import { Campaigns } from "./pages/Campaigns";
import { Reports } from "./pages/Reports";
import { AIAgents } from "./pages/AIAgents";
import { Settings } from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/conversations" element={<Conversations />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/ai-agents" element={<AIAgents />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
