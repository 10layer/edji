import { API_HOST } from "$env/static/private";

export async function check_status() {
    try {
        const res = await fetch(`${API_HOST}/status`);
        return await res.json();
    } catch(err) {
        console.error(err);
        throw `Error checking status - API could be down. Host is ${API_HOST}`;
    }
}

export async function get_collections() {
    try {
        console.log(`${API_HOST}/model`);
        const res = await fetch(`${API_HOST}/model`);
        return await res.json();
    } catch(err) {
        console.error(err);
        throw "Error getting collections - API could be down.";
    }
}

export async function get_collection(collection) {
    try {
        const res = await fetch(`${API_HOST}/model/${collection}`);
        return await res.json();
    } catch(err) {
        console.error(err);
        throw "Error getting collection - API could be down.";
    }
}