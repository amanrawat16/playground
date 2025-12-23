import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { ImCross } from 'react-icons/im'
import { toast } from 'react-toastify';
import { startSemiFinalMatches } from '../../services/api';
import { Flag, Trophy } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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

    const handleAddTeamtoSemiFinal = (value, currentteam, index) => {
        const match = value;
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
            return toast.error("Teams full in the match")
        }

        setmatches({ ...matches, [match]: [...matches[match], team] })
        const updatedTeams = teams?.filter((team, i) => i !== index)
        setTeams(updatedTeams)
    }

    if (semiFinalsStarted) {
        return (
            <div className='w-full flex flex-col items-center justify-center py-20 px-4'>
                <div className="flex items-center gap-3 mb-4">
                    <Flag className="w-8 h-8 text-green-500" />
                    <h1 className="text-2xl sm:text-3xl font-bold text-green-500">Semi-Finals Started</h1>
                </div>
                <p className="text-slate-400 text-center">Matches have been scheduled successfully!</p>
            </div>
        )
    }

    return (
        <div className='w-full max-w-7xl mx-auto flex flex-col items-center py-6 sm:py-8 px-4'>
            {/* Header */}
            <div className='w-full mb-6'>
                <div className='flex items-center gap-3 mb-2'>
                    <Flag className='w-6 h-6 sm:w-7 sm:h-7 text-orange-600' />
                    <h1 className='text-xl sm:text-2xl font-bold text-white'>Semi-Finals</h1>
                </div>
                <p className='text-sm text-slate-400 ml-9'>
                    Assign teams to semi-final matches
                </p>
            </div>

            <div className='w-full flex flex-col justify-around'>
                {
                    teams.length > 0 &&
                    <div className='w-full lg:w-3/4 mx-auto border border-slate-700 rounded-lg shadow-lg overflow-hidden bg-[#1e293b] mb-10'>
                        <Table>
                            <TableHeader>
                                <TableRow className='bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-600 hover:to-orange-500 border-b-0'>
                                    <TableHead className='text-white font-semibold text-center w-16'>S.No.</TableHead>
                                    <TableHead className='text-white font-semibold text-center'>Team Winner</TableHead>
                                    <TableHead className='text-white font-semibold text-center'>Assign Match</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teams.map((match, index) => (
                                    <TableRow key={match._id} className='hover:bg-slate-800/50 border-b border-slate-700'>
                                        <TableCell className='text-center text-slate-400'>{index + 1}</TableCell>
                                        <TableCell className='text-center font-medium text-slate-200'>{match.matchId.winningTeamName}</TableCell>
                                        <TableCell className='text-center'>
                                            <Select onValueChange={(value) => handleAddTeamtoSemiFinal(value, match, index)}>
                                                <SelectTrigger className='w-full max-w-[180px] mx-auto h-9 bg-[#0f172a] border-slate-700 text-slate-200'>
                                                    <SelectValue placeholder="Select Match" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                                                    <SelectItem value="match1" className="focus:bg-slate-700 focus:text-white cursor-pointer">Match 1</SelectItem>
                                                    <SelectItem value="match2" className="focus:bg-slate-700 focus:text-white cursor-pointer">Match 2</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                }

                <form onSubmit={handleSubmit(handleStartSemimatches)}>
                    <div className='w-full flex flex-col md:flex-row gap-6 justify-center'>
                        {
                            matches.match1.length > 0 ?
                                <div className="w-full md:w-[48%] bg-[#1e293b] rounded-lg border border-slate-700 shadow-md p-4 sm:p-6 flex flex-col items-center">
                                    <h1 className="text-center font-bold mb-4 text-slate-200">Match 1</h1>
                                    <div className="w-full flex flex-col items-center space-y-4">
                                        <div className="flex w-full justify-around px-2 gap-2">
                                            {
                                                matches.match1.map((team, index) => (
                                                    <div className="bg-slate-800 border border-slate-700 flex-1 h-12 rounded flex items-center justify-center p-2" key={index}>
                                                        <p className='w-full h-full flex text-center justify-center items-center gap-2 text-slate-200 text-sm'>
                                                            <span className="truncate">{team.teamName}</span>
                                                            <ImCross className="cursor-pointer text-red-500 hover:text-red-400 flex-shrink-0" onClick={() => handleteamdeleteMatch1(team)} />
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>
                                        <div className="w-4/5 my-2">
                                            <Label htmlFor="startDate1" className="text-xs font-bold text-slate-400">Date</Label>
                                            <Input type="date" className="w-full mx-auto h-10 border-slate-700 rounded bg-[#0f172a] text-slate-200"
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
                                        <div className="flex justify-around w-full my-2 px-2 gap-2">
                                            <div className='flex-1'>
                                                <Label htmlFor="startTime" className="text-xs font-bold text-slate-400">StartTime</Label>
                                                <Input type="time" className="w-full rounded h-10 bg-[#0f172a] border-slate-700 text-slate-200" {...register('starttime1', {
                                                    required: {
                                                        value: true,
                                                        message: "Start Time is required"
                                                    }
                                                })} />
                                                <p className="text-red-500 text-xs italic">
                                                    {errors?.starttime1?.message}
                                                </p>
                                            </div>
                                            <div className='flex-1'>
                                                <Label htmlFor="startTime" className="text-xs font-bold text-slate-400">EndTime</Label>
                                                <Input type="time" className="w-full rounded h-10 bg-[#0f172a] border-slate-700 text-slate-200" {...register('endtime1', {
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
                                            <Label htmlFor="location1" className="text-xs font-bold text-slate-400">Location</Label>
                                            <Input type="text" className="w-full h-10 bg-[#0f172a] border-slate-700 text-slate-200 rounded"
                                                placeholder="Enter location"
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
                                <div className="w-full md:w-[48%] bg-[#1e293b] rounded-lg border border-slate-700 shadow-md p-4 sm:p-6 flex flex-col items-center">
                                    <h1 className="text-center font-bold text-slate-200 mb-4">Match 2</h1>
                                    <div className="w-full flex flex-col items-center space-y-4">
                                        <div className="flex w-full justify-around px-2 gap-2">
                                            {
                                                matches.match2.map((team, index) => (
                                                    <div className="bg-slate-800 border border-slate-700 flex-1 h-12 rounded flex items-center justify-center p-2" key={index}>
                                                        <p className='w-full h-full flex text-center justify-center items-center gap-2 text-slate-200 text-sm'>
                                                            <span className="truncate">{team.teamName}</span>
                                                            <ImCross className="cursor-pointer text-red-500 hover:text-red-400 flex-shrink-0" onClick={() => handleteamdeleteMatch2(team)} />
                                                        </p>
                                                    </div>
                                                ))}
                                        </div>
                                        <div className="w-4/5 my-2">
                                            <Label htmlFor="startDate2" className="text-xs font-bold text-slate-400">Date</Label>
                                            <Input type="date" className="w-full mx-auto h-10 border-slate-700 rounded bg-[#0f172a] text-slate-200"
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
                                        <div className="flex justify-around w-full my-2 px-2 gap-2">
                                            <div className='flex-1'>
                                                <Label htmlFor="startTime" className="text-xs font-bold text-slate-400">StartTime</Label>
                                                <Input type="time" className="w-full rounded h-10 bg-[#0f172a] border-slate-700 text-slate-200" {...register('starttime2', {
                                                    required: {
                                                        value: true,
                                                        message: "Start Time is required"
                                                    }
                                                })} />
                                                <p className="text-red-500 text-xs italic">
                                                    {errors?.starttime2?.message}
                                                </p>
                                            </div>
                                            <div className='flex-1'>
                                                <Label htmlFor="startTime" className="text-xs font-bold text-slate-400">EndTime</Label>
                                                <Input type="time" className="w-full rounded h-10 bg-[#0f172a] border-slate-700 text-slate-200" {...register('endtime2', {
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
                                            <Label htmlFor="location2" className="text-xs font-bold text-slate-400">Location</Label>
                                            <Input type="text" className="w-full h-10 bg-[#0f172a] border-slate-700 text-slate-200 rounded"
                                                placeholder="Enter location"
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
                            <div className=' w-full flex items-center justify-center mt-8'>
                                <Button className='h-12 w-full sm:w-auto min-w-[200px] px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold shadow-md'>
                                    Start Semi-Final Matches
                                </Button>
                            </div>
                            :
                            <div className=' w-full flex items-center justify-center my-10'>
                                <p className='text-center text-orange-400 text-lg'>Schedule both matches to Start Semi-Finals</p>
                            </div>
                    }
                </form>
            </div>

        </div>
    )
}

export default SemiFinals