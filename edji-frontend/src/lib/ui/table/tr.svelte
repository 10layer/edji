<script>
    export let striped = true;
    let striped_class; 

    $: striped_class = striped ? 'even:bg-slate-100 odd:bg-slate-400' : '';

</script>

<tr class="{striped_class}">
    <slot></slot>
</tr>