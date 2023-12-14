# J.A.T (Job Application Tracker)

J.A.T is a browser extension(only chrome for now.) that helps you keep track of the jobs that you apply for.

J.A.T uses IndexDB to store your job applications locally on your machine which means no personal data will be sent to any type of server.

> [!WARNING]
> Do keep mind because IndexDB is being used as a database, it can be easily erased by the user by clearing your cache in your web browser (Same as clearing your cookies.)

# Installation Steps:
1. clone the repo.
2. ```npm run build``` while in the root directory.
3. Open Google Chrome and navigate to chrome://extensions.
4. Click on 'load uncompressed extension', navigate to the cloned repo folder and select the 'dist' folder.
5. You should now have J.A.T installed in your web browser, simply click the boat icon the upper right corner and start inputting the details of your job application.

# Libraries used
-  [Chart.JS](https://www.chartjs.org/) for charts & diagrams.
-  [idb](https://www.npmjs.com/package/idb) for interfacing with IndexDB & TypeScript Support


# Screenshots
### Popup
![Popup](screenshots/screenshot1.png)

### Dashboard / Overview
![Dashboard / Overview](screenshots/screenshot2.png)

### Statistics
![Statistics](screenshots/screenshot3.png)
