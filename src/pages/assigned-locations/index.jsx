'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logEvent } from 'firebase/analytics';

import { map } from 'lodash';
import styles from './index.module.scss';
import SelectionItem from '../../components/SelectionItem';
import { setCurrentLocation } from '../../redux/store';

import { getEntriesMade } from '../../services/api';
import { analytics } from '../../services/firebase/firebase';
import Banner from '../../components/Banner';
import Footer from '../../components/Footer';

const AssignedLocations = () => {
	const [hydrated, setHydrated] = React.useState(false);
	const assignedLocations = useSelector((state) => state?.userData?.assignedLocations);

	const user = useSelector((state) => state?.userData?.user);
	const [entries, setEntries] = useState(0);
	const [locations, setLocations] = useState([]);

	const dispatch = useDispatch();

	useEffect(() => {
		async function getEntries() {
			const res = await getEntriesMade(user);
			setEntries(res?.result?.totalCount || '0');
		}
		getEntries();
		setHydrated(true);
		setLocations(assignedLocations || []);
	}, [user, assignedLocations]);

	const statusTable = useMemo(
		() => [
			{ label: 'Enumerator Id', value: user?.user?.username, id: '#item1', margin: 'mb-2' },
			{ label: 'Villages Under GP:', value: locations?.length, id: '#item2', margin: 'mb-2' },
			{
				label: 'Total titles submitted (across all villages under gp)',
				value: entries,
				id: '#item3',
				margin: 'mb-2'
			},
			{ label: 'Flagged entries', value: '0', id: '#item4', margin: 'mb-4' }
		],
		[entries, locations?.length, user?.user?.username]
	);

	if (!hydrated) return null;
	return (
		<div className={`${styles.container} animate__animated animate__fadeIn`}>
			<Banner />
			<div className={`${styles.mainContent} p-2`}>
				<div className={styles.userInfoCard}>
					<img src="/assets/infoHeaderIcon.png" alt="user" />
					{map(statusTable, (item) => (
						<div className={`${styles.infoitem} p-2 ${item.margin}`} id={item.id}>
							<div>{item.label}:</div>
							<div className={styles.subtext}>{item.value}</div>
						</div>
					))}

					<div className={`${styles.assignedLocations} p-3`}>
						<p>Assigned Villages</p>
						{locations?.length > 0 &&
							locations?.map((el) => (
								<SelectionItem
									key={el.villageCode}
									onClick={() => {
										logEvent(analytics, 'village_clicked', {
											villageId: el.villageCode,
											villageName: el.villageName,
											user_id: user?.user?.username
										});
										dispatch(setCurrentLocation(el));
									}}
									villageCode={el.villageCode}
									leftImage={'/assets/villageIcon.png'}
									mainText={el.villageName}
									mainSubtext={`Village Code - ${el.villageCode}`}
									rightImage={'/assets/circleArrow.png'}
									href="/survey"
									names="submitBtn"
									clName="villages"
								/>
							))}
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default AssignedLocations;
