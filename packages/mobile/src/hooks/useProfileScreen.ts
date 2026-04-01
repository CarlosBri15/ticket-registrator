import { useState, useCallback } from 'react';
import { useUserQuery, useUpdateUserMutation } from '@ticket-registrator/shared';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { tokenProvider } from '../api/client';

export const useProfileScreen = () => {
  const { i18n } = useTranslation();
  const router = useRouter();

  const { data: user, refetch } = useUserQuery();
  const { mutate: updateUser, isPending: isSaving } = useUpdateUserMutation({
    onSuccess: () => {
      setIsEditing(false);
      setSaveOk(true);
      refetch();
      setTimeout(() => setSaveOk(false), 3000);
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [saveOk, setSaveOk] = useState(false);
  const [form, setForm] = useState({ name: '', surname: '', email: '' });

  const startEdit = useCallback(() => {
    setForm({
      name: user?.name ?? '',
      surname: (user as any)?.surname ?? '',
      email: user?.email ?? '',
    });
    setIsEditing(true);
    setSaveOk(false);
  }, [user]);

  const handleSave = useCallback(() => {
    if (!user?.id || !form.name.trim()) return;
    const payload: Record<string, string> = {};
    if (form.name.trim()) payload.name = form.name.trim();
    if (form.surname.trim()) payload.surname = form.surname.trim();
    if (form.email.trim()) payload.email = form.email.trim();
    updateUser({ id: user.id, data: payload });
  }, [user, form, updateUser]);

  const handleLogout = async () => {
    await tokenProvider.removeToken();
    router.replace('/(auth)/login');
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)
    : '??';

  const firstName = user?.name?.split(' ')[0] ?? '';

  return {
    user,
    isEditing,
    setIsEditing,
    saveOk,
    form,
    setForm,
    startEdit,
    handleSave,
    handleLogout,
    userInitials,
    firstName,
    isSaving,
    language: i18n.language,
    changeLanguage: (code: string) => i18n.changeLanguage(code),
  };
};
