"use client"
import "../styles/globals.css";
import {
  OfflineSyncProvider,
  useOfflineSyncContext,
} from "offline-sync-handler-test";
import { Provider, useDispatch } from "react-redux";
import {
  clearSubmissionBatch,
  store,
  updateCanSubmit,
  updateIsOffline,
  updatePendingSubmissions,
} from "../redux/store";
import { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { analytics } from "../services/firebase/firebase";
import { logEvent } from "firebase/analytics";
import "animate.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";
import {
  checkTokenValidity,
  chunkArray,
  getImages,
  refreshToken,
  removeCitizenImageRecord,
  sleep,
} from "../services/utils";
import { _updateSubmissionMedia } from "../redux/actions/updateSubmissionMedia";
import { isNull, omitBy, update } from "lodash";
import localforage from "localforage";
import CommonModal from "../components/Modal";
import { CircularProgress } from "@mui/material";
import Lottie from "react-lottie";
import * as done from "public/lottie/done.json";
import { Button } from "@mui/material";
import AnnouncementBar from '../components/AnnouncementBar'
import flagsmith from "flagsmith/isomorphic";
import { FlagsmithProvider } from 'flagsmith/react';

// Lottie Options
const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: done,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export default function App({ Component, pageProps, flagsmithState }) {
  const [hydrated, setHydrated] = useState(false);
  const offlinePackage = useOfflineSyncContext();
  const userData = omitBy(store.getState()?.userData, isNull);
  const [syncing, setSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
  const [showAnnouncementBar, setShowAnnouncementBar] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');

  // const submitData = useCallback(async (data) => {

  //   const userData = omitBy(store.getState()?.userData, isNull);
  //   console.log("debug:submitData call-", { userData })
  //   const config = {
  //     method: "POST",
  //     url: BACKEND_SERVICE_URL + `/submissions/bulk`,
  //     data: userData?.submissions,
  //     headers: {
  //       Authorization: `Bearer ${userData?.user?.token}`,
  //     },
  //   };
  //   const response = await data?.sendRequest(config);
  //   console.log("ram ram submitDataResponse:", { response })
  //   store?.dispatch(removeSubmission(response)).then(res => {
  //     console.log("ram ram: removeSubmissionRes", { res })
  //   })
  //   console.log("debug -submitDataresponse:", { response, data });
  // }, [BACKEND_SERVICE_URL]);

  const onSyncSuccess = async (response) => {
    const apiRequests = await localforage.getItem("apiRequests");

    if (
      store.getState().userData.isOffline &&
      apiRequests?.length > 0 &&
      !syncing
    ) {
      setSyncing(true);
    }
    console.log("debug sync response -->", response);
    const images = await getImages();
    console.log("debug: before", { images });
    if (response?.config?.meta?.citizenId) {
      //  store?.dispatch(_updateSubmissionMedia(response?.config?.meta)).then(res => {
      store
        ?.dispatch(_updateSubmissionMedia(response?.data?.data?.result))
        .then(async (res) => {
          console.log("debug: _app then", res);
          if (res?.type?.includes("fulfilled")) {
            console.log(
              "Clearing Image Records for --->",
              response?.config?.meta?.citizenId
            );
            removeCitizenImageRecord(response?.config?.meta?.citizenId);
          }
        });

      // Updating villageId in pending submissions
      if (store.getState().userData.isOffline) {
        let ps = [...store.getState().userData.pendingSubmissions];
        if (!ps.includes(response?.config?.meta?.villageId))
          ps.push(response?.config?.meta?.villageId);
        store.dispatch(updatePendingSubmissions(ps));
      }

      if (apiRequests?.length == 1) {
        if (store.getState().userData.isOffline) {
          store.dispatch(updateIsOffline(false));
          setTimeout(() => {
            // setSyncing(false);
            setSyncComplete(true);
            window.location.reload();
          }, 1000);
        }
      }
    }
  };



  useEffect(() => {
    window.addEventListener("offline", () => {
      toast.error("Operating now in offline mode!", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      store.dispatch(updateIsOffline(true));
      store.dispatch(updateCanSubmit(false));
    });

    window.addEventListener("online", async () => {
      toast.success("App is back online", {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      store.dispatch(updateCanSubmit(true));
    });

    setHydrated(true);
    logEvent(analytics, "page_view");
    if (window.innerWidth > 500) setIsDesktop(true);
    else setIsDesktop(false);

    const daysLeft = checkTokenValidity();

    if (daysLeft <= 3) {
      setShowAnnouncementBar(true);
      setAnnouncementText(`Your token will be expired in ${daysLeft} days`)
    }
    if (daysLeft <= 1) {
      refreshToken();
    }
  }, []);
  useEffect(() => {
    if ('serviceWorker' in navigator ) {
      window.addEventListener('load', () => {
        const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
        navigator.serviceWorker.register(swUrl).then(registration => {
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content is available, show an alert or a notification to the user
                  if (confirm('A newer version of this web app is available, reload to update?')) {
                    
                      window.location.reload()
                  
                  }
                  // Optionally, you could use a React state to show an in-app alert
                } else {
                  // Content is cached for offline use
                  console.log('Content is cached for offline use.');
                }
              }
            };
          });
        }).catch(error => {
          console.error('Error during service worker registration:', error);
        });
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && window.workbox !== undefined) {
    console.log("wb: hello")
      const wb = window.workbox
      console.log("wb:",{wb,window})

      wb.addEventListener('installed', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log("wb installed:",event)
      })

      wb.addEventListener('controlling', event => {
        console.log(`Event ${event.type} is triggered.`)
        console.log("wb controling:",{event});
      })

      wb.addEventListener('activated', event => {
        console.log(`wb Event ${event.type} is triggered.`)
        console.log("wb: activated",{event});
      })
      const promptNewVersionAvailable = event => {
        // `event.wasWaitingBeforeRegister` will be false if this is the first time the updated service worker is waiting.
        // When `event.wasWaitingBeforeRegister` is true, a previously updated service worker is still waiting.
        // You may want to customize the UI prompt accordingly.
        console.log("wb:",{event});
        if (confirm('A newer version of this web app is available, reload to update?')) {
          wb.addEventListener('controlling', event => {
            window.location.reload()
          })

          // Send a message to the waiting service worker, instructing it to activate.
          wb.messageSkipWaiting()
        } else {
          console.log(
            'User rejected to reload the web app, keep using old version. New version will be automatically load when user open the app next time.'
          )
        }
      }

      wb.addEventListener('waiting', promptNewVersionAvailable)

      // never forget to call register as auto register is turned off in next.config.js
      wb.register()
    }
  }, [])

  return hydrated ? (
    <>
      {isDesktop ? (
        <div className="rootDiv">
          {showAnnouncementBar && <AnnouncementBar text={announcementText} />}
          <Provider store={store} data-testid="redux-provider">
            <OfflineSyncProvider onCallback={onSyncSuccess}>
              <FlagsmithProvider
                serverState={flagsmithState}
                options={{
                  environmentID: process.env.NEXT_PUBLIC_FLAGSMITH_ID,
                }}
                flagsmith={flagsmith}>
                <div style={showAnnouncementBar ? { marginTop: '1.5rem' } : {}}>
                  <Component {...pageProps} />
                </div>
              </FlagsmithProvider>
            </OfflineSyncProvider>
            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            {syncing && (
              <CommonModal
                sx={{ maxHeight: "50vh", maxWidth: "80vw", overflow: "scroll" }}
              >
                <div
                  style={{ ...modalStyles.container, justifyContent: "center" }}
                >
                  {!syncComplete ? (
                    <>
                      <p style={modalStyles.mainText}>
                        Please wait ✋, Media Sync in progress
                      </p>
                      <CircularProgress color="success" size={60} />
                      <p style={modalStyles.warningText}>
                        Do not refresh this page
                      </p>
                    </>
                  ) : (
                    <>
                      <Lottie
                        options={defaultOptions}
                        style={{ marginTop: -40, marginBottom: -20 }}
                        height={200}
                        width={200}
                      />
                      <p style={modalStyles.mainText}>Media Sync Successful</p>
                      <Button
                        color="success"
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          setSyncComplete(false);
                          setSyncing(false);
                          window.location.reload();
                        }}
                      >
                        Done
                      </Button>
                    </>
                  )}
                </div>
              </CommonModal>
            )}
          </Provider>
        </div >
      ) : (
        <>
          {showAnnouncementBar && <AnnouncementBar text={announcementText} />}
          <Provider store={store} data-testid="redux-provider">
            <OfflineSyncProvider onCallback={onSyncSuccess}>
              <FlagsmithProvider
                serverState={flagsmithState}
                options={{
                  environmentID: process.env.NEXT_PUBLIC_FLAGSMITH_ID,
                }}
                flagsmith={flagsmith}>
                <div style={showAnnouncementBar ? { marginTop: '1.5rem' } : {}}>
                  <Component {...pageProps} />
                </div>
              </FlagsmithProvider>
            </OfflineSyncProvider>
            <ToastContainer
              position="top-center"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
            {syncing && (
              <CommonModal
                sx={{ maxHeight: "50vh", maxWidth: "80vw", overflow: "scroll" }}
              >
                <div
                  style={{ ...modalStyles.container, justifyContent: "center" }}
                >
                  {!syncComplete ? (
                    <>
                      <p style={modalStyles.mainText}>
                        Please wait ✋, Media Sync in progress
                      </p>
                      <CircularProgress color="success" size={60} />
                      <p style={modalStyles.warningText}>
                        Do not refresh this page
                      </p>
                    </>
                  ) : (
                    <>
                      <Lottie
                        options={defaultOptions}
                        style={{ marginTop: -40, marginBottom: -20 }}
                        height={200}
                        width={200}
                      />
                      <p style={modalStyles.mainText}>Media Sync Successful</p>
                      <Button
                        color="success"
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          setSyncComplete(false);
                          setSyncing(false);
                          window.location.reload();
                        }}
                      >
                        Done
                      </Button>
                    </>
                  )}
                </div>
              </CommonModal>
            )}
          </Provider>
        </>
      )
      }
    </>
  ) : null;
}

App.getInitialProps = async () => {
  await flagsmith.init({ // fetches flags on the server and passes them to the App 
    environmentID: process.env.NEXT_PUBLIC_FLAGSMITH_ID,
  });
  return { flagsmithState: flagsmith.getState() }
}

const modalStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-evenly",
    height: "100%",
    width: "100%",
  },
  mainText: {
    fontSize: "1.4rem",
    color: "#007922",
    textAlign: "center",
    margin: "2rem 0rem",
    fontWeight: "400",
  },
  warningText: {
    color: "red",
    textAlign: "center",
    fontWeight: "bold",
    marginTop: "2rem",
  },
};
