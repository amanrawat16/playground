import AntDTable from '@/components/AntDTable/AntDTable';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AddnewStaff, deleteStaff, getStaff } from '@/services/api';
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { FaEdit, FaPlus } from 'react-icons/fa';
import { ImSpinner3 } from 'react-icons/im';
import { IoEye, IoEyeOff } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { toast } from 'react-toastify';

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
            const response = await AddnewStaff(data)
            if (response.status === "SUCCESS") {
                reset()
                await fetchStaffData()
                setShowDialog(false)
            }
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.error)
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
        try {
            const response = await deleteStaff(id)
            if (response.status === "SUCCESS") {
                await fetchStaffData()
                toast.success("Staff deleted successfully")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
            render: (text) => <span>{text}</span>,
        },
        {
            title: 'Email',
            align: 'center',
            dataIndex: 'email',
            key: 'email',
            render: (text) => <span>{text}</span>,
        },
        {
            title: '',
            key: '',
            align: 'center',
            render: (_, record) => (
                <span>
                    <Button
                        className=''
                        variant="danger"
                        onClick={() => {
                            handleDeleteStaff(record._id)
                        }}
                    >
                        <MdDelete className="text-orange-600 w-6 h-6" />
                    </Button>
                </span>
            ),
        },
    ]

    useEffect(() => {
        fetchStaffData()
    }, [])
    return (
        <div className='w-full'>
            <Dialog open={showDialog}>
                <DialogContent onClick={handleCloseDialog}>
                    <form
                        className="w-full max-w-lg mt-5"
                        onSubmit={handleSubmit(handleRegisterStaff)}
                    >
                        {/* Player Fields */}
                        <div className="mb-6">
                            <div className="flex flex-wrap -mx-3 mb-10">
                                <div className="w-full  px-3">
                                    <label className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2">
                                        Name
                                    </label>
                                    <Input
                                        className="appearance-none block w-full h-12 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        type="text"
                                        placeholder="Enter staff name"
                                        {...register(`name`, {
                                            required: {
                                                value: true,
                                                message: "Staff name is required",
                                            },
                                        })}
                                    />
                                    <p className="text-red-500 text-xs italic">
                                        {errors?.name?.message}
                                    </p>
                                </div>

                                <div className="w-full  px-3">
                                    <label className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2">
                                        Email
                                    </label>
                                    <Input
                                        className="appearance-none block w-full h-12 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                        type="text"
                                        placeholder="Enter staff email address"
                                        {...register(`email`, {
                                            required: {
                                                value: true,
                                                message: "staff email is required",
                                            },
                                        })}
                                    />
                                    <p className="text-red-500 text-xs italic">
                                        {errors?.email?.message}
                                    </p>
                                </div>

                                <div className="w-full md:w-full px-3">
                                    <label className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2">
                                        password
                                    </label>
                                    <div className='relative'>
                                        <Input
                                            className="appearance-none block w-full h-12   text-gray-700  border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter password"
                                            {...register(`password`, {
                                                required: {
                                                    value: true,
                                                    message: "password is required",
                                                },
                                            })}
                                        />
                                        <div className=" h-12 w-12 absolute top-0 right-0 flex items-center justify-center">
                                            <>
                                                {!showPassword ? <IoEye className="cursor-pointer w-5 h-5" onClick={() => setShowPassword(!showPassword)} /> : <IoEyeOff className="cursor-pointer w-5 h-5" onClick={() => setShowPassword(!showPassword)} />}
                                            </>
                                        </div>
                                    </div>
                                    <p className="text-red-500 text-xs italic">
                                        {errors?.password?.message}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="submit_button mb-5">
                            <Button
                                type="submit"
                                className="px-2 py-3 bg-orange-600 h-12 text-white rounded-md w-full"
                                disabled={isaddingStaff}
                            >
                                {isaddingStaff ?
                                    <>
                                        Adding Staff <ImSpinner3 className="w-4 h-4 animate-spin ml-2" />
                                    </>
                                    :
                                    "Add Staff"
                                }
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
            <div className='mx-auto w-2/3'>
                <h1 className='text-center text-3xl text-orange-600 font-semibold my-10'>Add Staff</h1>
                <div className='my-2 flex justify-end'>
                    <Button
                        className=" py-3 bg-orange-600 h-12 text-white rounded-md px-5 flex items-center"
                        onClick={() => setShowDialog(true)}
                    >Add Staff <FaPlus className='w-3 h-3 ml-2' /></Button>
                </div>
                <AntDTable columns={columns} data={staffData} />
            </div>
        </div>
    )
}

export default AddStaff