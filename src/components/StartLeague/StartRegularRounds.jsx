import { X, CheckCircle2, Users, Play } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

function StartRegularRounds({ approvedTeams, handleUnapproveTeam, isRegularRoundStarted, handleStartRegularRounds, LeagueTeams }) {

    const handleUnapprove = (id) => {
        const teamIndex = LeagueTeams.findIndex((team) => team._id === id)
        handleUnapproveTeam(teamIndex)
    }

    return (
        <div className='w-full min-h-[400px] flex flex-col items-center py-6 sm:py-8 px-4'>
            {/* Header */}
            <div className='w-full max-w-5xl mb-6'>
                <div className='flex items-center gap-3 mb-2'>
                    <Users className='w-6 h-6 sm:w-7 sm:h-7 text-orange-600' />
                    <h1 className='text-xl sm:text-2xl font-bold text-white'>Approved Teams</h1>
                </div>
                <p className='text-sm text-slate-400 ml-9'>
                    {approvedTeams?.length || 0} {approvedTeams?.length === 1 ? 'team' : 'teams'} approved
                </p>
            </div>

            {/* Desktop Table View */}
            {approvedTeams?.length > 0 ? (
                <>
                    <div className='hidden lg:block w-full max-w-5xl border border-slate-700 shadow-lg rounded-lg overflow-hidden bg-[#1e293b]'>
                        <Table>
                            <TableHeader>
                                <TableRow className='bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-600 hover:to-orange-500 border-b-0'>
                                    <TableHead className='text-white font-semibold text-center w-[45%]'>Team Name</TableHead>
                                    <TableHead className='text-white font-semibold text-center w-[35%]'>Status</TableHead>
                                    {!isRegularRoundStarted && (
                                        <TableHead className='text-white font-semibold text-center w-[20%]'>Action</TableHead>
                                    )}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {approvedTeams.map((team) => (
                                    <TableRow key={team._id} className='hover:bg-slate-700/50 transition-colors border-b border-slate-700'>
                                        <TableCell className='text-center font-medium text-slate-200'>{team.team.teamName}</TableCell>
                                        <TableCell className='text-center'>
                                            <span className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-900/30 text-green-400 text-sm font-medium border border-green-800'>
                                                <CheckCircle2 className='w-4 h-4' />
                                                {team.status}
                                            </span>
                                        </TableCell>
                                        {!isRegularRoundStarted && (
                                            <TableCell className='text-center'>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className='h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20'
                                                    onClick={() => handleUnapprove(team._id)}
                                                >
                                                    <X className='w-4 h-4' />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className='lg:hidden w-full max-w-md space-y-3 mb-6'>
                        {approvedTeams.map((team) => (
                            <div key={team._id} className='bg-[#1e293b] border border-slate-700 rounded-lg shadow-sm p-4'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex-1'>
                                        <p className='font-semibold text-white mb-2'>{team.team.teamName}</p>
                                        <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-900/30 text-green-400 text-sm font-medium border border-green-800'>
                                            <CheckCircle2 className='w-3.5 h-3.5' />
                                            {team.status}
                                        </span>
                                    </div>
                                    {!isRegularRoundStarted && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className='h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20 ml-2'
                                            onClick={() => handleUnapprove(team._id)}
                                        >
                                            <X className='w-4 h-4' />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className='w-full max-w-md flex flex-col items-center justify-center py-12 px-4 bg-[#1e293b] rounded-lg border border-dashed border-slate-700'>
                    <AlertCircle className='w-12 h-12 text-slate-600 mb-4' />
                    <p className='text-slate-300 text-center font-medium'>No approved teams yet</p>
                    <p className='text-slate-500 text-sm text-center mt-1'>Approve teams from the approval section above</p>
                </div>
            )}

            {/* Action Button */}
            <div className='w-full max-w-5xl mt-6 sm:mt-8'>
                <Button
                    onClick={handleStartRegularRounds}
                    disabled={isRegularRoundStarted || approvedTeams?.length === 0}
                    className='w-full sm:w-auto sm:min-w-[240px] h-12 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:from-gray-400 disabled:hover:to-gray-400'
                >
                    {isRegularRoundStarted ? (
                        <>
                            <CheckCircle2 className='w-5 h-5 mr-2' />
                            Regular Rounds Started
                        </>
                    ) : (
                        <>
                            <Play className='w-5 h-5 mr-2' />
                            Start Regular Rounds
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}

export default StartRegularRounds