"use client";
import {  useState } from "react";
import React from "react";
import { nhost } from "../../lib/nhost";

const Login = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [nError, setnError] = useState("");

  const handleMagicLinkLogin = async () => {
    try {
      const res = await nhost.auth.signIn({ email: email });
      if (res.error) {
        setnError("Error Found");
      } else {
        setMessage("Check your email for the magic link!");
      }
    } catch (error) {
      setnError("An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Login with Magic Link
        </h2>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            onClick={handleMagicLinkLogin}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Send Magic Link
          </button>
        </div>
        <p className={`mt-4 text-sm ${message ? 'text-green-500' : nError ? 'text-red-500' : 'hidden'}`}>
          {message || nError}
        </p>

      </div>
    </div>
  );
};

export default Login;
