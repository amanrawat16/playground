

function QuaterFinals({ approvedTeams }) {
    return (
        <div className='w-full h-auto'>
            <h1 className='text-2xl font-bold text-center my-10'>
                QuaterFinals
            </h1>
            {
                approvedTeams?.length > 0 &&
                <div className="w-full border py-10">
                    <table className="w-4/5 mx-auto text-center">
                        <thead className="h-12">
                            <th>Name</th>
                            <th>Matches Played</th>
                            <th>Score</th>
                            <th></th>
                        </thead>
                        <tbody>
                            {
                                approvedTeams?.map((team) => (
                                    < tr key={team._id} className="h-12">
                                        <td>{team.team.teamName}</td>
                                        <td>{team.team.totalMatchesPlayed}</td>
                                        <td>{team.team.pointsScored}</td>
                                        <td>
                                            <button className="border px-4 py-1 rounded-md text-white bg-black">Move to SemiFinals</button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            }
        </div >
    )
}

export default QuaterFinals