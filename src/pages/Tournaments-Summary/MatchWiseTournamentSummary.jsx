import React, { useEffect, useState } from "react";
import Pagination from "../../common/Pagination";
// ------------------------------------------------------------------------------
const MatchWiseTournamentSummary = ({ selectedMatch, matchWiseSummany }) => {
  // console.log("selectedMatch::: ", selectedMatch);
  // console.log("matchWiseSummany::: ", matchWiseSummany);

  const [paginatedRusherItemsList, setPaginatedRusherItemsList] = useState([]);
  const [paginatedAttackersItemsList, setPaginatedAttackersItemsList] =
    useState([]);
  const [paginatedDefendersItemsList, setPaginatedDefendersItemsList] =
    useState([]);
  const [paginatedQbItemsList, setPaginatedQbItemsList] = useState([]);

  const [categoryWiseSortedData, setCategoryWiseSortedData] = useState([]);

  useEffect(() => {
    if (
      selectedMatch &&
      matchWiseSummany?.teamFirstPlayers?.length > 0 &&
      matchWiseSummany?.teamSecondPlayers?.length > 0
    ) {
      const analysisData = [
        ...matchWiseSummany?.teamFirstPlayers,
        ...matchWiseSummany?.teamSecondPlayers,
      ]?.map((player) => {
        return {
          playerName: player?.playerName,
          scored: player?.matchWiseDetails?.[0]?.calculatedValue,
        };
      });
      // console.log("analysisData::: ", analysisData);

      // -----------------------------------------------------------------------

      // Sort by rusherPointsScored in descending order
      const sortedByRusher = analysisData
        .slice()
        .sort(
          (a, b) =>
            b?.scored?.rusherPointsScored - a?.scored?.rusherPointsScored
        );

      // Sort by defencePointsScored in descending order
      const sortedByDefence = analysisData
        .slice()
        .sort(
          (a, b) =>
            b?.scored?.defencePointsScored - a?.scored?.defencePointsScored
        );

      // Sort by attackerPointsScored in descending order
      const sortedByAttacker = analysisData
        .slice()
        .sort(
          (a, b) =>
            b?.scored?.attackerPointsScored - a?.scored?.attackerPointsScored
        );

      // Sort by qbPointsScored in descending order
      const sortedByQB = analysisData
        .slice()
        .sort((a, b) => b?.scored?.qbPointsScored - a?.scored?.qbPointsScored);

      // console.log("Sorted by Rusher Points:", sortedByRusher);
      // console.log("Sorted by Defence Points:", sortedByDefence);
      // console.log("Sorted by Attacker Points:", sortedByAttacker);
      // console.log("Sorted by QB Points:", sortedByQB);

      // -----------------------------------------------------------------------

      setCategoryWiseSortedData([
        {
          sortedByRusher: sortedByRusher,
          sortedByDefence: sortedByDefence,
          sortedByAttacker: sortedByAttacker,
          sortedByQB: sortedByQB,
        },
      ]);
    }
  }, [matchWiseSummany, selectedMatch]);

  useEffect(() => {
    // console.log("categoryWiseSortedData::: ", categoryWiseSortedData);
  }, [categoryWiseSortedData]);

  // -------------------------------------------------------------------------------------
  return (
    <>
      <div className="grid md:grid-cols-2 grid-cols-1">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="py-8">
            <div>
              <h2 className="text-2xl font-semibold leading-tight text-center">
                Rushers
              </h2>
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
              <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2">
                        Players
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(paginatedRusherItemsList) &&
                    paginatedRusherItemsList?.length > 0 ? (
                      paginatedRusherItemsList?.map((ele) => {
                        return (
                          ele?.playerName &&
                          ele?.scored?.rusherPointsScored > 0 && (
                            <tr>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <div className="flex">
                                  <div className="ml-3">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                      {ele?.playerName}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {ele?.scored?.rusherPointsScored}
                                </p>
                              </td>
                            </tr>
                          )
                        );
                      })
                    ) : (
                      <h3 className="p-4">No Data Found</h3>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {categoryWiseSortedData?.[0]?.sortedByRusher?.length > 0 && (
              <Pagination
                items={categoryWiseSortedData?.[0]?.sortedByRusher}
                itemsPerPage={5}
                sendDataToParent={(data) => setPaginatedRusherItemsList(data)}
              />
            )}
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-8">
          <div className="py-8">
            <div>
              <h2 className="text-2xl font-semibold leading-tight  text-center">
                Attackers
              </h2>
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
              <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2">
                        Players
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(paginatedAttackersItemsList) &&
                    paginatedAttackersItemsList?.length > 0 ? (
                      paginatedAttackersItemsList?.map((ele) => {
                        return (
                          ele?.playerName &&
                          ele?.scored?.attackerPointsScored > 0 && (
                            <tr>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <div className="flex">
                                  <div className="ml-3">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                      {ele?.playerName}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {ele?.scored?.attackerPointsScored}
                                </p>
                              </td>
                            </tr>
                          )
                        );
                      })
                    ) : (
                      <h3 className="p-4">No Data Found</h3>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {categoryWiseSortedData?.[0]?.sortedByAttacker?.length > 0 && (
              <Pagination
                items={categoryWiseSortedData?.[0]?.sortedByAttacker}
                itemsPerPage={5}
                sendDataToParent={(data) =>
                  setPaginatedAttackersItemsList(data)
                }
              />
            )}
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-8">
          <div className="py-8">
            <div>
              <h2 className="text-2xl font-semibold leading-tight text-center">
                Defenders
              </h2>
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
              <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2">
                        Players
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(paginatedDefendersItemsList) &&
                    paginatedDefendersItemsList?.length > 0 ? (
                      paginatedDefendersItemsList?.map((ele) => {
                        return (
                          ele?.playerName &&
                          ele?.scored?.defencePointsScored > 0 && (
                            <tr>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <div className="flex">
                                  <div className="ml-3">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                      {ele?.playerName}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {ele?.scored?.defencePointsScored}
                                </p>
                              </td>
                            </tr>
                          )
                        );
                      })
                    ) : (
                      <h3 className="p-4">No Data Found</h3>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {categoryWiseSortedData?.[0]?.sortedByDefence?.length > 0 && (
              <Pagination
                items={categoryWiseSortedData?.[0]?.sortedByDefence}
                itemsPerPage={5}
                sendDataToParent={(data) =>
                  setPaginatedDefendersItemsList(data)
                }
              />
            )}
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-8">
          <div className="py-8">
            <div>
              <h2 className="text-2xl font-semibold leading-tight text-center">
                QBs
              </h2>
            </div>
            <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
              <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full leading-normal">
                  <thead>
                    <tr>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2">
                        Players
                      </th>
                      <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2">
                        Points
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(paginatedQbItemsList) &&
                    paginatedQbItemsList?.length > 0 ? (
                      paginatedQbItemsList?.map((ele) => {
                        return (
                          ele?.playerName &&
                          ele?.scored?.qbPointsScored > 0 && (
                            <tr>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <div className="flex">
                                  <div className="ml-3">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                      {ele?.playerName}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {ele?.scored?.qbPointsScored}
                                </p>
                              </td>
                            </tr>
                          )
                        );
                      })
                    ) : (
                      <h3 className="p-4">No Data Found</h3>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {categoryWiseSortedData?.[0]?.sortedByQB?.length > 0 && (
              <Pagination
                items={categoryWiseSortedData?.[0]?.sortedByQB}
                itemsPerPage={5}
                sendDataToParent={(data) => setPaginatedQbItemsList(data)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MatchWiseTournamentSummary;
