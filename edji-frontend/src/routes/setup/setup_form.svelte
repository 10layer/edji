<script>
    import Input from "$lib/ui/form/input.svelte";
    import Button from "$lib/ui/button.svelte";
    import Form from "$lib/ui/form/form.svelte";

    let email = "";
    let email_note = "";
    let password = "";
    let password_note = "";
    let password_confirm = "";
    let password_confirm_note = "";
    let disabled = true;

    function handlePasswordChange() {
        disabled = false;
        if (password !== password_confirm) {
            password_confirm_note = "Passwords do not match";
            disabled = true;
        } else {
            password_confirm_note = "";
        }
        if (password.length < 8) {
            password_note = "Password must be at least 8 characters";
            disabled = true;
        } else {
            password_note = "";
        }
    }

    function handleEmailChange() {
        disabled = false;
        email_note = "";
        var emailValidRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
        // Test email
        if (!emailValidRegex.test(email)) {
            disabled = true;
            email_note = "Email must be valid";
        }
    }
</script>

<Form>
    <Input bind:value={email} type="email" label="Administrator Email" id="email" name="email" placeholder="admin@edji.com" on:input={handleEmailChange} bind:note={email_note} />
    <Input bind:value={password} type="password" label="Administrator Password" id="password" name="password" on:input={handlePasswordChange} bind:note={password_note} placeholder="********" />
    <Input bind:value={password_confirm} type="password" label="Confirm Password" id="password_confirm" name="password_confirm" bind:note={ password_confirm_note } on:input={handlePasswordChange} placeholder="********" />
    <Button type="submit" bind:disabled >Submit</Button>
</Form>
