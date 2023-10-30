<script>
	export let value = '';
	export let id;
	export let label;
	export let name;
	export let required = false;
	export let note = '';
    export let readonly = false;
    export let enabled = true;
	export let inputRef = null;
</script>

<div class="mb-4">
	<div class="flex justify-left items-center">
		<input
			type="checkbox"
			{name}
			{id}
			{required}
            {readonly}
            {enabled}
			bind:value
			bind:this={inputRef}
			on:input
            on:change
			class="shadow mr-2 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-200 rounded"
		/>
        <label for={id} class="block text-gray-700 text-sm font-bold">
            {label}
        </label>
    </div>
    <div>
		<p class="text-red-500 text-xs italic pt-3">{ note }</p>
	</div>
</div>