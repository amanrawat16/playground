import React, { useEffect, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createCompClub,
  getTeam,
  updateTeam,
  getAllLeagues,
  getCompClubs,
  getPendingRequests,
  approveRequest,
  rejectRequest,
  getPendingClubRequests,
  approveClubRequest,
  rejectClubRequest,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import { ImCross, ImSpinner3 } from "react-icons/im";
import { Button } from "@/components/ui/button";
import { IoIosAddCircle, IoMdAddCircleOutline } from "react-icons/io";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { DatePicker } from "antd";
import moment from "moment";
import { Plus, Trophy, Users, Building2, Eye, Mail as MailIcon, Share2, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import EditLeagueModal from './Manage/Modals/EditLeagueModal';
import EditClubModal from './Manage/Modals/EditClubModal';
import EditTeamModal from './Manage/Modals/EditTeamModal';
import { Edit } from "lucide-react";
// --------------------------------------------------------------------------------------------

export default function Admin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
    setValue,
  } = useForm();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "players",
  });

  const navigate = useNavigate();

  // --------------------------------------------------------------------------------------

  // Used to store comp teams list
  const [teamsList, setTeamsList] = useState([]);
  // Clud creation state
  const [clubImage, setClubImage] = useState("");
  const [generatedLeagueId, setGeneratedLeagueId] = useState("");
  const [leagueOptions, setLeagueOptions] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [isCreatingClub, setIsCreatingClub] = useState(false)
  const [clubPasswordVisible, setClubPasswordVisible] = useState(false)
  const [teamPasswordVisible, setTeamPasswordVisible] = useState(false)
  const [updatingTeam, setIsUpdatingTeam] = useState(false)
  const [activeTab, setActiveTab] = useState("create") // "create" or "manage"
  const [allClubs, setAllClubs] = useState([])
  const [allTeams, setAllTeams] = useState([])
  const [allLeaguesList, setAllLeaguesList] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [pendingClubRequests, setPendingClubRequests] = useState([])


  const [userType, setUserType] = useState(null);
  const [id, setId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal States
  const [selectedEditLeague, setSelectedEditLeague] = useState(null);
  const [isEditLeagueModalOpen, setIsEditLeagueModalOpen] = useState(false);

  const [selectedEditClub, setSelectedEditClub] = useState(null);
  const [isEditClubModalOpen, setIsEditClubModalOpen] = useState(false);

  const [selectedEditTeam, setSelectedEditTeam] = useState(null);
  const [isEditTeamModalOpen, setIsEditTeamModalOpen] = useState(false);

  // Get userType and id from localStorage
  useEffect(() => {
    try {
      const userTypeValue = localStorage.getItem("userType");
      const idValue = localStorage.getItem("_id");
      setUserType(userTypeValue);
      setId(idValue);
      setIsLoading(false);
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      setIsLoading(false);
    }
  }, []);

  // This block of code is used to show image preview after uploading club's image.
  useEffect(() => {
    const imageData = watch("clubImage")?.[0];
    const url = imageData ? window.URL.createObjectURL(imageData) : "";
    setClubImage(url);
    fetchLeagues();
  }, [watch("clubImage")]);

  // used to handle the create club
  const handleCreateClub = async (data) => {
    setIsCreatingClub(true)
    console.log(selectedLeague)
    try {
      const formData = new FormData();
      const clubImage = data?.clubImage?.[0];

      // Validate club image
      if (!clubImage) {
        toast.error("Please select a club image.");
        setIsCreatingClub(false);
        return;
      }

      if (!clubImage.type.startsWith("image/")) {
        toast.error("Invalid file format. Please select a valid image.");
        setIsCreatingClub(false);
        return;
      }

      if (clubImage.size > 5 * 1024 * 1024) {
        toast.error(
          "Image size exceeds the 5 MB limit. Please choose a smaller image."
        );
        setIsCreatingClub(false);
        return;
      }

      // Validate password length
      if (data?.adminPassword && data.adminPassword.length < 6) {
        toast.error("Password must be at least 6 characters long.");
        setIsCreatingClub(false);
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (data?.adminEmail && !emailRegex.test(data.adminEmail)) {
        toast.error("Please enter a valid email address.");
        setIsCreatingClub(false);
        return;
      }

      formData.append("clubImage", clubImage);
      formData.append("clubName", data?.clubName);
      formData.append("adminEmail", data?.adminEmail);
      formData.append("adminPassword", data?.adminPassword);
      if (selectedLeague && selectedLeague !== "none") {
        formData.append("league", selectedLeague);
      }

      const response = await createCompClub(formData);
      toast.success("Club created successfully!");
      reset();
      setClubImage("");
      setSelectedLeague("");
      setGeneratedLeagueId("");
      // Refresh clubs list for Manage tab
      await fetchAllClubs();
    } catch (error) {
      console.error("Error creating club:", error);

      // Extract error message from API response
      let errorMessage = "Error creating club. Please try again.";

      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsCreatingClub(false)
    }
  };

  const handleSelectLeague = (val) => {
    if (val === "none") {
      setSelectedLeague("");
    } else {
      setSelectedLeague(val.trim());
    }
  }

  // Used to fetch existing teams list
  const fetchTeams = async () => {
    try {
      const data = await getTeam();
      // Filter data based on logged in Club id
      let filteredData = [];
      if (id) {
        filteredData =
          data?.teams?.length > 0 &&
          data?.teams?.filter((team) => team?.clubId?._id === id);
      } else {
        filteredData = data?.teams || [];
      }
      setTeamsList(filteredData);
    } catch (error) {
      console.log("Getting an error while fetching teams list: ", error);
    }
  };

  // used to handle the team updation
  const handleUpdateTeam = async (data) => {
    if (!id) {
      toast.error("User ID not found. Please log in again.");
      return;
    }
    setIsUpdatingTeam(true)
    try {
      await updateTeam(data.teamId, {
        players: data?.players,
        clubId: id,
      });
      toast.success("Team details updated successfully!");
      reset({
        players: [],
        teamId: ""
      });
    } catch (error) {
      console.error("Error updating team:", error);

      // Extract error message from API response
      let errorMessage = "Error updating team. Please try again.";

      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setIsUpdatingTeam(false)
    }
  };

  const fetchLeagues = async () => {
    try {
      const response = await getAllLeagues();
      if (response && response.leagues && Array.isArray(response.leagues)) {
        const leagues = response.leagues;
        setLeagueOptions(leagues.map((league) => ({ label: league.leagueName, value: league._id })));
        setAllLeaguesList(leagues);
      } else {
        console.error("Error fetching leagues: Response does not contain the leagues array");
      }
    } catch (error) {
      console.error("Error fetching leagues:", error);
    }
  }

  const fetchAllClubs = async () => {
    try {
      const response = await getCompClubs();
      if (response && Array.isArray(response)) {
        setAllClubs(response);
      }
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  const fetchAllTeams = async () => {
    try {
      const response = await getTeam();
      if (response && response.teams && Array.isArray(response.teams)) {
        setAllTeams(response.teams);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await getPendingRequests();
      setPendingRequests(response);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await approveRequest(requestId);
      toast.success("Request approved successfully!");
      await fetchPendingRequests(); // Refresh list
      await fetchAllTeams(); // Refresh teams to show new players
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Error approving request. Please try again.");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await rejectRequest(requestId);
      toast.success("Request rejected");
      await fetchPendingRequests(); // Refresh list
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Error rejecting request. Please try again.");
    }
  };

  const fetchPendingClubRequests = async () => {
    try {
      const response = await getPendingClubRequests();
      setPendingClubRequests(response);
    } catch (error) {
      console.error("Error fetching pending club requests:", error);
    }
  };

  const handleApproveClubRequest = async (requestId) => {
    try {
      await approveClubRequest(requestId);
      toast.success("Club request approved successfully!");
      await fetchPendingClubRequests();
      await fetchAllTeams();
    } catch (error) {
      console.error("Error approving club request:", error);
      toast.error("Error approving request. Please try again.");
    }
  };

  const handleRejectClubRequest = async (requestId) => {
    try {
      await rejectClubRequest(requestId);
      toast.success("Club request rejected");
      await fetchPendingClubRequests();
    } catch (error) {
      console.error("Error rejecting club request:", error);
      toast.error("Error rejecting request. Please try again.");
    }
  };

  const handleAddTeam = () => {
    if (teamsList.length === 0) {
      return toast.error("Please choose a team to add players to the team")
    }
    append({})
  }



  // fetching teams list
  useEffect(() => {
    if (!isLoading) {
      fetchTeams();
      fetchLeagues();
      if (userType === "admin") {
        fetchAllClubs();
        fetchAllTeams();
      }
    }
    return () => {
      setGeneratedLeagueId("");
    };
  }, [isLoading, id, userType]);

  // Refresh manage data when switching to manage tab
  useEffect(() => {
    if (activeTab === "manage" && userType === "admin") {
      fetchAllClubs();
      fetchAllTeams();
      fetchLeagues();
      fetchPendingRequests();
      fetchPendingClubRequests();
    }
  }, [activeTab, userType]);

  // Handle navigation for team and staff user types
  useEffect(() => {
    if (userType === "team") {
      navigate("/dashboard/updateTeam");
    } else if (userType === 'staff') {
      navigate('/dashboard/matches/viewMatches');
    }
  }, [userType, navigate]);
  // --------------------------------------------------------------------------------------

  if (isLoading) {
    return (
      <section className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#0f172a] text-slate-200">
      {userType === "admin" ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Create and manage leagues, clubs, and teams</p>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-6 border-b border-slate-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("create")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "create"
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>Create</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("manage")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "manage"
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  <span>Manage</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Create Tab Content */}
          {activeTab === "create" && (
            <div className="space-y-6 sm:space-y-8">


              {/* Create Club Card */}
              <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Create New Club
                  </h2>
                </div>
                <form onSubmit={handleSubmit(handleCreateClub)} className="w-full py-6 px-4 sm:px-8">
                  <div className="space-y-6">
                    {/* Club Image */}
                    <div>
                      <Label className="block text-sm font-semibold text-slate-300 mb-2">
                        Club Image <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        className="w-full h-12 border border-slate-600 rounded-lg px-4 focus:border-orange-500 bg-[#0f172a] text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-orange-500 hover:file:bg-slate-600"
                        accept="image/*"
                        id="clubImage"
                        type="file"
                        {...register("clubImage", {
                          required: {
                            value: true,
                            message: "Club Image is required",
                          },
                        })}
                      />
                      <p className="text-red-400 text-xs mt-1">
                        {errors?.clubImage?.message}
                      </p>
                      {clubImage && (
                        <div className="mt-4">
                          <img
                            src={clubImage}
                            alt="Club preview"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-slate-600"
                          />
                        </div>
                      )}
                    </div>

                    {/* Club Name */}
                    <div>
                      <Label className="block text-sm font-semibold text-slate-300 mb-2">
                        Club Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        className="w-full h-12 border border-slate-600 rounded-lg px-4 focus:border-orange-500 bg-[#0f172a] text-slate-200 placeholder:text-slate-500"
                        type="text"
                        placeholder="Enter club name"
                        {...register("clubName", {
                          required: {
                            value: true,
                            message: "Club Name is required",
                          },
                        })}
                      />
                      <p className="text-red-400 text-xs mt-1">
                        {errors?.clubName?.message}
                      </p>
                    </div>

                    {/* Select League */}
                    <div>
                      <Label className="block text-sm font-semibold text-slate-300 mb-2">
                        Select League <span className="text-slate-500 text-xs font-normal">(optional)</span>
                      </Label>
                      <Select onValueChange={handleSelectLeague} value={selectedLeague || undefined}>
                        <SelectTrigger className="w-full h-12 border border-slate-600 bg-[#0f172a] text-slate-200 focus:border-orange-500">
                          <SelectValue placeholder="Select a league (optional)" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                          <SelectItem value="none" className="focus:bg-slate-700 focus:text-white cursor-pointer">No League</SelectItem>
                          {leagueOptions.length > 0 && leagueOptions.map((option) => (
                            <SelectItem value={option.value} key={option.value} className="focus:bg-slate-700 focus:text-white cursor-pointer">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Admin Email and Password */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="block text-sm font-semibold text-slate-300 mb-2">
                          Admin Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          className="w-full h-12 border border-slate-600 rounded-lg px-4 focus:border-orange-500 bg-[#0f172a] text-slate-200 placeholder:text-slate-500"
                          type="email"
                          placeholder="Enter admin email"
                          {...register("adminEmail", {
                            required: {
                              value: true,
                              message: "Admin email is required",
                            },
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Please enter a valid email address",
                            },
                          })}
                        />
                        <p className="text-red-400 text-xs mt-1">
                          {errors?.adminEmail?.message}
                        </p>
                      </div>
                      <div>
                        <Label className="block text-sm font-semibold text-slate-300 mb-2">
                          Admin Password <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            className="w-full h-12 border border-slate-600 rounded-lg px-4 pr-12 focus:border-orange-500 bg-[#0f172a] text-slate-200 placeholder:text-slate-500"
                            type={clubPasswordVisible ? "text" : "password"}
                            placeholder="Enter password (min. 6 characters)"
                            {...register("adminPassword", {
                              required: {
                                value: true,
                                message: "Admin Password is required",
                              },
                              minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters long",
                              },
                            })}
                          />
                          <button
                            type="button"
                            onClick={() => setClubPasswordVisible(!clubPasswordVisible)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                            aria-label={clubPasswordVisible ? "Hide password" : "Show password"}
                          >
                            {clubPasswordVisible ? (
                              <IoEyeOff className="w-5 h-5" />
                            ) : (
                              <IoEye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                        <p className="text-red-400 text-xs mt-1">
                          {errors?.adminPassword?.message}
                        </p>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        disabled={isCreatingClub}
                        className="w-full h-12 bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-all font-semibold"
                      >
                        {isCreatingClub ? (
                          <>
                            <ImSpinner3 className="h-5 w-5 mr-2 animate-spin inline" />
                            Creating Club...
                          </>
                        ) : (
                          "Create Club"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>

              {/* Create Team Section */}
              <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Users className="w-6 h-6 text-orange-500" />
                    Create New Team
                  </h2>
                </div>
                <div className="p-6 sm:p-8">
                  <p className="text-slate-400 mb-4">Create a new team and assign it to a club or league.</p>
                  <Link to="/dashboard/addTeam">
                    <Button className="w-full sm:w-auto h-12 px-6 bg-orange-600 text-white hover:bg-orange-700 transition-all font-semibold">
                      <Plus className="w-5 h-5 mr-2" />
                      Go to Create Team
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Manage Tab Content */}
          {activeTab === "manage" && (
            <div className="space-y-6 sm:space-y-8">
              {/* Leagues Section */}
              <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="bg-[#0f172a] px-6 py-4 border-b border-slate-700">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-orange-500" />
                    Leagues ({allLeaguesList.length})
                  </h2>
                </div>
                {allLeaguesList.length === 0 ? (
                  <div className="p-12 text-center">
                    <Trophy className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-300 text-lg">No leagues created yet</p>
                    <p className="text-slate-500 text-sm mt-2">Create a league in the Create tab</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#0f172a] border-b border-slate-700 hover:bg-[#0f172a]">
                            <TableHead className="font-semibold text-slate-300">League Name</TableHead>
                            <TableHead className="font-semibold text-slate-300">Category</TableHead>
                            <TableHead className="font-semibold text-slate-300">Matches in Regular Round</TableHead>
                            <TableHead className="font-semibold text-slate-300 w-16">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allLeaguesList.map((league) => (
                            <TableRow key={league._id} className="hover:bg-slate-700/50 border-b border-slate-700">
                              <TableCell className="font-medium text-slate-200">{league.leagueName}</TableCell>
                              <TableCell className="text-slate-300">{league.leagueCategory?.categoryName || "N/A"}</TableCell>
                              <TableCell className="text-slate-300">{league.matchesInRegularRound || "N/A"}</TableCell>
                              <TableCell>
                                <button
                                  onClick={() => {
                                    setSelectedEditLeague(league);
                                    setIsEditLeagueModalOpen(true);
                                  }}
                                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-blue-400"
                                  title="Edit League"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="lg:hidden divide-y divide-slate-700">
                      {allLeaguesList.map((league) => (
                        <div key={league._id} className="p-4 hover:bg-slate-700/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                              <Trophy className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white">{league.leagueName}</p>
                              <p className="text-sm text-slate-400 mt-1">
                                Category: {league.leagueCategory?.categoryName || "N/A"}
                              </p>
                              <p className="text-sm text-slate-400">
                                Matches: {league.matchesInRegularRound || "N/A"}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedEditLeague(league);
                                setIsEditLeagueModalOpen(true);
                              }}
                              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-blue-400 self-center"
                              title="Edit League"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Clubs Section */}
              <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 border-b border-orange-200">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Building2 className="w-6 h-6" />
                    Clubs ({allClubs.length})
                  </h2>
                </div>
                {allClubs.length === 0 ? (
                  <div className="p-12 text-center">
                    <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-300 text-lg">No clubs created yet</p>
                    <p className="text-slate-500 text-sm mt-2">Create a club in the Create tab</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#0f172a] border-b border-slate-700 hover:bg-[#0f172a]">
                            <TableHead className="font-semibold text-slate-300">Club Name</TableHead>
                            <TableHead className="font-semibold text-slate-300">League</TableHead>
                            <TableHead className="font-semibold text-slate-300">Admin Email</TableHead>
                            <TableHead className="font-semibold text-slate-300 w-24">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allClubs.map((club) => (
                            <TableRow key={club._id} className="hover:bg-slate-700/50 border-b border-slate-700">
                              <TableCell className="font-medium text-slate-200">{club.clubName}</TableCell>
                              <TableCell className="text-slate-300">{club.league?.leagueName || "No League"}</TableCell>
                              <TableCell className="text-slate-300">{club.adminEmail || "N/A"}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      const link = `${window.location.origin}/invite/club/${club._id}`;
                                      navigator.clipboard.writeText(link);
                                      toast.success("Invite link copied to clipboard!");
                                    }}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-orange-500"
                                    title="Copy Invite Link"
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedEditClub(club);
                                      setIsEditClubModalOpen(true);
                                    }}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-blue-400"
                                    title="Edit Club"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="lg:hidden divide-y divide-slate-700">
                      {allClubs.map((club) => (
                        <div key={club._id} className="p-4 hover:bg-slate-700/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white">{club.clubName}</p>
                              <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                {club.league?.leagueName || "No League"}
                              </p>
                              <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                                <MailIcon className="w-3 h-3" />
                                {club.adminEmail || "N/A"}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 self-center">
                              <button
                                onClick={() => {
                                  const link = `${window.location.origin}/invite/club/${club._id}`;
                                  navigator.clipboard.writeText(link);
                                  toast.success("Invite link copied to clipboard!");
                                }}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-orange-500"
                                title="Copy Invite Link"
                              >
                                <Share2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedEditClub(club);
                                  setIsEditClubModalOpen(true);
                                }}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-blue-400"
                                title="Edit Club"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Teams Section */}
              <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 border-b border-orange-200">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Teams ({allTeams.length})
                  </h2>
                </div>
                {allTeams.length === 0 ? (
                  <div className="p-12 text-center">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-300 text-lg">No teams created yet</p>
                    <p className="text-slate-500 text-sm mt-2">Create a team in the Create tab</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#0f172a] border-b border-slate-700 hover:bg-[#0f172a]">
                            <TableHead className="font-semibold text-slate-300">Team Name</TableHead>
                            <TableHead className="font-semibold text-slate-300">Club</TableHead>
                            <TableHead className="font-semibold text-slate-300">League</TableHead>
                            <TableHead className="font-semibold text-slate-300 w-16">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allTeams.map((team) => (
                            <TableRow key={team._id} className="hover:bg-slate-700/50 border-b border-slate-700">
                              <TableCell className="font-medium text-slate-200">{team.teamName}</TableCell>
                              <TableCell className="text-slate-300">{team.clubId?.clubName || "N/A"}</TableCell>
                              <TableCell className="text-slate-300">
                                {team.leagueList && team.leagueList.length > 0
                                  ? team.leagueList[0]?.leagueName || "N/A"
                                  : team.leagueId?.leagueName || "N/A"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      const link = `${window.location.origin}/invite/team/${team._id}`;
                                      navigator.clipboard.writeText(link);
                                      toast.success("Invite link copied to clipboard!");
                                    }}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-orange-500"
                                    title="Copy Invite Link"
                                  >
                                    <Share2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedEditTeam(team);
                                      setIsEditTeamModalOpen(true);
                                    }}
                                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-blue-400"
                                    title="Edit Team"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="lg:hidden divide-y divide-slate-700">
                      {allTeams.map((team) => (
                        <div key={team._id} className="p-4 hover:bg-slate-700/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                              <Users className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-white">{team.teamName}</p>
                              <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                {team.clubId?.clubName || "N/A"}
                              </p>
                              <p className="text-sm text-slate-400 flex items-center gap-1">
                                <Trophy className="w-3 h-3" />
                                {team.leagueList && team.leagueList.length > 0
                                  ? team.leagueList[0]?.leagueName || "N/A"
                                  : team.leagueId?.leagueName || "N/A"}
                              </p>
                              <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                                <MailIcon className="w-3 h-3" />
                                {team.teamEmail || "N/A"}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                const link = `${window.location.origin}/invite/team/${team._id}`;
                                navigator.clipboard.writeText(link);
                                toast.success("Invite link copied to clipboard!");
                              }}
                              className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-orange-500 self-center"
                              title="Copy Invite Link"
                            >
                              <Share2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Pending Requests Section */}
              <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 border-b border-orange-200">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    Pending Team Update Requests ({pendingRequests.length})
                  </h2>
                </div>
                {pendingRequests.length === 0 ? (
                  <div className="p-12 text-center">
                    <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-300 text-lg">No pending requests</p>
                    <p className="text-slate-500 text-sm mt-2">All team update requests have been processed</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#0f172a] border-b border-slate-700 hover:bg-[#0f172a]">
                            <TableHead className="font-semibold text-slate-300">Team</TableHead>
                            <TableHead className="font-semibold text-slate-300">Request Type</TableHead>
                            <TableHead className="font-semibold text-slate-300">Player Name</TableHead>
                            <TableHead className="font-semibold text-slate-300">Position</TableHead>
                            <TableHead className="font-semibold text-slate-300">Requested At</TableHead>
                            <TableHead className="font-semibold text-slate-300 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingRequests.map((request) => (
                            <TableRow key={request._id} className="hover:bg-slate-700/50 border-b border-slate-700">
                              <TableCell className="font-medium text-slate-200">
                                {request.teamId?.teamName || "Unknown Team"}
                              </TableCell>
                              <TableCell>
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-900/20 text-blue-400 text-xs font-medium">
                                  {request.requestType === "ADD_PLAYER" ? "Add Player" : "Edit Player"}
                                </span>
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {request.playerData?.playerName || "N/A"}
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {request.playerData?.position || "N/A"}
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {new Date(request.requestedAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 justify-center">
                                  <Button
                                    onClick={() => handleApproveRequest(request._id)}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-8"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectRequest(request._id)}
                                    variant="outline"
                                    className="border-red-600 text-red-500 hover:bg-red-900/20 text-xs px-3 py-1 h-8"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="lg:hidden divide-y divide-slate-700">
                      {pendingRequests.map((request) => (
                        <div key={request._id} className="p-4 hover:bg-slate-700/50 transition-colors">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-white mb-1">
                                  {request.teamId?.teamName || "Unknown Team"}
                                </p>
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-900/20 text-blue-400 text-xs font-medium">
                                  {request.requestType === "ADD_PLAYER" ? "Add Player" : "Edit Player"}
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-slate-400">
                                <span className="font-medium">Player:</span> {request.playerData?.playerName || "N/A"}
                              </p>
                              <p className="text-slate-400">
                                <span className="font-medium">Position:</span> {request.playerData?.position || "N/A"}
                              </p>
                              <p className="text-slate-400">
                                <span className="font-medium">Requested:</span> {new Date(request.requestedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => handleApproveRequest(request._id)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleRejectRequest(request._id)}
                                variant="outline"
                                className="flex-1 border-red-600 text-red-500 hover:bg-red-900/20 text-sm"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Pending Club Requests Section */}
              <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 border-b border-orange-200">
                  <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                    <Clock className="w-6 h-6" />
                    Pending Club Team Requests ({pendingClubRequests.length})
                  </h2>
                </div>
                {pendingClubRequests.length === 0 ? (
                  <div className="p-12 text-center">
                    <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-300 text-lg">No pending club team requests</p>
                    <p className="text-slate-500 text-sm mt-2">All club team addition requests have been processed</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#0f172a] border-b border-slate-700 hover:bg-[#0f172a]">
                            <TableHead className="font-semibold text-slate-300">Club</TableHead>
                            <TableHead className="font-semibold text-slate-300">Team Name</TableHead>
                            <TableHead className="font-semibold text-slate-300">Team Email</TableHead>
                            <TableHead className="font-semibold text-slate-300">League</TableHead>
                            <TableHead className="font-semibold text-slate-300">Requested At</TableHead>
                            <TableHead className="font-semibold text-slate-300 text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pendingClubRequests.map((request) => (
                            <TableRow key={request._id} className="hover:bg-slate-700/50 border-b border-slate-700">
                              <TableCell className="font-medium text-slate-200">
                                {request.clubId?.clubName || "Unknown Club"}
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {request.teamData?.teamName || "N/A"}
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {request.teamData?.teamEmail || "N/A"}
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {request.teamData?.leagueList?.length > 0 ? "Selected" : "None"}
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {new Date(request.requestedAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 justify-center">
                                  <Button
                                    onClick={() => handleApproveClubRequest(request._id)}
                                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-8"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectClubRequest(request._id)}
                                    variant="outline"
                                    className="border-red-600 text-red-500 hover:bg-red-900/20 text-xs px-3 py-1 h-8"
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {/* Mobile Card View */}
                    <div className="lg:hidden divide-y divide-slate-700">
                      {pendingClubRequests.map((request) => (
                        <div key={request._id} className="p-4 hover:bg-slate-700/50 transition-colors">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-semibold text-white mb-1">
                                  {request.clubId?.clubName || "Unknown Club"}
                                </p>
                                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-900/20 text-blue-400 text-xs font-medium">
                                  Add Team Request
                                </span>
                              </div>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-slate-400">
                                <span className="font-medium">Team:</span> {request.teamData?.teamName || "N/A"}
                              </p>
                              <p className="text-slate-400">
                                <span className="font-medium">Email:</span> {request.teamData?.teamEmail || "N/A"}
                              </p>
                              <p className="text-slate-400">
                                <span className="font-medium">Requested:</span> {new Date(request.requestedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2 pt-2">
                              <Button
                                onClick={() => handleApproveClubRequest(request._id)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm"
                              >
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleRejectClubRequest(request._id)}
                                variant="outline"
                                className="flex-1 border-red-600 text-red-500 hover:bg-red-900/20 text-sm"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      ) : null}
      {userType === "clubadmin" ? (
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="pt-4 sm:pt-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Update Team</h1>
            <p className="text-slate-400">Add and manage players for your team</p>
          </div>

          {/* Update Team Card */}
          <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 border-b border-orange-200">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Team Players
              </h2>
            </div>
            <form
              className="w-full py-6 px-4 sm:px-8"
              onSubmit={handleSubmit(handleUpdateTeam)}
            >
              <div className="space-y-6">
                {/* Team Selection */}
                <div>
                  <Label className="block text-sm font-semibold text-slate-300 mb-2">
                    Select Team <span className="text-red-600">*</span>
                  </Label>
                  <select
                    className="w-full h-12 border border-slate-600 rounded-lg px-4 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 bg-[#0f172a] text-slate-200"
                    {...register(`teamId`, {
                      required: {
                        value: true,
                        message: "Team selection is required",
                      },
                    })}
                  >
                    <option value="">Select a team</option>
                    {teamsList?.length > 0 &&
                      teamsList.map((team, i) => {
                        return (
                          <option key={team?._id || i} value={team?._id}>
                            {team?.teamName}
                          </option>
                        );
                      })}
                  </select>
                  <p className="text-red-500 text-xs mt-1">
                    {errors?.teamId?.message}
                  </p>
                </div>

                {/* Player Fields */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Players</h3>
                    <Button
                      type="button"
                      onClick={handleAddTeam}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <IoIosAddCircle className="w-5 h-5 mr-1 inline" />
                      Add Player
                    </Button>
                  </div>
                  {fields.length === 0 && (
                    <div className="text-center py-8 bg-[#0f172a] rounded-lg border-2 border-dashed border-slate-700">
                      <p className="text-slate-500">No players added yet. Click "Add Player" to get started.</p>
                    </div>
                  )}
                  {fields.map((player, index) => (
                    <div key={player.id} className="bg-[#0f172a] rounded-xl p-4 sm:p-6 border border-slate-700 space-y-4">
                      {/* Player Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                        <h4 className="text-base font-semibold text-white">Player {index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                        >
                          <ImCross className="w-4 h-4 inline mr-1" />
                          Remove
                        </Button>
                      </div>

                      {/* Player Name and Position */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="block text-sm font-semibold text-slate-300 mb-2">
                            Player Name <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            className="w-full h-12 border border-slate-600 rounded-lg px-4 focus:border-orange-500 bg-[#1e293b] text-slate-200"
                            type="text"
                            placeholder="Enter player name"
                            {...register(`players[${index}].playerName`, {
                              required: true,
                              message: "Player Name is required",
                            })}
                          />
                          <p className="text-red-500 text-xs mt-1">
                            {errors?.players?.[index]?.playerName?.message}
                          </p>
                        </div>

                        <div>
                          <Label className="block text-sm font-semibold text-slate-300 mb-2">
                            Position <span className="text-red-600">*</span>
                          </Label>
                          <select
                            className="w-full h-12 border border-slate-600 rounded-lg px-4 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 bg-[#1e293b] text-slate-200"
                            {...register(`players[${index}].position`, {
                              required: true,
                              message: "Position is required",
                            })}
                          >
                            <option value="">Select position</option>
                            <option value="Quarterback">Quarterback</option>
                            <option value="Rusher">Rusher</option>
                            <option value="Offensive Player">Offensive Player</option>
                            <option value="Defensive Player">Defensive Player</option>
                            <option value="NONE">NONE</option>
                          </select>
                          <p className="text-red-500 text-xs mt-1">
                            {errors?.players?.[index]?.position?.message}
                          </p>
                        </div>
                      </div>

                      {/* Email and Role */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="block text-sm font-semibold text-slate-300 mb-2">
                            Player Email <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            className="w-full h-12 border border-slate-600 rounded-lg px-4 focus:border-orange-500 bg-[#1e293b] text-slate-200"
                            type="email"
                            placeholder="Enter player email"
                            {...register(`players[${index}].email`, {
                              required: true,
                              message: "Player Email is required",
                            })}
                          />
                          <p className="text-red-500 text-xs mt-1">
                            {errors?.players?.[index]?.email?.message}
                          </p>
                        </div>

                        <div>
                          <Label className="block text-sm font-semibold text-slate-300 mb-2">
                            Role <span className="text-red-600">*</span>
                          </Label>
                          <select
                            className="w-full h-12 border border-slate-600 rounded-lg px-4 focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-opacity-20 bg-[#1e293b] text-slate-200"
                            {...register(`players[${index}].role`, {
                              required: true,
                              message: "Role is required",
                            })}
                          >
                            <option value="">Select role</option>
                            <option value="PLAYER">Player</option>
                            <option value="STAFF">Staff</option>
                          </select>
                          <p className="text-red-500 text-xs mt-1">
                            {errors?.players?.[index]?.role?.message}
                          </p>
                        </div>
                      </div>

                      {/* Jersey Number and Date of Birth */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="block text-sm font-semibold text-slate-300 mb-2">
                            Jersey Number <span className="text-red-600">*</span>
                          </Label>
                          <Input
                            className="w-full h-12 border border-slate-600 rounded-lg px-4 focus:border-orange-500 bg-[#1e293b] text-slate-200"
                            type="number"
                            placeholder="Enter jersey number"
                            {...register(`players[${index}].jerseyNumber`, {
                              required: true,
                              message: "Jersey Number is required",
                            })}
                          />
                          <p className="text-red-500 text-xs mt-1">
                            {errors?.players?.[index]?.jerseyNumber?.message}
                          </p>
                        </div>

                        <div>
                          <Label className="block text-sm font-semibold text-slate-300 mb-2">
                            Date of Birth <span className="text-red-600">*</span>
                          </Label>
                          <Controller
                            name={`players[${index}].dateofBirth`}
                            control={control}
                            rules={{ required: "Date of Birth is required" }}
                            render={({ field }) => (
                              <div className="w-full">
                                <DatePicker
                                  {...field}
                                  value={field.value ? moment(field.value, "YYYY-MM-DD") : null}
                                  className="w-full h-12 bg-[#1e293b] text-slate-200 border-slate-600 hover:border-orange-500 focus:border-orange-500"
                                  style={{ backgroundColor: '#1e293b', color: 'white', borderColor: '#475569' }}
                                  onChange={(date, dateString) => field.onChange(dateString)}
                                  format="YYYY-MM-DD"
                                />
                              </div>
                            )}
                          />
                          <p className="text-red-500 text-xs mt-1">
                            {errors?.players?.[index]?.dateofBirth?.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={updatingTeam}
                    className="w-full h-12 bg-gradient-to-r from-orange-600 to-orange-500 text-white hover:from-orange-700 hover:to-orange-600 disabled:opacity-50 transition-all font-semibold"
                  >
                    {updatingTeam ? (
                      <>
                        <ImSpinner3 className="h-5 w-5 mr-2 animate-spin inline" />
                        Updating Team...
                      </>
                    ) : (
                      "Update Team"
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      {!userType && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Please log in to access the dashboard.</p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      {/* Edit Modals */}
      {isEditLeagueModalOpen && (
        <EditLeagueModal
          isOpen={isEditLeagueModalOpen}
          onClose={() => setIsEditLeagueModalOpen(false)}
          league={selectedEditLeague}
          onUpdate={fetchLeagues}
        />
      )}
      {isEditClubModalOpen && (
        <EditClubModal
          isOpen={isEditClubModalOpen}
          onClose={() => setIsEditClubModalOpen(false)}
          club={selectedEditClub}
          onUpdate={fetchAllClubs}
        />
      )}
      {isEditTeamModalOpen && (
        <EditTeamModal
          isOpen={isEditTeamModalOpen}
          onClose={() => setIsEditTeamModalOpen(false)}
          team={selectedEditTeam}
          onUpdate={fetchAllTeams}
        />
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </section>
  );
}
