export const vueDefaultCode = `<template>
</template>

<script>
export default {
    props:["inputs","outputs","serverStates"],
    emits:["update:input"],
    data:()=>{
        return {msg:"hello"}
    }
}
</script>

<style>
</style>
`