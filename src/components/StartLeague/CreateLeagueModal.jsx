import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImSpinner3, ImCross } from "react-icons/im";
import { Plus, X } from "lucide-react";
import { createLeague, getAllCategories, createCategory } from "../../services/api"; // Ensure createCategory is exported
import { toast } from 'react-toastify';

export default function CreateLeagueModal({ onLeagueCreated }) {
    const [isOpen, setIsOpen] = useState(false);
    const [leagueName, setLeagueName] = useState("");
    const [matchesInRegularRound, setMatchesInRegularRound] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]); // Array of IDs
    const [allCategories, setAllCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Add Category Modal State
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        try {
            const response = await getAllCategories();
            if (response && response.categories) {
                setAllCategories(response.categories);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
            toast.error("Failed to load categories");
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.error("Category name is required");
            return;
        }
        try {
            const response = await createCategory(newCategoryName);
            if (response.status === "SUCCESS") {
                toast.success("Category created");
                setNewCategoryName("");
                setIsCategoryModalOpen(false);
                fetchCategories();
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.error || "Failed to create category");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!leagueName || !matchesInRegularRound || selectedCategories.length === 0) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSubmitting(true);
        try {
            // categories expects array of ObjectIds. 
            // API in controller expects `req.body` to match model?
            // Controller: `const league = new League(req.body);`
            // Model: `categories: [{ type: ObjectId ... }]`
            // So we pass `categories: [id1, id2]`

            const payload = {
                leagueName,
                matchesInRegularRound,
                categories: selectedCategories
            };

            const response = await createLeague(payload);
            if (response.status === "SUCCESS") {
                toast.success("League Created Successfully");
                setIsOpen(false);
                setLeagueName("");
                setMatchesInRegularRound("");
                setSelectedCategories([]);
                if (onLeagueCreated) onLeagueCreated();
            }
        } catch (error) {
            console.error("Error creating league:", error);
            toast.error(error?.response?.data?.error || "Failed to create league");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleCategory = (categoryId) => {
        setSelectedCategories(prev => {
            if (prev.includes(categoryId)) {
                return prev.filter(id => id !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create League
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg bg-[#1e293b] border-slate-700 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-white">Create New League</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Create a new league with multiple tournaments (categories).
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div>
                        <Label className="text-slate-200">League Name <span className="text-red-500">*</span></Label>
                        <Input
                            value={leagueName}
                            onChange={(e) => setLeagueName(e.target.value)}
                            placeholder="e.g. Summer Cup 2024"
                            className="mt-1 bg-[#0f172a] border-slate-700 text-slate-200 placeholder:text-slate-500"
                        />
                    </div>

                    <div>
                        <Label className="text-slate-200">Matches in Regular Round <span className="text-red-500">*</span></Label>
                        <Input
                            type="number"
                            value={matchesInRegularRound}
                            onChange={(e) => setMatchesInRegularRound(e.target.value)}
                            placeholder="e.g. 2"
                            className="mt-1 bg-[#0f172a] border-slate-700 text-slate-200 placeholder:text-slate-500"
                        />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label className="text-slate-200">Categories (Tournaments) <span className="text-red-500">*</span></Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsCategoryModalOpen(true)}
                                className="text-xs h-7 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                            >
                                <Plus className="w-3 h-3 mr-1" /> New Category
                            </Button>
                        </div>

                        <div className="border border-slate-700 rounded-md p-3 max-h-40 overflow-y-auto space-y-2 bg-[#0f172a]">
                            {allCategories.map(cat => (
                                <div key={cat._id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`cat-${cat._id}`}
                                        checked={selectedCategories.includes(cat._id)}
                                        onChange={() => toggleCategory(cat._id)}
                                        className="rounded border-slate-600 bg-slate-800 text-orange-600 focus:ring-orange-500 ring-offset-slate-900"
                                    />
                                    <label htmlFor={`cat-${cat._id}`} className="text-sm text-slate-300 cursor-pointer select-none">
                                        {cat.categoryName}
                                    </label>
                                </div>
                            ))}
                            {allCategories.length === 0 && (
                                <p className="text-xs text-slate-500 text-center py-2">No categories found. Create one?</p>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Select all categories (tournaments) applicable to this league.</p>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        {isSubmitting ? <ImSpinner3 className="animate-spin mr-2" /> : null}
                        Create League
                    </Button>
                </div>
            </DialogContent>

            {/* Nested/Separate Dialgo or simple overlay for Category */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-[#1e293b] p-6 rounded-lg shadow-xl w-80 border border-slate-700">
                        <h3 className="font-bold mb-4 text-white">Add Category</h3>
                        <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Category Name"
                            className="mb-4 bg-[#0f172a] border-slate-700 text-slate-200 placeholder:text-slate-500"
                        />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsCategoryModalOpen(false)} className="text-slate-400 hover:text-white hover:bg-slate-700">Cancel</Button>
                            <Button onClick={handleCreateCategory} className="bg-orange-600 hover:bg-orange-700 text-white">Save</Button>
                        </div>
                    </div>
                </div>
            )}
        </Dialog>
    );
}
