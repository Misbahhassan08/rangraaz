import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    setFormData({name: "", phone: "", password: "", address: "" });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(formData);
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignUp) {
      try {
       const response = await fetch(URLS.signup, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Sign-Up Error:", errorData);
          return;
        }

        const data = await response.json();
        console.log("Sign-Up Success:", data);
        toggleForm(); // Switch to Sign-In after Sign-Up
      } catch (error) {
        console.error("Network or server error during Sign-Up:", error);
      }
    } else {
      try {
      const response = await fetch(URLS.signin, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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

        if (data.user.role === "Admin") {
          navigate("/dashboard");
        }
        else{
          navigate("/");
        }
      } catch (error) {
        console.error("Network or server error during Sign-In:", error);
        alert("Sign-In error. Check console for details.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-2xl  mb-6 text-center">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              name="name"
              placeholder="Username"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border text-xs tracking-widest border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          )}
          <input
            type="number"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border text-xs tracking-wider border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 text-xs tracking-wider border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          {isSignUp && (
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 text-xs tracking-wider border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          )}

          <button
            type="submit"
            className="w-full tracking-wider bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm tracking-wider text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
          <button
            onClick={toggleForm}
            className="ml-1 text-blue-500 hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
