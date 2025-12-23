import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseURL, getSingleCompClubs, createClubUpdateRequest, getAllLeagues } from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImSpinner3 } from "react-icons/im";
import { useParams } from "react-router-dom";
import { Shield, Users, Trophy, Image as ImageIcon, Mail, Lock } from "lucide-react";
import { IoEye, IoEyeOff } from "react-icons/io5";

const InviteClub = () => {
    const { clubId } = useParams();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
        setValue,
    } = useForm();

    const [clubData, setClubData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [teamImage, setTeamImage] = useState("");
    const [leagues, setLeagues] = useState([]);
    const [selectedLeague, setSelectedLeague] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const imageData = watch("teamImage")?.[0];
        const url = imageData ? window.URL.createObjectURL(imageData) : "";
        setTeamImage(url);
    }, [watch("teamImage")]);

    const fetchClubData = async () => {
        try {
            setLoading(true);
            const data = await getSingleCompClubs(clubId);
            if (data) {
                setClubData(data);
            } else {
                setError("Club not found");
            }
        } catch (error) {
            console.log("Error fetching club: ", error);
            setError("Failed to load club data or invalid link.");
        } finally {
            setLoading(false);
        }
    };

    const fetchLeagues = async () => {
        try {
            const response = await getAllLeagues();
            if (response.status === "SUCCESS") {
                setLeagues(response.leagues || []);
            }
        } catch (error) {
            console.log("Error fetching leagues:", error);
        }
    };

    const handleAddTeam = async (data) => {
        setSubmitting(true);
        try {
            const teamData = {
                teamName: data.teamName,
                teamEmail: data.teamEmail,
                teamPassword: data.teamPassword,
                teamImage: teamImage, // Will need to handle file upload separately if required
                leagueList: selectedLeague ? [selectedLeague] : []
            };

            await createClubUpdateRequest({
                clubId,
                requestType: "ADD_TEAM",
                teamData
            });

            toast.success("Team addition request submitted for approval!");
            reset();
            setTeamImage("");
            setSelectedLeague("");
            setValue("teamImage", null);
        } catch (error) {
            console.error("Error creating request:", error);
            toast.error("Error submitting request. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const getImageUrl = (image) => {
        if (!image) return null;
        if (image.startsWith('http')) return image;
        const imageName = image.split('/').pop().split('\\').pop();
        return `${baseURL}/uploads/${imageName}`;
    };

    useEffect(() => {
        if (clubId) {
            fetchClubData();
            fetchLeagues();
        }
    }, [clubId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
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
        );
    }

    return (
        <>
            <div className="min-h-screen bg-[#0f172a] py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Club Header */}
                    <div className="mb-8">
                        <div className="bg-[#1e293b] rounded-2xl shadow-xl border border-slate-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-8">
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative">
                                        <img
                                            src={getImageUrl(clubData?.clubImage)}
                                            alt={clubData?.clubName}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://ui-avatars.com/api/?name=Club&background=random';
                                            }}
                                            className="w-24 h-24 rounded-full border-4 border-white/20 shadow-lg object-cover"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-white text-orange-600 p-2 rounded-full shadow-lg">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-left text-white">
                                        <h1 className="text-3xl font-bold mb-2">{clubData?.clubName}</h1>
                                        <p className="text-orange-100 opacity-90 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                                            <span className="bg-black/20 px-3 py-1 rounded-full text-sm">
                                                {clubData?.league?.leagueName || "No League"}
                                            </span>
                                            <span className="bg-black/20 px-3 py-1 rounded-full text-sm">
                                                Admin: {clubData?.adminEmail || "N/A"}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Add Team Form */}
                            <div className="p-6 sm:p-8">
                                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Users className="w-6 h-6 text-orange-500" />
                                    Add Team to {clubData?.clubName}
                                </h2>

                                <form onSubmit={handleSubmit(handleAddTeam)} className="space-y-6">
                                    {/* Team Image */}
                                    <div>
                                        <Label className="block text-sm font-semibold text-slate-300 mb-2">
                                            Team Image <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            className="w-full h-12 border border-slate-600 rounded-lg px-4 focus:border-orange-500 bg-[#0f172a] text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-orange-500 hover:file:bg-slate-600"
                                            accept="image/*"
                                            type="file"
                                            {...register("teamImage", {
                                                required: { value: true, message: "Team Image is required" },
                                            })}
                                        />
                                        <p className="text-red-400 text-xs mt-1">{errors?.teamImage?.message}</p>
                                        {teamImage && (
                                            <div className="mt-4">
                                                <img
                                                    src={teamImage}
                                                    alt="Team preview"
                                                    className="w-32 h-32 object-cover rounded-lg border-2 border-slate-600"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Team Name */}
                                    <div>
                                        <Label className="block text-sm font-semibold text-slate-300 mb-2">
                                            Team Name <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            className="w-full h-12 border border-slate-600 rounded-lg px-4 focus:border-orange-500 bg-[#0f172a] text-slate-200 placeholder:text-slate-500"
                                            type="text"
                                            placeholder="Enter team name"
                                            {...register("teamName", {
                                                required: { value: true, message: "Team Name is required" },
                                            })}
                                        />
                                        <p className="text-red-400 text-xs mt-1">{errors?.teamName?.message}</p>
                                    </div>

                                    {/* Select League */}
                                    <div>
                                        <Label className="block text-sm font-semibold text-slate-300 mb-2">
                                            Select League <span className="text-slate-500 text-xs font-normal">(optional)</span>
                                        </Label>
                                        <Select onValueChange={setSelectedLeague} value={selectedLeague || undefined}>
                                            <SelectTrigger className="w-full h-12 border border-slate-600 bg-[#0f172a] text-slate-200 focus:border-orange-500">
                                                <SelectValue placeholder="Select a league (optional)" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                                                <SelectItem value="none" className="focus:bg-slate-700 focus:text-white cursor-pointer">
                                                    No League
                                                </SelectItem>
                                                {leagues.length > 0 &&
                                                    leagues.map((league) => (
                                                        <SelectItem
                                                            value={league._id}
                                                            key={league._id}
                                                            className="focus:bg-slate-700 focus:text-white cursor-pointer"
                                                        >
                                                            {league.leagueName}
                                                        </SelectItem>
                                                    ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Team Email and Password */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <Label className="block text-sm font-semibold text-slate-300 mb-2">
                                                Team Email <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                className="w-full h-12 border border-slate-600 rounded-lg px-4 focus:border-orange-500 bg-[#0f172a] text-slate-200 placeholder:text-slate-500"
                                                type="email"
                                                placeholder="Enter team email"
                                                {...register("teamEmail", {
                                                    required: { value: true, message: "Team email is required" },
                                                    pattern: {
                                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                        message: "Please enter a valid email address",
                                                    },
                                                })}
                                            />
                                            <p className="text-red-400 text-xs mt-1">{errors?.teamEmail?.message}</p>
                                        </div>
                                        <div>
                                            <Label className="block text-sm font-semibold text-slate-300 mb-2">
                                                Team Password <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    className="w-full h-12 border border-slate-600 rounded-lg px-4 pr-12 focus:border-orange-500 bg-[#0f172a] text-slate-200 placeholder:text-slate-500"
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Enter password (min. 6 characters)"
                                                    {...register("teamPassword", {
                                                        required: { value: true, message: "Team Password is required" },
                                                        minLength: {
                                                            value: 6,
                                                            message: "Password must be at least 6 characters long",
                                                        },
                                                    })}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                                                >
                                                    {showPassword ? <IoEyeOff className="w-5 h-5" /> : <IoEye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                            <p className="text-red-400 text-xs mt-1">{errors?.teamPassword?.message}</p>
                                        </div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full h-12 bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-all font-semibold"
                                        >
                                            {submitting ? (
                                                <>
                                                    <ImSpinner3 className="h-5 w-5 mr-2 animate-spin inline" />
                                                    Submitting Request...
                                                </>
                                            ) : (
                                                "Submit Team for Approval"
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-slate-500 text-sm">
                        <p>You are adding a team via a shared invite link.</p>
                        <p className="mt-1">The admin will review and approve your request.</p>
                    </div>
                </div>
                <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
            </div>
        </>
    );
};

export default InviteClub;
