import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeSnapshot = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            console.log("[AuthContext] Firebase User State:", currentUser?.uid || "null");
            setUser(currentUser);
            if (currentUser) {
                const docRef = doc(db, 'users', currentUser.uid);
                unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        console.log("[AuthContext] Firestore Profile Synced | Role:", data.role);
                        setProfile(data);
                        setRole(data.role || null);
                    } else {
                        console.log("[AuthContext] Profile Missing entirely from Firestore.");
                        setProfile(null);
                        setRole(null);
                    }
                    console.log("[AuthContext] Loading Resolved -> false");
                    setLoading(false);
                }, (error) => {
                    console.error('[AuthContext] Error fetching user profile:', error);
                    setLoading(false);
                });
            } else {
                console.log("[AuthContext] Purging states immediately.");
                setProfile(null);
                setRole(null);
                setLoading(false);
                if (unsubscribeSnapshot) {
                    unsubscribeSnapshot();
                    unsubscribeSnapshot = null;
                }
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeSnapshot) unsubscribeSnapshot();
        };
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            setUser(null);
            setProfile(null);
            setRole(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const value = {
        user,
        profile,
        role,
        loading,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
