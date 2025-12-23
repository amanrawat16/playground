import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChangeTeamImage, updateTeamInfo, getTeamById, updateTeam, deleteTeam, deleteCompPlayer, baseURL } from '../../../services/api';
import { toast } from 'react-toastify';
import { Loader2, Trash2, Plus, User, Edit } from 'lucide-react';

const EditTeamModal = ({ isOpen, onClose, team, onUpdate }) => {
    const { register, handleSubmit, reset, watch, control, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            teamName: '',
            players: []
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "players"
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [existingPlayers, setExistingPlayers] = useState([]);

    useEffect(() => {
        if (team && isOpen) {
            fetchTeamDetails();
            reset({
                teamName: team.teamName,
            });

            // Set initial image preview
            if (team.teamImage) {
                const imageUrl = team.teamImage.startsWith('http')
                    ? team.teamImage
                    : `${baseURL}/uploads/${team.teamImage}`;
                setImagePreview(imageUrl);
            } else {
                setImagePreview(null);
            }
        }
    }, [team, isOpen]);

    const fetchTeamDetails = async () => {
        if (!team?._id) return;
        setLoadingDetails(true);
        try {
            const response = await getTeamById(team._id);

            let playersData = [];

            if (response?.data?.players) {
                // { status: "SUCCESS", data: { players: [] } }
                playersData = response.data.players;
            } else if (response?.data?.data?.players) {
                // double wrap scenario
                playersData = response.data.data.players;
            } else if (response?.team?.players) {
                // legacy structure
                playersData = response.team.players;
            } else if (response?.players) {
                // unwrapped
                playersData = response.players;
            }

            setExistingPlayers(playersData || []);

        } catch (error) {
            console.error("Error fetching team details:", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    // Watch for new image file selection
    const watchedImage = watch("teamImage");
    useEffect(() => {
        if (watchedImage && watchedImage.length > 0) {
            const file = watchedImage[0];
            setImagePreview(URL.createObjectURL(file));
        }
    }, [watchedImage]);

    const handleDeleteTeam = async () => {
        if (!team?._id) return;
        if (window.confirm("Are you sure you want to delete this Team? This action cannot be undone.")) {
            try {
                await deleteTeam(team._id);
                toast.success("Team deleted successfully!");
                onUpdate();
                onClose();
            } catch (error) {
                console.error("Error deleting team:", error);
                toast.error(error?.response?.data?.message || "Error deleting team");
            }
        }
    };

    const onSubmit = async (data) => {
        try {
            if (!team?._id) return;

            // 1. Update basic info (Name)
            if (data.teamName !== team.teamName) {
                await updateTeamInfo(team._id, { teamName: data.teamName });
            }

            // 2. Update Image if selected
            if (data.teamImage && data.teamImage.length > 0) {
                const formData = new FormData();
                formData.append('teamImage', data.teamImage[0]);
                await ChangeTeamImage(team._id, formData);
            }

            // 3. Add New Players
            if (data.players && data.players.length > 0) {
                // Transform players to match backend expectation if needed
                // The updateTeam endpoint expects `players` array.
                // It usually APPENDS players.
                await updateTeam(team._id, { players: data.players });
            }

            toast.success("Team updated successfully!");
            onUpdate();
            onClose();

        } catch (error) {
            console.error("Error updating team:", error);
            toast.error(error?.response?.data?.message || "Error updating team");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1e293b] border-slate-700 text-white sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex justify-between items-center">
                        <span>Edit Team: {team?.teamName}</span>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {/* Top Section: Image & Name */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left: Image */}
                        <div className="col-span-1 flex flex-col items-center gap-4">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-600">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Team Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No Image</div>
                                )}
                            </div>
                            <div className="w-full">
                                <Label htmlFor="teamImage" className="text-slate-300 mb-2 block text-center text-xs">Change Logo</Label>
                                <Input
                                    id="teamImage"
                                    type="file"
                                    accept="image/*"
                                    className="bg-[#0f172a] border-slate-600 text-white cursor-pointer text-xs"
                                    {...register('teamImage')}
                                />
                            </div>
                        </div>

                        {/* Right: Team Info */}
                        <div className="col-span-2 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="teamName" className="text-slate-300">Team Name</Label>
                                <Input
                                    id="teamName"
                                    className="bg-[#0f172a] border-slate-600 text-white"
                                    {...register('teamName', { required: 'Team Name is required' })}
                                />
                                {errors.teamName && <p className="text-red-400 text-xs">{errors.teamName.message}</p>}
                            </div>

                            {/* Existing Players List */}
                            <div className="space-y-2">
                                <Label className="text-slate-300">Current Roster ({existingPlayers.length})</Label>
                                {loadingDetails ? (
                                    <div className="text-sm text-slate-500 flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" /> Loading players...
                                    </div>
                                ) : (
                                    <div className="bg-[#0f172a] rounded-lg border border-slate-700 p-2 max-h-60 overflow-y-auto space-y-2">
                                        {existingPlayers.length === 0 ? (
                                            <p className="text-xs text-slate-500 text-center py-2">No players assigned.</p>
                                        ) : (
                                            existingPlayers.map((player) => (
                                                <div key={player._id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded hover:bg-slate-800 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0">
                                                            <User className="w-4 h-4 text-slate-400" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-white truncate">{player.name || player.playerName || player.email}</p>
                                                            <div className="flex gap-2 text-xs text-slate-400">
                                                                <span>{player.position || 'Player'}</span>
                                                                <span>•</span>
                                                                <span>#{player.jerseyNumber || '00'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {/* Future: Edit Button */}
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-slate-400 hover:text-white"
                                                            onClick={async () => {
                                                                // Quick delete handler inline for now to avoid massive diff
                                                                if (window.confirm(`Remove ${player.name || 'player'} from team? This will delete the player.`)) {
                                                                    try {
                                                                        await deleteCompPlayer(player._id);
                                                                        toast.success("Player removed!");
                                                                        fetchTeamDetails(); // Refresh list
                                                                    } catch (e) {
                                                                        console.error(e);
                                                                        toast.error("Failed to remove player");
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Add New Players Section */}
                    <div className="space-y-4 border-t border-slate-700 pt-4">
                        <div className="flex justify-between items-center">
                            <Label className="text-lg font-semibold text-white">Add New Players</Label>
                            <Button
                                type="button"
                                onClick={() => append({ name: '', email: '', position: 'Offensive Player', role: 'PLAYER', jerseyNumber: '', dateofBirth: '' })}
                                size="sm"
                                className="bg-slate-700 hover:bg-slate-600"
                            >
                                <Plus className="w-4 h-4 mr-1" /> Add Player
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700 items-start">
                                    <div className="col-span-3">
                                        <Input placeholder="Name" {...register(`players.${index}.name`, { required: true })} className="bg-slate-900 border-slate-600 h-8 text-xs" />
                                    </div>
                                    <div className="col-span-3">
                                        <Input placeholder="Email" {...register(`players.${index}.email`, { required: true })} className="bg-slate-900 border-slate-600 h-8 text-xs" />
                                    </div>
                                    <div className="col-span-2">
                                        <Input type="number" placeholder="#" {...register(`players.${index}.jerseyNumber`, { required: true })} className="bg-slate-900 border-slate-600 h-8 text-xs" />
                                    </div>
                                    <div className="col-span-3">
                                        <select {...register(`players.${index}.position`)} className="w-full bg-slate-900 border border-slate-600 rounded-md h-8 text-xs text-white px-2">
                                            <option value="Offensive Player">Offense</option>
                                            <option value="Defensive Player">Defense</option>
                                            <option value="Rusher">Rusher</option>
                                        </select>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-red-400 hover:text-red-300 h-8 w-8 p-0">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {/* Hidden fields for required backend structure if defaults needed */}
                                    <input type="hidden" {...register(`players.${index}.role`)} value="PLAYER" />
                                </div>
                            ))}
                            {fields.length === 0 && (
                                <p className="text-sm text-slate-500 italic">Click "Add Player" to add new members to the team.</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="pt-4 flex justify-between sm:justify-between w-full border-t border-slate-700 mt-6">
                        {/* Delete Button */}
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteTeam}
                            disabled={isSubmitting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Team
                        </Button>

                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {fields.length > 0 ? 'Update & Add Players' : 'Update Team'}
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditTeamModal;
