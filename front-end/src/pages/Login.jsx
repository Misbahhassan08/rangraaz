import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { ArrowRight, LockKeyhole, MapPin, Phone, Sparkles, UserRound } from "lucide-react";
import URLS from "../urls";

const Login = () => {
  const navigate = useNavigate();

  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    address: "",
  });

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
    setFormData({ name: "", phone: "", password: "", address: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const googleToken = credentialResponse.credential;
    if (!googleToken) {
      alert("Google login failed");
      return;
    }
    try {
      const res = await fetch(URLS.GOOGLE_LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: googleToken }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));

        const role = data.user?.role ? data.user.role.toLowerCase() : "";
        if (role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      } else {
        alert("Google login failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during Google login.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      try {
        const response = await fetch(URLS.signup, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Sign-Up Error:", errorData);
          return;
        }

        const data = await response.json();
        console.log("Sign-Up Success:", data);

        localStorage.setItem("user", JSON.stringify(data.user || {}));

        const role = data.user?.role ? data.user.role.toLowerCase() : "customer";

        if (role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
        toggleForm();
      } catch (error) {
        console.error("Network or server error during Sign-Up:", error);
      }
    } else {
      try {
        const response = await fetch(URLS.signin, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: formData.phone,
            password: formData.password,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Sign-In Error:", errorData);
          return;
        }

        const data = await response.json();
        console.log("Sign-In Success:", data);

        localStorage.setItem("user", JSON.stringify(data.user || {}));

        // Safe role checking
        const role = data.user?.role ? data.user.role.toLowerCase() : "customer";

        if (role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Network or server error during Sign-In:", error);
        alert("Sign-In error. Check console for details.");
      }
    }
  };

  const inputClass =
    "w-full rounded-xl border border-purple-100 bg-white/85 px-4 py-3 pl-11 text-sm font-light text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:border-fuchsia-300 focus:bg-white focus:ring-4 focus:ring-fuchsia-100";

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fbf9fc] px-4 py-10">
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(75,0,220,0.09),transparent_34%,rgba(239,26,212,0.1)_72%,transparent)]" />
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl" />
      <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-fuchsia-200/35 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="animate-fade-up hidden lg:block">
          <div className="max-w-xl">
            <img src="/img/logo.png" alt="Rang Raaz" className="mb-8 h-28 w-auto animate-float-soft" />
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-white/70 px-4 py-2 text-xs font-light uppercase tracking-[0.22em] text-purple-700 shadow-sm">
              <Sparkles size={14} />
              Embrace colors Made for you!
            </p>
            <h1 className="font-display text-5xl font-medium leading-tight text-[#2f1738] xl:text-6xl">
              A brighter way to enter your wardrobe.
            </h1>
            <p className="mt-5 max-w-lg text-base font-light leading-8 text-gray-600">
              Sign in to continue shopping curated Pakistani fashion, manage your cart,
              and keep your favorite pieces close.
            </p>
          </div>
        </section>

        <section className="brand-glass animate-fade-up mx-auto w-full max-w-md rounded-3xl p-6 sm:p-8">
          <div className="mb-7 text-center">
            <img src="/img/logo.png" alt="Rang Raaz" className="mx-auto mb-5 h-16 w-auto lg:hidden" />
            <p className="text-xs font-light uppercase tracking-[0.24em] text-purple-600">
              Embrace colors Made for you!
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium text-[#2f1738]">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <label className="relative block">
                <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </label>
            )}

            <label className="relative block">
              <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone number"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </label>

            <label className="relative block">
              <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </label>

            {isSignUp && (
              <label className="relative block">
                <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-400" />
                <input
                  type="text"
                  name="address"
                  placeholder="Delivery address"
                  value={formData.address}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </label>
            )}

            <button
              type="submit"
              className="btn-brand group flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all hover:-translate-y-0.5"
            >
              <span className="relative z-10">{isSignUp ? "Create Account" : "Sign In"}</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-purple-100" />
            <span className="text-[11px] font-light uppercase tracking-[0.18em] text-gray-400">or</span>
            <span className="h-px flex-1 bg-purple-100" />
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Google login failed")}
              type="standard"
              shape="pill"
              theme="outline"
              size="large"
              text={isSignUp ? "signup_with" : "signin_with"}
              width="320"
            />
          </div>

          <p className="mt-6 text-center text-sm font-light text-gray-600">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={toggleForm}
              className="ml-1 font-medium text-purple-600 transition-colors hover:text-fuchsia-600"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;
