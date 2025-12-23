import { useState } from "react";
import { ImCross } from "react-icons/im"
import { toast } from 'react-toastify';
import { startQuaterFinalMatches } from "../../services/api";
import { useForm } from "react-hook-form";

const initialTeams = {
    match1: [],
    match2: [],
    match3: [],
    match4: []
}

function QuaterFinals({ approvedTeams, leagueId, setQuaterFinalMatches, quaterFinalMatches, setIsSemiFinalsStarted, semiFinalsStarted, quaterFinalMatchesStarted, setQuaterFinalMatchesStarted }) {
    console.log(approvedTeams)
    const [teams, setTeams] = useState(approvedTeams)
    const [matches, setmatches] = useState(initialTeams)
    const {
        register,
        handleSubmit, reset,
        formState: { errors },
    } = useForm();
    const [isButtonDisabled, setIsButtonDisabled] = useState(false)

    const handleteamdeleteMatch1 = (i) => {
        const team = matches.match1.filter((team, index) => index === i)
        const updatedTeam = matches.match1.filter((team, index) => index !== i)
        setmatches({ ...matches, match1: updatedTeam })
        const newTeams = [...teams, team[0]]
        setTeams(newTeams)
    }

    const handleteamdeleteMatch2 = (i) => {
        const team = matches.match2.filter((team, index) => index === i)
        const updatedTeam = matches.match2.filter((team, index) => index !== i)
        setmatches({ ...matches, match2: updatedTeam })
        const newTeams = [...teams, team[0]]
        setTeams(newTeams)
    }

    const handleteamdeleteMatch3 = (i) => {
        const team = matches.match3.filter((team, index) => index === i)
        const updatedTeam = matches.match3.filter((team, index) => index !== i)
        setmatches({ ...matches, match3: updatedTeam })
        const newTeams = [...teams, team[0]]
        setTeams(newTeams)
    }

    const handleteamdeleteMatch4 = (i) => {
        const team = matches.match4.filter((team, index) => index === i)
        const updatedTeam = matches.match4.filter((team, index) => index !== i)
        setmatches({ ...matches, match4: updatedTeam })
        const newTeams = [...teams, team[0]]
        setTeams(newTeams)
    }

    const handleSelectChange = (e, currentteam) => {

        const match = e.target.value;
        if (match === '') {
            return
        }

        if (matches[match].length === 2) {
            console.log('full')
            e.target.value = ''
            return toast.error("Teams full in the match")
        }


        setmatches({ ...matches, [match]: [...matches[match], currentteam] })
        const updatedTeams = teams.filter((team) => team._id !== currentteam._id)
        setTeams(updatedTeams)

    }



    const handleStartMatch = async (data) => {
        setIsButtonDisabled(true)
        const newData = {
            Match1: {
                team1: matches.match1[0].team._id,
                team2: matches.match1[1].team._id,
                date: data?.startDate1,
                time: [{
                    startTime: data.starttime1,
                    endTime: data.endtime1
                }],
                location: data.location1,
                league: leagueId,
                matchType: "Quater-final"
            },
            Match2: {
                team1: matches.match2[0].team._id,
                team2: matches.match2[1].team._id,
                date: data?.startDate2,
                time: [{
                    startTime: data.starttime2,
                    endTime: data.endtime2
                }],
                location: data.location2,
                league: leagueId,
                matchType: "Quater-final"
            },
            Match3: {
                team1: matches.match3[0].team._id,
                team2: matches.match3[1].team._id,
                date: data?.startDate1,
                time: [{
                    startTime: data.starttime3,
                    endTime: data.endtime3
                }],
                location: data.location3,
                league: leagueId,
                matchType: "Quater-final"
            },
            Match4: {
                team1: matches.match4[0].team._id,
                team2: matches.match4[1].team._id,
                date: data?.startDate4,
                time: [{
                    startTime: data.starttime4,
                    endTime: data.endtime4
                }],
                location: data.location4,
                league: leagueId,
                matchType: "Quater-final"
            }
        }
        try {
            const response = await startQuaterFinalMatches(leagueId, newData)

            if (response.status === 'SUCCESS') {
                toast.success("Quater Final Matches started")
                setQuaterFinalMatches(response?.leagueFixture?.quaterFinalMatches)
                setQuaterFinalMatchesStarted(response?.leagueFixture?.quaterFinalMatchesStarted)
                reset()
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.error || "Error starting quater final matches")
        } finally {
            setIsButtonDisabled(false)
        }
    }

    if (quaterFinalMatchesStarted) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-20 px-4">
                <div className="flex items-center gap-3 mb-4">
                    <ImCross className="text-orange-500" />
                    <h2 className="text-2xl font-bold text-white">Quarter Finals In Progress</h2>
                </div>
                <p className="text-slate-400 text-center mb-2">Quarter final matches are currently being played.</p>
                <p className="text-slate-500 text-sm text-center">Match results will be available in the Semi Finals stage.</p>
            </div>
        )
    }

    // If Semi Finals started, show completed Quarter Finals as read-only
    if (semiFinalsStarted && quaterFinalMatches && quaterFinalMatches.length > 0) {
        return (
            <div className="w-full max-w-6xl mx-auto py-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Quarter Finals Results</h2>
                    <p className="text-sm text-slate-400">Quarter Finals have been completed</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quaterFinalMatches.map((match, index) => (
                        <div key={index} className="bg-[#1e293b] border border-slate-700 rounded-lg p-4">
                            <h3 className="text-lg font-bold text-orange-500 mb-3 pb-2 border-b border-slate-700">
                                Match {index + 1}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between bg-[#0f172a] border border-slate-700 rounded px-3 py-2">
                                    <span className="text-sm text-slate-200">{match.team1?.teamName || 'Team 1'}</span>
                                    {match.winningTeam && match.winningTeam.toString() === match.team1?._id?.toString() && (
                                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Winner</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between bg-[#0f172a] border border-slate-700 rounded px-3 py-2">
                                    <span className="text-sm text-slate-200">{match.team2?.teamName || 'Team 2'}</span>
                                    {match.winningTeam && match.winningTeam.toString() === match.team2?._id?.toString() && (
                                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">Winner</span>
                                    )}
                                </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-700 text-xs text-slate-400">
                                <p>Date: {match.date ? new Date(match.date).toLocaleDateString() : 'Not set'}</p>
                                <p>Location: {match.location || 'Not set'}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                    <p className="text-green-400 text-sm flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        Quarter Finals completed. Winners advanced to Semi Finals.
                    </p>
                </div>
            </div>
        );
    }

    // NEW: If QF matches are saved (but not yet started), show them as saved fixtures
    if (quaterFinalMatches && quaterFinalMatches.length > 0 && !quaterFinalMatchesStarted && !semiFinalsStarted) {
        return (
            <div className="w-full max-w-6xl mx-auto py-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Saved Quarter Finals Fixtures</h2>
                    <p className="text-sm text-slate-400">These fixtures have been created and saved</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quaterFinalMatches.map((match, index) => (
                        <div key={index} className="bg-[#1e293b] border border-slate-700 rounded-lg p-4">
                            <h3 className="text-lg font-bold text-orange-500 mb-3 pb-2 border-b border-slate-700">
                                Quarter Final Match {index + 1}
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-[#0f172a] border border-slate-700 rounded px-3 py-2">
                                    <span className="text-sm text-slate-200">{match.team1?.teamName || 'Team 1'}</span>
                                </div>
                                <div className="text-center text-slate-500 text-xs">VS</div>
                                <div className="bg-[#0f172a] border border-slate-700 rounded px-3 py-2">
                                    <span className="text-sm text-slate-200">{match.team2?.teamName || 'Team 2'}</span>
                                </div>
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-700 text-xs text-slate-400 space-y-1">
                                <p><strong>Date:</strong> {match.date ? new Date(match.date).toLocaleDateString() : 'Not set'}</p>
                                <p><strong>Time:</strong> {match.time?.[0]?.startTime || 'Not set'} - {match.time?.[0]?.endTime || 'Not set'}</p>
                                <p><strong>Location:</strong> {match.location || 'Not set'}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <p className="text-blue-400 text-sm flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>
                        Quarter Finals fixtures are saved. Matches can be played and results updated.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='w-full h-auto'>

            {
                approvedTeams?.length > 0 &&
                <div className="w-full flex flex-col items-center py-10  px-5 mx-auto ">
                    <div className="w-2/3 px-10">

                        <div className=" w-full border rounded-md shadow-lg overflow-hidden">
                            <table className="w-full text-center font-bold ">
                                <thead className="h-12 text-base">
                                    <th className="border-2 broder-slate-300">Name</th>
                                    <th className="border-2 broder-slate-300">Matches Played</th>
                                    <th className="border-2 broder-slate-300">Score</th>
                                    <td>Select Matches</td>
                                </thead>
                                <tbody>
                                    {
                                        teams.length > 0 && teams?.map((team) => (
                                            < tr key={team._id} className="border-2 broder-slate-300 h-12">
                                                <td className="border-2 broder-slate-300 w-1/4">{team.team.teamName}</td>
                                                <td className="border-2 broder-slate-300 w-1/4">{team.team.totalMatchesPlayed}</td>
                                                <td className="border-2 broder-slate-300 w-1/4">{team.team.pointsScored}</td>
                                                <th>
                                                    <select name="matches" id="matches"
                                                        className="w-4/5 rounded h-8 border-2" onChange={(e) => handleSelectChange(e, team)}>
                                                        <option value="">Select</option>
                                                        <option value="match1">Match 1</option>
                                                        <option value="match2">Match 2</option>
                                                        <option value="match3">Match 3</option>
                                                        <option value="match4">Match 4</option>
                                                    </select>
                                                </th>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="w-full px-10 h-full mt-20">
                        {
                            (matches.match1.length > 0
                                || matches.match2.length > 0 || matches.match3.length > 0 || matches.match4.length > 0) &&
                            <h1 className="text-center text-xl font-bold">Matches</h1>
                        }
                        <form onSubmit={handleSubmit(handleStartMatch)}>
                            <div className="w-auto flex flex-wrap">
                                {
                                    matches.match1.length > 0 ?
                                        <div className="w-5/12  m-9 rounded-lg border-slate-300  border shadow-md pb-4 flex flex-col items-center">
                                            <h1 className="text-center font-bold">Match 1</h1>
                                            <div className=" w-full h-5/6 flex flex-col items-center">
                                                <div className="flex w-full justify-around px-2">
                                                    {
                                                        matches.match1.map((team, index) => (
                                                            <div className="bg-slate-200 w-1/3 h-12 rounded" key={index}>
                                                                <p className='w-full h-full flex text-center  justify-center items-center' key={team._id}>{team.team.teamName}<span><ImCross className=" cursor-pointer text-red-500 ml-4" onClick={() => handleteamdeleteMatch1(index)} /></span></p>
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
                                        <div className="w-5/12  m-9 rounded-lg border-slate-300  border shadow-md pb-4 flex flex-col items-center">
                                            <h1 className="text-center font-bold">Match 2</h1>
                                            <div className=" w-full h-5/6 flex flex-col items-center">
                                                <div className="flex w-full justify-around px-2">
                                                    {
                                                        matches.match2.map((team, index) => (
                                                            <div className="bg-slate-200 w-1/3 h-12 rounded" key={index}>
                                                                <p className='w-full h-full flex text-center  justify-center items-center' key={team._id}>{team.team.teamName}<span><ImCross className=" cursor-pointer text-red-500 ml-4" onClick={() => handleteamdeleteMatch2(index)} /></span></p>
                                                            </div>


                                                        ))}
                                                </div>
                                                <div className="w-4/5 my-2">
                                                    <label htmlFor="startDate2" className="text-xs font-bold">Date</label>
                                                    <input type="date" className="w-full mx-auto h-10 border rounded bg-slate-200"
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
                                                        <label htmlFor="startTime2" className="text-xs font-bold">StartTime</label>
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
                                                    <label htmlFor="location1" className="tex-xs font-bold">Location</label>
                                                    <input type="text" name="location1" className="w-full h-10 bg-slate-200 rounded"
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
                                {
                                    matches.match3.length > 0 ?
                                        <div className="w-5/12  m-9 rounded-lg border-slate-300  border shadow-md pb-4 flex flex-col items-center">
                                            <h1 className="text-center font-bold">Match 3</h1>
                                            <div className=" w-full h-5/6 flex flex-col items-center">
                                                <div className="flex w-full justify-around px-2">
                                                    {
                                                        matches.match3.map((team, index) => (
                                                            <div className="bg-slate-200 w-1/3 h-12 rounded" key={index}>
                                                                <p className='w-full h-full flex text-center  justify-center items-center' key={team._id}>{team.team.teamName}<span><ImCross className=" cursor-pointer text-red-500 ml-4" onClick={() => handleteamdeleteMatch3(index)} /></span></p>
                                                            </div>


                                                        ))}
                                                </div>
                                                <div className="w-4/5 my-2">
                                                    <label htmlFor="startDate3" className="text-xs font-bold">Date</label>
                                                    <input type="date" className="w-full mx-auto h-10 border rounded bg-slate-200"
                                                        {...register('startDate3', {
                                                            required: {
                                                                value: true,
                                                                message: "Date is required"
                                                            }
                                                        })} />
                                                    <p className="text-red-500 text-xs italic">
                                                        {
                                                            errors?.startDate3?.message
                                                        }
                                                    </p>
                                                </div>
                                                <div className="flex justify-around w-full my-2 px-2">
                                                    <div className='w-1/3'>
                                                        <label htmlFor="startTime3" className="text-xs font-bold">StartTime</label>
                                                        <input type="time" className="w-full rounded h-10 bg-slate-200" {...register('starttime3', {
                                                            required: {
                                                                value: true,
                                                                message: "Start Time is required"
                                                            }
                                                        })} />
                                                        <p className="text-red-500 text-xs italic">
                                                            {errors?.starttime3?.message}
                                                        </p>
                                                    </div>
                                                    <div className='w-1/3'>
                                                        <label htmlFor="startTime3" className="text-xs font-bold">EndTime</label>
                                                        <input type="time" className="w-full rounded h-10 bg-slate-200" {...register('endtime3', {
                                                            required: {
                                                                value: true,
                                                                message: "End Time is required"
                                                            }
                                                        })} />
                                                        <p className="text-red-500 text-xs italic">
                                                            {errors?.endtime3?.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="w-4/5 my-2">
                                                    <label htmlFor="location1" className="tex-xs font-bold">Location</label>
                                                    <input type="text" name="location1" className="w-full h-10 bg-slate-200 rounded"
                                                        {...register('location3', {
                                                            required: {
                                                                value: true,
                                                                message: "Location is required"
                                                            }
                                                        })} />
                                                    <p className="text-red-500 text-xs italic">
                                                        {errors?.location3?.message}
                                                    </p>
                                                </div>

                                            </div>
                                        </div>
                                        :
                                        null
                                }
                                {
                                    matches.match4.length > 0 ?
                                        <div className="w-5/12  m-9 rounded-lg border-slate-300  border shadow-md pb-4 flex flex-col items-center">
                                            <h1 className="text-center font-bold">Match 4</h1>
                                            <div className=" w-full h-5/6 flex flex-col items-center">
                                                <div className="flex w-full justify-around px-2">
                                                    {
                                                        matches.match4.map((team, index) => (
                                                            <div className="bg-slate-200 w-1/3 h-12 rounded" key={team._id}>
                                                                <p className='w-full h-full flex text-center  justify-center items-center'  >{team.team.teamName}<span><ImCross className=" cursor-pointer text-red-500 ml-4" onClick={() => handleteamdeleteMatch4(index)} /></span></p>
                                                            </div>


                                                        ))}
                                                </div>
                                                <div className="w-4/5 my-2">
                                                    <label htmlFor="startDate3" className="text-xs font-bold">Date</label>
                                                    <input type="date" className="w-full mx-auto h-10 border rounded bg-slate-200"
                                                        {...register('startDate4', {
                                                            required: {
                                                                value: true,
                                                                message: "Date is required"
                                                            }
                                                        })} />
                                                    <p className="text-red-500 text-xs italic">
                                                        {
                                                            errors?.startDate4?.message
                                                        }
                                                    </p>
                                                </div>
                                                <div className="flex justify-around w-full my-2 px-2">
                                                    <div className='w-1/3'>
                                                        <label htmlFor="startTime4" className="text-xs font-bold">StartTime</label>
                                                        <input type="time" className="w-full rounded h-10 bg-slate-200" {...register('starttime4', {
                                                            required: {
                                                                value: true,
                                                                message: "Start Time is required"
                                                            }
                                                        })} />
                                                        <p className="text-red-500 text-xs italic">
                                                            {errors?.starttime4?.message}
                                                        </p>
                                                    </div>
                                                    <div className='w-1/3'>
                                                        <label htmlFor="startTime4" className="text-xs font-bold">EndTime</label>
                                                        <input type="time" className="w-full rounded h-10 bg-slate-200" {...register('endtime4', {
                                                            required: {
                                                                value: true,
                                                                message: "End Time is required"
                                                            }
                                                        })} />
                                                        <p className="text-red-500 text-xs italic">
                                                            {errors?.endtime4?.message}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="w-4/5 my-2">
                                                    <label htmlFor="location4" className="tex-xs font-bold">Location</label>
                                                    <input type="text" name="location1" className="w-full h-10 bg-slate-200 rounded"
                                                        {...register('location4', {
                                                            required: {
                                                                value: true,
                                                                message: "Location is required"
                                                            }
                                                        })} />
                                                    <p className="text-red-500 text-xs italic">
                                                        {errors?.location4?.message}
                                                    </p>
                                                </div>


                                            </div>
                                        </div>
                                        :
                                        null
                                }
                            </div>
                            {
                                matches.match1.length > 0 && matches.match2.length > 0 && matches.match3.length > 0 && matches.match4.length > 0 &&
                                <div className="flex w-full justify-center items-center">
                                    <button className="border w-52 rounded-lg mt-10 py-4 bg-black text-white disabled:bg-slate-400" type="submit" disabled={isButtonDisabled}>Start Matches</button>

                                </div>
                            }
                        </form>
                    </div>
                </div>
            }
        </div >
    )
}

export default QuaterFinals