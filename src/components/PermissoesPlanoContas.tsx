import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  companyId?: string;
  value: string[];                // analíticas selecionadas (como "L1 > L2 > A")
  onChange: (v: string[]) => void;
};

type HierRow = {
  level_1: string | null;
  level_2: string | null;
  analytical_account: string | null;
};

function uniq(arr: string[]) { return Array.from(new Set(arr)); }
function pathKey(l1: string, l2: string, a: string) { return `${l1} > ${l2} > ${a}`; }

export default function PermissoesPlanoContas({ companyId, value, onChange }: Props) {
  const [rows, setRows] = useState<HierRow[]>([]);
  const [l1, setL1] = useState("");
  const [l2, setL2] = useState("");
  const [a1, setA1] = useState("");

  // Carrega hierarquia da VIEW account_hierarchy
  useEffect(() => {
    if (!companyId) { setRows([]); return; }
    type SB = {
      from: (t: string) => {
        select: (cols: string) => {
          eq: (col: string, v: string) => {
            order: (c: string, o?: { ascending?: boolean }) => {
              order: (c2: string, o2?: { ascending?: boolean }) => {
                order: (c3: string, o3?: { ascending?: boolean }) => Promise<{ data: unknown; error: { message: string } | null }>;
              };
            };
          };
        };
      };
    };
    (async () => {
      const { data, error } = await (supabase as unknown as SB)
        .from("account_hierarchy")
        .select("level_1,level_2,analytical_account")
        .eq("company_id", companyId)
        .order("level_1", { ascending: true })
        .order("level_2", { ascending: true })
        .order("analytical_account", { ascending: true });
      if (error) { console.warn("[account_hierarchy] load error:", error.message); setRows([]); return; }
      setRows((data ?? []) as HierRow[]);
    })();
  }, [companyId]);

  // Estruturas em memória
  const byL1 = useMemo(() => {
    const m = new Map<string, Map<string, string[]>>();
    rows.forEach(r => {
      const L1 = (r.level_1 ?? "").trim();
      const L2 = (r.level_2 ?? "").trim();
      const A  = (r.analytical_account ?? "").trim();
      if (!L1 || !L2 || !A) return;
      if (!m.has(L1)) m.set(L1, new Map());
      const inner = m.get(L1)!;
      if (!inner.has(L2)) inner.set(L2, []);
      inner.get(L2)!.push(A);
    });
    return m;
  }, [rows]);

  const level1Options = useMemo(() => Array.from(byL1.keys()), [byL1]);
  const level2Options = useMemo(() => (l1 && byL1.has(l1)) ? Array.from(byL1.get(l1)!.keys()) : [], [l1, byL1]);
  const analyticalOptions = useMemo(() => (l1 && l2 && byL1.get(l1)?.get(l2)) ? byL1.get(l1)!.get(l2)! : [], [l1, l2, byL1]);

  // Não adiciona automaticamente — só ao clicar no botão
  function addSelection() {
    if (!l1) return;

    // L1 + L2 + A => uma analítica
    if (l1 && l2 && a1) {
      onChange(uniq([...value, pathKey(l1, l2, a1)]));
      return;
    }

    // L1 + L2 => todas as analíticas do par
    if (l1 && l2) {
      const all = (byL1.get(l1)?.get(l2) ?? []).map(A => pathKey(l1, l2, A));
      onChange(uniq([...value, ...all]));
      return;
    }

    // Apenas L1 => todas as analíticas do nível 1
    const inner = byL1.get(l1);
    if (!inner) return;
    const all: string[] = [];
    inner.forEach((arr, L2) => arr.forEach(A => all.push(pathKey(l1, L2, A))));
    onChange(uniq([...value, ...all]));
  }

  const removeOne = (k: string) => onChange(value.filter(x => x !== k));
  const clearAll = () => onChange([]);

  const disabled = !companyId || level1Options.length === 0;
  const addDisabled = !l1; // precisa ao menos do nível 1 selecionado

  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Nível 1</Label>
          <Select value={l1} onValueChange={(v) => { setL1(v); setL2(""); setA1(""); }} disabled={disabled}>
            <SelectTrigger><SelectValue placeholder="Selecione o nível 1" /></SelectTrigger>
            <SelectContent className="z-50 bg-background">
              {level1Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Nível 2</Label>
          <Select value={l2} onValueChange={(v) => { setL2(v); setA1(""); }} disabled={disabled || !l1}>
            <SelectTrigger><SelectValue placeholder={l1 ? "Selecione o nível 2" : "Escolha o nível 1"} /></SelectTrigger>
            <SelectContent className="z-50 bg-background">
              {level2Options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Nível 3 (Analítica)</Label>
          <Select value={a1} onValueChange={setA1} disabled={disabled || !l1 || !l2}>
            <SelectTrigger><SelectValue placeholder={l2 ? "Selecione a analítica" : "Escolha o nível 2"} /></SelectTrigger>
            <SelectContent className="z-50 bg-background">
              {analyticalOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" onClick={addSelection} disabled={addDisabled}>
          Adicionar contas
        </Button>
        <Button type="button" variant="outline" onClick={clearAll} disabled={value.length === 0}>
          Limpar tudo
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Analíticas selecionadas ({value.length})</Label>
        {value.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Escolha um nível e clique em <b>Adicionar contas</b> para incluir as analíticas relacionadas.
          </p>
        ) : (
          <div className="max-h-40 overflow-auto border rounded-md p-2 space-y-1">
            {value.map(k => (
              <div key={k} className="flex items-center justify-between text-sm">
                <span className="truncate">{k}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeOne(k)}>
                  Remover
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
