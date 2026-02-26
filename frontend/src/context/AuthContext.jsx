import { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const API = import.meta.env.VITE_API_URL || 'https://closekart.onrender.com/api';

        // Check token first if it exists
        if (token) {
            fetch(`${API}/profile/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then(res => {
                    if (!res.ok) throw new Error("Invalid token");
                    return res.json();
                })
                .then(data => setUser(data))
                .catch(() => {
                    localStorage.removeItem("token");
                    setUser(null);
                });
        }

        // Auth check for session cookies (Google Login)
        fetch("https://closekart.onrender.com/api/auth/me", {
            credentials: "include"
        })
            .then(res => res.json())
            .then(data => {
                if (data && data._id) {
                    setUser(data);
                }
            })
            .catch(err => console.error("Session check failed", err));

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
        <AuthContext.Provider value={{ user, setUser, loginStore, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
