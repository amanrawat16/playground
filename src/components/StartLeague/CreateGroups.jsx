import React, { useState } from 'react';
import { Sparkles, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createGroup, AddTeamtoGroups } from '../../services/api';
import { toast } from 'react-toastify';
import { Label } from '@/components/ui/label';

function CreateGroups({ approvedTeams, handleNextComponent, fixtureId, handleAddGroups, setFixtureGroups, isCreateGroupsDisabled, setIsCreateGroupsDisabled, fixtureGroups }) {
    const [numberOfGroups, setNumberOfGroups] = useState('');
    const [groups, setGroups] = useState([]); // Array of { name: '', teams: [] }
    const [isLoading, setIsLoading] = useState(false);

    // If groups already created and saved (user moved to next step), show read-only view
    if (fixtureGroups && fixtureGroups.length > 0 && isCreateGroupsDisabled) {
        return (
            <div className="w-full max-w-6xl mx-auto py-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Created Groups</h2>
                    <p className="text-sm text-slate-400">These groups have been saved and teams assigned</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {fixtureGroups.map((group, index) => (
                        <div key={index} className="bg-[#1e293b] border border-slate-700 rounded-lg p-4">
                            <h3 className="text-lg font-bold text-or ange-500 mb-3 pb-2 border-b border-slate-700">
                                {group.name}
                            </h3>
                            <div className="space-y-2">
                                {group.teams?.map((teamObj, tindex) => (
                                    <div key={tindex} className="bg-[#0f172a] border border-slate-700 rounded px-3 py-2 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                        <span className="text-sm text-slate-200">{teamObj.team?.teamName || 'Unknown Team'}</span>
                                    </div>
                                ))}
                                {(!group.teams || group.teams.length === 0) && (
                                    <p className="text-xs text-slate-500 italic">No teams assigned</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                    <p className="text-green-400 text-sm flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        Groups saved successfully. Proceed to next step.
                    </p>
                </div>
            </div>
        );
    }

    const handleAutoSuggest = () => {
        const num = parseInt(numberOfGroups);
        if (!num || num <= 0) {
            toast.error("Please enter a valid number of groups");
            return;
        }
        if (num > approvedTeams.length) {
            toast.error(`Cannot create more groups than teams (${approvedTeams.length})`);
            return;
        }

        const newGroups = Array.from({ length: num }, (_, i) => ({
            name: `Group ${String.fromCharCode(65 + i)}`,
            teams: []
        }));

        // Distribute teams (Round Robin style distribution)
        approvedTeams.forEach((teamObj, index) => {
            const groupIndex = index % num;
            newGroups[groupIndex].teams.push(teamObj);
        });

        setGroups(newGroups);
    };

    const handleGroupNameChange = (index, newName) => {
        const updated = [...groups];
        updated[index].name = newName;
        setGroups(updated);
    };

    const handleMoveTeam = (teamId, fromGroupIndex, toGroupIndex) => {
        if (fromGroupIndex === toGroupIndex) return;

        const newGroups = [...groups];
        const teamToMoveIndex = newGroups[fromGroupIndex].teams.findIndex(t => t.team._id === teamId);
        const teamToMove = newGroups[fromGroupIndex].teams[teamToMoveIndex];

        // Remove from old
        newGroups[fromGroupIndex].teams.splice(teamToMoveIndex, 1);
        // Add to new
        newGroups[toGroupIndex].teams.push(teamToMove);

        setGroups(newGroups);
    };

    const handleSaveGroups = async () => {
        if (groups.length === 0) {
            toast.error("Please create groups first");
            return;
        }
        if (groups.some(g => g.name.trim() === '')) {
            toast.error("All groups must have a name");
            return;
        }

        setIsLoading(true);
        try {
            const groupsPayload = groups.map(g => ({
                groupName: g.name,
                teams: g.teams.map(t => ({ team: t.team, status: 'Approved' }))
            }));

            const response = await createGroup({
                fixtureId,
                groups: groupsPayload
            });

            if (response.status === "SUCCESS") {
                toast.success("Groups created and teams assigned successfully!");
                setFixtureGroups(response.data);
                setIsCreateGroupsDisabled(true);

                const createdGroups = response.data;
                await AddTeamtoGroups(createdGroups);

                handleAddGroups(2);
                handleNextComponent();
            } else {
                toast.error(response.error || "Failed to create groups");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error creating groups");
        } finally {
            setIsLoading(false);
        }
    };

    if (isCreateGroupsDisabled) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-[#1e293b] rounded-xl border border-dashed border-slate-700">
                <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-200">Groups Created Successfully!</h3>
                <p className="text-slate-400 mt-2">Teams have been assigned. Proceed to the next step.</p>
                <Button className="mt-6 bg-orange-600 hover:bg-orange-700 text-white" onClick={handleNextComponent}>
                    Continue to Matches
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto py-6">
            <div className="flex flex-col gap-6">
                {/* Configuration Section */}
                <div className="bg-[#1e293b] p-6 rounded-lg border border-slate-700 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-end gap-4">
                        <div className="w-full sm:w-1/3">
                            <Label className="mb-2 block text-slate-300">Number of Groups</Label>
                            <Input
                                type="number"
                                min="1"
                                max={approvedTeams.length}
                                value={numberOfGroups}
                                onChange={(e) => setNumberOfGroups(e.target.value)}
                                placeholder="E.g. 4"
                                className="bg-[#0f172a] border-slate-700 text-slate-200"
                            />
                        </div>
                        <div className="w-full sm:w-auto">
                            <Button onClick={handleAutoSuggest} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Auto Suggest & Distribute
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Groups Preview Section */}
                {groups.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map((group, groupIndex) => (
                            <div key={groupIndex} className="bg-[#1e293b] rounded-lg border border-slate-700 shadow-sm overflow-hidden">
                                <div className="p-3 bg-[#0f172a] border-b border-slate-700">
                                    <Input
                                        value={group.name}
                                        onChange={(e) => handleGroupNameChange(groupIndex, e.target.value)}
                                        className="font-semibold bg-transparent border-transparent hover:border-slate-600 focus:bg-[#1e293b] text-slate-200 h-8"
                                    />
                                    <p className="text-xs text-slate-500 mt-1 px-3">{group.teams.length} teams</p>
                                </div>
                                <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {group.teams.map((team, teamIndex) => (
                                        <div key={team.team._id} className="flex items-center justify-between p-2 bg-[#1e293b] border border-slate-700 rounded shadow-sm text-sm group-hover:border-slate-600">
                                            <span className="truncate flex-1 font-medium text-slate-300">{team.team.teamName}</span>

                                            {/* Move Dropdown */}
                                            <select
                                                className="ml-2 text-xs border border-slate-600 rounded bg-[#0f172a] text-slate-300 p-1"
                                                value={groupIndex}
                                                onChange={(e) => handleMoveTeam(team.team._id, groupIndex, parseInt(e.target.value))}
                                            >
                                                {groups.map((g, gi) => (
                                                    <option key={gi} value={gi}>{g.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    ))}
                                    {group.teams.length === 0 && (
                                        <div className="text-center py-4 text-xs text-slate-500 italic">Empty Group</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                {groups.length > 0 && (
                    <div className="flex justify-end pt-4 border-t border-slate-700">
                        <Button
                            onClick={handleSaveGroups}
                            disabled={isLoading}
                            className="bg-orange-600 hover:bg-orange-700 text-white min-w-[200px]"
                        >
                            {isLoading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Create Groups & Assign Teams
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CreateGroups;