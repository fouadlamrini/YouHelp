import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function OAuthSuccess() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const rawUser = params.get("user");
    console.log("[oauth-success] query received", {
      hasToken: Boolean(token),
      hasUser: Boolean(rawUser),
      queryLength: window.location.search.length,
    });

    if (!token || !rawUser) {
      navigate("/login?oauth=failed&reason=missing_oauth_params", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(rawUser);
      console.log("[oauth-success] parsed user", {
        id: user?.id,
        provider: user?.provider,
        completeProfile: user?.completeProfile,
      });
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      if (user?.completeProfile) {
        navigate("/posts", { replace: true });
      } else {
        navigate("/complete-profile", { replace: true });
      }
    } catch (error) {
      console.error("[oauth-success] parse/store error", error);
      navigate("/login?oauth=failed&reason=oauth_success_parse_error", { replace: true });
    }
  }, [navigate, setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-sm font-semibold text-slate-600">Connexion en cours...</p>
    </div>
  );
}

export default OAuthSuccess;
