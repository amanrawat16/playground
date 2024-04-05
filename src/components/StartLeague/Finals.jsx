import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { startFinals } from '../../services/api';
import { toast } from 'react-toastify'

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
      <div className='w-full flex items-center justify-center py-20'>
        {
          winnerTeam?.teamName ?
            <h1 className='text-xl'>Winner - <span className='text-green-500 text-2xl font-bold'>{winnerTeam?.teamName}</span></h1>
            :
            <h1 className='text-xl font-bold text-red-500'>Final Match results are not calulated yet</h1>
        }
      </div>
    )
  }

  if (teams.length < 2) {
    return (
      <div className='w-full flex items-center justify-center py-20'>
        <h1 className='text-xl text-red-500'>SemiFinal Results are not calculated yet...</h1>
      </div>
    )
  }


  return (
    <div className='w-full py-10 flex flex-col items-center'>
      <h1 className=' text-2xl font-bold'>Finals</h1>
      <div className='border w-1/3 py-10 rounded-xl shadow-lg'>
        <form className='w-full' onSubmit={handleSubmit(handleStartFinals)}>
          <div className=" w-full h-5/6 flex flex-col items-center">
            <div className="flex w-[88%]  h-12 justify-around px-2">
              {
                teams.length > 0 && teams.map((team) => {
                  return (
                    <div key={team._id} className='w-[45%] rounded flex bg-slate-200 justify-center items-center'>
                      < p className='text-md'> {team.winningTeamId.teamName}</p>
                    </div>
                  )
                })
              }
            </div>
            <div className="w-4/5 my-2">
              <label htmlFor="startDate" className="text-xs font-bold">Date</label>
              <input type="date" name="startDate1" className="w-full mx-auto h-10 border rounded bg-slate-200"
                {...register('startDate', {
                  required: {
                    value: true,
                    message: "Date is required"
                  }
                })} />
              <p className="text-red-500 text-xs italic">
                {
                  errors?.startDate?.message
                }
              </p>
            </div>
            <div className="flex justify-around w-full my-2 px-2">
              <div className='w-1/3'>
                <label htmlFor="startTime" className="text-xs font-bold">StartTime</label>
                <input type="time" className="w-full rounded h-10 bg-slate-200" {...register('starttime', {
                  required: {
                    value: true,
                    message: "Start Time is required"
                  }
                })} />
                <p className="text-red-500 text-xs italic">
                  {errors?.starttime?.message}
                </p>
              </div>
              <div className='w-1/3'>
                <label htmlFor="startTime" className="text-xs font-bold">EndTime</label>
                <input type="time" className="w-full rounded h-10 bg-slate-200" {...register('endtime', {
                  required: {
                    value: true,
                    message: "End Time is required"
                  }
                })} />
                <p className="text-red-500 text-xs italic">
                  {errors?.endtime?.message}
                </p>
              </div>
            </div>
            <div className="w-4/5 my-2">
              <label htmlFor="location" className="tex-xs font-bold">Location</label>
              <input type="text" name="location1" className="w-full h-10 bg-slate-200 rounded"
                {...register('location', {
                  required: {
                    value: true,
                    message: "Location is required"
                  }
                })} />
              <p className="text-red-500 text-xs italic">
                {errors?.location?.message}
              </p>
            </div>
            <button className='w-5/6 h-12 border rounded-md  text-white bg-black mt-10' type='submit'>Start Finals</button>
          </div>
        </form>
      </div >
    </div >
  )
}

export default Finals