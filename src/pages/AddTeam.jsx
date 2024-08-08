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
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";

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
  const [isClubSelected, setIsClubSelected] = useState(false);
  const [isLeagueSelected, setIsLeagueSelected] = useState(false);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    console.log(data)
    setIsCreatingTeam(true)
    try {
      const formData = new FormData();
      const teamImage = data?.teamImage?.[0];
      if (!teamImage) {
        toast.error("Please select a team image.");
        return;
      }
      if (!teamImage.type.startsWith("image/")) {
        toast.error("Invalid file format. Please select a valid image.");
        return;
      }
      if (teamImage.size > 5 * 1024 * 1024) {
        toast.error(
          "Image size exceeds the 5 MB limit. Please choose a smaller image."
        );
        return;
      }
      formData.append("teamName", data?.teamName);
      if (!data.leagueId && !data.clubId) {
        toast.error("Please select a league or a club");
        return;
      }
      if (data?.clubId) {
        formData.append("clubId", data?.clubId);
      }
      if (data?.leagueId) {
        formData.append("leagueId", data?.leagueId);
      }
      formData.append("teamImage", teamImage);
      formData.append('teamEmail', data?.teamEmail);
      formData.append('teamPassword', data?.teamPassword);
      const response = await createTeam(formData);

      if (response.status === "SUCCESS") {
        toast.success("Team Created Successfully");
        reset();
        setIsLeagueSelected(false);
        setIsClubSelected(false);

      }
    } catch (error) {
      console.log("Getting an error while creating team: ", error);
      toast.error("Error creating the team");
    } finally {
      setIsCreatingTeam(false)
    }
  };

  useEffect(() => {
    fetchClubs();
    fetchLeagues();
  }, []);

  return (
    <>
      <div className="flex items-center justify-center">
        <div className=" px-8 py-3 shadow-md rounded-md md:w-1/2 sm:w-full">
          <h2 className=" text-center text-2xl font-bold leading-9 tracking-tight text-orange-600">
            Create Team
          </h2>
          <form
            className="w-full mt-5"
            onSubmit={handleSubmit(handleCreateTeam)}
          >
            <div className="flex flex-wrap -mx-3 md:mb-6 mb-1">
              <div className="w-full px-3">
                <Label
                  className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                  htmlFor="teamImage"
                >
                  Team Image
                </Label>
                <Input
                  className="appearance-none block w-full text-gray-700  border border-gray-200 rounded py-3 px-4  leading-tight focus:outline-none focus:bg-white focus:border-gray-500 h-12"
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
                <p className="text-red-500 text-xs italic">
                  {errors?.teamImage?.message}
                </p>
              </div>
              <div className="px-3">
                {teamImage && (
                  <img
                    src={teamImage}
                    alt="Preview"
                    style={{ maxWidth: "200px" }}
                  />
                )}
              </div>
            </div>
            <div className="flex flex-wrap -mx-3 mb-2">
              <div className="w-full px-3">
                <Label
                  className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                  htmlFor="teamName"
                >
                  Team Name
                </Label>
                <Input
                  className="appearance-none block w-full  text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                  id="grid-password h-12"
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
            <div className="flex justify-between w-full">
              <div className="flex flex-wrap  mb-2 w-1/2">
                <div className="w-full pr-3">
                  <Label
                    className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                    htmlFor="teamEmail"
                  >
                    Team Email
                  </Label>
                  <Input
                    className="appearance-none block w-full h-12 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    id="grid-password h-12"
                    type="text"
                    placeholder="Enter Team Email"
                    {...register("teamEmail", {
                      required: {
                        value: true,
                        message: "Team Email is required",
                      },
                    })}
                  />
                  <p className="text-red-500 text-xs italic">
                    {errors?.teamName?.message}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap  mb-2 w-1/2">
                <div className="w-full pl-3">
                  <Label
                    className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                    htmlFor="teamName"
                  >
                    Team Password
                  </Label>
                  <div className=" relative">
                    <Input
                      className="appearance-none  block w-full text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500 h-12"
                      id="grid-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Team Password"
                      {...register("teamPassword", {
                        required: {
                          value: true,
                          message: "Team Password is required",
                        },
                      })}
                    />
                    <div className=" h-12 w-12 absolute top-0 right-0 flex items-center justify-center">
                      <>
                        {!showPassword ? <IoEye className="cursor-pointer w-5 h-5" onClick={() => setShowPassword(!showPassword)} /> : <IoEyeOff className="cursor-pointer w-5 h-5" onClick={() => setShowPassword(!showPassword)} />}
                      </>
                    </div>
                  </div>
                  <p className="text-red-500 text-xs italic">
                    {errors?.teamName?.message}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap -mx-3 mb-3">
              <div className="w-full px-3">
                <h1 className="text-center font-bold ">JOIN A CLUB</h1>
                <Label
                  className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                  htmlFor="clubId"
                >
                  Clubs List
                </Label>
                <Select
                  onValueChange={(value) => {
                    setValue("clubId", value);
                    setIsClubSelected(value !== '');
                    setIsLeagueSelected(false);
                  }}
                  disabled={isLeagueSelected}
                >
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.length > 0 &&
                      clubs.map((club) => (
                        <SelectItem value={club._id} key={club._id}>
                          {club.clubName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-red-500 text-xs italic">
                  {errors?.clubId?.message}
                </p>
              </div>
            </div>
            <div className="flex justify-around items-center">
              <hr className="h-px w-[40%] bg-gray-300 border-0 " />
              <p>OR</p>
              <hr className="h-px w-[40%] bg-gray-300 border-0 " />
            </div>
            <div className="flex flex-wrap -mx-3 my-3">
              <div className="w-full px-3">
                <h1 className="text-center font-bold">JOIN A LEAGUE</h1>
                <Label
                  className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                  htmlFor="leagueId"
                >
                  Choose League
                </Label>
                <Select
                  onValueChange={(value) => {
                    setValue("leagueId", value);
                    setIsLeagueSelected(value !== '');
                    setIsClubSelected(false);
                  }}
                  disabled={isClubSelected}
                >
                  <SelectTrigger className="w-full h-12">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagues.length > 0 &&
                      leagues.map((league) => (
                        <SelectItem value={league._id} key={league._id}>
                          {league.leagueName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-red-500 text-xs italic">
                  {errors?.leagueId?.message}
                </p>
              </div>
            </div>

            <div className="submit_button">
              <Button
                type="submit"
                className="px-2 my-5 bg-orange-600 text-white rounded-md w-full h-12"
                disabled={isCreatingTeam}
              >
                Create Team
                {
                  isCreatingTeam && <ImSpinner3 className="h-4 w-4 ml-2 animate-spin" />
                }
              </Button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} />
    </>
  );
};

export default AddTeam;
