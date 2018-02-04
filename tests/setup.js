const baseUrl = 'http://example.com/';
const baseHTML = `
    <html>
        <head>
            <title>Original Title</title>
        </head>
        <body>
        
        </body>
    </html>
`;

const dom = require('jsdom-global');
global.resetDom = () => {
    dom(baseHTML, {
        url: baseUrl,
    });
};

global.sinon = require('sinon');
global.expect = require('expect');

resetDom();
