import { useEffect, useState } from "react";
import { getAllLeagues, viewMatches, viewMatchesByLeague, } from "../../services/api";
import moment from "moment";

import { useLocation, useNavigate } from "react-router-dom";
import { MdEditNote } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { BeatLoader } from "react-spinners";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MatchModals from "@/common/MatchModals";
import { Spinner } from "@/components/ui/Spinner";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
// ------------------------------------------------------------------------
const baseURL = import.meta.env.VITE_BASE_URL;
const ViewMatches = () => {
  const userTypeValue = localStorage.getItem("userType");
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
    setLeague(e)
    handleViewMatches(e)
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
          <h2 className="text-center text-2xl font-bold leading-9 tracking-tight text-orange-600 mb-4">
            Matches List
          </h2>
          <div className="h-16 my-5 flex justify-end items-center px-10">
            <Select name="league" id="league" className="h-12 px-4" onValueChange={handleLeagueChange} defaultValue={'all'} value={league}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a League" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Leagues</SelectLabel>
                  < SelectItem value={'all'}>All</SelectItem>
                  {
                    leaguesData.length > 0 && leaguesData.map((league) => {
                      return < SelectItem value={league._id} key={league._id}>{league.leagueName}</SelectItem>
                    })
                  }
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full mb-8 overflow-hidden rounded-lg my-10">
            <Table className="shadow-lg">
              <TableCaption> List of matches of selected League.</TableCaption>
              <TableHeader>
                <TableRow className="bg-orange-600 hover:bg-orange-600">
                  <TableHead className="text-white">S.No</TableHead>
                  <TableHead className="text-white">Team 1</TableHead>
                  <TableHead className="text-white">Scores</TableHead>
                  <TableHead className="text-white">Team 2</TableHead>
                  <TableHead className="text-center text-white">Date</TableHead>
                  <TableHead className="text-center text-white">League</TableHead>
                  <TableHead className="text-center text-white">Location</TableHead>
                  <TableHead className="text-center text-white">Winner</TableHead>
                  <TableHead className="text-center text-white">Match Type</TableHead>
                  <TableHead className="text-center text-white">View</TableHead>
                  {(userTypeValue === 'admin' || userTypeValue === 'staff') && (
                    <>
                      <TableHead className="text-center text-white">
                        Update Match
                      </TableHead>
                      <TableHead className="text-center text-white">
                        Update Player
                      </TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  viewMatchData?.length > 0 && (
                    viewMatchData?.map((item, index) => (
                      <TableRow key={index} >
                        <TableCell className="font-medium text-center">{index + 1}</TableCell>
                        <TableCell className="text-center">
                          <img 
                            src={
                              (() => {
                                const teamImage = item?.team1?.teamImage;
                                if (!teamImage) {
                                  return 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg';
                                }
                                if (teamImage.includes("\\")) {
                                  const parts = teamImage.split("\\");
                                  return parts.length > 1 ? `${baseURL}/uploads/${parts[parts.length - 1]}` : `${baseURL}/uploads/${teamImage}`;
                                }
                                if (teamImage.includes("/")) {
                                  return `${baseURL}/uploads/${teamImage.split('/').pop()}`;
                                }
                                return `${baseURL}/uploads/${teamImage}`;
                              })()
                            }
                            alt={item?.team1?.teamName || 'Team 1'}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }} 
                            className="w-10 h-10 rounded-full mx-auto" 
                          />
                          <p>
                            {item?.team1?.teamName || 'Unknown Team'}
                          </p>
                        </TableCell>
                        {
                          item?.winningTeam?.winningTeamId ?
                            <TableCell className="bg-gray-50  text-center text-md">{item?.team1stPoints?.score} - {item?.team2ndPoints?.score}</TableCell> : <TableCell className=" text-center bg-gray-50">-</TableCell>
                        }
                        <TableCell>
                          <img 
                            src={
                              (() => {
                                const teamImage = item?.team2?.teamImage;
                                if (!teamImage) {
                                  return 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg';
                                }
                                if (teamImage.includes("\\")) {
                                  const parts = teamImage.split("\\");
                                  return parts.length > 1 ? `${baseURL}/uploads/${parts[parts.length - 1]}` : `${baseURL}/uploads/${teamImage}`;
                                }
                                if (teamImage.includes("/")) {
                                  return `${baseURL}/uploads/${teamImage.split('/').pop()}`;
                                }
                                return `${baseURL}/uploads/${teamImage}`;
                              })()
                            }
                            alt={item?.team2?.teamName || 'Team 2'}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }}
                            className="w-10 h-10 rounded-full mx-auto" 
                          />
                          <p className="ml-2 text-center">
                            {item?.team2?.teamName || 'Unknown Team'}
                          </p>
                        </TableCell>
                        <TableCell className="text-center">
                          {moment(item?.date).format("DD/MM/YYYY")}
                        </TableCell>
                        <TableCell className="text-center">
                          {item?.league?.leagueName}
                        </TableCell>
                        <TableCell className="text-center">
                          {item?.location}
                        </TableCell>
                        <TableCell className="text-center">{item?.winningTeamName ? `${item.winningTeamName}` : '-'}</TableCell>
                        <TableCell className="text-center">{item.matchType || '-'}</TableCell>
                        <TableCell className="text-center"><MatchModals viewDetails={{ item, index }} /></TableCell>
                        {(userTypeValue === 'admin' || userTypeValue === 'staff') && (
                          <>
                            <TableCell className="text-center">
                              <button
                                onClick={() => {
                                  navigate(
                                    `/dashboard/match/${item?._id}/updateMatchSummary`,
                                    {
                                      state: item,
                                    }
                                  )
                                }}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors shadow-sm hover:shadow-md"
                                title="Update Match Scores"
                              >
                                <MdEditNote className="w-5 h-5" />
                                <span className="hidden sm:inline">Edit</span>
                              </button>
                            </TableCell>
                            <TableCell className="text-center">
                              <button
                                onClick={() =>
                                  navigate("/dashboard/updatePlayerSummary", {
                                    state: item,
                                  })
                                }
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors shadow-sm hover:shadow-md"
                                title="Update Player Details"
                              >
                                <FaUsers className="w-5 h-5" />
                                <span className="hidden sm:inline">Players</span>
                              </button>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    )))
                }
              </TableBody>
            </Table>
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
        </section >
      </div >
    </>
  );
};

export default ViewMatches;
