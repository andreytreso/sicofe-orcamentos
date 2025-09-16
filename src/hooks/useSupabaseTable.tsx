import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';
type FilterValue = string | number | boolean | null | Array<string | number | boolean>;

interface UseSupabaseTableOptions {
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  filter?: { column: string; value: FilterValue; operator?: FilterOperator };
}

export function useSupabaseTable(
  tableName: string,
  options: UseSupabaseTableOptions = {}
) {
  const queryClient = useQueryClient();
  const { select = '*', orderBy, filter } = options;

  // Query para buscar dados
  const query = useQuery({
    queryKey: [tableName, options],
    queryFn: async (): Promise<any[]> => {
      let queryBuilder = supabase
        .from(tableName as any)
        .select(select);

      if (filter) {
        const { column, value, operator = 'eq' } = filter;
        switch (operator) {
          case 'eq':
            queryBuilder = queryBuilder.eq(column, value as any);
            break;
          case 'neq':
            queryBuilder = queryBuilder.neq(column, value as any);
            break;
          case 'gt':
            queryBuilder = queryBuilder.gt(column, value as any);
            break;
          case 'gte':
            queryBuilder = queryBuilder.gte(column, value as any);
            break;
          case 'lt':
            queryBuilder = queryBuilder.lt(column, value as any);
            break;
          case 'lte':
            queryBuilder = queryBuilder.lte(column, value as any);
            break;
          case 'like':
            queryBuilder = queryBuilder.like(column, value as any);
            break;
          case 'in':
            queryBuilder = queryBuilder.in(column, value as any);
            break;
        }
      }

      if (orderBy) {
        queryBuilder = queryBuilder.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      const { data, error } = await queryBuilder;

      if (error) {
        throw new Error(`Error fetching ${tableName}: ${error.message}`);
      }

      return (data || []) as any;
    }
  });

  // Mutation para inserir
  const insertMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: result, error } = await supabase
        .from(tableName as any)
        .insert(data)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({
        title: "Sucesso",
        description: "Registro criado com sucesso!",
        className: "bg-success text-success-foreground",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao criar registro: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: result, error } = await supabase
        .from(tableName as any)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({
        title: "Sucesso",
        description: "Registro atualizado com sucesso!",
        className: "bg-success text-success-foreground",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao atualizar registro: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(tableName as any)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [tableName] });
      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso!",
        className: "bg-success text-success-foreground",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: `Erro ao excluir registro: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    insert: insertMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    isInserting: insertMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook específico para companies
export const useCompaniesTable = () => 
  useSupabaseTable('companies', { orderBy: { column: 'name' } });

// Hook específico para budgets  
export const useBudgetsTable = () => 
  useSupabaseTable('budgets', { 
    select: `
      *,
      companies(name)
    `,
    orderBy: { column: 'created_at', ascending: false } 
  });

// Hook específico para categories
export const useCategoriesTable = () => 
  useSupabaseTable('categories', { orderBy: { column: 'name' } });

// Hook específico para entries
export const useEntriesTable = () => 
  useSupabaseTable('entries', { 
    select: `
      *,
      budgets(name),
      categories(name, type)
    `,
    orderBy: { column: 'entry_date', ascending: false } 
  });
