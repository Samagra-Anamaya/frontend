import ReactDOM from 'react-dom';
import React from 'react';
import styles from './index.module.css';

const CommonModal = (props) =>
	ReactDOM.createPortal(
		<div className={styles.overlayContainer}>
			<div
				className={`${styles.container} animate__animated animate__slideInUp animate__faster`}
				// eslint-disable-next-line prettier/prettier
				style={{
					...props?.sx
				}}
			>
				{props.children}
			</div>
		</div>,
		document.body
	);

export default CommonModal;
