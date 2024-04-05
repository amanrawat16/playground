import { ImCross } from "react-icons/im"


function StartRegularRounds({ approvedTeams, handleUnapproveTeam, isRegularRoundStarted, handleStartRegularRounds, LeagueTeams }) {

    const handleUnapprove = (id) => {
        const teamIndex = LeagueTeams.findIndex((team) => team._id === id)
        handleUnapproveTeam(teamIndex)
    }
    return (
        <div className=' w-full h-full flex flex-col  items-center py-10'>
            <h1 className='text-2xl font-bold mb-5'>Teams</h1>
            <div className='w-1/3 xs:w-full border shadow-md rounded-md pb-5'>
                <table className='w-full h-auto '>
                    <thead className='h-12'>
                        <tr >
                            <th className='w-[40%] text-center'>Teams</th>
                            <th className='w-[40%] text-center'>Status</th>
                            <th className='w-[20%] text-center'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {approvedTeams?.length > 0 ? approvedTeams.map((team) => {
                            return (<tr className='text-center h-12' key={team._id}>
                                <td>{team.team.teamName}</td>
                                <td>
                                    <span className='border border-green-500 bg-green-100 px-3 py-1 rounded-md h-full text-xs text-green-500'>{team.status}</span></td>
                                {!isRegularRoundStarted ? <td className="text-center "><ImCross className=' text-xs  cursor-pointer text-red-500 mx-auto' onClick={() => handleUnapprove(team._id)} /></td> : null}
                            </tr>)
                        }) : null
                        }
                    </tbody>
                </table>
            </div>
            <button className='w-1/3 border h-14 rounded-md bg-black text-white hover:bg-slate-700 mt-7 disabled:bg-slate-400' onClick={handleStartRegularRounds} disabled={isRegularRoundStarted}>Start Regular Rounds</button>
        </div >
    )
}

export default StartRegularRounds