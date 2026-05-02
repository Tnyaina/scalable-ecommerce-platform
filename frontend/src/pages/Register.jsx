import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import Input from "@components/ui/Input";
import "@assets/css/Register.css";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const passwordsMatch =
        passwordConfirmation.length > 0 && password === passwordConfirmation;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!passwordsMatch) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        setError("");
        setLoading(true);
        const result = await register(name, email, password, passwordConfirmation);
        setLoading(false);
        if (result.success) {
            navigate("/");
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="register-container">
            <div className="register-card">
                <h1 className="register-title">Créer un compte</h1>

                <form className="register-form" onSubmit={handleSubmit} noValidate>
                    {error && <p className="register-error">{error}</p>}

                    <Input
                        id="name"
                        type="text"
                        label="Nom complet"
                        placeholder="Jean Dupont"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <Input
                        id="email"
                        type="email"
                        label="Adresse email"
                        placeholder="vous@exemple.fr"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <hr className="register-divider" />

                    <Input
                        id="password"
                        type="password"
                        label="Mot de passe"
                        placeholder="Minimum 8 caractères"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        hint={
                            password.length > 0 && password.length < 8
                                ? "Trop court (8 caractères min.)"
                                : undefined
                        }
                        required
                    />

                    <Input
                        id="passwordConfirmation"
                        type="password"
                        label="Confirmation"
                        placeholder="Répétez le mot de passe"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        success={passwordsMatch}
                        hint={
                            passwordConfirmation.length > 0 && !passwordsMatch
                                ? "Ne correspond pas"
                                : passwordsMatch
                                    ? "Les mots de passe correspondent"
                                    : undefined
                        }
                        required
                    />

                    <button
                        type="submit"
                        className="register-btn"
                        disabled={loading}
                    >
                        {loading ? "Création…" : "Créer un compte"}
                    </button>
                </form>

                <p className="register-footer">
                    Déjà un compte ?{" "}
                    <Link to="/login" className="register-link">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}