import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useAccountHierarchy } from "@/hooks/useAccountHierarchy";
import NovaContaModal from "@/components/NovaContaModal";
import PlanoContasFiltros from "@/components/PlanoContasFiltros";

// Interface corrigida baseada no que está sendo usado no JSX
interface AccountHierarchy {
  id: string;
  analytical_account: string;
  level_1: string;
  level_2: string;
  // Adicione outras propriedades conforme necessário
  code?: string;
  name?: string;
  type?: string;
  status?: string;
  company_id?: string;
  parent_id?: string;
  created_at?: string;
}

interface Filters {
  level_1?: string;
  level_2?: string;
  analytical_account?: string;
}

export default function PlanoContas() {
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
  
  // Tipagem explícita do retorno do hook
  const { data: accounts, isLoading } = useAccountHierarchy(filters) as {
    data: AccountHierarchy[] | undefined;
    isLoading: boolean;
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
            <h1 className="text-3xl font-bold tracking-tight text-sicofe-navy">
              Plano de Contas
            </h1>
            <p className="text-sicofe-gray">
              Gerencie a estrutura contábil da sua empresa
            </p>
          </div>
          <Button 
            onClick={() => setShowModal(true)} 
            className="text-white bg-sicofe-blue"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Conta
          </Button>
        </div>

        <PlanoContasFiltros 
          filters={filters} 
          onFiltersChange={setFilters} 
        />

        <div className="grid gap-4">
          {accounts?.map((account) => (
            <Card 
              key={account.id} 
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {account.analytical_account || 'Conta sem nome'}
                    </CardTitle>
                    <CardDescription>
                      {account.level_1 || 'N/A'} → {account.level_2 || 'N/A'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {accounts?.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-sicofe-gray">Nenhuma conta encontrada</p>
            </CardContent>
          </Card>
        )}
      </div>

      <NovaContaModal 
        open={showModal} 
        onOpenChange={setShowModal} 
      />
    </>
  );
}