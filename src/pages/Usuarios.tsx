import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, MoreVertical, Edit, Trash2 } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import NovoUsuarioModal from "@/components/NovoUsuarioModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  status: string | null;
  cargo: string | null;
  aprovador: boolean | null;
  pacoteiro: boolean | null;
  created_at: string;
}

export default function Usuarios() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Profile | undefined>();
  const [toDelete, setToDelete] = useState<Profile | undefined>();
  const { toast } = useToast();

  const { data: users, isLoading, refetch } = useSupabaseTable<Profile>("profiles", {
    select: "id, user_id, first_name, last_name, role, status, cargo, aprovador, pacoteiro, created_at",
    orderBy: { column: "first_name", ascending: true },
  });

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
            <h1 className="text-3xl font-bold tracking-tight text-sicofe-navy">Usuários</h1>
            <p className="text-sicofe-gray">Gerencie os usuários do sistema</p>
          </div>
          <Button onClick={() => { setEditing(undefined); setShowModal(true); }} className="text-white bg-sicofe-blue">
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        </div>

        <div className="grid gap-4">
          {users?.map((user) => {
            const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Nome não informado";
            return (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{fullName}</CardTitle>
                      <CardDescription>
                        Cargo: {user.cargo || "—"} • Permissão: {user.role || "user"} • Status: {user.status || "active"}
                      </CardDescription>
                    </div>
                    <div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditing(user);
                              setTimeout(() => setShowModal(true), 0);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setTimeout(() => setToDelete(user), 0)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {users?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-sicofe-gray">Nenhum usuário encontrado</p>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Deseja excluir o usuário
              <b> {([toDelete?.first_name, toDelete?.last_name].filter(Boolean).join(" ")) || ""}</b>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!toDelete) return;
                try {
                  const { error } = await supabase.functions.invoke("delete-user", {
                    body: { user_id: toDelete.user_id },
                  });
                  if (error) throw error;
                  toast({ title: "Usuário excluído", description: "O usuário foi removido com sucesso." });
                  setToDelete(undefined);
                  refetch();
                } catch (e: unknown) {
                  const message = e instanceof Error ? e.message : String(e);
                  toast({ title: "Erro ao excluir", description: message || "Tente novamente mais tarde.", variant: "destructive" });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <NovoUsuarioModal
        open={showModal}
        onOpenChange={(v) => {
          if (!v) setEditing(undefined);
          setShowModal(v);
        }}
        onSuccess={() => refetch()}
        initialData={
          editing && {
            id: editing.id,
            user_id: editing.user_id,
            first_name: editing.first_name,
            last_name: editing.last_name,
            role: editing.role,
            aprovador: editing.aprovador,
            pacoteiro: editing.pacoteiro,
            cargo: editing.cargo,
          }
        }
      />
    </>
  );
}
