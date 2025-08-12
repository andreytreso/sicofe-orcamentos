import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Transaction {
  id: string;
  company_id: string;
  user_id: string;
  transaction_date: string;
  year: number;
  level_1_group: string;
  level_2_group: string;
  analytical_account: string;
  description: string;
  amount: number;
  observations: string;
  competency_months: string[];
  created_at: string;
  updated_at: string;
  companies?: {
    name: string;
  };
}

export interface TransactionFilters {
  companyId?: string;
  period?: string;
  search?: string;
}

export interface TransactionFormData {
  company_id: string;
  year: number;
  level_1_group: string;
  level_2_group: string;
  analytical_account: string;
  amount: number;
  observations: string;
  competency_months: string[];
  transaction_date?: string; // optional: allows aligning period with date
}

export function useTransactions(filters: TransactionFilters) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: async (): Promise<Transaction[]> => {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          companies(name)
        `)
        .order('transaction_date', { ascending: false });

      if (filters.companyId && filters.companyId !== 'all') {
        query = query.eq('company_id', filters.companyId);
      }

      

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`);
      }

      let result = data || [];

      // Client-side filter by month based on transaction_date
      if (filters.period && filters.period !== 'all') {
        const monthMap: Record<string, number> = {
          jan: 1, fev: 2, mar: 3, abr: 4, mai: 5, jun: 6,
          jul: 7, ago: 8, set: 9, out: 10, nov: 11, dez: 12,
        };
        const m = monthMap[filters.period] ?? 0;
        if (m > 0) {
          result = result.filter((t) => {
            const d = new Date(t.transaction_date);
            return d instanceof Date && !isNaN(d.getTime()) && (d.getMonth() + 1) === m;
          });
        }
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(transaction => 
          transaction.description?.toLowerCase().includes(searchLower) ||
          transaction.analytical_account.toLowerCase().includes(searchLower) ||
          transaction.level_1_group.toLowerCase().includes(searchLower) ||
          transaction.level_2_group.toLowerCase().includes(searchLower)
        );
      }

      return result;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data: result, error } = await supabase
        .from('transactions')
        .insert([{
          ...data,
          user_id: user.user.id,
          transaction_date: data.transaction_date ?? new Date().toISOString().split('T')[0],
          description: data.observations || ''
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create transaction: ${error.message}`);
      }

      return result;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Lançamento criado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TransactionFormData> }) => {
      const { data: result, error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update transaction: ${error.message}`);
      }

      return result;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Lançamento atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to delete transaction: ${error.message}`);
      }
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Lançamento excluído com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const createTransaction = useCallback((data: TransactionFormData) => {
    createMutation.mutate(data);
  }, [createMutation]);

  const updateTransaction = useCallback((id: string, data: Partial<TransactionFormData>) => {
    updateMutation.mutate({ id, data });
  }, [updateMutation]);

  const deleteTransaction = useCallback((id: string) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  return {
    transactions,
    isLoading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}