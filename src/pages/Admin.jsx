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
import { ImCross } from "react-icons/im";
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

  const [allLeagues, setAllLeagues] = useState("");
  const [leagueOptions, setLeagueOptions] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState("");
  const [allCategories, setAllCategories] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [Addcategory, setAddCategory] = useState('')
  const [isAddLeagueInputEmpty, setIsAddLeagueInputEmpty] = useState(false)

  const userType = localStorage.getItem("userType");
  const _id = localStorage.getItem("_id");

  // This block of code is used to show image preview after uploading club's image.
  useEffect(() => {
    const imageData = watch("clubImage")?.[0];
    const url = imageData ? window.URL.createObjectURL(imageData) : "";
    setClubImage(url);
    fetchLeagues();
  }, [watch("clubImage")]);

  // used to handle the create club
  const handleCreateClub = async (data) => {
    console.log(data)
    try {
      // console.log("Club form data::: ", data, data?.clubImage?.[0]);
      const formData = new FormData();
      const clubImage = data?.clubImage?.[0];
      // console.log("clubImage::: ", clubImage);

      // Check if an image is selected
      if (!clubImage) {
        toast.error("Please select a club image.");
        return;
      }

      // Check image MIME type
      if (!clubImage.type.startsWith("image/")) {
        toast.error("Invalid file format. Please select a valid image.");
        return;
      }

      // Check image size (5 MB limit)
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
      formData.append("teamEmail", data?.teamEmail);
      formData.append("teamPassword", data?.teamPassword);
      formData.append("league", selectedLeague);

      await createCompClub(formData);
      toast.success("Club created successfully!");
      reset(); // Clear the form on success
      setIsLeagueNameEmpty(false);
      setGeneratedLeagueId("");
      setIsLeagueCreated(false);
    } catch (error) {
      console.error("Error creating club:", error);
      toast.error("Error creating club. Please try again.");
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

  // used to handle the team updation
  const handleUpdateTeam = async (data) => {
    try {
      await updateTeam(data?.teamName, {
        players: data?.players,
        clubId: _id,
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

            <form
              className="w-full max-w-lg mt-5"
              onSubmit={handleSubmit(handleCreateLeague)}
            >
              <div className="flex flex-wrap -mx-3 md:mb-6 mb-1">
                <div className="w-full px-3">
                  <div className="flex flex-wrap md:mb-6  md:my-1 mb-1 my-5">
                    <div className="md:w-[100%] w-[100%]">
                      <h2 className="text-start text-2xl font-bold leading-tight text-black my-2">
                        Create a new League
                      </h2>
                      <label
                        className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                        htmlFor="leagueCategory"
                      >
                        League Category <span className="text-red-600">*</span>
                      </label>
                      <div className="h-12 w-full flex justify-between items-center mb-3">
                        <select className="w-8/12 h-full bg-gray-200  rounded focus:outline-none focus:bg-white cursor-pointer" name="categories" id="categories"
                          value={leagueCategory}
                          onChange={(e) => setLeagueCategory(e.target.value)}>
                          <option value="">Select a category</option>
                          {
                            allCategories.length > 0 && allCategories.map((category) => (
                              <option value={`${category._id}`} key={`${category._id}`}>{
                                category.categoryName}</option>
                            ))
                          }
                        </select>
                        <div className="border flex rounded-lg text-sm h-full justify-center items-center px-3 bg-black text-white cursor-pointer"
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
                              <input type="text" className="w-full border border-gray-600 h-12 rounded-md px-3"
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
                      <label
                        className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                        htmlFor="matchesInRegularRound"
                      >
                        Matches in Regular Round <span className="text-red-600">*</span>
                      </label>
                      <input
                        className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        id="matchesInRegularRound"
                        type="number"
                        placeholder="Enter Matches"
                        value={matchesInRegularRound}
                        onChange={(e) => setMatchesInRegularRound(e.target.value)}
                      />
                    </div>
                    <div >
                      <label
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="leagueName"
                      >
                        League Name <span className="text-red-600">*</span>
                      </label>
                      <input
                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4  leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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

                    <div className="md:w-[30%] w-[50%] px-3 mt-6 text-center">
                      <button
                        type="button"
                        className="px-2 py-3 bg-gray-800 text-white rounded-md text-sm"
                        onClick={handleCreateLeague}
                      >
                        Add League
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            <form onSubmit={handleSubmit(handleCreateClub)}>
              <h2 className="text-start text-2xl font-bold leading-tight text-black my-2">
                Create a new Club
              </h2>
              <div className="w-full">
                <label
                  className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                  htmlFor="clubImage"
                >
                  Club Image <span className="text-red-600">*</span>
                </label>
                <input
                  className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
                {/* Display Club Image preview */}
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
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="clubName"
                  >
                    Club Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
                  <label className="font-bold text-xs text-gray-700" htmlFor="league">SELECT  LEAGUE <span className=" italic font-normal">(optional)</span></label>
                  <select
                    id="league"
                    className="w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    value={selectedLeague}
                    onChange={(e) => setSelectedLeague(e.target.value)}
                  >
                    <option value="">Select a league </option>
                    {leagueOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 md:mb-6 mb-1">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="grid-first-name"
                  >
                    Club Admin Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 rounded py-3 px-4 mb-3 leading-tight focus:bg-white "
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
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="grid-last-name"
                  >
                    Club Admin Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:bg-white focus:border-gray-500"
                    id="adminPassword"
                    type="password"
                    placeholder="Enter Password"
                    {...register("adminPassword", {
                      required: {
                        value: true,
                        message: "Admin Password is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.adminPassword?.message}.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap -mx-3 md:mb-6 mb-1">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="grid-first-name"
                  >
                    Team Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 rounded py-3 px-4 mb-3 leading-tight focus:bg-white"
                    id="teamEmail"
                    type="email"
                    placeholder="Enter club team email"
                    {...register("teamEmail", {
                      required: {
                        value: true,
                        message: "Team email is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.teamEmail?.message}.
                  </p>
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <label
                    className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                    htmlFor="grid-last-name"
                  >
                    Team Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="teamPassword"
                    type="password"
                    placeholder="Enter Password"
                    {...register("teamPassword", {
                      required: {
                        value: true,
                        message: "Team Password is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.teamPassword?.message}
                  </p>
                </div>
              </div>

              <div className="submit_button my-5">
                <button
                  type="submit"
                  className="px-2 py-3 bg-gray-800 text-white rounded-md w-full"
                >
                  Create Club
                </button>
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
                        className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                        htmlFor="teamName"
                      >
                        Team List
                      </label>
                      <select
                        className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                        {...register(`teamName`, {
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
                )}

                {/* Player Fields */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2">Players</h3>
                  {fields.map((player, index) => (
                    <div key={player.id} className="flex flex-wrap -mx-3 mb-10">
                      <div className="w-full md:w-2/3 px-3">
                        <label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor={`players[${index}].playerName`}
                        >
                          Player Name
                        </label>
                        <input
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
                        <label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor={`players[${index}].position`}
                        >
                          Position
                        </label>
                        <select
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
                        <label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor={`players[${index}].email`}
                        >
                          Player Email
                        </label>
                        <input
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
                        <label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor={`players[${index}].role`}
                        >
                          Role
                        </label>
                        <select
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
                        <label
                          className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
                          htmlFor={`players[${index}].jerseyNumber`}
                        >
                          Jersey Number
                        </label>
                        <input
                          className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
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
                      onClick={() => append({})}
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
                    className="px-2 py-3 bg-gray-800 text-white rounded-md w-full"
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
