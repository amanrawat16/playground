import { ImCross } from "react-icons/im"


function StartRegularRounds({ approvedTeams, handleUnapproveTeam, isRegularRoundStarted, handleStartRegularRounds }) {
    return (
        <div className=' w-full h-full flex flex-col  items-center py-10'>
            <h1 className='text-2xl font-bold mb-5'>Teams</h1>
            <div className='w-2/3 border shadow-md rounded-md pb-5'>
                <table className='w-full h-auto '>
                    <thead className='h-12'>
                        <tr >
                            <th className='w-2/3 text-center'>Teams</th>
                            <th className='text-center'>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {approvedTeams?.length > 0 ? approvedTeams.map((team, i) => {
                            return (<tr className='text-center h-12' key={team._id}>
                                <td>{team.team.teamName}</td>
                                <td>
                                    <span className='border-4 border-green-600 bg-green-600 px-3 rounded-full h-full text-xs text-white'>{team.status}</span></td>
                                {!isRegularRoundStarted ? <td><ImCross className=' text-xs  cursor-pointer' onClick={() => handleUnapproveTeam(i)} /></td> : null}
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