<script>
	export let value = '';
	export let placeholder = '';
	export let id;
	export let label;
	export let type = 'password';
	export let name;
	export let required = false;
	export let note = '';
    export let confirm = true;
    export let min_length = 8;

	export let inputRef = null;

    let confirm_password = "";

	function setType(node) {
		node.type = type;
	}

    function checkPassword() {
        if (confirm_password !== value) {
            inputRef.setCustomValidity("Passwords do not match");
            return;
        }
        if (value.length < min_length) {
            inputRef.setCustomValidity(`Password must be at least ${min_length} characters long`);
            return;
        }
        inputRef.setCustomValidity("");
        
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
            on:change={checkPassword}
			class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
		/>
    </div>
    <div class="mt-1">
        {#if confirm}
        <label for={`${id}-confirm`} class="block text-gray-700 text-sm font-bold mb-2">
            Confirm {label}
        </label>
        <input
            use:setType
            name={`${name}-confirm`}
            id={`${id}-confirm`}
            required
            placeholder="Confirm Password"
            bind:value={confirm_password}
            on:change={checkPassword}
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
        {/if}
		<p class="text-red-500 text-xs italic pt-3">{ note }</p>
	</div>
</div>