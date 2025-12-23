import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseURL, getTeamById, createTeamUpdateRequest } from "../services/api";
import AntDTable from "@/components/AntDTable/AntDTable";
import { Button } from "@/components/ui/button";
import { FaPlus } from "react-icons/fa";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ImSpinner3 } from "react-icons/im";
import { DatePicker } from "antd";
import moment from "moment";
import { useParams } from "react-router-dom";
import { Shield, ChevronLeft, CheckCircle2 } from "lucide-react";

// -----------------------------------------------------------------------------
const InviteTeam = () => {
    const { teamId } = useParams();
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm();

    // Used to store comp teams list
    const [teamData, setTeamData] = useState(null)
    const [showDialog, setShowDialog] = useState(false);
    const [updatingTeam, setIsUpdatingTeam] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [requestSubmitted, setRequestSubmitted] = useState(false);

    const handleUpdateTeam = async (data) => {
        setIsUpdatingTeam(true)
        const { playerName, position, role, jerseyNumber, email, dateofBirth } = data;

        // Create new player object
        const newPlayer = {
            playerName,
            position,
            role,
            jerseyNumber,
            email,
            dateofBirth
        };

        try {
            await createTeamUpdateRequest({
                teamId,
                requestType: "ADD_PLAYER",
                playerData: newPlayer
            });

            // Show success feedback
            setRequestSubmitted(true);
            toast.success("Player add request submitted for approval!");
            reset();

            // Close dialog after short delay
            setTimeout(() => {
                handleCloseDialog();
                setRequestSubmitted(false); // Reset for next add
            }, 2000);

        } catch (error) {
            console.error("Error creating request:", error);
            toast.error("Error submitting request. Please try again.");
        } finally {
            setIsUpdatingTeam(false)
        }
    };

    // Used to fetch existing teams list
    const fetchTeams = async () => {
        try {
            setLoading(true);
            const data = await getTeamById(teamId);
            if (data && data.data) {
                setTeamData(data.data);
            } else if (data) {
                // Fallback if structure is different
                setTeamData(data);
            } else {
                setError("Team not found");
            }
        } catch (error) {
            console.log("Getting an error while fetching team: ", error);
            setError("Failed to load team data or invalid link.");
        } finally {
            setLoading(false);
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

    const getImageUrl = (image) => {
        if (!image) return null;
        if (image.startsWith('http')) return image;
        const imageName = image.split('/').pop().split('\\').pop();
        return `${baseURL}/uploads/${imageName}`;
    };

    // fetching teams list
    useEffect(() => {
        if (teamId) {
            fetchTeams();
        }
    }, [teamId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
                <div className="bg-[#1e293b] p-8 rounded-xl border border-slate-700 max-w-md w-full text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-slate-400">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="bg-[#1e293b] border-slate-700 text-slate-200 sm:max-w-2xl translate-y-[-50%] top-[50%]">
                    <DialogHeader>
                        <DialogTitle className="mb-2 text-white">Add a new player to {teamData?.teamName}</DialogTitle>
                        <form
                            className="w-full mt-5"
                            onSubmit={handleSubmit(handleUpdateTeam)}
                        >
                            {/* Player Fields */}
                            <div className="mb-6">
                                <div className="flex flex-wrap -mx-3 mb-4">
                                    <div className="w-full md:w-2/3 px-3 mb-4 md:mb-0">
                                        <label className="block uppercase tracking-wide text-slate-300 text-xs font-bold mb-2">
                                            Player Name
                                        </label>
                                        <Input
                                            className="appearance-none block w-full h-12 bg-[#0f172a] text-slate-200 border border-slate-700 rounded py-3 px-4 leading-tight focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
                                            type="text"
                                            placeholder="Enter Player Name"
                                            {...register(`playerName`, {
                                                required: {
                                                    value: true,
                                                    message: "Player Name is required",
                                                },
                                            })}
                                        />
                                        <p className="text-red-500 text-xs italic mt-1">
                                            {errors?.playerName?.message}
                                        </p>
                                    </div>

                                    <div className="w-full md:w-1/3 px-3">
                                        <label className="block uppercase tracking-wide text-slate-300 text-xs font-bold mb-2">
                                            Position
                                        </label>
                                        <select
                                            className="appearance-none block w-full h-12 bg-[#0f172a] text-slate-200 border border-slate-700 rounded py-3 px-4 leading-tight focus:outline-none focus:border-orange-500"
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
                                        <p className="text-red-500 text-xs italic mt-1">
                                            {errors?.position?.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap -mx-3 mb-4">
                                    <div className="w-full px-3">
                                        <label className="block uppercase tracking-wide text-slate-300 text-xs font-bold mb-2">
                                            Player Email
                                        </label>
                                        <Input
                                            className="appearance-none block w-full h-12 bg-[#0f172a] text-slate-200 border border-slate-700 rounded py-3 px-4 leading-tight focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
                                            type="email"
                                            placeholder="Enter Player Email"
                                            {...register(`email`, {
                                                required: {
                                                    value: true,
                                                    message: "Player email is required",
                                                },
                                            })}
                                        />
                                        <p className="text-red-500 text-xs italic mt-1">
                                            {errors?.email?.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap -mx-3 mb-4">
                                    <div className="w-full md:w-1/3 px-3 mb-4 md:mb-0">
                                        <label className="block uppercase tracking-wide text-slate-300 text-xs font-bold mb-2">
                                            Role
                                        </label>
                                        <select
                                            className="appearance-none block w-full h-12 bg-[#0f172a] text-slate-200 border border-slate-700 rounded py-3 px-4 leading-tight focus:outline-none focus:border-orange-500"
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
                                        <p className="text-red-500 text-xs italic mt-1">
                                            {errors?.role?.message}
                                        </p>
                                    </div>

                                    <div className="w-full md:w-1/3 px-3 mb-4 md:mb-0">
                                        <label className="block uppercase tracking-wide text-slate-300 text-xs font-bold mb-2">
                                            Jersey Number
                                        </label>
                                        <Input
                                            className="appearance-none block w-full h-12 bg-[#0f172a] text-slate-200 border border-slate-700 rounded py-3 px-4 leading-tight focus:outline-none focus:border-orange-500 placeholder:text-slate-500"
                                            type="text"
                                            placeholder="#"
                                            {...register(`jerseyNumber`, {
                                                required: {
                                                    value: true,
                                                    message: "Jersey Number is required",
                                                },
                                            })}
                                        />
                                        <p className="text-red-500 text-xs italic mt-1">
                                            {errors?.jerseyNumber?.message}
                                        </p>
                                    </div>

                                    <div className="w-full md:w-1/3 px-3">
                                        <label className="block uppercase tracking-wide text-slate-300 text-xs font-bold mb-2">
                                            DOB
                                        </label>
                                        <Controller
                                            name="dateofBirth"
                                            control={control}
                                            rules={{ required: "Date of Birth is required" }}
                                            render={({ field }) => (
                                                <DatePicker
                                                    {...field}
                                                    value={field.value ? moment(field.value, "YYYY-MM-DD") : null}
                                                    className="h-12 w-full bg-[#0f172a] text-slate-200 border-slate-700 hover:border-orange-500 focus:border-orange-500 placeholder-slate-500"
                                                    style={{ backgroundColor: '#0f172a', color: 'white', borderColor: '#334155' }}
                                                    onChange={(date, dateString) => field.onChange(dateString)}
                                                />
                                            )}
                                        />
                                        <p className="text-red-500 text-xs italic mt-1">
                                            {errors?.dateofBirth?.message}
                                        </p>
                                    </div>
                                </div>

                            </div>

                            {/* Submit Button */}
                            <div className="mb-5">
                                <Button
                                    type="submit"
                                    className="px-2 py-3 bg-orange-600 h-12 text-white rounded-md w-full hover:bg-orange-700"
                                    disabled={updatingTeam}
                                >
                                    {updatingTeam ?
                                        <>
                                            Adding Player <ImSpinner3 className="w-4 h-4 animate-spin ml-2" />
                                        </>
                                        :
                                        "Add Player"
                                    }
                                </Button>
                            </div>
                        </form>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

            <div className="min-h-screen bg-[#0f172a] py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <div className="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-8">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative">
                                        <img
                                            src={getImageUrl(teamData?.teamImage)}
                                            alt={`${teamData?.teamName}`}
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=Team&background=random' }}
                                            className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg object-cover"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-white text-orange-600 p-2 rounded-full shadow-lg">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-left text-white">
                                        <h1 className="text-3xl font-bold mb-2">{teamData?.teamName}</h1>
                                        <p className="text-orange-100 opacity-90 flex items-center justify-center sm:justify-start gap-2">
                                            <span className="bg-black/20 px-3 py-1 rounded-full text-sm">
                                                {teamData?.clubId?.clubName || "Club Team"}
                                            </span>
                                            <span className="bg-black/20 px-3 py-1 rounded-full text-sm">
                                                Email: {teamData?.teamEmail || "N/A"}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 sm:p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                                    <h2 className="text-xl font-semibold text-slate-200">
                                        Team Roster ({teamData?.players?.length || 0})
                                    </h2>
                                    <Button
                                        className="bg-orange-600 hover:bg-orange-700 text-white w-full sm:w-auto"
                                        onClick={handleShowDialog}
                                    >
                                        <FaPlus className="mr-2" />
                                        Add New Player
                                    </Button>
                                </div>

                                <div className="ant-table-dark-theme-wrapper">
                                    <AntDTable columns={columns} data={teamData?.players} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-slate-500 text-sm">
                        <p>You are viewing this team via a shared invite link.</p>
                    </div>
                </div>
                <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
            </div>
        </>
    );
};

export default InviteTeam;
