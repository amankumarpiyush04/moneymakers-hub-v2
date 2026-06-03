import React, { useEffect, useState } from 'react';
import { Loader2, Users, Search, Award } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    adminAPI.getUsers()
      .then(({ data }) => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching admin users:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMessage = newRole === 'admin' 
      ? 'Are you sure you want to promote this user to Admin? They will have access to all admin dashboards.'
      : 'Are you sure you want to demote this user to a regular User?';
      
    if (!window.confirm(confirmMessage)) return;

    try {
      await adminAPI.updateUserRole(id, newRole);
      toast.success(`User role updated to ${newRole}!`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role');
    }
  };

  // Client-side filtering by name or email
  const filteredUsers = users.filter(u => {
    const email = u.email || '';
    const name = u.name || '';
    const query = search.toLowerCase();
    return email.toLowerCase().includes(query) || name.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold font-sora text-white">Manage Users</h2>
        <p className="text-sm text-gray-400">View registered users and manage authorization roles.</p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md relative">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-900 border border-gray-800 focus:border-amber-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-amber-555 h-8 w-8" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/10 border border-dashed border-gray-850 rounded-2xl">
          <Users size={48} className="mx-auto text-gray-655 mb-4" />
          <h3 className="text-lg font-bold mb-2">No users found</h3>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            There are no registered users matching your search keyword.
          </p>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-855 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-900/80 border-b border-gray-850 text-gray-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-white">{u.name || 'No Display Name'}</div>
                      <div className="text-xxs text-gray-505">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded text-xxs font-bold uppercase tracking-wider ${
                        u.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-gray-805 text-gray-400 border border-gray-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleRoleChange(u._id, u.role)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                          u.role === 'admin'
                            ? 'border-red-500/20 hover:border-red-550/40 text-red-400 bg-red-500/5 hover:bg-red-500/10'
                            : 'border-amber-500/20 hover:border-amber-550/40 text-amber-450 bg-amber-500/5 hover:bg-amber-500/10'
                        }`}
                      >
                        {u.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
