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
const AssignedLocations = () => {
  
  const [hydrated, setHydrated] = React.useState(false);
  const assignedLocations = useSelector(
    (state) => state?.userData?.assignedLocations
  );
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

  console.log("AL ----->", locations);
  console.log("State", userData);

  // const label = useMemo(
  //   () => (images?.length > 0 ?  "Upload Media" : "Submit"),
  //   [isMediaUploaded]
  // );

  const submissions = useSelector(
    allSubmissionsSelector
  );
  const token = useSelector(tokenSelector);
 
  const showUploadBtn = useMemo(() =>  images?.length > 0 && showMediaUploadBtn, [images,showMediaUploadBtn]);
  const showSubmitBtn = useMemo(
    () => Object.keys(submissions)?.length > 0 && (!showUploadBtn || isMediaUploaded),
    [submissions,showUploadBtn]
  );
  const onAction = useCallback(async () => {
    const images = await getImages();
    if(!images?.length){
      setShowMediaUploadBtn(false);
      console.log({images,showMediaUploadBtn})
      return
    }
    setLoading(true);
    const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;
   

    for (const _image of images) {
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

      const response = await offlinePackage?.sendRequest(config);
      if (response?.result?.length)
        dispatch(replaceMediaObject(response)).then((res) => {
          if (res.type.includes("fulfilled")) {
            setIsMediaUploaded(true);
            setShowMediaUploadBtn(false);
          }
        });
    }
    setLoading(false);
  }, [dispatch, token]);

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
    dispatch(removeSubmission(response)).then((res) => {
      console.log("ram ram: removeSubmissionRes", { res });
    });
    console.log("debug -submitDataresponse:", { response });
  }, [token,submissions,dispatch]);
console.log({showUploadBtn})
  return !hydrated ? null : (
    <div className={styles.container + " animate__animated animate__fadeIn"}>
      {/* <GovtBanner sx={{ paddingTop: '2rem' }} /> */}
      <Banner />
      <div className={`${styles.mainContent} p-2`}>
        <CommonHeader
          text={"Hello there 👋"}
          subText={`Enumerator ID : ${user?.user?.username}`}
          showBack={false}
        />

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
          {showUploadBtn && 
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
          )}

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
