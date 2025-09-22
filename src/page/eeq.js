console.log({ 'document.readyState': document.readyState });
alert('dynamic js:\n hi from eeq.js');


// for SPA dynamic import, will be imported and executed once only
// and state will be preserved across pages until reload manually
{
    let count = 0;
    document.addEventListener('mouseover', function (e) {
        console.log(++count, `: ${e.type} from /page/eeq.js`, { 'document.readyState': document.readyState });
    });
}