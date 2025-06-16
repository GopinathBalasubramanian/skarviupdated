import axios from 'axios';
import { API_URL } from '../../utils/utils';

export function loginUser(username: string, password: string) {
    console.log("Attempting login with:", { username, password }); // <-- Add this
    console.log("API URL:", `${API_URL}/api/login/token/`); // <-- And this

    return axios.post(`${API_URL}/api/token/`, { username, password }, {
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .catch(error => {
        console.error("Login request failed:", error.response || error.message);
        throw error; // Re-throw to propagate the error
    });
}
