import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: storeData } = useQuery({
    queryKey: ['store-settings'],
    queryFn: () =>
      apiClient.get(`/jsonapi/commerce_store/online/${user.store.id}`).then((r) => r.data.data),
  });

  const [form, setForm] = useState({ name: '', phone: '', email: '', hours: '' });

  useEffect(() => {
    if (storeData) {
      const a = storeData.attributes;
      setForm({
        name: a.name || '',
        phone: a.field_phone || '',
        email: a.mail || '',
        hours: a.field_business_hours || '',
      });
    }
  }, [storeData]);

  const saveMutation = useMutation({
    mutationFn: (updates) =>
      apiClient.patch(`/jsonapi/commerce_store/online/${user.store.id}`, {
        data: { type: storeData.type, id: storeData.id, attributes: updates },
      }),
    onSuccess: () => { qc.invalidateQueries(['store-settings']); toast.success('Settings saved'); },
    onError: () => toast.error('Failed to save settings'),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Store Settings</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate({
            name: form.name,
            field_phone: form.phone,
            mail: form.email,
            field_business_hours: form.hours,
          });
        }}
        className="bg-white rounded-xl border p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
          <textarea value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder={"Mon-Sat: 9am-9pm\nSun: 10am-6pm"} />
        </div>
        <button type="submit" disabled={saveMutation.isLoading}
          className="px-6 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50">
          {saveMutation.isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
