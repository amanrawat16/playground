import React from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { updatePlayerDetails } from "../../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UpdatePlayerDetails = () => {
  const { state } = useLocation();
  console.log("state::", state);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleUpdatePlayerDetails = async (data) => {
    try {
      const teamId = state?.teamId;
      const playerId = state?.playerId;
      const matchId = state?.matchId;
      const leagueId = state?.leagueId;
      await updatePlayerDetails(teamId, playerId, { ...data, matchId, leagueId });
      toast.success("Player details updated successfully!");
      navigate("/dashboard/matches/viewMatches");
      reset(); // Clear the form on success
    } catch (error) {
      console.error("Error updating Player details:", error);
      toast.error(error?.response?.data?.message || "");
    }
  };

  return (
    <>
      <section>
        <div className="flex items-center justify-center">
          <div className="md:w-1/2 w-full mx-auto my-1">
            <h2 className="text-center text-2xl font-bold leading-tight text-black m-5">
              Update Player's Match Attributes
            </h2>
            <form
              className="w-full max-w-lg"
              onSubmit={handleSubmit(handleUpdatePlayerDetails)}
            >
              <div className="flex flex-wrap -mx-3">
                <div className="w-full md:w-1/2 px-3 mb-2 md:mb-0">
                  <div className="flex items-center gap-5 justify-between">
                    <label
                      className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                      htmlFor="grid-first-name"
                    >
                      Sacks
                    </label>
                    <span className="mb-2">
                      <img src="/sack.png" width={20} height={20} alt="sack" />
                    </span>
                  </div>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="pointsSacks"
                    type="text"
                    placeholder="Enter Points Sacks"
                    {...register("pointsSacks", {
                      required: {
                        value: false,
                        message: "Points Sacks is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.pointsSacks?.message}
                  </p>
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <div className="flex justify-between items-center">
                    <label
                      className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                      htmlFor="grid-last-name"
                    >
                      Safety
                    </label>
                    <span className="mb-2">
                      <img
                        src="/safety.png"
                        width={20}
                        height={20}
                        alt="sack"
                      />
                    </span>
                  </div>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="pointsSafety"
                    type="text"
                    placeholder="Enter Points Safety"
                    {...register("pointsSafety", {
                      required: {
                        value: false,
                        message: "Points Safety is required",
                      },
                    })}
                  />

                  <p className="text-red-500 text-xs italic">
                    {errors?.pointsSafety?.message}.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap -mx-3">
                <div className="w-full md:w-1/2 px-3 mb-2 md:mb-0">
                  <div className="flex justify-between items-center">
                    <label
                      className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                      htmlFor="grid-first-name"
                    >
                      FirstDown
                    </label>
                    <span className="mb-2">
                      <img
                        src="/firstdown.png"
                        width={20}
                        height={20}
                        alt="sack"
                      />
                    </span>
                  </div>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="pointsfirstDown"
                    type="text"
                    placeholder="Enter Points FirstDown"
                    {...register("pointsfirstDown", {
                      required: {
                        value: false,
                        message: "Points FirstDown is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.pointsfirstDown?.message}
                  </p>
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <div className="flex justify-between items-center">
                    <label
                      className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                      htmlFor="grid-last-name"
                    >
                      Interception
                    </label>
                    <span className="mb-2">
                      <img
                        src="/interception.png"
                        width={20}
                        height={20}
                        alt="sack"
                      />
                    </span>
                  </div>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="interseption"
                    type="text"
                    placeholder="Enter Interception     "
                    {...register("interception", {
                      required: {
                        value: false,
                        message: "Interception is required",
                      },
                    })}
                  />

                  <p className="text-red-500 text-xs italic">
                    {errors?.interception?.message}.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap -mx-3">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <div className="flex justify-between items-center">
                    <label
                      className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                      htmlFor="grid-first-name"
                    >
                      Assist
                    </label>
                    <span className="mb-2">
                      <img
                        src="/assist.png"
                        width={20}
                        height={20}
                        alt="sack"
                      />
                    </span>
                  </div>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="assist"
                    type="text"
                    placeholder="Enter Assist"
                    {...register("assist", {
                      required: {
                        value: false,
                        message: "Assist is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.assist?.message}
                  </p>
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <div className="flex justify-between items-center">
                    <label
                      className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                      htmlFor="grid-last-name"
                    >
                      ExtraPoint1
                    </label>
                    <span className="mb-2">
                      <img
                        src="/extrapoint1.png"
                        width={20}
                        height={20}
                        alt="sack"
                      />
                    </span>
                  </div>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="extraPoint1"
                    type="text"
                    placeholder="Enter ExtraPoint1"
                    {...register("extraPoint1", {
                      required: {
                        value: false,
                        message: "ExtraPoint1 is required",
                      },
                    })}
                  />

                  <p className="text-red-500 text-xs italic">
                    {errors?.extraPoint1?.message}.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap -mx-3">
                <div className="w-full md:w-1/2 px-3 mb-2 md:mb-0">
                  <div className="flex justify-between items-center">
                    <label
                      className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                      htmlFor="grid-first-name"
                    >
                      Return
                    </label>
                    <span className="mb-2">
                      <img
                        src="/return.png"
                        width={20}
                        height={20}
                        alt="sack"
                      />
                    </span>
                  </div>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="return"
                    type="text"
                    placeholder="Enter Return"
                    {...register("returnVal", {
                      required: {
                        value: false,
                        message: "Return is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.returnVal?.message}
                  </p>
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <div className="flex justify-between items-center">
                    <label
                      className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                      htmlFor="grid-last-name"
                    >
                      ExtraPoint2
                    </label>
                    <span className="mb-2">
                      <img
                        src="/extrapoint2.png"
                        width={20}
                        height={20}
                        alt="sack"
                      />
                    </span>
                  </div>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="extraPoint1"
                    type="text"
                    placeholder="Enter ExtraPoint2"
                    {...register("extraPoint2", {
                      required: {
                        value: false,
                        message: "ExtraPoint2 is required",
                      },
                    })}
                  />

                  <p className="text-red-500 text-xs italic">
                    {errors?.extraPoint2?.message}.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap -mx-3">
                <div className="w-full md:w-1/2 px-3 mb-2 md:mb-0">
                  <div className="flex justify-between items-center">
                    <label
                      className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                      htmlFor="grid-first-name"
                    >
                      Pick
                    </label>
                    <span className="mb-2">
                      <img src="/pick6.png" width={20} height={20} alt="sack" />
                    </span>
                  </div>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="pick"
                    type="text"
                    placeholder="Enter Pick"
                    {...register("pickSix", {
                      required: {
                        value: false,
                        message: "Pick is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.pickSix?.message}
                  </p>
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <div className="flex justify-between items-center">
                    <label
                      className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                      htmlFor="grid-last-name"
                    >
                      Touchdown
                    </label>
                    <span className="mb-2">
                      <img
                        src="/touchdown.png"
                        width={20}
                        height={20}
                        alt="touchdown"
                      />
                    </span>
                  </div>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="extraPoint1"
                    type="text"
                    placeholder="Enter Touchdown"
                    {...register("touchdown", {
                      required: {
                        value: false,
                        message: "Touchdown is required",
                      },
                    })}
                  />

                  <p className="text-red-500 text-xs italic">
                    {errors?.touchdown?.message}.
                  </p>
                </div>
              </div>
              <div className="submit_button mb-0">
                <button
                  type="submit"
                  className="px-2 py-2 bg-gray-800 text-white rounded-md w-full mb-5"
                >
                  Submit
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

export default UpdatePlayerDetails;
