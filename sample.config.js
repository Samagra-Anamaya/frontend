export default {
	apiBaseUrl: 'https://api.example.dev',
	featureToggle: {
		newFeature: true
	},
	logging: {
		level: 'debug'
	},
	global: {
		theme: {
			allowOverride: true,
			colorScheme: 'dark',
			colors: {
				primary: '#007bff',
				secondary: '#6c757d'
			},
			fonts: {
				primary: 'Arial, sans-serif'
			}
		}
	},
	features: {
		dashboard: {
			enabled: true,
			allowOverride: true,
			props: {
				refreshInterval: 300
			}
		},
		chat: {
			enabled: false,
			allowOverride: true,
			props: {
				enableNotifications: true
			}
		}
	},
	userSpecific: {
		users: [],
		theme: {
			colorScheme: 'light'
		},
		features: {
			chat: {
				enabled: true
			}
		}
	}
};
