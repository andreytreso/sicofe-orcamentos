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
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import NovoFornecedorModal from "@/components/NovoFornecedorModal";

interface SupplierRow {
  id: string;
  name: string;
  cnpj: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: string;
  company_id: string;
  company_name: string | null;
  created_at: string;
}

export default function Fornecedores() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierRow | null>(null);
  const [supplierToDelete, setSupplierToDelete] = useState<SupplierRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data = [], isLoading } = useSupabaseTable('suppliers_with_details', {
    orderBy: { column: 'name', ascending: true },
  });

  const suppliers = useMemo(() => (data as SupplierRow[]) ?? [], [data]);

  const openCreateModal = () => {
    setEditingSupplier(null);
    setShowModal(true);
  };

  const openEditModal = (supplier: SupplierRow) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
  };

  const handleModalChange = (open: boolean) => {
    if (open) {
      setShowModal(true);
    } else {
      closeModal();
    }
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete?.id) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierToDelete.id);

      if (error) throw error;

      toast.success('Fornecedor excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers_with_details'] });
      setSupplierToDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'Erro ao excluir fornecedor.');
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
            <h1 className="text-3xl font-bold tracking-tight text-sicofe-navy">Fornecedores</h1>
            <p className="text-sicofe-gray">Gerencie os fornecedores das empresas</p>
          </div>
          <Button onClick={openCreateModal} className="text-white bg-sicofe-blue">
            <Plus className="mr-2 h-4 w-4" />
            Novo Fornecedor
          </Button>
        </div>

        <div className="grid gap-4">
          {suppliers.map((supplier) => {
            const details = [
              supplier.cnpj ? `CNPJ: ${supplier.cnpj}` : null,
              supplier.email ? `Email: ${supplier.email}` : null,
              supplier.phone ? `Telefone: ${supplier.phone}` : null,
              supplier.company_name ? `Empresa: ${supplier.company_name}` : null,
              supplier.status ? `Status: ${supplier.status.toLowerCase() === 'ativo' ? 'Ativo' : supplier.status}` : null,
            ]
              .filter(Boolean)
              .join(' | ');

            return (
              <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{supplier.name}</CardTitle>
                      <CardDescription>{details}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(supplier)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setSupplierToDelete(supplier)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {suppliers.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-sicofe-gray">Nenhum fornecedor encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>

      <NovoFornecedorModal
        open={showModal}
        onOpenChange={handleModalChange}
        onSuccess={closeModal}
        initialData={editingSupplier
          ? {
              id: editingSupplier.id,
              name: editingSupplier.name,
              cnpj: editingSupplier.cnpj,
              email: editingSupplier.email,
              phone: editingSupplier.phone,
              address: editingSupplier.address,
              status: editingSupplier.status,
              company_id: editingSupplier.company_id,
            }
          : undefined}
      />

      <AlertDialog
        open={Boolean(supplierToDelete)}
        onOpenChange={(open) => {
          if (!open) setSupplierToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir fornecedor</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação excluirá o fornecedor selecionado. Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSupplier}
              disabled={isDeleting}
              className="bg-destructive text-white"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}




