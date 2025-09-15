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

export function useSupabaseTable<T extends Record<string, unknown> = Record<string, unknown>>(
  tableName: string,
  options: UseSupabaseTableOptions = {}
) {
  const queryClient = useQueryClient();
  const { select = '*', orderBy, filter } = options;

  // Query para buscar dados
  const query = useQuery({
    queryKey: [tableName, options],
    queryFn: async (): Promise<T[]> => {
      let queryBuilder = supabase
        .from(tableName)
        .select(select);

      if (filter) {
        const { column, value, operator = 'eq' } = filter;
        switch (operator) {
          case 'eq':
            queryBuilder = queryBuilder.eq(column, value as unknown as string | number | boolean | null);
            break;
          case 'neq':
            queryBuilder = queryBuilder.neq(column, value as unknown as string | number | boolean | null);
            break;
          case 'gt':
            queryBuilder = queryBuilder.gt(column, value as unknown as string | number);
            break;
          case 'gte':
            queryBuilder = queryBuilder.gte(column, value as unknown as string | number);
            break;
          case 'lt':
            queryBuilder = queryBuilder.lt(column, value as unknown as string | number);
            break;
          case 'lte':
            queryBuilder = queryBuilder.lte(column, value as unknown as string | number);
            break;
          case 'like':
            queryBuilder = queryBuilder.like(column, value as unknown as string);
            break;
          case 'in':
            queryBuilder = queryBuilder.in(column, value as unknown as (string | number | boolean)[]);
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

      return (data || []) as T[];
    }
  });

  // Mutation para inserir
  const insertMutation = useMutation({
    mutationFn: async (data: Partial<T> | Partial<T>[]) => {
      const { data: result, error } = await supabase
        .from(tableName)
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
    mutationFn: async ({ id, data }: { id: string; data: Partial<T> }) => {
      const { data: result, error } = await supabase
        .from(tableName)
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
        .from(tableName)
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
