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
  description: string | null;
  amount: number;
  observations: string | null;
  competency_months: string[];
  all_cost_centers?: boolean;
  supplier_id?: string | null;
  collaborator_id?: string | null;
  budget_id?: string | null;
  created_at: string;
  updated_at: string;
  companies?: {
    name: string;
  };
  transaction_cost_centers?: Array<{
    cost_center_id: string;
    cost_centers?: {
      id: string;
      name: string | null;
      code: string | null;
    } | null;
  }>;
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
  all_cost_centers?: boolean; // if false, use cost_center_ids below
  cost_center_ids?: string[]; // optional list when not applying to all
  supplier_id?: string; // optional
  collaborator_id?: string; // optional
  budget_id: string; // required: orçamento associado
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
          companies(name),
          suppliers:supplier_id(id, name),
          collaborators:collaborator_id(id, name),
          transaction_cost_centers(
            cost_center_id,
            cost_centers(id, name, code)
          )
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

      // Exclude cost_center_ids from insert (it's not a column in transactions table)
      const { cost_center_ids, ...transactionData } = data;
      
      const { data: result, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          all_cost_centers: data.all_cost_centers ?? true,
          user_id: user.user.id,
          transaction_date: data.transaction_date ?? new Date().toISOString().split('T')[0],
          description: data.observations || ''
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create transaction: ${error.message}`);
      }

      // Persist cost centers mapping when not all
      const ids = (data.cost_center_ids || []).filter(Boolean);
      if ((data.all_cost_centers === false) && ids.length > 0) {
        const payload = ids.map((id) => ({ transaction_id: result.id, cost_center_id: id }));
        const { error: tccError } = await supabase
          .from('transaction_cost_centers')
          .insert(payload);
        if (tccError) {
          throw new Error(`Failed to set transaction cost centers: ${tccError.message}`);
        }
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
      // Exclude cost_center_ids from update (it's not a column in transactions table)
      const { cost_center_ids, ...transactionData } = data;
      
      const { data: result, error } = await supabase
        .from('transactions')
        .update({
          ...transactionData,
          all_cost_centers: data.all_cost_centers,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update transaction: ${error.message}`);
      }

      // If cost centers provided, replace mapping accordingly
      if (Array.isArray(data.cost_center_ids)) {
        // Clear existing
        const { error: delError } = await supabase
          .from('transaction_cost_centers')
          .delete()
          .eq('transaction_id', id);
        if (delError) {
          throw new Error(`Failed to clear cost centers: ${delError.message}`);
        }

        if (data.all_cost_centers === false && data.cost_center_ids.length > 0) {
          const payload = data.cost_center_ids.map((ccid) => ({ transaction_id: id, cost_center_id: ccid }));
          const { error: insError } = await supabase
            .from('transaction_cost_centers')
            .insert(payload);
          if (insError) {
            throw new Error(`Failed to set cost centers: ${insError.message}`);
          }
        }
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
