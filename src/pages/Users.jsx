import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm } from "react-hook-form";
import { getCompClubs, updateUsersData } from "../services/api";

const Users = () => {
  // Used to store comp clubs list
  const [clubs, setClubs] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleChange = (e) => {
    setSelectedUser(e.target.value);
  };

  // Used to fetch existing clubs list
  const fetchClubs = async () => {
    try {
      const data = await getCompClubs();
      if (data) setClubs(data);
    } catch (error) {
      console.log("Getting an error while fetching clubs: ", error);
    }
  };

  const handleUsers = async (data) => {
    // console.log(data);
    try {
      const clubId = data?.clubName;
      let updatedData = { ...data };
      if (selectedUser === "admin")
        updatedData.adminPassword = data?.newPassword;
      else if (selectedUser === "team-member")
        updatedData.teamPassword = data?.newPassword;
      delete updatedData?.user;
      delete updatedData?.newPassword;
      delete updatedData?.clubName;
      await updateUsersData(clubId, updatedData);
      reset(); // Clear the form on success
    } catch (error) {
      console.error("Error updating User:", error);
      toast.error("Error updating user. Please try again.");
    }
  };

  // fetching comp clubs list
  useEffect(() => {
    fetchClubs();
  }, []);

  return (
    <>
      <div className="flex  flex-col items-center justify-center">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            Update User's Credentials
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit(handleUsers)}>
            {/* Club Section Starts Here */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Club Name
              </label>
              <div className="mt-2">
                <select
                  className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  {...register(`clubName`, {
                    required: {
                      value: true,
                      message: "Club Name is required",
                    },
                  })}
                >
                  <option value="">Select Club</option>
                  {clubs?.length > 0 &&
                    clubs.map((val, i) => {
                      return (
                        <option key={val?._id || i} value={val?._id}>
                          {val?.clubName}
                        </option>
                      );
                    })}
                </select>
                <p className="text-red-500 text-sm my-2">
                  {errors?.clubName?.message}
                </p>
              </div>
            </div>
            {/* Club Section Ends Here  */}

            {/* Admin Section Starts Here */}

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  User
                </label>
              </div>
              <div className="mt-2">
                <select
                  className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  {...register(`user`, {
                    required: {
                      value: true,
                      message: "User is required",
                    },
                    onChange: (e) => handleChange(e),
                  })}
                >
                  <option value="">Select Users</option>
                  <option value="admin">Admin</option>
                  <option value="team-member">Team Member</option>
                </select>
                <p className="text-red-500 text-sm my-2">
                  {errors?.user?.message}
                </p>
              </div>
            </div>
            {/* Admin Section Ends Here  */}

            {/* Team Section Starts Here */}

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  New Password
                </label>
              </div>
              <div className="mt-2">
                <input
                  id="password"
                  type="password"
                  placeholder="Please enter new password"
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  {...register("newPassword", {
                    required: {
                      value: true,
                      message: "New Password is required",
                    },
                  })}
                />
                <p className="text-red-500 text-sm my-2">
                  {errors?.newPassword?.message}
                </p>
              </div>
            </div>
            {/* Team Section Ends Here  */}
            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md bg-gray-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Update
              </button>
            </div>
          </form>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default Users;
