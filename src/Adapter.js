import axios from 'axios';

class Plugin {
    static install(Vue, options) {
        Vue.$pjaxAdapter = new Plugin(Vue, options);
        Vue.mixin({
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
        axios.defaults.headers.common['X-PJAX'] = true;
        axios.defaults.headers.common['X-PJAX-Container'] = this.config.targetSelector;
        document.addEventListener('click', this.clickListener.bind(this));
        this.hasInitialised = true;
    }

    clickListener(e) {
        if (e.target.nodeName == 'A') {
            if (e.target.classList.contains('no-pjax')) return true;

            e.preventDefault();
            this.clickHandler(e.target);
        }
    }

    clickHandler(link) {
        return axios.get(link.href)
            .then(
                response => {
                    document.querySelector('head > title').innerHTML = this.extractTitle(response.data);
                    document.querySelector(this.config.targetSelector).innerHTML = this.withoutTitle(response.data);
                    window.history.pushState({}, '', link);
                    new this.Vue({
                        el: this.config.targetSelector,
                    });
                },
                error => {
                    //
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
