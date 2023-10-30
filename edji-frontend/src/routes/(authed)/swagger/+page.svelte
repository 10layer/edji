<script>
    import { onMount } from "svelte";
    import { SwaggerUIBundle, SwaggerUIStandalonePreset } from "swagger-ui-dist";
    export let data;

    onMount(() => {
        console.log({ data });
        const ui = SwaggerUIBundle({
            dom_id: '#swagger-ui',
            url: 'http://localhost:4001/openapi.json',
            deepLinking: true,
            presets: [
                SwaggerUIBundle.presets.apis,
                SwaggerUIStandalonePreset
            ],
            layout: "BaseLayout",
            onComplete: function() {
                console.log(data.cookies.token);
                ui.preauthorizeApiKey("bearerAuth", data.cookies.token);
            }
        })
    });
</script>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />

<h1>Swagger</h1>
<div id="swagger-ui" class="grow"></div>

