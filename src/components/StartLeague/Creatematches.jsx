import React from 'react'
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createLeagueFixtureMatch, startQuaterFinals } from '../../services/api';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2'
import { useEffect } from 'react';
import { VscDebugStart } from 'react-icons/vsc';

function Creatematches({ approvedTeams, leagueName, fixtureId, leagueId, quaterFinalsStarted, setIsQuaterFinalStarted, fetchLeagueFixture }) {
    const [teamsList, setTeamList] = useState(approvedTeams)
    const [teamsSecondList, setTeamsSecondList] = useState(approvedTeams);
    const [teamFirstSelectedValue, setTeamFirstSelectedValue] = useState("");
    const {
        register,
        handleSubmit, reset,
        formState: { errors },
    } = useForm();
    const matchType = ["Regular-round", 'Quater-final', 'Semi-final', 'Final']


    const handleCreateMatch = async (data) => {
        setIsQuaterFinalStarted(true)

        const newData = {
            ...data, league: leagueName, time: [{
                startTime: data.startTime,
                endTime: data.endTime
            }
            ],
            date: data.matchDate
        }
        try {

            const response = await createLeagueFixtureMatch(fixtureId, leagueId, newData)
            if (response.status === 'SUCCESS') {
                toast.success(response.message)
                reset()
            }
        } catch (error) {
            toast.error("Error creating match")
            console.log(error)
        } finally {
            setIsQuaterFinalStarted(false)
        }
    }

    const handleOnChange = (e) => {
        setTeamFirstSelectedValue(e.target.value);
    };


    const handleStartQuaterFinals = () => {
        try {
            Swal.fire({
                title: "Start Quater Finals?",
                text: "Add atleast 8 teams to start QuaterFinals",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#357a38",
                cancelButtonColor: "#d33",
                confirmButtonText: "Start"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    try {
                        const response = await startQuaterFinals(leagueId)
                        if (response.status === 'SUCCESS') {
                            console.log(response)
                            toast.success("QuaterFinals Started")
                            setIsQuaterFinalStarted(true)
                            fetchLeagueFixture(leagueId)
                        }
                    } catch (error) {
                        console.log(error)
                        toast.error("Error starting QuaterFinals")
                    }
                }
            });

        } catch (error) {
            console.log(error)
        }
    }



    useEffect(() => {
        const teamSecondCompleteData = [...teamsList];
        const teamSecondFilteredData =
            teamSecondCompleteData.length > 0 &&
            teamSecondCompleteData.filter(
                (ele) => ele?.team?._id !== teamFirstSelectedValue
            );
        setTeamsSecondList(teamSecondFilteredData);
    }, [teamFirstSelectedValue]);


    return (
        <div className=' w-full h-full flex justify-center items-center flex-col'>
            <div className='w-full  flex flex-col items-center'>
                <form
                    className="w-full max-w-lg mt-5"
                    onSubmit={handleSubmit(handleCreateMatch)}
                >
                    <div className="flex flex-wrap -mx-3 mb-2 ">
                        <div className="w-full mb-6 md:mb-0">
                            <p className="text-red-500 text-xs italic">
                                {errors?.league?.message}
                            </p>
                        </div>
                        <div className="w-full md:w-1/2 px-3 mb-2 md:mb-0">
                            <label
                                className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                                htmlFor="grid-first-name"
                            >
                                Team 1
                            </label>
                            <select
                                className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                {...register(`team1`, {
                                    required: {
                                        value: true,
                                        message: "Team is required",
                                    },
                                    onChange: (e) => handleOnChange(e),
                                })}
                            >
                                <option value="">Select Team</option>
                                {teamsList?.length > 0 &&
                                    teamsList.map((team, i) => {
                                        return (
                                            <option key={team?._id || i} value={team?.team?._id}>
                                                {team.team?.teamName}
                                            </option>
                                        );
                                    })}
                            </select>
                            <p className="text-red-500 text-xs italic">
                                {errors?.team1?.message}
                            </p>
                        </div>
                        <div className="w-full md:w-1/2 px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                                htmlFor="grid-last-name"
                            >
                                Team 2
                            </label>
                            <select
                                className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                {...register(`team2`, {
                                    required: {
                                        value: true,
                                        message: "Team2 is required",
                                    },
                                })}
                            >
                                <option value="">Select Team</option>

                                {teamsSecondList.length > 0 &&
                                    teamsSecondList.map((team, i) => {
                                        return (
                                            <option key={team?._id || i} value={team?.team?._id}>
                                                {team.team?.teamName}
                                            </option>
                                        );
                                    })}
                            </select>

                            <p className="text-red-500 text-xs italic">
                                {errors?.team2?.message}.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                                htmlFor="clubName"
                            >
                                Match Date
                            </label>
                            <input
                                className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                id="matchDate"
                                type="date"
                                placeholder="Enter Match Date"
                                {...register("matchDate", {
                                    required: {
                                        value: true,
                                        message: "Match Date is required",
                                    },
                                })}
                            />
                            <p className="text-red-500 text-xs italic">
                                {errors?.matchDate?.message}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full md:w-1/2 px-3 mb-2 md:mb-0">
                            <label
                                className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                                htmlFor="grid-first-name"
                            >
                                Start Time
                            </label>
                            <input
                                className="appearance-none block w-full bg-gray-200 text-gray-700  rounded py-3 px-4 mb-2 leading-tight focus:bg-white "
                                id="startTime"
                                type="time"
                                placeholder="Select Time"
                                {...register("startTime", {
                                    required: {
                                        value: true,
                                        message: "Start Time is required",
                                    },
                                })}
                            />
                            <p className="text-red-500 text-xs italic">
                                {errors?.startTime?.message}
                            </p>
                        </div>
                        <div className="w-full md:w-1/2 px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                                htmlFor="grid-last-name"
                            >
                                End Time
                            </label>
                            <input
                                className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 leading-tight focus:bg-white focus:border-gray-500"
                                id="endTime"
                                type="time"
                                placeholder="Enter Tine"
                                {...register("endTime", {
                                    required: {
                                        value: true,
                                        message: "End Time is required",
                                    },
                                })}
                            />
                            <p className="text-red-500 text-xs italic">
                                {errors?.endTime?.message}.
                            </p>
                        </div>
                    </div>
                    

                    <div className="flex flex-wrap -mx-3 mb-2">
                        <div className="w-full px-3">
                            <label
                                className="block uppercase tracking-wide text-gray-700  text-xs font-bold mb-2"
                                htmlFor="clubName"
                            >
                                Location
                            </label>
                            <input
                                className="appearance-none block w-full bg-gray-200 text-gray-700  border border-gray-200 rounded py-3 px-4 mb-2 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                id="locaion"
                                type="text"
                                placeholder="Please enter match venue"
                                {...register("location", {
                                    required: {
                                        value: true,
                                        message: "Location is required",
                                    },
                                })}
                            />
                            <p className="text-red-500 text-xs italic">
                                {errors?.location?.message}
                            </p>
                        </div>
                    </div>

                    <div className="submit_button my-4">
                        <button
                            type="submit"
                            className="px-2 py-2 bg-gray-800 text-white rounded-md w-full disabled:bg-gray-500"
                            disabled={quaterFinalsStarted}
                        >
                            Create Match
                        </button>
                    </div>
                </form>
            </div>
            <div className='w-2/5 my-10 flex items-center justify-center'>
                <button className='bg-black rounded-md flex items-center justify-center  text-white px-4 py-2 disabled:bg-gray-400' disabled={quaterFinalsStarted} onClick={handleStartQuaterFinals}><VscDebugStart className='mr-2' />Start QuaterFinals</button>
            </div>
        </div>
    )
}

export default Creatematches