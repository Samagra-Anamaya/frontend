'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import Pagination from '@mui/material/Pagination';
import { TextField, InputAdornment, CircularProgress } from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import { toast } from 'react-toastify';
import { MDBListGroup } from 'mdbreact';
import moment from 'moment';
import Lottie from 'react-lottie';
import * as emptyState from '../../utils/lottie/emptyState.json';

import Breadcrumb from '../../components/Breadcrumb';
import ListItem from '../../components/ListItem';
import Banner from '../../components/Banner';

import { setCurrentCitizen, updateSearchSavedQuery } from '../../redux/store';
import styles from './index.module.scss';

// Lottie Options
const defaultOptions = {
	loop: true,
	autoplay: true,
	animationData: emptyState,
	rendererSettings: {
		preserveAspectRatio: 'xMidYMid slice'
	}
};

const SavedEntries = ({ params }) => {
	/* Component States and Refs */
	const userData = useSelector((state) => state?.userData);
	const submissions = useSelector((state) => state?.userData?.submissions);
	const _currLocation = useSelector((state) => state?.userData?.currentLocation);
	const currCitizen = useSelector((state) => state?.userData?.currentCitizen);
	const [fileUploading, setFileUploading] = useState(false);
	const [limit, setLimit] = useState(5);
	const [hydrated, setHydrated] = React.useState(false);
	const [citizens, setCitizens] = useState(_currLocation?.citizens || []);

	const [currPage, setCurrPage] = React.useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [prevSubmissions, setPrevSubmissions] = useState([]);
	const prevTempSubmissions = useRef([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [fetching, setFetching] = useState(false);
	const router = useRouter();
	const dispatch = useDispatch();
	const containerRef = useRef();

	/* Use Effects */
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		setHydrated(true);

		setSearchQuery(userData?.searchSavedQuery?.[_currLocation.villageCode] || '');

		// eslint-disable-next-line no-unsafe-optional-chaining
		const _totalPages = Math.ceil(submissions?.[_currLocation.villageCode]?.length / limit || 0);
		setTotalPages(_totalPages || 0);
	}, [_currLocation, limit, submissions, userData?.searchSavedQuery]);

	useEffect(() => {
		setCitizens(_currLocation?.citizens || []);
	}, [_currLocation]);

	useEffect(() => {
		const newSubmissions = submissions?.[_currLocation.villageCode];
		if (newSubmissions?.length) {
			const newIndex = (currPage - 1) * limit;
			const paginatedSubmissions = newSubmissions.slice(newIndex, newIndex + limit);
			setPrevSubmissions(paginatedSubmissions);
			prevTempSubmissions.current = paginatedSubmissions;
		}
	}, [_currLocation.villageCode, currPage, limit, submissions]);

	useEffect(() => {
		if (searchQuery?.length) {
			const newSubmissions = submissions?.[_currLocation.villageCode];
			if (newSubmissions?.length) {
				const res = newSubmissions?.filter(
					(el) =>
						el?.submissionData?.claimantName
							?.toLowerCase()
							?.startsWith(searchQuery.toLowerCase()) ||
						el?.submissionData?.aadharNumber?.startsWith(searchQuery.toLowerCase())
				);

				setPrevSubmissions(res);
			}
		} else {
			setPrevSubmissions(prevTempSubmissions.current);
		}
	}, [_currLocation.villageCode, searchQuery, submissions]);

	const searchCitizenSubmission = async (e) => {
		setSearchQuery(e.target.value);
		dispatch(
			updateSearchSavedQuery({
				villageId: _currLocation.villageCode,
				query: e.target.value
			})
		);
	};

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollIntoView();
		}
	});

	const breadcrumbItems = useMemo(
		() => [
			{ label: 'Home', to: '/' },
			{ label: `${_currLocation.villageName}`, to: '/survey' },
			{ label: 'Saved titles' }
		],
		[_currLocation.villageName]
	);

	return !hydrated ? null : (
		<div className={styles.container} ref={containerRef}>
			<Banner />
			<Breadcrumb items={breadcrumbItems} />

			<div className={`${styles.citizenContainer} animate__animated animate__fadeIn pb-2`}>
				<div className={styles.submissionContainer}>
					{!(!fetching && !prevSubmissions?.length && !searchQuery) && (
						<TextField
							id="search"
							color="success"
							type="search"
							label={searchQuery ? '' : 'Search entries here ...'}
							value={searchQuery}
							onChange={searchCitizenSubmission}
							sx={{
								marginBottom: '2rem',
								border: 'none',
								// border: "2px solid #007922",
								borderRadius: '1rem'
							}}
							fullWidth
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<SearchIcon />
									</InputAdornment>
								)
							}}
						/>
					)}
					{fileUploading && 'loading'}
					{fetching && <CircularProgress color="success" />}
					<MDBListGroup style={{ minWidth: '22rem' }} className="mb-1" light>
						{!fetching &&
							prevSubmissions?.length > 0 &&
							prevSubmissions?.map((el) => (
								<ListItem
									key={el.citizenId}
									leftImage={'/assets/citizen.svg'}
									// rightImage={"/assets/upload-icon.png"}
									secondaryLoading={fileUploading}
									mainSubtext={moment(el?.capturedAt).format('DD MMM YYYY, hh:mm a')}
									mainText={el?.submissionData?.claimantName}
									sx={{
										background: '#fff',
										padding: '0.5rem',
										border: '1px solid lightgray'
									}}
									mode={1}
									imgWidth="70%"
									onClick={() => {
										dispatch(setCurrentCitizen(el));
										router.push(`/citizen-survey`);
									}}
								/>
							))}
					</MDBListGroup>
					{!fetching && !prevSubmissions?.length && !searchQuery && (
						<div>
							<p className={styles.noRecordsFound}>No Records Found</p>
							<p className={styles.noRecordsSubText}>Please try adding some new land titles</p>
							<Lottie
								options={defaultOptions}
								style={{ marginTop: -40 }}
								height={300}
								width={300}
							/>
						</div>
					)}
				</div>
				{!searchQuery && !fetching && (
					<div className="my-2">
						<Pagination
							count={totalPages}
							color="success"
							onChange={(event, page) => setCurrPage(page)}
							className={styles.paginationContainer}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default SavedEntries;
