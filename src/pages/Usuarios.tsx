import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Building2 } from "lucide-react";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { format, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";

type ProfileRow = {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
};

type UserProfilesRow = {
  user_id: string;
  status: string | null;
  role: string | null;
  company_id: string | null;
  created_at: string | null;
  companies?: { name: string | null } | null;
};

function toMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try { return JSON.stringify(e); } catch { return "Erro desconhecido"; }
}

export default function Usuarios() {
  // 1) Perfis (nome do usuário)
  const {
    data: profiles = [],
    isLoading: loadingProfiles,
    error: errProfiles,
  } = useSupabaseTable<"profiles", ProfileRow>("profiles", {
    select: "id,user_id,first_name,last_name,created_at",
    orderBy: { column: "created_at", ascending: false },
  });

  // 2) Metadados (status/role/empresa)
  const {
    data: userProfiles = [],
    isLoading: loadingUserProfiles,
    error: errUserProfiles,
  } = useSupabaseTable<"user_profiles", UserProfilesRow>("user_profiles", {
    // join com companies funciona porque há FK em company_id
    select: "user_id,status,role,company_id,created_at,companies(name)",
    orderBy: { column: "created_at", ascending: false },
  });

  const isLoading = loadingProfiles || loadingUserProfiles;
  const errorMsg = errProfiles
    ? toMessage(errProfiles)
    : errUserProfiles
    ? toMessage(errUserProfiles)
    : "";

  // 3) Mescla pelo user_id
  const users = useMemo(() => {
    const mapByUserId = new Map<string, UserProfilesRow>();
    for (const up of userProfiles) {
      if (up?.user_id) mapByUserId.set(up.user_id, up);
    }

    return profiles.map((p) => {
      const up = mapByUserId.get(p.user_id);
      const fullName = [p.first_name, p.last_name].filter(Boolean).join(" ");
      const companyName = up?.companies?.name ?? "—";
      const status = (up?.status ?? "").toLowerCase();
      const role = up?.role ?? "—";
      const created = (() => {
        try {
          const iso = parseISO(p.created_at);
          const d = isValid(iso) ? iso : new Date(p.created_at);
          return format(d, "dd/MM/yyyy", { locale: ptBR });
        } catch {
          return "—";
        }
      })();

      return {
        user_id: p.user_id,
        fullName: fullName || "—",
        companyName,
        status: status || "—",
        role,
        created,
      };
    });
  }, [profiles, userProfiles]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-sicofe-blue" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-6">
        <p className="text-red-600">Erro ao carregar usuários: {errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-sicofe-navy">Usuários</h1>
          <p className="text-sicofe-gray mt-1">
            Lista dos usuários cadastrados no sistema
          </p>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sicofe-blue/10 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-sicofe-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Total de Usuários</p>
                <p className="text-2xl font-bold text-primary">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-sicofe-blue/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-sicofe-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-sicofe-gray">Vinculados a Empresa</p>
                <p className="text-2xl font-bold text-primary">
                  {users.filter((u) => u.companyName && u.companyName !== "—").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sicofe-navy">Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-sicofe-gray">
              Nenhum usuário encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u.user_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="text-primary font-semibold">{u.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      Criado em {u.created}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        u.status === "active" || u.status === "ativo"
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }
                    >
                      {u.status === "active" || u.status === "ativo"
                        ? "Ativo"
                        : "Inativo"}
                    </Badge>
                    <Badge className="bg-white border text-sicofe-gray">
                      {u.role || "—"}
                    </Badge>
                    <Badge className="bg-white border text-sicofe-gray">
                      {u.companyName || "—"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
