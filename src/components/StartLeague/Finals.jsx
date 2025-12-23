import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { startFinals } from '../../services/api';
import { toast } from 'react-toastify'
import { Flag, Trophy } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function Finals({ finalTeams, leagueId, isFinalsStarted, winnerTeam }) {
  const [teams, setTeams] = useState(finalTeams)
  const {
    register,
    handleSubmit, reset,
    formState: { errors },
  } = useForm();

  const handleStartFinals = async (data) => {
    const newData = {
      team1: teams[0].winningTeamId._id,
      team2: teams[1].winningTeamId._id,
      date: data?.startDate,
      time: [
        {
          startTime: data?.starttime,
          endTime: data?.endtime
        }
      ],
      location: data?.location,
      league: leagueId,
      matchType: "Final"
    }
    try {
      const response = await startFinals(leagueId, newData)
      if (response.status === "SUCCESS") {
        toast.success("Finals Started")
        reset()
        setTeams([])
        isFinalsStarted(response?.leagueFixture?.finalsStarted)
      }
    } catch (error) {
      console.log(error)
    }
  }

  if (isFinalsStarted) {
    return (
      <div className='w-full flex items-center justify-center py-20 px-4'>
        {
          winnerTeam?.teamName ?
            <div className="text-center">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className='text-xl text-slate-200'>Winner <br /> <span className='text-yellow-500 text-3xl font-bold mt-2 block'>{winnerTeam?.teamName}</span></h1>
            </div>
            :
            <div className="text-center">
              <Flag className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h1 className='text-xl font-bold text-orange-500'>Final Match results are not calculated yet</h1>
            </div>
        }
      </div>
    )
  }

  if (teams.length < 2) {
    return (
      <div className='w-full flex items-center justify-center py-20 px-4'>
        <h1 className='text-xl text-orange-400 font-semibold'>Semi-Final Results are not calculated yet...</h1>
      </div>
    )
  }


  return (
    <div className='w-full max-w-7xl mx-auto flex flex-col items-center py-6 sm:py-8 px-4'>
      {/* Header */}
      <div className='w-full flex flex-col items-center mb-8'>
        <div className='p-3 bg-yellow-900/20 rounded-full border border-yellow-700/50 mb-3'>
          <Trophy className='w-8 h-8 text-yellow-500' />
        </div>
        <h1 className='text-2xl sm:text-3xl font-bold text-white'>The Finals</h1>
        <p className='text-slate-400 mt-2'>Schedule the final showdown</p>
      </div>

      <div className='w-full max-w-2xl bg-[#1e293b] border border-slate-700 py-8 px-6 rounded-xl shadow-lg'>
        <form className='w-full' onSubmit={handleSubmit(handleStartFinals)}>
          <div className="w-full flex flex-col items-center">

            {/* Teams Display */}
            <div className="flex w-full justify-center items-center gap-4 mb-8">
              {teams.length > 0 && teams.map((team, index) => (
                <React.Fragment key={team._id}>
                  <div className='flex-1 p-4 bg-slate-800 border border-slate-700 rounded-lg text-center'>
                    <span className='text-lg font-bold text-slate-200'>{team.winningTeamId.teamName}</span>
                  </div>
                  {index === 0 && <span className="text-xl font-bold text-orange-500">VS</span>}
                </React.Fragment>
              ))}
            </div>

            <div className="w-full space-y-4">
              {/* Date */}
              <div className="w-4/5 mx-auto">
                <Label htmlFor="startDate" className="text-xs font-bold text-slate-400">Date</Label>
                <Input type="date" className="w-full h-10 border-slate-700 rounded bg-[#0f172a] text-slate-200"
                  {...register('startDate', {
                    required: {
                      value: true,
                      message: "Date is required"
                    }
                  })} />
                <p className="text-red-500 text-xs italic mt-1">
                  {errors?.startDate?.message}
                </p>
              </div>

              {/* Time */}
              <div className="flex justify-between w-4/5 mx-auto gap-4">
                <div className='flex-1'>
                  <Label htmlFor="startTime" className="text-xs font-bold text-slate-400">StartTime</Label>
                  <Input type="time" className="w-full rounded h-10 bg-[#0f172a] border-slate-700 text-slate-200" {...register('starttime', {
                    required: {
                      value: true,
                      message: "Start Time is required"
                    }
                  })} />
                  <p className="text-red-500 text-xs italic mt-1">
                    {errors?.starttime?.message}
                  </p>
                </div>
                <div className='flex-1'>
                  <Label htmlFor="endTime" className="text-xs font-bold text-slate-400">EndTime</Label>
                  <Input type="time" className="w-full rounded h-10 bg-[#0f172a] border-slate-700 text-slate-200" {...register('endtime', {
                    required: {
                      value: true,
                      message: "End Time is required"
                    }
                  })} />
                  <p className="text-red-500 text-xs italic mt-1">
                    {errors?.endtime?.message}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="w-4/5 mx-auto">
                <Label htmlFor="location" className="text-xs font-bold text-slate-400">Location</Label>
                <Input type="text" className="w-full h-10 bg-[#0f172a] border-slate-700 text-slate-200 rounded"
                  placeholder="Enter location"
                  {...register('location', {
                    required: {
                      value: true,
                      message: "Location is required"
                    }
                  })} />
                <p className="text-red-500 text-xs italic mt-1">
                  {errors?.location?.message}
                </p>
              </div>
            </div>

            <Button className='w-4/5 h-12 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-bold mt-10 shadow-lg' type='submit'>
              Start Finals Match
            </Button>
          </div>
        </form>
      </div >
    </div >
  )
}

export default Finals