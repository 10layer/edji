<script>
    export let breadcrumbs = [];
</script>

<nav class="flex items-center text-sm leading-5 font-medium">
    <a href="/" class="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out">Home</a>&nbsp;/&nbsp;
    {#each breadcrumbs as breadcrumb, i}
        <a href="{breadcrumb.href}" class="text-gray-500 hover:text-gray-700 transition duration-150 ease-in-out">{breadcrumb.label}</a>
    {/each}
</nav>