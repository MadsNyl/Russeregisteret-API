function setCart() {
    let cart;
    if (localStorage.getItem("cart") == null) cart = [];
    else cart = JSON.parse(localStorage.getItem("cart"));
    return cart;
}

function updateCart(cart) {
    localStorage.removeItem("cart");
    localStorage.setItem("cart", JSON.stringify(cart));
}

function disableButton() {
    document.getElementById("checkout").classList.remove("bg-black", "text-white", "transition", "hover:bg-gray-100", "hover:text-gray-800");
    document.getElementById("checkout").classList.add("bg-gray-200", "text-gray-400", "cursor-not-allowed");
}

let cart = setCart();

function setCartOverview() {
    let cartList = document.getElementById("cartList");

    if (cart.length > 0) {
        for (const reg of cart) {
            let li = document.createElement("li");
            li.classList.add("flex", "justify-between", "items-center", "font-semibold", "text-xl", "pt-2");
            let regName = document.createElement("p");
            regName.innerText = `${reg.name} ${reg.year}`;
            li.appendChild(regName);
            let div = document.createElement("div");
            div.classList.add("flex", "items-center");
            let p = document.createElement("p");
            p.innerHTML = "59 <span class='text-sm'>NOK</span>";
            let a = document.createElement("a");
            a.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="ml-3 w-5 h-5 cursor-pointer text-gray-400 transition duration-300 ease-in-out hover:text-red-700">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg> 
            `;
            a.onclick = () => { 
                let index = Array.from(li.parentNode.children).indexOf(li);
                cartList.removeChild(li);
                cart = setCart();
                cart.splice(index, 1);
                localStorage.removeItem("cart");
                localStorage.setItem("cart", JSON.stringify(cart));
                document.getElementById("totalCost").innerHTML = `${cart.length * 59} <span class="text-sm">NOK</span>`;

                if (cart.length <= 0) {
                    document.getElementById("empty").classList.remove("hidden");
                    document.getElementById("empty").classList.add("flex");
                }
            };
            div.appendChild(p);
            div.appendChild(a);
            li.appendChild(div);
            cartList.appendChild(li);
        }
    } else { 
        document.getElementById("empty").classList.remove("hidden");
        document.getElementById("empty").classList.add("flex");
    }

    document.getElementById("totalCost").innerHTML = `${cart.length * 59} <span class="text-sm">NOK</span>`;
}

async function checkOut() {
    const response = await fetch("http://localhost:3000/create-checkout-session", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(cart)
    });

    const body = await response.json();
    window.location = body.url;
}

setCartOverview();


if (cart.length <= 0) {
    disableButton();
} else document.getElementById("checkout").onclick = checkOut;