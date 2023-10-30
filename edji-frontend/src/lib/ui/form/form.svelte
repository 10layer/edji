<script>
    export let method = 'POST';
    export let action = '';
    export let enctype = '';
</script>

<div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0 mb-6">
    <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        <form method={method} action={action} enctype={enctype}>
            <slot></slot>
        </form>
    </div>
</div>
