import {browser} from 'webextension-polyfill-ts';

browser.webRequest.onHeadersReceived.addListener(
    details => {
        function isCspHeader(headerName: string): boolean {
            return headerName === 'CONTENT-SECURITY-POLICY' || headerName === 'X-WEBKIT-CSP';
        }

        if (details.responseHeaders) {
            for (const header of details.responseHeaders) {
                if (isCspHeader(header.name.toUpperCase())) {
                    const newCsp = 'default-src * "unsafe-inline" "unsafe-eval" data: blob:;';
                    header.value = newCsp;
                }
            }
        }

        return {responseHeaders: details.responseHeaders};
    },
    {urls: ['https://app.roll20.net/editor/'], types: ['main_frame']},
    ['blocking', 'responseHeaders'],
);
