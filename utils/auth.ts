import { auth } from '@/config/firebase';

export const requireAuth = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};
