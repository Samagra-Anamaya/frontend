import "../styles/globals.css";
import { OfflineSyncProvider, useOfflineSyncContext } from "offline-sync-handler-test";
import { Provider, useDispatch } from "react-redux";
import { clearSubmissions, clearSubmissionsFunc, store, updateSubmissionMedia } from "../redux/store";
import { useState, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { analytics } from "../services/firebase/firebase";
import { logEvent } from "firebase/analytics";
import "animate.css";
import "bootstrap-css-only/css/bootstrap.min.css";
import "mdbreact/dist/css/mdb.css";
import { getImages, removeCitizenImageRecord } from "../services/utils";
import { _updateSubmissionMedia } from "../redux/actions/updateSubmissionMedia";
import { isNull, omitBy } from "lodash";

const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;
export default function App({ Component, pageProps }) {
  const [hydrated, setHydrated] = useState(false);
  const offlinePackage = useOfflineSyncContext();
  // const dispatch = useDispatch();
  console.log({ offlinePackage })
  const submitData = useCallback(async (data) => {
    const userData = omitBy(store.getState()?.userData,isNull);
    console.log("shri ram:----", { userData })
    const config = {
      method: "POST",
      url: BACKEND_SERVICE_URL + `/submissions/bulk`,
      data: userData?.submissions,
      headers: {
        Authorization: `Bearer ${userData?.user?.token}`,
      },
    };
    const response = await data?.sendRequest(config);
    console.log("submitDataresponse:", { response,data });
  }, [offlinePackage]);

  const onSyncSuccess = async (response) => {
    console.log("shri ram sync response -->", response);
    const images = await getImages();
    console.log("shri ram:",{ images })
    if (response?.config?.meta?.citizenId) {
    //  store?.dispatch(_updateSubmissionMedia(response?.config?.meta)).then(res => {
      store?.dispatch(_updateSubmissionMedia(response?.data?.data?.result)).then(res => {
        console.log("shri ram: _app then",res)
        if (res?.type?.includes('fulfilled')) {
          removeCitizenImageRecord(response?.config?.meta?.citizenId);
         
        }
      })
      // setTimeout(() => {
      //   removeCitizenImageRecord(response?.config?.meta?.citizenId)
      // }, 300);
      // if (images.length <= 1) {
      //   setTimeout(()=>{
      //     submitData(response);
      //   },1000)
        
      // }
    }
    console.log(response?.data?.status);
    if (response?.data?.status == 201) {
      // console.log(
      //   "Clearing Submission for ->",
      //   Object.keys(response?.config?.data)?.[0]
      // );
      // store.dispatch(
      //   clearSubmissions(Object.keys(response?.config?.data)?.[0])
      // );
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
  }, [])

  return hydrated ? (
    <Provider store={store} data-testid="redux-provider">
      <OfflineSyncProvider onCallback={onSyncSuccess}>
        {/* <OfflineSyncProvider > */}
        <Component {...pageProps} />
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
    </Provider>
  ) : null;
}
