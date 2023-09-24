<script>
    import { Table, Thead, Tbody, Td, Th, Tr } from "../edji_ui";
    export let data;
    export let def;

    $: if (data) {
        console.log(data)
    }
    

</script>

<Table>
    <Thead>
        <Tr striped={false}>
            {#each def.fields as field}
                <Th>{field.label}</Th>
            {/each}
        </Tr>
    </Thead>
    <Tbody>
        {#each data as row}
            <Tr striped={false}>
                {#each def.fields as field}
                    {#if field.d}
                    <Td>
                        {@html Function(`const row = arguments[0];` + field.d).call(null, row) }
                    </Td>
                    {:else}
                    <Td>{row[field.name]}</Td>
                    {/if}
                {/each}
            </Tr>
        {/each}
    </Tbody>
</Table>
