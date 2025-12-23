import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAllLeagues, getTeamPlayers, getTeams, getAllTeams, PlayerDetailUpdate } from "../../services/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast, ToastContainer } from "react-toastify";
import { ImSpinner3 } from "react-icons/im";
import { User, Users, Mail, Hash, Target, Shield, Edit, Search, AlertCircle, Calendar } from "lucide-react";
import ReactLoader from "../../common/ReactLoader";
// ----------------------------------------------------------------


export const ViewPlayers = () => {
    const [selectedTeam, setSelectedTeam] = useState('')
    const [modifiedTeamList, setModifiedTeamList] = useState([])
    const [players, setPlayers] = useState([])
    const [tablePlayers, setTablePlayers] = useState([])
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [dialogData, setDialogData] = useState({
        id: "",
        team: "",
        name: "",
        role: '',
        emailId: '',
        position: '',
        jerseyNumber: "",
        dateofBirth: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingTeams, setIsLoadingTeams] = useState(true)


    const fetchAllTeams = async () => {
        try {
            setIsLoadingTeams(true);
            const response = await getAllTeams()
            if (response.status === "SUCCESS") {
                const modifiedList = response.data.map((team) => {
                    return {
                        label: team.teamName,
                        value: team._id
                    }
                })
                setModifiedTeamList(modifiedList)
            } else {
                setModifiedTeamList([])
            }
        } catch (error) {
            console.error("Error fetching teams:", error)
            toast.error("Failed to load teams. Please try again.");
            setModifiedTeamList([])
        } finally {
            setIsLoadingTeams(false)
        }
    }

    const handlefetchTeamPlayers = async (teamId) => {
        if (!teamId) {
            setPlayers([]);
            setTablePlayers([]);
            return true;
        }

        setIsLoading(true);
        setPlayers([]);
        setTablePlayers([]);
        setSearchText('');
        try {
            const response = await getTeamPlayers(teamId)
            if (response.status === 'SUCCESS') {
                setPlayers(response.data || [])
                setTablePlayers(response.data || [])
                return true;
            } else {
                setPlayers([]);
                setTablePlayers([]);
                return false;
            }
        } catch (error) {
            console.error("Error fetching players:", error)
            toast.error("Failed to load players. Please try again.");
            setPlayers([]);
            setTablePlayers([]);
            return false;
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = (e) => {
        const { value } = e.target;
        setSearchText(value);
        if (!value.trim()) {
            setTablePlayers(players);
            return;
        }
        const filteredPlayers = players.filter(player =>
            player.playerName?.toLowerCase().includes(value.toLowerCase()) ||
            player.email?.toLowerCase().includes(value.toLowerCase()) ||
            player.position?.toLowerCase().includes(value.toLowerCase()) ||
            player.role?.toLowerCase().includes(value.toLowerCase())
        );
        setTablePlayers(filteredPlayers);
    };

    const handleOpenDialog = (e, record) => {
        e.stopPropagation()
        setDialogData({
            ...dialogData,
            id: record._id,
            team: record.teamId,
            name: record.playerName,
            role: record.role,
            emailId: record.email,
            position: record.position,
            jerseyNumber: record.jerseyNumber,
            dateofBirth: record?.dateofBirth
        })
        setIsDialogOpen(true)
    }

    const handleDialogClose = () => {
        setIsDialogOpen(false)
        setDialogData({
            id: "",
            league: "",
            team: "",
            name: "",
            role: '',
            emailId: '',
            position: '',
            jerseyNumber: "",
            dateofBirth: ""
        })
    }

    const handleDialogDataChange = (e) => {
        const { name, value } = e.target;
        setDialogData({ ...dialogData, [name]: value })
    }


    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
            return dateString;
        }
    };

    const handleSubmitDialogData = async () => {
        // Client-side validation
        if (!dialogData.name || dialogData.name.trim() === "") {
            toast.error("Player name is required");
            return;
        }

        if (!dialogData.emailId || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dialogData.emailId)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsSubmitting(true)
        const formData = {
            playerName: dialogData.name.trim(),
            position: dialogData.position,
            email: dialogData.emailId.trim(),
            role: dialogData.role,
            jerseyNumber: dialogData.jerseyNumber
        }
        try {
            const response = await PlayerDetailUpdate(dialogData.id, formData)
            if (response.status === 'SUCCESS') {
                const refreshResponse = await handlefetchTeamPlayers(dialogData.team)
                if (refreshResponse) {
                    handleDialogClose()
                    toast.success("Player details updated successfully")
                }
            }
        } catch (error) {
            console.error("Error updating player:", error)
            const errorMessage = error?.response?.data?.error ||
                error?.response?.data?.message ||
                "Failed to update player. Please try again.";
            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRoleValueChange = (e) => {
        setDialogData({ ...dialogData, role: e })
    }

    const handlePositionChange = (e) => {
        setDialogData({ ...dialogData, position: e })
    }

    // const handleSearchPlayer = (e) => {
    //     let value = e.target.value;
    //     value = value.trim();
    //     if (value === '') {
    //         return;
    //     }
    //     const filteredPlayers = players.filter((player) => player.playerName.toLowerCase().includes(e.target.value.toLowerCase()))
    //     setTablePlayers(filteredPlayers)
    // }

    useEffect(() => {
        fetchAllTeams()
    }, [])


    return (
        <>
            {/* Edit Player Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg bg-[#1e293b] border-slate-700 text-slate-200" onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl text-white">
                            <Edit className="w-5 h-5 text-orange-600" />
                            Edit Player Information
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Update player details and information
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-5 py-4 max-h-[70vh] overflow-y-auto">
                        {/* Player Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                                <User className="w-4 h-4 text-orange-600" />
                                Player Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={dialogData.name}
                                name="name"
                                onChange={handleDialogDataChange}
                                placeholder="Enter player name"
                                className="h-11 border border-slate-600 bg-[#0f172a] text-slate-200 focus:border-orange-500"
                            />
                        </div>

                        {/* Role */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                                <Shield className="w-4 h-4 text-orange-600" />
                                Role <span className="text-red-500">*</span>
                            </Label>
                            <Select value={dialogData.role} onValueChange={handleRoleValueChange}>
                                <SelectTrigger className="w-full h-11 border border-slate-600 bg-[#0f172a] text-slate-200 focus:border-orange-500">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                                    <SelectItem value="PLAYER" className="focus:bg-slate-700 focus:text-white">Player</SelectItem>
                                    <SelectItem value="STAFF" className="focus:bg-slate-700 focus:text-white">Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="emailId" className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                                <Mail className="w-4 h-4 text-orange-600" />
                                Email Address <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="emailId"
                                type="email"
                                value={dialogData.emailId}
                                name="emailId"
                                onChange={handleDialogDataChange}
                                placeholder="Enter email address"
                                className="h-11 border border-slate-600 bg-[#0f172a] text-slate-200 focus:border-orange-500"
                            />
                        </div>

                        {/* Position */}
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                                <Target className="w-4 h-4 text-orange-600" />
                                Position <span className="text-red-500">*</span>
                            </Label>
                            <Select value={dialogData.position} onValueChange={handlePositionChange}>
                                <SelectTrigger className="w-full h-11 border border-slate-600 bg-[#0f172a] text-slate-200 focus:border-orange-500">
                                    <SelectValue placeholder="Select position" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                                    <SelectItem value="Quarterback" className="focus:bg-slate-700 focus:text-white">Quarterback</SelectItem>
                                    <SelectItem value="Rusher" className="focus:bg-slate-700 focus:text-white">Rusher</SelectItem>
                                    <SelectItem value="Offensive Player" className="focus:bg-slate-700 focus:text-white">Offensive Player</SelectItem>
                                    <SelectItem value="Defensive Player" className="focus:bg-slate-700 focus:text-white">Defensive Player</SelectItem>
                                    <SelectItem value="None" className="focus:bg-slate-700 focus:text-white">None</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Jersey Number */}
                        <div className="space-y-2">
                            <Label htmlFor="jerseyNumber" className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                                <Hash className="w-4 h-4 text-orange-600" />
                                Jersey Number
                            </Label>
                            <Input
                                id="jerseyNumber"
                                type="number"
                                value={dialogData.jerseyNumber}
                                name="jerseyNumber"
                                onChange={handleDialogDataChange}
                                placeholder="Enter jersey number"
                                min={1}
                                className="h-11 border border-slate-600 bg-[#0f172a] text-slate-200 focus:border-orange-500"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                                onClick={handleDialogClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                                disabled={isSubmitting}
                                onClick={handleSubmitDialogData}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center gap-2 justify-center">
                                        <ImSpinner3 className="w-4 h-4 animate-spin" />
                                        Updating...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2 justify-center">
                                        <Edit className="w-4 h-4" />
                                        Update Player
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
                    <div className="mb-6 sm:mb-8">
                        <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-900/20 rounded-lg">
                                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-bold text-white">View Players</h1>
                                        <p className="text-sm text-slate-400 mt-1">View and manage team players</p>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                {selectedTeam && tablePlayers.length > 0 && (
                                    <div className="flex-shrink-0 w-full sm:w-64">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <Input
                                                placeholder="Search players..."
                                                value={searchText}
                                                onChange={handleSearch}
                                                className="pl-10 h-11 border border-slate-600 bg-[#0f172a] text-slate-200 focus:border-orange-500"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Team Selector */}
                    <div className="mb-6 sm:mb-8">
                        <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 p-4 sm:p-6">
                            <div className="space-y-4">
                                <Label className="text-sm font-semibold text-slate-300 block mb-4">
                                    Select a team to view players
                                </Label>
                                <div className="max-w-md">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-400">Team</Label>
                                        {isLoadingTeams ? (
                                            <div className="h-11 border border-slate-600 bg-[#0f172a] rounded-md flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                                            </div>
                                        ) : (
                                            <Select
                                                onValueChange={(val) => {
                                                    setSelectedTeam(val)
                                                    setDialogData({ ...dialogData, team: val })
                                                    handlefetchTeamPlayers(val)
                                                }}
                                                value={selectedTeam}
                                            >
                                                <SelectTrigger className="w-full h-11 border border-slate-600 bg-[#0f172a] text-slate-200 focus:border-orange-500">
                                                    <SelectValue placeholder="Select a team" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                                                    <SelectGroup>
                                                        <SelectLabel className="text-slate-400">Teams</SelectLabel>
                                                        {modifiedTeamList.length > 0 ? (
                                                            modifiedTeamList.map((team) => (
                                                                <SelectItem value={team.value} key={team.value} className="focus:bg-slate-700 focus:text-white">
                                                                    {team.label}
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <SelectItem value="none" disabled>No teams available</SelectItem>
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex items-center justify-center min-h-[400px]">
                            <ReactLoader />
                        </div>
                    )}

                    {/* Empty State - No Selection */}
                    {!isLoading && !selectedTeam && (
                        <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 p-12 text-center">
                            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 text-lg">
                                {"Please select a team to view players"}
                            </p>
                        </div>
                    )}

                    {/* Empty State - No Players */}
                    {!isLoading && selectedTeam && tablePlayers.length === 0 && !isLoadingTeams && (
                        <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 p-12 text-center">
                            <div className="max-w-md mx-auto">
                                <div className="w-20 h-20 rounded-full bg-orange-900/20 flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle className="w-10 h-10 text-orange-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {searchText ? "No Players Found" : "No Players Available"}
                                </h3>
                                <p className="text-slate-400">
                                    {searchText
                                        ? "No players match your search criteria. Try a different search term."
                                        : "This team doesn't have any players registered yet."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Players Table - Desktop */}
                    {!isLoading && selectedTeam && tablePlayers.length > 0 && (
                        <>
                            <div className="hidden lg:block bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-orange-600 to-orange-500 hover:bg-orange-600 border-b border-orange-600">
                                            <TableHead className="text-white font-bold">Name</TableHead>
                                            <TableHead className="text-white font-bold">Role</TableHead>
                                            <TableHead className="text-white font-bold">Email</TableHead>
                                            <TableHead className="text-white font-bold">Position</TableHead>
                                            <TableHead className="text-white font-bold text-center">Jersey #</TableHead>
                                            <TableHead className="text-white font-bold text-center">Date of Birth</TableHead>
                                            <TableHead className="text-white font-bold text-center w-20">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tablePlayers.map((player) => (
                                            <TableRow
                                                key={player._id}
                                                className="hover:bg-slate-700/50 transition-colors cursor-pointer border-b border-slate-700"
                                                onClick={() => navigate(`/dashboard/playerProfile/${player._id}`)}
                                            >
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                                                            <User className="w-6 h-6 text-orange-500" />
                                                        </div>
                                                        <span className="font-semibold text-white">{player.playerName || "Unknown"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${player.role === "PLAYER"
                                                        ? "bg-blue-900/30 text-blue-400"
                                                        : "bg-purple-900/30 text-purple-400"
                                                        }`}>
                                                        {player.role || "N/A"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-slate-500" />
                                                        <span className="text-slate-300 text-sm">{player.email || "N/A"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Target className="w-4 h-4 text-slate-500" />
                                                        <span className="text-slate-300">{player.position || "N/A"}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {player.jerseyNumber ? (
                                                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-700 text-slate-200 font-semibold text-sm">
                                                            <Hash className="w-3 h-3 mr-1" />
                                                            {player.jerseyNumber}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center text-sm text-slate-400">
                                                    {formatDate(player.dateofBirth)}
                                                </TableCell>
                                                <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={(e) => handleOpenDialog(e, player)}
                                                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                                                        aria-label="Edit player"
                                                    >
                                                        <Edit className="w-5 h-5 text-orange-500" />
                                                    </button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Players Cards - Mobile */}
                            <div className="lg:hidden space-y-4">
                                {tablePlayers.map((player) => (
                                    <div
                                        key={player._id}
                                        className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 p-4 overflow-hidden"
                                        onClick={() => navigate(`/dashboard/playerProfile/${player._id}`)}
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            {/* Player Avatar */}
                                            <div className="w-16 h-16 rounded-full bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                                                <User className="w-8 h-8 text-orange-500" />
                                            </div>

                                            {/* Player Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-2">
                                                    <h3 className="font-bold text-white text-lg truncate">
                                                        {player.playerName || "Unknown Player"}
                                                    </h3>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenDialog(e, player);
                                                        }}
                                                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                                                        aria-label="Edit player"
                                                    >
                                                        <Edit className="w-5 h-5 text-orange-500" />
                                                    </button>
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Shield className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${player.role === "PLAYER"
                                                            ? "bg-blue-900/30 text-blue-400"
                                                            : "bg-purple-900/30 text-purple-400"
                                                            }`}>
                                                            {player.role || "N/A"}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                                        <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                                        <span className="truncate">{player.email || "N/A"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="pt-4 border-t border-slate-700 space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Target className="w-4 h-4" />
                                                    Position
                                                </div>
                                                <div className="font-semibold text-white">{player.position || "N/A"}</div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Hash className="w-4 h-4" />
                                                    Jersey #
                                                </div>
                                                <div className="font-semibold text-white">{player.jerseyNumber || "N/A"}</div>
                                            </div>
                                            {player.dateofBirth && (
                                                <div className="flex items-center justify-between text-sm">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Calendar className="w-4 h-4" />
                                                        Date of Birth
                                                    </div>
                                                    <div className="font-semibold text-white">{formatDate(player.dateofBirth)}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ToastContainer position="top-center" />
        </>
    )
}
