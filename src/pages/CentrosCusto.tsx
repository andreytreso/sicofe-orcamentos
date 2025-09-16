import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import NovoCentroCustoModal from "@/components/NovoCentroCustoModal";
interface CostCenter {
  id: string;
  code: string;
  name: string;
  status: string;
  company_id: string;
  parent_id?: string;
  created_at: string;
}
export default function CentrosCusto() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CostCenter | undefined>();
  const [toDelete, setToDelete] = useState<CostCenter | undefined>();
  const {
    data: costCenters,
    isLoading
  } = useSupabaseTable('cost_centers', {
    orderBy: {
      column: 'code',
      ascending: true
    }
  });
  // Função para exclusão
  async function handleDelete(id: string) {
    const { error } = await supabase.from("cost_centers").delete().eq("id", id);

    if (error) {
      alert(error.details ?? error.message);
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: ["cost_centers"] });
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }
return (<>
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-sicofe-navy">Centros de Custo</h1>
        <p className="text-sicofe-gray">Gerencie os centros de custo das empresas</p>
      </div>
      <Button 
        onClick={() => {
          setEditing(undefined);
          setShowModal(true);
        }} 
        className="text-white bg-sicofe-blue"
      >
        <Plus className="mr-2 h-4 w-4" />
        Novo Centro de Custo
      </Button>
    </div>

    <div className="grid gap-4">
      {costCenters?.map(center => (
        <Card key={center.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">{center.code} - {center.name}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Badge 
                    className={
                      center.status?.toLowerCase() === "ativo" 
                        ? "bg-accent text-white" 
                        : "bg-secondary"
                    }
                  >
                    {center.status}
                  </Badge>
                </CardDescription>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditing(center);
                      setTimeout(() => setShowModal(true), 0);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setTimeout(() => setToDelete(center), 0)}
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

    {costCenters?.length === 0 && (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-sicofe-gray">Nenhum centro de custo encontrado</p>
        </CardContent>
      </Card>
    )}
  </div>

  {/* CONFIRM DELETE */}
  <AlertDialog
    open={!!toDelete}
    onOpenChange={(o) => {
      if (!o) setToDelete(undefined);
    }}
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
        <AlertDialogDescription>
          Esta ação não pode ser desfeita. Deseja excluir o centro de custo
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

  <NovoCentroCustoModal 
    open={showModal} 
    onOpenChange={(v) => {
      if (!v) setEditing(undefined);
      setShowModal(v);
    }}
    initialData={editing}
    onSuccess={() => {
      queryClient.invalidateQueries({ queryKey: ["cost_centers"] });
      setEditing(undefined);
    }}
  />
</>);
}