import axios from 'axios';
import { PjaxEventBus } from './PjaxEventBus';

class Plugin {
    static install(Vue, options) {
        Vue.$pjaxAdapter = new Plugin(Vue, options);
        Vue.mixin({
            created() {
                if (window.app && window.app.__vue__ && window.app.__vue__.$store) {
                    this.$store = window.app.__vue__.$store;
                }
            },
            mounted() {
                if (!Vue.$pjaxAdapter.hasInitialised) {
                    Vue.$pjaxAdapter.init();
                }
            },
        });
    }

    constructor(Vue, options) {
        this.Vue = Vue;
        this.config = Object.assign(this.defaultConfig, options);
    }

    init() {
        this.setHeaders();
        this.configureBackButton();
        this.configureClickHandler();
        this.hasInitialised = true;
    }

    setHeaders() {
        axios.defaults.headers.common['X-PJAX'] = true;
        axios.defaults.headers.common['X-PJAX-Container'] = this.config.targetSelector;
    }

    configureBackButton() {
        window.onpopstate = () => {
            window.location = window.location.href;
        };
    }

    configureClickHandler() {
        document.addEventListener('click', this.clickListener.bind(this));
    }

    clickListener(e) {
        let element = e.target;

        if (element.nodeName == 'A') {
            if (this.isDisabledByDataAttribute(element)) return true;
            if (this.isDisabledByClassAttribute(element)) return true;

            e.preventDefault();
            this.clickHandler(element);
        }
    }

    isDisabledByDataAttribute(element) {
        let testedNode = element;

        while (testedNode !== document) {
            if (testedNode.dataset.noPjax !== undefined) return true;

            testedNode = testedNode.parentNode;
        }

        return false;
    }

    isDisabledByClassAttribute(element) {
        let testedNode = element;

        while (testedNode !== document) {
            if (testedNode.classList.contains('no-pjax')) return true;

            testedNode = testedNode.parentNode;
        }

        return false;
    }

    clickHandler(link) {
        PjaxEventBus.$emit('pjax:send');
        return axios.get(link.href)
            .then(
                response => {
                    document.querySelector('head > title').innerHTML = this.extractTitle(response.data);
                    document.querySelector(this.config.targetSelector).innerHTML = this.withoutTitle(response.data);
                    window.history.pushState({}, '', response.headers['x-pjax-url']);
                    new this.Vue({
                        el: this.config.targetSelector,
                    });
                    PjaxEventBus.$emit('pjax:success');
                    PjaxEventBus.$emit('pjax:complete');
                },
                error => {
                    PjaxEventBus.$emit('pjax:error');
                    PjaxEventBus.$emit('pjax:complete');
                }
            );
    }

    extractTitle(html) {
        return this.titlePattern.exec(html)[1];
    }

    withoutTitle(html) {
        return html.replace(this.titlePattern.exec(html)[0], '');
    }

    get defaultConfig() {
        return {
            targetSelector: '#pjax-container',
        };
    }

    get titlePattern() {
        return new RegExp(/\s*<title>(.*)<\/title>\s*/);
    }
}

export default Plugin;
