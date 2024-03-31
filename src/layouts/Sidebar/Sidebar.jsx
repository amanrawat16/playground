import { NavLink } from "react-router-dom";
import { FaBars, FaHome, FaLock, FaMoneyBill, FaUser } from "react-icons/fa";
import { MdMessage } from "react-icons/md";
import { BiAnalyse, BiSearch } from "react-icons/bi";
import { BiCog } from "react-icons/bi";
import { AiFillHeart, AiTwotoneFileExclamation } from "react-icons/ai";
import { BsCartCheck } from "react-icons/bs";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SidebarMenu from "./SidebarMenu";
// -----------------------------------------------------------------------------

const SideBar = ({ children }) => {
  const [userType, setUserType] = useState("admin");

  useEffect(() => {
    const userTypeValue = localStorage.getItem("userType");

    setUserType(userTypeValue);
  }, []);

  const adminRoutes = [
    {
      path: "/dashboard",
      name: "Add Clubs",
      icon: <FaHome />,
    },
    {
      path: "/dashboard/addTeam",
      name: "Add Team",
      icon: <FaHome />,
    },

    {
      path: "/tournamentSummary",
      name: "Tournament Summary",
      icon: <FaHome />,
      subRoutes: [
        {
          path: "/dashboard/tournamentSummary/leagueWise",
          name: "League Wise Summary ",
          icon: <FaUser />,
        },
        {
          path: "/dashboard/tournamentSummary/matchWise",
          name: "Match Wise Summary",
          icon: <FaUser />,
        },
        {
          path: "/dashboard/tournamentSummary/leagueTeamWise",
          name: "League Team Wise Summary",
          icon: <FaUser />,
        },
        {
          path: "/dashboard/tournamentSummary/leagueMatchSummary",
          name: "League Matches Summary",
          icon: <FaUser />,
        },
      ],
    },

    {
      path: "/matches",
      name: "Matches",
      icon: <FaHome />,
      subRoutes: [
        {
          path: "/dashboard/matches/createMatch",
          name: "Create Match ",
          icon: <FaUser />,
        },
        {
          path: "/dashboard/matches/viewMatches",
          name: "View Matches",
          icon: <FaUser />,
        },
      ],
    },
    {
      path: "/dashboard/startLeague",
      name: "Start League",
      icon: <FaHome />
    },
    {
      path: "/dashboard/updateUsers",
      name: "Update Users Credentials",
      icon: <FaHome />,
    },
  ];

  const clubAdminRoutes = [
    {
      path: "/dashboard",
      name: "Update Team",
      icon: <FaHome />,
    }
  ];

  const teamRoutes = [
    {
      path: "/dashboard/updateTeam",
      name: "Update Team",
      icon: <FaHome />,
    },
  ];

  const routes =
    userType === "admin"
      ? adminRoutes
      : userType === "clubadmin"
        ? clubAdminRoutes
        : userType === "team"
          ? teamRoutes
          : [];

  // ===========================================================================

  const [isOpen, setIsOpen] = useState(true);
  const toggle = () => setIsOpen(!isOpen);
  const inputAnimation = {
    hidden: {
      width: 0,
      padding: 0,
      transition: {
        duration: 0.2,
      },
    },
    show: {
      width: "140px",
      padding: "5px 15px",
      transition: {
        duration: 0.2,
      },
    },
  };

  const showAnimation = {
    hidden: {
      width: 0,
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    },
    show: {
      opacity: 1,
      width: "auto",
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <>
      <div className="main-container  bg-orange-700">
        <motion.div
          animate={{
            width: isOpen ? "250px" : "45px",
            transition: {
              duration: 0.5,
              type: "spring",
              damping: 10,
            },
          }}
          className={`sidebar h-screen bg-orange-700 `}
        >
          <div className="top_section text-white">
            <AnimatePresence>
              {isOpen && (
                <motion.h1
                  variants={showAnimation}
                  initial="hidden"
                  animate="show"
                  exit="hidden"
                  className="logo"
                >
                  Sports App
                </motion.h1>
              )}
            </AnimatePresence>

            <div className="bars">
              <FaBars onClick={toggle} />
            </div>
          </div>
          <section className="routes">
            {routes.map((route, index) => {
              if (route.subRoutes) {
                return (
                  <SidebarMenu
                    setIsOpen={setIsOpen}
                    route={route}
                    showAnimation={showAnimation}
                    isOpen={isOpen}
                    key={index}
                  />
                );
              }

              return (
                <NavLink
                  to={route.path}
                  key={index}
                  className="link"
                  activeClassName="active"
                >
                  <div className="icon">{route.icon}</div>
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
      </div>
    </>
  );
};

export default SideBar;
