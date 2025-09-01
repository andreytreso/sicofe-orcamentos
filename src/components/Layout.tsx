import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

interface AppLayoutProps { children: React.ReactNode; }

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="bg-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="lg:hidden" />
            </div>
          </header>
          <div className="flex-1 p-6 overflow-auto bg-white">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
