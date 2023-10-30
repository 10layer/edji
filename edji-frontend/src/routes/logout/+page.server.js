export const actions = {
    default: async ({ cookies }) => {
        await cookies.delete("token");
        await cookies.delete("apikey");
        return {};
    }
}
