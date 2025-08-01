import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

function toMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  try { return JSON.stringify(e); } catch { return String(e); }
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function NovaEmpresaModal({ open, onOpenChange, onSuccess }: Props) {
  const [name, setName] = useState("");
  const [grupo, setGrupo] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  async function handleSave(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    if (!name.trim() || !grupo.trim()) return;

    setSaving(true);
    try {
      // 1) garantir que está logado
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) {
        throw new Error("Faça login para criar a empresa.");
      }

      // 2) inserir na companies (trigger cria vínculo admin)
      const { error: e1 } = await supabase
        .from("companies")
        .insert({ name, grupo, status });
      if (e1) throw e1;

      // 3) atualizar lista e fechar
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      onSuccess?.();
      onOpenChange(false);

      // 4) reset
      setName("");
      setGrupo("");
      setStatus("active");
    } catch (err: unknown) {
      alert(toMessage(err) || "Erro ao salvar empresa.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white max-w-5xl max-h-[90vh] overflow-y-auto border-0 shadow-lg sm:rounded-lg p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-gray-700">Nova Empresa</DialogTitle>
          <DialogDescription className="text-gray-700">
            Preencha os dados abaixo para criar uma nova empresa
          </DialogDescription>
        </DialogHeader>

        {/* Corpo como <form> para suportar Enter */}
        <form onSubmit={handleSave} className="px-6 pb-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name" className="text-gray-700">Nome</Label>
              <Input
                id="name"
                placeholder="Ex.: Sicofe Loja 1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
                required
                className="
                  bg-white border border-gray-200
                  text-gray-900 placeholder:text-gray-400
                  focus:bg-white focus-visible:bg-white
                  focus:outline-none focus-visible:outline-none
                  focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0
                "
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="grupo" className="text-gray-700">Grupo</Label>
              <Input
                id="grupo"
                placeholder="Ex.: Sicofe"
                value={grupo}
                onChange={(e) => setGrupo(e.target.value)}
                autoComplete="off"
                required
                className="
                  bg-white border border-gray-200
                  text-gray-900 placeholder:text-gray-400
                  focus:bg-white focus-visible:bg-white
                  focus:outline-none focus-visible:outline-none
                  focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0
                "
              />
            </div>

            <div>
              <Label className="text-gray-700">Status</Label>
              <Select
                value={status}
                onValueChange={(v: "active" | "inactive") => setStatus(v)}
              >
                <SelectTrigger className="bg-white border border-gray-200 text-gray-900 focus:ring-0 focus-visible:ring-sicofe-blue focus-visible:ring-2 focus-visible:outline-none">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 text-gray-900
                                          focus:outline-none focus-visible:outline-none
                                          focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0">
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-6 px-0">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                disabled={saving}
              >
                Cancelar
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={saving || !name.trim() || !grupo.trim()}
              className="bg-primary hover:bg-primary/90 text-white"
              style={{ backgroundColor: '#0047FF' }} // use se quiser travar o tom
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
