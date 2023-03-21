function domOn(selector, event, callback) {
    domForEach(selector, ele => ele.addEventListener(event, callback));
}

// Param: selecteur + fonction a lancer
function domForEach(selector, callback) {
    document.querySelectorAll(selector).forEach(callback);
}

export { domOn, domForEach }
