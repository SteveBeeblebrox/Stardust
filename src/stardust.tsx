(async function() {
    console.log('Stardust loading...');

    //#include ../external/jsx.ts

    // Toggle interactivity based on key hold
    const triggerPointerEventState = JSX.createState(false);
    triggerPointerEventState.connectCallback(v => document.documentElement.style.setProperty('--stardust-pointer-events', v ? 'auto' : 'none'));    
    window.addEventListener('keydown', event => {if(event.altKey) {triggerPointerEventState.set(true); event.preventDefault()}});
    window.addEventListener('keyup', event => triggerPointerEventState.set(event.altKey));

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

    // Places a mark element on top of each `rect`
    function addHighlightMarks(type, value, color, rects) {
        for (const rect of [...rects]) {
            const highlightElement = <mark style={{
                top: rect.y + window.scrollY + 'px',
                left: rect.x + 'px',
                height: rect.height + 'px',
                width: rect.width + 'px'
            }} data-stardust-highlight-type={type} data-stardust-highlight={value} onclick={e=>alert('clicked')}></mark> as HTMLElement;
        
            if(typeof color === 'string')
                highlightElement.style.setProperty('--stardust-highlight-color', color);

            document.body.appendChild(highlightElement);
        }
    }
    
    // Removes existing Stardust highlights
    function removeHighlights() {
        Array.from(document.querySelectorAll('[data-stardust-highlight]')).forEach(e=>e.remove());
    }

    // Runs the highlighter
    function run() {
        removeHighlights();
        highlightMatchingText('rfc', 'RFC ?\\d+', 'cadetblue')
    }
    
    // Run on load
    window.addEventListener('load', run);
    // Run on resize
    window.addEventListener('resize', run);
})().catch(e=>console.error(e));