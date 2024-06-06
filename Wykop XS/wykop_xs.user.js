// ==UserScript==
// @name							Wykop XS 3.0
// @name:pl							Wykop XS 3.0
// @name:en							Wykop XS 3.0

// @version							3.0.59

// @description 					Wykop XS służy do wspomagania działania stylu "Wykop X Style 3", który jest sugerowany do poprawnego działania niniejszego skryptu. Wykop X Style znajdziesz na http://styl.wykopx.pl
// @description:en 					Wykop XS is a helper script for userstyle "Wykop X Style 3" which modifies wykop.pl website and make it easier to use adding enhancements and new features. Check it out here: http://styl.wykopx.pl


// Chcesz wesprzeć projekt Wykop X? Postaw kawkę:
// @contributionURL					https://buycoffee.to/wykopx

// @author							Wykop X <wykopx@gmail.com>









// @match							https://wykop.pl/*
// @match							https://github.com/wykopx/*

// @supportURL						http://wykop.pl/tag/wykopwnowymstylu
// @namespace						Violentmonkey Scripts
// @compatible						chrome, firefox, opera, safari, edge
// @license							No License


// @require							https://unpkg.com/localforage@1.10.0/dist/localforage.min.js
// @require							https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js
// @require							https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/relativeTime.js




// ==/UserScript==


(async function ()
{
	'use strict';


	const currentVersion = "3.0.59";
	let dev = false;

	const promoString = " [Dodane przez Wykop XS]";

	const root = document.documentElement;
	const head = document.head;
	const body = document.body;
	const bodySection = body.querySelector("section");



	// github
	if (!bodySection)
	{
		const openGitHubSidebar = () =>
		{
			document.querySelector('div#wiki-wrapper div#wiki-content button.js-wiki-more-pages-link')?.click();
		};

		openGitHubSidebar();
		window.addEventListener('load', openGitHubSidebar);
		window.addEventListener('pageshow', openGitHubSidebar);
		// window.addEventListener('popstate', openGitHubSidebar);
		// window.addEventListener('hashchange', openGitHubSidebar);
		// window.addEventListener('pagehide', openGitHubSidebar);
		// window.addEventListener('beforeunload', openGitHubSidebar);
		// window.addEventListener('unload', openGitHubSidebar);
		if (window.navigation)
		{
			window.navigation.addEventListener('navigate', function ()
			{
				openGitHubSidebar();
			});
		}
	}
	// wykop
	else
	{
		const wykopxSettings = getComputedStyle(head); // getComputedStyle(document.documentElement) -- nie działa, nie wczytuje właściwości z :root
		const settings = {};

		const styleElement = document.createElement('style');
		styleElement.id = "wykopxs";
		let CSS = "";

		function setSettingsValueFromCSSProperty(settingName, defaultValueForWykopXS = true, propertyValueInsteadOfBoolean = false)
		{
			if (propertyValueInsteadOfBoolean) settings[settingName] = wykopxSettings.getPropertyValue(`--${settingName}`) ? wykopxSettings.getPropertyValue(`--${settingName}`).trim() : defaultValueForWykopXS;
			else settings[settingName] = wykopxSettings.getPropertyValue(`--${settingName}`) ? wykopxSettings.getPropertyValue(`--${settingName}`).trim() === '1' : defaultValueForWykopXS;
		}

		setSettingsValueFromCSSProperty("WykopXSEnabled");
		if (settings.WykopXSEnabled == false) return;
		/* WYKOP XS HEADER */



		let loggedUser = {
			//data: null,
			username: null		// loggedUser.username -> nazwa zalogowanego uzytkownika
		};
		let wxs_modal = null;

		let loadTime = dayjs();
		dayjs.extend(window.dayjs_plugin_relativeTime); //dayjs.extend(relativeTime); // https://day.js.org/docs/en/plugin/relative-time // https://www.jsdelivr.com/package/npm/dayjs?tab=files&path=plugin

		// wykop_xs_mikroczat.user.js -MIKROCZAT/LISTA PLUSUJĄCYCH - settings
		setSettingsValueFromCSSProperty("entryVotersListEnable");				// włącza pokazywanie listy plusujących z Wykop X Style
		setSettingsValueFromCSSProperty("entryVotersListExpandIfLessThan", 50, true);
		setSettingsValueFromCSSProperty("fixNotificationBadgeBug");				// naprawia wykopowy błąd - ukrywa liczbę nieprzeczytanych powiadomien, gdy wszystkie powiadomienia sa juz przeczytane
		setSettingsValueFromCSSProperty("hideAds");								// blokuje wszystkie reklamy na wykopie

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


		settings.version = (getComputedStyle(bodySection).getPropertyValue("--version").trim().slice(1, -1)); 	// "2.48";
		settings.versor = (getComputedStyle(bodySection).getPropertyValue("--versor").trim().slice(1, -1)); 	// "style", "blank", "block"
		settings.xblocker = (getComputedStyle(bodySection).getPropertyValue("--xblocker").trim().slice(1, -1)); // "2.48";



		if (!dev) dev = setSettingsValueFromCSSProperty("wxsDev", false);





		setSettingsValueFromCSSProperty("WykopXStyleEnabled", false);
		setSettingsValueFromCSSProperty("hitsInTopNavJS");
		setSettingsValueFromCSSProperty("quickLinksEnable");
		setSettingsValueFromCSSProperty("myWykopInTopNavJS");
		setSettingsValueFromCSSProperty("favoritesInTopNavJS");
		setSettingsValueFromCSSProperty("imageUploaderEnable", false); // https://github.com/wykopx/WykopX/wiki/X-Wklejanie-obrazkow-ze-schowka
		setSettingsValueFromCSSProperty("addNewLinkInTopNavJS");
		setSettingsValueFromCSSProperty("disableNewLinkEditorPastedTextLimit");
		setSettingsValueFromCSSProperty("autoOpenMoreContentEverywhere");
		setSettingsValueFromCSSProperty("autoOpenSpoilersEverywhere");
		setSettingsValueFromCSSProperty("observedTagsInRightSidebarEnable");
		setSettingsValueFromCSSProperty("linkVoteDownButton");
		setSettingsValueFromCSSProperty("infiniteScrollEntriesEnabled");
		setSettingsValueFromCSSProperty("infiniteScrollLinksEnabled");
		setSettingsValueFromCSSProperty("editorShowMyUsername");
		setSettingsValueFromCSSProperty("editorShowMyUsernameOnSendButton");
		setSettingsValueFromCSSProperty("haveBanDisableTextarea");

		// ARCHIWUM X
		setSettingsValueFromCSSProperty("wxsArchiveXNewestEntry", false);
		if (settings.wxsArchiveXNewestEntry) settings.wxsArchiveXNewestEntryRefresh = wykopxSettings.getPropertyValue("--wxsArchiveXNewestEntryRefresh") ? parseInt(wykopxSettings.getPropertyValue("--wxsArchiveXNewestEntryRefresh")) : 15000;

		// PRZEŁĄCZNIKI
		setSettingsValueFromCSSProperty("wxsSwitchesEnable", false);
		if (settings.wxsSwitchesEnable) 
		{
			setSettingsValueFromCSSProperty("wxsSwitchPhotoViewer");
			setSettingsValueFromCSSProperty("wxsSwitchImages");
			setSettingsValueFromCSSProperty("wxsSwitchYouTube");
			setSettingsValueFromCSSProperty("wxsSwitchAdult");
			setSettingsValueFromCSSProperty("wxsSwitchNSFW");
			setSettingsValueFromCSSProperty("wxsSwitchTags");
			setSettingsValueFromCSSProperty("wxsSwitchByUserColor");
			setSettingsValueFromCSSProperty("wxsSwitchByUserGender");
		}


		setSettingsValueFromCSSProperty("removeAnnoyancesEnable");
		if (settings.removeAnnoyancesEnable) 
		{
			setSettingsValueFromCSSProperty("removeAnnoyancesIframes");
			setSettingsValueFromCSSProperty("removeAnnoyancesScripts");
			setSettingsValueFromCSSProperty("removeAnnoyancesAds");
			setSettingsValueFromCSSProperty("removeAnnoyancesGDPR");
		}






		// WYKOP OBJECTS INTERSECTION OBSERVER
		let IntersectionObserverEnabled = false;
		setSettingsValueFromCSSProperty("intersectionObserverRootMargin");
		setSettingsValueFromCSSProperty("linkToVideoDuration");
		setSettingsValueFromCSSProperty("entryWithVideoDuration");

		if (settings.linkToVideoDuration || settings.entryWithVideoDuration)
		{
			IntersectionObserverEnabled = true;
		}

		setSettingsValueFromCSSProperty("checkLinkVotesEnable");
		if (settings.checkLinkVotesEnable) 
		{
			IntersectionObserverEnabled = true;
			setSettingsValueFromCSSProperty("checkLinkVotesPerHour");
			setSettingsValueFromCSSProperty("checkLinkCommentsPerHour");
		}

		// voting explosion
		setSettingsValueFromCSSProperty("votingExplosionEnable", false);

		// checkPluses()
		let votesFetchingLimitMinimumVotes = 1;
		let votesFetchingLimitMaximumHoursOld = 48;
		let votesFetchingFirstDelayInSeconds = 1;		// seconds
		let votesFetchingOngoingDelayInSeconds = 990; 	// seconds

		let votesFetchingHigherFrequencyLimitMinimumVotes = 30;
		let votesFetchingHigherFrequencyLimitMaximumHoursOld = 24;
		let votesFetchingHigherFrequencyDelayInSeconds = 990; // seconds

		setSettingsValueFromCSSProperty("checkEntryPlusesWhenVoting");
		setSettingsValueFromCSSProperty("checkEntryPlusesEnable");
		setSettingsValueFromCSSProperty("prefixBeforePlusesCount", "brak", true); // domyslnie puste, dodajemy plus przed liczbą plusów


		const prefixBeforePlusesCountMap = new Map([
			['brak', ''],
			['plus', '+'],	// domyslnie 
			['emoji_serce', '💚'],
			['emoji_index_pointing_up', '☝'],
			['emoji_thumbs_up', '👍'],
			['emoji_backhand_index_pointing_up', '👆'],
			['emoji_upwards_button', '🔼'],
			['emoji_up_arrow', '⬆'],
			['emoji_up_right_arrow', '↗'],
			['emoji_up_left_arrow', '↖'],
			['emoji_right_arrow_curving_up', '⤴'],
			['emoji_heavy_tick', '✔'],
			['emoji_plus_sign', '➕'],
			['emoji_red_triangle_pointed_up', '🔺']
		]);
		settings.prefixBeforePlusesCount = prefixBeforePlusesCountMap.get(settings.prefixBeforePlusesCount);

		setSettingsValueFromCSSProperty("prefixBeforeMinusesCount", "minus", true); // domyślnie minus i tak zostawiamy
		const prefixBeforeMinusesCountMap = new Map([
			['brak', ''],
			['minus', '-'],	// domyslnie
			['emoji_cross_mark', '❌'],
			['emoji_backhand_index_pointing_down', '👇'],
			['emoji_thumbs_down', '👎'],
			['emoji_downwards_button', '🔽'],
			['emoji_down_arrow', '⬇'],
			['emoji_down_right_arrow', '↘'],
			['emoji_down_left_arrow', '↙'],
			['emoji_right_arrow_curving_down', '⤵'],
			['emoji_minus_sign', '➖'],
			['emoji_red_triangle_pointed_down', '🔻']
		]);
		settings.prefixBeforeMinusesCount = prefixBeforeMinusesCountMap.get(settings.prefixBeforeMinusesCount);

		if (settings.checkEntryPlusesEnable) 
		{
			IntersectionObserverEnabled = true;
			setSettingsValueFromCSSProperty("checkEntryPlusesPerHour");
			setSettingsValueFromCSSProperty("checkEntryCommentsPerHour");
			setSettingsValueFromCSSProperty("checkEntryPlusesForVotingGame");
		}


		// SPRAWDZANIE UZYTKOWNIKOW KTORZY CIE BLOKUJA
		settings.authorBlocksYouCheckingEnable = true;




		// LOCAL STORAGE
		let localStorageMirkoukrywacz = null;
		let localStorageNotatkowator = null;
		let localStorageUserLabels = null;


		// LOCALSTORAGE
		const localStorageFirstDailyIDs = localforage.createInstance({
			driver: localforage.LOCALSTORAGE,
			name: "wykopx",
			storeName: "firstDailyIDs",
		});




		setSettingsValueFromCSSProperty("linkThumbnail", "poprawej", true); // "poprawej", "polewej", "niepokazuj"

		setSettingsValueFromCSSProperty("actionBoxEnable");
		if (settings.actionBoxEnable)
		{
			IntersectionObserverEnabled = true;
			setSettingsValueFromCSSProperty("filterUserComments");
			setSettingsValueFromCSSProperty("filterUserReplies");
			setSettingsValueFromCSSProperty("mirkoukrywaczEnable");
			if (settings.mirkoukrywaczEnable)
			{
				setSettingsValueFromCSSProperty("mirkoukrywaczMinimizedGrayedOut");
				setSettingsValueFromCSSProperty("mirkoukrywaczMinimizeEntries");
				setSettingsValueFromCSSProperty("mirkoukrywaczMinimizeComments");
				setSettingsValueFromCSSProperty("mirkoukrywaczHideEntries");
				setSettingsValueFromCSSProperty("mirkoukrywaczHideComments");
				setSettingsValueFromCSSProperty("mirkoukrywaczHideLinks");
				setSettingsValueFromCSSProperty("mirkoukrywaczSaveEntries");
				setSettingsValueFromCSSProperty("mirkoukrywaczSaveComments");
			}

			CSS += `
	/* ACTION BOX */
    section .wxs_menu_action_box
    {
        --buttonsBorderRadius: 5px;
        width: fit-content;
        position: absolute;
        height: 30px;
        border-style: solid;
        border-color: var(--blackOpacity01, rgb(125 125 125 / 1));
        color: var(--blackOpacity02, rgb(125 125 125 / 1));
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        font-size: 11rem;
        z-index: 1;
        opacity: 1!important;
        transition: opacity 0.5s linear!important;
    }
    section .wxs_menu_action_box:hover
    {
        background-color: var(--contentBackgroundColor, rgb(0 0 0 / 0.2));
    }
    @starting-style
    {
        section .wxs_menu_action_box
        {
            opacity: 0!important;
        }
    }
    /* WE WPISACH I KOMENTARZACH */
    section.entry .wxs_menu_action_box
    {
        border-radius: 0px 0px var(--buttonsBorderRadius, 4px) var(--buttonsBorderRadius, 4px);
        border-width: 0px 1px 1px 1px;
        right: 140px;
    }

    section.entry:not(.reply) .wxs_menu_action_box
    {
        top: 0px;
    }

    /* w znaleziskach */
    section.link-block .wxs_menu_action_box
    {
        border-color: var(--blackOpacity005, rgb(125 125 125 / 1));
        border-radius: var(--buttonsBorderRadius, 4px) var(--buttonsBorderRadius, 4px) 0px 0px;
        border-width: 1px 1px 0px 1px;
        bottom: 0px;
        top: unset;

        /* zmienione gdy linkThumbnail == "polewej" */
        right: 18px;
        left: unset;
    }



    /* kolejność przycisków zmienione gdy linkThumbnail == "polewej" */
    section.link-block .wxs_menu_action_box .wxs_filter_off          { order: 1; }
    section.link-block .wxs_menu_action_box .wxs_filter_on_user      { order: 2; }
    section.link-block .wxs_menu_action_box .wxs_hide                { order: 3; }

    /* MOBILE */
    @media (max-width: 640px)
    {
        /* WXS ACTION MENU BUTTONS */
        section.link-block .wxs_menu_action_box
        {
            right: unset!important;
            left: 40%!important;
        }
	}
	`;

			if (settings.linkThumbnail == "polewej")
			{
				CSS += `@media (max-width: 640px)
			{
				section.link-block .wxs_menu_action_box .wxs_filter_on_user      { order: 2!important; }
				section.link-block .wxs_menu_action_box .wxs_filter_off          { order: 3!important; }
				section.link-block .wxs_menu_action_box .wxs_hide                { order: 1!important; }
			}
			/* WERSJA PC */
			@media (min-width: 641px)
			{
				/* WXS ACTION MENU BUTTONS */
				section.link-block .wxs_menu_action_box
				{
					right: unset!important;
					left: 122px!important;
				}
				section.link-block .wxs_menu_action_box .wxs_filter_on_user      { order: 2!important; }
				section.link-block .wxs_menu_action_box .wxs_filter_off          { order: 3!important; }
				section.link-block .wxs_menu_action_box .wxs_hide                { order: 1!important; }
			}
			`;
			};


			CSS += `


    section.link-page section.link-block .wxs_menu_action_box
    {
        left: unset!important;
        right: 155px!important;
    }
    section.link-page section.entry .wxs_menu_action_box
    {
        right: 190px;
    }

    /* wpisy w sidebarze */
    main.main > section > section.sidebar > section.custom-sidebar > div.content > section.entries > section.entry .wxs_menu_action_box
    {
        display: none!important;
    }

    section.entry .wxs_menu_action_box:hover
    {
        box-shadow: 3px 3px 2px 1px rgba(0, 0, 0, 0.1);
        border-color: var(--blackOpacity04, rgb(125 125 125 / 1));
    }
    section.link-block .wxs_menu_action_box:hover
    {
        box-shadow: 3px -3px 2px 1px rgba(0, 0, 0, 0.1);
        border-color: var(--blackOpacity04, rgb(125 125 125 / 1));
    }
    section .wxs_menu_action_box button
    {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: inherit;
        min-width: 20px;
        width: max-content;
        padding: 0px 10px;
        height: 100%;
        color: inherit;
    }
    section .wxs_menu_action_box button:first-child
    {
        border-radius: 0px 0px 0px var(--buttonsBorderRadius, 4px)!important;
    }
    section .wxs_menu_action_box button:last-child
    {
        border-radius: 0px 0px var(--buttonsBorderRadius, 4px) 0px!important;
    }
    section .wxs_menu_action_box button span
    {
        font-size: inherit;
        padding: 0px 3px;
    }
    @media (max-width: 1350px)
    {
        section.entry .wxs_menu_action_box button span
        {
            display: none;
        }
    }




    /* ukrycie niepotrzebnych przycisków */
    section.wxs_minimized > article > div.wxs_menu_action_box > button.wxs_minimize,
    section:not(.wxs_minimized) > article > div.wxs_menu_action_box > button.wxs_maximize,
    section.own > article > .wxs_menu_action_box > .wxs_hide
    {
        display: none;
    }

    /* ukrycie filtrowania pod wpisem bez komentarzy */
    section.entry-page > section.entry > section.stream > div.content > section.entry.detailed:not(:has(div.comments)) .wxs_menu_action_box > button:is(.wxs_filter_on_user, .wxs_filter_off, .wxs_filter_on_replies)
    section.entry-page > section.entry > section.stream > div.content > section.entry.detailed:not(:has(div.comments)) > article > div.edit-wrapper > div.content > section.entry-content > div.wrapper > button.wxs_filter_on_replies
    {
        display: none!important;
    }

    section.link-block .wxs_menu_action_box > button.wxs_minimize,
    section.link-block .wxs_menu_action_box > button.wxs_save,
    section.link-block .wxs_menu_action_box > button.wxs_filter_on_replies
    {
        display: none;
    }


    section.entry article > div.edit-wrapper > div.content > section.entry-content > div.wrapper > button.wxs_filter_on_replies
    {
        display: inline-block;
        margin: 1px 2px 1px 3px;
        padding: 2px 4px 2px 4px;
    }



    section.entry article > div.edit-wrapper > div.content > section.entry-content > div.wrapper > button.wxs_filter_on_replies > span
    {
        display: none;
        font-size: 11rem;
        margin: 0px 4px;
    }
    section.entry article > div.edit-wrapper > div.content > section.entry-content > div.wrapper > button.wxs_filter_on_replies:hover > span
    {
        display: inline;
    }

    section.entry article > div.edit-wrapper > div.content > section.entry-content > div.wrapper > button
    {
        border: 1px solid var(--athensGray);
    }
    section.entry article > div.edit-wrapper > div.content > section.entry-content > div.wrapper > button:hover
    {
        background-color: var(--whitish)
    }

    /*  --- filtrowanie komentarzy użytkownika --- */
    section .wxs_menu_action_box button:hover,
    body[data-wxs_filter="userComments"] .wxs_menu_action_box button.wxs_filter_on_user:hover
    body[data-wxs_filter="userReplies"] .wxs_menu_action_box button.wxs_filter_on_replies:hover
    {
        background-color: var(--blackOpacity005, rgb(0 0 0 / 0.05));
        color: var(--blackOpacity1, rgb(125 125 125 / 1));
    }
    body[data-wxs_filter="userComments"] .wxs_menu_action_box button.wxs_filter_on_user,
    body[data-wxs_filter="userReplies"] .wxs_menu_action_box button.wxs_filter_on_replies
    {
        color: var(--blackOpacity05, rgb(125 125 125 / 1));
        background-color: var(--blackOpacity002, rgb(0 0 0 / 0.02));
        border-bottom: 1px solid var(--blackOpacity05, rgb(125 125 125 / 1));
    }


    /* przyciski filtrowania komentarzy użytkownika */
    /* wpisy na stronie glownej */
    main.main > section > div.content > section.home-page       > section.home                      > section.stream > div.content > section.entry .wxs_menu_action_box > [class="wxs_filter_on_replies"],
    /* wpisy z 1 lub 2 komentarzami */
    section.entry[wxs_first_load_comments_count="1"] .wxs_menu_action_box > [class^="wxs_filter"],
    section.entry[wxs_first_load_comments_count="2"] .wxs_menu_action_box > [class^="wxs_filter"],
    /* wpisy bez komentarzy */
    /* main.main > section > div.content > section:not(.link-page) > section section.stream > div.content > section.entry:not(.reply):not(:has(div.comments)) .wxs_menu_action_box > .wxs_filter_on, */
    /* main.main > section > div.content > section:not(.link-page) > section section.stream > div.content >  section.entry:not(.reply):not(:has(div.comments)) .wxs_menu_action_box > .wxs_filter_off */
    {
        display: none;
    }

    .wxs_menu_action_box > .wxs_filter_off
    {
        display: none;
    }

    /* ----- ZMINIMALIZOWANE WPISY I KOMENTARZE */
    /* wpisy */
    section.entry.wxs_minimized > article
    {
        padding: 0rem var(--entryLeftPadding, 16px;) 0rem 0rem!important;
    }`;
			if (settings.mirkoukrywaczMinimizedGrayedOut)
			{
				CSS += `section.entry.wxs_minimized > article
				{
					filter: grayscale(100%);
				}`;
			}

			CSS += `
    /* STRONA ZNALEZISKA - ZWINIĘTE KOMENTARZE */
    section.link-page section.entry.wxs_minimized
    {
        height: 35px;
        padding: 0px!important;
    }
    section.link-page section.entry.wxs_minimized > article
    {
        padding: 0px!important;
        height: 35px;
        padding-right: var(--entriesAndCommentsHorizontalPadding, 16px)!important;
        margin: 0px!important;
    }
    section.link-page section.entry.wxs_minimized > div.comments
    {
        display: none!important;
    }
    section.link-page section.entry.wxs_minimized > article > header,
    section.link-page section.entry.wxs_minimized > article > header > div
    {
        height: 100%!important;
    }



    /* czas dodania */
    section.entry.wxs_minimized > article > header > div.right > div > span
    {
        display: none!important;
    }


    /* avatar */
    section.entry.wxs_minimized > article > header > div.left
    {
        transform: translate(0px, 0px);
        --avatarSize: 17px;
    }


    /* div.right */
    section.entry.wxs_minimized > article > header
    {
        min-height: unset!important;
    }

    section.entry.wxs_minimized > article > header > div.right
    {
        height: 35px!important;
        align-items: center!important;
    }

    section.entry.wxs_minimized > article > header > div.right > div
    {
        display: flex!important;
        align-items: center!important;
    }

    /* treść */
    section.entry.wxs_minimized > article > div.edit-wrapper
    {
        display: none!important;
    }


    /* ukrycie 2 najlepszych komentarzy pod wpisem w streamie */
    main.main > section > div.content > section:is(.bucket-page, .category-page, .favourites-page, .home-page, .observed-page, .profile-page, .tag-page, .microblog-page) > section section.stream > div.content > section.entry.wxs_minimized > div.comments
    {
        display: none!important;
    }`;

			if (settings.mirkoukrywaczEnable)
			{
				/*  WPISY UKRYWANE PRZEZ MIRKOUKRYWACZ    .wxs_hidden should be removed most of the times, but still... */
				CSS += ` /* TODO LINK */
					main.main > section > div.content > section:is(.category-page, .favourites-page, .home-page, .observed-page, .profile-page, .tag-page, .microblog-page) > section section.stream > div.content > section.entry.wxs_hidden
					main.main > section > div.content > section.search-page > section section.stream > div.content section.entry.wxs_hidden
					{
						display: none!important;
					}`
			}
		}
		else
		{
			settings.mirkoukrywaczEnable = false;
		}

		if (settings.mirkoukrywaczEnable)
		{
			// LOCALSTORAGE
			localStorageMirkoukrywacz = localforage.createInstance({
				driver: localforage.LOCALSTORAGE,
				name: "wykopx",
				storeName: "mirkoukrywacz",
			});


		}

		setSettingsValueFromCSSProperty("notatkowatorEnable", false);


		if (settings.notatkowatorEnable)
		{
			IntersectionObserverEnabled = true;
			localStorageNotatkowator = localforage.createInstance({
				driver: localforage.LOCALSTORAGE,
				name: "wykopx",
				storeName: "notatkowator",
			});

			//settings.notatkowatorUpdateInterval = parseFloat(wykopxSettings.getPropertyValue("--notatkowatorUpdateInterval")); // number 0 ... 120
			setSettingsValueFromCSSProperty("notatkowatorVerticalBar");
			setSettingsValueFromCSSProperty("notatkowatorWebsiteURL");
			setSettingsValueFromCSSProperty("notatkowatorStyle", "obok_nicka", true); // obok_nicka, obok_nicka_druga_linia, pod_avatarem
		}


		let falszyweRozoweArray = null;
		let falszyweNiebieskieArray = null;
		let mapaTrolli = null;

		setSettingsValueFromCSSProperty("wxsUserLabelsEnable", false);

		if (settings.wxsUserLabelsEnable)
		{
			IntersectionObserverEnabled = true;
			localStorageUserLabels = localforage.createInstance({
				driver: localforage.LOCALSTORAGE,
				name: "wykopx",
				storeName: "userlabels",
			});
			setSettingsValueFromCSSProperty("wxsUserLabelsFakeFemales");
			setSettingsValueFromCSSProperty("wxsUserLabelsTrolls");

			if (settings.wxsUserLabelsFakeFemales)
			{
				// LISTA FAŁSZYWYCH RÓŻOWYCH PASKÓW fałszywe różowe
				const listafalszywychrozowych = [];

				listafalszywychrozowych.push('washington');
				listafalszywychrozowych.push('Obrzydzenie');
				listafalszywychrozowych.push('conamirko');
				listafalszywychrozowych.push('i_took_a_pill_in_remiza');
				listafalszywychrozowych.push('Riolet');
				listafalszywychrozowych.push('ChwilowaPomaranczka');
				listafalszywychrozowych.push('RobieZdrowaZupke');
				listafalszywychrozowych.push('IlllIlIIIIIIIIIlllllIlIlIlIlIlIlIII');
				listafalszywychrozowych.push('Banderoza');
				listafalszywychrozowych.push('deiceberg');
				listafalszywychrozowych.push('Chodtok');
				listafalszywychrozowych.push('kierowcaautobusuofficial');
				listafalszywychrozowych.push('ToJestNiepojete');
				listafalszywychrozowych.push('model_wygenerowany_na_wykoppl');
				listafalszywychrozowych.push('chwilowypaczelok');
				listafalszywychrozowych.push('sinls');
				listafalszywychrozowych.push('KRZYSZTOF_DZONG_UN');
				listafalszywychrozowych.push('miszczu90');
				listafalszywychrozowych.push('nenq123');
				listafalszywychrozowych.push('domek_drewniany');
				listafalszywychrozowych.push('konserwix');
				listafalszywychrozowych.push('Diamond');
				listafalszywychrozowych.push('BlackBl-kunack');
				listafalszywychrozowych.push('Mantusabra');
				listafalszywychrozowych.push('ElCidX');
				listafalszywychrozowych.push('cword');
				listafalszywychrozowych.push('ToJestNiepojete');
				listafalszywychrozowych.push('powodzenia');
				listafalszywychrozowych.push('washington');
				listafalszywychrozowych.push('sipson204');
				listafalszywychrozowych.push('36873');
				listafalszywychrozowych.push('Defined');
				listafalszywychrozowych.push('toniemojebuty');
				listafalszywychrozowych.push('DigitalPasztet');
				listafalszywychrozowych.push('wcaleniepchamsiewmultikonto');
				listafalszywychrozowych.push('Wieczny_Prawiczek');
				listafalszywychrozowych.push('Bpnn');
				listafalszywychrozowych.push('AndrzejBabinicz');
				listafalszywychrozowych.push('bruhmomentow');


				// LISTA FAŁSZYWYCH NIEBIESKICH PASKÓW fałszywe niebieskie
				const listafalszywychniebieskich = [];
				listafalszywychniebieskich.push("Kantor_wymiany_mysli_i_wrazen");
				listafalszywychniebieskich.push("DragonTattoo2404");
				listafalszywychniebieskich.push("qksgh");
				listafalszywychniebieskich.push("mariusz9922");
				listafalszywychniebieskich.push("xoxo900");
				listafalszywychniebieskich.push("jutronaobiadznowuryz");



				localStorageUserLabels.setItem('falszyweRozowe', listafalszywychrozowych).then(() => { });
				localStorageUserLabels.setItem('falszyweNiebieskie', listafalszywychniebieskich).then(() => { });


				// get from localstorage
				falszyweRozoweArray = await localStorageUserLabels.getItem("falszyweRozowe");
				falszyweNiebieskieArray = await localStorageUserLabels.getItem("falszyweNiebieskie");
			}


			if (settings.wxsUserLabelsTrolls)
			{
				const trollsMap = new Map();
				trollsMap.set("WykopX", { "url": "https://github.com/wykopx/WykopX/wiki/X-Notatkowator" });
				trollsMap.set("wykop", { "label": "Oficjalne konto", });
				trollsMap.set("bakehaus", { "label": "Wypiek", "url": "https://nimble.li/vdr4ajlm" });
				trollsMap.set("m__b", { "label": "Michał B.", "url": "https://pl.linkedin.com/in/michalbialek" });
				trollsMap.set("paliwoda", { "url": "https://sjp.pwn.pl/sjp/chomato;2448428.html" });
				trollsMap.set("autotldr", { "label": "Bot AI", "url": "https://github.com/wykopx/Aplikacje-wykopowe/wiki/Boty-na-Wykopie#auto-tldr" });
				trollsMap.set("wykop-gpt", { "label": "Bot AI", "url": "https://github.com/wykopx/Aplikacje-wykopowe/wiki/Boty-na-Wykopie#wykop-gpt" });
				trollsMap.set("Przypomnienie", { "label": "Bot AI", "url": "https://github.com/wykopx/Aplikacje-wykopowe/wiki/Boty-na-Wykopie#przypomnienie" });
				trollsMap.set("DwieLinieBOTv3", { "label": "Bot AI", "url": "https://github.com/wykopx/Aplikacje-wykopowe/wiki/Boty-na-Wykopie#dwie-linie-bot" });
				trollsMap.set("ISSTrackerPL", { "label": "Bot", "url": "https://github.com/wykopx/Aplikacje-wykopowe/wiki/Boty-na-Wykopie#iss-tracker" });
				trollsMap.set("januszowybot", { "label": "Bot", "url": "https://github.com/wykopx/Aplikacje-wykopowe/wiki/Boty-na-Wykopie#januszowy-bot" });
				trollsMap.set("mirko_anonim", { "label": "Anonim", "url": "https://github.com/wykopx/Aplikacje-wykopowe/wiki/Aplikacje#mirkoanonim" });

				trollsMap.set("ChwilowaPomaranczka", { "label": "Wykopowy Troll" });
				localStorageUserLabels.setItem('mapaTrolli', Object.fromEntries(trollsMap)).then(() => { });

				// get from localstorage
				localStorageUserLabels.getItem('mapaTrolli').then(val => { mapaTrolli = new Map(Object.entries(val)); })
			}
		}

		// wykop_xs_banned.user.js - START - 1
		setSettingsValueFromCSSProperty("infoboxUserBannedInfoOnProfilePage");
		// wykop_xs_banned.user.js - END - 1




		setSettingsValueFromCSSProperty("infoboxEnable", false);

		if (settings.infoboxEnable)
		{
			IntersectionObserverEnabled = true;
			setSettingsValueFromCSSProperty("infoboxUserBannedEmoji");
			setSettingsValueFromCSSProperty("infoboxUserBannedInfo");
			setSettingsValueFromCSSProperty("infoboxUserMemberSince");
			setSettingsValueFromCSSProperty("infoboxUserMemberSinceYear");
			setSettingsValueFromCSSProperty("infoboxUserSummaryFollowers");
			setSettingsValueFromCSSProperty("infoboxUserSummaryActivity");
		}


		setSettingsValueFromCSSProperty("tabChangeEnabled", false);
		if (settings.tabChangeEnabled)
		{
			setSettingsValueFromCSSProperty("tabChangeOnlyOnHiddenState", false);
			setSettingsValueFromCSSProperty("tabChangeFaviconEnabled", false);

			if (settings.tabChangeFaviconEnabled)
			{
				setSettingsValueFromCSSProperty("tabChangeFaviconSelect", "wykop", true);
			}

			setSettingsValueFromCSSProperty("tabChangeTitleEnabled", false);
			if (settings.tabChangeTitleEnabled)
			{
				setSettingsValueFromCSSProperty("tabChangeTitleShowNotificationsEnabled", false);
				setSettingsValueFromCSSProperty("tabChangeTitleShowNotificationsCountPM", false);
				setSettingsValueFromCSSProperty("tabChangeTitleShowNotificationsCountEntries", false);
				setSettingsValueFromCSSProperty("tabChangeTitleShowNotificationsCountSeparated", false);
				setSettingsValueFromCSSProperty("tabChangeTitleShowNotificationsCountTagsNewLink", false);
				setSettingsValueFromCSSProperty("tabChangeTitleShowNotificationsCountTagsNewEntry", false);
				setSettingsValueFromCSSProperty("tabChangeTitlePrefix", false);
				setSettingsValueFromCSSProperty("tabChangeTitleSelect", "domyslny", true);
				setSettingsValueFromCSSProperty("tabChangeTitleCustom", "Wykop X", true);
				setSettingsValueFromCSSProperty("tabChangeTitleSuffix", "domyslny", true);
			}
		}



		// DOMYŚLNIE WYŁĄCZONE BEZ WYKOP X STYLE
		setSettingsValueFromCSSProperty("votePlusMinusOnHover", false);
		setSettingsValueFromCSSProperty("observedTagsInRightSidebarSortAlphabetically", false);
		setSettingsValueFromCSSProperty("topNavHomeButtonClickRefreshOrRedirect", false);
		setSettingsValueFromCSSProperty("topNavMicroblogButtonClickRefreshOrRedirect", false);
		setSettingsValueFromCSSProperty("quickLinksEnable", false);

		// DODATKOWE PRZYCISKI NA GORNEJ BELCE
		setSettingsValueFromCSSProperty("topNavNightSwitchButton", true);

		setSettingsValueFromCSSProperty("topNavMyWykopButton", false);
		setSettingsValueFromCSSProperty("topNavMicroblogButton", false);
		setSettingsValueFromCSSProperty("topNavMessagesButton", false);
		setSettingsValueFromCSSProperty("topNavProfileButton", false);
		setSettingsValueFromCSSProperty("topNavNotificationsButton", false);

		// DODATKOWE PRZYCISKI NA BELCE MOBILNEJ
		setSettingsValueFromCSSProperty("mobileNavBarHide", false);
		if (settings.mobileNavBarHide == false)
		{
			setSettingsValueFromCSSProperty("mobileNavBarMyWykopButton", false);
			setSettingsValueFromCSSProperty("mobileNavBarMessagesButton", false);
			setSettingsValueFromCSSProperty("mobileNavBarProfileButton", false);
			setSettingsValueFromCSSProperty("mobileNavBarNotificationsButton", false);
		}


		// default numbers
		settings.observedTagsInRightSidebarUpdateInterval = 12;
		if (wykopxSettings.getPropertyValue("--observedTagsInRightSidebarUpdateInterval")) settings.observedTagsInRightSidebarUpdateInterval = parseFloat(wykopxSettings.getPropertyValue("--observedTagsInRightSidebarUpdateInterval")); // number





		// variables from Wykop X Style
		// TODO stare Wykop X Style "true"
		settings.wxsDownloadImageButton = (wykopxSettings.getPropertyValue("--wxsDownloadImageButton").trim() == `"true"`); // boolean, default off
		settings.topNavHamburgerHoverMinimize = (wykopxSettings.getPropertyValue("--topNavHamburgerHoverMinimize").trim() == `"true"`); // boolean
		settings.tagHeaderEditable = (wykopxSettings.getPropertyValue("--tagHeaderEditable").trim() == `"true"`); // boolean
		settings.linksAnalyzerEnable = (wykopxSettings.getPropertyValue("--linksAnalyzerEnable").trim() == `"true"`); // boolean
		settings.fixCaseSensitiveTagsRedirection = (wykopxSettings.getPropertyValue("--fixCaseSensitiveTagsRedirection").trim() == `"true"`); // boolean
		settings.categoryRedirectToMicroblogButtonEnable = (wykopxSettings.getPropertyValue("--categoryRedirectToMicroblogButtonEnable").trim() == `"true"`); // boolean



		settings.homepagePinnedEntriesHideBelowLimit = parseFloat(wykopxSettings.getPropertyValue("--homepagePinnedEntriesHideBelowLimit")); // number


		// boolean — domyslnie WŁĄCZONE bez Wykop X Style
		setSettingsValueFromCSSProperty("hitsInTopNavJS");
		setSettingsValueFromCSSProperty("myWykopInTopNavJS");
		setSettingsValueFromCSSProperty("favoritesInTopNavJS");
		setSettingsValueFromCSSProperty("addNewLinkInTopNavJS");
		setSettingsValueFromCSSProperty("addNewEntryInTopNavJS");
		setSettingsValueFromCSSProperty("disableNewLinkEditorPastedTextLimit");


		// strings
		setSettingsValueFromCSSProperty("linksAnalyzerSortBy", "domyslnie", true);
		setSettingsValueFromCSSProperty("topNavLogoClick", "glowna", true);
		setSettingsValueFromCSSProperty("editorSendHotkey", "ctrl_enter", true);   // "domyslnie", "enter", "ctrl_enter", "ctrl_s"

		if (settings.editorSendHotkey != "domyslnie") setSettingsValueFromCSSProperty("editorSendHotkeyShowOnSendButton");

		settings.categoryRedirectToMicroblogButtonFilter = wykopxSettings.getPropertyValue("--categoryRedirectToMicroblogButtonFilter").replaceAll("_", "/").replaceAll(" ", "");



		/* mouseClickOpensImageInNewTab 💻❎🐁 Otwórz obrazek w nowej karcie kliknięciem  "nie_otwieraj"-domyslnie "lewy_przycisk_myszy""srodkowy_przycisk_myszy" "prawy_przycisk_myszy" */
		settings.mouseClickOpensImageInNewTab = wykopxSettings.getPropertyValue("--mouseClickOpensImageInNewTab") ? wykopxSettings.getPropertyValue("--mouseClickOpensImageInNewTab").replaceAll(" ", "") : "srodkowy_przycisk_myszy";



		let localStorageObserved = localforage.createInstance({
			driver: localforage.LOCALSTORAGE,
			name: "wykopx",
			storeName: "observed",
		});

		const topNavHeaderRightElement = document.querySelector('header.header > .right > nav > ul');

		if (dev) consoleX("Settings: ", 1);
		if (dev) console.log(settings);

		// przenoszenie na tagi:                              wykop.pl/#heheszki
		// i na profile użytkownikow:                         wykop.pl/@m__b
		// wyszukiwanie wpisów danej osoby w konkretnym tagu  wykop.pl/@m__b/#internet   albo  wykop.pl/#internet/@m__b/


		let currentPageURL = undefined;

		let pageType = "";
		let pageSubtype = "";
		let pageObjects = []; // ["znaleziska", "wpisy", "komentarze"]

		let currentPageTotalVotesUpCount = 0;

		let hash = new URL(document.URL).hash;
		let pathname = new URL(document.URL).pathname;
		let pathnameArray = pathname.split("/"); // ['', 'wpis', '74111643', 'dobranoc-panstwu'] ['', 'wykopalisko'] ['', 'link', '7303053', 'braun-gasi-chanuke-gasnica-mem']


		isURLChanged();
		newPageURL();

		// setInterval(() =>
		// {
		// 	if (isURLChanged()) newPageURL()
		// }, 5000);

		function isURLChanged()
		{
			const newURL = window.location.href;
			consoleX(`isURLChanged() -> ${newURL}`, 1);
			//const newURL2 = document.URL;

			if (newURL != currentPageURL)
			{
				consoleX(`isURLChanged() -> URL Changed from ${currentPageURL} to ${newURL}`)
				currentPageURL = newURL;
				return true;
			}
			else return false;
		}


		function newPageURL()
		{
			consoleX("newPageURL()", 1);

			hash = new URL(document.URL).hash;
			pathname = new URL(document.URL).pathname;
			pathnameArray = pathname.split("/");
			consoleX(`newPageURL() -> document.URL: ${document.URL} hash: ${hash}, pathname: ${pathname}, pathnameArray: `, 1)
			if (dev) console.log(pathnameArray)

			currentPageTotalVotesUpCount = 0;

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
				pageSubtype = pathnameArray[2]; // nazwatagu
				pageObjects = ["znaleziska", "wpisy", "komentarze"];
			}
			consoleX(`Typ strony: ${pageType} ${pageType != pageSubtype ? pageSubtype : ""}`, 1)
			// if(dev) console.log(`pageObjects:`, pageObjects)
		}




		function removeAllDataWXSAttributes()
		{
			consoleX(`removeAllDataWXSAttributes()`, 1);

			document.querySelectorAll(`section[data-wxs_username]`).forEach((el) =>
			{
				removeWXSAttributes(el)
			});
		}

		function removeWXSAttributes(sectionObjectElement)
		{
			if (dev) console.log(`removeWXSAttributes() from id: ${sectionObjectElement.__vue__.item.id}`, + sectionObjectElement);

			sectionObjectElement.removeAttribute('style'); // custom css properties removed 

			Object.keys(sectionObjectElement.dataset).forEach(dataKey =>
			{
				if (dataKey.startsWith('wxs_'))
				{
					delete sectionObjectElement.dataset[dataKey];
				}
			});
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

			let excludedPaths = ["szukaj", "wpis", "link", "artykul", "k", "wykopalisko", "mikroblog", "osberwowane", "hity", "powiadomienia", "ustawienia"];

			// # przekierowanie URL http://wykop.pl/#heheszki albo http://wykop.pl/#wykop/@m__b ale nie https://wykop.pl/wpis/213123/tresc#123456
			if (!excludedPaths.includes(pathnameArray[1]) && hash.length > 0)
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
			if (!excludedPaths.includes(pathnameArray[1]) && pathname.length > 2)
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
			consoleX(`smartRedirectBasedOnUserAndTag(user @${user},  tag #${tag})`, 1);

			if (tag && user) redirectToSearchUserEntriesInTag(user, tag)
			else if (tag) redirectToTag(tag)
			else if (user) redirectToUser(user)
		}
		// returns 'tag' from /#tag in string
		function getTagFromUrl(url, splitSeparator = "/", tagSymbol = "#")
		{
			consoleX(`getTagFromUrl(url: ${url},  splitSeparator: #${splitSeparator}), tagSymbol: ${tagSymbol}`, 1);

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
			consoleX(`getUserFromUrl(url: ${url},  splitSeparator: #${splitSeparator}), userSymbol: ${userSymbol}`, 1);

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







		let consoleData =
		{
			mirkoukrywacz_hidden:
			{
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

			if (!dev) return;

			consoleX("buildConsole()", 1)

			let headerStreamTopElement;

			if (!jNodeHeaderStreamTop)
			{
				headerStreamTopElement = document.getElementById("main.main > section > div.content section.stream > header.stream-top");
			}
			else
			{
				headerStreamTopElement = jNodeHeaderStreamTop;
			}

			if (headerStreamTopElement)
			{
				//return;
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
			consoleX("refresh console()", 1)

			return;  // temp

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
				let lennyArray = 
				[
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
			}
		*/










		// <body data-wxs_category_menu_minimized="false">
		if (settings.topNavHamburgerHoverMinimize)
		{
			waitForKeyElements("body > section > header.header > div.left > button", topNavHamburgerHoverMinimize, true);
		}
		function topNavHamburgerHoverMinimize(hamburgerButton)
		{
			consoleX(`topNavHamburgerHoverMinimize()`, 1);
			body.dataset.wxs_category_menu_minimized = 'true';
			hamburgerButton.addEventListener("mouseover", () => 
			{
				if (body.dataset.wxs_category_menu_minimized === 'true')
				{
					//delete body.dataset.wxs_category_menu_minimized;
					body.dataset.wxs_category_menu_minimized = 'false';
				}
				else
				{
					body.dataset.wxs_category_menu_minimized = 'true';
				}
			});
		}



		/* QUICK SEARCH */

		/* Edytuj nagłówek tagu, aby przejść na inny tag */

		function tagHeaderEditableWatcher()
		{
			consoleX(`tagHeaderEditableWatcher()`, 1);

			if (settings.tagHeaderEditable)
			{
				waitForKeyElements(".main-content .main aside.tag-top .content header h1", tagHeaderEditable, false);
			}
		}

		function tagHeaderEditable(tagHeaderEditable)
		{
			consoleX(`tagHeaderEditable()`, 1);
			let originalValue = tagHeaderEditable.textContent.toLowerCase();
			tagHeaderEditable.className = "wykopx_quick_search";
			tagHeaderEditable.setAttribute("data-wykopx-original-value", originalValue); //todo dataset
			tagHeaderEditable.setAttribute("tabindex", 1);
			tagHeaderEditable.setAttribute("spellcheck", false);
			tagHeaderEditable.contentEditable = "true";
			tagHeaderEditable.role = "textbox";


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

		function wykopx_quick_search(wykopxQuickSearch)
		{
			consoleX(`wykopx_quick_search()`, 1);
			wykopxQuickSearch.addEventListener("blur", eventInsertedTagOrUser);
			wykopxQuickSearch.addEventListener("keydown", eventInsertedTagOrUser);
		}

		function eventInsertedTagOrUser(e)
		{
			consoleX("eventInsertedTagOrUser(e)", 1);

			if (e.type === "blur" || (e.type === "keydown" && e.keyCode == 13)) // out of focus or enter
			{
				consoleX("eventInsertedTagOrUser() -- event blur || eydown .wykopx_quick_search", 1);
				e.preventDefault();

				if (dev) console.log("Type of the element: " + e.target.tagName);
				let editedValue;
				if (e.target.tagName == "INPUT") editedValue = e.target.value.toLowerCase();
				else if (e.target.tagName == "H1") editedValue = e.target.textContent.toLowerCase();

				if (editedValue != e.target.getAttribute("data-wykopx-original-value"))
				{
					smartRedirectBasedOnUserAndTag(getUserFromUrl(editedValue, " "), getTagFromUrl(editedValue, " ", ""));
				}
			}
		}





		/* RIGHT SIDEBAR — DODAJ LISTE OBSERWOWANYCH TAGÓW */
		function addObservedTagsToRightSidebar()
		{
			consoleX("addObservedTagsToRightSidebar()", 1)

			let fetchedValuesArray = [];

			if (settings.observedTagsInRightSidebarEnable)
			{
				// consoleX("addObservedTagsToRightSidebar()", 1)

				checkLocalForageupdatedDate(localStorageObserved, getObservedTags, settings.observedTagsInRightSidebarUpdateInterval * 3600);

				// VUE SENSITIVE
				/*
					data-v-d5500d78
					data-v-38d5cf90
					data-v-7befdafc
				*/
				let section_html = `
			<section class="wykopx_your_observed_tags custom-sidebar tags-sidebar" data-v-d5500d78 data-v-38d5cf90 data-v-0a0cb29b>
				<header class="" data-v-d5500d78>
					<h4 data-v-d5500d78>Przejdź na #tag lub @profil</h4>
				</header>
				<div class="content wykopx_quick_search_container" data-v-d5500d78>
					<input type="text" class="wykopx_quick_search" placeholder="#wykopwnowymstylu" title="${promoString}" />
				</div>
				<header data-v-d5500d78>
					<h4 data-v-d5500d78>Twoje obserwowane tagi</h4>
				</header>
				<div class="content" data-v-d5500d78>
					<section class="tags" data-v-7befdafc data-v-d5500d78>
						<ul data-v-7befdafc data-v-d5500d78>
				`;

				localStorageObserved.getItem('observedTags').then(function (tagsArray)
				{
					fetchedValuesArray = tagsArray;
					if (settings.observedTagsInRightSidebarSortAlphabetically)
					{
						fetchedValuesArray.sort(); // sortowanie alfabetyczne tagów
					}
					fetchedValuesArray.forEach(function (tag)
					{
						section_html += `
						<li data-v-7befdafc data-v-d5500d78 title="Przejdź na tag #${tag}  ${promoString}">
							<span data-v-7befdafc data-v-d5500d78>#</span><a data-v-7befdafc href="https://go.wykopx.pl/#${tag}" class="hybrid" data-v-d5500d78>${tag}</a>
						</li>`;
					});
					section_html += `</ul></section></div></section>`;
					document.querySelector(`section.sidebar`).insertAdjacentHTML('beforeend', section_html);
				}).catch(function (err) { });

			}
		}


		async function checkLocalForageupdatedDate(wykopxStorageName, updateStorageFunction, updateIntervalSeconds)
		{
			consoleX("checkLocalForageupdatedDate()", 1)

			try
			{
				let storageUpdatedDate = await wykopxStorageName.getItem("storageUpdatedDate");
				if (storageUpdatedDate == null)
				{
					consoleX("Selected info wasn't downloaded. Updating now...", 1)
					updateStorageFunction();
				} else
				{
					const date2 = dayjs(storageUpdatedDate)
					if (loadTime.diff(date2, "second") > parseFloat(updateIntervalSeconds))
					{
						consoleX(`Update interval: ${loadTime.diff(date2, "second")}s > ${updateIntervalSeconds}s`, 1)
						updateStorageFunction();
					}
				}
			} catch (err)
			{
				if (dev) console.log(err);
			}
		}


		async function getObservedTags()
		{
			consoleX(`getObservedTags()`, 1);

			const apiGetObservedTags = `https://wykop.pl/api/v3/profile/users/${loggedUser.username}/observed/tags`;
			consoleX(`async function getObservedTags(${loggedUser.username}`, 1);

			await fetch(apiGetObservedTags, {
				method: "GET", // or 'PUT'
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer " + window.localStorage.token,
				},
			})
				.then((response) => response.json())
				.then((responseJSON) =>
				{
					if (dev) console.log("🟢🟢🟢responseJSON")
					if (dev) console.log(responseJSON)
					const responseJSONData = responseJSON.data; // data = [{name: 'wykopwnowymstylu'}, {name: 'wykop'}, {name: 'wykopx'}]
					const fetchedValuesArray = responseJSONData.map(function (item)
					{ return item.name; });

					localStorageObserved.setItem("storageUpdatedDate", loadTime)
					localStorageObserved.setItem("observedTags", fetchedValuesArray)

					return true;
				});
		}








		async function POSTDATATOWYKOPX()
		{
			if (dev) console.log(" 🍌🍌🍌🍌 POSTDATATOWYKOPX() ")


			await getSettingsList("blacklists", "tags");
			await getSettingsList("blacklists", "domains");
			await getSettingsList("blacklists", "users");
			await getSettingsList("observed", "tags");

			let settings_list_observed_tags = await localStorageObserved.getItem("settings_list_observed_tags");
			let settings_list_blacklists_domains = await localStorageObserved.getItem("settings_list_blacklists_domains");
			let settings_list_blacklists_users = await localStorageObserved.getItem("settings_list_blacklists_users");
			let settings_list_blacklists_tags = await localStorageObserved.getItem("settings_list_blacklists_tags");


			// await getSettingsList("observed", "users", "following");
			// await getSettingsList("observed", "users", "followers");
			// let settings_list_observed_users_followers = await localStorageObserved.getItem("settings_list_observed_users_followers");
			// let settings_list_observed_users_following = await localStorageObserved.getItem("settings_list_observed_users_following");

			let dataPOST = {};

			// let settings_list_SHA256 = await localStorageObserved.getItem("settings_list_SHA256");
			let settings_list_SHA256 = null;

			if (settings_list_blacklists_tags?.length > 0)
			{
				dataPOST.settings_list_blacklists_tags = settings_list_blacklists_tags;
				dataPOST.sha256 = await SHA256(loggedUser.username + settings_list_blacklists_tags[settings_list_blacklists_tags.length - 1].created_at + settings_list_blacklists_tags[settings_list_blacklists_tags.length - 1].name); // WykopX2023-01-01 23:59:59famemma
			}
			if (settings_list_observed_tags?.length > 0)
			{
				dataPOST.settings_list_observed_tags = settings_list_observed_tags;
				if (settings_list_SHA256 == null) dataPOST.sha256 = await SHA256(loggedUser.username + settings_list_observed_tags[settings_list_observed_tags.length - 1].created_at + settings_list_observed_tags[settings_list_observed_tags.length - 1].name);
			}
			if (settings_list_blacklists_domains?.length > 0)
			{
				dataPOST.settings_list_blacklists_domains = settings_list_blacklists_domains;
				if (settings_list_SHA256 == null) dataPOST.sha256 = await SHA256(loggedUser.username + settings_list_blacklists_domains[settings_list_blacklists_domains.length - 1].created_at + settings_list_blacklists_domains[settings_list_blacklists_domains.length - 1].domain);
			}
			if (settings_list_blacklists_users?.length > 0)
			{
				dataPOST.settings_list_blacklists_users = settings_list_blacklists_users;
				if (settings_list_SHA256 == null) dataPOST.sha256 = await SHA256(loggedUser.username + settings_list_blacklists_users[settings_list_blacklists_users.length - 1].created_at + settings_list_blacklists_users[settings_list_blacklists_users.length - 1].username);
			}




			if (Object.keys(dataPOST).length >= 2)
			{
				if (dev) console.log(" 🍌🍌🍌🍌 Sending this data to api.wykopx.pl: ", dataPOST)

				// TODO
				// fetch('https://api.wykopx.pl/api/v3/', { 
				// 	method: 'POST',
				// 	headers: {
				// 		'Content-Type': 'application/json'
				// 	},
				// 	body: JSON.stringify(dataPOST)
				// })
				// 	.then(response => response.text())
				// 	.then(data =>
				// 	{
				// 		localStorageObserved.setItem(`settings_list_update`, loadTime);

				// 		if(dev) console.log(" 🍌🍌🍌🍌 response from api.wykopx.pl: ")
				// 		if(dev) console.log(data)
				// 	})
				// 	.catch(error => console.error('Error:', error));
			}
		}

		/*
			getSettingsList("blacklists", "tags");
			getSettingsList("blacklists", "domains");
			getSettingsList("blacklists", "users");
			getSettingsList("observed", "tags");
			getSettingsList("observed", "users", "following");
			getSettingsList("observed", "users", "followers");
		*/

		let lastBlacklistTagCreatedAt = null;
		let lastBlacklistTagCreatedAtSHA256 = null;


		async function getSettingsList(blacklistsOrObserved, type, subtype)
		{
			consoleX(`getSettingsList(blacklistsOrObserved: ${blacklistsOrObserved}, type: ${type}, subtype: ${subtype})`, 1);

			let page = 1;
			let totalFetched = 0;
			let totalRecords = null;
			let fetchedValuesArray = [];


			while (totalRecords === null || totalFetched < totalRecords)
			{
				let apiGetPaginatedURL = null;
				if (blacklistsOrObserved == "blacklists") apiGetPaginatedURL = `https://wykop.pl/api/v3/settings/blacklists/${type}?page=${page}`;
				else if (blacklistsOrObserved == "observed")
				{
					if (type == "tags") apiGetPaginatedURL = `https://wykop.pl/api/v3/profile/users/${loggedUser.username}/observed/${type}?page=${page}`;
					else if (type == "users" && subtype) apiGetPaginatedURL = `https://wykop.pl/api/v3/profile/users/${loggedUser.username}/observed/${type}/${subtype}?page=${page}`
				}
				const response = await fetch(apiGetPaginatedURL, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: "Bearer " + window.localStorage.token,
					},
				});

				const responseJSON = await response.json();
				const responseJSONData = responseJSON.data;

				// if (blacklistsOrObserved == "blacklists" && type == "tags")
				// {
				// 	lastBlacklistTagCreatedAt = loggedUser.username + responseJSONData[responseJSONData.length - 1].created_at + responseJSONData[responseJSONData.length - 1].name; // WykopX2023-01-01 23:59:59famemma
				// 	lastBlacklistTagCreatedAtSHA256 = await SHA256(lastBlacklistTagCreatedAt);
				// 	localStorageObserved.setItem(`settings_list_SHA256`, lastBlacklistTagCreatedAtSHA256);
				// }

				let valueName = "name";
				if (type == "users") valueName = "username"
				if (type == "domains") valueName = "domain"
				fetchedValuesArray = fetchedValuesArray.concat(responseJSONData.map(item => item[valueName])); // data = [{ name: 'wykopwnowymstylu' }, { name: 'wykop' }, { name: 'wykopx' }]
				totalFetched += responseJSONData.length;
				totalRecords = responseJSON.pagination.total;
				page++;
			}

			if (dev) console.log(`🔻fetchedValuesArray ${blacklistsOrObserved}/${type} FINISHED`)
			if (dev) console.log(fetchedValuesArray)

			// localforage
			localStorageObserved.setItem(`settings_list_${blacklistsOrObserved}_${type}${subtype ? "_" + subtype : ""}`, fetchedValuesArray); // zapisuje jako Array: ["tag1", "tag2", "tag3"]

			// localstorage
			//localStorage.setItem(`settings_list_${blacklistsOrObserved}_${type}${subtype ? "_" + subtype : ""}`, JSON.stringify(fetchedValuesArray)); // zapisuje jako Array: ["tag1", "tag2", "tag3"]
			//localStorage.setItem("blacklisted_tags", fetchedValuesArray); // zapisuje jako string: tag1,tag2,tag3
			return true;
		}







		function switchChanged(PointerEvent, cssFilterName)
		{
			consoleX(`switchChanged(cssFilterName: ${cssFilterName})`, 1);

			/*
				this -> clicked element == event.target
				PointerEvent — even object
			*/
			//body.dataset[cssFilterName] = this.value;	//	<body data-wxs_switch_nsfw="1"]
			if (this.value == 0) body.dataset[cssFilterName] = "OFF_0";	//	<body data-wxs_switch_nsfw="OFF"]
			else if (this.value > 0) body.dataset[cssFilterName] = `ON_PLUS_${this.value}`;	//	<body data-wxs_switch_nsfw="ON_PLUS_1"]  // "ON_PLUS_1", "ON_PLUS_2", "ON_PLUS_3"
			else body.dataset[cssFilterName] = `ON_MINUS_${Math.abs(this.value)}`;	//		<body data-wxs_switch_nsfw="ON_MINUS_1"]			<body data-wxs_switch_nsfw="-1"]

			if (cssFilterName == "wxs_switch_entries_photo_viewer")
			{
				const switchImagesInput = document.getElementById("switchImages");
				if (this.value > 0 && switchImagesInput.value != 1) 
				{
					switchImagesInput.value = 1;
					switchChanged.call(switchImagesInput, null, "wxs_switch_entries_images")
				}
				else if (this.value == 0 && switchImagesInput.value != 0)
				{
					switchImagesInput.value = 0;
					switchChanged.call(switchImagesInput, null, "wxs_switch_entries_images")
				}

			}
			if (cssFilterName == "wxs_switch_entries_images" && this.value <= 0)
			{
				const switchPhotoViewerInput = document.getElementById("switchPhotoViewer");
				if (switchPhotoViewerInput.value != 0)
				{
					switchPhotoViewerInput.value = 0;
					switchChanged.call(switchPhotoViewerInput, null, "wxs_switch_entries_photo_viewer")
				}
			}
		}
		if (settings.wxsSwitchesEnable)
		{
			document.addEventListener("input", (event) =>
			{
				if (settings.wxsSwitchNSFW && event.target.closest("input#switchNSFW")) switchChanged.call(event.target, event, "wxs_switch_entries_nsfw");
				else if (settings.wxsSwitchAdult && event.target.closest("input#switchAdult")) switchChanged.call(event.target, event, "wxs_switch_entries_adult");
				else if (settings.wxsSwitchPhotoViewer && event.target.closest("input#switchPhotoViewer")) switchChanged.call(event.target, event, "wxs_switch_entries_photo_viewer");
				else if (settings.wxsSwitchImages && event.target.closest("input#switchImages")) switchChanged.call(event.target, event, "wxs_switch_entries_images");
				else if (settings.wxsSwitchYouTube && event.target.closest("input#switchYouTube")) switchChanged.call(event.target, event, "wxs_switch_entries_youtube");
				else if (settings.wxsSwitchTags && event.target.closest("input#switchTags")) switchChanged.call(event.target, event, "wxs_switch_entries_tags");
				else if (settings.wxsSwitchByUserColor && event.target.closest("input#switchByUserColor")) switchChanged.call(event.target, event, "wxs_switch_by_user_color");
				else if (settings.wxsSwitchByUserGender && event.target.closest("input#switchByUserGender")) switchChanged.call(event.target, event, "wxs_switch_by_user_gender");
			});
		}


		function addSwitchButtons()
		{
			consoleX("addSwitchButtons()", 1)

			let buttonsWrapper = document.createElement("section");
			buttonsWrapper.classList.add("wxs_switches_container");

			buttonsWrapper.innerHTML = `<datalist id="markers">
										<option value="-1" label="OFF"></option>
										<option value="0" label=""></option>
										<option value="1" label="ON">ON</option>
									</datalist>`;

			if (settings.wxsSwitchNSFW)
			{
				buttonsWrapper.innerHTML += `<div class="wxs_switch switchNSFW showOnLinksStream showOnEntriesStream showOnEntryPage">
											<div>
												<label class="label_ON_MINUS_1" title=" Wpisy z tagiem #nsfw są ukryte">Bez #nsfw</label>
												<label class="label_OFF_0">#nsfw</label>
												<label class="label_ON_PLUS_1" title=" Wyświetlane są tylko wpisy z tagiem #nsfw">Tylko #nsfw</label>
											</div>
											<div>
												<input type="range" id="switchNSFW"  list="markers" name="switchNSFW" min="-1" max="1" step="1" value="0" />
											</div>
										</div>`;
			}
			if (settings.wxsSwitchAdult)
			{
				buttonsWrapper.innerHTML += `<div class="wxs_switch switchAdult showOnLinksStream showOnEntriesStream showOnEntryPage">
											<div>
												<label class="label_ON_MINUS_1" title=" Treści oznaczne jako materiały 18+ są ukryte">Bez 18+</label>
												<label class="label_OFF_0">18+</label>
												<label class="label_ON_PLUS_1" title=" Wyświetlane są tylko treści oznaczone jako 18+ ">Tylko 18+</label>
											</div>
											<div>
												<input type="range" id="switchAdult" list="markers" name="switchAdult" min="-1" max="1" step="1" value="0" />
											</div>
										</div>`;
			}

			if (settings.wxsSwitchByUserColor)
			{
				buttonsWrapper.innerHTML += `<div class="wxs_switch switchByUserColor showOnLinksStream showOnEntriesStream showOnLinkPage showOnEntriesStream showOnEntryPage">
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
				buttonsWrapper.innerHTML += `<div class="wxs_switch switchByUserGender showOnLinkPage showOnEntriesStream showOnEntryPage">
											<div>
												<label class="label_ON_MINUS_1" title="">Bez różowych</label>
												<label class="label_OFF_0">Różowe</label>
												<label class="label_ON_PLUS_1" title="">Tylko różowe </label>
											</div>
											<div>
												<input type="range" id="switchByUserGender" list="markers" name="switchByUserGender" min="-1" max="1" step="1" value="0" />
											</div>
										</div>`;
			}

			if (settings.wxsSwitchYouTube)
			{
				buttonsWrapper.innerHTML += `<div class="wxs_switch switchYouTube showOnLinksStream showOnEntriesStream showOnEntriesStream showOnEntryPage">
											<div>
												<label class="label_ON_MINUS_1" title=" Treści bez filmików YouTube">Bez YT</label>
												<label class="label_OFF_0">YouTube</label>
												<label class="label_ON_PLUS_1" title=" Tylko YouTube ">Tylko YT</label>
											</div>
											<div>
												<input type="range" id="switchYouTube" list="markers" name="switchYouTube" min="-1" max="1" step="1" value="0" />
											</div>
										</div>`;
			}
			if (settings.wxsSwitchTags)
			{
				buttonsWrapper.innerHTML += `<div class="wxs_switch switchTags showOnEntriesStream">
											<div>
												<label class="label_ON_MINUS_1" title=" Wyświetlane są tylko wpisy nie zawierające w treści żadnych #tagów.\n Wpisy zawierające jakiekolwiek #tagi są ukryte">Tylko nocna 🌙</label>
												<label class="label_OFF_0">#tagi</label>
												<label class="label_ON_PLUS_1" title=" Wyświetlane są tylko wpisy zawierające minimum jeden #tag.\n Wpisy bez żadnego #tagu są ukryte.">Tylko #tagi #️⃣</label>
											</div>
											<div>
												<input type="range" id="switchTags" list="markers" name="switchTags" min="-1" max="1" step="1" value="0" />
											</div>
										</div>`;
			}

			if (settings.wxsSwitchImages)
			{
				buttonsWrapper.innerHTML += `<div class="wxs_switch switchImages showOnLinkPage showOnEntriesStream showOnEntryPage">
											<div>
												<label class="label_ON_MINUS_2" title=" Pokazuje tylko wpisy, które nie mają obrazków. Ukrywa wszystkie wpisy z obrazkami lub GIF-ami">Bez obr. 🚫</label>
												<label class="label_ON_MINUS_1" title=" Ukrywa obrazki we wpisach i komentarzach pozostawiając tekst">Ukryj obr.</label>
												<label class="label_OFF_0">Obrazki</label>
												<label class="label_ON_PLUS_1" title=" Pokazuje tylko wpisy, które zawierają obrazki">Tylko obr.</label>
											</div>
											<div>
												<input type="range" id="switchImages" list="markers" name="switchImages" min="-2" max="1" step="1" value="0" />
											</div>
										</div>`;
			}

			if (settings.wxsSwitchPhotoViewer)
			{
				buttonsWrapper.innerHTML += `<div class="wxs_switch switchPhotoViewer showOnEntriesStream">
											<div>
												<label class="label_OFF_0">PhotoViewer</label>
												<label class="label_ON_PLUS_1">PhotoViewer ✔</label>
												<label class="label_ON_PLUS_2">PhotoViewer ✅</label>
											</div>
											<div>
												<input type="range" id="switchPhotoViewer" list="markers" name="switchPhotoViewer" min="0" max="2" step="1" value="0" />
											</div>
										</div>`;
			}



			const nav = document.querySelector("body header div.right nav");
			nav.parentNode.insertBefore(buttonsWrapper, nav);
		}




		// ACTION BOX BUTTONS
		document.addEventListener("click", (event) =>
		{
			//if (event.target.closest("button.wxsDownVote")) downVoteLink.call(event.target, event); // zakopywanie znaleziska na głównej
			if (settings.actionBoxEnable)
			{
				if (settings.filterUserComments || settings.filterUserReplies)
				{
					if (event.target.closest("button.wxs_filter_off")) filterUserOff.call(event.target, event, event.target.closest("button.wxs_filter_off"));

					if (settings.filterUserComments)
					{
						if (event.target.closest("button.wxs_filter_on_user")) filterUserComments.call(event.target, event, event.target.closest("button.wxs_filter_on_user"), "userComments");
					}
					if (settings.filterUserReplies)
					{
						if (event.target.closest("button.wxs_filter_on_replies")) filterUserComments.call(event.target, event, event.target.closest("button.wxs_filter_on_replies"), "userReplies");
					}
				}

				if (settings.mirkoukrywaczEnable)
				{
					if (event.target.closest("button.wxs_minimize")) minimizeThisEntry.call(event.target, event);
					if (event.target.closest("button.wxs_maximize")) maximizeThisEntry.call(event.target, event);

					if (event.target.closest("button.wxs_hide")) hideThisEntry.call(event.target, event, event.target.closest("button.wxs_hide")); // > (this, arg1, arg2)


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
			consoleX("saveThisEntryContent()", 1)
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

		function filterUserOff(event, buttonElement)
		{
			consoleX(`filterUserOff()`, 1);

			if (body.dataset.wxs_filter) delete body.dataset.wxs_filter // <body data-wxs_filter>
			if (body.dataset.wxs_filter_style) delete body.dataset.wxs_filter_style
			if (body.dataset.wxs_filter_username) delete body.dataset.wxs_filter_username

			// TODO check -> document.getElementById('wxs_css_filter_user_comments')?.parentNode?.removeChild(styleElement);

			let wxs_css_style_filter_user_comments = head.querySelector("#wxs_css_filter_user_comments");
			if (wxs_css_style_filter_user_comments)
			{
				wxs_css_style_filter_user_comments.remove();
			}
		}


		function filterUserComments(event, buttonElement, filterType) 
		{
			consoleX(`filterUserComments()`, 1);

			// filterUserComments
			// filterType  => "userComments" / "userReplies"
			/*
			this -> clicked element == event.target
			event — PointerEvent object
			*/



			const css_id = "wxs_css_filter_user_comments";

			const filterUsername = buttonElement.dataset.wxs_author_username;
			const filterUserGender = buttonElement.dataset.wxs_author_gender ? buttonElement.dataset.wxs_author_gender : "m";

			let filterStyles =
				[
					`border: 3px solid gray!important; opacity: 0.3!important; `,
					`filter: grayscale(1); `,
					`display: none!important; `,
				]

			let filterStyleIndex = 0;
			let wxs_css_style_filter_user_comments = document.getElementById(css_id);

			if (wxs_css_style_filter_user_comments) // jest już nałożony jakiś filtr
			{
				if (body.dataset.wxs_filter == filterType && body.dataset.wxs_filter_username == filterUsername) // ten sam typ filtra i uzytkownik - zmiana stylu
				{
					let currentFilterStyleIndex = parseInt(body.dataset.wxs_filter_style);

					filterStyleIndex = currentFilterStyleIndex + 1;
					if (filterStyleIndex == filterStyles.length)
					{
						filterUserOff();
						return false;
					}
				}
				else // zachowujemy ten sam styl bo zmienil sie typ filtra lub filtrowany uzytkownik
				{
					filterStyleIndex = parseInt(body.dataset.wxs_filter_style);
				}
			}

			body.dataset.wxs_filter_style = filterStyleIndex.toString()

			body.dataset.wxs_filter_username = filterUsername;

			let css = "";

			if (filterType == "userComments")
			{
				body.dataset.wxs_filter = "userComments"; // <body data-wxs_filter="userComments">

				css = `.wxs_menu_action_box > .wxs_filter_off 
			{
				display: flex!important;
			}

	/* odstęp pomiędzy komentarzami */
	div.comments > section.stream > div.content
	{
		display: flex;
		flex-direction: column;
		row-gap: 20px;
		padding: 20px;
	}
	/* odfiltrowane znaleziska */
	body > section > div.main-content > main.main > section > div.content > section:is(.bucket-page, .search-page, .category-page, .favourites-page, .home-page, .observed-page, .profile-page, .tag-page, .hits-page, .upcoming-page) > section section.stream > div.content > section.link-block:has(article > div.content > section.info a.username[href="/ludzie/${filterUsername}"])
	{
		border: 1px solid ${filterUserGender == "f" ? "var(--rozowyPasek1, rgba(192, 72, 167, 1))" : "var(--niebieskiPasek1, rgba(67, 131, 175, 1))"} !important;
	}


	/* strona wpisu - filtrowane komentarze */
	body > section > div.main-content > main.main > section > div.content > section.entry-page > section.entry > section.entry-comments > div.content > section.entry.detailed > div.comments > section.stream.entry-subcomments > div.content > section.entry.reply:has(> article > header > div.right a.username[href="/ludzie/${filterUsername}"]),

	/* strona streamu wpisów - wpisy filtrowanego użytkownika */
	body > section > div.main-content > main.main > section > div.content > section:is(.bucket-page, .search-page, .category-page, .favourites-page, .observed-page, .profile-page, .tag-page, .microblog-page) > section section.stream > div.content > section.entry:has(> article > header > div.right a.username[href="/ludzie/${filterUsername}"]),

	/* strona streamu wpisów - komentarze filtrowanego użytkownika */
	body > section > div.main-content > main.main > section > div.content > section:is(.bucket-page, .search-page, .category-page, .favourites-page, .observed-page, .profile-page, .tag-page, .microblog-page) > section section.stream > div.content > section.entry > div.comments > section.stream.entry-subcomments > div.content > section.entry.reply:has(> article > header > div.right a.username[href="/ludzie/${filterUsername}"]),

	/* strona znaleziska - komentarze i subkomentarze filtrowanego użytkownika */
	body > section > div.main-content > main.main > section > div.content > section.link-page > section.link > section.comments > section.stream.link-comments > div.content section.entry:has(> article > header > div.right a.username[href="/ludzie/${filterUsername}"])

	{
		border: 1px solid ${filterUserGender == "f" ? "var(--rozowyPasek1, rgba(192, 72, 167, 1))" : "var(--niebieskiPasek1, rgba(67, 131, 175, 1))"} !important;
	}


	/* strony ze znaleziskami oprócz głównej - znaleziska autora, odfiltrowwanie znalezisk innych użytkowników */
	body > section > div.main-content > main.main > section > div.content > section:is(.bucket-page, .search-page, .category-page, .favourites-page, .home-page, .observed-page, .profile-page, .tag-page, .hits-page, .upcoming-page) > section section.stream > div.content > section.link-block:not(:has(article > div.content > section.info a.username[href="/ludzie/${filterUsername}"])),

	/* strona główna - znaleziska autora, odfiltrowwanie znalezisk innych użytkowników a takze wpisow przypietych przez moderacje */
	.pub-slot-wrapper:has(section.premium-pub.link-block),
	body > section > div.main-content > main.main > section > div.content > section.home-page > section section.stream > div.content > section:is(.link-block:not(:has(article > div.content > section.info a.username[href="/ludzie/${filterUsername}"])), 
	.entry:not(:has(> article > header > div.right > div > div.tooltip-slot > span > a.username[href="/ludzie/${filterUsername}"]))),

	/* strona wpisu-ukrycie komentarzy nie-filtrowanych użytkowników */
	body > section > div.main-content > main.main > section > div.content > section.entry-page > section.entry > section.entry-comments > div.content > section.entry.detailed > div.comments > section.stream.entry-subcomments > div.content > section.entry.reply:not(:has(> article > header > div.right a.username[href="/ludzie/${filterUsername}"])),

	/* strona streamu wpisów-ukrycie wpisów w ktorych nie ma wypowiedzi filtrowanego uzytkownika-ani wpis, ani komentarz*/
	body > section > div.main-content > main.main > section > div.content > section:is(.bucket-page, .search-page, .category-page, .favourites-page, .observed-page, .profile-page, .tag-page, .microblog-page) > section section.stream > div.content > section.entry:not(:has(article > header > div.right a.username[href="/ludzie/${filterUsername}"])),

	/* strona streamu wpisów-komentarze pod wpisami na streamach które zawierają komentarz filtrowanego użytkownika */
	body > section > div.main-content > main.main > section > div.content > section:is(.bucket-page, .search-page, .category-page, .favourites-page, .observed-page, .profile-page, .tag-page, .microblog-page) > section section.stream > div.content > section.entry:has(article > header > div.right a.username[href="/ludzie/${filterUsername}"]) > div.comments > section.stream.entry-subcomments > div.content > section.entry.reply:not(:has(> article > header > div.right a.username[href="/ludzie/${filterUsername}"])),

	/* strona streamu wpisów-komentarze pod wpisami na streamach które zawierają komentarz filtrowanego użytkownika */
	body > section > div.main-content > main.main > section > div.content > section:is(.bucket-page, .search-page, .category-page, .favourites-page, .observed-page, .profile-page, .tag-page, .microblog-page) > section section.stream > div.content > section.entry:has(article > header > div.right a.username[href="/ludzie/${filterUsername}"]) > div.comments > section.stream.entry-subcomments > div.content > section.entry.reply:not(:has(> article > header > div.right a.username[href="/ludzie/${filterUsername}"])),

	/* strona znaleziska-komentarze bez subkomentarzy filtrowanego użytkownika */
	body > section > div.main-content > main.main > section > div.content > section.link-page > section.link > section.comments > section.stream.link-comments > div.content > section.entry:not(:has(div.right > div a.username[href="/ludzie/${filterUsername}"])),

	/* strona znaleziska-subkomentarze nie-filtrowanego użytkownika */
	body > section > div.main-content > main.main > section > div.content > section.link-page > section.link > section.comments > section.stream.link-comments > div.content > section.entry > div.comments > section.stream.entry-subcomments > div.content > section.entry.reply:not(:has(> article > header > div.right > div a.username[href="/ludzie/${filterUsername}"]))
	{
		${filterStyles[filterStyleIndex]}
	}`;
			}
			else if (filterType == "userReplies")
			{
				body.dataset.wxs_filter = "userReplies"; // <body data-wxs_filter="userReplies">

				css = `.wxs_menu_action_box > .wxs_filter_off
			{
				display: flex!important;
			}

		/* odstęp pomiędzy komentarzami */
		div.comments > section.stream > div.content
		{
			display: flex;
			flex-direction: column;
			row-gap: 20px;
			padding: 20px;
		}

		/* WYRÓŻNIENIE KOMENTARZY FILTROWANEGO UŻYTKOWNIKA */
		/* strona wpisu-filtrowane komentarze */
		body > section > div.main-content > main.main > section > div.content > section.entry-page > section.entry > section.entry-comments > div.content > section.entry.detailed > div.comments > section.stream.entry-subcomments > div.content > section.entry.reply:has(> article > header > div.right a.username[href="/ludzie/${filterUsername}"]),

		/* strona streamu wpisów-wpisy filtrowanego użytkownika */
		body > section > div.main-content > main.main > section > div.content > section:is(.bucket-page, .search-page, .category-page, .favourites-page, .observed-page, .profile-page, .tag-page, .microblog-page) > section section.stream > div.content > section.entry:has(> article > header > div.right a.username[href="/ludzie/${filterUsername}"]),

		/* strona streamu wpisów-komentarze filtrowanego użytkownika */
		body > section > div.main-content > main.main > section > div.content > section:is(.bucket-page, .search-page, .category-page, .favourites-page, .observed-page, .profile-page, .tag-page, .microblog-page) > section section.stream > div.content > section.entry > div.comments > section.stream.entry-subcomments > div.content > section.entry.reply:has(> article > header > div.right a.username[href="/ludzie/${filterUsername}"]),

		/* strona znaleziska-komentarze i subkomentarze filtrowanego użytkownika */
		body > section > div.main-content > main.main > section > div.content > section.link-page > section.link > section.comments > section.stream.link-comments > div.content section.entry:has(> article > header > div.right a.username[href="/ludzie/${filterUsername}"])
		{
			border: 2px solid ${filterUserGender == "f" ? "var(--rozowyPasek1, rgba(192, 72, 167, 1))" : "var(--niebieskiPasek1, rgba(67, 131, 175, 1))"} !important;
		}


		/* WYRÓŻNIENIE ODPOWIEDZI Z OZNACZONYM FILTROWANYM UŻYTKOWNIKIEM  */
		/* strona wpisu - filtrowane komentarze */
		body > section > div.main-content > main.main > section > div.content > section.entry-page > section.entry > section.entry-comments > div.content > section.entry.detailed > div.comments > section.stream.entry-subcomments > div.content > section.entry.reply:has(> article > div.edit-wrapper > div.content > section.entry-content > div.wrapper > a[href="/ludzie/${filterUsername}"]),

		/* strona streamu wpisów-komentarze z oznaczonym wołaniem filtrowanego użytkownika */
		body > section > div.main-content > main.main > section > div.content > section:is(.bucket-page, .search-page, .category-page, .favourites-page, .observed-page, .profile-page, .tag-page, .microblog-page) > section section.stream > div.content > section.entry > div.comments > section.stream.entry-subcomments > div.content > section.entry.reply:has(> article > div.edit-wrapper > div.content > section.entry-content > div.wrapper a[href="/ludzie/${filterUsername}"]),

		/* strona znaleziska - komentarze i subkomentarze filtrowanego użytkownika */
		body > section > div.main-content > main.main > section > div.content > section.link-page > section.link > section.comments > section.stream.link-comments > div.content section.entry:has(> article > header > div.right a.username[href="/ludzie/${filterUsername}"])
		{
			border: 2px solid var(--nicknameOrange1, rgba(255, 89, 23, 1))!important;
		}

		/* wyróżnienie tagowanego w odpowiedzi */
		section.entry.reply > article > div.edit-wrapper > div.content > section.entry-content > div.wrapper > a[href="/ludzie/${filterUsername}"]
		{
			background-color: var(--whiteOpacity1);
			padding: 0px 5px 0px 5px;
			margin-right: 5px;
			border-bottom: 1px solid;
			font-weight: bolder!important;
		}

		/* UKRYCIE KOMENTARZY, KTÓRE NIE SĄ FILTROWANEGO UŻYTKOWNIKA ANI NIE WOŁAJĄ FILTROWANEGO UŻYTKOWNIKA */

		/* strona wpisu - ukrycie komentarzy nie-filtrowanych użytkowników */
		body > section > div.main-content > main.main > section > div.content > section.entry-page > section.entry > section.entry-comments > div.content > section.entry.detailed > div.comments > section.stream.entry-subcomments > div.content > section.entry.reply:not(:has(> article > header a.username[href="/ludzie/${filterUsername}"], > article > div.edit-wrapper > div.content > section.entry-content > div.wrapper a[href="/ludzie/${filterUsername}"])),

		/* strona streamu wpisów - ukrycie wpisów i komentarzy które nie są wypowiedziami filtrowanego uzytkownika ani nie zawierają w treści otagowanego filtrowanego użytkownika */
		body > section > div.main-content > main.main > section > div.content > section:is(.bucket-page, .search-page, .category-page, .favourites-page, .observed-page, .profile-page, .tag-page, .microblog-page) > section section.stream > div.content > section.entry:not(:has(div > a[href="/ludzie/${filterUsername}"])),

		/* strona znaleziska - komentarze bez subkomentarzy filtrowanego użytkownika */
		body > section > div.main-content > main.main > section > div.content > section.link-page > section.link > section.comments > section.stream.link-comments > div.content > section.entry:not(:has(a.username[href="/ludzie/${filterUsername}"])),

		/* strona znaleziska-subkomentarze nie-filtrowanego użytkownika */
		body > section > div.main-content > main.main > section > div.content > section.link-page > section.link > section.comments > section.stream.link-comments > div.content > section.entry > div.comments > section.stream.entry-subcomments > div.content > section.entry.reply:not(:has(a.username[href="/ludzie/${filterUsername}"]))
		{
			${filterStyles[filterStyleIndex]}
		}`;
			}

			if (dev) console.log("css");
			if (dev) console.log(css);

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
				head.appendChild(wxs_css_style_filter_user_comments);
			}

		}

		function minimizeThisEntry(PointerEvent)		// PointerEvent.altKey, .ctrlKey, .shiftKey, .target (Element)
		{
			consoleX("minimizeThisEntry()", 1)

			let sectionEntry = this?.closest('.entry');
			if (sectionEntry)
			{
				mirkoukrywaczBlockNewElement(sectionEntry, undefined, "minimized");
			}
		}

		function maximizeThisEntry(PointerEvent, object_id)
		{
			consoleX("maximizeThisEntry()", 1)

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

		// UKRYWANIE WPISU I KOMENTARZY-DODAWANIE DO MIRKOUKRYWACZA
		function hideThisEntry(event, buttonElement)
		{
			consoleX(`hideThisEntry()`, 1);

			// console.log("hideThisEntry - event", event);
			// console.log("hideThisEntry - button", button);
			// console.log("hideThisEntry - button.dataset.wxs_resource", button.dataset.wxs_resource);
			// console.log("hideThisEntry - this", this); // this > span

			let resource = buttonElement.dataset.wxs_resource;
			let entry_stream = buttonElement?.closest(".stream");

			if (entry_stream)
			{
				let sectionObject;

				if (resource == "entry" || resource == "entry_comment" || resource == "link_comment")
				{
					sectionObject = buttonElement.closest(".entry");
				}
				else if (resource == "link")
				{
					sectionObject = buttonElement.closest('.link-block');
				}
				if (dev) console.log("sectionObject");
				if (dev) console.log(sectionObject);

				if (sectionObjectIntersectionObserver) sectionObjectIntersectionObserver.unobserve(sectionObject);
				mirkoukrywaczBlockNewElement(sectionObject, null, "hidden");
				sectionObject.remove();
			}
		}






		// getWykopXAPIData("entry", "first-by-date")		-> https://archiwum.wykopx.pl/api/entry/first-by-date
		async function getWykopXAPIData(...pathAPIargs)
		{
			if (dev) console.log("❎ getWykopXAPIData", pathAPIargs)
			try
			{
				let apiURL = `https://archiwum.wykopx.pl/api/${pathAPIargs.join('/')}`;
				if (dev) console.log("❎ getWykopXAPIData apiURL: ", apiURL)

				const response = await fetch(apiURL,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json"
						},
					});

				if (dev) console.log("❎ getWykopXAPIData response:", response)
				let data;
				try
				{
					data = await response.json();
					if (dev) console.log("❎ getWykopXAPIData data: ", data)
				}
				catch (error)
				{
					data = response.status; // 204 
					if (dev) console.log("❎ getWykopXAPIData-response.status")
				}
				return data;
			}
			catch (error)
			{
				console.error(`❎ call to WykopX API failed: ${error}`);
				throw error;
			}
		}

		// calls Wykop API url: getWykopAPIData("profile") -> https://wykop.pl/api/v3/profile
		// getWykopAPIData("profile", "users", username } -> https://wykop.pl/api/v3/profile/users/NadiaFrance
		// getWykopAPIData("profile"} -> https://wykop.pl/api/v3/profile
		async function getWykopAPIData(...pathAPIargs)
		{
			if (dev) console.log("getWykopAPIData(), pathAPIargs: ", pathAPIargs)

			try
			{
				let data = await callWykopAPI("GET", ...pathAPIargs);
				return data;

			}
			catch (error)
			{
				console.error(`Fetch failed: ${error}`);
				throw error;
			}
		}
		async function postWykopAPIData(...pathAPIargs)
		{
			if (dev) console.log("postWykopAPIData(), pathAPIargs: ", pathAPIargs);

			try
			{
				let data = await callWykopAPI("POST", ...pathAPIargs);
				return data;
			}
			catch (error)
			{
				console.error(`Fetch failed: ${error}`);
				throw error;
			}
		}

		async function deleteWykopAPIData(...pathAPIargs)
		{
			if (dev) console.log("deleteWykopAPIData(), pathAPIargs: ", pathAPIargs)
			try
			{
				let data = await callWykopAPI("DELETE", ...pathAPIargs);
				return data;
			}
			catch (error)
			{
				console.error(`Fetch failed: ${error}`);
				throw error;
			}
		}


		async function callWykopAPI(method, ...pathAPIargs)
		{
			if (dev) console.log(`callWykopAPI() ->  method: ${method},  pathAPIargs: `, pathAPIargs)
			try
			{
				const response = await fetch(`https://wykop.pl/api/v3/${pathAPIargs.join('/')}`, {
					method: method, // "GET", "POST", or 'PUT'
					headers: {
						"Content-Type": "application/json",
						Authorization: "Bearer " + window.localStorage.token,
					},
				});

				if (dev) console.log("callWykopAPI() -> URL: " + `https://wykop.pl/api/v3/${pathAPIargs.join('/')}`)
				if (dev) console.log(response)

				// if (!response.ok)
				// {
				// 	throw new Error(`HTTP error! status: ${response.status}`);
				// }

				let data;
				try
				{
					data = await response.json();
					if (dev) console.log("callWykopAPI() -> data", data)
				}
				catch (error)
				{
					// if(dev) console.log('No body or not a JSON body:', error);
					data = response.status; // 204 
					if (dev) console.log("callWykopAPI() -> response.status", response.status)
				}
				return data;
			}
			catch (error)
			{
				console.error(`call to Wykop API failed: ${error}`);
				throw error;
			}
		}
























		/* INTERSECTION OBSERVER */

		// dla każdego wpisu i komentarza
		// strona wpisu, caly wpis: section:is(.entry:has(> article), .link-block:has(> section > article)):not(.deleted)
		// tylko czesc wpisu bez komentarzy "section.entry:not(.deleted):has(> article), section.link-block:not(.deleted) > section > article)
		/// :not(.deleted)
		if (IntersectionObserverEnabled == true) waitForKeyElements("section.entry:has(> article), section.link-block:not(.premium-pub, .market-pub):has(> section > article)", sectionObjectDetected, false);

		function sectionObjectDetected(sectionObjectElement)
		{
			// consoleX(`sectionObjectDetected()`, 1)
			sectionObjectIntersectionObserver.observe(sectionObjectElement);
		}



		if (settings.linkToVideoDuration || settings.entryWithVideoDuration)
		{
			CSS += `
			/* WYKOP XS CODE - START */
			section.link-block > section > article > figure::before,
			section.link-page section.link-block[data-wxs_video_duration] > section::before, 										/* WYKOP XS ONLY */
			section.entry[data-wxs_video_duration] > article > div.edit-wrapper > section.embed > section.embed-ghost::before		/* WYKOP XS ONLY */
			{
				content: var(--wxs_video_duration);	/* WYKOP XS ONLY */

				z-index: 1;
				max-width: 80px;
				animation-name: fadeIn;
				animation-duration: 0.4s;
				animation-delay: 1s;
				animation-fill-mode: both;
				animation-timing-function: ease-in-out;
				position: absolute;
				bottom: 10%;
				padding: 4rem 25rem 4rem 25rem;
				display: flex;
				border-bottom: 1px solid var(--alto);
				border-radius: 0 var(--borderRadius) var(--borderRadius) 0!important;
				justify-content: center;
				align-items: center;
				color: rgba(180, 180, 180, 1);
				background-color: rgba(0, 0, 0, 1);
				opacity: 1;

				@starting-style {
					opacity: 0; scale: 0.9; translate: -40px;
				}
			}
			/* WYKOP XS CODE - END */
			section.link-page section.link-block[data-wxs_video_duration] > section,
			section.entry[data-wxs_video_duration] > article > div.edit-wrapper > section.embed > section.embed-ghost
			{
				position: relative;
			}
			section.link-page section.link-block[data-wxs_video_duration] > section::before
			{
				bottom: unset;
				top: -15px;
				border-bottom: none;
				border-radius: 0!important;
			}
			section.link-page section.link-block[data-wxs_video_duration] > section { margin-top: 15px; }
			@keyframes fadeIn { 0% { opacity: 0; scale: 0.8; translate: -40px; } 100% { opacity: 1; scale: 1; translate: 0px; }}
		`;
		}


		// INTERSECTION OBSERVED
		const sectionObjectsAreIntersecting = async (intersectingObject, observer) =>
		{
			intersectingObject.forEach(async (IntersectionObserverEntry) =>															// InterIntersectionObserverEntry
			{


				// ----- ANY INTERSECTION CHANGED 
				let sectionObjectElement = IntersectionObserverEntry.target;														// element <section class="entry"> 
				let resource = null;		// resource = "link", "entry", "entry_comment"
				// if(dev) console.log(`intersectingObject: `, sectionObjectElement)
				if (!sectionObjectElement?.__vue__?.item) return false;


				// ----- ONLY ONCE: INTERSECTION CHANGED FOR THE FIRST TIME:
				if (!sectionObjectElement.dataset.wxs_first_load_time) 
				{
					// if(dev) console.log("intersectingObject-sectionObjectElement.__vue__.item")
					// if(dev) console.log(sectionObjectElement)
					// if(dev) console.log("intersectingObject-sectionObjectElement.__vue__.item")
					// if(dev) console.log(sectionObjectElement.__vue__)
					// if(dev) console.log("intersectingObject-sectionObjectElement.__vue__.item")
					// if(dev) console.log(sectionObjectElement.__vue__.item)
					// data-wxs_first_load_time="2024-12-12..."
					sectionObjectElement.dataset.wxs_first_load_time = dayjs().valueOf(); // data unix kiedy przybyly ostatnio odswiezone plusy-tutaj czas załadowania strony
					resource = sectionObjectElement.__vue__.item.resource;

					let wxs_votes_up = sectionObjectElement.__vue__.item.votes.up;								// liczba wykopów/plusów 10
					let wxs_votes_down = sectionObjectElement.__vue__.item.votes.down;							// liczba zakopów/minusów 20
					let wxs_votes_count = wxs_votes_up - wxs_votes_down;										// suma plusów i minusów/ suma wykopów i zakopów -10 
					let wxs_votes_all = wxs_votes_up - wxs_votes_down; 											// łączna liczba oddanych głosów 30 
					let wxs_votes_up_percent = 0;
					let wxs_votes_down_percent = 0;
					if (wxs_votes_all > 0)
					{
						wxs_votes_down_percent = Math.ceil(wxs_votes_down * 100 / wxs_votes_all);
						wxs_votes_up_percent = Math.ceil(wxs_votes_up * 100 / wxs_votes_all);
					}

					// wpisy i komentarze
					if (resource != "link") 
					{
						if (settings.checkEntryPlusesEnable || settings.votingExplosionEnable)
						{
							sectionObjectElement.style.setProperty('--votesAll', `"👨${wxs_votes_all}"`);		// var(--votesAll)
							sectionObjectElement.dataset.wxs_votes_all = wxs_votes_all;							// data-wxs_votes_all="-10"
							sectionObjectElement.style.setProperty('--votesUp', `"${wxs_votes_up > 0 ? settings.prefixBeforePlusesCount : ""}${wxs_votes_up}"`);	// var(--votesUp);



							sectionObjectElement.dataset.wxs_votes_up = wxs_votes_up;							// data-wxs_votes_all="10"
							sectionObjectElement.style.setProperty('--votesDown', `"${wxs_votes_down > 0 ? settings.prefixBeforeMinusesCount : ""}${wxs_votes_down}"`);	//var(--votesDown)
							sectionObjectElement.dataset.wxs_votes_down = wxs_votes_down;						// data-wxs_votes_all="20"
							sectionObjectElement.style.setProperty('--votesCount', `"${wxs_votes_up > 0 ? settings.prefixBeforePlusesCount : wxs_votes_up < 0 ? settings.prefixBeforeMinusesCount : ""}${wxs_votes_count}"`); // var(--votesCount)
							sectionObjectElement.dataset.wxs_votes_count = wxs_votes_count;						// data-wxs_votes_all="30"

							sectionObjectElement.dataset.wxs_voted = sectionObjectElement.__vue__.item.voted;	// data-wxs_voted=1  data-wxs_voted=0

							if (settings.votingExplosionEnable || settings.checkEntryPlusesPerHour && !sectionObjectElement.dataset.wxs_first_load_votes_count)
							{
								// liczba plusow podczas zaladowania strony
								sectionObjectElement.dataset.wxs_first_load_votes_count = sectionObjectElement.__vue__.item.votes.up - sectionObjectElement.__vue__.item.votes.down;
							}
						}

						if (settings.entryWithVideoDuration && sectionObjectElement?.__vue__?.item?.media?.embed?.video_metadata?.duration_in_seconds)
						{
							let wxs_video_duration = timeDurationFromSeconds(sectionObjectElement?.__vue__?.item?.media?.embed?.video_metadata?.duration_in_seconds);
							sectionObjectElement.dataset.wxs_video_duration = wxs_video_duration;							// data-wxs_video_duration="02:34"
							sectionObjectElement.style.setProperty("--wxs_video_duration", `"${wxs_video_duration}"`);		// var(--wxs_video_duration) -> "02:34"
						}

						if (settings.filterUserReplies)
						{
							sectionObjectElement.querySelectorAll(`article > div.edit-wrapper > div.content > section.entry-content > div.wrapper > a[href^="/ludzie/"]:not([data-wxs_mention_username])`).forEach((a_mention) =>
							{
								const a_mentions_filter_button = document.createElement("button");
								a_mentions_filter_button.classList = "wxs_filter_on_replies";
								a_mentions_filter_button.innerHTML = `🔰<span>FILTRUJ</span>`
								a_mentions_filter_button.type = "button";

								const wxs_mention_username = a_mention.href.replace("https://wykop.pl/ludzie/", "")
								a_mention.dataset.wxs_mention_username = wxs_mention_username; // każdy @mention uzytkownika zmieniamy na <a href="/ludzie/NadiaFrance" data-wxs_author_username="NadiaFrance">

								a_mentions_filter_button.dataset.wxs_author_username = wxs_mention_username;
								a_mentions_filter_button.title = `𝗪𝘆𝗸𝗼𝗽 𝗫 — 𝗳𝗶𝗹𝘁𝗿𝗼𝘄𝗮𝗻𝗶𝗲 𝗱𝘆𝘀𝗸𝘂𝘀𝗷𝗶 𝗶 𝗼𝗱𝗽𝗼𝘄𝗶𝗲𝗱𝘇𝗶 \n \n Pokaż całą dyskusję z użytkownikiem '${wxs_mention_username}'.\n \n  Pokazuje: \n — wszystkie komentarze '${wxs_mention_username}' \n — odpowiedzi, które wołają '@${wxs_mention_username}' \n \n Klikając przełączasz tryb filtrowania: \n — Filtr 1: odfiltrowane komentarze półprzezroczyste\n — Filtr 2: odfiltrowane komentarze czarno białe\n — Filtr 3: całkowicie ukrywa odfiltrowane komentarze\n \n "`

								a_mention.insertAdjacentElement("afterend", a_mentions_filter_button);

								// if(dev) console.log("=== BUTTON ADDED: a_mentions_filter_button")
								// if(dev) console.log(a_mentions_filter_button)
							})
						}


						if (resource == "entry") // TODO komentarze w znaleziskach
						{

							if (settings.authorBlocksYouCheckingEnable && loggedUser?.status == "active")
							{
								// nie sprawdzamy, gdy ktoś ma bana, bo wtedy nigdzie nie można dodać wpisu

								// <section data-status="400"> jeśli autor cie blokuje i nie mozna dodac wpisu

								let blockingStatus = await checkIfYouCanPostCommentInEntry(sectionObjectElement.__vue__.item.id);
								if (blockingStatus == 400) 
								{
									sectionObjectElement.dataset.status = blockingStatus;
									let blockDetectorTitle = `Wykop X: 𝗕𝗹𝗼𝗰𝗸 𝗗𝗲𝘁𝗲𝗰𝘁𝗼𝗿❗\n\n`;
									if (sectionObjectElement.__vue__.item.author.gender == "f") blockDetectorTitle += `Użytkowniczka @${sectionObjectElement.__vue__.item.author.username} dodała Cię na czarną listę.`
									else blockDetectorTitle += `Użytkownik @${sectionObjectElement.__vue__.item.author.username} dodał Cię na czarną listę.`;
									blockDetectorTitle += `\n\nNie możesz dodawać komentarzy w tym wpisie.`
									sectionObjectElement.title = blockDetectorTitle;

									// TODO - dodanie autora do listy blokujących
								}
							}

							// sectionObjectElement.title = `Wykop X: 𝗕𝗹𝗼𝗰𝗸 𝗗𝗲𝘁𝗲𝗰𝘁𝗼𝗿❗\n\nUżytkownik @m__b dodał Cię na czarną listę\n\nNie możesz dodawać komentarzy w tym wpisie.`;

							// sprawdzenie czy wpis zawiera grę w plusowanie
							if (settings.checkEntryPlusesForVotingGame)
							{
								var substrings = ["z plusów", "tnia cyfra", "cyfra powie", "siaj jesteś", "siaj jestes", "niej cyfry", "iczba po zaplus", "yfra po zaplus"];
								var containsSubstring = substrings.some(substring => sectionObjectElement.__vue__.item.content.includes(substring));

								if (containsSubstring)
								{
									sectionObjectElement.dataset.wxs_voting_game = "true";

									// string pokazujący zakrytą liczbę plusow - zamiast "1234" -> "12--"
									//sectionObjectElement.style.setProperty('--votesUpHidden', `"+${replaceDigitsWithDot(sectionObjectElement.__vue__.item.votes.up)}"`);
									sectionObjectElement.style.setProperty('--votesUpHidden', `"${settings.prefixBeforePlusesCount}` + replaceDigitsWithDot(wxs_votes_up) + `"`);
									sectionObjectElement.style.wxs_votes_up_hidden = replaceDigitsWithDot(wxs_votes_up);				// data-wxs_votes_up_hidden

									let votingGameLastDigit = wxs_votes_up + 1; 														// liczba po zaplusowaniu
									votingGameLastDigit = votingGameLastDigit.toString().slice(-1);										// ostatnia cyfra po zaplusowaniu

									sectionObjectElement.style.setProperty('--votingGameLastDigit', `"` + votingGameLastDigit + `"`);
									sectionObjectElement.dataset.wxs_voting_game_last_digit = votingGameLastDigit;						// data-wxs_voting_game_last_digit="9"
								}
							}

							if (settings.checkEntryCommentsPerHour && !sectionObjectElement.dataset.wxs_first_load_comments_count)
							{
								sectionObjectElement.dataset.wxs_first_load_comments_count = sectionObjectElement.__vue__.item.comments.count;
							}
						}
					}
					// znalezisko
					else if (resource == "link")
					{
						if (settings.linkToVideoDuration && sectionObjectElement?.__vue__?.item?.media?.embed?.video_metadata?.duration_in_seconds)
						{
							let wxs_video_duration = timeDurationFromSeconds(sectionObjectElement?.__vue__?.item?.media?.embed?.video_metadata?.duration_in_seconds);
							sectionObjectElement.dataset.wxs_video_duration = wxs_video_duration;					// data-wxs_video_duration="02:34"
							sectionObjectElement.style.setProperty("--wxs_video_duration", `"${wxs_video_duration}"`);		// var(--wxs_video_duration) -> "02:34"
						}

						if (settings.checkLinkVotesEnable && settings.checkLinkVotesPerHour && !sectionObjectElement.dataset.wxs_first_load_votes_count)
						{
							//sectionObjectElement.style.setProperty('--votesUp', `"${sectionObjectElement.__vue__.item.votes.up}"`);
							//sectionObjectElement.style.setProperty('--votesDown', `"${sectionObjectElement.__vue__.item.votes.down}"`);
							sectionObjectElement.dataset.wxs_votes_up = sectionObjectElement.__vue__.item.votes.up;
							sectionObjectElement.dataset.wxs_votes_down = sectionObjectElement.__vue__.item.votes.down;
							sectionObjectElement.dataset.wxs_voted = sectionObjectElement.__vue__.item.voted;
							sectionObjectElement.dataset.wxs_first_load_votes_count = sectionObjectElement.__vue__.item.votes.up - sectionObjectElement.__vue__.item.votes.down;
							sectionObjectElement.dataset.wxs_votes_count = sectionObjectElement.__vue__.item.votes.up - sectionObjectElement.__vue__.item.votes.down;
							sectionObjectElement.dataset.wxs_votes_all = sectionObjectElement.__vue__.item.votes.up + sectionObjectElement.__vue__.item.votes.down;
						}
						if (settings.checkLinkCommentsPerHour && !sectionObjectElement.dataset.wxs_first_load_comments_count)
						{
							if (!sectionObjectElement.dataset.wxs_first_load_time) sectionObjectElement.dataset.wxs_first_load_time = dayjs().valueOf(); // data unix kiedy przybyly ostatnio odswiezone plusy-tutaj czas załadowania strony
							sectionObjectElement.dataset.wxs_first_load_comments_count = sectionObjectElement.__vue__.item.comments.count;
						}
					}
					currentPageTotalVotesUpCount += sectionObjectElement.__vue__.item.votes.up;
				}


				// ----- OBJECT IS VISIBLE  -- IS INTERSECTING!
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
							if ((sectionObjectElement.__vue__.item.votes.up > votesFetchingLimitMinimumVotes || sectionObjectElement.__vue__.item.votes.down > votesFetchingLimitMinimumVotes) && loadTime.diff(dayjs(sectionObjectElement.__vue__.item.created_at), 'hour') < votesFetchingLimitMaximumHoursOld)
							{
								let i = 1;
								let timeoutId = null
								timeoutId = setTimeout(function checkPlusesAgain()
								{
									if (sectionObjectElement?.__vue__?.item)
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
									}
								}, votesFetchingFirstDelayInSeconds * 1000);
							}
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
									if (sectionObjectElement?.__vue__?.item)
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
							if (settings.linksAnalyzerEnable || settings.linkVoteDownButton)
							{
								linkSectionIntersected(sectionObjectElement)  // waitForKeyElements(`section.link-block[id^="link-"]`, , false);  // GM_wrench.waitForKeyElements(`section.link-block[id^="link-"]`, linkSectionIntersected, false);
							}

							if (settings.checkLinkVotesEnable && settings.checkLinkVotesPerHour)
							{
								const ratingBoxSection = sectionObjectElement.querySelector(".vote-box")

								if ((sectionObjectElement.__vue__.item.votes.up > votesFetchingLimitMinimumVotes || sectionObjectElement.__vue__.item.votes.down > votesFetchingLimitMinimumVotes) && loadTime.diff(dayjs(sectionObjectElement.__vue__.item.created_at), 'day') < votesFetchingLimitMaximumHoursOld)
								{
									let wxs_votes_per_hourDivElement = document.createElement("div");
									wxs_votes_per_hourDivElement.title = "Wykop X: Liczba wykopów na godzinę";
									wxs_votes_per_hourDivElement.classList = "wxs_votes_per_hour";
									ratingBoxSection.appendChild(wxs_votes_per_hourDivElement);
								}
							}
						}
						// WPISY, KOMENTARZE POD WPISAMI, KOMENTARZE POD ZNALEZISKAMI, 
						else
						{

							const ratingBoxSection = sectionObjectElement.querySelector(".rating-box")
							if (settings.votingExplosionEnable || settings.checkEntryPlusesWhenVoting) 
							{
								votingEventListener(sectionObjectElement, ratingBoxSection);
							}

							if (ratingBoxSection && settings.checkEntryPlusesEnable && settings.checkEntryPlusesPerHour)
							{
								if ((sectionObjectElement.__vue__.item.votes.up > votesFetchingLimitMinimumVotes || sectionObjectElement.__vue__.item.votes.down > votesFetchingLimitMinimumVotes) && loadTime.diff(dayjs(sectionObjectElement.__vue__.item.created_at), 'day') < votesFetchingLimitMaximumHoursOld)
								{
									let wxs_votes_per_hourDivElement = document.createElement("div");
									wxs_votes_per_hourDivElement.title = "Wykop X: Liczba plusów na godzinę";
									wxs_votes_per_hourDivElement.classList = "wxs_votes_per_hour";
									ratingBoxSection.appendChild(wxs_votes_per_hourDivElement);
								}

							}
						}


						// podkomentarz
						if (sectionObjectElement.__vue__.item.parent)
						{
							parent_resource = sectionObjectElement.__vue__.item.parent.resource;		// data-wxs_parent_resource="entry"
							parent_id = sectionObjectElement.__vue__.item.parent.id;					// data-wxs_parent_id="1234567"
						}



						// INFOBOX, NOTATKOWATOR, USER LABELS
						let userDataObject = sectionObjectElement.__vue__?.item?.author;
						if (settings.infoboxEnable || settings.notatkowatorEnable || settings.wxsUserLabelsEnable)
						{
							// TWORZYMY USERINFOBOX do wszystkich nicków autora tego wpisu/komentarza/linka
							// pierwszy raz widzimy ten wpis / komentarz użytkownika i nie były do niego dodawane userdata więc dodajemy data-wxs_username="NadiaFrance"
							if (!sectionObjectElement.dataset.wxs_username && userDataObject.username)
							{
								// POBIERAMY INFORMACJE O UŻYTKOWNIKU Z FETCH API
								if (settings.infoboxEnable)
								{
									userDataObject = await getUserDetailsForUsername(userDataObject, undefined, true); // userDataObject, username, forceAPICheck
								}
								if (settings.wxsUserLabelsEnable)
								{
									if (settings.wxsUserLabelsFakeFemales)
									{
										if (falszyweRozoweArray && falszyweRozoweArray.includes(userDataObject.username))
										{
											userDataObject.gender = "m";
											sectionObjectElement.__vue__.item.author.gender = "m";
											userDataObject.changeSexTo = "male";
										}
										else if (falszyweNiebieskieArray && falszyweNiebieskieArray.includes(userDataObject.username))
										{
											userDataObject.gender = "f";
											sectionObjectElement.__vue__.item.author.gender = "f";
											userDataObject.changeSexTo = "female";
										}
									}


									if (settings.wxsUserLabelsTrolls && mapaTrolli)
									{
										let wxsUserLabelObject = null;
										// if(dev) console.log(mapaTrolli.get(userDataObject.username));
										if ((wxsUserLabelObject = mapaTrolli.get(userDataObject.username)))
										{
											userDataObject.wxsUserLabel = wxsUserLabelObject.label;
											userDataObject.wxsUserURL = wxsUserLabelObject.url;
										}
									}
								}

								// SPRAWDZENIE I DODANIE NOTATKI ORAZ DANYCH UZYTKOWNIKA
								let userNoteObject = null;
								if (settings.notatkowatorEnable) 
								{


									// jeszcze nie dodawaliśmy notatki
									if (userDataObject?.note == true && sectionObjectElement?.dataset?.wxs_note_loaded != true)
									{
										// potencjalna zmiana plci przez +m lub +f
										userNoteObject = await getUserNoteObjectByUsername(sectionObjectElement, undefined, true); //  username, forceAPICheck
										sectionObjectElement.dataset.wxs_note_loaded = "true"; // todo nazwa uzytkownika zamiast true zeby potem sprawdzac <section data-wxs_note_loaded="true" data-wxs_username="NadiaFrance" data-wxs_user_note="true">

										if (userNoteObject?.changeSexTo)
										{
											userDataObject.changeSexTo = userNoteObject.changeSexTo;
											userDataObject.gender = userNoteObject.gender;
											sectionObjectElement.__vue__.item.author.gender = userNoteObject.gender;
										}
									}
								}

								createInfoboxDivsForUserEverywhere(userDataObject, userNoteObject, undefined);
							}
						}




						// TWORZYMY ACTION BOX
						if (settings.actionBoxEnable)
						{
							const wxs_author_username = sectionObjectElement.__vue__.item.author.username;
							const wxs_author_gender = sectionObjectElement.__vue__.item.author.gender;
							let wxs_menu_action_box = document.createElement("div");
							wxs_menu_action_box.classList.add("wxs_menu_action_box", "wykopxs"); // 📰📑 🔖 ⎀⎊👁 🖾 🗙 ⌧ ⮽ 🗳 ☒ 🗵 🗷- ‐ ‑ – ‒ — ― _ ﹏🗖 ⎀ ⎊
							let wxs_menu_action_box_html = ``;

							if (settings.filterUserComments || settings.filterUserReplies)
							{
								wxs_menu_action_box_html += `<button data-wxs_object_id="${object_id}" data-wxs_id="${id}" data-wxs_resource="${resource}" data-wxs_parent_id="${parent_id}" data-wxs_parent_resource="${parent_resource}" data-wxs_author_username="${wxs_author_username}" data-wxs_author_gender="${wxs_author_gender}" class="wxs_filter_off" title=" Wykop X — wyłącz filtrowanie \n \n Pokaż normalnie wszystkie odfiltrowane komentarze / znaleziska \n \n ">❌<span>Wyłącz filtr</span></button>`;
								if (settings.filterUserComments)
								{
									wxs_menu_action_box_html += `<button data-wxs_object_id="${object_id}" data-wxs_id="${id}" data-wxs_resource="${resource}" data-wxs_parent_id="${parent_id}" data-wxs_parent_resource="${parent_resource}" data-wxs_author_username="${wxs_author_username}" data-wxs_author_gender="${wxs_author_gender}" class="wxs_filter_on_user" title=" 𝗪𝘆𝗸𝗼𝗽 𝗫 — 𝗳𝗶𝗹𝘁𝗿𝗼𝘄𝗮𝗻𝗶𝗲 𝗸𝗼𝗺𝗲𝗻𝘁𝗮𝗿𝘇𝘆/𝘇𝗻𝗮𝗹𝗲𝘇𝗶𝘀𝗸	\n \n Na stronach zawierających 𝗸𝗼𝗺𝗲𝗻𝘁𝗮𝗿𝘇𝗲 (pod wpisami i pod znaleziskami) \n odfiltrowuje 𝗸𝗼𝗺𝗲𝗻𝘁𝗮𝗿𝘇𝗲 innych użytkowników. \n Pozostawia widoczne wyłącznie 𝗸𝗼𝗺𝗲𝗻𝘁𝗮𝗿𝘇𝗲 tego użytkownika. \n \n Na stronach zawierających 𝘇𝗻𝗮𝗹𝗲𝘇𝗶𝘀𝗸𝗮 (np. główna, wykopalisko) \n odfiltrowuje 𝘇𝗻𝗮𝗹𝗲𝘇𝗶𝘀𝗸𝗮 innych użytkowników. \n Pozostawia widoczne wyłącznie 𝘇𝗻𝗮𝗹𝗲𝘇𝗶𝘀𝗸𝗮 tego użytkownika. \n \n \n Klikając przełączasz tryb filtrowania: \n — Filtr 1: całkowicie ukrywa odfiltrowane komentarze \n — Filtr 2: odfiltrowane komentarze półprzezroczyste \n — Filtr 3: odfiltrowane komentarze czarno białe \n \n ">⚜<span>Filtruj</span></button>`;
								}
								if (settings.filterUserReplies)
								{
									wxs_menu_action_box_html += `<button data-wxs_object_id="${object_id}" data-wxs_id="${id}" data-wxs_resource="${resource}" data-wxs_parent_id="${parent_id}" data-wxs_parent_resource="${parent_resource}" data-wxs_author_username="${wxs_author_username}" data-wxs_author_gender="${wxs_author_gender}" class="wxs_filter_on_replies" title=" 𝗪𝘆𝗸𝗼𝗽 𝗫 — 𝗳𝗶𝗹𝘁𝗿𝗼𝘄𝗮𝗻𝗶𝗲 𝗱𝘆𝘀𝗸𝘂𝘀𝗷𝗶 𝗶 𝗼𝗱𝗽𝗼𝘄𝗶𝗲𝗱𝘇𝗶 \n \n Odfiltrowuje 𝗸𝗼𝗺𝗲𝗻𝘁𝗮𝗿𝘇𝗲, które nie dotyczą tego użytkownika.  \n \n  Nie ukrywa: \n — komentarzy tego użytkownika \n — odpowiedzi, które zawierają @wołanie tego użytkownika \n \n Klikając przełączasz tryb filtrowania: \n — Filtr 1: całkowicie ukrywa odfiltrowane komentarze \n — Filtr 2: odfiltrowane komentarze półprzezroczyste \n — Filtr 3: odfiltrowane komentarze czarno białe \n \n ">🔰<span>Filtruj</span></button>`;
								}
							}

							if (settings.mirkoukrywaczEnable)
							{
								if (settings.mirkoukrywaczHideComments || settings.mirkoukrywaczHideEntries || settings.mirkoukrywaczHideLinks)
								{
									wxs_menu_action_box_html += `<button data-wxs_object_id="${object_id}" data-wxs_id="${id}" data-wxs_resource="${resource}" data-wxs_parent_id="${parent_id}" data-wxs_parent_resource="${parent_resource}" data-wxs_author_username="${wxs_author_username}" data-wxs_author_gender="${wxs_author_gender}" class="wxs_minimize" title="Wykop X Krawężnik — zwiń"><span>[ </span>—<span> ]</span></button>
								<button data-wxs_object_id="${object_id}" data-wxs_id="${id}" data-wxs_resource="${resource}" data-wxs_parent_id="${parent_id}" data-wxs_parent_resource="${parent_resource}" data-wxs_author_username="${wxs_author_username}" data-wxs_author_gender="${wxs_author_gender}" class="wxs_maximize" title="Wykop X Krawężnik — pokaż cały"><span>[ </span>+<span> ]</span></button>
								<button data-wxs_object_id="${object_id}" data-wxs_id="${id}" data-wxs_resource="${resource}" data-wxs_parent_id="${parent_id}" data-wxs_parent_resource="${parent_resource}" data-wxs_author_username="${wxs_author_username}" data-wxs_author_gender="${wxs_author_gender}" class="wxs_hide" title="Wykop X Mirkoukrywacz — ukryj"><span>Ukryj </span>🗙</button> `;
								}
							}

							// DODAJEMY KRAWĘŻNIK
							wxs_menu_action_box.innerHTML = wxs_menu_action_box_html;
							const sectionEntryHeaderElement = sectionObjectElement.querySelector("article > header");
							sectionEntryHeaderElement.parentNode.insertBefore(wxs_menu_action_box, sectionEntryHeaderElement);
						}



						// TODO
						// liczba komentarzy autora wpisu
						if (resource == "entry" && sectionObjectElement.classList.contains("detailed")) 						// jestesmy na stronie wpisu i ta sekcja to glowny wpis
						{
							const wxs_comments_count = sectionObjectElement.__vue__.item.comments.count;
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
				// ----- OBJECT IS NOT VISIBLE  -- SEKCJA ZNIKNĘŁA Z EKRANU
				else if (sectionObjectElement.classList.contains("isIntersecting"))
				{
					// consoleX(`section.entry NOT intersecting: ${id}`, 1)
					sectionObjectElement.classList.remove("isIntersecting", "plusesAdded", "plusesRemoved", "minusesAdded", "minusesRemoved");
					sectionObjectElement.classList.add("notIntersecting");
				}
			});
		};


		const sectionObjectIntersectionObserverOptions =
		{
			root: null,
			rootMargin: "0px 0px -50px 0px",	// rootMargin: "0px 0px -100px 0px",
			threshold: 0,
		};
		// powiekszenie wczytywania ponizej viewportu
		if (settings.intersectionObserverRootMargin) sectionObjectIntersectionObserverOptions.rootMargin = "0px 0px 700px 0px";
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
								.status: ["active"/"banned"/"suspended"]
								.username: "nick"
								.verified: false
		*/


		async function createInfoboxDivsForUserEverywhere(userDataObject, userNoteObject, username = userDataObject.username)
		{
			consoleX(`createInfoboxDivsForUserEverywhere(username: ${username})`, 1);

			let userInfoElementTitle = "";
			const a_usernameAll = document.querySelectorAll(`div.right div.tooltip-slot > span > a.username[href="/ludzie/${username}"]:not(:has([data-wxs_username]))`);
			let changeSexTo = false;
			if (userDataObject.changeSexTo) changeSexTo = userDataObject.changeSexTo;

			// const a_usernameAll = document.querySelectorAll(`section:is(.entry, .link-block):has(> article > header > div.right > div > div a.username[href="/ludzie/${username}"])`);
			// const a_usernameAll = document.querySelectorAll(`section[data-wxs_username="${username}"]`);
			// const a_usernameAll = document.querySelectorAll(`section.entry-voters > ul > li > a.username[href="/ludzie/${username}"]`);
			// if(dev) console.log(`--- username ${username}`);
			// if(dev) console.log(`--- a_usernameAll`);
			// if(dev) console.log(a_usernameAll);

			// informacja o użytkowniku pobrana z __vue__ lub fetch z API
			// DIV Z INFOBOXEM i NOTATKAMI
			let div = document.createElement('div');
			{
				div.classList = `wykopxs wxs_user_info wxs_user_info_year`;  					// <div class="wykopxs wxs_user_info wxs_user_info_year"

				let noteVarElement = null;
				let noteURLsElement = null;
				let infoboxInnerHTML = "";

				// XLABEL
				if (settings.wxsUserLabelsEnable)
				{
					if (userDataObject.changeSexTo == "male")
					{
						infoboxInnerHTML += `<span class="wxs_user_label wxs_user_label_fake_gender wxs_user_label_fake_female"><span>#falszywyrozowypasek</span></span>`;
					}
					else if (userDataObject.changeSexTo == "female")
					{
						infoboxInnerHTML += `<span class="wxs_user_label wxs_user_label_fake_gender wxs_user_label_fake_male"><span>#falszywyniebieskipasek</span></span>`;
					}
					if (userDataObject.wxsUserLabel)
					{
						infoboxInnerHTML += `<span class="wxs_user_label wxs_user_label_name"><span>${userDataObject.wxsUserLabel}</span></span>`;
					}
					if (userDataObject.wxsUserURL)
					{
						infoboxInnerHTML += `<span class="wxs_user_label wxs_user_label_url"><a href="${userDataObject.wxsUserURL}" target="_blank">www</a></span> `;
					}
				}


				// NOTATKI
				if (settings.notatkowatorEnable && userDataObject.note == true && userNoteObject)
				{
					// if(dev) console.log("NOTATKI 222: ")
					// if(dev) console.log("userDataObject.note")
					// if(dev) console.log(userDataObject.note);
					// if(dev) console.log("userNoteObject");
					// if(dev) console.log(userNoteObject);
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
					// if(dev) console.log("usernoteParsedToDisplay");
					// if(dev) console.log(usernoteParsedToDisplay);

					if (settings.notatkowatorVerticalBar)
					{
						let sepIndex = userNoteObject.usernote.indexOf("|");
						if (sepIndex != -1)
						{
							usernoteParsedToDisplay = `${usernoteParsedToDisplay.substring(0, sepIndex).trim()}...`;
							//let remainingPart = usernote.substring(sepIndex + 1).trim();
						}
					}

					noteVarElement = document.createElement('var');
					// <span class="wxs_user_info_usernote wxs_notatkowator_normal">
					// <span class="wxs_user_info_usernote wxs_notatkowator_r">
					noteVarElement.classList = `wxs_user_info_usernote`;

					if (userNoteObject.changeSexTo) changeSexTo = userNoteObject.changeSexTo;

					const plusWordsArray = getPlusWords(userNoteObject.usernote);
					plusWordsArray.forEach(plusWord =>
					{
						noteVarElement.classList.add(`wxs_notatkowator_${plusWord}`); // class="wxs_notatkowator_r"
					});


					if (settings.notatkowatorWebsiteURL)
					{
						const noteURLsArray = getURLsFromString(usernoteParsedToDisplay, false, false);
						if (noteURLsArray)
						{
							noteURLsElement = document.createElement('span');
							noteURLsElement.classList = `wxs_user_label wxs_user_info_usernote_url`;

							noteURLsArray.forEach((url) =>
							{
								noteURLsElement.innerHTML += `<a href="${url.startsWith('www.') ? 'https://' + url : url}" target="_blank">www</a>`;
								usernoteParsedToDisplay = usernoteParsedToDisplay.replace(url, "");
							})
						}
					}

					noteVarElement.innerHTML = `${usernoteParsedToDisplay}`;
					userInfoElementTitle += ` \n 𝗪𝘆𝗸𝗼𝗽 𝗫 𝗡𝗼𝘁𝗮𝘁𝗸𝗼𝘄𝗮𝘁𝗼𝗿 \n \n ${userNoteObject.usernote} \n \n`;
				}



				// INFOBOX
				if (settings.infoboxEnable)
				{
					userInfoElementTitle += ` \n 𝗪𝘆𝗸𝗼𝗽 𝗫 InfoBox \n Informacje o użytkowniku @${userDataObject.username} \n  \n `

					if (changeSexTo == "male") userInfoElementTitle += ` FAŁSZYWY RÓŻOWY PASEK \n  \n `;
					else if (changeSexTo == "female") userInfoElementTitle += ` FAŁSZYWY NIEBIESKI PASEK \n  \n `;


					if (userDataObject.wxsUserLabel) userInfoElementTitle += ` XLabel: ${userDataObject.wxsUserLabel} \n  \n `;

					// basic data without fetch
					if (userDataObject.blacklist == true) 											// basic
					{
						infoboxInnerHTML += `<var class="wxs_user_blacklist" title="@${userDataObject.username} jest na Twojej czarnej liście">🚯</var>`
					}
					if (userDataObject.follow == true) 												// basic
					{
						infoboxInnerHTML += `<var class="wxs_user_follow" title="Obserwujesz użytkownika @${userDataObject.username}">🔔</var>`
					}

					if (userDataObject.status == "banned" || userDataObject.status == "suspended") 						// basic
					{
						if (userDataObject.banned?.wxs_info_text_1) 													// DETAILS from API
						{
							if (settings.infoboxUserBannedEmoji) infoboxInnerHTML += `<var class="wxs_user_banned" title=" 🍌 ${userDataObject.banned.wxs_info_text_1}. \n \n ${userDataObject.banned.wxs_info_text_2} \n \n ${userDataObject.banned.wxs_info_text_3} \n \n">🍌</var>`;
							userInfoElementTitle += `  🍌 ${userDataObject.banned.wxs_info_text_1}. \n \n ${userDataObject.banned.wxs_info_text_2} \n \n ${userDataObject.banned.wxs_info_text_3} \n \n`;
						}
					}

					let memberSinceDate = null;
					let membersSinceInYears = null;
					let membersSinceInMonths = null;
					let membersSinceInDays = null;
					memberSinceDate = dayjs(userDataObject.member_since);
					membersSinceInYears = loadTime.diff(memberSinceDate, 'year');
					membersSinceInMonths = loadTime.diff(memberSinceDate, 'month');
					membersSinceInDays = loadTime.diff(memberSinceDate, 'day');

					if (settings.infoboxUserMemberSince)
					{
						if (userDataObject.member_since) // DETAILS from API
						{

							// wyświetlony obok nazwy użytkownika rok założenia konta
							if (membersSinceInDays < 32)
							{
								// konto zalozone dzisiaj
								if (membersSinceInDays == 0)
								{
									let membersSinceInHours = loadTime.diff(memberSinceDate, 'hour');
									let membersSinceInMinutes = loadTime.diff(memberSinceDate, 'minute');
									if (membersSinceInHours == 0)
									{
										infoboxInnerHTML += `<var class="wxs_user_member_since">Konto od ${membersSinceInMinutes} minut </var>`;
									}
									else
									{
										infoboxInnerHTML += `<var class="wxs_user_member_since">Konto od ${membersSinceInHours} h </var>`;
									}
								}
								// wczoraj
								else if (membersSinceInDays == 1)
								{
									infoboxInnerHTML += `<var class="wxs_user_member_since">Konto od wczoraj</var>`;
								}
								else
								{
									infoboxInnerHTML += `<var class="wxs_user_member_since">${membersSinceInDays} dni </var>`;
								}
							}
							// mniej niz 12 miesiecy
							else if (membersSinceInMonths < 12)
							{
								infoboxInnerHTML += `<var class="wxs_user_member_since">${membersSinceInMonths} mies. </var>`;
							}
							// ponad 11 miesiecy
							else
							{
								if (settings.infoboxUserMemberSinceYear) infoboxInnerHTML += `<var class="wxs_user_member_since">${memberSinceDate.year()}</var>`; // 2011
								else
								{
									if (membersSinceInYears >= 5) infoboxInnerHTML += `<var class="wxs_user_member_since">${membersSinceInYears} lat</var>`; // 5 lat
									else if (membersSinceInYears >= 2) infoboxInnerHTML += `<var class="wxs_user_member_since">${membersSinceInYears} lata</var>`; // 2 lata
									else if (membersSinceInYears == 1) infoboxInnerHTML += `<var class="wxs_user_member_since">1 rok</var>`; // 1 rok
								}

							}
						}
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
							userInfoElementTitle += `\n — ${userDataObject.summary.following_users} osób `;
							userInfoElementTitle += userDataObject.summary.following_tags > 0 ? `\n — ${userDataObject.summary.following_tags} #tagów  \n ` : `i nie obserwuje żadnych #tagów \n `;
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
				if (noteVarElement !== null) div.appendChild(noteVarElement);
				if (noteURLsElement !== null) div.appendChild(noteURLsElement);

				div.title = `${userInfoElementTitle} \n.`;
			}

			// if(dev) console.log("gotowy user infobox div:")
			// if(dev) console.log(div)

			// dołączenie info o użytkowniku do każdego wystąpienia jego nicka na stronie
			a_usernameAll.forEach((a_username) =>
			{
				// if(dev) console.log(`Dodaję infobox przy każdym linku a.username:`);
				// if(dev) console.log(a_username);
				// if(dev) console.log(a_username.parentNode.nodeName);
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

							// USER DATA BASIC
							sectionObjectElement.dataset.wxs_username = userDataObject.username; 					// <section data-wxs-username="NadiaFrance">
							sectionObjectElement.dataset.wxs_user_note = userDataObject.note;						// data-wxs_user_note="true"
							sectionObjectElement.dataset.wxs_user_company = userDataObject.company;					// 
							sectionObjectElement.dataset.wxs_user_status = userDataObject.status;					// data-wxs_user_status="banned" / "suspended"
							sectionObjectElement.dataset.wxs_user_color = userDataObject.color;						// data-wxs_user_color="orange"
							sectionObjectElement.dataset.wxs_user_verified = userDataObject.verified;				// data-wxs_user_verified="true"
							sectionObjectElement.dataset.wxs_user_blacklist = userDataObject.blacklist;				// data-wxs_user_blacklist="true"
							sectionObjectElement.dataset.wxs_user_follow = userDataObject.follow;					// data-wxs_user_follow="true"
							sectionObjectElement.dataset.wxs_user_gender = userDataObject.gender;					// data-wxs_user_gender="m"
							sectionObjectElement.dataset.wxs_user_online = userDataObject.online;					// data-wxs_user_online="true"
							sectionObjectElement.dataset.wxs_user_rank_position = userDataObject.rank?.position;	// data-wxs_user_rank_position=34 // "null"
							sectionObjectElement.dataset.wxs_user_rank_trend = userDataObject.rank?.trend;			// data-wxs_user_rank_trend=0

							if (settings.wxsUserLabelsEnable && userDataObject.wxsUserLabel)
							{
								sectionObjectElement.dataset.wxs_user_label = userDataObject.wxsUserLabel; // XLabel
							}

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


					//let div_tooltipSlot = a_username.closest("div.tooltip-slot");
					let userInfoboxDiv = div.cloneNode(true);
					// if(dev) console.log(`userInfoboxDiv`, userInfoboxDiv);
					// if(dev) console.log(`a_username`, a_username);
					// if(dev) console.log(`a_username.closest("div.right > div:has(a.username)")`, a_username.closest("div.right > div:has(a.username)"));


					a_username.closest("div.right > div:has(a.username)").appendChild(userInfoboxDiv);

					// if (div_tooltipSlot)
					// {
					// 	div_tooltipSlot.insertAdjacentElement('afterend', userInfoboxDiv);
					// }
					// else
					// {
					// 	a_username.title = userInfoElementTitle;
					// 	a_username.insertAdjacentElement('afterend', userInfoboxDiv);
					// }
				}


				// elementToInsertUserInfo.appendChild(div);
				// elementToInsertUserInfo.parentNode.insertBefore(div, elementToInsertUserInfo.nextSibling);

				// -- strona wpisu
				// — wpis:
				// section.entry.detailed 	> article 																													> header > div.right > div > div.tooltip-slot > span > a.username > span
				// section.entry.detailed 	> article 																													> header > div.right > div > span > a.current.active > time
				// — komentarze:
				// section.entry.detailed 	> div.comments > section.stream > div.content > section.entry.reply > article 												> header > div.right > div > div.tooltip-slot > span > a.username > span
				// section.entry.detailed 	> div.comments > section.stream > div.content > section.entry.reply > article 												> header > div.right > div > span > a > time


				// -- mikroblog wpisy i komentarze:											
				// — wpis: 											
				// section.entry 			> article 																													> header > div.right > div > div.tooltip.slot > span > a.username > span
				// section.entry 			> article 																													> header > div.right > div > span > a > time
				// — komentarze:											
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

				// strona PROFILU — naglowek profilu uzytkownika (brak .tooltip-slot)
				// main.main > aside.profile-top > section 																												> header > div > h1 > a.username > span
				// main.main > aside.profile-top > section 																												> header > div > time
			});
			div.remove();
		}









		/* ------------- NOTATKOWATOR ------------ */
		async function getUserNoteObjectByUsername(sectionObjectElement, username = sectionObjectElement.__vue__.item.author.username, forceAPICheck = false)
		{
			consoleX(`getUserNoteObjectByUsername(username: ${username}, forceAPICheck: ${forceAPICheck})`, 1)

			if (settings.notatkowatorEnable && (forceAPICheck || (sectionObjectElement && sectionObjectElement.__vue__.item.author.note)))
			{
				// consoleX(`getUserNoteObjectByUsername()`, 1);

				if (username)
				{
					let usernote = "";
					let userNoteObject = await localStorageNotatkowator.getItem(username);

					// consoleX(`getUserNoteObjectByUsername()`, 1);
					// if(dev) console.log(username);

					if (forceAPICheck == false)
					{
						// TODO check this

						if (userNoteObject == null || userNoteObject == "")
						{
							// if(dev) console.log("typeof userNoteObject", typeof userNoteObject)
							// if(dev) console.log(userNoteObject);

							const date2 = dayjs(userNoteObject.lastUpdate);

							//if (loadTime.diff(date2, "second") > parseFloat(settings.notatkowatorUpdateInterval * 3600))
							//{
							// userNoteObject = null; /* notatka jest zbyt stara */
							//}
							//else
							//{
							// mamy aktualną notatkę z localforage
							// consoleX(`Notatkowator wczytał notatkę z LocalStorage. Użytkownik: @${username}`);
							// if(dev) console.log("userNoteObject")
							// if(dev) console.log(userNoteObject)
							// if(dev) console.log("userNoteObject.usernote")
							// if(dev) console.log(userNoteObject.usernote)
							usernote = userNoteObject.usernote;

							return userNoteObject;
							//}
						}
					}

					if (usernote != "")
					{
						return userNoteObject;
					}

					else // Notatka z API — brak notatki o tym użytkowniku w localforage lub była zbyt stara lub forceAPICheck = true 
					{
						try
						{
							let jsonResponse = await getWykopAPIData("notes", username);
							usernote = jsonResponse?.data?.content;

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
									gender: "f" / "m" / null
									changeSexTo: "female" / "male"
								}
							*/

							userNoteObject =
							{
								username: jsonResponse?.data?.username,
								usernote: jsonResponse?.data?.content,
								gender: sectionObjectElement.__vue__.item.author,
								lastUpdate: dayjs()
							}

							const plusWordsArray = getPlusWords(userNoteObject.usernote);
							// if(dev) console.log("plusWordsArray")
							// if(dev) console.log(plusWordsArray)

							// dodane jakies +przełączniki
							if (plusWordsArray[0] != "normal")
							{
								const femaleChecklistArray = ["k", "f", "female", "kobieta", "dziewczyna", "dziewczynka", "girl", "baba", "różowa", "rozowa", "rózowa", "rożowa"];
								const maleChecklistArray = ["m", "mezczyzna", "mężczyzna", "męzczyzna", "meżczyzna", "male", "facet", "boy", "chlopak", "chłopak", "chłopiec", "chłop", "chlop", "niebieski"];
								const isFemale = plusWordsArray.filter(item => femaleChecklistArray.includes(item));
								const isMale = plusWordsArray.filter(item => maleChecklistArray.includes(item));

								if (isFemale.length >= 1) 					// różowy pasek 	// +k lub +f
								{
									userNoteObject.changeSexTo = "female";
									userNoteObject.gender = "f";
									//userDataObject.gender = "f";
								}
								else if (isMale.length >= 1) 				// niebieski pasek // +m
								{
									userNoteObject.changeSexTo = "male";
									userNoteObject.gender = "m";
									//userDataObject.gender = "m";
								}
							}


							// if(dev) console.log(jsonResponse);
							// if(dev) console.log("userNoteObject");
							// if(dev) console.log(userNoteObject);




							if (usernote != "" && userNoteObject.usernote != null && userNoteObject.usernote != "")
							{
								// if(dev) console.log(`API zwróciło ${userNoteObject.username} notatkę: ${userNoteObject.usernote}`);
								consoleData.notatkowator.count++;
								refreshConsole();

								// await displayUserNote(sectionObjectElement, usernote, username)

								if (localStorageNotatkowator)
								{
									localStorageNotatkowator.setItem(username, userNoteObject)
										.then(function (value)
										{
											consoleX(`Notatkowator zapisał notatkę o użytkowniku @${userNoteObject.username}: "${userNoteObject.usernote}"`, 1);
										})
										.catch(function (err)
										{
											consoleX(`Notatkowator = error: ` + err, 1);
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

			consoleX(`getUserDetailsForUsername(username: ${username}, forceAPICheck: ${forceAPICheck})`, 1)

			if (settings.infoboxEnable && username)
			{
				// consoleX(`getUserDetailsForUsername() ${username}`, 1);

				// if(dev) console.log(`user: ${username}: `)

				// jesli jest zbanowany lub chcemy wszystkie dane (np. followersi — wysylamy zapytanie do API)
				if (userDataObject.status == "banned" || userDataObject.status == "suspended" || forceAPICheck == true)
				{
					// if(dev) console.log("---- getUserDetailsForUsername — sprawdzanie użytkownika w API: " + username)
					try
					{
						// profile/users/{username}
						// profile/users/{username}/short
						// let jsonResponse = await getWykopAPIData("profile", "users", username, "short");
						let jsonResponse = await getWykopAPIData("profile", "users", username);
						if (jsonResponse.data)
						{
							let userDataObject = jsonResponse.data;

							// if(dev) console.log("userData fetched from API");
							// if(dev) console.log(userDataObject);
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
					// if(dev) console.log("---- getUserDetailsForUsername — zwracam danej użytkownika z vue: " + username)
					return userDataObject;
				}
			}
		}




		// wykop_xs_banned.user.js - START - 2
		if (settings.infoboxUserBannedInfoOnProfilePage)
		{
			waitForKeyElements("aside.profile-top:has(aside.info-box.red)", bannedUserProfileAside, false);

			// DODAJEMY INFO NA STRONIE PROFILOWEJ O SZCZEGÓŁACH BANA
			function bannedUserProfileAside(element)
			{
				const bannedUserObject = element?.__vue__?.user;

				if (!bannedUserObject) return;

				if (bannedUserObject.status == "banned" || bannedUserObject.status == "suspended")
				{
					bannedUserObject.banned.wxs_reason_lowercase = bannedUserObject.banned.reason.toLowerCase();

					bannedUserObject.banned.wxs_ban_end_date_string = bannedUserObject.banned.expired; 											// "2024-01-04 17:22:31" / null
					if (bannedUserObject.banned.wxs_ban_end_date_string != null)
					{
						bannedUserObject.banned.wxs_ban_end_date_object = dayjs(bannedUserObject.banned.wxs_ban_end_date_string);
						bannedUserObject.banned.wxs_ban_end_in_years = bannedUserObject.banned.wxs_ban_end_date_object.diff(loadTime, 'year');		// 5 > koniec bana za "5" lat
						bannedUserObject.banned.wxs_ban_end_in_months = bannedUserObject.banned.wxs_ban_end_date_object.diff(loadTime, 'month');	// 3 > koniec bana za: "3" miesiące
						bannedUserObject.banned.wxs_ban_end_in_days = bannedUserObject.banned.wxs_ban_end_date_object.diff(loadTime, 'day');		// 31 > koniec bana za 31 dni
						bannedUserObject.banned.wxs_ban_end_in_days = bannedUserObject.banned.wxs_ban_end_date_object.diff(loadTime, 'day');		// 31 > koniec bana za 31 dni
						// banEndDateDuration = banEndDateObject.toNow()

					}



					const bannedRedBox = element.querySelector("aside.info-box.red p");
					let bannedRedBoxInnerHTML = `To konto jest ${bannedUserObject.status == "suspended" ? "w trakcie usuwania" : "zbanowane"}. <br/><br/><strong>Informacja z Wykop X - Ban Info:</strong> <br/>`;

					// Ban permanentny
					if (bannedUserObject.status == "banned" && (bannedUserObject.banned.wxs_ban_end_date_string == null || bannedUserObject.banned.wxs_ban_end_in_years > 100))
					{
						bannedRedBoxInnerHTML = `To konto jest zbanowane permanentnie. <br/><br/><strong>Wykop XS Ban Info:</strong> <br/>`;
					}


					// "Użytkowniczka @NadiaFrance dsotała bana za naruszenie regulaminu"
					if (bannedUserObject.status == "suspended")
					{
						bannedRedBoxInnerHTML += `${bannedUserObject.gender == "f" ? "Użytkowniczka @" + bannedUserObject.username + " rozpoczęła usuwanie konta" : "Użytkownik @" + bannedUserObject.username + " rozpoczął usuwanie konta"}`;
					}
					else
					{
						bannedRedBoxInnerHTML += `${bannedUserObject.gender == "f" ? "Użytkowniczka @" + bannedUserObject.username + " dostała" : "Użytkownik @" + bannedUserObject.username + " dostał"} bana za <strong>${bannedUserObject.banned.wxs_reason_lowercase}</strong>`;
					}

					// Ban permanentny
					if (bannedUserObject.banned.wxs_ban_end_date_string == null || bannedUserObject.banned.wxs_ban_end_in_years > 100)
					{
						// Ban permanentny na 999 lat
						bannedRedBoxInnerHTML += `<br/><small>Ban permanentny. Śpij słodko aniołku [*] </small>`;
					}
					else
					{
						// "Koniec bana za 14 dni"
						bannedRedBoxInnerHTML += `<br/><small title="Czas końca bana dotyczy czasu letniego. \nWykop posiada błąd i nie rozpoznaje czasu zimowego, \ndlatego zimą i jesienią ban trwa o godzinę dłużej niż podany">
						Koniec bana ${bannedUserObject.banned.wxs_ban_end_in_years > 1 ? "za <strong>" + bannedUserObject.banned.wxs_ban_end_in_years + " lat(a)" : bannedUserObject.banned.wxs_ban_end_in_months > 1 ? "za <strong>" + bannedUserObject.banned.wxs_ban_end_in_months + " miesiące(ęcy)" : bannedUserObject.banned.wxs_ban_end_in_days > 1 ? "za <strong>" + bannedUserObject.banned.wxs_ban_end_in_days + " dni" : bannedUserObject.banned.wxs_ban_end_date_object.isSame(loadTime, 'day') == true ? " <strong>już dzisiaj!  " : " jutro"}</strong><br/>`;
						// "Ban trwa do 2024-12-12 23:59:59"
						bannedRedBoxInnerHTML += `Ban trwa do ${bannedUserObject.banned.wxs_ban_end_date_string}<span style="cursor: help; padding: 0px 7px">ℹ</span></small>`;
					}

					bannedRedBox.innerHTML = bannedRedBoxInnerHTML;
				}
			}
		}
		// wykop_xs_banned.user.js - END - 2




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
						// if(dev) console.log(`Notatkowator — dodaje notatkę: ${ username } / ${usernote}`);
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
			consoleX(`getObjectIdFromSectionObjectElement()`, 1);

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
			consoleX(`getTitleTextFromSectionObjectElement(charLimit: ${charLimit})`, 1);

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
			// console.clear();
			consoleX(`mirkoukrywaczBlockNewElement(blockingType: ${blockingType})`, 1);


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

				// if(dev) console.log("sectionObjectElement")
				// if(dev) console.log(sectionObjectElement);

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
						// if(dev) console.log(value);
					})
					.catch(function (err)
					{
						if (dev) console.log(`mirkoukrywaczBlockNewElement = error: ` + err);
					});
				// mirkoukrywaczHideAllBlockedElements();
			}
		}

		function mirkoukrywaczUnblockElement(sectionObjectElement = null, object_id = getObjectIdFromSectionObjectElement(sectionObjectElement))
		{
			// console.clear();
			if (dev) console.log(`mirkoukrywaczUnblockElement(${object_id})`)

			if (localStorageMirkoukrywacz)
			{
				localStorageMirkoukrywacz
					.getItem(object_id)
					.then(function (value)
					{
						if (dev) console.log("getItem: " + object_id)
						if (dev) console.log(value)

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
								if (dev) console.log(err);
							});
					})
			}
		}

		function mirkoukrywaczHideAllBlockedElements()
		{
			consoleX(`mirkoukrywaczHideAllBlockedElements()`, 1)
			if (localStorageMirkoukrywacz)
			{
				//consoleX(`mirkoukrywaczHideAllBlockedElements()`, 1);

				let hiddenElements = 0;
				let minimizedElements = 0;

				localStorageMirkoukrywacz.iterate(function (value, key, iterationNumber)
				{
					// if(dev) console.log("value");
					// if(dev) console.log(value);
					// if(dev) console.log("key");
					// if(dev) console.log(key);

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
					if (dev) console.log(err);
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
			consoleX(`mirkoukrywaczAppendOneElementToHideList(value: ${value}, key: ${key})`);

			if (!document.querySelector(`#wxs_modal .wykopx_mirkoukrywacz_list_of_hidden_items #wykopx_mirkoukrywacz_element_${key}`))
			{
				let hidden_element_html = `
				<div class="wykopx_mirkoukrywacz_element" id="wykopx_mirkoukrywacz_element_${key}">
					<div class="wykopx_mirkoukrywacz_unhide" data-object_id="${key}" title="Przestań ukrywać ten element">❌</div>
					<div class="wykopx_mirkoukrywacz_lp">${iterationNumber}</div>
					<div class="wykopx_mirkoukrywacz_text">${value.text}</div>
					<div class="wykopx_mirkoukrywacz_id">${key}</div>
					<div class="wykopx_mirkoukrywacz_resource">${value.resource}</div>
					<div class="wykopx_mirkoukrywacz_date">${dayjs(value.date).format("YYYY-MM-DD HH:mm")}</div>
					<div class="wykopx_mirkoukrywacz_blocking_type">${value.blockingType}</div>
				</div>`;
				document.querySelector("#wxs_modal .wykopx_mirkoukrywacz_list_of_hidden_items").innerHTML += hidden_element_html;
			}
		}

		function mirkoukrywaczRefreshHideList()
		{
			if (localStorageMirkoukrywacz)
			{
				consoleX(`mirkoukrywaczRefreshHideList()`, 1);

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
				consoleX(`createMenuItemForMirkoukrywacz()`, 1)

				if (document.getElementById("wxs_open_modal_mirkoukrywacz_button") == null)
				{
					createProfileDropdownMenuItem(
						{
							text: `Mirkoukrywacz: Wykop X`,
							title: "Wykop X — lista elementów ukrytych przez Mirkoukrywacz",
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
				consoleX(`createMenuItemForNotatkowator()`, 1)

				createProfileDropdownMenuItem(
					{
						text: `Notatki: Wykop X`,
						title: "Wykop X — Notatkowator — Twoje notatki do innych użytkowników",
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
				consoleX(`createModalBox()`, 1)

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

				body.insertAdjacentHTML('afterbegin', html);
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
				consoleX(`mirkoukrywaczRemoveTooOld()`, 1);

				let numberOfRemovedItems = 0;

				localStorageMirkoukrywacz.iterate(function (value, id, iterationNumber)
				{
					if (value.blockingType == options.blockingType || options.blockingType == "all") // "hidden", "minimized"
					{
						const itemDate = dayjs(value.date);
						const diffInDays = loadTime.diff(itemDate, 'day', true); // true — floating point

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
					if (dev) console.log(err);
				});
			}
		}











		/* AUTOMATYCZNIE POKAŻ CAŁOŚĆ DŁUGICH TREŚCI */
		function autoOpenMoreContentEverywhere()
		{
			if (settings.autoOpenMoreContentEverywhere)
			{
				consoleX("autoOpenMoreContentEverywhere()", 1)

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
				consoleX("autoOpenMoreContentEverywhere()", 1)

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


		/* Kliknięcie w stronę główną odświeża stronę główną */
		function topNavLogoClick()
		{
			if (settings.topNavLogoClick == "mikroblog")
			{
				consoleX(`topNavLogoClick()`, 1);

				refreshOrRedirectOnButtonClick(`body > section > header.header > div.left > a`, `/mikroblog`);
			}
			else if (settings.topNavLogoClick == "mikroblog_dodaj")
			{
				refreshOrRedirectOnButtonClick(`body > section > header.header > div.left > a`, `/mikroblog#dodaj`);
			}
		}
		/* Kliknięcie w stronę główną odświeża stronę główną */
		function topNavHomeButtonClickRefreshOrRedirect()
		{
			if (settings.topNavHomeButtonClickRefreshOrRedirect)
			{
				consoleX(`topNavHomeButtonClickRefreshOrRedirect()`, 1);
				refreshOrRedirectOnButtonClick(`body > section > header.header > div.left > nav.main > ul > li > a[href="/"]`, `/`);
			}
		}
		/* Kliknięcie w Mikroblog odświeża stronę */
		function topNavMicroblogButtonClickRefreshOrRedirect()
		{
			if (settings.topNavMicroblogButtonClickRefreshOrRedirect)
			{
				consoleX(`topNavMicroblogButtonClickRefreshOrRedirect()`, 1);

				refreshOrRedirectOnButtonClick(`body > section > header.header > div.left > nav.main > ul > li > a[href="/mikroblog"]`, `/mikroblog`);
			}
		}

		function refreshOrRedirectOnButtonClick(selector, pathToRefresh = "/")
		{
			consoleX(`refreshOrRedirectOnButtonClick(selector: ${selector}, pathToRefresh: ${pathToRefresh})`, 1)
			document.querySelectorAll(selector).forEach(function (element)
			{
				element.addEventListener('click', function (event)
				{
					event.preventDefault();
					let pathname = new URL(document.URL).pathname;
					if (pathname == pathToRefresh) window.location.reload();
					else window.location.href = pathToRefresh;
				});
			});
		}



		if (settings.categoryRedirectToMicroblogButtonEnable)
		{
			waitForKeyElements(`ul.categories`, categoryRedirectToMicroblogButton, false); // waitForKeyElements sends jNode object, not DOM object
		}

		// przyciski MIRKO w kategoriach
		function categoryRedirectToMicroblogButton(ul_category_element)
		{
			consoleX("categoryRedirectToMicroblogButton()", 1);

			/*
				"Najnowsze":"_mikroblog_najnowsze",
				"Ostatnio wybrane":"_mikroblog",
				"Aktywne":"_mikroblog_aktywne",
				"Gorące (2h)":"_mikroblog_gorace_2",
				"Gorące (6h)":"_mikroblog_gorace_6",
				"Gorące (12h)":"_mikroblog_gorace_12",
				"Gorące (24h)":"_mikroblog_gorace_24"
			*/
			if (document.querySelectorAll('section.links div.content ul.categories .wykopx_categories_microblog_a').length == 0)
			{
				let listItems = document.querySelectorAll('section.links div.content ul.categories li');
				listItems.forEach(function (item)
				{
					let kategoria = item.outerText;
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
					item.insertAdjacentHTML('afterend', microblogButtonHtml);
				});

			}

			if (document.querySelectorAll('section.links div.content ul.buckets .wykopx_categories_microblog_a').length == 0)
			{
				document.querySelectorAll('section.links div.content ul.buckets li').forEach(function (item)
				{
					let href = item.querySelector("a").getAttribute("href");
					href = href.replaceAll("/mikroblog", "");
					href += settings.categoryRedirectToMicroblogButtonFilter;
					const microblogButtonHtml = `<li class="wykopxs wykopx_categories_microblog_li"><a class="wykopxs wykopx_categories_microblog_a" href="${href}"></a></li>`;
					item.insertAdjacentHTML('afterend', microblogButtonHtml);
				});
			}

		}







		// otwieranie powiadomienia SPM w nowej karcie 
		// REMOVED in WykopXS 3.0
		/* if (wykopxSettings.getPropertyValue("--middleClickOpensNotificationsInNewTab"))
		{
			// środkowy przycisk na powiadomieniu otwiera je w nowej karcie 
			body.addEventListener('mousedown', function(e1) {
				if (e1.target.closest('section.notifications-stream section.notify') && e1.which === 2) {
					let target = e1.target;
					target.addEventListener('mouseup', function(e2) {
						if (e1.target === e2.target) {
							let url_to_open = target.querySelector('a[href^="/wpis/"]').getAttribute('href');
							let tab_handle = window.open(url_to_open, '_blank');
							// tab_handle.blur();  //window.focus();
							if (window.CustomEvent) {
								var e3 = new CustomEvent('middleclick', {bubbles: true, cancelable: true});
								e2.target.dispatchEvent(e3);
							} else if (document.createEvent) {
								var e3 = document.createEvent('HTMLEvents');
								e3.initEvent('middleclick', true, true);
								e2.target.dispatchEvent(e3);
							}
						}
					}, {once: true});
				}
			});
		}
		*/



		// otwieranie obrazka w nowej karcie klikając wybrany przycisk myszy	
		if (settings.mouseClickOpensImageInNewTab != "nie_otwieraj")
		{
			let detected_event_click;
			let event_trigger_type;

			if (settings.mouseClickOpensImageInNewTab == "lewy_przycisk_myszy")
			{
				detected_event_click = 1;
				event_trigger_type = "wykopx_leftclick";
			}
			if (settings.mouseClickOpensImageInNewTab == "srodkowy_przycisk_myszy")
			{
				detected_event_click = 2;
				event_trigger_type = "wykopx_middleclick";
			}
			if (settings.mouseClickOpensImageInNewTab == "prawy_przycisk_myszy")
			{
				detected_event_click = 3;
				event_trigger_type = "wykopx_rightclick";
			}
			body.addEventListener('mousedown', function (e1)
			{
				if (e1.which === detected_event_click && e1.target?.tagName === 'IMG' && e1.target?.src?.startsWith('https://wykop.pl/cdn/'))
				{
					const sectionEntryPhoto = e1.target.closest('section.entry section.entry-photo');

					if (sectionEntryPhoto)
					{
						e1.preventDefault();
						consoleX("Kliknięto przycisk myszy: " + e1.which, 1);

						e1.target.addEventListener('mouseup', function (e2)
						{
							e2.preventDefault();
							if (e1.target === e2.target)
							{
								let url_to_open = sectionEntryPhoto.querySelector('a[href^="https://wykop.pl/cdn/"]').getAttribute('href');
								window.open(url_to_open, '_blank');

								if (window.CustomEvent)
								{
									var e3 = new CustomEvent(event_trigger_type, { bubbles: true, cancelable: true });
									e2.target.dispatchEvent(e3);
								}
								else if (document.createEvent)
								{
									var e3 = document.createEvent('HTMLEvents');
									e3.initEvent(event_trigger_type, true, true);
									e2.target.dispatchEvent(e3);
								}
							}
						}, { once: true });
					}


				}



			});

		}












		/* checking for new versions */
		// getIntegerVersionNumber("2.50.3") -> 2503
		function getIntegerVersionNumber(versionString)
		{
			let arr = versionString.split(".");
			let result = arr[0] * 1000 + arr[1] * 10 + arr[2] * 1;
			return result;
		}


		async function checkVersionForUpdates()
		{
			// if (!dev) console.clear();
			consoleX("Sprawdzanie aktualizacji Wykop X Style i Wykop XS...");

			try
			{
				const response = await fetch(`https://update.wykopx.pl/xs/wykopxs?${currentVersion}`); // wykopxs?3.0.0
				const newestWykopXSVersion = await response.text();


				if (getIntegerVersionNumber(currentVersion) >= getIntegerVersionNumber(newestWykopXSVersion))
				{
					consoleX(`✅ Masz najnowszą wersję skryptu Wykop XS v.${currentVersion}`);
				}
				else
				{
					addWykopXSNewVersionAvailableToast();
					consoleX(`🆕 Dostępna jest nowa wersja Wykop XS v. ${newestWykopXSVersion} Możesz wejść na http://script.wykopx.pl i zaktualizować skrypt. Wersja, którą masz u siebie to Wykop XS v.${currentVersion}`);
				}
			}
			catch (error)
			{
			}

			if (settings.versor == "style" || settings.versor == "blank")
			{
				try
				{
					const response = await fetch(`https://update.wykopx.pl/xs/wykopx${settings.versor}?${settings.version}`); // wykopxstyle?3.0.0   | wykopxblank?3.0.0
					const newestWykopXStyleVersion = await response.text();

					if (getIntegerVersionNumber(settings.version) >= getIntegerVersionNumber(newestWykopXStyleVersion))
					{
						consoleX(`✅ Masz najnowszą wersję styli Wykop X ${capitalizeFirstLetter(settings.versor)} v.${settings.version}`);
					}
					else
					{
						addWykopXStyleNewVersionAvailableToast();
						consoleX(`🆕 Dostępna jest nowa wersja styli Wykop X ${capitalizeFirstLetter(settings.versor)} v.${newestWykopXStyleVersion} Możesz wejść na http://${settings.versor}.wykopx.pl i zaktualizować je.  Wersja, którą masz u siebie to Wykop X ${capitalizeFirstLetter(settings.versor)} v.${settings.version}`);
					}
				}
				catch (error)
				{
				}
			}
		}



		function hideWykopXSPromo()
		{
			consoleX("hideWykopXSPromo()", 1)

			let style = document.createElement('style');
			style.innerHTML = `body div.main-content section > section.sidebar::after { display: none !important; }`;
			head.appendChild(style);
		}

		function addWykopXPromoBanner()
		{
			consoleX("addWykopXPromoBanner()", 1)

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
			consoleX("addWykopXSNewVersionAvailableToast()", 1)


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
			document.querySelector('body > section > header.header').insertAdjacentHTML('afterend', wykopxsnewversionavailabletoast);
		}

		function addWykopXStyleNewVersionAvailableToast()
		{
			consoleX("addWykopXStyleNewVersionAvailableToast()", 1)

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
			consoleX("addWykopXBlockerNewVersionAvailableToast()", 1)

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
			consoleX(`countNumberOfNotificationsOnDesktop()`, 1)

			unreadNotifications.tags = unreadNotifications.tags_new_entry_with_observed_tag = unreadNotifications.tags_new_link_with_observed_tag = unreadNotifications.entries = unreadNotifications.pm = unreadNotifications.total = 0;

			let elements = document.querySelectorAll('header .right ul li.dropdown');
			elements.forEach(function (element)
			{
				element.classList.remove('unread_5', 'unread_4', 'unread_3', 'unread_2', 'unread_1');
			});



			let li_dropdown = document.querySelectorAll("header .right ul li.dropdown:has(a.new)");
			li_dropdown.forEach(function (dropdown)
			{

				const lastWord = dropdown.className.split(" ").pop();
				let numberOfNotifications = 0;
				let notifies = dropdown.querySelectorAll(".notify:not(.read)");
				notifies.forEach(function (notify)
				{
					++numberOfNotifications;
					notify.classList.add(`unread_${numberOfNotifications}`);
					if (lastWord == "tags")
					{
						++unreadNotifications["total"];
						if (notify.querySelector(`div.content p.new-entry-with-observed-tag`))
						{
							++unreadNotifications["tags_new_entry_with_observed_tag"];
							++unreadNotifications["tags"];
							++unreadNotifications["total"];
						} else if (notify.querySelector(`div.content p.new-link-with-observed-tag`))
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
				});
				let parentNotification = dropdown.closest(`.notifications.dropdown`);
				if (parentNotification)
				{
					parentNotification.classList.add(`unread_${numberOfNotifications}`);
				}
			});


			if (unreadNotifications["tags"] > 0)
			{
				consoleX(`Liczba nowych powiadomień z obserwowanych tagów: ${unreadNotifications["tags"]} (w tym ${unreadNotifications["tags_new_entry_with_observed_tag"]} z wpisów i ${unreadNotifications["tags_new_link_with_observed_tag"]} ze znalezisk)`, 1);
			}
			if (unreadNotifications["entries"] > 0)
			{
				consoleX(`Liczba nowych zawołań: ${unreadNotifications["entries"]}`, 1);
			}



			let li_pm_dropdown = document.querySelectorAll("header .right ul li.pm.dropdown");
			li_pm_dropdown.forEach(function (dropdown)
			{
				if (dropdown.querySelector('a.new'))
				{
					let numberOfNotifications = 0; // liczba powiadomień o wiadomościach PM
					let unreadItems = dropdown.querySelectorAll(".item.unread");
					unreadItems.forEach(function (item, index)
					{
						++numberOfNotifications;
						++unreadNotifications["total"];
						item.classList.add(`unread_${numberOfNotifications}`);
					});
					let parentDropdown = dropdown.closest(`.pm.dropdown`);
					if (parentDropdown)
					{
						parentDropdown.classList.add(`unread_${numberOfNotifications}`);
					}
					unreadNotifications["pm"] = numberOfNotifications;
					// if(dev) console.log(`Liczba nowych wiadomości: ${unreadNotifications["pm"]}`);
				}
			});


			if (unreadNotifications.tags > 0)
			{
				createProfileDropdownMenuItem(
					{
						text: `Powiadomienia z #tagów: (${unreadNotifications.tags < 25 ? unreadNotifications.tags : "25+"})`,
						title: "Masz nowe powiadomienia z obserwowanych #tagów",
						className: `wykopx_notifications_tags`,
						id: undefined,
						url: "/powiadomienia/tagi",
						target: "_self",
						icon: null,
						number: unreadNotifications.tags < 25 ? unreadNotifications.tags : "25+"
					})
			}
			if (unreadNotifications.entries > 0)
			{
				createProfileDropdownMenuItem(
					{
						text: `Zawołania w komentarzach: (${unreadNotifications.entries < 25 ? unreadNotifications.entries : "25+"})`,
						title: "Zawołano Cię w komentarzu",
						className: `wykopx_notifications_entries`,
						id: undefined,
						url: "/powiadomienia/moje",
						target: "_self",
						icon: null,
						number: unreadNotifications.entries < 25 ? unreadNotifications.entries : "25+"
					})
			}
			if (unreadNotifications.pm > 0)
			{
				createProfileDropdownMenuItem(
					{
						text: `Nowe wiadomości: (${unreadNotifications.pm < 25 ? unreadNotifications.pm : "25+"})`,
						title: "Masz nowe, nieprzeczytane wiadomości prywatne",
						className: `wykopx_notifications_pm`,
						id: undefined,
						url: "/wiadomosci",
						target: "_self",
						icon: null,
						number: unreadNotifications.pm < 25 ? unreadNotifications.pm : "25+"
					})
			}

			if (settings.tabChangeEnabled) executeTabAndFaviconChanges();
		}



		function addWykopXButtonsToNavBar()
		{
			consoleX("addWykopXButtonsToNavBar()", 1)

			// createNewNavBarButton({
			// 	position: "left",
			// 	text: "Czat",
			// 	title: `Otwórz mikroczat.pl ${promoString}`,
			// 	class: "open_mikroczat", // wykopx_open_mikroczat_li
			// 	hideWithoutXStyle: false,
			// 	url: mikroczatDomain,
			// 	target: "mikroczat",
			// 	icon: "https://i.imgur.com/9PvHlaA.png",
			// 	number: null,
			// })


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
					number: null,
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
					number: null,
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
					number: null,
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
					number: null,
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
					number: null,
					data: "data-v-5182b5f6",
					insertAfter: `li:has(a[href="/mikroblog"])`
				})
			}

			// TODO IF
			/* createNewNavBarButton({
				position: "left",
				text: "Wykop X Style",
				title: `Zainstaluj style CSS "𝗪𝘆𝗸𝗼𝗽 𝗫 𝗦𝘁𝘆𝗹𝗲" w rozszerzeniu Stylus i odkryj setki dodatkowych funkcji zmieniających i naprawiających Wykop`,
				class: ["promo", "install_wykopx"], // wykopx_promo (ukrywane przez X Style) wykopx_install_wykopx_li hybrid" | a > wykopx_promo wykopx_install_wykopx_button hybrid
				hideWithoutXStyle: false,
				url: "https://userstyles.world/search?q=Wykop+X+Style+3&category=&sort=mostinstalls",
				target: "_blank",
				icon: null,
				number: null,
				data: "data-v-5182b5f6",
			}) */

			addQuickLinksToNavBar();

		}


		// QUICK LINKS
		function addQuickLinksToNavBar()
		{
			consoleX("addQuickLinksToNavBar()", 1)

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
					<a href="/ludzie/${loggedUser.username}/znaleziska/dodane" target="_self">Moje znaleziska</a>
					<a href="/ludzie/${loggedUser.username}/znaleziska/komentowane" target="_self">Komentowane</a>
					<a href="/ludzie/${loggedUser.username}/znaleziska/wykopane" target="_self">Wykopane</a>
					<a href="/ludzie/${loggedUser.username}/znaleziska/zakopane" target="_self">Zakopane</a>
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

			<section>
				<span>Archiwum</span>
				<div>
					<a href="/hity/2020" target="_self">2020</a>
					<a href="/hity/2021" target="_self">2021</a>
					<a href="/hity/2022" target="_self">2022</a>
					<a href="/hity/2023" target="_self">2023</a>
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
					Moje Mirko
				</span>
				<div>
					<a href="/ludzie/${loggedUser.username}/wpisy/dodane" target="_self">Moje wpisy</a>
					<a href="/ludzie/${loggedUser.username}/wpisy/komentowane" target="_self">Komentowane</a>
					<a href="/ludzie/${loggedUser.username}/wpisy/plusowane" target="_self">Zaplusowane</a>
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
					<a href="/ludzie/${loggedUser.username}/wpisy/dodane" target="_self">Moje wpisy</a>
					<a href="/ludzie/${loggedUser.username}/wpisy/komentowane" target="_self">Moje komentarze</a>
					<a href="/ludzie/${loggedUser.username}/wpisy/plusowane" target="_self">Moje plusy</a>
				</div>
			</section>
			<section>
				<span>Znaleziska</span>
				<div>
					<a href="/ludzie/${loggedUser.username}/znaleziska/dodane" target="_self">Moje znaleziska</a>
					<a href="/ludzie/${loggedUser.username}/znaleziska/komentowane" target="_self">Moje komentarze</a>
					<a href="/ludzie/${loggedUser.username}/znaleziska/wykopane" target="_self">Wykopane</a>
					<a href="/ludzie/${loggedUser.username}/znaleziska/zakopane" target="_self">Zakopane</a>
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
					<a href="/ludzie/${loggedUser.username}" target="_self">Profil</a>
					<a href="/ludzie/${loggedUser.username}/znaleziska/dodane" target="_self">Dodane znaleziska</a>
					<a href="/ludzie/${loggedUser.username}/znaleziska/komentowane" target="_self">Komentowane znaleziska</a>
					<a href="/ludzie/${loggedUser.username}/znaleziska/wykopane" target="_self">Wykopane</a>
					<a href="/ludzie/${loggedUser.username}/znaleziska/zakopane" target="_self">Zakopane</a>
				</div>
			</section>
		</nav>

		<nav class="profile_entries">
			<section>
				<span>Mój profil</span>
				<div>
					<a href="/ludzie/${loggedUser.username}/wpisy/dodane" target="_self">Dodane wpisy</a>
					<a href="/ludzie/${loggedUser.username}/wpisy/komentowane" target="_self">Komentowane wpisy</a>
					<a href="/ludzie/${loggedUser.username}/wpisy/plusowane" target="_self">Zaplusowane</a>
				</div>
			</section>
		</nav>

		<nav class="profile_observed">
			<section>
				<span>Mój profil</span>
				<div>
					<a href="/ludzie/${loggedUser.username}/obserwowane/profile" target="_self">Obserwowani @użytkownicy</a>
					<a href="/ludzie/${loggedUser.username}/obserwowane/tagi" target="_self">Obserwowane #tagi</a>
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
		// number-nieuzwane
		function createNewNavBarButton(options)
		{
			consoleX(`createNewNavBarButton()`, 1)

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
			else nav_ul = document.querySelector("body header div.right nav ul"); // brak na wersji mobilnej

			if (nav_ul) 
			{
				let nav_ul_li = nav_ul.querySelector(`li.wykopx_${options.class}_li`);

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




		// returnWykopXSClassesString("klasa", "li") >> class="wykopx_klasa_li"
		// returnWykopXSClassesString(["klasa1", "klasa2"]) class="wykopx_klasa1 wykopx_klasa2"
		function addWykopXSClassesToElement(element, inputClassOrArray, suffix = null)
		{
			consoleX("addWykopXSClassesToElement()", 1)

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
		function createProfileDropdownMenuItem(options)
		{
			consoleX(`createProfileDropdownMenuItem()`, 1)

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
					number: options.number
				})
			}
		}


		// wyswietla sie tylko 25 powiadomien, wiec powinno byc 25+
		function addNotificationSummaryButtonToNavBar()
		{
			consoleX("addNotificationSummaryButtonToNavBar()", 1)

			let mojeLubTagi = document.querySelector('header .right ul li.account.dropdown ul.dropdown-body li.notifications.new a')?.getAttribute('href');

			let wykopx_notification_summary_url = "/powiadomienia/";
			if (typeof mojeLubTagi == "string")
			{
				mojeLubTagi = mojeLubTagi.split("/").pop();

				if (mojeLubTagi == "tagi")
				{
					createProfileDropdownMenuItem(
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
					createProfileDropdownMenuItem(
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
					createProfileDropdownMenuItem(
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
			topNavHeaderRightElement.insertAdjacentElement("afterbegin", li);
		}





		// TRYB NOCNY W BELCE NAWIGACYJNEJ
		function addNightModeButtonToNavBar()
		{
			if (settings.topNavNightSwitchButton)
			{
				consoleX("addNightModeButtonToNavBar()", 1)

				const wykopx_night_mode = `<li class="wykopxs wykopx_night_mode notifications dropdown" title="Przełącz pomiędzy trybem nocnym/dziennym ${promoString}"><a href="#"><figure></figure></a></li>`;
				topNavHeaderRightElement.insertAdjacentHTML('afterbegin', wykopx_night_mode);

				document.querySelector('.wykopx_night_mode').addEventListener('click', function ()
				{
					const currentMode = localStorage.getItem('nightMode');
					if (currentMode === null || currentMode === '0')
					{
						body.setAttribute('data-night-mode', 'true');
						localStorage.setItem('nightMode', 1);
						if (mikroczatWindow && mikroczatDomain) mikroczatWindow.postMessage({ type: "nightMode", value: 1 }, mikroczatDomain);
					}
					else
					{
						body.removeAttribute('data-night-mode');
						localStorage.setItem('nightMode', 0);
						if (mikroczatWindow && mikroczatDomain) mikroczatWindow.postMessage({ type: "nightMode", value: 0 }, mikroczatDomain);
					}
				});
			}
		}






		function addExtraButtons()
		{
			consoleX("addExtraButtons()", 1)

			/* Przyciski dodawane tylko na górną belkę nawigacyjną */
			const wykopx_wykopwnowymstylu_li = `<li class="wykopx_wykopwnowymstylu_li dropdown"><a href="/tag/wykopwnowymstylu" class="wykopx_wykopwnowymstylu_button" title="Przejdź na #wykopwnowymstylu"><span>#</span></a></li>`;
			const wykopx_microblog_mobile_li = `<li class="wykopx_microblog_mobile_li dropdown"><a href="/mikroblog" class="wykopx_microblog_mobile_button" title="Mikroblog ${promoString}"><figure> </figure></a></li>`;
			/* Te przyciski także na belce mobilnej */
			const wykopx_mywykop_mobile_li = `<li data-v-1adb6cc8 class="wykopx_mywykop_mobile_li dropdown"><a data-v-1adb6cc8 href="/obserwowane" class="wykopx_mywykop_mobile_button" title="Mój Wykop ${promoString}"><span data-v-1adb6cc8><i data-v-1adb6cc8>Mój Wykop</i></span></a></li>`;
			const wykopx_profile_mobile_li = `<li data-v-1adb6cc8 class="wykopx_profile_mobile_li dropdown ${loggedUser.username}"><a data-v-1adb6cc8 href="/ludzie/${loggedUser.username}" class="wykopx wykopx_profile_button" title="Przejdź na swój profil ${loggedUser.username} ${promoString}"><span data-v-1adb6cc8><i data-v-1adb6cc8>Profil</i></span></a></li>`;
			const wykopx_messages_mobile_li = `<li data-v-1adb6cc8 class="wykopx_messages_mobile_li dropdown"><a data-v-1adb6cc8 href="/wiadomosci" class="wykopx wykopx_messages_button" title="Wiadomości ${promoString}"><span data-v-1adb6cc8><i data-v-1adb6cc8>Wiadomości</i></span></a></li>`;
			const wykopx_notifications_mobile_li = `<li data-v-1adb6cc8 class="wykopx_notifications_mobile_li dropdown"><a data-v-1adb6cc8 href="/powiadomienia" class="wykopx wykopx_notifications_button" title="Powiadomienia ${promoString}"><span data-v-1adb6cc8><i data-v-1adb6cc8>Powiadomienia</i></span></a></li>`;

			if (topNavHeaderRightElement)
			{
				topNavHeaderRightElement.insertAdjacentHTML('beforeend', wykopx_wykopwnowymstylu_li);

				if (settings.topNavMicroblogButton) topNavHeaderRightElement.insertAdjacentHTML('beforeend', wykopx_microblog_mobile_li);

				if (user !== null)
				{
					if (settings.topNavMyWykopButton) topNavHeaderRightElement.insertAdjacentHTML('beforeend', wykopx_mywykop_mobile_li);
					if (settings.topNavMessagesButton) topNavHeaderRightElement.insertAdjacentHTML('beforeend', wykopx_messages_mobile_li);
					if (settings.topNavNotificationsButton) topNavHeaderRightElement.insertAdjacentHTML('beforeend', wykopx_notifications_mobile_li);
					if (settings.topNavProfileButton) topNavHeaderRightElement.insertAdjacentHTML('beforeend', wykopx_profile_mobile_li);
				}
			}

			/* dolna belka mobilna */
			if (settings.mobileNavBarHide == false)
			{
				const mobileNavbarUlElement = document.querySelector('body > section > nav.mobile-navbar > ul')
				if (mobileNavbarUlElement)
				{
					if (user !== null)
					{
						if (settings.mobileNavBarMyWykopButton) mobileNavbarUlElement.insertAdjacentHTML('beforeend', wykopx_mywykop_mobile_li);
						if (settings.mobileNavBarNotificationsButton) mobileNavbarUlElement.insertAdjacentHTML('beforeend', wykopx_notifications_mobile_li);
						if (settings.mobileNavBarMessagesButton) mobileNavbarUlElement.insertAdjacentHTML('beforeend', wykopx_messages_mobile_li);
						if (settings.mobileNavBarProfileButton) mobileNavbarUlElement.insertAdjacentHTML('beforeend', wykopx_profile_mobile_li);
					}
				}
			}
		}

		CSS += `
    /* ikona extra MW Mój Wykop w panelu powiadomień */

	header.header > .right > nav > ul > li
	{
		display: flex!important;
		height: 100%!important;
		justify-content: center;
		align-items: center;
	}

    ul > li.wykopx_microblog_mobile_li > a > figure,

    ul > li.wykopx_mywykop_mobile_li > a > span,
    ul > li.wykopx_profile_mobile_li > a > span,
    ul > li.wykopx_notifications_mobile_li > a > span,
    ul > li.wykopx_messages_mobile_li > a > span
    {
        display: flex!important;
        background-repeat: no-repeat;
        background-position: 0 10px;
        width: 20px;
        height: 100%;
    }
	ul > li.wykopx_microblog_mobile_li > a > figure
	{
		background-image: url('https://i.imgur.com/F8BqeCx.png');
	}
    
	/* mój wykop */
    ul > li.wykopx_mywykop_mobile_li > a > span
    {
        background-image: url('https://i.imgur.com/4oQuftz.png'); /* 20p */
        background-image: url('https://i.imgur.com/qtGPe78.png'); /* 20p */
        /*background-image: url('https://i.imgur.com/GoTmF0m.png');
          background-image: url('https://i.imgur.com/7DArcw6.png'); */
    }
    [data-night-mode] ul > li.wykopx_mywykop_mobile_li > a > span
    {
        background-image: url('https://i.imgur.com/qtGPe78.png');
    } 
	/* profile */
    ul > li.wykopx_profile_mobile_li > a > span
    {
        background-image: url('https://i.imgur.com/XD7q4hY.png'); /* black*/
        background-image: url('https://i.imgur.com/EpytPvb.png'); /* white*/
    }
    [data-night-mode] ul > li.wykopx_profile_mobile_li > a > span
    {
        background-image: url('https://i.imgur.com/EpytPvb.png');
    }
	/* wiadomosci */
    ul > li.wykopx_messages_mobile_li > a > span
    {
        background-image: url('https://i.imgur.com/Yx1ZAYt.png'); /* black*/
        background-image: url('https://i.imgur.com/dE4f85B.png'); /* white*/
    } 
    [data-night-mode] ul > li.wykopx_messages_mobile_li > a > figure
    {
        background-image: url('https://i.imgur.com/dE4f85B.png');
    } 

	/* powiadomienia */
	ul > li.wykopx_notifications_mobile_li > a > span
    {
        background-image: url('https://i.imgur.com/UpYMDtr.png');
    } 
	
	header.header > .right > nav > ul > li > a > span > i
	{
		display: none;
	}


	/* wykopwnowymstylu */
    header.header > .right > nav > ul > li.wykopx_wykopwnowymstylu_li > a > span
    {
        font-size: 1.2em;
        color: var(--x-inactive-button, rgba(255,255,255,0.3));
    } 
    header.header > .right > nav > ul > li.wykopx_wykopwnowymstylu_li > a:hover > span
    {
        color: white;
    }

    header.header > .right > nav > ul > li.wykopx_wykopwnowymstylu_li
    {
        display: none!important;
    }`;

		if (settings.topNavNightSwitchButton)
		{
			CSS += `
		/* PRZYCISK TRYB NOCNY W BELCE NAWIGACYJNEJ */
		

		header.header > .right > nav > ul > li.wykopx_night_mode figure
		{
			width: 20px!important;
			height: 20px!important;
			background: url("/static/img/svg/night-mode.svg") no-repeat center;
		} 

		[data-night-mode] header.header > .right > nav > ul > li.wykopx_night_mode figure
		{
			background: url("/static/img/svg/day-mode.svg") no-repeat center;
		} 
		`;
		}



		// DODAJ NOWY WPIS NA MIRKO /mikroblog/#dodaj
		function focusOnAddingNewMicroblogEntry()
		{
			consoleX(`focusOnAddingNewMicroblogEntry()`, 1)
			let wykop_url = new URL(document.URL);
			if (wykop_url.hash == "#dodaj")
			{
				// consoleX(`focusOnAddingNewMicroblogEntry()`, 1);
				document.querySelector(`section.microblog-page section.microblog section.editor div.content textarea`).focus();
			}
		}







		/* ------ TAB TITLE AND WEBSITE FAVICON CHANGES --------- */
		let pageTabTitleOriginal = document.title;
		let pageTabTitleProcessed = pageTabTitleOriginal;
		let tabTitles = new Map([
			["domyslny", "           "],
			["adres_url", "           "],
			["pusty_tytul", "ᅟᅟ"],
			["wlasny", settings.tabChangeTitleCustom],
			["wykop", "Wykop"],
			["wykopx", "Wykop X"],
			["digg", "News and Trending Stories Around the Internet | Digg"],
			["google", "Google"],
			["interia", "Interia — Polska i świat: informacje, sport, gwiazdy."],
			["onet", "Onet – Jesteś na bieżąco"],
			["reddit", "Reddit — Dive into anything"],
			["wp", "Wirtualna Polska — Wszystko co ważne"],
			["x", "Home / X"],
			["youtube", "YouTube"],
		])

		const defaultWykopFaviconURL = "https://wykop.pl/static/img/favicons/favicon.png";
		let tabFaviconsMap = new Map([
			["wykop", defaultWykopFaviconURL],
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
		let tabSuffixesMap = new Map([
			["domyslny", ":: Wykop.pl"],
			["dashwykoppl", "- Wykop.pl"],
			["dashwykop", "- Wykop"],
			["dashwykopx", "- Wykop X"],
			["", ""],
		])


		/*  TAB TITLE
			changeDocumentTitle()
			changeDocumentTitle("youtube")
			changeDocumentTitle("Example new title")
		*/


		function changeDocumentTitle(new_document_title)
		{
			consoleX(`changeDocumentTitle(${new_document_title})`, 1)

			// if(dev) console.log(`changeDocumentTitle() > start:  document.title:`);
			// if(dev) console.log(document.title);
			// if(dev) console.log(`changeDocumentTitle() > start:  pageTabTitleOriginal`);
			// if(dev) console.log(pageTabTitleOriginal);

			pageTabTitleProcessed = pageTabTitleOriginal;

			// sufix :: Wykop.pl
			if (settings.tabChangeTitleSuffix) pageTabTitleProcessed = pageTabTitleProcessed.replace(":: Wykop.pl", tabSuffixesMap.get(settings.tabChangeTitleSuffix));
			// prefix 
			if (settings.tabChangeTitlePrefix) pageTabTitleProcessed = `Wykop X - ${pageTabTitleProcessed}`;




			let tabTitleNotifications = "";

			if (settings.tabChangeTitleShowNotificationsEnabled == true)
			{
				let notificationsTotalCount = 0;

				let tabNotificationsSeparated = "";

				if (unreadNotifications["total"] > 0)
				{
					if (settings.tabChangeTitleShowNotificationsCountPM && unreadNotifications["pm"] > 0
						|| settings.tabChangeTitleShowNotificationsCountTagsNewLink && unreadNotifications["tags_new_link_with_observed_tag"] > 0
						|| settings.tabChangeTitleShowNotificationsCountTagsNewEntry && unreadNotifications["tags_new_entry_with_observed_tag"] > 0
						|| settings.tabChangeTitleShowNotificationsCountEntries && unreadNotifications["entries"] > 0)
					{
						let notificationsEmoji = "";

						if (settings.tabChangeTitleShowNotificationsCountPM && unreadNotifications["pm"] > 0)
						{
							notificationsTotalCount += unreadNotifications["pm"];
							notificationsEmoji = "✉"; // 🔗✉📧📩✉ 🖂 🖃 🖄 🖅 🖆
							tabNotificationsSeparated += `${notificationsEmoji}${unreadNotifications["pm"]} `;
						}

						if (settings.tabChangeTitleShowNotificationsCountEntries && unreadNotifications["entries"] > 0)
						{
							notificationsTotalCount += unreadNotifications["entries"];
							notificationsEmoji = "🕭"; // 🕭🔔
							tabNotificationsSeparated += `${notificationsEmoji}${unreadNotifications["entries"]} `;
						}

						if (unreadNotifications["tags"] && settings.tabChangeTitleShowNotificationsCountTagsNewLink || settings.tabChangeTitleShowNotificationsCountTagsNewEntry)
						{
							notificationsEmoji = "#"; // #🏷
							if (settings.tabChangeTitleShowNotificationsCountTagsNewLink && unreadNotifications["tags_new_link_with_observed_tag"] > 0)
							{
								notificationsTotalCount += unreadNotifications["tags_new_link_with_observed_tag"];
							}
							if (settings.tabChangeTitleShowNotificationsCountTagsNewEntry && unreadNotifications["tags_new_entry_with_observed_tag"] > 0)
							{
								notificationsTotalCount += unreadNotifications["tags_new_entry_with_observed_tag"];
							}
							tabNotificationsSeparated += `${notificationsEmoji}${unreadNotifications["tags"]} `;
						}

						if (settings.tabChangeTitleShowNotificationsCountSeparated)
						{
							tabTitleNotifications = tabNotificationsSeparated; // 📧 2 🔔 3 # 14
						}
						else
						{
							tabTitleNotifications = notificationsTotalCount; 	// 19
						}

						if (new_document_title == "pusty_tytul") // jesli pusty tytul — ikonki powiadomien bez nawiasow
						{
							tabTitleNotifications = `${tabTitleNotifications} `						// 📧 2 🔔 3 # 14 albo 19
						}
						else
						{
							tabTitleNotifications = `${tabTitleNotifications} | `					// 📧 2 🔔 3 # 14 |   albo  19 |
						}
					}
				}

			}

			let documentTitle = tabTitleNotifications;

			if (new_document_title != "domyslny")
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
				documentTitle += pageTabTitleProcessed;
			}
			document.title = documentTitle;
			// if(dev) console.log("changeDocumentTitle() > zmieniam document.title na: " + documentTitle);
		}


		// FAVICON ICO
		function changeDocumentFavicon(new_favicon = defaultWykopFaviconURL)
		{
			consoleX(`changeDocumentFavicon(new_favicon: "${new_favicon}")`, 1)
			let selectedFaviconURL = new_favicon;
			if (tabFaviconsMap.has(new_favicon)) selectedFaviconURL = tabFaviconsMap.get(new_favicon);

			// <link rel="icon" type="image/svg+xml" href="/static/img/favicons/favicon.svg">
			// <link rel="alternate icon" type="image/png" href="/static/img/favicons/favicon.png">
			const oldFaviconElement = head.querySelector('link[rel="icon"]');

			if (oldFaviconElement && !oldFaviconElement.href.startsWith(selectedFaviconURL))
			{
				head.removeChild(oldFaviconElement);
				const faviconLinkElement = document.createElement('link');
				faviconLinkElement.rel = 'icon';
				faviconLinkElement.type = 'image/x-icon'; // "image/svg+xml" "image/png"
				faviconLinkElement.href = selectedFaviconURL + '?=' + Math.random();
				head.appendChild(faviconLinkElement);
			}

			const alternateFaviconElement = head.querySelector('link[rel="alternate icon"]');
			if (alternateFaviconElement)
			{
				head.removeChild(alternateFaviconElement);
			}
		}



		function executeTabAndFaviconChanges()
		{
			consoleX(`executeTabAndFaviconChanges()`, 1);

			if (document.hidden || !settings.tabChangeOnlyOnHiddenState)
			{
				if (settings.tabChangeFaviconEnabled) changeDocumentFavicon(settings.tabChangeFaviconSelect);
				if (settings.tabChangeTitleEnabled) changeDocumentTitle(settings.tabChangeTitleSelect);
			}
		}



		// EVENT: KARTA JEST W TLE document.hidden == true
		// https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
		// https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event
		function browserTabVisibilityChanged()
		{
			consoleX(`browserTabVisibilityChanged() -> ${document.visibilityState}`, 1);

			// if(dev) console.log("browserTabVisibilityChanged(): " + document.visibilityState)
			// document.visibilityState > "visible"/"hidden"
			// document.hidden > true/false
			if (document.hidden == false)
			{
				if (settings.wxsArchiveXNewestEntry && (wxs_newest_entry == 1 || wxs_newest_entry == 3)) runWithDelay(3000, getNewestEntryFromAPI);
			}

			if (settings.tabChangeEnabled)
			{
				if (document.hidden)
				{
					executeTabAndFaviconChanges();
					// if(dev) console.log(`document.hidden -> true > document.visibilityState: ${document.visibilityState}`);
				}
				else
				{
					if (settings.tabChangeOnlyOnHiddenState)
					{
						if (settings.tabChangeTitleEnabled) changeDocumentTitle(pageTabTitleOriginal);
						if (settings.tabChangeFaviconEnabled) changeDocumentFavicon();
					}
				}
			}

		}
		// EVENT LISTENER
		document.addEventListener("visibilitychange", browserTabVisibilityChanged, false); // ICO PNG GIF JPEG SVG




		// TITLE MUTATION
		let titleMutationObserver = new MutationObserver(mutationsList =>
		{
			if (dev) console.log("titleMutationObserver ->")
			if (dev) console.log(mutationsList);

			for (let mutation of mutationsList)
			{
				if (mutation.type === 'childList')
				{
					let mutatedTitle = mutation.addedNodes[0].textContent;
					consoleX(`titleMutationObserver -> Nowy tytuł strony: ${mutatedTitle}`, 1);

					// if (mutatedTitle.endsWith(":: Wykop.pl"))
					// {
					// 	pageTabTitleOriginal = mutatedTitle;
					// 	if(dev) console.log(`mutatedTitle.endsWith(":: Wykop.pl")`);
					// }

					// if (!mutatedTitle.includes(specialCharacter)) // tytul nie zostal jeszcze zmieniony i dodane są liczby powiadomien zeby sie nie powtarzalo (1)(1)
					// {
					// 	pageTabTitleProcessed = mutatedTitle;
					// 	// if(dev) console.log(`!mutatedTitle.includes("specialCharacter")`);
					// }

					// titleMutationObserver.disconnect();
					// executeTabAndFaviconChanges();
					// titleMutationObserver.observe(document.querySelector('title'), { childList: true, })
					// if(dev) console.log("pageTabTitleProcessed: " + pageTabTitleProcessed)
				}
			}
		});
		// MUTATION OBSERVER
		titleMutationObserver.observe(document.querySelector('title'), { childList: true, })





		// PLUSES OBSERVER
		function getVotesObject(sectionObjectElement, ratingBoxSection)
		{
			consoleX(`getVotesObject()`, 1);

			/* returns:
		
			{
				separated: false,
		
				votesUp: 50,
				votesUpPercent: 100,
				votesDown: 5,
				votesDownPercent: 0,
				
				votesCount: 45,
				votesAll: 55,
				voted: 0
		
				votesUpPrevious: 49
				votesDownPrevious: 4,
				plusesDelta: 1
				minusesDelta: 1
		
				commentsCount: 100,	// liczba komentarzy dla znalezisk, wpisów i main-comments pod znaleziskami
				commentsHot: true // dla gorących znalezisk 
			}
		
			{
				resource: "link"
				sectionObjectElement: <DOMElement>,
				ratingBox: <DOMElement>,
				link: <DOMElement>,
				id: 123456,
				link_id: 123456,
			}
		
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

			let votesObject =
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
				voted: 0,

				commentsCount: 0,
				commentsHot: false,
			};


			votesObject.sectionObjectElement = sectionObjectElement; 								// returns the section element above .rating-box
			votesObject.ratingBoxSection = ratingBoxSection; 										// returns .rating-box section

			//blocks.id = blocks.sectionObjectElement.__vue__.item.id;
			votesObject.id = ratingBoxSection.__vue__.id;
			votesObject.separated = ratingBoxSection.__vue__.separated;
			votesObject.votesUp = ratingBoxSection.__vue__.up;

			if (dev) console.log(votesObject.votesUp)
			votesObject.votesDown = ratingBoxSection.__vue__.down;

			votesObject.votesCount = votesObject.votesUp - votesObject.votesDown;				// -10 (suma plusów i minusów nie dotyczy entry, entry_comment)
			votesObject.votesAll = votesObject.votesUp + votesObject.votesDown;				// 30  (łączna liczba głosów nie dotyczy entry, entry_comment)

			votesObject.votesDownPercent = Math.ceil(votesObject.votesDown * 100 / votesObject.votesAll);											// nie dotyczy entry, entry_comment
			votesObject.votesUpPercent = Math.ceil(votesObject.votesUp * 100 / votesObject.votesAll);											// nie dotyczy entry, entry_comment zawsze 100%

			votesObject.voted = ratingBoxSection.__vue__.voted;


			/*  
				block.commentsCount 
				__vue__.item.comments = 
		
				- znalezisko na stronie głównej i stronie znaleziska 
				comments = { count: 42, hot: false }
				
				- na stronie mikrobloga i wpisie (na stronie Mikrobloga Array[2])
				comments = { count: 142, items: Array[50] }
		
				komentarze nie mają "comments"
			*/

			if (votesObject?.sectionObjectElement?.__vue__?.item?.comments?.count) votesObject.commentsCount = votesObject.sectionObjectElement.__vue__.item.comments.count;
			if (votesObject?.sectionObjectElement?.__vue__?.item?.comments?.hot) votesObject.commentsHot = votesObject.sectionObjectElement.__vue__.item.comments.hot;


			if (votesObject.sectionObjectElement.__vue__.item.resource == "link") // znalezisko
			{
				votesObject.resource = "link";
				votesObject.fetchURL = `https://wykop.pl/api/v3/links/${votesObject.id}`; // TODO

				votesObject.link_id = votesObject.id;
				votesObject.link = votesObject.sectionObjectElement; 		// parent = this
				votesObject.parent_element = votesObject.sectionObjectElement; 		// parent = this
				votesObject.parent_id = votesObject.id;
				votesObject.sectionObjectElement.dataset.wxs_resource = "link";
			}
			else
			{
				if (votesObject.sectionObjectElement.__vue__.item.resource == "link_comment")
				{
					votesObject.comment_element = votesObject.sectionObjectElement;

					if (votesObject.comment_element.__vue__.item.parent.resource == "link_comment") // subkomentarz
					{
						votesObject.resource = "link_subcomment";
						votesObject.comment_element.dataset.wxs_resource = "link_subcomment";

						votesObject.comment_id = votesObject.comment_element.__vue__.item.id;
						votesObject.parent_id = votesObject.comment_element.__vue__.item.parent.link.id; 	// id znaleziska
						votesObject.parent_comment_id = votesObject.comment_element.__vue__.item.parent.id; // id nadkomentarza
						votesObject.parent_element = document.getElementById(`comment-${votesObject.parent_comment_id}`) // nadkomentarz
						votesObject.fetchURL = `https://wykop.pl/api/v3/links/${votesObject.parent_id}/comments/${votesObject.parent_comment_id}/comments`; // TODO
					}
					else
					{
						votesObject.resource = "link_comment";
						votesObject.comment_element.dataset.wxs_resource = "link_comment";
						votesObject.comment_id = votesObject.comment_element.__vue__.item.id;
						votesObject.parent_id = votesObject.comment_element.__vue__.item.parent.id;
						votesObject.parent_element = document.getElementById(`link-${votesObject.parent_id}`) // section.link-block
						votesObject.fetchURL = `https://wykop.pl/api/v3/links/${votesObject.parent_id}/comments/${votesObject.comment_id}`;

					}
				}
				// KOMENTARZ POD WPISEM
				else if (votesObject.sectionObjectElement.__vue__.item.resource == "entry_comment")
				{
					votesObject.comment_element = votesObject.sectionObjectElement;

					if (votesObject.comment_element.parentNode)
					{
						votesObject.resource = "entry_comment"; 								// komentarz pod wpisem
						votesObject.comment_element.dataset.wxs_resource = "entry_comment";
						votesObject.parent_element = votesObject.comment_element.parentNode.closest('section.entry');
						votesObject.parent_id = votesObject.parent_element.__vue__.item.id;
						votesObject.comment_id = votesObject.comment_element.__vue__.item.id;
						votesObject.fetchURL = `https://wykop.pl/api/v3/entries/${votesObject.parent_id}/comments/${votesObject.comment_id}`;
					}
					else
					{
						return null;
					}
				}
				// WPIS NA MIKROBLOGU
				else if (votesObject.sectionObjectElement.__vue__.item.resource == "entry")
				{
					votesObject.parent_element = votesObject.sectionObjectElement; 	// parent = this
					votesObject.parent_id = votesObject.id;
					votesObject.resource = "entry";
					votesObject.fetchURL = `https://wykop.pl/api/v3/entries/${votesObject.id}`;
					votesObject.parent_element.dataset.wxs_resource = "entry";
				}
			}


			// votesObject.sectionObjectElement.dataset.wxs_votes_up = votesObject.votesUp;			// <section data-wxs_votes_up="1" data_wxs_votes_down="8">
			// votesObject.sectionObjectElement.dataset.wxs_votes_down = votesObject.votesDown;

			if (dev) console.log("votesObject");
			if (dev) console.log(votesObject);

			return votesObject;
		}








		function checkPluses(sectionObjectElement, ratingBoxSection, showUpdatedValues = true)
		{
			// console.clear();
			consoleX(`checkPluses(showUpdatedValues: ${showUpdatedValues})`, 0);

			if (sectionObjectElement == null && ratingBoxSection?.__vue__?.$parent)
			{
				if (ratingBoxSection?.__vue__?.$parent.item.resource == "link")
				{
					sectionObjectElement = ratingBoxSection.closest("section.link-block")
				}
				else
				{
					sectionObjectElement = ratingBoxSection.closest("section.entry")
				}
			}


			if (sectionObjectElement && sectionObjectElement.__vue__ && sectionObjectElement.__vue__.item.deleted == null)
			{
				if (!ratingBoxSection)
				{
					if (sectionObjectElement.__vue__.item.resource == "link")
					{
						ratingBoxSection = sectionObjectElement.querySelector("section.vote-box");
					}
					else
					{
						ratingBoxSection = sectionObjectElement.querySelector("section.rating-box");
					}
				}

				if (dev) console.log("checkPluses() -> sectionObjectElement: ", sectionObjectElement)
				if (dev) console.log("checkPluses() -> ratingBoxSection: ", ratingBoxSection)

				const votesObject = getVotesObject(sectionObjectElement, ratingBoxSection);

				if (votesObject) // TODO subkomentarze
				{
					if (dev) console.log("checkPluses() -> votesObject", votesObject);

					// let sectionObjectElement = votesObject.sectionObjectElement;
					sectionObjectElement.classList.remove("plusesAdded", "plusesRemoved", "minusesAdded", "minusesRemoved");

					sectionObjectElement.style.removeProperty('--plusesAdded');
					sectionObjectElement.style.removeProperty('--plusesRemoved');
					sectionObjectElement.style.removeProperty('--minusesAdded');
					sectionObjectElement.style.removeProperty('--minusesRemoved');

					fetch(votesObject.fetchURL,
						{
							method: "GET",
							headers: {
								"Content-Type": "application/json",
								Authorization: "Bearer " + window.localStorage.token,
							},
						})
						.then(x => x.json())
						.then(data =>
						{
							if (!data.data) return false;

							let data_fetched;
							if (Array.isArray(data.data) && data.data.length > 0) data_fetched = data.data.find(item => item.id === votesObject.id); // array from subcomments /api/v3/links/a/comments/b/comments => [array of subcomment objects]
							else if (data.data && data.data.id === votesObject.id) data_fetched = data.data;
							else { return false; }

							if (dev) console.log(`checkPluses() -> data_fetched from ${votesObject.fetchURL}`, data_fetched);

							votesObject.votesUpPrevious = votesObject.votesUp; 			// sectionObjectElement.dataset.wxs_votes_up;
							votesObject.votesDownPrevious = votesObject.votesDown; 		// sectionObjectElement.dataset.wxs_votes_down;

							votesObject.votesUp = data_fetched.votes.up;
							votesObject.votesDown = data_fetched.votes.down;
							votesObject.votesCount = data_fetched.votes.up - data_fetched.votes.down; 					// -10 (suma plusów i minusów nie dotyczy entry, entry_comment)
							votesObject.votesAll = data_fetched.votes.up + data_fetched.votes.down; 					// 30  (liczba głosów nie dotyczy entry, entry_comment)
							votesObject.votesUpPercent = 0;																// nie dotyczy entry, entry_comment zawsze 100%
							votesObject.votesDownPercent = 0;															// nie dotyczy entry, entry_comment

							if (data_fetched?.comments?.count) votesObject.commentsCount = data_fetched.comments.count;
							if (data_fetched?.comments?.hot) votesObject.commentsHot = data_fetched.comments.hot;

							// ile plusów przybyło/ubyło od ostatniego sprawdzenia
							votesObject.plusesDelta = votesObject.votesUp - votesObject.votesUpPrevious;
							votesObject.minusesDelta = votesObject.votesDown - votesObject.votesDownPrevious;
							votesObject.votesCountChanged = (votesObject.plusesDelta != 0 || votesObject.minusesDelta != 0);


							// if(dev) console.log("dataset.votesup: " + sectionObjectElement.dataset.wxs_votes_up + " / votesObject.plusesDelta: " + votesObject.plusesDelta)
							// if(dev) console.log("sectionObjectElement.dataset")
							// if(dev) console.log(sectionObjectElement.dataset)
							// if(dev) console.log(sectionObjectElement)

							// ZMIENIŁA SIĘ LICZBA PLUSÓW / WYKOPÓW
							if (votesObject.votesCountChanged)
							{
								//alert("votesCountChanged")
								if (dev) console.log("checkPluses() -> --------------------");
								if (dev) console.log("checkPluses() -> VOTES COUNT CHANGED", sectionObjectElement)


								sectionObjectElement.dataset.wxs_votes_up = votesObject.votesUp;				//  10
								sectionObjectElement.dataset.wxs_votes_down = votesObject.votesDown;			//  20  — dodatnia nie dotyczy entry, entry_comment
								sectionObjectElement.dataset.wxs_votes_count = votesObject.votesCount;			// -10 (suma plusów i minusów nie dotyczy entry, entry_comment)
								sectionObjectElement.dataset.wxs_votes_all = votesObject.votesAll; 				//  30  (łączna liczba głosów nie dotyczy entry, entry_comment)
								sectionObjectElement.dataset.wxs_voted = votesObject.voted;						// czy zaglosowano
								sectionObjectElement.dataset.wxs_votes_separated = votesObject.separated || true;

								updateFetchedVotesData(sectionObjectElement, votesObject, showUpdatedValues);
							}
						});
				}
			}
		}

		function updateFetchedVotesData(sectionObjectElement, votesObject, showUpdatedValues = true, onlyPluses = false)
		{
			consoleX(`updateFetchedVotesData() -> updateVisibleLinkVotesCount(showUpdatedValues: ${showUpdatedValues}, onlyPluses: ${onlyPluses})`, 1);

			let ratingBoxSection;
			let ratingBoxVotesUpCountElement;
			let ratingBoxVotesDownCountElement;
			let ratingBoxVotesDownPercentElement;
			let ratingBoxVotesPerHourElement;

			if (sectionObjectElement.__vue__.item.resource == "link")
			{
				ratingBoxSection = sectionObjectElement.querySelector("section.vote-box");

				ratingBoxVotesUpCountElement = ratingBoxSection.querySelector("div.dig > p > span");
				ratingBoxVotesDownCountElement = ratingBoxSection.querySelector(".wykopx_votesDownCount");
				ratingBoxVotesDownPercentElement = ratingBoxSection.querySelector(".wykopx_votesDownPercent");
				ratingBoxVotesPerHourElement = ratingBoxSection.querySelector(".wxs_votes_per_hour");
			}
			else
			{
				ratingBoxSection = sectionObjectElement.querySelector("section.rating-box");
				sectionObjectElement.dataset.wxs_votes_separated = ratingBoxSection.__vue__.separated;

				if (ratingBoxSection.__vue__.separated)
				{
					ratingBoxVotesUpCountElement = ratingBoxSection.querySelector("li.plus");	// li.plus.zero
					ratingBoxVotesDownCountElement = ratingBoxSection.querySelector("li.minus"); // tylko przy komentarzach pod znaleziskiem
				}
				else
				{
					ratingBoxVotesUpCountElement = ratingBoxSection.querySelector("ul > li");
				}

				ratingBoxVotesPerHourElement = ratingBoxSection.querySelector(".wxs_votes_per_hour");
			}



			if (!votesObject && ratingBoxSection)
			{
				votesObject = getVotesObject(sectionObjectElement, ratingBoxSection);
			}



			// VOTES PER HOUR CALCULATION
			if ((votesObject.resource == "link" && settings.checkLinkVotesEnable && settings.checkLinkVotesPerHour)
				|| (votesObject.resource != "link" && settings.checkEntryPlusesEnable && settings.checkEntryPlusesPerHour))
			{
				const timeSinceFirtsLoad = (dayjs().valueOf() - sectionObjectElement.dataset.wxs_first_load_time) / 1000; // liczba sekund od zaladowania strony

				if (timeSinceFirtsLoad > votesFetchingFirstDelayInSeconds + 5)
				{
					let votesPerHour = (votesObject.votesCount - sectionObjectElement.dataset.wxs_first_load_votes_count) * 3600 / timeSinceFirtsLoad;
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
						let suffix_text;

						if (votesObject.resource == "link")
						{
							suffix_text = "/h";
							votesPerHour = votesPerHour.toFixed(0);
						}
						else
						{
							suffix_text = " plusa / h";
							votesPerHour = votesPerHour.toFixed(1);
						}

						//votesPerHour = Math.round(votesPerHour)
						votesPerHourString = `${votesPerHour}${suffix_text}`;
					}

					if (ratingBoxVotesPerHourElement) ratingBoxVotesPerHourElement.dataset.wxs_votes_per_hour = votesPerHourString; // data-wxs_votes_per_hour
				}
			}

			// VOTES DOWN PERCENT
			if (votesObject.votesAll > 0)
			{
				votesObject.votesDownPercent = Math.ceil(votesObject.votesDown * 100 / votesObject.votesAll);

				sectionObjectElement.dataset.wxs_votes_down_percent = votesObject.votesDownPercent;


				if (ratingBoxVotesDownPercentElement) 
				{
					ratingBoxVotesDownPercentElement.dataset.wxs_votes_down_percent = votesObject.votesDownPercent;
					ratingBoxVotesDownPercentElement.textContent = `(${votesObject.votesDownPercent}%)`;
				}
			}

			// COMMENTS COUNT
			// if (votesObject.resource == "link" || votesObject.resource == "entry" || votesObject.resource == "link_comment")
			// {
			// 	sectionObjectElement.dataset.wxs_comment_count = votesObject.commentsCount;
			// }

			// if(dev) console.log("votesObject:");
			// if(dev) console.log(votesObject);
			// if(dev) console.log("sectionObjectElement.dataset:");
			// if(dev) console.log(sectionObjectElement.dataset);




			if (onlyPluses == false)
			{
				const votesDown = sectionObjectElement.dataset.wxs_votes_down;
				sectionObjectElement.style.setProperty('--votesDown', `"${settings.prefixBeforeMinusesCount}` + votesDown + `"`);
				// zbytek
				let minusLi = sectionObjectElement.querySelector("section.rating-box > ul > li.minus");
				if (minusLi) minusLi.textContent = votesDown;
			}



			// PRZYBYŁY PLUSY
			if (votesObject.plusesDelta != 0)
			{
				ratingBoxVotesUpCountElement.dataset.wxs_votes_up = votesObject.votesUp;

				if (votesObject.resource == "link")
				{
					ratingBoxVotesUpCountElement.textContent = votesObject.votesUp;
				}
				else 
				{
					const separated = sectionObjectElement.dataset.wxs_votes_separated || true;
					let votesCountDisplayValue = ((separated === "true" || separated === true) ? votesObject.votesCount : votesObject.votesUp);
					if (votesCountDisplayValue > 0) votesCountDisplayValue = `${settings.prefixBeforePlusesCount}${votesCountDisplayValue}`
					else if (votesCountDisplayValue < 0) votesCountDisplayValue = `${settings.prefixBeforeMinusesCount}${votesCountDisplayValue}`;


				}

				if (votesObject.plusesDelta > 0)
				{
					sectionObjectElement.classList.add("plusesAdded");
					ratingBoxSection.dataset.wxs_pluses_delta = `+${votesObject.plusesDelta}`;
					//sectionObjectElement.style.setProperty('--plusesAdded', `"+${votesObject.plusesDelta}"`);
				}
				else
				{
					sectionObjectElement.classList.add("plusesRemoved");
					ratingBoxSection.dataset.wxs_pluses_delta = `${votesObject.plusesDelta}`;
					//sectionObjectElement.style.setProperty('--plusesRemoved', `"${votesObject.plusesDelta}"`); // jest z minusem
				}
			}

			// PRZYBYŁY MINUSY POD KOMENTARZEM W ZNALEZISKU
			if (votesObject.minusesDelta != 0 && ratingBoxVotesDownCountElement)
			{
				ratingBoxVotesDownCountElement.dataset.wxs_votes_down = votesObject.votesDown;

				if (votesObject.resource == "link")
				{
					ratingBoxVotesDownCountElement.textContent = votesObject.votesDown;
				}
				else 
				{
					const separated = sectionObjectElement.dataset.wxs_votes_separated || true;
					if (separated) // minusy i plusy są osobno, więc zmieniamy minusy
					{
						let votesCountDisplayValue = votesObject.votesDown;
						if (votesCountDisplayValue < 0) votesCountDisplayValue = `${settings.prefixBeforeMinusesCount}${votesCountDisplayValue}`;
						ratingBoxVotesDownCountElement.textContent = votesCountDisplayValue;
					}
					else // minusy i plusy są razem, więc zmieniamy plusy
					{
						let votesCountDisplayValue = votesObject.votesCount;
						if (votesCountDisplayValue > 0) votesCountDisplayValue = `${settings.prefixBeforePlusesCount}${votesCountDisplayValue}`
						else if (votesCountDisplayValue < 0) votesCountDisplayValue = `${settings.prefixBeforeMinusesCount}${votesCountDisplayValue}`;
						ratingBoxVotesUpCountElement.textContent = votesCountDisplayValue;
					}

				}


				if (votesObject.minusesDelta > 0)
				{
					sectionObjectElement.classList.add("minusesAdded");
					ratingBoxSection.dataset.wxs_minuses_delta = `-${votesObject.minusesDelta}`;
					//sectionObjectElement.style.setProperty('--minusesAdded', `"-${votesObject.minusesDelta}"`);
				}
				else
				{
					sectionObjectElement.classList.add("minusesRemoved");
					ratingBoxSection.dataset.wxs_minuses_delta = `+${votesObject.minusesDelta}`;
					//sectionObjectElement.style.setProperty('--minusesRemoved', `"+${votesObject.minusesDelta}"`);
				}
			}
		}







		// <section class="rating-box" data-wxs_pluses="269" data-wxs_minuses="0" data-wxs_pluses_minuses_total="269" data-wxs_pluses_below_limit="true">
		function parseRatingBoxCurrentContentAndCreateDataValues(ratingBoxSection)
		{
			// dodanie data-wxs_pluses na podstawie aktualnych wartosci plusow w HTML
			// if(dev) console.log("parseRatingBoxCurrentContentAndCreateDataValues(ratingBoxSection)")
			consoleX(`parseRatingBoxCurrentContentAndCreateDataValues()`, 1);

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
			consoleX(`votingEventListener()`, 1);

			if (sectionObjectElement && ratingBoxSection)
			{
				if (settings.checkEntryPlusesWhenVoting)
				{
					ratingBoxSection.addEventListener('mouseenter', function (event)
					{
						//var clickedButton = event.target;
						if (dev) console.log("mouseenter rating box")
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

				if (settings.votePlusMinusOnHover)
				{
					ratingBoxSection.addEventListener('mouseover', function (event)
					{

						if (event.target.matches('button:not(.voted)'))
						{
							event.target.click();
						}
					});
				}


				ratingBoxSection.addEventListener('click', function (event)
				{
					var clickedButton = event.target;

					let up = 0;
					let down = 0;
					let count = 0;
					let all = 0;

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
						up = Number(sectionObjectElement.dataset.wxs_votes_up) + 1;
						count = Number(sectionObjectElement.dataset.wxs_votes_count) + 1;
						all = Number(sectionObjectElement.dataset.wxs_votes_all) + 1;

					}
					else if (clickedButton.matches('button.plus:not(.voted)'))	// usunieto plusa
					{
						action = "plused";
						vote = "unvoted";
						//count = votesUp;
						up = Number(sectionObjectElement.dataset.wxs_votes_up) - 1;
						count = Number(sectionObjectElement.dataset.wxs_votes_count) - 1;
						all = Number(sectionObjectElement.dataset.wxs_votes_all) - 1;
					}
					else if (clickedButton.matches('button.minus.voted')) 		//  dodano minusa
					{
						action = "minused";
						vote = "voted";
						sign = "-";
						down = Number(sectionObjectElement.dataset.wxs_votes_down) - 1;
						count = Number(sectionObjectElement.dataset.wxs_votes_count) - 1;
						all = Number(sectionObjectElement.dataset.wxs_votes_all) + 1;	// liczba głosów
					}
					else if (clickedButton.matches('button.minus:not(.voted)')) // usunięto minusa
					{
						action = "minused";
						vote = "unvoted";
						sign = "-";
						//count = votesDown;
						down = Number(sectionObjectElement.dataset.wxs_votes_down) + 1;
						count = Number(sectionObjectElement.dataset.wxs_votes_count) + 1;
						all = Number(sectionObjectElement.dataset.wxs_votes_all) - 1;	// liczba głosów
					}

					sectionObjectElement.dataset.wxs_votes_up = up;
					sectionObjectElement.dataset.wxs_votes_down = down;
					sectionObjectElement.dataset.wxs_votes_all = all;
					sectionObjectElement.dataset.wxs_votes_count = count;

					updateFetchedVotesData(sectionObjectElement);

					// voting explosion
					if (settings.votingExplosionEnable && vote == "voted")
					{
						let maximumExpliosionTime = 1300; // default 0 delay, 1300 duration

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
								newDiv.style.setProperty('--explosionTiming', getRandomString("linear", "ease", "ease-in-out", "ease-in", "ease-out")); // "cubic-bezier(0.1, 0.7, 1, 0.1)"
								newDiv.style.setProperty('--explosionDelay', getRandomInt(0, getRandomInt(0, Math.max(800, count)), "ms"));
								newDiv.style.setProperty('--explosionDuration', getRandomInt(900, 1300), "ms");

								maximumExpliosionTime = Math.max(800, count) + 1300;
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

						}, maximumExpliosionTime);
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
			if (dev) console.log("linkSectionIntersected(linkBlock)", linkBlock)

			// const linkBlock = jNodeLinkBlock[0]; // jNode => DOMElement
			//const link_id = linkBlock.id.replace("link-", ""); // 78643212
			const link_id = linkBlock.__vue__.item.id;
			const fetchURL = apiGetLink + link_id;
			if (dev) console.log(fetchURL);

			let link_data;

			let sectionVoteBox = linkBlock.querySelector('section.vote-box');

			if (sectionVoteBox)
			{

				if (settings.linksAnalyzerEnable)
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
							if (dev) console.log("link_data");
							if (dev) console.log(link_data);

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
								// timeCreatedAt.setAttribute("data-v-441f7cc5", null);
								timeCreatedAt.innerHTML = `Dodane: ${link_data.created_at}`;
								linkBlockInfoSpan.appendChild(timeCreatedAt);
							}

							if (link_data.published_at)
							{
								linkBlock.dataset.wxs_published_at = link_data.published_at;
								const timePublishedAt = document.createElement("time");
								// timePublishedAt.setAttribute("data-v-441f7cc5", null);
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
							// VUE SENSITIVE data-v-5bb34f93
							span.setAttribute('data-v-5bb34f93', '');
							span.setAttribute('data-dropdown', `buried-${link_id}`);
							span.setAttribute('title', `Statystyki Wykop X:

Liczba wykopujących: ${link_data.votes.up} 
Liczba zakopujących: ${link_data.votes.down} (${link_data.votes.votesDownPercent}%)`);

							const spanVotesDownCount = document.createElement('span');
							spanVotesDownCount.className = "wykopxs wykopx_votesDownCount";
							spanVotesDownCount.textContent = `${link_data.votes.down}`;

							const spanVotesDownPercent = document.createElement('span');
							spanVotesDownPercent.className = "wykopxs wykopx_votesDownPercent";
							spanVotesDownPercent.textContent = `(${link_data.votes.votesDownPercent}%)`;

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

				// if (settings.linkVoteDownButton && pageType != "wykopalisko")
				if (settings.linkVoteDownButton && !sectionVoteBox.querySelector("div.burry"))
				{
					const downVoteElement = document.createElement("div");
					downVoteElement.classList = "wxsDownVoteWrapper";
					downVoteElement.style = "justify-content: center; display: flex; margin-top: 5px;"
					let downVoteButtonHtml = `<button class="wxsDownVote" data-id="${link_id}" data-vote="down" data-reason="5" style="color: var(--blackish); font-size: 11px;">ZAKOP</button>`; //1-duplikat, 2-spam, 3-informacja nieprawidłowa, 4-treść nieodpowiednia, 5-nie nadaje się
					downVoteElement.innerHTML = downVoteButtonHtml;
					sectionVoteBox.appendChild(downVoteElement);


					downVoteElement.addEventListener("click", async function ()
					{
						const downVoteButton = downVoteElement.children[0];
						if (dev) console.log(downVoteButton);
						let data = null;
						if (downVoteButton.dataset.vote == "down")
						{
							data = await postWykopAPIData("links", downVoteButton.dataset.id, "votes", "down", downVoteButton.dataset.reason) // "/api/v3/links/1234567/votes/down/5"
							// znalezisko zakopano
							if (data == 204)
							{
								downVoteButton.dataset.vote = "undo";
								downVoteButton.innerText = "odkop";
								linkBlock.classList.add("wxsVotedDown");
								sectionVoteBox.classList.add("voted", "buried");
							}
						}
						else if (downVoteButton.dataset.vote == "undo")
						{
							data = await deleteWykopAPIData("links", downVoteButton.dataset.id, "votes") // "/api/v3/links/1234567/votes" -- cofniecie wykopu/zakopu
							// cofnięto wykop/zakop
							if (data == 204)
							{
								downVoteButton.dataset.vote = "down";
								downVoteButton.innerText = "ZAKOP";
								linkBlock.classList.remove("wxsVotedDown");
								sectionVoteBox.classList.remove("voted", "buried");
							}
						}

						if (dev) console.log("downVoteLink data:");
						if (dev) console.log(data);
					})
				}
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

		function disableNewLinkEditorPastedTextLimit(input)
		{
			consoleX(`disableNewLinkEditorPastedTextLimit()`, 1)
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

				if (dev) console.log(`%cWykop X%c` + text, `${tpl}`, `font-family: "Segoe UI", "Open Sans"`);
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

		// SHA256("WykopX") => "f5583a1d5d6044951722fe4b08d534af2b571efc065c8b73d07689d25d8a6175"
		async function SHA256(message)
		{
			const encoder = new TextEncoder();
			const data = encoder.encode(message); // 8,87,121,107,111,112,88
			const hashBuffer = await crypto.subtle.digest("SHA-256", data);
			const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
			const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''); // convert bytes to hex string f5583a1d5d6044951722fe4b08d534af2b571efc065c8b73d07689d25d8a6175
			consoleX(`SHA256 hash: ${hashHex}`, 1);
			return hashHex;
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
		// returns null
		// getURLsFromString("string")
		// getURLsFromString("string with img urls", true)
		function getURLsFromString(string, onlyImagesURLs = false, appendHttpsForBeforeWww = true)
		{
			let urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
			let urlImagesRegex = /(https?:\/\/[^\s]+(\.png|\.jpg|\.jpeg|\.webp))|(www\.[^\s]+(\.png|\.jpg|\.jpeg|\.webp))/g;

			let urls = string.match(onlyImagesURLs ? urlImagesRegex : urlRegex);
			if (urls && appendHttpsForBeforeWww)
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
			// if(dev) console.log("getPlusWords(string): " + str)

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

		function capitalizeFirstLetter(str)
		{
			return str.charAt(0).toUpperCase() + str.slice(1);
		}

		function timeDurationFromSeconds(seconds)
		{
			const hours = Math.floor(seconds / 3600);
			seconds %= 3600;
			const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
			seconds = String(Math.floor(seconds % 60)).padStart(2, '0');
			return `${hours > 0 ? hours + ":" : ""}${minutes}:${seconds}`;
		}









		/* ARCHIWUM X */
		let newestEntrySection = null;
		let newestEntryID = null;
		let wxs_newest_entry = 1;

		async function archiveXNewestEntry()
		{
			let newestEntrySectionElem = document.createElement("div");
			newestEntrySectionElem.id = "wxs_newest_entry";
			newestEntrySectionElem.classList.add("hidden");	// .hidden

			newestEntrySectionElem.innerHTML = `
		<section data-v-2aacfeb5="" data-v-7693ae52="" class="entry" data-v-0a84d0a4=""><!-- id="comment-75364841"  -->
			<article data-v-2aacfeb5="">
				<header data-v-2aacfeb5="">
					<div data-v-2aacfeb5="" class="left">
						<a data-v-fb64f4be="" data-v-2aacfeb5="" class="avatar active" style="width: 40px; height: 40px;"> <!-- href="/ludzie/NICK" -->
							<figure data-v-fb64f4be="" class="male orange-profile wxs_newest_entry_author_color wxs_newest_entry_author_gender">
								<img class="wxs_newest_entry_author_avatar" data-v-ecb5ea3e="" data-v-fb64f4be="" loading="lazy" src="https://wykop.pl/cdn/c0834752/3f55ec16859056965fb5ef04e080527497a9abce924d2edb171680c11e34ce1c,q80.png" alt="NICK">
							</figure>
						</a>
					</div>

					<div data-v-2aacfeb5="" class="right">
						<div data-v-2aacfeb5="">
							<div data-v-0908378b="" data-v-2aacfeb5="" class="tooltip-slot">
								<span data-v-0908378b="">
									<a class="wxs_newest_entry_author_username_ahref wxs_newest_entry_author_color username orange-profile active" href="/ludzie/WykopX" data-v-ed9f6c56="" data-v-2aacfeb5="">
										<span class="wxs_newest_entry_author_username" data-v-ed9f6c56="">WykopX</span>
									</a>
								</span>
							</div>
							<span data-v-0908378b="">
									<span data-v-2aacfeb5="">
										<a class="wxs_newest_entry_ahref" data-v-2aacfeb5="" href="">
											<time class="date wxs_newest_entry_created_at"  data-v-0132bb98="" data-v-2aacfeb5="" title="2024-03-09 18:42:19" datetime="2024-03-09 18:42:19">przed chwilą</time>
										</a>
									</span>
								</a>
							</span>
							</div>
							<div data-v-2aacfeb5="">
								<section data-v-76790450="" data-v-2aacfeb5="" class="rating-box">
									<ul data-v-76790450="" class="">
										<li data-v-76790450="" class="zero">0</li>
									</ul>
									<div data-v-76790450="" class="buttons">
										<button data-v-76790450="" data-no-bubble="" class="plus">+</button>
									</div>
								</section>
							</div>
						</div>
				</header>
				<div data-v-2aacfeb5="" class="edit-wrapper">
					<div data-v-2aacfeb5="" data-selectable="" class="content">
						<section data-v-725caa02="" data-v-2aacfeb5="" class="entry-content">
							<div data-v-725caa02="" class="wxs_newest_entry_content wrapper">Ładowanie...</div>
						</section>
					</div>
				</div>
			</article>
			<div class="timer">
				<div class="mask"></div>
			</div>
		</section>
		`;

			bodySection.appendChild(newestEntrySectionElem);
			newestEntrySection = bodySection.querySelector("#wxs_newest_entry");

			if (wxs_newest_entry && wxs_newest_entry != 0) getNewestEntryFromAPI(newestEntrySection);
		}




		let firstInDayID = {
			entry: null,
			link: null
		}

		// getEntryDailyNumber(wykopObjectData, "2023-01-01")		-> 678 - zwraca który wpis tego dnia
		async function getEntryDailyNumber(objectData) // "2024-03-14 21:34:51",
		{
			// if(dev) console.log(`getEntryDailyNumber(objectData.id: ${objectData.id}, createdAtDate: ${objectData.created_at})`);
			// if(dev) console.log(`getEntryDailyNumber() - firstInDayID[${objectData.resource}]: `, firstInDayID[objectData.resource]);

			const dateToCheck = dayjs(objectData.created_at).format("YYYY-MM-DD");

			if (firstInDayID[objectData.resource] != null)
			{
				// if(dev) console.log(`mapa firstInDayID[${objectData.resource}] = null, sprawdzamy localstorage`);

				await localStorageFirstDailyIDs.getItem(`${objectData.resource}FirstInDayIDsMap`).then(val =>	// localstorage: entryFirstInDayIDsMap / linkFirstInDayIDsMap
				{
					if (val !== null)
					{
						firstInDayID[objectData.resource] = new Map(Object.entries(val));
						// if(dev) console.log("znaleziono w localstorage val = ", val);
						// if(dev) console.log("znaleziono w localstorage firstInDayID[objectData.resource] = ", firstInDayID[objectData.resource]);
					}
					else
					{
						// if(dev) console.log('Mapa nie istniała, a w localstorage nie było zapisanych danych');
						firstInDayID[objectData.resource] = new Map();
					}
				}).catch(err =>
				{
					console.error(err);
				});
			}

			if (firstInDayID[objectData.resource])
			{
				// if(dev) console.log('Mapa już istnieje: firstInDayID[objectData.resource]', firstInDayID[objectData.resource]);

				if (firstInDayID[objectData.resource].has(dateToCheck))
				{
					// if(dev) console.log(`Mapa posiada dla daty ${dateToCheck}, wartość: ${firstInDayID[objectData.resource].get(dateToCheck)}`);
					// if(dev) console.log("firstInDayID[objectData.resource]", firstInDayID[objectData.resource])

					return (objectData.id - firstInDayID[objectData.resource].get(dateToCheck)) / 2;
				}
				else
				{
					// if(dev) console.log(`Mapa istnieje, ale dla daty ${dateToCheck} nie posiada jeszcze wartości`);
				}
			}
			else
			{
				firstInDayID[objectData.resource] = new Map();
			}


			// if(dev) console.log('Mapa przed wyslaniem zapytania do API WykopX: firstInDayID[objectData.resource]', firstInDayID[objectData.resource]);

			const firstEntryData = await getWykopXAPIData(objectData.resource, "first-by-date") // https://archiwum.wykopx.pl/api/entry/first-by-date  // https://archiwum.wykopx.pl/api/link/first-by-date
			// if(dev) console.log('Pobrano z Archiwum Wykop X: firstEntryData, ', firstEntryData);

			if (firstEntryData && firstEntryData.id != null)
			{
				firstInDayID[objectData.resource].set(dateToCheck, firstEntryData.id);
				localStorageFirstDailyIDs.setItem(`${objectData.resource}FirstInDayIDsMap`, Object.fromEntries(firstInDayID[objectData.resource]));//.then(() => { });
				// if(dev) console.log("firstInDayID[objectData.resource]", firstInDayID[objectData.resource])

				return (objectData.id - firstEntryData.id) / 2;
			}

			return false;
		}






		// zmodyfikowana funkcja z mikroczatu
		// zwraca 400 jesli autor cię blokuje, 409 jeśli nie
		async function checkIfYouCanPostCommentInEntry(entry_id)
		{
			if (dev) console.log(`checkIfYouCanPostCommentInEntry() entry_id: ${entry_id}`);

			let newMessageBody = {
				resource: "entry_comment",
				entry_id: entry_id,
				content: ""
			}

			if (dev) console.log(`checkIfYouCanPostCommentInEntry() newMessageBody:`, newMessageBody);

			//try
			//{
			if (dev) console.log(`try > postNewMessageToChannel, entry_id: ${entry_id}`);
			return await postNewMessageToChannel(newMessageBody)
			//}
			// catch (error)
			// {
			// 	let httpError = error;

			// 	switch (httpError.status)
			// 	{
			// 		case 400:
			// 			// UZYTKOWNIK CIĘ BLOKUJE
			// 			return false;
			// 			break;
			// 		case 409:
			// 			// MOZED ODPISYWAĆ - WSZYSTKO OK (po prostu za krotka wiadomosc)
			// 			return true;
			// 			break;
			// 		case 429:
			// 			// INNY BLAD - ZA DUZO REQUESTOW
			// 			break;
			// 		default:
			// 		// Other status codes
			// 	}
			// }
		}





		/* POST */
		// funkcja z mikroczatu
		async function postNewMessageToChannel(message)
		{
			if (dev) console.log(`postNewMessageToChannel: message: `, message);
			/*
				{
					"data":
					{
						"content": "**foobar** __foobar__ [lorem](https://www.wykop.pl) impsum!!! #nsfw #wykop",
						"photo": "e07843ss3fbe9cb4saeed0asdfsdfc64b9a4df6084199b39d2",
						"embed": "1fde707843ss3fbe9cb4eed0asdfsdfc64ab9a4df6084199b39d2",
						"survey": "qErgdjp5K0xz",
						"adult": false
					}
				}
			*/

			// nowy wpis (domyślnie)
			let apiURL = "https://wykop.pl/api/v3/entries";

			// nowy komentarz pod wpisem
			if (message.resource && message.resource == "entry_comment" && message.entry_id)
			{
				apiURL = `https://wykop.pl/api/v3/entries/${message.entry_id}/comments`;
			}

			let bodyData = {};
			message.content ? bodyData.content = message.content : "";
			message.photo ? bodyData.photo = message.photo : "";
			message.embed ? bodyData.embed = message.embed : "";
			message.survey ? bodyData.survey = message.survey : "";
			message.adult ? bodyData.adult = message.adult : "";

			if (dev) console.log("bodyData to send: ", bodyData);
			if (dev) console.log("apiURL: ", apiURL);

			return new Promise(async (resolve, reject) =>
			{
				try
				{
					await fetch(apiURL,
						{
							method: "POST",
							headers:
							{
								"Content-Type": "application/json",
								Authorization: "Bearer " + window.localStorage.getItem("token"),
							},
							body: JSON.stringify(
								{
									"data": bodyData
								})
						})
						.then((response) =>
						{
							if (dev) console.log("response", response)

							if (!response.ok)
							{
								// zwraca error.status = 400 (jestes blokowany) albo error.status = 409 (pusta tresc)
								if (dev) console.log(`HTTP error! status: ${response.status}`);
								resolve(response.status);
								// throw new T.HTTPError(`HTTP error! status: ${response.status}`, response.status);
							}
						})
						.then(async (responseJSON) =>
						{
							if (dev) console.log("responseJSON")
							if (dev) console.log(responseJSON)

							resolve(responseJSON.data);

						}).catch((error) =>
						{
							if (error instanceof TypeError)
							{
								//console.error('xxx Network error:', error); // AWARIA SERWERA
							} else
							{
								//console.error('Other error:', error);
							}
							reject(error);
						});
				}
				catch (error)
				{
					//console.error('Other catched error:', error);
					reject(error);
				}
			});
		}






		async function getNewestEntryFromAPI(sectionElement = newestEntrySection)
		{
			sectionElement.classList.remove("animationRunning");

			let newestEntryObject = await getWykopAPIData(`entries?sort=newest&limit=1`); // https://wykop.pl/api/v3/entries?sort=newest&limit=1
			newestEntryObject = newestEntryObject.data[0]

			if (newestEntryObject.id != newestEntryID)
			{
				newestEntryID = newestEntryObject.id
				sectionElement.classList.add("animationRunning");

				let entries_today_count = await getEntryDailyNumber(newestEntryObject);

				if (entries_today_count)
				{
					sectionElement.querySelectorAll(".entry").forEach((el) =>
					{
						el.dataset.entries_today_count = entries_today_count;
					});
				}

				sectionElement.querySelectorAll(".wxs_newest_entry_author_username_ahref").forEach((el) =>
				{
					el.href = `/ludzie/${newestEntryObject.author.username}`;
				});
				sectionElement.querySelectorAll(".wxs_newest_entry_author_gender").forEach((el) =>
				{
					el.classList.remove("male", "female");
					if (newestEntryObject.author.gender == "m") el.classList.add(`male`);
					else if (newestEntryObject.author.gender == "f") el.classList.add(`female`);
				});
				sectionElement.querySelectorAll(".wxs_newest_entry_author_color").forEach((el) =>
				{
					el.classList.remove("orange-profile", "green-profile", "burgundy-progile");
					el.classList.add(`${newestEntryObject.author.color}-profile`);
				});
				sectionElement.querySelectorAll(".wxs_newest_entry_author_username").forEach((el) =>
				{
					el.innerHTML = newestEntryObject.author.username;
				});
				sectionElement.querySelectorAll(".wxs_newest_entry_author_avatar").forEach((el) =>
				{
					if (newestEntryObject.author.avatar) el.src = newestEntryObject.author.avatar;
					else el.src = "/static/img/svg/avatar-default.svg";

					el.alt = newestEntryObject.author.username;
				});

				sectionElement.querySelectorAll(".wxs_newest_entry_ahref").forEach((el) =>
				{
					el.href = `https://wykop.pl/wpis/${newestEntryObject.id}/wykopx`;
				});
				sectionElement.querySelectorAll(".wxs_newest_entry_created_at").forEach((el) =>
				{
					el.title = newestEntryObject.created_at;
					el.datetime = newestEntryObject.created_at;
				});

				sectionElement.querySelectorAll(".wxs_newest_entry_content").forEach((el) =>
				{
					el.innerHTML = newestEntryObject.content;
				});

			}

			sectionElement.classList.remove("hidden");

			if (document.hidden == false) runWithDelay(2000 + (settings.wxsArchiveXNewestEntryRefresh * 1000), getNewestEntryFromAPI);
		}


		if (settings.wxsArchiveXNewestEntry)
		{
			CSS += `
		body[data-wxs_newest_entry="0"] #wxs_newest_entry { display: none!important; }
		body[data-wxs_newest_entry="1"] .wykopx_newest_entry_switcher { background: linear-gradient(to bottom right, transparent 0%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 100%); }
		body[data-wxs_newest_entry="2"] .wykopx_newest_entry_switcher { background: linear-gradient(to top left, transparent 0%, transparent 50%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.1) 100%); }
		body[data-wxs_newest_entry="3"] .wykopx_newest_entry_switcher { background: rgba(255, 255, 255, 0.1); }

		#wxs_newest_entry
		{
			right: 40px;
			width: 400px;
			
			height: auto;
			max-height: 50%;

			--border-radius: 0px;
			border-radius: var(--border-radius)!important;
			position: fixed;
			bottom: 15px;
			z-index: 9999;
			display: grid;
			color: var(--blackish);
			background-color: var(--alta);
			background: linear-gradient(145deg, var(--whitish), var(--alta));
			box-shadow:  5px 5px 10px var(--porcelain),  -5px -5px 10px var(--porcelain);
		}
		#wxs_newest_entry > .entry
		{
			border-radius: var(--border-radius)!important;
		}

		#wxs_newest_entry > .entry::after
		{
			bottom: 10px;
			left: 20px;
			content: attr(data-entries_today_count);
			position: absolute;
			font-size: 15px;
			opacity: 0.2;
		}`;
		}


		// TRYB NOCNY W BELCE NAWIGACYJNEJ
		function addNewestEntryTopNavButton()
		{
			if (settings.wxsArchiveXNewestEntry)
			{
				wxs_newest_entry = localStorage.getItem('wxs_newest_entry');
				if (!wxs_newest_entry) wxs_newest_entry = 1;
				body.dataset.wxs_newest_entry = wxs_newest_entry;
				// wykopx_newest_entry_switcher_status_0 - wylaczone
				// wykopx_newest_entry_switcher_status_1 - wpisy
				// wykopx_newest_entry_switcher_status_2 - linki
				// wykopx_newest_entry_switcher_status_3 - oba
				const wykopx_newest_entry_switcher_button = document.createElement("li");
				wykopx_newest_entry_switcher_button.insertAdjacentHTML('afterbegin', `<a href="#"><figure>🤍</figure></a>`);
				wykopx_newest_entry_switcher_button.classList.add("wykopx_newest_entry_switcher", "notifications", "dropdown");
				wykopx_newest_entry_switcher_button.title = `Włącz/wyłącz powiadomienia o najnowszych wpisach na Mikroblogu ${promoString}`;
				wykopx_newest_entry_switcher_button.addEventListener('click', function ()
				{
					wxs_newest_entry = localStorage.getItem('wxs_newest_entry');
					// 0 - wylaczone
					// 1 - wpisy
					// 2 - linki
					// 3 - wpisy + linki
					if (wxs_newest_entry === null)
					{
						wxs_newest_entry = 1;
					}
					else if (wxs_newest_entry == 1)	// przy linkach zmienić na == 3
					{
						wxs_newest_entry = 0;
					}
					else
					{
						wxs_newest_entry++;
					}

					if (wxs_newest_entry > 0) getNewestEntryFromAPI();

					localStorage.setItem('wxs_newest_entry', wxs_newest_entry);

					body.dataset.wxs_newest_entry = wxs_newest_entry;
				});
				topNavHeaderRightElement.appendChild(wykopx_newest_entry_switcher_button);
			}
		}











		/* ------ PRZYCISK DO POBIERANIA OBRAZKÓW --------- */
		if (settings.wxsDownloadImageButton)
		{
			waitForKeyElements("section.entry section.entry-photo figure", wxsDownloadImageButton, false);

			function wxsDownloadImageButton(entryPhotoFigureElement)
			{
				consoleX(`wxsDownloadImageButton()`, 1);
				let html = `<div class="wykopxs wxs_download_image_button"><a title="Pobierz ten obrazek w pełnej rozdzielczości ${promoString}" href="${entryPhotoFigureElement.querySelector('figcaption a').getAttribute('href')} " download>Pobierz ten obrazek</a></div>`;
				entryPhotoFigureElement.insertAdjacentHTML('beforeend', html);
			}
		}





		/* ------ IMAGE UPLOADER CTRL+V --------- */
		waitForKeyElements("section.editor", sectionEditor, false);

		function sectionEditor(sectionEditorElement)
		{
			consoleX("sectionEditor", 1)
			const textareaEditorElement = sectionEditorElement.querySelector("textarea");

			if (settings.editorSendHotkey != "domyslnie")
			{
				sendOnCTRL_ENTER(sectionEditorElement);
			}

			if (settings.imageUploaderEnable)
			{
				imagePasteFromClipboardListener(sectionEditorElement);
			}

		}


		function sendOnCTRL_ENTER(sectionEditorElement)
		{
			consoleX("sendOnCTRL_ENTER", 1)

			const textareaEditorElement = sectionEditorElement.querySelector("textarea");
			const buttonSendElement = sectionEditorElement.querySelector("div.button.send > button");

			if (settings.editorSendHotkey == "ctrl_enter")
			{
				sectionEditorElement.style.setProperty('--editorSendHotkey', `"CTRL+ENTER"`);
				buttonSendElement.title = "Wykop X: Wciśnij CTRL + ENTER, aby wysłać "
			}
			else if (settings.editorSendHotkey == "enter")
			{
				sectionEditorElement.style.setProperty('--editorSendHotkey', `"ENTER"`);
				buttonSendElement.title = "Wykop X: Wciśnij ENTER, aby wysłać "
			}
			else if (settings.editorSendHotkey == "ctrl_s")
			{
				sectionEditorElement.style.setProperty('--editorSendHotkey', `"CTRL+S"`);
				buttonSendElement.title = "Wykop X: Wciśnij CTRL + S, aby wysłać ";
			}

			textareaEditorElement.addEventListener('keydown', function (e)
			{
				if (settings.editorSendHotkey == "ctrl_enter" && e.ctrlKey && e.key === 'Enter')
				{
					e.preventDefault();
					buttonSendElement.dispatchEvent(new Event('click'));
				}
				else if (settings.editorSendHotkey == "enter" && e.key === 'Enter')
				{
					e.preventDefault();
					buttonSendElement.dispatchEvent(new Event('click'));
				}
				else if (settings.editorSendHotkey == "ctrl_s" && e.ctrlKey && e.key === 's')
				{
					e.preventDefault();
					buttonSendElement.dispatchEvent(new Event('click'));
				}
			});
		}



		function imagePasteFromClipboardListener(sectionEditorElement)
		{
			consoleX(`imagePasteFromClipboardListener()`, 1);
			const textarea = sectionEditorElement.querySelector("textarea");
			// if(dev) console.log(textarea);
			const imageUploadPreview = document.createElement('figure');
			imageUploadPreview.classList.add("wxs_uploaded_image_placeholder");
			textarea.parentNode.appendChild(imageUploadPreview);

			const imageUploaderCaption = document.createElement('div');
			imageUploaderCaption.classList.add("wxs_uploader_caption");
			imageUploaderCaption.innerHTML = `<span class="wxs_upload_first_image">CTRL + V - wklej obrazek ze schowka</span><span class="wxs_upload_and_replace_current_image">CTRL + V - wklej kolejny obrazek, aby zastąpić aktualnie dodany</span>`;
			textarea.parentNode.appendChild(imageUploaderCaption);



			// PASTE EVENT
			document.addEventListener('paste', async (e) => 
			{
				// e.preventDefault();
				// e.stopPropagation(); 
				console.clear();
				// if(dev) console.log("e.clipboardData.items") // object DataTransferItemList {0: DataTransferItem, 1: DataTransferItem, ...}
				// if(dev) console.log(e.clipboardData.items)
				// if(dev) console.log("clipboardData.types")
				// if(dev) console.log(e.clipboardData.types) //  Array: ['Files', 'text/plain', 'text/html', 'application/vnd.code.copymetadata', 'vscode-editor-data']
				// if(dev) console.log("clipboardData.files")
				// if(dev) console.log(e.clipboardData.files)
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
				// items ->text  files -> pliki png

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
					if (dev) console.log(e.clipboardData.files[0]);
					let imageFile = e.clipboardData.files[0];
					if (dev) console.log("imageFile (original)");
					if (dev) console.log(imageFile);

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
					// 				if(dev) console.log(imageFile);
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

					if (dev) console.log("imageFile");
					if (dev) console.log(imageFile);

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

					if (dev) console.log("bitmap");
					if (dev) console.log(bitmap);

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
						sectionEditorElement.dispatchEvent(fakeDropEvent);
					}
					else
					{

					}
				}
				// wklejono tekst
				else if (e.clipboardData.files.length == 0 && e.clipboardData.items.length > 0)
				{
					if (dev) console.log("e.clipboardData.items.length > 0");
					let textPlainFromClipboard = e.clipboardData.getData('text/plain');
					if (dev) console.log("Clipboard text/plain: " + textPlainFromClipboard);

					let urlsArray = getURLsFromString(textPlainFromClipboard, true);
					if (urlsArray && urlsArray.length > 0)
					{
						urlsArray.forEach((urlFromClipboard) =>
						{

							if (urlFromClipboard.endsWith(".webp"))
							{

							}


							if (dev) console.log("probuje pobrać plik: " + urlFromClipboard);

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









		/* ------------- EVENTS ------------ */

		// LOADED PAGE
		window.onload = function (event)
		{
			consoleX("windows.onload", 1)
			loadTime = dayjs();
			browserExecuteOnPageLoad();
			browserExecuteOnPageLoadAndPageChange();
		};


		/* NEW WYKOP PAGE REDIRECTION */
		if (window?.navigation != null)  /* Firefox nadal tego nie obsluguje */
		{
			navigation.addEventListener("navigate", (event) =>
			{
				consoleX(`🎈 Event: "navigate"`)
				loadTime = dayjs();
				browserExecuteOnPageChange(event);
				browserExecuteOnPageLoadAndPageChange();
			});
		}



		function handleWindowEvent(event)
		{
			if (dev) console.log(`handleWindowEvent() -> event.type: ${event.type} was fired`);
			// if(dev) console.log(event);
		}
		// window.addEventListener('load', handleWindowEvent); 		// 1.
		// window.addEventListener('pageshow', handleWindowEvent); 	// 2.
		// window.addEventListener('popstate', handleWindowEvent);
		// window.addEventListener('hashchange', handleWindowEvent);
		// window.addEventListener('pagehide', handleWindowEvent);
		// window.addEventListener('beforeunload', handleWindowEvent);
		// window.addEventListener('unload', handleWindowEvent);

		/*	events in Wykop podczas ladowania strony:
			1. 	window.addEventListener('load', callback); (Event) event.srcElement.URL > "https://wykop.pl/wpis/74180083/pytanie#comment-261404235"
			2. 	window.addEventListener('pageshow', callback); (PageTransitionEvent)
			
			firefox: 
			- load, pageshow - OK
			- brak wykrytych eventów podczas przechodzenia miedzy stronami
			- brak obiektu window.navigator
			przejscie na nowa strone, do innego #anchora po kliknieciu w permalink komentarza we wpisie
			
			3. navigation.addEventListener("navigate", callback) (NavigateEvent)
			
			“popstate”: This event is fired when the active history entry changes, either by the user navigating to a different state, or by the code calling the history.pushState() or history.replaceState() methods. This event can be used to update the page content according to the new state.
			“hashchange”: This event is fired when the fragment identifier of the URL (the part after the “#”) changes. This event can be used to implement single-page applications that use different hash values to load different views.
			“pushstate”: This event is fired when the history.pushState() method is called, which adds a new state to the history stack. This event can be used to perform some actions when a new state is created.
			“replacestate”: This event is fired when the history.replaceState() method is called, which modifies the current state in the history stack. This event can be used to perform some actions when the current state is changed.
		*/


		// ---- PAGE OPENED 1st TIME
		async function browserExecuteOnPageLoad()
		{
			// awariaSerwera();
			// consoleX(`browserExecuteOnPageLoad`, 1);
			if (isURLChanged()) newPageURL()

			const loggedUserJSON = await getWykopAPIData("profile") // -> https://wykop.pl/api/v3/profile

			loggedUser = loggedUserJSON.data;
			//ser.username = user.data.username;

			if (!(loggedUser?.username))
			{
				const topHeaderProfileButton = document.querySelector("body header > div.right > nav > ul > li.account a.avatar");
				if (topHeaderProfileButton)
				{
					loggedUser.username = topHeaderProfileButton.getAttribute("href").split('/')[2];
				}
			}

			if (loggedUser?.username)
			{
				if (settings.editorShowMyUsername)
				{
					bodySection.style.setProperty('--myUsername', `"${loggedUser.username}"`);
					bodySection.style.setProperty('--myUsernameAs', `"jako ${loggedUser.username}"`);
					bodySection.style.setProperty('--myUsernameAS', `"JAKO ${loggedUser.username}"`);
					bodySection.style.setProperty('--myUsernameAddingAs', `"Dodajesz z konta ${loggedUser.username}"`);
				}
				// UŻYTKOWNIK MA BANA
				if (loggedUser?.status && loggedUser.status == "banned")
				{
					settings.authorBlocksYouCheckingEnable = false; // BlockDetector off for banned user
					settings.editorSendHotkey = "domyslnie";
					settings.editorSendHotkeyShowOnSendButton = false;

					body.dataset.userBanned = "true"; 	// <body data-user-banned="true">

					if (settings.haveBanDisableTextarea)
					{
						// 🍌 Pokaż informację o banie w edytorze nowego wpisu/komentarza
						bodySection.style.setProperty('--myUsernameAddingAs', `"🍌 ${loggedUser.username}, masz bana. Nie możesz dodawać wpisów i komentarzy"`);
					}
				}
			}
			else
			{
				// niezalogowany
			}


			// if (loggedUser.username == null) consoleX(`Cześć Anon.Nie jesteś zalogowany na Wykopie(⌐ ͡■ ͜ʖ ͡■)`);
			// else consoleX(`Cześć ${ loggedUser.username }(⌐ ͡■ ͜ʖ ͡■)`);

			focusOnAddingNewMicroblogEntry();
			addWykopXButtonsToNavBar();

			if (settings.wxsSwitchesEnable)
			{
				runWithDelay(200, function ()
				{
					addSwitchButtons();
				});
			}
			if (settings.observedTagsInRightSidebarEnable)
			{
				runWithDelay(500, function ()
				{
					addObservedTagsToRightSidebar();
				});
			}

			runWithDelay(400, function ()
			{
				addExtraButtons();
			});

			// 8s
			runWithDelay(8000, function ()
			{
				if (settings.topNavNightSwitchButton) addNightModeButtonToNavBar();
				hideWykopXSPromo();
				topNavLogoClick();
				topNavHomeButtonClickRefreshOrRedirect();
				addNotificationSummaryButtonToNavBar();
				topNavMicroblogButtonClickRefreshOrRedirect();
			});


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

			// 20s
			//runWithDelay(25000, function ()
			runWithDelay(1000, function ()
			{
				checkVersionForUpdates();
				createProfileDropdownMenuItem(
					{
						text: `Pomoc: Wykop X`,
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

			runWithDelay(30000, async function ()
			{
				if (loggedUser?.username)
				{
					try
					{
						let settings_list_update = await localStorageObserved.getItem("settings_list_update");
						if (settings_list_update == null)
						{
							POSTDATATOWYKOPX();
						}
						else
						{
							if (loadTime.diff(dayjs(settings_list_update), "days") > 1)
							{
								POSTDATATOWYKOPX();
							}
							else
							{
								return true;
							}
						}
					}
					catch (err)
					{
						if (dev) console.log(err);
					}
				}
			});

			if (settings.wxsArchiveXNewestEntry)
			{
				addNewestEntryTopNavButton();
				archiveXNewestEntry();
			}
		}
		// ----- PAGE NAVIGATION
		async function browserExecuteOnPageChange(event)
		{
			consoleX(`browserExecuteOnPageChange() -> navigation -> navigate event — ${event.type}`, 1);
			consoleX(`browserExecuteOnPageChange() -> document.title: ${document.title}`, 1);
			// if(dev) console.log(event);

			pageTabTitleOriginal = document.title;
			pageTabTitleProcessed = pageTabTitleOriginal;

			//visiblePlusesObserver.disconnect();
			//if (sectionObjectIntersectionObserver) sectionObjectIntersectionObserver.disconnect();
			//if (settings.actionBoxEnable && (settings.filterUserComments || settings.filterUserReplies)) filterUserOff(); // usuniecie filtra komentarzy

			runWithDelay(500, function ()
			{
				if (isURLChanged())
				{
					const previousPageSubtype = pageSubtype;
					newPageURL();
					if (pageSubtype == previousPageSubtype) removeAllDataWXSAttributes();
				}
			});

			// 7s
			if (!settings.tabChangeOnlyOnHiddenState) runWithDelay(7000, () => { executeTabAndFaviconChanges() })
		}
		// ---- PAGE OPENED 1st TIME + PAGE NAVIGATION
		async function browserExecuteOnPageLoadAndPageChange()
		{
			consoleX(`browserExecuteOnPageLoadAndPageChange()`, 1);

			runWithDelay(100, function ()
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
				// runWithDelay(100, function ()
				// {

				// })
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

			if (settings.removeAnnoyancesEnable)
			{
				runWithDelay(18000, function ()
				{
					if (settings.removeAnnoyancesIframes) waitForKeyElements(`html > iframe, html > body > iframe`, removeFromDOM, false);
					if (settings.removeAnnoyancesScripts) waitForKeyElements(`html > head > script[src^="https://"]`, removeFromDOM, false);
				})

				runWithDelay(3000, function ()
				{
					removeAnnoyances()
				})
			}

			// waitForKeyElements("main.main > section > div.content section.stream > header.stream-top", buildConsole, false)
			// buildConsole();
			// refreshConsole();
		}














		// async function awariaSerwera()
		// {
		// 	let awaria = document.querySelector(`body > section > footer > a[onclick="window.location.href = reloadURL"`);
		// 	if (awaria) alert("AWARIA");
		// }

		// XHR BLOCKER



		// Wykop XS-XHR Blocker
		// https://greasyfork.org/en/scripts/486722-wykop-xs-xhr-blocker
		setSettingsValueFromCSSProperty("wxsBlockXHREnable");
		if (settings.wxsBlockXHREnable)
		{
			setSettingsValueFromCSSProperty("wxsBlockXHRExternal");
			setSettingsValueFromCSSProperty("wxsBlockXHRInternalAds");
			setSettingsValueFromCSSProperty("wxsBlockXHRConsoleLogAllowed", false);
			setSettingsValueFromCSSProperty("wxsBlockXHRConsoleLogBlocked", false);
			setSettingsValueFromCSSProperty("rightSidebarHidePopularTags", false);
			setSettingsValueFromCSSProperty("rightSidebarHideRelatedTags", false);
			setSettingsValueFromCSSProperty("rightSidebarHideHits", false);
			setSettingsValueFromCSSProperty("rightSidebarHideEntriesHot", false);
			setSettingsValueFromCSSProperty("rightSidebarHideEntriesActive", false);
			setSettingsValueFromCSSProperty("rightSidebarHideEntriesPopular", false);
			setSettingsValueFromCSSProperty("rightSidebarHideUpcomingActive", false);
			setSettingsValueFromCSSProperty("rightSidebarHideLinksNewest", false);
			setSettingsValueFromCSSProperty("rightSidebarHideLinksActive", false);
			setSettingsValueFromCSSProperty("rightSidebarHideLinksPopular", false);
		}

		let xhook = null;
		if (settings.infiniteScrollEntriesEnabled || settings.infiniteScrollLinksEnabled || settings.wxsBlockXHREnable)
		{
			//XHook-v1.6.2-https://github.com/jpillora/xhook
			//Jaime Pillora <dev@jpillora.com>-MIT Copyright 2023
			xhook = function () { "use strict"; const e = (e, t) => Array.prototype.slice.call(e, t); let t = null; "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope ? t = self : "undefined" != typeof global ? t = global : window && (t = window); const n = t, o = t.document, r = ["load", "loadend", "loadstart"], s = ["progress", "abort", "error", "timeout"], a = e => ["returnValue", "totalSize", "position"].includes(e), i = function (e, t) { for (let n in e) { if (a(n)) continue; const o = e[n]; try { t[n] = o } catch (e) { } } return t }, c = function (e, t, n) { const o = e => function (o) { const r = {}; for (let e in o) { if (a(e)) continue; const s = o[e]; r[e] = s === t ? n : s } return n.dispatchEvent(e, r) }; for (let r of Array.from(e)) n._has(r) && (t[`on${r}`] = o(r)) }, u = function (e) { if (o && null != o.createEventObject) { const t = o.createEventObject(); return t.type = e, t } try { return new Event(e) } catch (t) { return { type: e } } }, l = function (t) { let n = {}; const o = e => n[e] || [], r = { addEventListener: function (e, t, r) { n[e] = o(e), n[e].indexOf(t) >= 0 || (r = void 0 === r ? n[e].length : r, n[e].splice(r, 0, t)) }, removeEventListener: function (e, t) { if (void 0 === e) return void (n = {}); void 0 === t && (n[e] = []); const r = o(e).indexOf(t); -1 !== r && o(e).splice(r, 1) }, dispatchEvent: function () { const n = e(arguments), s = n.shift(); t || (n[0] = i(n[0], u(s)), Object.defineProperty(n[0], "target", { writable: !1, value: this })); const a = r[`on${s}`]; a && a.apply(r, n); const c = o(s).concat(o("*")); for (let e = 0; e < c.length; e++) { c[e].apply(r, n) } }, _has: e => !(!n[e] && !r[`on${e}`]) }; return t && (r.listeners = t => e(o(t)), r.on = r.addEventListener, r.off = r.removeEventListener, r.fire = r.dispatchEvent, r.once = function (e, t) { var n = function () { return r.off(e, n), t.apply(null, arguments) }; return r.on(e, n) }, r.destroy = () => n = {}), r }; var f = function (e, t) { switch (typeof e) { case "object": return n = e, Object.entries(n).map((([e, t]) => `${e.toLowerCase()}: ${t}`)).join("\r\n"); case "string": return function (e, t) { const n = e.split("\r\n"); null == t && (t = {}); for (let e of n) if (/([^:]+):\s*(.+)/.test(e)) { const e = null != RegExp.$1 ? RegExp.$1.toLowerCase() : void 0, n = RegExp.$2; null == t[e] && (t[e] = n) } return t }(e, t) }var n; return [] }; const d = l(!0), p = e => void 0 === e ? null : e, h = n.XMLHttpRequest, y = function () { const e = new h, t = {}; let n, o, a, u = null; var y = 0; const v = function () { if (a.status = u || e.status, -1 !== u && (a.statusText = e.statusText), -1 === u); else { const t = f(e.getAllResponseHeaders()); for (let e in t) { const n = t[e]; if (!a.headers[e]) { const t = e.toLowerCase(); a.headers[t] = n } } } }, b = function () { x.status = a.status, x.statusText = a.statusText }, g = function () { n || x.dispatchEvent("load", {}), x.dispatchEvent("loadend", {}), n && (x.readyState = 0) }, E = function (e) { for (; e > y && y < 4;)x.readyState = ++y, 1 === y && x.dispatchEvent("loadstart", {}), 2 === y && b(), 4 === y && (b(), "text" in a && (x.responseText = a.text), "xml" in a && (x.responseXML = a.xml), "data" in a && (x.response = a.data), "finalUrl" in a && (x.responseURL = a.finalUrl)), x.dispatchEvent("readystatechange", {}), 4 === y && (!1 === t.async ? g() : setTimeout(g, 0)) }, m = function (e) { if (4 !== e) return void E(e); const n = d.listeners("after"); var o = function () { if (n.length > 0) { const e = n.shift(); 2 === e.length ? (e(t, a), o()) : 3 === e.length && t.async ? e(t, a, o) : o() } else E(4) }; o() }; var x = l(); t.xhr = x, e.onreadystatechange = function (t) { try { 2 === e.readyState && v() } catch (e) { } 4 === e.readyState && (o = !1, v(), function () { if (e.responseType && "text" !== e.responseType) "document" === e.responseType ? (a.xml = e.responseXML, a.data = e.responseXML) : a.data = e.response; else { a.text = e.responseText, a.data = e.responseText; try { a.xml = e.responseXML } catch (e) { } } "responseURL" in e && (a.finalUrl = e.responseURL) }()), m(e.readyState) }; const w = function () { n = !0 }; x.addEventListener("error", w), x.addEventListener("timeout", w), x.addEventListener("abort", w), x.addEventListener("progress", (function (t) { y < 3 ? m(3) : e.readyState <= 3 && x.dispatchEvent("readystatechange", {}) })), "withCredentials" in e && (x.withCredentials = !1), x.status = 0; for (let e of Array.from(s.concat(r))) x[`on${e}`] = null; if (x.open = function (e, r, s, i, c) { y = 0, n = !1, o = !1, t.headers = {}, t.headerNames = {}, t.status = 0, t.method = e, t.url = r, t.async = !1 !== s, t.user = i, t.pass = c, a = {}, a.headers = {}, m(1) }, x.send = function (n) { let u, l; for (u of ["type", "timeout", "withCredentials"]) l = "type" === u ? "responseType" : u, l in x && (t[u] = x[l]); t.body = n; const f = d.listeners("before"); var p = function () { if (!f.length) return function () { for (u of (c(s, e, x), x.upload && c(s.concat(r), e.upload, x.upload), o = !0, e.open(t.method, t.url, t.async, t.user, t.pass), ["type", "timeout", "withCredentials"])) l = "type" === u ? "responseType" : u, u in t && (e[l] = t[u]); for (let n in t.headers) { const o = t.headers[n]; n && e.setRequestHeader(n, o) } e.send(t.body) }(); const n = function (e) { if ("object" == typeof e && ("number" == typeof e.status || "number" == typeof a.status)) return i(e, a), "data" in e || (e.data = e.response || e.text), void m(4); p() }; n.head = function (e) { i(e, a), m(2) }, n.progress = function (e) { i(e, a), m(3) }; const d = f.shift(); 1 === d.length ? n(d(t)) : 2 === d.length && t.async ? d(t, n) : n() }; p() }, x.abort = function () { u = -1, o ? e.abort() : x.dispatchEvent("abort", {}) }, x.setRequestHeader = function (e, n) { const o = null != e ? e.toLowerCase() : void 0, r = t.headerNames[o] = t.headerNames[o] || e; t.headers[r] && (n = t.headers[r] + ", " + n), t.headers[r] = n }, x.getResponseHeader = e => p(a.headers[e ? e.toLowerCase() : void 0]), x.getAllResponseHeaders = () => p(f(a.headers)), e.overrideMimeType && (x.overrideMimeType = function () { e.overrideMimeType.apply(e, arguments) }), e.upload) { let e = l(); x.upload = e, t.upload = e } return x.UNSENT = 0, x.OPENED = 1, x.HEADERS_RECEIVED = 2, x.LOADING = 3, x.DONE = 4, x.response = "", x.responseText = "", x.responseXML = null, x.readyState = 0, x.statusText = "", x }; y.UNSENT = 0, y.OPENED = 1, y.HEADERS_RECEIVED = 2, y.LOADING = 3, y.DONE = 4; var v = { patch() { h && (n.XMLHttpRequest = y) }, unpatch() { h && (n.XMLHttpRequest = h) }, Native: h, Xhook: y }; function b(e, t, n, o) { return new (n || (n = Promise))((function (r, s) { function a(e) { try { c(o.next(e)) } catch (e) { s(e) } } function i(e) { try { c(o.throw(e)) } catch (e) { s(e) } } function c(e) { var t; e.done ? r(e.value) : (t = e.value, t instanceof n ? t : new n((function (e) { e(t) }))).then(a, i) } c((o = o.apply(e, t || [])).next()) })) } const g = n.fetch; function E(e) { return e instanceof Headers ? m([...e.entries()]) : Array.isArray(e) ? m(e) : e } function m(e) { return e.reduce(((e, [t, n]) => (e[t] = n, e)), {}) } const x = function (e, t = { headers: {} }) { let n = Object.assign(Object.assign({}, t), { isFetch: !0 }); if (e instanceof Request) { const o = function (e) { let t = {}; return ["method", "headers", "body", "mode", "credentials", "cache", "redirect", "referrer", "referrerPolicy", "integrity", "keepalive", "signal", "url"].forEach((n => t[n] = e[n])), t }(e), r = Object.assign(Object.assign({}, E(o.headers)), E(n.headers)); n = Object.assign(Object.assign(Object.assign({}, o), t), { headers: r, acceptedRequest: !0 }) } else n.url = e; const o = d.listeners("before"), r = d.listeners("after"); return new Promise((function (t, s) { let a = t; const i = function (e) { if (!r.length) return a(e); const t = r.shift(); return 2 === t.length ? (t(n, e), i(e)) : 3 === t.length ? t(n, e, i) : i(e) }, c = function (e) { if (void 0 !== e) { const n = new Response(e.body || e.text, e); return t(n), void i(n) } u() }, u = function () { if (!o.length) return void l(); const e = o.shift(); return 1 === e.length ? c(e(n)) : 2 === e.length ? e(n, c) : void 0 }, l = () => b(this, void 0, void 0, (function* () { const { url: t, isFetch: o, acceptedRequest: r } = n, c = function (e, t) { var n = {}; for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]); if (null != e && "function" == typeof Object.getOwnPropertySymbols) { var r = 0; for (o = Object.getOwnPropertySymbols(e); r < o.length; r++)t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]) } return n }(n, ["url", "isFetch", "acceptedRequest"]); return e instanceof Request && c.body instanceof ReadableStream && (c.body = yield new Response(c.body).text()), g(t, c).then((e => i(e))).catch((function (e) { return a = s, i(e), s(e) })) })); u() })) }; var w = { patch() { g && (n.fetch = x) }, unpatch() { g && (n.fetch = g) }, Native: g, Xhook: x }; const O = d; return O.EventEmitter = l, O.before = function (e, t) { if (e.length < 1 || e.length > 2) throw "invalid hook"; return O.on("before", e, t) }, O.after = function (e, t) { if (e.length < 2 || e.length > 3) throw "invalid hook"; return O.on("after", e, t) }, O.enable = function () { v.patch(), w.patch() }, O.disable = function () { v.unpatch(), w.unpatch() }, O.XMLHttpRequest = v.Native, O.fetch = w.Native, O.headers = f, O.enable(), O }();
		}


		if (xhook != null && settings.wxsBlockXHREnable)
		{
			if (!dev) dev = wykopxSettings.getPropertyValue("--wxsDev") ? wykopxSettings.getPropertyValue("--wxsDev") === '1' : false;

			const allowed = ['https://wykop.pl/api/', 'https://raw.githubusercontent.com/wykopx/', 'wykopx.pl']; // allowed.push();
			if (settings.wxsBlockXHRExternal)
			{

			}

			const prohibited = [];
			if (settings.wxsBlockXHRInternalAds) prohibited.push("https://wykop.pl/api/v3/ads");

			if (settings.rightSidebarHidePopularTags) prohibited.push("https://wykop.pl/api/v3/tags/popular?sidebar=true");
			if (settings.rightSidebarHideRelatedTags) prohibited.push("/related?sidebar=true");

			//if (settings.rightSidebarHideEntriesHot) prohibited.push("https://wykop.pl/api/v3/entries?sort=hot&last_update=6");
			if (settings.rightSidebarHideEntriesActive) prohibited.push("https://wykop.pl/api/v3/entries?sort=active&sidebar=true");
			if (settings.rightSidebarHideEntriesPopular) prohibited.push("https://wykop.pl/api/v3/entries?sort=hot&last_update=12&sidebar=true");
			if (settings.rightSidebarHideUpcomingActive) prohibited.push("https://wykop.pl/api/v3/links?type=upcoming&sort=active&sidebar=true");
			if (settings.rightSidebarHideHits) prohibited.push("https://wykop.pl/api/v3/hits/links?sort=day&sidebar=true");
			if (settings.rightSidebarHideLinksNewest) prohibited.push("&sort=newest&sidebar=true");
			if (settings.rightSidebarHideLinksActive) prohibited.push("&sort=active&sidebar=true");
			// if (settings.rightSidebarHideLinksPopular) prohibited.push(""); // popularne w kategorii https://wykop.pl/api/v3/search/links?sort=popular&category=rozrywka&date_from=2024-02-16+24:30:06&sidebar=true

			//		https://wykop.pl/api/v3/entries?sort=active&sidebar=true
			//		https://wykop.pl/api/v3/entries?sort=hot&last_update=24&sidebar=true
			//		https://wykop.pl/api/v3/entries?sort=hot&last_update=12&sidebar=true


			//		https://wykop.pl/api/v3/hits/links?sort=day&sidebar=true
			//		https://wykop.pl/api/v3/hits/links?sort=week&sidebar=true

			//		https://wykop.pl/api/v3/links?type=homepage&sort=newest&sidebar=true
			//		https://wykop.pl/api/v3/links?type=upcoming&sort=newest&sidebar=true
			//		https://wykop.pl/api/v3/links?type=upcoming&sort=active&sidebar=true
			//		https://wykop.pl/api/v3/links?type=homepage&sort=active&sidebar=true
			//		https://wykop.pl/api/v3/links/stats/upcoming


			//		https://wykop.pl/api/v3/search/links?sort=popular&bucket=17c344d6871fcac52893&sidebar=true
			//		https://wykop.pl/api/v3/search/entries?sort=popular&bucket=17c344d6871fcac52893&sidebar=true
			//		https://wykop.pl/api/v3/search/links?sort=popular&category=rozrywka&date_from=2024-02-16+24:30:06&sidebar=true

			//		https://wykop.pl/api/v3/tags/polska/related?sidebar=true
			//		https://wykop.pl/api/v3/tags/popular?sidebar=true

			//		https://wykop.pl/api/v3/buckets/status
			//		https://wykop.pl/api/v3/notifications/status
			//		https://wykop.pl/api/v3/notifications/tags?page=1
			//		https://wykop.pl/api/v3/notifications/entries?page=1
			//		https://wykop.pl/api/v3/pm/conversations

			xhook.before((request, callback) =>
			{
				if (allowed.some(str => request.url.includes(str)) && !prohibited.some(str => request.url.includes(str)))
				{
					if (settings.wxsBlockXHRConsoleLogAllowed) console.log("Wykop XS: XHR Blocker | XHR: 🌍 " + request.url);
					callback();
				}
				else
				{
					if (settings.wxsBlockXHRConsoleLogBlocked) console.log("Wykop XS: XHR Blocker | XHR: ⛔ " + request.url + " (BLOCKED)");
				}
			});
		}

		if (xhook != null && (settings.infiniteScrollEntriesEnabled || settings.infiniteScrollLinksEnabled))
		{
			xhook.after((request, response) =>
			{
				// if(dev) console.log("✔ xhook.after-request: " + request.url);
				// if(dev) console.log(request);
				// if(dev) console.log("✔ xhook.after-response");
				// if(dev) console.log(response);

				if (response.status == 200 && request.url.endsWith("page=1"))
				{
					// if(dev) console.log("request.url.endsWith(page = 1)")
					if ((settings.infiniteScrollEntriesEnabled && pageType == "wpis") || (settings.infiniteScrollLinksEnabled && pageType == "znalezisko"))
					{
						let url = null;

						try
						{
							url = new URL(request.url);
						}
						catch
						{
							return
						}

						// if(dev) console.log("xhook.after-request.url");
						// if(dev) console.log(request.url);
						// if(dev) console.log(url);

						//if (url.host == "wykop.pl")
						if (1)
						{
							let searchParams = new URLSearchParams(url.searchParams)

							// if(dev) console.log("✔ xhook.after-url.href");
							// if(dev) console.log(url.href);
							// if(dev) console.log("✔ xhook.after-searchParams");
							// if(dev) console.log(searchParams);
							// if(dev) console.log(`✔ xhook.after-${url.href} searchParams.has('page'): ` + searchParams.has('page'))
							// if(dev) console.log(`✔ xhook.after-${url.href} searchParams.get('page'): ` + searchParams.get('page'))

							if (searchParams.has('page') && searchParams.get('page') == 1)
							{
								// if(dev) console.log("✔ xhook.after-INFINITE SCROLL");

								let regex = /\/api\/v3\/entries\/\d+\/comments$/;
								if (pageType == "znalezisko") regex = /\/api\/v3\/links\/\d+\/comments$/;

								// if(dev) console.log("url.pathname");
								// if(dev) console.log(url.pathname);

								if (regex.test(url.pathname))
								{
									let json = JSON.parse(response.text)
									// if(dev) console.log("json")
									// if(dev) console.log(json)

									for (let page = 2; page <= Math.ceil(json['pagination']['total'] / json['pagination']['per_page']); ++page)
									{
										searchParams.set('page', page.toString())

										let req = new XMLHttpRequest();
										req.open('GET', `${url.pathname} ? ${searchParams.toString()}`, false)

										for (let key of Object.keys(request.headers))
										{
											req.setRequestHeader(key, request.headers[key])
										}

										req.send(null)

										if (req.status !== 200)
										{
											break
										}

										let data = JSON.parse(req.responseText)['data']
										if (data.length === 0)
										{
											break
										}

										json['data'] = json['data'].concat(data)
									}

									// Hide pagination
									json['pagination']['total'] = 0

									// Override response text
									response.text = JSON.stringify(json)
								}
							}
						}
					}
				}
			});
		}















		// USUWANIE NATARCZYWYCH IFRAME, REKLAM I GDPR
		function removeAnnoyances()
		{
			consoleX("removeAnnoyances()", 1)

			if (settings.removeAnnoyancesIframes)
			{
				document.querySelectorAll("html > iframe, html > body > iframe").forEach((el) =>
				{
					removeFromDOM(el)
				});
			}

			if (settings.removeAnnoyancesAds)
			{

				/* removing .pub-slot-wrapper without .top .sidebar-1 oraz .screening -  causes Node not found error when loading further pages */
				/* .pub.slot-wrapper  classes: .stream-bottom`.stream-1 .stream-2 .stream-3 .stream-4 .stream-5 .stream-6 .stream-7 .stream-8 .market-1 .sidebar-2 .sidebar-3 .sponsored-1 .sponsored-2 */

				/* removing .pub-slot-wrapper without .top oraz .screening -  causes Node not found error when loading further pages */
				document.querySelectorAll(`.pub-slot-wrapper:not(.sidebar-1):not(.screening):not(.top):not(:has(section.premium-pub.link-block))`).forEach((el) =>
				{
					if (dev) console.log(`🧧 removeAnnoyancesAds - `, el)
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
				consoleX(`removeFromDOM()`, 1);

				if (Node instanceof Element)
				{
					consoleX("removeFromDOM(): REMOVING DOM Node", 1);
					// if(dev) console.log(Node)
					let nodeName = Node.nodeName;
					nodeName = nodeName.toLowerCase()
					// if(dev) console.log("nodeName:" + nodeName)
					if (!consoleData.annoyances[nodeName])
					{
						consoleData.annoyances[nodeName] = { count: 0 };
					}
					consoleData.annoyances[nodeName].count++;
					Node.remove();
				}

				consoleData.annoyances.count++;
				// if(dev) console.log("removeFromDOM(): REMOVED TOTAL: ", consoleData.annoyances.count)
				// if(dev) console.log("removeFromDOM(): consoleData:");
				// if(dev) console.log(consoleData);

				refreshConsole();
			}
		}






		/* CSS STYLES */
		CSS += `
	html { font-size: 6.25%; }
    body { font-size: 1.6rem; }                                             /* 10px * 1.6rem = 16 px -- https://nekocalc.com/px-to-rem-converter */
	body * { font-size: 14rem;  }
	body small { font-size: 0.8em; line-height: 0.9em; }
	
	.hidden { display: none!important; }

	section.editor>header>ul>li>i,                   			/* napisy przy ikonkach edytora */
    aside.profile-top>section>header>ul li,         			/* ikonki "Zgłoś", "Zablokuj" */
    aside.profile-top>section>header>ul li a,       			/* ikonka "Napisz do użytkownika"*/
    section.editor div.enter label,                 			/* przycisk wysyłania enterem */
    aside.tag-top aside ul > li.edit > a,            			/* edycja tagu autorskiego */
    section.popper > section.tooltip > footer > ul.icons > li, 	/* ikonki w menu kontekstowym */
    section.popper > section.tooltip > footer > ul.icons > li > a, /* ikonki w menu kontekstowym */
    section.link-page > section.link > section.link-block > section > article > section.actions > ul > li > ul > li > a  /* action menu znaleziska nadpisane przez a, span { font-size: 14rem; } */
    {
        font-size: 0;
    }

	section.link-block > section > article > header h1 a                        /* tytuł znaleziska */
    { font-size: 21rem!important; }
    section.link-block > section > article > header h2 a                        /* tytuł znaleziska */
    { font-size: 18rem!important; } 
	aside.left-panel > section.links > .content ul li a.hybrid span em          /* kategorie */
    { font-size: 16rem!important; }
	aside.profile-top > section > header > div h1 > a.username > span           /* nazwa nicku na profilu */
    { font-size: 22rem!important; }
    aside.profile-top > section > header > div h1                               /* nazwa nicku na profilu */
    {
        display: flex;
        align-items: center;
    }
	`;

		if (settings.editorSendHotkey != "domyslnie")
		{
			if (settings.editorSendHotkeyShowOnSendButton)
			{
				CSS += `
			section.editor > footer > div.buttons > div.button.send > button.target
			{
				display: flex;
				flex-wrap: nowrap;
				flex-direction: row;
				column-gap: 4rem;
				text-transform: capitalize;
			}
			section.editor > footer > div.buttons > div.button.send > button.target::before
			{
				content: var(--editorSendHotkey);
				text-transform: initial;
				border-right: 1px solid var(--gullGray);
				padding-right: 4rem;
			}`;
			}
		}

		if (settings.imageUploaderEnable)
		{
			CSS += `
		/* IMAGE UPLOADER */
		section.editor figure.wxs_uploaded_image_placeholder
		{
			display: flex;
			position: relative;	
		}
		section.editor div.wxs_uploader_caption > span
		{
			display: none;
			font-size: 15rem;
			color: var(--gullGray);
			text-transform: initial;
			position: relative;
			margin-top: 15rem;
			padding-top: 15rem;
			margin-bottom: 15rem;
			border-top: 1px dotted rgba(120, 120, 120, 0.3);
		}
		section.editor:has(aside li.photo) div.wxs_uploader_caption > span.wxs_upload_and_replace_current_image,
		section.editor:not(:has(aside li.photo)) div.wxs_uploader_caption > span.wxs_upload_first_image
		{
			display: flex;
		}
		section.editor figure.wxs_uploaded_image_placeholder:has(canvas)
		{
			margin: 20px 0px;
			border-radius: 4px!important;
			display: flex;
			flex-direction: row-reverse;
			flex-wrap: wrap-reverse;
			justify-content: start;
			align-content: start;
			gap: 10px;
		}
		section.editor figure.wxs_uploaded_image_placeholder > canvas
		{
			display: none;
		}
		section.editor:has(aside li.photo) figure.wxs_uploaded_image_placeholder > canvas
		{
			display: flex;
			max-width: 400px!important;
			border: 1px solid var(--whiteOpacity07, rgba(128, 128, 128, 0.7))!important;
			border-radius: 4px!important;
			box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.3), -3px -3px 12px rgba(0, 0, 0, 0.3), 0px 0px 22px rgba(0, 0, 0, 0.3);
			opacity: 0.7;
			filter: brightness(0.8) grayscale(0.6);
		}
		section.editor:has(aside li.photo) figure.wxs_uploaded_image_placeholder > canvas:hover
		{
			max-width: 400px!important;
			opacity: 1;
			filter: brightness(1.3) grayscale(0)!important;
			border: 1px solid var(--whiteOpacity07, rgba(128, 128, 128, 0.7))!important;
		}
		/* ten plik zostanie wysłany (ostatni na liscie) */
		section.editor:has(aside li.photo) figure.wxs_uploaded_image_placeholder > canvas:nth-last-child(1 of canvas)
		{
			opacity: 1;
			filter: brightness(1.1) grayscale(0);
			border-color: rgba(21, 138, 255, .89)!important;
			border: 20px solid red;
		}



		/* lista wgranych plików wraz z nazwami */
		section.editor > aside > ul > li.photo > span
		{
			line-height: 24rem;
		}

		section.editor > aside > ul > li.photo::before
		{
			top: unset!important;
			left: unset!important;
		}
		section.editor > aside > ul > li.photo
		{
			padding: 8px 0px 8px 10px; 
			border-radius: 4px;
			background-color: rgba(255, 0, 0, 0.1);
			opacity: 0.6;
		}
		section.editor > aside > ul > li:nth-last-child(1 of li.photo)
		{
			opacity: 1;
			background-color: rgba(21, 138, 255, .01);
		}


		section.editor:has(aside li.photo) figure.wxs_uploaded_image_placeholder canvas.wxs_uploaded_image_preview::after
		{
			display: flex;
			font-size: 14px;
			color: rgba(254, 255, 255, 0.3);
			background-color: rgba(0, 0, 0, 0.7);
			border: 1px solid rgba(0, 0, 0, 1);
			position: absolute;
			left: 10px;
			bottom: 10rem;
			padding: 4px 11px;
			border-radius: 3px;
		}
		section.editor:has(aside li.photo) figure.wxs_uploaded_image_placeholder canvas.wxs_uploaded_image_png::after
		{
			content: "PNG";
		}
		section.editor:has(aside li.photo) figure.wxs_uploaded_image_placeholder canvas.wxs_uploaded_image_jpeg::after,
		section.editor:has(aside li.photo) figure.wxs_uploaded_image_placeholder canvas.wxs_uploaded_image_jpeg::after
		{
			content: "JPEG";
		}
		section.editor:has(aside li.photo) figure.wxs_uploaded_image_placeholder canvas.wxs_uploaded_image_gif::after
		{
			content: "GIF";
		}
		section.editor:has(aside li.photo) figure.wxs_uploaded_image_placeholder canvas.wxs_uploaded_image_webp::after
		{
			content: "WEBP"; 
		}

		/* IMAGE UPLOADER - END */
	`;
		}

		if (settings.haveBanDisableTextarea)
		{
			CSS += `
			section.editor > div.content::before
			{
				content: var(--myUsernameAddingAs);
				display: flex;
				position: relative;
				color: var(--gullGray);
				font-size: 15rem;
				text-transform: initial;
				margin-top: 15rem;
				margin-bottom: 15rem;
				padding-bottom: 15rem;
				border-bottom: 1px dotted rgba(120, 120, 120, 0.3);
			}
			`;
		}

		if (settings.editorShowMyUsername)
		{
			CSS += `
			header.stream-top:has(+ section.editor) > h1::after
			{
				margin-left: 5rem;
				content: var(--myUsernameAS);
				text-transform: initial; 
			}
			section.editor > div.content::before
			{
				content: var(--myUsernameAddingAs);
				display: flex;
				position: relative;
				color: var(--gullGray);
				font-size: 15rem;
				text-transform: initial;
				margin-top: 15rem;
				margin-bottom: 15rem;
				padding-bottom: 15rem;
				border-bottom: 1px dotted rgba(120, 120, 120, 0.3);
			}
			`;

			if (settings.editorShowMyUsernameOnSendButton)
			{
				CSS += `
				section.editor > footer > div.buttons > div.button.send > button.target
				{
					display: flex;
					flex-wrap: nowrap;
					flex-direction: row;
					column-gap: 4rem;
					text-transform: capitalize;
				}
				section.editor > footer > div.buttons > div.button.send > button.target::after
				{
					content: var(--myUsernameAs);
					text-transform: initial;
				}
				`;
			}
		}

		if (settings.observedTagsInRightSidebarEnable)
		{
			CSS += `
		main.main > section > section.sidebar
		{
			display: flex;
			flex-direction: column;
		}
		section.wykopx_your_observed_tags
		{
			order: -9999;
			display: flex!important;
			flex-direction: column;
			gap: 16px;
		} 

		section.wykopx_your_observed_tags div.wykopx_quick_search_container
		{
			display: flex!important;
			width: 100%;
			position: relative;
		} 
		section.wykopx_your_observed_tags .wykopx_quick_search_container,
		section.wykopx_your_observed_tags > div.content
		{
			margin-top: 0px!important;
		} 

		section.wykopx_your_observed_tags .wykopx_quick_search_container input.wykopx_quick_search
		{
			box-sizing: border-box;
			width: 100%;
			height: 25px; /*25rem;*/
			font-size: 15px; /* 15rem; */
			padding: 17px 10px 17px 34px;
			opacity: 0.5;

			color: var(--colorLinkTag, rgba(47, 174, 255, 1));
			border: 1px solid var(--blackOpacity05, rgba(175, 175, 175, 0.5));
			background-color: var(--whiteOpacity01, rgba(175, 175, 175, 0.1));
		} 

		section.wykopx_your_observed_tags .wykopx_quick_search_container:hover input.wykopx_quick_search,
		section.wykopx_your_observed_tags .wykopx_quick_search_container       input.wykopx_quick_search:focus,
		section.wykopx_your_observed_tags .wykopx_quick_search_container       input.wykopx_quick_search:not(:placeholder-shown)
		{
			opacity: 1;
			background-color: var(--whiteOpacity03, rgba(175, 175, 175, 0.1));
		} 

		section.wykopx_your_observed_tags .wykopx_quick_search_container::before
		{
			content: "🔍";
			font-size: 16px; /*16rem;*/
			display: block;
			position: absolute;
			left: 8px;
			top: 6px;
			min-width: 20px;
			min-height: 20px;
			max-height: 20px;
			max-width: 20px;
		}`;
		}

		if (settings.quickLinksEnable)
		{
			CSS += `:root
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
			99% { display: flex; top: -20px; opacity: 0; }
			100% { display: none; top: -20px; opacity: 0; }
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
		header.header > div.left:has(a[href = "/"]:hover) > #wxs_quick_links > nav.home,
		header.header > div.left:has(> nav.main > ul > li:hover a[href = "/"]) > #wxs_quick_links > nav.home,
		header.header > div.left:has(> nav.main > ul > li a[href = "/"]:hover) > #wxs_quick_links > nav.home,
		header.header > div.left:has(> nav.main > ul > li:hover a[href = "/wykopalisko"]) > #wxs_quick_links > nav.upcoming,
		header.header > div.left:has(> nav.main > ul > li:hover a[href = "/mikroblog"]) > #wxs_quick_links > nav.microblog,
		header.header > div.left:has(> nav.main > ul > li:hover a[href = "/obserwowane"]) > #wxs_quick_links > nav.mywykop,
		header.header > div.left:has(> nav.main > ul > li:hover a[href = "/hity"]) > #wxs_quick_links > nav.hits,
		header.header > div.left:has(> nav.main > ul > li:hover a[href = "/ulubione"]) > #wxs_quick_links > nav.favorites,
		header.header > div.left:has(> nav.main > ul > li:hover a[href = "/dodaj-link"]) > #wxs_quick_links > nav.add_new,
		header.header > div.left:has(> nav.main > ul > li:hover a[href = "/mikroblog/#dodaj"]) > #wxs_quick_links > nav.add_new
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
			cursor: default ;
			width: max-content;
		}

		header.header > div.left > #wxs_quick_links > nav > section a,
		header.header > div.left > #wxs_quick_links > nav > section span
		{
			height: 100%;
			min-width: 70px;
			width: max-content;
		}

		header.header > div.left > #wxs_quick_links > nav > section.wxs_quicklink_short
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
		@media(max-width: 600px)
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
	} `;
		}

		/* HIDE ADS ALWAYS */
		CSS += `
			.pub-slot-wrapper
			{
				display: none!important;
			}
			.pub-slot-wrapper:has(section.premium-pub.link-block)
			{
				display: flex!important;
				border: 1px solid rgba(255, 0, 0, 0.3)!important;
			}
			.pub-slot-wrapper:has(section.premium-pub.link-block)::before
			{
				display: flex!important;
				content: "Aby ukryć Wykopy Sponsorowane i Reklamowane zainstaluj 𝗪𝘆𝗸𝗼𝗽 𝗫 𝗦𝘁𝘆𝗹𝗲 lub 𝗪𝘆𝗸𝗼𝗽 𝗫 𝗕𝗹𝗼𝗰𝗸𝗲𝗿";
				font-size: 13px;
				color: var(--blackish);
				margin: 9px 14px;
				align-self: self-start;
			}`;


		/* HIDE WYKOP XS PROMO FROM STYLUS */
		CSS += `body div.main-content[class] section > section.sidebar::after  { display: none!important; }`;


		/* ----- Wykop X Style promo banners ON */
		CSS += `.wykopx_promo_banner a 
			{ width: 100%; display: block!important; height: 300px!important; background: url('https://raw.githubusercontent.com/wykopx/wykopx-png/main/promo-images/wykopx-install-sidebar-day.png'); }
			[data-night-mode] .wykopx_promo_banner a
			{ background: url('https://raw.githubusercontent.com/wykopx/wykopx-png/main/promo-images/wykopx-install-sidebar-night.png'); }
			.wykopx_promo_banner:hover { filter: brightness(0.98) drop-shadow(0px 0px 3px rgba(0, 0, 0, 0.2)); }
			[data-night-mode] .wykopx_promo_banner:hover { filter: brightness(1.2); }

		body > section > header.header > div.left > nav.main > ul > li
		{
			white-space: nowrap!important;
			height: calc(100%-12px)!important;
			position: relative!important;
		}

		body > section > header.header > div.left > nav.main > ul > li > a
		{
			text-decoration: none!important;
			height: 100% !important;
			display: flex!important;
			flex-direction: column!important;
			justify-content: center!important;
			position: relative!important;
			font-weight: 400!important;
			padding: 0 12px!important;
		}
		body > section > header.header > div.left > nav.main > ul > li:hover a
		{
			background: rgba(255, 255, 255, 0.2)!important;
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


		


		section.editor.expand section.inline-autocomplete section.inline-autocomplete-stream div.content::after,
		header.header div.right section.search-input section.inline-autocomplete section.inline-autocomplete-stream div.content::after
		{ display: none!important; }

		/* ----- WykopXS new version available */
		.wykopxs_info_bar
		{ display: flex; align-items: center; border-bottom: 1px solid rgba(128, 128, 128, 0.2); color: rgba(128, 128, 128, 1); padding: 8px 20px; font-size: 14px; }

		aside.wykopxs_info_bar a
		{ display: inline-block; background: rgb(0, 85, 0); color: white; display: inline-block; background-color: #005200; padding: .3em 0.7em; margin: 0 10px; }

		aside.wykopxs_info_bar a:hover
		{ background: rgba(0, 85, 0, 0.7); text-decoration: none!important; }

		aside.wykopxs_info_bar footer
		{ opacity: 0.6; margin-left: auto; }

		@media(max-width: 640px)
		{
			body > section > aside.wykopxs_info_bar { flex-direction: column; padding-top: 30px; }
			body > section > aside.wykopxs_info_bar a { margin: 11px; padding: 14px; width: 100%; text-align: center; }
			body > section > aside.wykopxs_info_bar span.wykopxs_new_version_second,
			body > section > aside.wykopxs_info_bar > footer { display: none; }
		}
	`;













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
			// sectionEntryVoters.setAttribute('data-v-6e6ed6ee', '');
			// sectionEntryVoters.setAttribute('data-v-2aacfeb5', '');
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




		styleElement.textContent = CSS;
		document.head.appendChild(styleElement);
	}

})();
















// https://cdn.jsdelivr.net/gh/CoeJoder/waitForKeyElements.js@latest/waitForKeyElements.js
/**
 * A utility function for userscripts that detects and handles AJAXed content.
 *
 * @example
 * waitForKeyElements("div.comments", (element) => {
 *   element.innerHTML = "This text inserted by waitForKeyElements().";
 * });
 *
 * waitForKeyElements(() => {
 *   const iframe = document.querySelector('iframe');
 *   if (iframe) {
 *     const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
 *     return iframeDoc.querySelectorAll("div.comments");
 *   }
 *   return null;
 * }, callbackFunc);
 *
 * @param {(string|function)} selectorOrFunction - The selector string or function.
 * @param {function}          callback           - The callback function; takes a single DOM element as parameter.
 *                                                 If returns true, element will be processed again on subsequent iterations.
 * @param {boolean}           [waitOnce=true]    - Whether to stop after the first elements are found.
 * @param {number}            [interval=300]     - The time (ms) to wait between iterations.
 * @param {number}            [maxIntervals=-1]  - The max number of intervals to run (negative number for unlimited).
 */
function waitForKeyElements(selectorOrFunction, callback, waitOnce, interval, maxIntervals)
{
	if (typeof waitOnce === "undefined")
	{
		waitOnce = true;
	}
	if (typeof interval === "undefined")
	{
		interval = 300;
	}
	if (typeof maxIntervals === "undefined")
	{
		maxIntervals = -1;
	}
	if (typeof waitForKeyElements.namespace === "undefined")
	{
		waitForKeyElements.namespace = Date.now().toString();
	}
	var targetNodes = (typeof selectorOrFunction === "function")
		? selectorOrFunction()
		: document.querySelectorAll(selectorOrFunction);

	var targetsFound = targetNodes && targetNodes.length > 0;
	if (targetsFound)
	{
		targetNodes.forEach(function (targetNode)
		{
			var attrAlreadyFound = `data-userscript-${waitForKeyElements.namespace}-alreadyFound`;
			var alreadyFound = targetNode.getAttribute(attrAlreadyFound) || false;
			if (!alreadyFound)
			{
				var cancelFound = callback(targetNode);
				if (cancelFound)
				{
					targetsFound = false;
				}
				else
				{
					targetNode.setAttribute(attrAlreadyFound, true);
				}
			}
		});
	}

	if (maxIntervals !== 0 && !(targetsFound && waitOnce))
	{
		maxIntervals -= 1;
		setTimeout(function ()
		{
			waitForKeyElements(selectorOrFunction, callback, waitOnce, interval, maxIntervals);
		}, interval);
	}
}