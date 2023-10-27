"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import CommonHeader from "../../components/Commonheader";
import { v4 as uuidv4 } from "uuid";
import {
  clearSubmissions,
  setCurrentCitizen,
  updateCitizenFormData,
} from "../../redux/store";
import { useOfflineSyncContext } from "offline-sync-handler-test";
import GovtBanner from "../../components/GovtBanner";
import SelectionItem from "../../components/SelectionItem";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-toastify";
import CommonModal from "../../components/Modal";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../services/firebase/firebase";
import { uploadMedia } from "../../services/api";
import Banner from "../../components/Banner";
import Breadcrumb from "../../components/Breadcrumb";
import { getCitizenImageRecords, getImages } from "../../services/utils";
import { formDataToObject } from "../../utils/formdata-to-object";
import { replaceMediaObject } from "../../redux/actions/replaceMediaObject";

const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;

const SurveyPage = ({ params }) => {
  /* Component States and Refs*/
  const offlinePackage = useOfflineSyncContext();
  const userData = useSelector((state) => state?.userData);
  const [loading, setLoading] = useState(false);
  const [isMediaUploaded, setIsMediaUploaded] = useState(false);
  const _currLocation = useSelector(
    (state) => state?.userData?.currentLocation
  );
  const submissions = useSelector(
    (state) => state?.userData?.submissions?.[_currLocation?.villageCode]
  );
  const [hydrated, setHydrated] = React.useState(false);
  const [submitModal, showSubmitModal] = useState(false);
  const [disableSubmitEntries, setDisableSubmitEntries] = useState(false);
  const [warningModal, showWarningModal] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const containerRef = useRef();

  /* Use Effects */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView();
    }
  });

  async function checkSavedRequests() {
    let savedRequests = await offlinePackage.getStoredRequests();
    console.log("Saved Requests ->", savedRequests);
    if (savedRequests?.length) {
      let currRequest = savedRequests.filter(
        (el) => el?.meta?.villageId == _currLocation.villageCode
      );
      console.log("curr Reques->", currRequest)
      if (currRequest?.length && submissions?.length > 0) {
        setDisableSubmitEntries(true);
      }
    }
  }



  useEffect(() => {
    checkSavedRequests();
  }, [loading]);

  /* Utility Functions */
  const addNewCitizen = () => {
    if (disableSubmitEntries) {
      showWarningModal(true);
      return;
    }
    const newCitId = uuidv4();
    dispatch(setCurrentCitizen({ citizenId: newCitId }));
    router.push(`/citizen-survey`);
  };

  const clearEntriesAndProceed = () => {
    offlinePackage.clearStoredRequests();
    showWarningModal(false);
    const newCitId = uuidv4();
    dispatch(setCurrentCitizen({ citizenId: newCitId }));
    router.push(`/citizen-survey`);
  };

  const submitData2 = async () => {
    try {
      setLoading(true);

      const submissionData = {
        [_currLocation.villageCode]: submissions,
      };
      console.log("shri ram: submit2", { submissionData, submissions });
      const config = {
        method: "POST",
        url: BACKEND_SERVICE_URL + `/submissions/bulk`,
        data: submissionData,
        headers: {
          Authorization: `Bearer ${userData?.user?.token}`,
        },
      };
      const response = await offlinePackage?.sendRequest(config);
      if (response && Object.keys(response)?.length) {
        // dispatch(saveCitizenFormData({ id: currCitizen.citizenId, data: formState, capturedAt: capturedAt }))
        dispatch(clearSubmissions(_currLocation?.villageCode));
        setLoading(false);
        showSubmitModal(false);
        logEvent(analytics, "submission_successfull", {
          villageId: _currLocation.villageCode,
          villageName: _currLocation.villageName,
          user_id: userData?.user?.user?.username,
          app_status: navigator.onLine ? "online" : "offline",
        });
      } else {
        toast.error(
          "An error occured while submitting form. Please try again \nError String : " +
          JSON.stringify(response)
        );
        showSubmitModal(false);
        setLoading(false);
        checkSavedRequests();
        logEvent(analytics, "submission_failure", {
          villageId: _currLocation.villageCode,
          villageName: _currLocation.villageName,
          user_id: userData?.user?.user?.username,
          app_status: navigator.onLine ? "online" : "offline",
        });
        // Either an error or offline
        // if (!navigator.onLine) {
        //   // Submitted Offline
        //   // dispatch(saveCitizenFormData({ id: currCitizen.citizenId, data: formState, capturedAt: capturedAt }))
        //   setLoading(false);
        //   showSubmitModal(false);
        //   checkSavedRequests();
        //   logEvent(analytics, "submission_queued", {
        //     villageId: _currLocation.villageCode,
        //     villageName: _currLocation.villageName,
        //     user_id: userData?.user?.user?.username,
        //     app_status: navigator.onLine ? "online" : "offline",
        //   });
        // } else {
        //   alert(
        //     "An error occured while submitting form. Please try again \nError String : " +
        //       JSON.stringify(response)
        //   );
        //   showSubmitModal(false);
        //   setLoading(false);
        //   checkSavedRequests();
        //   logEvent(analytics, "submission_failure", {
        //     villageId: _currLocation.villageCode,
        //     villageName: _currLocation.villageName,
        //     user_id: userData?.user?.user?.username,
        //     app_status: navigator.onLine ? "online" : "offline",
        //   });
        // }
      }
    } catch (err) {
      console.error("ERR", err);
    }
  };

  const submitData = useCallback(async () => {
    setLoading(true);
    const images = await getImages();

    for (const _image of images) {
      let data = new FormData();
      _image?.images.forEach((file) => {
        data.append("files", file, uuidv4() + '.webp');
      });

      data.append("meta", JSON.stringify(_image));

      const config = {
        method: "POST",
        url: BACKEND_SERVICE_URL + `/upload/multiple`,
        meta: _image,
        data,
        isFormdata: true,
        headers: {
          Authorization: `Bearer ${userData?.user?.token}`,
        },
      };

      const response = await offlinePackage?.sendRequest(config);


      if (response?.result?.length)
        dispatch(replaceMediaObject(response)).then((res) => {

          if (res.type.includes("fulfilled")) {
            setIsMediaUploaded(true);
          }
        });
    }
    setLoading(false);
  }, []);

  const breadcrumbItems = useMemo(
    () => [{ label: "Home", to: "/" }, { label: _currLocation?.villageName }],
    [_currLocation?.villageName]
  );

  //const showSubmitBtn =useMemo(()=>,[]);
  return !hydrated ? null : (
    <div className={styles.container} ref={containerRef}>
      <Banner />
      <Breadcrumb items={breadcrumbItems} />


      <div className="px-3">
        <SelectionItem
          key={_currLocation.id}
          leftImage={"/assets/villageIcon.png"}
          mainText={_currLocation.villageName}
          mainSubtext={"Village Code - " + _currLocation.villageCode}
          sx={{ background: "#fff" }}
          mode={1}
        />

        {disableSubmitEntries ? (
          <div className={styles.submitBtnDisabled}>
            Pending Submission to Server
          </div>
        ) : (
          submissions?.length > 0 && (
            <div
              className={styles.submitBtn}
              onClick={() => {
                logEvent(analytics, "submit_entries_clicked", {
                  villageId: _currLocation.villageCode,
                  villageName: _currLocation.villageName,
                  user_id: userData?.user?.user?.username,
                  app_status: navigator.onLine ? "online" : "offline",
                }),
                  showSubmitModal(true);
              }}
            >
              Submit Saved Entries
            </div>
          )
        )}

        <SelectionItem
          key={_currLocation.id}
          leftImage={"/assets/citizen.png"}
          rightImage={"/assets/circleArrow.png"}
          onClick={() => {
            logEvent(analytics, "add_new_citizen_clicked", {
              villageId: _currLocation.villageCode,
              villageName: _currLocation.villageName,
              user_id: userData?.user?.user?.username,
            });
            addNewCitizen();
          }}
          mainText={"Add New Land Record"}
        />
        <SelectionItem
          key={_currLocation.id}
          onClick={() => {
            logEvent(analytics, "completed_entries_clicked", {
              villageId: _currLocation.villageCode,
              villageName: _currLocation.villageName,
              user_id: userData?.user?.user?.username,
            });
          }}
          leftImage={"/assets/assessment.png"}
          rightImage={"/assets/circleArrow.png"}
          mainText={"View Completed Entries"}
          href="/completed-entries"
        />
        <SelectionItem
          key={_currLocation.id}
          onClick={() => {
            logEvent(analytics, "saved_entries_clicked", {
              villageId: _currLocation.villageCode,
              villageName: _currLocation.villageName,
              user_id: userData?.user?.user?.username,
            });
          }}
          leftImage={"/assets/savedEntries.png"}
          rightImage={"/assets/circleArrow.png"}
          mainText={"View Saved Entries"}
          href="/saved-entries"
        />
        <SelectionItem
          key={_currLocation.id}
          onClick={() =>
            toast.warn("Unresolved Flags will unlock after evaluation", {
              position: "top-right",
              autoClose: 2500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "light",
            })
          }
          leftImage={"/assets/unresolvedFlags.png"}
          sx={{ background: "#b2b2b2" }}
          mainText={"Unresolved Flags"}
          rightImage={"/assets/circleArrow.png"}
        />
      </div>
      {submitModal && (
        <CommonModal sx={{ maxHeight: "50vh", maxWidth: '80vw', overflow: "scroll" }}>
          {loading ? (
            <div style={{ ...modalStyles.container, justifyContent: "center" }}>
              <CircularProgress color="success" />
            </div>
          ) : (
            <div style={modalStyles.container}>
              <div style={modalStyles.mainText}>
                A total of {submissions?.length} entries will be submitted for{" "}
                {_currLocation.villageName}
              </div>
              <p style={modalStyles.warningText}>
                Please ensure you are in good internet connectivity before
                submitting
              </p>
              <div style={modalStyles.btnContainer}>
                {isMediaUploaded ? (
                  <div
                    style={modalStyles.confirmBtn}
                    onClick={() => {
                      logEvent(analytics, "submit_entries_confirm", {
                        villageId: _currLocation.villageCode,
                        villageName: _currLocation.villageName,
                        user_id: userData?.user?.user?.username,
                        app_status: navigator.onLine ? "online" : "offline",
                      });
                      submitData2();
                    }}
                  >
                    Submit
                  </div>
                ) : (
                  <div
                    style={modalStyles.confirmBtn}
                    onClick={() => {
                      logEvent(analytics, "submit_entries_confirm", {
                        villageId: _currLocation.villageCode,
                        villageName: _currLocation.villageName,
                        user_id: userData?.user?.user?.username,
                        app_status: navigator.onLine ? "online" : "offline",
                      });
                      submitData();
                    }}
                  >
                    Upload Media
                  </div>
                )}

                <div
                  style={modalStyles.exitBtn}
                  onClick={() => {
                    logEvent(analytics, "submit_entries_cancelled", {
                      villageId: _currLocation.villageCode,
                      villageName: _currLocation.villageName,
                      user_id: userData?.user?.user?.username,
                      app_status: navigator.onLine ? "online" : "offline",
                    });
                    showSubmitModal(false);
                  }}
                >
                  Cancel
                </div>
              </div>
            </div>
          )}
        </CommonModal>
      )}

      {warningModal && (
        <CommonModal sx={{ maxHeight: "30vh", overflow: "scroll" }}>
          <div style={warningModalStyles.container}>
            <div style={warningModalStyles.warningText}>
              Adding new entries will delete all previous pending submissions in
              offline mode.
            </div>
            <p style={warningModalStyles.mainText}>
              You will have to resubmit saved entries in villages again{" "}
              {"(your data is safe)"}
            </p>
            <div style={warningModalStyles.btnContainer}>
              <div
                style={warningModalStyles.confirmBtn}
                onClick={() => {
                  clearEntriesAndProceed();
                }}
              >
                Confirm
              </div>
              <div
                style={warningModalStyles.exitBtn}
                onClick={() => showWarningModal(false)}
              >
                Cancel
              </div>
            </div>
          </div>
        </CommonModal>
      )}
    </div>
  );
};

const modalStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  mainText: {
    fontSize: "1.4rem",
    color: "#007922",
    textAlign: "center",
    margin: "2rem 0rem",
  },
  warningText: { color: "red", textAlign: "center" },
  btnContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    gap: "2rem",
    justifyContent: "space-evenly",
    marginTop: "1rem",
  },
  confirmBtn: {
    width: "50%",
    height: "3rem",
    background: "#017922",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
  },
  exitBtn: {
    width: "50%",
    height: "3rem",
    border: "1px solid #017922",
    color: "#017922",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
  },
};

const warningModalStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
    width: "100%",
  },
  mainText: {
    fontSize: "1.4rem",
    color: "#007922",
    textAlign: "center",
    margin: "2rem 0rem",
  },
  warningText: { fontSize: "1.4rem", color: "red", textAlign: "center" },
  btnContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    gap: "2rem",
    justifyContent: "space-evenly",
    marginTop: "1rem",
  },
  confirmBtn: {
    width: "50%",
    height: "3rem",
    background: "#017922",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
  },
  exitBtn: {
    width: "50%",
    height: "3rem",
    border: "1px solid #017922",
    color: "#017922",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
  },
};

export default SurveyPage;
