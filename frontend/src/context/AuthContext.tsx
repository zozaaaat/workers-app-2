import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type UserRole = "admin" | "manager" | "employee";
export interface User {
  username: string;
  role: UserRole;
}
export interface ActivityLog {
  user: string;
  action: string;
  date: string;
}

export type Permission = "view" | "add" | "edit" | "delete";

export const rolePermissions: Record<UserRole, Permission[]> = {
  admin: ["view", "add", "edit", "delete"],
  manager: ["view", "add", "edit"],
  employee: ["view"],
};

interface AuthContextType {
  user: User | null;
  login: (username: string, role: UserRole) => void;
  logout: () => void;
  activityLog: ActivityLog[];
  addActivity: (action: string) => void;
}

const AuthContext = createContext<AuthContextType & { permissions: Permission[] }>({
  user: null,
  login: () => {},
  logout: () => {},
  activityLog: [],
  addActivity: () => {},
  permissions: [],
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  const login = (username: string, role: UserRole) => {
    setUser({ username, role });
    addActivity(`تسجيل دخول (${role})`);
  };
  const logout = () => {
    addActivity("تسجيل خروج");
    setUser(null);
  };
  const addActivity = (action: string) => {
    if (user) {
      setActivityLog((prev) => [
        { user: user.username, action, date: new Date().toLocaleString() },
        ...prev,
      ]);
    }
  };

  const permissions = user ? rolePermissions[user.role] : [];

  return (
    <AuthContext.Provider value={{ user, login, logout, activityLog, addActivity, permissions }}>
      {children}
    </AuthContext.Provider>
  );
};
