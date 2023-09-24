<script>
	export let type = 'button';
	export let disabled = false;
	export let size = 'md';

	const sizes = {
		sm: 'py-1 px-2 text-sm h-9',
		md: 'py-2 px-4 text-md h-10',
		lg: 'py-3 px-6 text-lg h-12',
	};
</script>

<button {disabled}
	{type}
	class:cursor-not-allowed = {disabled}
	class:opacity-50 = {disabled}
	class="bg-blue-500 text-white font-bold py-2 px-4 rounded {sizes[size]}"
>
	<slot />
</button>