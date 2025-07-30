import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useAccountHierarchy } from "@/hooks/useAccountHierarchy";
interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: string;
  status: string;
  company_id: string;
  parent_id?: string;
  created_at: string;
}
export default function PlanoContas() {
  const [showModal, setShowModal] = useState(false);
  const { data: accounts, isLoading } = useAccountHierarchy();
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sicofe-navy">Plano de Contas</h1>
          <p className="text-sicofe-gray">
            Gerencie a estrutura contábil das empresas
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="text-white bg-sicofe-blue">
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      <div className="grid gap-4">
        {accounts?.map(account => <Card key={account.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{account.analytical_account}</CardTitle>
                  <CardDescription>
                    {account.level_1} → {account.level_2}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>)}
      </div>

      {accounts?.length === 0 && <Card>
          <CardContent className="text-center py-8">
            <p className="text-sicofe-gray">Nenhuma conta encontrada</p>
          </CardContent>
        </Card>}
    </div>;
}