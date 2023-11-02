import "../styles/globals.css";
import { OfflineSyncProvider, useOfflineSyncContext } from "offline-sync-handler-test";
import { Provider, useDispatch } from "react-redux";
import { clearSubmissionBatch, store, updateIsOffline, updatePendingSubmissions } from "../redux/store";
import { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { analytics } from "../services/firebase/firebase";
import { logEvent } from "firebase/analytics";
import "animate.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";
import { chunkArray, getImages, removeCitizenImageRecord, sleep } from "../services/utils";
import { _updateSubmissionMedia } from "../redux/actions/updateSubmissionMedia";
import { isNull, omitBy, update } from "lodash";
import localforage from "localforage";
import { removeSubmission } from "../redux/actions/removeSubmission";
import CommonModal from "../components/Modal";
import { CircularProgress } from "@mui/material";

const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;
export default function App({ Component, pageProps }) {
  const [hydrated, setHydrated] = useState(false);
  const offlinePackage = useOfflineSyncContext();
  const userData = omitBy(store.getState()?.userData, isNull);
  const [syncing, setSyncing] = useState(false);

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
    if (store.getState().userData.isOffline) setSyncing(true);
    console.log("debug sync response -->", response);
    const images = await getImages();
    console.log("debug: before", { images })
    if (response?.config?.meta?.citizenId) {
      //  store?.dispatch(_updateSubmissionMedia(response?.config?.meta)).then(res => {
      store?.dispatch(_updateSubmissionMedia(response?.data?.data?.result)).then(async res => {
        console.log("debug: _app then", res)
        if (res?.type?.includes('fulfilled')) {
          console.log("Clearing Image Records for --->", response?.config?.meta?.citizenId)
          removeCitizenImageRecord(response?.config?.meta?.citizenId);

          // Updating villageId in pending submissions
          if (store.getState().userData.isOffline) {
            let ps = [...store.getState().userData.pendingSubmissions];
            if (!ps.includes(response?.config?.meta?.villageId)) ps.push(response?.config?.meta?.villageId);
            store.dispatch(updatePendingSubmissions(ps));
          }

          const apiRequests = await localforage.getItem('apiRequests');

          if (apiRequests?.length < 1) {
            if (store.getState().userData.isOffline) {
              store.dispatch(updateIsOffline(false));
              setTimeout(() => {
                performBatchSubmission(response);
              }, 1000)
            }
          }

        }
      })

    }

  };

  useEffect(() => {
    window.addEventListener('offline', () => {
      toast.error('Operating now in offline mode!', {
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
    })
    window.addEventListener('online', () => {
      toast.success('App is back online', {
        position: "top-right",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    });
    // submitData();
    setHydrated(true);
    logEvent(analytics, 'page_view');
  }, []);

  const onHello = useCallback(() => {
    console.log("hello");
  }, []);

  async function performBatchSubmission(offlinePackage) {
    const BATCH_SIZE = 10;
    const DELAY_TIME = 3000; // Delay time in milliseconds (5 seconds)
    const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;

    let ps = [...store.getState().userData.pendingSubmissions]
    console.log("PS -->", { ps })
    if (ps?.length) {
      const responses = [];
      for (let i in ps) {
        console.log({ i, ps })
        let submissions = userData?.submissions[ps[i]];

        console.log({ submissions })

        // Splitting the submission array into batches of 10
        const batches = chunkArray(submissions, BATCH_SIZE);
        console.log("Batches ->", batches);


        for (let el in batches) {

          let batch = batches[el];

          const submissionData = {
            [ps[i]]: batch,
          };

          const config = {
            method: "POST",
            url: BACKEND_SERVICE_URL + `/submissions/bulk`,
            data: submissionData,
            headers: {
              Authorization: `Bearer ${userData?.user?.token}`,
            },
          };

          try {
            // Introduce a delay before processing the next batch
            await sleep(DELAY_TIME);
            const response = await offlinePackage?.sendRequest(config);
            console.log("Batch Submission Response", { response })

            if (response && Object.keys(response)?.length) {
              // logEvent(analytics, "submission_successfull", {
              //   villageId: _currLocation.villageCode,
              //   villageName: _currLocation.villageName,
              //   user_id: userData?.user?.user?.username,
              //   app_status: navigator.onLine ? "online" : "offline",
              // });
              responses.push(response);
              store.dispatch(clearSubmissionBatch(batch))
            } else {
              toast.error(
                "An error occured while submitting form. Please try again \nError String : " +
                JSON.stringify(response)
              );
              // logEvent(analytics, "submission_failure", {
              //   villageId: _currLocation.villageCode,
              //   villageName: _currLocation.villageName,
              //   user_id: userData?.user?.user?.username,
              //   app_status: navigator.onLine ? "online" : "offline",
              // });
              responses.push(response);
            }

          } catch (error) {
            console.error("Error Submitting Submission Data: ", error);
          }
        }

      }
      console.log("Final Submission Responses ---->", { responses, ps })

      // Clearing pending submissions array
      responses.forEach(el => {
        Object?.keys(el)?.forEach(x => {
          ps = ps.filter(i => i != x);
        })
      })
      store.dispatch(updatePendingSubmissions(ps));
      setSyncing(false);
      console.log("Batch submission completed")
    }
    setSyncing(false);
  }

  return hydrated ? (
    <Provider store={store} data-testid="redux-provider">
      <OfflineSyncProvider onCallback={onSyncSuccess}>
        <Component {...pageProps} onHello={onHello} />
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
      {syncing && <CommonModal sx={{ maxHeight: "50vh", maxWidth: '80vw', overflow: "scroll" }}>
        <div style={{ ...modalStyles.container, justifyContent: "center" }}>
          <p style={modalStyles.mainText}>Please wait ✋, Data Sync in progress</p>
          <CircularProgress color="success" />
          <p style={modalStyles.warningText}>Do not refresh this page</p>
        </div>
      </CommonModal>}
    </Provider>
  ) : null;
}

const modalStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: 'space-evenly',
    height: "100%",
    width: "100%"
  },
  mainText: {
    fontSize: "1.4rem",
    color: "#007922",
    textAlign: "center",
    margin: "2rem 0rem",
    fontWeight: '400'
  },
  warningText: { color: "red", textAlign: "center", fontWeight: 'bold', marginTop: '2rem' },
};