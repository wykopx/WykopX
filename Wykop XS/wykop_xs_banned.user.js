// ==UserScript==
// @name                Wykop XS - Informacje o banach
// @name:pl             Wykop XS - Informacje o banach
// @name:en             Wykop XS - Ban Info
// @version             3.0.0


// @supportURL          http://wykop.pl/tag/wykopwnowymstylu
// @contributionURL     https://buycoffee.to/wykopx


// @author              Wykop X <wykopx@gmail.com>
// @namespace           Violentmonkey Scripts
// @match               https://wykop.pl/*


// @description         Wykop XS - Informacje o banach na profilach zbanowanych użytkowników. Wykop X Style znajdziesz na: http://styl.wykopx.pl
// @description:en      Wykop XS - Shows precise info about banned users on Wykop.pl. Check out Wykop X Style here: http://styl.wykopx.pl




// @require		https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js
// @require		http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require		https://greasyfork.org/scripts/383527-wait-for-key-elements/code/Wait_for_key_elements.js?version=701631
// @compatible	chrome, firefox, opera, safari, edge
// @license		No License

// ==/UserScript==

(async function ()
{
	'use strict';

	let loadTime = dayjs();
	const root = document.documentElement;
	const head = document.head;
	const body = document.body;
	const bodySection = body.querySelector("section");
	const wykopxSettings = getComputedStyle(document.querySelector("head"));
	const settings = {};

	settings.infoboxUserBannedInfoOnProfilePage = wykopxSettings.getPropertyValue("--infoboxUserBannedInfoOnProfilePage") ? wykopxSettings.getPropertyValue("--infoboxUserBannedInfoOnProfilePage") === '1' : true; 	// 1 || 0

	// WYKOP XS -- START
	// wykop_xs_banned_user.js
	if (settings.infoboxUserBannedInfoOnProfilePage)
	{
		waitForKeyElements("aside.profile-top:has(aside.info-box.red)", bannedUserProfileAside, false);

		// DODAJEMY INFO NA STRONIE PROFILOWEJ O SZCZEGÓŁACH BANA
		function bannedUserProfileAside(jNode)
		{
			const bannedUserObject = jNode[0]?.__vue__?.user; // jNode => DOMElement
			if (!bannedUserObject) return;

			if (bannedUserObject.status == "banned" || bannedUserObject.status == "suspended")
			{
				const bannedRedBox = jNode[0].querySelector("aside.info-box.red p");
				let bannedRedBoxInnerHTML = `To konto jest obecnie ${bannedUserObject.status == "suspended" ? "zawieszone do wyjaśnienia" : "zbanowane"}. <br/><br/><strong>Wykop X</strong>: <br/>`;

				bannedUserObject.banned.wxs_ban_end_date_string = bannedUserObject.banned.expired; 											// "2024-01-04 17:22:31"
				bannedUserObject.banned.wxs_ban_end_date_object = dayjs(bannedUserObject.banned.wxs_ban_end_date_string);
				bannedUserObject.banned.wxs_ban_end_in_years = bannedUserObject.banned.wxs_ban_end_date_object.diff(loadTime, 'year');		// 5 > koniec bana za "5" lat
				bannedUserObject.banned.wxs_ban_end_in_months = bannedUserObject.banned.wxs_ban_end_date_object.diff(loadTime, 'month');	// 3 > koniec bana za: "3" miesiące
				bannedUserObject.banned.wxs_ban_end_in_days = bannedUserObject.banned.wxs_ban_end_date_object.diff(loadTime, 'day');		// 31 > koniec bana za 31 dni
				bannedUserObject.banned.wxs_ban_end_in_days = bannedUserObject.banned.wxs_ban_end_date_object.diff(loadTime, 'day');		// 31 > koniec bana za 31 dni
				bannedUserObject.banned.wxs_reason_lowercase = bannedUserObject.banned.reason.toLowerCase();
				// banEndDateDuration = banEndDateObject.toNow()


				// "Użytkowniczka @NadiaFrance dsotała bana za naruszenie regulaminu"
				if (bannedUserObject.status == "suspended") bannedRedBoxInnerHTML += `${bannedUserObject.gender == "f" ? "Użytkowniczka @" + bannedUserObject.username + " została zawieszona za" : "Użytkownik @" + bannedUserObject.username + " został zawieszony za"} ${bannedUserObject.banned.wxs_reason_lowercase}`;
				else bannedRedBoxInnerHTML += `${bannedUserObject.gender == "f" ? "Użytkowniczka @" + bannedUserObject.username + " dostała" : "Użytkownik @" + bannedUserObject.username + " dostał"} bana za ${bannedUserObject.banned.wxs_reason_lowercase}`;

				if (bannedUserObject.banned.wxs_ban_end_in_years > 100)
				{
					// Ban permanentny na 999 lat
					bannedRedBoxInnerHTML += `<br/><small>Ban permanentny. Śpij słodko aniołku [*] </small>`;
				}
				else
				{
					// "Koniec bana za 14 dni"
					bannedRedBoxInnerHTML += `<br/><small title="Czas końca bana dotyczy czasu letniego. \nWykop posiada błąd i nie rozpoznaje czasu zimowego, \ndlatego zimą i jesienią ban trwa o godzinę dłużej niż podany">
						Koniec bana <strong>${bannedUserObject.banned.wxs_ban_end_in_years > 1 ? "za " + bannedUserObject.banned.wxs_ban_end_in_years + " lat(a)" : bannedUserObject.banned.wxs_ban_end_in_months > 1 ? "za " + bannedUserObject.banned.wxs_ban_end_in_months + " miesiące(ęcy)" : bannedUserObject.banned.wxs_ban_end_in_days > 1 ? "za " + bannedUserObject.banned.wxs_ban_end_in_days + " dni" : bannedUserObject.banned.wxs_ban_end_date_object.isSame(loadTime, 'day') == true ? " już dzisiaj!  " : " jutro"}</strong><br/>`;
					// "Ban trwa do 2024-12-12 23:59:59"
					bannedRedBoxInnerHTML += `Ban trwa do ${bannedUserObject.banned.wxs_ban_end_date_string}<span style="cursor: help; padding: 0px 5px">ℹ</span></small>`;
				}

				bannedRedBox.innerHTML = bannedRedBoxInnerHTML;
			}
		}
	}
	// WYKOP XS -- END

})();