// Replace with your computer's IP address (find it with ipconfig on Windows)
const SERVER_IP = '192.168.8.199'; // e.g., '192.168.1.100'

const getBaseUrl = () => {
  return `http://${SERVER_IP}:8000`;
};

export const URLS = {
    UPLOAD_AND_SUMMARIZE: `${getBaseUrl()}/summarize`
}