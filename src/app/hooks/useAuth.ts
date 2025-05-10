import { useState, useEffect } from "react";

export const useAuth = () => {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const getCookie = (name: string): string | null => {
    if (typeof window === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length >= 2) {
      const raw = parts.pop()!.split(";").shift()!;
      return decodeURIComponent(raw);
    }
    return null;
  };

  useEffect(() => {
    const userName = getCookie("name");
    const userEmail = getCookie("email");
    const token = getCookie("userId");

    if (token && userName && userEmail) {
      setUser({ name: userName, email: userEmail });
    }
    setIsLoading(false);
  }, []);

  const logout = () => {
    document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    setUser(null);
  };

  return { user, isLoading, logout };
};
