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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess?: () => void;
}

export default function NovoUsuarioModal({ open, onOpenChange, onSuccess }: Props) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    aprovador: false,
    pacoteiro: false,
    role: "user",
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof typeof form, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value as any }));

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      return alert("Email e senha são obrigatórios.");
    }

    setSaving(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            first_name: form.first_name,
            last_name: form.last_name,
            aprovador: form.aprovador,
            pacoteiro: form.pacoteiro,
            role: form.role,
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
            })
            .eq("user_id", data.user.id);
        } catch {
          // ignore profile update errors
        }
      }
      if (error) throw error;
      onSuccess?.();
      onOpenChange(false);
      alert("Usuário criado. O usuário receberá um email para confirmar o cadastro.");
    } catch (err: any) {
      alert(err?.message || "Erro ao criar usuário.");
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
              <Label htmlFor="first_name">Nome</Label>
              <Input id="first_name" value={form.first_name} onChange={(e) => handleChange("first_name", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="last_name">Sobrenome</Label>
              <Input id="last_name" value={form.last_name} onChange={(e) => handleChange("last_name", e.target.value)} />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Senha *</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => handleChange("password", e.target.value)} required />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <Label htmlFor="role">Permissão (role)</Label>
              <Select value={form.role} onValueChange={(v) => handleChange("role", v)}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecione a permissão" />
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
