
interface RegisterData {
  name: string;
  email: string;
  company: string;
  role: string;
  password: string;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.status === 201) {
      return { success: true, message: 'Usuário criado com sucesso!', user: result.user };
    } else {
      return { success: false, message: result.message || 'Erro ao criar usuário' };
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    return { success: false, message: 'Erro de conexão. Tente novamente.' };
  }
};
