import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import NovoUsuarioModal from "@/components/NovoUsuarioModal";
interface UserProfile {
  user_id: string;
  full_name?: string;
  role: string;
  status: string;
  company_id?: string;
  created_at: string;
}
export default function Usuarios() {
  const [showModal, setShowModal] = useState(false);
  const {
    data: users,
    isLoading
  } = useSupabaseTable<UserProfile>('user_profiles', {
    orderBy: {
      column: 'full_name',
      ascending: true
    }
  });
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }
return (<>
  <div className="space-y-6">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-sicofe-navy">Usuários</h1>
        <p className="text-sicofe-gray">Gerencie os usuários do sistema</p>
      </div>
      <Button onClick={() => setShowModal(true)} className="text-white bg-sicofe-blue">
        <Plus className="mr-2 h-4 w-4" />
        Novo Usuário
      </Button>
    </div>

    <div className="grid gap-4">
      {users?.map(user => (
        <Card key={user.user_id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{user.full_name || 'Nome não informado'}</CardTitle>
                <CardDescription>
                  Role: {user.role} | Status: {user.status}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>

    {users?.length === 0 && (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-sicofe-gray">Nenhum usuário encontrado</p>
        </CardContent>
      </Card>
    )}
  </div>

  <NovoUsuarioModal open={showModal} onOpenChange={setShowModal} />
</>);
}