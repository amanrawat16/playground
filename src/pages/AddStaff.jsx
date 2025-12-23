import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AddnewStaff, deleteStaff, getStaff } from '@/services/api';
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { ImSpinner3 } from 'react-icons/im';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { UserPlus, Users, Mail, Lock, User, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddStaff() {
    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm();
    const [isaddingStaff, setIsAddingStaff] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [staffData, setStaffData] = useState([]);
    const handleRegisterStaff = async (data) => {
        setIsAddingStaff(true);
        try {
            // Validate password length
            if (data?.password && data.password.length < 6) {
                toast.error("Password must be at least 6 characters long.");
                setIsAddingStaff(false);
                return;
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (data?.email && !emailRegex.test(data.email)) {
                toast.error("Please enter a valid email address.");
                setIsAddingStaff(false);
                return;
            }

            const response = await AddnewStaff(data)
            if (response.status === "SUCCESS") {
                toast.success("Staff added successfully!");
                reset()
                setShowPassword(false);
                await fetchStaffData()
                setShowDialog(false)
            }
        } catch (error) {
            console.error("Error adding staff:", error);

            // Extract error message from API response
            let errorMessage = "Error adding staff. Please try again.";

            if (error?.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setIsAddingStaff(false)
        }
    }

    const handleCloseDialog = () => {
        setShowDialog(false)
    }

    const fetchStaffData = async () => {
        try {
            const response = await getStaff()
            if (response.status === "SUCCESS") {
                setStaffData(response.staff)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleDeleteStaff = async (id) => {
        if (!window.confirm("Are you sure you want to delete this staff member?")) {
            return;
        }

        try {
            const response = await deleteStaff(id)
            if (response.status === "SUCCESS") {
                await fetchStaffData()
                toast.success("Staff deleted successfully")
            }
        } catch (error) {
            console.error("Error deleting staff:", error);

            let errorMessage = "Error deleting staff. Please try again.";
            if (error?.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            toast.error(errorMessage);
        }
    }


    useEffect(() => {
        fetchStaffData()
    }, [])

    return (
        <>
            <section className="min-h-screen bg-[#0f172a] py-6 sm:py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Manage Staff</h1>
                        <p className="text-slate-400">Add and manage staff members</p>
                    </div>

                    {/* Add Staff Button */}
                    <div className="mb-6 flex justify-end">
                        <Button
                            className="h-12 px-6 bg-orange-600 text-white hover:bg-orange-700 transition-all flex items-center gap-2"
                            onClick={() => setShowDialog(true)}
                        >
                            <UserPlus className="w-5 h-5" />
                            Add Staff
                        </Button>
                    </div>

                    {/* Staff List */}
                    <div className="bg-[#1e293b] rounded-xl shadow-lg border border-slate-700 overflow-hidden">
                        <div className="bg-orange-600 px-6 py-4 border-b border-orange-700">
                            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                                <Users className="w-6 h-6" />
                                Staff Members ({staffData.length})
                            </h2>
                        </div>

                        {staffData.length === 0 ? (
                            <div className="p-12 text-center">
                                <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                                <p className="text-slate-400 text-lg">No staff members yet</p>
                                <p className="text-slate-500 text-sm mt-2">Click "Add Staff" to get started</p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table View */}
                                <div className="hidden lg:block overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-[#0f172a] border-slate-700 hover:bg-[#0f172a]">
                                                <TableHead className="font-semibold text-slate-300">Name</TableHead>
                                                <TableHead className="font-semibold text-slate-300">Email</TableHead>
                                                <TableHead className="font-semibold text-right text-slate-300">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {staffData.map((staff) => (
                                                <TableRow key={staff._id} className="hover:bg-slate-800/50 border-slate-700">
                                                    <TableCell className="font-medium text-slate-200">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                                                                <User className="w-4 h-4 text-orange-500" />
                                                            </div>
                                                            {staff.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-slate-400">
                                                            <Mail className="w-4 h-4 text-slate-500" />
                                                            {staff.email}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDeleteStaff(staff._id)}
                                                            className="text-red-500 hover:text-red-400 hover:bg-red-900/20"
                                                        >
                                                            <MdDelete className="w-5 h-5" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Mobile Card View */}
                                <div className="lg:hidden divide-y divide-slate-700">
                                    {staffData.map((staff) => (
                                        <div key={staff._id} className="p-4 hover:bg-slate-800/50 transition-colors">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                                                            <User className="w-5 h-5 text-orange-500" />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-semibold text-white truncate">
                                                                {staff.name}
                                                            </p>
                                                            <p className="text-sm text-slate-400 flex items-center gap-1 mt-1">
                                                                <Mail className="w-3 h-3" />
                                                                <span className="truncate">{staff.email}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteStaff(staff._id)}
                                                    className="text-red-500 hover:text-red-400 hover:bg-red-900/20 flex-shrink-0"
                                                >
                                                    <MdDelete className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Add Staff Dialog */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="sm:max-w-md bg-[#1e293b] border-slate-700 text-slate-200">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <UserPlus className="w-6 h-6 text-orange-500" />
                            Add New Staff
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(handleRegisterStaff)} className="mt-4">
                        <div className="space-y-4">
                            {/* Name Field */}
                            <div>
                                <Label className="block text-sm font-semibold text-slate-300 mb-2">
                                    Name <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <Input
                                        className="w-full h-12 border-2 border-slate-700 bg-[#0f172a] text-slate-200 rounded-lg pl-10 pr-4 focus:border-orange-500 placeholder:text-slate-500"
                                        type="text"
                                        placeholder="Enter staff name"
                                        {...register(`name`, {
                                            required: {
                                                value: true,
                                                message: "Staff name is required",
                                            },
                                        })}
                                    />
                                </div>
                                <p className="text-red-500 text-xs mt-1">
                                    {errors?.name?.message}
                                </p>
                            </div>

                            {/* Email Field */}
                            <div>
                                <Label className="block text-sm font-semibold text-slate-300 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <Input
                                        className="w-full h-12 border-2 border-slate-700 bg-[#0f172a] text-slate-200 rounded-lg pl-10 pr-4 focus:border-orange-500 placeholder:text-slate-500"
                                        type="email"
                                        placeholder="Enter staff email"
                                        {...register(`email`, {
                                            required: {
                                                value: true,
                                                message: "Email is required",
                                            },
                                            pattern: {
                                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                message: "Please enter a valid email address",
                                            },
                                        })}
                                    />
                                </div>
                                <p className="text-red-500 text-xs mt-1">
                                    {errors?.email?.message}
                                </p>
                            </div>

                            {/* Password Field */}
                            <div>
                                <Label className="block text-sm font-semibold text-slate-300 mb-2">
                                    Password <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <Input
                                        className="w-full h-12 border-2 border-slate-700 bg-[#0f172a] text-slate-200 rounded-lg pl-10 pr-12 focus:border-orange-500 placeholder:text-slate-500"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter password (min. 6 characters)"
                                        {...register(`password`, {
                                            required: {
                                                value: true,
                                                message: "Password is required",
                                            },
                                            minLength: {
                                                value: 6,
                                                message: "Password must be at least 6 characters long",
                                            },
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <IoEyeOff className="w-5 h-5" />
                                        ) : (
                                            <IoEye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                <p className="text-red-500 text-xs mt-1">
                                    {errors?.password?.message}
                                </p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6 flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                                onClick={() => {
                                    setShowDialog(false);
                                    reset();
                                    setShowPassword(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isaddingStaff}
                                className="flex-1 h-12 bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-all"
                            >
                                {isaddingStaff ? (
                                    <>
                                        <ImSpinner3 className="h-5 w-5 mr-2 animate-spin inline" />
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5 mr-2 inline" />
                                        Add Staff
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <ToastContainer position="bottom-right" autoClose={3000} />
        </>
    )
}

export default AddStaff