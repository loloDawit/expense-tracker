import { LoginFormData, loginSchema } from '@/schemas/loginSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

export const useLoginForm = () => {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      console.log('Logging in with', data);
    } catch (err) {
      Alert.alert('Login Failed', 'Something went wrong.');
    }
  });

  return {
    ...form,
    handleSubmit,
  };
};
