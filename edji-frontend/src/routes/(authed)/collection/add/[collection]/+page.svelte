<script>
    import { H1, Input, Button, Breadcrumbs, Checkbox, Alert, Password } from '$lib/ui/edji_ui';
    export let data;
    export let form;
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

    {#if form?.error}
        <Alert type="error">
            <p>{form.error.message}</p>
        </Alert>
    {/if}

    {#each data.table_def.fields as field}
        {#if field.views.includes("create")}
            {#if field.type === "boolean"}
                <Checkbox label={field.label} name={field.name} required={field.required} />
            {:else if field.type === "password"}
                <Password label={field.label} name={field.name} required={field.required} />
            {:else}
                <Input label={field.label} name={field.name} type={field.type} required={field.required} />
            {/if}
        {/if}
    {/each}

</form>