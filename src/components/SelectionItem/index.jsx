"use client"
import { useRouter } from "next/navigation";
import React from "react";
import styles from './index.module.scss';
import Link from 'next/link'
import { MDBListGroupItem } from "mdbreact";
import { MDBBadge } from "mdbreact";

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
        rightActionLogo=null
    } = props
    const router = useRouter();

    return href?.length ?
        (
            <Link href={href} className={`${styles.container}`} onClick={onClick} style={{ ...props.sx, textDecoration: 'none' }}>
                <div style={{width:'45px' ,height:'45px'}} >
                    <img src={leftImage} style={{width:'40px' ,height:'40px'}}  />
                </div>
                <div>
                    <p className={styles.mainText}>{mainText}</p>
                    {mainSubtext && <p className={styles.mainSubText}>{mainSubtext}</p>}
                </div>
                {rightImage && <div>
                    <img src={rightImage} style={{ width: imgWidth ? imgWidth : '' }} />
                </div>}
            </Link>
        ) : (
            <div className={styles.container} onClick={onClick} style={{ ...props.sx }} >
                <div style={{ width: rightImage ? '' : '40%', margin: rightImage ? '' : '1.5rem' }}>
                    <img src={leftImage} style={{width:'40px' ,height:'40px'}} />
                </div>
                <div>
                    <p className={styles.mainText} style={{ color: mode == 1 ? '#017922' : '#fff' }}>{mainText}</p>
                    {mainSubtext && <p className={styles.mainSubText} style={{ color: mode == 1 ? '#017922' : '#fff' }}>{mainSubtext}</p>}
                </div>
                <div>
                    <img src={rightImage} style={{ width: imgWidth ? imgWidth : '' }} />
                </div>
                 {onSubBtnClick && <img src={rightActionLogo} onClick={(ev)=>{
                    ev.preventDefault();
                    ev.stopPropagation()
                    onSubBtnClick()
                 }} style={{ width: '40px' ,height:'40px' }} /> }
            </div>
         
        )
};

export default SelectionItem;
