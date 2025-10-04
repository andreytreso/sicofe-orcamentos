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
import { Loader2, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useCompanyGroups } from "@/hooks/useCompanyGroups";
import { toast } from "@/hooks/use-toast";

type CompanyForm = {
  id?: string;
  name: string;
  group_id: string | null;
  status: "active" | "inactive";
};

type Props = {
  /** se `undefined` abre em modo _criar_; caso contrário, _editar_ */
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
  const { data: groups = [], isLoading: loadingGroups } = useCompanyGroups();

  const [form, setForm] = useState<CompanyForm>({
    id: initialData?.id,
    name: initialData?.name ?? "",
    group_id: initialData?.group_id ?? null,
    status: initialData?.status ?? "active",
  });
  const [saving, setSaving] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  /* se abrir para editar, popula o formulário */
  useEffect(() => {
    if (initialData) {
      setForm({
        id: initialData.id,
        name: initialData.name,
        group_id: initialData.group_id,
        status: initialData.status,
      });
    }
  }, [initialData]);

  /* helpers ---------------------------------------------------------------- */

  const toMessage = (e: unknown) =>
    e instanceof Error ? e.message : String(e);

  const handleChange = (field: keyof CompanyForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  /* criar novo grupo ------------------------------------------------------- */

  async function handleCreateGroup() {
    if (!newGroupName.trim()) {
      toast({
        title: "Erro",
        description: "Nome do grupo é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setCreatingGroup(true);
    try {
      const { data, error } = await supabase
        .from("company_groups")
        .insert({ name: newGroupName })
        .select()
        .single();

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["company-groups"] });
      setForm((prev) => ({ ...prev, group_id: data.id }));
      setShowNewGroup(false);
      setNewGroupName("");
      
      toast({
        title: "Sucesso",
        description: "Grupo criado com sucesso!",
        className: "bg-success text-success-foreground",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: toMessage(err),
        variant: "destructive",
      });
    } finally {
      setCreatingGroup(false);
    }
  }

  /* submit ----------------------------------------------------------------- */

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!form.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { id, ...payload } = form;

      const { error } = id
        ? await supabase.from("companies").update(payload).eq("id", id)
        : await supabase.from("companies").insert(payload);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["user-companies"] });
      onSuccess?.();
      onOpenChange(false);
      
      toast({
        title: "Sucesso",
        description: id ? "Empresa atualizada com sucesso!" : "Empresa criada com sucesso!",
        className: "bg-success text-success-foreground",
      });
    } catch (err) {
      toast({
        title: "Erro",
        description: toMessage(err),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }

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

          <div>
            <Label>Grupo</Label>
            {showNewGroup ? (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <div>
                  <Label htmlFor="new_group_name" className="text-xs">Nome do Grupo *</Label>
                  <Input
                    id="new_group_name"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="Digite o nome do grupo"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateGroup}
                    disabled={creatingGroup}
                  >
                    {creatingGroup && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Criar Grupo
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowNewGroup(false);
                      setNewGroupName("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Select
                  value={form.group_id || "none"}
                  onValueChange={(v) => handleChange("group_id", v === "none" ? "" : v)}
                  disabled={loadingGroups}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem grupo</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name} {group.code ? `(${group.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setShowNewGroup(true)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Novo Grupo
                </Button>
              </div>
            )}
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

          <DialogFooter className="modal-footer">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </DialogClose>

            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
