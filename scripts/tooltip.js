
export function inject(dictionary, root = document) {
    const elements = root.querySelectorAll(".enable-tooltip");

    elements.forEach((element) => {
        console.log("Container")
        console.log(element);
        const tooltips = element.querySelectorAll("abbr");

        tooltips.forEach(el => {
            const word = el.textContent.trim();
            console.log(el);
            if (word && dictionary[word]) {
                const tooltip = document.createElement("span");
                tooltip.className = "tooltip";
                tooltip.textContent = dictionary[word];
                el.appendChild(tooltip);
            }
        });
    })
}