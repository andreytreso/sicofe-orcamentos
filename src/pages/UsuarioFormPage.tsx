import { useEffect, useState, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem
} from "@/components/ui/command";
import { Loader2, ChevronsUpDown, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cargoOptions } from "@/constants/cargoOptions";
import { useCompanies } from "@/hooks/useCompanies";
import PermissoesPlanoContas from "@/components/PermissoesPlanoContas";
import { cn } from "@/lib/utils";

type CompanyRow = { id: string | number; name: string; group_id?: string | null };
type GroupOpt = { id: string; name: string };
type GroupRowLite = { id: string | number; name: string };

const GROUP_NONE = "__none__";

/* ---------- MultiSelect compacto com busca ---------- */
function CompanyMultiSelect({
  companies, value, onChange, disabled, placeholder = "Selecionar empresas",
}: {
  companies: CompanyRow[]; value: string[]; onChange: (ids: string[]) => void; disabled?: boolean; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  const allVisibleSelected = companies.length > 0 && companies.every((c) => value.includes(String(c.id)));
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" role="combobox" className="w-full justify-between" disabled={disabled}>
          {value.length > 0 ? `${value.length} empresa(s) selecionada(s)` : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(560px,90vw)] p-0">
        <Command>
          <div className="p-2"><CommandInput placeholder="Buscar empresa..." /></div>
          <CommandList>
            <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
            <CommandGroup heading="Ações">
              <CommandItem
                disabled={companies.length === 0}
                onSelect={() => onChange(allVisibleSelected ? [] : companies.map((c) => String(c.id)))}
              >
                <Check className={cn("mr-2 h-4 w-4", allVisibleSelected ? "opacity-100" : "opacity-0")} />
                {allVisibleSelected ? "Limpar todas" : "Selecionar todas mostradas"}
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Empresas">
              {companies.map((c) => {
                const id = String(c.id);
                const selected = value.includes(id);
                return (
                  <CommandItem key={id} onSelect={() => toggle(id)} value={`${c.name} ${id}`}>
                    <Check className={cn("mr-2 h-4 w-4", selected ? "opacity-100" : "opacity-0")} />
                    {c.name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
/* --------------------------------------------------- */

export default function UsuarioFormPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // /usuarios/novo  -> id undefined | /usuarios/:id/editar -> id
  const isEdit = Boolean(id);
  const { toast } = useToast();

  const { data: companiesData = [] } = useCompanies();
  const companies: CompanyRow[] = (companiesData as CompanyRow[]).filter(
    (c) => c && c.id != null && String(c.id) !== "" && c.name && String(c.name).trim() !== ""
  );

  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", role: "user", cargo: "", aprovador: false, pacoteiro: false,
  });
  const [saving, setSaving] = useState(false);
  const [permissoesContaIds, setPermissoesContaIds] = useState<string[]>([]);
  const [groups, setGroups] = useState<GroupOpt[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [companyIds, setCompanyIds] = useState<string[]>([]);

  // Carrega nomes dos grupos da tabela company_groups (sem depender dos tipos gerados)
  useEffect(() => {
    (async () => {
      const resp = (await (
        (supabase as unknown as {
          from: (t: string) => {
            select: (cols: string) => {
              order: (col: string, opts: { ascending: boolean }) => Promise<{ data: unknown; error: { message: string } | null }>;
            };
          };
        })
          .from("company_groups")
          .select("id,name")
          .order("name", { ascending: true })
      )) as { data: unknown; error: { message: string } | null };

      if (resp.error) { console.warn("[company_groups] load error:", resp.error.message); return; }
      const rows = (resp.data ?? []) as GroupRowLite[];
      setGroups(rows.map(r => ({ id: String(r.id), name: String(r.name) })));
    })();
  }, []);

  // Carrega dados do perfil se edição
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      const base = (supabase as unknown as {
        from: (t: string) => {
          select: (s: string) => {
            eq: (c: string, v: string) => { single: () => Promise<{ data: unknown; error: { message: string } | null }>; };
          };
        };
      });
      // tenta por id
      let { data, error } = await base.from("profiles")
        .select("id,user_id,first_name,last_name,role,aprovador,pacoteiro,cargo,email,permissoes_conta_ids,company_access_ids")
        .eq("id", String(id)).single();
      // fallback por user_id
      if (error) {
        const alt = await base.from("profiles")
          .select("id,user_id,first_name,last_name,role,aprovador,pacoteiro,cargo,email,permissoes_conta_ids,company_access_ids")
          .eq("user_id", String(id)).single();
        data = alt.data; error = alt.error;
      }
      if (error) { console.warn("[profiles load]", error.message); return; }
      const p = data as Record<string, unknown>;
      setForm({
        first_name: String(p.first_name ?? ""),
        last_name: String(p.last_name ?? ""),
        email: String(p.email ?? ""),
        role: String(p.role ?? "user"),
        cargo: String(p.cargo ?? ""),
        aprovador: Boolean(p.aprovador),
        pacoteiro: Boolean(p.pacoteiro),
      });
      setPermissoesContaIds((p.permissoes_conta_ids as string[] | null) ?? []);
      const compIds = ((p.company_access_ids as string[] | null) ?? []).map(String);
      setCompanyIds(compIds);
      // infere grupo único das empresas marcadas
      const possibleGroupIds = Array.from(
        new Set(compIds
          .map(cid => companies.find(c => String(c.id) === cid)?.group_id)
          .filter((gid): gid is string => !!gid))
      );
      setGroupId(possibleGroupIds.length === 1 ? String(possibleGroupIds[0]) : "");
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id, companies.length]);

  // Aplica empresas ao escolher grupo
  function applyGroupCompanies(sel: string) {
    const newGroupId = sel === GROUP_NONE ? "" : sel;
    setGroupId(newGroupId);
    if (!newGroupId) return; // limpou grupo -> mantém manual
    const ids = companies.filter(c => String(c.group_id || "") === newGroupId).map(c => String(c.id));
    setCompanyIds(ids);
  }

  const visibleCompanies = groupId ? companies.filter(c => String(c.group_id || "") === groupId) : companies;
  const handleChange = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();
    const missingEmail = !isEdit && !form.email.trim();
    if (!form.first_name.trim() || !form.last_name.trim() || missingEmail || !form.role.trim() || !form.cargo.trim()) {
      toast({ title: "Campos obrigatórios", description: isEdit ? "Informe nome, sobrenome, cargo e permissão." : "Informe nome, sobrenome, e-mail, cargo e permissão.", variant: "destructive" });
      return;
    }
    if (companyIds.length === 0) { toast({ title: "Selecione ao menos uma empresa", variant: "destructive" }); return; }

    setSaving(true);
    try {
      if (isEdit && id) {
        const { error } = await supabase.from("profiles").update({
          first_name: form.first_name, last_name: form.last_name, role: form.role,
          aprovador: form.aprovador, pacoteiro: form.pacoteiro, cargo: form.cargo,
          permissoes_conta_ids: permissoesContaIds, company_access_ids: companyIds,
        }).eq("id", String(id));
        if (error) throw error;
        toast({ title: "Usuário atualizado" });
        navigate("/usuarios");
        return;
      }

      const tempPassword =
        Array.from(crypto.getRandomValues(new Uint32Array(4))).map(n => n.toString(36)).join("").slice(0, 16) + "#A9";
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: form.email, password: tempPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: form.first_name, last_name: form.last_name,
            aprovador: form.aprovador, pacoteiro: form.pacoteiro,
            role: form.role, cargo: form.cargo,
            permissoes_conta_ids: permissoesContaIds, company_access_ids: companyIds,
          },
        },
      });
      if (!error && data?.user?.id) {
        try {
          await supabase.from("profiles").update({
            aprovador: form.aprovador, pacoteiro: form.pacoteiro,
            role: form.role, cargo: form.cargo,
            permissoes_conta_ids: permissoesContaIds, company_access_ids: companyIds,
          }).eq("user_id", data.user.id);
        } catch (e) {
          console.warn("[profiles.update pós-signUp] ignorado:", (e as { message?: string })?.message);
        }
      }
      if (error) throw error;
      toast({ title: "Usuário criado", description: "O usuário receberá um e-mail para confirmar o cadastro." });
      navigate("/usuarios");
    } catch (err) {
      const msg = (err as { message?: string })?.message || "Erro ao salvar usuário.";
      toast({ title: "Não foi possível salvar", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const firstCompanyId = companyIds[0] ?? undefined;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{isEdit ? "Editar Usuário" : "Novo Usuário"}</h1>
          <p className="text-muted-foreground">Preencha os dados do usuário</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Voltar</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="first_name">Nome *</Label>
            <Input id="first_name" value={form.first_name} onChange={(e) => handleChange("first_name", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="last_name">Sobrenome *</Label>
            <Input id="last_name" value={form.last_name} onChange={(e) => handleChange("last_name", e.target.value)} required />
          </div>
        </div>

        {!isEdit && (
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
          </div>
        )}

        {/* Grupo */}
        <div>
          <Label htmlFor="grupo">Grupo (opcional)</Label>
          <Select value={groupId || GROUP_NONE} onValueChange={applyGroupCompanies}>
            <SelectTrigger id="grupo"><SelectValue placeholder="Selecione o grupo (opcional)" /></SelectTrigger>
            <SelectContent className="z-50 bg-background">
              <SelectItem value={GROUP_NONE}>Nenhum (limpar)</SelectItem>
              {groups.map((g) => (<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>

        {/* Empresas */}
        <div className="space-y-2">
          <Label>Empresas com acesso {groupId && "(do grupo selecionado)"}</Label>
          <CompanyMultiSelect
            companies={groupId ? companies.filter(c => String(c.group_id || "") === groupId) : companies}
            value={companyIds}
            onChange={setCompanyIds}
            placeholder="Selecione empresas (busca + múltipla)"
          />
        </div>

        {/* Cargo e permissões simples */}
        <div>
          <Label htmlFor="cargo">Cargo *</Label>
          <Select value={form.cargo} onValueChange={(v) => handleChange("cargo", v)}>
            <SelectTrigger id="cargo"><SelectValue placeholder="Selecione o cargo" /></SelectTrigger>
            <SelectContent className="z-50 bg-background">
              {cargoOptions.filter((o) => o?.value).map((o) => (
                <SelectItem key={String(o.value)} value={String(o.value)}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <Label htmlFor="role">Permissão *</Label>
            <Select value={form.role} onValueChange={(v) => handleChange("role", v)}>
              <SelectTrigger id="role"><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="aprovador" checked={form.aprovador} onCheckedChange={(v) => handleChange("aprovador", Boolean(v))} />
            <Label htmlFor="aprovador">Aprovador</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="pacoteiro" checked={form.pacoteiro} onCheckedChange={(v) => handleChange("pacoteiro", Boolean(v))} />
            <Label htmlFor="pacoteiro">Pacoteiro</Label>
          </div>
        </div>

        {/* Permissões do plano de contas */}
        <div className="space-y-2">
          <Label>Permissões do Plano de Contas</Label>
          <PermissoesPlanoContas
            value={permissoesContaIds}
            onChange={setPermissoesContaIds}
            companyId={companyIds[0] ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
