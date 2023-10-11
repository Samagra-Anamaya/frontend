import '@/styles/globals.css'
import { OfflineSyncProvider } from 'offline-sync-handler-test';
import { Provider } from 'react-redux';
import { clearSubmissions, clearSubmissionsFunc, store } from '../redux/store'
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { analytics } from '../services/firebase/firebase';
import { logEvent } from "firebase/analytics";
import 'animate.css';

export default function App({ Component, pageProps }) {
  const [hydrated, setHydrated] = useState(false);
  // const dispatch = useDispatch();

  const onSyncSuccess = (response) => {
    console.log("sync response -->", response)
    toast(JSON.stringify(response), {
      position: "top-center",
      autoClose: 10000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    for (let el in response?.config?.data) {
      toast(`☁️  Village ${el}'s data synced with server `, {
        position: "top-center",
        autoClose: 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
    console.log(response?.data?.status)
    if (response?.data?.status == 201) {
      console.log("Clearing Submission for ->", Object.keys(response?.config?.data)?.[0])
      store.dispatch(clearSubmissions(Object.keys(response?.config?.data)?.[0]))
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
    })
    setHydrated(true);
    logEvent(analytics, 'Test Logger');
  }, [])


  return hydrated ? <Provider store={store} data-testid="redux-provider">
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
  </Provider> : null;
}
