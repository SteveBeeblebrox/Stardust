(async function() {
    const HIGHLIGHT_ATTR = 'data-stardust-highlight', HIGHLIGHT_VAR = '--stardust-highlight-color';
    // Creates HTML Element with type `tagName` and copies `properties` to that element
    function HTML(tagName, properties = {}) {
        return Object.assign(document.createElement(tagName), properties);
    }

    // Get config and targets
    const config = await (await fetch('/stardust.json')).json();

    // Inject Stardust CSS
    document.head.appendChild(HTML('style', {
        textContent: `
            [${HIGHLIGHT_ATTR}] {
                border-bottom: 0.15em solid var(${HIGHLIGHT_VAR}, magenta);
                position: absolute;
                background-color: unset;
                pointer-events: none;
                z-index: 9999999;
            }
        `
    }));

    // Finds all text matching `pattern` (case-insensitive)
    // and places a mark above it with `--stardust-highlight-color` set to `color` if present
    function highlightMatchingText(type, pattern, color = undefined, topParent = document.body) {
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
            const highlightElement = HTML('mark');
            highlightElement.setAttribute(HIGHLIGHT_ATTR, value);
            highlightElement.setAttribute(HIGHLIGHT_ATTR+'-type', type);
            
            highlightElement.style.top = rect.y + window.scrollY + 'px';
            highlightElement.style.left = rect.x + 'px';
            highlightElement.style.height = rect.height + 'px';
            highlightElement.style.width = rect.width + 'px';
        
            if(typeof color === 'string')
                highlightElement.style.setProperty(HIGHLIGHT_VAR, color);

            document.body.appendChild(highlightElement);
        }
    }
    
    // (Unused) removes Stardust highlights
    function removeHighlights() {
        [...document.querySelectorAll(`[${HIGHLIGHT_ATTR}]`)].forEach(e=>e.remove());
    }

    // Highlight each pattern from the config
    for(const [type, {pattern, color}] of Object.entries(config.targets ?? {}))
        highlightMatchingText(type, pattern, color);

    // `pointer-events` is none in CSS, this manually triggers the click event by matching x and y pos
    document.body.addEventListener('click', function(event) {
        const {x:eventX, y:eventY} = event;
        const target = [...document.querySelectorAll(`[${HIGHLIGHT_ATTR}]`)].find(function(element) {
            const {left:elementLeft, width:elementWidth, top:elementTop, height:elementHeight} = element.getBoundingClientRect();
            return eventX >= elementLeft && eventX <= (elementLeft + elementWidth)
                && eventY >= elementTop && eventY <= (elementTop + elementHeight);
        });
        if(target) {
            event.preventDefault();
            event.stopImmediatePropagation();
            const options = new URLSearchParams();
            options.set('type', target.dataset.stardustHighlightType);
            options.set('value', target.dataset.stardustHighlight);
            options.set('referer', 'stardust');
            window.open(`${config.route}?${options.toString()}`, '_blank');
        }
    }, false);
})().catch(e=>console.error(e));