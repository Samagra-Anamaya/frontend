if (!self.define) {
	let e,
		s = {};
	const a = (a, i) => (
		(a = new URL(a + '.js', i).href),
		s[a] ||
			new Promise((s) => {
				if ('document' in self) {
					const e = document.createElement('script');
					(e.src = a), (e.onload = s), document.head.appendChild(e);
				} else (e = a), importScripts(a), s();
			}).then(() => {
				let e = s[a];
				if (!e) throw new Error(`Module ${a} didn’t register its module`);
				return e;
			})
	);
	self.define = (i, c) => {
		const n = e || ('document' in self ? document.currentScript.src : '') || location.href;
		if (s[n]) return;
		let t = {};
		const r = (e) => a(e, n),
			o = { module: { uri: n }, exports: t, require: r };
		s[n] = Promise.all(i.map((e) => o[e] || r(e))).then((e) => (c(...e), t));
	};
}
define(['./workbox-80ca14c3'], function (e) {
	'use strict';
	importScripts(),
		self.skipWaiting(),
		e.clientsClaim(),
		e.precacheAndRoute(
			[
				{ url: '/_next/static/chunks/19-1f846652f56fc15b.js', revision: '1f846652f56fc15b' },
				{ url: '/_next/static/chunks/1c6c1d2f-c357935239a6c824.js', revision: 'c357935239a6c824' },
				{ url: '/_next/static/chunks/269-db1ed7c4ffc01dc4.js', revision: 'db1ed7c4ffc01dc4' },
				{ url: '/_next/static/chunks/322-a7281b71bcd74177.js', revision: 'a7281b71bcd74177' },
				{ url: '/_next/static/chunks/326-9a07620864cd0808.js', revision: '9a07620864cd0808' },
				{ url: '/_next/static/chunks/36-85ad1a450edde611.js', revision: '85ad1a450edde611' },
				{ url: '/_next/static/chunks/379-576b089a0da7a814.js', revision: '576b089a0da7a814' },
				{ url: '/_next/static/chunks/400-637b82ee6ec36589.js', revision: '637b82ee6ec36589' },
				{ url: '/_next/static/chunks/7f2d235d-92315185af00342a.js', revision: '92315185af00342a' },
				{ url: '/_next/static/chunks/909-619298ff52327392.js', revision: '619298ff52327392' },
				{ url: '/_next/static/chunks/95-7a6b8130770937e9.js', revision: '7a6b8130770937e9' },
				{ url: '/_next/static/chunks/958-599636245a215948.js', revision: '599636245a215948' },
				{ url: '/_next/static/chunks/974-37f88861ea8df22d.js', revision: '37f88861ea8df22d' },
				{ url: '/_next/static/chunks/d3a2d874-1b0a3eabbdf222bc.js', revision: '1b0a3eabbdf222bc' },
				{ url: '/_next/static/chunks/framework-ed66dd8a32a1d8f6.js', revision: 'ed66dd8a32a1d8f6' },
				{ url: '/_next/static/chunks/main-aecdac618a5c9fe8.js', revision: 'aecdac618a5c9fe8' },
				{
					url: '/_next/static/chunks/pages/Default-23fd9e6cde317b2c.js',
					revision: '23fd9e6cde317b2c'
				},
				{
					url: '/_next/static/chunks/pages/Home-a886fbb0024a5ca4.js',
					revision: 'a886fbb0024a5ca4'
				},
				{
					url: '/_next/static/chunks/pages/_app-48f172c5269ceb91.js',
					revision: '48f172c5269ceb91'
				},
				{
					url: '/_next/static/chunks/pages/_error-167fdaf1c9e71f7f.js',
					revision: '167fdaf1c9e71f7f'
				},
				{
					url: '/_next/static/chunks/pages/assigned-locations-48a741d170a16ca7.js',
					revision: '48a741d170a16ca7'
				},
				{
					url: '/_next/static/chunks/pages/citizen-survey-3cf4d83db7cc7a6a.js',
					revision: '3cf4d83db7cc7a6a'
				},
				{
					url: '/_next/static/chunks/pages/completed-entries-90c24178da1f0cdf.js',
					revision: '90c24178da1f0cdf'
				},
				{
					url: '/_next/static/chunks/pages/index-ac3b0bf119378d65.js',
					revision: 'ac3b0bf119378d65'
				},
				{
					url: '/_next/static/chunks/pages/saved-entries-5e7c4aaf00876d6b.js',
					revision: '5e7c4aaf00876d6b'
				},
				{
					url: '/_next/static/chunks/pages/survey-1920659f3ebe3d7f.js',
					revision: '1920659f3ebe3d7f'
				},
				{
					url: '/_next/static/chunks/pages/unresolved-flags-29e850da4de8c5b5.js',
					revision: '29e850da4de8c5b5'
				},
				{
					url: '/_next/static/chunks/polyfills-c67a75d1b6f99dc8.js',
					revision: '837c0df77fd5009c9e46d446188ecfd0'
				},
				{ url: '/_next/static/chunks/webpack-09170584866bc488.js', revision: '09170584866bc488' },
				{ url: '/_next/static/css/088ee1810ce3685e.css', revision: '088ee1810ce3685e' },
				{ url: '/_next/static/css/1c19826af0ced6cd.css', revision: '1c19826af0ced6cd' },
				{ url: '/_next/static/css/28c284675b4f78ba.css', revision: '28c284675b4f78ba' },
				{ url: '/_next/static/css/39534c31adc0395f.css', revision: '39534c31adc0395f' },
				{ url: '/_next/static/css/ba4557376b7413c6.css', revision: 'ba4557376b7413c6' },
				{ url: '/_next/static/css/c85741007ee9ce90.css', revision: 'c85741007ee9ce90' },
				{ url: '/_next/static/css/dedf768836e1a7e7.css', revision: 'dedf768836e1a7e7' },
				{ url: '/_next/static/css/e5c9d0e437aaeb82.css', revision: 'e5c9d0e437aaeb82' },
				{ url: '/_next/static/css/e8e97c0b05d3c12c.css', revision: 'e8e97c0b05d3c12c' },
				{ url: '/_next/static/media/01.8c372d2f.png', revision: '8c372d2f' },
				{ url: '/_next/static/media/02.ab446d23.png', revision: 'ab446d23' },
				{ url: '/_next/static/media/03.3a39a5f3.png', revision: '3a39a5f3' },
				{ url: '/_next/static/media/04.2a56bef5.png', revision: '2a56bef5' },
				{ url: '/_next/static/media/05.aec8ef49.png', revision: 'aec8ef49' },
				{ url: '/_next/static/media/06.23939143.png', revision: '23939143' },
				{ url: '/_next/static/media/07.53141ebc.png', revision: '53141ebc' },
				{ url: '/_next/static/media/08.a41312f8.png', revision: 'a41312f8' },
				{ url: '/_next/static/media/09.d0d302c4.png', revision: 'd0d302c4' },
				{ url: '/_next/static/media/Mulish-Bold.792fb274.ttf', revision: '792fb274' },
				{ url: '/_next/static/media/Mulish-Demi.0a4236f1.ttf', revision: '0a4236f1' },
				{ url: '/_next/static/media/Mulish-Medium.89b626ee.ttf', revision: '89b626ee' },
				{ url: '/_next/static/media/Mulish-Regular.a4c4b1ab.ttf', revision: 'a4c4b1ab' },
				{ url: '/_next/static/media/arrow_left.1427f2e5.svg', revision: '1427f2e5' },
				{ url: '/_next/static/media/arrow_right.906838c7.svg', revision: '906838c7' },
				{
					url: '/_next/static/pP72wZjd5ChYXBwUHi1ao/_buildManifest.js',
					revision: 'da66b6dc083b72b28d79e5d6be0fab46'
				},
				{
					url: '/_next/static/pP72wZjd5ChYXBwUHi1ao/_ssgManifest.js',
					revision: 'b6652df95db52feb4daf4eca35380933'
				},
				{ url: '/assets/arrow-left copy.png', revision: '55c521fa93ef5ac95552eed25d39ba3c' },
				{ url: '/assets/arrow-left.png', revision: '55c521fa93ef5ac95552eed25d39ba3c' },
				{
					url: '/assets/arrow-right-circle copy.png',
					revision: 'db84e3b4a02d10af6ff68c593a12fae1'
				},
				{ url: '/assets/arrow-right-circle.png', revision: 'db84e3b4a02d10af6ff68c593a12fae1' },
				{ url: '/assets/assessment.png', revision: '7fcbfbe85b613be8469d730e736f86b7' },
				{ url: '/assets/backArrow.png', revision: '081a1e2e606ebe0fee4e340864248bb1' },
				{ url: '/assets/circleArrow.png', revision: '9f04c0b0242dbc48abca122622901c1c' },
				{ url: '/assets/circleArrowGreen.png', revision: '27151a4bbf126b2b900d863188e4a8e3' },
				{ url: '/assets/citizen.png', revision: '98b93069de1f51b7c58b510df86e5ef5' },
				{ url: '/assets/citizen.svg', revision: '5341df3f705838001a2846eb1ce3883c' },
				{ url: '/assets/docFill.png', revision: '77b8ef2643285a2d0dde0ced1359075e' },
				{ url: '/assets/errorIcon.png', revision: '01c3fa21cb51fb902ae07c397d51f495' },
				{ url: '/assets/govtLogo.png', revision: 'a7a384269649b5ff6980bce898664c74' },
				{ url: '/assets/infoHeaderIcon.png', revision: '3ccea3b31fbdf445c4e5f5da6747dfb1' },
				{ url: '/assets/logout.png', revision: '3b8a7f539986e6e954885f916743684a' },
				{ url: '/assets/qr.png', revision: '606ff9c618bc3276ed803ebe3bed6628' },
				{ url: '/assets/scanQr.png', revision: '4a12b24c877682590b8fa7ee2c656d09' },
				{ url: '/assets/sleepGraph.png', revision: '2aab09c68447e9d5c1374bea674a7e37' },
				{ url: '/assets/survey.png', revision: '2eb736adaebf7edb5a3150b75816f9ad' },
				{ url: '/assets/unresolvedFlags.png', revision: '907e16627f5e81b655ad1291ad6b2ce2' },
				{ url: '/assets/upload-icon.png', revision: '6aa3bdada4abe93b240e2a3bc4a38ac0' },
				{ url: '/assets/uplogo copy.png', revision: 'f1f5d76469c197a959d6e3abeab1592d' },
				{ url: '/assets/uplogo.png', revision: 'f1f5d76469c197a959d6e3abeab1592d' },
				{ url: '/assets/verified.png', revision: '3819d4e71b8f7fc2dcf876c941430c50' },
				{ url: '/assets/villageIcon.png', revision: '5d875b53d72f1ba8689530c8f37e0384' },
				{ url: '/favicon.ico', revision: 'c30c7d42707a47a3f4591831641e50dc' },
				{ url: '/icons/favicon-16x16.png', revision: 'cf0216471c1490b079fa1a61190fa912' },
				{ url: '/icons/favicon-32x32.png', revision: '909b8f4dc170cc2fcd66f804689b9b44' },
				{ url: '/icons/favicon.ico', revision: '5f397ce3b9e7d824c2e41719d3152927' },
				{ url: '/icons/icon-192x192.png', revision: '08c9bb530af1276efc2e700eab5a06dc' },
				{ url: '/icons/icon-256x256.png', revision: '04299b9c049ed5c86d27652026e80a10' },
				{ url: '/icons/icon-384x384.png', revision: 'b73220183ec539e600a9d95e144c8684' },
				{ url: '/icons/icon-512x512.png', revision: 'dac13598de96dd048705545d940f05d2' },
				{ url: '/icons/logo192.png', revision: '68f15092c39db351795bb79a75d15174' },
				{ url: '/icons/logo512.png', revision: '3258ef1e671f5657cda7e97e97de195b' },
				{ url: '/images/favicon.ico', revision: '0077275ce56817305b054b88dd353a86' },
				{ url: '/images/icon_180x180.png', revision: '95d1eaec4847ba0e191769e59418d4c8' },
				{ url: '/images/offline-enabled.png', revision: 'def78dcffeaf1919d8cbdb4b8902e839' },
				{ url: '/lottie/submission.json', revision: '07971acf5b7647b8f99d9ed5c6c3680a' },
				{ url: '/manifest.json', revision: 'fbb3689773230f6870fbed5b9f6ed6b6' },
				{ url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
				{ url: '/vercel.svg', revision: '61c6b19abff40ea7acd577be818f3976' }
			],
			{ ignoreURLParametersMatching: [] }
		),
		e.cleanupOutdatedCaches(),
		e.registerRoute(
			'/',
			new e.NetworkFirst({
				cacheName: 'start-url',
				plugins: [
					{
						cacheWillUpdate: async ({ request: e, response: s, event: a, state: i }) =>
							s && 'opaqueredirect' === s.type
								? new Response(s.body, { status: 200, statusText: 'OK', headers: s.headers })
								: s
					}
				]
			}),
			'GET'
		),
		e.registerRoute(
			/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
			new e.CacheFirst({
				cacheName: 'google-fonts-webfonts',
				plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 })]
			}),
			'GET'
		),
		e.registerRoute(
			/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
			new e.StaleWhileRevalidate({
				cacheName: 'google-fonts-stylesheets',
				plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'static-font-assets',
				plugins: [new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 })]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'static-image-assets',
				plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })]
			}),
			'GET'
		),
		e.registerRoute(
			/\/_next\/image\?url=.+$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'next-image',
				plugins: [new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 })]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:mp3|wav|ogg)$/i,
			new e.CacheFirst({
				cacheName: 'static-audio-assets',
				plugins: [
					new e.RangeRequestsPlugin(),
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })
				]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:mp4)$/i,
			new e.CacheFirst({
				cacheName: 'static-video-assets',
				plugins: [
					new e.RangeRequestsPlugin(),
					new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })
				]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:js)$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'static-js-assets',
				plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:css|less)$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'static-style-assets',
				plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
			}),
			'GET'
		),
		e.registerRoute(
			/\/_next\/data\/.+\/.+\.json$/i,
			new e.StaleWhileRevalidate({
				cacheName: 'next-data',
				plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
			}),
			'GET'
		),
		e.registerRoute(
			/\.(?:json|xml|csv)$/i,
			new e.NetworkFirst({
				cacheName: 'static-data-assets',
				plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
			}),
			'GET'
		),
		e.registerRoute(
			({ url: e }) => {
				if (!(self.origin === e.origin)) return !1;
				const s = e.pathname;
				return !s.startsWith('/api/auth/') && !!s.startsWith('/api/');
			},
			new e.NetworkFirst({
				cacheName: 'apis',
				networkTimeoutSeconds: 10,
				plugins: [new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 })]
			}),
			'GET'
		),
		e.registerRoute(
			({ url: e }) => {
				if (!(self.origin === e.origin)) return !1;
				return !e.pathname.startsWith('/api/');
			},
			new e.NetworkFirst({
				cacheName: 'others',
				networkTimeoutSeconds: 10,
				plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 })]
			}),
			'GET'
		),
		e.registerRoute(
			({ url: e }) => !(self.origin === e.origin),
			new e.NetworkFirst({
				cacheName: 'cross-origin',
				networkTimeoutSeconds: 10,
				plugins: [new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 })]
			}),
			'GET'
		);
});
