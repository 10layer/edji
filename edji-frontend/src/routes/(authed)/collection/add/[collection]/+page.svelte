<script>
    import { H1, Input, Button, Breadcrumbs } from '$lib/ui/edji_ui';
    export let data;
    import '$lib/helpers/helpers.ts';

    let breadcrumbs = [
        {
            label: data.table_def.plural.ucfirst(),
            href: `/collection/${data.table_def.singular}`
        }
    ];
</script>

<Breadcrumbs breadcrumbs={breadcrumbs} />
<form method="POST">
    <div class="flex justify-between items-center mt-2 mb-2">
        <H1>{ data.table_def.singular.ucfirst() }</H1>
        <Button size="md" type="submit">Save { data.table_def.singular.ucfirst() }</Button>
    </div>

    {#each data.table_def.fields as field}
        <Input label={field.label} name={field.name} type={field.type} />
    {/each}

</form>