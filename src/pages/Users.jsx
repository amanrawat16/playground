import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useForm, Controller } from "react-hook-form";
import { getCompClubs, updateUsersData } from "../services/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Building2, User } from "lucide-react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { ImSpinner3 } from "react-icons/im";

const Users = () => {
  // Used to store comp clubs list
  const [clubs, setClubs] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm();

  const handleChange = (e) => {
    setSelectedUser(e.target.value);
  };

  // Used to fetch existing clubs list
  const fetchClubs = async () => {
    try {
      setIsLoading(true);
      const data = await getCompClubs();
      if (data) setClubs(data);
    } catch (error) {
      console.error("Error fetching clubs: ", error);
      toast.error("Failed to load clubs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUsers = async (data) => {
    // Client-side validation
    if (!data.newPassword || data.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setIsSubmitting(true);
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
      toast.success(`Password updated successfully for ${selectedUser === "admin" ? "Admin" : "Team Member"}`);
      reset(); // Clear the form on success
      setSelectedUser(""); // Reset selected user
      setShowPassword(false); // Reset password visibility
    } catch (error) {
      console.error("Error updating User:", error);
      // Extract error message from API response
      const errorMessage = error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to update password. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // fetching comp clubs list
  useEffect(() => {
    fetchClubs();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-900/20 mb-4">
            <Shield className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Update User Credentials
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Change password for club administrators or team members
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700 p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit(handleUsers)}>
            {/* Club Selection */}
            <div className="space-y-2">
              <Label htmlFor="clubName" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-600" />
                Club Name <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="clubName"
                control={control}
                rules={{ required: "Club Name is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <SelectTrigger className="w-full h-11 border-2 border-slate-600 bg-[#0f172a] text-slate-200 focus:border-orange-500">
                      <SelectValue placeholder="Select a club" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                      {clubs?.length > 0 ? (
                        clubs.map((club) => (
                          <SelectItem key={club._id} value={club._id} className="focus:bg-slate-700 focus:text-white">
                            {club.clubName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No clubs available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors?.clubName && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>⚠</span> {errors.clubName.message}
                </p>
              )}
            </div>

            {/* User Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="user" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-orange-600" />
                User Type <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="user"
                control={control}
                rules={{ required: "User type is required" }}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleChange({ target: { value } });
                    }}
                    value={field.value || ""}
                  >
                    <SelectTrigger className="w-full h-11 border-2 border-slate-600 bg-[#0f172a] text-slate-200 focus:border-orange-500">
                      <SelectValue placeholder="Select user type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                      <SelectItem value="admin" className="focus:bg-slate-700 focus:text-white">Admin</SelectItem>
                      <SelectItem value="team-member" className="focus:bg-slate-700 focus:text-white">Team Member</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors?.user && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>⚠</span> {errors.user.message}
                </p>
              )}
              {selectedUser && (
                <p className="text-sm text-slate-400 bg-blue-900/20 p-2 rounded-lg border border-blue-800">
                  You are updating the password for: <span className="font-semibold text-blue-400">
                    {selectedUser === "admin" ? "Club Administrator" : "Team Member"}
                  </span>
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-600" />
                New Password <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password (min. 6 characters)"
                  className="w-full h-11 pr-10 border-2 border-slate-600 bg-[#0f172a] text-slate-200 focus:border-orange-500"
                  {...register("newPassword", {
                    required: "New Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <IoEyeOff className="w-5 h-5" />
                  ) : (
                    <IoEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors?.newPassword && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <span>⚠</span> {errors.newPassword.message}
                </p>
              )}
              <p className="text-xs text-slate-500">
                Password must be at least 6 characters long
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold text-base shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <ImSpinner3 className="w-5 h-5 animate-spin" />
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Update Password
                  </span>
                )}
              </Button>
            </div>
          </form>

          {/* Info Section */}
          <div className="mt-6 pt-6 border-t border-slate-700">
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-400">
                <strong>Note:</strong> This will update the password for the selected user type in the chosen club.
                Make sure you have the proper authorization to perform this action.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
};

export default Users;
