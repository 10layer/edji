<script>
    import Colors from "../colours.json";
    export let bg="bg-current";
    export let color = `text-${Colors.highlight}` || "text-white";
    export let font_weight = "font-medium";
</script>

<th class="{font_weight} {color}">
    <slot></slot>
</th>