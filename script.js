let allData = [];
let selectedDataType = null;
let selectedResourceType = null;
let searchTerm = "";

d3.json("data/glyco_resources.json").then(function(data) {
    allData = data.resources;

    renderCards(allData);
    renderResourceTypeSideBar(data);
    renderDataTypeSideBar(data);
});


/* -------------------- CARD RENDERING -------------------- */

function renderCards(data) {

    const cards = d3.select("#cards")
        .selectAll(".card")
        .data(data, d => d.resource_name)
        .join("div")
        .attr("class", "card")
        .on("click", function(event, d) {
            // d is the bound data
            console.log(d.resource);  // now it prints the resource
            openPopup(d);             // pass data to popup
        });


    cards.html("");

    cards.append("img")
        .attr("class", "logo");

    cards.append("h3")
        .text(d => d.resource_name);

    const desc = cards.append("p")
        .attr("class", "description");

    desc.each(function(d) {

        const fullText = d.description;
        const truncated = fullText.length > 120
            ? fullText.slice(0, 120) + "..."
            : fullText;

        const p = d3.select(this);

        if (fullText.length <= 120) {
            p.text(fullText);
            return;
        }

        p.text(truncated);

        const link = p.append("span")
            .attr("class", "see-more")
            .text(" See more")
            .on("click",  function(event, d) {
                event.stopPropagation();  // ⚡ Prevent popup from opening
                            
                const expanded = link.text() === " See less";

                if (!expanded) {
                    p.text(fullText);
                    link.text(" See less");
                    p.append(() => link.node());
                } else {
                    p.text(truncated);
                    link.text(" See more");
                    p.append(() => link.node());
                }
            });
    });
    d3.select("#count").text(data.length);

//        d3.select("#resultsCount").text(`${filtered.length} result${filtered.length !== 1 ? "s" : ""}`);

}


/* -------------------- DATA TYPE SIDEBAR -------------------- */

function renderDataTypeSideBar(data) {

   const allTopics = data.resources.map(d => d.datatype);

    //const flattenedTopics = allTopics.flat();

    //const uniqueTopics = Array.from(new Set(flattenedTopics)); 


    const flattenedTopics = data.resources.flatMap(d => {
        if (!d.datatype) return [];

        if (Array.isArray(d.datatype)) {
            return d.datatype.map(t => t.trim());
        }

        return d.datatype.split(",").map(t => t.trim());
    });

    const uniqueTopics = Array.from(new Set(flattenedTopics)).sort(); 

    const buttons = d3.select("#dataTypeFilters")
        .selectAll("button")
        .data(uniqueTopics, d => d);

    buttons.exit().remove();

    buttons.text(d => d);

    buttons.enter()
        .append("button")
        .attr("class", "filter-btn")
        .text(d => d)
        .on("click", function(event, d) {

            const btn = d3.select(this);

            selectedDataType = selectedDataType === d ? null : d;

            d3.selectAll("#dataTypeFilters .filter-btn")
                .classed("active", false);

            if (selectedDataType) btn.classed("active", true);

            applyFilters();
        });
}


/* -------------------- RESOURCE TYPE SIDEBAR -------------------- */

function renderResourceTypeSideBar(data) {

    const allResources = data.resources.map(d => d.resource);

    const uniqueResources = Array.from(new Set(allResources));

    const buttons = d3.select("#resourceTypeFilters")
        .selectAll("button")
        .data(uniqueResources, d => d);

    buttons.exit().remove();

    buttons.text(d => d);

    buttons.enter()
        .append("button")
        .attr("class", "filter-btn")
        .text(d => d)
        .on("click", function(event, d) {

            const btn = d3.select(this);

            selectedResourceType = selectedResourceType === d ? null : d;

            d3.selectAll("#resourceTypeFilters .filter-btn")
                .classed("active", false);

            if (selectedResourceType) btn.classed("active", true);

            applyFilters();
        });
}


/* -------------------- SEARCH BUTTON -------------------- */

d3.select("#searchBtn").on("click", function() {

    searchTerm = d3.select("#searchInput")
        .property("value")
        .toLowerCase();

    applyFilters();
});


/* -------------------- FILTER LOGIC -------------------- */

function applyFilters() {

    let filtered = allData;
    

    /* filter by data type */
    if (selectedDataType) {
        filtered = filtered.filter(d =>
            d.datatype.toLowerCase().includes(selectedDataType.toLowerCase())
        );
    }

    /* filter by resource type */
    if (selectedResourceType) {
        filtered = filtered.filter(d =>
            d.resource === selectedResourceType
        );
    }

    /* search across multiple attributes */
    if (searchTerm) {
        filtered = filtered.filter(d =>
            d.resource_name.toLowerCase().includes(searchTerm) ||
            d.description.toLowerCase().includes(searchTerm) ||
            d.resource.toLowerCase().includes(searchTerm) ||
            d.datatype.toLowerCase().includes(searchTerm)
            //d.topic_subentries.join(" ").toLowerCase().includes(searchTerm)
        );
    }

    renderCards(filtered);

        
}

function openPopup(d) {
    d3.select("#popup").style("display", "block");

    d3.select("#popup-title").text(d.resource_name);

    // Topics as comma-separated list
    d3.select("#popup-resourcetype").text(d.resource);

    d3.select("#popup-datatype").text(d.datatype);

    d3.select("#popup-description").text(d.description);

    d3.select("#popup-logo")
        .attr("class", "logo");
    
    d3.select("#popup-url")
        .attr("href", d.url[0])
        .text("Visit Resource");
}

// Close popup
d3.select(".popup-close").on("click", () => {
    d3.select("#popup").style("display", "none");
});

// Close popup if clicking outside the content
d3.select("#popup").on("click", function(event) {
    if (event.target.id === "popup") {
        d3.select("#popup").style("display", "none");
    }
});
