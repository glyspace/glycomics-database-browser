let allData = [];
let selectedDataType = null;
let selectedResourceType = null;

d3.json("data.json").then(function(data) {
    allData = data.resources;   // store the array
    renderCards(allData);
    renderResourceTypeSideBar(data);
    renderDataTypeSideBar(data);
});


function renderCards(data) {
    console.log("renderCards received:", data);
    console.log("Is array?", Array.isArray(data));

    const cards = d3.select("#cards")
        .selectAll(".card")
        .data(data, d => d.resource_name)
        .join("div")
        .attr("class", "card");

    cards.html(""); // clear existing content cleanly

    cards.append("img")
        .attr("class", "logo");

    cards.append("h3")
        .text(d => d.resource_name);

    const desc = cards.append("p")
        .attr("class", "description");

    desc.each(function(d) {
        console.log('processing description for', d.resource_name);

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
            .on("click", function() {

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
}



function renderDataTypeSideBar(data) {
    // 1️⃣ Extract all resource types
    const allTopics = data.resources.map(d => d.topic_subentries);

    // 2️⃣ Flatten the array of arrays into a single array
    const flattenedTopics = allTopics.flat();  

    // 3️⃣ Keep only unique values
    const uniqueTopics = Array.from(new Set(flattenedTopics));

    // 3️⃣ Bind unique values to buttons
    const buttons = d3.select("#dataTypeFilters")
        .selectAll("button")
        .data(uniqueTopics, d => d); // use value itself as key

    // 4️⃣ Remove old buttons
    buttons.exit().remove();

    // 5️⃣ Update existing buttons (if needed)
    buttons.text(d => d);

    // 6️⃣ Add new buttons
    buttons.enter()
        .append("button")
        .attr("class", "filter-btn")
        .text(d => d)
        .on("click", d => {
            console.log("Clicked:", d);
            alert(`You clicked ${d}`);
        });

   
}

function renderResourceTypeSideBar(data) {
    // 1️⃣ Extract all resource types
    const allResources = data.resources.map(d => d.resource);

    // 2️⃣ Keep only unique values
    const uniqueResources = Array.from(new Set(allResources));
    console.log(uniqueResources);

    // 3️⃣ Bind unique values to buttons
    const buttons = d3.select("#resourceTypeFilters")
        .selectAll("button")
        .data(uniqueResources, d => d); // use value itself as key

    // 4️⃣ Remove old buttons
    buttons.exit().remove();

    // 5️⃣ Update existing buttons (if needed)
    buttons.text(d => d);

    // 6️⃣ Add new buttons
    buttons.enter()
        .append("button")
        .attr("class", "filter-btn")
        .text(d => d)
        .on("click", d => {
            console.log("Clicked:", d);
            alert(`You clicked ${d}`);
        });

   
}


function applyFilters() {

    let filtered = allData;

    if (selectedDataType) {
        filtered = filtered.filter(d =>
            d.dataType.includes(selectedDataType)
        );
    }

    if (selectedResourceType) {
        filtered = filtered.filter(d =>
            d.resourceType === selectedResourceType
        );
    }

    const searchTerm = d3.select("#searchInput").property("value").toLowerCase();

    if (searchTerm) {
        filtered = filtered.filter(d =>
            d.resource_name.toLowerCase().includes(searchTerm) ||
            d.description.toLowerCase().includes(searchTerm)
        );
    }

    renderCards(filtered);
}

d3.selectAll("#dataTypeFilters .filter-btn")
    .on("click", function() {

        const btn = d3.select(this);
        const type = btn.attr("data-type");

        selectedDataType = selectedDataType === type ? null : type;

        d3.selectAll("#dataTypeFilters .filter-btn")
            .classed("active", false);

        if (selectedDataType) btn.classed("active", true);

        applyFilters();
    });

d3.selectAll("#resourceTypeFilters .filter-btn")
    .on("click", function() {

        const btn = d3.select(this);
        const type = btn.attr("data-type");

        selectedResourceType = selectedResourceType === type ? null : type;

        d3.selectAll("#resourceTypeFilters .filter-btn")
            .classed("active", false);

        if (selectedResourceType) btn.classed("active", true);

        applyFilters();
    });

d3.select("#searchBtn").on("click", applyFilters);
