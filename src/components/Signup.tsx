"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { Lock, Mail, Eye, EyeOff, User } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import api from "../../lib/axios";

interface SignupProps {
  onShowLogin: () => void;
  onSignup: () => void;
}

export function Signup({ onSignup, onShowLogin }: SignupProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  /* SEND OTP */
  const sendOtp = async () => {
    if (!email) return toast.error("Please enter email");
    try {
      setOtpLoading(true);
      await api.post("/api/v1/admin/auth/sendAdminEmailOtp", { email });
      toast.success("OTP sent to your email");
      setOtpSent(true);
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  /* VERIFY OTP */
  const verifyOtp = async () => {
    if (otp.length !== 6) return toast.error("Enter 6 digit OTP");
    try {
      setOtpLoading(true);
      const res = await api.post("/api/v1/admin/auth/verifyAdminEmailOtp", { email, otp });
      if (res.data.success) {
        toast.success("Email verified");
        setOtpVerified(true);
      }
    } catch {
      toast.error("Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  /* SUBMIT */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!agree) {
      toast.error("You must agree to the Terms and Privacy Policy");
      setIsLoading(false);
      return;
    }

    if (!otpVerified) {
      toast.error("Please verify your email first");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/api/v1/admin/auth/registerAdminUser', { name, email, password });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      onSignup();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center">
            <h1 className="sidebar-logo" />
          </div>
          <p className="text-muted-foreground mt-2 mb-2 text-sm sm:text-base">
            Create your admin account
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-card border-border">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">

            {/* NAME */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm sm:text-base">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-muted border-border text-sm sm:text-base h-10 sm:h-11"
                  required
                />
              </div>
            </div>

            {/* EMAIL + SEND OTP BUTTON */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={otpVerified}
                  className="pl-10 bg-muted border-border text-sm sm:text-base h-10 sm:h-11"
                  required
                />
              </div>

              {!otpSent && (
                <Button
                  type="button"
                  disabled={otpLoading}
                  onClick={sendOtp}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-9 text-xs sm:text-sm"
                >
                  {otpLoading ? "Sending..." : "Send OTP"}
                </Button>
              )}
            </div>

            {/* OTP BOX */}
            {otpSent && !otpVerified && (
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm">Enter OTP</Label>
                <div className="flex gap-2">
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="6 digit OTP"
                    className="text-sm h-10"
                  />
                  <Button
                    type="button"
                    disabled={otpLoading}
                    onClick={verifyOtp}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 text-xs"
                  >
                    {otpLoading ? "Verifying..." : "Verify"}
                  </Button>
                </div>
              </div>
            )}

            {/* VERIFIED BADGE */}
            {otpVerified && (
              <p className="text-xs text-green-500">✔ Email Verified</p>
            )}

            {/* PASSWORD */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm sm:text-base">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 bg-muted border-border text-sm sm:text-base h-10 sm:h-11"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* TERMS */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="agree"
                checked={agree}
                onCheckedChange={(checked) => setAgree(checked as boolean)}
                className="size-3.5 border-border data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground cursor-pointer"
              />
              <label htmlFor="agree" className="text-xs cursor-pointer">
                I agree to the Terms & Privacy Policy
              </label>
            </div>

            {/* SUBMIT */}
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 sm:h-11 text-sm sm:text-base"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* LOGIN LINK */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Already have an account?{" "}
              <button className="text-primary hover:underline cursor-pointer" onClick={onShowLogin}>
                Sign in here
              </button>
            </p>
          </div>
        </Card>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          © 2025 ePress Note. All rights reserved.
        </div>
      </div>
    </div>
  );
}
