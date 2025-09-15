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
      toast.error("Todos os campos são obrigatórios");
      return;
    }

    setSaving(true);
    try {
      // Get current user and their first company
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Usuário não autenticado");

      const { data: userCompanies, error: companiesError } = await supabase
        .from('user_company_access')
        .select('company_id')
        .eq('user_id', user.id)
        .limit(1);

      if (companiesError) throw companiesError;
      if (!userCompanies || userCompanies.length === 0) {
        throw new Error("Usuário não tem acesso a nenhuma empresa");
      }

      const { error } = await supabase.from("account_hierarchy_legacy").insert({
        ...form,
        company_id: userCompanies[0].company_id
      });
      
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
            Informe os dados da conta contábil
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          <div>
            <Label htmlFor="level_1">Grupo (Nível 1) *</Label>
            <Input id="level_1" value={form.level_1} onChange={(e) => handleChange("level_1", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="level_2">Subgrupo (Nível 2) *</Label>
            <Input id="level_2" value={form.level_2} onChange={(e) => handleChange("level_2", e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="analytical_account">Conta Analítica *</Label>
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
