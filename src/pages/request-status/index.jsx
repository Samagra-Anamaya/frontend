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

import { useOfflineSyncContext } from "offline-sync-handler-test";
import { toast } from "react-toastify";
import Banner from "../../components/Banner";
import Breadcrumb from "../../components/Breadcrumb";
import { Button } from "@mui/material";

const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;

const SurveyPage = ({ params }) => {
  /* Component States and Refs*/
  const offlinePackage = useOfflineSyncContext();
  const _currLocation = useSelector(
    (state) => state?.userData?.currentLocation
  );

  const [hydrated, setHydrated] = React.useState(false);
  const [currentSavedRequests, setCurrentSavedRequests] = useState([]);
  const containerRef = useRef();

  /* Use Effects */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setHydrated(true);
  }, []);

  async function checkSavedRequests() {
    let savedRequests = await offlinePackage.getStoredRequests();
    if (savedRequests?.length) {
      let currRequest = savedRequests.filter(
        (el) => el?.meta?.villageId == _currLocation.villageCode
      );
      setCurrentSavedRequests(currRequest);
    }
  }

  useEffect(() => {
    checkSavedRequests();
  }, [])

  const clearEntries = () => {
    offlinePackage.clearStoredRequests();
    toast.success("All queued entries have been removed, please press submit again on village screen!")
    checkSavedRequests();
  }

  const breadcrumbItems = useMemo(
    () => [{ label: "Home", to: "/" }, { label: _currLocation?.villageName }],
    [_currLocation?.villageName]
  );

  //const showSubmitBtn =useMemo(()=>,[]);
  return !hydrated ? null : (
    <div className={styles.container} ref={containerRef}>
      <Banner />
      <Breadcrumb items={breadcrumbItems} />
      <h3>Current Request Status</h3>
      <h5 style={{ marginTop: 15 }}>Requests in queue: {currentSavedRequests?.length || 0}</h5>
      <Button
        variant="contained"
        color="warning"
        sx={{ marginBottom: 20, width: '80%', height: '3rem', position: 'absolute', bottom: 0 }}
        onClick={clearEntries}
      >
        Reset Queue
      </Button>
    </div>
  );
};

export default SurveyPage;
