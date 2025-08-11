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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
  initialData?: {
    id: string;
    user_id: string;
    first_name?: string | null;
    last_name?: string | null;
    role?: string | null;
    aprovador?: boolean | null;
    pacoteiro?: boolean | null;
    cargo?: string | null;
    email?: string | null;
  };
}

export default function NovoUsuarioModal({ open, onOpenChange, onSuccess, initialData }: Props) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "user",
    cargo: "",
    aprovador: false,
    pacoteiro: false,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && initialData) {
      setForm({
        first_name: initialData.first_name ?? "",
        last_name: initialData.last_name ?? "",
        email: initialData.email ?? "",
        role: initialData.role ?? "user",
        cargo: initialData.cargo ?? "",
        aprovador: Boolean(initialData.aprovador),
        pacoteiro: Boolean(initialData.pacoteiro),
      });
    } else if (!open) {
      // reset when closing
      setForm({ first_name: "", last_name: "", email: "", role: "user", cargo: "", aprovador: false, pacoteiro: false });
    }
  }, [open, initialData]);

  const handleChange = (field: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value as any }));

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    const isEdit = Boolean(initialData?.id);
    const missingEmail = !isEdit && !form.email.trim();

    if (!form.first_name.trim() || !form.last_name.trim() || missingEmail || !form.role.trim() || !form.cargo.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: isEdit
          ? "Informe nome, sobrenome, cargo e permissão."
          : "Informe nome, sobrenome, e-mail, cargo e permissão.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (isEdit && initialData) {
        const { error } = await supabase
          .from("profiles")
          .update({
            first_name: form.first_name,
            last_name: form.last_name,
            role: form.role,
            aprovador: form.aprovador,
            pacoteiro: form.pacoteiro,
            cargo: form.cargo,
          })
          .eq("id", initialData.id);

        if (error) throw error;

        onSuccess?.();
        onOpenChange(false);
        toast({ title: "Usuário atualizado", description: "As alterações foram salvas." });
        return;
      }

      // Criação de usuário: gera senha temporária forte (não exibida ao usuário)
      const tempPassword = Array.from(crypto.getRandomValues(new Uint32Array(4)))
        .map((n) => n.toString(36))
        .join("")
        .slice(0, 16) + "#A9";

      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: tempPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: form.first_name,
            last_name: form.last_name,
            aprovador: form.aprovador,
            pacoteiro: form.pacoteiro,
            role: form.role,
            cargo: form.cargo,
          },
        },
      });

      if (!error && data?.user?.id) {
        try {
          await supabase
            .from("profiles")
            .update({
              aprovador: form.aprovador,
              pacoteiro: form.pacoteiro,
              role: form.role,
              cargo: form.cargo,
            })
            .eq("user_id", data.user.id);
        } catch {
          // ignore profile update errors
        }
      }
      if (error) throw error;
      onSuccess?.();
      onOpenChange(false);
      toast({
        title: "Usuário criado",
        description: "O usuário receberá um e-mail para confirmar o cadastro.",
      });
    } catch (err: any) {
      let description = err?.message || "Erro ao salvar usuário.";
      const lower = String(description).toLowerCase();
      if (lower.includes("breach") || lower.includes("exposed") || lower.includes("leaked")) {
        description = "Senha comprometida. Escolha uma senha forte e única (letras, números e símbolos).";
      } else if (lower.includes("already") || lower.includes("exists")) {
        description = "Já existe um usuário com este e-mail.";
      } else if (lower.includes("weak") || lower.includes("short")) {
        description = "Senha fraca. Use pelo menos 8 caracteres com variedade.";
      }
      toast({ title: "Não foi possível salvar", description, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-wrapper">
        <DialogHeader className="modal-header">
          <DialogTitle className="modal-title">Novo Usuário</DialogTitle>
          <DialogDescription className="modal-desc">
            Preencha os dados do novo usuário
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="first_name">Nome *</Label>
              <Input id="first_name" value={form.first_name} onChange={(e) => handleChange("first_name", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="last_name">Sobrenome *</Label>
              <Input id="last_name" value={form.last_name} onChange={(e) => handleChange("last_name", e.target.value)} required />
            </div>
          </div>

          {!initialData && (
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
            </div>
          )}

          <div>
            <Label htmlFor="cargo">Cargo *</Label>
            <Input id="cargo" value={form.cargo} onChange={(e) => handleChange("cargo", e.target.value)} required />
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <Label htmlFor="role">Permissão *</Label>
              <Select value={form.role} onValueChange={(v) => handleChange("role", v)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="aprovador" checked={form.aprovador} onCheckedChange={(v) => handleChange("aprovador", Boolean(v))} />
              <Label htmlFor="aprovador">Aprovador</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="pacoteiro" checked={form.pacoteiro} onCheckedChange={(v) => handleChange("pacoteiro", Boolean(v))} />
              <Label htmlFor="pacoteiro">Pacoteiro</Label>
            </div>
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
