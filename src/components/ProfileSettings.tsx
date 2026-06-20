import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { C } from "../lib/constants";
import { Card, Button } from "./UI";

interface DbProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  plan: string;
}

interface ProfileSettingsProps {
  user: DbProfile;
  onRefreshUser: () => void;
  onNavigateToPricing: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onRefreshUser, onNavigateToPricing }) => {
  // Personal Info States
  const [fullName, setFullName] = useState(user.full_name || "");
  const [role, setRole] = useState(user.role || "Student");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password Change States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  const roles = [
    "Tax Consultant",
    "Lawyer",
    "Student",
    "Business Owner",
    "Accountant",
    "Other"
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess("");
    setProfileError("");

    if (!fullName.trim()) {
      setProfileError("Full Name is required.");
      setProfileLoading(false);
      return;
    }

    try {
      // 1. Update public.users table in database
      const { error: dbError } = await supabase
        .from("users")
        .update({
          full_name: fullName.trim(),
          role: role
        })
        .eq("id", user.id);

      if (dbError) throw dbError;

      // 2. Update Supabase Auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          role: role
        }
      });

      if (authError) throw authError;

      setProfileSuccess("Profile updated successfully!");
      onRefreshUser();
    } catch (err: any) {
      setProfileError(err?.message || "Failed to update profile.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassSuccess("");
    setPassError("");

    if (newPassword.length < 8) {
      setPassError("Password must be at least 8 characters long.");
      setPassLoading(false);
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPassError("Password must contain at least one uppercase letter.");
      setPassLoading(false);
      return;
    }

    if (!/[0-9]/.test(newPassword)) {
      setPassError("Password must contain at least one number.");
      setPassLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("Passwords do not match.");
      setPassLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      setPassSuccess("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPassError(err?.message || "Failed to change password.");
    } finally {
      setPassLoading(false);
    }
  };

  // Inline premium style helpers
  const inputContainerStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
    marginBottom: 18,
    textAlign: "left" as const,
  };

  const labelStyle = {
    fontSize: "0.8rem",
    fontWeight: 700,
    color: C.navy,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 10,
    border: `1.5px solid ${C.border}`,
    fontSize: "0.9rem",
    color: C.navy,
    background: C.white,
    outline: "none",
    transition: "all 0.2s ease",
    boxSizing: "border-box" as const,
    fontFamily: "inherit",
  };

  const disabledInputStyle = {
    ...inputStyle,
    background: "#F3F4F6",
    color: "#9CA3AF",
    cursor: "not-allowed",
    border: "1.5px solid #E5E7EB",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32, animation: "fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards" }}>
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: C.navy, letterSpacing: "-0.02em", marginBottom: 6 }}>
          Profile & Settings
        </h1>
        <p style={{ color: C.muted, fontSize: "0.875rem", fontWeight: 500 }}>
          Manage your personal details, secure your account, and view subscription status.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
        
        {/* Left Side: Personal Details */}
        <Card style={{ padding: 28, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E6F5F2", color: C.teal, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
              👤
            </div>
            <div>
              <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: C.navy, margin: 0 }}>Personal details</h2>
              <span style={{ fontSize: "0.75rem", color: C.muted, fontWeight: 500 }}>Update your name and career role</span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div style={inputContainerStyle}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                style={inputStyle}
              />
            </div>

            <div style={inputContainerStyle}>
              <label style={labelStyle}>Email Address (Read-only)</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  style={disabledInputStyle}
                />
                <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", color: "#9CA3AF" }}>
                  🔒
                </span>
              </div>
              <span style={{ fontSize: "0.72rem", color: C.muted, marginTop: 4 }}>
                For security reasons, changing your email is managed under account recovery.
              </span>
            </div>

            <div style={inputContainerStyle}>
              <label style={labelStyle}>Professional Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                style={{
                  ...inputStyle,
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E\")",
                  backgroundPosition: "right 12px center",
                  backgroundSize: "20px",
                  backgroundRepeat: "no-repeat",
                  paddingRight: 40
                }}
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {profileError && (
              <div style={{ background: C.redLight, border: `1px solid ${C.red}`, color: C.red, padding: "10px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 500, marginBottom: 16 }}>
                ⚠️ {profileError}
              </div>
            )}

            {profileSuccess && (
              <div style={{ background: C.greenLight, border: `1px solid ${C.green}`, color: C.green, padding: "10px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 500, marginBottom: 16 }}>
                ✓ {profileSuccess}
              </div>
            )}

            <Button
              disabled={profileLoading}
              style={{ width: "100%", justifyContent: "center", padding: "12px 0", marginTop: 8 }}
            >
              {profileLoading ? "Saving Changes..." : "Save Details"}
            </Button>
          </form>
        </Card>

        {/* Right Side: Security & Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Card 1: Change Password */}
          <Card style={{ padding: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FEF3CD", color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
                🔑
              </div>
              <div>
                <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: C.navy, margin: 0 }}>Change Password</h2>
                <span style={{ fontSize: "0.75rem", color: C.muted, fontWeight: 500 }}>Secure your account credentials</span>
              </div>
            </div>

            <form onSubmit={handleChangePassword}>
              <div style={inputContainerStyle}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 chars, 1 capital, 1 number"
                  style={inputStyle}
                />
              </div>

              <div style={inputContainerStyle}>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  style={inputStyle}
                />
              </div>

              {passError && (
                <div style={{ background: C.redLight, border: `1px solid ${C.red}`, color: C.red, padding: "10px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 500, marginBottom: 16 }}>
                  ⚠️ {passError}
                </div>
              )}

              {passSuccess && (
                <div style={{ background: C.greenLight, border: `1px solid ${C.green}`, color: C.green, padding: "10px 14px", borderRadius: 8, fontSize: "0.8rem", fontWeight: 500, marginBottom: 16 }}>
                  ✓ {passSuccess}
                </div>
              )}

              <Button
                disabled={passLoading}
                style={{ width: "100%", justifyContent: "center", padding: "12px 0", marginTop: 8 }}
              >
                {passLoading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </Card>

          {/* Card 2: Subscription Status */}
          <Card style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.3rem" }}>💳</span>
                <span style={{ fontWeight: 800, color: C.navy, fontSize: "0.95rem" }}>My Subscription</span>
              </div>
              <span style={{ fontSize: "0.7rem", fontWeight: 800, color: C.teal, background: C.tealLight, padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.teal}33` }}>
                {user.plan?.toUpperCase()} PLAN
              </span>
            </div>

            <div style={{ background: C.offwhite, padding: 14, borderRadius: 10, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "0.75rem", color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: 6 }}>
                Plan Benefits:
              </div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.8rem", color: C.navy, lineHeight: 1.5 }}>
                <li>Analyze legal cases with AI</li>
                <li>Verify URA compliance checklists</li>
                <li>Browse TAT legal library</li>
                {user.plan?.toLowerCase() === "free" ? (
                  <li style={{ color: C.muted }}>Daily search limit (10 searches/day)</li>
                ) : (
                  <li style={{ fontWeight: 700, color: C.teal }}>Unlimited AI lookups & reports</li>
                )}
              </ul>
            </div>

            {user.plan?.toLowerCase() === "free" && (
              <button
                onClick={onNavigateToPricing}
                style={{
                  background: `linear-gradient(135deg, ${C.teal} 0%, ${C.tealDark} 100%)`,
                  color: C.white,
                  border: "none",
                  padding: "10px 0",
                  borderRadius: 10,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(26,123,107,0.2)",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  textAlign: "center"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
              >
                Upgrade to Professional Plan
              </button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
