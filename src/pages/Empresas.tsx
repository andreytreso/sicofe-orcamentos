import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import NovaEmpresaModal from "@/components/NovaEmpresaModal";
import { useCompaniesTable, useBudgetsTable } from "@/hooks/useSupabaseTable";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/* ───────── tipos ───────── */

type Company = {
  id: string;
  name: string;
  status: string | null;
  grupo: string | null;
  created_at: string;
};

type Budget = { id: string; status: string | null };

/* ───────── helpers ─────── */

const toMessage = (e: unknown) =>
  e instanceof Error ? e.message : String(e);

const isActive = (s?: string | null) =>
  s?.toLowerCase() === "active" || s?.toLowerCase() === "ativo";

/* ───────── componente ──── */

export default function Empresas() {
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Company | undefined>();

  /* dados ----------------------------------------------------------------- */
  const {
    data: companies = [],
    isLoading: loadingCompanies,
    error: errCompanies,
  } = useCompaniesTable();

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

  const totalCompanies = companies.length;
  const activeCompanies = companies.filter((c) => isActive(c.status)).length;
  const activeBudgets = budgets.filter((b) => isActive(b.status)).length;

  /* exclusão -------------------------------------------------------------- */
async function reallyDelete(id: string) {
  /*  a) não precisamos do objeto { returning: "minimal" }          */
  /*  b) após sucesso, invalidamos o cache                           */
  const { error } = await supabase.from("companies").delete().eq("id", id);

  if (error) return alert(error.details ?? error.message);
  queryClient.invalidateQueries({ queryKey: ["companies"] });
}


  /* ---------------------------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <Loader2 className="h-8 w-8 animate-spin text-sicofe-blue" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <p className="text-red-600 p-6">Erro ao carregar dados: {errorMsg}</p>
    );
  }

  return (
    <>
      {/* HEADER ----------------------------------------------------------- */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-sicofe-navy">Empresas</h1>
          <p className="text-sicofe-gray">
            Gerencie todas as empresas do seu sistema
          </p>
        </div>

        <Button
          onClick={() => {
            setEditing(undefined);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {/* CARDS ------------------------------------------------------------ */}
      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <StatCard
          icon={<Building2 className="h-6 w-6 text-sicofe-blue" />}
          label="Total de Empresas"
          value={totalCompanies}
        />

        <StatCard
          icon={<Users className="h-6 w-6 text-sicofe-green" />}
          label="Empresas Ativas"
          value={activeCompanies}
          accent="accent"
        />

        <StatCard
          icon={<Calendar className="h-6 w-6 text-sicofe-blue" />}
          label="Orçamentos Ativos"
          value={activeBudgets}
        />
      </div>

      {/* LISTA ------------------------------------------------------------ */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Lista de Empresas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {companies.length === 0 ? (
            <p className="text-center py-8 text-sicofe-gray">
              Nenhuma empresa encontrada.
            </p>
          ) : (
            companies.map((e) => {
              const created = (() => {
                try {
                  const d = parseISO(e.created_at);
                  return isValid(d)
                    ? format(d, "dd/MM/yyyy", { locale: ptBR })
                    : "—";
                } catch {
                  return "—";
                }
              })();

              return (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  {/* ─── info ──────────────────────────────── */}
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{e.name}</h3>
                      <div className="text-sm text-muted-foreground flex gap-4">
                        <span>{e.grupo || "Sem grupo"}</span>
                        <span>Criada em {created}</span>
                      </div>
                    </div>
                  </div>

                  {/* ─── ações ─────────────────────────────── */}
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        isActive(e.status)
                          ? "bg-accent text-white"
                          : "bg-secondary"
                      }
                    >
                      {isActive(e.status) ? "Ativa" : "Inativa"}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            
                            setEditing({
                              ...e,
                              status: isActive(e.status) ? "active" : "inactive",
                            });
                            setModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>


                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Confirmar exclusão
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Deseja excluir
                                <b> {e.name}</b>?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => reallyDelete(e.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* MODAL ------------------------------------------------------------ */}
      <NovaEmpresaModal
        initialData={
          editing && {
            ...editing,
            status: editing.status && editing.status.toLowerCase() === "active"
              ? "active"
              : "inactive",
          }
        }
        open={modalOpen}
        onOpenChange={(v) => {
          if (!v) setEditing(undefined);
          setModalOpen(v);
        }}
        onSuccess={() =>
          queryClient.invalidateQueries({ queryKey: ["companies"] })
        }
      />
        </>
  );
}

/* ░░░ componente auxiliar para os cards de estatística ░░░ */

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: "accent";
};

function StatCard({ icon, label, value, accent }: StatCardProps) {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6 flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            accent ? "bg-sicofe-green/10" : "bg-sicofe-blue/10"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-sicofe-gray">{label}</p>
          <p
            className={`text-2xl font-bold ${
              accent ? "text-accent" : "text-primary"
            }`}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
