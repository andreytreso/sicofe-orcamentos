import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import NovaContaModal from "@/components/NovaContaModal";
import PlanoContasFiltros from "@/components/PlanoContasFiltros";
import { useAccountHierarchy, type AccountHierarchy } from "@/hooks/useAccountHierarchy";

interface Filters {
  level_1?: string;
  level_2?: string;
  analytical_account?: string;
}

export default function PlanoContas() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  const [editingAccount, setEditingAccount] = useState<AccountHierarchy | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<AccountHierarchy | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: accounts = [], isLoading } = useAccountHierarchy(filters);

  const uniqueAccounts = useMemo(() => {
    const map = new Map<string, AccountHierarchy>();
    accounts.forEach((account) => {
      if (account.id && !map.has(account.id)) {
        map.set(account.id, account);
      }
    });
    return Array.from(map.values());
  }, [accounts]);

  const openCreateModal = () => {
    setEditingAccount(null);
    setShowModal(true);
  };

  const openEditModal = (account: AccountHierarchy) => {
    setEditingAccount(account);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAccount(null);
  };

  const handleModalChange = (open: boolean) => {
    if (open) {
      setShowModal(true);
    } else {
      closeModal();
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete?.id) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("group_chart_of_accounts")
        .delete()
        .eq("id", accountToDelete.id);

      if (error) throw error;

      toast.success("Conta excluída com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["account-hierarchy"] });
      setAccountToDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Erro ao excluir conta.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-sicofe-navy">Plano de Contas</h1>
            <p className="text-sicofe-gray">Gerencie a estrutura contábil da sua empresa</p>
          </div>
          <Button onClick={openCreateModal} className="text-white bg-sicofe-blue">
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </div>

        <PlanoContasFiltros filters={filters} onFiltersChange={setFilters} />

        <div className="grid gap-4">
          {uniqueAccounts.map((account) => (
            <Card key={account.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{account.analytical_account}</CardTitle>
                    <CardDescription>
                      {[account.level_1, account.level_2]
                        .filter(Boolean)
                        .map((value) => value ?? "")
                        .join(" - ")}
                    </CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditModal(account)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setAccountToDelete(account)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {uniqueAccounts.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-sicofe-gray">Nenhuma conta encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>

      <NovaContaModal
        open={showModal}
        onClose={() => handleModalChange(false)}
        initialData={editingAccount?.id
          ? {
              id: editingAccount.id,
              group_id: editingAccount.group_id ?? "",
              level_1: editingAccount.level_1,
              level_2: editingAccount.level_2,
              analytical_account: editingAccount.analytical_account,
              status: editingAccount.status,
              type: editingAccount.type,
            }
          : undefined}
        onSuccess={() => setEditingAccount(null)}
      />

      <AlertDialog
        open={Boolean(accountToDelete)}
        onOpenChange={(open) => {
          if (!open) setAccountToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação excluirá a conta do catálogo do grupo e removerá o vínculo para todas as empresas.
              Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} disabled={isDeleting} className="bg-destructive text-white">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}








