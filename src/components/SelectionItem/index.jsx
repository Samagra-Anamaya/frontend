"use client"
import { useRouter } from "next/navigation";
import React, { useMemo } from "react";
import styles from './index.module.scss';
import Link from 'next/link'
import { MDBListGroupItem } from "mdbreact";
import { MDBBadge } from "mdbreact";
import { currentVillageSubmissions, getVillageSubmissions } from "../../redux/store";
import { useSelector } from "react-redux";
import { every } from "lodash";

const SelectionItem = (props) => {
    const {
        mode = 0,
        leftImage,
        rightImage,
        mainText,
        mainSubtext,
        onClick,
        href,
        imgWidth,
        onSubBtnClick,
        rightActionLogo = null,
        villageCode,
        names,
        clName,
        htmlId
    } = props
    const router = useRouter();


    const submissions = useSelector(getVillageSubmissions(villageCode));

    const showSubmitBtn = useMemo(() => {

        return names === 'submitBtn' && submissions ? every(submissions, (r) => {
            const sd = r.submissionData
            return sd.rorUpdated ? sd?.rorRecords?.length > 0 && sd?.landRecords?.length > 0 : sd?.landRecords ? sd?.landRecords?.length > 0 : false
        }) : false
    }, [submissions]);

    console.log("shri ram", { showSubmitBtn, submissions });

    return href?.length ?
        (
            <Link href={href} className={`${styles.container} ${clName || ''}`} id={htmlId} onClick={onClick} style={{ ...props.sx, textDecoration: 'none' }}>
                <div style={{ width: '45px', height: '45px' }} >
                    <img src={leftImage} style={{ width: '40px', height: '40px' }} />
                </div>
                <div>
                    <p className={styles.mainText}>{mainText}</p>
                    {mainSubtext && <p className={styles.mainSubText}>{mainSubtext}</p>}
                </div>
                {rightImage && <div>
                    <img src={rightImage} style={{ width: imgWidth ? imgWidth : '' }} />
                </div>}
                {/* {showSubmitBtn && <span style={{width:'5px' ,height:'5px' ,border:'1px solid red',borderRadius:'50%'}}></span>} */}
            </Link>
        ) : (
            <div className={`${styles.container} ${clName || ''}`} id={htmlId} onClick={onClick} style={{ ...props.sx }} >
                <div style={{ width: rightImage ? '' : '10%', margin: rightImage ? '' : '1.5rem' }}>
                    <img src={leftImage} style={{ width: '40px', height: '40px' }} />
                </div>
                <div>
                    <p className={styles.mainText} style={{ color: mode == 1 ? '#017922' : '#fff' }}>{mainText}</p>
                    {mainSubtext && <p className={styles.mainSubText} style={{ color: mode == 1 ? '#017922' : '#fff' }}>{mainSubtext}</p>}
                </div>
                <div>
                    <img src={rightImage} style={{ width: imgWidth ? imgWidth : '' }} />
                </div>
                {onSubBtnClick && <img src={rightActionLogo} onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation()
                    onSubBtnClick()
                }} style={{ width: '40px', height: '40px' }} />}
            </div>

        )
};

export default SelectionItem;
