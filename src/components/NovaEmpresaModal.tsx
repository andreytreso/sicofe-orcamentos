import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupabaseTable } from '@/hooks/useSupabaseTable';
const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  grupo: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  cnpj: z.string().min(1, 'CNPJ é obrigatório'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  endereco_rua: z.string().min(1, 'Rua é obrigatória'),
  endereco_numero: z.string().min(1, 'Número é obrigatório'),
  endereco_cidade: z.string().min(1, 'Cidade é obrigatória'),
  endereco_estado: z.string().min(1, 'Estado é obrigatório'),
  endereco_cep: z.string().min(1, 'CEP é obrigatório')
});
type FormData = z.infer<typeof formSchema>;
interface NovaEmpresaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function NovaEmpresaModal({
  open,
  onOpenChange
}: NovaEmpresaModalProps) {
  const {
    insert: insertCompany,
    isInserting
  } = useSupabaseTable('companies');
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
      status: 'active'
    }
  });
  const watchedStatus = watch('status');
  const onSubmit = async (data: FormData) => {
    try {
      await insertCompany(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
    }
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-primary">Nova Empresa</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Empresa *</Label>
              <Input {...register('name')} placeholder="Nome da empresa" />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="grupo">Grupo</Label>
              <Input {...register('grupo')} placeholder="Grupo da empresa" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input {...register('cnpj')} placeholder="00.000.000/0000-00" />
              {errors.cnpj && <p className="text-sm text-destructive mt-1">{errors.cnpj.message}</p>}
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <Select value={watchedStatus} onValueChange={(value: 'active' | 'inactive') => setValue('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">E-mail *</Label>
              <Input type="email" {...register('email')} placeholder="empresa@exemplo.com" />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input {...register('telefone')} placeholder="(11) 99999-9999" />
              {errors.telefone && <p className="text-sm text-destructive mt-1">{errors.telefone.message}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-primary">Endereço</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="endereco_rua">Rua *</Label>
                <Input {...register('endereco_rua')} placeholder="Nome da rua" />
                {errors.endereco_rua && <p className="text-sm text-destructive mt-1">{errors.endereco_rua.message}</p>}
              </div>

              <div>
                <Label htmlFor="endereco_numero">Número *</Label>
                <Input {...register('endereco_numero')} placeholder="123" />
                {errors.endereco_numero && <p className="text-sm text-destructive mt-1">{errors.endereco_numero.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="endereco_cidade">Cidade *</Label>
                <Input {...register('endereco_cidade')} placeholder="São Paulo" />
                {errors.endereco_cidade && <p className="text-sm text-destructive mt-1">{errors.endereco_cidade.message}</p>}
              </div>

              <div>
                <Label htmlFor="endereco_estado">Estado *</Label>
                <Input {...register('endereco_estado')} placeholder="SP" />
                {errors.endereco_estado && <p className="text-sm text-destructive mt-1">{errors.endereco_estado.message}</p>}
              </div>

              <div>
                <Label htmlFor="endereco_cep">CEP *</Label>
                <Input {...register('endereco_cep')} placeholder="00000-000" />
                {errors.endereco_cep && <p className="text-sm text-destructive mt-1">{errors.endereco_cep.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isInserting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isInserting} className="bg-primary hover:bg-primary/90">
              {isInserting ? 'Criando...' : 'Criar Empresa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>;
}