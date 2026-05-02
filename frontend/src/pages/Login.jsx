import { useState } from "react";
import { useAuth } from "@context/AuthContext";
import { useNavigate } from "react-router-dom";
import Input from "@components/ui/Input";
import "@assets/css/Login.css";

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrors({});
        setIsLoading(true);

        try {
            const result = await login(email, password);

            if (result.success) {
                navigate('/');
            } else {
                setErrors({ submit: result.message });
            }
        // eslint-disable-next-line no-unused-vars
        } catch (error) {
            setErrors({ submit: "Une erreur est survenue. Veuillez réessayer." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1>Connexion</h1>

                {errors.submit && (
                    <div className="login-error">{errors.submit}</div>
                )}

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <Input
                            type="email"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="jean@exemple.fr"
                            error={errors.email}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <div className="login-form-group">
                        <Input
                            type="password"
                            label="Mot de passe"
                            variant="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Entrez votre mot de passe"
                            error={errors.password}
                            disabled={isLoading}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? "Connexion en cours..." : "Connexion"}
                    </button>
                </form>

                <div className="login-footer">
                    <p>
                        Pas encore inscrit ?{" "}
                        <a href="/register">S'enregistrer</a>
                    </p>
                </div>
            </div>
        </div>
    );
}