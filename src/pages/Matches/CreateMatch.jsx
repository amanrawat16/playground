import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { createMatch, getAllLeagues, getTeam } from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router";
// -------------------------------------------------------------------------------------
const CreateMatch = () => {
  const navigate = useNavigate();
  const [teamsList, setTeamsList] = useState([]);
  const [teamsSecondList, setTeamsSecondList] = useState([]);
  const [teamFirstSelectedValue, setTeamFirstSelectedValue] = useState("");
  const [leaguesList, setLeaguesList] = useState([]);
  const matchType = ["Regular-round", 'Quater-final', 'Semi-final', 'Final']

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
  } = useForm();

  const selectedLeague = watch("league");
  console.log("selectedLeague::: ", selectedLeague);

  const handleOnChange = (e) => {
    setTeamFirstSelectedValue(e.target.value);
  };

  const handleCreateMatch = async (data) => {
    console.log(data)
    try {
      const obj = {
        team1: data?.team1,
        team2: data?.team2,
        date: data?.matchDate,
        time: {
          startTime: data?.startTime,
          endTime: data?.endTime,
        },
        location: data?.location,
        league: data?.league,
      };
      await createMatch(obj);
      reset();
      toast.success("Match Created Successfully");
      setTimeout(() => {
        navigate("/dashboard/matches/viewMatches");
      }, 500);
    } catch (error) {
      console.log("Getting an error while creating match: ", error);
    }
  };

  // used to fetch the teams list
  const fetchTeams = async () => {
    try {
      const teamsData = await getTeam();
      console.log("Teams data:::", teamsData);

      function filterTeamsByLeague(teams, leagueId) {
        return teams.filter((team) => team?.clubId?.league === leagueId);
      }

      const filteredTeams = filterTeamsByLeague(
        teamsData?.teams,
        selectedLeague
      );

      console.log("filteredTeams:::: ", filteredTeams);

      setTeamsList(filteredTeams);
      setTeamsSecondList(filteredTeams);
    } catch (error) {
      console.log("Getting an error while fetching teams list: ", error);
    }
  };

  // used to fetch the leagues list
  const fetchLeagues = async () => {
    try {
      const data = await getAllLeagues();
      // console.log("data:::", data);
      setLeaguesList(data?.leagues);
    } catch (error) {
      console.log("Getting an error while fetching leagues list: ", error);
    }
  };

  // fetching teams list
  useEffect(() => {
    selectedLeague && fetchTeams();
    fetchLeagues();
  }, [selectedLeague]);

  //Select Team2 on basis of Team1
  useEffect(() => {
    const teamSecondCompleteData = [...teamsList];
    const teamSecondFilteredData =
      teamSecondCompleteData.length > 0 &&
      teamSecondCompleteData.filter(
        (ele) => ele?._id !== teamFirstSelectedValue
      );
    setTeamsSecondList(teamSecondFilteredData);
  }, [teamFirstSelectedValue]);

  return (
    <>
      <section>
        <div className="flex items-center justify-center">
          <div className="md:w-1/2 w-full mx-auto">
            <h2 className="text-center text-2xl font-bold leading-tight text-black my-1">
              Create Match
            </h2>
            <form
              className="w-full max-w-lg mt-5"
              onSubmit={handleSubmit(handleCreateMatch)}
            >
              <div className="flex flex-wrap -mx-3 mb-2 ">
                <div className="w-full mb-6 md:mb-0">
                  <label
                    className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                    htmlFor="grid-first-name"
                  >
                    Please Select League
                  </label>
                  <select
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    {...register(`league`, {
                      required: {
                        value: true,
                        message: "League Name is required",
                      },
                    })}
                  >
                    <option value="">Select League</option>
                    {leaguesList?.length > 0 &&
                      leaguesList.map((league, i) => {
                        return (
                          <option key={league?._id || i} value={league?._id}>
                            {league?.leagueName}
                          </option>
                        );
                      })}
                  </select>
                  <p className="text-red-500 text-xs italic">
                    {errors?.league?.message}
                  </p>
                </div>
                <div className="w-full md:w-1/2 px-3 mb-2 md:mb-0">
                  <label
                    className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                    htmlFor="grid-first-name"
                  >
                    Team 1
                  </label>
                  <select
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    {...register(`team1`, {
                      required: {
                        value: true,
                        message: "Team is required",
                      },
                      onChange: (e) => handleOnChange(e),
                    })}
                  >
                    <option value="">Select Team</option>
                    {teamsList?.length > 0 &&
                      teamsList.map((team, i) => {
                        return (
                          <option key={team?._id || i} value={team?._id}>
                            {team?.teamName}
                          </option>
                        );
                      })}
                  </select>
                  <p className="text-red-500 text-xs italic">
                    {errors?.team1?.message}
                  </p>
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                    htmlFor="grid-last-name"
                  >
                    Team 2
                  </label>
                  <select
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    {...register(`team2`, {
                      required: {
                        value: true,
                        message: "Team2 is required",
                      },
                    })}
                  >
                    <option value="">Select Team</option>

                    {teamsSecondList.length > 0 &&
                      teamsSecondList.map((team, i) => {
                        return (
                          <option key={team?._id || i} value={team?._id}>
                            {team?.teamName}
                          </option>
                        );
                      })}
                  </select>

                  <p className="text-red-500 text-xs italic">
                    {errors?.team2?.message}.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 mb-2">
                <div className="w-full px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                    htmlFor="clubName"
                  >
                    Match Date
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="matchDate"
                    type="date"
                    placeholder="Enter Match Date"
                    {...register("matchDate", {
                      required: {
                        value: true,
                        message: "Match Date is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.matchDate?.message}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 mb-2">
                <div className="w-full md:w-1/2 px-3 mb-2 md:mb-0">
                  <label
                    className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                    htmlFor="grid-first-name"
                  >
                    Start Time
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  rounded py-3 px-4 mb-2 leading-tight focus:bg-white "
                    id="startTime"
                    type="time"
                    placeholder="Select Time"
                    {...register("startTime", {
                      required: {
                        value: true,
                        message: "Start Time is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.startTime?.message}
                  </p>
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                    htmlFor="grid-last-name"
                  >
                    End Time
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 leading-tight focus:bg-white focus:border-gray-500"
                    id="endTime"
                    type="time"
                    placeholder="Enter Tine"
                    {...register("endTime", {
                      required: {
                        value: true,
                        message: "End Time is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.endTime?.message}.
                  </p>
                </div>
              </div>
              <div className='w-full my-4'>
                <label
                  className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                  htmlFor="grid-last-name"
                >
                  Chosse Match Type
                </label>
                <select name="matchType" id="matchType" className='w-full h-12 bg-gray-200' {
                  ...register('matchType', {
                    required: {
                      value: 'Regular-round',
                      message: "Match type is required"
                    }
                  })
                }>
                  {
                    matchType.map((match, index) => {
                      return <option value={match} key={index}>{match}</option>
                    })
                  }
                </select>
                <p className="text-red-500 text-xs italic">
                  {errors?.matchType?.message}
                </p>
              </div>
              <div className="flex flex-wrap -mx-3 mb-2">
                <div className="w-full px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                    htmlFor="clubName"
                  >
                    Location
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="locaion"
                    type="text"
                    placeholder="Please enter match venue"
                    {...register("location", {
                      required: {
                        value: true,
                        message: "Location is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.location?.message}
                  </p>
                </div>
              </div>

              <div className="submit_button my-4">
                <button
                  type="submit"
                  className="px-2 py-2 bg-gray-800 text-white rounded-md w-full"
                >
                  Create Match
                </button>
              </div>
            </form>
          </div>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </section>
    </>
  );
};

export default CreateMatch;
