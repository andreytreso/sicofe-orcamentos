
import { Building2, LayoutDashboard, Calculator, FileText, Plus, CheckSquare, Users, Truck, BookOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

type MenuItem = {
  title: string;
  url: string;
  icon: React.ElementType;
  role?: string;
};

const mainMenuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Lançamentos",
    url: "/lancamentos",
    icon: Plus,
  },
  {
    title: "Aprovações",
    url: "/aprovacoes",
    icon: CheckSquare,
    role: "APPROVER",
  },
];

const cadastrosItems: MenuItem[] = [
  {
    title: "Empresas",
    url: "/empresas",
    icon: Building2,
  },
  {
    title: "Orçamentos",
    url: "/orcamentos",
    icon: Calculator,
  },
  {
    title: "Plano de Contas",
    url: "/cadastros/plano-contas",
    icon: BookOpen,
  },
  {
    title: "Fornecedores",
    url: "/cadastros/fornecedores",
    icon: Truck,
  },
  {
    title: "Colaboradores",
    url: "/cadastros/colaboradores",
    icon: Users,
  },
  {
    title: "Centros de Custo",
    url: "/cadastros/centros-custo",
    icon: FileText,
  },
  {
    title: "Usuários",
    url: "/cadastros/usuarios",
    icon: Users,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const [cadastrosOpen, setCadastrosOpen] = useState(true);

  const userRole = "APPROVER";
  const visibleMainItems = mainMenuItems.filter(item => !item.role || item.role === userRole);

  const isItemActive = (url: string) => location.pathname === url;
  const isCadastrosActive = cadastrosItems.some(item => isItemActive(item.url));

  const MenuButton = ({ item, isActive }: { item: MenuItem; isActive: boolean }) => (
    <SidebarMenuButton 
      asChild 
      className={`w-full justify-start transition-all duration-200 hover:text-white group ${
        isActive ? 'text-white shadow-md' : 'text-gray-700 hover:text-white'
      }`}
      style={{
        backgroundColor: isActive ? '#0047FF' : 'transparent',
        '--hover-bg': '#0047FF'
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = '#0047FF';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      <Link to={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
        <item.icon className="h-5 w-5" />
        <span className="font-medium">{item.title}</span>
      </Link>
    </SidebarMenuButton>
  );

  return (
    <Sidebar className="bg-white border-r border-gray-200">
      <SidebarHeader className="p-6 bg-white">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/aeb6e43a-0df5-4317-b487-2cf292d5bf0a.png" 
            alt="SICOFE" 
            className="h-20 w-auto"
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4 bg-white">
        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider mb-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {visibleMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <MenuButton item={item} isActive={isItemActive(item.url)} />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Cadastros */}
        <SidebarGroup>
          <Collapsible open={cadastrosOpen} onOpenChange={setCadastrosOpen}>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider mb-2 cursor-pointer hover:text-gray-700 flex items-center justify-between">
                Cadastros
                <ChevronRight className={`h-4 w-4 transition-transform ${cadastrosOpen ? 'rotate-90' : ''}`} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {cadastrosItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <MenuButton item={item} isActive={isItemActive(item.url)} />
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 bg-white">
        {/* Rodapé removido conforme solicitado */}
      </SidebarFooter>
    </Sidebar>
  );
}
