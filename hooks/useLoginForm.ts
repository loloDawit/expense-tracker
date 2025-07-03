import { useAuth } from '@/contexts/AuthContext';
import { LoginFormData, loginSchema } from '@/schemas/loginSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

export const useLoginForm = () => {
  const { login } = useAuth();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      // Call your login function here
      const response = await login(data.email, data.password);
      if (response.success) {
        // Handle successful login, e.g., navigate to the home screen
        Alert.alert('Login Successful', 'Welcome back!');
        return response;
      } else {
        // Handle login error
        Alert.alert('Login Failed', response.msg);
      }
    } catch (_err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      Alert.alert('Login Failed', 'Something went wrong.');
    }
  });

  return {
    ...form,
    handleSubmit,
  };
};
