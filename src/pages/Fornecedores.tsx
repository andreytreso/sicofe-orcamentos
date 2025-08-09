import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import NovoFornecedorModal from "@/components/NovoFornecedorModal";
interface Supplier {
  id: string;
  name: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  company_id: string;
  created_at: string;
}
export default function Fornecedores() {
  const [showModal, setShowModal] = useState(false);
  const {
    data: suppliers,
    isLoading
  } = useSupabaseTable<Supplier>('suppliers', {
    orderBy: {
      column: 'name',
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
        <h1 className="text-3xl font-bold tracking-tight text-sicofe-navy">Fornecedores</h1>
        <p className="text-sicofe-gray">Gerencie os fornecedores das empresas</p>
      </div>
      <Button onClick={() => setShowModal(true)} className="text-white bg-sicofe-blue">
        <Plus className="mr-2 h-4 w-4" />
        Novo Fornecedor
      </Button>
    </div>

    <div className="grid gap-4">
      {suppliers?.map(supplier => (
        <Card key={supplier.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{supplier.name}</CardTitle>
                <CardDescription>
                  {supplier.cnpj && `CNPJ: ${supplier.cnpj}`}
                  {supplier.email && ` | Email: ${supplier.email}`}
                  {supplier.phone && ` | Telefone: ${supplier.phone}`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>

    {suppliers?.length === 0 && (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-sicofe-gray">Nenhum fornecedor encontrado</p>
        </CardContent>
      </Card>
    )}
  </div>

  <NovoFornecedorModal open={showModal} onOpenChange={setShowModal} />
</>);
}