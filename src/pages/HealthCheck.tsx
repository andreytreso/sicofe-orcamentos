import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const TABLES = [
  { page: 'Cadastros > Empresas', table: 'companies' },
  { page: 'Cadastros > Orçamentos', table: 'budgets' },
  { page: 'Cadastros > Plano de Contas', table: 'account_hierarchy' },
  { page: 'Cadastros > Fornecedores', table: 'suppliers' },
  { page: 'Cadastros > Centros de Custo', table: 'cost_centers' },
  { page: 'Cadastros > Usuários', table: 'profiles' },
  { page: 'Lançamentos', table: 'transactions' },
  { page: 'Aprovações', table: 'approval_items' },
];

interface ConnectionResult {
  table: string;
  page: string;
  ok: boolean;
  msg: string;
  count?: number;
}

export default function HealthCheck() {
  const [results, setResults] = useState<ConnectionResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const out: ConnectionResult[] = [];
      
      for (const t of TABLES) {
        try {
          const { data, error, count } = await supabase
            .from(t.table as any)
            .select('*', { count: 'exact' })
            .limit(1);
          
          if (error) {
            out.push({
              table: t.table,
              page: t.page,
              ok: false,
              msg: error.message,
            });
          } else {
            out.push({
              table: t.table,
              page: t.page,
              ok: true,
              msg: count === 0 ? 'Conectado (sem dados)' : `Conectado (${count} registros)`,
              count: count || 0,
            });
          }
        } catch (err) {
          out.push({
            table: t.table,
            page: t.page,
            ok: false,
            msg: `Erro de conexão: ${err}`,
          });
        }
      }
      
      setResults(out);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Verificando conexões...</span>
      </div>
    );
  }

  const successCount = results.filter(r => r.ok).length;
  const totalCount = results.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Health Check - Supabase</h1>
          <p className="text-muted-foreground">
            Verificação de conectividade com as tabelas do banco de dados
          </p>
        </div>
        <Badge 
          variant={successCount === totalCount ? "default" : "destructive"}
          className="text-sm"
        >
          {successCount}/{totalCount} conectadas
        </Badge>
      </div>

      <div className="grid gap-4">
        {results.map(r => (
          <Card key={r.table} className={r.ok ? "border-green-200" : "border-red-200"}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{r.page}</span>
                {r.ok ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">
                  Tabela: <code className="bg-muted px-1 rounded text-xs">{r.table}</code>
                </div>
                <div className={`text-sm font-medium ${r.ok ? 'text-green-600' : 'text-red-600'}`}>
                  {r.ok ? '✅ ' : '❌ '}{r.msg}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
