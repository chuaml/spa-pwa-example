console.log({ 'document.readyState': document.readyState });
alert('dynamic js:\n hi from eeq.js');


// for SPA dynamic import, will be imported and executed once only
{
    let count = 0;
    document.addEventListener('mouseleave', function (e) {
        console.log(++count, `: ${e.type} from /page/eeq.js`, { 'document.readyState': document.readyState });
    });
}