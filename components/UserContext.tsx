
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import type { UserProfile } from "@/types/user";

type UserContextType = {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);


export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  // On mount, load user from localStorage if present
  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("userProfile") : null;
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  // Whenever user changes, update localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (user) {
      localStorage.setItem("userProfile", JSON.stringify(user));
    } else {
      localStorage.removeItem("userProfile");
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used within a UserProvider");
  return context;
}
