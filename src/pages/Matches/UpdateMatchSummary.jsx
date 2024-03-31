import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { updateMatch } from "../../services/api";
import "react-toastify/dist/ReactToastify.css";
// ------------------------------------------------------------------------
const UpdateMatchSummary = () => {
  const navigate = useNavigate();

  const { state } = useLocation();
  // console.log("state::", state);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    defaultValues: {},
  });

  const [teamsList, setTeamsList] = useState([]);
  const [losingTeam, setLosingTeam] = useState([]);

  const handleAddSummary = async (data) => {
    try {
      const matchId = state?._id;

      const reqPayload = {
        team1: state?.team1?._id,
        team2: state?.team2?._id,
        winningTeam: {
          winningTeamId: "",
          winningTeamName: "",
          winningTeamScore: "",
        },
        losingTeam: {
          losingTeamId: "",
          losingTeamName: "",
          losingTeamScore: "",
        },
        isMatchDraw: false,
        team1stPoints: { teamId: "", teamName: "", points: null },
        team2ndPoints: { teamId: "", teamName: "", points: null },
      };

      // POINTS ALLOCATIONS CODE
      if (data?.team1stScore > data?.team2ndScore) {
        reqPayload.winningTeam = {
          winningTeamId: state?.team1?._id,
          winningTeamName: state?.team1?.teamName,
          winningTeamScore: data?.team1stScore,
        };
        reqPayload.losingTeam = {
          losingTeamId: state?.team2?._id,
          losingTeamName: state?.team2?.teamName,
          losingTeamScore: data?.team2ndScore,
        };
        reqPayload.isMatchDraw = false;
        reqPayload.team1stPoints = {
          teamId: state?.team1?._id,
          teamName: state?.team1?.teamName,
          points: 3,
        };
        reqPayload.team2ndPoints = {
          teamId: state?.team2?._id,
          teamName: state?.team2?.teamName,
          points: 0,
        };
      } else if (data?.team1stScore < data?.team2ndScore) {
        reqPayload.winningTeam = {
          winningTeamId: state?.team2?._id,
          winningTeamName: state?.team2?.teamName,
          winningTeamScore: data?.team2ndScore,
        };
        reqPayload.losingTeam = {
          losingTeamId: state?.team1?._id,
          losingTeamName: state?.team1?.teamName,
          losingTeamScore: data?.team1stScore,
        };
        reqPayload.isMatchDraw = false;
        reqPayload.team1stPoints = {
          teamId: state?.team2?._id,
          teamName: state?.team2?.teamName,
          points: 3,
        };
        reqPayload.team2ndPoints = {
          teamId: state?.team1?._id,
          teamName: state?.team1?.teamName,
          points: 0,
        };
      } else if (data?.team1stScore === data?.team2ndScore) {
        reqPayload.winningTeam = {
          winningTeamId: "N.A",
          winningTeamName: "N.A",
          winningTeamScore: "N.A",
        };
        reqPayload.losingTeam = {
          losingTeamId: "N.A",
          losingTeamName: "N.A",
          losingTeamScore: "N.A",
        };
        reqPayload.isMatchDraw = true;
        reqPayload.team1stPoints = {
          teamId: state?.team1?._id,
          teamName: state?.team1?.teamName,
          points: 1,
        };
        reqPayload.team2ndPoints = {
          teamId: state?.team2?._id,
          teamName: state?.team2?.teamName,
          points: 1,
        };
      } else {
      }

      // console.log("Request Payload is:: ", reqPayload);

      await updateMatch(matchId, {
        ...reqPayload,
        winningTeamName: reqPayload?.winningTeam?.winningTeamName,
        losingTeamName: reqPayload?.losingTeam?.losingTeamName,
      });

      toast.success("Match details updated successfully!");
      navigate("/dashboard/matches/viewMatches");
      reset(); // Clear the form on success
    } catch (error) {
      console.error("Error updating match:", error);
      toast.error("Error updating match. Please try again.");
    }
  };

  useEffect(() => {
    if (Object.keys(state)?.length > 0) {
      const teamsData = [state?.team1, state?.team2];
      // console.log(teamsData);
      teamsData?.length > 0 && setTeamsList(teamsData);
    }
  }, [state]);

  return (
    <div>
      <section>
        <div className="flex items-center justify-center">
          <div className="md:w-1/2 w-full mx-auto">
            <h2 className="text-center text-2xl font-bold leading-tight text-black my-5">
              Update Match Summary Details
            </h2>
            <form
              className="w-full max-w-lg mt-10"
              onSubmit={handleSubmit(handleAddSummary)}
            >
              <div className="flex flex-wrap -mx-3 mb-6">
                <div className="w-full md:w-1/2  mb-6 md:mb-0">
                  <div className="w-full px-3">
                    <h2 className="font-bold mb-5 text-center">
                      Team 1st <br /> {state?.team1?.teamName}
                    </h2>
                  </div>
                </div>

                <div className="w-full md:w-1/2  mb-6 md:mb-0">
                  <div className="w-full px-3">
                    <h2 className="font-bold mb-5 text-center">
                      Team 2nd <br /> {state?.team2?.teamName}
                    </h2>
                  </div>
                </div>
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <label
                    className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                    htmlFor="1stTeamScore"
                  >
                    Team 1st Score
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="1stTeamScore"
                    type="text"
                    placeholder="Enter 1st Team Score"
                    {...register("team1stScore", {
                      required: {
                        value: true,
                        message: "1st Team Score is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.team1stScore?.message}
                  </p>
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                    htmlFor="2ndTeamScore"
                  >
                    Team 2nd Score
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="2ndTeamScore"
                    type="text"
                    placeholder="Enter 2nd Team Score"
                    {...register("team2ndScore", {
                      required: {
                        value: true,
                        message: "2nd Team Score is required",
                      },
                    })}
                  />

                  <p className="text-red-500 text-xs italic">
                    {errors?.team2ndScore?.message}.
                  </p>
                </div>
              </div>
              <div className="submit_button">
                <button
                  type="submit"
                  className="px-2 py-3 bg-gray-800 text-white rounded-md w-full"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </section>
    </div>
  );
};

export default UpdateMatchSummary;
