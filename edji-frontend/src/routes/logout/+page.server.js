export const actions = {
    default: async ({ cookies }) => {
        await cookies.delete("token", { path: "/" });
        await cookies.delete("apikey", { path: "/" });
        return {};
    }
}
