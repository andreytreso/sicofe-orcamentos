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
import { useCompanyGroups, useCompaniesByGroup } from "@/hooks/useCompanyGroups";
import { toast } from "sonner";

type SupplierStatus = "ativo" | "inativo";
type SupplierScope = "company" | "group";

interface Props {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onSuccess?: () => void;
  initialData?: {
    id: string;
    name: string;
    cnpj: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
    status: SupplierStatus | string | null;
    company_id: string | null;
    group_id: string | null;
  };
}

interface FormState {
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: string;
  status: SupplierStatus;
  scope: SupplierScope;
  company_id: string;
  group_id: string;
}

const defaultForm: FormState = {
  name: "",
  cnpj: "",
  email: "",
  phone: "",
  address: "",
  status: "ativo",
  scope: "company",
  company_id: "",
  group_id: "",
};

export default function NovoFornecedorModal({ open, onOpenChange, onSuccess, initialData }: Props) {
  const queryClient = useQueryClient();
  const { data: companies = [] } = useUserCompanies();
  const { data: companyGroups = [] } = useCompanyGroups();

  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);

  const { data: companiesInGroup = [] } = useCompaniesByGroup(
    form.scope === "group" ? form.group_id : null
  );

  const isEditing = Boolean(initialData?.id);

  useEffect(() => {
    if (!open) {
      setForm(defaultForm);
      setSaving(false);
      return;
    }

    if (initialData) {
      const scope: SupplierScope = initialData.group_id && !initialData.company_id ? "group" : "company";
      setForm({
        name: initialData.name ?? "",
        cnpj: initialData.cnpj ?? "",
        email: initialData.email ?? "",
        phone: initialData.phone ?? "",
        address: initialData.address ?? "",
        status: (initialData.status === "inativo" ? "inativo" : "ativo"),
        scope,
        company_id: initialData.company_id ?? "",
        group_id: initialData.group_id ?? "",
      });
    } else {
      setForm(defaultForm);
    }
  }, [open, initialData]);

  const handleChange = (field: keyof FormState, value: string | SupplierStatus | SupplierScope) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "scope") {
      if (value === "group") {
        setForm((prev) => ({ ...prev, company_id: "", group_id: "" }));
      } else if (value === "company") {
        setForm((prev) => ({ ...prev, group_id: "" }));
      }
    }
  };

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false;
    if (form.scope === "company" && !form.company_id) return false;
    if (form.scope === "group" && !form.group_id) return false;
    return true;
  }, [form.name, form.scope, form.company_id, form.group_id]);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSubmit) {
      toast.error("Nome e empresa/grupo são obrigatórios.");
      return;
    }

    setSaving(true);
    try {
      const basePayload = {
        name: form.name.trim(),
        cnpj: form.cnpj.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
        status: form.status,
      };

      if (isEditing && initialData?.id) {
        const payload = {
          ...basePayload,
          company_id: form.scope === "company" ? form.company_id : null,
          group_id: form.scope === "group" ? form.group_id : null,
        };

        const { error } = await supabase
          .from('suppliers')
          .update(payload)
          .eq('id', initialData.id);
        if (error) throw error;
        toast.success('Fornecedor atualizado com sucesso!');
      } else {
        const payload = {
          ...basePayload,
          company_id: form.scope === "company" ? form.company_id : null,
          group_id: form.scope === "group" ? form.group_id : null,
        };

        const { error } = await supabase.from('suppliers').insert(payload);
        if (error) throw error;
        toast.success('Fornecedor criado com sucesso!');
      }

      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers_with_details'] });
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      toast.error(message || 'Erro ao salvar fornecedor.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-wrapper">
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title">
            {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </DialogTitle>
          <DialogDescription className="modal-desc">
            Preencha os dados do fornecedor
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          <div>
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input id="cnpj" value={form.cnpj} onChange={(e) => handleChange('cnpj', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="address">Endereço</Label>
              <Input id="address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
            </div>
          </div>

          {!isEditing && (
            <div>
              <Label>Disponibilidade *</Label>
              <Select value={form.scope} onValueChange={(value) => handleChange('scope', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">Empresa individual</SelectItem>
                  <SelectItem value="group">Grupo de empresas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          { (isEditing ? initialData?.company_id !== null : form.scope === "company") && (
            <div>
              <Label>Empresa *</Label>
              <Select
                value={form.company_id}
                onValueChange={(value) => handleChange('company_id', value)}
                disabled={isEditing && initialData?.company_id === null}
              >
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
          )}

          {(isEditing ? initialData?.company_id === null : form.scope === "group") && (
            <div>
              <Label>Grupo *</Label>
              <Select
                value={form.group_id}
                onValueChange={(value) => handleChange('group_id', value)}
                disabled={isEditing && !initialData?.group_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o grupo" />
                </SelectTrigger>
                <SelectContent>
                  {companyGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.scope === "group" && form.group_id && companiesInGroup.length > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Disponível para {companiesInGroup.length} empresa(s) do grupo.
                </p>
              )}
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(value) => handleChange('status', value)}>
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

          <DialogFooter className="modal-footer">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving || !canSubmit}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Atualizar' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
