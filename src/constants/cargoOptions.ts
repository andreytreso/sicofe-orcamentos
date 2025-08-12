export type CargoOption = {
  value: string;
  label: string;
};

export const cargoOptions: CargoOption[] = [
  { value: "socio", label: "Sócio" },
  { value: "diretor", label: "Diretor" },
  { value: "gerente", label: "Gerente" },
  { value: "supervisor", label: "Supervisor/Coordenador" },
  { value: "analista", label: "Analista" },
];
