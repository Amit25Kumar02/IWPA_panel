"use client";

import { useState } from "react";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface LoginProps {
  onLogin: () => void;
}

export function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (
        email === "iwpa@gmail.com" &&
        password === "iwpa@123"
      ) {
        localStorage.setItem("token", "dummy-token");
        localStorage.setItem(
          "user",
          JSON.stringify({ name: "Admin User", email })
        );
        onLogin();
      } else {
        setError("Invalid email or password");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-[#0B3C5D] to-[#0B3C5D] px-4">
      <div className="w-full max-w-md">
        <Card className="p-6 rounded-xl shadow-xl bg-[#FFFFFF] border-[0.76px] border-[#E5E7EB]">
          {/* Logo */}
          <div className="flex">
            <img src="/iwpa_logo.png" alt="IWPA Logo" className="h-11 w-14" />
          </div>
          <h2 className="font-bold text-[#242424] text-[25px]">
            Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block font-['Figtree'] font-normal text-[12.784px] leading-[18.263px] text-[#242424]"
              >
                Email / Member ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#99A1AF]" />
                <Input
                  className="pl-10 h-10 bg-[#F8FAFC] border-[#E5E7EB] text-[#101828]"
                  placeholder="Enter your email or member ID"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block font-['Figtree'] font-normal text-[12.784px] leading-[18.263px] text-[#242424]"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5565]" />
                <Input
                  className="pl-10 pr-10 h-10 bg-[#F8FAFC] border-[#E5E7EB] text-[#101828]"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5565]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}

            {/* Remember / Forgot */}
            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-[7.305px] cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-[11.871px] h-[11.871px] border-[1px] border-[#c9c9c9] rounded-[2.739px] appearance-none checked:bg-[#1F7A4D] checked:border-[#1F7A4D] cursor-pointer mt-1"
                  />
                  {rememberMe && (
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="font-['Figtree'] font-normal text-[14.611px] leading-[21.916px] text-[#4a5565]">
                  Remember me
                </span>
              </label>
              <button type="button" className="font-normal text-[14.611px] leading-[21.916px] text-[#1f7a4d] hover:underline cursor-pointer">
                Forgot Password?
              </button>
            </div>

            {/* Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#1F7A4D] hover:bg-[#1F7A4D]/90 text-white"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Help */}
          <p className="text-center text-[#4A5565] text-xs mt-4">
            Need help? Contact <span className="text-[#1F7A4D] font-medium">support@iwpa.org</span>
          </p>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-[#D3D3D3] mt-6">
          © 2025 Indian Wind Power Association. All rights reserved
        </p>
      </div>
    </div>
  );
}