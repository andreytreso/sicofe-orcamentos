import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import NovaEmpresaModal, { CompanyForm } from "@/components/NovaEmpresaModal";
import { useCompaniesTable } from "@/hooks/useSupabaseTable";

export default function Empresas() {
  const { data: companies, isLoading, error, refetch } = useCompaniesTable();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyForm | undefined>(undefined);

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
            <h1 className="text-3xl font-bold tracking-tight text-sicofe-navy">Empresas</h1>
            <p className="text-sicofe-gray">Gerencie as empresas cadastradas</p>
          </div>
          <Button
            onClick={() => {
              setEditing(undefined);
              setModalOpen(true);
            }}
            className="text-white bg-sicofe-blue"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Empresa
          </Button>
        </div>

        {error && (
          <Card>
            <CardContent className="text-destructive p-4">
              {(error as Error).message}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4">
          {companies.map((c: CompanyForm) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{c.name}</CardTitle>
                    <CardDescription>
                      {c.grupo ? `Grupo: ${c.grupo}` : 'Sem grupo'} | Status: {c.status === 'active' ? 'Ativa' : 'Inativa'}
                    </CardDescription>
                  </div>
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditing(c);
                        setModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {companies.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-sicofe-gray">Nenhuma empresa encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>

      <NovaEmpresaModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialData={editing}
        onSuccess={() => refetch()}
      />
    </>
  );
}
