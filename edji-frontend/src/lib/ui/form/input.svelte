<script>
	export let value = '';
	export let placeholder = '';
	export let id;
	export let label;
	export let type = 'text';
	export let name;
	export let required = false;
	export let note = '';

	export let inputRef = null;

	function setType(node) {
		node.type = type;
	}
</script>

<div class="mb-4">
	<label for={id} class="block text-gray-700 text-sm font-bold mb-2">
		{label}
	</label>
	<div class="mt-1">
		<input
			use:setType
			{name}
			{id}
			{required}
			{placeholder}
			bind:value
			bind:this={inputRef}
			on:input
			class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
		/>
		<p class="text-red-500 text-xs italic pt-3">{ note }</p>
	</div>
</div>