function setCart() {
    let cart;
    if (localStorage.getItem("cart") == null) cart = [];
    else cart = JSON.parse(localStorage.getItem("cart"));
    document.getElementById("shoppingCartNumber").innerText = cart.length;
    return cart;
}

function updateCart() {
    cart = JSON.parse(localStorage.getItem("cart"));
    document.getElementById("shoppingCartNumber").innerText = cart.length;
}

let cart = setCart();

let storedRegisteredName;
let storedRegisteredYear;
let page = 1;
let searchKey;
// let currentSearchKey;

function toggleClasses(id, add, remove) {
    document.getElementById(id).classList.add(add);
    document.getElementById(id).classList.remove(remove);
}

async function search() {
    let search = document.getElementById("search").value;
    let outputList = document.getElementById("outputList");
    outputList.classList.remove("hidden");
    page = 1;
    toggleClasses("nextPage", "hidden", "flex");
    searchKey = search;


    if (search.length < 3) {
        outputList.classList.add("hidden");
        outputList.innerHTML = "";
        document.getElementById("searchErrorMessage").classList.remove("hidden");
        document.getElementById("searchErrorMessage").innerText = "Søkeordet må være på 3 eller flere bokstaver."
        return;
    }

    document.getElementById("searchErrorMessage").classList.add("hidden");
    document.getElementById("searchErrorMessage").innerHTML = "";
    
    const response = await fetch(`https://seal-app-snqwb.ondigitalocean.app/search?search=${search}&page=1&limit=10`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        outputList.classList.add("hidden");
        outputList.innerHTML = "";
        document.getElementById("searchErrorMessage").classList.remove("hidden");
        document.getElementById("searchErrorMessage").innerText = "Fant ingen registrering av dette navnet. Prøv å søke etter noe annet.";
        return;
    }

    const body = await response.json();

    if (body.length == 11) {
        body.pop();
        toggleClasses("nextPage", "flex", "hidden");
        document.getElementById("pageInfo").innerText = `Side ${page}`;
        page++;
    }

    outputList.classList.remove("hidden");
    outputList.innerHTML = "";

    for (const result of body) {
        let li = document.createElement("li");
        let name = document.createElement("p");
        name.innerText = result.name;
        let year = document.createElement("p");
        year.innerText = result.year;
        li.appendChild(name);
        li.appendChild(year);
        li.classList.add("flex", "font-semibold", "justify-between", "items-center", "py-3");
        outputList.appendChild(li);
    }
    
}

async function nextPage() {
    document.getElementById("pageInfo").innerText = `Side ${page}`;
    document.getElementById("outputList").innerHTML = "";

    const response = await fetch(`https://seal-app-snqwb.ondigitalocean.app/search?search=${searchKey}&page=${page}&limit=10`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    const body = await response.json();

    if (body.length == 11) {
        body.pop();
        toggleClasses("nextPage", "flex", "hidden");
        document.getElementById("pageInfo").innerText = `Side ${page}`;
        page++;
    } else {
        toggleClasses("nextPage", "hidden", "flex");
    }

    for (const result of body) {
        let li = document.createElement("li");
        let name = document.createElement("p");
        name.innerText = result.name;
        let year = document.createElement("p");
        year.innerText = result.year;
        li.appendChild(name);
        li.appendChild(year);
        li.classList.add("flex", "font-semibold", "justify-between", "items-center", "py-3");
        outputList.appendChild(li);
    }
}

async function checkRegister() {
    let nameError = document.getElementById("nameErrorMessage");
    let yearError = document.getElementById("yearErrorMessage");
    let output = document.getElementById("registerOutputWrapper");
    let outputList = document.getElementById("registerOutputList");
    output.classList.add("hidden");
    outputList.innerHTML = "";
    nameError.innerHTML = "";
    yearError.innerHTML = "";


    let isError = false;
    
    let search = document.getElementById("registeredName");
    let year = document.getElementById("registeredYear");

    if (search.value.length < 3) {
        search.value = "";
        search.classList.add("border-red-700");
        nameError.classList.remove("hidden");
        nameError.innerText = "Navn må være minimum 3 bokstaver langt.";
        isError = true;
    }

    search.value = search.value.charAt(0).toUpperCase() + search.value.slice(1);
    year.value = parseInt(year.value);


    if (isNaN(year.value)) {
        year.value = "";
        year.classList.add("border-red-700");
        yearError.classList.remove("hidden");
        yearError.innerText = "Russekull må være tall.";
        isError = true;
    }    
    else if (year.value.length != 4) {
        year.value = "";
        year.classList.add("border-red-700");
        yearError.classList.remove("hidden");
        yearError.innerText = "Russekull må ha en lengde på 4 tall.";
        isError = true;
    }

    
    if (isError) return;


    year.classList.remove("border-red-700");
    search.classList.remove("border-red-700");


    const response = await fetch(`https://seal-app-snqwb.ondigitalocean.app/search?search=${search.value}&page=${page}&limit=10`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    storedRegisteredName = search.value;
    storedRegisteredYear = year.value;
    year.value = "";
    search.value = "";
    if (!response.ok) {
        output.classList.remove("hidden");
        document.getElementById("registerMessage").classList.remove("hidden");
        toggleClasses("registerMessage", "text-emerald-600", "text-red-700")
        document.getElementById("registerMessage").innerText = `Fant ingen liknende navn til '${storedRegisteredName}' i registeret. Trykk på knappen under for å legge til navn i handlekurven.`
    } else {
        const body = await response.json();
        output.classList.remove("hidden");
        document.getElementById("registerMessage").classList.remove("hidden");
        toggleClasses("registerMessage", "text-red-700", "text-emerald-600");
        document.getElementById("registerMessage").innerText = `Fant følgende liknende navn til '${storedRegisteredName}' i registeret. Trykk på knappen under hvis du fortsatt vil legge til navnet i handlekurven.`;

        for (const item of body) {
            let li = document.createElement("li");
            let name = document.createElement("p");
            name.innerText = item.name;
            let year = document.createElement("p");

            year.innerText = item.year;
            li.appendChild(name);
            li.appendChild(year);
            li.classList.add("flex", "font-semibold", "justify-between", "items-center", "py-3");
            outputList.appendChild(li);
        }
    }
}

function addToCart() {
    let output = document.getElementById("registerOutputWrapper");
    let outputList = document.getElementById("registerOutputList");
    output.classList.add("hidden");
    outputList.innerHTML = "";
    let registeredWrapper = document.getElementById("nameRegisteredWrapper");
    registeredWrapper.classList.remove("hidden");

    cart.push({
        name: storedRegisteredName,
        year: storedRegisteredYear
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCart();

    setTimeout(() => {
        registeredWrapper.classList.add("hidden");
    }, 5000);
}

function closeSuccessMessage() {
    document.getElementById("nameRegisteredWrapper");classList.add("hidden");
}


document.getElementById("searchButton").onclick = search;
document.getElementById("addNameButton").onclick = checkRegister;
document.getElementById("addNameToCartButton").onclick = addToCart;
document.getElementById("closeSuccessMessage").onclick = closeSuccessMessage;
document.getElementById("nextPage").onclick = nextPage;
document.getElementById("search").onkeydown = (e) => { if (e.key == "Enter") search(); };