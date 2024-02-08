/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

'use client';

import React from 'react';
import styles from './index.module.scss';

const CommonHeader = (props) => {
	const { onBack, showBack = true, subText, sx = true } = props;

	return (
		<div className={styles.header} style={{ ...sx }}>
			{showBack ? (
				<div
					className={styles.backBtn}
					style={{ marginTop: subText ? '' : '0rem' }}
					onClick={onBack}
				>
					<img src="/assets/backArrow.png" alt="homeimage" />
				</div>
			) : (
				<div></div>
			)}
			<div>
				<p className={styles.mainText}></p>
				{subText && <p className={styles.subText}></p>}
			</div>
		</div>
	);
};

export default CommonHeader;
