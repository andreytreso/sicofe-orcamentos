
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout as Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Empresas = lazy(() => import("./pages/Empresas"));
const Orcamentos = lazy(() => import("./pages/Orcamentos"));
const Lancamentos = lazy(() => import("./pages/Lancamentos"));
const Aprovacoes = lazy(() => import("./pages/Aprovacoes"));
const PlanoContas = lazy(() => import("./pages/PlanoContas"));
const Fornecedores = lazy(() => import("./pages/Fornecedores"));
const CentrosCusto = lazy(() => import("./pages/CentrosCusto"));
const Usuarios = lazy(() => import("./pages/Usuarios"));
const HealthCheck = lazy(() => import("./pages/HealthCheck"));
const Login = lazy(() => import("./pages/Login"));
const UserRegister = lazy(() => import("./pages/UserRegister"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <Suspense fallback={<div className="p-6">Carregando...</div>}>
            <Login />
          </Suspense>
        } />
        <Route path="/cadastro-usuario" element={
          <Suspense fallback={<div className="p-6">Carregando...</div>}>
            <UserRegister />
          </Suspense>
        } />
        <Route path="*" element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<div className="p-6">Carregando...</div>}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/empresas" element={<Empresas />} />
                  <Route path="/orcamentos" element={<Orcamentos />} />
                  <Route path="/lancamentos" element={<Lancamentos />} />
                  <Route path="/aprovacoes" element={<Aprovacoes />} />
                  <Route path="/cadastros/plano-contas" element={<PlanoContas />} />
                  <Route path="/cadastros/fornecedores" element={<Fornecedores />} />
                  <Route path="/cadastros/centros-custo" element={<CentrosCusto />} />
                  <Route path="/cadastros/usuarios" element={<Usuarios />} />
                  <Route path="/dev/health" element={<HealthCheck />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
