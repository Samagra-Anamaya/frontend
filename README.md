# Data Collection App

This is a data collection app built using **Next.js**.
Once an **Enumerator** logs in, home screen shows total villages assigned to them, total titles submitted and any flagged entries. 

User can then proceed to click on any of the village name to:
  - Add a land record
  - View submitted records
  - View saved titles
  - View request status
  - View flagged titles

- Adding a land record requires filling three forms to submit the relevant details.
- Viewing submitted records shows the submissions that are synced with the server.
- Viewing saved titles shows submissions that are saved locally and are yet to sync with the server.
- Viewing request status shows a queue of submissions currently being synced to the server.
- Viewing flagged titles shows submissions that have been flagged for correction by the admin.

### Offline handling:

[offline-sync-handler-test](https://www.npmjs.com/package/offline-sync-handler-test) package manages the sync of submissions if the device is offline.

The Offline Sync Provider works by intercepting API requests and storing them in offline storage (using **localforage**) when the device is offline. It queues these requests and retries them automatically upon reconnection, ensuring seamless data synchronization with the server. Leveraging **axios** for API handling, the module provides robust error handling and retry mechanisms. The package also allows tracking of online/offline status, enabling developers to customize UI components or trigger specific actions based on connectivity changes. Additionally, it supports toast notifications to inform users about the sync status, ensuring a smooth and transparent user experience.

## Installation

Install the application dependencies by running:

```sh
npm install
# or
yarn install
```

## Development

Start the application in development mode by running:

```sh
npm run dev
# or
yarn dev
```
