import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
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
  const [showModal, setShowModal] = useState(false);
  const {
    data: costCenters,
    isLoading
  } = useSupabaseTable<CostCenter>('cost_centers', {
    orderBy: {
      column: 'code',
      ascending: true
    }
  });
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>;
  }
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-sicofe-navy">Centros de Custo</h1>
          <p className="text-sicofe-gray">
            Gerencie os centros de custo das empresas
          </p>
        </div>
        <Button onClick={() => setShowModal(true)} className="text-white bg-sicofe-blue">
          <Plus className="mr-2 h-4 w-4" />
          Novo Centro de Custo
        </Button>
      </div>

      <div className="grid gap-4">
        {costCenters?.map(center => <Card key={center.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{center.code} - {center.name}</CardTitle>
                  <CardDescription>
                    Status: {center.status}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>)}
      </div>

      {costCenters?.length === 0 && <Card>
          <CardContent className="text-center py-8">
            <p className="text-sicofe-gray">Nenhum centro de custo encontrado</p>
          </CardContent>
        </Card>}
    </div>;
}