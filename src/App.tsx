
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Empresas from "./pages/Empresas";
import Orcamentos from "./pages/Orcamentos";
import Lancamentos from "./pages/Lancamentos";
import Aprovacoes from "./pages/Aprovacoes";
import PlanoContas from "./pages/PlanoContas";
import Fornecedores from "./pages/Fornecedores";
import Colaboradores from "./pages/Colaboradores";
import CentrosCusto from "./pages/CentrosCusto";
import Usuarios from "./pages/Usuarios";
import HealthCheck from "./pages/HealthCheck";
import Login from "./pages/Login";
import UserRegister from "./pages/UserRegister";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
                <Route path="/cadastros/plano-contas" element={<PlanoContas />} />
                <Route path="/cadastros/fornecedores" element={<Fornecedores />} />
                <Route path="/cadastros/colaboradores" element={<Colaboradores />} />
                <Route path="/cadastros/centros-custo" element={<CentrosCusto />} />
                <Route path="/cadastros/usuarios" element={<Usuarios />} />
                <Route path="/dev/health" element={<HealthCheck />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
