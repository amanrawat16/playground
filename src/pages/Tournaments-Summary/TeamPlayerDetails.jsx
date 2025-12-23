import React, { useState } from "react";
import Pagination from "../../common/Pagination";
// -----------------------------------------------------------------------------------------------
const TeamPlayerDetails = ({ teamPlayersData }) => {
  const [paginatedTeamPlayersList, setPaginatedTeamPlayersList] = useState([]);
  console.log("teamPlayersData::: ", teamPlayersData);
  return (
    <>
      <div className="-mx-4 sm:-mx-8 px-4 py-4 overflow-x-auto">
        <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2  text-center">
                  S.No.
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2  text-center">
                  Player Name
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2  text-center">
                  Email Address
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2  text-center">
                  Position
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100  text-xs font-semibold text-gray-700  uppercase tracking-wider border-r-2  text-center">
                  Jersey Number
                </th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(paginatedTeamPlayersList) &&
              paginatedTeamPlayersList?.length > 0 ? (
                paginatedTeamPlayersList.map((teamPlayer, i) => {
                  return (
                    <tr key={teamPlayer?._id || i}>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
                        <p className="text-gray-900 whitespace-no-wrap font-bold">
                          {i + 1}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
                        <p className="text-gray-900 whitespace-no-wrap font-bold">
                          {teamPlayer?.playerName}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
                        <p className="text-gray-900 whitespace-no-wrap font-bold">
                          {teamPlayer?.email}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
                        <p className="text-gray-900 whitespace-no-wrap font-bold">
                          {teamPlayer?.position}
                        </p>
                      </td>
                      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm border-r-2 text-center">
                        <p className="text-gray-900 whitespace-no-wrap font-bold">
                          {teamPlayer?.jerseyNumber}
                        </p>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <>
                  <h2 className="font-bold p-5 text-lg ">No Team Found</h2>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {teamPlayersData?.players?.length > 0 && (
        <Pagination
          items={teamPlayersData?.players}
          itemsPerPage={5}
          sendDataToParent={(data) => setPaginatedTeamPlayersList(data)}
        />
      )}
    </>
  );
};

export default TeamPlayerDetails;
