"use client";

import { User, Mail, Phone, MapPin, Building, Shield } from "lucide-react";

export default function MyProfile() {
  let user: any = {};
  try { user = JSON.parse(localStorage.getItem("user") || "{}"); } catch {}

  const roleCategory = user?.roleCategory || "";
  const roleCategoryLabel: Record<string, string> = {
    headquarters: "Headquarters",
    national_council: "National Council",
    state_council: "State Council",
    state_coordinator: "State Coordinator",
    general: "General Member",
    vendors: "Vendor",
  };

  const fields = [
    { label: "Role Type", value: user?.name || user?.title, icon: User },
    { label: "Email", value: user?.email, icon: Mail },
    { label: "Mobile", value: user?.mobile, icon: Phone },
    { label: "Designation", value: user?.designation, icon: Shield },
    { label: "Company", value: user?.companyName, icon: Building },
    { label: "State", value: user?.state, icon: MapPin },
    { label: "Role Category", value: roleCategoryLabel[roleCategory] || roleCategory, icon: Shield },
    { label: "Address", value: user?.address, icon: MapPin },
    { label: "Website", value: user?.website, icon: MapPin },
  ].filter(f => f.value);

  const initials = (name: string) =>
    name?.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "U";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">My Profile</h1>
        <p className="text-[#6a7282] mt-1">Your account details and role information</p>
      </div>

      <div className="bg-white rounded-xl border border-[#e5e7eb] p-6">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-[#e5e7eb]">
          {user?.photo ? (
            <img src={user.photo} alt={user.name} className="w-20 h-20 rounded-full object-cover border-2 border-[#e5e7eb]" />
          ) : (
            <div className="w-20 h-20 rounded-full bg-[#1F7A4D] text-white flex items-center justify-center text-2xl font-bold shrink-0">
              {initials(user?.name || user?.title || "U")}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-[#242424]">{user?.name || user?.title || "—"}</h2>
            <p className="text-sm text-[#6a7282] mt-0.5">{user?.designation || "—"}</p>
            {roleCategory && (
              <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#d0fae5] text-[#1F7A4D]">
                {roleCategoryLabel[roleCategory] || roleCategory}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-[#f9fafb] border border-[#e5e7eb]">
              <Icon className="w-4 h-4 text-[#1F7A4D] mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[#6a7282]">{label}</p>
                <p className="text-sm font-medium text-[#242424] break-all">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {fields.length === 0 && (
          <p className="text-sm text-[#6a7282] text-center py-8">No profile data available.</p>
        )}
      </div>
    </div>
  );
}
