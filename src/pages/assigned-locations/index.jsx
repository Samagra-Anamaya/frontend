"use client"
import React, { useEffect, useRef, useState } from "react";
import styles from './index.module.scss';
import SelectionItem from "../../components/SelectionItem";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import GovtBanner from "../../components/GovtBanner";
import { clearSubmissions, setCurrentLocation } from "../../redux/store";
import CommonHeader from '../../components/Commonheader';
import { getEntriesMade } from "@/services/api";

const AssignedLocations = () => {
  const [hydrated, setHydrated] = React.useState(false);
  const assignedLocations = useSelector((state) => state?.userData?.assignedLocations);
  const user = useSelector((state) => state?.userData?.user);
  const userData = useSelector((state) => state?.userData);
  const [entries, setEntries] = useState(0);
  const [locations, setLocations] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    async function getEntries() {
      let res = await getEntriesMade(user?.user?.uniqueUsername);
      setEntries(res?.result?.totalCount || "NA");
    }
    getEntries();
    setHydrated(true);
    setLocations(assignedLocations || []);
  }, [])


  console.log("AL ----->", locations)
  console.log("State", userData)

  return !hydrated ? null : (
    <div className={styles.container + " animate__animated animate__fadeIn"}>
      <GovtBanner sx={{ paddingTop: '2rem' }} />
      <div className={styles.mainContent}>
        <CommonHeader
          text={'Hello there 👋'}
          subText={`Enumerator ID : ${user?.user?.username}`}
          showBack={false}
        />
        <div className={styles.userInfoCard}>
          <img src="/assets/infoHeaderIcon.png" />
          <div className={styles.infoitem}>
            <div>Total Villages Assigned</div>
            <div>{locations?.length}</div>
          </div>
          <div className={styles.infoitem}>
            <div>Total Entries Made</div>
            <div>{entries}</div>
          </div>
          <div className={styles.infoitem}>
            <div>Total Unresolved Flags</div>
            <div>0</div>
          </div>
        </div>
        <div className={styles.assignedLocations}>
          <p>Assigned Villages</p>
          {locations?.length > 0 && locations?.map(el => <SelectionItem
            key={el.villageCode}
            onClick={() => { dispatch(setCurrentLocation(el)) }}
            leftImage={'/assets/villageIcon.png'}
            mainText={el.villageName}
            mainSubtext={"Village Code - " + el.villageCode}
            rightImage={'/assets/circleArrow.png'}
            href="/survey"
          />)}
        </div>
      </div>
    </div >
  );
};

export default AssignedLocations;

