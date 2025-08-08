import { PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

export function AdminOnly({ children }: PropsWithChildren) {
  const { data, isLoading, error } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-sicofe-blue" />
      </div>
    );
  }

  if (error || !data?.isAdmin) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
