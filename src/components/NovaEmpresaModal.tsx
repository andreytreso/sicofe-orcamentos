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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useCompanyGroups, type CompanyGroup } from "@/hooks/useCompanyGroups";

type CompanyForm = {
  id?: string;
  name: string;
  group_id: string | null;
  status: "active" | "inactive";
};

type Props = {
  /** se `undefined` abre em modo _criar_; caso contrÃ¡rio, _editar_ */
  initialData?: CompanyForm;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** callback para atualizar a lista do React-Query */
  onSuccess?: () => void;
};

export default function NovaEmpresaModal({
  initialData,
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CompanyForm>({
    id: initialData?.id,
    name: initialData?.name ?? "",
    group_id: initialData?.group_id ?? null,
    status: initialData?.status ?? "active",
  });
  const [saving, setSaving] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", code: "" });
  const [savingGroup, setSavingGroup] = useState(false);

  const { data: companyGroups = [], isLoading: loadingGroups } = useCompanyGroups();

  /* se abrir para editar, popula o formulÃ¡rio */
  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        name: initialData.name,
        group_id: initialData.group_id,
        status: initialData.status,
      });
      setCreatingGroup(false);
      setNewGroup({ name: "", code: "" });
    } else if (open) {
      setForm({ id: undefined, name: "", group_id: null, status: "active" });
      setCreatingGroup(false);
      setNewGroup({ name: "", code: "" });
    }
  }, [initialData, open]);

  /* helpers ---------------------------------------------------------------- */

  const toMessage = (e: unknown) =>
    e instanceof Error ? e.message : String(e);

  const handleChange = (field: keyof CompanyForm, value: string | null) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleGroupSelect = (value: string) => {
    if (value === "__create__") {
      setCreatingGroup(true);
      setForm((prev) => ({ ...prev, group_id: null }));
      return;
    }

    setCreatingGroup(false);

    if (value === "none") {
      setForm((prev) => ({ ...prev, group_id: null }));
      return;
    }

    setForm((prev) => ({ ...prev, group_id: value }));
  };

  const cancelNewGroup = () => {
    setCreatingGroup(false);
    setNewGroup({ name: "", code: "" });
  };

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) {
      alert("Informe o nome do grupo.");
      return;
    }

    setSavingGroup(true);
    try {
      const { data, error } = await supabase
        .from("company_groups")
        .insert({
          name: newGroup.name.trim(),
          code: newGroup.code.trim() ? newGroup.code.trim() : null,
        })
        .select("id, name, code, created_at, updated_at")
        .single();

      if (error) throw error;

      const createdGroup: CompanyGroup | null = data
        ? {
            id: data.id,
            name: data.name,
            code: data.code ?? null,
            created_at: data.created_at ?? "",
            updated_at: data.updated_at ?? "",
          }
        : null;

      queryClient.setQueryData<CompanyGroup[]>(['company-groups'], (old = []) => {
        if (!createdGroup) return old;
        const already = old.some((group) => group.id === createdGroup.id);
        return already ? old : [...old, createdGroup].sort((a, b) => a.name.localeCompare(b.name));
      });
      queryClient.invalidateQueries({ queryKey: ['company-groups'] });

      setForm((prev) => ({ ...prev, group_id: createdGroup?.id ?? null }));
      setCreatingGroup(false);
      setNewGroup({ name: "", code: "" });
    } catch (err) {
      alert(toMessage(err));
    } finally {
      setSavingGroup(false);
    }
  };

  /* submit ----------------------------------------------------------------- */

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!form.name.trim()) return alert("Nome Ã© obrigatÃ³rio.");

    setSaving(true);
    try {
      const { id, ...payload } = form;

      const { error } = id
        ? await supabase.from("companies").update(payload).eq("id", id)
        : await supabase.from("companies").insert(payload);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["companies"] });
      onSuccess?.();
      onOpenChange(false);
    } catch (err) {
      alert(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const selectedGroupValue = creatingGroup
    ? "__create__"
    : form.group_id ?? "none";

  /* ----------------------------------------------------------------------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-wrapper">
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title">
            {form.id ? "Editar Empresa" : "Nova Empresa"}
          </DialogTitle>
          <DialogDescription className="modal-desc">
            Preencha os dados abaixo
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
            <div className="space-y-2">
              <Label htmlFor="group_id">Grupo</Label>
              <Select
                value={selectedGroupValue}
                onValueChange={handleGroupSelect}
                disabled={loadingGroups || savingGroup}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingGroups ? "Carregando grupos..." : "Selecionar grupo"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem grupo</SelectItem>
                  {companyGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.code ? `${group.name} (${group.code})` : group.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="__create__">+ Cadastrar novo grupo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  handleChange("status", v as "active" | "inactive")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {creatingGroup && (
            <div className="space-y-4 rounded-md border border-dashed border-muted-foreground/40 p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="new_group_name">Nome do grupo *</Label>
                  <Input
                    id="new_group_name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do grupo"
                  />
                </div>
                <div>
                  <Label htmlFor="new_group_code">CÃ³digo (opcional)</Label>
                  <Input
                    id="new_group_code"
                    value={newGroup.code}
                    onChange={(e) => setNewGroup((prev) => ({ ...prev, code: e.target.value }))}
                    placeholder="CÃ³digo interno"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelNewGroup}
                  disabled={savingGroup}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateGroup}
                  disabled={savingGroup}
                >
                  {savingGroup && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar novo grupo
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="modal-footer">
            <DialogClose asChild>
              <Button variant="outline" type="button" disabled={saving}>
                Cancelar
              </Button>
            </DialogClose>

            <Button type="submit" disabled={saving || savingGroup}>
              {(saving || savingGroup) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}