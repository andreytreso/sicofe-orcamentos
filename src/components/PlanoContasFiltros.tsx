import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  useLevel1Options,
  useLevel2Options,
  useAnalyticalAccountOptions,
} from "@/hooks/useAccountHierarchy";
import { Dispatch, SetStateAction } from "react";

export type Filters = {
  level1?: string;
  level2?: string;
  analytical?: string;
};

type Props = {
  filters: Filters;
  onFiltersChange: Dispatch<SetStateAction<Filters>>;
};

export default function PlanoContasFiltros({ filters, onFiltersChange }: Props) {
  const level1Options = useLevel1Options();
  const level2Options = useLevel2Options(filters.level1);
  const analyticalOptions = useAnalyticalAccountOptions(
    filters.level1,
    filters.level2
  );

  const setLevel1 = (v: string) =>
    onFiltersChange({ level1: v, level2: undefined, analytical: undefined });

  const setLevel2 = (v: string) =>
    onFiltersChange((prev) => ({ ...prev, level2: v, analytical: undefined }));

  const setAnalytical = (v: string) =>
    onFiltersChange((prev) => ({ ...prev, analytical: v }));

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Nível 1 */}
      <div className="space-y-2">
        <Label className="text-gray-700">Nível 1</Label>
        <Select value={filters.level1 ?? ""} onValueChange={setLevel1}>
          <SelectTrigger className="bg-white border-gray-300">
            <SelectValue placeholder="Selecione o nível 1" />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300 z-50">
            {level1Options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Nível 2 */}
      <div className="space-y-2">
        <Label className="text-gray-700">Nível 2</Label>
        <Select
          value={filters.level2 ?? ""}
          onValueChange={setLevel2}
          disabled={!filters.level1}
        >
          <SelectTrigger className="bg-white border-gray-300">
            <SelectValue
              placeholder={
                filters.level1 ? "Selecione o nível 2" : "Escolha o nível 1"
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300 z-50">
            {level2Options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Nível 3 (Analítica) */}
      <div className="space-y-2">
        <Label className="text-gray-700">Nível 3 (Analítica)</Label>
        <Select
          value={filters.analytical ?? ""}
          onValueChange={setAnalytical}
          disabled={!filters.level2}
        >
          <SelectTrigger className="bg-white border-gray-300">
            <SelectValue
              placeholder={
                filters.level2 ? "Escolha o nível 2" : "Escolha o nível 2"
              }
            />
          </SelectTrigger>
          <SelectContent className="bg-white border-gray-300 z-50">
            {analyticalOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
