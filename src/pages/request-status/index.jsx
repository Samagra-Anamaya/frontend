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
  store,
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
import {
  chunkArray,
  getCitizenImageRecords,
  getImages,
  getImagesForVillage,
  sleep,
} from "../../services/utils";
import { formDataToObject } from "../../utils/formdata-to-object";
import { replaceMediaObject } from "../../redux/actions/replaceMediaObject";
import * as done from "public/lottie/done.json";
import * as warning from "public/lottie/warning.json";
import { Button } from "@mui/material";
import Lottie from "react-lottie";
import isOnline from "is-online";
import * as Sentry from "@sentry/nextjs";

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
