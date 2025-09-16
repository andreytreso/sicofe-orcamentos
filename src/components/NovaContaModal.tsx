import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}

const normalizeCode = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^A-Za-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "")
  .toUpperCase();

export default function NovaContaModal({ open, onOpenChange, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    level_1: "",
    level_2: "",
    analytical_account: "",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!form.level_1.trim() || !form.level_2.trim() || !form.analytical_account.trim()) {
      toast.error("Todos os campos s√£o obrigat√≥rios");
      return;
    }

    setSaving(true);
    try {
      try {
        // Get current user and their first company
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("Usu·rio n„o autenticado");

        const { data: userCompanies, error: companiesError } = await supabase
          .from('user_company_access')
          .select('company_id')
          .eq('user_id', user.id)
          .limit(1);

        if (companiesError) throw companiesError;
        const companyId = userCompanies?.[0]?.company_id;
        if (!companyId) {
          throw new Error("Usu·rio n„o tem acesso a nenhuma empresa");
        }

        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('group_id')
          .eq('id', companyId)
          .single();

        if (companyError) throw companyError;
        if (!company?.group_id) {
          throw new Error('Empresa n„o possui grupo vinculado');
        }

        const payload = {
          group_id: company.group_id,
          nome_conta_resultado_s1: form.level_1.trim(),
          nome_conta_resultado_s2: form.level_2.trim(),
          nome_conta_resultado_a1: form.analytical_account.trim(),
          cod_conta_resultado_s1: normalizeCode(form.level_1),
          cod_conta_resultado_s2: normalizeCode(form.level_2),
          cod_conta_resultado_a1: normalizeCode(form.analytical_account),
          status: 'active',
          type: 'custom',
        };

        const { error } = await supabase.from('group_chart_of_accounts').insert(payload);
        if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["account-hierarchy"] });
      toast.success("Conta criada com sucesso!");
      
      // Reset form
      setForm({
        level_1: "",
        level_2: "",
        analytical_account: "",
      });
      
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      console.error('Error creating account:', err);
      const message = err instanceof Error ? err.message : String(err);
      toast.error("Erro ao criar conta: " + (message || "Erro desconhecido"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-wrapper">
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title">Nova Conta</DialogTitle>
          <DialogDescription className="modal-desc">
            Informe os dados da conta cont√°bil
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          <div>
            <Label htmlFor="level_1">Grupo (N√≠vel 1) *</Label>
            <Input id="level_1" value={form.level_1} onChange={(e) => handleChange("level_1", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="level_2">Subgrupo (N√≠vel 2) *</Label>
            <Input id="level_2" value={form.level_2} onChange={(e) => handleChange("level_2", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="analytical_account">Conta Anal√≠tica *</Label>
            <Input id="analytical_account" value={form.analytical_account} onChange={(e) => handleChange("analytical_account", e.target.value)} required />
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

