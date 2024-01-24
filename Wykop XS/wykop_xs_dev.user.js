// ==UserScript==
// @name        Wykop XS DEV
// @name:pl     Wykop XS DEV
// @name:en     Wykop XS DEV
// @version     2.50.0


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
// @require https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js 
// @require https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/relativeTime.js
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require https://greasyfork.org/scripts/383527-wait-for-key-elements/code/Wait_for_key_elements.js?version=701631


// ==/UserScript==

(async function ()
{
	'use strict';

	const currentVersion = "2.50.0";
	const dev = true;
	const promoString = " [Dodane przez Wykop XS #wykopwnowymstylu]";

	//dayjs.extend(relativeTime); // https://day.js.org/docs/en/plugin/relative-time // https://www.jsdelivr.com/package/npm/dayjs?tab=files&path=plugin
	dayjs.extend(window.dayjs_plugin_relativeTime);
	let loadTime = dayjs();

	// user.username - nazwa zalogowanego uzytkownika

	let user = {
		data: null,
		username: null
	};

	let wxs_modal = null;





	let votesFetchingLimitMinimumVotes = 5;
	let votesFetchingLimitMaximumHoursOld = 48;
	let votesFetchingFirstDelayInSeconds = 1;		// seconds
	let votesFetchingOngoingDelayInSeconds = 60; 	// seconds

	let votesFetchingHigherFrequencyLimitMinimumVotes = 30;
	let votesFetchingHigherFrequencyLimitMaximumHoursOld = 24;
	let votesFetchingHigherFrequencyDelayInSeconds = 30; // seconds




	// getComputedStyle(document.documentElement) -- nie działa, nie wczytuje właściwości z :root
	let wykopxSettings = getComputedStyle(document.querySelector("head"));
	let settings = {};

	// boolean - domyslnie WŁĄCZONE bez Wykop X Style

	settings.WykopXSEnabled = wykopxSettings.getPropertyValue("--WykopXSEnabled") ? wykopxSettings.getPropertyValue("--WykopXSEnabled") === '1' : true;
	if (settings.WykopXSEnabled == false) return true;

	settings.WykopXStyleEnabled = wykopxSettings.getPropertyValue("--WykopXStyleEnabled") ? wykopxSettings.getPropertyValue("--WykopXStyleEnabled") === '1' : true;


	settings.hitsInTopNavJS = wykopxSettings.getPropertyValue("--hitsInTopNavJS") ? wykopxSettings.getPropertyValue("--hitsInTopNavJS") === '1' : true;
	settings.quickLinksEnable = wykopxSettings.getPropertyValue("--quickLinksEnable") ? wykopxSettings.getPropertyValue("--quickLinksEnable") === '1' : true;
	settings.myWykopInTopNavJS = wykopxSettings.getPropertyValue("--myWykopInTopNavJS") ? wykopxSettings.getPropertyValue("--myWykopInTopNavJS") === '1' : true;
	settings.favoritesInTopNavJS = wykopxSettings.getPropertyValue("--favoritesInTopNavJS") ? wykopxSettings.getPropertyValue("--favoritesInTopNavJS") === '1' : true;
	settings.imageUploaderEnable = wykopxSettings.getPropertyValue("--imageUploaderEnable") ? wykopxSettings.getPropertyValue("--imageUploaderEnable") === '1' : true;
	settings.addNewLinkInTopNavJS = wykopxSettings.getPropertyValue("--addNewLinkInTopNavJS") ? wykopxSettings.getPropertyValue("--addNewLinkInTopNavJS") === '1' : true;
	settings.disableNewLinkEditorPastedTextLimit = wykopxSettings.getPropertyValue("--disableNewLinkEditorPastedTextLimit") ? wykopxSettings.getPropertyValue("--disableNewLinkEditorPastedTextLimit") === '1' : true;
	settings.autoOpenMoreContentEverywhere = wykopxSettings.getPropertyValue("--autoOpenMoreContentEverywhere") ? wykopxSettings.getPropertyValue("--autoOpenMoreContentEverywhere") === '1' : true;
	settings.autoOpenSpoilersEverywhere = wykopxSettings.getPropertyValue("--autoOpenSpoilersEverywhere") ? wykopxSettings.getPropertyValue("--autoOpenSpoilersEverywhere") === '1' : true;
	settings.observedTagsInRightSidebarEnable = wykopxSettings.getPropertyValue("--observedTagsInRightSidebarEnable") ? wykopxSettings.getPropertyValue("--observedTagsInRightSidebarEnable") === '1' : true;




	settings.wxsSwitchesEnable = wykopxSettings.getPropertyValue("--wxsSwitchesEnable") ? wykopxSettings.getPropertyValue("--wxsSwitchesEnable") === '1' : true;
	if (settings.wxsSwitchesEnable) 
	{
		settings.wxsSwitchPhotoViewer = wykopxSettings.getPropertyValue("--wxsSwitchPhotoViewer") ? wykopxSettings.getPropertyValue("--wxsSwitchPhotoViewer") === '1' : true;
		settings.wxsSwitchAdult = wykopxSettings.getPropertyValue("--wxsSwitchAdult") ? wykopxSettings.getPropertyValue("--wxsSwitchAdult") === '1' : true;
		settings.wxsSwitchNSFW = wykopxSettings.getPropertyValue("--wxsSwitchNSFW") ? wykopxSettings.getPropertyValue("--wxsSwitchNSFW") === '1' : true;
		settings.wxsSwitchTags = wykopxSettings.getPropertyValue("--wxsSwitchTags") ? wykopxSettings.getPropertyValue("--wxsSwitchTags") === '1' : true;
		settings.wxsSwitchByUserColor = wykopxSettings.getPropertyValue("--wxsSwitchByUserColor") ? wykopxSettings.getPropertyValue("--wxsSwitchByUserColor") === '1' : true;
		settings.wxsSwitchByUserGender = wykopxSettings.getPropertyValue("--wxsSwitchByUserGender") ? wykopxSettings.getPropertyValue("--wxsSwitchByUserGender") === '1' : true;
		settings.wxsSwitchTags = wykopxSettings.getPropertyValue("--wxsSwitchTags") ? wykopxSettings.getPropertyValue("--wxsSwitchTags") === '1' : true;
	}



	settings.removeAnnoyancesEnable = wykopxSettings.getPropertyValue("--removeAnnoyancesEnable") ? wykopxSettings.getPropertyValue("--removeAnnoyancesEnable") === '1' : true;
	if (settings.removeAnnoyancesEnable) 
	{
		settings.removeAnnoyancesIframes = wykopxSettings.getPropertyValue("--removeAnnoyancesIframes") ? wykopxSettings.getPropertyValue("--removeAnnoyancesIframes") === '1' : true;
		settings.removeAnnoyancesScripts = wykopxSettings.getPropertyValue("--removeAnnoyancesScripts") ? wykopxSettings.getPropertyValue("--removeAnnoyancesScripts") === '1' : true;
		settings.removeAnnoyancesAds = wykopxSettings.getPropertyValue("--removeAnnoyancesAds") ? wykopxSettings.getPropertyValue("--removeAnnoyancesAds") === '1' : true;
		settings.removeAnnoyancesGDPR = wykopxSettings.getPropertyValue("--removeAnnoyancesGDPR") ? wykopxSettings.getPropertyValue("--removeAnnoyancesGDPR") === '1' : true;
	}


	settings.votingExplosionEnable = wykopxSettings.getPropertyValue("--votingExplosionEnable") ? wykopxSettings.getPropertyValue("--votingExplosionEnable") === '1' : true;


	settings.checkLinkVotesEnable = wykopxSettings.getPropertyValue("--checkLinkVotesEnable") ? wykopxSettings.getPropertyValue("--checkLinkVotesEnable") === '1' : true;
	if (settings.checkLinkVotesEnable) 
	{
		settings.checkLinkVotesPerHour = wykopxSettings.getPropertyValue("--checkLinkVotesPerHour") ? wykopxSettings.getPropertyValue("--checkLinkVotesPerHour") === '1' : true;
		settings.checkLinkCommentsPerHour = wykopxSettings.getPropertyValue("--checkLinkCommentsPerHour") ? wykopxSettings.getPropertyValue("--checkLinkCommentsPerHour") === '1' : true;
	}


	settings.checkEntryPlusesWhenVoting = wykopxSettings.getPropertyValue("--checkEntryPlusesWhenVoting") ? wykopxSettings.getPropertyValue("--checkEntryPlusesWhenVoting") === '1' : true;

	settings.checkEntryPlusesEnable = wykopxSettings.getPropertyValue("--checkEntryPlusesEnable") ? wykopxSettings.getPropertyValue("--checkEntryPlusesEnable") === '1' : true;
	if (settings.checkEntryPlusesEnable) 
	{
		settings.checkEntryPlusesPerHour = wykopxSettings.getPropertyValue("--checkEntryPlusesPerHour") ? wykopxSettings.getPropertyValue("--checkEntryPlusesPerHour") === '1' : true;
		settings.checkEntryCommentsPerHour = wykopxSettings.getPropertyValue("--checkEntryCommentsPerHour") ? wykopxSettings.getPropertyValue("--checkEntryCommentsPerHour") === '1' : true;
		settings.checkEntryPlusesForVotingGame = wykopxSettings.getPropertyValue("--checkEntryPlusesForVotingGame") ? wykopxSettings.getPropertyValue("--checkEntryPlusesForVotingGame") === '1' : true;
	}



	// LOCAL STORAGE
	let localStorageMirkoukrywacz = null;
	let localStorageTextsaver = null;
	let localStorageNotatkowator = null;

	settings.actionBoxEnable = wykopxSettings.getPropertyValue("--actionBoxEnable") ? wykopxSettings.getPropertyValue("--actionBoxEnable") === '1' : true;
	if (settings.actionBoxEnable)
	{

		settings.filterUserComments = wykopxSettings.getPropertyValue("--filterUserComments") ? wykopxSettings.getPropertyValue("--filterUserComments") === '1' : true;
		settings.filterUserReplies = wykopxSettings.getPropertyValue("--filterUserReplies") ? wykopxSettings.getPropertyValue("--filterUserReplies") === '1' : true;
		settings.mirkoukrywaczEnable = wykopxSettings.getPropertyValue("--mirkoukrywaczEnable") ? wykopxSettings.getPropertyValue("--mirkoukrywaczEnable") === '1' : true;
		settings.textsaverEnable = wykopxSettings.getPropertyValue("--textsaverEnable") ? wykopxSettings.getPropertyValue("--textsaverEnable") === '1' : true;
	}
	else
	{
		settings.mirkoukrywaczEnable = false;
		settings.textsaverEnable = false;
	}


	if (settings.mirkoukrywaczEnable)
	{
		// LOCALSTORAGE
		localStorageMirkoukrywacz = localforage.createInstance({
			driver: localforage.LOCALSTORAGE,
			name: "wykopx",
			storeName: "mirkoukrywacz",
		});

		settings.mirkoukrywaczMinimizeEntries = wykopxSettings.getPropertyValue("--mirkoukrywaczMinimizeEntries") ? wykopxSettings.getPropertyValue("--mirkoukrywaczMinimizeEntries") === '1' : true; // 1 || 0
		settings.mirkoukrywaczMinimizeComments = wykopxSettings.getPropertyValue("--mirkoukrywaczMinimizeComments") ? wykopxSettings.getPropertyValue("--mirkoukrywaczMinimizeComments") === '1' : true; // 1 || 0
		settings.mirkoukrywaczHideEntries = wykopxSettings.getPropertyValue("--mirkoukrywaczHideEntries") ? wykopxSettings.getPropertyValue("--mirkoukrywaczHideEntries") === '1' : true; // 1 || 0
		settings.mirkoukrywaczHideComments = wykopxSettings.getPropertyValue("--mirkoukrywaczHideComments") ? wykopxSettings.getPropertyValue("--mirkoukrywaczHideComments") === '1' : true; // 1 || 0
		settings.mirkoukrywaczHideLinks = wykopxSettings.getPropertyValue("--mirkoukrywaczHideLinks") ? wykopxSettings.getPropertyValue("--mirkoukrywaczHideLinks") === '1' : true; // 1 || 0
	}

	if (settings.textsaverEnable)
	{
		// LOCALSTORAGE
		localStorageTextsaver = localforage.createInstance({
			driver: localforage.LOCALSTORAGE,
			name: "wykopx",
			storeName: "textsaver",
		});

		settings.textsaverSaveEntries = wykopxSettings.getPropertyValue("--textsaverSaveEntries") ? wykopxSettings.getPropertyValue("--textsaverSaveEntries") === '1' : true; // 1 || 0
		settings.textsaverSaveComments = wykopxSettings.getPropertyValue("--textsaverSaveComments") ? wykopxSettings.getPropertyValue("--textsaverSaveComments") === '1' : true; // 1 || 0
	}




	settings.notatkowatorEnable = wykopxSettings.getPropertyValue("--notatkowatorEnable") ? wykopxSettings.getPropertyValue("--notatkowatorEnable") === '1' : true;
	if (settings.notatkowatorEnable)
	{
		localStorageNotatkowator = localforage.createInstance({
			driver: localforage.LOCALSTORAGE,
			name: "wykopx",
			storeName: "notatkowator",
		});

		settings.notatkowatorUpdateInterval = parseFloat(wykopxSettings.getPropertyValue("--notatkowatorUpdateInterval")); // number 0 ... 120
		settings.notatkowatorVerticalBar = wykopxSettings.getPropertyValue("--notatkowatorVerticalBar") ? wykopxSettings.getPropertyValue("--notatkowatorVerticalBar") === '1' : true; // 1 || 0
		settings.notatkowatorStyle = wykopxSettings.getPropertyValue("--notatkowatorStyle").trim();	// string "pod_avatarem" "obok_nicka"
	}

	settings.infoboxEnable = wykopxSettings.getPropertyValue("--infoboxEnable") ? wykopxSettings.getPropertyValue("--infoboxEnable") === '1' : true;
	if (settings.infoboxEnable)
	{
		settings.infoboxUserBannedEmoji = wykopxSettings.getPropertyValue("--infoboxUserBannedEmoji") ? wykopxSettings.getPropertyValue("--infoboxUserBannedEmoji") === '1' : true; // 1 || 0
		settings.infoboxUserBannedInfo = wykopxSettings.getPropertyValue("--infoboxUserBannedInfo") ? wykopxSettings.getPropertyValue("--infoboxUserBannedInfo") === '1' : true; // 1 || 0
		settings.infoboxUserBannedInfoOnProfilePage = wykopxSettings.getPropertyValue("--infoboxUserBannedInfoOnProfilePage") ? wykopxSettings.getPropertyValue("--infoboxUserBannedInfoOnProfilePage") === '1' : true; // 1 || 0
		settings.infoboxUserMemberSince = wykopxSettings.getPropertyValue("--infoboxUserMemberSince") ? wykopxSettings.getPropertyValue("--infoboxUserMemberSince") === '1' : true; // 1 || 0
		settings.infoboxUserSummaryFollowers = wykopxSettings.getPropertyValue("--infoboxUserSummaryFollowers") ? wykopxSettings.getPropertyValue("--infoboxUserSummaryFollowers") === '1' : true; // 1 || 0
		settings.infoboxUserSummaryActivity = wykopxSettings.getPropertyValue("--infoboxUserSummaryActivity") ? wykopxSettings.getPropertyValue("--infoboxUserSummaryActivity") === '1' : true; // 1 || 0
		settings.infoboxUserBannedEmoji = wykopxSettings.getPropertyValue("--infoboxUserBannedEmoji") ? wykopxSettings.getPropertyValue("--infoboxUserBannedEmoji") === '1' : true; // 1 || 0
	}








	// DOMYŚLNIE WYŁĄCZONE BEZ WYKOP X STYLE

	// boolean
	settings.observedTagsInRightSidebarSortAlphabetically = wykopxSettings.getPropertyValue("--observedTagsInRightSidebarSortAlphabetically") ? wykopxSettings.getPropertyValue("--observedTagsInRightSidebarSortAlphabetically") === '1' : false;

	// default numbers
	settings.observedTagsInRightSidebarUpdateInterval = 12;
	if (wykopxSettings.getPropertyValue("--observedTagsInRightSidebarUpdateInterval")) settings.observedTagsInRightSidebarUpdateInterval = parseFloat(wykopxSettings.getPropertyValue("--observedTagsInRightSidebarUpdateInterval")); // number





	// variables from Wykop X Style
	// boolean
	settings.allowToDownloadImage = (wykopxSettings.getPropertyValue("--allowToDownloadImage") == `"true"`); // boolean
	settings.topNavHamburgerHoverMinimize = (wykopxSettings.getPropertyValue("--topNavHamburgerHoverMinimize") == `"true"`); // boolean
	settings.tabTitleEnabled = (wykopxSettings.getPropertyValue("--tabTitleEnabled") == `"true"`); // boolean
	settings.tabFaviconEnabled = (wykopxSettings.getPropertyValue("--tabFaviconEnabled") == `"true"`); // boolean
	settings.tagHeaderEditable = (wykopxSettings.getPropertyValue("--tagHeaderEditable") == `"true"`); // boolean
	settings.linksAnalyzerEnable = (wykopxSettings.getPropertyValue("--linksAnalyzerEnable") == `"true"`); // boolean
	settings.tabTitleRemoveWykopPL = (wykopxSettings.getPropertyValue("--tabTitleRemoveWykopPL") == `"true"`); // boolean
	settings.tabChangeOnlyOnHiddenState = (wykopxSettings.getPropertyValue("--tabChangeOnlyOnHiddenState") == `"true"`); // boolean
	settings.fixCaseSensitiveTagsRedirection = (wykopxSettings.getPropertyValue("--fixCaseSensitiveTagsRedirection") == `"true"`); // boolean
	settings.tabTitleShowNotificationsEnabled = (wykopxSettings.getPropertyValue("--tabTitleShowNotificationsEnabled") == `"true"`); // boolean
	settings.tabTitleShowNotificationsCountPM = (wykopxSettings.getPropertyValue("--tabTitleShowNotificationsCountPM") == `"true"`); // boolean
	settings.tabTitleShowNotificationsCountEntries = (wykopxSettings.getPropertyValue("--tabTitleShowNotificationsCountEntries") == `"true"`); // boolean
	settings.categoryRedirectToMicroblogButtonEnable = (wykopxSettings.getPropertyValue("--categoryRedirectToMicroblogButtonEnable") == `"true"`); // boolean
	settings.tabTitleShowNotificationsCountSeparated = (wykopxSettings.getPropertyValue("--tabTitleShowNotificationsCountSeparated") == `"true"`); // boolean
	settings.tabTitleShowNotificationsCountTagsNewLink = (wykopxSettings.getPropertyValue("--tabTitleShowNotificationsCountTagsNewLink") == `"true"`); // boolean
	settings.tabTitleShowNotificationsCountTagsNewEntry = (wykopxSettings.getPropertyValue("--tabTitleShowNotificationsCountTagsNewEntry") == `"true"`); // boolean


	// numbers
	settings.homepagePinnedEntriesHideBelowLimit = parseFloat(wykopxSettings.getPropertyValue("--homepagePinnedEntriesHideBelowLimit")); // number


	// boolean - domyslnie WŁĄCZONE bez Wykop X Style
	settings.hitsInTopNavJS = wykopxSettings.getPropertyValue("--hitsInTopNavJS") ? wykopxSettings.getPropertyValue("--hitsInTopNavJS") === '1' : true;
	settings.quickLinksEnable = wykopxSettings.getPropertyValue("--quickLinksEnable") ? wykopxSettings.getPropertyValue("--quickLinksEnable") === '1' : true;
	settings.myWykopInTopNavJS = wykopxSettings.getPropertyValue("--myWykopInTopNavJS") ? wykopxSettings.getPropertyValue("--myWykopInTopNavJS") === '1' : true;
	settings.notatkowatorEnable = wykopxSettings.getPropertyValue("--notatkowatorEnable") ? wykopxSettings.getPropertyValue("--notatkowatorEnable") === '1' : true;
	settings.favoritesInTopNavJS = wykopxSettings.getPropertyValue("--favoritesInTopNavJS") ? wykopxSettings.getPropertyValue("--favoritesInTopNavJS") === '1' : true;
	settings.imageUploaderEnable = wykopxSettings.getPropertyValue("--imageUploaderEnable") ? wykopxSettings.getPropertyValue("--imageUploaderEnable") === '1' : true;
	settings.addNewLinkInTopNavJS = wykopxSettings.getPropertyValue("--addNewLinkInTopNavJS") ? wykopxSettings.getPropertyValue("--addNewLinkInTopNavJS") === '1' : true;
	settings.addNewEntryInTopNavJS = wykopxSettings.getPropertyValue("--addNewEntryInTopNavJS") ? wykopxSettings.getPropertyValue("--addNewEntryInTopNavJS") === '1' : true;
	settings.disableNewLinkEditorPastedTextLimit = wykopxSettings.getPropertyValue("--disableNewLinkEditorPastedTextLimit") ? wykopxSettings.getPropertyValue("--disableNewLinkEditorPastedTextLimit") === '1' : true;



	// strings
	settings.linksAnalyzerSortBy = wykopxSettings.getPropertyValue("--linksAnalyzerSortBy").trim();
	settings.tabTitleSelect = wykopxSettings.getPropertyValue("--tabTitleSelect").trim();
	settings.tabTitleCustom = wykopxSettings.getPropertyValue("--tabTitleCustom").trim();
	settings.tabFaviconSelect = wykopxSettings.getPropertyValue("--tabFaviconSelect").trim();
	settings.categoryRedirectToMicroblogButtonFilter = wykopxSettings.getPropertyValue("--categoryRedirectToMicroblogButtonFilter").replaceAll("_", "/").replaceAll(" ", "");


	// { root: --var }
	const rootStyles = getComputedStyle(document.documentElement);
	settings.version = (rootStyles.getPropertyValue("--version").trim().slice(1, -1)); 	// "2.48";
	settings.versor = (rootStyles.getPropertyValue("--versor").trim().slice(1, -1)); 	// "style", "blank", "block"
	settings.xblocker = (rootStyles.getPropertyValue("--xblocker").trim().slice(1, -1)); // "2.48";





	let localStorageObservedTags = localforage.createInstance({
		driver: localforage.LOCALSTORAGE,
		name: "wykopx",
		storeName: "observedTags",
	});






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

	let currentURL = undefined;
	setInterval(() =>
	{
		if (isURLChanged()) newPageURL()
	}, 1000);

	function isURLChanged()
	{
		const newURL = window.location.href;
		const newURL2 = document.URL;

		if (newURL != currentURL)
		{
			consoleX(`URL Changed from ${currentURL} to ${newURL}`)
			// URL changed
			currentURL = newURL;
			return true;
		}
		else return false;
	}



	let pageType = "";
	let pageSubtype = "";
	let pageObjects = []; // ["znaleziska", "wpisy", "komentarze"]
	let pageTotalVotesUpCount = 0;

	function newPageURL()
	{
		hash = new URL(document.URL).hash;
		pathname = new URL(document.URL).pathname;
		pathnameArray = pathname.split("/");
		consoleX(`newPageURL(): document.URL: ${document.URL} hash: ${hash}, pathname: ${pathname}, pathnameArray: `, 1)
		console.log(pathnameArray)

		pageTotalVotesUpCount = 0;

		if (pathnameArray[1] == "" || pathnameArray[1] == "aktywne" || pathnameArray[1] == "najnowsze" || pathnameArray[1] == "strona")
		{
			pageType = "glowna";
			pageSubtype = "glowna";
			pageObjects = ["wpisy", "znaleziska"];

			if (pathnameArray[2] && pathnameArray[2] != "strona")
			{
				pageSubtype = pathnameArray[2]; // "aktywne", "najnowsze"
			}
		}

		else if (pathnameArray[1] == "wykopalisko")
		{
			pageType = "wykopalisko";
			pageSubtype = "wykopalisko";
			pageObjects = ["znaleziska"];

			if (pathnameArray[2] && pathnameArray[2] != "strona")
			{
				pageSubtype = pathnameArray[2]; // "najnowszego", "aktywne", "wykopywane", "komentowane"
			}
		}

		else if (pathnameArray[1] == "ludzie") // profil jakiegoś użytkownika wykop.pl/ludzie/NadiaFrance
		{
			pageType = "profil";
			pageSubtype = "profil";
			pageObjects = ["znaleziska", "wpisy", "komentarze"];
		}
		else if (pathnameArray[1] == "link")
		{
			pageType = "znalezisko";
			pageSubtype = "znalezisko";
			pageObjects = ["komentarze"];
		}
		else if (pathnameArray[1] == "wpis")
		{
			pageType = "wpis";
			pageSubtype = "wpis";
			pageObjects = ["komentarze"];
		}

		else if (pathnameArray[1] == "mikroblog")
		{
			pageType = "mikroblog";
			pageSubtype = "mikroblog";
			pageObjects = ["wpisy", "komentarze"];
		}

		else if (pathnameArray[1] == "tag")
		{
			pageType = "tag";
			pageSubtype = "tag";
			pageObjects = ["znaleziska", "wpisy", "komentarze"];
		}


		console.log(`Typ strony: ${pageType} ${pageType != pageSubtype ? pageSubtype : ""}`)
		console.log(`pageObjects:`, pageObjects)
	}



	(async () =>
	{
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







	let consoleData = {
		mirkoukrywacz_hidden: {
			count: 0,
			text: "Ukrytych",
			title: "Mirkoukrywacz ukryte",
		},

		mirkoukrywacz_minimized: {
			count: 0,
			text: "Zwiniętych",
			title: "Mirkoukrywacz zwinął",
		},

		annoyances: {
			count: 0,
			text: "Uciążliwych obiektów",
			title: "Annoyances title",


			ads: {
				count: 0,
				text: "Usuniętych reklam",
				title: "Annoyances ads",

			},

			iframe: {
				count: 0,
				text: "ads iframes",
				title: "Annoyances iframes with ads",

			},

			script: {
				count: 0,
				text: "ads scripts",
				title: "Annoyances scripts",

			},

			other: {
				count: 0,
				text: "inne",
				title: "Annoyances other",

			},

			div: {
				count: 0,
				text: "inne",
				title: "Annoyances div",

			},


		},



		notatkowator: {
			count: 0,
			text: "Dodanych Notatek",
			title: "Notatki do użytkowników",
		},
	}

	function buildConsole(jNodeHeaderStreamTop = null)
	{
		let headerStreamTopElement;

		if (!jNodeHeaderStreamTop)
		{
			headerStreamTopElement = document.getElementById("main.main > section > div.content section.stream > header.stream-top");
		}
		else
		{
			headerStreamTopElement = jNodeHeaderStreamTop[0];
		}

		if (headerStreamTopElement)
		{
			const wxs_console = document.getElementById("wxs_console");

			if (!wxs_console)
			{
				const wxs_console_container = document.createElement("aside"); // <aside id="wxs_console_container"> 
				wxs_console_container.id = "wxs_console_container";
				wxs_console_container.innerHTML = `<header><span>𝗪𝘆𝗸𝗼𝗽 𝗫</span> <button>▼</button></header>`;
				wxs_console_container.title = `𝗪𝘆𝗸𝗼𝗽 𝗫`;
				headerStreamTopElement.appendChild(wxs_console_container);

				let wxs_console_section = document.createElement("section");
				wxs_console_section.id = "wxs_console";

				headerStreamTopElement.insertAdjacentElement('afterend', wxs_console_section);
			}

			refreshConsole();
		}

	}


	let wxs_console;
	function refreshConsole()
	{
		// console.log("refresh console()")

		if (!wxs_console) wxs_console = document.getElementById("wxs_console");

		if (wxs_console)
		{
			wxs_console.innerHTML = "";

			for (let field in consoleData)
			{
				if (consoleData[field].count > 0)
				{
					let div = document.createElement("div");
					div.classList.add(`wcs_console_${field}`)
					div.title = consoleData[field].title;
					div.innerHTML = `<span class="wxs_console_count">
										${consoleData[field].count}
									</span>
									<span class="wxs_console_text">
										${consoleData[field].text}
									</span>`;
					wxs_console.appendChild(div);
				}
			}
			for (let field in consoleData.annoyances)
			{
				if (consoleData.annoyances[field].count > 0)
				{
					let div = document.createElement("div");
					div.title = consoleData.annoyances[field].title;
					div.classList.add(`wcs_console_${field}`)
					div.innerHTML = `<span class="wxs_console_count">
										${consoleData.annoyances[field].count}
									</span>
									<span class="wxs_console_text">
										${consoleData.annoyances[field].text}
									</span>`;
					wxs_console.appendChild(div);
				}
			}
		}

	}



	/* LENNY FACE
		// waitForKeyElements("section.editor", editorAddLennyFace, false);
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










	// <body data-wxs_category_menu_minimized="false">
	if (settings.topNavHamburgerHoverMinimize)
	{
		waitForKeyElements("body > section > header.header > div.left > button", topNavHamburgerHoverMinimize, true);
	}
	function topNavHamburgerHoverMinimize(jQueryHamburgerButton)
	{
		let hamburgerButton = jQueryHamburgerButton[0];
		document.body.dataset.wxs_category_menu_minimized = 'true';

		hamburgerButton.addEventListener("mouseover", () => 
		{

			if (document.body.dataset.wxs_category_menu_minimized === 'true')
			{
				//delete document.body.dataset.wxs_category_menu_minimized;
				document.body.dataset.wxs_category_menu_minimized = 'false';
			}
			else
			{
				document.body.dataset.wxs_category_menu_minimized = 'true';
			}
		});
	}



	/* QUICK SEARCH */

	/* Edytuj nagłówek tagu, aby przejść na inny tag */

	function tagHeaderEditableWatcher()
	{
		if (settings.tagHeaderEditable)
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





	/* RIGHT SIDEBAR - DODAJ LISTE OBSERWOWANYCH TAGÓW */
	function addObservedTagsToRightSidebar()
	{
		let observedTagsArray = [];

		if (settings.observedTagsInRightSidebarEnable)
		{
			consoleX("addObservedTagsToRightSidebar()", 1)

			checkLocalForageupdatedDate(localStorageObservedTags, getObservedTags, settings.observedTagsInRightSidebarUpdateInterval * 3600);

			let section_html = `
				<section class="wykopx_your_observed_tags custom-sidebar tags-sidebar" data-v-3f88526c="" data-v-89888658="" data-v-5d67dfc3="">
					<header class="" data-v-3f88526c="" >
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

			localStorageObservedTags.iterate(function (value, key, iterationNumber)
			{
				// console.log("value" + value)
				// console.log("key" + key)
				if (key != "storageUpdatedDate")
				{
					observedTagsArray.push(value)
				}
			})
				.then(function ()
				{
					// console.log("then - observedTagsArray:")
					// console.log(observedTagsArray);
					if (settings.observedTagsInRightSidebarSortAlphabetically)
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
		// consoleX("checkLocalForageupdatedDate", 1)
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

				localStorageObservedTags.setItem("storageUpdatedDate", dayjs())

				observedTagsArray.forEach(function (tag)
				{
					localStorageObservedTags.setItem(tag.name, tag.name)
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











	function addSwitchButtons()
	{
		let buttonsWrapper = document.createElement("section");
		buttonsWrapper.classList.add("wxs_switches_container");

		buttonsWrapper.innerHTML = `<datalist id="markers">
										<option value="-1" label="OFF"></option>
										<option value="0" label=""></option>
										<option value="1" label="ON">ON</option>
									</datalist>`;

		if (settings.wxsSwitchByUserColor)
		{
			buttonsWrapper.innerHTML += `<div class="wxs_switch switchByUserColor">
											<div>
												<label class="label_OFF_0">Kolory</label>
												<label class="label_ON_PLUS_1">Bez zielonek</label>
												<label class="label_ON_PLUS_2">Tylko bordo</label>
											</div>
											<div>
												<input type="range" id="switchByUserColor" list="markers" name="switchByUserColor" min="0" max="2" step="1" value="0" />
											</div>
										</div>`;
		}
		if (settings.wxsSwitchByUserGender)
		{
			buttonsWrapper.innerHTML += `<div class="wxs_switch switchByUserGender">
											<div>
												<label class="label_ON_MINUS_1" title="">Bez różowych</label>
												<label class="label_OFF_0">Różowe</label>
												<label class="label_ON_PLUS_1" title="">Tylko różowe</label>
											</div>
											<div>
												<input type="range" id="switchByUserGender" list="markers" name="switchByUserGender" min="-1" max="1" step="1" value="0" />
											</div>
										</div>`;
		}
		if (settings.wxsSwitchNSFW)
		{
			buttonsWrapper.innerHTML += `<div class="wxs_switch switchEntriesNSFW showOnLinksStream showOnEntriesStream showOnEntryPage">
											<div>
												<label class="label_ON_MINUS_1" title=" Wpisy z tagiem #nsfw są ukryte">Bez #nsfw</label>\
												<label class="label_OFF_0">#nsfw</label>
												<label class="label_ON_PLUS_1" title=" Wyświetlane są tylko wpisy z tagiem #nsfw">Tylko #nsfw</label>
											</div>
											<div>
												<input type="range" id="switchEntriesNSFW"  list="markers" name="switchEntriesNSFW" min="-1" max="1" step="1" value="0" />
											</div>
										</div>`;
		}
		if (settings.wxsSwitchAdult)
		{
			buttonsWrapper.innerHTML += `<div class="wxs_switch switchEntriesAdult showOnLinksStream showOnEntriesStream showOnEntryPage">
											<div>
												<label class="label_ON_MINUS_1" title=" Treści oznaczne jako materiały 18+ są ukryte">Bez 18+</label>\
												<label class="label_OFF_0">18+</label>
												<label class="label_ON_PLUS_1" title=" Wyświetlane są tylko treści oznaczone jako 18+ ">Tylko 18+</label>
											</div>
											<div>
												<input type="range" id="switchEntriesAdult" list="markers" name="switchEntriesAdult" min="-1" max="1" step="1" value="0" />
											</div>
										</div>`;
		}
		if (settings.wxsSwitchPhotoViewer)
		{
			buttonsWrapper.innerHTML += `<div class="wxs_switch switchEntriesPhotoViewer showOnEntriesStream">
											<div>
												<label class="label_ON_MINUS_4" title=" Pokazuje tylko wpisy, które mają sam tekst. Ukrywa wszystkie wpisy z obrazkami, GIF-ami i dołączonymi filmikami wideo z YouTube lub Streamable">Bez mediów</label>
												<label class="label_ON_MINUS_3" title=" Pokazuje tylko wpisy, które nie mają obrazków. Ukrywa wszystkie wpisy z obrazkami lub GIF-ami">Bez obrazków</label>
												<label class="label_ON_MINUS_2" title=" Ukrycie obrazków">Ukryj obrazki</label>
												<label class="label_ON_MINUS_1">Tylko z obrazkami</label>
												<label class="label_OFF_0">Obrazki</label>
												<label class="label_ON_PLUS_1">PhotoViewer</label>
												<label class="label_ON_PLUS_2">PhotoViewer Ultra</label>
											</div>
											<div>
												<input type="range" id="switchEntriesPhotoViewer" list="markers" name="switchEntriesPhotoViewer" min="-4" max="2" step="1" value="0" />
											</div>
										</div>`;
		}
		if (settings.wxsSwitchTags)
		{
			buttonsWrapper.innerHTML += `<div class="wxs_switch switchEntriesTags showOnEntriesStream">
											<div>
												<label class="label_ON_MINUS_1" title=" Wyświetlane są tylko wpisy nie zawierające w treści żadnych #tagów.\n Wpisy zawierające jakiekolwiek #tagi są ukryte">Tylko nocna</label>\
												<label class="label_OFF_0">#tagi</label>
												<label class="label_ON_PLUS_1" title=" Wyświetlane są tylko wpisy zawierające minimum jeden #tag.\n Wpisy bez żadnego #tagu są ukryte.">Tylko #tagi</label>
											</div>
											<div>
												<input type="range" id="switchEntriesTags" list="markers" name="switchEntriesTags" min="-1" max="1" step="1" value="0" />
											</div>
										</div>`;
		}


		const nav = document.querySelector("body header div.right nav");
		nav.parentNode.insertBefore(buttonsWrapper, nav);
	}


	function switchChanged(PointerEvent, cssFilterName)
	{
		/*
			this -> clicked element == event.target
			PointerEvent - even object
		*/
		//document.body.dataset[cssFilterName] = this.value;	//	<body data-wxs_switch_nsfw="1"]
		if (this.value == 0) document.body.dataset[cssFilterName] = "OFF_0";	//	<body data-wxs_switch_nsfw="OFF"]
		else if (this.value > 0) document.body.dataset[cssFilterName] = `ON_PLUS_${this.value}`;	//	<body data-wxs_switch_nsfw="ON_PLUS_1"]  // "ON_PLUS_1", "ON_PLUS_2", "ON_PLUS_3"
		else document.body.dataset[cssFilterName] = `ON_MINUS_${Math.abs(this.value)}`;	//		<body data-wxs_switch_nsfw="ON_MINUS_1"]			<body data-wxs_switch_nsfw="-1"]
	}



	if (settings.wxsSwitchesEnable)
	{
		document.addEventListener("click", (event) =>
		{
			if (settings.wxsSwitchNSFW && event.target.closest("input#switchEntriesNSFW")) switchChanged.call(event.target, event, "wxs_switch_entries_nsfw");
			else if (settings.wxsSwitchAdult && event.target.closest("input#switchEntriesAdult")) switchChanged.call(event.target, event, "wxs_switch_entries_adult");
			else if (settings.wxsSwitchPhotoViewer && event.target.closest("input#switchEntriesPhotoViewer")) switchChanged.call(event.target, event, "wxs_switch_entries_photo_viewer");
			else if (settings.wxsSwitchTags && event.target.closest("input#switchEntriesTags")) switchChanged.call(event.target, event, "wxs_switch_entries_tags");
			else if (settings.wxsSwitchByUserColor && event.target.closest("input#switchByUserColor")) switchChanged.call(event.target, event, "wxs_switch_by_user_color");
			else if (settings.wxsSwitchByUserGender && event.target.closest("input#switchByUserGender")) switchChanged.call(event.target, event, "wxs_switch_by_user_gender");
		});
	}

	// ACTION BOX BUTTONS
	document.addEventListener("click", (event) =>
	{
		if (settings.actionBoxEnable)
		{
			if (settings.textsaverEnable)
			{
				if (event.target.closest("button.wxs_save")) saveThisEntryContent.call(event.target, event); // TODO
			}

			if (settings.filterUserComments || settings.filterUserReplies)
			{
				if (event.target.closest("button.wxs_filter_off")) filterUserOff.call(event.target, event);

				if (settings.filterUserComments)
				{
					if (event.target.closest("button.wxs_filter_on_user")) filterUserComments.call(event.target, event, "userComments");
				}
				if (settings.filterUserReplies)
				{
					if (event.target.closest("button.wxs_filter_on_replies")) filterUserComments.call(event.target, event, "userReplies");
				}
			}

			if (settings.mirkoukrywaczEnable)
			{
				if (event.target.closest("button.wxs_minimize")) minimizeThisEntry.call(event.target, event);
				if (event.target.closest("button.wxs_maximize")) maximizeThisEntry.call(event.target, event);
				if (event.target.closest("button.wxs_hide")) hideThisEntry.call(event.target, event);


				if (event.target.closest(".wykopx_mirkoukrywacz_unhide")) maximizeThisEntry.call(event.target, event, event.target.dataset.wxs_object_id);

			}
		}

		if (settings.mirkoukrywaczEnable)
		{
			if (event.target.closest("#wxs_mirkoukrywacz_delete_all")) mirkoukrywaczRemoveTooOld.call(event.target, event,
				{
					days: 0,
					blockingType: "all",
					resource: "all",
				});

			if (event.target.closest("#wxs_mirkoukrywacz_delete_older_than_7_days"))
			{
				mirkoukrywaczRemoveTooOld.call(event.target, event, {
					days: document.getElementById("wxs_mirkoukrywacz_delete_timespan").value,
					blockingType: document.getElementById("wxs_mirkoukrywacz_delete_block_type").value,
					resource: document.getElementById("wxs_mirkoukrywacz_delete_resource").value,
				});
			}
		}

	});











	/* ---------------- MIRKOUKRYWACZ  MENU  ----------------- */
	function saveThisEntryContent(PointerEvent)
	{
		console.log(this)

		let resource = "unknown";
		let entry_stream = this?.closest(".stream");
		if (entry_stream)
		{
			if (entry_stream.classList.contains("microblog")) resource = "entry";
			else if (entry_stream.classList.contains("entry-comments")) resource = "entry";
			else if (entry_stream.classList.contains("entry-subcomments")) resource = "entry-subcomments";
			else if (entry_stream.classList.contains("link-comments")) resource = "link-comments";

			let entry = this.closest(".entry");
			let comment_id = entry.id.split("-")[1];
			let username = entry.querySelector("a.username span").innerText;
			let text = entry.querySelector("div.content div.wrapper").innerText.replace(/\n/g, " ");

			let grandcomment_id = comment_id; /* id nad-komentarza */
			if (resource == "entry-subcomments")
			{
				let entry_grandparent = entry.parentNode.closest(".entry");
				grandcomment_id = entry_grandparent.id.split("-")[1];
			}
			mirkoukrywaczBlockNewElement(entry.id, grandcomment_id, username, text, resource, "saved");
		}
	}

	function filterUserOff(PointerEvent)
	{
		delete document.body.dataset.wxs_filter // <body data-wxs_filter>
		delete document.body.dataset.wxs_filter_style

		const styleElement = document.getElementById('wxs_css_filter_user_comments');
		if (styleElement) styleElement.parentNode.removeChild(styleElement);
	}
	function filterUserComments(PointerEvent, filterType)
	{
		// filterUserComments
		// filterType // "userComments" / "userReplies"
		/*
		this -> clicked element == event.target
		PointerEvent - even object
		*/

		// alert(filterType);

		const css_id = "wxs_css_filter_user_comments";

		const filterUsername = this.dataset.wxs_author_username;
		const filterUserGender = this.dataset.wxs_author_gender;

		let filterStyles = [
			`display: none!important; `,
			`border: 3px solid gray!important; opacity: 0.3!important; `,
			`filter: grayscale(1); `,
		]
		let filterStyleIndex = 0;
		let wxs_css_style_filter_user_comments = document.getElementById(css_id);

		if (wxs_css_style_filter_user_comments)
		{
			if (document.body.dataset.wxs_filter == filterType) // ten sam typ filtra, zmiana stylu
			{
				let currentFilterStyleIndex = parseInt(document.body.dataset.wxs_filter_style);

				// filterStyleIndex = (currentFilterStyleIndex + 1) % filterStyles.length; // loop 0-2
				filterStyleIndex = currentFilterStyleIndex + 1;
				if (filterStyleIndex == filterStyles.length)
				{
					filterUserOff();
					return false;
				}
			}
			else // zamiana typu filtra, zachowujemy ten sam styl
			{
				filterStyleIndex = parseInt(document.body.dataset.wxs_filter_style);
			}
		}
		document.body.dataset.wxs_filter_style = filterStyleIndex.toString()


		let css = "";

		if (filterType == "userComments")
		{
			document.body.dataset.wxs_filter = "userComments"; // <body data-wxs_filter="userComments">

			css = `.wxs_menu_action_box > .wxs_filter_off { display: flex!important; }

		/* odfiltrowane znaleziska */
		body > section > div.main - content > main.main > section > div.content > section: is(.bucket - page, .search - page, .category - page, .favourites - page, .home - page, .observed - page, .profile - page, .tag - page, .hits - page, .upcoming - page) > section section.stream > div.content > section.link - block: has(article > div.content > section.info a.username[href = "/ludzie/${filterUsername}"])
		{
			border: 1px solid ${filterUserGender == "f" ? "var(--rozowyPasek1, rgba(192, 72, 167, 1))" : "var(--niebieskiPasek1, rgba(67, 131, 175, 1))"} !important;
		}


		/* strona wpisu - filtrowane komentarze */
		body > section > div.main - content > main.main > section > div.content > section.entry - page > section.entry > section.entry - comments > div.content > section.entry.detailed > div.comments > section.stream.entry - subcomments > div.content > section.entry.reply: has(> article > header > div.right a.username[href = "/ludzie/${filterUsername}"]),

			/* strona streamu wpisów - wpisy filtrowanego użytkownika */
			body > section > div.main - content > main.main > section > div.content > section: is(.bucket - page, .search - page, .category - page, .favourites - page, .observed - page, .profile - page, .tag - page, .microblog - page) > section section.stream > div.content > section.entry: has(> article > header > div.right a.username[href = "/ludzie/${filterUsername}"]),

				/* strona streamu wpisów - komentarze filtrowanego użytkownika */
				body > section > div.main - content > main.main > section > div.content > section: is(.bucket - page, .search - page, .category - page, .favourites - page, .observed - page, .profile - page, .tag - page, .microblog - page) > section section.stream > div.content > section.entry > div.comments > section.stream.entry - subcomments > div.content > section.entry.reply: has(> article > header > div.right a.username[href = "/ludzie/${filterUsername}"]),

					/* strona znaleziska - komentarze i subkomentarze filtrowanego użytkownika */
					body > section > div.main - content > main.main > section > div.content > section.link - page > section.link > section.comments > section.stream.link - comments > div.content section.entry: has(> article > header > div.right a.username[href = "/ludzie/${filterUsername}"])
		{
			border: 1px solid ${filterUserGender == "f" ? "var(--rozowyPasek1, rgba(192, 72, 167, 1))" : "var(--niebieskiPasek1, rgba(67, 131, 175, 1))"} !important;
		}





		/* strony ze znaleziskami oprócz głównej - znaleziska autora, odfiltrowwanie znalezisk innych użytkowników */
		body > section > div.main - content > main.main > section > div.content > section: is(.bucket - page, .search - page, .category - page, .favourites - page, .home - page, .observed - page, .profile - page, .tag - page, .hits - page, .upcoming - page) > section section.stream > div.content > section.link - block: not(: has(article > div.content > section.info a.username[href = "/ludzie/${filterUsername}"])),

			/* strona główna - znaleziska autora, odfiltrowwanie znalezisk innych użytkowników a takze wpisow przypietych przez moderacje */
			body > section > div.main - content > main.main > section > div.content > section.home - page > section section.stream > div.content > section: is(.link - block: not(: has(article > div.content > section.info a.username[href = "/ludzie/${filterUsername}"])), .entry: not(: has(> article > header > div.right > div > div.tooltip - slot > span > a.username[href = "/ludzie/${filterUsername}"]))),

				/* strona wpisu - ukrycie komentarzy nie-filtrowanych użytkowników */
				body > section > div.main - content > main.main > section > div.content > section.entry - page > section.entry > section.entry - comments > div.content > section.entry.detailed > div.comments > section.stream.entry - subcomments > div.content > section.entry.reply: not(: has(> article > header > div.right a.username[href = "/ludzie/${filterUsername}"])),

					/* strona streamu wpisów - ukrycie wpisów w ktorych nie ma wypowiedzi filtrowanego uzytkownika - ani wpis, ani komentarz*/
					body > section > div.main - content > main.main > section > div.content > section: is(.bucket - page, .search - page, .category - page, .favourites - page, .observed - page, .profile - page, .tag - page, .microblog - page) > section section.stream > div.content > section.entry: not(: has(article > header > div.right a.username[href = "/ludzie/${filterUsername}"])),

						/* strona streamu wpisów - komentarze pod wpisami na streamach które zawierają komentarz filtrowanego użytkownika */
						body > section > div.main - content > main.main > section > div.content > section: is(.bucket - page, .search - page, .category - page, .favourites - page, .observed - page, .profile - page, .tag - page, .microblog - page) > section section.stream > div.content > section.entry: has(article > header > div.right a.username[href = "/ludzie/${filterUsername}"]) > div.comments > section.stream.entry - subcomments > div.content > section.entry.reply: not(: has(> article > header > div.right a.username[href = "/ludzie/${filterUsername}"])),

							/* strona streamu wpisów - komentarze pod wpisami na streamach które zawierają komentarz filtrowanego użytkownika */
							body > section > div.main - content > main.main > section > div.content > section: is(.bucket - page, .search - page, .category - page, .favourites - page, .observed - page, .profile - page, .tag - page, .microblog - page) > section section.stream > div.content > section.entry: has(article > header > div.right a.username[href = "/ludzie/${filterUsername}"]) > div.comments > section.stream.entry - subcomments > div.content > section.entry.reply: not(: has(> article > header > div.right a.username[href = "/ludzie/${filterUsername}"])),

								/* strona znaleziska - komentarze bez subkomentarzy filtrowanego użytkownika */
								body > section > div.main - content > main.main > section > div.content > section.link - page > section.link > section.comments > section.stream.link - comments > div.content > section.entry: not(: has(div.right > div a.username[href = "/ludzie/${filterUsername}"])),

									/* strona znaleziska - subkomentarze nie-filtrowanego użytkownika */
									body > section > div.main - content > main.main > section > div.content > section.link - page > section.link > section.comments > section.stream.link - comments > div.content > section.entry > div.comments > section.stream.entry - subcomments > div.content > section.entry.reply: not(: has(> article > header > div.right > div a.username[href = "/ludzie/${filterUsername}"]))
		{
					${filterStyles[filterStyleIndex]}
		}



		`;
		}
		else if (filterType == "userReplies")
		{
			document.body.dataset.wxs_filter = "userReplies"; // <body data-wxs_filter="userReplies">

			css = `.wxs_menu_action_box > .wxs_filter_off { display: flex!important; }

		/* WYRÓŻNIENIE KOMENTARZY FILTROWANEGO UŻYTKOWNIKA */
		/* strona wpisu - filtrowane komentarze */
		body > section > div.main - content > main.main > section > div.content > section.entry - page > section.entry > section.entry - comments > div.content > section.entry.detailed > div.comments > section.stream.entry - subcomments > div.content > section.entry.reply: has(> article > header > div.right a.username[href = "/ludzie/${filterUsername}"]),

			/* strona streamu wpisów - wpisy filtrowanego użytkownika */
			body > section > div.main - content > main.main > section > div.content > section: is(.bucket - page, .search - page, .category - page, .favourites - page, .observed - page, .profile - page, .tag - page, .microblog - page) > section section.stream > div.content > section.entry: has(> article > header > div.right a.username[href = "/ludzie/${filterUsername}"]),

				/* strona streamu wpisów - komentarze filtrowanego użytkownika */
				body > section > div.main - content > main.main > section > div.content > section: is(.bucket - page, .search - page, .category - page, .favourites - page, .observed - page, .profile - page, .tag - page, .microblog - page) > section section.stream > div.content > section.entry > div.comments > section.stream.entry - subcomments > div.content > section.entry.reply: has(> article > header > div.right a.username[href = "/ludzie/${filterUsername}"]),

					/* strona znaleziska - komentarze i subkomentarze filtrowanego użytkownika */
					body > section > div.main - content > main.main > section > div.content > section.link - page > section.link > section.comments > section.stream.link - comments > div.content section.entry: has(> article > header > div.right a.username[href = "/ludzie/${filterUsername}"])

		{
			border: 2px solid ${filterUserGender == "f" ? "var(--rozowyPasek1, rgba(192, 72, 167, 1))" : "var(--niebieskiPasek1, rgba(67, 131, 175, 1))"} !important;
		}


		/* WYRÓŻNIENIE ODPOWIEDZI Z OZNACZONYM FILTROWANYM UŻYTKOWNIKIEM  */
		/* strona wpisu - filtrowane komentarze */
		body > section > div.main - content > main.main > section > div.content > section.entry - page > section.entry > section.entry - comments > div.content > section.entry.detailed > div.comments > section.stream.entry - subcomments > div.content > section.entry.reply: has(> article > div.edit - wrapper > div.content > section.entry - content > div.wrapper > a[href = "/ludzie/${filterUsername}"]),


			/* strona streamu wpisów - komentarze z oznaczonym wołaniem filtrowanego użytkownika */
			body > section > div.main - content > main.main > section > div.content > section: is(.bucket - page, .search - page, .category - page, .favourites - page, .observed - page, .profile - page, .tag - page, .microblog - page) > section section.stream > div.content > section.entry > div.comments > section.stream.entry - subcomments > div.content > section.entry.reply: has(> article > div.edit - wrapper > div.content > section.entry - content > div.wrapper a[href = "/ludzie/${filterUsername}"]),

				/* strona znaleziska - komentarze i subkomentarze filtrowanego użytkownika */
				body > section > div.main - content > main.main > section > div.content > section.link - page > section.link > section.comments > section.stream.link - comments > div.content section.entry: has(> article > header > div.right a.username[href = "/ludzie/${filterUsername}"])

		{
			border: 2px solid var(--nicknameOrange1, rgba(255, 89, 23, 1))!important;
		}


		/* wyróżnienie tagowanego w odpowiedzi */
		section.entry.reply > article > div.edit - wrapper > div.content > section.entry - content > div.wrapper > a[href = "/ludzie/${filterUsername}"]
		{
			background - color: var(--whiteOpacity1);
			padding: 0px 5px 0px 5px;
			margin - right: 5px;
			border - bottom: 1px solid;
			font - weight: bolder!important;
		}


		/* UKRYCIE KOMENTARZY, KTÓRE NIE SĄ FILTROWANEGO UŻYTKOWNIKA ANI NIE WOŁAJĄ FILTROWANEGO UŻYTKOWNIKA */

		/* strona wpisu - ukrycie komentarzy nie-filtrowanych użytkowników */
		body > section > div.main - content > main.main > section > div.content > section.entry - page > section.entry > section.entry - comments > div.content > section.entry.detailed > div.comments > section.stream.entry - subcomments > div.content > section.entry.reply: not(: has(> article > header a.username[href = "/ludzie/${filterUsername}"], > article > div.edit - wrapper > div.content > section.entry - content > div.wrapper a[href = "/ludzie/${filterUsername}"])),

			/* strona streamu wpisów - ukrycie wpisów i komentarzy które nie są wypowiedziami filtrowanego uzytkownika ani nie zawierają w treści otagowanego filtrowanego użytkownika */
			body > section > div.main - content > main.main > section > div.content > section: is(.bucket - page, .search - page, .category - page, .favourites - page, .observed - page, .profile - page, .tag - page, .microblog - page) > section section.stream > div.content > section.entry: not(: has(div > a[href = "/ludzie/${filterUsername}"])),

				/* strona znaleziska - komentarze bez subkomentarzy filtrowanego użytkownika */
				body > section > div.main - content > main.main > section > div.content > section.link - page > section.link > section.comments > section.stream.link - comments > div.content > section.entry: not(: has(a.username[href = "/ludzie/${filterUsername}"])),

					/* strona znaleziska - subkomentarze nie-filtrowanego użytkownika */
					body > section > div.main - content > main.main > section > div.content > section.link - page > section.link > section.comments > section.stream.link - comments > div.content > section.entry > div.comments > section.stream.entry - subcomments > div.content > section.entry.reply: not(: has(a.username[href = "/ludzie/${filterUsername}"]))
		{
					${filterStyles[filterStyleIndex]}
		}



		`;
		}

		console.log("css");
		console.log(css);

		if (wxs_css_style_filter_user_comments)
		{
			wxs_css_style_filter_user_comments.textContent = css;
		}
		else
		{
			wxs_css_style_filter_user_comments = document.createElement('style');
			wxs_css_style_filter_user_comments.id = css_id;
			wxs_css_style_filter_user_comments.dataset.wxs_filter_type = filterStyleIndex;

			wxs_css_style_filter_user_comments.appendChild(document.createTextNode(css));
			document.head.appendChild(wxs_css_style_filter_user_comments);
		}

	}

	function minimizeThisEntry(PointerEvent)		// PointerEvent.altKey, .ctrlKey, .shiftKey, .target (Element)
	{
		let sectionEntry = this?.closest('.entry');
		if (sectionEntry)
		{
			mirkoukrywaczBlockNewElement(sectionEntry, undefined, "minimized");
		}
	}

	function maximizeThisEntry(PointerEvent, object_id)
	{
		console.log("maximizeThisEntry", this)
		let sectionEntry = this?.closest('.entry');
		if (sectionEntry)
		{
			mirkoukrywaczUnblockElement(sectionEntry);
		}
		else if (object_id)
		{
			mirkoukrywaczUnblockElement(undefined, object_id);
		}
	}

	// UKRYWANIE WPISU I KOMENTARZY - DODAWANIE DO MIRKOUKRYWACZA
	function hideThisEntry(PointerEvent)
	{
		console.log("--- hide this, this:")

		let resource = this.dataset.wxs_resource;

		let entry_stream = this?.closest(".stream");
		if (entry_stream)
		{
			let sectionObject;

			if (resource == "entry" || resource == "entry_comment" || resource == "link_comment")
			{
				sectionObject = this.closest(".entry");
			}
			else if (resource == "link")
			{
				sectionObject = this.closest('.link-block');
			}
			console.log("sectionObject");
			console.log(sectionObject);

			if (sectionObjectIntersectionObserver) sectionObjectIntersectionObserver.unobserve(sectionObject);
			mirkoukrywaczBlockNewElement(sectionObject, null, "hidden");
			sectionObject.remove();
		}
	}




	// TODO

	// function autoOpenAllCommentsEverywhere()
	// {
	// 	if (settings.autoOpenSpoilersEverywhere) 
	// 	{
	// 		let showAllCommentsButtons = document.querySelectorAll("div.comments > footer > div.button > button.target");

	// 		if (showAllCommentsButtons?.length > 0)
	// 		{
	// 			showAllCommentsButtons.forEach(button =>
	// 			{
	// 				button.style.border = "2px solid red!important";
	// 				button.click()
	// 			});
	// 			consoleX(`Automatycznie rozwinięto ${ showAllCommentsButtons.length } spoilerów`);
	// 		}
	// 	}
	// }




	// calls Wykop API url: getWykopAPIData("profile") -> https://wykop.pl/api/v3/profile
	// getWykopAPIData("profile", "users", username } -> https://wykop.pl/api/v3/profile/users/NadiaFrance
	async function getWykopAPIData(...pathAPIargs)
	{
		//console.log("getWykopAPIData(), pathAPIargs: ", pathAPIargs)
		try
		{
			const response = await fetch(`https://wykop.pl/api/v3/${pathAPIargs.join('/')}`, {
				method: "GET", // or 'PUT'
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + window.localStorage.token,
				},
			});

			console.log("getWykopAPIData, URL: " + `https://wykop.pl/api/v3/${pathAPIargs.join('/')}`)
			// console.log(response)

			if (!response.ok)
			{
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			// console.log("getWykopAPIData - data from API: ")
			// console.log(data)
			return data;

		} catch (error)
		{
			console.error(`Fetch failed: ${error}`);
			throw error;
		}
	}



























	/* INTERSECTION OBSERVER */





	// dla każdego wpisu i komentarza
	// strona wpisu, caly wpis: section:is(.entry:has(> article), .link-block:has(> section > article)):not(.deleted)

	// tylko czesc wpisu bez komentarzy "section.entry:not(.deleted):has(> article), section.link-block:not(.deleted) > section > article)
	/// :not(.deleted)
	waitForKeyElements("section.entry:has(> article), section.link-block:not(.premium-pub, .market-pub):has(> section > article)", sectionObjectDetected, false);
	function sectionObjectDetected(jNodeSectionElement)
	{
		// console.log(`waitForKeyElements("section is(.entry > article, .link - block: has(> section > article)): not(.deleted)"`)
		const sectionObjectElement = jNodeSectionElement[0];
		sectionObjectIntersectionObserver.observe(sectionObjectElement);
	}



	function replaceDigitsWithDot(num)
	{
		if (num < 100)
		{
			return num.toString().slice(0, -1) + " ·";
		} else
		{
			return num.toString().slice(0, -2) + " · ·";
		}
	}


	// INTERSECTION OBSERVED

	const sectionObjectsAreIntersecting = async (intersectingObject, observer) =>
	{
		intersectingObject.forEach(async (IntersectionObserverEntry) =>															// InterIntersectionObserverEntry
		{


			// ----- ALL INTERSECTIONS CHANGED 

			let sectionObjectElement = IntersectionObserverEntry.target;														// element <section class="entry"> 
			let resource = null;		// resource = "link", "entry", "entry_comment"
			// console.log("XXX: sectionObjectElement")
			// console.log(sectionObjectElement);




			// ----- INTERSECTION CHANGED FOR THE FIRST TIME:

			if (!sectionObjectElement.dataset.wxs_first_load_time) 
			{
				// data-wxs_first_load_time="2024-12-12..."
				sectionObjectElement.dataset.wxs_first_load_time = dayjs().valueOf(); // data unix kiedy przybyly ostatnio odswiezone plusy - tutaj czas załadowania strony
				resource = sectionObjectElement.__vue__.item.resource;


				// wpisy i komentarze
				if (resource != "link") 
				{
					if (settings.checkEntryPlusesEnable && settings.checkEntryPlusesPerHour && !sectionObjectElement.dataset.wxs_first_load_votes_count)
					{
						sectionObjectElement.dataset.wxs_first_load_votes_count = sectionObjectElement.__vue__.item.votes.up - sectionObjectElement.__vue__.item.votes.down;
					}

					sectionObjectElement.style.setProperty('--votesUp', `"+${sectionObjectElement.__vue__.item.votes.up}"`);
					sectionObjectElement.style.setProperty('--votesDown', `"+${sectionObjectElement.__vue__.item.votes.down}"`);
					sectionObjectElement.dataset.wxs_votes_up = sectionObjectElement.__vue__.item.votes.up;
					sectionObjectElement.dataset.wxs_votes_down = sectionObjectElement.__vue__.item.votes.down;
					sectionObjectElement.dataset.wxs_voted = sectionObjectElement.__vue__.item.voted;
					sectionObjectElement.dataset.wxs_first_load_votes_count = sectionObjectElement.__vue__.item.votes.up - sectionObjectElement.__vue__.item.votes.down;
					sectionObjectElement.dataset.wxs_votes_count = sectionObjectElement.__vue__.item.votes.up - sectionObjectElement.__vue__.item.votes.down;
					sectionObjectElement.dataset.wxs_votes_all = sectionObjectElement.__vue__.item.votes.up + sectionObjectElement.__vue__.item.votes.down;


					if (resource == "entry") // tu moglyby byc jeszcze komentarze w znaleziskach
					{
						// sprawdzenie czy wpis zawiera grę w plusowanie
						if (settings.checkEntryPlusesForVotingGame)
						{
							var substrings = ["tnia cyfra", "cyfra powie", "niej cyfry", "iczba po zaplus", "yfra po zaplus"];
							var containsSubstring = substrings.some(substring => sectionObjectElement.__vue__.item.content.includes(substring));

							if (containsSubstring)
							{
								sectionObjectElement.dataset.wxs_voting_game = "true";
								//sectionObjectElement.style.setProperty('--votesUpHidden', `"+${replaceDigitsWithDot(sectionObjectElement.__vue__.item.votes.up)}"`);
								sectionObjectElement.style.setProperty('--votesUpHidden', `"` + replaceDigitsWithDot(sectionObjectElement.__vue__.item.votes.up) + `"`);
								let votingGameLastDigit = sectionObjectElement.__vue__.item.votes.up + 1; // ostatnia cyfra po zaplusowaniu
								votingGameLastDigit = votingGameLastDigit.toString().slice(-1);
								sectionObjectElement.style.setProperty('--votingGameLastDigit', `"` + votingGameLastDigit + `"`);
							}
						}

						if (settings.checkEntryCommentsPerHour && !sectionObjectElement.dataset.wxs_first_load_comments_count)
						{
							sectionObjectElement.dataset.wxs_first_load_comments_count = sectionObjectElement.__vue__.item.comments.count;
						}
					}
				}
				else if (resource == "link")
				{
					if (settings.checkLinkVotesEnable && settings.checkLinkVotesPerHour && !sectionObjectElement.dataset.wxs_first_load_votes_count)
					{
						sectionObjectElement.style.setProperty('--votesUp', `"+${sectionObjectElement.__vue__.item.votes.up}"`);
						sectionObjectElement.style.setProperty('--votesDown', `"+${sectionObjectElement.__vue__.item.votes.down}"`);
						sectionObjectElement.dataset.wxs_votes_up = sectionObjectElement.__vue__.item.votes.up;
						sectionObjectElement.dataset.wxs_votes_down = sectionObjectElement.__vue__.item.votes.down;
						sectionObjectElement.dataset.wxs_voted = sectionObjectElement.__vue__.item.voted;
						sectionObjectElement.dataset.wxs_first_load_votes_count = sectionObjectElement.__vue__.item.votes.up - sectionObjectElement.__vue__.item.votes.down;
						sectionObjectElement.dataset.wxs_votes_count = sectionObjectElement.__vue__.item.votes.up - sectionObjectElement.__vue__.item.votes.down;
						sectionObjectElement.dataset.wxs_votes_all = sectionObjectElement.__vue__.item.votes.up + sectionObjectElement.__vue__.item.votes.down;
					}
					if (settings.checkLinkCommentsPerHour && !sectionObjectElement.dataset.wxs_first_load_comments_count)
					{
						if (!sectionObjectElement.dataset.wxs_first_load_time) sectionObjectElement.dataset.wxs_first_load_time = dayjs().valueOf(); // data unix kiedy przybyly ostatnio odswiezone plusy - tutaj czas załadowania strony
						sectionObjectElement.dataset.wxs_first_load_comments_count = sectionObjectElement.__vue__.item.comments.count;
					}
				}

				pageTotalVotesUpCount += sectionObjectElement.__vue__.item.votes.up;
			}



			// ----- INTERSECTING OBJECT IS VISIBLE


			// IS INTERSECTING!
			if (IntersectionObserverEntry.isIntersecting)
			{
				if (!resource) resource = sectionObjectElement.__vue__.item.resource;

				let object_id = sectionObjectElement.id;  						// object_id > id="comment-1234567"
				let id = sectionObjectElement.__vue__.item.id;					// id > 1234567
				let parent_resource, parent_id;

				//	ZA KAŻDYM RAZEM GDY POJAWIA SIE NA EKRANIE:
				sectionObjectElement.classList.add("isIntersecting");
				sectionObjectElement.classList.remove("notIntersecting");


				// ZNALEZISKO WIĘC WŁĄCZAMY ANALIZĘ ZNALEZISKA
				if (resource == "link") 
				{
					if (settings.checkLinkVotesEnable)
					{
						// TODO sprawdzanie wykopow na zywo
					}
				}
				// WPISY I KOMENTARZE
				else
				{
					if (settings.checkEntryPlusesEnable)
					{
						// tylko wpisy i komentarze, które mają minimum X plusów i nie są starsze niż Y dni
						if ((sectionObjectElement.__vue__.item.votes.up > votesFetchingLimitMinimumVotes || sectionObjectElement.__vue__.item.votes.down > votesFetchingLimitMinimumVotes) && loadTime.diff(dayjs(sectionObjectElement.__vue__.item.created_at), 'hour') < votesFetchingLimitMaximumHoursOld)
						{
							let timeoutId = null


							let i = 1;
							let timeoudId = setTimeout(function checkPlusesAgain()
							{
								checkPluses(sectionObjectElement, undefined, true);

								if (sectionObjectElement.classList.contains("isIntersecting"))
								{

									if ((sectionObjectElement.dataset.wxs_votes_fetch_high_frequency)
										|| ((loadTime.diff(dayjs(sectionObjectElement.__vue__.item.created_at), 'hour') < votesFetchingHigherFrequencyLimitMaximumHoursOld)
											&& sectionObjectElement.__vue__.item.votes.up > votesFetchingHigherFrequencyLimitMinimumVotes))
									{
										if (!sectionObjectElement.dataset.wxs_votes_fetch_high_frequency) sectionObjectElement.dataset.wxs_votes_fetch_high_frequency = "true";
										setTimeout(checkPlusesAgain, votesFetchingHigherFrequencyDelayInSeconds * 1000)
									}
									else
									{
										setTimeout(checkPlusesAgain, votesFetchingOngoingDelayInSeconds * 1000)
									}
								}
							}, votesFetchingFirstDelayInSeconds * 1000);

							// ZABAWA W PLUSY
							if (resource == "entry" && settings.checkEntryPlusesForVotingGame)
							{

							}
						}

					}
				}


				// ----- IS VISIBLE FOR THE FIRST TIME



				// GDY PIERWSZY RAZ WIDZIMY WPIS/KOMENTARZ/ZNALEZISKO
				if (!sectionObjectElement.classList.contains("wasIntersecting"))
				{


					sectionObjectElement.classList.add("wasIntersecting");


					// ZNALEZISKO WIĘC WŁĄCZAMY ANALIZĘ ZNALEZISKA
					if (resource == "link")
					{
						if (settings.linksAnalyzerEnable)
						{
							linkSectionIntersected(sectionObjectElement)  // waitForKeyElements(`section.link-block[id^="link-"]`, , false);  // GM_wrench.waitForKeyElements(`section.link-block[id^="link-"]`, linkSectionIntersected, false);
						}
					}
					// WPISY, KOMENTARZE POD WPISAMI, KOMENTARZE POD ZNALEZISKAMI, 
					else
					{

						const ratingBoxSection = sectionObjectElement.querySelector(".rating-box")
						if (settings.votingExplosionEnable || settings.checkEntryPlusesWhenVoting) votingEventListener(sectionObjectElement, ratingBoxSection);



						if (ratingBoxSection && settings.checkEntryPlusesEnable && settings.checkEntryPlusesPerHour)
						{
							if ((sectionObjectElement.__vue__.item.votes.up > votesFetchingLimitMinimumVotes || sectionObjectElement.__vue__.item.votes.down > votesFetchingLimitMinimumVotes) && loadTime.diff(dayjs(sectionObjectElement.__vue__.item.created_at), 'day') < votesFetchingLimitMaximumHoursOld)
							{
								let wxs_votes_per_hourDivElement = document.createElement("div");
								wxs_votes_per_hourDivElement.classList = "wxs_votes_per_hour";
								ratingBoxSection.appendChild(wxs_votes_per_hourDivElement);
							}

						}
					}


					if (sectionObjectElement.__vue__.item.parent)
					{
						parent_resource = sectionObjectElement.__vue__.item.parent.resource;		// data-wxs_parent_resource="entry"
						parent_id = sectionObjectElement.__vue__.item.parent.id;					// data-wxs_parent_id="1234567"
					}


					// TWORZYMY ACTION BOX
					if (settings.actionBoxEnable)
					{
						const wxs_author_username = sectionObjectElement.__vue__.item.author.username;
						const wxs_author_gender = sectionObjectElement.__vue__.item.author.gender;


						let wxs_menu_action_box = document.createElement("div");
						wxs_menu_action_box.classList.add("wxs_menu_action_box"); // 📰📑 🔖 ⎀⎊👁 🖾 🗙 ⌧ ⮽ 🗳 ☒ 🗵 🗷- ‐ ‑ – ‒ — ― _ ﹏🗖 ⎀ ⎊

						let wxs_menu_action_box_css = ``;


						if (settings.filterUserComments || settings.filterUserReplies)
						{
							wxs_menu_action_box_css += `<button data-wxs_object_id="${object_id}" data-wxs_id="${id}" data-wxs_resource="${resource}" data-wxs_parent_id="${parent_id}" data-wxs_parent_resource="${parent_resource}" data-wxs_author_username="${wxs_author_username}" data-wxs_author_gender="${wxs_author_gender}" class="wxs_filter_off" title=" Wykop X - wyłącz filtrowanie \n \n Pokaż normalnie wszystkie odfiltrowane komentarze / znaleziska \n \n ">❌ Wyłącz filtr</button>`;

							if (settings.filterUserComments)
							{
								wxs_menu_action_box_css += `<button data-wxs_object_id="${object_id}" data-wxs_id="${id}" data-wxs_resource="${resource}" data-wxs_parent_id="${parent_id}" data-wxs_parent_resource="${parent_resource}" data-wxs_author_username="${wxs_author_username}" data-wxs_author_gender="${wxs_author_gender}" class="wxs_filter_on_user" title=" 𝗪𝘆𝗸𝗼𝗽 𝗫 - 𝗳𝗶𝗹𝘁𝗿𝗼𝘄𝗮𝗻𝗶𝗲 𝗸𝗼𝗺𝗲𝗻𝘁𝗮𝗿𝘇𝘆/𝘇𝗻𝗮𝗹𝗲𝘇𝗶𝘀𝗸	\n \n Na stronach zawierających 𝗸𝗼𝗺𝗲𝗻𝘁𝗮𝗿𝘇𝗲 (pod wpisami i pod znaleziskami) \n odfiltrowuje 𝗸𝗼𝗺𝗲𝗻𝘁𝗮𝗿𝘇𝗲 innych użytkowników. \n Pozostawia widoczne wyłącznie 𝗸𝗼𝗺𝗲𝗻𝘁𝗮𝗿𝘇𝗲 tego użytkownika. \n \n Na stronach zawierających 𝘇𝗻𝗮𝗹𝗲𝘇𝗶𝘀𝗸𝗮 (np. główna, wykopalisko) \n odfiltrowuje 𝘇𝗻𝗮𝗹𝗲𝘇𝗶𝘀𝗸𝗮 innych użytkowników. \n Pozostawia widoczne wyłącznie 𝘇𝗻𝗮𝗹𝗲𝘇𝗶𝘀𝗸𝗮 tego użytkownika. \n \n \n Klikając przełączasz tryb filtrowania: \n - Filtr 1: całkowicie ukrywa odfiltrowane komentarze \n - Filtr 2: odfiltrowane komentarze półprzezroczyste \n - Filtr 3: odfiltrowane komentarze czarno białe \n \n ">Filtruj</button>`;
							}
							if (settings.filterUserReplies)
							{
								wxs_menu_action_box_css += `<button data-wxs_object_id="${object_id}" data-wxs_id="${id}" data-wxs_resource="${resource}" data-wxs_parent_id="${parent_id}" data-wxs_parent_resource="${parent_resource}" data-wxs_author_username="${wxs_author_username}" data-wxs_author_gender="${wxs_author_gender}" class="wxs_filter_on_replies" title=" 𝗪𝘆𝗸𝗼𝗽 𝗫 - 𝗳𝗶𝗹𝘁𝗿𝗼𝘄𝗮𝗻𝗶𝗲 𝗱𝘆𝘀𝗸𝘂𝘀𝗷𝗶 𝗶 𝗼𝗱𝗽𝗼𝘄𝗶𝗲𝗱𝘇𝗶 \n \n Odfiltrowuje 𝗸𝗼𝗺𝗲𝗻𝘁𝗮𝗿𝘇𝗲, które nie dotyczą tego użytkownika.  \n \n  Nie ukrywa: \n - komentarzy tego użytkownika \n - odpowiedzi, które zawierają @wołanie tego użytkownika \n \n Klikając przełączasz tryb filtrowania: \n - Filtr 1: całkowicie ukrywa odfiltrowane komentarze \n - Filtr 2: odfiltrowane komentarze półprzezroczyste \n - Filtr 3: odfiltrowane komentarze czarno białe \n \n ">Filtruj @</button>`;
							}


						}
						if (settings.textsaverEnable)
						{
							if (settings.textsaverSaveEntries || settings.textsaverSaveComments)
							{
								wxs_menu_action_box_css += `<button data-wxs_object_id="${object_id}" data-wxs_id="${id}" data-wxs_resource="${resource}" data-wxs_parent_id="${parent_id}" data-wxs_parent_resource="${parent_resource}" data-wxs_author_username="${wxs_author_username}" data-wxs_author_gender="${wxs_author_gender}" class="wxs_save" title=" 𝗪𝘆𝗸𝗼𝗽 𝗫 - 𝘇𝗮𝗽𝗮𝗺𝗶𝗲̨𝘁𝗮𝗷 𝘁𝗿𝗲𝘀́𝗰́ \n \n Treść wybranego wpisu/komentarza zostanie zapisana lokalnie w Twojej przeglądarce. W przypadku późniejszej edycji treści lub usunięcia komentarza, zobaczysz odtworzoną zapisaną przez Wykop X wersję. \n \n ">Zapisz</button>`;
							}
						}
						if (settings.mirkoukrywaczEnable)
						{
							if (settings.mirkoukrywaczHideComments || settings.mirkoukrywaczHideEntries || settings.mirkoukrywaczHideLinks)
							{
								wxs_menu_action_box_css += `<button data-wxs_object_id="${object_id}" data-wxs_id="${id}" data-wxs_resource="${resource}" data-wxs_parent_id="${parent_id}" data-wxs_parent_resource="${parent_resource}" data-wxs_author_username="${wxs_author_username}" data-wxs_author_gender="${wxs_author_gender}" class="wxs_minimize" title="Wykop X Krawężnik - zwiń">[ — ]</button>

								<button data-wxs_object_id="${object_id}" data-wxs_id="${id}" data-wxs_resource="${resource}" data-wxs_parent_id="${parent_id}" data-wxs_parent_resource="${parent_resource}" data-wxs_author_username="${wxs_author_username}" data-wxs_author_gender="${wxs_author_gender}" class="wxs_maximize" title="Wykop X Krawężnik - pokaż cały">[ + ]</button>

								<button data-wxs_object_id="${object_id}" data-wxs_id="${id}" data-wxs_resource="${resource}" data-wxs_parent_id="${parent_id}" data-wxs_parent_resource="${parent_resource}" data-wxs_author_username="${wxs_author_username}" data-wxs_author_gender="${wxs_author_gender}" class="wxs_hide" title="Wykop X Mirkoukrywacz - ukryj"> Ukryj 🗙</button> `;
							}
						}

						// DODAJEMY KRAWĘŻNIK
						wxs_menu_action_box.innerHTML = wxs_menu_action_box_css;
						const sectionEntryHeaderElement = sectionObjectElement.querySelector("article > header");
						sectionEntryHeaderElement.parentNode.insertBefore(wxs_menu_action_box, sectionEntryHeaderElement);
					}




					if (settings.infoboxEnable || settings.notatkowatorEnable)
					{
						// TWORZYMY USERINFOBOX do wszystkich nicków autora tego wpisu/komentarza/linka
						// pierwszy raz widzimy ten wpis / komentarz użytkownika i nie były do niego dodawane userdata więc dodajemy data-wxs_username="NadiaFrance"
						if (!sectionObjectElement.dataset.wxs_username && sectionObjectElement.__vue__?.item?.author?.username)
						{
							let userDataObject = sectionObjectElement.__vue__?.item?.author;

							// POBIERAMY INFORMACJE O UŻYTKOWNIKU Z FETCH API
							if (settings.infoboxEnable)
							{
								userDataObject = await getUserDetailsForUsername(userDataObject, undefined, true); // userDataObject, username, forceAPICheck
							}

							// DODAJEMY INFO NA STRONIE PROFILOWEJ O SZCZEGÓŁACH BANA
							if (settings.infoboxUserBannedInfoOnProfilePage)
							{
								console.log("userDataObject")
								console.log(userDataObject)
								if (userDataObject.status == "banned" && pageType == "profil" && userDataObject.banned?.wxs_info_text_1)
								{
									const bannedRedBox = document.querySelector("aside.profile-top aside.info-box.red p");
									bannedRedBox.innerHTML = `To konto jest obecnie zbanowane. <br/><br/>
								<strong>Wykop X</strong>: <br/>
								${userDataObject.banned?.wxs_info_text_1} <br/>
								<small title=" Czas końca bana dotyczy czasu letniego. \n Wykop posiada błąd i nie rozpoznaje czasu zimowego, \n dlatego zimą i jesienią ban "trwa o godzinę dłużej" niż podany">${userDataObject.banned?.wxs_info_text_2}<br/>
								${userDataObject.banned?.wxs_info_text_3} <span style="cursor: help; padding: 0px 5px">ℹ</span></small>`
								}
							}


							// SPRAWDZENIE I DODANIE NOTATKI ORAZ DANYCH UZYTKOWNIKA
							let userNoteObject = null;
							if (settings.notatkowatorEnable) 
							{
								// jeszcze nie dodawaliśmy notatki
								if (userDataObject.note == true)
								{
									userNoteObject = await getUserNoteObjectByUsername(sectionObjectElement, undefined, true); //  username, forceAPICheck
									sectionObjectElement.dataset.wxs_note_loaded = "true"; // todo nazwa uzytkownika zamiast true zeby potem sprawdzac <section data-wxs_note_loaded="true" data-wxs_username="NadiaFrance" data-wxs_user_note="true">
								}
							}

							createInfoboxDivsForUserEverywhere(userDataObject, userNoteObject, undefined);
						}
					}

					// TODO
					// liczba komentarzy autora wpisu
					if (resource == "entry" && sectionObjectElement.classList.contains("detailed")) 						// jestesmy na stronie wpisu i ta sekcja to glowny wpis
					{
						const wxs_comments_count = sectionObjectElement.__vue__.item.comments.items.length;					// .__vue__.item.comments.count -> bug wykopu - nie dziala, zawsze 0
						sectionObjectElement.dataset.wxs_comments_count = wxs_comments_count;								// <section class="entry detailed" data-wxs_comments-count="99" data-wxs_comments_author_count="12" data-comments-author-percent="10%">

						if (wxs_comments_count > 0)
						{
							const wxs_comments_author_count = sectionObjectElement.__vue__.item.comments.items.filter(comment => comment.author.username === sectionObjectElement.__vue__.item.author.username).length;
							const wxs_comments_author_percent = Math.round(wxs_comments_author_count / wxs_comments_count * 100);
							sectionObjectElement.dataset.wxs_comments_author_count = wxs_comments_author_count;
							sectionObjectElement.dataset.wxs_comments_author_percent = wxs_comments_author_percent;
						}
					}
				}
			}
			else
			{
				// TODO usunąć sprawdzanie plusów/wykopów na żywo - chyba nie trzeba

				// consoleX(`section.entry NOT intersecting: ${id}`, 1)
				sectionObjectElement.classList.remove("isIntersecting");
				sectionObjectElement.classList.add("notIntersecting");
			}
		});
	};


	const sectionObjectIntersectionObserverOptions =
	{
		root: null,
		rootMargin: "0px 0px -200px 0px",
		threshold: 0,
	};
	const sectionObjectIntersectionObserver = new IntersectionObserver(sectionObjectsAreIntersecting, sectionObjectIntersectionObserverOptions)



	/*
		__vue__.item.
					.actions. [create/create_favourite/delete/delete_favourite/report/undo_vote/update/vote_up]
					.adult
					.atchive
					.author
					.comments [count: int, items: Array]
					.content: "tresc"
					.created_at: "2023-12..."
					.deletable: false
					.device: ""
					.editable: false
					.favourite: false
					.id: 1234567
					.media [embed/photo/survey]
					.parent
					.resource: "entry"
					.slug: "wykop-to-portal"
					.status: "visible"
					,tags: Array
					.voted: 0
					.votes [.down: 1 / .up: 2 / .users: Array[]]
		
		__vue__.item. author.
							.avatar (url jpg)
							.blacklist: false
							.color: "orange"
							.company: false
							.follow: false
							.gender: "m"
							.note: true
							.online: true
							.rank [trend/position]
							.status: ["active"/"banned"]
							.username: "nick"
							.verified: false
	*/


	async function createInfoboxDivsForUserEverywhere(userDataObject, userNoteObject, username = userDataObject.username)
	{

		console.log(`createInfoboxDivsForUserEverywhere(${username})`);

		let userInfoElementTitle = "";

		const a_usernameAll = document.querySelectorAll(`a.username[href="/ludzie/${username}"]:not(:has([data-wxs_username]))`);

		let changeSexTo = false;


		// const a_usernameAll = document.querySelectorAll(`section:is(.entry, .link-block):has(> article > header > div.right > div > div a.username[href="/ludzie/${username}"])`);
		// const a_usernameAll = document.querySelectorAll(`section[data-wxs_username="${username}"]`);
		// const a_usernameAll = document.querySelectorAll(`section.entry-voters > ul > li > a.username[href="/ludzie/${username}"]`);
		// console.log(`--- xxx username ${username}`);
		// console.log(`--- xxx a_usernameAll`);
		// console.log(a_usernameAll);

		// informacja o użytkowniku pobrana z __vue__ lub fetch z API
		// DIV Z INFOBOXEM i NOTATKAMI
		let div = document.createElement('div');
		{
			div.classList = `wykopxs wxs_user_info wxs_user_info_year`;  					// <div class="wykopxs wxs_user_info wxs_user_info_year"


			let noteSpanElement = null;
			let infoboxInnerHTML = "";

			// NOTATKI
			if (settings.notatkowatorEnable && userDataObject.note == true && userNoteObject)
			{

				// console.log("NOTATKI 222: ")
				// console.log("userDataObject.note")
				// console.log(userDataObject.note);
				// console.log("userNoteObject");
				// console.log(userNoteObject);

				/* 
					Notes from API:
						user.data = { username: 'NadiaFrance', content: 'Treść notatki' } 
						user.data = { username: 'NadiaFrance', content: '' } 
		
					Notes from LocalStorage:
					userNoteObject ->	wykopx/notatkowator/tomek123456789 = 
					{
						username: "Zenek",
						usernote: "Notatka | +r",
						lastUpdate: "2024-01-07T15:55:37.210Z"
					}
				*/


				let usernoteParsedToDisplay = removePlusWords(userNoteObject.usernote);
				// console.log("usernoteParsedToDisplay");
				// console.log(usernoteParsedToDisplay);

				if (settings.notatkowatorVerticalBar)
				{
					let sepIndex = userNoteObject.usernote.indexOf("|");
					if (sepIndex != -1)
					{
						usernoteParsedToDisplay = `${usernoteParsedToDisplay.substring(0, sepIndex).trim()}...`;
						//let remainingPart = usernote.substring(sepIndex + 1).trim();
					}
				}


				noteSpanElement = document.createElement('span');
				// <span class="wxs_user_info_usernote wxs_notatkowator_normal">
				// <span class="wxs_user_info_usernote wxs_notatkowator_r">
				noteSpanElement.classList = `wxs_user_info_usernote`;

				const plusWordsArray = getPlusWords(userNoteObject.usernote);
				plusWordsArray.forEach(plusWord =>
				{
					noteSpanElement.classList.add(`wxs_notatkowator_${plusWord}`); // class="wxs_notatkowator_r"
				});

				console.log(plusWordsArray)

				let femaleChecklistArray = ["k", "f", "female", "kobieta", "dziewczyna", "dziewczynka", "girl", "baba", "różowa", "rozowa", "rózowa", "rożowa"];
				let maleChecklistArray = ["m", "mezczyzna", "mężczyzna", "męzczyzna", "meżczyzna", "male", "facet", "boy", "chlopak", "chłopak", "chłopiec", "chłop", "chlop", "niebieski"];
				let isFemale = plusWordsArray.filter(item => femaleChecklistArray.includes(item));
				let isMale = plusWordsArray.filter(item => maleChecklistArray.includes(item));

				if (isFemale.length >= 1) 		// różowy pasek // +k lub +f
				{
					changeSexTo = "female";
				}
				else if (isMale.length >= 1) 				// niebieski pasek // +m
				{
					changeSexTo = "male";
				}

				noteSpanElement.innerHTML = `<var>${usernoteParsedToDisplay}</var>`;
				userInfoElementTitle += ` \n 𝗪𝘆𝗸𝗼𝗽 𝗫 𝗡𝗼𝘁𝗮𝘁𝗸𝗼𝘄𝗮𝘁𝗼𝗿 \n \n ${userNoteObject.usernote} \n \n`;
			}


			// INFOBOX
			if (settings.infoboxEnable)
			{
				userInfoElementTitle += ` \n 𝗪𝘆𝗸𝗼𝗽 𝗫 InfoBox \n Informacje o użytkowniku @${userDataObject.username} \n  \n `

				// basic data without fetch
				if (userDataObject.blacklist == true) 											// basic
				{
					infoboxInnerHTML += `<var class="wxs_user_blacklist" title="@${userDataObject.username} jest na Twojej czarnej liście">🚯</var>`
				}
				if (userDataObject.follow == true) 												// basic
				{
					infoboxInnerHTML += `<var class="wxs_user_follow" title="Obserwujesz użytkownika @${userDataObject.username}">🔔</var>`
				}

				if (userDataObject.status == "banned") 											// basic
				{
					if (userDataObject.banned?.wxs_info_text_1) 													// DETAILS from API
					{
						infoboxInnerHTML += `<var class="wxs_user_banned" title=" 🍌 ${userDataObject.banned.wxs_info_text_1}. \n \n ${userDataObject.banned.wxs_info_text_2} \n \n ${userDataObject.banned.wxs_info_text_3} \n \n">🍌</var>`
						userInfoElementTitle += `  🍌 ${userDataObject.banned.wxs_info_text_1}. \n \n ${userDataObject.banned.wxs_info_text_2} \n \n ${userDataObject.banned.wxs_info_text_3} \n \n`;
					}
				}

				let memberSinceDate = null
				let membersSinceInYears = null
				let membersSinceInMonths = null
				let membersSinceInDays = null

				if (userDataObject.member_since) // DETAILS from API
				{

					memberSinceDate = dayjs(userDataObject.member_since);
					membersSinceInYears = loadTime.diff(memberSinceDate, 'year');
					membersSinceInMonths = loadTime.diff(memberSinceDate, 'month');
					membersSinceInDays = loadTime.diff(memberSinceDate, 'day');

					// wyświetlony obok nazwy użytkownika rok założenia konta
					infoboxInnerHTML += ` · <var class="wxs_user_member_since">${memberSinceDate.year()}</var>`; // · 2011
				}
				else
				{
					infoboxInnerHTML += `<var class="wxs_user_member_since"> ℹ </var>`; // · { i }
				}


				userInfoElementTitle += userDataObject.online ? ` \n @${userDataObject.username} jest teraz online 🟢 \n ` : "";

				if (userDataObject.name) userInfoElementTitle += userDataObject.name != "" ? `Nazwa: ${userDataObject.name} \n ` : "";
				if (userDataObject.city) userInfoElementTitle += userDataObject.city != "" ? `Miasto: ${userDataObject.city} \n ` : "";
				if (userDataObject.public_email) userInfoElementTitle += userDataObject.public_email != "" ? `\n E-mail: ${userDataObject.public_email} \n ` : "";
				userInfoElementTitle += `\n`;

				if (userDataObject.gender == "f")
				{
					userInfoElementTitle += userDataObject.follow ? `🔔 Obserwujesz tę Mirabelkę. \n ` : "";
					userInfoElementTitle += userDataObject.blacklist ? `🚯 Ta Mirabelka jest na Twojej czarnej liście. \n ` : "";

					if (userDataObject.summary) // DETAILS from API
					{
						userInfoElementTitle += userDataObject.summary.followers > 0 ? ` Jest obserwowana przez ${userDataObject.summary.followers} osób` : "Nikt jej nie obserwuje";
						userInfoElementTitle += userDataObject.summary.following_users > 0 ? `, a ona sama obserwuje ${userDataObject.summary.following_users} innych osób oraz ` : `. Nie obserwuje żadnych użytkowników i `;
						userInfoElementTitle += userDataObject.summary.following_tags > 0 ? `${userDataObject.summary.following_tags} #tagów  \n ` : `nie obserwuje żadnych #tagów \n `;
					}

				}
				else
				{
					userInfoElementTitle += userDataObject.follow ? `🔔 Obserwujesz tego Mireczka \n ` : "";
					userInfoElementTitle += userDataObject.blacklist ? `🚯 Ten Mireczek jest na Twojej czarnej liście \n ` : "";

					if (userDataObject.summary) // DETAILS from API
					{
						userInfoElementTitle += userDataObject.summary.followers > 0 ? ` Jest obserwowany przez ${userDataObject.summary.followers} osób \n ` : "Nikt go nie obserwuje";
						userInfoElementTitle += `\n On sam obserwuje`;
						userInfoElementTitle += `\n - ${userDataObject.summary.following_users} osób `;
						userInfoElementTitle += userDataObject.summary.following_tags > 0 ? `\n - ${userDataObject.summary.following_tags} #tagów  \n ` : `i nie obserwuje żadnych #tagów \n `;
					}
				}

				if (userDataObject.member_since)
				{
					userInfoElementTitle += `\n Na Wykopie od: ${userDataObject.member_since} \n  \n `;
					userInfoElementTitle += `Przez ${membersSinceInYears > 1 ? membersSinceInYears + " lat(a)" : membersSinceInMonths > 1 ? membersSinceInMonths + " miesiące(ęcy)" : membersSinceInDays + " dni"} na Wykopie ${userDataObject.gender == "f" ? "dodała" : "dodał"}: \n `; // Rzeczownik
				}

				if (userDataObject.summary)
				{
					userInfoElementTitle += `\n Na mikroblogu: \n `;
					userInfoElementTitle += `- ${userDataObject.summary.entries_details.added} wpisów\n `;
					userInfoElementTitle += `- ${userDataObject.summary.entries_details.commented} komentarzy pod wpisami \n `;
					userInfoElementTitle += `- ${userDataObject.summary.entries_details.voted} zaplusowanych wpisów \n `;

					userInfoElementTitle += `\n Na głównej: \n `;
					userInfoElementTitle += `- ${userDataObject.summary.links_details.up} wykopanych znalezisk \n `;

					userInfoElementTitle += `- ${userDataObject.summary.links_details.published} znalezisk na głównej \n `;
					userInfoElementTitle += `- ${userDataObject.summary.links_details.added} znalezisk \n `;
					userInfoElementTitle += `- ${userDataObject.summary.links_details.commented} komentarzy pod znaleziskami \n `;
					userInfoElementTitle += `- ${userDataObject.summary.links_details.related} powiązanych do znalezisk \n `;
				}

				if (userDataObject.about) userInfoElementTitle += userDataObject.about != "" ? ` \n  \n O sobie: \n ${userDataObject.about} \n \n ` : "";
			}

			if (infoboxInnerHTML !== "") div.innerHTML = infoboxInnerHTML;
			if (noteSpanElement !== null) div.appendChild(noteSpanElement);

			div.title = `${userInfoElementTitle} \n.`;
		}

		// console.log("gotowy user infobox div:")
		// console.log(div)

		// dołączenie info o użytkowniku do każdego wystąpienia jego nicka na stronie
		a_usernameAll.forEach((a_username) =>
		{
			// console.log(`Dodaję infobox przy każdym linku a.username:`);
			// console.log(a_username);
			// console.log(a_username.parentNode.nodeName);
			if (a_username.dataset.wxs_username == undefined)
			{
				a_username.dataset.wxs_username = userDataObject.username;

				let a_username_type;
				if (a_username.parentNode.nodeName == "SPAN") a_username_type = "section_entry_header";
				if (a_username.parentNode.nodeName == "LI") a_username_type = "section_entry_voters_li";


				// tylko dla section.entry, nie dla listy plusujących
				if (a_username_type == "section_entry_header")
				{
					if (changeSexTo != false)
					{
						const figureElement = a_username.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector("div.left > a.avatar > figure"); // header
						if (changeSexTo == "male")
						{
							figureElement.classList.remove("female");
							figureElement.classList.add("male");
						}
						else if (changeSexTo == "female")
						{
							figureElement.classList.add("female");
							figureElement.classList.remove("male");
						}
					}
					let sectionObjectElement = a_username.closest('section.entry, section.link-block, aside.profile-top'); 	 // section.entry, section.link-block a w profilu <aside class="profile-top wide-top">

					if (sectionObjectElement && (!sectionObjectElement.dataset.wxs_username || sectionObjectElement.dataset.wxs_username != userDataObject.username))
					{

						// USER DATRA BASIC
						sectionObjectElement.dataset.wxs_username = userDataObject.username; 			// <section data-wxs-username="NadiaFrance">
						sectionObjectElement.dataset.wxs_user_note = userDataObject.note;				// data-wxs_user_note="true"
						sectionObjectElement.dataset.wxs_user_company = userDataObject.company;			// data-wxs_user_status="banned"
						sectionObjectElement.dataset.wxs_user_status = userDataObject.status;			// data-wxs_user_status="banned"
						sectionObjectElement.dataset.wxs_user_color = userDataObject.color;				// data-wxs_user_status="banned"
						sectionObjectElement.dataset.wxs_user_verified = userDataObject.verified;		// data-wxs_user_status="banned"
						sectionObjectElement.dataset.wxs_user_blacklist = userDataObject.blacklist;		// data-wxs_user_blacklist="true"
						sectionObjectElement.dataset.wxs_user_follow = userDataObject.follow;			// data-wxs_user_follow="true"
						sectionObjectElement.dataset.wxs_user_gender = userDataObject.gender;			// data-wxs_user_gender="m"
						sectionObjectElement.dataset.wxs_user_online = userDataObject.online;			// data-wxs_user_online="true"
						sectionObjectElement.dataset.wxs_user_rank_position = userDataObject.rank?.position;	// data-wxs_user_rank_position=34 // "null"
						sectionObjectElement.dataset.wxs_user_rank_trend = userDataObject.rank?.trend;	// data-wxs_user_rank_trend=0

						if (userDataObject.summary)
						{
							sectionObjectElement.dataset.wxs_user_entries_added = userDataObject.summary.entries_details.added; 			// <section data-wxs-user-entries-added="12">
							sectionObjectElement.dataset.wxs_user_entries_commented = userDataObject.summary.entries_details.commented; 	// <section data-wxs-user-entries-commented="12">
							sectionObjectElement.dataset.wxs_user_entries_voted = userDataObject.summary.entries_details.voted; 			// <section data-wxs-user-entries-voted="12">
							sectionObjectElement.dataset.wxs_user_links_up = userDataObject.summary.links_details.up; 						// <section data-wxs-user-links-up="12">
							sectionObjectElement.dataset.wxs_user_links_published = userDataObject.summary.links_details.published; 		// <section data-wxs-user-links-published="12">
							sectionObjectElement.dataset.wxs_user_links_added = userDataObject.summary.links_details.added; 				// <section data-wxs-user-links-added="12">
							sectionObjectElement.dataset.wxs_user_links_commented = userDataObject.summary.links_details.commented; 		// <section data-wxs-user-links-commented="12">
							sectionObjectElement.dataset.wxs_user_links_related = userDataObject.summary.links_details.related; 			// <section data-wxs-user-links-related="12">
						}



						// WykopObject
						// to juz jest dodawane wczesniej

						//sectionObjectElement.dataset.wxs_id = sectionObjectElement.__vue__.item.id;									// <section data-wxs_id="1234567">
						//sectionObjectElement.dataset.wxs_resource = sectionObjectElement.__vue__.item.resource;						// <section data-wxs_resource="entry_comment">
						// if (sectionObjectElement.__vue__.item.parent)
						// {
						// 	sectionObjectElement.dataset.wxs_parent_resource = sectionObjectElement.__vue__.item.parent.resource;	// data-wxs_parent_resource="entry"
						// 	sectionObjectElement.dataset.wxs_parent_id = sectionObjectElement.__vue__.item.parent.id;					// data-wxs_parent_id="1234567"
						// }
						// if (sectionObjectElement.__vue__.item.created_at) sectionObjectElement.dataset.wxs_created_at = sectionObjectElement.__vue__.item.created_at;			// data-wxs_created_at="2023-12-31 2359"
						// if (sectionObjectElement.__vue__.item.favourite) sectionObjectElement.dataset.wxs_favourite = sectionObjectElement.__vue__.item.author.favourite;		// data-wxs_favourite="true"
						// if (sectionObjectElement.__vue__.item.voted)
						// {
						// 	sectionObjectElement.dataset.wxs_voted = sectionObjectElement.__vue__.item.voted;							// data-wxs_voted="0" / "1"
						// 	sectionObjectElement.dataset.wxs_votes_up = sectionObjectElement.__vue__.item.votes.up;						// data-wxs_votes-up="23"
						// 	sectionObjectElement.dataset.wxs_votes_down = sectionObjectElement.__vue__.item.votes.down;					// data-wxs_votes-up="23"
						// }
					}
				}

				let div_tooltipSlot = a_username.closest("div.tooltip-slot");
				let userInfoboxDiv = div.cloneNode(true);

				if (div_tooltipSlot)
				{
					div_tooltipSlot.insertAdjacentElement('afterend', userInfoboxDiv);
				}
				else
				{
					a_username.title = userInfoElementTitle;
					a_username.insertAdjacentElement('afterend', userInfoboxDiv);
				}
			}


			// elementToInsertUserInfo.appendChild(div);
			// elementToInsertUserInfo.parentNode.insertBefore(div, elementToInsertUserInfo.nextSibling);

			// -- strona wpisu
			// - wpis:
			// section.entry.detailed 	> article 																													> header > div.right > div > div.tooltip-slot > span > a.username > span
			// section.entry.detailed 	> article 																													> header > div.right > div > span > a.current.active > time
			// - komentarze:
			// section.entry.detailed 	> div.comments > section.stream > div.content > section.entry.reply > article 												> header > div.right > div > div.tooltip-slot > span > a.username > span
			// section.entry.detailed 	> div.comments > section.stream > div.content > section.entry.reply > article 												> header > div.right > div > span > a > time


			// -- mikroblog wpisy i komentarze:											
			// - wpis: 											
			// section.entry 			> article 																													> header > div.right > div > div.tooltip.slot > span > a.username > span
			// section.entry 			> article 																													> header > div.right > div > span > a > time
			// - komentarze:											
			// section.entry 			> div.comments > section.stream > div.content > section.entry.reply > article 												> header > div.right > div > div.tooltip-slot > span > a.username > span
			// section.entry 			> div.comments > section.stream > div.content > section.entry.reply > article 												> header > div.right > div > span > a > time

			// główna (brak header div.right)
			// section.link-block > section > article 																												> header > div.content > section.info > span > div.tooltip-slot > span > a.username > span
			// section.link-block > section > article 																												> header > div.content > section.info > span > div.tooltip-slot (drugi) > span > a.external // domena linku
			// section.link-block > section > article 																												> header > div.content > section.info > span > time

			// strona znaleziska (brak header div.right)
			// main.main > section > div.content > section.link-page > section.link > section.link-block.detailed > section > article > div.content > section.info > span > div.tooltip-slot > span > a.username > span
			// main.main > section > div.content > section.link-page > section.link > section.link-block.detailed > section > article > div.content > section.info > span > div.tooltip-slot (drugi) > span > a.external
			// main.main > section > div.content > section.link-page > section.link > section.link-block.detailed > section > article > div.content > section.info > span > time 

			// wpisy na stronie profilu
			// main.main > section > div.content > section.profile-page > section.profile > section.stream.link-entries > div.content > section.entry > article 	> header > div.right > div > div.tooltip-slot > span > a.username > span
			// main.main > section > div.content > section.profile-page > section.profile > section.stream.link-entries > div.content > section.entry > article 	> header > div.right > div > span > a > time

			// prawy sidebar (brak .tooltip-slot)
			//main.main > section > section.sidebar > section > div.content > section.entries > section.entry 														> header > div.right > div > a.username > span 
			//main.main > section > section.sidebar > section > div.content > section.entries > section.entry 														> header > div.right > div > span.plus // +16 liczba plusów
			//main.main > section > section.sidebar > section > div.content > section.entries > section.entry 														> header > div.right > a > time

			// strona PROFILU - naglowek profilu uzytkownika (brak .tooltip-slot)
			// main.main > aside.profile-top > section 																												> header > div > h1 > a.username > span
			// main.main > aside.profile-top > section 																												> header > div > time
		});
		div.remove();
	}









	/* ------------- NOTATKOWATOR ------------ */
	async function getUserNoteObjectByUsername(sectionObjectElement, username = sectionObjectElement.__vue__.item.author.username, forceAPICheck = false)
	{
		if (settings.notatkowatorEnable && (forceAPICheck || (sectionObjectElement && sectionObjectElement.__vue__.item.author.note)))
		{

			if (username)
			{
				let usernote = "";
				let userNoteObject = await localStorageNotatkowator.getItem(username);

				//consoleX(`getUserNoteObjectByUsername()`, 1);
				//console.log(username);

				if (forceAPICheck == false)
				{
					// TODO check this

					if (userNoteObject == null || userNoteObject == "")
					{
						console.log("typeof userNoteObject", typeof userNoteObject)
						console.log(userNoteObject);

						const now = dayjs();
						const date2 = dayjs(userNoteObject.lastUpdate);

						if (now.diff(date2, "second") > parseFloat(settings.notatkowatorUpdateInterval * 3600))
						{
							// notatka jest zbyt stara
							userNoteObject = null;
						}
						else
						{
							// mamy aktualną notatkę z localforage
							consoleX(`Notatkowator wczytał notatkę z LocalStorage. Użytkownik: @${username}`);
							console.log("userNoteObject")
							console.log(userNoteObject)
							console.log("userNoteObject.usernote")
							console.log(userNoteObject.usernote)
							usernote = userNoteObject.usernote;

							return userNoteObject;
						}
					}
				}

				if (usernote != "")
				{
					return userNoteObject;
				}

				else // Notatka z API - brak notatki o tym użytkowniku w localforage lub była zbyt stara lub forceAPICheck = true 
				{
					try
					{
						let jsonResponse = await getWykopAPIData("notes", username);
						usernote = jsonResponse?.data?.content;

						userNoteObject =
						{
							username: jsonResponse?.data?.username,
							usernote: jsonResponse?.data?.content,
							lastUpdate: dayjs()
						}
						// console.log(jsonResponse);
						// console.log("userNoteObject");
						// console.log(userNoteObject);

						/* 
							Notes from API:
								user.data = { username: 'NadiaFrance', content: 'Treść notatki' } 
								user.data = { username: 'NadiaFrance', content: '' } 
		
							Notes from LocalStorage:
							userNoteObject ->	wykopx/notatkowator/tomek123456789 = 
							{
								username: "Zenek",
								usernote: "Notatka | +r",
								lastUpdate: "2024-01-07T15:55:37.210Z"
							}
						*/


						if (usernote != "" && userNoteObject.usernote != null && userNoteObject.usernote != "")
						{
							// console.log(`API zwróciło ${userNoteObject.username} notatkę: ${userNoteObject.usernote}`);
							consoleData.notatkowator.count++;
							refreshConsole();

							// await displayUserNote(sectionObjectElement, usernote, username)

							if (localStorageNotatkowator)
							{
								localStorageNotatkowator.setItem(username, { username: userNoteObject.username, usernote: userNoteObject.usernote, lastUpdate: userNoteObject.lastUpdate })
									.then(function (value)
									{
										consoleX(`Notatkowator zapisał notatkę o użytkowniku @${userNoteObject.username}: "${userNoteObject.usernote}"`);
									})
									.catch(function (err)
									{
										consoleX(`Notatkowator = error: ` + err);
									});
								// return usernote;
								return userNoteObject
							}
						}
						else
						{
							// consoleX(`Użytkownik ${username} nie ma żadnej notatki`)
						}
					}
					catch (error)
					{
						console.error(`Failed to get data: ${error}`);
					}
				}
			}

		}

	}







	/* wyświetlenie danych o autorze z __vue__ lub pobranie z API*/
	async function getUserDetailsForUsername(userDataObject = null, username = userDataObject.username, forceAPICheck = false)
	{

		if (settings.infoboxEnable && username)
		{
			//console.log(`user: ${username}: `)
			//console.log(userDataObject)

			// jesli jest zbanowany lub chcemy wszystkie dane (np. followersi - wysylamy zapytanie do API)
			if (userDataObject.status == "banned" || forceAPICheck == true)
			{
				console.log("---- getUserDetailsForUsername - sprawdzanie użytkownika w API: " + username)
				try
				{
					// profile/users/{username}
					// profile/users/{username}/short
					// let jsonResponse = await getWykopAPIData("profile", "users", username, "short");
					let jsonResponse = await getWykopAPIData("profile", "users", username);
					if (jsonResponse.data)
					{
						let userDataObject = jsonResponse.data;

						if (userDataObject.banned)
						{
							userDataObject.banned.wxs_ban_end_date_string = userDataObject.banned.expired; 			// "2024-01-04 17:22:31"
							userDataObject.banned.wxs_ban_end_date_object = dayjs(userDataObject.banned.wxs_ban_end_date_string);
							userDataObject.banned.wxs_ban_end_in_years = userDataObject.banned.wxs_ban_end_date_object.diff(loadTime, 'year');		// 5 > koniec bana za "5" lat
							userDataObject.banned.wxs_ban_end_in_months = userDataObject.banned.wxs_ban_end_date_object.diff(loadTime, 'month');	// 3 > koniec bana za: "3" miesiące
							userDataObject.banned.wxs_ban_end_in_days = userDataObject.banned.wxs_ban_end_date_object.diff(loadTime, 'day');		// 31 > koniec bana za 31 dni
							userDataObject.banned.wxs_ban_end_in_days = userDataObject.banned.wxs_ban_end_date_object.diff(loadTime, 'day');		// 31 > koniec bana za 31 dni

							userDataObject.banned.wxs_reason_lowercase = userDataObject.banned.reason.toLowerCase();
							// banEndDateDuration = banEndDateObject.toNow()

							// "Użytkowniczka @NadiaFrance dsotała bana za naruszenie regulaminu"
							userDataObject.banned.wxs_info_text_1 = `${userDataObject.gender == "f" ? "Użytkowniczka @" + userDataObject.username + " dostała" : "Użytkownik @" + userDataObject.username + " dostał"} bana za ${userDataObject.banned.wxs_reason_lowercase}`;

							// "Koniec bana za 14 dni"
							userDataObject.banned.wxs_info_text_2 = `Koniec bana ${userDataObject.banned.wxs_ban_end_in_years > 1 ? "za " + userDataObject.banned.wxs_ban_end_in_years + " lat(a)" : userDataObject.banned.wxs_ban_end_in_months > 1 ? "za " + userDataObject.banned.wxs_ban_end_in_months + " miesiące(ęcy)" : userDataObject.banned.wxs_ban_end_in_days > 1 ? "za " + userDataObject.banned.wxs_ban_end_in_days + " dni" : userDataObject.banned.wxs_ban_end_date_object.isSame(dayjs(), 'day') == true ? " już dzisiaj!  " : " jutro"}`;


							// "Ban trwa do 2024-12-12 23:59:59"
							userDataObject.banned.wxs_info_text_3 = `Ban trwa do ${userDataObject.banned.wxs_ban_end_date_string}`
						}

						//console.log("userData fetched from API");
						//console.log(userDataObject);
						return userDataObject; // return the data
					}

				}
				catch (error)
				{
					console.error(`Failed to get data: ${error}`);
				}
			}
			// jeśli wystarczą nam podstawowe informacje z __vue__ 
			else
			{
				//console.log("---- getUserDetailsForUsername - zwracam danej użytkownika z vue: " + username)
				return userDataObject;
			}
		}
	}




	// DOPISUJE NOTATKĘ DO UZYTKOWNIKA
	/*async function displayUserNote(sectionObjectElement = null, usernote, username = sectionObjectElement.__vue__.item.author.username)
	{
		if (usernote?.length > 0 && username)
		{
			// "⭐ Obok nicka (Notatkowator2000)":"obok_nicka",
			// "Wyraźna, pod avatarem (Wykop X Style)":"pod_avatarem",
		
			let elementToInsertNoteAfter;
		
			const sectionObjectElementsAll = document.querySelectorAll(`section[data-wxs_username="${username}"]`)
			sectionObjectElementsAll.forEach((section) =>
			{
				if (!section.dataset.wxs_note || section.dataset.wxs_username != username)
				{
					section.dataset.wxs_note = "true"; // <section data-wxs-note="true" wxs_username="NadiaFrance">
					// console.log(`Notatkowator - dodaje notatkę: ${ username } / ${usernote}`);
					let resource = section.__vue__.item.resource;
		
					if (resource == "entry" || resource == "entry_comment" || resource == "link_comment")
					{
						switch (settings.notatkowatorStyle)
						{
							case "pod_avatarem":
								elementToInsertNoteAfter = section.querySelector(`article > header`);
								break;
							case "obok_nicka":
								elementToInsertNoteAfter = section.querySelector(`article > header > div.right > div > div.tooltip-slot`);
								break;
							default:
								null;
						}
					}
					else if (resource == "link")
					{
						elementToInsertNoteAfter = section.querySelector("section > article > div.content > section.info > span > div.tooltip-slot");
					}
		
	*/









	// returns objecct-id "comment-1234567", "link-12345678"
	function getObjectIdFromSectionObjectElement(sectionObjectElement)
	{
		if (sectionObjectElement && sectionObjectElement.__vue__?.item?.resource)
		{
			let resource = sectionObjectElement.__vue__.item.resource;

			if (resource == "link")
			{
				return `link-${sectionObjectElement.__vue__.item.id}`;
			}
			else if (resource == "entry" || resource == "entry_comment" || resource == "link_comment")
			{
				return `comment-${sectionObjectElement.__vue__.item.id}`;
			}
		}
		else
		{
			return null;
		}
	}
	// zwraca tytul znaleziska lub fragment poczatku wpisu/komentarza. Maks tytul znaleziska to 80 znakow
	function getTitleTextFromSectionObjectElement(sectionObjectElement, charLimit = 80)
	{
		if (sectionObjectElement && sectionObjectElement.__vue__?.item?.resource)
		{
			let resource = sectionObjectElement.__vue__.item.resource;

			if (resource == "link" && sectionObjectElement.__vue__?.item?.title)
			{
				return sectionObjectElement.__vue__.item.title.substring(0, charLimit);
			}
			else if (sectionObjectElement.__vue__?.item?.content && (resource == "entry" || resource == "entry_comment" || resource == "link_comment"))
			{
				return sectionObjectElement.__vue__.item.content.replace(/\n/g, " ").substring(0, charLimit);
			}
		}
		else
		{
			return null;
		}
	}



	/*     MIRKOUKRYWA   */

	// mirkoukrywaczBlockNewElement(sectionObjectElement, null, "minimized")
	// mirkoukrywaczBlockNewElement(null, "comment-123456", "hidden")
	function mirkoukrywaczBlockNewElement(sectionObjectElement = null, object_id = getObjectIdFromSectionObjectElement(sectionObjectElement), blockingType = "hidden")
	{
		console.clear();

		if (localStorageMirkoukrywacz && (sectionObjectElement || object_id))
		{
			if (!sectionObjectElement)
			{
				sectionObjectElement = document.getElementById(object_id);
			}

			if (blockingType == "minimized") 
			{
				sectionObjectElement.classList.add('wxs_minimized');
				consoleData.mirkoukrywacz_minimized.count++;
				refreshConsole();
			}
			else if (blockingType == "hidden") 
			{
				sectionObjectElement.classList.add('wxs_hidden');
				consoleData.mirkoukrywacz_hidden.count++;
				refreshConsole();
			}

			const resource = sectionObjectElement.__vue__.item.resource;
			const text = getTitleTextFromSectionObjectElement(sectionObjectElement);
			if (!object_id) object_id = getObjectIdFromSectionObjectElement(sectionObjectElement);

			console.log("sectionObjectElement")
			console.log(sectionObjectElement);

			localStorageMirkoukrywacz
				.setItem(object_id,
					{
						object_id,
						grandcomment_id: sectionObjectElement.__vue__.item.parent?.id,
						resource,
						username: sectionObjectElement.__vue__.item.author?.username,
						text,
						blockingType, // "hidden" / "minimized"
						date: dayjs()
					})
				.then(function (value)
				{
					//console.log(value);
				})
				.catch(function (err)
				{
					console.log(`mirkoukrywaczBlockNewElement = error: ` + err);
				});
			// mirkoukrywaczHideAllBlockedElements();
		}
	}

	function mirkoukrywaczUnblockElement(sectionObjectElement = null, object_id = getObjectIdFromSectionObjectElement(sectionObjectElement))
	{
		console.clear();

		console.log(`mirkoukrywaczUnblockElement(${object_id})`)

		if (localStorageMirkoukrywacz)
		{
			localStorageMirkoukrywacz
				.getItem(object_id)
				.then(function (value)
				{
					console.log("getItem: " + object_id)
					console.log(value)

					localStorageMirkoukrywacz
						.removeItem(object_id)
						.then(function ()
						{
							if (value.blockingType == "minimized")
							{
								if (!sectionObjectElement) sectionObjectElement = document.getElementById(object_id);
								if (sectionObjectElement)
								{
									sectionObjectElement.classList.remove(`wxs_minimized`);
									consoleData.mirkoukrywacz_hidden.count--;
									refreshConsole();
								}
							}
							document.getElementById(`wykopx_mirkoukrywacz_element_${object_id}`)?.remove();
						})
						.catch(function (err)
						{
							console.log(err);
						});
				})
		}
	}

	function mirkoukrywaczHideAllBlockedElements()
	{
		// console.log("mirkoukrywaczHideAllBlockedElements()")
		if (localStorageMirkoukrywacz)
		{
			let hiddenElements = 0;
			let minimizedElements = 0;

			localStorageMirkoukrywacz.iterate(function (value, key, iterationNumber)
			{
				// console.log("value");
				// console.log(value);
				// console.log("key");
				// console.log(key);

				let foundElementToHide = document.getElementById(`${key}`); // comment-1234   link-12345
				if (foundElementToHide)
				{

					if (value.blockingType == "hidden")
					{
						if (sectionObjectIntersectionObserver) sectionObjectIntersectionObserver.unobserve(foundElementToHide);
						foundElementToHide.remove();
						hiddenElements++;
					}
					else if (value.blockingType == "minimized")
					{
						foundElementToHide.classList.add(`wxs_minimized`); // class="wxs_minimized"
						minimizedElements++;
					}
				}
			}).then(function ()
			{

				if (hiddenElements + minimizedElements == 0)
				{
					consoleData.mirkoukrywacz_hidden.count = 0;
					consoleData.mirkoukrywacz_minimized.count = 0;
					refreshConsole();
				}
				else
				{
					consoleData.mirkoukrywacz_hidden.count = hiddenElements;
					consoleData.mirkoukrywacz_minimized.count = minimizedElements;
					refreshConsole();
				}


			}).catch(function (err)
			{
				console.log(err);
			});

		}
		/* 
		value = {
		"id": "74301447",
		"grandcomment_id": "74301447",
		"resource": "entry",
		"username": "Jadowityssak",
		"text": "Zawsze jak widzę tego typa z Afromental to mi gość",
		"date": "2023-12-26T02:44:23.039Z"
		"blockingType": "minimize"/"hide" }*/
	}

	function mirkoukrywaczAppendOneElementToHideList(value, key, iterationNumber = "⭐")
	{
		if ($(`#wxs_modal .wykopx_mirkoukrywacz_list_of_hidden_items #wykopx_mirkoukrywacz_element_${key}`).length == 0)
		{
			let hidden_element_html = ``;
			hidden_element_html += `
					<div class="wykopx_mirkoukrywacz_element" id="wykopx_mirkoukrywacz_element_${key}">
						<div class="wykopx_mirkoukrywacz_unhide" data-object_id="${key}" title="Przestań ukrywać ten element">❌</div>
						<div class="wykopx_mirkoukrywacz_lp">${iterationNumber}</div>
						<div class="wykopx_mirkoukrywacz_text">${value.text}</div>
						<div class="wykopx_mirkoukrywacz_id">${key}</div>
						<div class="wykopx_mirkoukrywacz_resource">${value.resource}</div>
						<div class="wykopx_mirkoukrywacz_date">${dayjs(value.date).format("YYYY-MM-DD HH:mm")}</div>
						<div class="wykopx_mirkoukrywacz_blocking_type">${value.blockingType}</div>
					</div>`;
			$("#wxs_modal .wykopx_mirkoukrywacz_list_of_hidden_items").append(hidden_element_html);

		}
	}

	function mirkoukrywaczRefreshHideList()
	{
		if (localStorageMirkoukrywacz)
		{
			localStorageMirkoukrywacz
				.iterate(function (value, key, iterationNumber)
				{
					mirkoukrywaczAppendOneElementToHideList(value, key, iterationNumber);
				})
				.then(function () { })
				.catch(function (err) { });
		}

	}

	function createMenuItemForMirkoukrywacz()
	{
		if (settings.mirkoukrywaczEnable)
		{
			if (document.getElementById("wxs_open_modal_mirkoukrywacz_button") == null)
			{
				createNewProfileDropdownMenuItem(
					{
						text: `Wykop X - Mirkoukrywacz`,
						title: "Wykop X - lista elementów ukrytych przez Mirkoukrywacz",
						className: `mirkoukrywacz`,
						id: "wxs_open_modal_mirkoukrywacz_button",
						url: null,
						target: null,
						icon: null,
						number: null
					});
				document.getElementById("wxs_open_modal_mirkoukrywacz_button").onclick = function (event)
				{
					event.preventDefault();
					if (wxs_modal == null)
					{
						createModalBox();
					}
					mirkoukrywaczRefreshHideList();
					wxs_modal.style.display = "block";
				};
			}
		}
	}
	function createMenuItemForNotatkowator()
	{
		if (settings.notatkowatorEnable)
		{
			createNewProfileDropdownMenuItem(
				{
					text: `Wykop X - Notatkowator`,
					title: "Wykop X - Notatkowator - Twoje notatki do innych użytkowników",
					className: `notatkowator`,
					id: "wxs_open_modal_notatkowator_button",
					url: null,
					target: null,
					icon: null,
					number: null
				});
			document.getElementById("wxs_open_modal_notatkowator_button").onclick = function (event)
			{
				//mirkoukrywaczRefreshHideList();
				event.preventDefault();
				if (wxs_modal == null) createModalBox();
				wxs_modal.style.display = "block";
			};
		}
	}

	function createModalBox()
	{
		if (wxs_modal == null)
		{
			let html = `
			<div class="wykopxs wykopx_modal" id="wxs_modal">
				<div class="wykopx_modal-content">
					<aside class="wykopxs_info_bar wykopx_hide_this_if_stylus_is_installed">
						Masz już działający skrypt Wykop XS. Aby Mirkoukrywacz działał, musisz zainstalować i włączyć w Stylusie <a href="http://wiki.wykopx.pl" target="_blank">Wykop X</a>
					</aside>
	
					<aside class="wxs_modal_is_turned_off wykopx_hide_this_if_mirkoukrywanie_is_turned_on">
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
					<footer>
						<span>Usuń z Mirkoukrywacza</span>
						
						<section>
	
						<select id="wxs_mirkoukrywacz_delete_block_type">
							<option value="all" selected>wszystkie</option>
							<option value="minimized">zwinięte (Krawężnik)</option>
							<option value="hidden">ukryte (Mirkoukrywacz)</option>
						</select>
	
						<select id="wxs_mirkoukrywacz_delete_resource">
							<option value="all" selected>znaleziska, wpisy i komentarze</option>
							<option value="links">znaleziska</option>
							<option value="entries">wpisy</option>
							<option value="comments">komentarze</option>
						</select>					
						
						<select id="wxs_mirkoukrywacz_delete_timespan">
							<option value="30">starsze niż miesiąc</option>
							<option value="14">starsze niż 2 tygodnie</option>
							<option value="7">starsze niż 7 dni</option>
							<option value="3" selected>starsze niż 3 dni</option>
							<option value="1">starsze niż 1 dzień</option>
							<option value="0">wszystkie</option>
						</select> 
	
						</section>
	
						<button id="wxs_mirkoukrywacz_delete_older_than_7_days">Usuń</button>
	
						<button id="wxs_mirkoukrywacz_delete_all" style="color: rgb(255, 60, 60); margin-left: auto;">Usuń wszystkie</button>
					</footer>
				</div>
			</div>`;

			document.body.insertAdjacentHTML('afterbegin', html);
			wxs_modal = document.getElementById("wxs_modal");

			window.onclick = function (event)
			{
				if (event.target == wxs_modal)
				{
					wxs_modal.style.display = "none";
				}
			};
		}
	}


	function mirkoukrywaczRemoveTooOld(PointerEvent, options) 
	{
		if (localStorageMirkoukrywacz && options)
		{
			const now = dayjs();
			let numberOfRemovedItems = 0;

			localStorageMirkoukrywacz.iterate(function (value, id, iterationNumber)
			{
				if (value.blockingType == options.blockingType || options.blockingType == "all") // "hidden", "minimized"
				{
					const itemDate = dayjs(value.date);
					const diffInDays = now.diff(itemDate, 'day', true); // true - floating point

					if (diffInDays >= options.days)
					{
						numberOfRemovedItems++;

						localStorageMirkoukrywacz.removeItem(id).then(function ()
						{
							document.getElementById(`wykopx_mirkoukrywacz_element_${id}`).remove();
						}).catch(function (err) { console.log(err); });
					}
				}
			}).then(function ()
			{
				if (numberOfRemovedItems > 0)
				{
					if (options.days == 0) alert(`Wykop X Mirkowołacz: 

Usunięto wszystkie elementy z listy.
Od teraz będą się one znów wyświetlać na Wykopie`);
					else alert(`Wykop X Mirkowołacz: 

${numberOfRemovedItems} ukrytych elementów starszych niż ${options.days} dni
zostało usuniętych z listy Mirkoukrywacza.

Od teraz będą się one znów wyświetlać na Wykopie`);
				}
			}).catch(function (err)
			{
				console.log(err);
			});
		}
	}











	/* AUTOMATYCZNIE POKAŻ CAŁOŚĆ DŁUGICH TREŚCI */
	function autoOpenMoreContentEverywhere()
	{
		if (settings.autoOpenMoreContentEverywhere)
		{
			let showMoreButtons = document.querySelectorAll("div.wrapper button.more");
			if (showMoreButtons?.length > 0)
			{
				showMoreButtons.forEach(button =>
				{
					button.click()
				});
				consoleX(`Automatycznie rozwinięto ${showMoreButtons.length} długich wpisów i komentarzy`);
			}
		}
	}
	/* AUTOMATYCZNIE ROZWIJAJ SPOILERY */
	function autoOpenSpoilersEverywhere()
	{
		if (settings.autoOpenSpoilersEverywhere) 
		{
			let showSpoilerButtons = document.querySelectorAll("div.wrapper section.content-spoiler button");
			if (showSpoilerButtons?.length > 0)
			{
				showSpoilerButtons.forEach(button =>
				{
					button.click()
				});
				consoleX(`Automatycznie rozwinięto ${showSpoilerButtons.length} spoilerów`);
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



	if (settings.categoryRedirectToMicroblogButtonEnable)
	{
		waitForKeyElements(`ul.categories`, categoryRedirectToMicroblogButton, false); // waitForKeyElements sends jNode object, not DOM object
	}

	// przyciski MIRKO w kategoriach
	function categoryRedirectToMicroblogButton()
	{
		// consoleX("categoryRedirectToMicroblogButton()", 1);

		/*
			"Najnowsze":"_mikroblog_najnowsze",
			"Ostatnio wybrane":"_mikroblog",
			"Aktywne":"_mikroblog_aktywne",
			"Gorące (2h)":"_mikroblog_gorace_2",
			"Gorące (6h)":"_mikroblog_gorace_6",
			"Gorące (12h)":"_mikroblog_gorace_12",
			"Gorące (24h)":"_mikroblog_gorace_24"
		*/
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
				href += settings.categoryRedirectToMicroblogButtonFilter;
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
				href += settings.categoryRedirectToMicroblogButtonFilter;
				const microblogButtonHtml = `<li class="wykopxs wykopx_categories_microblog_li"><a class="wykopxs wykopx_categories_microblog_a" href="${href}"></a></li>`;
				$(this).after(microblogButtonHtml);
			});
		}
	}







	// otwieranie powiadomienia SPM w nowej karcie 
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
		if (settings.myWykopInTopNavJS)
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
		if (settings.hitsInTopNavJS)
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
		if (settings.favoritesInTopNavJS)
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
		if (settings.addNewLinkInTopNavJS)
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

		if (settings.addNewEntryInTopNavJS)
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

		// TODO IF
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


	// QUICK LINKS
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
					<a href="/" target="_self" title="Wykop X: Przejdź na stronę główną Wykopu">Główna</a>
				</span>
				<div>
					<a href="/najnowsze" target="_self" title="Wykop X: Najnowsze znaleziska, które dostały się na główną">Najnowsze</a>
					<a href="/aktywne" target="_self" title="Wykop X: Najpopularniejsze znaleziska na stronie głównej z ostatnich 24 godzin">Aktywne</a>
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
					<a href="/ulubione/znaleziska" target="_self" title="Wykop X: Znaleziska dodane przez Ciebie do Ulubionych">Znaleziska</a>
					<a href="/ulubione/komentarze-znaleziska" target="_self" title="Wykop X: Komentarze pod znaleziskami dodane przez Ciebie do Ulubionych">Komentarze do znalezisk</a>
				</div>
			</section>
		</nav>
		
		<nav class="upcoming">
			<section>
				<span>Dodaj</span>
				<div>
					<a href="/dodaj-link" target="_self" title="Wykop X: Dodaj nowe znalezisko (link do strony internetowej)">Nowe znalezisko</a>
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
				<span>Moja aktywność</span>
				<div>
					<a href="/ludzie/${user.username}/znaleziska/dodane" target="_self">Moje znaleziska</a>
					<a href="/ludzie/${user.username}/znaleziska/komentowane" target="_self">Komentowane</a>
					<a href="/ludzie/${user.username}/znaleziska/wykopane" target="_self">Wykopane</a>
					<a href="/ludzie/${user.username}/znaleziska/zakopane" target="_self">Zakopane</a>
				</div>
			</section>

			<section>
				<span>Ulubione</span>
				<div>
				<a href="/ulubione/znaleziska" target="_self" title="Wykop X: Znaleziska dodane przez Ciebie do Ulubionych">Znaleziska</a>
				<a href="/ulubione/komentarze-znaleziska" target="_self" title="Wykop X: Komentarze pod znaleziskami dodane przez Ciebie do Ulubionych">Komentarze do znalezisk</a>
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
				<a href="/mikroblog/#dodaj" target="_self" title="Wykop X: Dodaj nowy wpis na Mikroblogu">Nowy wpis na Mirko</a>
				</div>
			</section>

			<section>
				<span>Mikroblog</span>
				<div>
					<a href="/mikroblog/najnowsze" target="_self" title="Wykop X: Najnowsze wpisy na Mikroblogu">Najnowsze</a>
					<a href="/mikroblog/aktywne" target="_self" title="Wykop X: Nowe, angażujące wpisy na Mikroblogu">Aktywne</a>
				</div>
			</section>

			<section>
				<span>
					<a href="/mikroblog/gorace" target="_self" title="Wykop X: Przejdź na ostatnio wybrane gorące">Gorące</a>
				</span>
				<div>
					<a href="/mikroblog/gorace/2" class="wxs_quicklink_short" target="_self" title="Wykop X: Najbardziej gorące wpisy z ostatnich 2 godzin">2h</a>
					<a href="/mikroblog/gorace/6" class="wxs_quicklink_short" target="_self" title="Wykop X: Najbardziej gorące wpisy z ostatnich 6 godzin">6h</a>
					<a href="/mikroblog/gorace/12" class="wxs_quicklink_short" target="_self" title="Wykop X: Najbardziej gorące wpisy z ostatnich 12 godzin">12h</a>
					<a href="/mikroblog/gorace/24" class="wxs_quicklink_short" target="_self" title="Wykop X: Najbardziej gorące wpisy z ostatnich 24 godzin">24h</a>
				</div>
			</section>

			<section>
				<span>
					Moja aktywność
				</span>
				<div>
					<a href="/ludzie/${user.username}/wpisy/dodane" target="_self">Moje wpisy</a>
					<a href="/ludzie/${user.username}/wpisy/komentowane" target="_self">Komentowane</a>
					<a href="/ludzie/${user.username}/wpisy/plusowane" target="_self">Zaplusowane</a>
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
				<span>Moja aktywność</span>
				<span>Mikroblog</span>
				<div>
					<a href="/ludzie/${user.username}/wpisy/dodane" target="_self">Moje wpisy</a>
					<a href="/ludzie/${user.username}/wpisy/komentowane" target="_self">Moje komentarze</a>
					<a href="/ludzie/${user.username}/wpisy/plusowane" target="_self">Moje plusy</a>
				</div>
			</section>
			<section>
				<span>Znaleziska</span>
				<div>
					<a href="/ludzie/${user.username}/znaleziska/dodane" target="_self">Moje znaleziska</a>
					<a href="/ludzie/${user.username}/znaleziska/komentowane" target="_self">Moje komentarze</a>
					<a href="/ludzie/${user.username}/znaleziska/wykopane" target="_self">Wykopane</a>
					<a href="/ludzie/${user.username}/znaleziska/zakopane" target="_self">Zakopane</a>
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
					<a href="/dodaj-link" target="_self" title="Wykop X: Dodaj nowe znalezisko (link do strony internetowej)">Nowe znalezisko</a>
					<a href="/mikroblog/#dodaj" target="_self" title="Wykop X: Dodaj nowy wpis na Mikroblogu">Nowy wpis na Mirko</a>
				</div>
			</section>
		</nav>

		`;
				document.querySelector('body > section > header.header > div.left').appendChild(wxs_quick_links);
			}
		}

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

	let specialCharacter = "."; // ឴= "឴";

	function changeDocumentTitle(new_document_title)
	{
		// console.log(`changeDocumentTitle() > start:  document.title:`);
		// console.log(document.title);
		// console.log(`changeDocumentTitle() > start:  originalTabTitle`);
		// console.log(originalTabTitle);

		if (settings.tabTitleRemoveWykopPL)
		{
			originalTabTitle = originalTabTitle.replace(":: Wykop.pl", "");
		}

		let tabTitleNotifications = "";

		if (settings.tabTitleShowNotificationsEnabled == true)
		{
			let notificationsTotalCount = 0;

			let tabNotificationsSeparated = "";

			if (unreadNotifications["total"] > 0)
			{
				if (settings.tabTitleShowNotificationsCountPM && unreadNotifications["pm"] > 0
					|| settings.tabTitleShowNotificationsCountTagsNewLink && unreadNotifications["tags_new_link_with_observed_tag"] > 0
					|| settings.tabTitleShowNotificationsCountTagsNewEntry && unreadNotifications["tags_new_entry_with_observed_tag"] > 0
					|| settings.tabTitleShowNotificationsCountEntries && unreadNotifications["entries"] > 0)
				{
					let notificationsEmoji = "";

					if (settings.tabTitleShowNotificationsCountPM && unreadNotifications["pm"] > 0)
					{
						notificationsTotalCount += unreadNotifications["pm"];
						notificationsEmoji = "✉"; // 🔗✉📧📩✉ 🖂 🖃 🖄 🖅 🖆
						tabNotificationsSeparated += `${notificationsEmoji}${unreadNotifications["pm"]} `;
					}

					if (settings.tabTitleShowNotificationsCountEntries && unreadNotifications["entries"] > 0)
					{
						notificationsTotalCount += unreadNotifications["entries"];
						notificationsEmoji = "🕭"; // 🕭🔔
						tabNotificationsSeparated += `${notificationsEmoji}${unreadNotifications["entries"]} `;
					}

					if (unreadNotifications["tags"] && settings.tabTitleShowNotificationsCountTagsNewLink || settings.tabTitleShowNotificationsCountTagsNewEntry)
					{
						notificationsEmoji = "#"; // #🏷
						if (settings.tabTitleShowNotificationsCountTagsNewLink && unreadNotifications["tags_new_link_with_observed_tag"] > 0)
						{
							notificationsTotalCount += unreadNotifications["tags_new_link_with_observed_tag"];
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

		// console.log("changeDocumentTitle() > zmieniam document.title na: " + documentTitle);
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
		// console.log("executeTabAndFaviconChanges()")

		if (document.hidden || !settings.tabChangeOnlyOnHiddenState)
		{
			if (settings.tabFaviconEnabled) changeDocumentFavicon(settings.tabFaviconSelect);
			if (settings.tabTitleEnabled || settings.tabTitleShowNotificationsEnabled) changeDocumentTitle(settings.tabTitleSelect);
		}
	}



	// EVENT: KARTA JEST W TLE document.hidden == true
	// https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
	// https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
	function tabVisibilityChanged()
	{
		// console.log("tabVisibilityChanged(): " + document.visibilityState)

		// document.visibilityState > "visible"/"hidden"
		// document.hidden > true/false

		if (document.hidden)
		{
			executeTabAndFaviconChanges();
			// console.log(`document.hidden -> true > document.visibilityState: ${document.visibilityState}`);
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
	document.addEventListener("visibilitychange", tabVisibilityChanged, false); // ICO PNG GIF JPEG SVG




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

				// console.log(`Nowy tytuł strony: ${mutatedTitle}`);
				// if (mutatedTitle.endsWith(":: Wykop.pl"))
				// {
				// 	originalTabTitle = mutatedTitle;
				// 	console.log(`mutatedTitle.endsWith(":: Wykop.pl")`);
				// }
				if (!mutatedTitle.includes(specialCharacter)) // tytul nie zostal jeszcze zmieniony i dodane są liczby powiadomien zeby sie nie powtarzalo (1)(1)
				{
					originalTabTitle = mutatedTitle;
					// console.log(`!mutatedTitle.includes("specialCharacter")`);
				}

				titleMutationObserver.disconnect();
				executeTabAndFaviconChanges();
				titleMutationObserver.observe(document.querySelector('title'), { childList: true, })
				// console.log("originalTabTitle: " + originalTabTitle)
			}
		}
	});
	// MUTATION OBSERVER
	titleMutationObserver.observe(document.querySelector('title'), { childList: true, })






















	// PLUSES OBSERVER
	function getVotesObject(sectionObjectElement, ratingBoxSection)
	{
		/* returns:
		{
			resource: "entry"
			sectionObjectElement: <DOMElement>,
			ratingBox: <DOMElement>,
			entry: <DOMElement>,
			id: 123456,
			entry_id: 123456,
		}
		or
		{
			resource: "entry_comment"
			sectionObjectElement: <DOMElement>
			ratingBox: <DOMElement>,
			entry: <DOMElement>, // parent
			comment: DOMElement,
			id: 12345678,
			entry_id: 123456,	// parent
			comment_id: 12345678,
		}
		or
		{
			resource: "link_subcomment"
			sectionObjectElement: DOMElement
			ratingBox: <DOMElement>,
			entry: <DOMElement>,
			id: 12345678,
			entry_id: 123456,
			link_id: 12345678,
			comment_id: 12345678123
	
			parent_id: 1234567 // znalezisko
			parent_comment_id: 123456 // komentarz pod znaleziskiem
			parent_element: <DOMElement>, // komentarz
			fetchURL: 'https://wykop.pl/api/v3...'
		}
	
	
		ratingBoxSection.__vue__
		{
			voted: 		0  			// czy zaglosowane
			down:		0
			up:			278
			value:		278
			formattedValue: "278",
			separated:	false	
			id:			23456789
			idParent:	1234567
			linkId:		1234567
			users: 		[{}, {}...],
			type: "entryComment" / "???"
			deleted: 	null
			author:		"NadiaFrance"
			showBtn:	true / false
		}
	
	
		*/

		let blocks =
		{
			separated: false,

			votesUp: 0,
			votesDown: 0,
			votesCount: 0,
			votesAll: 0,
			votesCount: 0,
			votesAll: 0,
			votesDownPercent: 0,
			votesUpPercent: 100,
			voted: 0
		};


		blocks.sectionObjectElement = sectionObjectElement; 								// returns the section element above .rating-box
		blocks.ratingBoxSection = ratingBoxSection; 										// returns .rating-box section

		//blocks.id = blocks.sectionObjectElement.__vue__.item.id;
		blocks.id = ratingBoxSection.__vue__.id;
		blocks.separated = ratingBoxSection.__vue__.separated;
		blocks.votesUp = ratingBoxSection.__vue__.up;
		blocks.votesDown = ratingBoxSection.__vue__.down;

		blocks.votesCount = blocks.votesUp - blocks.votesDown;				// -10 (suma plusów i minusów nie dotyczy entry, entry_comment)
		blocks.votesAll = blocks.votesUp + blocks.votesDown;				// 30  (łączna liczba głosów nie dotyczy entry, entry_comment)
		blocks.votesDownPercent = Math.ceil(blocks.votesDown * 100 / blocks.votesAll);											// nie dotyczy entry, entry_comment
		blocks.votesUpPercent = Math.ceil(blocks.votesUp * 100 / blocks.votesAll);											// nie dotyczy entry, entry_comment zawsze 100%

		blocks.voted = ratingBoxSection.__vue__.voted;




		if (blocks.sectionObjectElement.__vue__.item.resource == "link") // znalezisko
		{

		}
		else
		{
			if (blocks.sectionObjectElement.__vue__.item.resource == "link_comment")
			{
				blocks.comment_element = blocks.sectionObjectElement;

				if (blocks.comment_element.__vue__.item.parent.resource == "link_comment") // subkomentarz
				{
					blocks.resource = "link_subcomment";
					blocks.comment_element.dataset.wxs_resource = "link_subcomment";

					blocks.comment_id = blocks.comment_element.__vue__.item.id;
					blocks.parent_id = blocks.comment_element.__vue__.item.parent.link.id; 	// id znaleziska
					blocks.parent_comment_id = blocks.comment_element.__vue__.item.parent.id; // id nadkomentarza
					blocks.parent_element = document.getElementById(`comment-${blocks.parent_comment_id}`) // nadkomentarz
					blocks.fetchURL = `https://wykop.pl/api/v3/links/${blocks.parent_id}/comments/${blocks.comment_id}/comments`; // TODO
				}
				else
				{
					blocks.resource = "link_comment";
					blocks.comment_element.dataset.wxs_resource = "link_comment";
					blocks.comment_id = blocks.comment_element.__vue__.item.id;
					blocks.parent_id = blocks.comment_element.__vue__.item.parent.id;
					blocks.parent_element = document.getElementById(`link-${blocks.parent_id}`) // section.link-block
					blocks.fetchURL = `https://wykop.pl/api/v3/links/${blocks.parent_id}/comments/${blocks.comment_id}`;

				}
			}
			// KOMENTARZ POD WPISEM
			else if (blocks.sectionObjectElement.__vue__.item.resource == "entry_comment")
			{
				blocks.comment_element = blocks.sectionObjectElement;

				if (blocks.comment_element.parentNode)
				{
					blocks.resource = "entry_comment"; 								// komentarz pod wpisem
					blocks.comment_element.dataset.wxs_resource = "entry_comment";
					blocks.parent_element = blocks.comment_element.parentNode.closest('section.entry');
					blocks.parent_id = blocks.parent_element.__vue__.item.id;
					blocks.comment_id = blocks.comment_element.__vue__.item.id;
					blocks.fetchURL = `https://wykop.pl/api/v3/entries/${blocks.parent_id}/comments/${blocks.comment_id}`;
				}
				else
				{
					return null;
				}
			}
			// WPIS NA MIKROBLOGU
			else if (blocks.sectionObjectElement.__vue__.item.resource == "entry")
			{
				blocks.parent_element = blocks.sectionObjectElement; 	// parent = this
				blocks.parent_id = blocks.parent_element.__vue__.item.id;
				blocks.resource = "entry";
				blocks.fetchURL = `https://wykop.pl/api/v3/entries/${blocks.parent_id}`;
				blocks.parent_element.dataset.wxs_resource = "entry";
			}
		}


		//blocks.sectionObjectElement.dataset.wxs_votes_up = blocks.votesUp;			// <section data-wxs_votes_up="1" data_wxs_votes_down="8">
		//blocks.sectionObjectElement.dataset.wxs_votes_down = blocks.votesDown;

		console.log("blocks");
		console.log(blocks);

		return blocks;
	}




	function checkPluses(sectionObjectElement, ratingBoxSection, showUpdatedValues = true)
	{
		if (sectionObjectElement == null && ratingBoxSection)
		{
			sectionObjectElement = ratingBoxSection.closest("section.entry")
		}

		if (sectionObjectElement && sectionObjectElement.__vue__.item.deleted == null)
		{
			ratingBoxSection = sectionObjectElement.querySelector("section.rating-box");
			const votesObject = getVotesObject(sectionObjectElement, ratingBoxSection);

			if (votesObject) // nie dla subkomentarzy
			{
				console.log("votesObject");
				console.log(votesObject);

				// let sectionObjectElement = votesObject.sectionObjectElement;
				sectionObjectElement.classList.remove("plusesAdded", "plusesRemoved", "minusesAdded", "minusesRemoved");

				sectionObjectElement.style.removeProperty('--plusesAdded');
				sectionObjectElement.style.removeProperty('--plusesRemoved');
				sectionObjectElement.style.removeProperty('--minusesAdded');
				sectionObjectElement.style.removeProperty('--minusesRemoved');

				console.log("API fetch: " + votesObject.fetchURL);

				fetch(votesObject.fetchURL,
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
						// console.log("entry_fetched_data");
						// console.log(entry_fetched_data);

						entry_fetched_data.votes.votesUp = entry_fetched_data.votes.up;
						entry_fetched_data.votes.votesDown = entry_fetched_data.votes.down;
						entry_fetched_data.votes.votesCount = entry_fetched_data.votes.up - entry_fetched_data.votes.down; 		// -10 (suma plusów i minusów nie dotyczy entry, entry_comment)
						entry_fetched_data.votes.votesAll = entry_fetched_data.votes.up + entry_fetched_data.votes.down; 		// 30  (łączna liczba głosów nie dotyczy entry, entry_comment)
						entry_fetched_data.votes.votesUpPercent = 0;															// nie dotyczy entry, entry_comment zawsze 100%
						entry_fetched_data.votes.votesDownPercent = 0;															// nie dotyczy entry, entry_comment


						// ile plusów przybyło/ubyło od ostatniego sprawdzenia
						let plusesDelta = entry_fetched_data.votes.up - sectionObjectElement.dataset.wxs_votes_up;
						let minusesDelta = entry_fetched_data.votes.down - sectionObjectElement.dataset.wxs_votes_down;
						const votesCountChanged = (plusesDelta != 0 || minusesDelta != 0);

						// console.log("dataset.votesup: " + sectionObjectElement.dataset.wxs_votes_up + " / plusesDelta: " + plusesDelta)
						// console.log("sectionObjectElement.dataset")
						// console.log(sectionObjectElement.dataset)
						// console.log(sectionObjectElement)

						sectionObjectElement.dataset.wxs_votes_up = entry_fetched_data.votes.up;											// 10
						sectionObjectElement.dataset.wxs_votes_down = entry_fetched_data.votes.down;										// 20  - dodatnia nie dotyczy entry, entry_comment
						sectionObjectElement.dataset.wxs_votes_count = entry_fetched_data.votes.votesCount;									// -10 (suma plusów i minusów nie dotyczy entry, entry_comment)
						sectionObjectElement.dataset.wxs_votes_all = entry_fetched_data.votes.votesAll; 									// 30  (łączna liczba głosów nie dotyczy entry, entry_comment)
						sectionObjectElement.dataset.wxs_voted = entry_fetched_data.voted;


						if (votesCountChanged)
						{
							console.log("--------------------");
							console.log("VOTES COUNT CHANGED")
							console.log(sectionObjectElement)

							// console.log("OLD sectionObjectElement.dataset.wxs_votes_up: " + sectionObjectElement.dataset.wxs_votes_up)
							//console.log("OLD sectionObjectElement.dataset.wxs_votes_down: " + sectionObjectElement.dataset.wxs_votes_down)
							// console.log("NEW entry_fetched_data.votes.up: " + entry_fetched_data.votes.up)
							//console.log("NEW entry_fetched_data.votes.down: " + entry_fetched_data.votes.down)
							// console.log("plusesDelta " + plusesDelta)
							//console.log("minusesDelta:  " + minusesDelta)
							// console.log("--------------------");
							// sectionObjectElement.dataset.wxs_votes_separated = votesObject.separated;

							if (!ratingBoxSection)
							{
								ratingBoxSection = sectionObjectElement.querySelector("section.rating-box");
							}


							const timeSinceFirtsLoad = (dayjs().valueOf() - sectionObjectElement.dataset.wxs_first_load_time) / 1000; // liczba sekund od zaladowania

							if (timeSinceFirtsLoad > votesFetchingFirstDelayInSeconds + 5)
							{

								let votesPerHour = (entry_fetched_data.votes.votesCount - sectionObjectElement.dataset.wxs_first_load_votes_count) * 3600 / timeSinceFirtsLoad;
								let votesPerHourString;

								// PLUSÓW NA GODZINE
								if (votesPerHour == 0)
								{
									votesPerHourString = "0";
								}
								else if (votesPerHour > 0 && votesPerHour < 0.9)
								{
									votesPerHourString = "< 1";
								}
								else
								{
									votesPerHour = votesPerHour.toFixed(1);
									//votesPerHour = Math.round(votesPerHour)
									votesPerHourString = `+ ${votesPerHour} plusa / h`;
								}

								const ratingBoxVotesPerHour = ratingBoxSection.querySelector(".wxs_votes_per_hour");
								ratingBoxVotesPerHour.dataset.wxs_votes_per_hour = votesPerHourString;				// data-wxs_votes_per_hour
							}


							if (entry_fetched_data.votes.votesAll > 0)
							{
								entry_fetched_data.votes.votesDownPercent = Math.ceil(entry_fetched_data.votes.down * 100 / entry_fetched_data.votes.votesAll);
								entry_fetched_data.votes.votesUpPercent = Math.ceil(entry_fetched_data.votes.up * 100 / entry_fetched_data.votes.votesAll);
								sectionObjectElement.dataset.wxs_votes_up_percent = entry_fetched_data.votes.votesUpPercent;
								sectionObjectElement.dataset.wxs_votes_down_percent = entry_fetched_data.votes.votesDownPercent;

							}
							if (votesObject.resource == "entry" || votesObject.resource == "link_comment")
							{
								sectionObjectElement.dataset.wxs_comment_count = entry_fetched_data.comments.count;
							}



							// console.log("votesObject:");
							// console.log(votesObject);
							// console.log("sectionObjectElement.dataset:");
							// console.log(sectionObjectElement.dataset);

							if (showUpdatedValues)
							{
								updateVisibleVotesCount(sectionObjectElement)

								// PRZYBYŁY PLUSY
								if (plusesDelta != 0)
								{
									// console.log("Zmienila sie liczba plusow - plusesDelta:" + plusesDelta);
									// console.log("sectionObjectElement.dataset.wxs_votes_up:" + sectionObjectElement.dataset.wxs_votes_up);
									// if() zamiana li.zero na li.plus

									if (plusesDelta > 0)
									{
										sectionObjectElement.style.setProperty('--plusesAdded', `"+${plusesDelta}"`);
										sectionObjectElement.classList.add("plusesAdded");
									}
									else
									{
										sectionObjectElement.style.setProperty('--plusesRemoved', `"${plusesDelta}"`); // jest z minusem
										sectionObjectElement.classList.add("plusesRemoved");
									}
								}

								// PRZYBYŁY MINUSY
								if (minusesDelta != 0)
								{
									if (minusesDelta > 0)
									{
										sectionObjectElement.style.setProperty('--minusesAdded', `"-${minusesDelta}"`);
										sectionObjectElement.classList.add("minusesAdded");
									}
									else
									{
										sectionObjectElement.style.setProperty('--minusesRemoved', `"+${minusesDelta}"`);
										sectionObjectElement.classList.add("minusesRemoved");
									}
								}
							}
						}
					});
			}
		}
	}

	function updateVisibleVotesCount(sectionObjectElement, onlyPluses = false)
	{


		const separated = sectionObjectElement.dataset.wxs_votes_separated;
		let votesNumber = (separated == "true" ? sectionObjectElement.dataset.wxs_votes_count : sectionObjectElement.dataset.wxs_votes_up);

		sectionObjectElement.style.setProperty('--votesUp', `"+` + votesNumber + `"`);

		// zbytek
		let plusLi = sectionObjectElement.querySelector("section.rating-box > ul > li.plus");
		if (!plusLi) plusLi = sectionObjectElement.querySelector("section.rating-box > ul > li.zero");
		plusLi.textContent = votesNumber;


		if (onlyPluses == false)
		{
			const votesDown = sectionObjectElement.dataset.wxs_votes_down;
			sectionObjectElement.style.setProperty('--votesDown', `"` + votesDown + `"`);
			// zbytek
			let minusLi = sectionObjectElement.querySelector("section.rating-box > ul > li.minus");
			if (minusLi) minusLi.textContent = votesDown;
		}


	}







	// <section class="rating-box" data-wxs_pluses="269" data-wxs_minuses="0" data-wxs_pluses_minuses_total="269" data-wxs_pluses_below_limit="true">
	function parseRatingBoxCurrentContentAndCreateDataValues(ratingBoxSection)
	{
		// dodanie data-wxs_pluses na podstawie aktualnych wartosci plusow w HTML
		// console.log("parseRatingBoxCurrentContentAndCreateDataValues(ratingBoxSection)")

		const minusLi = ratingBoxSection.querySelector('li.minus');
		let plusLi = ratingBoxSection.querySelector('li.plus');
		if (!plusLi) plusLi = ratingBoxSection.querySelector('li.zero')
		let votesUp = plusLi ? plusLi.textContent : 0; 				// 5liczba plusów
		let votesDown = minusLi ? -1 * minusLi.textContent : 0; 	// 15 liczba minusów (dodatnia)
		let votesCount = votesUp - votesDown;						// -10 suma plusów i minusów
		let votesAll = votesUp + votesDown;							// 20 liczba glosow


		ratingBoxSection.dataset.wxs_votes_up = votesUp;
		ratingBoxSection.dataset.wxs_votes_down = votesDown;
		ratingBoxSection.dataset.wxs_votes_count = votesCount;
		ratingBoxSection.dataset.wxs_votes_all = votesAll;

		// limit ukrywania wpisow przypietych na glownej
		const homepagePinnedEntriesPlusesLimit = settings.homepagePinnedEntriesHideBelowLimit;
		if (homepagePinnedEntriesPlusesLimit > 0)
		{
			// czy wpis jest poniżej limitu ukrywania wpisow przypietych na glownej
			let plusesBelowLimit = (votesCount < homepagePinnedEntriesPlusesLimit ? true : false);
			ratingBoxSection.dataset.wxs_pluses_below_limit = plusesBelowLimit;
		}
	}



	// VOTING REAL UPDATE, VOTING EXPLOSION
	function votingEventListener(sectionObjectElement, ratingBoxSection)
	{

		if (sectionObjectElement && ratingBoxSection)
		{
			if (settings.checkEntryPlusesWhenVoting)
			{
				ratingBoxSection.addEventListener('mouseenter', function (event)
				{
					var clickedButton = event.target;
					console.log("mouseenter rating box")
					checkPluses(sectionObjectElement, ratingBoxSection, false);
				});
			}


			/* 
			
			ratingBoxSection.__vue__
			{
				voted: 		0  			// czy zaglosowane
				down:		0
				up:			278
				value:		278
				formattedValue: "278",
				separated:	false	
				id:			23456789
				idParent:	1234567
				linkId:		1234567
				users: 		[{}, {}...],
				type: "entryComment" / "???"
				deleted: 	null
				author:		"NadiaFrance"
				showBtn:	true / false
			}
			*/
			ratingBoxSection.addEventListener('click', function (event)
			{
				var clickedButton = event.target;
				let count = 0;
				let vote = "voted"; // "voted", "unvoted"
				let action = "plused"; // "plused", "minused"
				let sign = "+";
				// let votesUp = ratingBoxSection.__vue__.up;
				// let votesDown = ratingBoxSection.__vue__.down;

				//let votesUp = sectionObjectElement.dataset.wxs_votes_up;
				//let votesDown = sectionObjectElement.dataset.wxs_votes_down;


				if (clickedButton.matches('button.plus.voted'))			// dodano plusa
				{
					action = "plused";
					vote = "voted";
					// count = votesUp;
					count = Number(sectionObjectElement.dataset.wxs_votes_up) + 1
					sectionObjectElement.dataset.wxs_votes_up = count;
				}
				else if (clickedButton.matches('button.plus:not(.voted)'))	// usunieto plusa
				{
					action = "plused";
					vote = "unvoted";
					//count = votesUp;
					count = Number(sectionObjectElement.dataset.wxs_votes_up) - 1
					sectionObjectElement.dataset.wxs_votes_up = count;
				}
				else if (clickedButton.matches('button.minus.voted')) 		//  dodano minusa
				{
					action = "minused";
					vote = "voted";
					sign = "-";
					count = votesDown;
					count = Number(sectionObjectElement.dataset.wxs_votes_down) + 1;
					sectionObjectElement.dataset.wxs_votes_down = count;
				}
				else if (clickedButton.matches('button.minus:not(.voted)')) // usunięto minusa
				{
					action = "minused";
					vote = "unvoted";
					sign = "-";
					//count = votesDown;
					count = Number(sectionObjectElement.dataset.wxs_votes_down) - 1
					sectionObjectElement.dataset.wxs_votes_down = count;
				}

				updateVisibleVotesCount(sectionObjectElement);

				// voting explosion
				if (settings.votingExplosionEnable && vote == "voted")
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

					parseRatingBoxCurrentContentAndCreateDataValues(ratingBoxSection); // TODO

					setTimeout(function ()
					{
						for (var i = 0; i < newDivs.length; i++)
						{
							newDivs[i].parentNode.removeChild(newDivs[i]);
						}

					}, 72500);
				}
			});
		}

	}











	const apiGetLink = "https://wykop.pl/api/v3/links/";
	/*
	<section id="link-7288349" class="link-block" 
		data-wxs_votes_up="183" data-wxs_votes_down="5" data-wxs_votes_count="178" data-voted="0" data-comments-count="10" data-comments-hot="false" data-hot="false" data-adult="false" data-wxs_created_at="2023-11-27 21:12:49" data-published-at="2023-11-28 15:22:38" data-title="Dwie awarie..." data-slug="dwie-awarie-w-ec-bedzin-wznowienie-dostaw-ciepla-w-koncu-tygodnia-rmf-24" data-wxs_description="Dwie awarie w (...)" data-wxs_source_label="www.rmf24.pl" data-source-u-r-l="https://www.rmf24.pl/regiony/slaskie/news..." data-wxs_source_type="anchor" data-tags="slaskie,bedzin,awaria,wydarzenia">
	*/

	function linkSectionIntersected(linkBlock)
	{
		//console.log("linkSectionIntersected(linkBlock)", linkBlock)

		// const linkBlock = jNodeLinkBlock[0]; // jNode => DOMElement
		//const link_id = linkBlock.id.replace("link-", ""); // 78643212
		const link_id = linkBlock.__vue__.item.id;

		const fetchURL = apiGetLink + link_id;

		console.log(fetchURL);


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
					console.log("link_data");
					console.log(link_data);

					linkBlock.dataset.wxs_votes_up = link_data.votes.up;								// liczba wykopów/plusów 10
					linkBlock.dataset.wxs_votes_down = link_data.votes.down;							// liczba zakopów/minusów 20
					linkBlock.dataset.wxs_votes_count = link_data.votes.count;							// suma plusów i minusów/ suma wykopów i zakopów -10 
					linkBlock.dataset.wxs_votes_all = link_data.votes.up + link_data.votes.down; 		// łączna liczba oddanych głosów 30 

					link_data.votes.votesDownPercent = 0;
					link_data.votes.votesUpPercent = 0;

					if (linkBlock.dataset.wxs_votes_all > 0)
					{
						link_data.votes.votesDownPercent = Math.ceil(link_data.votes.down * 100 / linkBlock.dataset.wxs_votes_all);
						link_data.votes.votesUpPercent = Math.ceil(link_data.votes.up * 100 / linkBlock.dataset.wxs_votes_all);
					}

					linkBlock.dataset.wxs_hot = link_data.hot;
					linkBlock.dataset.wxs_slug = link_data.slug;
					linkBlock.dataset.wxs_adult = link_data.adult;
					linkBlock.dataset.wxs_tags = link_data.tags;
					linkBlock.dataset.wxs_title = link_data.title;
					linkBlock.dataset.wxs_voted = link_data.voted;
					linkBlock.dataset.wxs_source_url = link_data.source.url;
					linkBlock.dataset.wxs_source_type = link_data.source.type;
					linkBlock.dataset.wxs_comments_hot = link_data.comments.hot;
					linkBlock.dataset.wxs_description = link_data.description;
					linkBlock.dataset.wxs_source_label = link_data.source.label;
					linkBlock.dataset.wxs_comment_count = link_data.comments.count;
					const linkBlockInfoSpan = linkBlock.querySelector("section > article > div.content > section.info > span");
					if (link_data.created_at)
					{
						linkBlock.dataset.wxs_created_at = link_data.created_at;
						const timeCreatedAt = document.createElement("time");
						timeCreatedAt.setAttribute("data-v-441f7cc5", null);
						timeCreatedAt.innerHTML = `Dodane: ${link_data.created_at}`;
						linkBlockInfoSpan.appendChild(timeCreatedAt);
					}

					if (link_data.published_at)
					{
						linkBlock.dataset.wxs_published_at = link_data.published_at;
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
					if (linkBlock.dataset.wxs_votes_all > 0)
					{
						sectionVoteBox.appendChild(votesMeter);
					}

				});
		}
	}









	/* ------ ZNIESIENIE LIMITÓW W TEXTAREA I INPUT PODCZAS WKLEJANIA TEKSTU ------ */

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


















	/* ------ HELPER FUNCTIONS --------- */

	// consoleX("TEXT")
	// consoleX("TEXT", false) 
	// consoleX("TEXT", 1) -- wyświetla tylko w trybie dev
	function consoleX(text, only_on_dev_mode = false)
	{
		if (only_on_dev_mode == false || dev == true)
		{
			let tpl = `background-color:black; border:1px solid rgba(244, 244, 244, 0.4); font-weight: bolder; padding: 0px 9px; font-family: "Segoe UI", "Open Sans", sans-serif; margin-right: 10px;`;
			if (only_on_dev_mode) tpl += `color:rgba(43, 255, 75, 1);`;
			else tpl += `color:rgba(255, 255, 255, 0.8);`;

			console.log(`%cWykop X%c` + text, `${tpl}`, `font-family: "Segoe UI", "Open Sans"`);
		}

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

	// returns array of words prefixed with + in string 
	// Output: ["r", "b", "f"]
	// Output: ["normal"]
	function getPlusWords(str)
	{
		console.log("getPlusWords(string): " + str)

		let matches = str.match(/\+\p{L}+/gu); // diacritics characters, nie działa dla: str.match(/\+\w+/g); 
		if (matches)
		{
			return matches.map(word => word.slice(1)); // 
		}
		else
		{
			return ["normal"];
		}
	}
	function removePlusWords(str)
	{
		let words = str.split(' ');
		let filteredWords = words.filter(word => word[0] !== '+');
		let stringWithout = filteredWords.join(' ');
		return stringWithout;
	}









	/* ------ PRZYCISK DO POBIERANIA OBRAZKÓW --------- */

	if (settings.allowToDownloadImage)
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






	/* ------ IMAGE UPLOADER CTRL+V --------- */

	if (settings.imageUploaderEnable)
	{
		waitForKeyElements("section.editor", testClipboard, false);
	}

	function testClipboard(jNodeTextareaWrapper)
	{

		const textareaWrapper = jNodeTextareaWrapper[0]; // jNode => DOMElement
		const textarea = textareaWrapper.querySelector("textarea");
		// console.log(textarea);
		const imageUploadPreview = document.createElement('figure');
		imageUploadPreview.classList.add("wykopxs", "wxs_uploaded_image_placeholder")
		textarea.parentNode.appendChild(imageUploadPreview);



		// PASTE EVENT
		document.addEventListener('paste', async (e) => 
		{
			// e.preventDefault();
			// e.stopPropagation(); 
			console.clear();
			// console.log("e.clipboardData.items") // object DataTransferItemList {0: DataTransferItem, 1: DataTransferItem, ...}
			// console.log(e.clipboardData.items)
			// console.log("clipboardData.types")
			// console.log(e.clipboardData.types) //  Array: ['Files', 'text/plain', 'text/html', 'application/vnd.code.copymetadata', 'vscode-editor-data']
			// console.log("clipboardData.files")
			// console.log(e.clipboardData.files)
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
		console.log(`handleWindowEvent(event) - event.type: ${event.type} was fired`);
		// console.log(event);
	}
	window.addEventListener('load', handleWindowEvent); 		// 1.
	window.addEventListener('pageshow', handleWindowEvent); 	// 2.
	window.addEventListener('popstate', handleWindowEvent);
	window.addEventListener('hashchange', handleWindowEvent);
	window.addEventListener('pagehide', handleWindowEvent);
	window.addEventListener('beforeunload', handleWindowEvent);
	window.addEventListener('unload', handleWindowEvent);

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




















	// ---- PAGE OPENED
	async function executeOnPageLoad()
	{
		if (isURLChanged()) newPageURL()



		const topHeaderProfileButton = document.querySelector("body header > div.right > nav > ul > li.account a.avatar");
		if (topHeaderProfileButton) user.username = topHeaderProfileButton.getAttribute("href").split('/')[2];
		// if (user.username == null) consoleX(`Cześć Anon. Nie jesteś zalogowany na Wykopie (⌐ ͡■ ͜ʖ ͡■)`);
		// else consoleX(`Cześć ${user.username} (⌐ ͡■ ͜ʖ ͡■)`);
		focusOnAddingNewMicroblogEntry();

		addWykopXButtonsToNavBar();
		if (settings.wxsSwitchesEnable)
		{
			runWithDelay(8000, function ()
			{
				addSwitchButtons();
			});
		}

		if (settings.notatkowatorEnable)
		{
			runWithDelay(17000, function ()
			{
				createMenuItemForNotatkowator();
			});
		}
		if (settings.mirkoukrywaczEnable)
		{
			runWithDelay(17000, function ()
			{
				createMenuItemForMirkoukrywacz();
			});
		}





		if (settings.observedTagsInRightSidebarEnable)
		{
			runWithDelay(4000, function ()
			{
				addObservedTagsToRightSidebar();
			});
		}



		// 8s
		runWithDelay(8000, function ()
		{
			addNotificationSummaryButtonToNavBar();
			addNightModeButtonToNavBar();
			unrollDropdowns();
			addExtraButtons();
			hideWykopXSPromo();
			refreshOrRedirectOnHomeButtonClick();
			refreshOrRedirectOnMicroblogButtonClick();
		});


		// 20s
		runWithDelay(20000, function ()
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

			addWykopXPromoBanner();
		});
	}


	// ----- NAVIGATION PAGE CHANGES
	async function executeOnPageChange(event)
	{
		console.log("executeOnPageChange() -- navigation - navigate event - " + event.type);
		console.log(event);

		originalTabTitle = document.title;

		//visiblePlusesObserver.disconnect();
		sectionObjectIntersectionObserver.disconnect();
		filterUserOff(); // usuniecie filtra komentarzy
		remveAllWXSAdded();


		runWithDelay(500, function ()
		{
			if (isURLChanged()) newPageURL();
		});

		// 7s
		if (!settings.tabChangeOnlyOnHiddenState) runWithDelay(7000, () => { executeTabAndFaviconChanges() })
	}


	function remveAllWXSAdded()
	{
		document.querySelectorAll(`section[data-wxs_username]`).forEach((el) =>
		{
			removeWXSAttributes(el)
		});
	}

	function removeWXSAttributes(sectionObjectElement)
	{
		console.log("removeWXSAttributes() from: " + sectionObjectElement.__vue__.item.id);

		sectionObjectElement.removeAttribute('style'); // custom css properties removed 

		Object.keys(sectionObjectElement.dataset).forEach(dataKey =>
		{
			if (dataKey.startsWith('wxs_'))
			{
				delete sectionObjectElement.dataset[dataKey];
			}
		});
	}


	// PAGE LOAD + PAGE CHANGES
	function executeOnPageLoadAndPageChange()
	{
		runWithDelay(7000, function ()
		{
			countNumberOfNotificationsOnDesktop();
		});

		if (settings.mirkoukrywaczEnable) 
		{
			runWithDelay(3000, function ()
			{
				mirkoukrywaczHideAllBlockedElements(); // ukrycie elementow blokowanych przez Mirkowolacz oraz actionBox
			});
		}

		if (pageType == "tag" && settings.tagHeaderEditable)
		{
			runWithDelay(2200, function ()
			{
				tagHeaderEditableWatcher();
			})
		}

		if (pageType == "profil")	// info o blokadzie
		{
			runWithDelay(2200, function ()
			{

			})
		}

		if (settings.autoOpenMoreContentEverywhere)
		{
			runWithDelay(6000, function ()
			{
				autoOpenMoreContentEverywhere();
			})
		}


		// 10s
		if (settings.autoOpenSpoilersEverywhere)
		{
			runWithDelay(10000, function ()
			{
				autoOpenSpoilersEverywhere();
			});
		}


		// waitForKeyElements(`html > iframe, html > body > iframe`, removeFromDOM, false);
		// waitForKeyElements(`html head script[src^="https://"]`, removeFromDOM, false);

		if (settings.removeAnnoyancesEnable)
		{
			runWithDelay(2000, function ()
			{
				if (settings.removeAnnoyancesIframes) waitForKeyElements(`html > iframe, html > body > iframe`, removeFromDOM, false);
				if (settings.removeAnnoyancesScripts) waitForKeyElements(`html > head > script[src^="https://"]`, removeFromDOM, false);
			})

			runWithDelay(20000, function ()
			{
				removeAnnoyances()
			})
		}




		waitForKeyElements("main.main > section > div.content section.stream > header.stream-top", buildConsole, false)
		buildConsole();
		refreshConsole();

	}

	// USUWANIE NATARCZYWYCH IFRAME, REKLAM I GDPR
	function removeAnnoyances()
	{
		// console.log("REMOVING iframes")
		if (settings.removeAnnoyancesIframes)
		{
			document.querySelectorAll("html > iframe, html > body > iframe").forEach((el) =>
			{
				removeFromDOM(el)
			});
		}

		if (settings.removeAnnoyancesAds)
		{
			document.querySelectorAll(`.pub-slot-wrapper:not(:has(section.premium-pub.link-block))`).forEach((el) =>
			{
				consoleData.annoyances.ads.count++;
				removeFromDOM(el);
			});
		}

		if (settings.removeAnnoyancesGDPR)
		{
			document.querySelectorAll(`div[class^="app_gdpr"]`).forEach((el) =>
			{
				document.querySelector("body").style = "overflow: initial!important;";
				consoleData.annoyances.other.count++;
				removeFromDOM(el);
			});
		}

		if (settings.removeAnnoyancesScripts)
		{
			document.querySelectorAll(`html > head > script[src^="https://"]`).forEach((el) =>
			{
				removeFromDOM(el);
			});
			document.querySelectorAll(`html > head > script[src^="//"]`).forEach((el) =>
			{
				removeFromDOM(el);
			});
		}

	}




	function removeFromDOM(Node)
	{
		if (Node)
		{
			if (Node instanceof jQuery)
			{
				if (Node[0])
				{
					//console.log("removeFromDOM(): REMOVING jQuery Node");
					//console.log(Node[0])
					Node[0].remove();
					let nodeName = Node[0].nodeName;
					nodeName = nodeName.toLowerCase()
					// console.log("nodeName:" + nodeName)
					if (!consoleData.annoyances[nodeName])
					{
						consoleData.annoyances[nodeName] = { count: 0 };
					}
					consoleData.annoyances[nodeName].count++;
				}

			}
			else if (Node instanceof Element)
			{
				//console.log("removeFromDOM(): REMOVING DOM Node");
				//console.log(Node)
				let nodeName = Node.nodeName;
				nodeName = nodeName.toLowerCase()
				//console.log("nodeName:" + nodeName)
				if (!consoleData.annoyances[nodeName])
				{
					consoleData.annoyances[nodeName] = { count: 0 };
				}
				consoleData.annoyances[nodeName].count++;
				Node.remove();
			}

			consoleData.annoyances.count++;
			//console.log("removeFromDOM(): REMOVED TOTAL: ", consoleData.annoyances.count)
			//console.log("removeFromDOM(): consoleData:");
			//console.log(consoleData);

			refreshConsole();
		}
	}




	// lOADED PAGE
	window.onload = function (event)
	{
		loadTime = dayjs();

		executeOnPageLoad();
		executeOnPageLoadAndPageChange();
	};

	/* NEW WYKOP PAGE REDIRECTION */
	navigation.addEventListener("navigate", (event) =>
	{
		loadTime = dayjs();

		executeOnPageChange(event);
		executeOnPageLoadAndPageChange();
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


			/* animation-name: quickLinksAnimationOff!important;
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