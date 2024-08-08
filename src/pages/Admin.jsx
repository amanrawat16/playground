import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createCompClub,
  getTeam,
  updateTeam,
  createLeague,
  getAllLeagues,
  getAllCategories,
  createCategory,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import { ImCross, ImSpinner3 } from "react-icons/im";
import { Button } from "@/components/ui/button";
import { IoIosAddCircle, IoMdAddCircleOutline } from "react-icons/io";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IoEye, IoEyeOff } from "react-icons/io5";
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

  // Used to store the leage name value
  const [leagueName, setLeagueName] = useState("");
  const [leagueCategory, setLeagueCategory] = useState(""); // New state for league category
  const [matchesInRegularRound, setMatchesInRegularRound] = useState("");

  // used to check error message
  const [isLeageNameEmpty, setIsLeagueNameEmpty] = useState(false);

  const [isLeageCreated, setIsLeagueCreated] = useState(false);
  const [clubImage, setClubImage] = useState("");
  const [generatedLeagueId, setGeneratedLeagueId] = useState("");
  const [leagueOptions, setLeagueOptions] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [allCategories, setAllCategories] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [Addcategory, setAddCategory] = useState('')
  const [isAddLeagueInputEmpty, setIsAddLeagueInputEmpty] = useState(false)
  const [isAddingLeague, setIsAddingLeague] = useState(false)
  const [isCreatingClub, setIsCreatingClub] = useState(false)
  const [clubPasswordVisible, setClubPasswordVisible] = useState(false)
  const [teamPasswordVisible, setTeamPasswordVisible] = useState(false)
  const [updatingTeam , setIsUpdatingTeam] = useState(false)


  const userType = localStorage.getItem("userType");
  const id = localStorage.getItem("_id");

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

      if (!clubImage) {
        toast.error("Please select a club image.");
        return;
      }

      if (!clubImage.type.startsWith("image/")) {
        toast.error("Invalid file format. Please select a valid image.");
        return;
      }

      if (clubImage.size > 5 * 1024 * 1024) {
        toast.error(
          "Image size exceeds the 5 MB limit. Please choose a smaller image."
        );
        return;
      }

      formData.append("clubImage", clubImage);
      formData.append("clubName", data?.clubName);
      formData.append("adminEmail", data?.adminEmail);
      formData.append("adminPassword", data?.adminPassword);
      if (selectedLeague) {
        formData.append("league", selectedLeague);
      }
      await createCompClub(formData);
      toast.success("Club created successfully!");
      reset();
      setIsLeagueNameEmpty(false);
      setGeneratedLeagueId("");
      setIsLeagueCreated(false);
    } catch (error) {
      console.error("Error creating club:", error);
      toast.error("Error creating club. Please try again.");
    } finally {
      setIsCreatingClub(false)
    }
  };

  const handleSelectLeague = (val) => {
    setSelectedLeague(val.trim())
  }

  // Used to fetch existing teams list
  const fetchTeams = async () => {
    try {
      const data = await getTeam();
      // Filter data based on logged in Club id
      let filteredData = [];
      filteredData =
        data?.teams?.length > 0 &&
        data?.teams?.filter((team) => team?.clubId?._id === id);
      setTeamsList(filteredData);
    } catch (error) {
      console.log("Getting an error while fetching teams list: ", error);
    }
  };

  // used to handle the team updation
  const handleUpdateTeam = async (data) => {
    try {
      await updateTeam(data.teamId, {
        players: data?.players,
        clubId: id,
      });
      toast.success("Team details updated successfully!");
      reset(); // Clear the form on success
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Error creating team. Please try again.");
    }
  };

  // Used to add a new comp league
  const handleCreateLeague = async () => {
    if (leagueName === "" || leagueCategory === "" || matchesInRegularRound === "") {
      setIsLeagueNameEmpty(true);
      return;
    }
    setIsAddingLeague(true)
    try {
      const generatedLeague = await createLeague({
        leagueName,
        leagueCategory,
        matchesInRegularRound,
      });
      generatedLeague?.league?._id && setGeneratedLeagueId(generatedLeague?.league?._id);
      if (generatedLeague) {
        await fetchLeagues()
      }
      setIsLeagueCreated(true);
      setLeagueName("");
      setLeagueCategory("");
      setMatchesInRegularRound("");
      toast.success("League Created Successfully");
    } catch (error) {
      console.log("Getting an error while creating league: ", error);
    } finally {
      setIsAddingLeague(false)
    }
  };

  const fetchLeagues = async () => {
    try {
      const response = await getAllLeagues();
      if (response && response.leagues && Array.isArray(response.leagues)) {
        setLeagueOptions(response.leagues.map((league) => ({ label: league.leagueName, value: league._id })));
      } else {
        console.error("Error fetching leagues: Response does not contain the leagues array");
      }
    } catch (error) {
      console.error("Error fetching leagues:", error);
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories()
      if (response && response.categories && Array.isArray(response.categories)) {
        setAllCategories(response.categories)
      }
    } catch (error) {
      console.error("Error fetching league categories:", error);
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setAddCategory('')
    setIsAddLeagueInputEmpty(false)
  }



  const handlecreateleagueCategory = async () => {
    if (Addcategory === '') {
      setIsAddLeagueInputEmpty(true)
      return;
    }
    try {
      const response = await createCategory(Addcategory)
      if (response.category) {
        fetchCategories()
        handleCloseModal()
        toast.success("Category Added Successfully")
      }
    } catch (error) {
      if (error?.response?.data?.error) {
        toast.error(error?.response?.data?.error)
      }
      console.error("Error creating league category")
    }
  }

  const handleOpenModal = async () => {
    setIsModalOpen(true)
  }

  const handleAddTeam = () => {
    if (teamsList.length === 0) {
      return toast.error("Please choose a team to add players to the team")
    }
    append({})
  }

  useEffect(() => {
    if (leagueName) {
      setIsLeagueNameEmpty(false);
    }
  }, [leagueName]);

  // fetching teams list
  useEffect(() => {
    fetchTeams();
    fetchLeagues();
    fetchCategories()
    return () => {
      setGeneratedLeagueId("");
    };
  }, []);
  // --------------------------------------------------------------------------------------
  return (
    <section>
      {userType === "admin" ? (
        <div className="flex items-center justify-center">
          <div className="md:w-1/2 w-full mx-auto">
            <div >
              <form
                className="w-full max-w-lg mt-5 shadow-xl rounded-md py-4 px-6 mx-auto"
                onSubmit={handleSubmit(handleCreateLeague)}
              >
                <div className="flex flex-wrap md:mb-6 mb-1 w-full">
                  <div className="w-full px-3">
                    <div className="flex flex-wrap md:mb-6  md:my-1 mb-1 my-5">
                      <div className="md:w-[100%] w-[100%] ">
                        <h2 className="text-start text-2xl font-bold leading-tight text-gray-600 my-3">
                          Create a new League
                        </h2>
                        <Label
                          className="block uppercase tracking-wide text-gray-600  text-xs font-bold mb-2"
                          htmlFor="leagueCategory"
                        >
                          League Category <span className="text-red-600">*</span>
                        </Label>
                        <div className="h-12 w-full flex justify-between items-center mb-3">
                          <Select onValueChange={(e) => setLeagueCategory(e.target.value)}>
                            <SelectTrigger className="w-8/12 h-12">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {
                                allCategories.length > 0 && allCategories.map((category) => (
                                  <SelectItem value={category._id} key={`${category._id}`}>{
                                    category.categoryName}</SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                          <div className="border flex rounded-lg text-sm h-12 justify-center items-center px-3 bg-orange-600 text-white cursor-pointer"
                            onClick={handleOpenModal}>
                            Add New Category
                          </div>
                        </div>
                        {
                          isModalOpen ?
                            <div className="w-full h-full bg-black/70 fixed top-0 left-0 flex flex-col items-center justify-center" onClick={handleCloseModal}>
                              <div className="w-3/12 bg-white h-52 rounded-2xl flex flex-col items-center justify-center px-4" onClick={(e) => {
                                e.stopPropagation()
                              }}>
                                <div className=" w-full flex items-center justify-between py-5">
                                  <h1 className="text-xl">Add New Categories</h1>
                                  <ImCross className=" cursor-pointer" onClick={handleCloseModal} />
                                </div>
                                <Input type="text" className="w-full border  h-12 rounded-md px-3"
                                  value={Addcategory}
                                  onChange={(e) => setAddCategory(e.target.value)}
                                />
                                {isAddLeagueInputEmpty && (
                                  <p className="text-red-500 text-xs italic text-start px-2 w-full">
                                    League Category is required
                                  </p>
                                )}
                                <div className="border mt-5 py-2 px-5 rounded bg-black text-white cursor-pointer"
                                  onClick={handlecreateleagueCategory}>Add</div>
                              </div>
                            </div>
                            : null
                        }
                      </div>
                      <div className="md:w-[100%] w-[100%]">
                        <Label
                          className="block uppercase tracking-wide text-gray-600  text-xs font-bold mb-2"
                          htmlFor="matchesInRegularRound"
                        >
                          Matches in Regular Round <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          className="appearance-none block w-full  text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                          id="matchesInRegularRound"
                          type="number"
                          placeholder="Enter Matches"
                          value={matchesInRegularRound}
                          onChange={(e) => setMatchesInRegularRound(e.target.value)}
                        />
                      </div>
                      <div className=" w-full ">
                        <Label
                          className="block uppercase tracking-wide text-gray-600 text-xs font-bold mb-2"
                          htmlFor="leagueName"
                        >
                          League Name <span className="text-red-600">*</span>
                        </Label>
                        <Input
                          className="appearance-none block w-full  text-gray-700 border border-gray-200 rounded py-3 px-4  leading-tight focus:outline-none focus:bg-white focus:border-gray-500 h-12"
                          id="league-name"
                          type="text"
                          placeholder="Enter League Name"
                          value={leagueName}
                          onChange={(e) => setLeagueName(e.target.value)}
                        />
                        {isLeageNameEmpty && (
                          <p className="text-red-500 text-xs italic">
                            League Name is required
                          </p>
                        )}
                      </div>

                      <div className="w-full  mt-6 text-center">
                        <Button
                          type="button"
                          className="h-12 w-full bg-orange-600 text-white rounded-md text-sm flex items-center justify-center"
                          onClick={handleCreateLeague}
                          disabled={isAddingLeague}

                        >
                          Add League
                          <>
                            {
                              isAddingLeague && <ImSpinner3 className="h-4 w-4 ml-2 animate-spin" />
                            }
                          </>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <form onSubmit={handleSubmit(handleCreateClub)} className="w-full my-10 shadow-md px-10 py-5 rounded-md ">
              <h2 className="text-start text-2xl font-bold leading-tight text-gray-600 my-2">
                Create a new Club
              </h2>
              <div className="w-full">
                <Label
                  className="block uppercase tracking-wide text-gray-600 text-xs font-bold mb-2"
                  htmlFor="clubImage"
                >
                  Club Image <span className="text-red-600">*</span>
                </Label>
                <Input
                  className="appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 h-12"
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
                <p className="text-red-500 text-xs italic">
                  {errors?.clubImage?.message}
                </p>
              </div>
              <div className="px-3">
                {clubImage && (
                  <img
                    src={clubImage}
                    alt="Preview"
                    style={{ maxWidth: "200px" }}
                  />
                )}
              </div>


              <div className="flex flex-wrap -mx-3 md:mb-6 mb-1">
                <div className="w-full px-3">
                  <Label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="clubName"
                  >
                    Club Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    className="appearance-none block w-full text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="grid-password"
                    type="text"
                    placeholder="Enter Club Name"
                    {...register("clubName", {
                      required: {
                        value: true,
                        message: "Club Name is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.clubName?.message}
                  </p>
                </div>
                <div className="md:w-[100%] w-[100%] px-3 mt-6 text-start">
                  <Label className="font-bold text-xs text-gray-700" htmlFor="league">SELECT  LEAGUE <span className=" italic font-normal">(optional)</span></Label>
                  <Select onValueChange={handleSelectLeague} value={selectedLeague}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select a league" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">No League</SelectItem>
                      {
                        leagueOptions.length > 0 && leagueOptions.map((option) => (
                          <SelectItem value={option.value} key={option.value}>{
                            option.label}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 md:mb-6 mb-1">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <Label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="grid-first-name"
                  >
                    Club Admin Email <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    className="appearance-none block w-full  text-gray-700 rounded py-3 px-4 mb-3 leading-tight focus:bg-white h-12"
                    id="adminEmail"
                    type="email"
                    placeholder="Enter club admin email"
                    {...register("adminEmail", {
                      required: {
                        value: true,
                        message: "Admin email is required",
                      },
                    })}
                  />

                  <p className="text-red-500 text-xs italic">
                    {errors?.adminEmail?.message}
                  </p>
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <Label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="grid-last-name"
                  >
                    Club Admin Password <span className="text-red-600">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      className="appearance-none block w-full  text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:bg-white focus:border-gray-500 h-12"
                      id="adminPassword"
                      type={clubPasswordVisible ? "text" : "password"}
                      placeholder="Enter Password"
                      {...register("adminPassword", {
                        required: {
                          value: true,
                          message: "Admin Password is required",
                        },
                      })}
                    />
                    <div className=" h-12 w-12 absolute top-0 right-0 flex items-center justify-center ">
                      <>
                        {!clubPasswordVisible ? <IoEye className="cursor-pointer w-5 h-5" onClick={() => setClubPasswordVisible(!clubPasswordVisible)} /> : <IoEyeOff className="cursor-pointer w-5 h-5" onClick={() => setClubPasswordVisible(!clubPasswordVisible)} />}
                      </>
                    </div>
                  </div>
                  <p className="text-red-500 text-xs italic">
                    {errors?.adminPassword?.message}.
                  </p>
                </div>
              </div>

              <div className="submit_button my-5">
                <Button
                  type="submit"
                  className="px-2 py-3 h-12 text-white rounded-md w-full bg-orange-600"
                  disabled={isCreatingClub}
                >
                  Create Club
                  <>
                    {
                      isCreatingClub && <ImSpinner3 className="h-4 w-4 ml-2 animate-spin" />
                    }
                  </>
                </Button>
              </div>
            </form>
          </div>
        </div >
      ) : (
        <></>
      )
      }
      {
        userType === "clubadmin" ? (
          <div className="flex items-center justify-center">
            <div className="md:w-1/2 w-full mx-auto">
              <h2 className="text-center text-2xl font-bold leading-tight text-orange-600 my-2">
                Update Team
              </h2>
              <form
                className="w-full max-w-lg mt-5"
                onSubmit={handleSubmit(handleUpdateTeam)}
              >
                <div className="flex flex-wrap -mx-3 mb-6">
                  <div className="w-full px-3">
                    <Label
                      className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                      htmlFor="teamName"
                    >
                      Team List
                    </Label>
                    <select
                      className="appearance-none block w-full  text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                      {...register(`teamId`, {
                        required: {
                          value: true,
                          message: "Team Name is required",
                        },
                      })}
                    >
                      <option value="">Select an option</option>
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
                      {errors?.teamName?.message}
                    </p>
                  </div>
                </div>

                {/* Player Fields */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2">Players</h3>
                  {fields.map((player, index) => (
                    <div key={player.id} className="flex flex-wrap -mx-3 mb-10">
                      <div className="w-full md:w-2/3 px-3">
                        <Label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor={`players[${index}].playerName`}
                        >
                          Player Name
                        </Label>
                        <Input
                          className="appearance-none block w-full  text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                          type="text"
                          placeholder="Enter Player Name"
                          {...register(`players[${index}].playerName`, {
                            required: true,
                            message: "Player Name is required",
                          })}
                        />
                        <p className="text-red-500 text-xs italic">
                          {errors?.players?.[index]?.playerName?.message}
                        </p>
                      </div>

                      <div className="w-full md:w-1/3 px-3">
                        <Label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor={`players[${index}].position`}
                        >
                          Position
                        </Label>
                        <select
                          className="appearance-none block w-full  text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                          {...register(`players[${index}].position`, {
                            required: true,
                            message: "Position is required",
                          })}
                        >
                          <option value="Quarterback">Quarterback</option>
                          <option value="Rusher">Rusher</option>
                          <option value="Offensive Player">
                            Offensive Player
                          </option>
                          <option value="Defensive Player">
                            Defensive Player
                          </option>
                          <option value="NONE">NONE</option>
                        </select>
                        <p className="text-red-500 text-xs italic">
                          {errors?.players?.[index]?.position?.message}
                        </p>
                      </div>

                      <div className="w-full md:w-full px-3">
                        <Label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor={`players[${index}].email`}
                        >
                          Player Email
                        </Label>
                        <Input
                          className="appearance-none block w-full  text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                          type="email"
                          placeholder="Enter Player Email"
                          {...register(`players[${index}].email`, {
                            required: true,
                            message: "Player Email is required",
                          })}
                        />
                        <p className="text-red-500 text-xs italic">
                          {errors?.players?.[index]?.email?.message}
                        </p>
                      </div>

                      <div className="w-full md:w-1/3 px-3">
                        <Label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor={`players[${index}].role`}
                        >
                          Role
                        </Label>
                        <select
                          className="appearance-none block w-full  text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                          {...register(`players[${index}].role`, {
                            required: true,
                            message: "Role is required",
                          })}
                        >
                          <option value="PLAYER">Player</option>
                          <option value="STAFF">Staff</option>
                        </select>
                        <p className="text-red-500 text-xs italic">
                          {errors?.players?.[index]?.role?.message}
                        </p>
                      </div>

                      <div className="w-full md:w-2/3 px-3">
                        <Label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor={`players[${index}].jerseyNumber`}
                        >
                          Jersey Number
                        </Label>
                        <Input
                          className="appearance-none block w-full  text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                          type="number"
                          placeholder="Enter Jersey Number"
                          {...register(`players[${index}].jerseyNumber`, {
                            required: true,
                            message: "Jersey Number is required",
                          })}
                        />
                        <p className="text-red-500 text-xs italic">
                          {errors?.players?.[index]?.jerseyNumber?.message}
                        </p>
                      </div>

                      {/* Add similar structure for other player fields */}
                      {/* ... */}

                      <div className="w-full flex justify-end px-3">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="px-2 py-1 bg-red-500 text-white rounded-md"
                        >
                          Remove Player
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Player Button */}
                  <div className="w-full flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleAddTeam()}
                      className="px-2 py-1 bg-green-500 text-white rounded-md"
                    >
                      Add Player
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="submit_button">
                  <button
                    type="submit"
                    className="px-2 py-3 bg-orange-600  text-white rounded-md w-full"
                  >
                    Update Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <></>
        )
      }
      {userType === "team" && navigate("/dashboard/updateTeam")}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </section >
  );
}
