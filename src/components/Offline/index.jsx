import React from 'react';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import moment from 'moment/moment';

export const OfflineTag = ({ isOnline }) => {
	if (isOnline) return null;
	return (
		<div
			className="container  d-flex justify-content-between fixed-top "
			style={{ backgroundColor: '#FF6666' }}
		>
			<WifiOffIcon style={{ color: '#ffff', fontSize: 15 }} />
			<span style={{ color: '#ffff', fontSize: 12 }}> {moment().format('hh:mm a')} </span>
		</div>
	);
};
