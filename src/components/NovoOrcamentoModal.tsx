import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
const formSchema = z.object({
  company_id: z.string().min(1, 'Empresa é obrigatória'),
  name: z.string().min(1, 'Nome é obrigatório'),
  planned_amount: z.number().min(0, 'Valor deve ser positivo'),
  start_date: z.date({
    required_error: 'Data de início é obrigatória'
  }),
  end_date: z.date({
    required_error: 'Data de fim é obrigatória'
  }),
  status: z.enum(['rascunho', 'ativo', 'fechado']),
  description: z.string().optional()
}).refine(data => data.end_date >= data.start_date, {
  message: "Data de fim deve ser maior ou igual à data de início",
  path: ["end_date"]
});
type FormData = z.infer<typeof formSchema>;
interface NovoOrcamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}
export function NovoOrcamentoModal({
  open,
  onOpenChange,
  onSuccess
}: NovoOrcamentoModalProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const {
    data: companies
  } = useSupabaseTable('companies', {
    filter: {
      column: 'status',
      value: 'active'
    }
  });
  const {
    insert: insertBudget,
    isInserting
  } = useSupabaseTable('budgets');
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: {
      errors
    }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'rascunho'
    }
  });
  const watchedCompanyId = watch('company_id');
  const watchedStatus = watch('status');
  const onSubmit = async (data: FormData) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: userData } = await supabase.auth.getUser();
      
      await insertBudget({
        ...data,
        actual_amount: 0,
        user_id: userData.user?.id
      });
      reset();
      setStartDate(undefined);
      setEndDate(undefined);
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <DialogHeader>
          <DialogTitle className="text-primary">Novo Orçamento</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company_id">Empresa *</Label>
              <Select value={watchedCompanyId} onValueChange={value => setValue('company_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>)}
                </SelectContent>
              </Select>
              {errors.company_id && <p className="text-sm text-destructive mt-1">{errors.company_id.message}</p>}
            </div>

            <div>
              <Label htmlFor="name">Nome do Orçamento *</Label>
              <Input {...register('name')} placeholder="Ex: Orçamento 2024 Q1" className="bg-white" />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="planned_amount">Valor Planejado *</Label>
              <Input type="number" step="0.01" {...register('planned_amount', {
                valueAsNumber: true
              })} placeholder="0,00" className="bg-white" />
              {errors.planned_amount && <p className="text-sm text-destructive mt-1">{errors.planned_amount.message}</p>}
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={watchedStatus} onValueChange={(value: 'rascunho' | 'ativo' | 'fechado') => setValue('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="ativo" className="bg-white text-sicofe-gray">Ativo</SelectItem>
                  <SelectItem value="fechado">Fechado</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Início *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={date => {
                  setStartDate(date);
                  setValue('start_date', date!);
                }} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {errors.start_date && <p className="text-sm text-destructive mt-1">{errors.start_date.message}</p>}
            </div>

            <div>
              <Label>Data de Fim *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={date => {
                  setEndDate(date);
                  setValue('end_date', date!);
                }} initialFocus className="pointer-events-auto" />
                </PopoverContent>
              </Popover>
              {errors.end_date && <p className="text-sm text-destructive mt-1">{errors.end_date.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea {...register('description')} placeholder="Descrição opcional do orçamento..." className="resize-none" rows={3} />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isInserting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isInserting} className="bg-primary hover:bg-primary/90">
              {isInserting ? 'Criando...' : 'Criar Orçamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
}
