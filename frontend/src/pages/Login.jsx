import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
export default function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (event) => {
        // sert a ne pas actualiser la page
        event.preventDefault();
        const result = await login(email, password); // Appel de la fonction[cite: 1]

        if (result.success) {
            navigate('/');
        } else {
            alert(result.message);
        }
    }
    return (
        <form action="submit" onSubmit={handleSubmit}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
            />

            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required
            />
            <button>Ajouter +</button>
        </form>
    )
}