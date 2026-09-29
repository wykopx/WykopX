// ==UserScript==
// @name							Wykop XS - Ban Info - Informacje o banach
// @name:pl							Wykop XS - Ban Info - Informacje o banach
// @name:en							Wykop XS - Ban Info

// @version							3.5.5

// @description 					Wykop XS - Informacje o banach na profilach zbanowanych użytkowników. Wykop X Style znajdziesz na: http://wykopx.pl/styl
// @description:en 					Wykop XS - Shows precise info about banned users on Wykop.pl. Check out Wykop X Style here: http://wykopx.pl/styl


// Chcesz wesprzeć projekt Wykop X? Postaw kawkę:
// @contributionURL					https://buycoffee.to/wykopx

// @author							Wykop X <wykopx@gmail.com>









// @match							https://wykop.pl/*
// @supportURL						http://wykopx.pl/tag/wykopx
// @namespace						Violentmonkey Scripts
// @compatible						chrome, firefox, opera, safari, edge
// @license							No License
// @icon							https://www.google.com/s2/favicons?sz=64&domain=wykopx.pl


// @require							https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js







// ==/UserScript==

(async function ()
{
    'use strict';

    const currentVersion = "3.5.5";
    let dev = false;

    const promoString = " - Wykop XS / #wykopx";

    const root = document.documentElement;
    const head = document.head;
    const body = document.body;

    const bodySection = body.querySelector("section");
    /* WYŁĄCZENIE DRZEWA KOMENTARZY I NOWEGO MIKROBLOGA */
    bodySection?.__vue__?.$store?.commit("config/setCommentsTreeEnabled", false);
    /* WYŁĄCZENIE DRZEWA KOMENTARZY I NOWEGO MIKROBLOGA */


    const wykopxSettings = getComputedStyle(head);
    const settings = {};

    /* WYŁĄCZENIE DRZEWA KOMENTARZY I NOWEGO MIKROBLOGA */
    document.querySelector("body > section")?.__vue__?.$store?.commit("config/setCommentsTreeEnabled", false);
    /* WYŁĄCZENIE DRZEWA KOMENTARZY I NOWEGO MIKROBLOGA */


    const styleElement = document.createElement('style');
    styleElement.id = "wykopxs_ban_info";
    let CSS = "";

    function setSettingsValueFromCSSProperty(settingName, defaultValueForWykopXS = true, propertyValueInsteadOfBoolean = false)
    {
        if (propertyValueInsteadOfBoolean) settings[settingName] = wykopxSettings.getPropertyValue(`--${settingName}`) ? wykopxSettings.getPropertyValue(`--${settingName}`).trim() : defaultValueForWykopXS;
        else settings[settingName] = wykopxSettings.getPropertyValue(`--${settingName}`) ? wykopxSettings.getPropertyValue(`--${settingName}`).trim() === '1' : defaultValueForWykopXS;
    }

    setSettingsValueFromCSSProperty("WykopXSEnabled");
    if (settings.WykopXSEnabled == false) return;
    /* WYKOP XS HEADER */



    let loadTime = dayjs();

    // wykop_xs_banned.user.js - START - 1
    setSettingsValueFromCSSProperty("infoboxUserBannedInfoOnProfilePage");
    // wykop_xs_banned.user.js - END - 1

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

                bannedRedBoxInnerHTML += `<br/><br/><ruby style="font-size: 0.6em; background-color: #ffb900; border-radius: 6px; corner-shape: squircle; border-color: #ffed26ff; color: black; padding: 0.2em 0.4em;">NOWOŚĆ</ruby> <br/>Szczegóły bana + historia banów użytkownika dostępne są teraz na: <a href="https://wykopx.pl/ludzie/${bannedUserObject.username}" target="wykopx" style="text-decoration: underline;"><strong>wykopx.pl</strong>/ludzie/${bannedUserObject.username}</a> `

                bannedRedBox.innerHTML = bannedRedBoxInnerHTML;
            }
        }
    }
    // wykop_xs_banned.user.js - END - 2












    /*
           GENERAL STYLES
	
           PODSTAWOWE STYLE DLA WYKOPU - WYKOP X STYLE, BLANK
           DLA WSZYSTKICH SKRYPTÓW WYKOP XS
           DLA ROZSZERZENIA Awesome Wykop X Extension
    */
    CSS += `
		

     /*

       === START GENERAL FOR WYKOP X STYLE, WYKOP XS, AWESOME WYKOP EXTENSION ===


       PODSTAWOWE STYLE DLA WYKOPU - WYKOP X STYLE, BLANK
       DLA WSZYSTKICH SKRYPTÓW WYKOP XS
       DLA ROZSZERZENIA Awesome Wykop X Extension
    */



    /* UKRYWANIE REKLAM */
    /* 🆗 */

        /* 2026-06-22 nowe natrętne reklamy */
        article:has(+ header),


        /* NIEKTÓRYCH NAPISÓW "REKLAMA" NIE DA SIĘ USUNĄĆ */
        [data-v-2d139c94]:before,
        [data-v-bd3ef0f9]:before,
        [data-v-30e10813]:before
        {
            content: "Wykop bez reklam - wejdź na www.wykopx.pl";
            text-transform: none;
        }

        /* 2026-09-24 aktualizacja nowych reklam */
        nav > div::before,
        nav > nav::before,
        nav > span::before,
        nav > header::before,
        nav > article::before,
        nav > section::before,

        header > div::before,
        header > nav::before,
        header > span::before,
        header > header::before,
        header > article::before,
        header > section::before,

        article > div::before,
        article > nav::before,
        article > span::before,
        article > header::before,
        article > article::before,
        article > section::before,

        section > div::before,
        section > nav::before,
        section > span::before,
        section > header::before,
        section > article::before,
        section > section::before,


        section[data-label="ad: top"] + section,
        section[data-label="ad: top"] + aside,
        section[data-label="ad: top"] + div,
        a[href^="https://wykop.pl/comments/"][target="_blank"],
        a[href^="https://wykop.pl/category/"][target="_blank"],
        a[href^="https://wykop.pl/tag/"][target="_blank"],
        a[href^="https://wykop.pl/article/"][target="_blank"],


        section.stream > nav,
        section.stream > span,
        /*  section.stream > aside  --- ukrywa nowy panel z filtrami na strnie tagu */

        section.stream > div:not(.content),
        section.stream > div.content > div:not(.notification-wrapper),

        section.stream > div.content > section:not([id], .no-items, .related-link, .item, .selected),

        section.stream > header:not(.stream-top),
        section.stream > section > div.content > section:not([id]),

        section.stream.tags-stream > article,
        section.stream.microblog > article,

        section > section.stream > div.content > nav,
        section > section.stream > div.content > span
        section > section.stream > div.content > article,
        section > section.stream > div.content > header:not(.stream-top),

        .stream section.stream > div.content > nav,
        .stream section.stream > div.content > span,
        .stream section.stream > div.content > article,
        .stream section.stream > div.content > header:not(.stream-top),

        .sidebar > *:not(.custom-sidebar, .conversation-list, .ban-alert),
        .sidebar > aside > section:not([id])
        {
            display: block!important;
            height: 0px!important;
            max-height: 0px!important;
            overflow: hidden!important;
            opacity: 0.01!important;
            user-select: none!important;
            pointer-events: none!important;
        }

        section.block-alert
        {
            display: none;
            border: 20px solid red!important;
        }

        /* NIEKTÓRYCH NAPISÓW "REKLAMA" NIE DA SIĘ USUNĄĆ */
        [data-v-2d139c94]:before,
        [data-v-30e10813]:before
        {
            content: "Wykop bez reklam - wejdź na www.wykopx.pl";
            text-transform: none;
        }



        .mgid-platform,
        .pub-slot-wrapper,
        div.content + nav,
        aside:has(.pub-slot-wrapper),
        div.main-content > main.main > section > div.content > section.home-page > section.home > section.stream > div.content > section.register.observer.active,
        div.main-content > main.main > section > div.content > section.home-page > section.home > section.stream > div.content > section.content.observer.active,

         /* UKRYWANIE ZNALEZISK "WYKOP SPONSOROWANY" */
        .pub-slot-wrapper:has(section.premium-pub.link-block)
        {
            display: none!important; min-height: 0px!important;
        }









    /*
        NOWY MIKROBLOG 2026-09-24

        - drzewo komentarzy
        - 4 zdjęcia do wpisu
        - plusy przesunięte na dół pod wpisem
    */
    @media (min-width: 580px)
    {
        div.content > section.thread > section.item > header,
        section.entry > section.thread > section.item > header
        {
            margin-right: 10px;

            & > div
            {
                width: 100%;
                align-content: center;
                margin-right: 40px;
            }

            div a.username + a[target="_blank"]
            {
                width: max-content;
                display: inline flex;
                flex-grow: 1;
            }
            /* tylko wpisy z numerkiem *******3 */
            div a.username + a[target="_blank"][href*="55/"]::after,
            div a.username + a[target="_blank"][href*="99/"]::after
            {
                content: "Otwórz wpis na: www.wykopx.pl" attr(href);
                max-width: 39ch;
                color: var(--apple);
                display: inline-block;
                white-space: nowrap;
                overflow: hidden;
                vertical-align: middle;
                margin-left: auto;
                cursor: text;
                pointer-events: unset;
                user-select: text;
            }
        }
    }

    /* PANEL CENZUROWANYCH TREŚCI ZMUSZAJĄCY DO ZALOGOWANIA */
    section:is(.tag-page, .link-page) .force-login-access-skeleton .info-box,
    .modal.login .info-box p {  font-size: 0;    }
    .tag-page .force-login-accebox ass-skeleton .info-box a    {        display: none;    }
    .modal.login .info-box p::before,
    .modal.login .info-box p::after,
    .force-login-access-skeleton .info-box p::before,
    .force-login-access-skeleton .info-box p::after    {        font-size: 0.8rem;    }
    .modal.login .info-box p::after,
    .force-login-access-skeleton .info-box p::after    {        font-weight: bolder;    }
    .tag-page .force-login-access-skeleton .info-box p::before
    {
        content: ' Wykop cenzuruje ten #tag. Na Wykopie musisz się zalogować by go otworzyć. Wszystkie ocenzurowane i ukryte #tagi są jednak dostępne dla niezalogowanych na stronie wykopx.pl. ';
    }
    .tag-page .force-login-access-skeleton .info-box p::after
    {
        content: ' Dodaj w adresie "wykop.pl" literę "x" aby przejść na wykopx.pl/tag/... i wejdź na tag bez cenzury i bez reklam.';
    }
    .link-page .force-login-access-skeleton .info-box p::before
    {
        content: ' Wykop cenzuruje ponad 30% znalezisk. Wszystkie ocenzurowane i ukryte znaleziska są jednak dostępne dla niezalogowanych na stronie wykopx.pl. ';
    }
    .link-page .force-login-access-skeleton .info-box p::after
    {
        content: ' Dodaj w adresie "wykop.pl" literę "x" aby przejść na wykopx.pl/link/... i otwórz znalezisko bez cenzury i bez reklam';
    }

    .modal.login .info-box p::before
    {
       content: ' Ta strona jest ocenzurowana przez Wykop. Możesz jednak otworzyć ją na stronie Wykop X. ';
    }
    .modal.login .info-box p::after
    {
        content: ' Wejdź na "wykopx.pl" i zobacz to bez cenzury.';
        font-weight: bolder;
    }


   /*
        RODO SRODO

        - ukrywa przycisk ⚙ 𝗣𝗿𝗶𝘃𝗮𝗰𝘆 𝘀𝗲𝘁𝘁𝗶𝗻𝗴𝘀
        - ukrywa okienko "We value your privacy"
        - przywraca możliwość scrollowania na całej stronie

        2026-09-26 Wykop dodał anty-blokowanie ukrywania okienka Privacy settings:
        <div class="app_gdpr--SPx19r" style="display: block !important;">
            <div class="ulheJb0a" style="display: flex;">

        // domyślnie włączone także w Wykop XS
    */
    body { overflow: initial!important; }





        body > div[class^="app_gdpr"]
        {
            & > *
            {
                display: none!important;
            }
        }


    /*
        UKRYCIE PRZYCISKÓW Google Accounts, Facebook Login, Apple login W LEWYM MENU
    */

  

        body > section aside.left-panel > section.login > div.buttons { display: none!important; }


    /*
        PLUSY W PRAWYM GÓRNYM ROGU
        NOWY UI WYKOPU Z 2026-09-25
        - przesunięcie przycisku do plusowania spod wpisu w prawy górny róg
    */


        section.thread section.item>footer
        {
            position: static!important;

            section.voting
            {
                z-index: 5;
                position: absolute;
                top: -1px;
                right: 0px;
            }
        }
        section.entry-page section.item > footer section.voting
        {
            top: 2px;
        }

        section.listing > div.content > section.thread > section.item > button.toggle,
        section.entry > section.thread > section.item > button.toggle { display: none!important; }
        section.comments > section.thread > section.item > button.toggle { display: none!important; }
 


    /*
       UKRYWANIE NOWEJ SEKCJI "WYBRANE DLA CIEBIE" (2026-05-05)

       .selected
       <section class="selected"><header></header><div class="content"><section class="stream selected-stream"><div class="content"><section id="link-123456" class="link-block">
    */


        section.stream section.selected,
        aside.left-panel ul li.selected
        {
            display: none!important;
        }






    /* naprawienie białego tła w liście rozwijanej na mikroblogu/tagach w Trybie Nocnym */


        select,
        ::picker(select)
        {
            --_select-background-color: var(--whitish);
            background-color: var(--_select-background-color)!important;

            appearance: base-select!important;
            cursor: default!important;
            border: 1px solid var(--cloud)!important;
            border-radius: 6px!important;

            font-weight: 500!important;
        }

        select::picker-icon {
            display: none;
        }

        ::picker(select)
        {
            flex-direction: column!important;
        }

        select::picker(select)
        {
            border: 1px solid var(--cloud)!important;
            border-radius: 0px 6px 6px 6px!important;
            padding-top: 10px!important;
            padding-bottom: 10px!important;
            min-width: 130px!important;
        }

        select:open::picker(select)
        {
            display: flex!important;
        }

        select:hover
        {
            border-color: var(--eastBay)!important;
            background-color: var(--tropicalBlue)!important;
        }

        option
        {
            background-color: var(--_select-background-color)!important;
            color: var(--tuna)!important;
            font-weight: 500!important;

            &:hover
            {
                color: var(--blackish)!important;
                background-color: var(--loafer)!important;
            }
        }



    /* UKRYWANIE W MENU PO LEWEJ PRZYCISKÓW RANKING, OSIĄGNIĘCIA, FAQ, O NAS, KONTAKT, REKLAMA, REGULAMIN */


        aside.left-panel > section.fixed:has(li.ranking)
        {
            display: none !important
        }
 
    /* UKRYWANIE PRZYCISKÓW "Doceń" do fralio.com */

        li.good-one { display: none!important; }
    

        main.main > section > div.content > section:is(.microblog-page) > section section.stream > div.content > section.entry:not(.own):not(.reply):has(> article > div.edit-wrapper > div.content > section.entry-content > div.wrapper a:is( [href^="/tag/43"], [href^="/tag/44"], [href^="/tag/45"], [href^="/tag/46"], [href^="/tag/47"],[href^="/tag/48"],[href^="/tag/49"],[href^="/tag/5"],[href^="/tag/6"],[href^="/tag/7"],[href="https:\/\/wordziel.pl\/"], [href="https:\/\/www.flagle.io\/"]))
        {
            display: none!important;
        }


    /* UKRYWANIE LINKÓW DO ZŁOŚLIWYCH SKRYPTÓW (exploity) KTÓRE MOGĄ WYKRADAĆ DANE I DOSTĘP DO KONTA */



        a[href^="https://a/"],
        a[onmouseover]
        {
            border: 1px solid goldenrod!important;
            border-radius: 8px;
            display: inline-block!important;
            user-select: none!important;
            pointer-events: none!important;
            background-color: #393434!important;
            padding-inline: 10px!important;
            color: red!important;
            margin-block: 20px;

            &:after
            {
                z-index: 9;
                display: block;
                line-height: 1rem;
                content: " Wykop X: Uważaj. Ten użytkownik dodał złośliwy link. Nie klikaj w niego. Niepożądane osoby mogą przejąć całkowitą kontrolę nad Twoim kontem i uzyskać dostęp do Twoich prywatnych informacji. Przejdź na www.wykopx.pl aby bezpiecznie przeglądać Wykop i nie być narażonym na oszustwa i utratę danych.";
                color:  goldenrod;
                font-size: 0.8rem;
                padding-bottom: 10px;

            }
        }

    /*  === END GENERAL FOR WYKOP X STYLE, WYKOP XS, AWESOME WYKOP EXTENSION === */



		`;










    /* HIDE WYKOP XS PROMO FROM STYLUS */
    CSS += `.wykopxs, body div.main-content[class] section > section.sidebar::after  { display: none!important; }`;



    styleElement.textContent = CSS;
    document.head.appendChild(styleElement);
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