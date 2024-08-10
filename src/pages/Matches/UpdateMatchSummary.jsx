import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { getImage, updateMatch } from "../../services/api";
import "react-toastify/dist/ReactToastify.css";
import { IoMdArrowRoundBack } from "react-icons/io";
import { ImSpinner3 } from "react-icons/im";
import { FaChevronCircleRight } from "react-icons/fa";
import { Button } from "@/components/ui/button";
// ------------------------------------------------------------------------
const baseURL = import.meta.env.VITE_BASE_URL;

const UpdateMatchSummary = () => {
  const navigate = useNavigate();

  const { state } = useLocation();
  console.log(state)
  const [isSubmiting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState({
    image1: "",
    image2: ''
  })
  const [teamsList, setTeamsList] = useState([]);
  const [losingTeam, setLosingTeam] = useState([]);
  const [winningTeam, setWinningTeam] = useState(state?.winningTeam || '')
  const [loosingTeam, setloosingTeam] = useState(state?.losingTeam || '')

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      team1stScore: state?.team1stPoints?.score || 0,
      team2ndScore: state?.team2ndPoints?.score || 0
    },
  });



  const handleAddSummary = async (data) => {
    setIsSubmitting(true)
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
        team1stPoints: { teamId: "", teamName: "", points: null, score: data.team1stScore },
        team2ndPoints: { teamId: "", teamName: "", points: null, score: data.team2ndScore }
      };

      // POINTS ALLOCATIONS CODE
      if (Number(data?.team1stScore) > Number(data?.team2ndScore)) {
        reqPayload.winningTeam = {
          winningTeamId: state?.team1?._id,
          winningTeamName: state?.team1?.teamName,
          winningTeamScore: Number(data?.team1stScore),
        };
        reqPayload.losingTeam = {
          losingTeamId: state?.team2?._id,
          losingTeamName: state?.team2?.teamName,
          losingTeamScore: Number(data?.team2ndScore),
        };
        reqPayload.isMatchDraw = false;
        reqPayload.team1stPoints = {
          teamId: state?.team1?._id,
          teamName: state?.team1?.teamName,
          points: 3,
          score: Number(data.team1stScore)
        };
        reqPayload.team2ndPoints = {
          teamId: state?.team2?._id,
          teamName: state?.team2?.teamName,
          points: 0,
          score: Number(data.team2ndScore)
        };
      } else if (Number(data?.team1stScore) < Number(data?.team2ndScore)) {
        reqPayload.winningTeam = {
          winningTeamId: state?.team2?._id,
          winningTeamName: state?.team2?.teamName,
          winningTeamScore: Number(data?.team2ndScore),
        };
        reqPayload.losingTeam = {
          losingTeamId: state?.team1?._id,
          losingTeamName: state?.team1?.teamName,
          losingTeamScore: Number(data?.team1stScore),
        };
        reqPayload.isMatchDraw = false;
        reqPayload.team1stPoints = {
          teamId: state?.team2?._id,
          teamName: state?.team2?.teamName,
          points: 3,
          score: Number(data.team1stScore)
        };
        reqPayload.team2ndPoints = {
          teamId: state?.team1?._id,
          teamName: state?.team1?.teamName,
          points: 0,
          score: Number(data.team2ndScore)
        };
      } else if (Number(data?.team1stScore) === Number(data?.team2ndScore)) {
        reqPayload.winningTeam = {
          winningTeamId: "Tie",
          winningTeamName: "Tie",
          winningTeamScore: "Tie",
        };
        reqPayload.losingTeam = {
          losingTeamId: "Tie",
          losingTeamName: "Tie",
          losingTeamScore: "Tie",
        };
        reqPayload.isMatchDraw = true;
        reqPayload.team1stPoints = {
          teamId: state?.team1?._id,
          teamName: state?.team1?.teamName,
          points: 1,
          score: Number(data.team1stScore)
        };
        reqPayload.team2ndPoints = {
          teamId: state?.team2?._id,
          teamName: state?.team2?.teamName,
          points: 1,
          score: Number(data.team2ndScore)
        };
      }
      const response = await updateMatch(matchId, {
        ...reqPayload,
        winningTeamName: reqPayload?.winningTeam?.winningTeamName,
        losingTeamName: reqPayload?.losingTeam?.losingTeamName,
      });
      if (response.status === "SUCCESS") {
        toast.success("Match details updated successfully!");
        navigate("/dashboard/matches/viewMatches");
        reset(); // Clear the form on success
      }
    } catch (error) {
      console.error("Error updating match:", error);
      toast.error("Error updating match. Please try again.");
    } finally {
      setIsSubmitting(false)
    }
  };



  return (
    <div className="">
      <section>
        <div className="p-2">
          <IoMdArrowRoundBack className="h-8 w-8 cursor-pointer" onClick={() => navigate(-1)} />
        </div>
        <div className="flex items-center justify-center">
          <div className="md:w-1/2 flex flex-col items-center w-full mx-auto">
            <h2 className="text-center text-2xl font-bold leading-tight text-orange-600 my-5">
              Update Match Summary Details
            </h2>
            <form
              className="w-full max-w-lg mt-10"
              onSubmit={handleSubmit(handleAddSummary)}
            >
              <div className="flex flex-wrap -mx-3 mb-6">
                <div className="w-full md:w-1/2  mb-6 md:mb-0">
                  <div className="w-full px-3">
                    <div className=" h-42 flex items-center justify-center">
                      <img src={`${baseURL}/uploads/${state?.team1?.teamImage.split('/').pop().split('\\').pop()}`} alt={`${state?.team1?.teamName}`}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }} className="border w-32 h-32 rounded-full object-cover " />
                    </div>
                    <h2 className="font-bold mb-5 text-center">
                      {state?.team1?.teamName}
                    </h2>

                  </div>
                </div>

                <div className="w-full md:w-1/2  mb-6 md:mb-0">
                  <div className="w-full px-3">
                    <div className=" h-42 flex items-center justify-center">
                      <img src={`${baseURL}/uploads/${state.team2.teamImage.split('/').pop().split('\\').pop()}`} alt={`${state?.team2?.teamName}`}
                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }} className="border w-32 h-32 rounded-full object-cover " />
                    </div>
                    <h2 className="font-bold mb-5 text-center">
                      {state?.team2?.teamName}
                    </h2>
                  </div>
                </div>
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <label
                    className="block uppercase tracking-wide text-gray-500  text-xs font-bold mb-2"
                    htmlFor="1stTeamScore"
                  >
                    Team 1st Score
                  </label>
                  <input
                    className="appearance-none block w-full  text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="1stTeamScore"
                    type="number"
                    placeholder="Enter 1st Team Score"
                    min={0}
                    {...register("team1stScore", {
                      required: {
                        value: true,
                        message: "1st Team Score is required",

                      },
                    })}
                    defaultValue={teamsList[0]?.score}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.team1stScore?.message}
                  </p>
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-500  text-xs font-bold mb-2"
                    htmlFor="2ndTeamScore"
                  >
                    Team 2nd Score
                  </label>
                  <input
                    className="appearance-none block w-full  text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="2ndTeamScore"
                    type="number"
                    min={0}
                    placeholder="Enter 2nd Team Score"
                    {...register("team2ndScore", {
                      required: {
                        value: true,
                        message: "2nd Team Score is required",
                      },
                    })}
                    defaultValue={teamsList[1]?.score}
                  />

                  <p className="text-red-500 text-xs italic">
                    {errors?.team2ndScore?.message}.
                  </p>
                </div>
              </div>
              <div className="submit_button">
                <Button
                  type="submit"
                  className="px-2 py-3 bg-orange-600 text-white rounded-md w-full disabled:bg-gray-600 flex items-center justify-center"
                  disabled={isSubmiting}
                >
                  Submit <>
                    {
                      isSubmiting ? <ImSpinner3 className="w-4 h-4 ml-2 animate-spin" /> : <FaChevronCircleRight className="w-4 h-4 ml-2" />
                    }
                  </>
                </Button>
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
