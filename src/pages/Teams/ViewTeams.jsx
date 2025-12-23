import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { baseURL, ChangeTeamImage, getAllLeagues, getAllTeams, getTeamPlayers, updateTeamInfo } from "@/services/api"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMdCloudUpload } from "react-icons/io";
import { toast, ToastContainer } from "react-toastify"
import { ImSpinner8 } from "react-icons/im"
import { Trophy, Users, Mail, Edit, Image as ImageIcon, AlertCircle, Search, ChevronRight, Layers, Calendar, Share2 } from "lucide-react"
import ReactLoader from "../../common/ReactLoader"

function ViewTeams() {
    const navigate = useNavigate();
    const [modifiedLeaguelist, setModifiedLeagueList] = useState([])
    const [allTeamsList, setAllTeamsList] = useState([])
    const [filteredTeams, setFilteredTeams] = useState([])
    const [teamSearchQuery, setTeamSearchQuery] = useState("")
    const [selectedTeam, setSelectedTeam] = useState(null)
    const [teamPlayers, setTeamPlayers] = useState([])
    const [isLoadingPlayers, setIsLoadingPlayers] = useState(false)
    const [selectedLeagueFilter, setSelectedLeagueFilter] = useState("all")
    const [dialogData, setDialogData] = useState({
        id: "",
        teamName: '',
        image: ""
    })
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingLeagues, setIsLoadingLeagues] = useState(true)

    const fetchAllTeams = async () => {
        setIsLoading(true);
        try {
            const response = await getAllTeams()
            if (response.status === 'SUCCESS') {
                const modifiedList = response.data.map((team) => {
                    return {
                        ...team,
                        label: team.teamName,
                        value: team._id
                    }
                })
                setAllTeamsList(modifiedList)
                setFilteredTeams(modifiedList)
            }
        } catch (error) {
            console.error("Error fetching teams:", error)
            toast.error("Failed to load teams.");
        } finally {
            setIsLoading(false)
        }
    }

    const fetchTeamPlayers = async (teamId) => {
        if (!teamId) return;
        setIsLoadingPlayers(true);
        try {
            const response = await getTeamPlayers(teamId)
            if (response.status === 'SUCCESS') {
                setTeamPlayers(response.data || [])
            }
        } catch (error) {
            console.error("Error fetching players:", error)
            toast.error("Failed to load players.");
        } finally {
            setIsLoadingPlayers(false)
        }
    }

    useEffect(() => {
        const filtered = allTeamsList.filter(team => {
            const matchesSearch = team.teamName.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                team.teamEmail?.toLowerCase().includes(teamSearchQuery.toLowerCase());
            const matchesLeague = selectedLeagueFilter === "all" || team.leagueId === selectedLeagueFilter;
            return matchesSearch && matchesLeague;
        });
        setFilteredTeams(filtered);
    }, [teamSearchQuery, selectedLeagueFilter, allTeamsList]);

    const fetchLeagues = async () => {
        try {
            setIsLoadingLeagues(true);
            const response = await getAllLeagues()
            if (response.status === "SUCCESS") {
                const modifiedList = response.leagues.map((el) => {
                    return {
                        ...el,
                        label: el.leagueName,
                        value: el._id
                    }
                })
                setModifiedLeagueList(modifiedList)
            } else {
                setModifiedLeagueList([])
            }
        } catch (error) {
            console.error("Error fetching leagues:", error)
            toast.error("Failed to load leagues. Please try again.");
            setModifiedLeagueList([])
        } finally {
            setIsLoadingLeagues(false)
        }
    }


    const handleDialogDataChange = (e) => {
        const { name, value } = e.target;
        setDialogData({ ...dialogData, [name]: value })
    }

    const handleSubmitDialogData = async () => {
        setIsSubmitting(true)
        try {
            const { teamName } = dialogData;
            if (!teamName || teamName.trim() === "") {
                toast.error("Team name is required")
                setIsSubmitting(false)
                return
            }
            const response = await updateTeamInfo(dialogData.id, { teamName: teamName.trim() })
            if (response.status === "SUCCESS") {
                const updateList = (list) => list.map(team => team._id === dialogData.id ? { ...team, teamName: teamName.trim() } : team);
                setAllTeamsList(updateList)
                if (selectedTeam?._id === dialogData.id) {
                    setSelectedTeam({ ...selectedTeam, teamName: teamName.trim() });
                }
                setIsDialogOpen(false)
                toast.success("Team information updated successfully")
                handleDialogClose()
            }
        } catch (error) {
            console.error("Error updating team:", error)
            const errorMessage = error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to update team. Please try again.";
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }


    const handleOpenDialog = (e, record) => {
        e.stopPropagation()
        setDialogData({
            id: record._id,
            teamName: record.teamName,
            image: record?.teamImage
        })
        setIsDialogOpen(true)
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setDialogData({
            id: "",
            teamName: "",
            image: ''
        })
    }

    const handleSelectTeam = (team) => {
        setSelectedTeam(team);
        fetchTeamPlayers(team._id);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Client-side validation
        if (!file.type.startsWith('image/')) {
            toast.error("Please select a valid image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("Image size should be less than 5MB");
            return;
        }

        setIsUploadingImage(true)
        const formdata = new FormData()
        try {
            formdata.append('teamImage', file)
            const response = await ChangeTeamImage(dialogData.id, formdata)
            if (response.status === 'SUCCESS') {
                const updateList = (list) => list.map(team => team._id === dialogData.id ? { ...team, teamImage: response.team.teamImage } : team);
                setDialogData({ ...dialogData, image: response.team.teamImage })
                setAllTeamsList(updateList)
                if (selectedTeam?._id === dialogData.id) {
                    setSelectedTeam({ ...selectedTeam, teamImage: response.team.teamImage });
                }
                toast.success("Team image updated successfully")
            }
        } catch (error) {
            console.error("Error updating team image:", error)
            const errorMessage = error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to update team image. Please try again.";
            toast.error(errorMessage)
        } finally {
            setIsUploadingImage(false)
            // Reset file input
            e.target.value = '';
        }
    }

    // Helper function to get team image URL
    const getTeamImageUrl = (teamImage) => {
        if (!teamImage) return null;
        if (teamImage.startsWith('http')) return teamImage;
        const imageName = teamImage.split('/').pop().split('\\').pop();
        return `${baseURL}/uploads/${imageName}`;
    };


    useEffect(() => {
        fetchLeagues()
        fetchAllTeams()
    }, [])

    return (
        <>
            {/* Edit Team Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md bg-[#1e293b] border-slate-700 text-slate-200" onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl text-white">
                            <Edit className="w-5 h-5 text-orange-500" />
                            Edit Team Information
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Update team name and image
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Team Name Input */}
                        <div className="space-y-2">
                            <Label htmlFor="teamName" className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                                <Users className="w-4 h-4 text-orange-500" />
                                Team Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="teamName"
                                value={dialogData.teamName}
                                name="teamName"
                                onChange={handleDialogDataChange}
                                placeholder="Enter team name"
                                className="h-11 border-2 border-slate-600 bg-[#0f172a] text-slate-200 focus:border-orange-500 placeholder:text-slate-500"
                            />
                        </div>

                        {/* Team Image */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                                <ImageIcon className="w-4 h-4 text-orange-500" />
                                Team Image
                            </Label>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                {dialogData.image ? (
                                    <div className="relative">
                                        <img
                                            src={getTeamImageUrl(dialogData.image)}
                                            alt={dialogData.teamName || "Team"}
                                            className="w-24 h-24 rounded-full object-cover border-4 border-slate-600"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(dialogData.teamName || "Team")}&background=ea580c&color=fff&size=128`;
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center">
                                        <Users className="w-12 h-12 text-slate-400" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <Button
                                        type="button"
                                        className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white"
                                        onClick={() => document.getElementById('fileInput').click()}
                                        disabled={isUploadingImage}
                                    >
                                        {isUploadingImage ? (
                                            <span className="flex items-center gap-2">
                                                <ImSpinner8 className="w-4 h-4 animate-spin" />
                                                Uploading...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <IoMdCloudUpload className="w-5 h-5" />
                                                Upload Image
                                            </span>
                                        )}
                                    </Button>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Recommended: Square image, max 5MB
                                    </p>
                                    <input
                                        id="fileInput"
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 border-slate-600 text-slate-900 bg-transparent hover:bg-slate-800 hover:text-white"
                                onClick={handleDialogClose}
                                disabled={isSubmitting || isUploadingImage}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                                disabled={isSubmitting || isUploadingImage}
                                onClick={handleSubmitDialogData}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2 justify-center">
                                        <ImSpinner8 className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 justify-center">
                                        <Edit className="w-4 h-4" />
                                        Update Team
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Main Content */}
            <div className="min-h-screen bg-[#0f172a] py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8 text-center bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 p-8">
                        <div className="flex flex-col items-center gap-4">
                            <div className="p-4 bg-orange-900/20 rounded-2xl">
                                <Users className="w-10 h-10 text-orange-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-white tracking-tight">Teams Hub</h1>
                                <p className="text-slate-400 mt-2 text-lg">Manage teams and view player rosters</p>
                            </div>
                        </div>

                        {/* Global Search & Filter */}
                        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center items-center">
                            <div className="relative w-full max-w-md">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <Input
                                    placeholder="Search teams by name or email..."
                                    value={teamSearchQuery}
                                    onChange={(e) => setTeamSearchQuery(e.target.value)}
                                    className="pl-12 h-12 border-2 border-slate-700 bg-[#0f172a] text-slate-200 focus:border-orange-500 rounded-xl"
                                />
                            </div>
                            <div className="w-full md:w-64">
                                <Select value={selectedLeagueFilter} onValueChange={setSelectedLeagueFilter}>
                                    <SelectTrigger className="h-12 border-2 border-slate-700 bg-[#0f172a] text-slate-200 focus:border-orange-500 rounded-xl">
                                        <SelectValue placeholder="Filter by League" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                                        <SelectItem value="all">All Leagues</SelectItem>
                                        {modifiedLeaguelist.map((league) => (
                                            <SelectItem key={league._id} value={league._id}>
                                                {league.leagueName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Teams List */}
                        <div className={`${selectedTeam ? 'lg:col-span-4' : 'lg:col-span-12'} space-y-4`}>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-orange-500" />
                                Teams ({filteredTeams.length})
                            </h2>

                            {isLoading ? (
                                <div className="flex items-center justify-center p-20 bg-[#1e293b] rounded-xl border border-slate-700">
                                    <ImSpinner8 className="w-10 h-10 text-orange-500 animate-spin" />
                                </div>
                            ) : filteredTeams.length === 0 ? (
                                <div className="bg-[#1e293b] rounded-xl p-12 text-center border-2 border-dashed border-slate-700">
                                    <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                    <p className="text-slate-400">No teams found matching your selection.</p>
                                </div>
                            ) : (
                                <div className="bg-[#1e293b] rounded-xl border border-slate-700 overflow-hidden">
                                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                                        <Table>
                                            <TableHeader className="sticky top-0 bg-[#1e293b] z-10 shadow-sm">
                                                <TableRow className="border-b border-slate-700 hover:bg-transparent">
                                                    <TableHead className="text-slate-400 font-bold py-4">Team</TableHead>
                                                    <TableHead className="text-slate-400 font-bold py-4 hidden md:table-cell">League</TableHead>
                                                    <TableHead className="w-10"></TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredTeams.map((team) => (
                                                    <TableRow
                                                        key={team._id}
                                                        onClick={() => handleSelectTeam(team)}
                                                        className={`cursor-pointer transition-all border-b border-slate-800 last:border-0 ${selectedTeam?._id === team._id
                                                            ? 'bg-orange-600/10 hover:bg-orange-600/20'
                                                            : 'hover:bg-slate-800/50'
                                                            }`}
                                                    >
                                                        <TableCell className="py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800 flex-shrink-0 overflow-hidden">
                                                                    {team.teamImage ? (
                                                                        <img
                                                                            src={getTeamImageUrl(team.teamImage)}
                                                                            alt={team.teamName}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(team.teamName)}&background=334155&color=fff`; }}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center">
                                                                            <Users className="w-5 h-5 text-slate-500" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className={`font-bold truncate ${selectedTeam?._id === team._id ? 'text-orange-500' : 'text-slate-200'}`}>
                                                                        {team.teamName}
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-500 uppercase tracking-tighter md:hidden">
                                                                        {team.leagueName || 'Independent'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="py-3 hidden md:table-cell">
                                                            <span className="text-slate-400 text-sm">{team.leagueName || 'Independent'}</span>
                                                        </TableCell>
                                                        <TableCell className="py-3 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const link = `${window.location.origin}/invite/team/${team._id}`;
                                                                        navigator.clipboard.writeText(link);
                                                                        toast.success("Invite link copied to clipboard!");
                                                                    }}
                                                                    className="p-1 hover:bg-slate-700 rounded transition-colors text-orange-500"
                                                                    title="Copy Invite Link"
                                                                >
                                                                    <Share2 className="w-4 h-4" />
                                                                </button>
                                                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedTeam?._id === team._id ? 'text-orange-500 translate-x-1' : 'text-slate-700'}`} />
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Team Details & Players */}
                        {selectedTeam && (
                            <div className="lg:col-span-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
                                    {/* Team Cover/Header */}
                                    <div className="h-48 bg-gradient-to-br from-orange-600 to-pink-700 relative">
                                        <div className="absolute inset-0 bg-black/20" />
                                        <button
                                            onClick={() => setSelectedTeam(null)}
                                            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                                        >
                                            <AlertCircle className="w-5 h-5 rotate-45" />
                                        </button>
                                        <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                                            <div className="w-32 h-32 rounded-2xl border-4 border-[#1e293b] shadow-2xl overflow-hidden bg-slate-800 bg-white">
                                                {selectedTeam.teamImage ? (
                                                    <img
                                                        src={getTeamImageUrl(selectedTeam.teamImage)}
                                                        alt={selectedTeam.teamName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedTeam.teamName)}&background=ea580c&color=fff`; }}
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-200 uppercase font-black text-4xl bg-orange-600">
                                                        {selectedTeam.teamName.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="pb-4">
                                                <h2 className="text-3xl font-black text-white drop-shadow-lg">{selectedTeam.teamName}</h2>
                                                <p className="flex items-center gap-2 text-slate-200/80 font-medium">
                                                    <Layers className="w-4 h-4" />
                                                    {selectedTeam.leagueName || 'Independent'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Team Actions & Summary */}
                                    <div className="mt-20 px-8 pb-8">
                                        <div className="flex flex-wrap items-center justify-between gap-6 mb-8 p-6 bg-[#0f172a]/50 rounded-2xl border border-slate-700">
                                            <div className="flex gap-8">
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Points</p>
                                                    <p className="text-2xl font-black text-white">{selectedTeam.pointsScored || 0}</p>
                                                </div>
                                                <div className="w-px h-10 bg-slate-700" />
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Matches</p>
                                                    <p className="text-2xl font-black text-white">{selectedTeam.totalMatchesPlayed || 0}</p>
                                                </div>
                                                <div className="w-px h-10 bg-slate-700" />
                                                <div className="text-center">
                                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Players</p>
                                                    <p className="text-2xl font-black text-white">{teamPlayers.length}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={(e) => {
                                                        const link = `${window.location.origin}/invite/team/${selectedTeam._id}`;
                                                        navigator.clipboard.writeText(link);
                                                        toast.success("Invite link copied to clipboard!");
                                                    }}
                                                    className="bg-orange-600 hover:bg-orange-700 text-white gap-2 rounded-xl h-11"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                    Share Team
                                                </Button>
                                                <Button
                                                    onClick={(e) => handleOpenDialog(e, selectedTeam)}
                                                    className="bg-slate-700 hover:bg-slate-600 text-white gap-2 rounded-xl h-11"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Edit Profile
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Contacts */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                            <div className="flex items-center gap-3 p-4 bg-[#0f172a]/30 rounded-xl border border-slate-700">
                                                <Mail className="w-5 h-5 text-orange-500" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-slate-500 uppercase font-bold">Official Email</p>
                                                    <p className="text-slate-200 truncate font-medium">{selectedTeam.teamEmail || 'Not provided'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 p-4 bg-[#0f172a]/30 rounded-xl border border-slate-700">
                                                <Calendar className="w-5 h-5 text-orange-500" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-slate-500 uppercase font-bold">Registered On</p>
                                                    <p className="text-slate-200 font-medium">{new Date(selectedTeam.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Players Table */}
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                    <Users className="w-5 h-5 text-orange-500" />
                                                    Player Roster
                                                </h3>
                                            </div>

                                            {isLoadingPlayers ? (
                                                <div className="py-12 flex justify-center">
                                                    <ImSpinner8 className="w-8 h-8 text-orange-500 animate-spin" />
                                                </div>
                                            ) : teamPlayers.length === 0 ? (
                                                <div className="py-10 text-center bg-[#0f172a]/30 rounded-xl border border-slate-700 border-dashed">
                                                    <p className="text-slate-500 font-medium">No players registered for this team.</p>
                                                </div>
                                            ) : (
                                                <div className="bg-[#0f172a]/50 rounded-2xl border border-slate-700 overflow-hidden">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow className="bg-slate-800/80 border-b border-slate-700">
                                                                <TableHead className="text-slate-300 font-bold">Player Name</TableHead>
                                                                <TableHead className="text-slate-300 font-bold">Role</TableHead>
                                                                <TableHead className="text-slate-300 font-bold">Position</TableHead>
                                                                <TableHead className="text-slate-300 font-bold text-right">Jersey</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {teamPlayers.map((player) => (
                                                                <TableRow
                                                                    key={player._id}
                                                                    className="hover:bg-slate-800/50 cursor-pointer transition-colors border-b border-slate-700 last:border-0"
                                                                    onClick={() => navigate(`/dashboard/playerProfile/${player._id}`)}
                                                                >
                                                                    <TableCell>
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs text-orange-500">
                                                                                {player.playerName.charAt(0)}
                                                                            </div>
                                                                            <span className="font-bold text-slate-200">{player.playerName}</span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${player.role === 'PLAYER' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                                                                            }`}>
                                                                            {player.role || 'PLAYER'}
                                                                        </span>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <span className="text-slate-400 text-sm font-medium">{player.position || '-'}</span>
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <span className="text-white font-black text-sm">#{player.jerseyNumber || '--'}</span>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ToastContainer position="top-center" />
        </>
    )
}

export default ViewTeams