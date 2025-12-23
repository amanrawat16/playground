import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import moment from "moment";
import { useForm } from "react-hook-form";
import { ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { TfiViewListAlt } from "react-icons/tfi";
import {
  Calendar,
  MapPin,
  Trophy,
  Users,
  Clock,
  X,
  Award
} from "lucide-react";

const baseURL = import.meta.env.VITE_BASE_URL;

export default function MatchModals({ viewDetails }) {
  const [isShowing, setIsShowing] = useState(false);
  const [showSummaryForm, setShowSummaryForm] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm();

  const wrapperRef = useRef(null);

  const handleSummary = (data) => {
    // console.log(data);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsShowing(false);
      }
    }
    if (isShowing) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isShowing, wrapperRef]);

  useEffect(() => {
    let html = document.querySelector("html");

    if (html) {
      if (isShowing && html) {
        html.style.overflowY = "hidden";

        const focusableElements =
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

        const modal = document.querySelector("#match-modal");

        if (modal) {
          const firstFocusableElement =
            modal.querySelectorAll(focusableElements)[0];

          const focusableContent = modal.querySelectorAll(focusableElements);

          const lastFocusableElement =
            focusableContent[focusableContent.length - 1];

          const handleKeyDown = function (e) {
            if (e.keyCode === 27) {
              setIsShowing(false);
            }

            let isTabPressed = e.key === "Tab" || e.keyCode === 9;

            if (!isTabPressed) {
              return;
            }

            if (e.shiftKey) {
              if (document.activeElement === firstFocusableElement) {
                lastFocusableElement.focus();
                e.preventDefault();
              }
            } else {
              if (document.activeElement === lastFocusableElement) {
                firstFocusableElement.focus();
                e.preventDefault();
              }
            }
          };

          document.addEventListener("keydown", handleKeyDown);

          if (firstFocusableElement) {
            firstFocusableElement.focus();
          }

          return () => {
            document.removeEventListener("keydown", handleKeyDown);
          };
        }
      } else {
        html.style.overflowY = "visible";
      }
    }
  }, [isShowing]);

  const item = viewDetails?.item;

  return (
    <>
      <button
        onClick={() => setIsShowing(true)}
        className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-orange-400 bg-orange-900/20 border border-orange-700/50 rounded-lg hover:bg-orange-900/40 hover:text-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors duration-200"
        aria-label="View match details"
      >
        <TfiViewListAlt className="w-4 h-4 mr-1.5 sm:mr-2" />
        <span className="hidden sm:inline">View</span>
      </button>

      {isShowing && typeof document !== "undefined"
        ? ReactDOM.createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsShowing(false)}
            aria-labelledby="modal-title"
            aria-modal="true"
            role="dialog"
          >
            <div
              ref={wrapperRef}
              onClick={(e) => e.stopPropagation()}
              className="relative flex flex-col w-full max-w-2xl max-h-[90vh] bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
              id="match-modal"
              role="document"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-500 border-b border-orange-500/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h2 id="modal-title" className="text-lg sm:text-xl font-bold text-white">
                      Match Details
                    </h2>
                    <p className="text-xs sm:text-sm text-orange-100">
                      #{viewDetails?.index + 1} • {item?.matchType || 'Match'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsShowing(false)}
                  className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-orange-500"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Teams & Score Section */}
                  <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 sm:p-6 border border-slate-700">
                    <div className="space-y-4">
                      {/* Team 1 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <img
                            src={`${baseURL}/uploads/${item?.team1?.teamImage?.split("\\")[1]}`}
                            alt={item?.team1?.teamName}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg'
                            }}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-slate-600 shadow-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-base sm:text-lg font-bold text-white truncate">
                              {item?.team1?.teamName}
                            </p>
                            {item?.team1?.goalsScoredByTeam !== undefined && (
                              <p className="text-xs sm:text-sm text-slate-400">
                                Score: {item?.team1?.goalsScoredByTeam}
                              </p>
                            )}
                          </div>
                        </div>
                        {item?.winningTeam?.winningTeamId === item?.team1?._id && (
                          <div className="ml-3 flex-shrink-0">
                            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                          </div>
                        )}
                      </div>

                      {/* VS Divider */}
                      <div className="flex items-center justify-center py-2">
                        <div className="flex-1 border-t-2 border-slate-700"></div>
                        <span className="px-4 text-sm sm:text-base font-bold text-slate-500 uppercase">
                          VS
                        </span>
                        <div className="flex-1 border-t-2 border-slate-700"></div>
                      </div>

                      {/* Team 2 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <img
                            src={`${baseURL}/uploads/${item?.team2?.teamImage?.split("\\")[1]}`}
                            alt={item?.team2?.teamName}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://st4.depositphotos.com/14695324/25366/v/450/depositphotos_253661618-stock-illustration-team-player-group-vector-illustration.jpg'
                            }}
                            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-slate-600 shadow-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-base sm:text-lg font-bold text-white truncate">
                              {item?.team2?.teamName}
                            </p>
                            {item?.team2?.goalsScoredByTeam !== undefined && (
                              <p className="text-xs sm:text-sm text-slate-400">
                                Score: {item?.team2?.goalsScoredByTeam}
                              </p>
                            )}
                          </div>
                        </div>
                        {item?.winningTeam?.winningTeamId === item?.team2?._id && (
                          <div className="ml-3 flex-shrink-0">
                            <Award className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Final Score Display */}
                    {item?.winningTeam?.winningTeamId && (
                      <div className="mt-4 pt-4 border-t border-slate-700">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-2xl sm:text-3xl font-bold text-white">
                            {item?.team1?.goalsScoredByTeam || 0}
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-slate-500">-</span>
                          <span className="text-2xl sm:text-3xl font-bold text-white">
                            {item?.team2?.goalsScoredByTeam || 0}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Match Information Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date */}
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:shadow-md hover:border-slate-600 transition-all duration-200">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-orange-900/20 border border-orange-900/50 rounded-lg">
                          <Calendar className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                            Match Date
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-slate-200">
                            {moment(item?.date).format("MMM DD, YYYY")}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {moment(item?.date).format("dddd")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:shadow-md hover:border-slate-600 transition-all duration-200">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-orange-900/20 border border-orange-900/50 rounded-lg">
                          <MapPin className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                            Location
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-slate-200 truncate">
                            {item?.location || 'TBD'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Start Time */}
                    {item?.time?.length > 0 && item.time[0]?.startTime && (
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:shadow-md hover:border-slate-600 transition-all duration-200">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-orange-900/20 border border-orange-900/50 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                              Start Time
                            </p>
                            <p className="text-sm sm:text-base font-semibold text-slate-200">
                              {item.time.map((val) => val?.startTime).join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* End Time */}
                    {item?.time?.length > 0 && item.time[0]?.endTime && (
                      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:shadow-md hover:border-slate-600 transition-all duration-200">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-orange-900/20 border border-orange-900/50 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                              End Time
                            </p>
                            <p className="text-sm sm:text-base font-semibold text-slate-200">
                              {item.time.map((val) => val?.endTime).join(', ')}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* League */}
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 hover:shadow-md hover:border-slate-600 transition-all duration-200">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-orange-900/20 border border-orange-900/50 rounded-lg">
                          <Users className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                            League
                          </p>
                          <p className="text-sm sm:text-base font-semibold text-slate-200 truncate">
                            {item?.league?.leagueName || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Winner Section */}
                  {item?.winningTeamName && (
                    <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-xl p-4 sm:p-6 border-2 border-green-800/50">
                      <div className="flex items-center justify-center space-x-3">
                        <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                        <div className="text-center">
                          <p className="text-xs sm:text-sm font-semibold text-green-400 uppercase tracking-wide mb-1">
                            Winner
                          </p>
                          <p className="text-lg sm:text-xl font-bold text-white">
                            {item.winningTeamName}
                          </p>
                          {item?.winningTeam?.winningTeamScore !== undefined && (
                            <p className="text-sm text-green-300 mt-1">
                              Final Score: {item.winningTeam.winningTeamScore}
                            </p>
                          )}
                        </div>
                        <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                      </div>
                      {item?.losingTeamName && (
                        <div className="mt-3 pt-3 border-t border-green-800/50 text-center">
                          <p className="text-xs text-green-400">
                            Runner-up: <span className="font-semibold text-green-300">{item.losingTeamName}</span>
                            {item?.losingTeam?.losingTeamScore !== undefined && (
                              <span className="ml-2">({item.losingTeam.losingTeamScore})</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-4 sm:px-6 py-4 bg-slate-800 border-t border-slate-700 flex justify-end">
                <button
                  onClick={() => setIsShowing(false)}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
        : null}
    </>
  );
}
