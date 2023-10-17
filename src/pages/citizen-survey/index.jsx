"use client";
import React, { useEffect, useState } from "react";
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
import { QrScanner } from "@yudiel/react-qr-scanner";
import GovtBanner from "../../components/GovtBanner";
import { logEvent } from "firebase/analytics";
import { analytics } from "@/services/firebase/firebase";

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
    }, []);

    /* Util Functions */
    const handleSubmit = async () => {
        if (loading) return;
        try {

            setLoading(true);
            let capturedAt = new Date();
            capturedAt.toISOString().slice(0, 19).replace("T", " ");
            // const formData = new FormData();
            // let newSubmissionData = formState;
            // console.log("landRecordsImages ->", landImages)
            // console.log("rorRecordsImages ->", rorImages)
            // formData.append('landRecordsImages', landImages);
            // formData.append('rorRecordsImages', rorImages);
            // formData.append('submissionData', newSubmissionData);
            // formData.append('spdpVillageId', _currLocation.villageCode);
            // formData.append('citizenId', currCitizen.citizenId);
            // formData.append('submitterId', user.id);
            // formData.append('capturedAt', capturedAt);

            // console.log("FORM DATA FOR SUBMITTING -->", Object.fromEntries(formData.entries()))
            // dispatch(
            //     saveCitizenFormData({ spdpVillageId: _currLocation.villageCode, formData: formData })
            // );
            let newFormState = formState;
            newFormState['landRecords'] = landImages;
            newFormState['rorRecords'] = rorImages;
            console.log("Final Submission Object: ", newFormState)
            dispatch(
                saveCitizenFormData({
                    submissionData: newFormState,
                    spdpVillageId: _currLocation.villageCode,
                    citizenId: currCitizen.citizenId,
                    submitterId: user.id,
                    capturedAt,
                })
            );
            setLoading(false);
            showSubmittedModal(true);
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

    return !hydrated ? null : (
        <div className={styles.root}>
            <GovtBanner />
            <CommonHeader
                onBack={() => router.back()}
                text={"Citizen Survey"}
                showLogout={false}
                sx={{
                    justifyContent: "space-between !important",
                    padding: "0rem 1rem 1rem 1rem",
                }}
            />


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
                loading={loading}
                savedEntries={(currCitizen?.submissionData && Object?.keys(currCitizen?.submissionData)?.length > 0 && currCitizen?.status != "SUBMITTED") || false}
                rorImages={rorImages}
                setRorImages={setRorImages}
                landImages={landImages}
                setLandImages={setLandImages}
            />


            {submittedModal && (
                <CommonModal sx={{ maxHeight: "40vh", overflow: "scroll" }}>
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
                                Citizen Data Saved
                            </p>
                            <p>You will get edit access after next cycle</p>
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
                                End Survey
                            </div>
                        </div>
                    </div>
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
    );
};

export default CitizenSurveyPage;
