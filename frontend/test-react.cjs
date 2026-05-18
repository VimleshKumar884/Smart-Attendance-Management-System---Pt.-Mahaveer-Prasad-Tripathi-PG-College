const { createElement } = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const QRCode = require('react-qr-code').default;

try {
  console.log(renderToStaticMarkup(createElement(QRCode, { value: undefined, size: 180 })));
} catch (e) {
  console.error("CRASHED:", e);
}
