<script>
    import { H1, DataTable, Button } from '$lib/ui/edji_ui';
    export let data;
    import '$lib/helpers/helpers.ts';
</script>

<div class="flex justify-between items-center mt-2 mb-2">
    <H1>{ data.table_def.plural.ucfirst() }</H1>
    <a href="/collection/add/{data.table_def.singular}"><Button size="md">Add { data.table_def.singular.ucfirst() }</Button></a>
</div>

<DataTable data={data.collection_res.data} def={data.table_def} />