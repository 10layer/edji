import EdjiSDK from "$lib/edji-sdk/edji-sdk";
import { API_HOST } from "$env/static/private";
import { formBody } from "$lib/helpers/formhelper.ts";

export async function load({ cookies, params }) {
    const sdk = new EdjiSDK({ api_server: API_HOST, token: await cookies.get('token') });
    const table_def = await sdk.table_def(params.collection);
    // console.log(table_def);
    return {
        table_def,
    };
}

export const actions = {
    default: async ({ request, params, cookies }) => {
        try {
            const token = await cookies.get('token');
            const formdata = await request.formData();
            const data = formBody(formdata);
            console.log({ data });
            const sdk = new EdjiSDK({ api_server: API_HOST, token });
            const result = await sdk.create(params.collection, data);
            console.log({ result });
            return {
                result
            };
        } catch (e) {
            console.log(e);
            return {
                error: e
            };
        }
    }
}