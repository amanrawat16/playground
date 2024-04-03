import React, { useState } from 'react'
import { useForm } from 'react-hook-form';

function Finals({ finalTeams, leagueId, isFinalsStarted, setIsFinalsStarted }) {
  const [teams, setTeams] = useState(finalTeams)
  console.log(teams)
  const {
    register,
    handleSubmit, reset,
    formState: { errors },
  } = useForm();

  const handleStartFinals = (data) => {
    console.log(data)
  }
  return (
    <div className='w-full py-10 flex flex-col items-center'>
      <h1 className=' text-2xl font-bold'>Finals</h1>
      <div className='border w-1/3 py-10 rounded-xl shadow-lg'>
        <form className='w-full' onSubmit={handleSubmit(handleStartFinals)}>
          <div className=" w-full h-5/6 flex flex-col items-center">
            <div className="flex w-[88%]  h-12 justify-around px-2">
              <input type="text" placeholder='team1' className='h-full w-[47%]  rounded bg-slate-200 px-2' />
              <input type="text" placeholder='team2' className='h-full w-[47%]  rounded bg-slate-200 px-2' />
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
      </div>
    </div>
  )
}

export default Finals