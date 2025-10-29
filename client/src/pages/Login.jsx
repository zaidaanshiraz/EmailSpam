import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login as loginApi } from "../api/auth";
import "./auth.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    const onSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const data = await loginApi({ email, password });
            localStorage.setItem("token", data.token);
            const dest = location.state?.from?.pathname || "/";
            navigate(dest, { replace: true });
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-wrapper">
                <div className="auth-card">
                    <div className="auth-title">Login</div>
                    {error ? <div className="auth-error">{error}</div> : null}
                    <form onSubmit={onSubmit}>
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
                        <div className="auth-actions">
                            <Link className="auth-link" to="#">Forgot password?</Link>
                            <span />
                        </div>
                        <button className="auth-primary" type="submit">Login</button>
                    </form>

                    <div className="auth-foot">
                        Don’t have an account? <Link className="auth-link" to="/register">Signup</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;


