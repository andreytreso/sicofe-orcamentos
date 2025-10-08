import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
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
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading } = useSupabaseTable('collaborators_with_details', {
    select: '*',
    orderBy: { column: 'name', ascending: true }
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
            <h1 className="text-3xl font-bold tracking-tight text-sicofe-navy">Colaboradores</h1>
            <p className="text-sicofe-gray">Gerencie os colaboradores das empresas</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="text-white bg-sicofe-blue">
            <Plus className="mr-2 h-4 w-4" />
            Novo Colaborador
          </Button>
        </div>

        <div className="grid gap-4">
          {data?.map((col) => (
            <Card key={col.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{col.name}</CardTitle>
                    <CardDescription>
                      {(col.group_name || '')}
                      {col.company_name ? ` | Empresa: ${col.company_name}` : ''}
                      {col.cost_center_name ? ` | CC: ${col.cost_center_code ? col.cost_center_code + ' - ' : ''}${col.cost_center_name}` : ''}
                      {col.status ? ` | Status: ${col.status}` : ''}
                    </CardDescription>
                  </div>
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

      <NovoColaboradorModal open={showModal} onOpenChange={setShowModal} />
    </>
  );
}

