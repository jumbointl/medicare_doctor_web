import { createContext, useEffect, useMemo, useState } from "react";
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

        if (!res?.status || !res?.data?.user || !res?.data?.doctor) {
          clearSession();
          setUser(null);
          setDoctor(null);
        } else {
          setUser(res.data.user);
          setDoctor(res.data.doctor);
        }
      } catch (_) {
        clearSession();
        setUser(null);
        setDoctor(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      user,
      doctor,
      loading,
      isAuthenticated: !!user,

      async loginWithPassword(payload) {
        const res = await loginDoctor(payload);

        if (!res?.status || !res?.token || !res?.data?.user || !res?.data?.doctor) {
          throw new Error(res?.message || "Login failed.");
        }

        saveSession(res.token);
        setUser(res.data.user);
        setDoctor(res.data.doctor);

        return res;
      },

      async loginWithGoogle(payload) {
        const res = await loginDoctorGoogle(payload);

        if (!res?.status || !res?.token || !res?.data?.user || !res?.data?.doctor) {
          throw new Error(res?.message || "Google login failed.");
        }

        saveSession(res.token);
        setUser(res.data.user);
        setDoctor(res.data.doctor);

        return res;
      },

      async logout() {
        try {
          await logoutDoctor();
        } catch (_) {
          // ignore logout network errors
        } finally {
          clearSession();
          setUser(null);
          setDoctor(null);
        }
      },
    }),
    [user, doctor, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}