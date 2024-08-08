import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { IoMdArrowRoundBack } from "react-icons/io";
import AntDTable from "@/components/AntDTable/AntDTable";

const PlayerSummary = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  console.log(state.team1?.players)




  return (
    <>
      <div id="content-3a">
        <div className="p-2">
          <IoMdArrowRoundBack className="h-8 w-8 cursor-pointer" onClick={() => navigate(-1)} />
        </div>
        <h2 className="text-center text-2xl font-bold leading-tight text-orange-600 my-5">
          Update Player Details Team Wise
        </h2>
        <div className="flex">
          <section className="container mx-auto p-6 font-mono flex overflow-auto">
            <div className="w-4/5  mx-auto mb-8 overflow-hidden rounded-lg shadow-lg">
              <div className="w-full overflow-x-auto">
                <table className="w-full">
                  <thead className="text-md font-semibold tracking-wide text-center border-b bg-orange-600 text-white">
                    <tr>
                      <th className="px-4 py-3">
                        {state?.team1?.teamName}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white text-center">
                    {state?.team1?.players?.map((player, index) => (
                      <tr
                        key={player._id}
                        className="text-md font-semibold tracking-wide text-center border-b"
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
                                      ...player,
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
            <div className="w-4/5 mx-auto mb-8 overflow-hidden rounded-lg shadow-lg">
              <div className="w-full overflow-x-auto">
                <table className="w-full">
                  <thead className="text-md font-semibold tracking-wide text-center border-b bg-orange-600 text-white">
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
                        className="text-md font-semibold tracking-wide text-center border-b"
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
      </div>
    </>
  );
};

export default PlayerSummary;
