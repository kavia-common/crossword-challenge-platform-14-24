import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// PUBLIC_INTERFACE
export function useAuth() {
  /** Access auth state and actions */
  return useContext(AuthContext);
}
