import { check_status } from "$lib/api/edji.js"
import { error } from "@sveltejs/kit";
import { redirect }  from "@sveltejs/kit"
import { API_HOST } from "$env/static/private";

export async function load() {
    let status = {
        state: "unknown",
        message: "Unknown state."
    }
    try {
        status = (await check_status()).status;
    } catch(err) {
        console.error(err);
        status.state = "error";
        status.message = err.toString();
    }
    if (status.state === "error") {
        throw error(500, status.message);
    }
    if (status.state !== "setup") {
        throw redirect(303, "/dashboard");
    }
    return {
        status
    };
}

export const actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const email = data.get("email");
        const password = data.get("password");
        const password_confirm = data.get("password_confirm");
        if (password !== password_confirm) {
            throw error(400, "Passwords do not match.");
        }
        if (password.length < 8) {
            throw error(400, "Password must be at least 8 characters.");
        }
        try {
            const result = await fetch(`${ API_HOST }/setup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });
            return result.json();
        } catch(err) {
            console.error(err);
            throw error(500, err.toString());
        }
    }
}