"use client";

import { useEffect, useState } from "react";
import { Menu, User } from "lucide-react";

interface TopNavProps {
  activeSection: string;
  onToggleSidebar?: () => void;
}

const sectionTitles: Record<string, string> = {
  dashboard: "Dashboard",
  rolespage: "Roles & Permissions",
  sports: "Member Database",
  subscriptions: "Subscriptions",
  noticeBoard: "Notice Board",
  myDocuments: "My Documents",
  formPortal: "Form Portal",
  publications: "Publications",
  adBooking: "Ad Booking",
  reporting: "Reporting",
  accounting: "Accounting",
  teamChat: "Team Chat",
  email: "Email",
  messages: "Messages",
  helpDesk: "Help Desk",
  events: "Events",
};

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== "undefined" ? window.innerWidth >= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isDesktop;
}

export function TopNav({ activeSection, onToggleSidebar }: TopNavProps) {
  const isDesktop = useIsDesktop();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) setUser(JSON.parse(data));
  }, []);

  return (
    <div className="h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-8">
      {/* LEFT: MENU + ACTIVE PAGE NAME */}
      <div className="flex items-center gap-3">
        {!isDesktop && (
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-muted rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <h2 className="text-[19px] font-semibold text-[#101828]">
          {sectionTitles[activeSection] || "Dashboard"}
        </h2>
      </div>

      {/* RIGHT: USER INFO */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">
            {user?.name || "Admin User"}
          </p>
          <p className="text-xs text-muted-foreground">
            {user?.email || "admin@iwpa.org"}
          </p>
        </div>

        {/* <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-primary-foreground" />
        </div> */}
      </div>
    </div>
  );
}