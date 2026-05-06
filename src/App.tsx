import { useState, useEffect } from "react";
import { Login } from "./components/Login";
import { Signup } from "./components/Signup";
import { Sidebar } from "./components/Sidebar";
import { TopNav } from "./components/TopNav";
import  Dashboard  from "./components/Dashboard";
import DashboardMember from "./components/DashboardMember";
import CategoryManager from "./components/RolesPage";
import Subscriptions from "./components/Subscriptions";
import NoticeBoard from "./components/NoticeBoard";
import NoticeBoardMember from "./components/NoticeBoardMember";
import MyDocuments from "./components/MyDocuments";
import FormPortal from "./components/FormPortal";
import Publications from "./components/Publication";
import AdBooking from "./components/AdBooking";
import AdBookingMember from "./components/AdBookingMember";
import Reporting from "./components/Reporting";
import Accounting from "./components/Accounting";
import TeamChat from "./components/TeamChat";
import Email from "./components/Email";
import Messages from "./components/Message";
import HelpDesk from "./components/HelpDesk";
import Events from "./components/Events";
import EventsMemberPage from "./components/EventsMember";
import SubscriptionMemberPage from "./components/SubscriptionsMember";
import PublicationsMember from "./components/PublicationMember";
import MyDocumentsMember from "./components/MyDocumentsMember";
import HelpDeskMember from "./components/HelpDeskMember";
import CompanyProfiles from "./components/CompanyProfiles";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MemberDatabase from "./components/MemberDatabase";
import MyProfile from "./components/MyProfile";


export default function App() {
  const [showSignup, setShowSignup] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [userType, setUserType] = useState<'admin' | 'member' | 'role'>(() => {
    return (localStorage.getItem('userType') as 'admin' | 'member' | 'role') || 'admin';
  });

  // Set theme based on authentication status
  useEffect(() => {
    const root = document.documentElement;
    if (isAuthenticated) {
      const savedTheme = localStorage.getItem('theme') || 'light';
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
    const saved = localStorage.getItem('activeSection');
    if (saved) return saved;
    const type = localStorage.getItem('userType') || 'admin';
    if (type === 'member') return 'dashboardmember';
    if (type === 'role') {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      return u?.roleCategory === 'national_council' ? 'dashboard' : 'noticeBoard';
    }
    return 'dashboard';
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

    const handleCustomNav = (e: Event) => {
      const section = (e as CustomEvent).detail;
      setActiveSection(section);
      localStorage.setItem('activeSection', section);
    };

    handleNavigation();
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener('navigate', handleCustomNav);
    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener('navigate', handleCustomNav);
    };
  }, []);

  const handleLogin = (type: 'admin' | 'member' | 'role') => {
    setIsAuthenticated(true);
    setUserType(type as any);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userType', type);

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const roleCategory = storedUser?.roleCategory || '';
    const initialSection =
      type === 'member' ? 'dashboardmember' :
      type === 'role' ? (roleCategory === 'national_council' ? 'dashboard' : 'noticeBoard') :
      'dashboard';
    setActiveSection(initialSection);
    localStorage.setItem('activeSection', initialSection);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('activeSection');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setActiveSection("dashboard");
  };

  const handleToggleSidebar = () => {
    setSidebarOpen((prev:any) => {
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
    
    // For member users, redirect dashboard to dashboardmember
    if (userType === 'member' && activeSection === 'dashboard') {
      return <DashboardMember />;
    }

    // For role users, show admin Dashboard
    if (userType === 'role' && activeSection === 'dashboard') {
      return <Dashboard />;
    }
    
    switch (activeSection) {
      case "myprofile": return <MyProfile />;
      case "dashboard": return <Dashboard />;
      case "dashboardmember": return <DashboardMember />;
      case "rolespage": return <CategoryManager />;
      case "memberDatabase": return <MemberDatabase />;
      case "subscriptions": return <Subscriptions />;
      case "subscriptionsmember": return <SubscriptionMemberPage />;
      case "noticeBoard": return <NoticeBoard />;
      case "noticeBoardmember": return <NoticeBoardMember />;
      case "myDocuments": return <MyDocuments />;
      case "myDocumentsmember": return <MyDocumentsMember />;
      case "formPortal": return <FormPortal />;
      case "publications": return <Publications />;
      case "publicationsmember": return <PublicationsMember />;
      case "events": return <Events />;
      case "eventsmember": return <EventsMemberPage />;
      case "adBooking": return <AdBooking />;
      case "adBookingmember": return <AdBookingMember />;
      case "companyProfiles": return <CompanyProfiles userType={userType === 'member' ? 'member' : 'admin'} />;
      case "reporting": return userType === 'admin' || userType === 'role' ? <Reporting /> : <DashboardMember />;
      case "accounting": return <Accounting />;
      case "teamChat": return <TeamChat />;
      case "email": return <Email />;
      case "messages": return <Messages userType={userType} />;
      case "helpDesk": return <HelpDesk />;
      case "helpDeskmember": return <HelpDeskMember />;
      default: return userType === 'member' || userType === 'role' ? <DashboardMember /> : <Dashboard />;
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
      <ToastContainer position="top-right" autoClose={3000} />
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
        userType={userType as 'admin' | 'member' | 'role'}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen && !isMobile ? "ml-64" : "ml-0"
        }`}>
        <TopNav
          activeSection={activeSection}
          onToggleSidebar={handleToggleSidebar}
        />

        <main className="overflow-x-hidden">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
