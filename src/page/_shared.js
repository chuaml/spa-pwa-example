// js code will be loaded for all .html page under /page/**/ dir and all sub dir
console.log('generic shared code for all /page/**/*.html');
console.log({ 'document.readyState': document.readyState });

// /page/_shared.js will be imported last

// for SPA dynamic import, will be imported and executed once only
// and state will be preserved across pages until reload manually
let count = 0;
document.addEventListener('keydown', function (e) {
    console.log(`${++count} - ${e.type} hello from /page/_shared.js`, { 'document.readyState': document.readyState });
});