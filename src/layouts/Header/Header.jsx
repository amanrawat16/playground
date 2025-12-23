import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logoutCompClub } from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import { Trophy } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const navigation = [
  { name: "Dashboard", href: "/" },
  { name: "Login", href: "/login" }
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Header({ sidebarOpen, setSidebarOpen } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const userType = localStorage.getItem("userType");

  const handleLogout = async () => {
    try {
      await logoutCompClub();
      window.localStorage.clear();
      toast.success("User Logout Successfully");
      navigate("/");
    } catch (error) {
      console.log(
        "Getting an error during logout the user: ",
        error?.message || "Internal Server Error"
      );
    }
  };

  // Check if current route matches navigation item
  const isActiveRoute = (href) => {
    return location.pathname === href;
  };

  return (
    <>
      <Disclosure as="nav" className="bg-[#0f172a] border-b border-slate-800 shadow-sm">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
              <div className="relative flex h-16 items-center justify-between">
                {/* Mobile menu button for sidebar - Only show when logged in */}
                {userType && (
                  <div className="absolute inset-y-0 left-0 flex items-center lg:hidden">
                    <button
                      onClick={() => setSidebarOpen?.(!sidebarOpen)}
                      className="relative inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400 transition-colors"
                      aria-label="Toggle sidebar"
                    >
                      <span className="absolute -inset-0.5" />
                      {sidebarOpen ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                )}

                {/* Mobile menu button for navigation - Only show when not logged in */}
                {!userType && (
                  <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400 transition-colors">
                      <span className="absolute -inset-0.5" />
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                )}

                {/* Logo/Brand - Only show when not logged in */}
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  {!userType && (
                    <div className="flex flex-shrink-0 items-center">
                      <Link to="/" className="flex items-center space-x-2 group">
                        <div className="p-2 bg-orange-600 rounded-lg group-hover:bg-orange-700 transition-colors">
                          <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                        </div>
                        <span className="hidden sm:block text-xl font-bold text-white">
                          Playground
                        </span>
                      </Link>
                    </div>
                  )}

                  {/* Desktop Navigation */}
                  <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-1">
                    {!userType && (
                      <>
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={classNames(
                              isActiveRoute(item.href)
                                ? "bg-slate-800 text-white"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white",
                              "rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200"
                            )}
                            aria-current={isActiveRoute(item.href) ? "page" : undefined}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Right side - Logout button for logged in users */}
                {userType && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414-1.414L11.586 7H6a1 1 0 010-2h5.586L8.293 1.707a1 1 0 011.414-1.414L14 4.586V10a1 1 0 11-2 0V7.414z" clipRule="evenodd" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}

                {/* Mobile menu button for non-logged in users on larger screens - hidden but kept for spacing */}
                {!userType && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:hidden">
                    {/* Empty div for spacing */}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu panel - Only show navigation for non-logged in users */}
            <Disclosure.Panel className="sm:hidden border-t border-slate-700 bg-[#0f172a]">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {!userType && (
                  <>
                    {navigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as={Link}
                        to={item.href}
                        className={classNames(
                          isActiveRoute(item.href)
                            ? "bg-slate-800 text-white"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white",
                          "block rounded-md px-3 py-2 text-base font-medium transition-colors"
                        )}
                        aria-current={isActiveRoute(item.href) ? "page" : undefined}
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
}
