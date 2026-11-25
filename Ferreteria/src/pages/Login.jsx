import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import { getRole } from "../components/ProtectedRoute";

function Permisos() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [permisos, setPermisos] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      const token = await getAccessTokenSilently();
      const decoded = jwtDecode(token);
      console.log(decoded); // para ver el token completo
      setPermisos(decoded.permissions || []);
    })();
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <ul>
      {permisos.map((p) => <li key={p}>{p}</li>)}
    </ul>
  );
}


function Login() {
  const {
    isLoading, // Loading state, the SDK needs to reach Auth0 on load
    isAuthenticated,
    error,
    loginWithRedirect: login, // Starts the login flow
    logout: auth0Logout, // Starts the logout flow
    user, // User profile
  } = useAuth0();
  const signup = () =>
    login({ authorizationParams: { screen_hint: "signup" } });

  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });

  if (isLoading) return "Loading...";

  return isAuthenticated ? (
    <>
      <p>Logged in as {user.email}</p>

      <h1>User Profile</h1>

      <pre>{JSON.stringify(user, null, 2)}</pre>
      <Permisos />

      {getRole(user.email) === "admin" && <Link to="/admin">Ir al panel admin</Link>}

      <button onClick={logout}>Logout</button>
    </>
  ) : (
    <>
      {error && <p>Error: {error.message}</p>}

      <button onClick={signup}>Signup</button>

      <button onClick={login}>Login</button>
    </>
  );
}

export default Login;
