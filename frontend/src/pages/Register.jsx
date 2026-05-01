import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const result = await register(name, email, password, passwordConfirmation);

        if (result.success) {
            console.log('Compte créé !');
            navigate('/'); // Redirige vers la page d'accueil
        } else {
            alert(result.message); // Message d'erreur
        }
    }

    return(
        <form action="submit" onSubmit={handleSubmit}>
            <input
                id="name"
                type="text"
                placeholder="Nom"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
            />

            <input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
            />

            <input
                id="password"
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
            />

            <input
                id="passwordConfirmation"
                type="password"
                placeholder="Confirmation du mot de passe"
                value={passwordConfirmation}
                onChange={(event) => setPasswordConfirmation(event.target.value)}
                required
            />

            <button type="submit">Créer un compte</button>
        </form>
    )
}