import { useAuth } from '@/contexts/AuthContext';
import {
  ForgotPasswordFormData,
  forgotPasswordSchema,
} from '@/schemas/forgotPasswordSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';

export const useForgotPasswordForm = (onSuccess?: () => void) => {
  const { resetPassword } = useAuth();
  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const response = await resetPassword(data.email);
      if (response.success) {
        Alert.alert(
          'Password Reset Email Sent',
          'Please check your email to reset your password.'
        );
        onSuccess?.();
        return response;
      } else {
        Alert.alert('Password Reset Failed', response.msg);
      }
    } catch (_err) {
      Alert.alert('Password Reset Failed', 'Something went wrong.');
    }
  });

  return {
    ...form,
    handleSubmit,
  };
};
