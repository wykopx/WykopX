// ==UserScript==
// @name        Wykop XS DEV
// @name:pl     Wykop XS DEV
// @name:en     Wykop XS DEV
// @version     2.45.3


// @author      Wykop X <wykopx@gmail.com>
// @namespace   Violentmonkey Scripts
// @match       https://wykop.pl/*


// @supportURL  		http://wykop.pl/tag/wykopwnowymstylu
// @contributionURL  	https://buycoffee.to/wykopx


// @description Wykop XS służy do wspomagania działania stylu "Wykop X Style", który jest wymagany do poprawnego działania niniejszego skryptu. Wykop X Style znajdziesz na: http://style.wykopx.pl
// @description:en Wykop XS is a helper script for userstyle "Wykop X Style" which modifies wykop.pl website and make it easier to use adding enhancements and new features. Check it out here: http://style.wykopx.pl


// @compatible  chrome, firefox, opera, safari, edge
// @license     No License



// @require https://unpkg.com/xhook@latest/dist/xhook.min.js
// @require https://greasyfork.org/scripts/458629-depaginator-for-wykop-pl/code/Depaginator%20for%20Wykoppl.user.js
// @require https://unpkg.com/localforage@1.10.0/dist/localforage.min.js
// @require https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require https://greasyfork.org/scripts/383527-wait-for-key-elements/code/Wait_for_key_elements.js?version=701631


// ==/UserScript==

(async function ()
{
	'use strict';

	const currentVersion = "2.45.0";
	const dev = true;
	const promoString = " [Dodane przez Wykop XS #wykopwnowymstylu]";

	// user.username - nazwa zalogowanego uzytkownika

	let user = {
		data: null,
		username: null
	};


	let wykopxStorageMirkoukrywacz = localforage.createInstance({
		driver: localforage.LOCALSTORAGE,
		name: "wykopx",
		storeName: "mirkoukrywacz",
	});

	let wykopxStorageNotatkowator = localforage.createInstance({
		driver: localforage.LOCALSTORAGE,
		name: "wykopx",
		storeName: "notatkowator",
	});

	let wykopxStorageObservedTags = localforage.createInstance({
		driver: localforage.LOCALSTORAGE,
		name: "wykopx",
		storeName: "observedTags",
	});


	// getComputedStyle(document.documentElement) -- nie działa, nie wczytuje właściwości z :root
	let wykopxSettings = getComputedStyle(document.querySelector("body"));
	let settings = {};

	// boolean - domyslnie WŁĄCZONE bez Wykop X Style
	settings.hitsInTopNavJS = wykopxSettings.getPropertyValue("--hitsInTopNavJS") ? wykopxSettings.getPropertyValue("--hitsInTopNavJS") === '1' : true;
	settings.quickLinksEnable = wykopxSettings.getPropertyValue("--quickLinksEnable") ? wykopxSettings.getPropertyValue("--quickLinksEnable") === '1' : true;
	settings.myWykopInTopNavJS = wykopxSettings.getPropertyValue("--myWykopInTopNavJS") ? wykopxSettings.getPropertyValue("--myWykopInTopNavJS") === '1' : true;
	settings.favoritesInTopNavJS = wykopxSettings.getPropertyValue("--favoritesInTopNavJS") ? wykopxSettings.getPropertyValue("--favoritesInTopNavJS") === '1' : true;
	settings.imageUploaderEnable = wykopxSettings.getPropertyValue("--imageUploaderEnable") ? wykopxSettings.getPropertyValue("--imageUploaderEnable") === '1' : true;
	settings.addNewLinkInTopNavJS = wykopxSettings.getPropertyValue("--addNewLinkInTopNavJS") ? wykopxSettings.getPropertyValue("--addNewLinkInTopNavJS") === '1' : true;
	settings.addNewEntryInTopNavJS = wykopxSettings.getPropertyValue("--addNewEntryInTopNavJS") ? wykopxSettings.getPropertyValue("--addNewEntryInTopNavJS") === '1' : false; // default false
	settings.disableNewLinkEditorPastedTextLimit = wykopxSettings.getPropertyValue("--disableNewLinkEditorPastedTextLimit") ? wykopxSettings.getPropertyValue("--disableNewLinkEditorPastedTextLimit") === '1' : true;

	settings.enableNotatkowator = wykopxSettings.getPropertyValue("--enableNotatkowator") ? wykopxSettings.getPropertyValue("--favoritesInTopNavJS") === '1' : true;


	// boolean
	settings.votingExplosion = (wykopxSettings.getPropertyValue("--votingExplosion") == `"true"`); // boolean
	settings.tabTitleEnabled = (wykopxSettings.getPropertyValue("--tabTitleEnabled") == `"true"`); // boolean
	settings.tabFaviconEnabled = (wykopxSettings.getPropertyValue("--tabFaviconEnabled") == `"true"`); // boolean
	settings.tagHeaderEditable = (wykopxSettings.getPropertyValue("--tagHeaderEditable") == `"true"`); // boolean
	settings.linksAnalyzerEnable = (wykopxSettings.getPropertyValue("--linksAnalyzerEnable") == `"true"`); // boolean
	settings.tabTitleRemoveWykopPL = (wykopxSettings.getPropertyValue("--tabTitleRemoveWykopPL") == `"true"`); // boolean
	settings.tabChangeOnlyOnHiddenState = (wykopxSettings.getPropertyValue("--tabChangeOnlyOnHiddenState") == `"true"`); // boolean
	settings.showObservedTagsAlphabetically = (wykopxSettings.getPropertyValue("--showObservedTagsAlphabetically") == `"true"`); // boolean
	settings.showObservedTagsInRightSidebar = (wykopxSettings.getPropertyValue("--showObservedTagsInRightSidebar") == `"true"`); // boolean
	settings.fixCaseSensitiveTagsRedirection = (wykopxSettings.getPropertyValue("--fixCaseSensitiveTagsRedirection") == `"true"`); // boolean
	settings.tabTitleShowNotificationsEnabled = (wykopxSettings.getPropertyValue("--tabTitleShowNotificationsEnabled") == `"true"`); // boolean
	settings.tabTitleShowNotificationsCountPM = (wykopxSettings.getPropertyValue("--tabTitleShowNotificationsCountPM") == `"true"`); // boolean
	settings.tabTitleShowNotificationsCountEntries = (wykopxSettings.getPropertyValue("--tabTitleShowNotificationsCountEntries") == `"true"`); // boolean
	settings.tabTitleShowNotificationsCountSeparated = (wykopxSettings.getPropertyValue("--tabTitleShowNotificationsCountSeparated") == `"true"`); // boolean
	settings.tabTitleShowNotificationsCountTagsNewLink = (wykopxSettings.getPropertyValue("--tabTitleShowNotificationsCountTagsNewLink") == `"true"`); // boolean
	settings.tabTitleShowNotificationsCountTagsNewEntry = (wykopxSettings.getPropertyValue("--tabTitleShowNotificationsCountTagsNewEntry") == `"true"`); // boolean

	// numbers
	settings.notatkowatorUpdateInterval = parseFloat(wykopxSettings.getPropertyValue("--notatkowatorUpdateInterval")); // number
	settings.homepagePinnedEntriesHideBelowLimit = parseFloat(wykopxSettings.getPropertyValue("--homepagePinnedEntriesHideBelowLimit")); // number
	settings.showObservedTagsInRightSidebarUpdateInterval = parseFloat(wykopxSettings.getPropertyValue("--showObservedTagsInRightSidebarUpdateInterval")); // number




	// strings
	settings.version = (wykopxSettings.getPropertyValue("--version").trim().slice(1, -1)); 	// 2.40 string slice usuwa ""
	settings.versor = (wykopxSettings.getPropertyValue("--versor").trim().slice(1, -1)); 	// "Style 2.42"
	settings.xblocker = (wykopxSettings.getPropertyValue("--xblocker").trim());


	settings.linksAnalyzerSortBy = wykopxSettings.getPropertyValue("--linksAnalyzerSortBy").trim();

	settings.tabTitleSelect = wykopxSettings.getPropertyValue("--tabTitleSelect").trim();
	settings.tabTitleCustom = wykopxSettings.getPropertyValue("--tabTitleCustom").trim();
	settings.tabFaviconSelect = wykopxSettings.getPropertyValue("--tabFaviconSelect").trim();



	if (dev) consoleX("Settings: ", 1);
	if (dev) console.log(settings);

	// przenoszenie na tagi:                              wykop.pl/#heheszki
	// i na profile użytkownikow:                         wykop.pl/@m__b
	// wyszukiwanie wpisów danej osoby w konkretnym tagu  wykop.pl/@m__b/#internet   albo  wykop.pl/#internet/@m__b/

	let hash = new URL(document.URL).hash;
	let pathname = new URL(document.URL).pathname;
	let pathnameArray = pathname.split("/");
	/*

		['', 'wpis', '74111643', 'dobranoc-panstwu']
		['', 'wykopalisko']
		['', 'link', '7303053', 'braun-gasi-chanuke-gasnica-mem']

	*/
	function hashAndPathNameLoad()
	{
		hash = new URL(document.URL).hash;
		pathname = new URL(document.URL).pathname;
		pathnameArray = pathname.split("/");
		consoleX(`hashAndPathNameLoad() - hash: ${hash}, pathname: ${pathname}, pathnameArray: `, 1)
		console.log(pathnameArray)
	}



	(async () =>
	{
		consoleX("(async () => {", 1);

		let at, tag;
		if (settings.fixCaseSensitiveTagsRedirection)
		{
			/* fixing case sensitive tags https://github.com/wykopx/WykopX/issues/21 */
			if (pathnameArray[1] == "tag" && /[A-Z]/.test(pathnameArray[2]))
			{
				consoleX(`Błędny tag "${pathnameArray[2]}"`);
				pathnameArray[2] = pathnameArray[2].toLowerCase();
				let newPathname = "https://wykop.pl" + pathnameArray.join("/");
				consoleX(`Otwieram poprawny adres: ${newPathname}`);
				window.location.replace(newPathname);
			}
		}

		// # przekierowanie URL http://wykop.pl/#heheszki albo http://wykop.pl/#wykop/@m__b
		if (hash.length > 0)
		{
			let tagWithHash = hash.split("/")[0];
			let tagWithoutHash = tagWithHash.slice(1);
			let tagNumber = Number.parseInt(tagWithoutHash);

			if (tagWithoutHash.length > 1 && (tagNumber == "NaN" || tagWithoutHash.length < 9) && tagWithoutHash != "dodaj")
			{
				if ((tag = getTagFromUrl(tagWithHash))) { }
				if ((at = getUserFromUrl(hash))) { }
			}
		}

		// @ przekierowanie URL http://wykop.pl/@NadiaFrance albo http://wykop.pl/#wykop/@m__b
		if (pathnameArray[1] !== "szukaj" && pathname.length > 2)
		{
			if (at || (at = getUserFromUrl(pathname))) { }
		}

		if (at || tag) smartRedirectBasedOnUserAndTag(at, tag);

	})();








	function redirectToSearchUserEntriesInTag(user, tag)
	{
		window.location.replace(`https://wykop.pl/szukaj/wszystkie/@${user}?tags=${tag}`);
	}

	function redirectToTag(tag)
	{
		window.location.replace(`https://go.wykopx.pl/#${tag}`);
	}

	function redirectToUser(user)
	{
		window.location.replace(`https://wykopx.pl/@${user}`);
	}

	function smartRedirectBasedOnUserAndTag(user, tag)
	{
		consoleX(`Wprowadzono: tag #${tag}, user @${user}`, 1);

		if (tag && user) redirectToSearchUserEntriesInTag(user, tag)
		else if (tag) redirectToTag(tag)
		else if (user) redirectToUser(user)
	}
	// returns 'tag' from /#tag in string
	function getTagFromUrl(url, splitSeparator = "/", tagSymbol = "#")
	{
		let tagArray = url.split(splitSeparator);
		for (let element of tagArray)
		{
			if (element.charAt(0) == "#" || element.charAt(0) == tagSymbol)
			{
				element = element.slice(1);
				return element;
			} else if (tagSymbol == "" && (/^[0-9a-zA-Z]/i.test(element.charAt(0))))
			{
				return element;
			} else
			{
				continue;
			}
		}
		return false;
	}

	function getUserFromUrl(url, splitSeparator = "/", userSymbol = "@")
	{
		let atArray = url.split(splitSeparator);
		for (let element of atArray)
		{
			if (element.charAt(0) == userSymbol)
			{
				return element.slice(1);
			}
		}
		return false;
	}










	/* LENNY FACE */
	// waitForKeyElements("section.editor", editorAddLennyFace, false);
	/*
	function editorAddLennyFace(jNode) {
	
		$("section.editor > div.content > textarea", "body").on("focus", function (e) {
			//$(this).val("");
			//$(this).text("");
			$(this).html("");
			consoleX($(this).val())
		})
	
		let lennyFaceHtml = `<div class="wykopx_lenny_face_row">`;
	
		let lennyArray = [
			`( ͡° ͜ʖ ͡°)`,
			`( ͡° ʖ̯ ͡°)`,
			`( ͡º ͜ʖ͡º)`,
			`( ͡°( ͡° ͜ʖ( ͡° ͜ʖ ͡°)ʖ ͡°) ͡°)`,
			`(⌐ ͡■ ͜ʖ ͡■)`,
			`(╥﹏╥)`,
			`(╯︵╰,)`,
			`(ʘ‿ʘ)`,
			`(｡◕‿‿◕｡)`,
			`ᕙ(⇀‸↼‶)ᕗ`,
			`ᕦ(òóˇ)ᕤ`,
			`(✌ ﾟ ∀ ﾟ)☞`,
			`ʕ•ᴥ•ʔ`,
			`ᶘᵒᴥᵒᶅ`,
			`(⌒(oo)⌒)`
		]
		lennyArray.forEach(function (lenny) {
			lennyFaceHtml += `<button title="${ lenny } Lenny Face " class="wykopx_lenny_face_button" data-insert="${ lenny }">${ lenny }</button>`;
		});
	
		lennyFaceHtml += `</div>`;
		$(lennyFaceHtml).appendTo("section.editor > header");
	
		$("section.editor > header button.wykopx_lenny_face_button").on("click", function (e) {
			e.preventDefault();
			let x = $(this).parent().parent().parent().find("div.content > textarea").css("opacity", "1");
			let textarea = document.querySelector(`div.content textarea`)
			let selectionStart = textarea.selectionStart;
			let textareaValue = $(textarea).val();
			textareaValueWithLenny = textareaValue.slice(0, selectionStart) + $(this).data("insert") + textareaValue.slice(selectionStart);
			$(textarea).attr("data-value", textareaValueWithLenny);
			$(textarea).html(textareaValueWithLenny);
			textarea.innerText = textareaValueWithLenny;
		});
	}
	*/










	/* QUICK SEARCH */

	/* Edytuj nagłówek tagu, aby przejść na inny tag */

	function tagHeaderEditableLoad()
	{
		// consoleX("tagHeaderEditableLoad()", 1)
		if (settings.tagHeaderEditable && pathnameArray[1] == "tag")
		{
			waitForKeyElements(".main-content .main aside.tag-top .content header h1", tagHeaderEditable, false);
		}
	}

	function tagHeaderEditable(jNode)
	{
		consoleX("tagHeaderEditable(jNode)", 1)

		let tagHeaderEditable = jNode[0];
		let originalValue = tagHeaderEditable.textContent.toLowerCase();
		tagHeaderEditable.contentEditable = "true";
		tagHeaderEditable.className = "wykopx_quick_search";
		tagHeaderEditable.setAttribute("data-wykopx-original-value", originalValue);

		let wykopx_quick_search = document.querySelector(".wykopx_quick_search");
		if (originalValue != "") 
		{
			wykopx_quick_search.value = originalValue;
			wykopx_quick_search.dispatchEvent(new Event('change'));
			wykopx_quick_search.setAttribute("data-wykopx-original-value", originalValue);
		}
		wykopx_quick_search.addEventListener("blur", eventInsertedTagOrUser);
		wykopx_quick_search.addEventListener("keydown", eventInsertedTagOrUser);
	}

	waitForKeyElements("input.wykopx_quick_search", wykopx_quick_search, false);

	function wykopx_quick_search(jNodeWykopxQuickSearch)
	{
		const wykopxQuickSearch = jNodeWykopxQuickSearch[0];
		wykopxQuickSearch.addEventListener("blur", eventInsertedTagOrUser);
		wykopxQuickSearch.addEventListener("keydown", eventInsertedTagOrUser);
	}

	function eventInsertedTagOrUser(e)
	{
		if (e.type === "blur" || (e.type === "keydown" && e.keyCode == 13)) // out of focus or enter
		{
			consoleX("blur keydown .wykopx_quick_search");
			e.preventDefault();

			console.log("Type of the element: " + e.target.tagName);
			let editedValue;
			if (e.target.tagName == "INPUT") editedValue = e.target.value.toLowerCase();
			else if (e.target.tagName == "H1") editedValue = e.target.textContent.toLowerCase();

			if (editedValue != e.target.getAttribute("data-wykopx-original-value"))
			{
				smartRedirectBasedOnUserAndTag(getUserFromUrl(editedValue, " "), getTagFromUrl(editedValue, " ", ""));
			}
		}
	}



	function addQuickLinksToNavBar()
	{
		if (settings.quickLinksEnable == true)
		{
			let wxs_quick_links = document.getElementById("wxs_quick_links");
			if (wxs_quick_links == null)
			{
				wxs_quick_links = document.createElement('div');
				wxs_quick_links.id = "wxs_quick_links";
				// wxs_quick_links.classList.add("wykopxs"); // nie dodajemy bo domyslnie wlaczone

				wxs_quick_links.innerHTML = `

		<nav class="home">
			<section>
				<span>
					<a href="/" target="_self">Główna</a>
				</span>
				<div>
					<a href="/najnowsze" target="_self">Najnowsze</a>
					<a href="/aktywne" target="_self">Aktywne</a>
				</div>
			</section>

			<section>
				<span>
					<a href="/hity" target="_self">Hity</a>
				</span>
				<div>
					<a href="/hity/dnia" target="_self">Dnia</a>
					<a href="/hity/tygodnia" target="_self">Tygodnia</a>
					<a href="/hity/miesiaca" target="_self">Miesiąca</a>
					<a href="/hity/roku" target="_self">Roku</a>
				</div>
			</section>

			<section>
				<span>Ulubione</span>
				<div>
					<a href="/ulubione/znaleziska" target="_self">Znaleziska</a>
					<a href="/ulubione/komentarze-znaleziska" target="_self">Komentarze do znalezisk</a>
				</div>
			</section>
		</nav>
		
		<nav class="upcoming">
			<section>
				<span>Dodaj</span>
				<div>
					<a href="/dodaj-link" target="_self">Nowe znalezisko</a>
				</div>
			</section>
			<section>
				<span>Wykopalisko</span>
				<div>
					<a href="/wykopalisko/najnowsze" target="_self">Najnowsze</a>
					<a href="/wykopalisko/aktywne" target="_self">Aktywne</a>
					<a href="/wykopalisko/wykopywane" target="_self">Wykopywane</a>
					<a href="/wykopalisko/komentowane" target="_self">Komentowane</a>
				</div>
			</section>

			<section>
				<span>Ulubione</span>
				<div>
					<a href="/ulubione/znaleziska" target="_self">Znaleziska</a>
					<a href="/ulubione/komentarze-znaleziska" target="_self">Komentarze do znalezisk</a>
				</div>
			</section>
		</nav>

		<nav class="hits">
			<section>
				<span>Hity</span>
				<div>
					<a href="/hity/dnia" target="_self">Dnia</a>
					<a href="/hity/tygodnia" target="_self">Tygodnia</a>
					<a href="/hity/miesiaca" target="_self">Miesiąca</a>
					<a href="/hity/roku" target="_self">Roku</a>
				</div>
			</section>
		</nav>


		<nav class="microblog">
			<section>
				<span>Dodaj</span>
				<div>
				<a href="/mikroblog/#dodaj" target="_self">Nowy wpis na Mirko</a>
				</div>
			</section>

			<section>
				<span>Mikroblog</span>
				<div>
					<a href="/mikroblog/najnowsze" target="_self">Najnowsze</a>
					<a href="/mikroblog/aktywne" target="_self">Aktywne</a>
				</div>
			</section>

			<section>
				<span>
					<a href="/mikroblog/gorace" target="_self">Gorące</a>
				</span>
				<div>
					<a href="/mikroblog/gorace/2" class="wxs_quicklink_short" target="_self">2h</a>
					<a href="/mikroblog/gorace/6" class="wxs_quicklink_short" target="_self">6h</a>
					<a href="/mikroblog/gorace/12" class="wxs_quicklink_short" target="_self">12h</a>
					<a href="/mikroblog/gorace/24" class="wxs_quicklink_short" target="_self">24h</a>
				</div>
			</section>

			<section>
				<span>Ulubione</span>
				<div>
					<a href="/ulubione/wpisy" target="_self">Wpisy</a>
					<a href="/ulubione/komentarze-wpisy" target="_self">Komentarze do wpisów</a>
				</div>
			</section>
		</nav>

		<nav class="mywykop">
			<section>
				<span>Mój Wykop</span>
				<div>
					<a href="/obserwowane/" target="_self">Wszystko</a>
					<a href="/obserwowane/tagi" target="_self">#Tagi</a>
					<a href="/obserwowane/profile" target="_self">@Profile</a>
				</div>
			</section>

			<section>
				<span>Mój profil</span>
				<div>
					<a href="/ludzie/${user.username}/wpisy/dodane" target="_self">Dodane wpisy</a>
					<a href="/ludzie/${user.username}/wpisy/komentowane" target="_self">Komentowane wpisy</a>
					<a href="/ludzie/${user.username}/wpisy/plusowane" target="_self">Zaplusowane</a>
				</div>
			</section>
		</nav>

		<nav class="favorites">
			<section>
				<span>Ulubione</span>
				<div>
					<a href="/ulubione" target="_self">Wszystko</a>
					<a href="/ulubione/znaleziska" target="_self">Znaleziska</a>
					<a href="/ulubione/komentarze-znaleziska" target="_self">Komentarze do znalezisk</a>
					<a href="/ulubione/wpisy" target="_self">Wpisy</a>
					<a href="/ulubione/komentarze-wpisy" target="_self">Komentarze do wpisów</a>
				</div>
			</section>
		</nav>

		<nav class="profile_links">
			<section>
				<span>Mój profil</span>
				<div>
					<a href="/ludzie/${user.username}" target="_self">Profil</a>
					<a href="/ludzie/${user.username}/znaleziska/dodane" target="_self">Dodane znaleziska</a>
					<a href="/ludzie/${user.username}/znaleziska/komentowane" target="_self">Komentowane znaleziska</a>
					<a href="/ludzie/${user.username}/znaleziska/wykopane" target="_self">Wykopane</a>
					<a href="/ludzie/${user.username}/znaleziska/zakopane" target="_self">Zakopane</a>
				</div>
			</section>
		</nav>

		<nav class="profile_entries">
			<section>
				<span>Mój profil</span>
				<div>
					<a href="/ludzie/${user.username}/wpisy/dodane" target="_self">Dodane wpisy</a>
					<a href="/ludzie/${user.username}/wpisy/komentowane" target="_self">Komentowane wpisy</a>
					<a href="/ludzie/${user.username}/wpisy/plusowane" target="_self">Zaplusowane</a>
				</div>
			</section>
		</nav>

		<nav class="profile_observed">
			<section>
				<span>Mój profil</span>
				<div>
					<a href="/ludzie/${user.username}/obserwowane/profile" target="_self">Obserwowani @użytkownicy</a>
					<a href="/ludzie/${user.username}/obserwowane/tagi" target="_self">Obserwowane #tagi</a>
				</div>
			</section>
		</nav>

		<nav class="add_new">
			<section>
				<span>Dodaj</span>
				<div>
					<a href="/dodaj-link" target="_self">Nowe znalezisko</a>
					<a href="/mikroblog/#dodaj" target="_self">Nowy wpis na Mirko</a>
				</div>
			</section>
		</nav>

		`;
				document.querySelector('body > section > header.header > div.left').appendChild(wxs_quick_links);
			}
		}

	}



	/* RIGHT SIDEBAR - DODAJ LISTE OBSERWOWANYCH TAGÓW */
	function addObservedTagsToRightSidebar()
	{
		let observedTagsArray = [];

		if (settings.showObservedTagsInRightSidebar)
		{
			// consoleX("addObservedTagsToRightSidebar()", 1)

			checkLocalForageupdatedDate(wykopxStorageObservedTags, getObservedTags, settings.showObservedTagsInRightSidebarUpdateInterval * 3600);

			let section_html = `
				<section class="wykopxs wykopx_your_observed_tags custom-sidebar tags-sidebar" data-v-3f88526c="" data-v-89888658="" data-v-5d67dfc3="">
					<header data-v-3f88526c="">
						<h4 data-v-3f88526c="">Przejdź na #tag lub @profil</h4>
					</header>
					<div class="content wykopx_quick_search_container" data-v-3f88526c="">
						<input type="text" class="wykopx_quick_search" placeholder="#wykopwnowymstylu" title="${promoString}" />
					</div>
					<header data-v-3f88526c="">
						<h4 data-v-3f88526c="">Twoje obserwowane tagi</h4>
					</header>
					<div class="content" data-v-3f88526c="">
						<section class="tags" data-v-89888658="" data-v-3f88526c="" >
							<ul data-v-89888658="" data-v-3f88526c="">`;

			wykopxStorageObservedTags.iterate(function (value, key, iterationNumber)
			{
				if (key != "storageUpdatedDate")
				{
					observedTagsArray.push(value)
				}
			})
				.then(function ()
				{
					if (settings.showObservedTagsAlphabetically)
					{
						observedTagsArray.sort(); // sortowanie alfabetyczne tagów
					}
					observedTagsArray.forEach(function (tag)
					{
						section_html += `
						<li data-v-89888658="" data-v-3f88526c="" title="Przejdź na tag #${tag}  ${promoString}">
							<span data-v-89888658="" data-v-3f88526c="">#</span><a data-v-89888658="" href="https://go.wykopx.pl/#${tag}" class="hybrid" data-v-3f88526c="">${tag}</a>
						</li>`;
					});

					section_html += `</ul>
							</section>
						</div>
					</section>`;
					// $(section_html).insertBefore(`section.sidebar > section:first-child`);
					document.querySelector(`section.sidebar`).insertAdjacentHTML('beforeend', section_html);
				})
				.catch(function (err) { });
		}
	}


	async function checkLocalForageupdatedDate(wykopxStorageName, updateStorageFunction, updateIntervalSeconds)
	{
		consoleX("checkLocalForageupdatedDate", 1)
		try
		{
			let storageUpdatedDate = await wykopxStorageName.getItem("storageUpdatedDate");
			if (storageUpdatedDate == null)
			{
				consoleX("Selected info wasn't downloaded. Updating now...", 1)
				updateStorageFunction();
			} else
			{
				const date1 = dayjs()
				const date2 = dayjs(storageUpdatedDate)
				if (date1.diff(date2, "second") > parseFloat(updateIntervalSeconds))
				{
					consoleX(`Update interval: ${date1.diff(date2, "second")}s > ${updateIntervalSeconds}s`, 1)
					updateStorageFunction();
				}
			}
		} catch (err)
		{
			console.log(err);
		}
	}

	async function getObservedTags()
	{
		const apiGetObservedTags = `https://wykop.pl/api/v3/profile/users/${user.username}/observed/tags`;
		consoleX(`async function getObservedTags(${user.username}`, 1);

		await fetch(apiGetObservedTags, {
			method: "GET", // or 'PUT'
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + window.localStorage.token,
			},
		})
			.then((response) => response.json())
			.then((observedTagsJson) =>
			{
				if (dev) console.log(observedTagsJson)
				const observedTagsArray = observedTagsJson.data;

				wykopxStorageObservedTags.setItem("storageUpdatedDate", dayjs())

				observedTagsArray.forEach(function (tag)
				{
					wykopxStorageObservedTags.setItem(tag.name, tag.name)
						.then(function (value)
						{
							consoleX(`Zapisano do LocalStorage Twój obserwowany tag: #${tag.name}"`);
						})
						.catch(function (err)
						{
							consoleX(`getObservedTags = error: ` + err);
						});
				});
				return true;
			});
	}
































	function addActionBoxesToAllEntriesAndComments()
	{
		// consoleX("addActionBoxesToAllEntriesAndComments()", 1)
		$("section.entry").each(function ()
		{
			addWykopXActionBoxToEntryAndComment($(this))
		})
	}



	async function addWykopXActionBoxToEntryAndComment(jNode)
	{
		// consoleX(`addWykopXActionBoxToEntryAndComment(jNode)`, 1);
		// if (dev) console.log(jNode);



		if (settings.enableNotatkowator)
		{
			var elements = document.querySelectorAll(".wykopx_action_box_usernote");
			elements.forEach(function (element)
			{
				element.parentNode.removeChild(element);
			});

			const comment_id = jNode.context.id.replace("comment-", "");
			const $entry_object = $(`#comment-${comment_id}`);
			const comment_username = $entry_object.find("> article > header > div.left > a.avatar > span").text();


			if (comment_username.length > 0)
			{
				let usernoteObject = wykopxStorageNotatkowator.getItem(comment_username);
				try
				{
					usernoteObject = await wykopxStorageNotatkowator.getItem(comment_username);
					// usernoteObject == "" -> Notatkowator do wersji 2.14 zapisywał tylko notatkę, bez daty
					if (usernoteObject == null || usernoteObject == "")
					{
						// brak notatki o tym użytkowniku w localforage więc pobieramy z serwera Wykopu
						// console.log(`Brak notatki o użytkowniku ${ comment_username }. Sprawdzam na serwerze. Wywołuję getUserNotes( ${ comment_username }, ${ comment_id })`)
						getUserNotes(comment_username, comment_id);
					}
					else
					{
						const date1 = dayjs();
						const date2 = dayjs(usernoteObject.lastUpdate);

						// consoleX(`Update interval: ${date1.diff(date2, "second")}s <?> ${settings.notatkowatorUpdateInterval * 3600}s`, 1)

						if (date1.diff(date2, "second") > parseFloat(settings.notatkowatorUpdateInterval * 3600))
						{
							getUserNotes(comment_username, comment_id);
						}
						else
						{
							// consoleX(`Notatkowator wczytał notatkę z LocalStorage. Użytkownik: @${ comment_username }. Notatka: "${ usernote }"`);
							displayUserNote(comment_username, usernoteObject.usernote, comment_id)
						}
					}
				} catch (err)
				{
					console.log(err);
				}
			}
		}









		//   console.log("comment_id: " + comment_id);
		//   console.log("$entry_object: ");
		//   console.log($entry_object);
		//   console.log("comment_username: " + comment_username);

		// let html = `<div class="wykopxs wykopx_action_box"
		//                  id="wykopx_action_box-${ comment_id }"
		//                  data-username="${ comment_username }"
		//                  data-comment-id="${ comment_id }"
		//                  data-base-uri="${ jNode.context.baseURI }"
		//                  data-entry-type="entry-subcomment"
		//                  data-parent-comment-id="123456789"
		//                  data-grandparent-comment-id="123456789">
		//   <div class="wykopx_action_box_username">${ comment_username }</div>
		// </div>`;
		//jNode.find("> article > header").after(html);
	}


	// NOTATKOWATOR 2000

	async function displayUserNote(username, usernote, comment_id)
	{
		if (usernote.length > 0)
		{
			$(`section#comment-${comment_id} > article > header`).after(`<div class="wykopxs wykopx_action_box_usernote">Twoja notatka do <strong>${username}</strong> : <var>${usernote}</var></div>`);
		}
	}

	const apiGetNotes = "https://wykop.pl/api/v3/notes/";
	async function getUserNotes(username, comment_id)
	{
		// consoleX(`async function getUserNotes(${username}, ${comment_id})`, 1);

		const response = await fetch(apiGetNotes + username, {
			method: "GET", // or 'PUT'
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer " + window.localStorage.token,
			},
		})
			.then((response) => response.json())
			.then((user) =>
			{
				const usernote = user.data.content;
				wykopxStorageNotatkowator.setItem(username, { usernote: usernote, lastUpdate: dayjs() })
					.then(function (value)
					{
						// consoleX(`Notatkowator zapisał notatkę o użytkowniku @${ username }: "${ usernote }"`);
						displayUserNote(username, usernote, comment_id)

					})
					.catch(function (err)
					{
						consoleX(`Notatkowator = error: ` + err);
					});
				return usernote;
			});
	}












	function mirkoukrywaczAddButtons(jNode)
	{
		// if (dev) consoleX("mirkoukrywaczAddButtons(jNode)", 1);

		mirkoukrywaczHideAllBlockedElements();

		let html = `<button class="wykopxs hideThisShit" title="Wykop X - Mirkoukrywacz - Ukryj to na zawsze">Ukryj</button>`;

		jNode.find(`ul li.right`).prepend(html);
		// consoleX(`Dodano przycisk "Ukryj" z Mirkoukrywacza`, 1);

		$(".hideThisShit").on("click", function ()
		{
			let type = "unknown";

			let entry_stream = $(this).closest(".stream");
			if (entry_stream.hasClass("microblog")) type = "entry";
			else if (entry_stream.hasClass("entry-comments")) type = "entry";
			else if (entry_stream.hasClass("entry-subcomments")) type = "entry-subcomments";
			else if (entry_stream.hasClass("link-comments")) type = "link-comments";

			let entry = $(this).closest(".entry");

			let comment_id = entry.attr("id").split("-")[1];
			let username = entry[0].querySelector("a.username span").innerText;
			let text = entry[0].querySelector("div.content div.wrapper").innerText.replace(/\n/g, " ");

			let grandcomment_id = comment_id; /* id nad-komentarza */
			if (type == "entry-subcomments")
			{
				let entry_grandparent = entry.parent().closest(".entry");
				grandcomment_id = entry_grandparent.attr("id").split("-")[1];
			}

			/*let link_id = null;
			if (type == "link-comments")
			{
				link_id = link_aside.attr("data-url").split("/")[1];      // /link/7013759/tu-najwiecej-polskich-dzieci-probuje-popelnic-samobojstwo
			}*/
			if (text.length > 50) text = text.substring(0, 50);
			mirkoukrywaczAddNewBlockedElement(comment_id, grandcomment_id, username, text, type);
		});
	}

	function mirkoukrywaczAddNewBlockedElement(id, grandcomment_id, username, text, type)
	{
		wykopxStorageMirkoukrywacz
			.setItem(id, {
				id,
				grandcomment_id,
				type,
				username,
				text,
				date: dayjs()
			})
			.then(function (value)
			{
				consoleX(`Mirkoukrywacz dodał do listy ukrywanych @${username}: ${text}`);
			})
			.catch(function (err)
			{
				consoleX(`mirkoukrywaczAddNewBlockedElement = error: ` + err);
			});
		mirkoukrywaczHideAllBlockedElements();
	}

	function mirkoukrywaczHideAllBlockedElements()
	{
		wykopxStorageMirkoukrywacz
			.iterate(function (value, key, iterationNumber)
			{
				$(`section#comment-${key}`).addClass("wykopx_mirkoukrywacz_hide");
			})
			.then(function () { })
			.catch(function (err) { });
	}

	function mirkoukrywaczAppendOneElementToHideList(value, key, iterationNumber = "⭐")
	{
		if ($(`#wykopx_modal_mirkoukrywacz .wykopx_mirkoukrywacz_list_of_hidden_items #wykopx_mirkoukrywacz_element_${key}`).length == 0)
		{
			let hidden_element_html = ``;
			hidden_element_html += `
					<div class="wykopx_mirkoukrywacz_element" id="wykopx_mirkoukrywacz_element_${key}">
						<div class="wykopx_mirkoukrywacz_unhide" id="${key}" title="Przestań ukrywać ten element">❌</div>
						<div class="wykopx_mirkoukrywacz_lp">${iterationNumber}</div>
						<div class="wykopx_mirkoukrywacz_text">${value.text}</div>
						<div class="wykopx_mirkoukrywacz_id">${key}</div>
						<div class="wykopx_mirkoukrywacz_type">${value.type}</div>
						<div class="wykopx_mirkoukrywacz_date">${dayjs(value.date).format("YYYY-MM-DD HH:mm")}</div>
					</div>`;
			$("#wykopx_modal_mirkoukrywacz .wykopx_mirkoukrywacz_list_of_hidden_items").append(hidden_element_html);
			$(".wykopx_mirkoukrywacz_unhide").on("click", function ()
			{
				mirkoukrywaczRemoveHiddenElement($(this).attr("id"));
			});
		}
	}

	function mirkoukrywaczRefreshHideList()
	{
		wykopxStorageMirkoukrywacz
			.iterate(function (value, key, iterationNumber)
			{
				mirkoukrywaczAppendOneElementToHideList(value, key, iterationNumber);
			})
			.then(function () { })
			.catch(function (err) { });
	}

	function mirkoukrywaczBuildListOfHiddenElements()
	{
		let html = `
		<div class="wykopxs wykopx_modal" id="wykopx_modal_mirkoukrywacz">
			<div class="wykopx_modal-content">
				<aside class="wykopxs_info_bar wykopx_hide_this_if_stylus_is_installed">
					Masz już działający skrypt Wykop XS. Aby Mirkoukrywacz działał, musisz zainstalować i włączyć w Stylusie <a href="http://wiki.wykopx.pl" target="_blank">Wykop X</a>
				</aside>

				<aside class="wykopxs wykopx_modal_mirkoukrywacz_is_turned_off wykopx_hide_this_if_mirkoukrywanie_is_turned_on">
					Wykop XS oraz Wykop X są zainstalowane poprawnie, ale Mirkoukrywacz jest wyłączony. Aby Mirkoukrywacz działał, włącz go w ustawieniach Stylusa. <a href="https://github.com/wykopx/WykopX/wiki/Extra#mirkoukrywacz" target="_blank">Zobacz instrukcję obsługi Mirkoukrywacza</a>
				</aside>
				<header class="wykopxs">
					<span>Mirkoukrywacz:</span>
					<span>Lista ukrytych elementów</span>
				</header>
				<section class="wykopxs wykopx_mirkoukrywacz_list_of_hidden_items">
					<span class="wykopx_mirkoukrywacz_hidden_list_is_empty">
						Żadne treści nie zostały jeszcze zaznaczone do ukrycia
					</span>
				</section>
			</div>
		</div>`;


		// $("body").prepend(html);
		document.body.insertAdjacentHTML('afterbegin', html);

		createNewProfileDropdownMenuItem(
			{
				text: `Wykop X - Mirkoukrywacz`,
				title: "Wykop X - lista elementów ukrytych przez Mirkoukrywacz",
				className: `mirkoukrywacz`,
				id: "mirkoukrywacz_open_modal_button",
				url: null,
				target: null,
				icon: null,
				number: null
			});

		let wykopx_modal_mirkoukrywacz = document.getElementById("wykopx_modal_mirkoukrywacz");
		let mirkoukrywacz_open_modal_button = document.getElementById("mirkoukrywacz_open_modal_button");
		//var span = document.getElementsByClassName("wykopx_close")[0];
		mirkoukrywacz_open_modal_button.onclick = function (event)
		{
			mirkoukrywaczRefreshHideList();
			event.preventDefault();
			wykopx_modal_mirkoukrywacz.style.display = "block";
		};
		/*	span.onclick = function() {
			wykopx_modal_mirkoukrywacz.style.display = "none";
		}*/
		window.onclick = function (event)
		{
			if (event.target == wykopx_modal_mirkoukrywacz)
			{
				wykopx_modal_mirkoukrywacz.style.display = "none";
			}
		};
	}

	function mirkoukrywaczRemoveHiddenElement(id)
	{
		wykopxStorageMirkoukrywacz
			.removeItem(id)
			.then(function ()
			{
				$(`#wykopx_mirkoukrywacz_element_${id}`).remove();
			})
			.catch(function (err)
			{
				console.log(err);
			});
	}



	/* Automatycznie "pokaż całość" długich treści */
	function autoOpenMoreContentEverywhere()
	{
		if (wykopxSettings.getPropertyValue("--autoOpenMoreContentEverywhere"))
		{
			let numberOfShowMoreButtons = $("div.wrapper button.more").length;
			if (numberOfShowMoreButtons > 0)
			{
				$("div.wrapper button.more").click();
				consoleX(`Automatycznie rozwinięto ${numberOfShowMoreButtons} długich wpisów i komentarzy`);
			}
		}
	}
	/* Kliknięcie w logo wykopu odświeża stronę */
	function refreshOrRedirectOnHomeButtonClick()
	{
		if (wykopxSettings.getPropertyValue("--refreshOrRedirectOnHomeButtonClick"))
		{
			refreshOrRedirectOnButtonClick("header.header div.left > a", "/");
		}
	}
	/* Kliknięcie w Mikroblog odświeża stronę */
	function refreshOrRedirectOnMicroblogButtonClick()
	{
		if (wykopxSettings.getPropertyValue("--refreshOrRedirectOnMicroblogButtonClick"))
		{
			refreshOrRedirectOnButtonClick(`nav.main ul li a[href="/mikroblog"]`, "/mikroblog");
		}
	}

	function refreshOrRedirectOnButtonClick(selector, pathToRefresh = "/")
	{
		$(document).on("click", selector, function ()
		{
			let pathname = new URL(document.URL).pathname;
			if (pathname == pathToRefresh) window.location.reload();
			else window.location.href = pathToRefresh;
		});
	}

	/* add micro button on left menu open, 2 versions
	$(`header.header > div.left > button`).on("click", function(){
		//categoryRedirectToMicroblogButton();
	}); */



	// przyciski MIRKO w kategoriach
	function categoryRedirectToMicroblogButton()
	{
		consoleX("categoryRedirectToMicroblogButton()", 1);
		let categoryRedirectToMicroblogButtonFilter = wykopxSettings.getPropertyValue("--categoryRedirectToMicroblogButtonFilter");
		categoryRedirectToMicroblogButtonFilter = categoryRedirectToMicroblogButtonFilter.replaceAll("_", "/").replaceAll(" ", "");

		if ($(`section.links div.content ul.categories .wykopx_categories_microblog_a`).length == 0)
		{
			$(`section.links div.content ul.categories li`).each(function (index)
			{
				const kategoria = $(this).context.outerText;
				let href = "";
				switch (kategoria)
				{
					case "Ciekawostki":
						href = "/k/ciekawostki";
						break;
					case "Informacje":
						href = "/k/informacje";
						break;
					case "Rozrywka":
						href = "/k/rozrywka";
						break;
					case "Sport":
						href = "/k/sport";
						break;
					case "Motoryzacja":
						href = "/k/motoryzacja";
						break;
					case "Technologia":
						href = "/k/technologia";
						break;
					case "Ukraina":
						href = "/k/ukraina";
						break;
					case "Gospodarka":
						href = "/k/gospodarka";
						break;
					case "Podróże":
						href = "/k/podroze";
						break;
					default:
						null;
				}
				href += categoryRedirectToMicroblogButtonFilter;
				const microblogButtonHtml = `<li class="wykopxs wykopx_categories_microblog_li"><a class="wykopx_categories_microblog_a" href="${href}">M</a></li>`;
				$(this).after(microblogButtonHtml);
			});
		}

		if ($(`section.links div.content ul.buckets .wykopx_categories_microblog_a`).length == 0)
		{
			$(`section.links div.content ul.buckets li`).each(function (index)
			{
				let href = $(this).children("a").attr("href");
				href = href.replaceAll("/mikroblog", "");
				href += categoryRedirectToMicroblogButtonFilter;
				const microblogButtonHtml = `<li class="wykopxs wykopx_categories_microblog_li"><a class="wykopxs wykopx_categories_microblog_a" href="${href}">M</a></li>`;
				$(this).after(microblogButtonHtml);
			});
		}
	}

	// otwieranie powiadomienia SPM w nowejkacie 
	if (wykopxSettings.getPropertyValue("--middleClickOpensNotificationsInNewTab"))
	{
		/* środkowy przycisk na powiadomieniu otwiera je w nowej karcie */
		$("body").on("mousedown", "section.notifications-stream section.notify", function (e1)
		{
			if (e1.which === 2)
			{
				$(this).one("mouseup", function (e2)
				{
					if (e1.target === e2.target)
					{
						let url_to_open = $(this).find(`a[href^="/wpis/"`).attr("href");
						let tab_handle = window.open(url_to_open, "_blank"); // tab_handle.blur();  //window.focus();
						var e3 = $.event.fix(e2);
						e3.type = "middleclick";
						$(e2.target).trigger(e3);
					}
				});
			}
		});
	}

	// otwieranie obrazka w nowej karcie klikając wybrany przycisk myszy
	const mouseClickOpensImageInNewTab = wykopxSettings.getPropertyValue("--mouseClickOpensImageInNewTab").replaceAll(" ", "");

	if (mouseClickOpensImageInNewTab != "nie_otwieraj")
	{
		let detected_event_click;
		let event_trigger_type;

		if (mouseClickOpensImageInNewTab == "lewy_przycisk_myszy")
		{
			detected_event_click = 1;
			event_trigger_type = "wykopx_leftclick";
		}
		if (mouseClickOpensImageInNewTab == "srodkowy_przycisk_myszy")
		{
			detected_event_click = 2;
			event_trigger_type = "wykopx_middleclick";
		}
		if (mouseClickOpensImageInNewTab == "prawy_przycisk_myszy")
		{
			detected_event_click = 3;
			event_trigger_type = "wykopx_rightclick";
		}
		$("body").on("mousedown", "section.entry section.entry-photo", function (e1)
		{
			e1.preventDefault();
			consoleX("Kliknięto przycisk myszy: " + e1.which, 1);
			if (e1.which === detected_event_click)
			{
				$(this).one("mouseup", function (e2)
				{
					e2.preventDefault();
					if (e1.target === e2.target)
					{
						let url_to_open = $(this).find(`a[href^="https://wykop.pl/cdn/"`).attr("href");
						var handle = window.open(url_to_open, "_blank");
						var e3 = $.event.fix(e2);
						e3.type = event_trigger_type;
						$(e2.target).trigger(e3);
					}
				});
			}
		});
		//$(document).on("wykopx_leftclick", function (e) {});
	}












	/* checking for new versions */




	async function checkVersionForUpdates()
	{
		if (!dev) console.clear();
		consoleX("Sprawdzanie aktualizacji Wykop X Style i Wykop XS...");

		try
		{
			let response = await fetch(`https://raw.githubusercontent.com/wykopx/wykopx-png/main/old-versions/wykopxs.${currentVersion}.gif`);
			if (response.ok)
			{
				addWykopXSNewVersionAvailableToast(); // new version available
				consoleX("Hej, jest nowa wersja skryptu Wykop XS. Wejdź na http://script.wykopx.pl i zaktualizuj go");
			}
			else
			{
				// consoleX(`Masz najnowszą wersję skryptu Wykop XS v.${currentVersion}`);
			}
		}
		catch (error)
		{
			consoleX(`Masz najnowszą wersję skryptu Wykop XS v.${currentVersion}`);
		}

		if (settings.versor == "style" || settings.versor == "blank")
		{
			try
			{
				let response = await fetch(`https://raw.githubusercontent.com/wykopx/wykopx-png/main/old-versions/wykopx${settings.versor}.${settings.version}.gif`);
				if (response.ok)
				{
					addWykopXStyleNewVersionAvailableToast(); // new version available
					consoleX(`Hej, jest dostępna nowa wersja styli wykop x ${settings.versor}. Wejdź na http://${settings.versor}.wykopx.pl i zaktualizuj je`);
				}
				else
				{
					consoleX(`Masz najnowszą wersję styli wykop x ${settings.versor} v.${settings.version}`);
				}
			}
			catch (error)
			{
				// consoleX(`Masz najnowszą wersję styli wykop x ${settings.versor} v.${settings.version}`);
			}
		}

		if (settings.xblocker != "")
		{
			try
			{
				let response = await fetch(`https://raw.githubusercontent.com/wykopx/wykopx-png/main/old-versions/wykopxblocker.${settings.xblocker}.gif`);
				if (response.ok)
				{
					addWykopXBlockerNewVersionAvailableToast();
					consoleX(`Hej, jest dostępna nowa wersja Wykop X Blocker. Wejdź na http://blocker.wykopx.pl i zaktualizuj je`);
				}
				else
				{
					consoleX(`Masz najnowszą wersję Wykop X Blocker v.${settings.version}`);
				}
			}
			catch (error)
			{
				// consoleX(`Masz najnowszą wersję styli Wykop X Blocker v.${settings.xblocker}`);
			}
		}

	}



	function hideWykopXSPromo()
	{
		//$(`body div.main-content section > section.sidebar:after`).css("display: none!important;");
		let style = document.createElement('style');
		style.innerHTML = `body div.main-content section > section.sidebar:after { display: none !important; }`;
		document.head.appendChild(style);
	}

	function addWykopXPromoBanner()
	{
		let targetElement = document.querySelector('section.sidebar > footer');
		if (targetElement)
		{
			const wykopxpromo = document.createElement('section');
			const wykopxpromolink = document.createElement('a');
			wykopxpromolink.href = "http://xstyle.wykopx.pl/"
			wykopxpromolink.target = "wykopx"
			wykopxpromo.appendChild(wykopxpromolink);
			wykopxpromo.classList.add("wykopx_promo", "wykopx_promo_banner");
			targetElement.parentNode.insertBefore(wykopxpromo, targetElement);
		}
	}

	function addWykopXSNewVersionAvailableToast()
	{
		// <a href="http://script.wykopx.pl" target="_blank" style="color: #fff!important;">

		let wykopxsnewversionavailabletoast = `
		<aside class="wykopxs_new_version wykopxs_info_bar">
			<span class="wykopxs_new_version_first">
				Dostępna jest nowa wersja skryptu Wykop XS.
			</span>
			<a href="https://greasyfork.org/scripts/458860-wykop-xs/code/Wykop%20XS.user.js" target="_blank" style="color: #fff!important;">
				Zaktualizuj Wykop XS
			</a>
			<span class="wykopxs_new_version_second">
				do najnowszej wersji
			</span>
			<footer>
				Twoja wersja Wykop XS to v.${currentVersion}
			</footer>
		</aside>`;
		$(wykopxsnewversionavailabletoast).insertAfter(`body > section > header.header`);
	}

	function addWykopXStyleNewVersionAvailableToast()
	{
		let wykopxstylenewversionavailabletoast = "";

		if (settings.versor == "style")
		{
			wykopxstylenewversionavailabletoast = `
			<aside class="wykopxs_new_version wykopxs_info_bar">
					<span class="wykopxs_new_version_first">Dostępna jest nowa wersja styli Wykop X Style</strong>.
				</span>
				<a href="https://userstyles.world/style/8174/wykop-x-style" target="_blank" style="color: #fff!important;">
					Zaktualizuj Wykop X Style
				</a>
					<span class="wykopxs_new_version_second">do najnowszej wersji</span>
					<footer>Twoja wersja Wykop X Style to v.${settings.version}</footer>
			</aside>`;
		}
		else if (settings.versor == "blank")
		{
			wykopxstylenewversionavailabletoast = `
			<aside class="wykopxs_new_version wykopxs_info_bar">
				<span class="wykopxs_new_version_first">Dostępna jest nowa wersja styli Wykop X Blank</strong>.</span>
				<a href="https://userstyles.world/style/8174/wykop-x-style" target="_blank" style="color: #fff!important;">
					Zaktualizuj Wykop X Blank
				</a>
				<span class="wykopxs_new_version_second">do najnowszej wersji</span>
				<footer>Twoja wersja Wykop X Style to v.${settings.version}</footer>
			</aside>`;
		}

		let div = document.createElement('div');
		div.innerHTML = wykopxstylenewversionavailabletoast;
		let newElement = div.firstChild;
		let header = document.querySelector('body > section > header.header');
		header.parentNode.insertBefore(newElement, header.nextSibling);
	}
	function addWykopXBlockerNewVersionAvailableToast()
	{
		let wykopxblockernewversionavailabletoast = `
			<aside class="wykopxs_new_version wykopxs_info_bar">
					<span class="wykopxs_new_version_first">Dostępna jest nowa wersja styli Wykop X Blocker</strong>.
				</span>
				<a href="https://userstyles.world/style/" target="_blank" style="color: #fff!important;">
					Zaktualizuj Wykop X Blocker
				</a>
					<span class="wykopxs_new_version_second">do najnowszej wersji</span>
					<footer>Twoja wersja Wykop X Blocker to v.${settings.xblocker}</footer>
			</aside>`;
		let div = document.createElement('div');
		div.innerHTML = wykopxblockernewversionavailabletoast;
		let newElement = div.firstChild;
		let header = document.querySelector('body > section > header.header');
		header.parentNode.insertBefore(newElement, header.nextSibling);
	}








	const unreadNotifications = {
		tags: 0,
		tags_new_entry_with_observed_tag: 0,
		tags_new_link_with_observed_tag: 0,
		entries: 0,
		pm: 0,
		total: 0,
	};

	// ZLICZA NOWE POWIADOMIENIA Z MENU OD 1 DO 5+
	function countNumberOfNotificationsOnDesktop()
	{
		unreadNotifications.tags = unreadNotifications.tags_new_entry_with_observed_tag = unreadNotifications.tags_new_link_with_observed_tag = unreadNotifications.entries = unreadNotifications.pm = unreadNotifications.total = 0;

		$("header .right ul li.dropdown").removeClass("unread_5").removeClass("unread_4").removeClass("unread_3").removeClass("unread_2").removeClass("unread_1");

		$("header .right ul li.dropdown:has(a.new)").each(function (index, value)
		{
			const lastWord = $(this).attr("class").split(" ").pop();
			let numberOfNotifications = 0;
			// liczba powiadomień o tagach / wołaniach
			$(this)
				.find(".notify:not(.read)")
				.each(function (index, value)
				{
					++numberOfNotifications;

					$(this).addClass(`unread_${numberOfNotifications}`);

					if (lastWord == "tags")
					{
						++unreadNotifications["total"];

						if ($(this).find(`div.content p.new-entry-with-observed-tag`).length > 0)
						{
							++unreadNotifications["tags_new_entry_with_observed_tag"];
							++unreadNotifications["tags"];
							++unreadNotifications["total"];
						}
						else if ($(this).find(`div.content p.new-link-with-observed-tag`).length > 0)
						{
							++unreadNotifications["tags_new_link_with_observed_tag"];
							++unreadNotifications["tags"];
							++unreadNotifications["total"];
						}
					} else if (lastWord == "entries")
					{
						++unreadNotifications["entries"];
						++unreadNotifications["total"];
					}
				})
				.parents(`.notifications.dropdown`)
				.addClass(`unread_${numberOfNotifications}`);
		});
		if (unreadNotifications["tags"] > 0)
		{
			consoleX(`Liczba nowych powiadomień z obserwowanych tagów: ${unreadNotifications["tags"]} (w tym ${unreadNotifications["tags_new_entry_with_observed_tag"]} z wpisów i ${unreadNotifications["tags_new_link_with_observed_tag"]} ze znalezisk)`);
		}
		if (unreadNotifications["entries"] > 0)
		{
			consoleX(`Liczba nowych zawołań: ${unreadNotifications["entries"]}`);
		}

		$("header .right ul li.pm.dropdown:has(a.new)").each(function (index, value)
		{
			let numberOfNotifications = 0; // liczba powiadomień o wiadomościach PM

			$(this)
				.find(".item.unread")
				.each(function (index, value)
				{
					++numberOfNotifications;
					++unreadNotifications["total"];
					$(this).addClass(`unread_${numberOfNotifications}`);
				})
				.parents(`.pm.dropdown`)
				.addClass(`unread_${numberOfNotifications}`);
			unreadNotifications["pm"] = numberOfNotifications;
			consoleX(`Liczba nowych wiadomości: ${unreadNotifications["pm"]}`);
		});

		if (unreadNotifications.tags > 0)
		{
			createNewProfileDropdownMenuItem(
				{
					text: `Powiadomienia z #tagów: (${unreadNotifications.tags})`,
					title: "Masz nowe powiadomienia z obserwowanych #tagów",
					className: `wykopx_notifications_tags`,
					id: undefined,
					url: "/powiadomienia/tagi",
					target: "_self",
					icon: null,
					number: unreadNotifications.tags
				})
		}
		if (unreadNotifications.entries > 0)
		{
			createNewProfileDropdownMenuItem(
				{
					text: `Zawołania w komentarzach: (${unreadNotifications.entries})`,
					title: "Zawołano Cię w komentarzu",
					className: `wykopx_notifications_entries`,
					id: undefined,
					url: "/powiadomienia/moje",
					target: "_self",
					icon: null,
					number: unreadNotifications.entries
				})
		}
		if (unreadNotifications.pm > 0)
		{
			createNewProfileDropdownMenuItem(
				{
					text: `Nowe wiadomości: (${unreadNotifications.pm})`,
					title: "Masz nowe, nieprzeczytane wiadomości prywatne",
					className: `wykopx_notifications_pm`,
					id: undefined,
					url: "/wiadomosci",
					target: "_self",
					icon: null,
					number: unreadNotifications.pm
				})
		}

		executeTabAndFaviconChanges();
	}


	function addWykopXButtonsToNavBar()
	{
		if (settings.myWykopInTopNavJS == true)
		{
			createNewNavBarButton({
				position: "left",
				text: "Mój Wykop",
				title: `Mój Wykop ${promoString}`,
				class: "mywykop", // wykopx_mywykop_li
				hideWithoutXStyle: false,
				url: "/obserwowane",
				target: "_self",
				icon: null,
				numer: null,
				data: "data-v-5182b5f6",
			})
		}
		if (settings.hitsInTopNavJS == true)
		{
			createNewNavBarButton({
				position: "left",
				text: "Hity",
				title: `Hity ${promoString}`,
				class: "hits",
				hideWithoutXStyle: false,
				url: "/hity",
				target: "_self",
				icon: null,
				numer: null,
				data: "data-v-5182b5f6",
			})
		}
		if (settings.favoritesInTopNavJS == true)
		{
			createNewNavBarButton({
				position: "left",
				text: "Ulubione",
				title: `Ulubione ${promoString}`,
				class: "favorites",
				hideWithoutXStyle: false,
				url: "/ulubione",
				target: "_self",
				icon: null,
				numer: null,
				data: "data-v-5182b5f6",
			})
		}
		if (settings.addNewLinkInTopNavJS == true)
		{
			createNewNavBarButton({
				position: "left",
				text: "+",
				title: `Dodaj nowe Znalezisko ${promoString}`,
				class: ["add_new_link", "plus"], // wykopx_add_new_link_li wykopx_plus_li // a > wykopx_add_new_link wykopx_plus_button
				hideWithoutXStyle: false,
				url: "/dodaj-link",
				target: "_self",
				icon: null,
				numer: null,
				data: "data-v-5182b5f6",
				insertAfter: `li:has(a[href="/wykopalisko"])`
			})
		}

		if (settings.addNewEntryInTopNavJS == true)
		{
			createNewNavBarButton({
				position: "left",
				text: "+",
				title: `Dodaj nowy wpis na Mirko ${promoString}`,
				class: ["add_new_entry", "plus"], // wykopx_add_new_entry_li wykopx_plus_li // a > wykopx_add_new_entry wykopx_plus_button
				hideWithoutXStyle: false,
				url: "/mikroblog/#dodaj",
				target: "_self",
				icon: null,
				numer: null,
				data: "data-v-5182b5f6",
				insertAfter: `li:has(a[href="/mikroblog"])`
			})
		}

		createNewNavBarButton({
			position: "left",
			text: "Zainstaluj Wykop X Style",
			title: `Zainstaluj style CSS "𝗪𝘆𝗸𝗼𝗽 𝗫" w rozszerzeniu Stylus i odkryj dziesiątki dodatkowych funkcji Wykopu. Masz już zainstalowane rozszerzenie `,
			class: ["promo", "install_wykopx"], // wykopx_promo (ukrywane przez X Style) wykopx_install_wykopx_li hybrid" | a > wykopx_promo wykopx_install_wykopx_button hybrid
			hideWithoutXStyle: false,
			url: "https://bit.ly/wykopx_install_wykopx_button",
			target: "_blank",
			icon: null,
			numer: null,
			data: "data-v-5182b5f6",
		})

		addQuickLinksToNavBar();

	}





	// options: { position: "left", "right", "center", 
	// text: ``, title: ``, : ``, id: null, url: null, 
	// target: "_blank", icon: null, number: null, 
	// insertAfter: selectorQuery, showWithoutXStyle: true
	// data: "data-v-5182b5f6"   // data-v-5182b5f6
	function createNewNavBarButton(options)
	{
		let nav_ul;

		if (options.position == "left") nav_ul = document.querySelector("body header div.left nav.main ul");
		else if (options.position == "center") nav_ul = document.querySelector("body header div.right nav aside"); // doodle
		/*<aside title="Komentuj ważne wydarzenia" class="doodle">
			<div class="v-portal"></div>
			<a href="/tag/sejm/wpisy">
				<div class="vue-portal-target">
				<img src="/static/img/svg/doodles/gov.svg" alt="">
					Komentuj ważne wydarzenia
				</div>
			</a>
		</aside>*/
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




	// returnWykopXSClassesString("klasa", "li") >> class="wykopx_klasa_li"
	// returnWykopXSClassesString(["klasa1", "klasa2"]) class="wykopx_klasa1 wykopx_klasa2"
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

	// options: { text: null, title: null, className: ``, id: null, url: null, target: "_blank", icon: null, number: null
	function createNewProfileDropdownMenuItem(options)
	{
		let dropdownBody = document.querySelector("body header div.right nav ul li.account.dropdown ul.dropdown-body");

		if (dropdownBody)
		{
			let dropdownItem = dropdownBody.querySelector(`li.${options.className}_li`);

			if (!dropdownItem)
			{
				// dropdownItem.remove();
				let clonedDropdownItem = dropdownBody.querySelector("li.settings").cloneNode(true);
				if (options.className)
				{
					clonedDropdownItem.setAttribute("class", `${options.className}_li`);

					let clonedDropdownItemLink = clonedDropdownItem.querySelector("a");
					clonedDropdownItemLink.setAttribute("class", `${options.className}_button`);

					if (options.url) clonedDropdownItemLink.setAttribute("href", options.url);
					else if (options.href) clonedDropdownItemLink.setAttribute("href", options.href);
					else clonedDropdownItemLink.removeAttribute("href");

					if (options.target) clonedDropdownItemLink.setAttribute("target", options.target);
					if (options.id) clonedDropdownItemLink.setAttribute("id", options.id);
					if (options.title) clonedDropdownItemLink.setAttribute("title", options.title);
					if (options.text) clonedDropdownItemLink.textContent = options.text;
					dropdownBody.appendChild(clonedDropdownItem);
				}
			}
		}
		else // niezalogowany brak menu, zamiast tego przyciski Zaloguj/Zarejestruj
		{
			createNewNavBarButton({
				position: "left",
				text: options.text,
				title: options.title,
				class: options.className,
				hideWithoutXStyle: options.hideWithoutXStyle,
				url: options.url,
				target: options.target,
				icon: options.icon,
				numer: options.numer
			})
		}
	}




	function addNotificationSummaryButtonToNavBar()
	{
		let mojeLubTagi = $("header .right ul li.account.dropdown ul.dropdown-body li.notifications.new a").attr("href");
		let wykopx_notification_summary_url = "/powiadomienia/";
		if (typeof mojeLubTagi == "string")
		{
			mojeLubTagi = mojeLubTagi.split("/").pop();

			if (mojeLubTagi == "tagi")
			{
				createNewProfileDropdownMenuItem(
					{
						text: `Powiadomienia z #tagów`,
						title: "Masz nowe powiadomienia z obserwowanych #tagów",
						className: `wykopx_notifications_tags`,
						id: undefined,
						url: "/powiadomienia/tagi",
						target: "_self",
						icon: null,
						number: null
					})
			}
			if (mojeLubTagi == "moje")
			{
				createNewProfileDropdownMenuItem(
					{
						text: `Powiadomienia z #tagów`,
						title: "Masz nowe powiadomienia z obserwowanych #tagów",
						className: `wykopx_notifications_tags`,
						id: undefined,
						url: "/powiadomienia/tagi",
						target: "_self",
						icon: null,
						number: null
					})
				createNewProfileDropdownMenuItem(
					{
						text: `Zawołania w komentarzach`,
						title: "Zawołano Cię w komentarzu",
						className: `wykopx_notifications_entries`,
						id: undefined,
						url: "/powiadomienia/moje",
						target: "_self",
						icon: null,
						number: null
					})
			}
			wykopx_notification_summary_url += mojeLubTagi;
		}

		let li = document.createElement("li");
		li.setAttribute("class", "wykopxs wykopx_notification_summary notifications dropdown");
		li.setAttribute("title", `Nowe powiadomienia ${promoString}`);
		let a = document.createElement("a");
		a.setAttribute("href", wykopx_notification_summary_url);
		let figure = document.createElement("figure");
		a.appendChild(figure);
		li.appendChild(a);
		document.querySelector("header.header > .right > nav > ul").insertAdjacentElement("afterbegin", li);
	}





	// TRYB NOCNY W BELCE NAWIGACYJNEJ
	function addNightModeButtonToNavBar()
	{
		let wykopx_night_mode = `<li class="wykopxs wykopx_night_mode notifications dropdown" title="Przełącz pomiędzy trybem nocnym/dziennym ${promoString}"><a href="#"><figure></figure></a></li>`;
		$(wykopx_night_mode).prependTo(`header.header > .right > nav > ul`);

		$(".wykopx_night_mode").on("click", function ()
		{
			let currentMode = localStorage.getItem("nightMode")

			if (currentMode === null || currentMode === "0")
			{
				document.body.setAttribute("data-night-mode", "true");
				localStorage.setItem("nightMode", 1);
			}
			else
			{
				document.body.removeAttribute("data-night-mode");
				localStorage.setItem("nightMode", 0);
			}
			// window.location.reload();
		})
	}




	function addExtraButtons()
	{
		let wykopx_wykopwnowymstylu_li = `<li class="wykopxs wykopx_wykopwnowymstylu_li dropdown"><a href="/tag/wykopwnowymstylu" class="wykopx_wykopwnowymstylu_button" title="Przejdź na #wykopwnowymstylu"><span>#</span></a></li>`;
		$(wykopx_wykopwnowymstylu_li).appendTo(`header.header > .right > nav > ul`);

		let wykopx_mywykop_mobile_li = `<li class="wykopxs wykopx_mywykop_mobile_li dropdown"><a href="/obserwowane" class="wykopx_mywykop_mobile_button" title="Mój Wykop ${promoString}"><figure></figure></a></li>`;
		$(wykopx_mywykop_mobile_li).appendTo(`header.header > .right > nav > ul`);

		/* dolna belka mobilna */
		$(wykopx_mywykop_mobile_li).appendTo(`body section.default-layout nav.mobile-navbar > ul`);

		let wykopx_microblog_mobile_li = `<li class="wykopxs wykopx_microblog_mobile_li dropdown"><a href="/mikroblog" class="wykopx_microblog_mobile_button" title="Mikroblog ${promoString}"><figure> </figure></a></li>`;
		$(wykopx_microblog_mobile_li).appendTo(`header.header > .right > nav > ul`);

		let wykopx_messages_mobile_li = `<li class="wykopxs wykopx_messages_mobile_li dropdown"><a href="/wiadomosci" class="wykopx wykopx_messages_button" title="Wiadomości ${promoString}"><figure></figure></a></li>`;

		/* dolna belka mobilna */
		$(wykopx_messages_mobile_li).appendTo(`body section.default-layout nav.mobile-navbar > ul`);

		if (user !== null)
		{
			let wykopx_profile_mobile_li = `<li class="wykopxs wykopx_profile_mobile_li ${user.username}"><a href="/ludzie/${user.username}" class="wykopx wykopx_profile_button" title="Przejdź na swój profil ${user.username} ${promoString}"><figure></figure></a></li>`;
			$(wykopx_profile_mobile_li).appendTo(`body section.default-layout nav.mobile-navbar > ul`);
		}
	}







	// DODAJ NOWY WPIS NA MIRKO
	function focusOnAddingNewMicroblogEntry()
	{
		let wykop_url = new URL(document.URL);
		if (wykop_url.hash == "#dodaj")
		{
			document.querySelector(`section.microblog-page section.microblog section.editor div.content textarea`).focus();
		}
	}




	// document.removeEventListener('click', this.documentClick)
	function unrollDropdowns(dropdown)
	{
		// YYY - async document.removeEventListener("click", this.documentClick);  // TypeError: Cannot read properties of undefined (reading 'documentClick')
	}








	/* ------ DEV waitForKeyElements --------- */

	if (wykopxSettings.getPropertyValue("--allowToDownloadImage"))
	{
		waitForKeyElements("section.entry section.entry-photo figure", allowToDownloadImage, false);

		function allowToDownloadImage(jNode)
		{
			if (wykopxSettings.getPropertyValue("--allowToDownloadImage"))
			{
				let html = `<figcaption class="wykopxs wykopx_download_image_ico"><a title="Pobierz ten obrazek w pełnej rozdzielczości ${promoString}" href="${jNode.find("figcaption a").attr("href")}" download>Pobierz ten obrazek</a></figcaption>`;
				$(jNode).append(html);
			}
		}
	}

	waitForKeyElements(`ul.categories`, categoryRedirectToMicroblogButton, false); // waitForKeyElements sends jNode object, not DOM object
	waitForKeyElements("section.actions", mirkoukrywaczAddButtons, false);























	/* ------ TAB TITLE AND WEBSITE FAVICON CHANGES --------- */

	let originalTabTitle = document.title;
	const defaultWykopFacoviconURL = "https://wykop.pl/static/img/favicons/favicon.png";

	let tabTitles = new Map([
		["domyslny", "           "],
		["adres_url", "           "],
		["pusty_tytul", "ᅟᅟ"],
		["wlasny", settings.tabTitleCustom],
		["wykop", "Wykop"],
		["wykopx", "Wykop X"],
		["digg", "News and Trending Stories Around the Internet | Digg"],
		["google", "Google"],
		["interia", "Interia - Polska i świat: informacje, sport, gwiazdy."],
		["onet", "Onet – Jesteś na bieżąco"],
		["reddit", "Reddit - Dive into anything"],
		["wp", "Wirtualna Polska - Wszystko co ważne"],
		["x", "Home / X"],
		["youtube", "YouTube"],
	])

	let tabFavicons = new Map([
		["wykop", defaultWykopFacoviconURL],
		["wykop_white", "https://raw.githubusercontent.com/wykopx/wykopx-png/main/icons/favicons/W_white.png"],
		["wykop_gray", "https://raw.githubusercontent.com/wykopx/wykopx-png/main/icons/favicons/W_black.png"],

		["digg", "https://raw.githubusercontent.com/wykopx/wykopx-png/main/icons/favicons/digg.png"],
		["google", "https://raw.githubusercontent.com/wykopx/wykopx-png/main/icons/favicons/google.svg"],
		["interia", "https://raw.githubusercontent.com/wykopx/wykopx-png/main/icons/favicons/interia.ico"],
		["onet", "https://raw.githubusercontent.com/wykopx/wykopx-png/main/icons/favicons/onet.png"],
		["reddit", "https://raw.githubusercontent.com/wykopx/wykopx-png/main/icons/favicons/reddit.png"],
		["wp", "https://raw.githubusercontent.com/wykopx/wykopx-png/main/icons/favicons/wp.png"],
		["x", "https://raw.githubusercontent.com/wykopx/wykopx-png/main/icons/favicons/x.png"],
		["youtube", "https://raw.githubusercontent.com/wykopx/wykopx-png/main/icons/favicons/youtube.ico"],
	])



	/*  TAB TITLE
		changeDocumentTitle()
		changeDocumentTitle("youtube")
		changeDocumentTitle("Example new title")
	*/

	let specialCharacter = "឴";

	function changeDocumentTitle(new_document_title)
	{
		console.log(`changeDocumentTitle() > start:  document.title:`);
		console.log(document.title);
		console.log(`changeDocumentTitle() > start:  originalTabTitle`);
		console.log(originalTabTitle);



		if (settings.tabTitleRemoveWykopPL)
		{
			originalTabTitle = originalTabTitle.replace(":: Wykop.pl", "");
		}

		//xxx

		let tabTitleNotifications = "";

		if (settings.tabTitleShowNotificationsEnabled == true)
		{
			let notificationsTotalCount = 0;

			let tabNotificationsSeparated = "";

			if (unreadNotifications["total"] > 0
				&& (settings.tabTitleShowNotificationsCountPM
					|| settings.tabTitleShowNotificationsCountTagsNewLink
					|| settings.tabTitleShowNotificationsCountTagsNewEntry
					|| settings.tabTitleShowNotificationsCountEntries))
			{
				let notificationsEmoji = ""; // 🔗✉📧📩

				if (settings.tabTitleShowNotificationsCountPM && unreadNotifications["pm"] > 0)
				{
					notificationsTotalCount += unreadNotifications["pm"];
					notificationsEmoji = "📧";
					tabNotificationsSeparated += `${notificationsEmoji}${unreadNotifications["pm"]} `;
				}

				if (settings.tabTitleShowNotificationsCountEntries && unreadNotifications["entries"] > 0)
				{
					notificationsTotalCount += unreadNotifications["entries"];
					notificationsEmoji = "🔔";
					tabNotificationsSeparated += `${notificationsEmoji}${unreadNotifications["entries"]} `;
				}

				if (unreadNotifications["tags"] && settings.tabTitleShowNotificationsCountTagsNewLink || settings.tabTitleShowNotificationsCountTagsNewEntry)
				{
					notificationsEmoji = "🏷"; // #
					if (settings.tabTitleShowNotificationsCountTagsNewLink && unreadNotifications["tags_new_entry_with_observed_tag"] > 0)
					{
						notificationsTotalCount += unreadNotifications["tags_new_entry_with_observed_tag"];
					}
					if (settings.tabTitleShowNotificationsCountTagsNewEntry && unreadNotifications["tags_new_entry_with_observed_tag"] > 0)
					{
						notificationsTotalCount += unreadNotifications["tags_new_entry_with_observed_tag"];
					}
					tabNotificationsSeparated += `${notificationsEmoji}${unreadNotifications["tags"]} `;
				}

				if (settings.tabTitleShowNotificationsCountSeparated)
				{
					tabTitleNotifications = tabNotificationsSeparated; // 📧 2 🔔 3 # 14
				}
				else
				{
					tabTitleNotifications = notificationsTotalCount; 	// 19
				}

				if (new_document_title == "pusty_tytul") // jesli pusty tytul - ikonki powiadomien bez nawiasow
				{
					tabTitleNotifications = `${specialCharacter}${tabTitleNotifications} `						// 📧 2 🔔 3 # 14 albo 19
				}
				else
				{
					tabTitleNotifications = `(${specialCharacter}${tabTitleNotifications}) `					// (📧 2 🔔 3 # 14) albo (19)
				}
			}
		}

		let documentTitle = tabTitleNotifications;

		if (settings.tabTitleEnabled && new_document_title != "domyslny")
		{
			if (tabTitles.has(new_document_title)) // selected title from Map
			{
				documentTitle += `${tabTitles.get(new_document_title)}`;
			}
			else
			{
				documentTitle += `${new_document_title}`;
			}
		}
		else
		{
			documentTitle += originalTabTitle;
		}

		console.log("changeDocumentTitle() > zmieniam document.title na: " + documentTitle);
		document.title = documentTitle;
	}


	// FAVICON ICO
	function changeDocumentFavicon(new_favicon = defaultWykopFacoviconURL)
	{
		// changeDocumentFavicon()
		// changeDocumentFavicon("reddit")
		// changeDocumentFavicon("https://www.interia.pl/favicon.ico")
		// <link rel="icon" type="image/svg+xml" href="/static/img/favicons/favicon.svg">
		// <link rel="alternate icon" type="image/png" href="/static/img/favicons/favicon.png">
		let oldFaviconElement = document.querySelector('link[rel="icon"]');
		let alternateFaviconElement = document.querySelector('link[rel="alternate icon"]');
		if (oldFaviconElement) document.head.removeChild(oldFaviconElement);
		if (alternateFaviconElement) document.head.removeChild(alternateFaviconElement);

		let selectedFaviconURL = new_favicon;
		if (tabFavicons.has(new_favicon)) selectedFaviconURL = tabFavicons.get(new_favicon);

		const faviconLinkElement = document.createElement('link');
		faviconLinkElement.rel = 'icon';
		faviconLinkElement.type = 'image/x-icon'; // "image/svg+xml" "image/png"
		faviconLinkElement.href = selectedFaviconURL + '?=' + Math.random();

		document.head.appendChild(faviconLinkElement);
	}



	function executeTabAndFaviconChanges()
	{
		console.log("executeTabAndFaviconChanges()")

		if (document.hidden || !settings.tabChangeOnlyOnHiddenState)
		{
			if (settings.tabFaviconEnabled) changeDocumentFavicon(settings.tabFaviconSelect);
			if (settings.tabTitleEnabled || settings.tabTitleShowNotificationsEnabled) changeDocumentTitle(settings.tabTitleSelect);
		}
	}



	// EVENT: KARTA JEST W TLE document.hidden == true
	// https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
	// https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
	function handleVisibilityChange()
	{
		console.log("handleVisibilityChange(): " + document.visibilityState)

		// document.visibilityState > "visible"/"hidden"
		// document.hidden > true/false

		if (document.hidden)
		{
			executeTabAndFaviconChanges();
			console.log(`document.hidden -> true > document.visibilityState: ${document.visibilityState}`);
		}
		else
		{
			if (settings.tabChangeOnlyOnHiddenState)
			{
				if (settings.tabTitleEnabled || settings.tabTitleShowNotificationsEnabled) changeDocumentTitle(originalTabTitle);
				if (settings.tabFaviconEnabled) changeDocumentFavicon();
			}
		}
	}
	// EVENT LISTENER
	document.addEventListener("visibilitychange", handleVisibilityChange, false); // ICO PNG GIF JPEG SVG


	// TITLE MUTATION
	let titleMutationObserver = new MutationObserver(mutationsList =>
	{
		// console.log("titleMutationObserver")
		// console.log(mutationsList);
		for (let mutation of mutationsList)
		{
			if (mutation.type === 'childList')
			{
				let mutatedTitle = mutation.addedNodes[0].textContent;

				console.log(`Nowy tytuł strony: ${mutatedTitle}`);
				// if (mutatedTitle.endsWith(":: Wykop.pl"))
				// {
				// 	originalTabTitle = mutatedTitle;
				// 	console.log(`mutatedTitle.endsWith(":: Wykop.pl")`);
				// }
				if (!mutatedTitle.includes(specialCharacter)) // tytul nie zostal jeszcze zmieniony i dodane są liczby powiadomien zeby sie nie powtarzalo (1)(1)
				{
					originalTabTitle = mutatedTitle;
					console.log(`!mutatedTitle.includes("specialCharacter")`);
				}

				titleMutationObserver.disconnect();
				executeTabAndFaviconChanges();
				titleMutationObserver.observe(document.querySelector('title'), { childList: true, })
				console.log("originalTabTitle: " + originalTabTitle)
			}
		}
	});
	// MUTATION OBSERVER
	titleMutationObserver.observe(document.querySelector('title'), { childList: true, })










	// RATING BOX - <section class="rating-box"> -> PLUSOWANIE I MINUSOWANIE

	// plusy we wpisach (.rating-box), plusy wpisow w sidebarze (bez rating-box), plusy w znaleziskach
	// rating box - mozliwosc plusowania / minusowania
	// runWithDelay(1000, function ()
	// {
	// 	waitForKeyElements("section.entry:not(.reply) > article > header > div.right > div > section.rating-box", ratingBoxDetected, false);
	// })
	waitForKeyElements("section.entry:not(.deleted) > article > header > div.right > div > section.rating-box", ratingBoxDetected, false);
	// waitForKeyElements("section.entry:not(.reply) > article > header > div.right > div > section.rating-box", ratingBoxDetected, false);

	function ratingBoxDetected(jNodeRatingBoxSection)
	{
		const ratingBoxSection = jNodeRatingBoxSection[0]; //  =jNode > DOMElement
		visiblePlusesObserver.observe(ratingBoxSection); // IntersectionObserver 
	}

	const intersectionCallback = (intersectingPluses, observer) => // function intersectionCallback(entries, observer)
	{
		let timeoutId = null;
		let fetchSeconds = 12;

		intersectingPluses.forEach((plus) =>
		{
			let plus_target = plus.target; // element <select class="rating-box">
			console.log("intersectionCallback: possible intersection element detected 'plus_target'");
			// console.log(plus_target);

			if (settings.votingExplosion) votingExplosionEventListener(plus_target);

			if (plus.isIntersecting)
			{
				// console.log("intersectionCallback: new ratingBox is intersecting")
				plus_target.classList.add("isIntersecting");
				plus_target.classList.remove("notIntersecting");
				parseRatingBoxCurrentContentAndCreateDataValues(plus_target);

				// timeoutId = setInterval(() => checkPluses(plus_target), fetchSeconds * 1000);
			}
			else
			{
				// clearInterval(timeoutId);
				plus_target.classList.remove("isIntersecting");
				plus_target.classList.add("notIntersecting");
			}
		});

		// intersectingPluses.forEach((plus) =>
		// {
		// 	let plus_target = plus.target; // element <select class="rating-box">
		// 	console.log("possible intersectionElement detected plus_target");

		// 	let plusTimeoutId = null;
		// 	if (plus.isIntersecting)
		// 	{
		// 		console.log("new intersecting plus")
		// 		if (settings.votingExplosion) votingExplosionEventListener(plus_target);
		// 		plus_target.classList.add("isIntersecting");
		// 		plus_target.classList.remove("notIntersecting");
		// 		parseRatingBoxCurrentContentAndCreateDataValues(plus_target);

		// 		plusTimeoutId = setTimeout(() =>
		// 		{
		// 			clearTimeout(plusTimeoutId);
		// 			plusTimeoutId = setInterval(() => checkPluses(plus_target), fetchSeconds * 1000);
		// 		});
		// 	}
		// 	else
		// 	{
		// 		clearTimeout(plusTimeoutId);
		// 		plus_target.classList.remove("isIntersecting");
		// 		plus_target.classList.add("notIntersecting");
		// 	}
		// });




	};
	let observerOptions = { root: null, rootMargin: "-70px 0px -120px 0px", threshold: 1.0, /* [0.25, 0.5, 0.75, 1.0] */ };
	const visiblePlusesObserver = new IntersectionObserver(intersectionCallback, observerOptions)



	function getEntryBlocks(elem)
	{
		/* returns:
		{
			resource: "entry"
			element: DOMElement,
			id: 123456,
			entry: DOMElement,
			entry_id: 123456,
		}
		or
		{
			resource: "entry_comment"
			element: DOMElement
			id: 12345678,
			entry: DOMElement,
			entry_id: 123456,
			comment: DOMElement,
			comment_id: 12345678,
		}
		or
		{
			resource: "link_comment"
			element: DOMElement
			id: 12345678,
			entry: DOMElement,
			entry_id: 123456,
			link_id: 12345678,
		}
		*/

		let blocks = {
			votesUp: 0,
			votesDown: 0,
			votesCount: 0,
			votesAll: 0,

			separated: false,
		};

		blocks.element = elem.closest('section.entry'); // returns the section element above .rating-box
		blocks.id = blocks.element.id.replace('comment-', ''); // entry/comment id

		/*
			['', 'wpis', '74111643', 'dobranoc-panstwu']
			['', 'wykopalisko']
			['', 'link', '7303053', 'braun-gasi-chanuke-gasnica-mem']
		*/
		if (pathnameArray[1] == "link") // znalezisko
		{
			// PODKOMENTARZ W ZNALEZISKU
			if (blocks.element.classList.contains("reply"))
			{
				return null;
			}
			// KOMENTARZ POD ZNALEZISKIEM
			else
			{
				return null;
				blocks.link_id = pathnameArray[2]; // id
				blocks.entry_element = blocks.element;
				blocks.entry_id = blocks.entry_element.id.replace('comment-', '');
				blocks.resource = "link_comment";
				blocks.fetchURL = `https://wykop.pl/api/v3/links/${blocks.link_id}/comments/${blocks.entry_id}`;
				blocks.entry_element.dataset.resource = "link_comment";
			}
		}
		// KOMENTARZP OD WPISEM
		else if (blocks.element.classList.contains("reply"))
		{
			// return null;

			blocks.comment_element = blocks.element;
			blocks.entry_element = blocks.comment_element.parentNode.closest('section.entry');
			blocks.entry_id = blocks.entry_element.id.replace('comment-', '');

			blocks.resource = "entry_comment"; // komentarz pod wpisem
			blocks.comment_id = blocks.comment_element.id.replace('comment-', '');
			blocks.fetchURL = `https://wykop.pl/api/v3/entries/${blocks.entry_id}/comments/${blocks.comment_id}`;
			blocks.comment_element.dataset.resource = "entry_comment";
		}
		// WPIS NA MIKROBLOGU
		else
		{
			blocks.entry_element = blocks.element;
			blocks.entry_id = blocks.entry_element.id.replace('comment-', '');
			blocks.resource = "entry";
			blocks.fetchURL = `https://wykop.pl/api/v3/entries/${blocks.entry_id}`;

			blocks.entry_element.dataset.resource = "entry";
		}

		// console.log("blocks.element");
		// console.log(blocks.element);


		let plus_element = blocks.element.querySelector("section.rating-box > ul > li.plus"); // 12 <li class="plus separated">
		if (plus_element)
		{
			blocks.separated = plus_element.classList.contains('separated');
			blocks.votesUp = parseInt(plus_element.textContent);
		}

		// let zero_element = blocks.element.querySelector(".rating-box li.zero"); // 0 <li class="zero separated">
		// if (zero_element)
		// {
		// 	blocks.separated = zero_element.classList.contains('separated');
		// 	blocks.votesUp = 0;
		// }

		let minus_element = blocks.element.querySelector(".rating-box li.minus"); // -8
		if (minus_element)
		{
			blocks.votesDown = Math.abs(parseInt(minus_element.textContent));	// 3 (dodatnia)
		}
		blocks.entry_element.dataset.votesUp = blocks.votesUp;
		blocks.entry_element.dataset.votesDown = blocks.votesDown;

		// console.log("blocks");
		// console.log(blocks);

		return blocks;
	}


	function checkPluses(entry_element)
	{
		// console.log("checkPluses: entry_element")
		// console.log(entry_element);

		if (entry_element)
		{
			const entryBlocksData = getEntryBlocks(entry_element);

			if (entryBlocksData) // nie dla subkomentarzy
			{
				let entry_element = entryBlocksData.element;
				entry_element.classList.remove("addedPluses");
				entry_element.classList.remove("removedPluses");
				entry_element.classList.remove("addedMinuses");
				entry_element.classList.remove("removedMinuses");

				entry_element.style.removeProperty('--addedPluses');
				entry_element.style.removeProperty('--removedPluses');
				entry_element.style.removeProperty('--addedMinuses');
				entry_element.style.removeProperty('--removedMinuses');

				console.log("API fetch: " + entryBlocksData.fetchURL);

				fetch(entryBlocksData.fetchURL,
					{
						method: "GET", // or 'PUT'
						headers: {
							"Content-Type": "application/json",
							Authorization: "Bearer " + window.localStorage.token,
						},
					})
					.then(x => x.json())
					.then(data =>
					{
						const entry_fetched_data = data.data;
						// console.log("fetched data from API: entry_fetched_data");
						// console.log(entry_fetched_data);

						entry_fetched_data.votes.votesCount = entry_fetched_data.votes.up - entry_fetched_data.votes.down; 		// -10 (suma plusów i minusów nie dotyczy entry, entry_comment)
						entry_fetched_data.votes.votesAll = entry_fetched_data.votes.up + entry_fetched_data.votes.down; 		// 30  (łączna liczba głosów nie dotyczy entry, entry_comment)
						entry_fetched_data.votes.votesUpPercent = 0;															// nie dotyczy entry, entry_comment zawsze 100%
						entry_fetched_data.votes.votesDownPercent = 0;															// nie dotyczy entry, entry_comment

						// ile plusów przybyło/ubyło
						let plusesDelta = entry_fetched_data.votes.up - entry_element.dataset.votesUp;
						let minusesDelta = entry_fetched_data.votes.down - entry_element.dataset.votesDown;

						// console.log("entry_element.dataset.votesUp: " + entry_element.dataset.votesUp)
						// console.log("entry_element.dataset.votesDown: " + entry_element.dataset.votesDown)
						// console.log("entry_fetched_data.votes.up: " + entry_fetched_data.votes.up)
						// console.log("entry_fetched_data.votes.down: " + entry_fetched_data.votes.down)
						// console.log("plusesDelta " + plusesDelta)
						// console.log("minusesDelta:  " + minusesDelta)


						entry_element.dataset.votesUp = entry_fetched_data.votes.up;											// 10
						entry_element.dataset.votesDown = entry_fetched_data.votes.down;										// 20  - dodatnia nie dotyczy entry, entry_comment
						entry_element.dataset.votesCount = entry_fetched_data.votes.votesCount;									// -10 (suma plusów i minusów nie dotyczy entry, entry_comment)
						entry_element.dataset.votesAll = entry_fetched_data.votes.votesAll; 									// 30  (łączna liczba głosów nie dotyczy entry, entry_comment)


						if (entry_fetched_data.votes.votesAll > 0)
						{
							entry_fetched_data.votes.votesDownPercent = Math.ceil(entry_fetched_data.votes.down * 100 / entry_fetched_data.votes.votesAll);
							entry_fetched_data.votes.votesUpPercent = Math.ceil(entry_fetched_data.votes.up * 100 / entry_fetched_data.votes.votesAll);
						}

						entry_element.dataset.voted = entry_fetched_data.voted;
						if (entryBlocksData.resource == "entry" || entryBlocksData.resource == "link_comment")
						{
							entry_element.dataset.commentsCount = entry_fetched_data.comments.count;
						}

						console.log("entryBlocksData:");
						console.log(entryBlocksData);

						console.log("entry_element.dataset:");
						console.log(entry_element.dataset);


						if (plusesDelta != 0)
						{
							// console.log("Zmienila sie liczba plusow - plusesDelta:" + plusesDelta);
							// console.log("entry_element.dataset.votesUp:" + entry_element.dataset.votesUp);
							// if() zamiana li.zero na li.plus
							let plusLi = entry_element.querySelector("section.rating-box > ul > li.plus");
							if (!plusLi) plusLi = entry_element.querySelector("section.rating-box > ul > li.zero");
							plusLi.textContent = entry_element.dataset.votesUp;

							if (plusesDelta > 0)
							{
								entry_element.style.setProperty('--addedPluses', JSON.stringify(plusesDelta.toString()));
								entry_element.classList.add("addedPluses");
							}
							else
							{
								entry_element.style.setProperty('--removedPluses', JSON.stringify(plusesDelta.toString()));
								entry_element.classList.add("removedPluses");
							}
						}

						if (minusesDelta != 0)
						{
							let minusLi = entry_element.querySelector("section.rating-box > ul > li.minus");
							if (minusLi) minusLi.textContent = entry_element.dataset.votesDown;


							if (minusesDelta > 0)
							{
								entry_element.style.setProperty('--addedMinuses', JSON.stringify(plusesDelta.toString()));
								entry_element.classList.add("addedMinuses");
							}
							else
							{
								entry_element.style.setProperty('--removedMinuses', JSON.stringify(plusesDelta.toString()));
								entry_element.classList.add("removedMinuses");
							}
						}

						// console.log("entryBlocksData:")
						// console.log(entryBlocksData)

						// console.log("entry_element.dataset:")
						// console.log(entry_element.dataset)

						// console.log("entry_fetched_data (fetched):")
						// console.log(entry_fetched_data)

						// entry_element.dataset.tags = entry_fetched_data.tags;
						// entry_element.dataset.device = entry_fetched_data.device;
						// entry_element.dataset.voted = entry_fetched_data.voted;
						// entry_element.dataset.adult = entry_fetched_data.adult;
						// entry_element.dataset.tags = entry_fetched_data.tags;
						// entry_element.dataset.favourite = entry_fetched_data.favourite;
						// entry_element.dataset.deletable = entry_fetched_data.deletable;
						// entry_element.dataset.editable = entry_fetched_data.editable;
						// entry_element.dataset.slug = entry_fetched_data.slug;
						// entry_element.dataset.parent_id = entry_fetched_data.parent_id;
						// entry_element.dataset.resource = entry_fetched_data.resource; // "entry"
						// entry_element.dataset.deleted = entry_fetched_data.deleted;
					});
			}
		}
	}





	// <section class="rating-box" data-pluses="269" data-minuses="0" data-pluses-minuses-total="269" data-pluses-below-limit="true">
	function parseRatingBoxCurrentContentAndCreateDataValues(ratingBoxSection)
	{
		// dodanie data-pluses na podstawie aktualnych wartosci plusow w HTML
		// console.log("parseRatingBoxCurrentContentAndCreateDataValues(ratingBoxSection)")

		const minusLi = ratingBoxSection.querySelector('li.minus');
		let plusLi = ratingBoxSection.querySelector('li.plus');
		if (!plusLi) plusLi = ratingBoxSection.querySelector('li.zero')
		let votesUp = plusLi ? plusLi.textContent : 0; 				// 5liczba plusów
		let votesDown = minusLi ? -1 * minusLi.textContent : 0; 	// 15 liczba minusów (dodatnia)
		let votesCount = votesUp - votesDown;						// -10 suma plusów i minusów
		let votesAll = votesUp + votesDown;							// 20 liczba glosow


		ratingBoxSection.dataset.votesUp = votesUp;
		ratingBoxSection.dataset.votesDown = votesDown;
		ratingBoxSection.dataset.votesCount = votesCount;
		ratingBoxSection.dataset.votesAll = votesAll;

		// limit ukrywania wpisow przypietych na glownej
		const homepagePinnedEntriesPlusesLimit = settings.homepagePinnedEntriesHideBelowLimit;
		if (homepagePinnedEntriesPlusesLimit > 0)
		{
			// czy wpis jest poniżej limitu ukrywania wpisow przypietych na glownej
			let plusesBelowLimit = (votesCount < homepagePinnedEntriesPlusesLimit ? true : false);
			ratingBoxSection.dataset.plusesBelowLimit = plusesBelowLimit;
		}
	}



	// VOTING EXPLOSION
	function votingExplosionEventListener(ratingBoxSection)
	{
		ratingBoxSection.addEventListener('click', function (event)
		{
			var clickedButton = event.target;

			console.log(clickedButton);

			let count = 0;
			let vote = "voted"; // "voted", "unvoted"
			let action = "plused"; // "plused", "minused"
			let sign = "+";

			let plusLi = ratingBoxSection.querySelector('li.plus');
			if (!plusLi) plusLi = ratingBoxSection.querySelector('li.zero');
			let minusLi = ratingBoxSection.querySelector('button.plus');

			let votesUp = plusLi ? plusLi.textContent : 0;
			let votesDown = minusLi ? -1 * minusLi.textContent : 0;

			if (clickedButton.matches('button.plus.voted'))			// dodano plusa
			{
				action = "plused";
				vote = "voted";
				count = votesUp;
			}
			else if (clickedButton.matches('button.plus:not(.voted)'))	// usunieto plusa
			{
				action = "plused";
				vote = "unvoted";
				count = votesUp;
			}
			else if (clickedButton.matches('button.minus.voted')) 		//  dodano minusa
			{
				action = "minused";
				vote = "voted";
				sign = "-";
				count = votesDown;
			}
			else if (clickedButton.matches('button.minus:not(.voted)')) // usunięto minusa
			{
				action = "minused";
				vote = "unvoted";
				sign = "-";
				count = votesDown;
			}

			if (vote == "voted")
			{
				let min_x = -60;
				let max_x = 60;
				let min_y = -60;
				let max_y = -20;

				if (count > 30) max_y = 60;
				if (count > 300) { min_x = -90; max_x = 90; }

				// let particlesCount = (count > 110 ? Math.ceil(count / 10) : count);
				let particlesCount = count;
				if (particlesCount > 2000) particlesCount = 200;
				else if (particlesCount > 690) particlesCount = particlesCount / 10;
				else if (particlesCount > 345) particlesCount = particlesCount / 5;
				else if (particlesCount > 39) particlesCount = 39;


				var newDivs = [];

				for (var i = 0; i < particlesCount; i++)
				{
					var newDiv = document.createElement('div');
					newDiv.textContent = sign;

					newDiv.classList.add(`wykopxs_vote_animation`, `wykopxs_${vote}`, `wykopxs_${action}`); // class="wykopxs_vote_animation wykopxs_voted wykopxs_plused"

					let color = (sign === "+" ? "green" : "red");
					if (sign === "+")
					{
						if (count >= 666 && getRandomInt(1, 10) == 1) color = "golden";
						if (count > 100 && count < 666 && getRandomInt(1, 80) == 1) newDiv.textContent = "💚";;
					}
					if (count > 100 && getRandomInt(1, 30) == 1) 
					{
						min_x += getRandomInt(-30, 30); max_x += getRandomInt(-30, 30)
						min_y -= getRandomInt(-30, 30); max_y -= getRandomInt(-30, 30);
					}

					newDiv.classList.add(`wykopxs_${color}`);

					newDiv.style.setProperty('--position_x', getRandomInt(min_x, max_x, "px"));
					newDiv.style.setProperty('--position_y', getRandomInt(min_y, max_y, "px"));
					newDiv.style.setProperty('--position_z', 0);
					if (count > 30)
					{
						newDiv.style.setProperty('--explosionTiming',
							getRandomString("linear", "ease", "ease-in-out", "ease-in", "ease-out")); // "cubic-bezier(0.1, 0.7, 1, 0.1)"
						newDiv.style.setProperty('--explosionDelay', getRandomInt(0, getRandomInt(0, Math.max(800, count)), "ms"));
						newDiv.style.setProperty('--explosionDuration', getRandomInt(900, 1300), "ms");
					}

					clickedButton.after(newDiv);
					newDivs.push(newDiv);
				}

				parseRatingBoxCurrentContentAndCreateDataValues(ratingBoxSection);

				setTimeout(function ()
				{
					for (var i = 0; i < newDivs.length; i++)
					{
						newDivs[i].parentNode.removeChild(newDivs[i]);
					}

				}, 2500);
			}
		});
	}

	//	waitForKeyElements(`body > section > div.main-content > main.main > section > div.content > section.entry-page > section.entry > section.stream > div.content > section.entry`, minusyTutaj, false);

	//  body > section > div.main-content > main.main > section > div.content > section.entry-page > section.entry > section.stream > div.content > section.entry > div#entry-comments > section.stream > div.content > section.reply`

	function minusyTutaj(jNodeEntryBlock)
	{
		const entryBlock = jNodeEntryBlock[0]; // jNode => DOMElement

		// alert(entryBlock)
		// Select the section with class 'rating-box'
		let section = document.querySelector('.rating-box');

		// Clear the existing content
		section.innerHTML = '';

		// Create new elements
		let ul = document.createElement('ul');
		let liZero = document.createElement('li');
		let liMinus = document.createElement('li');
		let div = document.createElement('div');
		let buttonPlus = document.createElement('button');
		let buttonMinus = document.createElement('button');

		// Set classes and text content for new elements
		ul.className = '';
		liZero.className = 'zero separated';
		liZero.textContent = '0';
		liMinus.className = 'minus';
		liMinus.textContent = '-8';
		div.className = 'buttons';
		buttonPlus.className = 'plus';
		buttonPlus.textContent = '+';
		buttonMinus.className = 'minus';
		buttonMinus.textContent = '-';

		// Append new elements to the DOM
		ul.appendChild(liZero);
		ul.appendChild(liMinus);
		div.appendChild(buttonPlus);
		div.appendChild(buttonMinus);
		section.appendChild(ul);
		section.appendChild(div);

	}






	const apiGetLink = "https://wykop.pl/api/v3/links/";
	/*
	<section id="link-7288349" class="link-block" 
		data-votes-up="183" data-votes-down="5" data-votes-count="178" data-voted="0" data-comments-count="10" data-comments-hot="false" data-hot="false" data-adult="false" data-created-at="2023-11-27 21:12:49" data-published-at="2023-11-28 15:22:38" data-title="Dwie awarie..." data-slug="dwie-awarie-w-ec-bedzin-wznowienie-dostaw-ciepla-w-koncu-tygodnia-rmf-24" data-description="Dwie awarie w (...)" data-source-label="www.rmf24.pl" data-source-u-r-l="https://www.rmf24.pl/regiony/slaskie/news..." data-source-type="anchor" data-tags="slaskie,bedzin,awaria,wydarzenia">
	*/

	function linkBlockDetected(jNodeLinkBlock)
	{
		const linkBlock = jNodeLinkBlock[0]; // jNode => DOMElement
		const link_id = linkBlock.id.replace("link-", ""); // 78643212
		const fetchURL = apiGetLink + link_id;

		let link_data;

		let sectionVoteBox = linkBlock.querySelector('section.vote-box');
		if (sectionVoteBox)
		{
			fetch(fetchURL,
				{
					method: "GET", // or 'PUT'
					headers: {
						"Content-Type": "application/json",
						Authorization: "Bearer " + window.localStorage.token,
					},
				})
				.then(x => x.json())
				.then(data =>
				{
					link_data = data.data;
					// console.log(link_data);

					linkBlock.dataset.votesUp = link_data.votes.up;									// 10
					linkBlock.dataset.votesDown = link_data.votes.down;								// -20
					linkBlock.dataset.votesCount = link_data.votes.count;							// -10 (suma wykopów i zakopów)
					linkBlock.dataset.votesAll = link_data.votes.up + link_data.votes.down; 		// 30  (łączna liczba głosów)

					link_data.votes.votesDownPercent = 0;
					link_data.votes.votesUpPercent = 0;

					if (linkBlock.dataset.votesAll > 0)
					{
						link_data.votes.votesDownPercent = Math.ceil(link_data.votes.down * 100 / linkBlock.dataset.votesAll);
						link_data.votes.votesUpPercent = Math.ceil(link_data.votes.up * 100 / linkBlock.dataset.votesAll);
					}

					linkBlock.dataset.hot = link_data.hot;
					linkBlock.dataset.slug = link_data.slug;
					linkBlock.dataset.adult = link_data.adult;
					linkBlock.dataset.tags = link_data.tags;
					linkBlock.dataset.title = link_data.title;
					linkBlock.dataset.voted = link_data.voted;
					linkBlock.dataset.sourceURL = link_data.source.url;
					linkBlock.dataset.sourceType = link_data.source.type;
					linkBlock.dataset.commentsHot = link_data.comments.hot;
					linkBlock.dataset.description = link_data.description;
					linkBlock.dataset.sourceLabel = link_data.source.label;
					linkBlock.dataset.commentsCount = link_data.comments.count;
					const linkBlockInfoSpan = linkBlock.querySelector("section > article > div.content > section.info > span");
					if (link_data.created_at)
					{
						linkBlock.dataset.createdAt = link_data.created_at;
						const timeCreatedAt = document.createElement("time");
						timeCreatedAt.setAttribute("data-v-441f7cc5", null);
						timeCreatedAt.innerHTML = `Dodane: ${link_data.created_at}`;
						linkBlockInfoSpan.appendChild(timeCreatedAt);
					}

					if (link_data.published_at)
					{
						linkBlock.dataset.publishedAt = link_data.published_at;
						const timePublishedAt = document.createElement("time");
						timePublishedAt.setAttribute("data-v-441f7cc5", null);
						timePublishedAt.innerHTML = `Na głównej od: ${link_data.published_at}`;
						linkBlockInfoSpan.appendChild(timePublishedAt);
					}




					// SORTOWANIE ZNALEZISK NA GŁÓWNEJ WEDŁUG
					if (typeof settings.linksAnalyzerSortBy === "string" && settings.linksAnalyzerSortBy != "" && settings.linksAnalyzerSortBy != "domyslnie")
					{
						if (settings.linksAnalyzerSortBy == "by_votes_count") linkBlock.style.order = -1 * link_data.votes.count;  					// 🔽 Sortuj wg liczby wykopów style="order: -321"
						else if (settings.linksAnalyzerSortBy == "by_comments_count") linkBlock.style.order = -1 * link_data.comments.count;		// 🔽 Sortuj wg liczby komentarzy
						else if (settings.linksAnalyzerSortBy == "by_created_oldest")												
						{
							linkBlock.style.order = Math.floor(new Date(link_data.created_at).getTime() / 1000);					// ⏬ Sortuj wg daty dodania (od najstarszego)
						}
						else if (settings.linksAnalyzerSortBy == "by_created_newest")												
						{
							linkBlock.style.order = -1 * Math.floor(new Date(link_data.created_at).getTime() / 1000);				// ⏫ Sortuj wg daty dodania (od najnowszego)
						}
						else if (link_data.published_at != null && settings.linksAnalyzerSortBy == "by_published_oldest")												
						{
							linkBlock.style.order = Math.floor(new Date(link_data.published_at).getTime() / 1000);					// ⏬ Sortuj wg czasu na głównej (od najstarszego)
						}
						else if (link_data.published_at != null && settings.linksAnalyzerSortBy == "by_published_newest")												
						{
							linkBlock.style.order = -1 * Math.floor(new Date(link_data.published_at).getTime() / 1000);				// ⏫ Sortuj wg czasu na głównej (od najnowszego)
						}
					}

					// xxx

					const votesMeter = document.createElement('progress');
					votesMeter.className = "wykopxs wykopx_votesMeter";
					votesMeter.setAttribute('value', link_data.votes.up);
					votesMeter.setAttribute('max', link_data.votes.up + link_data.votes.down);

					const votesDownInfo = document.createElement('div');
					votesDownInfo.className = "burry active wykopxVotesDownInfo";

					const span = document.createElement('span');
					span.className = "wykopxs wykopx_votesDown";
					span.setAttribute('data-v-83d9f12a', ''); // VUE 
					span.setAttribute('data-dropdown', `buried-${link_id}`);
					span.setAttribute('title', `Statystyki Wykop X:

Liczba wykopujących: ${link_data.votes.up} 
Liczba zakopujących: ${link_data.votes.down} (${link_data.votes.votesDownPercent} %)`);

					const spanVotesDownCount = document.createElement('span');
					spanVotesDownCount.className = "wykopxs wykopx_votesDownCount";
					spanVotesDownCount.textContent = `${link_data.votes.down}`;

					const spanVotesDownPercent = document.createElement('span');
					spanVotesDownPercent.className = "wykopxs wykopx_votesDownPercent";
					spanVotesDownPercent.textContent = `(${link_data.votes.votesDownPercent} %)`;

					span.appendChild(spanVotesDownCount);
					span.appendChild(spanVotesDownPercent);
					votesDownInfo.appendChild(span);


					sectionVoteBox.appendChild(votesDownInfo);
					if (linkBlock.dataset.votesAll > 0)
					{
						sectionVoteBox.appendChild(votesMeter);
					}

				});
		}
	}









	/* ZNIESIENIE LIMITÓW W TEXTAREA I INPUT PODCZAS WKLEJANIA TEKSTU */
	// <input data-v-6486857b="" data-v-99298700="" type="text" placeholder="Wpisz tytuł Znaleziska..." maxlength="80" class="">
	// <textarea data-v-8f9e192e="" data-v-99298700="" placeholder="Wpisz opis Znaleziska..." maxlength="300" class=""></textarea>
	// <input data-v-714efcd5="" id="title" type="text" placeholder="Wpisz tytuł..." maxlength="80" class="highlight">
	if (settings.disableNewLinkEditorPastedTextLimit)
	{
		waitForKeyElements("[maxlength]", disableNewLinkEditorPastedTextLimit, false);
	}

	function disableNewLinkEditorPastedTextLimit(jNodeInput)
	{
		const input = jNodeInput[0];
		const maxLength = input.getAttribute('maxlength');
		input.removeAttribute('maxlength');

		let divElement = document.createElement('div');

		divElement.className = 'wykopxs_textinput_limit_info';
		divElement.style.color = 'rgba(120, 120, 120, 1)';
		divElement.style.fontSize = '14px';
		divElement.style.margin = '10px 0px 10px 0px';

		input.parentNode.appendChild(divElement, input);

		function handleInputEvent()
		{
			let charCount = input.value.length;
			divElement.innerHTML = `
			Wykop X: wprowadzono: 
			<span class="${charCount > maxLength ? 'overLimit' : 'withinLimit'}" style="color: ${charCount > maxLength ? 'red' : 'inherit'}">
				<strong>${charCount}</strong> / 
				<strong>${maxLength}</strong>
			</span> 
			znaków`;
		}

		input.addEventListener('change', handleInputEvent);
		input.addEventListener('focus', handleInputEvent);
		input.addEventListener('paste', handleInputEvent);


		let timeout = null;
		input.addEventListener('keyup', function (e)
		{
			if (e.key === ' ' || e.key === '.')
			{
				handleInputEvent(e);
			}
			else
			{
				clearTimeout(timeout);
				timeout = setTimeout(function ()
				{
					handleInputEvent(e);
				}, 2000);
			}
		});

	}

















	/* HELPER FUNCTIONS */



	// consoleX("TEXT")
	// consoleX("TEXT", 1)
	// consoleX("TEXT", false)
	function consoleX(text, dev_mode = false)
	{
		let tpl = `background-color:black; border:1px solid rgba(244, 244, 244, 0.4); font-weight: bolder; padding: 0px 9px; font-family: "Segoe UI", "Open Sans", sans-serif; margin-right: 10px;`;
		if (dev_mode) tpl += `color:rgba(43, 255, 75, 1);`;
		else tpl += `color:rgba(255, 255, 255, 0.8);`;

		if (dev_mode == false || dev == true) console.log(`%cWykop X%c` + text, `${tpl}`, `font-family: "Segoe UI", "Open Sans"`);
	}


	// DEV RUN WITH DELAY
	function runWithDelay(time, f)
	{
		// consoleX(`runWithDelay(f , ${time})`, 1);
		setTimeout(function ()
		{
			f();
		}, time);
	}


	// getRandomInt(-30, 20, "px")
	function getRandomInt(min, max, unit)
	{
		min = Math.ceil(min);
		max = Math.floor(max);
		let randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
		if (unit != null) randomValue = randomValue + unit;
		return randomValue;
	}


	//	getRandomString("string1", "string2", "string3", "string4", "string5");
	function getRandomString(...stringsArray)
	{
		let randomString = stringsArray[Math.floor(Math.random() * stringsArray.length)];
		return randomString;
	}


	function isValidURL(string)
	{
		try
		{
			new URL(string);
			return true;
		} catch (err)
		{
			return false;
		}
	}

	function isValidImageURL(string)
	{
		if (isValidURL(string))
		{
			let lowerCaseString = string.toLowerCase();
			if (lowerCaseString.endsWith(".png") || lowerCaseString.endsWith(".jpeg") || lowerCaseString.endsWith(".jpg") || lowerCaseString.endsWith(".webp"))
			{
				return true;
			}
		}
		return false;
	}

	// returns array of valid URL's from a given string
	// returns ["http://onet.pl", "https://www.wp.pl"]
	// getURLsFromString("string")
	// getURLsFromString("string with img urls", true)
	function getURLsFromString(string, onlyImagesURLs = false)
	{
		let urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
		; let urlImagesRegex = /(https?:\/\/[^\s]+(\.png|\.jpg|\.jpeg|\.webp))|(www\.[^\s]+(\.png|\.jpg|\.jpeg|\.webp))/g;

		let urls = string.match(onlyImagesURLs ? urlImagesRegex : urlRegex);
		if (urls)
		{
			urls = urls.map(url => url.startsWith('www.') ? 'https://' + url : url);
		}
		return urls;
	}

	function bytesToKB(bytes, decimalDigits = 2)
	{
		return (bytes / 1024).toFixed(decimalDigits) + ' KB';
	}

	function bytesToMB(bytes, decimalDigits = 2)
	{
		return (bytes / (1024 * 1024)).toFixed(decimalDigits) + ' MB';
	}


	// if (wykopxSettings.getPropertyValue("--enableNotatkowator")) {
	//	waitForKeyElements("section.entry", addWykopXActionBoxToEntryAndComment, false);
	// }











	// IMAGE UPLOADER CTRL+V
	if (settings.imageUploaderEnable)
	{
		waitForKeyElements("section.editor", testClipboard, false);
	}

	function testClipboard(jNodeTextareaWrapper)
	{

		const textareaWrapper = jNodeTextareaWrapper[0]; // jNode => DOMElement
		const textarea = textareaWrapper.querySelector("textarea");

		console.log(textarea);
		const imageUploadPreview = document.createElement('figure');
		imageUploadPreview.classList.add("wykopxs", "wxs_uploaded_image_placeholder")
		textarea.parentNode.appendChild(imageUploadPreview);



		// PASTE EVENT
		document.addEventListener('paste', async (e) => 
		{
			// e.preventDefault();
			// e.stopPropagation(); 
			console.clear();
			console.log("e.clipboardData.items") // object DataTransferItemList {0: DataTransferItem, 1: DataTransferItem, ...}
			console.log(e.clipboardData.items)
			console.log("clipboardData.types")
			console.log(e.clipboardData.types) //  Array: ['Files', 'text/plain', 'text/html', 'application/vnd.code.copymetadata', 'vscode-editor-data']
			console.log("clipboardData.files")
			console.log(e.clipboardData.files)
			/*
				FileList = { 0: File, length: 1 }
				FileList = { 0: 
								{
									lastModified: timestamp // 1702989703658
									lastModifiedDate: DateTime
									name: "image.png";
									size: 1230133
									type: "image/png"
									webkitRelativePath: ""
								},
								length: 1
							}
			*/
			// items - text  files - pliki png

			const uploadModal = document.querySelector('#modals-container div[data-modal="entryPhoto"] section.modal.entryPhoto');
			let fileInput, urlInput;
			if (uploadModal)
			{
				fileInput = uploadModal.querySelector('form div.upload section.file div.upload input');
				urlInput = uploadModal.querySelector('form div.field input[inputmode="url"]');
			}

			// W SCHOWKU BYŁ OBRAZEK
			if (e.clipboardData.files.length > 0)
			{
				console.log(e.clipboardData.files[0]);

				let imageFile = e.clipboardData.files[0];
				console.log("imageFile (original)");
				console.log(imageFile);

				// próba konwersji z WEBP na PNG
				// if (imageFile.type == "image/webp") // image/gif				// image/png				// image/jpeg				// image/webp
				// {
				// 	let reader = new FileReader();
				// 	reader.onload = function (event)
				// 	{
				// 		let img = new Image();
				// 		img.onload = function ()
				// 		{
				// 			let canvas = document.createElement('canvas');
				// 			canvas.width = this.width;
				// 			canvas.height = this.height;
				// 			let ctx = canvas.getContext('2d');
				// 			ctx.drawImage(this, 0, 0);
				// 			canvas.toBlob(function (blob)
				// 			{
				// 				imageFile = new File([blob], "test.png", { type: "image/png" });
				// 				console.log(imageFile);
				// 			}, 'image/png');
				// 		};
				// 		img.src = event.target.result;
				// 	};
				// 	reader.readAsDataURL(imageFile);
				// }

				if (imageFile.name === "image.png")
				{
					imageFile = new File([imageFile], "WykopX", { type: imageFile.type });
				}

				console.log("imageFile");
				console.log(imageFile);

				const bitmap = await createImageBitmap(imageFile)
				let canvas = document.createElement('canvas');
				canvas.width = bitmap.width;
				canvas.height = bitmap.height;
				canvas.style.width = "100%";
				canvas.style.maxWidth = "400px";
				canvas.classList.add("wxs_uploaded_image_preview", `wxs_uploaded_image_${imageFile.type.split("/")[1]}`); // class="wxs_uploaded_image_png", class="wxs_uploaded_image_jpeg"
				canvas.title = `WykopX: Plik ${imageFile.type.split("/")[1].toUpperCase()} o wielkości ${imageFile.size < 1048576 ? bytesToKB(imageFile.size, 2) : bytesToMB(imageFile.size)} i rozmiarach ${bitmap.width} x ${bitmap.height}`


				canvas.getContext('2d').drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
				imageUploadPreview.appendChild(canvas);

				console.log("bitmap");
				console.log(bitmap);

				if (!fileInput)
				{
					let fakeDropEvent = new DragEvent('drop');

					Object.defineProperty(fakeDropEvent, 'dataTransfer',
						{
							value: {
								files: [imageFile],  // 'file' is the File object you want to drop
								types: ['Files'],
								effectAllowed: 'all',
								dropEffect: 'move',
								items: [
									{
										kind: 'file',
										type: imageFile.type,
										getAsFile: function () { return imageFile; }
									}
								],
								getData: function () { return ''; },
								setData: function () { },
								clearData: function () { },
								setDragImage: function () { }
							}
						});

					// Dispatch the fake drop event
					textareaWrapper.dispatchEvent(fakeDropEvent);
				}
				else
				{

				}
			}
			// wklejono tekst
			else if (e.clipboardData.files.length == 0 && e.clipboardData.items.length > 0)
			{
				console.log("e.clipboardData.items.length > 0");
				let textPlainFromClipboard = e.clipboardData.getData('text/plain');
				console.log("Clipboard text/plain: " + textPlainFromClipboard);

				let urlsArray = getURLsFromString(textPlainFromClipboard, true);
				if (urlsArray.length > 0)
				{
					urlsArray.forEach((urlFromClipboard) =>
					{

						if (urlFromClipboard.endsWith(".webp"))
						{

						}


						console.log("probuje pobrać plik: " + urlFromClipboard);

						let img = new Image();

						img.onload = function ()
						{
							let canvas = document.createElement('canvas');
							canvas.width = this.width;
							canvas.height = this.height;
							canvas.style.width = "100%";
							let ctx = canvas.getContext('2d');
							ctx.drawImage(this, 0, 0);
							imageUploadPreview.appendChild(canvas);

							/* CORS POLICY ERROR:
							canvas.toBlob(function (blob)
							{
								let imageFile = new File([blob], "test.png", { type: "image/png" });
								// You now have a PNG File object, 'newFile', with image data from the original WebP file
							}, 'image/png'); */
						};
						// img.crossOrigin = 'anonymous'; CORS
						img.src = urlFromClipboard;
					});

					// e.preventDefault();

				}
				else
				{
					// wklejono tekst bez okna modalnego (wiekszosc wypadkow)
				}
			}
		});
	}
	// IMAGE UPLOADER END



	// CHANGING ALL ENTRIES ID TO comment-1234567
	/* let elements = document.querySelectorAll('.entry');
	
	// Loop through each element
	elements.forEach((element) =>
	{
		// Get the id of the element
		let id = element.id;
	
		// Check if the id starts with "comment-"
		if (id.startsWith('comment-'))
		{
			// Remove "comment-" from the id
			let newId = id.replace('comment-', '');
	
			// Set the new id to the element
			element.id = newId;
		}
	});
	*/














	/* ------------- EVENTS ------------ */


	function handleWindowEvent(event)
	{
		console.log(`Event ${event.type} was fired`);
		console.log(event);
	}
	window.addEventListener('load', handleWindowEvent); 		// 1
	window.addEventListener('pageshow', handleWindowEvent); 	// 2
	// window.addEventListener('popstate', handleWindowEvent);
	// window.addEventListener('hashchange', handleWindowEvent);
	// window.addEventListener('pagehide', handleWindowEvent);
	// window.addEventListener('beforeunload', handleWindowEvent);
	// window.addEventListener('unload', handleWindowEvent);
	/*	events in Wykop podczas ladowania strony:
		1. 	window.addEventListener('load', callback); (Event) event.srcElement.URL > "https://wykop.pl/wpis/74180083/pytanie#comment-261404235"
		2. 	window.addEventListener('pageshow', callback); (PageTransitionEvent)
		
		przejscie na nowa strone, do innego #anchora po kliknieciu w permalink komentarza we wpisie
		
		3. navigation.addEventListener("navigate", callback) (NavigateEvent)
		
		“popstate”: This event is fired when the active history entry changes, either by the user navigating to a different state, or by the code calling the history.pushState() or history.replaceState() methods. This event can be used to update the page content according to the new state.
		“hashchange”: This event is fired when the fragment identifier of the URL (the part after the “#”) changes. This event can be used to implement single-page applications that use different hash values to load different views.
		“pushstate”: This event is fired when the history.pushState() method is called, which adds a new state to the history stack. This event can be used to perform some actions when a new state is created.
		“replacestate”: This event is fired when the history.replaceState() method is called, which modifies the current state in the history stack. This event can be used to perform some actions when the current state is changed.
	*/






















	async function executeWhenPageLoadsFirstTime()
	{
		const topHeaderProfileButton = document.querySelector("body header > div.right > nav > ul > li.account a.avatar");
		if (topHeaderProfileButton) user.username = topHeaderProfileButton.getAttribute("href").split('/')[2];
		// if (user.username == null) consoleX(`Cześć Anon. Nie jesteś zalogowany na Wykopie (⌐ ͡■ ͜ʖ ͡■)`);
		// else consoleX(`Cześć ${user.username} (⌐ ͡■ ͜ʖ ͡■)`);
		hashAndPathNameLoad();
		focusOnAddingNewMicroblogEntry();

		addWykopXButtonsToNavBar();

		// 8s
		runWithDelay(3000, function ()
		{
			if (settings.linksAnalyzerEnable)
			{
				waitForKeyElements(`section.link-block[id^="link-"]`, linkBlockDetected, false);
				// GM_wrench.waitForKeyElements(`section.link-block[id^="link-"]`, linkBlockDetected, false);
			}



		});

		// 8s
		runWithDelay(8000, function ()
		{
			countNumberOfNotificationsOnDesktop();
			addNotificationSummaryButtonToNavBar();
			addNightModeButtonToNavBar();
			unrollDropdowns();
			addExtraButtons();
			addWykopXPromoBanner();

			hideWykopXSPromo();
			// categoryRedirectToMicroblogButton();
			mirkoukrywaczBuildListOfHiddenElements();
			autoOpenMoreContentEverywhere();
			refreshOrRedirectOnHomeButtonClick();
			refreshOrRedirectOnMicroblogButtonClick();
			tagHeaderEditableLoad();
			addActionBoxesToAllEntriesAndComments();
			addObservedTagsToRightSidebar();
		});


		// 20s
		runWithDelay(12000, function ()
		{
			checkVersionForUpdates();
			createNewProfileDropdownMenuItem(
				{
					text: `Wykop X - Pomoc`,
					title: "Otwórz stronę Wiki z informacjami o dodatku Wykop X",
					className: `wykopx_wiki`,
					id: undefined,
					url: "http://wiki.wykopx.pl/",
					target: "wykopx",
					icon: null,
					number: null
				});
		});
	}


	async function executeWhenPageChanges()
	{
		console.log("navigation - navigate event - " + event.type);
		console.log(event);
		originalTabTitle = document.title;
		visiblePlusesObserver.disconnect();
		// consoleX(`navigation.addEventListener("navigate", (event) =>`, 1);

		runWithDelay(2000, function ()
		{
			console.log("document.title: " + document.title);
			hashAndPathNameLoad();
			categoryRedirectToMicroblogButton();
			countNumberOfNotificationsOnDesktop();
			autoOpenMoreContentEverywhere();
			addActionBoxesToAllEntriesAndComments();

			if (settings.tagHeaderEditable && pathnameArray[1] == "tag") runWithDelay(5000, tagHeaderEditableLoad);
		});

		if (!settings.tabChangeOnlyOnHiddenState)
		{
			runWithDelay(7000, () =>
			{
				executeTabAndFaviconChanges();
			})
		}

		// runWithDelay(1000, countNumberOfNotificationsOnDesktop);
		// runWithDelay(2000, autoOpenMoreContentEverywhere);
		// runWithDelay2000, addActionBoxesToAllEntriesAndComments);
	}



	// lOADED PAGE
	window.onload = function (event)
	{
		executeWhenPageLoadsFirstTime();
	};

	/* NEW WYKOP PAGE REDIRECTION */
	navigation.addEventListener("navigate", (event) =>
	{
		executeWhenPageChanges();
	});




	/* CSS STYLES */

	// WYKOP X PROMO 
	let CSS = `<style>`;
	if (settings.quickLinksEnable)
	{
		CSS += `
		
        :root
        {
            --quickLinksAFontSize: var(--textFontSize13, 13px);
            --quickLinksSpanFontSize: var(--textFontSize11, 11px);
        }

        header.header > div.left > #wxs_quick_links > nav
        {
            font-size: var(--quickLinksAFontSize, 13px);
        }
        header.header > div.left > #wxs_quick_links > nav > section span
        {
            font-size: var(--quickLinksSpanFontSize, 11px);
        }

        header.header > div.left > #wxs_quick_links
        {
            display: flex;
            top: calc(var(--topNavHeigh, 48px) - 1px);
            position: absolute;
            left: -1px;
            width: 100vw;
            height: 1px;
            z-index: -100;
        }

        @keyframes quickLinksAnimationOn
        {
          0% { display: none; top: -20px; opacity: 1; }
          1% { display: flex; top: -20px; opacity: 0; }
          99% { display: flex; top: -20px; opacity: 0; }
          100% { display: flex; top: 0px; opacity: 1; }
        }
        @keyframes quickLinksAnimationOff
        {
          0% { display: flex; top: 0px; opacity: 1; }
          50% { display: flex; top: 0px; opacity: 0; }
          99% { display: flex; top: -20px; opacity: 0;}
          100% { display: none; top: -20px; opacity: 0;}
        }


        header.header > div.left > #wxs_quick_links > nav
        {
            z-index: -999;
            column-gap: 0px;
            flex-wrap: nowrap;
            position: absolute;
            left: 0px;
            width: 100%;
        }

		@starting-style
		{
			header.header > div.left > #wxs_quick_links > nav:hover
			{
				
			}
		}
        header.header > div.left > #wxs_quick_links > nav:not(:hover)
        {
            z-index: -1000!important;
            display: none;
			transition: display 1s ease-out allow-discrete;


/*          animation-name: quickLinksAnimationOff!important;
            animation-duration: 0s;
            animation-delay: 0.4s;
            animation-iteration-count: 1;
            animation-direction: normal;
            animation-fill-mode: forwards;*/


        }
        header.header > div.left > #wxs_quick_links > nav:hover
        {
            z-index: 999!important;
            display: flex!important;
            animation-name: quickLinksAnimationOn!important;
            animation-duration: 0s!important;
            animation-delay: 0s!important;
            animation-direction: normal!important;
            animation-fill-mode: forwards!important;
        }

        header.header > div.left > #wxs_quick_links > nav > section
        {
            display: flex;
            flex-wrap: nowrap;
            align-items: center;
        }
        header.header > div.left > #wxs_quick_links > nav > section div
        {
            display: flex;
            height: 100%;
        }
        header.header > div.left > #wxs_quick_links > nav > section a,
        header.header > div.left > #wxs_quick_links > nav > section span
        {
            display: flex;
            align-items: center;
            justify-content: center;
        }
        header.header > div.left:has( a[href="/"]:hover)                   						> #wxs_quick_links > nav.home,

		header.header > div.left:has( > nav.main > ul > li:hover a[href="/"])                   > #wxs_quick_links > nav.home,
        header.header > div.left:has( > nav.main > ul > li a[href="/"]:hover)                   > #wxs_quick_links > nav.home,
        header.header > div.left:has( > nav.main > ul > li:hover a[href="/wykopalisko"])        > #wxs_quick_links > nav.upcoming,
        header.header > div.left:has( > nav.main > ul > li:hover a[href="/mikroblog"])          > #wxs_quick_links > nav.microblog,
        header.header > div.left:has( > nav.main > ul > li:hover a[href="/obserwowane"])        > #wxs_quick_links > nav.mywykop,
        header.header > div.left:has( > nav.main > ul > li:hover a[href="/hity"])               > #wxs_quick_links > nav.hits,
        header.header > div.left:has( > nav.main > ul > li:hover a[href="/ulubione"])           > #wxs_quick_links > nav.favorites,
        header.header > div.left:has( > nav.main > ul > li:hover a[href="/dodaj-link"])         > #wxs_quick_links > nav.add_new,
        header.header > div.left:has( > nav.main > ul > li:hover a[href="/mikroblog/#dodaj"])   > #wxs_quick_links > nav.add_new
        {
            z-index: 999;
            display: flex!important;
            animation-name: quickLinksAnimationOn!important;
            animation-duration: 2s;
            animation-delay: 0s;
            animation-direction: normal;
            animation-fill-mode: forwards;
        }

		/* colors */
        header.header > div.left > #wxs_quick_links > nav
        {
            height: 37px;
            color: var(--blackOpacity07, rgba(255, 255, 255, 0.7));
            border-bottom: 1px solid var(--blackOpacity03, rgba(255, 255, 255, 0.3));
            box-shadow: 0px 4px 4px var(--whiteOpacity04, rgba(0, 0, 0, 0.4));
            
        }

        header.header > div.left > #wxs_quick_links > nav:hover
        {

        }

        header.header > div.left > #wxs_quick_links > nav > section
        {
			background-color: var(--whiteOpacity1, rgba(18, 18, 20, 1));
            column-gap: 5px;
            padding-left: 20px;
            padding-right: 0px;
            border-left: 1px solid rgba(120, 120, 120, 0.2);
        }

        header.header > div.left > #wxs_quick_links > nav > section:hover
        {
            background-color: var(--whiteOpacity1, rgba(18, 18, 20, 1));
        }
        header.header > div.left > #wxs_quick_links > nav > section:hover span
        {
            color: var(--blackOpacity1, rgba(255, 255, 255, 1));
        }

        header.header > div.left > #wxs_quick_links > nav > section span
        {
            padding-right: 10px;
            text-transform: uppercase;
            font-weight: bolder;
            cursor: default;
            width: max-content;
        }


        header.header > div.left > #wxs_quick_links > nav > section a,
        header.header > div.left > #wxs_quick_links > nav > section span
        {
            height: 100%;
            min-width: 70px;
            width: max-content;
        }

        header.header > div.left > #wxs_quick_links > nav > section .wxs_quicklink_short
        {
            min-width: 20px;
        }


        header.header > div.left > #wxs_quick_links > nav > section a
        {
            text-decoration: none;
            padding: 0px 14px 0px 14px;
        }

        header.header > div.left > #wxs_quick_links > nav > section a:hover
        {
            color: var(--blackOpacity09, rgba(255, 255, 255, 1));
            background-color: var(--blackOpacity01, rgba(255, 255, 255, 0.2));
        }

		/* MOBILE */
		@media (max-width: 600px)
		{
			header.header > div.left > #wxs_quick_links > nav:not(:hover)
			{

				animation-name: quickLinksAnimationOff!important;
				animation-delay: 4s;
			}

			header.header > div.left > #wxs_quick_links > nav,
			header.header > div.left > #wxs_quick_links > nav > section,
			header.header > div.left > #wxs_quick_links > nav > section > div
			{
				flex-direction: column!important;
				align-items: start!important;
			}
			header.header > div.left > #wxs_quick_links > nav,
			header.header > div.left > #wxs_quick_links > nav > section,
			header.header > div.left > #wxs_quick_links > nav > section > div,
			header.header > div.left > #wxs_quick_links > nav > section > span,
			header.header > div.left > #wxs_quick_links > nav > section a
			{
				width: 100%;
				justify-content: start;
			}
			header.header > div.left > #wxs_quick_links > nav > section
			{
				border-top: 1px solid rgba(120, 120, 120, 0.3);
			}
			header.header > div.left > #wxs_quick_links > nav > section,
			header.header > div.left > #wxs_quick_links > nav > section > div,
			header.header > div.left > #wxs_quick_links > nav > section > span,
			header.header > div.left > #wxs_quick_links > nav > section a
			{
				padding: 10px;
			}
		}
    }`;
	}
	CSS += `

		/* HIDE ADS ALWAYS */
		.pub-slot-wrapper { display: none!important;  }
        .pub-slot-wrapper:has(section.premium-pub.link-block) {
			display: flex!important;
			border: 1px solid rgba(255, 0, 0, 0.3)!important;
		}
		.pub-slot-wrapper:has(section.premium-pub.link-block):before {
			display: flex!important;
			content: "Aby ukryć Wykopy Sponsorowane i Reklamowane zainstaluj 𝗪𝘆𝗸𝗼𝗽 𝗫 𝗦𝘁𝘆𝗹𝗲 lub 𝗪𝘆𝗸𝗼𝗽 𝗫 𝗕𝗹𝗼𝗰𝗸𝗲𝗿";
			font-size: 13px;
			color: var(--blackish);
			margin: 9px 14px;
			align-self: self-start;
		}

		/* ----- Wykop X Style promo banners ON */
		.wykopx_promo_banner a { width: 100%; display: block!important; height: 300px!important; background: url('https://raw.githubusercontent.com/wykopx/wykopx-png/main/promo-images/wykopx-install-sidebar-day.png'); }
		[data-night-mode] .wykopx_promo_banner a { background: url('https://raw.githubusercontent.com/wykopx/wykopx-png/main/promo-images/wykopx-install-sidebar-night.png'); }
		.wykopx_promo_banner:hover { filter: brightness(0.98) drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.2)); }
		[data-night-mode]  .wykopx_promo_banner:hover { filter: brightness(1.2); }

		body > section > header.header > div.left > nav.main > ul > li
		{
			white-space: nowrap!important;
			height: calc(100% - 12px)!important;
			position: relative!important;
		}

		body > section > header.header > div.left > nav.main > ul > li > a
		{
			text-decoration: none!important;
			height: 100%!important;
			display: flex!important;
			flex-direction: column!important;
			justify-content: center!important;
			position: relative!important;
			font-weight: 400!important;
			padding: 0 12px!important;
		}
		body > section > header.header > div.left > nav.main > ul > li:hover a
		{
			background: rgba(255,255,255, 0.2)!important;
		}
		body > section > header.header > div.left > nav.main > ul > li > a > span
		{
			white-space: nowrap!important;
		}
		body > section > header.header > div.left > nav.main > ul > li.wykopx_promo_li > a > span
		{
			color: rgba(255, 255, 255, 1)!important;
			font-size: 14px;
		}


		/* ----- Hide XS features if Wykop X Style is not installed */
		.wykopxs { display: none; }
	
		/* ----- Wykop XS promo banner from Wykop X Style disabled */
		body div.main-content section > section.sidebar:after,
		section.editor.expand section.inline-autocomplete section.inline-autocomplete-stream div.content:after,
		header.header div.right section.search-input section.inline-autocomplete section.inline-autocomplete-stream div.content:after
		{ display: none!important; }
	

		/* ----- WykopXS new version available */
		.wykopxs_info_bar
		{ display: flex;   align-items: center;border-bottom: 1px solid rgba(128, 128, 128, 0.2); color: rgba(128, 128, 128, 1); padding: 8px 20px; font-size: 14px; }
		
		aside.wykopxs_info_bar a
		{ display: inline-block;background: rgb(0,85,0);color: white;display: inline-block;background-color: #005200;padding: .3em 0.7em;margin: 0 10px;}
		
		aside.wykopxs_info_bar a:hover
		{ background: rgba(0,85,0, 0.7); text-decoration: none!important; }
		
		aside.wykopxs_info_bar footer
		{ opacity: 0.6; margin-left: auto; }
		
		@media (max-width: 640px)
		{
			body > section > aside.wykopxs_info_bar {  flex-direction: column; padding-top: 30px; }
			body > section > aside.wykopxs_info_bar a { margin: 11px; padding: 14px;  width: 100%; text-align: center;}
			body > section > aside.wykopxs_info_bar span.wykopxs_new_version_second,
			body > section > aside.wykopxs_info_bar > footer { display: none; }
		}
	`;



	CSS += `</style>`;
	document.head.insertAdjacentHTML("beforeend", CSS);

})();