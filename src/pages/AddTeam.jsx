import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createTeam, getCompClubs } from "../services/api";
// -------------------------------------------------------------------------------------

const AddTeam = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
  } = useForm();

  // Used to store comp clubs list
  const [clubs, setClubs] = useState([]);

  const [teamImage, setTeamImage] = useState("");

  // This block of code is used to show image preview after uploading team's image.
  useEffect(() => {
    const imageData = watch("teamImage")?.[0];
    const url = imageData ? window.URL.createObjectURL(imageData) : "";
    setTeamImage(url);
  }, [watch("teamImage")]);

  // Used to fetch existing clubs list
  const fetchClubs = async () => {
    try {
      const data = await getCompClubs();
      if (data) setClubs(data);
    } catch (error) {
      console.log("Getting an error while fetching clubs: ", error);
    }
  };

  // Used to create a new team.
  const handleCreateTeam = async (data) => {
    try {
      const formData = new FormData();
      const teamImage = data?.teamImage?.[0];

      // console.log("teamImage::: ", teamImage);

      // Check if an image is selected
      if (!teamImage) {
        toast.error("Please select a team image.");
        return;
      }

      // Check image MIME type
      if (!teamImage.type.startsWith("image/")) {
        toast.error("Invalid file format. Please select a valid image.");
        return;
      }

      // Check image size (5 MB limit)
      if (teamImage.size > 5 * 1024 * 1024) {
        toast.error(
          "Image size exceeds the 5 MB limit. Please choose a smaller image."
        );
        return;
      }

      formData.append("teamName", data?.teamName);
      formData.append("clubId", data?.clubId);
      formData.append("teamImage", teamImage);

      await createTeam(formData);
      toast.success("Team Created Successfully");
      reset();
    } catch (error) {
      console.log("Getting an error while creating team: ", error);
    }
  };

  // fetching comp clubs list
  useEffect(() => {
    fetchClubs();
  }, []);

  // ------------------------------------------------------------------------------------------
  return (
    <>
      <div className="flex items-center justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Create Team
          </h2>
          <form
            className="w-full max-w-lg mt-5"
            onSubmit={handleSubmit(handleCreateTeam)}
          >
            <div className="flex flex-wrap -mx-3 md:mb-6 mb-1">
              <div className="w-full px-3">
                <label
                  className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                  htmlFor="teamImage"
                >
                  Team Image
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="teamImage"
                  type="file"
                  {...register("teamImage", {
                    required: {
                      value: true,
                      message: "Team Image is required",
                    },
                  })}
                />
                <p className="text-red-500 text-xs italic">
                  {errors?.teamImage?.message}
                </p>
              </div>
              <div className="px-3">
                {/* Display Team Image preview */}
                {teamImage && (
                  <img
                    src={teamImage}
                    alt="Preview"
                    style={{ maxWidth: "200px" }}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full px-3">
                <label
                  className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                  htmlFor="teamName"
                >
                  Team Name
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="grid-password"
                  type="text"
                  placeholder="Enter Team Name"
                  {...register("teamName", {
                    required: {
                      value: true,
                      message: "Team Name is required",
                    },
                  })}
                />
                <p className="text-red-500 text-xs italic">
                  {errors?.teamName?.message}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap -mx-3 mb-6">
              <div className="w-full px-3">
                <label
                  className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                  htmlFor="teamName"
                >
                  Clubs List
                </label>
                <select
                  className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  {...register(`clubId`, {
                    required: {
                      value: true,
                      message: "Club Name is required",
                    },
                  })}
                >
                  <option value="">Select an option</option>

                  {clubs?.length > 0 &&
                    clubs.map((club, i) => {
                      return (
                        <option key={club?._id || i} value={club?._id}>
                          {club?.clubName}
                        </option>
                      );
                    })}
                </select>
                <p className="text-red-500 text-xs italic">
                  {errors?.clubId?.message}
                </p>
              </div>
            </div>

            <div className="submit_button">
              <button
                type="submit"
                className="px-2 py-3 bg-gray-800 text-white rounded-md w-full"
              >
                Create Team
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default AddTeam;
