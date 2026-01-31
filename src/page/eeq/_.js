// code here run everytime when this page load
export default function main(appBody) {
    console.log({ 'document.readyState': document.readyState });
    alert('page specific js:\n hi from eeq.js');


    // for SPA dynamic import, will be imported and executed once only
    // and state will be preserved across pages until reload manually
    {
        let count = 0;

        // however, do NOT add any global state on global scope, i.e. document, document.body, window
        // because SPA do not reload and reset state
        // document.addEventListener('mouseover', function (e) { // do not add on document in SPA mode
        //     console.log(++count, `: ${e.type} from /page/eeq.js`, { 'document.readyState': document.readyState });
        // });

        appBody.addEventListener('mouseover', function (e) {
            console.log(++count, `: ${e.type} from /page/eeq.js`, { 'document.readyState': document.readyState });
        });
    }
}