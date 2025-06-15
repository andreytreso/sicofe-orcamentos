import { Building2, LayoutDashboard, Calculator, FileText, Plus } from "lucide-react";
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
    title: "Lançamentos",
    url: "/lancamentos",
    icon: Plus,
  },
];

export function AppSidebar() {
  const location = useLocation();

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
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs uppercase tracking-wider mb-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    className={`w-full justify-start transition-all duration-200 hover:text-white group ${
                      location.pathname === item.url 
                        ? 'text-white shadow-md' 
                        : 'text-gray-700 hover:text-white'
                    }`}
                    style={{
                      backgroundColor: location.pathname === item.url ? '#0047FF' : 'transparent',
                      '--hover-bg': '#0047FF'
                    } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      if (location.pathname !== item.url) {
                        e.currentTarget.style.backgroundColor = '#0047FF';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== item.url) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Link to={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 bg-white">
        {/* Rodapé removido conforme solicitado */}
      </SidebarFooter>
    </Sidebar>
  );
}
