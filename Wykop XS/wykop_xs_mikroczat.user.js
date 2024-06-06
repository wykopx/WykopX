// ==UserScript==
// @name							Wykop XS - Lista plusujących, animowane awatary, mikroczat
// @name:pl							Wykop XS - Lista plusujących, animowane awatary, mikroczat
// @name:en							Wykop XS - Lista plusujących, animowane awatary, mikroczat

// @version							3.0.60

// @description 					Wykop XS - Darmowy dostęp do Mikroczatu. Dodatkowe funkcje na wykopie: animowane avatary, przywrócenie listy plusujących wpisy i komentarze oraz przycisku Ulubione
// @description:en 					Wykop XS - Darmowy dostęp do Mikroczatu. Dodatkowe funkcje na wykopie: animowane avatary, przywrócenie listy plusujących wpisy i komentarze oraz przycisku Ulubione


// Chcesz wesprzeć projekt Wykop X? Postaw kawkę:
// @contributionURL					https://buycoffee.to/wykopx

// @author							Wykop X <wykopx@gmail.com>









// @match							https://wykop.pl/*
// @supportURL						http://wykop.pl/tag/wykopwnowymstylu
// @namespace						Violentmonkey Scripts
// @compatible						chrome, firefox, opera, safari, edge
// @license							No License


// @require 						https://unpkg.com/localforage@1.10.0/dist/localforage.min.js







// ==/UserScript==


'use strict';

const currentVersion = "3.0.60";
let dev = false;

const promoString = " - Wykop XS";

const root = document.documentElement;
const head = document.head;
const body = document.body;
const bodySection = body.querySelector("section");
const wykopxSettings = getComputedStyle(head); // getComputedStyle(document.documentElement) -- nie działa, nie wczytuje właściwości z :root
const settings = {};

const styleElement = document.createElement('style');
styleElement.id = "wykopxs_mikroczat";
let CSS = "";

function setSettingsValueFromCSSProperty(settingName, defaultValueForWykopXS = true, propertyValueInsteadOfBoolean = false)
{
	if (propertyValueInsteadOfBoolean) settings[settingName] = wykopxSettings.getPropertyValue(`--${settingName}`) ? wykopxSettings.getPropertyValue(`--${settingName}`).trim() : defaultValueForWykopXS;
	else settings[settingName] = wykopxSettings.getPropertyValue(`--${settingName}`) ? wykopxSettings.getPropertyValue(`--${settingName}`).trim() === '1' : defaultValueForWykopXS;
}

//setSettingsValueFromCSSProperty("WykopXSEnabled");
//if (settings.WykopXSEnabled == false) return;


/* WYKOP XS HEADER */






/*  --- ZMIANA USTAWIEŃ ---
jeśli chcesz zmienić domyślne ustawienia nie zmieniaj ich w tym kodzie.
Zmień je w przeglądarce w następujący sposób:

1. Wejdź na Wykop
2. Otwórz panel narzędzi deweloperskich klawiszem *F12* lub skrótem klawiaturowym *CTRL* + *SHIFT* + *C*
3. Przejdź na zakładkę "Aplikacja"
4. w panelu po lewej w sekcji "Pamięć" wybierz "Pamięć lokalna" i znajdź na liście https://wykop.pl
5. w głównym okienku pojawi się lista kilku wartości. Znajdź opcję "wykopx/settings/settings"
6. zmień wybraną opcję na true (aby ją włączyć) lub false (aby wyłączyć)


Domyślne wartości wyglądają przykładowo tak:

{"entryVotersListExpandIfLessThan": 5, "votersFollow":true, "votersBlacklist":true, "votersBanned":true, "votersSuspended":true, "votersRemoved":true, "votersGenderF":false, "votersGenderM":false, "votersColorGreen":true, "votersColorOrange":false,"votersColorBurgundy":true}

*/



// DEFAULT SETTINGS - nie zmieniaj wartości settings w kodzie.
// Zmień je w sposób opisany powyżej

setSettingsValueFromCSSProperty("entryVotersListEnable");				// włącza pokazywanie listy plusujących z Wykop X Style
setSettingsValueFromCSSProperty("entryVotersListExpandIfLessThan", 50, true);


setSettingsValueFromCSSProperty("fixNotificationBadgeBug");				// naprawia wykopowy błąd - ukrywa liczbę nieprzeczytanych powiadomien, gdy wszystkie powiadomienia sa juz przeczytane
setSettingsValueFromCSSProperty("hideAds");								// blokuje wszystkie reklamy na wykopie


// entryVotersListExpandIfLessThan - domyślnie Wykop pokazywał 5 osób, które zaplusowały. 
// Możesz zmienić tę wartość na np. 10 albo 25. Jeśli wpis ma mniej plusów niż ta liczba, zostaną od razu wyświetleni wszyscy plusujący bez przycisku "+15 INNYCH"

if (settings.entryVotersListEnable)
{
	// entryVotersListExpandIfLessThan - domyślnie Wykop pokazywał 5 osób, które zaplusowały.
	// Możesz zmienić tę wartość na np. 10 albo 25. Jeśli wpis ma mniej plusów niż ta liczba, zostaną od razu wyświetleni wszyscy plusujący bez przycisku "+15 INNYCH"
	if (!settings.entryVotersListExpandIfLessThan) settings.entryVotersListExpandIfLessThan = 20;
	settings.votersFollow = true;							// pokazuje 🔔 przed użytkownikami, których obserwujesz
	settings.votersBlacklist = true;						// pokazuje ⛔ przed użytkownikami, których blokujesz
	settings.votersBanned = true;							// pokazuje użytkowników z aktywnym banem w kolorze i z ikonką 🍌
	settings.votersSuspended = true;						// pokazuje ✖ przed kontami, które są w trakcie usuwania
	settings.votersRemoved = true;							// pokazuje ✖ przed kontami, które są usunięte
	settings.votersGenderF = false;							// pokazuje różową kropkę przed kobietami
	settings.votersGenderM = false;							// pokazuje niebieską kropkę przed mężczyznami
	settings.votersColorGreen = true;						// pokazuje zielonki w kolorze
	settings.votersColorOrange = false;						// pokazuje pomarańczowych użytkowników w kolorze
	settings.votersColorBurgundy = true;					// pokazuje użytkowników bordo w kolorze
	settings.votersFollowFirst = true;						// pokazuje użytkowników, których obserwujesz pierwszych na liście
	settings.votersBlackFirst = false;						// pokazuje plusy od moderacji pierwsze na liście (konta typu @wykop, @m__b, @a__s itd.)
	settings.votersBurgundyFirst = false;					// pokazuje użytkowników bordo pierwszych na liście
	settings.votersOrangeFirst = false;						// pokazuje zielonki pierwszych na liście
	settings.votersGreenFirst = false;						// pokazuje pomarańczki pierwszych na liście
	settings.votersBlacklistLast = false;					// pokazuje użytkowników, których zablokowałeś na końcu listy
	settings.votersRemovedLast = false;						// pokazuje usunięte konta na końcu listy
	settings.votersBannedLast = false;						// pokazuje zbanowanych na końcu listy
	settings.votersSuspendedLast = false;					// pokazuje konta w trakcie usuwania na końcu listy
}

settings.hideShareButton = true;						// ukrywa przycisk "Udostępnij"
settings.showFavouriteButton = true;					// pokazuje przycisk "Dodaj do ulubionych" (samą gwiazdkę)
settings.showFavouriteButtonLabel = true;				// pokazuje oprócz gwiazdki także tekst "Ulubione"
settings.addCommentPlusWhenVotingOnEntry = false;		// gdy plusujesz wpis, dodaje komentarz "+1"
settings.addCommentPlusWhenVotingOnComment = false;		// gdy plusujesz komentarz, dodaje komentarz "+1"
settings.showAnimatedAvatars = true;					// pokazuje animowane avatary


(async function ()
{
	// LOCALSTORAGE
	const localStorageSettings = localforage.createInstance({
		driver: localforage.LOCALSTORAGE,
		name: "wykopx",
		storeName: "settings",
	});

	await localStorageSettings.getItem('settings').then(async (localSettings) =>
	{
		if (localSettings)
		{
			mergeSettings(localSettings, settings);
		}
		else
		{
			localStorageSettings.setItem('settings', settings);
		}
		await localStorageSettings.setItem('settings', settings);
	}).catch((err) =>
	{
		console.error('Error', err);
	});
	function mergeSettings(localSettings, defaultSettings)
	{
		for (let key in defaultSettings)
		{
			if (key in localSettings)
			{
				settings[key] = localSettings[key];
			}

			else if (!(key in localSettings))
			{
				settings[key] = defaultSettings[key];
			}

		}
	}

	function createNewNavBarButton(options)
	{
		let nav_ul;

		if (options.position == "left") nav_ul = document.querySelector("body header div.left nav.main ul");
		else if (options.position == "center") nav_ul = document.querySelector("body header div.right nav aside"); // doodle
		else nav_ul = document.querySelector("body header div.right nav ul"); // brak na wersji mobilnej

		if (nav_ul) 
		{
			let nav_ul_li;  // ! = nav_ul.querySelector(`li.wykopx_${options.class}_li`);

			if (!nav_ul_li)
			{
				nav_ul_li = document.createElement("li");

				if (options.data) nav_ul_li.setAttribute(options.data, null);
				if (options.hideWithoutXStyle == true) nav_ul_li.classList.add("wykopxs");
				addWykopXSClassesToElement(nav_ul_li, options.class, "li") // class="wykopx_aaaaaa_li"

				let nav_ul_li_a = document.createElement("a");

				nav_ul_li.dataset["v-6c2d0fdd"] = "";
				nav_ul_li_a.dataset["v-6c2d0fdd"] = "";

				if (options.url) nav_ul_li_a.setAttribute("href", options.url);
				if (options.href) nav_ul_li_a.setAttribute("href", options.href);
				if (options.target) nav_ul_li_a.setAttribute("target", options.target);
				if (options.title) nav_ul_li_a.setAttribute("title", options.title);
				if (options.data) nav_ul_li_a.setAttribute(options.data, null);

				nav_ul_li_a.classList.add("hybrid");
				if (options.class) addWykopXSClassesToElement(nav_ul_li_a, options.class);

				let nav_ul_li_a_span = document.createElement("span");
				nav_ul_li_a_span.innerHTML = options.text;

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





	// XS MIKROCZAT  -- START
	let wykopDomain = "https://wykop.pl";
	let wxDomain = "https://wykopx.pl";
	const mikroczatDomain = "https://mikroczat.pl";
	const mikroczatPath = "/"; /* /czat */
	// let mikroczatChannel = "/";
	let mikroczatWindow = null;
	const mikroczatButtonOpenTitle = "Otwórz wykopowy MikroCzat";
	const mikroczatButtonOpenLabel = "Czat";



	function openMikroczat(channel, windowOptions, target = "mikroczat")
	{
		if (bodySection.dataset.key_shift) delete bodySection.dataset.key_shift;
		if (bodySection.dataset.key_ctrl) delete bodySection.dataset.key_ctrl;
		if (bodySection.dataset.key_alt) delete bodySection.dataset.key_alt;

		let mikroczatURL = `${mikroczatDomain}`;
		mikroczatURL += `${mikroczatPath}${channel}`;

		mikroczatWindow = window.open(mikroczatURL, target, windowOptions);
	}

	// OTWIERANIE MIKROCZATU Z PRZYCISKU
	document.addEventListener("mousedown", wykopx_open_mikroczat_event_listener);

	function wykopx_open_mikroczat_event_listener(e)
	{
		if (!e.target.closest(".wykopx_open_mikroczat")) return;

		e.preventDefault();
		let windowOptions = "";
		let channel = "";

		if (e.shiftKey || e.ctrlKey || e.altKey || e.button === 2)
		{
			windowOptions = "popup";
		}

		// WykopXS unique
		const pathnameArray = new URL(document.URL).pathname.split("/");
		if (pathnameArray[1] == "tag")
		{
			channel = "/" + pathnameArray[2]; // nazwatagu
		}

		openMikroczat(channel, windowOptions);
	}

	// PREVENT DEFAULT EVENT
	function preventDefaultEvent(e)
	{
		e.preventDefault();
	}
	document.addEventListener("click", (e) =>
	{
		if (!e.target.closest(".wykopx_open_mikroczat")) return;
		e.preventDefault();
	});

	let keys = {};
	document.addEventListener("keydown", (e) =>
	{
		if (e.target.tagName.toLowerCase() === 'textarea') return;

		if (!keys["SHIFT"] && e.key == "Shift")
		{
			keys["SHIFT"] = true;
			bodySection.dataset.key_shift = "true";
		}
		else if (!keys["ALT"] && (e.key == "Alt" || e.key == "AltGraph"))
		{
			keys["ALT"] = true;
			bodySection.dataset.key_alt = "true";
		}
	});

	document.addEventListener("keyup", (e) =>
	{
		if (e.target.tagName.toLowerCase() === 'textarea') return;

		if (keys["SHIFT"] && e.key == "Shift")
		{
			keys["SHIFT"] = false;
			delete bodySection.dataset.key_shift;
		}
		else if (keys["ALT"] && (e.key == "Alt" || e.key == "AltGraph"))
		{
			keys["ALT"] = false;
			delete bodySection.dataset.key_alt;
		}
	});

	document.addEventListener("mouseover", (e) =>
	{
		if (e.target.matches(`a[href^="/tag/"]`))
		{
			e.target.title = `Wciśnij klawisz ⇧ 𝗦𝗛𝗜𝗙𝗧 lub ⎇ 𝗔𝗟𝗧 (⌥ 𝗢𝗽𝘁𝗶𝗼𝗻 na Mac) klikając na tag,\naby otworzyć kanał #${e.target.innerText} na 🗯 Mikroczacie\n\n⎇ 𝗔𝗟𝗧 - mikroczat w nowej karcie\n⇧ 𝗦𝗛𝗜𝗙𝗧 - mikroczat w nowym oknie`;

			e.target.addEventListener("click", preventDefaultEvent, true);
			e.target.addEventListener("mousedown", tagHrefEventListenerWithShift, true);
			e.target.addEventListener("mouseup", preventDefaultEvent, true);
		}
	});

	document.addEventListener("mouseout", (e) =>
	{
		if (e.target.matches(`a[href^="/tag/"]`))
		{
			e.target.removeEventListener("click", preventDefaultEvent, true);
			e.target.removeEventListener("mousedown", tagHrefEventListenerWithShift, true);
			e.target.removeEventListener("mouseup", preventDefaultEvent, true);
		}
	});

	function tagHrefEventListenerWithShift(e)
	{
		const channel = e.target.href.split("tag/").pop();

		if (e.ctrlKey || e.altKey) // || e.button === 2)
		{
			e.preventDefault();
			openMikroczat(channel, null, "_blank");
		}
		else if (e.shiftKey)
		{
			e.preventDefault();
			openMikroczat(channel, "popup");
		}
		else if (e.button === 2) // PPM
		{

		}
		else if (e.button === 1) // ŚPM
		{

		}
		else if (e.button === 0) // LPM
		{
			window.location.href = e.target.href;
		}
	}


	// WIADOMOŚCI OD MIKROCZAT.PL
	window.addEventListener('message', function (event)
	{
		if (event.origin !== mikroczatDomain) return;
		if (dev) console.log('Wiadomość z mikroczat.pl', event.data);

		//if (event.data == "MikroCzatOpened") mikroczatWindow.postMessage({ type: "token", token: window.localStorage.getItem("token") }, mikroczatDomain);

		if (event.data == "MikroCzatOpened")
		{
			mikroczatWindow.postMessage({ type: "TokensObject", token: window.localStorage.getItem("token"), userKeep: window.localStorage.getItem("userKeep") }, mikroczatDomain);
		}


		if (event.data == "MikroCzatLoggedIn")
		{
			if (dev) console.log("event.data", event.data)
			bodySection.dataset.mikroczatLogged = true;
		}

		if (event.data == "MikroCzatClosed")
		{
			bodySection.dataset.mikroczatLogged = false;
			mikroczatWindow = null;
		}
	}, false);



	function createLeftPanelButton()
	{
		if (dev) console.log("createLeftPanelButton");

		const aside_section_div_ul = document.querySelector("body aside.left-panel > section.buttons ul");
		if (!aside_section_div_ul) return;

		let aside_section_div_ul_li = aside_section_div_ul.querySelector("li.mikroczat");
		if (aside_section_div_ul_li) return;

		aside_section_div_ul_li = document.createElement('li');
		aside_section_div_ul_li.classList.add('wykopx_open_mikroczat', 'mikroczat');
		aside_section_div_ul_li.title = mikroczatButtonOpenTitle;

		aside_section_div_ul_li.innerHTML = `
		<div class="popper-button">
			<span>
				<span class="button">
					<a target="_mikroczat" class="hybrid">
						<span>${mikroczatButtonOpenLabel}</span>
					</a>
				</span>
			</span>
		</div>`;

		aside_section_div_ul.appendChild(aside_section_div_ul_li);
	}


	{
		CSS += `
		/* LEFT MENU MIKROCZAT BUTTON - START */
		body aside.left-panel:not(.mini) > section.buttons > div.content > ul
		{
			display: flex;
			flex-wrap: wrap;
			justify-content: space-around;
			column-gap: 0px;
		}
		body aside.left-panel:not(.mini) > section.buttons > div.content > ul > li
		{
			flex-basis: 47%;
			box-sizing: border-box;
			padding: 0px;
			margin-top: 7px;
		}

		body aside.left-panel > section > div.content > ul > li
		{
			position: relative;
			cursor: pointer;
		}

		body aside.left-panel.mini > section > div.content > ul > li:hover,
		body aside.left-panel:not(.mini) > section.buttons > div.content > ul > li:hover a::before
		{
			background: var(--squeeze);
		}

		aside.left-panel>section.links>.content ul li a 									/* [data-v-5687662b] */
		{
			padding: 0 6px;
			display: block;
			-webkit-box-sizing: border-box;
			box-sizing: border-box;
			font-weight: 400;
			text-decoration: none;
			font-size: 16px;
			line-height: 36px;
			height: 36px;
		}
		


		aside.left-panel>section.buttons>.content ul li a 									/* [data-v-5687662b] */
		{
			display: block;
			position: relative;
			color: var(--steelBluish);
			font-size: 0;
		}

		aside.left-panel>section.buttons>.content ul li.active a, 							/* [data-v-5687662b] */
		aside.left-panel>section.buttons>.content ul li:hover a 							/* [data-v-5687662b] */
		{
			color: var(--tuna);
			font-weight: 600;
		}

		aside.left-panel>section.buttons>.content ul li a:before 							/* [data-v-5687662b] */
		{
			content: '';
			display: block;
			width: 100%;
			height: 36px;
			border: 1px solid var(--porcelain);
			border-radius: 6px;
			box-sizing: border-box;
			transition: background .2s ease, border .2s ease;
		}
		[data-night-mode] aside.left-panel>section.buttons>.content ul li a:before 			/* [data-v-5687662b] */
		{
			border-color: #303032;
		}

		aside.left-panel:not(.mini)>section.buttons>.content ul li:hover a:before,
		[data-night-mode] aside.left-panel:not(.mini)>section.buttons>.content ul li:hover a:before
		{
			border-color: var(--tuna);
		}

		aside.left-panel:not(.mini)>section.buttons>.content ul li a:after 							/* [data-v-5687662b] */
		{
			content: '';
			display: block;
			position: absolute;
			-webkit-mask-repeat: no-repeat;
			mask-repeat: no-repeat;
			-webkit-mask-position: center;
			mask-position: center;
			background: var(--gullGray);
			height: 34px;
			width: 100%;
			top: 0;
			left: 0;
			-webkit-transition: background .2s ease;
			transition: background .2s ease;
		}

		aside.left-panel:not(.mini)>section.buttons>.content ul li.mikroczat a:after 					/* [data-v-5687662b] */
		{
			-webkit-mask-image: url(https://i.imgur.com/82a9CyK.png);
			mask-image: url(https://i.imgur.com/82a9CyK.png);
			-webkit-mask-size: 22px 22px;
			mask-size: 22px 22px;
		}

		/* ZWINIETE MENU PO LEWEJ */
		aside.left-panel>section.links>.content ul li a:before 								/* [data-v-5687662b] */
		{
			content: '';
			display: block;
			position: absolute;
			-webkit-mask-repeat: no-repeat;
			mask-repeat: no-repeat;
			-webkit-mask-position: center;
			mask-position: center;
			-webkit-mask-size: cover;
			mask-size: cover;
			background: var(--gullGray);
			-webkit-transform: translateX(-50%) translateY(-50%);
			transform: translateX(-50%) translateY(-50%);
			top: 50%;
			left: 24px;
			-webkit-transition: background .2s ease;
			transition: background .2s ease;
			z-index: 1;
		}


		aside.left-panel.mini > section.links > .content ul li.mikroczat a:before
		{
			-webkit-mask-image: url(https://i.imgur.com/82a9CyK.png);
			mask-image: url(https://i.imgur.com/82a9CyK.png);
			-webkit-mask-size: 22px 22px;
			mask-size: 22px 22px;

			mask-size: 22px 22px;
			width: 22px;
			height: 22px;
			margin-top: 0px;
		}


		aside.left-panel:not(.mini)>section.buttons>.content ul li a>span 								/*[data-v-5687662b] */
		{
			position: relative;
			display: inline-block;
			font-size: 11px;
			left: 50%;
			-webkit-transform: translateX(-50%);
			transform: translateX(-50%);
			white-space: nowrap;
			margin-top: 2px;
			line-height: 16px;
			height: 16px;
		}
		aside.left-panel.mini > section.links > .content ul li a > span
		{
			display: none;
		}
	
		/* LEFT MENU MIKROCZAT BUTTON - END */




		/* MIKROCZAT TAG LINKS */
		section:is(.entry-content, .link-block)[class] { overflow: visible!important; }

		section:is(.entry-content, .link-block) a[href^="/tag/"]
		{
			padding-right: 2px !important;
			margin-right: 1px;
			transition: none!important;
		}
		section:is(.entry-content, .link-block) a[href^="https://mikroczat.pl/"]
		{
			padding-right: 2px!important;
			padding-left: 2px!important;
		}
		section:is(.entry-content, .link-block) a[href^="/tag/"],
		section.entry-content .wrapper a[href^="https://mikroczat.pl/"]
		{
			border: 1px solid transparent!important;
			position: relative!important;
		}

		body > section[data-key_shift="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"],
		body > section[data-key_alt="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"],
		body > section[data-key_ctrl="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"],
		body > section[data-key_shift="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"] *,
		body > section[data-key_alt="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"] *,
		body > section[data-key_ctrl="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"] *,
		body > section[data-key_shift="true"] 	section.entry-content a[href^="https://mikroczat.pl/"],
		body > section[data-key_alt="true"] 	section.entry-content a[href^="https://mikroczat.pl/"],
		body > section[data-key_ctrl="true"] 	section.entry-content a[href^="https://mikroczat.pl/"],
		body > section[data-key_shift="true"] 	section.entry-content a[href^="https://mikroczat.pl/"] *,
		body > section[data-key_alt="true"] 	section.entry-content a[href^="https://mikroczat.pl/"] *,
		body > section[data-key_ctrl="true"] 	section.entry-content a[href^="https://mikroczat.pl/"] *
		{
			color: var(--tagChannelColor)!important;
		}

		body > section[data-key_shift="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"],
		body > section[data-key_alt="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"],
		body > section[data-key_ctrl="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"],
		body > section[data-key_shift="true"] 	section.entry-content a[href^="https://mikroczat.pl/"],
		body > section[data-key_alt="true"] 	section.entry-content a[href^="https://mikroczat.pl/"],
		body > section[data-key_ctrl="true"] 	section.entry-content a[href^="https://mikroczat.pl/"]
		{
			border-color: var(--tagChannelColor)!important;
			background-color: color-mix(in srgb, var(--whitish) 90%, var(--tagChannelColor))!important;
			border-radius: var(--smallBorderRadius)!important;
		}
		body > section[data-key_shift="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"]:hover,
		body > section[data-key_alt="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"]:hover,
		body > section[data-key_ctrl="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"]:hover,
		body > section[data-key_shift="true"] 	section.entry-content a[href^="https://mikroczat.pl/"]:hover,
		body > section[data-key_alt="true"] 	section.entry-content a[href^="https://mikroczat.pl/"]:hover,
		body > section[data-key_ctrl="true"] 	section.entry-content a[href^="https://mikroczat.pl/"]:hover
		{
			background-color: color-mix(in srgb, var(--whitish) 60%, var(--tagChannelColor))!important;
		}

		body > section[data-key_shift="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"],
		body > section[data-key_alt="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"],
		body > section[data-key_ctrl="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"]
		{

			padding-left: 3px !important;
			margin-left: -12px !important;

		}
		body > section[data-key_shift="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"]:hover,
		body > section[data-key_alt="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"]:hover,
		body > section[data-key_ctrl="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"]:hover
		{
			text-decoration: none!important;
		}
		body > section[data-key_shift="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"]::before,
		body > section[data-key_alt="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"]::before,
		body > section[data-key_ctrl="true"] 	section:is(.entry-content, .link-block) a[href^="/tag/"]::before
		{
			content: "#";
		}
		body > section[data-key_shift="true"] 	section.entry-content a[href^="/tag/"]::after,
		body > section[data-key_alt="true"] 	section.entry-content a[href^="/tag/"]::after,
		body > section[data-key_ctrl="true"] 	section.entry-content a[href^="/tag/"]::after,
		body > section[data-key_shift="true"] 	section.entry-content a[href^="https://mikroczat.pl/"]::after,
		body > section[data-key_alt="true"] 	section.entry-content a[href^="https://mikroczat.pl/"]::after,
		body > section[data-key_ctrl="true"] 	section.entry-content a[href^="https://mikroczat.pl/"]::after
		{
			color: white;
			content: "🗯";
			position: absolute;
			top: -1em;
			right: -0.5em;
		}
		
		body > section[data-mikroczat-logged="true"] li.wykopx_open_mikroczat_li span:after
		{
			content: "•";
			color: white;
			position: absolute;
			top: 4px;
			right: 5px;
		}
		body > section[data-mikroczat-logged="false"] li.wykopx_open_mikroczat_li span:after
		{
			content: "•";
			color: rgb(255, 255, 255, 0.3);
			position: absolute;
			top: 4px;
			right: 5px;
		}`;
	}


	createLeftPanelButton();

	createNewNavBarButton({
		position: "left",
		// text: "Mikro<strong>czat</strong>",
		text: mikroczatButtonOpenLabel,
		title: mikroczatButtonOpenTitle,
		class: "open_mikroczat", // wykopx_open_mikroczat_li
		hideWithoutXStyle: false,
		url: mikroczatDomain,
		target: "_mikroczat",
		number: null,
	});



	function throttle(func, delay)
	{
		let promise = Promise.resolve();
		return function (...args)
		{
			promise = promise.then(() =>
			{
				return new Promise((resolve) =>
				{
					setTimeout(() =>
					{
						func(...args);
						resolve();
					}, delay);
				});
			});
		};
	}

	const throttledAddVotersList = throttle(addVotersList, 200);

	let observer = new MutationObserver((mutations) =>
	{
		if (dev) console.log(`--- ${mutations.length} mutations`, mutations);

		mutations.forEach((mutation) =>
		{
			if (dev) 
			{
				console.log("---------- new mutation -----");
				console.log(mutation);

				if (mutation.type)
				{
					console.log(`⭐ mutation.type: `, mutation.type)
				}
				if (mutation.attributeName)
				{
					console.log(`⭐ mutation.attributeName: ${mutation.attributeName}`, mutation.attributeName)
				}
				if (mutation.addedNodes.length > 0 && mutation.addedNodes[0] && mutation.addedNodes[0] instanceof Element)
				{
					console.log(`⭐ mutation.addedNodes.length: ${mutation.addedNodes.length}`, mutation.addedNodes[0])
				}

				if (mutation.target)
				{
					console.log(`⭐ mutation.target: ${mutation.target.tagName}`, mutation.target)

					if (mutation.target.tagName === "SECTION")
					{

					}
				}
			}

			// ADDED NODES
			if (mutation.addedNodes.length > 0 && mutation.addedNodes[0] && mutation.addedNodes[0] instanceof Element)
			{
				if (mutation.addedNodes[0].matches("section.entry[id]"))
				{
					const sectionEntry = mutation.addedNodes[0];

					if (dev) console.log("mutation 1", sectionEntry);

					processSectionEntry(sectionEntry)

					const sectionCommentsArray = sectionEntry.querySelectorAll("section.entry[id]");
					if (dev) console.log("mutation 1 - forEach: sectionEntryArray", sectionCommentsArray);
					sectionCommentsArray.forEach((sectionComment) =>
					{
						processSectionEntry(sectionComment)
					})
				}
				else if (mutation.addedNodes[0].matches("div.content:has(>section.entry[id])"))
				{
					const sectionEntriesArray = mutation.addedNodes[0].querySelectorAll("section.entry[id]");
					if (dev) console.log("mutation 2 - forEach: sectionEntriesArray", sectionEntriesArray);
					sectionEntriesArray.forEach((sectionEntry) =>
					{
						processSectionEntry(sectionEntry)
					})
				}
				else if (mutation.target.tagName === "SECTION" && mutation.target.matches("section.entry.detailed[id]"))
				{
					const sectionEntry = mutation.target;
					if (dev) console.log("mutation 3", sectionEntry)
					if (dev) console.log("mutation 3: mutation.target", mutation.target);

					processSectionEntry(sectionEntry);

					const sectionCommentsArray = sectionEntry.querySelectorAll("section.entry[id]");
					if (dev) console.log("mutation 3 - forEach: sectionEntryArray", sectionCommentsArray);
					sectionCommentsArray.forEach((sectionComment) =>
					{
						processSectionEntry(sectionComment)
					})
				}
				else if (settings.showAnimatedAvatars && mutation.addedNodes[0].matches("aside.profile-top"))
				{
					animatedAvatar(mutation.addedNodes[0]);
				}
				// LEFT SIDE CATEGORY MENU OPENED
				else if (mutation.addedNodes[0].matches("aside.left-panel.thin-scrollbar"))
				{
					createLeftPanelButton();
				}
			}


		});
	});



	// CONTENT LOADED
	let mainSection;
	document.addEventListener('readystatechange', (event) => 
	{
		if (dev) console.log('readyState:' + document.readyState);
		mainSection = document.querySelector('body > section');

		if (mainSection)
		{

			const sectionEntryArray = mainSection.querySelectorAll("section.entry[id]");
			// if (dev) console.log("sectionEntryArray", sectionEntryArray);
			sectionEntryArray.forEach((sectionEntry) =>
			{
				processSectionEntry(sectionEntry)
			})
			const config = {
				childList: true,
				subtree: true,
			};

			observer.observe(mainSection, config);

			if (settings.showAnimatedAvatars)
			{
				const asideProfileTop = mainSection.querySelector("aside.profile-top");
				if (asideProfileTop) animatedAvatar(asideProfileTop);
			}
		}

	});



	function processSectionEntry(sectionEntry)
	{
		if (dev) console.log("processSectionEntry()", sectionEntry)

		if (!sectionEntry) return;

		if (settings.showAnimatedAvatars) animatedAvatar(sectionEntry);

		if (settings.showFavouriteButton) addFavouriteButton(sectionEntry);

		if (settings.entryVotersListEnable && sectionEntry?.__vue__?.item) 
		{
			if (dev) console.log("sectionEntry?.__vue__.item.id", sectionEntry?.__vue__.item.id);
			if (dev) console.log("sectionEntry.dataset?.votersLoaded", sectionEntry.dataset?.votersLoaded);

			if (sectionEntry.dataset?.votersLoaded == sectionEntry?.__vue__.item.id) return;
			if (sectionEntry?.__vue__.item.votes.up == 0)
			{
				removeVotersListWhenNoVoters(sectionEntry);
				return;
			}

			if (settings.entryVotersListExpandIfLessThan > 5 && sectionEntry?.__vue__.item.votes.up <= settings.entryVotersListExpandIfLessThan && sectionEntry?.__vue__.item.votes.up > 5) 
			{
				if (dev) console.log(`processSectionEntry() wybrano 💛throttledAddVotersList  ${sectionEntry.__vue__.item.id} | plusow: ${sectionEntry.__vue__.item.votes.up}`,)
				throttledAddVotersList(sectionEntry);
			}
			else
			{
				if (dev) console.log(`processSectionEntry() wybrano 🤎addVotersList  ${sectionEntry.__vue__.item.id} | plusow: ${sectionEntry.__vue__.item.votes.up}`,)
				addVotersList(sectionEntry)
			}
		}
	}


	function animatedAvatar(sectionEntry)
	{
		const image = sectionEntry.querySelector('a.avatar figure img'); // Replace with your actual selector
		if (image)
		{
			if (dev) console.log("image", image)
			const currentSrc = image.getAttribute('src');
			if (dev) console.log("currentSrc", currentSrc)
			if (currentSrc.endsWith('.gif'))
			{
				const modifiedSrc = currentSrc.replace(/,.*?\./, '.');
				image.setAttribute('src', modifiedSrc);
				if (dev) console.log("image.src", image.src)
			}
		}
	}

	function removeVotersListWhenNoVoters(sectionEntry)
	{
		if (sectionEntry)
		{
			delete sectionEntry.dataset?.votersLoaded;
			sectionEntry.querySelector("section.entry-voters")?.remove();
		}

	}

	async function addVotersList(sectionEntry)
	{
		if (dev) console.log(`addVotersList precheck: `, sectionEntry)

		if (!sectionEntry || !sectionEntry.__vue__) return;

		if (sectionEntry.dataset?.votersLoaded == sectionEntry?.__vue__.item.id) return;

		if (dev) console.log(`addVotersList execute: `, sectionEntry)

		if (sectionEntry?.__vue__ && sectionEntry?.__vue__.item.votes.up > 0)
		{
			if (sectionEntry?.__vue__ && settings.entryVotersListExpandIfLessThan > 5 && sectionEntry?.__vue__.item.votes.up <= settings.entryVotersListExpandIfLessThan && sectionEntry?.__vue__.item.votes.up > 5)
			{
				let entryId, commentId;
				if (sectionEntry?.__vue__?.item.resource == "entry") 
				{
					entryId = sectionEntry?.__vue__?.item.id;
				}
				else if (sectionEntry?.__vue__?.item.resource == "entry_comment") 
				{
					entryId = sectionEntry?.__vue__?.item.parent.id;
					commentId = sectionEntry?.__vue__?.item.id;
				}
				let voters = await fetchAllVotersFromAPI(entryId, commentId);

				appendVotersToEntry(sectionEntry, voters);

			}
			else
			{
				appendVotersToEntry(sectionEntry, sectionEntry?.__vue__?.item?.votes?.users);
			}
		}
	}

	function addFavouriteButton(sectionEntry)
	{
		if (sectionEntry && sectionEntry?.__vue__)
		{
			const sectionActionsUL = sectionEntry.querySelector("section.actions:not(:has(li.favourite)) > ul");
			if (!sectionActionsUL) return;

			let entryId, commentId;

			let isFavourite = sectionEntry?.__vue__?.item.favourite;

			if (sectionEntry?.__vue__?.item.resource == "entry") 
			{
				entryId = sectionEntry?.__vue__?.item.id;
			}
			else if (sectionEntry?.__vue__?.item.resource == "entry_comment") 
			{
				entryId = sectionEntry?.__vue__?.item.parent.id;
				commentId = sectionEntry?.__vue__?.item.id;
			}


			const favButtonLI = document.createElement("li");
			favButtonLI.classList.add("favourite", "icon", "icon-favourite");


			if (isFavourite) { favButtonLI.classList.add("active"); }
			const favButtonSpan = document.createElement("span");
			favButtonSpan.classList.add("favouriteButton");

			// VUE SENSITIVE
			/*
				data-v-90179052
			*/
			favButtonLI.setAttribute('data-v-90179052', '');
			favButtonSpan.setAttribute('data-v-90179052', '');

			favButtonSpan.dataset.isFavourite = isFavourite;
			favButtonSpan.dataset.entryId = entryId;
			if (commentId) favButtonSpan.dataset.commentId = commentId;
			if (settings.showFavouriteButtonLabel) favButtonSpan.innerText = `Ulubione`;
			favButtonLI.appendChild(favButtonSpan);

			const sharingElement = sectionActionsUL.querySelector(".sharing");
			if (sharingElement) sharingElement.insertAdjacentElement("afterend", favButtonLI);

		}

	}




	function appendVotersToEntry(sectionEntry, voters)
	{


		if (!sectionEntry) return;
		const divEditWrapperElement = sectionEntry.querySelector('article > div.edit-wrapper');
		if (!divEditWrapperElement) return;

		if (dev) console.log(`💚 appendVotersToEntry start`, sectionEntry)

		sectionEntry.dataset.votersLoaded = sectionEntry?.__vue__?.item.id;

		if (dev) console.log(`appendVotersToEntry: ${sectionEntry?.__vue__?.item.id}`, voters)


		const fiveVoters = voters;

		if (!fiveVoters || fiveVoters.length < 1) return false;

		let sectionEntryVotersHTML = `<ul>`;

		fiveVoters.forEach(voter =>
		{
			sectionEntryVotersHTML += getListItemForUser(voter);
		});

		// <li class="more">
		if (sectionEntry?.__vue__?.item?.votes.up > settings.entryVotersListExpandIfLessThan && voters.length <= settings.entryVotersListExpandIfLessThan)
		{
			sectionEntryVotersHTML += `
				<li data-no-bubble="" class="more">
					<span data-votes-up="${sectionEntry?.__vue__?.item?.votes.up}"`;

			if (sectionEntry?.__vue__?.item.resource == "entry") 
			{
				sectionEntryVotersHTML += `data-entry-id="${sectionEntry?.__vue__?.item.id}"`;
			}
			else if (sectionEntry?.__vue__?.item.resource == "entry_comment") 
			{
				sectionEntryVotersHTML += `data-entry-id="${sectionEntry?.__vue__?.item.parent.id}"`;
				sectionEntryVotersHTML += `data-comment-id="${sectionEntry?.__vue__?.item.id}"`;
			}

			sectionEntryVotersHTML += `>+${sectionEntry?.__vue__?.item?.votes.up - 5} innych</span></li>`;
		}
		sectionEntryVotersHTML += `</ul>`;

		const sectionEntryVoters = document.createElement("section");
		sectionEntryVoters.classList.add("entry-voters");
		sectionEntryVoters.innerHTML = sectionEntryVotersHTML;

		const sectionEntryVotersElement = divEditWrapperElement.querySelector('section.entry-voters');

		if (sectionEntryVotersElement)
		{
			let parentElement = sectionEntryVotersElement.parentNode;
			parentElement.replaceChild(sectionEntryVoters, sectionEntryVotersElement);
		}
		else
		{
			const editWrapper = sectionEntry.querySelector(".edit-wrapper");
			if (editWrapper) editWrapper.appendChild(sectionEntryVoters);
		}
	}

	function getListItemForUser(voter)
	{
		let userHTML = `<li>
				<a href="/ludzie/${voter.username}" class="username`;

		userHTML += ` ${voter.color}-profile`; 		// orange-profile green-profile burgundy-profile
		userHTML += ` ${voter.status}`;				// active banned suspended removed
		userHTML += ` follow-${voter.follow}`;		// follow-true  follow-false
		userHTML += ` verified-${voter.verified}`;	// verified-false
		userHTML += ` blacklist-${voter.blacklist}`;// blacklist-true blacklist-false
		userHTML += ` online-${voter.online}`;		// online-true online-false

		userHTML += ` ${voter.gender}-gender`;		// m-gender, f-gender, null-gender
		if (voter.gender == "m") userHTML += ` male`;
		else if (voter.gender == "f") userHTML += ` female`;
		userHTML += `">`;


		if (settings?.votersFollow && voter.follow) userHTML += `<i class="follow-true" title="Obserwujesz tego użytkownika"></i>`;
		if (settings?.votersVerified && voter.verified) userHTML += `<i class="verified-true" title="Ten użytkownik jest zweryfikowany"></i>`;
		if (settings?.votersBlacklist && voter.blacklist) userHTML += `<i class="blacklist-true" title="Ten użytkownik jest na Twojej czarnej liście"></i>`;
		if (settings?.votersOffline && !voter.online) userHTML += `<i class="online-false" title="Ten uzytkownik jest teraz offline"></i>`;
		if (settings?.votersOnline && voter.online) userHTML += `<i class="online-true" title="Ten uzytkownik jest teraz online"></i>`;
		if (settings?.votersBanned && voter.status == "banned") userHTML += `<i class="banned" title="Użytkownik dostał bana. Z dodatkiem Wykop XS - Ban Info możesz szybko sprawdzić przyczynę i długość trwania bana."></i>`;
		if (settings?.votersSuspended && voter.status == "suspended") userHTML += `<i class="suspended" title="To konto jest w trakcie usuwania."></i>`;
		if (settings?.votersRemoved && voter.status == "removed") userHTML += `<i class="removed" title="Konto usunięte"></i>`;
		if (settings?.votersGenderM && voter.gender == "m") userHTML += `<i class="${voter.gender}-gender" title="Wpis od niebieskiego"></i>`;
		if (settings?.votersGenderF && voter.gender == "f") userHTML += `<i class="${voter.gender}-gender" title="Plus od różowej"></i>`;

		userHTML += `<span>${voter.username}</span>
				</a>
			</li>`;

		return userHTML;
	}


	/*
	<section data-v-6e6ed6ee="" data-v-2aacfeb5="" class="entry-voters">
		<ul data-v-6e6ed6ee="">
			<li data-v-6e6ed6ee="" class="">
				<a data-v-ed9f6c56="" data-v-6e6ed6ee="" href="/ludzie/NaczelnyAgnostyk" class="username orange-profile active">
					<span data-v-ed9f6c56="">
						NaczelnyAgnostyk<!---->
					</span>
				</a>
			</li>
			<li data-v-6e6ed6ee="" data-no-bubble="" class="more">
				<span data-v-6e6ed6ee="">+5 innych</span>
			</li>
		</ul>
	</section>
	*/

	function fetchAllVotersFromAPI(entryId, commentId)
	{
		if (dev) console.log(`fetchAllVotersFromAPI: ${entryId}, ${commentId}`)
		let apiURL = `https://wykop.pl/api/v3/entries/${entryId}/votes?page=1`
		if (commentId) apiURL = `https://wykop.pl/api/v3/entries/${entryId}/comments/${commentId}/votes`;

		return new Promise(async (resolve, reject) =>
		{
			await fetch(apiURL, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + window.localStorage.getItem("token"),
				},
			})
				.then((response) =>
				{
					if (!response.ok)
					{
						if (dev) console.log("HTTP error! status: ${response.status}");
						// throw new Error(`HTTP error! status: ${response.status}`);
					}
					return response.json();
				})
				.then(async (responseJSON) =>
				{
					resolve(responseJSON.data);

				}).catch((error) =>
				{
					if (error instanceof TypeError)
					{
						console.error('Network error:', error); // AWARIA SERWERA WYPOKU
					} else
					{
						console.error('Other error:', error);
					}
					reject(error);
				});
		});
	}

	function postFavouriteToAPI(favourite, resource, id)
	{
		let apiURL = `https://wykop.pl/api/v3/favourites`;
		const method = favourite ? "POST" : "DELETE";
		const body = {
			data: {
				type: resource,
				source_id: id
			}
		}

		return new Promise(async (resolve, reject) =>
		{
			await fetch(apiURL, {
				method: method,
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + window.localStorage.getItem("token"),
				},
				body: JSON.stringify(body)
			})
				.then((response) =>
				{
					if (!response.ok)
					{
						if (dev) console.log("HTTP error! status: ${response.status}");
						// throw new Error(`HTTP error! status: ${response.status}`);
					}
					return response.json();
				})
				.then(async (responseJSON) =>
				{
					resolve(responseJSON.data);

				}).catch((error) =>
				{
					if (error instanceof TypeError)
					{
						console.error('Network error:', error); // AWARIA SERWERA WYPOKU
					} else
					{
						console.error('Other error:', error);
					}
					reject(error);
				});

		});
	}

	function postCommentPlus1ToAPI(sectionEntry)
	{
		if (!sectionEntry || !sectionEntry.__vue__) return;

		const resource = sectionEntry.__vue__.item.resource;
		let entryId;
		let authorUsername = sectionEntry.__vue__.item.author.username;
		if (resource === "entry")
			entryId = sectionEntry.__vue__.item.id;

		else if (resource === "entry_comment")
			entryId = sectionEntry.__vue__.item.parent.id;

		// TODO ZNALEZISKA

		let apiURL = `https://wykop.pl/api/v3/entries/${entryId}/comments`;
		const method = "POST";
		const body = {
			data: {
				"content": `@${authorUsername} [+](https://greasyfork.org/en/scripts/489949)1`,
				"adult": false
			}
		}
		/*
		"data": 
			{
				"content": "**foobar** __foobar__ [lorem](https://www.wykop.pl) impsum!!! #nsfw #wykop",
				"embed": "1fde707843ss3fbe9cb4eed0asdfsdfc64ab9a4df6084199b39d2",
				"photo": "e07843ss3fbe9cb4saeed0asdfsdfc64b9a4df6084199b39d2",
				"adult": false
				}
			}
		*/

		return new Promise(async (resolve, reject) =>
		{
			await fetch(apiURL, {
				method: method,
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + window.localStorage.getItem("token"),
				},
				body: JSON.stringify(body)
			})
				.then((response) =>
				{
					if (!response.ok)
					{
						if (dev) console.log("HTTP error! status: ${response.status}");
						// throw new Error(`HTTP error! status: ${response.status}`);
					}
					return response.json();
				})
				.then(async (responseJSON) =>
				{
					resolve(responseJSON.data);

				}).catch((error) =>
				{
					if (error instanceof TypeError)
					{
						console.error('Network error:', error); // AWARIA SERWERA WYPOKU
					} else
					{
						console.error('Other error:', error);
					}
					reject(error);
				});

		});
	}





	// li.more click
	document.addEventListener("click", async function (e)
	{
		if (e.target.closest("div.buttons button.plus"))
		{
			const sectionEntry = e.target.closest("section.entry[id]");
			if (sectionEntry.__vue__?.item?.voted == 1)
			{
				if (settings.addCommentPlusWhenVotingOnEntry && sectionEntry && sectionEntry.__vue__?.item?.resource == "entry") 
				{
					postCommentPlus1ToAPI(sectionEntry);
				}
				else if (settings.addCommentPlusWhenVotingOnComment && sectionEntry && sectionEntry.__vue__?.item?.resource == "entry_comment")
				{
					postCommentPlus1ToAPI(sectionEntry);
				}
			}
		}

		if (e.target.matches("li.more span"))
		{
			e.preventDefault();

			let sectionEntry = e.target.closest("section.entry");
			const entryId = e.target.dataset.entryId;
			const commentId = e.target.dataset.commentId;
			if (dev) console.log(`Wykop XS pobiera listę ${e.target.dataset.votesUp} plusujących`);
			e.target.closest("section.entry-voters").innerHTML = `<span>(Wykop X: wczytywanie ${e.target.dataset.votesUp} plusujących...)</span>`;

			let voters = await fetchAllVotersFromAPI(entryId, commentId);

			appendVotersToEntry(sectionEntry, voters);
			return;
		}

		if (e.target.matches("span.favouriteButton"))
		{
			e.preventDefault();
			if (e.target.dataset.isFavourite == "true")
			{
				if (e.target.dataset.commentId) postFavouriteToAPI(false, "entry_comment", e.target.dataset.commentId);
				else postFavouriteToAPI(false, "entry", e.target.dataset.entryId);
				e.target.parentElement.classList.remove("active");
				e.target.dataset.isFavourite = "false";

			}
			else if (e.target.dataset.isFavourite == "false")
			{
				if (e.target.dataset.commentId) postFavouriteToAPI(true, "entry_comment", e.target.dataset.commentId);
				else postFavouriteToAPI(true, "entry", e.target.dataset.entryId);
				e.target.parentElement.classList.add("active");
				e.target.dataset.isFavourite = "true";
			}
			return;
		}
	}, false);






	/* CSS WYKOP XS MIKROCZAT */
	if (settings?.hideShareButton) CSS += `section.actions ul li.sharing 									{ display: none!important; }`;


	/* Wykop X Style 3.0 */
	CSS += `
		:root
		{
			--kolorBananowy1: rgba(255, 185, 0, 1);
			--tagChannelColor: rgba(0, 183, 255, 1);
			--smallBorderRadius: 4px;
		}
		div[data-modal="entryVoters"] section.entry-voters::after {content: none!important;} /* Wykop X Style PROMO */
	`;

	/* LISTA PLUSUJĄCYCH CSS, PRZYCISK DODAJ DO ULUBIONYCH, fixNotificationBadgeBug*/
	if (settings?.entryVotersListEnable)
	{
		CSS += `
		/* Chrome 109, Firefox 115 */
			@supports not (display: block flex)
			{
				section.entry-voters ul
				{
					display: flex;
				}
			}

			section.entry-voters ul
			{
				display: block flex;
				row-gap: 0px;
				flex-wrap: wrap;
				align-items: baseline;
				padding: 0 0 0 0;
				margin: 0;
				margin-top: 8px;
				list-style-type: none;
				position: relative;
			}

			section.entry-voters ul,
			section.entry-voters > span
			{
				font-size: var(--entryVotersTextFontSize, 12px);
				color: var(--gullGray);
			}

			section.entry-voters ul::before
			{
				content: "Plusujący: ";
				margin-right: 0.2em;
			}

			section.entry-voters ul li.more
			{
				cursor: pointer;
				font-weight: 700;
				text-transform: uppercase;
			}

			section.entry-voters ul li::after
			{
				content: " • ";
				margin: 0px 0.2em 0px 0em;
			}

			section.entry-voters ul li.more::after,
			section.entry-voters ul li:only-child::after
			{ content: none; }

			section.entry-voters ul li a.username span
			{
				font-weight: normal;
			}

			section.entry-voters ul li a.username i 				{ display: none; font-size: 0.8em; font-style: normal; bottom: 0px; position: relative; }
			section.entry-voters ul li a.username i:has(+span) 		{ margin-right: 1px; }
			section.entry-voters ul li a.username i.follow-true,
			section.entry-voters ul li a.username i.blacklist-true,
			section.entry-voters ul li a.username i.banned ,
			section.entry-voters ul li a.username i.suspended,
			section.entry-voters ul li a.username i.removed,
			section.entry-voters ul li a.username i.f-gender,
			section.entry-voters ul li a.username i.m-gender
			{ display: inline flex;} 
			
			
			section.entry-voters ul li a.username i.follow-true::before 										{ content: '🔔'; }
			section.entry-voters ul li a.username i.blacklist-true::before 										{ content: '⛔'; }
			section.entry-voters ul li a.username i.banned::before 												{ content: '🍌'; }
			section.entry-voters ul li a.username i.suspended::before 											{ content: '✖'; }
			section.entry-voters ul li a.username i.removed::before 											{ content: '❌'; }
			section.entry-voters ul li a.username i.f-gender::before 											{ content: '🟣'; font-size: 0.7em; bottom: 3px; }
			
			section.entry-voters ul li:has(a.username) 															{ order: 6; }
			section.entry-voters ul li.more 																	{ order: 100; }
			`;

		if (settings?.votersFollowFirst) CSS += `section.entry-voters ul li:has(a.username.follow-true) 		{ order: 1; }`;
		if (settings?.votersBlackFirst) CSS += `section.entry-voters ul li:has(a.username.burgundy-profile) 	{ order: 3; }`;
		if (settings?.votersOrangeFirst) CSS += `section.entry-voters ul li:has(a.username.orange-profile) 		{ order: 4; }`;
		if (settings?.votersGreenFirst) CSS += `section.entry-voters ul li:has(a.username.green-profile) 		{ order: 5; }`;

		if (settings?.votersBlacklistLast) CSS += `section.entry-voters ul li:has(a.username.blacklist-true) 	{ order: 7; }`;
		if (settings?.votersBannedLast) CSS += `section.entry-voters ul li:has(a.username.banned) 				{ order: 8; }`;
		if (settings?.votersSuspendedLast) CSS += `section.entry-voters ul li:has(a.username.banned) 			{ order: 9; }`;
		if (settings?.votersRemovedLast) CSS += `section.entry-voters ul li:has(a.username.removed) 			{ order: 10; }`;

		if (!settings?.votersColorOrange) CSS += `section.entry-voters ul li a.username.orange-profile 			{ color: var(--gullGray); }`;
		if (!settings?.votersColorGreen) CSS += `section.entry-voters ul li a.username.green-profile 			{ color: var(--gullGray); }`;
		if (!settings?.votersColorBurgundy) CSS += `section.entry-voters ul li a.username.burgundy-profile 		{ color: var(--gullGray); }`;

		CSS += `
			section.entry-voters ul li a.username.banned:not(.removed) span  				{ color: var(--kolorBananowy1); };
			section.entry-voters ul li a.username.suspended:not(.removed) span 				{ color: var(--heather); }
			section.entry-voters ul li a.username.removed span 								{ color: var(--heather); }
			[data-night-mode] section.entry-voters ul li a.username.removed span 			{ background-color: rgba(255, 255, 255, 0.1); padding-left: 5px; padding-right: 5px; }
		`;
	}

	/* ULUBIONE */
	CSS += `
		section.actions > ul > li.favourite 
		{
			cursor: pointer;
			user-select: none;
			color: var(--gullGray);
			font-size: 14px;
			padding-left: 26px;
			transition: color .2s ease, opacity .2s ease;
		}

		.actions li.favourite span::before
		{
			content: '';
			width: 18px;
			height: 18px;
			display: block;
			position: absolute;
			left: 0;
			background: var(--gullGray);
			transition: background .2s ease;

			-webkit-mask-size: 18px 18px;
			mask-size: 18px 18px;
			-webkit-mask: url(/static/img/svg/favourite.svg) no-repeat center;
			mask-image: url(/static/img/svg/favourite.svg);
		}
		
		.actions li.favourite.active span::before 
		{
			background: var(--orange);
			-webkit-mask: url(/static/img/svg/favourite-filled.svg) no-repeat center;
			mask-image: url(/static/img/svg/favourite-filled.svg);
		}
	`;

	/* fixNotificationBadgeBug */
	if (settings.fixNotificationBadgeBug)
	{
		CSS += `
			:root
			{
				/* brak nowych powiadomień */
				--notificationIconWithoutUnreadNotificationsColor:                 rgba(255, 255, 255, 0.2);   /* ikonka powiadomienia ✉ 🕭 #, jesli nie ma nowych powiadomien  */
				--notificationIconWithoutUnreadNotificationsBackgroundColor:       rgba(0, 0, 0, 0);           /* tło powiadomienia ✉ 🕭 #, jesli nie ma nowych powiadomien     */
				--notificationIconWithoutUnreadNotificationsHoverColor:            rgba(255, 255, 255, 0.8);
				--notificationIconWithoutUnreadNotificationsHoverBackgroundColor:  rgba(255, 255, 255, 0.3);
				--notificationIconWithoutUnreadNotificationsActiveColor:           rgba(255, 255, 255, 0.4);
				--notificationIconWithoutUnreadNotificationsActiveBackgroundColor: rgba(255, 255, 255, 0.2);
			}

    		/* naprawienie błędu: Wykop wyswietla w badge liczbe nieprzeczytanych powiadomien, gdy wszystkie powiadomienia sa juz przeczytane */
			
			/* ukrycie badge z liczbą powiadomien jeśli wszystkie powiadomienia w okienku są przeczytane */
			body > section:not(.is-mobile) > header.header div.right > nav ul li.notifications:not(:has( > section.dropdown-body > section.notifications 	> section.stream > div.content > section.notify:not(.read))) > a:after,
			body > section:not(.is-mobile) > header.header div.right > nav ul li.notifications:not(:has( > section.dropdown-body > section.notifications 	> section.stream > div.content > section.notify:not(.read))) > a:before,
			body > section:not(.is-mobile) > header.header div.right > nav ul li.pm:not(:has(            > section.dropdown-body 						    > section.stream > div.content > section.item.unread))       > a.new:after,
			body > section:not(.is-mobile) > header.header div.right > nav ul li.pm:not(:has(            > section.dropdown-body 							> section.stream > div.content > section.item.unread))       > a.new:before
			{ 
				display: none!important;
			}
			/* naprawienie kolorów ikonek - brak nieprzeczytanych */
			body > section:not(.is-mobile) > header.header div.right > nav ul li.notifications:not(:has( > section.dropdown-body > section.notifications    > section.stream > div.content > section.notify:not(.read))) > a > div.svg-inline > svg,
			body > section:not(.is-mobile) > header.header div.right > nav ul li.pm:not(:has(            > section.dropdown-body 							> section.stream > div.content > section.item.unread))       > a > div.svg-inline > svg
			{
				fill: var(--notificationIconWithoutUnreadNotificationsColor) !important;
			} 
			body > section:not(.is-mobile) > header.header div.right > nav ul li.notifications:not(:has( > section.dropdown-body > section.notifications    > section.stream > div.content > section.notify:not(.read))) > a,
			body > section:not(.is-mobile) > header.header div.right > nav ul li.pm:not(:has(            > section.dropdown-body 							> section.stream > div.content > section.item.unread))       > a
			{
				background-color: var(--notificationIconWithoutUnreadNotificationsBackgroundColor) !important;
			} 
			/* :hover */
			body > section:not(.is-mobile) > header.header div.right > nav ul li.notifications:not(:has( > section.dropdown-body > section.notifications    > section.stream > div.content > section.notify:not(.read))) > a:hover > div.svg-inline > svg,
			body > section:not(.is-mobile) > header.header div.right > nav ul li.pm:not(:has(            > section.dropdown-body 							> section.stream > div.content > section.item.unread))       > a:hover > div.svg-inline > svg
			{
				fill: var(--notificationIconWithoutUnreadNotificationsHoverColor) !important;
			} 
			body > section:not(.is-mobile) > header.header div.right > nav ul li.notifications:not(:has( > section.dropdown-body > section.notifications    > section.stream > div.content > section.notify:not(.read))) > a:hover,
			body > section:not(.is-mobile) > header.header div.right > nav ul li.pm:not(:has(            > section.dropdown-body 							> section.stream > div.content > section.item.unread))       > a:hover
			{
				background-color: var(--notificationIconWithoutUnreadNotificationsHoverBackgroundColor) !important;
			} 
			/* otwarte menu */
			body > section:not(.is-mobile) > header.header div.right > nav ul li.notifications.dropdown.active:not(:has( > section.dropdown-body > section.notifications > section.stream > div.content > section.notify:not(.read))) > a > div.svg-inline > svg,
			body > section:not(.is-mobile) > header.header div.right > nav ul li.pm.dropdown.active:not(:has(            > section.dropdown-body                         > section.stream > div.content > section.item.unread))       > a > div.svg-inline > svg
			{
				fill: var(--notificationIconWithoutUnreadNotificationsActiveColor) !important;
			} 
			body > section:not(.is-mobile) > header.header div.right > nav ul li.notifications.dropdown.active:not(:has( > section.dropdown-body > section.notifications > section.stream > div.content > section.notify:not(.read))) > a,
			body > section:not(.is-mobile) > header.header div.right > nav ul li.pm.dropdown.active:not(:has(            > section.dropdown-body                         > section.stream > div.content > section.item.unread))       > a
			{
				background-color: var(--notificationIconWithoutUnreadNotificationsActiveBackgroundColor) !important;
			} 
		`;
	}

	/* HIDE ADS ALWAYS */
	if (settings.hideAds) { CSS += `.pub-slot-wrapper { display: none!important; }`; }

	/* HIDE WYKOP XS PROMO FROM STYLUS */
	CSS += `.wykopxs, body div.main-content[class] section > section.sidebar::after  { display: none!important; }`;

	styleElement.textContent = CSS;
	document.head.appendChild(styleElement);
})();




