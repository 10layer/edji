<script>
    import Colors from "../colours.json";
    export let font_weight = "font-medium";
    export let border_bottom = "border-b";
    export let bg="bg-inherit";
    export let border_color="border-slate-400";
</script>

<thead class="{font_weight} {border_bottom} {border_color} {bg}">
    <slot></slot>
</thead>