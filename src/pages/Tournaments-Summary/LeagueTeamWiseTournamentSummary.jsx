import React, { useEffect, useState } from "react";
import { getAllTeamsBasedOnLeague } from "../../services/api";
import Pagination from "../../common/Pagination";
// ---------------------------------------------------------------------------------------------
const baseURL = import.meta.env.VITE_BASE_URL;
const LeagueTeamWiseTournamentSummary = ({ selectedLeagueId }) => {
  // console.log("selectedLeagueId::::", selectedLeagueId);
  const [isLoading, setIsLoading] = useState(false);
  const [teamsList, setTeamsList] = useState([]);
  const [paginatedteamsList, setPaginatedteamsList] = useState([]);

  // Used to fetch the teams list based on league id
  const fetchTeamsListBasedOnLeague = async (selectedLeagueId) => {
    try {
      setIsLoading(true);
      const data = await getAllTeamsBasedOnLeague(selectedLeagueId);
      console.log(data)
      if (data) setIsLoading(false);
      setTeamsList(data?.teams);
    } catch (error) {
      setIsLoading(false);
      console.log("Getting an error while fetching teams list: ", error);
    }
  };

  useEffect(() => {
    if (teamsList?.length > 0) {
      // console.log("teamsList::: ", teamsList);
    }
  }, [teamsList]);

  useEffect(() => {
    if (paginatedteamsList?.length > 0) {
      // console.log("paginatedteamsList::: ", paginatedteamsList);
    }
  }, [paginatedteamsList]);

  useEffect(() => {
    if (selectedLeagueId) fetchTeamsListBasedOnLeague(selectedLeagueId);
  }, [selectedLeagueId]);

  return (
    <div className="container mx-auto px-4 sm:px-8 w-[90%]">
      <div className="py-8">
        <div>
          <h2 className="text-2xl font-semibold leading-tight text-center">
            Team Standings List
          </h2>
        </div>
        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
          <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className='w-[100px] px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2'></th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2 ">
                    Team Name
                  </th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2 ">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(paginatedteamsList) &&
                  paginatedteamsList?.length > 0 ? (
                  paginatedteamsList.map((team, i) => {
                    return (
                      <tr key={team?._id || i}>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 flex items-center justify-center">
                          <img src={`${baseURL}/uploads/${team?.teamImage?.split("\\")[1]}`} alt={`${team.teamName}`}
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }} className='w-10 h-10 rounded-full' />
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                          <p className="text-gray-900 whitespace-no-wrap font-bold">
                            {team?.teamName}
                          </p>
                        </td>
                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                          <p className="text-gray-900 whitespace-no-wrap font-bold">
                            {team?.pointsScored}
                          </p>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <>
                    <h2 className="font-bold p-5 text-lg">No Team Found</h2>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
        {teamsList?.length > 0 && (
          <Pagination
            items={teamsList}
            itemsPerPage={5}
            sendDataToParent={(data) => setPaginatedteamsList(data)}
          />
        )}
      </div>
    </div>
  );
};

export default LeagueTeamWiseTournamentSummary;
