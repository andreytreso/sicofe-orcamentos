
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signUp, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors = { email: '', password: '', firstName: '', lastName: '' };

    if (!email.trim()) {
      newErrors.email = 'O campo email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password.trim()) {
      newErrors.password = 'O campo senha é obrigatório';
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter pelo menos 6 caracteres';
    }

    if (isSignUp) {
      if (!firstName.trim()) {
        newErrors.firstName = 'O nome é obrigatório';
      }
      if (!lastName.trim()) {
        newErrors.lastName = 'O sobrenome é obrigatório';
      }
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      let result;
      
      if (isSignUp) {
        result = await signUp(email, password, firstName, lastName);
        if (!result.error) {
          toast.success('Conta criada com sucesso! Verifique seu email para confirmar.', {
            style: {
              backgroundColor: '#0047FF',
              color: 'white',
              border: 'none'
            },
          });
          setIsSignUp(false);
        }
      } else {
        result = await login(email, password);
        if (!result.error) {
          toast.success('Login realizado com sucesso!', {
            style: {
              backgroundColor: '#0047FF',
              color: 'white',
              border: 'none'
            },
          });
          navigate('/', { replace: true });
        }
      }
      
      if (result.error) {
        if (result.error.message?.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else if (result.error.message?.includes('User already registered')) {
          toast.error('Este email já está cadastrado');
        } else {
          toast.error(result.error.message || 'Erro na autenticação');
        }
      }
    } catch (error) {
      toast.error('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg rounded-xl border-0 bg-white">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <img 
                src="/lovable-uploads/aeb6e43a-0df5-4317-b487-2cf292d5bf0a.png" 
                alt="SICOFE" 
                className="h-16 w-auto"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">
              Sicofe Orçamentos
            </CardTitle>
            <CardDescription className="text-gray-600">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName) setErrors(prev => ({ ...prev, firstName: '' }));
                      }}
                      className={`${errors.firstName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0`}
                      style={{ backgroundColor: '#EEF4FF' }}
                      placeholder="Digite seu nome"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (errors.lastName) setErrors(prev => ({ ...prev, lastName: '' }));
                      }}
                      className={`${errors.lastName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0`}
                      style={{ backgroundColor: '#EEF4FF' }}
                      placeholder="Digite seu sobrenome"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  className={`${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0`}
                  style={{ backgroundColor: '#EEF4FF' }}
                  placeholder="Digite seu email"
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  className={`${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0`}
                  style={{ backgroundColor: '#EEF4FF' }}
                  placeholder="Digite sua senha"
                />
                {errors.password && (
                  <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full text-white"
                style={{ backgroundColor: '#0047FF' }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                 ) : (
                   isSignUp ? 'Criar Conta' : 'Entrar'
                 )}
               </Button>

               {!isSignUp && (
                 <Link 
                   to="/forgot-password" 
                   className="text-sm hover:underline text-center"
                   style={{ color: '#0047FF' }}
                 >
                   Esqueci minha senha
                 </Link>
               )}

               <div className="text-center">
                 <p className="text-gray-600 text-sm">
                   {isSignUp ? 'Já possui uma conta?' : 'Não possui uma conta?'}{' '}
                   <button
                     type="button"
                     onClick={() => setIsSignUp(!isSignUp)}
                     className="text-[#0047FF] hover:underline font-medium"
                   >
                     {isSignUp ? 'Fazer Login' : 'Criar conta'}
                   </button>
                 </p>
               </div>
            </CardFooter>
          </form>
        </Card>

      </div>
    </div>
  );
}
