import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Edit, MoreVertical, Trash2 } from "lucide-react";
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
import NovoColaboradorModal from "@/components/NovoColaboradorModal";

interface CollaboratorRow {
  id: string;
  name: string;
  group_name: string | null;
  status: string;
  company_id: string;
  cost_center_id: string | null;
  company_name: string | null;
  cost_center_code: string | null;
  cost_center_name: string | null;
}

export default function Colaboradores() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<CollaboratorRow | null>(null);
  const [collaboratorToDelete, setCollaboratorToDelete] = useState<CollaboratorRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data = [], isLoading } = useSupabaseTable<CollaboratorRow>('collaborators_with_details', {
    orderBy: { column: 'name', ascending: true },
  });

  const collaborators = useMemo(() => data ?? [], [data]);

  const openCreateModal = () => {
    setEditingCollaborator(null);
    setShowModal(true);
  };

  const openEditModal = (collaborator: CollaboratorRow) => {
    setEditingCollaborator(collaborator);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCollaborator(null);
  };

  const handleModalChange = (open: boolean) => {
    if (open) {
      setShowModal(true);
    } else {
      closeModal();
    }
  };

  const handleDeleteCollaborator = async () => {
    if (!collaboratorToDelete?.id) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('collaborators')
        .delete()
        .eq('id', collaboratorToDelete.id);

      if (error) throw error;

      toast.success('Colaborador excluído com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['collaborators'] });
      queryClient.invalidateQueries({ queryKey: ['collaborators_with_details'] });
      setCollaboratorToDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'Erro ao excluir colaborador.');
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
            <h1 className="text-3xl font-bold tracking-tight text-sicofe-navy">Colaboradores</h1>
            <p className="text-sicofe-gray">Gerencie os colaboradores das empresas</p>
          </div>
          <Button onClick={openCreateModal} className="text-white bg-sicofe-blue">
            <Plus className="mr-2 h-4 w-4" />
            Novo Colaborador
          </Button>
        </div>

        <div className="grid gap-4">
          {collaborators.map((col) => {
            const details = [
              col.group_name ? `Grupo: ${col.group_name}` : null,
              col.company_name ? `Empresa: ${col.company_name}` : null,
              col.cost_center_name
                ? `CC: ${col.cost_center_code ? `${col.cost_center_code} - ` : ''}${col.cost_center_name}`
                : null,
              col.status ? `Status: ${col.status === 'active' ? 'Ativo' : 'Inativo'}` : null,
            ]
              .filter(Boolean)
              .join(' | ');

            return (
              <Card key={col.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{col.name}</CardTitle>
                      <CardDescription>{details}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(col)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setCollaboratorToDelete(col)}
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

        {collaborators.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-sicofe-gray">Nenhum colaborador encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>

      <NovoColaboradorModal
        open={showModal}
        onOpenChange={handleModalChange}
        onSuccess={closeModal}
        initialData={editingCollaborator
          ? {
              id: editingCollaborator.id,
              name: editingCollaborator.name,
              group_name: editingCollaborator.group_name,
              status: editingCollaborator.status,
              company_id: editingCollaborator.company_id,
              cost_center_id: editingCollaborator.cost_center_id,
            }
          : undefined}
      />

      <AlertDialog
        open={Boolean(collaboratorToDelete)}
        onOpenChange={(open) => {
          if (!open) setCollaboratorToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir colaborador</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação excluirá o colaborador selecionado. Tem certeza que deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCollaborator}
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
