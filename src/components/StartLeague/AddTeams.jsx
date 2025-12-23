import { useState } from "react"
import { AddTeamtoGroups } from "../../services/api";
import { toast } from 'react-toastify';
import { X, Users, UsersRound, Plus, Play, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

function AddTeams({ setCurrent, fixtureGroups, approvedTeams, handleUpdateFixtureData, isAddTeamsStarted, setIsAddTeamsStarted }) {
    const [groupId, setGroupId] = useState('')
    const [teamId, setTeamId] = useState('')
    const [teams, setTeams] = useState(approvedTeams)
    const [groupsData, setGroupsData] = useState(fixtureGroups)

    // If team assignments completed (user moved to Create Matches), show read-only view
    const allGroupsHaveTeams = fixtureGroups?.every(group => group.teams && group.teams.length > 0);
    if (allGroupsHaveTeams && isAddTeamsStarted) {
        return (
            <div className="w-full max-w-6xl mx-auto py-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Team Assignments</h2>
                    <p className="text-sm text-slate-400">Teams have been assigned to groups</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fixtureGroups.map((group, index) => (
                        <div key={index} className="bg-[#1e293b] border border-slate-700 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-700">
                                <UsersRound className="w-5 h-5 text-orange-500" />
                                <h3 className="text-lg font-bold text-orange-500">
                                    {group.name}
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {group.teams?.map((teamObj, tindex) => (
                                    <div key={tindex} className="bg-[#0f172a] border border-slate-700 rounded px-3 py-2 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-orange-400" />
                                        <span className="text-sm text-slate-200">{teamObj.team?.teamName || 'Unknown Team'}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 pt-2 border-t border-slate-700">
                                <p className="text-xs text-slate-400">
                                    {group.teams?.length || 0} team{group.teams?.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                    <p className="text-green-400 text-sm flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        Teams assigned successfully. Proceed to create matches.
                    </p>
                </div>
            </div>
        );
    }

    const handleGroupChange = (value) => {
        setGroupId(value)
    }

    const handleTeamChange = (value) => {
        setTeamId(value)
    }

    const handleAddTeam = async () => {
        if (groupId === '') {
            return toast.error("Please choose a group")
        }
        if (teamId === '') {
            return toast.error('Please choose a team')
        }
        const team = teams.filter((team) => team._id === teamId)
        const updatedGroupData = groupsData.map((group) => {
            if (group._id === groupId) {
                return { ...group, teams: [...group.teams, team[0]] }
            }
            return group
        })
        setGroupsData(updatedGroupData)
        const updateTeams = teams.filter((team) => team._id !== teamId)
        setTeams(updateTeams)
        setTeamId('')
    }

    const handleDeleteTeam = (groupId, teamobj) => {
        const updatedTeams = [...teams, teamobj]
        setTeams(updatedTeams)
        const updatedGroups = groupsData.map((group) => {
            if (group._id === groupId) {
                return { ...group, teams: group.teams.filter((team) => team._id !== teamobj._id) }
            }
            return group;
        })
        setGroupsData(updatedGroups)
    }

    const handleStartLeagueMatches = async () => {
        setIsAddTeamsStarted(true)
        try {
            const response = await AddTeamtoGroups(groupsData)
            if (response.status === 'SUCCESS') {
                toast.success(response.message)
                await handleUpdateFixtureData({ current: 3 })
            }
        } catch (error) {
            toast.error(error.response?.error || "Error starting league matches")
            setIsAddTeamsStarted(false)
        }
    }

    return (
        <div className='w-full max-w-6xl mx-auto flex flex-col items-center py-6 sm:py-8 px-4'>
            {/* Header */}
            <div className='w-full mb-6'>
                <div className='flex items-center gap-3 mb-2'>
                    <Users className='w-6 h-6 sm:w-7 sm:h-7 text-orange-500' />
                    <h1 className='text-xl sm:text-2xl font-bold text-white'>Add Teams to Groups</h1>
                </div>
                <p className='text-sm text-slate-400 ml-9'>
                    Assign teams to their respective groups
                </p>
            </div>

            {/* Selection Controls */}
            <div className='w-full bg-[#1e293b] border border-slate-700 rounded-lg shadow-md p-4 sm:p-6 mb-6'>
                <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
                    <div className='flex-1'>
                        <label className='text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-2'>
                            <UsersRound className='w-4 h-4 text-orange-500' />
                            Select Group
                        </label>
                        <Select value={groupId} onValueChange={handleGroupChange} disabled={isAddTeamsStarted}>
                            <SelectTrigger className='h-11 bg-[#0f172a] border-slate-700 text-slate-200'>
                                <SelectValue placeholder="Choose Group" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                                {fixtureGroups?.length > 0 ? (
                                    fixtureGroups.map((group) => (
                                        <SelectItem key={group._id} value={group._id} className="focus:bg-slate-700 focus:text-white cursor-pointer">{group.groupName}</SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>Groups Not added yet</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex-1'>
                        <label className='text-sm font-semibold text-slate-300 mb-2 block flex items-center gap-2'>
                            <Users className='w-4 h-4 text-orange-500' />
                            Select Team
                        </label>
                        <Select value={teamId} onValueChange={handleTeamChange} disabled={isAddTeamsStarted || teams?.length === 0}>
                            <SelectTrigger className='h-11 bg-[#0f172a] border-slate-700 text-slate-200'>
                                <SelectValue placeholder="Choose Team" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1e293b] border-slate-700 text-slate-200">
                                {teams?.length > 0 && !isAddTeamsStarted ? (
                                    teams.map((team) => (
                                        <SelectItem key={team._id} value={team._id} className="focus:bg-slate-700 focus:text-white cursor-pointer">{team.team.teamName}</SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>No teams available</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className='flex items-end'>
                        <Button
                            onClick={handleAddTeam}
                            disabled={isAddTeamsStarted || !groupId || !teamId}
                            className='h-11 px-6 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white disabled:bg-gray-700 disabled:text-slate-400'
                        >
                            <Plus className='w-4 h-4 mr-2' />
                            <span className='hidden sm:inline'>Add Team</span>
                            <span className='sm:hidden'>Add</span>
                        </Button>
                    </div>
                </div>
                {teams?.length > 0 && (
                    <p className='text-xs text-slate-500 mt-3 ml-1'>
                        {teams.length} {teams.length === 1 ? 'team' : 'teams'} remaining to assign
                    </p>
                )}
            </div>

            {/* Groups Display */}
            {groupsData.length > 0 ? (
                <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6'>
                    {groupsData.map((group) => (
                        <div key={group._id} className='bg-[#1e293b] border border-slate-700 rounded-lg shadow-md overflow-hidden'>
                            <div className='bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-3'>
                                <h2 className='text-lg font-bold text-white flex items-center justify-between'>
                                    <span className='flex items-center gap-2'>
                                        <UsersRound className='w-5 h-5' />
                                        {group.groupName}
                                    </span>
                                    <span className='text-sm font-normal bg-white/20 px-2 py-1 rounded-full'>
                                        {group.teams?.length || 0} {group.teams?.length === 1 ? 'team' : 'teams'}
                                    </span>
                                </h2>
                            </div>
                            <div className='p-4 space-y-2 min-h-[100px]'>
                                {group.teams?.length > 0 && !isAddTeamsStarted ? (
                                    group.teams.map((team) => (
                                        <div
                                            key={team._id}
                                            className='flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors'
                                        >
                                            <span className='font-medium text-slate-200'>{team.team.teamName}</span>
                                            <button
                                                onClick={() => handleDeleteTeam(group._id, team)}
                                                className='p-1 hover:bg-red-900/30 rounded transition-colors'
                                            >
                                                <X className='w-4 h-4 text-red-400 hover:text-red-300' />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className='flex items-center justify-center py-6 text-slate-500'>
                                        <p className='text-sm'>No teams assigned</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className='w-full max-w-md flex flex-col items-center justify-center py-12 px-4 bg-[#1e293b] rounded-lg border border-slate-700 mb-6'>
                    <AlertCircle className='w-12 h-12 text-slate-600 mb-4' />
                    <p className='text-slate-300 text-center font-medium'>No groups available</p>
                    <p className='text-slate-500 text-sm text-center mt-1'>Create groups first to assign teams</p>
                </div>
            )}

            {/* Action Button */}
            <div className='w-full max-w-2xl'>
                {teams?.length === 0 && !isAddTeamsStarted ? (
                    <Button
                        onClick={handleStartLeagueMatches}
                        disabled={isAddTeamsStarted}
                        className='w-full h-12 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold shadow-md disabled:bg-gray-700 disabled:text-slate-400'
                    >
                        <Play className='w-5 h-5 mr-2' />
                        Start League Matches
                    </Button>
                ) : (
                    <Button
                        disabled={true}
                        className='w-full h-12 bg-gray-700 text-slate-400 font-semibold cursor-not-allowed'
                    >
                        Add All Teams to Start League
                    </Button>
                )}
            </div>
        </div>
    )
}

export default AddTeams