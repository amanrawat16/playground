import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ImCross } from 'react-icons/im'
import { toast } from 'react-toastify';
import { startSemiFinalMatches } from '../../services/api';

const initialTeams = {
    match1: [],
    match2: []
}
function SemiFinals({ semiFinalTeams, setSemiFinalTeams, leagueId, semiFinalsStarted, setIsSemiFinalsStarted }) {
console.log(semiFinalTeams)
    const [teams, setTeams] = useState(semiFinalTeams)
    const [matches, setmatches] = useState(initialTeams)
    const {
        register,
        handleSubmit, reset,
        formState: { errors },
    } = useForm();

    const handleteamdeleteMatch1 = (team) => {

        const findTeam = semiFinalTeams.filter((el) => {
            if (el.winningTeamId._id === team._id) return team
        })
        setTeams([...teams, findTeam[0]])
        setmatches({ ...matches, "match1": matches.match1.filter((el) => el._id !== team._id) })
    }
    const handleteamdeleteMatch2 = (team) => {
        const findTeam = semiFinalTeams.filter((el) => {
            if (el.winningTeamId._id === team._id) return team
        })
        setTeams([...teams, findTeam[0]])
        setmatches({ ...matches, "match2": matches.match2.filter((el) => el._id !== team._id) })
    }

    const handleStartSemimatches = async (data) => {

        const newData = {
            Match1: {
                team1: matches.match1[0]._id,
                team2: matches.match1[1]._id,
                date: data?.startDate1,
                time: [{
                    startTime: data.starttime1,
                    endTime: data.endtime1
                }],
                location: data.location1,
                league: leagueId,
                matchType: "Semi-final"
            },
            Match2: {
                team1: matches.match2[0]._id,
                team2: matches.match2[1]._id,
                date: data?.startDate2,
                time: [{
                    startTime: data.starttime2,
                    endTime: data.endtime2
                }],
                location: data.location2,
                league: leagueId,
                matchType: "Semi-final"
            }
        }

        try {
            const response = await startSemiFinalMatches(leagueId, newData)
            if (response.status === "SUCCESS") {
                toast.success(response.message)
                setIsSemiFinalsStarted(response?.leagueFixture.semiFinalMatchesStarted)
                setmatches(initialTeams)
                reset()
            }
        } catch (error) {
            toast.error("Error in starting semifinal matches")
            console.log(error)
        }
    }

    const handleAddTeamtoSemiFinal = (e, currentteam, index) => {
        const match = e.target.value;
        const team = currentteam.winningTeamId
        if (match === '') {
            return
        }

        let teamExistsInMatch = false;
        // Iterate over matches to check if the team exists in any match
        Object.values(matches).forEach(matchArray => {
            matchArray.forEach(matchObj => {
                if (matchObj._id === team._id) {
                    teamExistsInMatch = true;
                    return;
                }
            });
        });

        if (teamExistsInMatch) {
            return toast.error("Team already exists in a match");
        }


        if (matches[match].length === 2) {
            e.target.value = ''
            return toast.error("Teams full in the match")
        }

        setmatches({ ...matches, [match]: [...matches[match], team] })
        const updatedTeams = teams?.filter((team, i) => i !== index)
        setTeams(updatedTeams)
    }

    if (semiFinalsStarted) {
        return (
            <div className='w-full flex items-center justify-center'>
                <h1 className='text-2xl font-bold my-20 text-green-500'>SemiFinals Started...</h1>
            </div>
        )
    }

    return (
        <div className='w-full p-10'>
            <div className='w-full flex flex-col justify-around'>
                {
                    teams.length > 0 &&
                    <div className='w-3/5 border  my-10 rounded px-4 py-5 shadow-lg mx-auto'>
                        <table className='w-full text-center'>
                            <thead className='h-12 text-center'>
                                <th className='w-/3 border-collapse'>S.No.</th>
                                <th className='w-1/3'> Team</th>
                                <th className='w-1/3'></th>
                            </thead>
                            <tbody className='text-center'>
                                {
                                    teams.map((match, index) => {
                                        return <tr key={match._id} className='text-center h-12'>
                                            <td className='w-1/3'>{index + 1}</td>
                                            <td className='w-1/3'>{match.matchId.winningTeamName}</td>
                                            <td className='w-1/3'>
                                                <select name="match" id={`match${index + 1}`} className='w-full border h-10 rounded' onChange={(e) => handleAddTeamtoSemiFinal(e, match, index)}>
                                                    <option value="">Select</option>
                                                    <option value="match1">Match 1</option>
                                                    <option value="match2">Match 2</option>
                                                </select>
                                            </td>
                                        </tr>
                                    })}
                            </tbody>
                        </table>
                    </div>
                }
                <form onSubmit={handleSubmit(handleStartSemimatches)}>
                    <div className='w-full flex'>
                        {
                            matches.match1.length > 0 ?
                                <div className="w-2/5  m-9 rounded-lg border-slate-300  border shadow-md pb-4 flex flex-col items-center">
                                    <h1 className="text-center font-bold">Match 1</h1>
                                    <div className=" w-full h-5/6 flex flex-col items-center">
                                        <div className="flex w-full justify-around px-2">
                                            {
                                                matches.match1.map((team, index) => (
                                                    <div className="bg-slate-200 w-1/3 h-12 rounded" key={index}>
                                                        <p className='w-full h-full flex text-center  justify-center items-center' key={team._id}>{team.teamName}<span><ImCross className=" cursor-pointer text-red-500 ml-4" onClick={() => handleteamdeleteMatch1(team)} /></span></p>
                                                    </div>


                                                ))}
                                        </div>
                                        <div className="w-4/5 my-2">
                                            <label htmlFor="startDate1" className="text-xs font-bold">Date</label>
                                            <input type="date" name="startDate1" className="w-full mx-auto h-10 border rounded bg-slate-200"
                                                {...register('startDate1', {
                                                    required: {
                                                        value: true,
                                                        message: "Date is required"
                                                    }
                                                })} />
                                            <p className="text-red-500 text-xs italic">
                                                {
                                                    errors?.startDate1?.message
                                                }
                                            </p>
                                        </div>
                                        <div className="flex justify-around w-full my-2 px-2">
                                            <div className='w-1/3'>
                                                <label htmlFor="startTime" className="text-xs font-bold">StartTime</label>
                                                <input type="time" className="w-full rounded h-10 bg-slate-200" {...register('starttime1', {
                                                    required: {
                                                        value: true,
                                                        message: "Start Time is required"
                                                    }
                                                })} />
                                                <p className="text-red-500 text-xs italic">
                                                    {errors?.starttime1?.message}
                                                </p>
                                            </div>
                                            <div className='w-1/3'>
                                                <label htmlFor="startTime" className="text-xs font-bold">EndTime</label>
                                                <input type="time" className="w-full rounded h-10 bg-slate-200" {...register('endtime1', {
                                                    required: {
                                                        value: true,
                                                        message: "End Time is required"
                                                    }
                                                })} />
                                                <p className="text-red-500 text-xs italic">
                                                    {errors?.endtime1?.message}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-4/5 my-2">
                                            <label htmlFor="location1" className="tex-xs font-bold">Location</label>
                                            <input type="text" name="location1" className="w-full h-10 bg-slate-200 rounded"
                                                {...register('location1', {
                                                    required: {
                                                        value: true,
                                                        message: "Location is required"
                                                    }
                                                })} />
                                            <p className="text-red-500 text-xs italic">
                                                {errors?.location1?.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                : null
                        }
                        {
                            matches.match2.length > 0 ?
                                <div className="w-2/5  m-9 rounded-lg border-slate-300  border shadow-md pb-4 flex flex-col items-center">
                                    <h1 className="text-center font-bold">Match 2</h1>
                                    <div className=" w-full h-5/6 flex flex-col items-center">
                                        <div className="flex w-full justify-around px-2">
                                            {
                                                matches.match2.map((team, index) => (
                                                    <div className="bg-slate-200 w-1/3 h-12 rounded" key={index}>
                                                        <p className='w-full h-full flex text-center  justify-center items-center' key={team._id}>{team.teamName}<span><ImCross className=" cursor-pointer text-red-500 ml-4" onClick={() => handleteamdeleteMatch2(team)} /></span></p>
                                                    </div>


                                                ))}
                                        </div>
                                        <div className="w-4/5 my-2">
                                            <label htmlFor="startDate2" className="text-xs font-bold">Date</label>
                                            <input type="date" name="startDate1" className="w-full mx-auto h-10 border rounded bg-slate-200"
                                                {...register('startDate2', {
                                                    required: {
                                                        value: true,
                                                        message: "Date is required"
                                                    }
                                                })} />
                                            <p className="text-red-500 text-xs italic">
                                                {
                                                    errors?.startDate2?.message
                                                }
                                            </p>
                                        </div>
                                        <div className="flex justify-around w-full my-2 px-2">
                                            <div className='w-1/3'>
                                                <label htmlFor="startTime" className="text-xs font-bold">StartTime</label>
                                                <input type="time" className="w-full rounded h-10 bg-slate-200" {...register('starttime2', {
                                                    required: {
                                                        value: true,
                                                        message: "Start Time is required"
                                                    }
                                                })} />
                                                <p className="text-red-500 text-xs italic">
                                                    {errors?.starttime2?.message}
                                                </p>
                                            </div>
                                            <div className='w-1/3'>
                                                <label htmlFor="startTime" className="text-xs font-bold">EndTime</label>
                                                <input type="time" className="w-full rounded h-10 bg-slate-200" {...register('endtime2', {
                                                    required: {
                                                        value: true,
                                                        message: "End Time is required"
                                                    }
                                                })} />
                                                <p className="text-red-500 text-xs italic">
                                                    {errors?.endtime2?.message}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-4/5 my-2">
                                            <label htmlFor="location2" className="tex-xs font-bold">Location</label>
                                            <input type="text" name="location2" className="w-full h-10 bg-slate-200 rounded"
                                                {...register('location2', {
                                                    required: {
                                                        value: true,
                                                        message: "Location is required"
                                                    }
                                                })} />
                                            <p className="text-red-500 text-xs italic">
                                                {errors?.location2?.message}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                : null
                        }
                    </div>
                    {
                        matches.match1.length === 2 && matches.match2.length === 2 ?
                            <div className=' w-full flex items-center justify-center'>
                                <button className='h-12 rounded-md border px-5 text-white bg-black'>Start SemiFinal Matches</button>
                            </div>
                            :
                            <div className=' w-full flex items-center justify-center my-10'>
                                <p className='text-center text-red-500 text-lg'>Schedule both matches to Start SemiFinals</p>
                            </div>
                    }
                </form>
            </div>

        </div>
    )
}

export default SemiFinals