import Header from "./Header/Header";
import { Outlet } from "react-router-dom";
import SideBar from "./Sidebar/Sidebar";

const Layout = () => {
  return (
    <>
      <div className="flex  overflow-hidden w-full">
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          <Header />
          <div className="p-0">
            <div className="flex mx-auto max-w-screen">
              <SideBar />
              <main>
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Layout;
