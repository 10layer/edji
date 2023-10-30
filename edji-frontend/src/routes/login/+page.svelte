<script>
    import LoginForm from './login_form.svelte';
    import Alert from '$lib/ui/alert.svelte';
    export let form;
</script>

<svelte:head>
    <title>EDJI :: Login</title>
</svelte:head>

<div class="flex h-full flex-col justify-center items-center">
    <h1 class="m-6">Login</h1>
    {#if form?.login_error}
    <Alert type="error">
        <p>{form.login_error}</p>
    </Alert>
    {/if}
    <div class="">
        <LoginForm />
    </div>
</div>