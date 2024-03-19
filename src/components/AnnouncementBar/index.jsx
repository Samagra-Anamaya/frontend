'use client';

import React from 'react';
import styles from './index.module.scss';

const AnnouncementBar = (props) => {
	const { text, sx } = props;

	return (
		<div className={styles.container} style={{ ...sx }}>
			{text}
		</div>
	);
};

export default AnnouncementBar;
