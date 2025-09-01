import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export type CompanyForm = {
  id?: string;
  name: string;
  grupo: string | null;
  status: 'active' | 'inactive';
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: CompanyForm;  
  onSuccess?: () => void;
};


const EMPTY: CompanyForm = {
  name: "",
  grupo: null,
  status: "active",
};

function toMessage(e: unknown) {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try { return JSON.stringify(e); } catch { return "Erro desconhecido"; }
}

export default function NovaEmpresaModal({ open, onOpenChange, initialData, onSuccess }: Props) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<CompanyForm>(EMPTY);

  // sempre que abrir/editar, sincroniza o formulário
  useEffect(() => {
    if (!open) return; // só reseta ao abrir
    setForm(initialData ? { ...initialData } : { ...EMPTY });
  }, [open, initialData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        grupo: form.grupo,
        status: form.status,
      };

      if (form.id) {
        const { error } = await supabase.from("companies").update(payload).eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("companies").insert(payload);
        if (error) throw error;
      }

      onSuccess?.();
      // feche SEM desmontar imediatamente; quem controla é o pai
      onOpenChange(false);
    } catch (err) {
      alert(toMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-5xl max-h-[90vh] overflow-y-auto border-0 shadow-lg sm:rounded-lg p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-gray-700">{form.id ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
          <DialogDescription className="text-gray-700">
            Preencha os dados abaixo e clique em salvar
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">Nome *</Label>
            <Input
              id="name"
              placeholder="Ex.: Sicofe Loja 1"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoComplete="off"
              required
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="grupo" className="text-gray-700">Grupo</Label>
              <Input
                id="grupo"
                placeholder="Ex.: Sicofe"
                value={form.grupo ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, grupo: e.target.value || null }))}
                autoComplete="off"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v: "active" | "inactive") => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger className="bg-white border border-gray-200 text-gray-900 focus:ring-0 focus-visible:ring-2">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-white text-gray-900 border border-gray-200">
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-6">
            <Button
              type="button"
              variant="outline"
              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
