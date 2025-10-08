import { useState } from "react";
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
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import NovoColaboradorModal from "@/components/NovoColaboradorModal";

interface CollaboratorRow {
  id: string;
  name: string;
  group_name: string | null;
  status: string;
  company_id: string;
  cost_center_id: string | null;
  company_name?: string | null;
  cost_center_code?: string | null;
  cost_center_name?: string | null;
}

export default function Colaboradores() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CollaboratorRow | undefined>();
  const [toDelete, setToDelete] = useState<CollaboratorRow | undefined>();
  const { data, isLoading } = useSupabaseTable('collaborators_with_details', {
    select: '*',
    orderBy: { column: 'name', ascending: true }
  });

  async function handleDelete(id: string) {
    const { error } = await supabase.from("collaborators").delete().eq("id", id);
    
    if (error) {
      alert(error.details ?? error.message);
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: ["collaborators_with_details"] });
  }

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
          <Button 
            onClick={() => {
              setEditing(undefined);
              setShowModal(true);
            }} 
            className="text-white bg-sicofe-blue"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo Colaborador
          </Button>
        </div>

        <div className="grid gap-4">
          {data?.map((col) => (
            <Card key={col.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{col.name}</CardTitle>
                    <CardDescription>
                      {(col.group_name || '')}
                      {col.company_name ? ` | Empresa: ${col.company_name}` : ''}
                      {col.cost_center_name ? ` | CC: ${col.cost_center_code ? col.cost_center_code + ' - ' : ''}${col.cost_center_name}` : ''}
                      {col.status ? ` | Status: ${col.status}` : ''}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent align="end" className="bg-white z-50">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing(col);
                          setTimeout(() => setShowModal(true), 0);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setTimeout(() => setToDelete(col), 0)}
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

        {data?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-sicofe-gray">Nenhum colaborador encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(o) => {
          if (!o) setToDelete(undefined);
        }}
      >
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Deseja excluir o colaborador
              <b> {toDelete?.name}</b>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) {
                  handleDelete(toDelete.id);
                }
                setToDelete(undefined);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NovoColaboradorModal 
        open={showModal} 
        onOpenChange={(v) => {
          if (!v) setEditing(undefined);
          setShowModal(v);
        }}
        initialData={editing}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["collaborators_with_details"] });
          setEditing(undefined);
        }}
      />
    </>
  );
}

