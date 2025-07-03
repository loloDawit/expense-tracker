import { useAuth } from '@/contexts/AuthContext';
import { SignupFormData, signupSchema } from '@/schemas/signupSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

export const useSignupForm = () => {
  const { signup } = useAuth();
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const response = await signup(data.username, data.email, data.password);
      if (response.success) {
        Alert.alert('Signup Successful', 'Welcome aboard!');
      } else {
        // Handle signup error
        Alert.alert('Signup Failed', response.msg);
      }
    } catch (_err) { // eslint-disable-line @typescript-eslint/no-unused-vars
      Alert.alert('Signup Failed', 'Something went wrong.');
    }
  });

  return {
    ...form,
    handleSubmit,
  };
};
