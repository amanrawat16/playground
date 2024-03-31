import { useRef } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createGroup } from "../../services/api";
import { toast } from 'react-toastify'
import { ImCross } from "react-icons/im";


function CreateGroups({ setCurrent, approvedTeams, fixtureId, handleAddGroups, setFixtureGroups, isCreateGroupsDisabled, setIsCreateGroupsDisabled }) {
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,

    } = useForm();
    const [groups, setGroups] = useState([])
    const groupInputRef = useRef(null)

    const handleCreateGroups = async (data) => {

        const { groupNumber } = data;
        if (+groupNumber !== groups.length) {
            return toast.error("Number of Groups should be same to entered value")
        }
        if (+groupNumber > approvedTeams?.length) {
            return toast.error("Group Number can not be greater than number of teams")
        }
        try {
            const response = await createGroup({ fixtureId, groups })
            if (response.status === "SUCCESS") {
                reset()
                setGroups([])
                toast.success(response.message)
                setFixtureGroups(response.data)
                handleAddGroups(response.leagueFixture.current)
                setIsCreateGroupsDisabled(true)
            }
        } catch (error) {
            toast.error("Error creating groups")
            console.error(error)
        }

    }

    const handleAddGroup = () => {
        const groupName = groupInputRef.current?.value?.trim();
        if (groupName) {
            // Check if the group name already exists
            const exists = groups.some(group => group.name === groupName);
            if (exists) {
                return toast.error("Group name already exists");
            }

            setGroups([...groups, { groupName }]);
            groupInputRef.current.value = '';

        }
    };


    const handledeleteGroup = (i) => {
        const updatedGroups = groups.filter((el, index) => index !== i)
        setGroups(updatedGroups)
    }


    return (
        <div className='w-2/3 h-full mx-auto flex flex-col justify-center items-center py-10 border my-10 rounded-xl shadow-md '>
            <h1 className='text-2xl font-bold mb-6'>Create Groups</h1>
            <form onSubmit={handleSubmit(handleCreateGroups)} className='w-2/3'>
                <div className='flex flex-col w-full ' >
                    <label htmlFor="groupNumber" className=' font-bold'>Enter Number of groups</label>
                    <input type="number" min='1' className='h-12 px-3 bg-gray-200  rounded' placeholder='eg:-1'  {...register('groupNumber', {
                        required: {
                            value: true,
                            message: "Minimum number of groups should be 1 or greater"
                        },
                    })} />
                    <p className="text-red-500 text-xs italic">
                        {
                            errors?.groupNumber?.message}
                    </p>
                </div>
                <div className='w-full flex flex-col'>
                    <label htmlFor="groups" className=' font-bold'>Enter Groups</label>
                    <div className='flex justify-between'>
                        <input type="text" className='h-10 w-9/12 px-3 bg-gray-200 rounded'
                            ref={groupInputRef} />
                        <div className='border inline px-5 py-2 rounded bg-black text-white cursor-pointer  ' onClick={handleAddGroup}>Add</div>
                    </div>
                    <p className="text-red-500 text-xs italic">{errors?.groups?.message}</p>
                </div>
                {
                    groups.length > 0 ? <div className='w-full mt-5 h-auto'>
                        {
                            groups.map((group, index) => {
                                return <span key={index} className='border px-2 inline-flex items-center justify-between bg-slate-500  mx-1 text-white rounded'>{group?.groupName}<ImCross className=' text-xs ml-2 cursor-pointer' onClick={() => handledeleteGroup(index)} /></span>
                            })
                        }
                    </div> : null
                }

                <button className='border w-full h-12 rounded my-4 text-white bg-black hover:bg-slate-700 disabled:bg-gray-400' type='submit' disabled={isCreateGroupsDisabled}>Create Groups </button>
            </form>
        </div>
    )
}

export default CreateGroups