import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { registerUser } from "@/services/authService";
import { Loader2 } from "lucide-react";
interface FormData {
  name: string;
  email: string;
  company: string;
  role: string;
  password: string;
  confirmPassword: string;
}
interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  password?: string;
  confirmPassword?: string;
}
const UserRegister = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    company: '',
    role: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (value.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
        if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return 'Nome deve conter apenas letras e espaços';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'E-mail inválido';
        break;
      case 'company':
        if (value.length < 2) return 'Empresa deve ter pelo menos 2 caracteres';
        break;
      case 'role':
        if (!value) return 'Cargo é obrigatório';
        break;
      case 'password':
        if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
        break;
      case 'confirmPassword':
        if (value !== formData.password) return 'Senhas não coincidem';
        break;
    }
    return undefined;
  };
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validar o campo atual
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    // Se é confirmPassword, também validar quando password mudar
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };
  const isFormValid = () => {
    const hasErrors = Object.values(errors).some(error => error !== undefined);
    const hasEmptyFields = Object.values(formData).some(value => !value);
    return !hasErrors && !hasEmptyFields;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setIsLoading(true);
    try {
      const {
        confirmPassword,
        ...registrationData
      } = formData;
      const result = await registerUser(registrationData);
      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
          className: "bg-[#0047FF] text-white border-[#0047FF]"
        });
        navigate('/login');
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const roleOptions = [{
    value: 'socio',
    label: 'Sócio'
  }, {
    value: 'diretor',
    label: 'Diretor'
  }, {
    value: 'gerente',
    label: 'Gerente'
  }, {
    value: 'supervisor',
    label: 'Supervisor/Coordenador'
  }, {
    value: 'analista',
    label: 'Analista'
  }];
  return <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-xl bg-white border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-semibold text-gray-800">
            Cadastro de Usuário
          </CardTitle>
          <CardDescription className="text-gray-600">
            Preencha os dados abaixo para criar sua conta
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                Nome e Sobrenome *
              </Label>
              <Input id="name" type="text" placeholder="Digite seu nome e sobrenome" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} className="border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 placeholder:text-gray-500 focus-visible:ring-blue-300 focus-visible:ring-offset-0" style={{
              backgroundColor: '#EEF4FF'
            }} aria-invalid={!!errors.name} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                E-mail *
              </Label>
              <Input id="email" type="email" placeholder="Digite seu e-mail" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} className="border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 placeholder:text-gray-500 focus-visible:ring-blue-300 focus-visible:ring-offset-0" style={{
              backgroundColor: '#EEF4FF'
            }} aria-invalid={!!errors.email} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-700">
                Cargo *
              </Label>
              <Select value={formData.role} onValueChange={value => handleInputChange('role', value)}>
                <SelectTrigger className="border-gray-300 focus:ring-0 focus:border-gray-300 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=open]:ring-0 data-[state=open]:border-gray-300" style={{
                backgroundColor: '#EEF4FF'
              }} aria-invalid={!!errors.role}>
                  <SelectValue placeholder="Selecione seu cargo" />
                </SelectTrigger>
                <SelectContent className="bg-white border-0">
                  {roleOptions.map(option => <SelectItem key={option.value} value={option.value} className="hover:bg-[#EEF4FF] text-black focus:bg-[#EEF4FF] focus:text-black data-[state=checked]:text-black">
                      {option.label}
                    </SelectItem>)}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Senha *
              </Label>
              <Input id="password" type="password" placeholder="Digite sua senha" autoComplete="new-password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} className="border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 placeholder:text-gray-500 focus-visible:ring-blue-300 focus-visible:ring-offset-0" style={{
              backgroundColor: '#EEF4FF'
            }} aria-invalid={!!errors.password} />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700">
                Confirmar Senha *
              </Label>
              <Input id="confirmPassword" type="password" placeholder="Confirme sua senha" autoComplete="new-password" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} className="border-gray-300 focus:ring-2 focus:ring-blue-300 focus:border-blue-300 placeholder:text-gray-500 focus-visible:ring-blue-300 focus-visible:ring-offset-0" style={{
              backgroundColor: '#EEF4FF'
            }} aria-invalid={!!errors.confirmPassword} />
              {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
            </div>

            <Button type="submit" disabled={!isFormValid() || isLoading} className="w-full bg-[#0047FF] hover:bg-blue-600 text-white rounded-lg py-2 disabled:opacity-50">
              {isLoading ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </> : 'Criar Conta'}
            </Button>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Já possui uma conta?{' '}
                <button type="button" onClick={() => navigate('/login')} className="text-[#0047FF] hover:underline font-medium">
                  Fazer login
                </button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>;
};
export default UserRegister;