(async function() {
    const windowLoaded = new Promise(resolve => window.addEventListener('load', resolve));

    const FORCE_RELOAD_CACHE = true;
    const STARDUST_JSON_URL = (globalThis?.chrome?.storage?.sync?.get ? (await globalThis.chrome.storage.sync.get()).stardustJSON : null) ?? 'https://stevebeeblebrox.github.io/stardust/stardust.json';
    console.log(`Loading Stardust from '${STARDUST_JSON_URL}'. FORCE_RELOAD_CACHE=${FORCE_RELOAD_CACHE}`);
    const config = await (await fetch(`${STARDUST_JSON_URL}`, FORCE_RELOAD_CACHE ? {cache: 'reload'} : {})).json();

    //#include ../external/jsx.ts
    //#include ../external/elements.ts

    // Toggle interactivity based on key hold
    const triggerPointerEventState = JSX.createState(false);
    triggerPointerEventState.connectCallback(v => document.documentElement.style.setProperty('--stardust-pointer-events', v ? 'auto' : 'none'));    
    window.addEventListener('keydown', event => {if(event.altKey) {triggerPointerEventState.set(true); event.preventDefault()}});
    window.addEventListener('keyup', event => triggerPointerEventState.set(event.altKey));

    // Create a ShadowRoot to place Stardust elements in to limit impact on original page
    const stardustBody = (<Elements.Shadow></Elements.Shadow> as HTMLSpanElement).shadowRoot!;
    document.body.appendChild(stardustBody.host);

    // Stardust's CSS must be placed inside that ShadowRoot; read the output of the compiled LESS file
    stardustBody.appendChild(Object.assign(<style></style>, {textContent: `
//#include ../builds/Stardust/stardust.css
    `}));

    // Finds all text matching `pattern` (case-insensitive)
    // and places a mark above it with `--stardust-highlight-color` set to `color` if present
    function highlightMatchingText(type: string, pattern: string, color: string = undefined, topParent = document.body) {
        const regex = new RegExp(pattern,'gi');

        const selection = window.getSelection();
        let range, match;
        selection.removeAllRanges();
        while (match = regex.exec(topParent.textContent)) {
        
            let iterator = iterateTextNodes(topParent);
            let currentIndex = 0;
            let result = iterator.next();
        
            while (!result.done) {
                if (match.index >= currentIndex && match.index < currentIndex + result.value.length) {
                    range = new Range();
                    range.setStart(result.value, match.index - currentIndex);
                }

                const matchLength = match[0].length;
                if (match.index + matchLength >= currentIndex && match.index + matchLength < currentIndex + result.value.length) {
                    range.setEnd(result.value, match.index + matchLength - currentIndex);
                    selection.addRange(range);
            
                    addHighlightMarks(type, match[0], color, range.getClientRects());
                }

                currentIndex += result.value.length;
                result = iterator.next();
            }
        }
        selection.removeAllRanges();
    }

    // Iterator of all child text nodes of `parent`
    function* iterateTextNodes(parent) {
        for(const child of [...parent.childNodes]) {
            if(child.nodeType === Node.TEXT_NODE) yield child;
            else yield* iterateTextNodes(child);
        }
    }

    function onHighlightClicked(target) {
        const options = new URLSearchParams();
        options.set('type', target.dataset.stardustHighlightType);
        options.set('value', target.dataset.stardustHighlight);
        options.set('referer', 'stardust');
        window.open(`${config.route}?${options.toString()}`, '_blank');
    }

    // Places a mark element on top of each `rect`
    function addHighlightMarks(type, value, color, rects) {
        for (const rect of [...rects]) {
            const highlightElement = <mark style={{
                top: rect.y + window.scrollY + 'px',
                left: rect.x + 'px',
                height: rect.height + 'px',
                width: rect.width + 'px'
            }} data-stardust-highlight-type={type} data-stardust-highlight={value} onclick={event=>onHighlightClicked(event.target)}></mark> as HTMLElement;
        
            if(typeof color === 'string')
                highlightElement.style.setProperty('--stardust-highlight-color', color);

            stardustBody.appendChild(highlightElement);
        }
    }
    
    // Removes existing Stardust highlights
    function removeHighlights() {
        Array.from(stardustBody.querySelectorAll('[data-stardust-highlight]')).forEach(e=>e.remove());
    }

    // Runs the highlighter
    function run() {
        console.debug('Running Stardust.')
        removeHighlights();
        for(const [type, {pattern, color}] of Object.entries(config.targets ?? {}) as [string, {pattern: string, color?: string}][])
            highlightMatchingText(type, pattern, color);
    }

    // Run on resize
    window.addEventListener('resize', run);

    // Run every n ms if not busy
    (function idleRun(n) {
        setTimeout(()=>requestIdleCallback(()=>{run();idleRun(n)}),n);
    })(config.idleRunDelay ?? 3000);

    // Run on load
    (async function() {
        await windowLoaded;
        run();
    })();
})().catch(e=>console.error(e));