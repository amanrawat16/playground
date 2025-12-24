import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseURL, getTeam, getTeamById, updateTeam } from "../services/api";
import AntDTable from "@/components/AntDTable/AntDTable";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ImSpinner3 } from "react-icons/im";
import { DatePicker }
  from
  "antd"
  ;
import moment from "moment";
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
  const [teamData, setTeamData] = useState([])
  const [showDialog, setShowDialog] = useState(false);
  const [updatingTeam, setIsUpdatingTeam] = useState(false);
  const userType = localStorage.getItem('userType');
  const id = localStorage.getItem("_id");


  const handleUpdateTeam = async (data) => {
    setIsUpdatingTeam(true)
    const { playerName, position, role, jerseyNumber, email, dateofBirth } = data;
    const players = [];
    players.push({
      playerName,
      position,
      role,
      jerseyNumber,
      email,
      dateofBirth
    });

    try {
      await updateTeam(id, {
        players,
        clubId: id
      });
      toast.success("Team details updated successfully!");
      reset();
      await fetchTeams()
    } catch (error) {
      console.error("Error creating team:", error);
      toast.error("Error creating team. Please try again.");
    } finally {
      setIsUpdatingTeam(false)
      handleCloseDialog()
    }
  };

  // Used to fetch existing teams list
  const fetchTeams = async () => {
    try {
      const data = await getTeamById(id);
      setTeamData(data.data);
    } catch (error) {
      console.log("Getting an error while fetching teams list: ", error);
    }
  };

  const columns = [
    {
      title: 'Player Name',
      dataIndex: 'playerName',
      align: "center",
      key: 'playerName',
    },
    {
      title: 'Position',
      dataIndex: 'position',
      align: "center",
      key: 'position',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      align: "center",
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      align: "center",
      key: 'role',
    },
    {
      title: 'Jersey Number',
      dataIndex: 'jerseyNumber',
      align: "center",
      key: 'jerseyNumber',
    },
    {
      title: "Date of Birth",
      dataIndex: 'dateofBirth',
      key: 'dateofBirth',
      align: "center",
      render: (dob) => <div>
        {
          moment(dob).format('YYYY-MM-DD')
        }
      </div>
    }
  ];

  const handleShowDialog = () => {
    setShowDialog(true);
  }

  const handleCloseDialog = () => {
    setShowDialog(false);
  }


  // fetching teams list
  useEffect(() => {
    fetchTeams();
  }, []);

  return (
    <>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent onClick={handleCloseDialog} className="bg-[#1e293b] border-slate-700 text-slate-200 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="mb-2 text-white">Add a new player to your team</DialogTitle>
            <form
              className="w-full mt-5"
              onSubmit={handleSubmit(handleUpdateTeam)}
            >
              {/* Player Fields */}
              <div className="mb-6">
                <div className="flex flex-wrap -mx-3 mb-10">
                  <div className="w-full md:w-2/3 px-3">
                    <label className="block uppercase tracking-wide text-slate-300 text-xs font-bold mb-2">
                      Player Name
                    </label>
                    <Input
                      className="appearance-none block w-full h-12 bg-[#0f172a] text-slate-200 border border-slate-700 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
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
                    <label className="block uppercase tracking-wide text-slate-300 text-xs font-bold mb-2">
                      Position
                    </label>
                    <select
                      className="appearance-none block w-full h-12 bg-[#0f172a] text-slate-200 border border-slate-700 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-orange-500"
                      {...register(`position`, {
                        required: {
                          value: true,
                          message: "Position is required",
                        },
                      })}
                    >
                      <option value="Quarterback" className="bg-[#0f172a]">Quarterback</option>
                      <option value="Rusher" className="bg-[#0f172a]">Rusher</option>
                      <option value="Offensive Player" className="bg-[#0f172a]">Offensive Player</option>
                      <option value="Defensive Player" className="bg-[#0f172a]">Defensive Player</option>
                      <option value="NONE" className="bg-[#0f172a]">NONE</option>
                    </select>
                    <p className="text-red-500 text-xs italic">
                      {errors?.position?.message}
                    </p>
                  </div>

                  <div className="w-full md:w-full px-3">
                    <label className="block uppercase tracking-wide text-slate-300 text-xs font-bold mb-2">
                      Player Email
                    </label>
                    <Input
                      className="appearance-none block w-full h-12 bg-[#0f172a] text-slate-200 border border-slate-700 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
                      type="email"
                      placeholder="Enter Player Email"
                      {...register(`email`, {
                        required: {
                          value: false,
                          message: "Player email is required",
                        },
                      })}
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors?.email?.message}
                    </p>
                  </div>

                  <div className="w-full md:w-1/3 px-3">
                    <label className="block uppercase tracking-wide text-slate-300 text-xs font-bold mb-2">
                      Role
                    </label>
                    <select
                      className="appearance-none block w-full h-12 bg-[#0f172a] text-slate-200 border border-slate-700 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-orange-500"
                      {...register(`role`, {
                        required: {
                          value: true,
                          message: "Player Role is required",
                        },
                      })}
                    >
                      <option value="PLAYER" className="bg-[#0f172a]">Player</option>
                      <option value="STAFF" className="bg-[#0f172a]">Staff</option>
                    </select>
                    <p className="text-red-500 text-xs italic">
                      {errors?.role?.message}
                    </p>
                  </div>

                  <div className="w-full md:w-2/3 px-3">
                    <label className="block uppercase tracking-wide text-slate-300 text-xs font-bold mb-2">
                      Jersey Number
                    </label>
                    <Input
                      className="appearance-none block w-full h-12 bg-[#0f172a] text-slate-200 border border-slate-700 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
                      type="text"
                      placeholder="Enter Jersey Number"
                      {...register(`jerseyNumber`, {
                        required: selectedRole === 'STAFF' ? false : "Jersey Number is required"
                      })}
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors?.jerseyNumber?.message}
                    </p>
                  </div>

                  {/* Add similar structure for other player fields */}
                  {/* ... */}
                  <div className="w-full md:w-2/3 px-3">
                    <label className="block uppercase tracking-wide text-slate-300 text-xs font-bold mb-2">
                      Date of Birth
                    </label>
                    <Controller
                      name="dateofBirth"
                      control={control}
                      rules={{ required: "Date of Birth is required" }}
                      render={({ field }) => (
                        <DatePicker
                          {...field}
                          value={field.value ? moment(field.value, "YYYY-MM-DD") : null}
                          className="h-12 w-full bg-[#0f172a] text-slate-200 border-slate-700 hover:border-orange-500 focus:border-orange-500"
                          style={{ backgroundColor: '#0f172a', color: 'white', borderColor: '#334155' }}
                          onChange={(date, dateString) => field.onChange(dateString)}
                        />
                      )}
                    />
                    <p className="text-red-500 text-xs italic">
                      {errors?.dateofBirth?.message}
                    </p>
                  </div>

                </div>
              </div>

              {/* Submit Button */}
              <div className="submit_button mb-5">
                <Button
                  type="submit"
                  className="px-2 py-3 bg-orange-600 h-12 text-white rounded-md w-full hover:bg-orange-700"
                  disabled={updatingTeam}
                >
                  {updatingTeam ?
                    <>
                      Updating Team <ImSpinner3 className="w-4 h-4 animate-spin ml-2" />
                    </>
                    :
                    "Update Team"
                  }
                </Button>
              </div>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-center min-h-screen bg-[#0f172a] py-6">
        <div className="md:w-4/5 w-full mx-auto my-10 bg-[#1e293b] p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-center text-2xl font-bold leading-tight text-white my-2">
            Update Team
          </h2>
          <div className="my-10">
            <div className="flex items-center">
              <div className="h-full w-32 flex-shrink-0">
                <img src={`${baseURL}/uploads/${teamData?.teamImage?.split("\\")[1]}`} alt={`${teamData?.teamName}`}
                  onError={(e) => { e.target.onerror = null; e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg' }} className="w-20 h-20 rounded-full mx-auto border-2 border-slate-600" />
              </div>
              <div className="px-4 py-2">
                <p className="font-bold text-2xl text-orange-500">
                  {teamData?.teamName}</p>
                <p className='text-sm text-slate-400'>{teamData?.teamEmail}</p>
              </div>
            </div>
            <div className="w-full flex justify-end my-4">
              <Button className="flex items-center justify-center bg-orange-600 hover:bg-orange-700 text-white" onClick={handleShowDialog} >Add Player<FaPlus className="ml-2" /></Button>
            </div>
            <div className="ant-table-dark-theme-wrapper">
              <AntDTable columns={columns} data={teamData?.players} />
            </div>
          </div>

        </div>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </div>
    </>
  );
};

export default AddPlayer;
