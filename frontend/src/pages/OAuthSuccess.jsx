import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuthSuccess() {
    const navigate = useNavigate();
    const [params] = useSearchParams();

    useEffect(() => {
        const token = params.get("token");

        if (token) {
            localStorage.setItem("token", token);
            navigate("/");
        } else {
            navigate("/login");
        }
    }, []);

    return <div>Logging you in...</div>;
}
