
import { Building2, LayoutDashboard, Calculator, FileText, Settings, ChevronRight, Plus } from "lucide-react";
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
  {
    title: "Lançamentos",
    url: "/lancamentos",
    icon: Plus,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-gray-200 bg-white">
      <SidebarHeader className="border-b border-gray-200 p-6 bg-white">
        <div className="flex items-center justify-center">
          <img 
            src="/lovable-uploads/aeb6e43a-0df5-4317-b487-2cf292d5bf0a.png" 
            alt="SICOFE" 
            className="h-12 w-auto"
          />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4 bg-white">
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
      
      <SidebarFooter className="border-t border-gray-200 p-4 bg-white">
        <div className="flex items-center space-x-3 text-sm text-sicofe-gray">
          <Settings className="h-4 w-4" />
          <span>Configurações</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
