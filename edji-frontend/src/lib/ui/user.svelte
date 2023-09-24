<script>
    export let user;
</script>

<div>
    <p>{user.name}</p>
    <p>{user.email}</p>
    {#if user.admin}
    <p>Admin</p>
    {/if}
</div>