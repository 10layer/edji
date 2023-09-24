import EdjiSDK from "$lib/edji-sdk/edji-sdk";
import { API_HOST } from "$env/static/private";

export async function load({ parent, params }) {
    const { session } = await parent();
    const sdk = new EdjiSDK({ api_server: API_HOST, token: session.token });
    const table_def = await sdk.table_def(params.collection);
    console.log(table_def);
    return {
        table_def,
    };
}

export const actions = {
    default: async ({ request, params, locals }) => {
        const data = await request.formData();
        const { session } = await locals.parent();
        const sdk = new EdjiSDK({ api_server: API_HOST, token: session.token });
        const result = await sdk.create(params.collection, data);
        return {
            result
        };
    }
}