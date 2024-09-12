<template>
    <div>

    </div>
</template>

<script lang="ts" setup>
interface Values { [key: string]: any }
type Func = (params: Values) => Values;
const props = defineProps<{ inputs: Values, outputs: Values, serverStates: { value: Values } }>()
const func: Func = (params: Values) => {
    const outputs = {}
    return outputs
}
</script>

<style scoped></style>