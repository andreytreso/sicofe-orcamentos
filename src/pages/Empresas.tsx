// src/pages/Empresas.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Building2,
  Users,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompaniesTable, useBudgetsTable } from "@/hooks/useSupabaseTable";
import { NovaEmpresaModal } from "@/components/NovaEmpresaModal";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";

// ————————————————————
// Tipos locais (evita any)
// ————————————————————
type Company = {
  id: string;
  name: string;
  status: string | null;
  grupo: string | null;
  created_at: string;
};

type Budget = {
  id: string;
  status: string | null;
};

// helper: converte erro em string sem usar any
function toMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return "Erro desconhecido";
  }
}

// considera “active” e “ativo” como ativo
function isActive(status?: string | null) {
  if (!status) return false;
  const s = status.toLowerCase();
  return s === "active" || s === "ativo";
}

export default function Empresas() {
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Companies (usa count do hook)
  const {
    data: companies = [],
    count,
    isLoading: loadingCompanies,
    error: errCompanies,
    refetch,
    remove: removeCompany, // mutation de delete do hook
  } = useCompaniesTable();

  // Budgets
  const {
    data: budgets = [],
    isLoading: loadingBudgets,
    error: errBudgets,
  } = useBudgetsTable();

  const isLoading = loadingCompanies || loadingBudgets;
  const errorMsg = errCompanies
    ? toMessage(errCompanies)
    : errBudgets
    ? toMessage(errBudgets)
    : "";

  const companiesData = companies as Company[];
  const budgetsData = budgets as Budget[];

  // Mostra o count vindo do banco; se não vier, usa length
  const totalCompanies = (count ?? companiesData.length) || 0;
  const activeCompanies = companiesData.filter((c) => isActive(c.status)).length;
  const activeBudgets = budgetsData.filter((b) => isActive(b.status)).length;

  function handleDeleteCompany(id: string) {
    const ok = window.confirm("Excluir esta empresa? Esta ação não pode ser desfeita.");
    if (!ok) return;
    // usa a mutation do hook; ele já invalida a query no onSuccess
    removeCompany(id);
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-sicofe-blue" />
        </div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6">
        <p className="text-red-600">Erro ao carregar dados: {errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-sicofe-navy">Empresas</h1>
          <p className="text-sicofe-gray mt-1">
            Gerencie todas as empresas do seu sistema
          </p>
        </div>

        <Button
          onClick={() => setModalOpen(true)}
          className="bg-sicofe-blue hover:bg-sicofe-blue/90 text-white focus-visible:ring-sicofe-blue"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {/* Cards de estatística */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sicofe-blue/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-sicofe-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Total de Empresas</p>
                <p className="text-2xl font-bold text-primary">{totalCompanies}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sicofe-green/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-sicofe-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Empresas Ativas</p>
                <p className="text-2xl font-bold text-accent">{activeCompanies}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sicofe-blue/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-sicofe-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Orçamentos Ativos</p>
                <p className="text-2xl font-bold text-primary">{activeBudgets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Empresas */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-sicofe-navy">Lista de Empresas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companiesData.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sicofe-gray">
                  Nenhuma empresa encontrada – Cadastre sua primeira empresa
                </p>
              </div>
            ) : (
              companiesData.map((empresa) => {
                const created = (() => {
                  try {
                    const iso = parseISO(empresa.created_at);
                    const d = isValid(iso) ? iso : new Date(empresa.created_at);
                    return format(d, "dd/MM/yyyy", { locale: ptBR });
                  } catch {
                    return "—";
                  }
                })();

                const ativo = isActive(empresa.status);

                return (
                  <div
                    key={empresa.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary">{empresa.name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {empresa.grupo || "Sem grupo"}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            Criado em {created}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge
                        className={
                          ativo
                            ? "bg-accent text-accent-foreground"
                            : "bg-secondary text-secondary-foreground"
                        }
                      >
                        {ativo ? "Ativa" : "Inativa"}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() => setModalOpen(true)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive"
                            onClick={() => handleDeleteCompany(empresa.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <NovaEmpresaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={() => {
          // garante atualização após salvar/editar
          // pode usar refetch() ou invalidar a query
          refetch();
          // queryClient.invalidateQueries({ queryKey: ["companies"] });
        }}
      />
    </div>
  );
}
