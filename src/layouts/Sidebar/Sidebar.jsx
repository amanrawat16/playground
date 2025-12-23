import { NavLink } from "react-router-dom";
import { FaBars, FaHome, FaUser, FaUsers, FaTrophy, FaCalendarAlt, FaFutbol, FaCog } from "react-icons/fa";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SidebarMenu from "./SidebarMenu";
import { Trophy, X } from "lucide-react";

const SideBar = ({ children, isMobileOpen, setIsMobileOpen }) => {
  const [userType, setUserType] = useState("admin");

  useEffect(() => {
    const userTypeValue = localStorage.getItem("userType");
    setUserType(userTypeValue);
  }, []);

  const adminRoutes = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <FaHome />,
    },
    {
      path: "/dashboard/addTeam",
      name: "Add Team",
      icon: <FaUsers />,
    },
    {
      path: "/dashboard/addStaff",
      name: "Add Staff",
      icon: <FaUser />,
    },
    {
      path: "/tournamentSummary",
      name: "Tournament Summary",
      icon: <FaTrophy />,
      subRoutes: [
        {
          path: "/dashboard/tournamentSummary/leagueWise",
          name: "League Wise Summary",
          icon: <FaTrophy />,
        },
        {
          path: "/dashboard/tournamentSummary/matchWise",
          name: "Match Wise Summary",
          icon: <FaCalendarAlt />,
        },
        {
          path: "/dashboard/tournamentSummary/leagueTeamWise",
          name: "League Team Wise Summary",
          icon: <FaUsers />,
        },
      ],
    },
    {
      path: "/matches",
      name: "Matches",
      icon: <FaFutbol />,
      subRoutes: [

        {
          path: "/dashboard/matches/viewMatches",
          name: "View All Matches",
          icon: <FaCalendarAlt />,
        },
      ],
    },
    {
      path: '/dashboard/viewPlayers',
      name: 'View Players',
      icon: <FaUser />,
    },
    {
      path: '/dashboard/Teams',
      name: 'View Teams',
      icon: <FaUsers />,
    },
    {
      path: "/dashboard/tournaments",
      name: "Tournament Hub",
      icon: <FaTrophy />
    },
  ];

  const clubAdminRoutes = [
    {
      path: "/dashboard",
      name: "Update Team",
      icon: <FaHome />,
    },
    {
      path: "/matches",
      name: "Matches",
      icon: <FaHome />,
      subRoutes: [
        {
          path: "/dashboard/matches/viewMatches",
          name: "View All Matches",
          icon: <FaUser />,
        },
        {
          path: "/dashboard/matches/myMatches",
          name: "My Matches",
          icon: <FaUser />
        }
      ],
    },
  ];

  const teamRoutes = [
    {
      path: "/dashboard/updateTeam",
      name: "Update Team",
      icon: <FaHome />,
    },
    {
      path: "/matches",
      name: "Matches",
      icon: <FaHome />,
      subRoutes: [
        {
          path: "/dashboard/matches/viewMatches",
          name: "View All Matches",
          icon: <FaUser />,
        },
        {
          path: "/dashboard/matches/myMatches",
          name: "My Matches",
          icon: <FaUser />
        }
      ],
    },
  ];

  const StaffRoutes = [
    {
      path: "/matches",
      name: "Matches",
      icon: <FaHome />,
      subRoutes: [
        {
          path: "/dashboard/matches/viewMatches",
          name: "View All Matches",
          icon: <FaUser />,
        },
      ],
    },
  ]

  const routes =
    userType === "admin"
      ? adminRoutes
      : userType === 'staff' ? StaffRoutes
        : userType === "clubadmin"
          ? clubAdminRoutes
          : userType === "team"
            ? teamRoutes
            : [];

  const [isOpen, setIsOpen] = useState(true);

  // On mobile, always show full sidebar when open
  useEffect(() => {
    if (isMobileOpen) {
      setIsOpen(true);
    }
  }, [isMobileOpen]);

  const toggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  const handleLinkClick = () => {
    // Close mobile sidebar when a link is clicked
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsMobileOpen(false);
    }
  };

  const showAnimation = {
    hidden: {
      width: 0,
      opacity: 0,
      transition: {
        duration: 0.3,
      },
    },
    show: {
      opacity: 1,
      width: "auto",
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <>
      <motion.div
        animate={{
          width: isOpen ? "280px" : "80px",
          transition: {
            duration: 0.3,
            type: "spring",
            damping: 15,
          },
        }}
        className="sidebar h-full bg-[#0f172a] border-r border-slate-800 shadow-xl flex flex-col"
      >
        {/* Header */}
        <div className="top_section text-white border-b border-slate-800">
          <AnimatePresence>
            {isOpen && (
              <motion.div
                variants={showAnimation}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="flex items-center gap-2"
              >
                <div className="p-2 bg-white/20 rounded-lg">
                  <Trophy className="w-5 h-5" />
                </div>
                <h1 className="logo font-bold text-lg">Playground</h1>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-2">
            {/* Mobile Close Button */}
            {isMobileOpen && (
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {/* Desktop Toggle */}
            <button
              onClick={toggle}
              className="bars p-1.5 hover:bg-white/20 rounded-lg transition-colors hidden lg:block"
              aria-label="Toggle sidebar"
            >
              <FaBars className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Routes */}
        <section className="routes py-4 flex-1 overflow-y-auto">
          {routes.map((route, index) => {
            if (route.subRoutes) {
              return (
                <SidebarMenu
                  setIsOpen={setIsOpen}
                  route={route}
                  showAnimation={showAnimation}
                  isOpen={isOpen}
                  key={index}
                  onLinkClick={handleLinkClick}
                />
              );
            }

            return (
              <NavLink
                to={route.path}
                key={index}
                className={({ isActive }) => `link ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <div className="icon flex items-center justify-center">{route.icon}</div>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      variants={showAnimation}
                      initial="hidden"
                      animate="show"
                      exit="hidden"
                      className="link_text"
                    >
                      {route.name}
                    </motion.div>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </section>
      </motion.div>
    </>
  );
};

export default SideBar;
