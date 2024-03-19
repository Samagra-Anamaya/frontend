'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import CommonHeader from '../../components/Commonheader';
import styles from './index.module.scss';

const UnresolvedFlags = ({ params }) => {
	/* Component States and Refs */
	const userData = useSelector((state) => state?.userData);
	const _currLocation = useSelector((state) => state?.userData?.currentLocation);
	const [hydrated, setHydrated] = React.useState(false);
	const [citizens, setCitizens] = useState(_currLocation?.citizens || []);
	const [searchQuery, setSearchQuery] = useState('');
	const router = useRouter();

	/* Use Effects */
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		setHydrated(true);

		setSearchQuery(userData?.searchQuery?.[_currLocation.villageCode] || '');
	}, [_currLocation, userData?.searchQuery]);

	useEffect(() => {
		setCitizens(_currLocation?.citizens || []);
	}, [_currLocation]);

	return !hydrated ? null : (
		<div className={styles.container}>
			{/* <GovtBanner sx={{ paddingTop: '2rem' }} /> */}
			<CommonHeader
				onBack={() => router.back()}
				text={`${_currLocation.villageName}`}
				subText={`Unresolved Flags`}
				showLogout={false}
				sx={{ justifyContent: 'space-between !important', padding: '2rem 1rem' }}
			/>
		</div>
	);
};

export default UnresolvedFlags;
