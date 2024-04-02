import React, { useEffect, useState } from "react";
import { getAllLeagues, getTeam, viewMatches, viewMatchesBasedOnLeague, viewMatchesByLeagueName } from "../../services/api";
import moment from "moment";
import MatchModals from "../../common/MatchModals";
import { useNavigate } from "react-router-dom";
import ReactLoader from "../../common/ReactLoader";
// ------------------------------------------------------------------------
const ViewMatches = () => {
  const [viewMatchData, setViewMatchData] = useState([]);
  const [isShowing, setIsShowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Used to store comp teams list
  const [teamsList, setTeamsList] = useState([]);
  const navigate = useNavigate();
  const [leaguesData, setLeaguesData] = useState([])

  const fetchMatches = async () => {
    try {
      setIsLoading(true);

      const data = await viewMatches();

      if (data) setIsLoading(false);

      if (data?.matches?.length > 0 && teamsList.length > 0) {
        const updatedData = data?.matches?.map((ele) => {
          return {
            ...ele,
            team1Name: teamsList.find((team) => team._id === ele.team1 && team),
            team2Name: teamsList.find((team) => team._id === ele.team2 && team),
          };
        });
        if (updatedData) setViewMatchData(updatedData);
      }
    } catch (error) {
      setIsLoading(false);
      console.log("Getting an error while fetching clubs: ", error);
    }
  };

  // Used to fetch existing teams list
  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const data = await getTeam();
      if (data) setIsLoading(false);
      setTeamsList(data?.teams);
    } catch (error) {
      setIsLoading(false);
      console.log("Getting an error while fetching teams list: ", error);
    }
  };

  const fetchLeagues = async () => {
    try {
      const response = await getAllLeagues()
      setLeaguesData(response.leagues)
    } catch (error) {
      console.log(error)
    }
  }

  const handleLeagueChange = (e) => {
    handleViewMatches(e.target.value)
  }

  const handleViewMatches = async (leagueId) => {
    try {
      const response = await viewMatchesByLeagueName(leagueId)

      if (response.status === 'SUCCESS') {
        setViewMatchData(response.matchesList)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchTeams();
    fetchLeagues()
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [teamsList]);

  return (
    <>
      <div>
        <section className="container mx-auto p-6 font-mono">
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 mb-4">
            Matches List
          </h2>
          <div className="h-16 my-5 flex justify-end items-center px-10">
            <select name="league" id="league" className="h-12 px-4" onChange={handleLeagueChange}>
              <option value="all">All Leagues</option>
              {
                leaguesData.length > 0 && leaguesData.map((league) => {
                  return <option value={league._id} key={league._id}>{league.leagueName}</option>
                })
              }
            </select>
          </div>
          <div className="w-full mb-8 overflow-hidden rounded-lg shadow-lg">
            <div className="w-full overflow-x-auto">
              <table className="w-full">
                <thead className="text-center">
                  <tr className="text-md font-semibold tracking-wide text-center text-gray-900 bg-gray-100 uppercase">
                    <th className="px-4 py-3">S.No</th>
                    <th className="px-4 py-3">Team 1</th>
                    <th className="px-4 py-3">Team 2</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Round Type</th>
                    <th className="px-4 py-3 whitespace-nowrap">
                      View Details
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap">
                      Update Match Details
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap">
                      Update Player Details
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white text-center w-full">
                  {isLoading ? (
                    <ReactLoader />
                  ) : Array.isArray(viewMatchData) &&
                    viewMatchData?.length > 0 ? (
                    viewMatchData?.map((item, index) => (
                      <tr key={index} className="text-gray-700 ">
                        <td className="px-4 py-3 text-ms font-semibold border">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-ms font-semibold border">
                          {item?.team1?.teamName}
                        </td>
                        <td className="px-4 py-3 text-ms font-semibold border">
                          {item?.team2?.teamName}
                        </td>
                        <td className="px-4 py-3 text-sm border whitespace-nowrap">
                          {moment(item?.date).format("ddd,DD-MM-YYYY")}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold">{item.matchType}</td>
                        <td>
                          <MatchModals viewDetails={{ item, index }} />
                        </td>
                        <td>
                          <button
                            className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded bg-gray-500 px-5 text-sm font-medium tracking-wide text-white transition duration-300 hover:bg-gray-600 focus:bg-gray-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:shadow-non mx-2"
                            onClick={() =>
                              navigate(
                                `/dashboard/match/${item?._id}/updateMatchSummary`,
                                {
                                  state: item,
                                }
                              )
                            }
                          >
                            Update Match Details
                          </button>
                        </td>
                        <td>
                          <button
                            className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded bg-gray-500 px-5 text-sm font-medium tracking-wide text-white transition duration-300 hover:bg-gray-600 focus:bg-gray-700 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-gray-300 disabled:bg-gray-300 disabled:shadow-non"
                            onClick={() =>
                              navigate("/dashboard/updatePlayerSummary", {
                                state: item,
                              })
                            }
                          >
                            Update Player Details
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <h3 className="p-4">No Data Found</h3>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Modals Starts Here */}

          <dialog id="my_modal_3" className="modal">
            <div className="modal-box">
              <form method="dialog">
                {/* if there is a button in form, it will close the modal */}
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                  ✕
                </button>
              </form>
              <h3 className="font-bold text-lg">Hello!</h3>
              <p className="py-4">
                Press ESC key or click on ✕ button to close
              </p>
            </div>
          </dialog>
          {/* Modals Ends Here */}
        </section>
      </div>
    </>
  );
};

export default ViewMatches;
