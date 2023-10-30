<script>
	import { page } from '$app/stores';
	import '../app.postcss';
	import './styles.css';

	import Header from './Header.svelte';
	import Footer from './Footer.svelte';

</script>

<div class="app min-h-screen flex flex-col">
	<Header logged_in={$page.data?.logged_in} />
	<main class="min-w-full grow">
		<slot />
	</main>
	<Footer />
</div>