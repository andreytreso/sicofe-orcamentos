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

  const [form, setForm] = useState<CompanyForm>({
    id: initialData?.id,
    name: initialData?.name ?? "",
    group_id: initialData?.group_id ?? null,
    status: initialData?.status ?? "active",
  });
  const [saving, setSaving] = useState(false);

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

  /* submit ----------------------------------------------------------------- */

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!form.name.trim()) return alert("Nome é obrigatório.");

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
            <div>
              <Label htmlFor="group_id">Grupo</Label>
              <Input
                id="group_id"
                value={form.group_id || ""}
                onChange={(e) => handleChange("group_id", e.target.value)}
                placeholder="ID do grupo (opcional)"
              />
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
