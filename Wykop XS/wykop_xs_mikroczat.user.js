// ==UserScript==
// @name        Wykop XS - MikroCzat
// @name:pl     Wykop XS - MikroCzat
// @name:en     Wykop XS - MikroCzat
// @version     3.0.0


// @supportURL  		http://wykop.pl/tag/wykopwnowymstylu
// @contributionURL  	https://buycoffee.to/wykopx


// @author      Wykop X <wykopx@gmail.com>
// @namespace   Violentmonkey Scripts
// @match       https://wykop.pl/*


// @description Wykop X / MirkoCzat / MirkoCzat
// @description:en Wykop X MikroCzat / MirkoCzat







// @require https://unpkg.com/localforage@1.10.0/dist/localforage.min.js
// @require https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js

// @compatible  chrome, firefox, opera, safari, edge
// @license     No License

// ==/UserScript==
const promoString = "Wykop X - MikroCzat";
const head = document.head;
let CSS = "";

(async function ()
{

	// MIKROCZAT

	let wykopDomain = "https://wykop.pl";
	let wxDomain = "https://wykopx.pl";
	let mikroczatDomain = "https://github.com";
	let mikroczatPath = "/wykopx/WykopX/wiki/MikroCzat";

	let mikroczatWindow = null;


	document.addEventListener("mousedown", (event) =>
	{
		if (!event.target.closest(".wykopx_open_mikroczat")) return;
		event.preventDefault();
		let windowOptions = "";

		if (event.shiftKey || event.ctrlKey || event.altKey || event.button === 2)
		{
			windowOptions = "popup";
		}
		mikroczatWindow = window.open(`${mikroczatDomain}${mikroczatPath}`, 'mikroczat', windowOptions);

	});
	document.addEventListener("click", (event) =>
	{
		if (!event.target.closest(".wykopx_open_mikroczat")) return;
		event.preventDefault();
	});


	// WIADOMOŚCI OD MIKROCZAT
	window.addEventListener('message', function (event)
	{
		if (event.origin !== mikroczatDomain) return;
		console.log('Widomość od Mikroczat', event.data);
		if (event.data == "MikroCzatOpened") mikroczatWindow.postMessage(window.localStorage.token, mikroczatDomain);
		if (event.data == "MikroCzatLoggedIn") bodySection.dataset.mikroczatLogged = true;
		if (event.data == "MikroCzatClosed") bodySection.dataset.mikroczatLogged = false;
	}, false);

	CSS += `body > section[data-mikroczat-logged="true"] li.wykopx_open_mikroczat_li:after
	{
		content: "🗯";
		color: white;
		position: absolute;
		top: -2px;
		right: -2px;
	}
	body > section[data-mikroczat-logged="false"] li.wykopx_open_mikroczat_li:after
	{
		content: "⊗";
		color: rgb(255, 255, 255, 0.3);
		position: absolute;
		top: -2px;
		right: -2px;
	}`;

	document.querySelector("body header div.left nav.main ul");


	createNewNavBarButton({
		position: "left",
		text: "MikroCzat ",
		title: `Wejdź na MikroCzat ${promoString}`,
		class: "open_mikroczat", // wykopx_open_mikroczat_li
		hideWithoutXStyle: false,
		url: mikroczatDomain + mikroczatPath,
		target: "mikroczat",
		icon: "https://i.imgur.com/9PvHlaA.png",
		number: null,
		data: "",
	})

	function createNewNavBarButton(options)
	{

		let nav_ul;

		if (options.position == "left") nav_ul = document.querySelector("body header div.left nav.main ul");
		else if (options.position == "center") nav_ul = document.querySelector("body header div.right nav aside"); // doodle
		else nav_ul = document.querySelector("body header div.right nav ul");

		if (nav_ul) // brak na wersji mobilnej
		{
			let nav_ul_li = nav_ul.querySelector(`li.wykopx_${options.class}_li`);
			if (!nav_ul_li)
			{
				nav_ul_li = document.createElement("li");
				if (options.data) nav_ul_li.setAttribute(options.data, null);
				if (options.hideWithoutXStyle == true) nav_ul_li.classList.add("wykopxs");
				addWykopXSClassesToElement(nav_ul_li, options.class, "li") // class="wykopx_aaaaaa_li"

				let nav_ul_li_a = document.createElement("a");
				if (options.url) nav_ul_li_a.setAttribute("href", options.url);
				if (options.href) nav_ul_li_a.setAttribute("href", options.href);
				if (options.target) nav_ul_li_a.setAttribute("target", options.target);
				if (options.title) nav_ul_li_a.setAttribute("title", options.title);
				if (options.data) nav_ul_li_a.setAttribute(options.data, null);

				nav_ul_li_a.classList.add("hybrid");
				if (options.class) addWykopXSClassesToElement(nav_ul_li_a, options.class);


				let nav_ul_li_a_span = document.createElement("span");
				nav_ul_li_a_span.textContent = options.text;

				nav_ul_li_a.appendChild(nav_ul_li_a_span);
				nav_ul_li.appendChild(nav_ul_li_a);

				if (options.insertAfter != null)
				{
					let section = nav_ul.querySelector(options.insertAfter);
					section.insertAdjacentElement('afterend', nav_ul_li);
				}
				else
				{
					nav_ul.appendChild(nav_ul_li);
				}
			}
		}
	}


	function addWykopXSClassesToElement(element, inputClassOrArray, suffix = null)
	{
		if (inputClassOrArray)
		{
			if (typeof inputClassOrArray === 'string')
			{
				element.classList.add(`wykopx_${inputClassOrArray}${suffix != null ? "_" + suffix : ""}`);
			}
			else if (Array.isArray(inputClassOrArray) && inputClassOrArray.every(item => typeof item === 'string'))
			{
				inputClassOrArray.map(item =>
				{
					element.classList.add(`wykopx_${item}${suffix != null ? "_" + suffix : ""}`);
				});
			}
		}
	}


	head.insertAdjacentHTML("beforeend", CSS);

})();