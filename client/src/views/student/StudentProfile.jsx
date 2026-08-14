import { useAuth } from '../../context/AuthContext';

export default function StudentProfile() {
  const { user } = useAuth();
  
  return (
    <div style={{ padding: '1rem' }}>
      <h1>My Profile</h1>
      <p>Student: {user?.name}</p>
    </div>
  );
}
