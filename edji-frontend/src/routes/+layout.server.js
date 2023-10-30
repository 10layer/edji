export async function load({ cookies }) {
	const token = await cookies.get('token');
	return {
		logged_in: !!token
	};
}