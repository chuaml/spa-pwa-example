// code here run everytime when pages under this dir and subdir load
export default function main(appBody) {
    // js code here will be loaded for all .html page under /page/**/ dir and all sub dir

    console.log('2nd generic shared code for all /page/**/*.html');
    console.log({ 'document.readyState': document.readyState });

    // /page/_shared.js will be imported last

    // for SPA dynamic import, will be imported and executed once only
    // and state will be preserved across pages until reload manually
    let count = 0;
    appBody.addEventListener('keydown', function (e) {
        console.log(`${++count} - ${e.type} hello from /page/_shared.js`, { 'document.readyState': document.readyState });
    });

    // do not add global state in SPA mode
    // document.addEventListener('click', function(){ console.log('do not add global listener in SPA mode')}); 
}