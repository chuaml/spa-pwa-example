// js code will be loaded for all .html page under /page/items-pp/ dir
console.log('generic shared code for all /page/items-pp/*.html');
console.log({ 'document.readyState': document.readyState });

// for SPA dynamic import, will be imported and executed once only
let count = 0;
document.addEventListener('click', function (e) {
    console.log(`${++count} - ${e.type} hello from /page/items-pp/*.js`, { 'document.readyState': document.readyState });
});