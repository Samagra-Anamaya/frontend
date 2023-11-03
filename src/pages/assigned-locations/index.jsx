"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./index.module.scss";
import SelectionItem from "../../components/SelectionItem";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import GovtBanner from "../../components/GovtBanner";
import {
  allSubmissionsSelector,
  bulkSaveSubmission,
  clearSubmissions,
  setCurrentLocation,
  testboi,
  tokenSelector,
} from "../../redux/store";
import CommonHeader from "../../components/Commonheader";
import { getEntriesMade } from "../../services/api";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../services/firebase/firebase";
import Banner from "../../components/Banner";
import { getImages } from "../../services/utils";
import { v4 as uuidv4 } from "uuid";
import { useOfflineSyncContext } from "offline-sync-handler-test";
import { replaceMediaObject } from "../../redux/actions/replaceMediaObject";
import { removeSubmission } from "../../redux/actions/removeSubmission";
import localforage from "localforage";
import { toast } from "react-toastify";
const AssignedLocations = () => {
  const [hydrated, setHydrated] = React.useState(false);
  const assignedLocations = useSelector(
    (state) => state?.userData?.assignedLocations
  );
  const [showSecondBtn, setshowSecondBtn] = useState(true);
  const user = useSelector((state) => state?.userData?.user);
  const userData = useSelector((state) => state?.userData);
  const [images, setImages] = useState(null);
  const [entries, setEntries] = useState(0);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMediaUploaded, setIsMediaUploaded] = useState(false);
  const [showMediaUploadBtn, setShowMediaUploadBtn] = useState(false);
  const dispatch = useDispatch();
  const offlinePackage = useOfflineSyncContext();

  useEffect(() => {
    const findImages = async () => {
      const imgs = await getImages();
      console.log({ imgs });
      setImages(imgs);
      setShowMediaUploadBtn(imgs?.length > 0);
    };
    findImages();
  }, []);

  useEffect(() => {
    async function getEntries() {
      console.log({ user });
      let res = await getEntriesMade(user);
      setEntries(res?.result?.totalCount || "NA");
    }
    getEntries();
    setHydrated(true);
    setLocations(assignedLocations || []);
  }, [user, assignedLocations]);


  const submissions = useSelector(allSubmissionsSelector);
  const token = useSelector(tokenSelector);

  const showUploadBtn = useMemo(
    () => images?.length > 0 && showMediaUploadBtn,
    [images, showMediaUploadBtn]
  );
  const showSubmitBtn = useMemo(
    () =>
      Object.keys(submissions)?.length > 0 &&
      (!showUploadBtn || isMediaUploaded),
    [submissions, showUploadBtn]
  );
  const onAction = useCallback(async () => {
    const images = await localforage.getItem("_imageRecords");;
    if (!images?.length) {
      setShowMediaUploadBtn(false);
      return;
    }
    setLoading(true);
    const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;

    // for (const _image of images) {
    //   let data = new FormData();
    //   _image?.images.forEach((file) => {
    //     data.append("files", file, uuidv4() + ".webp");
    //   });

    //   data.append("meta", JSON.stringify(_image));

    //   const config = {
    //     method: "POST",
    //     url: BACKEND_SERVICE_URL + `/upload/multiple`,
    //     meta: _image,
    //     data,
    //     isFormdata: true,
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   };

    //   const response = await offlinePackage?.sendRequest(config);
    //   if (response?.result?.length)
    //     dispatch(replaceMediaObject(response)).then((res) => {
    //       if (res.type.includes("fulfilled")) {
    //         setIsMediaUploaded(true);
    //         setShowMediaUploadBtn(false);
    //       }
    //     });
    // }
    uploadImagesInBatches(images, token);

    // onSubmit();
  }, [dispatch, token, submissions, uploadImagesInBatches]);

  async function uploadImagesInBatches(images, token) {
    const BATCH_SIZE = 10;
    const DELAY_TIME = 3000; // Delay time in milliseconds (5 seconds)
    const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;

    setLoading(true);
    // Function to split the array into chunks of a specified size
    const chunkArray = (arr, size) => {
      const chunks = [];
      for (let i = 0; i < arr.length; i += size) {
        chunks.push(arr.slice(i, i + size));
      }
      return chunks;
    };

    // Sleep function to introduce a delay
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Splitting the images array into batches of 20
    const batches = chunkArray(images, BATCH_SIZE);

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
        if (res?.type.includes("fulfilled")) {
          setIsMediaUploaded(true);
          setShowMediaUploadBtn(false);
        }
      });

      // Introduce a delay before processing the next batch
      await sleep(DELAY_TIME);

    }
    setLoading(false);
    onSubmit();
    console.log("hola all done")
  }





  const onSubmit = useCallback(async () => {
    const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;
    const config = {
      method: "POST",
      url: BACKEND_SERVICE_URL + `/submissions/bulk`,
      data: submissions,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await offlinePackage?.sendRequest(config);

    console.log("ram ram submitDataResponse:", { response });
    if (response) {
      toast.success("Uploaded..")
      dispatch(removeSubmission(response)).then((res) => {
        console.log("ram ram: removeSubmissionRes", { res });
        toast.success("records uploaded");
        setshowSecondBtn(true);
        localforage.removeItem('_imageRecords')
      });
    }
    console.log("debug -submitDataresponse:", { response });
  }, [token, submissions, dispatch]);

  const dummySubmission = useCallback(async () => {
    setLoading(true);
    const images = await getImages();
    console.log("shri ram", { images, submissions, rec: submissions?.['404234']?.[0] });
    const submissionsArray = [];
    const imagesArray = [];
    [...Array(100).keys()].forEach((num) => {
      imagesArray.push({ ...images[0], citizenId: `Bulk Test-${num}` });
      imagesArray.push({ ...images[1], citizenId: `Bulk Test-${num}` });
      submissionsArray.push({
        ...submissions?.['404234']?.[0], citizenId: `Bulk Test-${num}`, submissionData: {
          ...submissions?.['404234']?.[0]?.submissionData,
          claimantName: `Bulk Test-${num}`
        }
      });
    });
    dispatch(bulkSaveSubmission({
      '404234': submissionsArray
    }))
    const r = await localforage.setItem("_imageRecords", imagesArray);
    if (r) {
      toast.success("Records stored");
      setshowSecondBtn(false);
      setLoading(false);
    }
    console.log({ imagesArray });
  }, [submissions, dispatch]);
  return !hydrated ? null : (
    <div className={styles.container + " animate__animated animate__fadeIn"}>
      {/* <GovtBanner sx={{ paddingTop: '2rem' }} /> */}
      <Banner />
      <div className={`${styles.mainContent} p-2`}>

        <div className={styles.userInfoCard}>
          <img src="/assets/infoHeaderIcon.png" />
          <div className={`${styles.infoitem} p-2 mb-2`}>
            <div>Enumerator Id:</div>
            <div className={styles.subtext}>{user?.user?.username}</div>
          </div>
          <div className={`${styles.infoitem} p-2 mb-2`}>
            <div>Total Villages Assigned:</div>
            <div className={styles.subtext}>{locations?.length}</div>
          </div>
          <div className={`${styles.infoitem} p-2 mb-2`}>
            <div>Total Entries Made:</div>
            <div className={styles.subtext}>{entries}</div>
          </div>
          <div className={`${styles.infoitem} p-2 mb-4`}>
            <div>Total Unresolved Flags:</div>
            <div className={styles.subtext}>0</div>
          </div>
          {showSecondBtn ? (
            <button onClick={dummySubmission} className="btn btn-primary">
              {loading ? 'Loading...' : 'Create Image records'}
            </button>
          ) : (
            <button onClick={onAction} className="btn btn-primary">
              {loading ? 'Loading...' : 'Submit 100 records'}
            </button>
          )}
          {/* {showUploadBtn && 
            <div
              className={` p-2 mb-4 btn text-center btn-primary`}
              onClick={onAction}
            >
              <div>Upload Media</div>
            </div>
           }  
           {(
          showSubmitBtn && (
              <div
                className={` p-2 mb-4 btn text-center btn-primary`}
                onClick={onSubmit}
              >
                <div> Submit </div>
              </div>
            )
          )} */}

          <div className={`${styles.assignedLocations} p-3`}>
            <p>Assigned Villages</p>
            {locations?.length > 0 &&
              locations?.map((el) => (
                <SelectionItem
                  key={el.villageCode}
                  onClick={() => {
                    logEvent(analytics, "village_clicked", {
                      villageId: el.villageCode,
                      villageName: el.villageName,
                      user_id: user?.user?.username,
                    });
                    dispatch(setCurrentLocation(el));
                  }}
                  leftImage={"/assets/villageIcon.png"}
                  mainText={el.villageName}
                  mainSubtext={"Village Code - " + el.villageCode}
                  rightImage={"/assets/circleArrow.png"}
                  href="/survey"
                />
              ))}
          </div>
        </div>
        {/* <div className={styles.assignedLocations}>
          <p>Assigned Villages</p>
          {locations?.length > 0 && locations?.map(el => <SelectionItem
            key={el.villageCode}
            onClick={() => {
              logEvent(analytics, "village_clicked", {
                villageId: el.villageCode,
                villageName: el.villageName,
                user_id: user?.user?.username
              }); dispatch(setCurrentLocation(el))
            }}
            leftImage={'/assets/villageIcon.png'}
            mainText={el.villageName}
            mainSubtext={"Village Code - " + el.villageCode}
            rightImage={'/assets/circleArrow.png'}
            href="/survey"
          />)}
        </div> */}
      </div>
    </div>
  );
};

export default AssignedLocations;
