import axios from 'axios'
import {config} from "./config";
import { setAuthorization } from "./general";

export function login(credentials) {
    return new Promise((res, rej) => {
        // console.log(config.apiUrlSignIn);
        axios.post(config.apiUrlSignIn, credentials, {})
            .then((response) => {
                setAuthorization(response.data.token);
                res(response.data);
            })
            .catch((err) => {
                rej('Something wrong in auth...');
            })
    });
}

export function getLocalUser() {
    const userStr = localStorage.getItem("user");

    if (!userStr) {
        return null;
    }

    return JSON.parse(userStr);
}
