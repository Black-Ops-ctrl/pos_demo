import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/api/loginApi";
import { BookOpen, Eye, EyeOff } from "lucide-react";
import metabooksLogo from "@/assets/metabooks-logo.png";

const Login: React.FC = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Checking sessionStorage for the token for consistency
    const token = sessionStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await loginUser(username, password);
      if (res.success) {
        
        // --- START: 2-Minute Inactivity Timeout Calculation ---
        // 2 minutes in milliseconds = 120,000 ms
        const INACTIVITY_TIMEOUT_MS = 3600000;
        const expirationTime = Date.now() + INACTIVITY_TIMEOUT_MS;
        // --- END: 2-Minute Inactivity Timeout Calculation ---
        
        // Store auth state in sessionStorage
        sessionStorage.setItem("token", res.token);
        sessionStorage.setItem("user", JSON.stringify(res.user));
        sessionStorage.setItem("isAuthenticated", "true");
        // NEW: Store the timestamp when the session should initially expire (2 minutes from now)
        sessionStorage.setItem("sessionExpiration", expirationTime.toString());

        // Store the user's name in localStorage for the dashboard
        const userNameForDashboard = res.user.name || res.user.username || username;
        localStorage.setItem("userNameForDashboard", userNameForDashboard);
        
        navigate("/");
      } else {
        setError(res.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm">
        {/* Logo and Title */}
        <div className="text-left">
          
          <div className="flex items-center space-x-2">
            <img src={metabooksLogo} alt="MetaBooks Logo" className="h-11 w-11" />
             <h1 className="text-4xl text-blue-600 font-bold">MetaBooks</h1>
            
          </div>
          <span className=" text-gray-500 ml-12">ERP</span>
        </div>
        {/* Card */}
        <form
          onSubmit={handleLogin}
          className="bg-white p-6 space-y-5 "
        >
          {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <span
            className="text-3xl font-semibold mb-4"
            >
              LogIn
            </span>
          {/* Username */}
          <div
          
          >
            <Input
             className="bg-white rounded-none h-10 "
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Input
              className="bg-white rounded-none h-10"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-500" />
              ) : (
                <Eye className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <Button
          
          type="submit" className="w-full " disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

      </div>
    </div>
  );
};

export default Login;
