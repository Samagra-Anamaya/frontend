"use client"
import React, { useEffect, useState } from "react";
import styles from './index.module.scss';
import { useDispatch } from "react-redux";
import { logoutUser } from '../../redux/store';
import { useRouter } from "next/navigation";
import CommonModal from '../../components/Modal';
import LogoutIcon from '@mui/icons-material/Logout';

const CommonHeader = (props) => {
    const { onBack, showBack = true, subText, text, sx, showLogout = true } = props;
 
    return (
        <div className={styles.header} style={{ ...sx }}>
            {showBack ? <div className={styles.backBtn} style={{ marginTop: subText ? '' : '0rem' }} onClick={onBack}><img src="/assets/backArrow.png" /></div> : <div></div>
            }
            <div >
                <p className={styles.mainText} ></p>
                {subText && <p className={styles.subText}></p>}
            </div>
            {showLogout ? <div className={styles.logoutBtn} onClick={() => showLogoutModal(true)}><LogoutIcon style={{ color: '#007922', fontSize: 40 }} /></div> : <div style={{ width: '20%' }}></div>}
            
        </div >
    );
};

export default CommonHeader;

