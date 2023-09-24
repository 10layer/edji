<script>
    import Colors from "../colours.json";
    export let bg="bg-inherit";
    export let color = `text-[${Colors.highlight}]` || "text-slate-900";
    export let font_weight = "font-medium";
    export let padding_x = "px-2";
    export let padding_y = "py-1";
</script>

<td class="{font_weight} {bg} {padding_x} {padding_y}">
    <slot></slot>
</td>