import React, { useEffect, useState, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseURL, getTeamById, createTeamUpdateRequest, getPendingRequestsByTeam } from "../services/api";
import { Button } from "@/components/ui/button";
import { FaPlus, FaUserTie, FaUserAlt } from "react-icons/fa";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ImSpinner3 } from "react-icons/im";
import { DatePicker } from "antd";
import moment from "moment";
import { useParams } from "react-router-dom";
import { Shield, ChevronLeft, CheckCircle2, Clock, Mail, Hash, MapPin, User, Calendar } from "lucide-react";

// -----------------------------------------------------------------------------
const InviteTeam = () => {
    const { teamId } = useParams();
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
        watch,
    } = useForm({
        defaultValues: {
            role: 'PLAYER'
        }
    });

    const selectedRole = watch("role");

    // Used to store comp teams list
    const [teamData, setTeamData] = useState(null)
    const [pendingRequests, setPendingRequests] = useState([]);
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
            jerseyNumber: role === 'STAFF' ? (jerseyNumber || 'N/A') : jerseyNumber,
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

            // Refresh pending requests
            fetchPendingRequests();

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
    const fetchTeamData = async () => {
        try {
            const data = await getTeamById(teamId);
            if (data && data.data) {
                setTeamData(data.data);
            } else if (data) {
                setTeamData(data);
            } else {
                setError("Team not found");
            }
        } catch (error) {
            console.log("Error fetching team: ", error);
            setError("Failed to load team data or invalid link.");
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const data = await getPendingRequestsByTeam(teamId);
            setPendingRequests(data || []);
        } catch (error) {
            console.log("Error fetching pending requests:", error);
        }
    };

    const combinedRoster = useMemo(() => {
        const approved = (teamData?.players || []).map(p => ({ ...p, status: 'APPROVED' }));
        const pending = pendingRequests.map(r => ({
            ...r.playerData,
            _id: r._id,
            status: 'PENDING',
            requestedAt: r.requestedAt
        }));
        return [...pending, ...approved];
    }, [teamData, pendingRequests]);

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

    useEffect(() => {
        const loadPageData = async () => {
            if (teamId) {
                setLoading(true);
                await Promise.all([fetchTeamData(), fetchPendingRequests()]);
                setLoading(false);
            }
        };
        loadPageData();
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
        <div className="min-h-screen bg-[#0f172a] text-slate-200">
            {/* Add Player Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="bg-[#1e293b] border-slate-700 text-slate-200 sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <User className="w-6 h-6 text-orange-500" />
                            Add New Player to {teamData?.teamName}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Fill in the details below to submit a player application for this team.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(handleUpdateTeam)} className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Player Name */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Player Name <span className="text-red-500">*</span></label>
                                <Input
                                    className="bg-[#0f172a] border-slate-700 focus:border-orange-500 h-11"
                                    placeholder="Full Name"
                                    {...register(`playerName`, { required: "Player Name is required" })}
                                />
                                {errors.playerName && <p className="text-red-500 text-xs">{errors.playerName.message}</p>}
                            </div>

                            {/* Position */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Position <span className="text-red-500">*</span></label>
                                <select
                                    className="w-full h-11 bg-[#0f172a] border border-slate-700 rounded-md px-3 text-sm focus:outline-none focus:border-orange-500"
                                    {...register(`position`, { required: "Position is required" })}
                                >
                                    <option value="Quarterback">Quarterback</option>
                                    <option value="Rusher">Rusher</option>
                                    <option value="Offensive Player">Offensive Player</option>
                                    <option value="Defensive Player">Defensive Player</option>
                                    <option value="NONE">NONE</option>
                                </select>
                            </div>

                            {/* Email */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-300">Player Email</label>
                                <Input
                                    className="bg-[#0f172a] border-slate-700 focus:border-orange-500 h-11"
                                    placeholder="email@example.com"
                                    {...register(`email`)}
                                />
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Role <span className="text-red-500">*</span></label>
                                <select
                                    className="w-full h-11 bg-[#0f172a] border border-slate-700 rounded-md px-3 text-sm focus:outline-none focus:border-orange-500"
                                    {...register(`role`, { required: "Role is required" })}
                                >
                                    <option value="PLAYER">Player</option>
                                    <option value="STAFF">Staff</option>
                                </select>
                            </div>

                            {/* Jersey Number */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">
                                    Jersey Number {selectedRole !== 'STAFF' && <span className="text-red-500">*</span>}
                                </label>
                                <Input
                                    className="bg-[#0f172a] border-slate-700 focus:border-orange-500 h-11"
                                    placeholder="#"
                                    {...register(`jerseyNumber`, {
                                        required: selectedRole === 'STAFF' ? false : "Jersey Number is required"
                                    })}
                                />
                                {errors.jerseyNumber && <p className="text-red-500 text-xs">{errors.jerseyNumber.message}</p>}
                            </div>

                            {/* DOB */}
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-300">Date of Birth <span className="text-red-500">*</span></label>
                                <Controller
                                    name="dateofBirth"
                                    control={control}
                                    rules={{ required: "Date of Birth is required" }}
                                    render={({ field }) => (
                                        <DatePicker
                                            {...field}
                                            value={field.value ? moment(field.value, "YYYY-MM-DD") : null}
                                            className="h-11 w-full bg-[#0f172a] text-slate-200 border-slate-700 hover:border-orange-500"
                                            style={{ backgroundColor: '#0f172a', color: 'white', borderColor: '#334155' }}
                                            onChange={(date, dateString) => field.onChange(dateString)}
                                        />
                                    )}
                                />
                                {errors.dateofBirth && <p className="text-red-500 text-xs">{errors.dateofBirth.message}</p>}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-orange-900/20"
                            disabled={updatingTeam}
                        >
                            {updatingTeam ? (
                                <span className="flex items-center gap-2">
                                    Submitting <ImSpinner3 className="animate-spin" />
                                </span>
                            ) : (
                                "Submit Join Request"
                            )}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Team Header Card */}
                <div className="bg-[#1e293b] rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 mb-12">
                    <div className="relative h-48 bg-gradient-to-r from-orange-600 to-orange-400">
                        <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px]" />
                        <div className="absolute -bottom-16 left-8 sm:left-12 flex flex-col sm:flex-row items-end gap-6">
                            <div className="relative group">
                                <img
                                    src={getImageUrl(teamData?.teamImage)}
                                    alt={teamData?.teamName}
                                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl border-4 border-[#1e293b] bg-slate-800 object-cover shadow-xl transition-transform group-hover:scale-[1.02]"
                                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Team&background=random' }}
                                />
                                <div className="absolute -top-3 -right-3 bg-white text-orange-600 p-2 rounded-full shadow-lg border-2 border-orange-500">
                                    <Shield className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="pb-4 sm:pb-2 text-center sm:text-left">
                                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-none mb-3">
                                    {teamData?.teamName}
                                </h1>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                    <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium text-orange-100 border border-white/10">
                                        <MapPin className="w-4 h-4" /> {teamData?.clubId?.clubName || "Independent"}
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-medium text-orange-100 border border-white/10">
                                        <Mail className="w-4 h-4" /> {teamData?.teamEmail || "No Email"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-24 pb-12 px-8 sm:px-12 flex flex-col lg:flex-row justify-between items-center gap-8">
                        <div className="flex gap-8">
                            <div className="text-center">
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Players</p>
                                <p className="text-3xl font-black text-white">{teamData?.players?.length || 0}</p>
                            </div>
                            <div className="w-px h-12 bg-slate-700/50" />
                            <div className="text-center">
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Status</p>
                                <p className="text-3xl font-black text-green-500 flex items-center gap-2">
                                    Active <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleShowDialog}
                            className="h-14 px-8 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-2xl transition-all shadow-xl shadow-orange-900/30 flex items-center gap-3 transform hover:-translate-y-1 active:scale-95 group"
                        >
                            <FaPlus className="text-sm group-hover:rotate-90 transition-transform" />
                            Apply for Team
                        </Button>
                    </div>
                </div>

                {/* Roster Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
                            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Team Roster</h2>
                        </div>
                        <p className="text-slate-500 font-medium italic">Showing all confirmed and pending members</p>
                    </div>

                    {combinedRoster.length === 0 ? (
                        <div className="bg-[#1e293b]/50 border-2 border-dashed border-slate-700/50 rounded-3xl p-16 text-center">
                            <User className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-400">No players found in roster</h3>
                            <p className="text-slate-500 mt-2">Be the first player to join this team!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {combinedRoster.map((player) => (
                                <div
                                    key={player._id}
                                    className={`relative group bg-[#1e293b] border-2 rounded-2xl p-6 transition-all hover:shadow-2xl hover:shadow-black/40 flex items-start gap-5
                                        ${player.status === 'PENDING' ? 'border-orange-500/30 bg-orange-500/5' : 'border-slate-700/30 hover:border-orange-500/50'}`}
                                >
                                    {/* Jersey Number Circle */}
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg font-black text-xl transition-colors
                                        ${player.status === 'PENDING' ? 'bg-orange-900/20 text-orange-500 border border-orange-500/30' : 'bg-[#0f172a] text-orange-500 border border-slate-700'}`}>
                                        {player.jerseyNumber === 'N/A' ? (
                                            player.role === 'STAFF' ? <FaUserTie className="w-6 h-6" /> : '#'
                                        ) : (
                                            `#${player.jerseyNumber}`
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className="text-lg font-black text-white truncate group-hover:text-orange-400 transition-colors">
                                                {player.playerName}
                                            </h4>
                                            {player.status === 'PENDING' && (
                                                <span className="bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-orange-500/20 flex items-center gap-1 animate-pulse">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-slate-400 font-semibold">
                                                <Shield className="w-4 h-4 text-orange-500/70" />
                                                <span>{player.position}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-600" />
                                                <span className="text-slate-500">{player.role}</span>
                                            </div>

                                            {player.email && (
                                                <div className="flex items-center gap-2 text-slate-500 group-hover:text-slate-400 transition-colors">
                                                    <Mail className="w-4 h-4" />
                                                    <span className="truncate">{player.email}</span>
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 text-slate-500">
                                                <Calendar className="w-4 h-4" />
                                                <span>{moment(player.dateofBirth).format('MMM Do, YYYY')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Background Accent */}
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity">
                                        <Shield className="w-24 h-24 text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
        </div>
    );
};

export default InviteTeam;
