
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Users, Calendar, MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const empresasData = [
  {
    id: 1,
    nome: "Tech Solutions LTDA",
    orcamentos: 3,
    usuarios: 5,
    ultimaAtualizacao: "2024-06-01",
    status: "ativa"
  },
  {
    id: 2,
    nome: "Marketing Digital S/A",
    orcamentos: 2,
    usuarios: 3,
    ultimaAtualizacao: "2024-05-28",
    status: "ativa"
  },
  {
    id: 3,
    nome: "Consultoria Financeira",
    orcamentos: 1,
    usuarios: 2,
    ultimaAtualizacao: "2024-05-15",
    status: "inativa"
  },
  {
    id: 4,
    nome: "E-commerce Brasil",
    orcamentos: 4,
    usuarios: 8,
    ultimaAtualizacao: "2024-06-02",
    status: "ativa"
  }
];

export default function Empresas() {
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
        <Card className="sicofe-card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sicofe-blue/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-sicofe-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Total de Empresas</p>
                <p className="text-2xl font-bold text-sicofe-navy">4</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="sicofe-card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sicofe-green/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-sicofe-green" />
              </div>
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Usuários Ativos</p>
                <p className="text-2xl font-bold text-sicofe-navy">18</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="sicofe-card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sicofe-orange/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-sicofe-orange" />
              </div>
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Orçamentos Ativos</p>
                <p className="text-2xl font-bold text-sicofe-navy">10</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card className="sicofe-card-shadow">
        <CardHeader>
          <CardTitle className="text-sicofe-navy">Lista de Empresas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {empresasData.map((empresa) => (
              <div
                key={empresa.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 sicofe-gradient rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sicofe-navy">{empresa.nome}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-sicofe-gray">{empresa.orcamentos} orçamentos</span>
                      <span className="text-sm text-sicofe-gray">{empresa.usuarios} usuários</span>
                      <span className="text-sm text-sicofe-gray">
                        Atualizado em {new Date(empresa.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={empresa.status === 'ativa' ? 'default' : 'secondary'}
                    className={empresa.status === 'ativa' ? 'bg-sicofe-green hover:bg-sicofe-green' : ''}
                  >
                    {empresa.status === 'ativa' ? 'Ativa' : 'Inativa'}
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
