import axios from 'axios';

class Plugin {
    static install(Vue, options) {
        Vue.$pjaxAdapter = new Plugin(Vue, options);
        Vue.mixin({
            mounted() {
                Vue.$pjaxAdapter.init();
            },
        });
    }

    constructor(Vue, options) {
        this.Vue = Vue;
        this.config = Object.assign(this.defaultConfig, options);
    }

    init() {
        document.addEventListener('click', this.clickListener.bind(this));
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
                    document.querySelector(this.config.targetSelector).innerHTML = response.data;
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

    get defaultConfig() {
        return {
            targetSelector: '#page',
        };
    }
}

export default Plugin;
