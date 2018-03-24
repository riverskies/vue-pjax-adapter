import moxios from 'moxios';
import {createLocalVue, mount} from '@vue/test-utils';
import WrapperComponent from '../src/WrapperComponent.vue';
import Adapter from '../src/Adapter';
import Vuex from 'vuex';

const createVm = (options = {}, store = {}) => {
    let localVue = createLocalVue();

    localVue.component('loaded-component', require('../src/LoadedComponent.vue'));
    localVue.use(Adapter, options);

    return mount(WrapperComponent, {
        attachToDocument: true,
        localVue,
        store,
    });
};

describe('Adapter', () => {
    beforeEach(() => {
        resetDom();

        moxios.install();
        moxios.stubRequest('http://example.com/test', {
            status: 200,
            headers: {
                'X-PJAX-URL': '/test',
            },
            responseText: `
                <title>Page Title | As part of the spatie/laravel-pjax middleware's response</title>
                <div id="loadedComponent">
                    <loaded-component></loaded-component>
                </div>
            `,
        });
        moxios.stubRequest('http://example.com/no-pjax', {
            status: 200,
            responseText: `Loaded without PJAX`,
        });
    });

    afterEach(() => {
        moxios.uninstall();

        window.document.body.innerHTML = '';
        window.history.replaceState({}, '', 'http://example.com/');
    });

    describe('@functionality', () => {
        it('prevents the default on pjax-enabled clicks', (done) => {
            let vm = createVm();
            let spy = sinon.spy();

            vm.find('a.pjax').element.addEventListener('click', spy);
            vm.find('a.pjax').trigger('click');

            moxios.wait(() => {
                expect(spy.calledOnce).toBe(true);
                expect(spy.firstCall.args[0].defaultPrevented).toBe(true);
                expect(moxios.requests.count()).toBe(1);
                expect(vm.find('#pjax-container #loadedComponent').text()).toBe('RENDERED CONTENT');
                expect(vm.find('#pjax-container loaded-component').element).toBeFalsy();
                expect(vm.find('#pjax-container #loadedComponent').element).toBeTruthy();
                done();
            });
        });

        it('renders loaded vue components correctly', (done) => {
            let vm = createVm();

            vm.find('a.pjax').trigger('click');

            moxios.wait(() => {
                expect(moxios.requests.count()).toBe(1);
                expect(vm.find('#pjax-container #loadedComponent').text()).toBe('RENDERED CONTENT');
                expect(vm.find('#pjax-container loaded-component').element).toBeFalsy();
                expect(vm.find('#pjax-container #loadedComponent').element).toBeTruthy();
                done();
            });
        });

        it('initialises the vuex store if exists', (done) => {
            let localVue = createLocalVue();
            localVue.use(Adapter);
            localVue.use(Vuex);

            localVue.component('loaded-component', require('../src/StoreComponent.vue'));

            let store = new Vuex.Store({
                state: {testData: 123},
            });

            let wrapper = mount(WrapperComponent, {
                attachToDocument: true,
                localVue,
                store,
            });

            window.app = wrapper.element;

            expect(wrapper.vm.$store.state.testData).toBe(123);

            wrapper.find('a.pjax').trigger('click');

            moxios.wait(() => {
                expect(wrapper.find('#pjax-container #loadedComponent').text()).toBe('123');
                done();
            });
        });

        it('manipulates the browser history', (done) => {
            let vm = createVm();
            expect(window.location.href).toBe('http://example.com/');

            vm.find('a.pjax').trigger('click');

            moxios.wait(() => {
                expect(moxios.requests.count()).toBe(1);
                expect(window.location.href).toBe('http://example.com/test');
                done();
            });
        });

        it('sets the correct headers', (done) => {
            let vm = createVm();

            vm.find('a.pjax').trigger('click');

            moxios.wait(() => {
                expect(moxios.requests.count()).toBe(1);
                let headers = moxios.requests.at(0).headers;
                expect(headers['X-PJAX']).toBe(true);
                expect(headers['X-PJAX-Container']).toBe('#pjax-container');
                done();
            });
        });

        it('sets the correct title on the document and removes it from the body', (done) => {
            expect(document.head.getElementsByTagName('title')[0].text).toBe('Original Title');
            const testTitle = "Page Title | As part of the spatie/laravel-pjax middleware's response";
            let vm = createVm();

            vm.find('a.pjax').trigger('click');

            moxios.wait(() => {
                expect(document.head.getElementsByTagName('title')[0].text).toBe(testTitle);
                expect(vm.html()).not.toContain(`<title>${testTitle}</title>`);
                done();
            });
        });

        it('initialises itself only once', (done) => {
            sinon.spy(document, 'addEventListener');
            let vm = createVm();

            vm.find('a.pjax').trigger('click');

            moxios.wait(() => {
                expect(document.addEventListener.calledOnce).toBe(true);
                document.addEventListener.restore();
                done();
            });
        });

        it('reloads the full page on browser back/forward button navigation', (done) => {
            let vm = createVm();
            sinon.stub(window, 'location').set(() => {
                done();
            });

            vm.find('a.pjax').trigger('click');

            moxios.wait(() => {
                expect(window.location.href).toBe('http://example.com/test');

                window.history.back();
            });
        });

        it('has a class to disable using pjax on certain links', (done) => {
            let vm = createVm();
            let spy = sinon.spy();

            vm.find('a.no-pjax').element.addEventListener('click', spy);
            vm.find('a.no-pjax').trigger('click');

            moxios.wait(() => {
                expect(spy.called).toBe(true);
                expect(spy.firstCall.args[0].defaultPrevented).toBe(false);
                expect(moxios.requests.count()).toBe(0);
                done();
            });
        });

        it('has a data property to disable using pjax on certain links', (done) => {
            let vm = createVm();
            let spy = sinon.spy();

            vm.find('a.no-pjax-with-dataprop').element.addEventListener('click', spy);
            vm.find('a.no-pjax-with-dataprop').trigger('click');

            moxios.wait(() => {
                expect(spy.called).toBe(true);
                expect(spy.firstCall.args[0].defaultPrevented).toBe(false);
                expect(moxios.requests.count()).toBe(0);
                done();
            });
        });

        it('can disable PJAX at depth by disabling it on the common parent with a class attribute', (done) => {
            let vm = createVm();
            let spy1 = sinon.spy();
            let spy2 = sinon.spy();
            let spy3 = sinon.spy();

            vm.find('a.no-pjax-at-depth-1').element.addEventListener('click', spy1);
            vm.find('a.no-pjax-at-depth-2').element.addEventListener('click', spy2);
            vm.find('a.no-pjax-at-depth-3').element.addEventListener('click', spy3);

            vm.find('a.no-pjax-at-depth-1').trigger('click');

            moxios.wait(() => {
                expect(spy1.called).toBe(true);
                expect(spy1.firstCall.args[0].defaultPrevented).toBe(false);
                expect(moxios.requests.count()).toBe(0);

                vm.find('a.no-pjax-at-depth-2').trigger('click');

                moxios.wait(() => {
                    expect(spy2.called).toBe(true);
                    expect(spy2.firstCall.args[0].defaultPrevented).toBe(false);
                    expect(moxios.requests.count()).toBe(0);

                    vm.find('a.no-pjax-at-depth-3').trigger('click');

                    moxios.wait(() => {
                        expect(spy3.called).toBe(true);
                        expect(spy3.firstCall.args[0].defaultPrevented).toBe(false);
                        expect(moxios.requests.count()).toBe(0);

                        done();
                    });
                });
            });
        });

        it('can disable PJAX at depth by disabling it on the common parent with a data attribute', (done) => {
            let vm = createVm();
            let spy4 = sinon.spy();
            let spy5 = sinon.spy();
            let spy6 = sinon.spy();

            vm.find('a.no-pjax-at-depth-4').element.addEventListener('click', spy4);
            vm.find('a.no-pjax-at-depth-5').element.addEventListener('click', spy5);
            vm.find('a.no-pjax-at-depth-6').element.addEventListener('click', spy6);

            vm.find('a.no-pjax-at-depth-4').trigger('click');

            moxios.wait(() => {
                expect(spy4.called).toBe(true);
                expect(spy4.firstCall.args[0].defaultPrevented).toBe(false);
                expect(moxios.requests.count()).toBe(0);

                // vm.find('a.no-pjax-at-depth-5').trigger('click');
                //
                // moxios.wait(() => {
                //     expect(spy5.called).toBe(true);
                //     expect(spy5.firstCall.args[0].defaultPrevented).toBe(false);
                //     expect(moxios.requests.count()).toBe(0);
                //
                //     vm.find('a.no-pjax-at-depth-6').trigger('click');
                //
                //     moxios.wait(() => {
                //         expect(spy6.called).toBe(true);
                //         expect(spy6.firstCall.args[0].defaultPrevented).toBe(false);
                //         expect(moxios.requests.count()).toBe(0);
                //
                done();
                //     });
                // });
            });
        });
    });

    describe('@options', () => {
        it('the content target selector defaults to #pjax-container', (done) => {
            let vm = createVm();
            expect(vm.find('#pjax-container').text()).toBe('DEFAULT TARGET');

            vm.find('a.pjax').trigger('click');

            moxios.wait(() => {
                expect(moxios.requests.count()).toBe(1);
                expect(moxios.requests.at(0).headers['X-PJAX-Container']).toBe('#pjax-container');
                expect(vm.find('#pjax-container #loadedComponent').text()).toBe('RENDERED CONTENT');
                done();
            });
        });

        it('the content target selector can be set', (done) => {
            let vm = createVm({targetSelector: '#testTarget'});
            expect(vm.find('#testTarget').text()).toBe('TEST TARGET');

            vm.find('a.pjax').trigger('click');

            moxios.wait(() => {
                expect(moxios.requests.count()).toBe(1);
                expect(moxios.requests.at(0).headers['X-PJAX-Container']).toBe('#testTarget');
                expect(vm.find('#testTarget #loadedComponent').text()).toBe('RENDERED CONTENT');
                done();
            });
        });
    });
});
