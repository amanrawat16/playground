import React, { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateLeague, deleteLeague, getAllCategories, createCategory } from '../../../services/api';
import { toast } from 'react-toastify';
import { Loader2, Search, X, ChevronDown, Plus, CheckCircle2, Trophy } from 'lucide-react';

const EditLeagueModal = ({ isOpen, onClose, league, onUpdate }) => {
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    // Category Management State
    const [allCategories, setAllCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [categorySearch, setCategorySearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (league) {
            // Reset form with league data when modal opens
            reset({
                leagueName: league.leagueName,
                matchesInRegularRound: league.matchesInRegularRound
            });

            // Set initial categories (handling both objects and IDs)
            if (league.categories) {
                const initialCats = league.categories.map(cat =>
                    typeof cat === 'object' ? cat._id : cat
                );
                setSelectedCategories(initialCats);
            } else {
                setSelectedCategories([]);
            }
        }
    }, [league, reset, isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const response = await getAllCategories();
            if (response.status === 'SUCCESS') {
                setAllCategories(response.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!categorySearch.trim()) return;

        setCreatingCategory(true);
        try {
            const response = await createCategory(categorySearch.trim());
            if (response.status === 'SUCCESS') {
                toast.success('Category created successfully');
                const newCat = response.category;
                setAllCategories(prev => [...prev, newCat]);
                handleCategorySelect(newCat._id);
            }
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error(error.response?.data?.error || 'Failed to create category');
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleCategorySelect = (categoryId) => {
        if (!selectedCategories.includes(categoryId)) {
            setSelectedCategories(prev => [...prev, categoryId]);
        }
        setCategorySearch('');
        setIsDropdownOpen(false);
    };

    const handleRemoveCategory = (categoryId) => {
        setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    };

    const handleDelete = async () => {
        if (!league?._id) return;

        if (window.confirm("Are you sure you want to delete this league? This action cannot be undone.")) {
            try {
                await deleteLeague(league._id);
                toast.success("League deleted successfully!");
                onUpdate();
                onClose();
            } catch (error) {
                console.error("Error deleting league:", error);
                toast.error(error?.response?.data?.message || "Error deleting league");
            }
        }
    };

    const onSubmit = async (data) => {
        try {
            if (!league?._id) return;

            if (selectedCategories.length === 0) {
                toast.error('Please select at least one category');
                return;
            }

            const payload = {
                leagueName: data.leagueName,
                matchesInRegularRound: Number(data.matchesInRegularRound),
                categories: selectedCategories
            };

            const response = await updateLeague(league._id, payload);

            if (response && response.status === 'SUCCESS') {
                toast.success("League updated successfully!");
                onUpdate(); // Refresh parent list
                onClose();
            } else {
                toast.error(response?.message || "Failed to update league");
            }

        } catch (error) {
            console.error("Error updating league:", error);
            toast.error(error?.response?.data?.message || "Error updating league");
        }
    };

    const filteredCategories = allCategories.filter(cat =>
        cat.categoryName.toLowerCase().includes(categorySearch.toLowerCase()) &&
        !selectedCategories.includes(cat._id)
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-[#1e293b] border-slate-700 text-white sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-orange-500" />
                        Edit League
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
                    {/* League Name */}
                    <div className="space-y-2">
                        <Label htmlFor="leagueName" className="text-slate-300">League Name</Label>
                        <Input
                            id="leagueName"
                            className="bg-[#0f172a] border-slate-600 text-white h-11"
                            {...register('leagueName', { required: 'League Name is required' })}
                        />
                        {errors.leagueName && <p className="text-red-400 text-xs">{errors.leagueName.message}</p>}
                    </div>

                    {/* Matches in Regular Round */}
                    <div className="space-y-2">
                        <Label htmlFor="matchesInRegularRound" className="text-slate-300">Matches in Regular Round</Label>
                        <Input
                            id="matchesInRegularRound"
                            type="number"
                            min="1"
                            className="bg-[#0f172a] border-slate-600 text-white h-11"
                            {...register('matchesInRegularRound', { required: 'This field is required' })}
                        />
                        {errors.matchesInRegularRound && <p className="text-red-400 text-xs">{errors.matchesInRegularRound.message}</p>}
                    </div>

                    {/* Categories Management */}
                    <div className="space-y-3" ref={dropdownRef}>
                        <Label className="text-slate-300">League Categories</Label>

                        {/* Selected Categories Chips */}
                        <div className="flex flex-wrap gap-2 mb-2">
                            {selectedCategories.map(catId => {
                                const cat = allCategories.find(c => c._id === catId);
                                if (!cat) return null;
                                return (
                                    <span key={catId} className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-semibold">
                                        {cat.categoryName}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCategory(catId)}
                                            className="hover:text-white transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </span>
                                );
                            })}
                            {selectedCategories.length === 0 && (
                                <p className="text-xs text-slate-500 italic">No categories selected.</p>
                            )}
                        </div>

                        {/* Searchable Dropdown */}
                        <div className="relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    placeholder="Search or add category..."
                                    value={categorySearch}
                                    onChange={(e) => {
                                        setCategorySearch(e.target.value);
                                        setIsDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsDropdownOpen(true)}
                                    className="bg-[#0f172a] border-slate-600 text-white pl-10 h-11"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {/* Dropdown Results */}
                            {isDropdownOpen && (
                                <div className="absolute mt-1 w-full bg-[#1e293b] border border-slate-700 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto custom-scrollbar">
                                    {loadingCategories ? (
                                        <div className="p-4 text-center">
                                            <Loader2 className="w-5 h-5 animate-spin text-orange-500 mx-auto" />
                                        </div>
                                    ) : (
                                        <>
                                            {filteredCategories.length > 0 ? (
                                                filteredCategories.map(cat => (
                                                    <button
                                                        key={cat._id}
                                                        type="button"
                                                        onClick={() => handleCategorySelect(cat._id)}
                                                        className="w-full text-left px-4 py-3 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-between group transition-colors"
                                                    >
                                                        <span>{cat.categoryName}</span>
                                                        <CheckCircle2 className="w-4 h-4 text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                ))
                                            ) : (
                                                categorySearch && (
                                                    <div className="p-2">
                                                        <button
                                                            type="button"
                                                            onClick={handleCreateCategory}
                                                            disabled={creatingCategory}
                                                            className="w-full px-4 py-3 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 text-orange-400 rounded-lg flex items-center justify-center gap-2 transition-all"
                                                        >
                                                            {creatingCategory ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Plus className="w-4 h-4" />
                                                            )}
                                                            Create "{categorySearch}"
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                            {filteredCategories.length === 0 && !categorySearch && (
                                                <div className="px-4 py-4 text-sm text-slate-500 text-center">
                                                    No more categories found.
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="pt-6 flex justify-between sm:justify-between w-full">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="bg-red-600 hover:bg-red-700 text-white px-6"
                        >
                            Delete League
                        </Button>

                        <div className="flex gap-3">
                            <Button type="button" variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-700">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 min-w-[120px]">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
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

export default EditLeagueModal;
