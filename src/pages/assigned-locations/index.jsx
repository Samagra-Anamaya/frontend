"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import SelectionItem from "../../components/SelectionItem";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { currentLocationSelector, currentVillageSubmissions, setCurrentLocation } from "../../redux/store";
import CommonHeader from "../../components/Commonheader";
import { getAppVersion, getEntriesMade } from "../../services/api";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../services/firebase/firebase";
import Banner from "../../components/Banner";
import { every } from "lodash";
import Footer from "../../components/Footer";
import packageJson from "../../../package.json";
const AssignedLocations = () => {
  const [hydrated, setHydrated] = React.useState(false);
  const assignedLocations = useSelector(
    (state) => state?.userData?.assignedLocations
  );

  const user = useSelector((state) => state?.userData?.user);
  const [entries, setEntries] = useState(0);
  const [locations, setLocations] = useState([]);

  const dispatch = useDispatch();

  useEffect(() => {
    async function getEntries() {
      let res = await getEntriesMade(user);
      setEntries(res?.result?.totalCount || "0");
    }
    getEntries();
    setHydrated(true);
    setLocations(assignedLocations || []);
  }, [user, assignedLocations]);

  // const currentLocation = useSelector(currentLocationSelector)
  // const submissions = useSelector(currentVillageSubmissions);

  // const showSubmitBtn = useMemo(() => {
  //   return every(submissions, (r) => {
  //     const sd = r.submissionData
  //     return sd.rorUpdated ? sd?.rorRecords?.length > 0 && sd?.landRecords?.length > 0 : sd?.landRecords ? sd?.landRecords?.length > 0 : false
  //   })
  // }, [submissions]);

  // console.log({ submissions, currentLocation, showSubmitBtn })


  useEffect(() => {
    getAppVersion().then(res => {
      const version = packageJson.version;
      localStorage.setItem('appVersion', res.data.result.data.version);   
      if (version.split('.').pop() < res.data.result.data.version.split('.').pop()) {
        if (confirm(`Update Alert: Version ${res?.data?.result?.data?.version} is out now! Upgrade from ${version} for the latest features`)) {
          window.location.reload()
        } else {
          window.location.reload()
        }
      }
    })
  }, []);
  
  return !hydrated ? null : (
    <div className={styles.container + " animate__animated animate__fadeIn"}>
      <Banner />
      <div className={`${styles.mainContent} p-2`}>

        <div className={styles.userInfoCard}>
          <img src="/assets/infoHeaderIcon.png" />
          <div className={`${styles.infoitem} p-2 mb-2`}>
            <div>Enumerator Id:</div>
            <div className={styles.subtext} id="enumeratorId">{user?.user?.username}</div>
          </div>
          <div className={`${styles.infoitem} p-2 mb-2`}>
            <div>Villages Under GP:</div>
            <div className={styles.subtext} id="gpVillages">{locations?.length}</div>
          </div>
          <div className={`${styles.infoitem} p-2 mb-2`}>
            <div>Total titles submitted (across all villages under gp):</div>
            <div className={styles.subtext}>{entries}</div>
          </div>
          <div className={`${styles.infoitem} p-2 mb-4`}>
            <div>Flagged entries:</div>
            <div className={styles.subtext}>0</div>
          </div>

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
                  villageCode={el.villageCode}
                  leftImage={"/assets/villageIcon.png"}
                  mainText={el.villageName}
                  mainSubtext={"Village Code - " + el.villageCode}
                  rightImage={"/assets/circleArrow.png"}
                  href="/survey"
                  names="submitBtn"
                  clName="villages"
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
      <Footer />
    </div >
  );
};

export default AssignedLocations;
