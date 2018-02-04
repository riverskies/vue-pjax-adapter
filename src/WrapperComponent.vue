<template>
    <div>
        <!-- Data targets for content load -->
        <div id="pjax-container">DEFAULT TARGET</div>
        <div id="testTarget">TEST TARGET</div>

        <!-- Trigger for PJAX behaviour -->
        <a href="/test" class="pjax">Click to load content</a>

        <!-- Demo disabling PJAX calls with a class attribute -->
        <a href="/no-pjax" class="no-pjax">Click to load without PJAX</a>

        <!-- Demo disabling PJAX calls with a data attribute -->
        <a href="/no-pjax" class="no-pjax-with-dataprop" data-no-pjax>Click to load without PJAX</a>

        <!-- Demo disabling PJAX calls globally at depth with a class attribute -->
        <div class="no-pjax">
            <ul>
                <li><a class="no-pjax-at-depth-1" href="/no-pjax">No PJAX at depth</a></li>
                <li><a class="no-pjax-at-depth-2" href="/no-pjax">No PJAX at depth</a></li>
            </ul>
            <article>
                <section>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                        <a class="no-pjax-at-depth-3" href="/no-pjax">No PJAX at depth</a>
                    </p>
                </section>
            </article>
        </div>

        <!-- Demo disabling PJAX calls globally at depth with a data attribute -->
        <div data-no-pjax>
            <ul>
                <li><a class="no-pjax-at-depth-4" href="/no-pjax">No PJAX at depth</a></li>
                <li><a class="no-pjax-at-depth-5" href="/no-pjax">No PJAX at depth</a></li>
            </ul>
            <article>
                <section>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                        <a class="no-pjax-at-depth-6" href="/no-pjax">No PJAX at depth</a>
                    </p>
                </section>
            </article>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {}
        },
    }
</script>
