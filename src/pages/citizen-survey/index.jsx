"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import CommonHeader from "../../components/Commonheader";
import * as submissionLottie from "public/lottie/submission.json";
import CommonModal from "../../components/Modal";
import Lottie from "react-lottie";
import { useOfflineSyncContext } from "offline-sync-handler-test";
import CitizenForm from "../../components/CitizenForm";
// import QrReader from 'react-qr-scanner'
import { QrScanner } from "@yudiel/react-qr-scanner";
import { logEvent } from "firebase/analytics";
import CircularProgress from "@mui/material/CircularProgress";
import { analytics } from "../../services/firebase/firebase";
import { compressImage, getCitizenImageRecords, getImages, removeCitizenImageRecord, storeImages, sanitizeForm, toBase64 } from "../../services/utils";
import Banner from "../../components/Banner";
import Breadcrumb from "../../components/Breadcrumb";
import moment from "moment";
import { MobileStepper } from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { saveCitizenFormData } from "../../redux/actions/saveCitizenFormData";
import { getStorageQuota, sendLogs } from "../../services/api";
import * as Sentry from "@sentry/nextjs";
import flagsmith from 'flagsmith/isomorphic';
import { useFlags, useFlagsmith } from 'flagsmith/react';

const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;

// Lottie Options
const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: submissionLottie,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const CitizenSurveyPage = ({ params }) => {
  /* Util Hooks */
  const { sendRequest } = useOfflineSyncContext();
  const router = useRouter();
  const dispatch = useDispatch();

  /* Use States */
  const [hydrated, setHydrated] = React.useState(false);
  const [formState, setFormState] = useState({});
  const [landImages, setLandImages] = useState([]);
  const [rorImages, setRorImages] = useState([]);
  const [rorPdfs, setRorPdfs] = useState([]);
  const [totalSteps, setTotalSteps] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [formStartTime, setFormStartTime] = useState(moment().valueOf());

  const user = useSelector((state) => state?.userData?.user?.user);
  const _currLocation = useSelector(
    (state) => state?.userData?.currentLocation
  );
  const currCitizen = useSelector((state) => state?.userData?.currentCitizen);
  const [submittedModal, showSubmittedModal] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formEditable, setFormEditable] = useState(false);
  const user2 = useSelector((state) => state?.userData?.user);
  const { usemainworker } = useFlags(['usemainworker']);
  const { disableuserlogs } = useFlags(['disableuserlogs']);
  console.log("CURR CITIZEN -->", currCitizen);


  /* Use Effects */
  useEffect(() => {
    setHydrated(true);
    if (window.innerWidth < 769) setIsMobile(true);
    else setIsMobile(false);
    if (currCitizen?.status == "SUBMITTED") {
      setFormState(currCitizen.submissionData);
    } else if (
      currCitizen?.submissionData &&
      Object.keys(currCitizen?.submissionData)?.length > 0
    ) {
      setFormState(currCitizen.submissionData);
    }
    getImagesFromStore();
  }, []);

  useEffect(() => {
    setFormStartTime(moment().valueOf())
    logEvent(analytics, "form_start", {
      villageId: _currLocation.villageCode,
      villageName: _currLocation.villageName,
      user_id: user?.username,
      app_status: navigator.onLine ? 'online' : 'offline',
      capturedAt: moment().utc(),
      time: new Date().toISOString()
    });
  }, []);


  /* Util Functions */
  const handleSubmit = async () => {
    if (loading) return;
    let newFormState;
    try {
      const indexDbStats = await getStorageQuota();

      logEvent(analytics, 'form-filling_time', {
        user_id: user?.username,
        villageId: _currLocation.villageCode,
        time: (moment().valueOf() - formStartTime) / 1000 / 60
      });
      setLoading(true);
      showSubmittedModal(true);
      let capturedAt = moment().utc();
      setTotalSteps((landImages?.length || 0) + (rorImages?.length || 0))
      for (let el in landImages) {
        const compressedImg = await compressImage(landImages[el].file, usemainworker, disableuserlogs);
        setActiveStep(Number(el) + 1);
        landImages[el] = compressedImg;
      }

      for (let el in rorImages) {
        const compressedImg = await compressImage(rorImages[el].file, usemainworker, disableuserlogs);
        setActiveStep((landImages?.length || 0) + Number(el) + 1);

        rorImages[el] = compressedImg;
      }
      const newRorImages = [...rorImages, ...rorPdfs?.map(el => el?.file)];

      if (!indexDbStats.isAvailable) {
        toast.error("Device space full, please make space before continuing");
        setLoading(false);
        showSubmittedModal(false);
        return;
      }

      if (!landImages?.length) {
        toast.error("Land images cannot be empty!");
        setLoading(false);
        showSubmittedModal(false);
        return;
      }

      if (landImages?.length) await storeImages(
        {
          citizenId: currCitizen.citizenId,
          images: landImages,
          isLandRecord: true,
          villageId: _currLocation.villageCode
        },
        disableuserlogs
      );
      if (newRorImages?.length) await storeImages(
        {
          citizenId: currCitizen.citizenId,
          images: newRorImages,
          isLandRecord: false,
          villageId: _currLocation.villageCode
        },
        disableuserlogs
      );

      newFormState = sanitizeForm({ ...formState });

      console.log("SANITIZED FORM ---->", newFormState)
      // newFormState['landRecords'] = landImages;
      // newFormState['rorRecords'] = rorImages;
      newFormState['imageUploaded'] = false;
      if (!formState?.isAadhaarAvailable) {
        delete formState?.aadharNumber;
      }
      if (!formState?.rorUpdated) {
        delete formState?.khataNumber;
        delete formState?.landImages;
      }
      if (!formState?.coClaimantAvailable) {
        delete formState?.coClaimantName;
      }

      dispatch(
        saveCitizenFormData({
          submissionData: newFormState,
          spdpVillageId: _currLocation.villageCode,
          citizenId: currCitizen.citizenId,
          submitterId: user.username,
          capturedAt,
        })
      ).then(async (res) => {
        if (res?.type?.includes('fulfilled')) {
          setSaveSuccess(true);
          logEvent(analytics, "form_saved", {
            villageId: _currLocation.villageCode,
            villageName: _currLocation.villageName,
            user_id: user?.username,
            app_status: navigator.onLine ? 'online' : 'offline',
            capturedAt: capturedAt
          });
        }
        else {
          sendLogs({
            meta: 'at handleSubmit citizenSurvey inside try', gpId: user2?.user?.username, error: res?.error || JSON.stringify(res), currentForm: newFormState
          }, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(user2?.user?.username) : true);
          toast.warn("Something went wrong while saving form, " + JSON.stringify(res?.error));
          removeCitizenImageRecord(currCitizen.citizenId);
          setLoading(false);
          showSubmittedModal(false)
          logEvent(analytics, "unable_to_save_form", {
            villageId: _currLocation.villageCode,
            villageName: _currLocation.villageName,
            user_id: user?.username,
            app_status: navigator.onLine ? 'online' : 'offline',
            capturedAt: capturedAt,
            res: JSON.stringify(res)
          });
          Sentry.captureException({ err: res?.error || JSON.stringify(res), user });
        }
      })
      // }

      setLoading(false);

    } catch (err) {
      if (err?.message == 'Invalid File Type' || err == 'Invalid File Type') {
        toast.error(`Please check your media files, some of the files may be corrupt or invalid.`)
      } else {
        Sentry.captureException({ err: err?.message || err?.toString(), user });
        toast.error(`An error occurred while saving: ${err?.message || err?.toString()}`)
        // sendLogs({
        //   meta: 'at handleSubmit citizenSurveyPage inside catch',
        //   gpId: user2?.user?.username,
        //   error: err?.message || err?.toString(),
        //   currentForm: newFormState
        // }, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(user2?.user?.username) : true)
        return;
      }
      // sendLogs({
      //   meta: 'at handleSubmit citizenSurveyPage inside catch after else',
      //   gpId: user2?.user?.username,
      //   error: err?.message || err?.toString(),
      //   currentForm: newFormState
      // }, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(user2?.user?.username) : true)
      console.log(err);
      setLoading(false);
      showSubmittedModal(false);
    }
  };


  const getImagesFromStore = async () => {
    let { landRecords, rorRecords } = await getCitizenImageRecords(currCitizen.citizenId);
    if (currCitizen?.submissionData && Object.keys(currCitizen?.submissionData)?.length > 0) {
      if (landRecords?.images?.length) setLandImages(landRecords.images)
      if (rorRecords?.images?.length) {
        let rr = rorRecords?.images;
        for (let i = 0; i < rr?.length; i++) {
          if (rr[i]?.type == 'application/pdf') rr[i] = await toBase64(rr[i]);
        }
        setRorImages(rr)
      }
    }
  }

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", to: "/" },
      { label: _currLocation.villageName, to: "/survey" },
      { label: "Land Survey" },
    ],
    [_currLocation.villageName]
  );




  return !hydrated ? null : (
    <>
      <div className={styles.root}>
        <Banner />
        <Breadcrumb items={breadcrumbItems} />
        <CitizenForm
          formEditable={
            currCitizen?.status == "SUBMITTED" ||
              (
                currCitizen?.submissionData &&
                Object?.keys(currCitizen?.submissionData)
              )?.length > 0
              ? false
              : true
          }
          handleSubmit={handleSubmit}
          setFormState={setFormState}
          formState={formState}
          currCitizen={currCitizen}
          submittedModal={submittedModal}
          savedEntries={(currCitizen?.submissionData && Object?.keys(currCitizen?.submissionData)?.length > 0 && currCitizen?.status != "SUBMITTED") || false}
          rorImages={rorImages}
          setRorImages={setRorImages}
          landImages={landImages}
          setLandImages={setLandImages}
          rorPdfs={rorPdfs}
          setRorPdfs={setRorPdfs}
        />


        {submittedModal && (
          <CommonModal sx={{ maxHeight: "55vh", maxWidth: '90vw', overflow: "scroll", padding: '1rem' }}>
            {loading ? <div style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              height: '100%',
              justifyContent: "center",
              alignItems: "center",
            }}>
              <CircularProgress color="success" size={50} />
              <p style={{ textAlign: 'center', padding: '2rem 0rem' }}>Please wait while we compress and optimize images</p>
              <MobileStepper
                variant="progress"
                steps={totalSteps}
                position="static"
                activeStep={activeStep}
                sx={{ width: '130vw', marginRight: '-63vw', marginBottom: '1rem' }}
              />
              <p>{activeStep}/{totalSteps}</p>

            </div> : saveSuccess ?
              <div className={styles.submitModal}>
                <div>
                  <Lottie
                    options={defaultOptions}
                    style={{ marginTop: -40 }}
                    height={200}
                    width={200}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    width: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{ fontSize: "1.5rem", marginTop: -40, fontWeight: 600 }}
                  >
                    Land Title Data Saved
                  </p>
                  <p>You will get edit access after next cycle</p>
                  <p>Please get the filled form validated by GP/Tehsildar before syncing</p>
                  <div
                    onClick={() => router.back()}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      background: "#017922",
                      height: "3.5rem",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      marginTop: 30,
                      cursor: 'pointer'
                    }}
                  >
                    Return to Village Screen
                  </div>
                </div>
              </div> : <></>
            }
          </CommonModal>
        )}
        <style>


          {`
        .MuiInputLabel-outlined {
        margin-left: -14px;
                    }
                `}
        </style>
      </div>
    </>
  );
};

export default CitizenSurveyPage;
