<template>
    <div>
        <div id="pjax-container">DEFAULT TARGET</div>
        <div id="testTarget">TEST TARGET</div>
        <a href="/test" class="pjax">Click to load content</a>
        <a href="/no-pjax" class="no-pjax">Click to load without PJAX</a>
        <a href="/no-pjax" class="no-pjax-with-dataprop" data-no-pjax>Click to load without PJAX</a>
    </div>
</template>

<script>
    export default {
        data() {
            return {}
        },
    }
</script>
