/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

'use client';

import React from 'react';
import Link from 'next/link';
import styles from './index.module.scss';

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
		clName,
		htmlId
	} = props;

	return href?.length ? (
		<Link
			href={href}
			className={`${styles.container} ${clName || ''}`}
			id={htmlId}
			onClick={onClick}
			style={{ ...props.sx, textDecoration: 'none' }}
		>
			<div style={{ width: '45px', height: '45px' }}>
				<img src={leftImage} style={{ width: '40px', height: '40px' }} alt="icon" />
			</div>
			<div>
				<p className={styles.mainText}>{mainText}</p>
				{mainSubtext && <p className={styles.mainSubText}>{mainSubtext}</p>}
			</div>
			{rightImage && (
				<div>
					<img src={rightImage} style={{ width: imgWidth || '' }} alt="icon" />
				</div>
			)}
			{/* {showSubmitBtn && <span style={{width:'5px' ,height:'5px' ,border:'1px solid red',borderRadius:'50%'}}></span>} */}
		</Link>
	) : (
		<div
			className={`${styles.container} ${clName || ''}`}
			id={htmlId}
			onClick={onClick}
			style={{ ...props.sx }}
		>
			<div style={{ width: rightImage ? '' : '10%', margin: rightImage ? '' : '1.5rem' }}>
				<img src={leftImage} style={{ width: '40px', height: '40px' }} alt="icon" />
			</div>
			<div>
				<p className={styles.mainText} style={{ color: mode === 1 ? '#017922' : '#fff' }}>
					{mainText}
				</p>
				{mainSubtext && (
					<p className={styles.mainSubText} style={{ color: mode === 1 ? '#017922' : '#fff' }}>
						{mainSubtext}
					</p>
				)}
			</div>
			<div>
				<img src={rightImage} style={{ width: imgWidth || '' }} alt="icon" />
			</div>
			{onSubBtnClick && (
				<img
					src={rightActionLogo}
					onClick={(ev) => {
						ev.preventDefault();
						ev.stopPropagation();
						onSubBtnClick();
					}}
					style={{ width: '40px', height: '40px' }}
					alt="icon"
				/>
			)}
		</div>
	);
};

export default SelectionItem;
