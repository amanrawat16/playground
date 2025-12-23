import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createTeam, getAllLeagues, getCompClubs } from "../services/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ImSpinner3 } from "react-icons/im";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Users, Trophy, Image as ImageIcon, Mail, Lock, X } from "lucide-react";

const AddTeam = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm();

  const [clubs, setClubs] = useState([]);
  const [teamImage, setTeamImage] = useState("");
  const [leagues, setLeagues] = useState([]);
  const [selectedClub, setSelectedClub] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [clubSelectKey, setClubSelectKey] = useState(0);
  const [leagueSelectKey, setLeagueSelectKey] = useState(0);

  useEffect(() => {
    const imageData = watch("teamImage")?.[0];
    const url = imageData ? window.URL.createObjectURL(imageData) : "";
    setTeamImage(url);
  }, [watch("teamImage")]);

  const fetchClubs = async () => {
    try {
      const data = await getCompClubs();
      if (data) setClubs(data);
    } catch (error) {
      console.log("Getting an error while fetching clubs: ", error);
    }
  };

  const fetchLeagues = async () => {
    try {
      const response = await getAllLeagues();
      if (response.status === "SUCCESS") {
        setLeagues(response.leagues);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateTeam = async (data) => {
    setIsCreatingTeam(true)
    try {
      const formData = new FormData();
      const teamImage = data?.teamImage?.[0];

      // Validate team image
      if (!teamImage) {
        toast.error("Please select a team image.");
        setIsCreatingTeam(false);
        return;
      }
      if (!teamImage.type.startsWith("image/")) {
        toast.error("Invalid file format. Please select a valid image.");
        setIsCreatingTeam(false);
        return;
      }
      if (teamImage.size > 5 * 1024 * 1024) {
        toast.error("Image size exceeds the 5 MB limit. Please choose a smaller image.");
        setIsCreatingTeam(false);
        return;
      }

      // Validate that at least one (club or league) is selected
      if (!selectedClub && !selectedLeague) {
        toast.error("Please select at least a club or a league to join");
        setIsCreatingTeam(false);
        return;
      }

      // Validate password length
      if (data?.teamPassword && data.teamPassword.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        setIsCreatingTeam(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (data?.teamEmail && !emailRegex.test(data.teamEmail)) {
        toast.error("Please enter a valid email address.");
        setIsCreatingTeam(false);
        return;
      }

      formData.append("teamName", data?.teamName);
      if (selectedClub && selectedClub !== "none") {
        formData.append("clubId", selectedClub);
      }
      if (selectedLeague && selectedLeague !== "none") {
        formData.append("leagueId", selectedLeague);
      }
      formData.append("teamImage", teamImage);
      formData.append('teamEmail', data?.teamEmail);
      formData.append('teamPassword', data?.teamPassword);

      const response = await createTeam(formData);

      if (response.status === "SUCCESS") {
        toast.success("Team Created Successfully");
        reset();
        setSelectedClub("");
        setSelectedLeague("");
        setTeamImage("");
      }
    } catch (error) {
      console.error("Error creating team:", error);

      // Extract error message from API response
      let errorMessage = "Error creating team. Please try again.";

      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsCreatingTeam(false)
    }
  };


  const handleClubChange = (value) => {
    if (value === "none") {
      setSelectedClub("");
      setValue("clubId", "", { shouldValidate: false });
      // Force re-render of Select component
      setClubSelectKey(prev => prev + 1);
    } else if (value) {
      setSelectedClub(value);
      setValue("clubId", value);
    }
  };

  const handleLeagueChange = (value) => {
    if (value === "none") {
      setSelectedLeague("");
      setValue("leagueId", "", { shouldValidate: false });
      // Force re-render of Select component
      setLeagueSelectKey(prev => prev + 1);
    } else if (value) {
      setSelectedLeague(value);
      setValue("leagueId", value);
    }
  };

  useEffect(() => {
    fetchClubs();
    fetchLeagues();
  }, []);

  return (
    <>
      <section className="min-h-screen bg-[#0f172a] py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Create New Team</h1>
            <p className="text-slate-400">Add a new team to join a club or league</p>
          </div>

          {/* Form Card */}
          <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
            <div className="bg-orange-600 px-6 py-4 border-b border-orange-700">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6" />
                Team Information
              </h2>
            </div>

            <form
              className="w-full py-6 px-4 sm:px-8"
              onSubmit={handleSubmit(handleCreateTeam)}
            >
              <div className="space-y-6">
                {/* Team Image */}
                <div>
                  <Label className="block text-sm font-semibold text-slate-300 mb-2">
                    Team Image <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="w-full h-12 border-2 border-slate-700 bg-[#0f172a] text-slate-200 rounded-lg px-4 focus:border-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700"
                    accept="image/*"
                    id="teamImage"
                    type="file"
                    {...register("teamImage", {
                      required: {
                        value: true,
                        message: "Team Image is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs mt-1">
                    {errors?.teamImage?.message}
                  </p>
                  {teamImage && (
                    <div className="mt-4 relative inline-block">
                      <img
                        src={teamImage}
                        alt="Team preview"
                        className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-lg border-2 border-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setTeamImage("");
                          setValue("teamImage", null);
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                {/* Team Name */}
                <div>
                  <Label className="block text-sm font-semibold text-slate-300 mb-2">
                    Team Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    className="w-full h-12 border-2 border-slate-700 bg-[#0f172a] text-slate-200 placeholder:text-slate-500 rounded-lg px-4 focus:border-orange-500"
                    type="text"
                    placeholder="Enter team name"
                    {...register("teamName", {
                      required: {
                        value: true,
                        message: "Team Name is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs mt-1">
                    {errors?.teamName?.message}
                  </p>
                </div>

                {/* Team Email and Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="block text-sm font-semibold text-slate-300 mb-2">
                      Team Email <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <Input
                        className="w-full h-12 border-2 border-slate-700 bg-[#0f172a] text-slate-200 placeholder:text-slate-500 rounded-lg pl-10 pr-4 focus:border-orange-500"
                        type="email"
                        placeholder="Enter team email"
                        {...register("teamEmail", {
                          required: {
                            value: true,
                            message: "Team Email is required",
                          },
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Please enter a valid email address",
                          },
                        })}
                      />
                    </div>
                    <p className="text-red-500 text-xs mt-1">
                      {errors?.teamEmail?.message}
                    </p>
                  </div>
                  <div>
                    <Label className="block text-sm font-semibold text-slate-300 mb-2">
                      Team Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <Input
                        className="w-full h-12 border-2 border-slate-700 bg-[#0f172a] text-slate-200 placeholder:text-slate-500 rounded-lg pl-10 pr-12 focus:border-orange-500"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password (min. 6 characters)"
                        {...register("teamPassword", {
                          required: {
                            value: true,
                            message: "Team Password is required",
                          },
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters long",
                          },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <IoEyeOff className="w-5 h-5" />
                        ) : (
                          <IoEye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-red-500 text-xs mt-1">
                      {errors?.teamPassword?.message}
                    </p>
                  </div>
                </div>
                {/* Join Club or League Section */}
                <div className="border-t border-slate-700 pt-6">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-orange-500" />
                    Join Organization
                  </h3>
                  <p className="text-sm text-slate-400 mb-6">
                    You can join a club, a league, or both. Select at least one option.
                  </p>

                  <div className="space-y-6">
                    {/* Club Selection */}
                    <div>
                      <Label className="block text-sm font-semibold text-slate-300 mb-2">
                        <Users className="w-4 h-4 inline mr-2 text-orange-500" />
                        Join a Club (Optional)
                      </Label>
                      <Select
                        key={`club-select-${clubSelectKey}`}
                        onValueChange={handleClubChange}
                        value={selectedClub || undefined}
                      >
                        <SelectTrigger className="w-full h-12 border-2 border-slate-700 bg-[#0f172a] text-slate-200 focus:border-orange-500">
                          <SelectValue placeholder="Select a club (optional)" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                          <SelectItem value="none" className="focus:bg-slate-700 cursor-pointer">None / Clear Selection</SelectItem>
                          {clubs.length > 0 ? (
                            clubs.map((club) => (
                              <SelectItem value={club._id} key={club._id} className="focus:bg-slate-700 cursor-pointer">
                                {club.clubName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-clubs" disabled>
                              No clubs available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {selectedClub && selectedClub !== "none" && (
                        <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Club selected: {clubs.find(c => c._id === selectedClub)?.clubName}
                        </p>
                      )}
                    </div>

                    {/* League Selection */}
                    <div>
                      <Label className="block text-sm font-semibold text-slate-300 mb-2">
                        <Trophy className="w-4 h-4 inline mr-2 text-orange-500" />
                        Join a League (Optional)
                      </Label>
                      <Select
                        key={`league-select-${leagueSelectKey}`}
                        onValueChange={handleLeagueChange}
                        value={selectedLeague || undefined}
                      >
                        <SelectTrigger className="w-full h-12 border-2 border-slate-700 bg-[#0f172a] text-slate-200 focus:border-orange-500">
                          <SelectValue placeholder="Select a league (optional)" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                          <SelectItem value="none" className="focus:bg-slate-700 cursor-pointer">None / Clear Selection</SelectItem>
                          {leagues.length > 0 ? (
                            leagues.map((league) => (
                              <SelectItem value={league._id} key={league._id} className="focus:bg-slate-700 cursor-pointer">
                                {league.leagueName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-leagues" disabled>
                              No leagues available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {selectedLeague && selectedLeague !== "none" && (
                        <p className="text-green-400 text-xs mt-2 flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          League selected: {leagues.find(l => l._id === selectedLeague)?.leagueName}
                        </p>
                      )}
                    </div>

                    {/* Helper text */}
                    {!selectedClub && !selectedLeague && (
                      <div className="p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
                        <p className="text-sm text-blue-400">
                          <strong>Note:</strong> Please select at least one option - either a club, a league, or both.
                          Teams can join a club (which may have leagues), join a league directly, or do both.
                        </p>
                      </div>
                    )}

                    {/* Summary of selections */}
                    {(selectedClub || selectedLeague) && (
                      <div className="p-4 bg-green-900/20 border border-green-800 rounded-lg">
                        <p className="text-sm font-semibold text-green-400 mb-2">Selected Organizations:</p>
                        <ul className="text-sm text-green-300 space-y-1">
                          {selectedClub && selectedClub !== "none" && (
                            <li className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              Club: {clubs.find(c => c._id === selectedClub)?.clubName}
                            </li>
                          )}
                          {selectedLeague && selectedLeague !== "none" && (
                            <li className="flex items-center gap-2">
                              <Trophy className="w-4 h-4" />
                              League: {leagues.find(l => l._id === selectedLeague)?.leagueName}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isCreatingTeam}
                    className="w-full h-12 bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-all"
                  >
                    {isCreatingTeam ? (
                      <>
                        <ImSpinner3 className="h-5 w-5 mr-2 animate-spin inline" />
                        Creating Team...
                      </>
                    ) : (
                      "Create Team"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default AddTeam;
