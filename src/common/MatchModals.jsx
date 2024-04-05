import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import moment from "moment";
import { useForm } from "react-hook-form";
import { ToastContainer } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { TfiViewListAlt } from "react-icons/tfi";

export default function ({ viewDetails }) {
  // console.log("index::", viewDetails?.index);
  // console.log("item::", viewDetails?.item);
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsShowing(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  useEffect(() => {
    let html = document.querySelector("html");

    if (html) {
      if (isShowing && html) {
        html.style.overflowY = "hidden";

        const focusableElements =
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

        const modal = document.querySelector("#modal"); // select the modal by it's id

        const firstFocusableElement =
          modal.querySelectorAll(focusableElements)[0]; // get first element to be focused inside modal

        const focusableContent = modal.querySelectorAll(focusableElements);

        const lastFocusableElement =
          focusableContent[focusableContent.length - 1]; // get last element to be focused inside modal

        document.addEventListener("keydown", function (e) {
          if (e.keyCode === 27) {
            setIsShowing(false);
          }

          let isTabPressed = e.key === "Tab" || e.keyCode === 9;

          if (!isTabPressed) {
            return;
          }

          if (e.shiftKey) {
            // if shift key pressed for shift + tab combination
            if (document.activeElement === firstFocusableElement) {
              lastFocusableElement.focus(); // add focus for the last focusable element
              e.preventDefault();
            }
          } else {
            // if tab key is pressed
            if (document.activeElement === lastFocusableElement) {
              // if focused has reached to last focusable element then focus first focusable element after pressing tab
              firstFocusableElement.focus(); // add focus for the first focusable element
              e.preventDefault();
            }
          }
        });

        firstFocusableElement.focus();
      } else {
        html.style.overflowY = "visible";
      }
    }
  }, [isShowing]);

  return (
    <>
      <button
        onClick={() => setIsShowing(true)}
        className=" bg-white"
      >
        <TfiViewListAlt className="text-xl text-green-600"/> 
      </button>

      {isShowing && typeof document !== "undefined"
        ? ReactDOM.createPortal(
          <div
            className="fixed top-0 left-0 z-20 flex w-screen h-screen items-center justify-center bg-slate-300/20 backdrop-blur-sm"
            aria-labelledby="header-3a content-3a"
            aria-modal="true"
            tabindex="-1"
            role="dialog"
          >
            {/*    <!-- Modal --> */}
            <div
              ref={wrapperRef}
              className="flex max-h-[90vh] w-11/12 max-w-xl flex-col gap-6 overflow-hidden rounded bg-white p-6 text-slate-500 shadow-xl shadow-slate-700/10"
              id="modal"
              role="document"
            >
              {/*        <!-- Modal header --> */}
              <header id="header-3a" className="flex items-center gap-4">
                <h3 className="flex-1 text-xl font-medium text-slate-700">
                  Match Complete Details
                </h3>
                <button
                  onClick={() => setIsShowing(false)}
                  className="inline-flex h-10 items-center justify-center gap-2 justify-self-center whitespace-nowrap rounded-full px-5 text-sm font-medium tracking-wide text-gray-500 transition duration-300 hover:bg-gray-100 hover:text-gray-600 focus:bg-gray-200 focus:text-gray-700  focus-visible:outline-none disabled:cursor-not-allowed disabled:text-gray-300 disabled:shadow-none disabled:hover:bg-transparent"
                  aria-label="close dialog"
                >
                  <span className="relative only:-mx-5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      role="graphics-symbol"
                      aria-labelledby="title-79 desc-79"
                    >
                      <title id="title-79">Icon title</title>
                      <desc id="desc-79">
                        A more detailed description of the icon
                      </desc>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </span>
                </button>
              </header>
              {/*        <!-- Modal body --> */}
              <div id="content-3a" className="flex-1 overflow-auto">
                <section className="container mx-auto p-6 font-mono">
                  <div className="w-full mb-8 overflow-hidden rounded-lg shadow-lg">
                    <div className="w-full overflow-x-auto">
                      <table className="w-full">
                        <thead className="text-center"></thead>
                        <tbody className="bg-white text-center">
                          <tr className="text-md font-semibold tracking-wide text-center  border-b border-gray-600 ">
                            <th className="px-4 py-3 text-gray-900 bg-gray-100 uppercase">
                              S.No
                            </th>
                            <td>{viewDetails?.index + 1}</td>
                          </tr>
                          <tr className=" border-b border-gray-600">
                            <th className="px-4 py-3 text-gray-900 bg-gray-100 uppercase">
                              Team 1
                            </th>
                            <td>{viewDetails?.item?.team1?.teamName}</td>
                          </tr>
                          <tr className=" border-b border-gray-600">
                            <th className="px-4 py-3 text-gray-900 bg-gray-100 uppercase">
                              Team 2
                            </th>

                            <td>{viewDetails?.item?.team2?.teamName}</td>
                          </tr>
                          <tr className=" border-b border-gray-600">
                            <th className="px-4 py-3 text-gray-900 bg-gray-100 uppercase">
                              Date
                            </th>
                            <td>
                              {moment(viewDetails?.item?.date).format(
                                "DD-MM-YYYY"
                              )}
                            </td>
                          </tr>
                          <tr className=" border-b border-gray-600">
                            <th className="px-4 py-3 whitespace-nowrap text-gray-900 bg-gray-100 uppercase">
                              Start Time
                            </th>
                            <td>
                              {viewDetails?.item?.time?.map(
                                (val) => val?.startTime
                              )}
                            </td>
                          </tr>
                          <tr className=" border-b border-gray-600">
                            <th className="px-4 py-3 whitespace-nowrap text-gray-900 bg-gray-100 uppercase">
                              End Time
                            </th>
                            <td>
                              {viewDetails?.item?.time?.map(
                                (val) => val?.endTime
                              )}
                            </td>
                          </tr>
                          <tr className=" border-b border-gray-600">
                            <th className="px-4 py-3 whitespace-nowrap text-gray-900 bg-gray-100 uppercase">
                              Location
                            </th>
                            <td>{viewDetails?.item?.location}</td>
                          </tr>

                          <tr className=" border-b border-gray-600">
                            <th className="px-4 py-3 whitespace-nowrap text-gray-900 bg-gray-100 uppercase">
                              Winning Team
                            </th>
                            <td>{viewDetails?.item?.winningTeamName}</td>
                          </tr>
                          <tr className=" border-b border-gray-600">
                            <th className="px-4 py-3 whitespace-nowrap text-gray-900 bg-gray-100 uppercase">
                              Winning Team Score
                            </th>
                            <td>{viewDetails?.item?.winningTeam?.winningTeamScore}</td>
                          </tr>
                          <tr className=" border-b border-gray-600">
                            <th className="px-4 py-3 whitespace-nowrap text-gray-900 bg-gray-100 uppercase">
                              Losing Team
                            </th>
                            <td>{viewDetails?.item?.losingTeamName}</td>
                          </tr>
                          <tr className=" border-b border-gray-600">
                            <th className="px-4 py-3 whitespace-nowrap text-gray-900 bg-gray-100 uppercase">
                              Losing Team Score
                            </th>
                            <td>{viewDetails?.item?.losingTeam?.losingTeamScore}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>,
          document.body
        )
        : null}
    </>
  );
}
