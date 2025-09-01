import React from 'react';
import AdminPanel from '../components/AdminPanel';
import { useAuth } from '../hooks/useAuth';

// PUBLIC_INTERFACE
export default function AdminPage() {
  /** Admin dashboard */
  const { isAdmin } = useAuth();
  return (
    <div style={{ padding: 16 }}>
      {isAdmin ? <AdminPanel /> : <div>You must be an admin to view this page.</div>}
    </div>
  );
}
