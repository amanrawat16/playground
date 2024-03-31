import React, { useEffect, useState } from "react";
import Pagination from "../../common/Pagination";
// ------------------------------------------------------------------------------------------
const LeagueWiseTournamentSummary = ({ leagueWiseSummany }) => {
  const [paginatedRusherItemsList, setPaginatedRusherItemsList] = useState([]);
  const [paginatedAttackersItemsList, setPaginatedAttackersItemsList] =
    useState([]);
  const [paginatedDefendersItemsList, setPaginatedDefendersItemsList] =
    useState([]);
  const [paginatedQbItemsList, setPaginatedQbItemsList] = useState([]);

  // Function to sort the data for a specific category
  function sortCategory(category) {
    return leagueWiseSummany
      .slice()
      .sort((a, b) => b[category].maxPoints - a[category].maxPoints);
  }

  // Sorting and displaying results for each category
  const categories = ["bestRusher", "bestAttacker", "bestDefender", "bestQB"];

  let sortedDataCategoryWise = [];

  categories.forEach((category) => {
    const sortedData = sortCategory(category);
    sortedDataCategoryWise = [
      ...sortedDataCategoryWise,
      { [category]: sortedData },
    ];
  });

  console.log("sortedDataCategoryWise::: ", sortedDataCategoryWise);

  useEffect(() => {
    if (paginatedRusherItemsList) {
      // console.log("paginatedRusherItemsList::: ", paginatedRusherItemsList);
    }
  }, [paginatedRusherItemsList]);

  useEffect(() => {
    if (paginatedAttackersItemsList) {
      // console.log(
      //   "paginatedAttackersItemsList::: ",
      //   paginatedAttackersItemsList
      // );
    }
  }, [paginatedAttackersItemsList]);

  useEffect(() => {
    if (paginatedDefendersItemsList) {
      // console.log(
      //   "paginatedDefendersItemsList::: ",
      //   paginatedDefendersItemsList
      // );
    }
  }, [paginatedDefendersItemsList]);

  useEffect(() => {
    if (paginatedQbItemsList) {
      // console.log("paginatedQbItemsList::: ", paginatedQbItemsList);
    }
  }, [paginatedQbItemsList]);

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
                      paginatedRusherItemsList?.map((sortData) => {
                        return (
                          sortData?.bestRusher?.bestPlayer &&
                          sortData?.bestRusher?.maxPoints > 0 && (
                            <tr>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <div className="flex">
                                  <div className="ml-3">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                      {sortData?.bestRusher?.bestPlayer}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {sortData?.bestRusher?.maxPoints}
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
            {sortedDataCategoryWise?.[0]?.bestRusher?.length > 0 && (
              <Pagination
                items={sortedDataCategoryWise?.[0]?.bestRusher}
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
                      paginatedAttackersItemsList?.map((sortData) => {
                        return (
                          sortData?.bestAttacker?.bestPlayer &&
                          sortData?.bestAttacker?.maxPoints > 0 && (
                            <tr>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <div className="flex">
                                  <div className="ml-3">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                      {sortData?.bestAttacker?.bestPlayer}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {sortData?.bestAttacker?.maxPoints}
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
            {sortedDataCategoryWise?.[1]?.bestAttacker?.length > 0 && (
              <Pagination
                items={sortedDataCategoryWise?.[1]?.bestAttacker}
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
                      paginatedDefendersItemsList?.map((sortData) => {
                        return (
                          sortData?.bestDefender?.bestPlayer &&
                          sortData?.bestDefender?.maxPoints > 0 && (
                            <tr>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <div className="flex">
                                  <div className="ml-3">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                      {sortData?.bestDefender?.bestPlayer}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {sortData?.bestDefender?.maxPoints}
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
            {sortedDataCategoryWise?.[2]?.bestDefender?.length > 0 && (
              <Pagination
                items={sortedDataCategoryWise?.[2]?.bestDefender}
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
                      paginatedQbItemsList?.map((sortData) => {
                        return (
                          sortData?.bestQB?.bestPlayer &&
                          sortData?.bestQB?.maxPoints > 0 && (
                            <tr>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <div className="flex">
                                  <div className="ml-3">
                                    <p className="text-gray-900 whitespace-no-wrap">
                                      {sortData?.bestQB?.bestPlayer}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {sortData?.bestQB?.maxPoints}
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
            {sortedDataCategoryWise?.[3]?.bestQB?.length > 0 && (
              <Pagination
                items={sortedDataCategoryWise?.[3]?.bestQB}
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

export default LeagueWiseTournamentSummary;
