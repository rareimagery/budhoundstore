import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import PermissionGate from '../auth/PermissionGate';
import { PERMS, ROLE_LABELS } from '../../utils/permissions';
import Modal from '../common/Modal';
import toast from 'react-hot-toast';

export default function StaffPage() {
  const [showInvite, setShowInvite] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: () => apiClient.get(ENDPOINTS.STAFF_LIST).then((r) => r.data),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Staff</h1>
        <PermissionGate permission={PERMS.MANAGE_STAFF}>
          <button
            onClick={() => setShowInvite(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700"
          >
            Invite Team Member
          </button>
        </PermissionGate>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border divide-y">
          {(data?.staff || []).map((member) => (
            <div key={member.id} className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="font-medium text-gray-900">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  {ROLE_LABELS[member.role] || member.role}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  member.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {member.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showInvite && (
        <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite Team Member">
          <InviteForm onClose={() => setShowInvite(false)} />
        </Modal>
      )}
    </div>
  );
}

function InviteForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('budtender');
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => apiClient.post(ENDPOINTS.STAFF_INVITE, data),
    onSuccess: () => { qc.invalidateQueries(['staff']); toast.success('Invitation sent'); onClose(); },
    onError: () => toast.error('Failed to send invite'),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ email, name, role }); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="budtender">Budtender</option>
          <option value="store_manager">Manager</option>
        </select>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={mutation.isLoading}
          className="flex-1 px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50">
          {mutation.isLoading ? 'Sending...' : 'Send Invite'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
      </div>
    </form>
  );
}
