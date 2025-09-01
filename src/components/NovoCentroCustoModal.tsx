import { useEffect, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useUserCompanies } from "@/hooks/useCompanies";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}

export default function NovoCentroCustoModal({ open, onOpenChange, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const { data: companies = [] } = useUserCompanies();

  const [form, setForm] = useState({
    code: "",
    name: "",
    status: "active" as "active" | "inactive",
    company_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!form.code.trim() || !form.name.trim() || !form.company_id) {
      return alert("Código, nome e empresa são obrigatórios.");
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("cost_centers").insert(form);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["cost_centers"] });
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      alert(err?.message || "Erro ao criar centro de custo.");
    } finally {
      setSaving(false);
    }
  }

  // Novo fluxo: gera código automaticamente e envia campos conforme schema
  async function onSubmitForm(e?: React.FormEvent) {
    e?.preventDefault();
    if (!form.name.trim() || !form.company_id) {
      return alert("Nome e empresa são obrigatórios.");
    }

    setSaving(true);
    try {
      let codeToUse = form.code;
      if (!codeToUse) {
        codeToUse = await generateNextCode(form.company_id);
      }

      const payload = {
        code: codeToUse,
        name: form.name.trim(),
        status: form.status,
        company_id: form.company_id,
      } as const;

      const { error } = await supabase.from('cost_centers').insert(payload);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['cost_centers'] });
      onSuccess?.();
      onOpenChange(false);
    } catch (err: any) {
      alert(err?.message || 'Erro ao criar centro de custo.');
    } finally {
      setSaving(false);
    }
  }

  async function generateNextCode(companyId: string) {
    if (!companyId) return '';
    try {
      setGeneratingCode(true);
      const { data, error } = await supabase
        .from('cost_centers')
        .select('code')
        .eq('company_id', companyId)
        .order('code', { ascending: false })
        .limit(1);
      if (error) throw error;
      const lastCode = data?.[0]?.code ?? '000';
      const next = (parseInt(String(lastCode), 10) || 0) + 1;
      return String(next).padStart(3, '0');
    } finally {
      setGeneratingCode(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    (async () => {
      if (form.company_id) {
        const next = await generateNextCode(form.company_id);
        setForm(prev => ({ ...prev, code: next }));
      } else if (companies.length > 0) {
        const first = companies[0];
        setForm(prev => ({ ...prev, company_id: first.id }));
        const next = await generateNextCode(first.id);
        setForm(prev => ({ ...prev, code: next }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open || !form.company_id) return;
    (async () => {
      const next = await generateNextCode(form.company_id);
      setForm(prev => ({ ...prev, code: next }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.company_id]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-wrapper">
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title">Novo Centro de Custo</DialogTitle>
          <DialogDescription className="modal-desc">
            Informe os dados do centro de custo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmitForm} className="px-6 pb-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="code">Código *</Label>
              <Input id="code" value={form.code} disabled readOnly placeholder={generatingCode ? 'gerando...' : ''} />
            </div>
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <Label>Empresa *</Label>
              <Select value={form.company_id} onValueChange={(v) => handleChange("company_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
              <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
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
