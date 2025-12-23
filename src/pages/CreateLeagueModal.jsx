import { useState, useEffect, useRef } from 'react';
import { X, Plus, Loader, Trophy, CheckCircle2, ChevronDown, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateLeagueModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        leagueName: '',
        matchesInRegularRound: '1',
        categories: []
    });
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);

    // Category Dropdown State
    const [categorySearch, setCategorySearch] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [creatingCategory, setCreatingCategory] = useState(false);
    const dropdownRef = useRef(null);

    const API_BASE = import.meta.env.VITE_BACKEND_URL;

    // Fetch categories when modal opens
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
            const response = await axios.get(`${API_BASE}/api/comp/league/getCategories`, {
                headers: { 'api_key': 'THE123FIELD' }
            });
            if (response.data.status === 'SUCCESS') {
                setCategories(response.data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        } finally {
            setLoadingCategories(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!categorySearch.trim()) {
            return;
        }

        setCreatingCategory(true);
        try {
            const response = await axios.post(
                `${API_BASE}/api/comp/league/createCategory`,
                { name: categorySearch.trim() },
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success('Category created successfully');
                const newCat = response.data.category;

                // Add to local list and select it
                setCategories(prev => [...prev, newCat]);
                handleCategorySelect(newCat._id);
                setCategorySearch('');
            }
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error(error.response?.data?.error || 'Failed to create category');
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleCategorySelect = (categoryId) => {
        setFormData(prev => {
            if (prev.categories.includes(categoryId)) {
                return prev; // Already selected
            }
            return { ...prev, categories: [...prev.categories, categoryId] };
        });
        setCategorySearch('');
    };

    const handleRemoveCategory = (categoryId) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.filter(id => id !== categoryId)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.leagueName.trim()) {
            toast.error('Please enter a league name');
            return;
        }

        if (formData.categories.length === 0) {
            toast.error('Please select at least one category');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${API_BASE}/api/comp/league/createLeague`,
                formData,
                { headers: { 'api_key': 'THE123FIELD' } }
            );

            if (response.data.status === 'SUCCESS') {
                toast.success('League created successfully!');
                if (onSuccess) onSuccess(response.data.league);
                handleClose();
            }
        } catch (error) {
            console.error('Error creating league:', error);
            toast.error(error.response?.data?.error || 'Failed to create league');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            leagueName: '',
            matchesInRegularRound: '2',
            categories: []
        });
        setCategorySearch('');
        setIsDropdownOpen(false);
        onClose();
    };

    // Filter categories based on search
    const filteredCategories = categories.filter(cat =>
        cat.categoryName.toLowerCase().includes(categorySearch.toLowerCase()) &&
        !formData.categories.includes(cat._id) // Don't show already selected in dropdown
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-orange-500" />
                            Create New League
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            Set up a new league configuration
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* League Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            League Name *
                        </label>
                        <input
                            type="text"
                            value={formData.leagueName}
                            onChange={(e) => setFormData({ ...formData, leagueName: e.target.value })}
                            placeholder="e.g., Premier League"
                            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all focus:ring-2 focus:ring-orange-500/20"
                        />
                    </div>

                    {/* Categories (Searchable Dropdown) */}
                    <div ref={dropdownRef}>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Categories *
                        </label>

                        {/* Selected Chips */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {formData.categories.map(catId => {
                                const cat = categories.find(c => c._id === catId);
                                if (!cat) return null;
                                return (
                                    <span key={catId} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full text-sm font-medium">
                                        {cat.categoryName}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveCategory(catId)}
                                            className="hover:text-white transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                        </div>

                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder={formData.categories.length === 0 ? "Select or create categories..." : "Add more categories..."}
                                value={categorySearch}
                                onChange={(e) => {
                                    setCategorySearch(e.target.value);
                                    setIsDropdownOpen(true);
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all focus:ring-2 focus:ring-orange-500/20"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {loadingCategories ? (
                                    <Loader className="w-4 h-4 animate-spin text-orange-500" />
                                ) : (
                                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                )}
                            </div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto">
                                    {filteredCategories.length > 0 ? (
                                        filteredCategories.map(cat => (
                                            <button
                                                key={cat._id}
                                                type="button"
                                                onClick={() => handleCategorySelect(cat._id)}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-700/50 flex items-center justify-between group transition-colors"
                                            >
                                                <span className="text-slate-200 group-hover:text-white">{cat.categoryName}</span>
                                                <CheckCircle2 className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                                                        <Loader className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Plus className="w-4 h-4" />
                                                    )}
                                                    Create "{categorySearch}"
                                                </button>
                                            </div>
                                        )
                                    )}
                                    {filteredCategories.length === 0 && !categorySearch && (
                                        <div className="px-4 py-3 text-sm text-slate-500 text-center">
                                            Type to search or create
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="p-6 border-t border-slate-700 flex gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition-colors font-medium"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !formData.leagueName.trim() || formData.categories.length === 0}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader className="w-5 h-5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Trophy className="w-5 h-5" />
                                Create League
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateLeagueModal;
