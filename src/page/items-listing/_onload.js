// js code in `default function` will be loaded for all .html page under /page/items-pp/ dir
export default function main(appBody) {

    console.log('generic shared code for all /page/items-pp/*.html');
    console.log({ 'document.readyState': document.readyState });

    // for SPA dynamic import, will be imported and executed once only
    // and state will be preserved across pages until reload manually
    let count = 0;
    document.addEventListener('click', function (e) {
        console.log(`${++count} - ${e.type} hello from /page/items-pp/*.js`, { 'document.readyState': document.readyState });
    });

    // do not add global state in SPA mode
    // document.addEventListener('click', function(){ console.log('do not add global listener in SPA mode')}); 
}