import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getMe,
  loginDoctor,
  loginDoctorGoogle,
  logoutDoctor,
} from "../api/authApi";
import {
  getAccessToken,
  saveSession,
  clearSession,
} from "../utils/tokenStorage";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getAccessToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await getMe();

        if (!res?.status || !res?.data || !res?.data?.doctor) {
          clearSession();
          setUser(null);
          setDoctor(null);
        } else {
          setUser(res.data);
          setDoctor(res.data.doctor);
        }
      } catch (error) {
        clearSession();
        setUser(null);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const loginWithPassword = async (payload) => {
    const res = await loginDoctor(payload);

    if (!res?.status || !res?.token || !res?.data || !res?.data?.doctor) {
      throw new Error(res?.message || "Login failed.");
    }

    saveSession(res.token);
    setUser(res.data);
    setDoctor(res.data.doctor);

    return res;
  };

  const loginWithGoogle = async (payload) => {
    const res = await loginDoctorGoogle(payload);

    if (!res?.status || !res?.token || !res?.data || !res?.data?.doctor) {
      throw new Error(res?.message || "Google login failed.");
    }

    saveSession(res.token);
    setUser(res.data);
    setDoctor(res.data.doctor);

    return res;
  };

  const logout = async () => {
    try {
      await logoutDoctor();
    } catch (error) {
      // ignore logout network errors
    } finally {
      clearSession();
      setUser(null);
      setDoctor(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      doctor,
      loading,
      isAuthenticated: !!user,
      loginWithPassword,
      loginWithGoogle,
      logout,
      setUser,
      setDoctor,
    }),
    [user, doctor, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}