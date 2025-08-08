// src/hooks/useSupabaseTable.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type TableName = keyof Database["public"]["Tables"];
type RowOf<N extends TableName> = Database["public"]["Tables"][N]["Row"];
type InsertOf<N extends TableName> = Database["public"]["Tables"][N]["Insert"];
type UpdateOf<N extends TableName> = Database["public"]["Tables"][N]["Update"];

type Operator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "like" | "ilike" | "in";

export type UseSupabaseTableOptions<N extends TableName, R> = {
  select?: string;
  orderBy?: { column: keyof RowOf<N> & string; ascending?: boolean };
  filter?: { column: keyof RowOf<N> & string; value: unknown; operator?: Operator };
  count?: "exact" | "estimated" | "planned";
  keyColumn?: keyof RowOf<N> & string; // padrão: "id"
};

export type UseSupabaseTableResult<R, N extends TableName> = {
  data: R[];
  count: number | null;
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<unknown>;
  insert: (payload: InsertOf<N>) => void;
  isInserting: boolean;
  update: (payload: { keyValue: unknown; data: UpdateOf<N> }) => void; // <- relaxado
  isUpdating: boolean;
  remove: (keyValue: unknown) => void; // <- relaxado
  isDeleting: boolean;
};

// Helper para evitar conflito de overload do supabase.from()
/* eslint-disable @typescript-eslint/no-explicit-any */
const fromAny = (table: string) => (supabase.from as any)(table) as any;
/* eslint-enable @typescript-eslint/no-explicit-any */

export function useSupabaseTable<
  N extends TableName,
  R = RowOf<N>
>(table: N, options: UseSupabaseTableOptions<N, R> = {}): UseSupabaseTableResult<R, N> {
  const {
    select = "*",
    orderBy,
    filter,
    count: countMode = "exact",
    keyColumn = "id" as keyof RowOf<N> & string,
  } = options;

  const queryClient = useQueryClient();

  // QUERY com count
  const query = useQuery({
    queryKey: [table, { select, orderBy, filter, countMode, keyColumn }],
    queryFn: async () => {
      let qb = fromAny(table).select(select, { count: countMode });

      if (filter) {
        const { column, value, operator = "eq" } = filter;
        switch (operator) {
          case "eq": qb = qb.eq(column as string, value as never); break;
          case "neq": qb = qb.neq(column as string, value as never); break;
          case "gt": qb = qb.gt(column as string, value as never); break;
          case "gte": qb = qb.gte(column as string, value as never); break;
          case "lt": qb = qb.lt(column as string, value as never); break;
          case "lte": qb = qb.lte(column as string, value as never); break;
          case "like": qb = qb.like(column as string, value as string); break;
          case "ilike": qb = qb.ilike(column as string, value as string); break;
          case "in": qb = qb.in(column as string, value as unknown[]); break;
        }
      }

      if (orderBy) {
        qb = qb.order(orderBy.column as string, {
          ascending: orderBy.ascending ?? true,
        });
      }

      const { data, error, count } = await qb;
      if (error) {
        throw new Error(`Error fetching ${String(table)}: ${error.message}`);
      }
      return { rows: (data ?? []) as R[], count: count ?? null };
    },
  });

  // INSERT
  const insertMutation = useMutation({
    mutationFn: async (payload: InsertOf<N>) => {
      const { data, error } = await fromAny(table)
        .insert(payload as unknown)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data as R;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
  });

  // UPDATE (por keyColumn)
  const updateMutation = useMutation({
    mutationFn: async (p: { keyValue: unknown; data: UpdateOf<N> }) => {
      const { keyValue, data } = p;
      const { data: updated, error } = await fromAny(table)
        .update(data as unknown)
        .eq(keyColumn as string, keyValue as never)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated as R;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
  });

  // DELETE (por keyColumn)
  const deleteMutation = useMutation({
    mutationFn: async (keyValue: unknown) => {
      const { error } = await fromAny(table)
        .delete()
        .eq(keyColumn as string, keyValue as never);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [table] });
    },
  });

  return {
    data: query.data?.rows ?? [],
    count: query.data?.count ?? null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    insert: insertMutation.mutate,
    isInserting: insertMutation.isPending,
    update: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    remove: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

// Hooks específicos usados na página Empresas
export const useCompaniesTable = () =>
  useSupabaseTable("companies", { orderBy: { column: "name" } });

export const useBudgetsTable = () =>
  useSupabaseTable<
    "budgets",
    Database["public"]["Tables"]["budgets"]["Row"] & { companies?: { name: string } }
  >("budgets", {
    select: "*, companies(name)",
    orderBy: { column: "created_at", ascending: false },
  });
