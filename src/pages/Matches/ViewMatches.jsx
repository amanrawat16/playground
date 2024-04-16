import { useEffect, useState } from "react";
import { getAllLeagues, viewMatches, viewMatchesByLeague, } from "../../services/api";
import moment from "moment";
import MatchModals from "../../common/MatchModals";
import { useLocation, useNavigate } from "react-router-dom";
import { MdEditNote } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { BeatLoader } from "react-spinners";
// ------------------------------------------------------------------------
const baseURL = import.meta.env.VITE_BASE_URL;
const ViewMatches = () => {
  const { state } = useLocation()
  const leagueId = state?.leagueId
  const [viewMatchData, setViewMatchData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [league, setLeague] = useState('all')
  const navigate = useNavigate();
  const [leaguesData, setLeaguesData] = useState([])



  const fetchLeagues = async () => {
    try {
      const response = await getAllLeagues()
      setLeaguesData(response.leagues)
    } catch (error) {
      console.log(error)
    }
  }

  const handleLeagueChange = (e) => {
    setLeague(e.target.value)
    handleViewMatches(e.target.value)
  }

  const handleViewMatches = async (leagueId) => {
    try {
      const response = await viewMatchesByLeague(leagueId)

      if (response.status === 'SUCCESS') {
        setViewMatchData(response.matchesList)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    // fetchTeams();
    fetchLeagues()
  }, []);



  useEffect(() => {
    handleViewMatches(leagueId || 'all')
    setLeague(leagueId || 'all')
  }, [leagueId]);
  return (
    <>
      <div>
        <section className="container mx-auto py-6 font-mono">
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 mb-4">
            Matches List
          </h2>
          <div className="h-16 my-5 flex justify-end items-center px-10">
            <select name="league" id="league" className="h-12 px-4" onChange={handleLeagueChange} defaultValue={'all'} value={league}>
              <option value="all">All Leagues</option>
              {
                leaguesData.length > 0 && leaguesData.map((league) => {
                  return <option value={league._id} key={league._id}>{league.leagueName}</option>
                })
              }
            </select>
          </div>
          <div className="w-full mb-8 overflow-hidden rounded-lg my-10">
            <div className="w-full overflow-x-auto">
              <table className="w-full">
                <thead className="text-center ">
                  <tr className="text-md font-semibold tracking-wide text-center border-b">
                    <th className="px-4 py-3">S.No</th>
                    <th></th>
                    <th className="px-4 py-3">Team 1</th>
                    <th className="px-4 py-3">Scores</th>
                    <th></th>
                    <th className="px-4 py-3">Team 2</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Location</th>
                    <th>Winner</th>
                    <th className="px-2 py-3"></th>

                    <th className="px-2 whitespace-nowrap">
                      View
                    </th>
                    <th className="px-2 py-3 whitespace-nowrap">
                      Update Match
                    </th>
                    <th className="px-2 py-3 whitespace-nowrap">
                      Update Player
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white text-center w-full">
                  {isLoading ? (
                    <tr className="w-full flex items-center justify-center">
                      <BeatLoader color="#36d7b7" />
                    </tr>
                  ) : Array.isArray(viewMatchData) &&
                    viewMatchData?.length > 0 ? (
                    viewMatchData?.map((item, index) => (
                      <tr key={index} className="text-gray-700 border-b">
                        <td className="px-4 py-3 text-ms font-semibold ">
                          {index + 1}
                        </td>
                        <td className="flex items-center justify-center">
                          <img src={`${baseURL}/uploads/${item.team1.teamImage.split("\\")[1]}`} alt={`${item.team1.teamName}`}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }} className="w-10 h-10 rounded-full" />
                        </td>
                        <td className="px-4 py-3 text-ms font-semibold ">
                          {item?.team1?.teamName}
                        </td>
                        {
                          item?.winningTeam?.winningTeamId ?
                            <td className="bg-orange-400 text-white">{
                              item?.winningTeam?.winningTeamId === item?.team1?.teamName ? `${item?.winningTeam.winningTeamScore}-${item?.losingTeam?.losingTeamScore}` : `${item?.losingTeam?.losingTeamScore}-${item?.winningTeam.winningTeamScore}`
                            }</td> : <td className="bg-orange-400 text-white">-</td>
                        }
                        <td className="flex items-center justify-center px-3">
                          <img src={`${baseURL}/uploads/${item.team2.teamImage.split("\\")[1]}`} alt={`${item.team2.teamName}`}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }}
                            className="w-10 h-10 rounded-full" />
                        </td>
                        <td className="text-ms font-semibold ">
                          {item?.team2?.teamName}
                        </td>
                        <td className="px-4 py-3 text-sm  whitespace-nowrap">
                          {moment(item?.date).format("ddd,DD-MM-YYYY")}
                        </td>
                        <td className="px-4 py-3 text  whitespace-nowrap">{item?.location}</td>
                        <td className="px-4 py-3">{item?.winningTeamName ? `${item.winningTeamName}` : '-'}</td>
                        <td className=" text-sm font-bold">{item.matchType}</td>
                        <td>
                          <MatchModals viewDetails={{ item, index }} />
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/match/${item?._id}/updateMatchSummary`,
                                {
                                  state: item,
                                }
                              )
                            }
                          >
                            <MdEditNote className="text-3xl text-green-600" />

                          </button>
                        </td>
                        <td>
                          <button
                            className=""
                            onClick={() =>
                              navigate("/dashboard/updatePlayerSummary", {
                                state: item,
                              })
                            }
                          >
                            <FaUsers className="text-2xl text-green-600" />
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
