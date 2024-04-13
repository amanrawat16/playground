import React, { useEffect, useState } from "react";
import {
  getAllTeamsBasedOnLeague,
  viewMatchesBasedOnLeague,
} from "../../services/api";
import Pagination from "../../common/Pagination";
import moment from "moment";
import TeamPlayerDetails from "./TeamPlayerDetails";
import { confirmAlert } from "react-confirm-alert"; // Import

// -------------------------------------------------------------------------------------
const LeagueMatchSummary = ({ selectedLeagueId }) => {

  const [teamsListBasedOnLeague, setTeamsListBasedOnLeague] = useState([]);
  const [matchesListBasedOnLeague, setMatchesListBasedOnLeague] = useState([]);
  const [paginatedMatchesList, setPaginatedMatchesList] = useState([]);
  const [paginatedTeamsList, setPaginatedTeamsList] = useState([]);

  // -----------------------------------------------------------------------------------------

  const fetchTeams = async () => {
    try {
      const teamsList = await getAllTeamsBasedOnLeague(selectedLeagueId);
      // console.log("teamsList::: ", teamsList);
      if (teamsList?.teams?.length > 0) {
        setTeamsListBasedOnLeague(teamsList?.teams);
      }
    } catch (error) {
      console.log(
        "Getting error while fetching teams list::: ",
        error?.message || "Internal server error"
      );
    }
  };
  const fetchMatches = async () => {
    try {
      const matcheslist = await viewMatchesBasedOnLeague(selectedLeagueId);
      // console.log("matcheslist::: ", matcheslist);
      if (matcheslist?.matchesList?.length > 0) {
        setMatchesListBasedOnLeague(matcheslist?.matchesList);
      }
    } catch (error) {
      console.log(
        "Getting error while fetching matches list::: ",
        error?.message || "Internal server error"
      );
    }
  };

  const LeagueMatchIndividualSummary = ({ team, index }) => {
    const [showTeamPlayerModal, setShowTeamPlayerModal] = useState(false);

    const manageTeamFixturesApproval = () => {
      confirmAlert({
        title: "Approval Confirmation",
        message: "Are you sure to do move this team in next round?",
        buttons: [
          {
            label: "Yes",
            onClick: () => { },
          },
          {
            label: "No",
            onClick: () => { },
          },
        ],
      });
    };

    return (
      <>
        <tr key={team?._id || index}>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
            <p className="text-gray-900 whitespace-no-wrap font-bold">
              {index + 1}
            </p>
          </td>

          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
            <p className="text-gray-900 whitespace-no-wrap font-bold">
              {team?.teamName}
            </p>
          </td>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
            <p className="text-gray-900 whitespace-no-wrap font-bold">
              {team?.totalMatchesPlayed}
            </p>
          </td>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
            <p className="text-gray-900 whitespace-no-wrap font-bold">
              {team?.pointsScored}
            </p>
          </td>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
            <p className="text-gray-900 whitespace-no-wrap font-bold">NO</p>
          </td>
          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
            <p className="text-gray-900 whitespace-no-wrap font-bold">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded"
                onClick={() => {
                  setShowTeamPlayerModal(true);
                }}
              >
                View Details
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-2 rounded ml-3"
                onClick={manageTeamFixturesApproval}
              >
                Approve Team
              </button>
            </p>
          </td>
        </tr>
        {showTeamPlayerModal && (
          <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
              <div className="relative w-auto my-6 mx-auto max-w-3xl">
                {/*content*/}
                <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                  {/*header*/}
                  <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                    <h3 className="text-2xl font-semibold">
                      {team?.teamName} - Player Details
                    </h3>
                    <button
                      className="p-1 ml-auto border-0 text-black float-right text-3xl opacity-1 leading-none font-semibold outline-none focus:outline-none"
                      onClick={() => setShowTeamPlayerModal(false)}
                    >
                      <span className="text-black opacity-1 h-6 w-6 text-2xl block outline-none focus:outline-none">
                        ×
                      </span>
                    </button>
                  </div>
                  {/*body*/}
                  <div className="relative p-6 flex-auto">
                    <TeamPlayerDetails teamPlayersData={team} />
                  </div>
                  {/*footer*/}
                  <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                    <button
                      className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                      type="button"
                      onClick={() => setShowTeamPlayerModal(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
          </>
        )}
      </>
    );
  };

  useEffect(() => {
    if (selectedLeagueId !== "") {
      fetchTeams();
      fetchMatches();
    }
  }, [selectedLeagueId]);

  useEffect(() => {
    if (teamsListBasedOnLeague?.length > 0) {
      // console.log("teamsListBasedOnLeague::: ", teamsListBasedOnLeague);
    }
  }, [teamsListBasedOnLeague]);

  return (
    <>
      <div className="container mx-auto px-4 sm:px-8 w-[100%]">
        <div className="py-8">
          <div>
            <h2 className="text-2xl font-semibold leading-tight text-center">
              Teams List
            </h2>
          </div>
          <div className="-mx-4 sm:-mx-8 px-4 py-4 overflow-x-auto">
            <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2  text-center">
                      S.No.
                    </th>

                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2  text-center">
                      Team Name
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2  text-center">
                      Total Matches Played
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2  text-center">
                      Total Points Scored
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2  text-center">
                      Is Team Approved?
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(paginatedTeamsList) &&
                    paginatedTeamsList?.length > 0 ? (
                    paginatedTeamsList.map((team, i) => {
                      return (
                        <LeagueMatchIndividualSummary team={team} index={i} />
                      );
                    })
                  ) : (
                    <>
                      <h2 className="font-bold p-5 text-lg ">No Team Found</h2>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {teamsListBasedOnLeague?.length > 0 && (
            <Pagination
              items={teamsListBasedOnLeague}
              itemsPerPage={5}
              sendDataToParent={(data) => setPaginatedTeamsList(data)}
            />
          )}
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-8 w-[90%]">
        <div className="py-8">
          <div>
            <h2 className="text-2xl font-semibold leading-tight text-center">
              Matches List
            </h2>
          </div>
          <div className="-mx-4 sm:-mx-8 px-4 py-4 overflow-x-auto">
            <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
              <table className="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700 uppercase tracking-wider border-r-2 text-center">
                      S.No.
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2 text-center">
                      Match Date and Time
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2 text-center">
                      Team 1 Name
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2 text-center">
                      Team 2 Name
                    </th>

                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2 text-center">
                      Is Match Completed?
                    </th>
                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2 text-center">
                      Winning Team
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(paginatedMatchesList) &&
                    paginatedMatchesList?.length > 0 ? (
                    paginatedMatchesList.map((match, i) => {
                      return (
                        <tr key={match?._id || i}>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
                            <p className="text-gray-900 whitespace-no-wrap font-bold">
                              {i + 1}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
                            <p className="text-gray-900 whitespace-no-wrap font-bold">
                              {moment(match?.date).format("LL") +
                                " Time: " +
                                match?.time?.[0]?.startTime +
                                " to " +
                                match?.time?.[0]?.endTime}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
                            <p className="text-gray-900 whitespace-no-wrap font-bold">
                              {match?.team1?.teamName}
                            </p>
                          </td>
                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
                            <p className="text-gray-900 whitespace-no-wrap font-bold">
                              {match?.team2?.teamName}
                            </p>
                          </td>

                          <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
                            <p className="text-gray-900 whitespace-no-wrap font-bold">
                              {new Date().getTime() >
                                new Date(match?.date).getTime()
                                ? "YES"
                                : "NO"}
                            </p>
                          </td>
                          {new Date().getTime() >
                            new Date(match?.date).getTime() && (
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
                                <p className="text-gray-900 whitespace-no-wrap font-bold">
                                  {match?.winningTeam?.winningTeamName}
                                </p>
                              </td>
                            )}
                        </tr>
                      );
                    })
                  ) : (
                    <>
                      <h2 className="font-bold p-5 text-lg ">No Match Found</h2>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {matchesListBasedOnLeague?.length > 0 && (
            <Pagination
              items={matchesListBasedOnLeague}
              itemsPerPage={5}
              sendDataToParent={(data) => setPaginatedMatchesList(data)}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default LeagueMatchSummary;
