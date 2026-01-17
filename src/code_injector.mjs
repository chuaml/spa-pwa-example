// custom code injector 
// html code to inject dynamically on run time
// function injectCustomCode(htmlCode, intoElement) { let addText; if (intoElement === document.head) { const nodeToAdd = []; addText = (TAG) => { nodeToAdd.push(new Text(TAG.textContent)); setTimeout(_ => { document.body.prepend(nodeToAdd.pop()); }); }; } else { addText = (TAG) => { intoElement.appendChild(new Text(TAG.textContent)); }; } const cloneChildNodes = (TAG) => { try { if (TAG.attributes === undefined) { if (TAG.nodeName === "#text") { addText(TAG); return new Text(TAG.textContent); } else if (TAG.nodeName === "#comment") { intoElement.appendChild(new Comment(TAG.textContent)); } else { console.warn("unknown node type, assume as textNode instead: ", TAG); addText(TAG); } } else { const tag = document.createElement(TAG.tagName); for (const a of TAG.attributes) { tag.setAttribute(a.name, a.value); } tag.innerHTML = TAG.innerHTML; intoElement.appendChild(tag); } } catch (err) { console.warn(err); } }; const doc = new DOMParser().parseFromString(htmlCode, "text/html"); doc.head.childNodes.forEach(cloneChildNodes); doc.body.childNodes.forEach(cloneChildNodes); }


/** 
 * @param {string} htmlCode
 * @param {HTMLElement} intoElement
 */
export async function injectCustomCode(htmlCode, intoElement) {
    const b = document.createElement('template');
    b.innerHTML = htmlCode;
    const nodes = [...(b.content.cloneNode(true).childNodes)];
    const len = nodes.length;
    for (let i = 0; i < len; ++i) {
        const x = nodes[i];
        if (x.nodeName === 'SCRIPT') {
            const sc = document.createElement('script');
            if (x.attributes) for (const a of x.attributes) {
                sc.setAttribute(a.name, a.value);
            };
            if (
                // external script and is non-async
                !!sc.getAttribute('src')
                && sc.getAttribute('async') === null
            ) {
                const scriptProcess = new Promise((r, f) => {
                    sc.addEventListener('load', r);
                    sc.addEventListener('error', f);
                    setTimeout(f, 5000, 'script load timed out: ' + sc.getAttribute('src')); // just in case
                    sc.textContent = x.textContent;
                    intoElement.appendChild(sc);
                    nodes[i] = sc;
                });
                await scriptProcess.catch(console.error);
            }
            else {
                sc.textContent = x.textContent;
                intoElement.appendChild(sc);
                nodes[i] = sc;
                await new Promise(r => setTimeout(r, 0)); // allow injected script to execute first
            }
            continue;
        }
        else if (x.nodeName === '#text') {
            if (intoElement === document.head) {
                document.body.prepend(x);
                nodes[i] = x;
                continue;
            }
        }
        intoElement.appendChild(x);
        nodes[i] = x;
    }
    window.addEventListener('popstate', function cleanup() {
        const len = nodes.length;
        for (let i = 0; i < len; ++i) {
            nodes[i].remove();
        }
    }, { once: true, capture: true });
    return nodes;
}
