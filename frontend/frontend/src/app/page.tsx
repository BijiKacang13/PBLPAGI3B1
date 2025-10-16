'use client';

import { useEffect, useState } from 'react';

type User = {
  id_user: number;
  nama: string;
  username: string;
  role: string;
};

export default function HomePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`); // URL API Laravel
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Gagal fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>👤 Daftar User dari Laravel API</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id_user}>
              <strong>{user.nama}</strong> — {user.username} ({user.role})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
