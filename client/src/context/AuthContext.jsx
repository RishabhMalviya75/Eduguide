import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Wait for local storage check

  // Initialize from local storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('eduguide_token');
    const storedUser = localStorage.getItem('eduguide_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Staff Login (Admin / Teacher)
  const loginStaff = async (email, password) => {
    try {
      const response = await api.post('/auth/staff/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      setToken(newToken);
      setUser(userData);
      
      localStorage.setItem('eduguide_token', newToken);
      localStorage.setItem('eduguide_user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Student Verify Identity (Step 1)
  const verifyStudentIdentity = async (school_code, roll_no, dob) => {
    try {
      const response = await api.post('/auth/student/verify-identity', { school_code, roll_no, dob });
      // Returns identity_token, student_name, message
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Student Set PIN (Step 2)
  const setStudentPin = async (identity_token, pin) => {
    try {
      const response = await api.post('/auth/student/set-pin', { identity_token, pin });
      const { token: newToken, student: studentData } = response.data;
      
      const userData = { ...studentData, role: 'Student' };
      setToken(newToken);
      setUser(userData);
      
      localStorage.setItem('eduguide_token', newToken);
      localStorage.setItem('eduguide_user', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Student Login with PIN (Standard)
  const loginStudent = async (school_code, roll_no, pin) => {
    try {
      const response = await api.post('/auth/student/login', { school_code, roll_no, pin });
      const { token: newToken, student: studentData } = response.data;
      
      const userData = { ...studentData, role: 'Student' };
      setToken(newToken);
      setUser(userData);
      
      localStorage.setItem('eduguide_token', newToken);
      localStorage.setItem('eduguide_user', JSON.stringify(userData));
      
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('eduguide_token');
    localStorage.removeItem('eduguide_user');
  };

  const updateConsent = () => {
    if (user) {
      const updatedUser = { ...user, consent_flag: true };
      setUser(updatedUser);
      localStorage.setItem('eduguide_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      loginStaff,
      verifyStudentIdentity,
      setStudentPin,
      loginStudent,
      logout,
      updateConsent
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
