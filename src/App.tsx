import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute.tsx";
import BetaBanner from "./components/BetaBanner";

// Eager loading critical pages, lazy loading others
import Home from "./pages/Home.tsx";
import Menu from "./pages/Menu.tsx";
import Tools from "./pages/Tools.tsx";
import Auth from "./pages/Auth.tsx";

const Profile = lazy(() => import("./pages/Profile.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Alunos = lazy(() => import("./pages/Alunos.tsx"));
const Invite = lazy(() => import("./pages/Invite.tsx"));
const Blocked = lazy(() => import("./pages/Blocked.tsx"));
const AbuseBlocks = lazy(() => import("./pages/AbuseBlocks.tsx"));
const Mentorias = lazy(() => import("./pages/Mentorias.tsx"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile.tsx"));
const OfertasValidadas = lazy(() => import("./pages/OfertasValidadas.tsx"));
const ComprarCash = lazy(() => import("./pages/ComprarCash.tsx"));
const CashSuccess = lazy(() => import("./pages/CashSuccess.tsx"));
const CashCancel = lazy(() => import("./pages/CashCancel.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      gcTime: 10 * 60 * 1000,
    },
  },
});

const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-white animate-spin opacity-20" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/convite" element={<ProtectedRoute><Invite /></ProtectedRoute>} />
                <Route path="/ferramentas" element={<ProtectedRoute><Tools /></ProtectedRoute>} />
                <Route path="/menu" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
                <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/completar-perfil" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
                <Route path="/alunos" element={<ProtectedRoute><Alunos /></ProtectedRoute>} />
                <Route path="/bloqueado" element={<ProtectedRoute><Blocked /></ProtectedRoute>} />
                <Route path="/admin/bloqueios" element={<ProtectedRoute><AbuseBlocks /></ProtectedRoute>} />
                <Route path="/mentorias" element={<ProtectedRoute><Mentorias /></ProtectedRoute>} />
                <Route path="/ofertas" element={<ProtectedRoute><OfertasValidadas /></ProtectedRoute>} />
                <Route path="/comprar-cash" element={<ProtectedRoute><ComprarCash /></ProtectedRoute>} />
                <Route path="/comprar-cash/sucesso" element={<ProtectedRoute><CashSuccess /></ProtectedRoute>} />
                <Route path="/comprar-cash/cancelado" element={<ProtectedRoute><CashCancel /></ProtectedRoute>} />

                <Route path="/copywrite" element={<ProtectedRoute><Tools page="copywrite" /></ProtectedRoute>} />
                <Route path="/site-creation" element={<ProtectedRoute><Tools page="site-creation" /></ProtectedRoute>} />
                <Route path="/creative-edit" element={<ProtectedRoute><Tools page="creative-edit" /></ProtectedRoute>} />
                <Route path="/fb-accounts" element={<ProtectedRoute><Tools page="fb-accounts" /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;