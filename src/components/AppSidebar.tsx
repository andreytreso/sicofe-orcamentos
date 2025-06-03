
import { Building2, LayoutDashboard, Calculator, FileText, Settings, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
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
} from "@/components/ui/sidebar";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
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
    url: "/plano-contas",
    icon: FileText,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sicofe-gradient rounded-lg flex items-center justify-center">
            <Calculator className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-sicofe-navy">SICOFE</h2>
            <p className="text-xs text-sicofe-gray">Controle Orçamentário</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sicofe-gray text-xs uppercase tracking-wider mb-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`w-full justify-start transition-all duration-200 hover:bg-sicofe-blue hover:text-white group ${
                      location.pathname === item.url 
                        ? 'bg-sicofe-blue text-white shadow-md' 
                        : 'text-sicofe-gray-dark hover:text-white'
                    }`}
                  >
                    <Link to={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                      <ChevronRight className={`h-4 w-4 ml-auto transition-transform duration-200 ${
                        location.pathname === item.url ? 'rotate-90' : 'group-hover:translate-x-1'
                      }`} />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3 text-sm text-sicofe-gray">
          <Settings className="h-4 w-4" />
          <span>Configurações</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
