
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const env = import.meta.env.VITE_ENVIRONMENT as string | undefined;
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="lg:hidden" />
              {env === "homolog" && (
                <span className="text-xs px-2 py-1 rounded border bg-amber-50 text-amber-800 border-amber-200">
                  Homologação
                </span>
              )}
            </div>
          </header>
          
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-auto bg-white">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
