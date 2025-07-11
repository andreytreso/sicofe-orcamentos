
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Users, Calendar, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCompanies } from '@/hooks/useCompanies';

export default function Empresas() {
  const { data: companies = [], isLoading } = useCompanies();
  
  const activeCompanies = companies.filter(company => company.status === 'active');
  const totalUsers = 0; // TODO: Implement user count
  const totalBudgets = 0; // TODO: Implement budget count

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-sicofe-blue" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-sicofe-navy">Empresas</h1>
          <p className="text-sicofe-gray mt-1">Gerencie todas as empresas do seu sistema</p>
        </div>
        <Button className="sicofe-gradient hover:opacity-90 transition-opacity">
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sicofe-blue/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-sicofe-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Total de Empresas</p>
                <p className="text-2xl font-bold text-sicofe-navy">{companies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sicofe-green/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-sicofe-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Empresas Ativas</p>
                <p className="text-2xl font-bold text-sicofe-navy">{activeCompanies.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sicofe-blue/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-sicofe-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Orçamentos Ativos</p>
                <p className="text-2xl font-bold text-sicofe-navy">{totalBudgets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle className="text-sicofe-navy">Lista de Empresas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companies.map((empresa) => (
              <div
                key={empresa.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 sicofe-gradient rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sicofe-navy">{empresa.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-sicofe-gray">0 orçamentos</span>
                      <span className="text-sm text-sicofe-gray">0 usuários</span>
                      <span className="text-sm text-sicofe-gray">
                        Criado em {new Date(empresa.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={empresa.status === 'active' ? 'default' : 'secondary'}
                    className={empresa.status === 'active' ? 'bg-sicofe-green hover:bg-sicofe-green' : ''}
                  >
                    {empresa.status === 'active' ? 'Ativa' : 'Inativa'}
                  </Badge>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
