import Constants from "expo-constants";

const getHostFromExpo = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return null;
  return hostUri.split(":")[0];
};

const detectedHost = getHostFromExpo();

// Backend runs in charge-hub-admin on port 5000.
// For physical devices this uses the Expo host LAN IP.
export const API_BASE_URL = detectedHost
  ? `http://${detectedHost}:5000/api`
  : "http://localhost:5000/api";
