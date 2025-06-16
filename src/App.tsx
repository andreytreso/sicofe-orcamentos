
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import Orcamentos from "./pages/Orcamentos";
import Lancamentos from "./pages/Lancamentos";
import Aprovacoes from "./pages/Aprovacoes";
import Login from "./pages/Login";
import UserRegister from "./pages/UserRegister";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro-usuario" element={<UserRegister />} />
          <Route path="*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/empresas" element={<Empresas />} />
                  <Route path="/orcamentos" element={<Orcamentos />} />
                  <Route path="/lancamentos" element={<Lancamentos />} />
                  <Route path="/aprovacoes" element={<Aprovacoes />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
