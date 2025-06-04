'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getAllUsers, createUser } from '@/lib/db/queries';
import { type User } from '@/lib/db/schema';

const DatabaseExample = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail) return;

    try {
      setLoading(true);
      await createUser({
        email: newUserEmail,
        name: newUserName || undefined,
      });
      setNewUserEmail('');
      setNewUserName('');
      await loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">Database Example</h2>
      
      <form onSubmit={handleCreateUser} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Input
            type="text"
            placeholder="Name (optional)"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create User'}
        </Button>
      </form>

      <div>
        <h3 className="text-lg font-semibold mb-4">Users</h3>
        <Button onClick={loadUsers} disabled={loading} className="mb-4">
          {loading ? 'Loading...' : 'Refresh Users'}
        </Button>
        
        {users.length === 0 ? (
          <p className="text-gray-500">No users found</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="p-4 border rounded-lg">
                <p><strong>Email:</strong> {user.email}</p>
                {user.name && <p><strong>Name:</strong> {user.name}</p>}
                <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseExample; 