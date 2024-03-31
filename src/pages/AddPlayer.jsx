import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getTeam, updateTeam } from "../services/api";
// -----------------------------------------------------------------------------
const AddPlayer = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm();

  // Used to store comp teams list
  const [teamsList, setTeamsList] = useState([]);

  const userType = localStorage.getItem("userType");
  const _id = localStorage.getItem("_id");

  const handleUpdateTeam = async (data) => {
    // console.log("data:::", data);
    const { playerName, position, role, jerseyNumber, email, teamName } = data;
    const players = [];
    players.push({
      playerName,
      position,
      role,
      jerseyNumber,
      email,
    });

    try {
      // You can send the team creation data to your API service here
      await updateTeam(teamName, {
        players,
        clubId: _id,
      });
      toast.success("Team details updated successfully!");
      reset(); // Clear the form on success
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Error creating team. Please try again.");
    }
  };

  // Used to fetch existing teams list
  const fetchTeams = async () => {
    try {
      const data = await getTeam();
      // Filter data based on logged in Club id
      let filteredData = [];
      filteredData =
        data?.teams?.length > 0 &&
        data?.teams?.filter((team) => team?.clubId?._id === _id);
      setTeamsList(filteredData);
    } catch (error) {
      console.log("Getting an error while fetching teams list: ", error);
    }
  };

  // fetching teams list
  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div className="md:w-1/2 w-full mx-auto">
        <h2 className="text-center text-2xl font-bold leading-tight text-black my-2">
          Update Team
        </h2>
        <form
          className="w-full max-w-lg mt-5"
          onSubmit={handleSubmit(handleUpdateTeam)}
        >
          {Array.isArray(teamsList) && teamsList?.length > 0 && (
            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full px-3">
                <label
                  className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                  htmlFor="teamName"
                >
                  Team List
                </label>
                <select
                  className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  {...register(`teamName`, {
                    required: {
                      value: true,
                      message: "Team Name is required",
                    },
                  })}
                >
                  <option value="">Select an option</option>

                  {teamsList.map((team, i) => {
                    return (
                      <option key={team?._id || i} value={team?._id}>
                        {team?.teamName}
                      </option>
                    );
                  })}
                </select>
                <p className="text-red-500 text-xs italic">
                  {errors?.teamName?.message}
                </p>
              </div>
            </div>
          )}

          {/* Player Fields */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Players</h3>
            <div className="flex flex-wrap -mx-3 mb-10">
              <div className="w-full md:w-2/3 px-3">
                <label className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2">
                  Player Name
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="text"
                  placeholder="Enter Player Name"
                  {...register(`playerName`, {
                    required: {
                      value: true,
                      message: "Player Name is required",
                    },
                  })}
                />
                <p className="text-red-500 text-xs italic">
                  {errors?.playerName?.message}
                </p>
              </div>

              <div className="w-full md:w-1/3 px-3">
                <label className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2">
                  Position
                </label>
                <select
                  className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  {...register(`position`, {
                    required: {
                      value: true,
                      message: "Position is required",
                    },
                  })}
                >
                  <option value="Quarterback">Quarterback</option>
                  <option value="Rusher">Rusher</option>
                  <option value="Offensive Player">Offensive Player</option>
                  <option value="Defensive Player">Defensive Player</option>
                  <option value="NONE">NONE</option>
                </select>
                <p className="text-red-500 text-xs italic">
                  {errors?.position?.message}
                </p>
              </div>

              <div className="w-full md:w-full px-3">
                <label className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2">
                  Player Email
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="email"
                  placeholder="Enter Player Email"
                  {...register(`email`, {
                    required: {
                      value: true,
                      message: "Player email is required",
                    },
                  })}
                />
                <p className="text-red-500 text-xs italic">
                  {errors?.email?.message}
                </p>
              </div>

              <div className="w-full md:w-1/3 px-3">
                <label className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2">
                  Role
                </label>
                <select
                  className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  {...register(`role`, {
                    required: {
                      value: true,
                      message: "Player Role is required",
                    },
                  })}
                >
                  <option value="PLAYER">Player</option>
                  <option value="STAFF">Staff</option>
                </select>
                <p className="text-red-500 text-xs italic">
                  {errors?.role?.message}
                </p>
              </div>

              <div className="w-full md:w-2/3 px-3">
                <label className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2">
                  Jersey Number
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  type="text"
                  placeholder="Enter Jersey Number"
                  {...register(`jerseyNumber`, {
                    required: {
                      value: true,
                      message: "Jersey Number is required",
                    },
                  })}
                />
                <p className="text-red-500 text-xs italic">
                  {errors?.jerseyNumber?.message}
                </p>
              </div>

              {/* Add similar structure for other player fields */}
              {/* ... */}
            </div>
          </div>

          {/* Submit Button */}
          <div className="submit_button mb-5">
            <button
              type="submit"
              className="px-2 py-3 bg-gray-800 text-white rounded-md w-full"
            >
              Update Team
            </button>
          </div>
        </form>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
};

export default AddPlayer;
