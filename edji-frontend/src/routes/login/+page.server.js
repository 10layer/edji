import { redirect }  from "@sveltejs/kit"
import { API_HOST } from "$env/static/private";
import { check_status } from "$lib/api/edji.js"

export async function load() {
    // Check status
    let api_status;
        try {
            api_status = (await check_status()).status;
        } catch(err) {
            console.error(err);
            api_status.state = "error";
            api_status.message = err.toString();
        }
        if (api_status.state === "setup") {
            throw redirect(307, "/setup")
        }
        if (api_status.state === "ok") {
            // Do some more checks here
        }
    return {
        api_status
    };
};
    
export const actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const email = data.get("email");
        const password = data.get("password");
        const result = await fetch(`${ API_HOST }/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });
        const login_result = await result.json();
        if (login_result.token) {
            await cookies.set("token", login_result.token, { path: "/" });
            await cookies.set("apikey", login_result.apikey, { path: "/" });
            throw redirect(303, "/dashboard");
        } else {
            return {
                login_error: "Invalid email or password."
            }
        }
    }
}