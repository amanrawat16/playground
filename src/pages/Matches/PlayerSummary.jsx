import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CiEdit } from "react-icons/ci";

const PlayerSummary = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  console.log("state:::", state);

  return (
    <>
      <div id="content-3a">
        <h2 className="text-center text-2xl font-bold leading-tight text-black my-5">
          Update Player Details Team Wise
        </h2>
        <section className="container mx-auto p-6 font-mono flex overflow-auto">
          <div className="md:w-1/2 w-full mx-auto mb-8 overflow-hidden rounded-lg shadow-lg">
            <div className="w-full overflow-x-auto">
              <table className="w-full">
                <thead className="text-md font-semibold tracking-wide text-center border-b border-gray-600">
                  <tr>
                    <th className="px-4 py-3">
                      Team 1: {state?.team1?.teamName}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white text-center">
                  {state?.team1?.players?.map((player, index) => (
                    <tr
                      key={player._id}
                      className="text-md font-semibold tracking-wide text-center border-b border-gray-600"
                    >
                      <td className="px-4 py-3 uppercase">
                        <div className="flex justify-center items-center gap-10">
                          Player {index + 1}: {player?.playerName}
                          <CiEdit
                            className="cursor-pointer text-[20px]"
                            onClick={() =>
                              navigate(
                                `/dashboard/team/${state?.team1?._id}/player/${player?._id}/updatePlayerDetail`,
                                {
                                  state: {
                                    playerId: player?._id,
                                    playerName: player?.playerName,
                                    teamId: state?.team1?._id,
                                    matchId: state?._id,
                                    leagueId: state?.league
                                  },
                                }
                              )
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <section className="container mx-auto p-6 font-mono">
          <div className="md:w-1/2 w-full mx-auto mb-8 overflow-hidden rounded-lg shadow-lg">
            <div className="w-full overflow-x-auto">
              <table className="w-full">
                <thead className="text-md font-semibold tracking-wide text-center border-b border-gray-600">
                  <tr>
                    <th className="px-4 py-3">
                      Team 2: {state?.team2?.teamName}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white text-center">
                  {state?.team2?.players?.map((player, index) => (
                    <tr
                      key={player._id}
                      className="text-md font-semibold tracking-wide text-center border-b border-gray-600"
                    >
                      <td className="px-4 py-3 uppercase">
                        <div className="flex justify-center items-center gap-10">
                          <p>
                            Player {index + 1}: {player?.playerName}
                          </p>
                          <CiEdit
                            className="cursor-pointer text-[20px]"
                            onClick={() =>
                              navigate(
                                `/dashboard/team/${state?.team1?._id}/player/${player?._id}/updatePlayerDetail`,
                                {
                                  state: {
                                    playerId: player?._id,
                                    playerName: player?.playerName,
                                    teamId: state?.team2?._id,
                                    matchId: state?._id,
                                    leagueId: state?.league
                                  },
                                }
                              )
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default PlayerSummary;
