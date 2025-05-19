import { SignupFormData, signupSchema } from '@/schemas/signupSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

export const useSignupForm = () => {
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
      console.log('Signing up with', data);
    } catch (err) {
      Alert.alert('Signup Failed', 'Something went wrong.');
    }
  });

  return {
    ...form,
    handleSubmit,
  };
};
