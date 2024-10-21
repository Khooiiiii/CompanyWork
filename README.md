# CompanyWork

This README provides instructions for setting up and running the CompanyWork project, which consists of a frontend application and a backend using JSON Server.

## Installation

### Frontend

To set up the frontend:

1. Install dependencies:

   ```
   npm install
   ```

2. Run the Android app:
   ```
   npm run android
   ```

### Backend

The backend uses JSON Server. To set it up:

1. Install JSON Server globally:

   ```
   npm install -g json-server@0.17.4
   ```

2. Navigate to the server directory:

   ```
   cd .\server\
   ```

3. Start JSON Server:
   ```
   json-server --watch db.json
   ```

## Features

### Push Notification Service

To send a notification:

1. Press the "Send Notification" button
2. This will create and send a notification

### Deeplink

To test the deeplink functionality:

1. Press the URL provided in the app
2. This will open the specified URL

You can also test it manually using the following command:

```
npx uri-scheme open exp://127.0.0.1:8081/--/screen/profile?id=123 --android
```

This will open the app and display the ID.

### Tanstack

The project uses Tanstack with JSON Server as the backend. This provides a robust data-fetching and state management solution.

## Additional Information

For more detailed information about each component or feature, please refer to the specific documentation files or comments within the code.
