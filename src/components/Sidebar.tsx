"use client";

import {
  LayoutDashboard,
  Shield,
  Users,
  CreditCard,
  Bell,
  FolderOpen,
  FilePenLine,
  BookOpen,
  Megaphone,
  BarChart3,
  Calculator,
  MessageSquare,
  Mail,
  MessageCircle,
  HelpCircle,
  LogOut,
  User,
  X,
  ChevronUp,
  ChevronDown,
  Calendar,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isOpen?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
  onLogout?: () => void;
}

export function Sidebar({
  activeSection,
  onNavigate,
  isOpen = true,
  isMobile = false,
  onClose,
  onLogout,
}: SidebarProps) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [showLogout, setShowLogout] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) setUser(JSON.parse(data));
  }, []);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "rolespage", label: "Roles & Permissions", icon: Shield },
    { id: "sports", label: "Member Database", icon: Users },
    { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
    { id: "noticeBoard", label: "Notice Board", icon: Bell },
    { id: "myDocuments", label: "My Documents", icon: FolderOpen },
    { id: "formPortal", label: "Form Portal", icon: FilePenLine },
    { id: "publications", label: "Publications", icon: BookOpen },
    { id: "events", label: "Events", icon: Calendar },
    { id: "adBooking", label: "Ad Booking", icon: Megaphone },
    { id: "reporting", label: "Reporting", icon: BarChart3 },
    { id: "accounting", label: "Accounting", icon: Calculator },
    { id: "teamChat", label: "Team Chat", icon: MessageSquare },
    { id: "email", label: "Email", icon: Mail },
    { id: "messages", label: "Message", icon: MessageCircle },
    { id: "helpDesk", label: "Help Desk", icon: HelpCircle },
  ];

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen w-64 bg-white border-r border-[#e5e7eb]
        flex flex-col z-50 transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${!isMobile ? "md:translate-x-0" : ""}
      `}
    >
      {/* LOGO */}
      <div className="h-16 px-4 border-b border-[#e5e7eb] flex items-center justify-between">
        <div className="flex items-center justify-center ml-2 ">
          <img
            src="/iwpa_logo.png"
            alt="IWPA"
            className="h-10.75 w-13.25"
          />
           <img
            src="/iwpa_logo1.png"
            alt="IWPA"
            className="h-9 w-30.75"
          />
          
        </div>

        {isMobile && (
          <button onClick={onClose} className="p-2 hover:bg-[#f3f4f6] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* NAV */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                    text-[15px] font-medium transition-colors cursor-pointer
                    ${
                      active
                        ? "bg-[#F6F8FA] text-[#1F7A4D] border-l-2 border-[#1F7A4D]"
                        : "text-[#242424] hover:bg-[#f9fafb]"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* USER + LOGOUT (BOTTOM) */}
      <div className="border-t border-[#e5e7eb] p-4 relative">
        <button
          onClick={() => setShowLogout(!showLogout)}
          className="w-full flex items-center gap-3 hover:bg-[#f9fafb] p-2 rounded-lg transition cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#1F7A4D] rounded-full flex items-center justify-center text-white font-semibold text-lg">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="text-sm font-medium truncate">
              {user?.name || "Admin User"}
            </p>
            <p className="text-xs text-[#6a7282] truncate">
              {user?.email || "admin@iwpa.org"}
            </p>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#6a7282] transition-transform ${showLogout ? 'rotate-180' : ''}`} />
        </button>

        {showLogout && (
          <>
            {/* <div 
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setShowLogout(false)}
            /> */}
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border border-[#e5e7eb] p-2 z-50">
              <button
                onClick={() => {
                  onLogout?.();
                  setShowLogout(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}