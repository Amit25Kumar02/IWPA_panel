import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import  Dashboard  from "./components/Dashboard";
import CategoryManager from "./components/RolesPage";
import SportsManagement from "./components/MemberDatabase";
import Subscriptions from "./components/Subscriptions";
import NoticeBoard from "./components/NoticeBoard";
import MyDocuments from "./components/MyDocuments";
import FormPortal from "./components/FormPortal";
import Publications from "./components/Publication";
import AdBooking from "./components/AdBooking";
import Reporting from "./components/Reporting";
import Accounting from "./components/Accounting";
import TeamChat from "./components/TeamChat";
import Email from "./components/Email";
import Messages from "./components/Message";
import HelpDesk from "./components/HelpDesk";
import Events from "./components/Events";


export default function App() {
  const [showSignup, setShowSignup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });

  // Set theme based on authentication status
  useEffect(() => {
    const root = document.documentElement;
    if (isAuthenticated) {
      const savedTheme = localStorage.getItem('theme') || 'dark';
      if (savedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else {
      root.classList.remove('dark');
    }
  }, [isAuthenticated]);
  const [activeSection, setActiveSection] = useState(() => {
    return localStorage.getItem('activeSection') || 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return false;
    }
    const saved = localStorage.getItem('sidebarOpen');
    return saved ? JSON.parse(saved) : false;
  });
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
        localStorage.setItem('sidebarOpen', 'true');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const handleNavigation = () => {
      const path = window.location.pathname;
      const section = path.substring(1) || 'dashboard';
      if (['dashboard', 'rolespage', 'sports', 'bets', 'cms', 'notification'].includes(section)) {
        setActiveSection(section);
        localStorage.setItem('activeSection', section);
      }
    };

    handleNavigation();
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('activeSection');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setActiveSection("dashboard");
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      localStorage.setItem('sidebarOpen', JSON.stringify(newState));
      return newState;
    });
  };

  const handleCloseSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const renderContent = () => {
    console.log('Active section:', activeSection);
    switch (activeSection) {
      case "dashboard": return <Dashboard />;
      case "rolespage": return <CategoryManager />;
      case "sports": return <SportsManagement />;
      case "subscriptions": return <Subscriptions />;
      case "noticeBoard": return <NoticeBoard />;
      case "myDocuments": return <MyDocuments />;
      case "formPortal": return <FormPortal />;
      case "publications": return <Publications />;
      case "events": return <Events />;
      case "adBooking": return <AdBooking />;
      case "reporting": return <Reporting />;
      case "accounting": return <Accounting />;
      case "teamChat": return <TeamChat />;
      case "email": return <Email />;
      case "messages": return <Messages />;
      case "helpDesk": return <HelpDesk />;
      default: return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return showSignup ? (
      <Signup
        onSignup={handleLogin}
        onShowLogin={() => setShowSignup(false)}
      />
    ) : (
      <Login
        onLogin={handleLogin}
        onShowSignup={() => setShowSignup(true)}
      />
    );
  }


  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={(section) => {
          setActiveSection(section);
          localStorage.setItem('activeSection', section);
          window.history.pushState({}, '', `/${section}`);
          if (isMobile) {
            setSidebarOpen(false);
            localStorage.setItem('sidebarOpen', 'false');
          }
        }}
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        isMobile={isMobile}
        onLogout={handleLogout}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? "ml-64" : "ml-0"
        }`}>
        <TopNav
          activeSection={activeSection}
          onToggleSidebar={handleToggleSidebar}
        />

        <main className="p-6 md:p-8 overflow-x-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
