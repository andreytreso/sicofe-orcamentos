
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = { username: '', password: '' };

    if (!username.trim()) {
      newErrors.username = 'O campo usuário é obrigatório';
    }

    if (!password.trim()) {
      newErrors.password = 'O campo senha é obrigatório';
    }

    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        toast.success('Login realizado com sucesso!', {
          style: {
            backgroundColor: '#0047FF',
            color: 'white',
            border: 'none'
          },
        });
        navigate('/', { replace: true });
      } else {
        toast.error('Usuário ou senha incorretos');
      }
    } catch (error) {
      toast.error('Erro ao realizar login. Tente novamente.');
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
                className="h-14 w-auto"
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
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
                  }}
                  className={`${errors.username ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-blue-300`}
                  style={{ backgroundColor: '#EEF4FF' }}
                  placeholder="Digite seu usuário"
                />
                {errors.username && (
                  <p className="text-sm text-red-500 mt-1">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  className={`${errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'} focus:ring-blue-300`}
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
                  'Entrar'
                )}
              </Button>

              <Link 
                to="/forgot-password" 
                className="text-sm hover:underline text-center"
                style={{ color: '#0047FF' }}
              >
                Esqueci minha senha
              </Link>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Usuário de teste: <strong>admin</strong></p>
          <p>Senha de teste: <strong>admin123</strong></p>
        </div>
      </div>
    </div>
  );
}
