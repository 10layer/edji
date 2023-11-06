<script>
	import { page } from '$app/stores';
	import logo from '$lib/images/edji-logo.svg';

	import Button from '$lib/ui/button.svelte';

	export let logged_in = false;
</script>

<header>
	<div class="corner">
		<a href="/">
			<img src={logo} alt="Edji" />
		</a>
	</div>

	<nav>
		<ul>
			<li aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
				<a href="/">Home</a>
			</li>
			<li aria-current={$page.url.pathname === '/dashboard' ? 'page' : undefined}>
				<a href="/dashboard">Dashboard</a>
			</li>
			<li aria-current={$page.url.pathname === '/about' ? 'page' : undefined}>
				<a href="/about">About</a>
			</li>
			<li aria-current={$page.url.pathname.startsWith('/docs') ? 'page' : undefined}>
				<a href="/docs">Docs</a>
			</li>
		</ul>
	</nav>

	<div class="flex content-center items-center justify-center mr-4">
		{#if (logged_in)}
			<form method="POST" action="/logout">
				<Button type="submit" size="sm">Logout</Button>
			</form>
		{:else}
			<a href="/login">
				<Button size="sm">Login</Button>
			</a>
		{/if}
	</div>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		background-color: rgb(50, 50, 50);
	}

	nav {
		display: flex;
		justify-content: center;
		color: white;
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li[aria-current='page']::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--color-theme-1);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 0.5rem;
		color: rgb(230, 230, 230);
		font-weight: 600;
		font-size: 0.8rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		text-decoration: none;
		transition: color 0.2s linear;
	}

	a:hover {
		color: var(--color-theme-1);
	}

	.github {
		width: 2em !important;
		height: 2em !important;
	}
</style>
