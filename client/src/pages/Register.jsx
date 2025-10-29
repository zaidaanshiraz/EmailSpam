import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi } from "../api/auth";
import "./auth.css";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const data = await registerApi({ email, password, name });
            localStorage.setItem("token", data.token);
            navigate("/", { replace: true });
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-title">Signup</div>
                    {error ? <div className="auth-error">{error}</div> : null}
                    <form onSubmit={onSubmit}>
                        <div className="auth-field">
                            <label>Name</label>
                            <input
                                className="auth-input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="auth-field">
                            <label>Email</label>
                            <input
                                className="auth-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="auth-field">
                            <label>Password</label>
                            <input
                                className="auth-input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button className="auth-primary" type="submit">Signup</button>
                    </form>

                    <div className="auth-foot">
                        Already have an account? <Link className="auth-link" to="/login">Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;


