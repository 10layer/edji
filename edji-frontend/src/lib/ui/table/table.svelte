<script>
    import Colors from "../colours.json";
    export let bg = (Colors.bg) ? `bg-${Colors.bg}` : "bg-slate-50";
    export let border = (Colors.border) ? `border-${Colors.border}` : "border-slate-400";
    export let shadow = (Colors.shadow) ? `shadow-${Colors.shadow}` : "shadow-md";
    export let table_size = "table-auto";
    export let table_layout = "border-collapse";
    export let table_border = "border";
</script>

<table class="{table_size} {table_layout} {table_border} {border} {bg} {shadow}">
    <slot></slot>
</table>