export default function Forbidden() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600">Acesso negado</h1>
        <p className="text-gray-600 mt-2">
          Você precisa ser administrador para acessar esta área.
        </p>
      </div>
    </div>
  );
}
