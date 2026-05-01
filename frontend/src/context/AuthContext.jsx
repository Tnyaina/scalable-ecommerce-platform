import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios"; // Ton instance Axios

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, _setToken] = useState(localStorage.getItem('access_token'));

    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem('access_token', token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            localStorage.removeItem('access_token');
            delete api.defaults.headers.common['Authorization'];
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error("Erreur logout", e);
        } finally {
            setToken(null);
            setUser(null);
        }
    };

    //  Récupérer l'utilisateur au démarrage ou si le token change
    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const response = await api.get('/user');
                    setUser(response.data.user);
                } catch (error) {
                    logout(); // Si le token est invalide, on déconnecte
                }
            }
        };
        fetchUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            const { access_token, user } = response.data;
            setToken(access_token);
            setUser(user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Erreur de connexion"
            };
        }
    };

    const register = async (name, email, password, password_confirmation) => {
        try {
            const response = await api.post('/register', { name, email, password, password_confirmation });
            const { access_token, user } = response.data;
            setToken(access_token);
            setUser(user);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || "Erreur d'enregistrement"
            };
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);