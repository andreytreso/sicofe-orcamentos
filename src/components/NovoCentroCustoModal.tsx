import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Evitar value="" em SelectItem (Radix quebra). Usamos este sentinel.
const CLEAR_VALUE = "__CLEAR__" as const;

type Company = { id: string; name: string | null; group_id: string | null };
type Group = { id: string; name: string | null };

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
  initialData?: { id: string; name?: string | null; status?: "ativo" | "inativo" | null; company_id?: string | null };
};

export default function NovoCentroCustoModal({ open, onOpenChange, onSuccess, initialData }: Props) {
  const { toast } = useToast();
  const isEdit = Boolean(initialData?.id);

  const [saving, setSaving] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);

  const [form, setForm] = useState({
    name: "",
    group_id: "", // string vazia no estado é OK (não usar em SelectItem)
    company_id: "",
    status: "ativo" as "ativo" | "inativo",
  });

  // Carrega dados ao abrir
  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const [g, c] = await Promise.all([
          supabase.from("company_groups").select("id,name").order("name", { ascending: true }),
          supabase.from("companies").select("id,name,group_id").order("name", { ascending: true }),
        ]);

        if (g.error) throw g.error;
        if (c.error) throw c.error;

        setGroups(g.data ?? []);
        setCompanies((c.data ?? []) as Company[]);

        if (isEdit && initialData) {
          const comp = (c.data ?? []).find((x) => x.id === initialData.company_id) as Company | undefined;
          setForm({
            name: initialData.name ?? "",
            group_id: comp?.group_id ?? "",
            company_id: initialData.company_id ?? "",
            status: (initialData.status ?? "ativo") as "ativo" | "inativo",
          });
        } else {
          setForm({ name: "", group_id: "", company_id: "", status: "ativo" });
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Erro ao salvar.";
        toast({ title: "Erro ao carregar dados", description: msg, variant: "destructive" });
      }
    })();
  }, [open, isEdit, initialData, toast]);

  // Filtra empresas pelo grupo (se houver)
  const filteredCompanies = useMemo(() => {
    if (!form.group_id) return companies;
    return companies.filter((c) => c.group_id === form.group_id);
  }, [companies, form.group_id]);

  const handleGroupChange = (v: string) => {
    const gid = v === CLEAR_VALUE ? "" : v; // sentinel -> limpa
    setForm((p) => ({ ...p, group_id: gid, company_id: "" })); // ao mudar grupo, limpa empresa
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.name.trim() || !form.company_id) {
      toast({ title: "Campos obrigatórios", description: "Informe o nome e selecione a empresa.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (isEdit && initialData) {
        const { error } = await supabase
          .from("cost_centers")
          .update({ name: form.name.trim(), company_id: form.company_id, status: form.status })
          .eq("id", initialData.id);
        if (error) throw error;
        toast({ title: "Centro de custo atualizado" });
      } else {
        // `code` é obrigatório no schema atual → geramos automaticamente
        const genCode = `CC-${Date.now()}`;
        const { error } = await supabase
          .from("cost_centers")
          .insert({ code: genCode, name: form.name.trim(), company_id: form.company_id, status: form.status });
        if (error) throw error;
        toast({ title: "Centro de custo criado" });
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao salvar.";
      toast({ title: "Não foi possível salvar", description: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-wrapper">
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title">{isEdit ? "Editar Centro de Custo" : "Novo Centro de Custo"}</DialogTitle>
          <DialogDescription className="modal-desc">Informe os dados do centro de custo</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as "ativo" | "inativo" }))}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="group">Grupo (opcional)</Label>
              <Select
                // evita value="" no Select controlado
                value={form.group_id ? form.group_id : CLEAR_VALUE}
                onValueChange={handleGroupChange}
              >
                <SelectTrigger id="group">
                  <SelectValue placeholder="Nenhum (limpar)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CLEAR_VALUE}>Nenhum (limpar)</SelectItem>
                  {groups.map((g) => (
                    <SelectItem key={g.id} value={g.id!}>
                      {g.name || "Sem nome"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="company">Empresa *</Label>
              <Select
                // aqui podemos usar undefined para exibir o placeholder quando vazio
                value={form.company_id || undefined}
                onValueChange={(v) => setForm((p) => ({ ...p, company_id: v }))}
              >
                <SelectTrigger id="company">
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCompanies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name || "Sem nome"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="modal-footer">
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
