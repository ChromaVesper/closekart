import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("https://closekart.onrender.com/api/auth/me", {
                    credentials: "include"
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.log("Auth check failed:", err);
                setUser(null);
            } finally {
                setLoading(false);
            }

        };

        checkAuth();
    }, []);

    // Also support manual inject for login pages directly
    const loginStore = (dataToken, dataUser) => {
        localStorage.setItem("token", dataToken);
        setUser(dataUser);
    }

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loginStore, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
