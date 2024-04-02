import { useState } from "react"
import { AddTeamtoGroups } from "../../services/api";
import { toast } from 'react-toastify';
import { ImCross } from "react-icons/im";


function AddTeams({ setCurrent, fixtureGroups, approvedTeams, handleUpdateFixtureData, isAddTeamsStarted, setIsAddTeamsStarted }) {
    console.log(isAddTeamsStarted)
    const [groupId, setGroupId] = useState('')
    const [teamId, setTeamId] = useState('')
    const [teams, setTeams] = useState(approvedTeams || [])
    const [groupsData, setGroupsData] = useState(fixtureGroups || [])



    const handleGroupChange = (e) => {
        setGroupId(e.target.value)
    }

    const handleTeamChange = (e) => {
        setTeamId(e.target.value)
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
        console.log(updateTeams)
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
            toast.error(error.response.error)
            setIsAddTeamsStarted(false)
        }
    }

    return (
        <div className='w-full h-full flex justify-center items-center p-6  flex-col'>
            <h1 className=' font-bold text-2xl'>Add Teams Into Groups</h1>
            <div className='w-full my-10 flex justify-around'>
                <select name="groups" id="groupselect" className='w-1/3 h-10 rounded border-2 border-gray-200' value={groupId} onChange={handleGroupChange}>
                    <option value="">Choose Group</option>
                    {
                        fixtureGroups?.length > 0 ? fixtureGroups.map((group) => {
                            return <option value={group._id} key={group._id}>{group.groupName}</option>
                        })
                            : <option value="">Groups Not added yet</option>
                    }
                </select>
                <select name="teams" id="Teamsselect" className='w-1/3 h-10 rounded border-2 border-gray-200' value={teamId} onChange={handleTeamChange}>
                    <option value="">Choose Teams</option>
                    {
                        teams?.length > 0 && !isAddTeamsStarted ? teams.map((team) => {
                            return <option value={team._id} key={team._id}>{team.team.teamName}</option>
                        }) : null
                    }
                </select>
                <button className='w-1/6 rounded bg-black text-white border hover:bg-slate-600' onClick={handleAddTeam}>Add</button>
            </div>


            <div className='w-3/5 h-auto py-10'>
                {
                    groupsData.length > 0 && groupsData.map((group) => {
                        return <div className=' w-full mt-5 shadow-md rounded-md' key={group._id}>
                            <h1 className='h-12 text-xl font-bold  flex justify-center items-center'>{group.groupName}</h1>
                            <div className=' w-full'>
                                {
                                    group.teams.length > 0 && !isAddTeamsStarted ? group.teams.map((team) => {
                                        return <p key={team._id} className='flex h-12 items-center justify-center'>{team.team.teamName}<span><ImCross onClick={() => handleDeleteTeam(group._id, team)} className=' text-xs ml-4 text-red-600' /></span></p>
                                    }) : null
                                }
                            </div>
                        </div>
                    })
                }
            </div>
            {
                teams?.length === 0 && !isAddTeamsStarted ?
                    <button className='w-3/5 rounded-md bg-black text-white h-12 disabled:bg-gray-400' disabled={isAddTeamsStarted} onClick={handleStartLeagueMatches}>Start League</button>
                    :
                    <button className='w-3/5 rounded-md bg-black text-white h-12 disabled:bg-gray-400' disabled={true}>Add All teams to Start</button>
            }
        </div>
    )
}

export default AddTeams