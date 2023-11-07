"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import CommonHeader from "../../components/Commonheader";
import * as submissionLottie from "public/lottie/submission.json";
import { saveCitizenFormData } from "../../redux/store";
import CommonModal from "../../components/Modal";
import Lottie from "react-lottie";
import { useOfflineSyncContext } from "offline-sync-handler-test";
import CitizenForm from "../../components/CitizenForm";
// import QrReader from 'react-qr-scanner'
// import { QrScanner } from "@yudiel/react-qr-scanner";
import { logEvent } from "firebase/analytics";
import CircularProgress from "@mui/material/CircularProgress";
import { analytics } from "../../services/firebase/firebase";
import { compressImage, getCitizenImageRecords, getImages, storeImages } from "../../services/utils";
import Banner from "../../components/Banner";
import Breadcrumb from "../../components/Breadcrumb";
import moment from "moment";
import { MobileStepper } from "@mui/material";
import { v4 as uuidv4 } from "uuid";

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
  const [totalSteps, setTotalSteps] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const user = useSelector((state) => state?.userData?.user?.user);
  const _currLocation = useSelector(
    (state) => state?.userData?.currentLocation
  );
  const currCitizen = useSelector((state) => state?.userData?.currentCitizen);
  const [submittedModal, showSubmittedModal] = useState(false);
  const [isMobile, setIsMobile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formEditable, setFormEditable] = useState(false);

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


  /* Util Functions */
  const handleSubmit = async () => {
    if (loading) return;
    try {
      setLoading(true);
      showSubmittedModal(true);
      let capturedAt = moment().utc();
      setTotalSteps((landImages?.length || 0) + (rorImages?.length || 0))
      for (let el in landImages) {
        const compressedImg = await compressImage(landImages[el].file);
        setActiveStep(Number(el) + 1);
        landImages[el] = compressedImg;
      }
      for (let el in rorImages) {
        const compressedImg = await compressImage(rorImages[el].file);
        setActiveStep((landImages?.length || 0) + Number(el) + 1);

        rorImages[el] = compressedImg;
      }

      // for (let i = 0; i < 100; i++) {
      // console.log("SAVING FORM ", i)
      // let c = uuidv4();

      if (landImages?.length) await storeImages(
        {
          citizenId: currCitizen.citizenId,
          images: landImages,
          isLandRecord: true,
          villageId: _currLocation.villageCode
        }
      );
      if (rorImages?.length) await storeImages(
        {
          citizenId: currCitizen.citizenId,
          images: rorImages,
          isLandRecord: false,
          villageId: _currLocation.villageCode
        }
      );

      let newFormState = { ...formState };
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

      console.log("Final Submission Object: ", newFormState)

      dispatch(
        saveCitizenFormData({
          submissionData: newFormState,
          spdpVillageId: _currLocation.villageCode,
          citizenId: currCitizen.citizenId,
          submitterId: user.username,
          capturedAt,
        })
      );
      // }
      setLoading(false);
      logEvent(analytics, "form_saved", {
        villageId: _currLocation.villageCode,
        villageName: _currLocation.villageName,
        user_id: user?.username,
        app_status: navigator.onLine ? 'online' : 'offline',
        capturedAt: capturedAt
      });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };


  const getImagesFromStore = async () => {
    let { landRecords, rorRecords } = await getCitizenImageRecords(currCitizen.citizenId);
    if (currCitizen?.submissionData && Object.keys(currCitizen?.submissionData)?.length > 0) {
      if (landRecords?.images?.length) setLandImages(landRecords.images)
      if (rorRecords?.images?.length) setRorImages(rorRecords.images)
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

            </div> :
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
                    }}
                  >
                    Return to Village Screen
                  </div>
                </div>
              </div>
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
