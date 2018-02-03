const dom = require('jsdom-global');
global.resetDom = () => {
    dom(undefined, {
        url: 'http://example.com',
    });
};

global.sinon = require('sinon');
global.expect = require('expect');

resetDom();
