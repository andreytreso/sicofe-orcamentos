import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useUserCompanies } from "@/hooks/useCompanies";
import { useCostCenters } from "@/hooks/useCostCenters";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSuccess?: () => void;
  initialData?: {
    id: string;
    name: string;
    group_name: string | null;
    status: "active" | "inactive" | string | null;
    company_id: string;
    cost_center_id: string | null;
  };
}

const defaultForm = {
  name: "",
  group_name: "",
  status: "active" as "active" | "inactive",
  company_id: "",
  cost_center_id: "",
};

export default function NovoColaboradorModal({ open, onOpenChange, onSuccess, initialData }: Props) {
  const queryClient = useQueryClient();
  const { data: companies = [] } = useUserCompanies();
  const isEditing = Boolean(initialData?.id);

  const [form, setForm] = useState(defaultForm);
  const { data: costCenters = [] } = useCostCenters(form.company_id);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(defaultForm);
      setSaving(false);
      return;
    }

    if (initialData) {
      setForm({
        name: initialData.name,
        group_name: initialData.group_name ?? "",
        status: (initialData.status === "inactive" ? "inactive" : "active"),
        company_id: initialData.company_id,
        cost_center_id: initialData.cost_center_id ?? "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [open, initialData]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const canSubmit = useMemo(() => form.name.trim() && form.company_id, [form.name, form.company_id]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSubmit) {
      toast.error("Nome e empresa são obrigatórios.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        group_name: form.group_name.trim() || null,
        status: form.status,
        company_id: form.company_id,
        cost_center_id: form.cost_center_id || null,
      };

      if (isEditing && initialData) {
        const { error } = await supabase
          .from("collaborators")
          .update(payload)
          .eq("id", initialData.id);
        if (error) throw error;
        toast.success("Colaborador atualizado com sucesso!");
      } else {
        const { error } = await supabase.from("collaborators").insert(payload);
        if (error) throw error;
        toast.success("Colaborador criado com sucesso!");
      }
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      queryClient.invalidateQueries({ queryKey: ["collaborators_with_details"] });
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Erro ao salvar colaborador.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-wrapper">
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title">
            {isEditing ? "Editar Colaborador" : "Novo Colaborador"}
          </DialogTitle>
          <DialogDescription className="modal-desc">
            Preencha os dados do colaborador
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="group">Grupo</Label>
              <Input
                id="group"
                value={form.group_name}
                onChange={(e) => handleChange("group_name", e.target.value)}
              />
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

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label>Empresa *</Label>
              <Select value={form.company_id} onValueChange={(v) => handleChange("company_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Centro de Custo</Label>
              <Select
                value={form.cost_center_id}
                onValueChange={(v) => handleChange("cost_center_id", v)}
                disabled={!form.company_id}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      form.company_id ? "Selecione o centro de custo" : "Selecione a empresa primeiro"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {costCenters.map((cc) => (
                    <SelectItem key={cc.id} value={cc.id}>
                      {cc.code ? `${cc.code} - ${cc.name}` : cc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="modal-footer">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
