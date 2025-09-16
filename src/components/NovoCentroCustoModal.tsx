import { useState, useEffect } from "react";
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
import { useUserCompanies, CompanyWithGroup } from "@/hooks/useCompanies";
import { useCompanyGroups, useCompaniesByGroup } from "@/hooks/useCompanyGroups";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialData?: {
    id?: string;
    name: string;
    status: string;
    company_id?: string;
  };
  onSuccess?: () => void;
}

export default function NovoCentroCustoModal({ open, onOpenChange, initialData, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const { data: companies = [] } = useUserCompanies();
  const { data: companyGroups = [] } = useCompanyGroups();

  const [form, setForm] = useState({
    name: "",
    status: "ativo" as "ativo" | "inativo",
    type: "company" as "company" | "group",
    company_id: "",
    group_id: "",
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (open && initialData) {
      setForm({
        name: initialData.name,
        status: initialData.status as "ativo" | "inativo",
        type: "company",
        company_id: initialData.company_id || "",
        group_id: "",
      });
    } else if (open) {
      resetForm();
    }
  }, [open, initialData]);
  const [saving, setSaving] = useState(false);
  
  const { data: companiesInGroup = [] } = useCompaniesByGroup(
    form.type === "group" ? form.group_id : null
  );

  const handleChange = (field: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const resetForm = () => {
    setForm({
      name: "",
      status: "ativo",
      type: "company",
      company_id: "",
      group_id: "",
    });
  };

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    
    if (!form.name.trim()) {
      toast.error("Nome é obrigatório.");
      return;
    }
    
    if (!initialData && form.type === "company" && !form.company_id) {
      toast.error("Empresa é obrigatória.");
      return;
    }
    
    if (!initialData && form.type === "group" && !form.group_id) {
      toast.error("Grupo é obrigatório.");
      return;
    }

    setSaving(true);
    try {
      if (initialData?.id) {
        // Editing existing cost center
        const payload = {
          name: form.name,
          status: form.status,
        };
        
        const { error } = await supabase
          .from("cost_centers")
          .update(payload)
          .eq("id", initialData.id);
        
        if (error) throw error;
        
        toast.success("Centro de custo atualizado com sucesso!");
      } else if (form.type === "company") {
        // Creating for specific company
        const payload = {
          name: form.name,
          status: form.status,
          company_id: form.company_id,
        };
        
        const { error } = await supabase.from("cost_centers").insert(payload);
        if (error) throw error;
        
        toast.success("Centro de custo criado com sucesso!");
      } else {
        // Creating for all companies in group
        if (companiesInGroup.length === 0) {
          toast.error("Nenhuma empresa encontrada no grupo selecionado.");
          return;
        }
        
        const payloads = companiesInGroup.map(companyId => ({
          name: form.name,
          status: form.status,
          company_id: companyId,
        }));
        
        const { error } = await supabase.from("cost_centers").insert(payloads);
        if (error) throw error;
        
        toast.success(`Centro de custo criado para ${companiesInGroup.length} empresa(s) do grupo!`);
      }
      
      queryClient.invalidateQueries({ queryKey: ["cost_centers"] });
      resetForm();
      onSuccess?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || "Erro ao salvar centro de custo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="modal-wrapper">
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title">
            {initialData ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
          </DialogTitle>
          <DialogDescription className="modal-desc">
            Informe os dados do centro de custo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Tipo - só mostra para criação */}
            {!initialData && (
              <div>
                <Label>Tipo *</Label>
                <Select value={form.type} onValueChange={(v) => handleChange("type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Empresa Individual</SelectItem>
                    <SelectItem value="group">Grupo de Empresas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Empresa/Grupo - só mostra para criação */}
          {!initialData && form.type === "company" && (
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
          )}

          {!initialData && form.type === "group" && (
            <div>
              <Label>Grupo *</Label>
              <Select value={form.group_id} onValueChange={(v) => handleChange("group_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o grupo" />
                </SelectTrigger>
                <SelectContent>
                  {companyGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.group_id && companiesInGroup.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Será criado em {companiesInGroup.length} empresa(s) do grupo
                </p>
              )}
            </div>
          )}

          <DialogFooter className="modal-footer">
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

