import { useState, useEffect } from "react";
import Header from "./Header/Header";
import { Outlet } from "react-router-dom";
import SideBar from "./Sidebar/Sidebar";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on mobile when window is resized to desktop size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="flex h-screen w-full bg-[#020617] overflow-hidden">
        <div className="relative flex flex-1 flex-col h-full overflow-hidden">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="flex flex-1 h-full overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <div
              className={`
                fixed lg:static h-full left-0 z-50
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
              `}
            >
              <SideBar
                isMobileOpen={sidebarOpen}
                setIsMobileOpen={setSidebarOpen}
              />
            </div>

            {/* Main Content */}
            <main className="flex-1 w-full lg:ml-0 h-full overflow-y-auto">
              <Outlet />
            </main>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
