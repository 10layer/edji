<script>
    import SetupForm from './setup_form.svelte';
    import Alert from '$lib/ui/alert.svelte';
    export let data;
</script>

<svelte:head>
    <title>EDJI :: Setup</title>
</svelte:head>

<div class="flex h-full flex-col justify-center items-center">
    <h1 class="m-6">Setup</h1>
    {#if data.status.state === "setup"}
    <div class="m-6">
        <p class="text-lg font-bold">This looks like the first time you're using this instance of EDJI.</p>
        <p>Let's get you started!</p>
    </div>
    <SetupForm />
    {/if}
    {#if data.status.state !== "setup"}
    <Alert type="info">
        <p>EDJI is already set up.</p> 
        <div ><a href="/dashboard" class="button">Dashboard</a></div>
    </Alert>
    {/if}
</div>