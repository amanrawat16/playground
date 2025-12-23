import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateCompClub, deleteCompClub, baseURL } from '../../../services/api';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

const EditClubModal = ({ isOpen, onClose, club, onUpdate }) => {
    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        if (club) {
            reset({
                clubName: club.clubName,
                adminEmail: club.adminEmail,
            });

            // Set initial image preview
            if (club.clubImage) {
                // Handle legacy image paths vs full URLs if needed, assuming API returns relative path or filename
                const imageUrl = club.clubImage.startsWith('http')
                    ? club.clubImage
                    : `${baseURL}/uploads/${club.clubImage}`;
                setImagePreview(imageUrl);
            } else {
                setImagePreview(null);
            }
        }
    }, [club, reset, isOpen]);

    const handleDelete = async () => {
        if (!club?._id) return;

        if (window.confirm("Are you sure you want to delete this Club? This action cannot be undone and might affect associated teams.")) {
            try {
                await deleteCompClub(club._id);
                toast.success("Club deleted successfully!");
                onUpdate();
                onClose();
            } catch (error) {
                console.error("Error deleting club:", error);
                toast.error(error?.response?.data?.message || "Error deleting club");
            }
        }
    };


    // Watch for new image file selection
    const watchedImage = watch("clubImage");
    useEffect(() => {
        if (watchedImage && watchedImage.length > 0) {
            const file = watchedImage[0];
            setImagePreview(URL.createObjectURL(file));
        }
    }, [watchedImage]);

    const onSubmit = async (data) => {
        try {
            if (!club?._id) return;

            const formData = new FormData();
            formData.append('clubName', data.clubName);
            formData.append('adminEmail', data.adminEmail);

            if (data.clubImage && data.clubImage.length > 0) {
                formData.append('clubImage', data.clubImage[0]);
            }

            await updateCompClub(club._id, formData);
            toast.success("Club updated successfully!");
            onUpdate();
            onClose();

        } catch (error) {
            console.error("Error updating club:", error);
            toast.error(error?.response?.data?.message || "Error updating club");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            {/* Helper to ensure Dialog content scrolls if tall */}
            <DialogContent className="bg-[#1e293b] border-slate-700 text-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Edit Club</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    {/* Image Preview & Upload */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-800 border-2 border-slate-600">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Club Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No Image</div>
                            )}
                        </div>
                        <div className="w-full">
                            <Label htmlFor="clubImage" className="text-slate-300 mb-2 block">Change Logo</Label>
                            <Input
                                id="clubImage"
                                type="file"
                                accept="image/*"
                                className="bg-[#0f172a] border-slate-600 text-white cursor-pointer"
                                {...register('clubImage')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="clubName" className="text-slate-300">Club Name</Label>
                        <Input
                            id="clubName"
                            className="bg-[#0f172a] border-slate-600 text-white"
                            {...register('clubName', { required: 'Club Name is required' })}
                        />
                        {errors.clubName && <p className="text-red-400 text-xs">{errors.clubName.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adminEmail" className="text-slate-300">Admin Email</Label>
                        <Input
                            id="adminEmail"
                            type="email"
                            className="bg-[#0f172a] border-slate-600 text-white"
                            {...register('adminEmail', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Invalid email format"
                                }
                            })}
                        />
                        {errors.adminEmail && <p className="text-red-400 text-xs">{errors.adminEmail.message}</p>}
                    </div>

                    <DialogFooter className="pt-4 flex justify-between sm:justify-between w-full">
                        {/* Delete Button */}
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete Club
                        </Button>

                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Updating...
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

export default EditClubModal;
