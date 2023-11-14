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
  clearSubmissionBatch,
  clearSubmissions,
  setCurrentCitizen,
  tokenSelector,
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
import { chunkArray, getCitizenImageRecords, getImages, getImagesForVillage, sleep } from "../../services/utils";
import { formDataToObject } from "../../utils/formdata-to-object";
import { replaceMediaObject } from "../../redux/actions/replaceMediaObject";
import * as done from "public/lottie/done.json";
import { Button } from "@mui/material";
import Lottie from "react-lottie";


// Lottie Options
const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: done,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

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
  const [submissionCompleted, setSubmissionCompleted] = useState(false);
  const [disableSubmitEntries, setDisableSubmitEntries] = useState(false);
  const [warningModal, showWarningModal] = useState(false);
  const token = useSelector(tokenSelector);
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

  useEffect(() => {
    console.log({ submissions })
    if (submissions?.length) {
      let mediaUploaded = false;
      for (let el in submissions) {
        if (
          (!submissions[el]?.submissionData?.landRecords?.length && submissions[el]?.submissionData?.rorRecords?.length)
          || (submissions[el]?.submissionData?.landRecords?.length && !submissions[el]?.submissionData?.rorRecords?.length)
          || (submissions[el]?.submissionData?.landRecords?.length && submissions[el]?.submissionData?.rorRecords?.length)
        ) {
          mediaUploaded = true;
        } else mediaUploaded = false;
      }
      console.log("Setting Media Uploaded as ->", mediaUploaded)
      setIsMediaUploaded(mediaUploaded);
    }
  }, [])

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

  // const submitData2 = async () => {
  //   try {
  //     setLoading(true);

  //     const submissionData = {
  //       [_currLocation.villageCode]: submissions,
  //     };
  //     console.log("shri ram: submit2", { submissionData, submissions });
  //     const config = {
  //       method: "POST",
  //       url: BACKEND_SERVICE_URL + `/submissions/bulk`,
  //       data: submissionData,
  //       headers: {
  //         Authorization: `Bearer ${userData?.user?.token}`,
  //       },
  //     };
  //     const response = await offlinePackage?.sendRequest(config);
  //     if (response && Object.keys(response)?.length) {
  //       // dispatch(saveCitizenFormData({ id: currCitizen.citizenId, data: formState, capturedAt: capturedAt }))
  //       dispatch(clearSubmissions(_currLocation?.villageCode));
  //       setLoading(false);
  //       showSubmitModal(false);
  //       logEvent(analytics, "submission_successfull", {
  //         villageId: _currLocation.villageCode,
  //         villageName: _currLocation.villageName,
  //         user_id: userData?.user?.user?.username,
  //         app_status: navigator.onLine ? "online" : "offline",
  //       });
  //     } else {
  //       toast.error(
  //         "An error occured while submitting form. Please try again \nError String : " +
  //         JSON.stringify(response)
  //       );
  //       showSubmitModal(false);
  //       setLoading(false);
  //       checkSavedRequests();
  //       logEvent(analytics, "submission_failure", {
  //         villageId: _currLocation.villageCode,
  //         villageName: _currLocation.villageName,
  //         user_id: userData?.user?.user?.username,
  //         app_status: navigator.onLine ? "online" : "offline",
  //       });
  //     }
  //   } catch (err) {
  //     console.error("ERR", err);
  //   }
  // };

  // const submitData = useCallback(async () => {
  //   setLoading(true);
  //   const images = await getImages();

  //   for (const _image of images) {
  //     let data = new FormData();
  //     _image?.images.forEach((file) => {
  //       data.append("files", file, uuidv4() + '.webp');
  //     });

  //     data.append("meta", JSON.stringify(_image));

  //     const config = {
  //       method: "POST",
  //       url: BACKEND_SERVICE_URL + `/upload/multiple`,
  //       meta: _image,
  //       data,
  //       isFormdata: true,
  //       headers: {
  //         Authorization: `Bearer ${userData?.user?.token}`,
  //       },
  //     };

  //     const response = await offlinePackage?.sendRequest(config);
  //     if (response?.result?.length)
  //       dispatch(replaceMediaObject(response)).then((res) => {
  //         if (res.type.includes("fulfilled")) {
  //           setIsMediaUploaded(true);
  //         }
  //       });
  //     else {
  //       showSubmitModal(false);
  //     }
  //   }
  //   setLoading(false);
  // }, []);

  const breadcrumbItems = useMemo(
    () => [{ label: "Home", to: "/" }, { label: _currLocation?.villageName }],
    [_currLocation?.villageName]
  );

  async function uploadImagesInBatches() {
    const images = await getImagesForVillage(_currLocation?.villageCode);
    console.log("Images for ", _currLocation.villageCode, images)
    const BATCH_SIZE = 10;
    const DELAY_TIME = 3000; // Delay time in milliseconds (5 seconds)
    const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;

    setLoading(true);
    // Splitting the images array into batches of 20
    const batches = chunkArray(images, BATCH_SIZE);
    console.log("Batches ->", batches);

    for (const batch of batches) {
      const promises = batch.map(async (_image) => {
        let data = new FormData();
        _image?.images.forEach((file) => {
          data.append("files", file, uuidv4() + ".webp");
        });

        data.append("meta", JSON.stringify(_image));

        const config = {
          method: "POST",
          url: BACKEND_SERVICE_URL + `/upload/multiple`,
          meta: _image,
          data,
          isFormdata: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        try {
          const response = await offlinePackage?.sendRequest(config);
          console.log("hola 1", { response })
          if (response?.result?.length)
            return dispatch(replaceMediaObject(response));
        } catch (error) {
          console.error("Error uploading image", error);
          return null;
        }
      });

      const responses = await Promise.all(promises);
      console.log("hola 2", { responses })
      responses.forEach((res) => {
        // In case offline
        if (res == undefined || !res) {
          showSubmitModal(false);
          checkSavedRequests();
          return;
        }
        if (res?.type.includes("fulfilled")) {
          setIsMediaUploaded(true);
        }
      });

      // Introduce a delay before processing the next batch
      await sleep(DELAY_TIME);

    }
    setLoading(false);
    console.log("hola all done")
  }

  async function performBatchSubmission() {
    const BATCH_SIZE = 10;
    const DELAY_TIME = 3000; // Delay time in milliseconds (5 seconds)
    const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;

    setLoading(true);

    // Splitting the images array into batches of 10
    const batches = chunkArray(submissions, BATCH_SIZE);
    console.log("Batches ->", batches);

    const responses = [];

    for (let el in batches) {

      let batch = batches[el];

      const submissionData = {
        [_currLocation.villageCode]: batch,
      };

      const config = {
        method: "POST",
        url: BACKEND_SERVICE_URL + `/submissions/bulk`,
        data: submissionData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        // Introduce a delay before processing the next batch
        await sleep(DELAY_TIME);
        const response = await offlinePackage?.sendRequest(config);
        console.log("Batch Submission Response", { response })

        if (response && Object.keys(response)?.length) {
          logEvent(analytics, "submission_successfull", {
            villageId: _currLocation.villageCode,
            villageName: _currLocation.villageName,
            user_id: userData?.user?.user?.username,
            app_status: navigator.onLine ? "online" : "offline",
          });
          responses.push(response);
          dispatch(clearSubmissionBatch(batch))
        } else {
          toast.error(
            "An error occured while submitting form. Please try again \nError String : " +
            JSON.stringify(response)
          );
          checkSavedRequests();
          logEvent(analytics, "submission_failure", {
            villageId: _currLocation.villageCode,
            villageName: _currLocation.villageName,
            user_id: userData?.user?.user?.username,
            app_status: navigator.onLine ? "online" : "offline",
          });
          responses.push(response);
        }

      } catch (error) {
        console.error("Error Submitting Submission Data: ", error);
      }
    }

    console.log("Final Submission Responses ---->", { responses })

    setLoading(false);
    setSubmissionCompleted(true);
    console.log("Batch submission completed")
  }


  //const showSubmitBtn =useMemo(()=>,[]);
  return !hydrated ? null : (
    <div className={styles.container} ref={containerRef}>
      <Banner />
      <Breadcrumb items={breadcrumbItems} />


      <div className="px-3">
        {/* <SelectionItem
          key={_currLocation.id}
          leftImage={"/assets/villageIcon.png"}
          mainText={_currLocation.villageName}
          mainSubtext={"Village Code - " + _currLocation.villageCode}
          sx={{ background: "#fff" }}
          mode={1}
        /> */}
        <p className={styles.headerText}>{_currLocation.villageName} </p>
        <p className={styles.villageCode}>{_currLocation.villageCode}</p>

        {disableSubmitEntries ? (
          <div className={styles.submitBtnDisabled}>
            Pending Submission to Server
          </div>
        ) : (
          submissions?.length > 0 && (
            <Button
              variant="contained"
              color="success"
              fullWidth
              sx={{ marginBottom: 5 }}
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
              Submit Saved Titles
            </Button>
          )
        )}

        <SelectionItem
          key={_currLocation.id}
          leftImage={"/assets/surveyIcon1.png"}
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
          mainText={"View Synced Titles"}
          href="/synced-titles"
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
          leftImage={"/assets/surveyIcon3.png"}
          rightImage={"/assets/circleArrow.png"}
          mainText={"View Submitted Titles"}
          href="/saved-entries"
        />
        {/* <SelectionItem
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
        /> */}
      </div>
      {submitModal && (
        <CommonModal sx={{ maxHeight: "50vh", maxWidth: '80vw', overflow: "scroll" }}>
          {loading ? (
            <div style={{ ...modalStyles.container, justifyContent: "center" }}>
              <CircularProgress color="success" size={70} />
            </div>
          ) : (
            <div style={modalStyles.container}>
              {submissionCompleted ? <>
                <Lottie
                  options={defaultOptions}
                  style={{ marginTop: -20, marginBottom: -40 }}
                  height={200}
                  width={200}
                />
                <p style={modalStyles.mainText}>Land Titles Synced Successfully</p>
                <Button color="success" variant="contained" fullWidth onClick={() => { setSubmissionCompleted(false); showSubmitModal(false); }}>Done</Button>
              </> : <>
                <div style={modalStyles.mainText}>
                  A total of {submissions?.length} entries will be submitted for {_currLocation.villageName}
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
                        performBatchSubmission();
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
                        uploadImagesInBatches();
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
              </>}
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
              You will have to re-submit saved titles in villages again{" "}
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
    fontWeight: 400
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
