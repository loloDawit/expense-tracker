import { profileSchema } from '@/schemas/profile';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export type ProfileFormType = z.infer<typeof profileSchema>;

export const useProfileForm = (defaultValues: Partial<ProfileFormType>) =>
  useForm<ProfileFormType>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      changePassword: false,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      ...defaultValues,
    },
    mode: 'onChange',
  });
