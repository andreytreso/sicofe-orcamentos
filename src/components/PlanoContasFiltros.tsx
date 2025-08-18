import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from "@/components/ui/select";
import { useLevel1Options, useLevel2Options, useAnalyticalAccountOptions } from "@/hooks/useAccountHierarchy";
import { useMemo, useState, useEffect } from "react";

const norm = (s?: string) =>
  (s ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();

const uniq = (arr: (string | undefined)[]) => {
  const m = new Map<string, string>(); // chave normalizada -> rótulo exibido
  arr.forEach((v, i) => {
    const n = norm(v);
    if (n) m.set(n, n);
  });
  return Array.from(m.values());
};

export default function PlanoContasFiltros({
  onChange,
}: {
  onChange?: (f: { level1?: string; level2?: string; analytical?: string }) => void;
}) {
  const [level1, setLevel1] = useState<string>("");
  const [level2, setLevel2] = useState<string>("");
  const [analytical, setAnalytical] = useState<string>("");

  const l1Raw = useLevel1Options();
  const l2Raw = useLevel2Options(level1);
  const aRaw  = useAnalyticalAccountOptions(level1, level2);

  const l1 = useMemo(() => uniq(l1Raw), [l1Raw]);
  const l2 = useMemo(() => uniq(l2Raw), [l2Raw]);
  const a  = useMemo(() => uniq(aRaw),  [aRaw]);

  // se a opção selecionada sumir após normalização, limpa
  useEffect(() => {
  if (level1 && !l1.includes(level1)) setLevel1("");
  if (level2 && !l2.includes(level2)) setLevel2("");
  if (analytical && !a.includes(analytical)) setAnalytical("");
}, [l1, l2, a, level1, level2, analytical]);


  useEffect(() => { onChange?.({ level1, level2, analytical }); }, [level1, level2, analytical, onChange]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {/* Nível 1 */}
        <div>
          <Label>Nível 1</Label>
          <Select value={level1} onValueChange={(v) => { setLevel1(v); setLevel2(""); setAnalytical(""); }}>
            <SelectTrigger><SelectValue placeholder="Selecione o nível 1" /></SelectTrigger>
            <SelectContent className="z-50 bg-background">
              {l1.map((opt, idx) => (
                <SelectItem key={`l1-${idx}`} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nível 2 */}
        <div>
          <Label>Nível 2</Label>
          <Select value={level2} onValueChange={(v) => { setLevel2(v); setAnalytical(""); }} disabled={!level1}>
            <SelectTrigger><SelectValue placeholder="Selecione o nível 2" /></SelectTrigger>
            <SelectContent className="z-50 bg-background">
              {l2.map((opt, idx) => (
                <SelectItem key={`l2-${idx}`} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Analítica */}
        <div>
          <Label>Nível 3 (Analítica)</Label>
          <Select value={analytical} onValueChange={setAnalytical} disabled={!level2}>
            <SelectTrigger><SelectValue placeholder="Escolha a analítica" /></SelectTrigger>
            <SelectContent className="z-50 bg-background">
              {a.map((opt, idx) => (
                <SelectItem key={`a-${idx}`} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
