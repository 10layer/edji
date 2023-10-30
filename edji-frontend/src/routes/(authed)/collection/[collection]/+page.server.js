import EdjiSDK from "$lib/edji-sdk/edji-sdk";
import { API_HOST } from "$env/static/private";

export async function load({ cookies, params }) {
    const token = await cookies.get('token');
    const sdk = new EdjiSDK({ api_server: API_HOST, token: token });
    const collection_res = await sdk.get(params.collection);
    const table_def = await sdk.table_def(params.collection);
    console.log(table_def);
    return {
        collection_res,
        table_def,
    };
}