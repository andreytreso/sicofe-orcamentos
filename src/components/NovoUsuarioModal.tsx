import { useState, useEffect, FormEvent } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import PermissoesPlanoContas from "@/components/PermissoesPlanoContas";
import { useCompanies } from "@/hooks/useCompanies";
import { cn } from "@/lib/utils";

type CompanyRow = {
  id: string | number;
  name: string;
  group_id?: string | null;
};

type GroupOpt = { id: string; name: string };

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
  initialData?: {
    id: string;
    user_id: string;
    first_name?: string | null;
    last_name?: string | null;
    role?: string | null;
    aprovador?: boolean | null;
    pacoteiro?: boolean | null;
    cargo?: string | null;
    email?: string | null;
    permissoes_conta_ids?: string[] | null;
    company_access_ids?: string[] | null;
  };
}

const GROUP_NONE = "__none__";

/* -------------------------- MultiSelect de Empresas -------------------------- */
function CompanyMultiSelect({
  companies,
  value,
  onChange,
  disabled,
  placeholder = "Selecionar empresas",
}: {
  companies: CompanyRow[];
  value: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const toggle = (id: string) => {
    onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  };

  const allVisibleSelected = companies.length > 0 && companies.every((c) => value.includes(String(c.id)));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-between"
          disabled={disabled}
        >
          {value.length > 0
            ? `${value.length} empresa(s) selecionada(s)`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[min(560px,90vw)] p-0">
        <Command>
          <div className="p-2">
            <CommandInput placeholder="Buscar empresa..." />
          </div>
          <CommandList>
            <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>

            <CommandGroup heading="Ações">
              <CommandItem
                disabled={companies.length === 0}
                onSelect={() =>
                  onChange(allVisibleSelected ? [] : companies.map((c) => String(c.id)))
                }
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    allVisibleSelected ? "opacity-100" : "opacity-0"
                  )}
                />
                {allVisibleSelected ? "Limpar todas" : "Selecionar todas mostradas"}
              </CommandItem>
            </CommandGroup>

            <CommandGroup heading="Empresas">
              {companies.map((c) => {
                const id = String(c.id);
                const selected = value.includes(id);
                return (
                  <CommandItem key={id} onSelect={() => toggle(id)} value={`${c.name} ${id}`}>
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected ? "opacity-100" : "opacity-0"
                      )}
                    />
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
/* --------------------------------------------------------------------------- */

export default function NovoUsuarioModal({ open, onOpenChange, onSuccess, initialData }: Props) {
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", role: "user", cargo: "", aprovador: false, pacoteiro: false,
  });
  const [saving, setSaving] = useState(false);
  const [permissoesContaIds, setPermissoesContaIds] = useState<string[]>([]);
  const { data: companiesData = [] } = useCompanies();
  const companies: CompanyRow[] = (companiesData as CompanyRow[]).filter(
    (c) => c && c.id != null && String(c.id) !== "" && c.name && String(c.name).trim() !== ""
  );
  const { toast } = useToast();

  // Grupo + empresas
  const [groups, setGroups] = useState<GroupOpt[]>([]);
  const [groupId, setGroupId] = useState<string>("");       // UUID do grupo (ou "")
  const [companyIds, setCompanyIds] = useState<string[]>([]); // empresas selecionadas

  // Tipinho só para o que precisamos
type GroupRowLite = { id: string | number; name: string };

useEffect(() => {
  if (!open) return;
  (async () => {
    // usa 'unknown' para não violar o no-explicit-any
    const resp = (await (
      (supabase as unknown as {
        from: (t: string) => {
          select: (cols: string) => {
            order: (
              col: string,
              opts: { ascending: boolean }
            ) => Promise<{ data: unknown; error: { message: string } | null }>;
          };
        };
      })
        .from("company_groups")
        .select("id,name")
        .order("name", { ascending: true })
    )) as { data: unknown; error: { message: string } | null };

    if (resp.error) {
      console.warn("[company_groups] load error:", resp.error.message);
      return;
    }

    const rows = (resp.data ?? []) as GroupRowLite[];
    setGroups(rows.map(r => ({ id: String(r.id), name: String(r.name) })));
  })();
}, [open]);


  useEffect(() => {
    if (open && initialData) {
      setForm({
        first_name: initialData.first_name ?? "",
        last_name: initialData.last_name ?? "",
        email: initialData.email ?? "",
        role: initialData.role ?? "user",
        cargo: initialData.cargo ?? "",
        aprovador: Boolean(initialData.aprovador),
        pacoteiro: Boolean(initialData.pacoteiro),
      });
      setPermissoesContaIds(initialData.permissoes_conta_ids ?? []);
      setCompanyIds((initialData.company_access_ids ?? []).map(String));

      // tenta inferir um grupo único pelas empresas selecionadas
      const possibleGroupIds = Array.from(
        new Set(
          (initialData.company_access_ids ?? [])
            .map((id) => companies.find((c) => String(c.id) === String(id))?.group_id)
            .filter((gid): gid is string => !!gid)
        )
      );
      setGroupId(possibleGroupIds.length === 1 ? String(possibleGroupIds[0]) : "");
    } else if (!open) {
      setForm({ first_name: "", last_name: "", email: "", role: "user", cargo: "", aprovador: false, pacoteiro: false });
      setPermissoesContaIds([]);
      setCompanyIds([]);
      setGroupId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialData, companies.length]);

  // Aplica empresas do grupo escolhido
  function applyGroupCompanies(sel: string) {
    const newGroupId = sel === GROUP_NONE ? "" : sel;
    setGroupId(newGroupId);
    if (!newGroupId) return; // limpou grupo → mantém seleção manual
    const ids = companies.filter((c) => String(c.group_id || "") === newGroupId).map((c) => String(c.id));
    setCompanyIds(ids);
  }

  // Empresas visíveis conforme grupo
  const visibleCompanies = groupId
    ? companies.filter((c) => String(c.group_id || "") === groupId)
    : companies;

  const handleChange = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e?: FormEvent) {
    e?.preventDefault();

    const isEdit = Boolean(initialData?.id);
    const missingEmail = !isEdit && !form.email.trim();
    if (!form.first_name.trim() || !form.last_name.trim() || missingEmail || !form.role.trim() || !form.cargo.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: isEdit ? "Informe nome, sobrenome, cargo e permissão."
                            : "Informe nome, sobrenome, e-mail, cargo e permissão.",
        variant: "destructive",
      });
      return;
    }
    if (companyIds.length === 0) {
      toast({ title: "Selecione ao menos uma empresa", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (isEdit && initialData) {
        const { error } = await supabase
          .from("profiles")
          .update({
            first_name: form.first_name,
            last_name: form.last_name,
            role: form.role,
            aprovador: form.aprovador,
            pacoteiro: form.pacoteiro,
            cargo: form.cargo,
            permissoes_conta_ids: permissoesContaIds,
            company_access_ids: companyIds,
          })
          .eq("id", initialData.id);
        if (error) throw error;

        onSuccess?.();
        onOpenChange(false);
        toast({ title: "Usuário atualizado", description: "As alterações foram salvas." });
        return;
      }

      const tempPassword =
        Array.from(crypto.getRandomValues(new Uint32Array(4))).map((n) => n.toString(36)).join("").slice(0, 16) + "#A9";
      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: tempPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: form.first_name,
            last_name: form.last_name,
            aprovador: form.aprovador,
            pacoteiro: form.pacoteiro,
            role: form.role,
            cargo: form.cargo,
            permissoes_conta_ids: permissoesContaIds,
            company_access_ids: companyIds,
          },
        },
      });

      if (!error && data?.user?.id) {
        try {
          await supabase
            .from("profiles")
            .update({
              aprovador: form.aprovador,
              pacoteiro: form.pacoteiro,
              role: form.role,
              cargo: form.cargo,
              permissoes_conta_ids: permissoesContaIds,
              company_access_ids: companyIds,
            })
            .eq("user_id", data.user.id);
        } catch (e) {
          console.warn("[profiles.update pós-signUp] ignorado:", (e as { message?: string })?.message);
        }
      }
      if (error) throw error;

      onSuccess?.();
      onOpenChange(false);
      toast({ title: "Usuário criado", description: "O usuário receberá um e-mail para confirmar o cadastro." });
    } catch (err) {
      const msg = (err as { message?: string })?.message || "Erro ao salvar usuário.";
      toast({ title: "Não foi possível salvar", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  const firstCompanyId = companyIds[0] ?? undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-wrapper z-50">
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title">{initialData ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          <DialogDescription className="modal-desc">Preencha os dados do usuário</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          {/* Nome / Sobrenome */}
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

          {/* Email (apenas criação) */}
          {!initialData && (
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
            </div>
          )}

          {/* Grupo (opcional) — nomes corretos a partir de company_groups */}
          <div>
            <Label htmlFor="grupo">Grupo (opcional)</Label>
            <Select
              value={groupId || GROUP_NONE}
              onValueChange={applyGroupCompanies}
            >
              <SelectTrigger id="grupo">
                <SelectValue placeholder="Selecione o grupo (opcional)" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                <SelectItem value={GROUP_NONE}>Nenhum (limpar)</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Empresas — Multi-select com busca, filtrado pelo grupo */}
          <div className="space-y-2">
            <Label>Empresas com acesso {groupId && "(do grupo selecionado)"}</Label>
            <CompanyMultiSelect
              companies={visibleCompanies}
              value={companyIds}
              onChange={setCompanyIds}
              placeholder="Selecione empresas (busca + múltipla)"
            />
          </div>

          {/* Cargo */}
          <div>
            <Label htmlFor="cargo">Cargo *</Label>
            <Select value={form.cargo} onValueChange={(v) => handleChange("cargo", v)}>
              <SelectTrigger id="cargo">
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent className="z-50 bg-background">
                {cargoOptions
                  .filter((opt) => opt?.value && String(opt.value).trim() !== "")
                  .map((opt) => (
                    <SelectItem key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Permissões simples */}
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <Label htmlFor="role">Permissão *</Label>
              <Select value={form.role} onValueChange={(v) => handleChange("role", v)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
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

          {/* Permissões do Plano de Contas */}
          <div className="space-y-2">
            <Label>Permissões do Plano de Contas</Label>
            <PermissoesPlanoContas
              value={permissoesContaIds}
              onChange={setPermissoesContaIds}
              companyId={firstCompanyId}
            />
          </div>

          <DialogFooter className="modal-footer">
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={saving || companyIds.length === 0}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
