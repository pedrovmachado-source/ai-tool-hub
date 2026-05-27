import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Lazy loading for performance
const Home = lazy(() => import("./pages/Home.tsx"));
const Tools = lazy(() => import("./pages/Tools.tsx"));
const Menu = lazy(() => import("./pages/Menu.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Alunos = lazy(() => import("./pages/Alunos.tsx"));
const Invite = lazy(() => import("./pages/Invite.tsx"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute.tsx"));
const Blocked = lazy(() => import("./pages/Blocked.tsx"));
const AbuseBlocks = lazy(() => import("./pages/AbuseBlocks.tsx"));
const Mentorias = lazy(() => import("./pages/Mentorias.tsx"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile.tsx"));
const OfertasValidadas = lazy(() => import("./pages/OfertasValidadas.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const PageLoader = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <Loader2 className="w-8 h-8 text-white animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
