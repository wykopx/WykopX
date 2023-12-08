// ==UserScript==
// @name        Wykop XS
// @name:pl     Wykop XS
// @name:en     Wykop XS
// @author      Wykop X <wykopx@gmail.com>
// @namespace   Violentmonkey Scripts
// @match       https://wykop.pl/*


// @require     https://unpkg.com/xhook@latest/dist/xhook.min.js
// @require     https://greasyfork.org/scripts/458629-depaginator-for-wykop-pl/code/Depaginator%20for%20Wykoppl.user.js
// @require     https://unpkg.com/localforage@1.10.0/dist/localforage.min.js
// @require     https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js
// @require     http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js
// @require     https://greasyfork.org/scripts/383527-wait-for-key-elements/code/Wait_for_key_elements.js?version=701631

// @supportURL  http://wykop.pl/tag/wykopwnowymstylu
// @contributionURL  https://buycoffee.to/sebastiandosiadlgo
// @compatible  chrome, firefox, opera, safari, edge
// @license     No License
// @description Wykop XS służy do wspomagania działania stylu "Wykop X Style", który jest wymagany do poprawnego działania niniejszego skryptu. Wykop X Style znajdziesz na: http://style.wykopx.pl
// @description:en Wykop XS is a helper script for userstyle "Wykop X Style" which modifies wykop.pl website and make it easier to use adding enhancements and new features. Check it out here: http://style.wykopx.pl

// @version     2.36.0
// ==/UserScript==

(async function ()
{
	'use strict';


	const currentVersion = "2.36.0";
	const dev = false;

	// user.username - nazwa zalogowanego uzytkownika


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

	settings.votingExplosion = (wykopxSettings.getPropertyValue("--votingExplosion") == `"true"`); // boolean
	settings.tagHeaderEditable = (wykopxSettings.getPropertyValue("--tagHeaderEditable") == `"true"`); // boolean
	settings.enableNotatkowator = (wykopxSettings.getPropertyValue("--enableNotatkowator") == `"true"`); // boolean
	settings.linksAnalyzerEnable = (wykopxSettings.getPropertyValue("--linksAnalyzerEnable") == `"true"`); // boolean
	settings.linksAnalyzerSortByVotesCount = (wykopxSettings.getPropertyValue("--linksAnalyzerSortByVotesCount") == `"true"`); // boolean
	settings.showObservedTagsAlphabetically = (wykopxSettings.getPropertyValue("--showObservedTagsAlphabetically") == `"true"`); // boolean
	settings.showObservedTagsInRightSidebar = (wykopxSettings.getPropertyValue("--showObservedTagsInRightSidebar") == `"true"`); // boolean

	settings.notatkowatorUpdateInterval = parseFloat(wykopxSettings.getPropertyValue("--notatkowatorUpdateInterval")); // number
	settings.homepagePinnedEntriesHideBelowLimit = parseFloat(wykopxSettings.getPropertyValue("--homepagePinnedEntriesHideBelowLimit")); // number
	settings.showObservedTagsInRightSidebarUpdateInterval = parseFloat(wykopxSettings.getPropertyValue("--showObservedTagsInRightSidebarUpdateInterval")); // number

	settings.WykopXStyleVersion = (wykopxSettings.getPropertyValue("--version").trim().slice(1, -1));


	if (dev) consoleX("Settings: ", 1);
	if (dev) console.log(settings);







	// przenoszenie na tagi:                              wykop.pl/#heheszki
	// i na profile użytkownikow:                         wykop.pl/@m__b
	// wyszukiwanie wpisów danej osoby w konkretnym tagu  wykop.pl/@m__b/#internet   albo  wykop.pl/#internet/@m__b/



	let hash = new URL(document.URL).hash;
	let pathname = new URL(document.URL).pathname;
	let pathnameArray = pathname.split("/");

	function hashAndPathNameLoad()
	{
		hash = new URL(document.URL).hash;
		pathname = new URL(document.URL).pathname;
		pathnameArray = pathname.split("/");
		consoleX(`hashAndPathNameLoad() - hash: ${hash}, pathname: ${pathname}`, 1)
	}



	(async () =>
	{
		consoleX("(async () => {", 1);

		let at, tag;
		if (wykopxSettings.getPropertyValue("--fixCaseSensitiveTagsRedirection"))
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
		smartRedirectBasedOnUserAndTag(at, tag);
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




	(async () =>
	{
		consoleX("(async () => {", 1);
		let showNotificationsNumberInTitleEntries = wykopxSettings.getPropertyValue("--showNotificationsNumberInTitleEntries");
		let showNotificationsNumberInTitleTags = wykopxSettings.getPropertyValue("--showNotificationsNumberInTitleTags");
		let showNotificationsNumberInTitleMessages = wykopxSettings.getPropertyValue("--showNotificationsNumberInTitleMessages");
	});


	/* dodaj liczbe powiadomien do tytulu strony na karcie */
	function setNewTitle()
	{


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








	/* Edytuj nagłówek tagu, aby przejść na inny tag */
	function quickSearchLoad()
	{
		consoleX("quickSearchLoad()", 1)
		waitForKeyElements(".wykopx_quick_search", quickSearch, false);
	}
	function tagHeaderEditableLoad()
	{
		consoleX("tagHeaderEditableLoad()", 1)
		if (settings.tagHeaderEditable)
		{

			waitForKeyElements(".main-content .main aside.tag-top .content header h1", tagHeaderEditable, false);
			if (pathnameArray[1] == "tag")
			{
				tagHeaderEditable();
			}
		}
	}

	function tagHeaderEditable(jNode)
	{
		if (typeof jNode === "undefined")
		{
			// if (dev) alert(`typeof jNode === "undefined"`)
			jNode = new Array();
			jNode[0] = $(".main-content .main aside.tag-top .content header h1");
		} else
		{
			// if (dev) alert(`typeof jNode: ${ jNode[0]}`)
		}

		let originalValue = $(jNode[0]).text().toLowerCase();
		// if (dev) alert(originalValue)
		$(jNode[0]).attr("contentEditable", "true");
		$(jNode[0]).attr("class", "wykopx_quick_search");
		$(jNode[0]).attr("data-wykopx-original-value", originalValue);

		let $wykopx_quick_search = $(".wykopx_quick_search");
		if (originalValue != "") 
		{
			$wykopx_quick_search.val(originalValue).trigger('change');
			$wykopx_quick_search.attr("data-wykopx-original-value", originalValue);
		}
	}

	function quickSearch(jNode)
	{
		if (typeof jNode === "undefined")
		{
			jNode = new Array();
			jNode[0] = $("input.wykopx_quick_search");
		}
		let $wykopx_quick_search = $(".wykopx_quick_search");

		let originalValue = "";
		//let originalValue = $(jNode[0]).text().toLowerCase();
		if (originalValue != "")
		{
			let originalValue = "#tesla"
			$(jNode[0]).attr("data-wykopx-original-value", originalValue);
			$wykopx_quick_search.val(originalValue).trigger('change');
			//$wykopx_quick_search.attr("data-wykopx-original-value", originalValue);
		}
	}


	$(document).on("blur keydown", "h1.wykopx_quick_search", function (e)
	{
		consoleX("blur keydown h1.wykopx_quick_search");

		if (e.type === "blur" || (e.type === "keydown" && e.which == 13))
		{
			e.preventDefault();
			const editedValue = $(this).text().toLowerCase();
			if (editedValue != $(this).attr("data-wykopx-original-value"))
			{
				smartRedirectBasedOnUserAndTag(getUserFromUrl(editedValue, " "), getTagFromUrl(editedValue, " ", ""));
			}
		}
	})

	$(document).on("blur keydown", "input.wykopx_quick_search", function (e)
	{
		if (e.type === "blur" || (e.type === "keydown" && e.which == 13))
		{
			consoleX("blur keydown input.wykopx_quick_search");
			e.preventDefault();
			const editedValue = $(this).val().toLowerCase();
			if (editedValue != $(this).attr("data-wykopx-original-value"))
			{
				smartRedirectBasedOnUserAndTag(getUserFromUrl(editedValue, " "), getTagFromUrl(editedValue, " ", ""));
			}
		}
	})
















	function addActionBoxesToAllEntriesAndComments()
	{
		consoleX("addActionBoxesToAllEntriesAndComments()", 1)
		$("section.entry").each(function ()
		{
			addWykopXActionBoxToEntryAndComment($(this))
		})
	}



	async function addWykopXActionBoxToEntryAndComment(jNode)
	{
		consoleX(`addWykopXActionBoxToEntryAndComment(jNode)`, 1);
		if (dev) console.log(jNode);



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
		if (dev) consoleX("mirkoukrywaczAddButtons(jNode)", 1);

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
			   <aside class="wykopxs_info_bar wykopx_hide_this_if_stylus_is_installed">Masz już działający skrypt Wykop XS. Aby Mirkoukrywacz działał, musisz zainstalować i włączyć w Stylusie <a href="http://wiki.wykopx.pl" target="_blank">Wykop X</a></aside>
			   <aside class="wykopxs wykopx_modal_mirkoukrywacz_is_turned_off wykopx_hide_this_if_mirkoukrywanie_is_turned_on">Wykop XS oraz Wykop X są zainstalowane poprawnie, ale Mirkoukrywacz jest wyłączony. Aby Mirkoukrywacz działał, włącz go w ustawieniach Stylusa. <A href="https://github.com/wykopx/WykopX/wiki/Extra#mirkoukrywacz" target="_blank">Zobacz instrukcję obsługi Mirkoukrywacza</a></aside>
			   <header class="wykopxs"><span>Mirkoukrywacz: </span?><span>Lista ukrytych elementów</span></header>
			   <section class="wykopxs wykopx_mirkoukrywacz_list_of_hidden_items">
				  <span class="wykopx_mirkoukrywacz_hidden_list_is_empty">Żadne treści nie zostały jeszcze zaznaczone do ukrycia</span>
			   </section>
			</div>
		</div>`;

		$("body").prepend(html);

		createNewProfileDropdownMenuItem("Wykop X - Mirkoukrywacz", "Wykop X - lista elementów ukrytych przez Mirkoukrywacz", "mirkoukrywacz", "mirkoukrywacz_open_modal_button");

		let modal = document.getElementById("wykopx_modal_mirkoukrywacz");
		let btn = document.getElementById("mirkoukrywacz_open_modal_button");
		//var span = document.getElementsByClassName("wykopx_close")[0];
		btn.onclick = function ()
		{
			mirkoukrywaczRefreshHideList();
			modal.style.display = "block";
		};
		/*	span.onclick = function() {
			modal.style.display = "none";
		}*/
		window.onclick = function (event)
		{
			if (event.target == modal)
			{
				modal.style.display = "none";
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









	/* RIGHT SIDEBAR - DODAJ LISTE OBSERWOWANYCH TAGÓW */
	function addObservedTagsToRightSidebar()
	{
		let observedTagsArray = [];
		let section_html = "";

		if (settings.showObservedTagsInRightSidebar)
		{
			consoleX("addObservedTagsToRightSidebar()", 1)

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




	// WYKOP X PROMO 
	const adjacentCode = `
	<style>
		/* wykop x promo ON */
	
		.wykopx_promo { width: 100%; display: block!important; height: 300px!important; background: url('https://raw.githubusercontent.com/wykopx/WykopX/main/promo-images/wykopx-install-sidebar-day.png'); }
		[data-night-mode] .wykopx_promo { background: url('https://raw.githubusercontent.com/wykopx/WykopX/main/promo-images/wykopx-install-sidebar-night.png'); }
	
		/* hide wykopxs features if wykopx is not installed */
		.wykopxs { display: none; }
	
		/* wykopxs-promo OFF */
		body div.main-content section > section.sidebar:after,
		section.editor.expand section.inline-autocomplete section.inline-autocomplete-stream div.content:after,
		header.header div.right section.search-input section.inline-autocomplete section.inline-autocomplete-stream div.content:after
		{ display: none!important; }
	
		/* wykopxs new version available, mirkoukrywacz modal info bar */
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
	</style>`;
	document.head.insertAdjacentHTML("beforeend", adjacentCode);

	/* checking for new versions */
	if (!dev) console.clear();
	consoleX("Sprawdzanie aktualizacji Wykop XS...");


	$.get(`https://raw.githubusercontent.com/wykopx/WykopX/main/old-versions/wykopxs.${currentVersion}.gif`)
		.done(function ()
		{
			addWykopXSNewVersionAvailableToast(); // new version available
			consoleX("Hej, jest nowa wersja skryptu Wykop XS. Wejdź na http://script.wykopx.pl i zaktualizuj go");
		})
		.fail(function ()
		{
			consoleX("Masz najnowszą wersję skryptu Wykop XS v." + currentVersion);
		});

	$.get(`https://raw.githubusercontent.com/wykopx/WykopX/main/old-versions/wykopxstyle.${settings.WykopXStyleVersion}.gif`)
		.done(function ()
		{
			addWykopXStyleNewVersionAvailableToast(); // new version available
			consoleX("Hej, jest dostępna nowa wersja styli Wykop X Style. Wejdź na http://style.wykopx.pl i zaktualizuj je");
		})
		.fail(function ()
		{
			consoleX("Masz najnowszą wersję styli Wykop X Style v." + settings.WykopXStyleVersion);
		});

	function hideWykopXSPromo()
	{
		$(`body div.main-content section > section.sidebar:after`).css("display: none!important;");
	}

	function addWykopXPromo()
	{
		let wykopxpromo = `<section class="wykopx_promo"></section>`;
		$(wykopxpromo).insertBefore(`section.sidebar > footer`);
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
		let wykopxstylenewversionavailabletoast = `
		<aside class="wykopxs_new_version wykopxs_info_bar">
			<span class="wykopxs_new_version_first">
				Dostępna jest nowa wersja styli Wykop X Style.
			</span>
			<a href="https://userstyles.world/style/8174/wykop-x-style" target="_blank" style="color: #fff!important;">
				Zaktualizuj Wykop X Style
			</a>
			<span class="wykopxs_new_version_second">
				do najnowszej wersji
			</span>
			<footer>
				Twoja wersja Wykop X Style to v.${settings.WykopXStyleVersion}
			</footer>
		</aside>`;
		$(wykopxstylenewversionavailabletoast).insertAfter(`body > section > header.header`);
	}

	// DEV RUN WITH DELAY
	function runWithDelay(f, time)
	{
		consoleX(`runWithDelay(f , ${time})`, 1);
		setTimeout(function ()
		{
			f();
		}, time);
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
						unreadNotifications["tags"]++;
						if ($(this).find(`div.content p.new-entry-with-observed-tag`).length > 0)
						{
							unreadNotifications["tags_new_entry_with_observed_tag"]++;
						} else if ($(this).find(`div.content p.new-link-with-observed-tag`).length > 0)
						{
							unreadNotifications["tags_new_link_with_observed_tag"]++;
						}
					} else if (lastWord == "entries")
					{
						unreadNotifications["entries"]++;
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
			createNewProfileDropdownMenuItem(`Powiadomienia z #tagów: (${unreadNotifications.tags})`, "Masz nowe powiadomienia z obserwowanych #tagów", "wykopx_notifications_tags", undefined, "/powiadomienia/tagi", "_self", null, unreadNotifications.tags);
		}
		if (unreadNotifications.entries > 0)
		{
			createNewProfileDropdownMenuItem(`Zawołania w komentarzach: (${unreadNotifications.entries})`, "Zawołano Cię w komentarzu", "wykopx_notifications_entries", undefined, "/powiadomienia/moje", "_self", null, unreadNotifications.entries);
		}
		if (unreadNotifications.pm > 0)
		{
			createNewProfileDropdownMenuItem(`Nowe wiadomości: (${unreadNotifications.pm})`, "Masz nowe, nieprzeczytane wiadomości prywatne", "wykopx_notifications_pm", undefined, "/wiadomosci", "_self", null, unreadNotifications.entries);
		}
	}


	const promoString = " [Tę funkcję sponsoruje dodatek Wykop X #wykopwnowymstylu]";

	function addWykopXButtonsToNavBar()
	{
		let $clone = $(`body header nav ul li:not(.active):not(:has(a[href="/wykopalisko"])):first`).clone();
		let $cloneHits = $clone.clone();
		let $cloneFavorites = $clone.clone();
		let $cloneMyWykop = $clone.clone();
		let $cloneAddNewEntry = $clone.clone();
		let $cloneAddNewLink = $clone.clone();
		let $cloneWykopWNowymStylu = $clone.clone();
		let $cloneInstallWykopX = $clone.clone();




		$cloneMyWykop
			.attr({
				class: "wykopxs wykopx_mywykop_li"
			})
			.find("a")
			.attr({
				href: "/obserwowane",
				class: "wykopxs wykopx_mywykop_button hybrid",
				title: `Mój Wykop ${promoString}`
			})
			.find("span")
			.text("Mój Wykop");




		$cloneHits
			.attr({
				class: "wykopxs wykopx_hits_li"
			})
			.css("display", "none")
			.find("a")
			.attr({
				href: "/hity",
				class: "wykopxs wykopx_hits_button hybrid",
				title: `Hity ${promoString}`
			})
			.find("span")
			.text("Hity");



		$cloneFavorites
			.attr({
				class: "wykopxs wykopx_favorites_li"
			})
			.css("display", "none")
			.find("a")
			.attr({
				href: "/ulubione",
				class: "wykopxs wykopx_favorites_button hybrid",
				title: `Ulubione ${promoString}`
			})
			.find("span")
			.text("Ulubione");



		$cloneAddNewLink
			.attr({
				class: "wykopxs wykopx_add_new_link_li wykopx_plus_li"
			})
			.css("display", "none")
			.find("a")
			.attr({
				href: "/dodaj-link",
				class: "wykopxs wykopx_add_new_link wykopx_plus_button hybrid",
				title: `Dodaj nowe Znalezisko ${promoString}`
			})
			.find("span")
			.text("+");




		$cloneAddNewEntry
			.attr({
				class: "wykopxs wykopx_add_new_entry_li wykopx_plus_li hybrid"
			})
			.css("display", "none")
			.find("a")
			.attr({
				href: "/mikroblog/#dodaj",
				class: "wykopxs wykopx_add_new_entry wykopx_plus_button hybrid",
				title: `Dodaj nowy wpis na Mirko ${promoString}`
			})
			.find("span")
			.text("+");




		$cloneInstallWykopX
			.attr({
				class: "wykopx-promo wykopx_install_wykopx_li hybrid"
			})
			.find("a")
			.attr({
				href: "https://bit.ly/wykopx_install_wykopx_button",
				target: "_blank",
				class: "wykopx-promo wykopx_install_wykopx_button hybrid",
				title: `Zainstaluj style CSS "𝗪𝘆𝗸𝗼𝗽 𝗫" w rozszerzeniu Stylus i odkryj dziesiątki dodatkowych funkcji Wykopu. Masz już zainstalowane rozszerzenie `,
			})
			.find("span")
			.text("Zainstaluj Wykop X Style");




		$cloneHits.insertAfter(`body header nav.main ul li:has(a[href="/wykopalisko"])`);
		$cloneFavorites.insertAfter(`body header nav.main ul li:has(a[href="/wykopalisko"])`);
		$cloneAddNewLink.insertAfter(`body header nav.main ul li:has(a[href="/wykopalisko"])`);
		$cloneAddNewEntry.insertAfter(`body header nav.main ul li:has(a[href="/mikroblog"])`);
		$cloneMyWykop.appendTo(`body header nav.main ul`);
		$cloneInstallWykopX.appendTo(`body header nav.main ul`);
	}

	function createNewProfileDropdownMenuItem(text, title, className, id = null, url = null, target = "_blank", icon = null, number = null)
	{
		$(`body header div.right nav ul li.account.dropdown ul.dropdown-body li.${className}_li`).remove();
		let $clonedDropdownItem = $(`body header div.right nav ul li.account.dropdown ul.dropdown-body li.settings`).clone();
		$clonedDropdownItem.attr({
			class: `${className}_li`
		});

		let $clonedDropdownItemLink = $clonedDropdownItem.find("a");
		$clonedDropdownItemLink.attr("href", url);
		$clonedDropdownItemLink.attr("target", target);
		$clonedDropdownItemLink.attr("class", className + "_button");
		$clonedDropdownItemLink.attr("id", id);
		$clonedDropdownItemLink.attr("title", title);
		$clonedDropdownItemLink.text(text);
		$clonedDropdownItem.appendTo(`body header div.right nav ul li.account.dropdown ul.dropdown-body`);
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
				createNewProfileDropdownMenuItem(`Powiadomienia z #tagów`, "Masz nowe powiadomienia z obserwowanych #tagów", "wykopx_notifications_tags", undefined, "/powiadomienia/tagi", "_self", null, null);
			}
			if (mojeLubTagi == "moje")
			{
				createNewProfileDropdownMenuItem(`Powiadomienia z #tagów`, "Masz nowe powiadomienia z obserwowanych #tagów", "wykopx_notifications_tags", undefined, "/powiadomienia/tagi", "_self", null, null);
				createNewProfileDropdownMenuItem(`Zawołania w komentarzach`, "Zawołano Cię w komentarzu", "wykopx_notifications_entries", undefined, "/powiadomienia/moje", "_self", null, null);
			}
			wykopx_notification_summary_url += mojeLubTagi;
		}
		let wykopx_notification_summary = `<li class="wykopxs wykopx_notification_summary notifications dropdown" title="Nowe powiadomienia ${promoString}"><a href="${wykopx_notification_summary_url}"><figure></figure></a></li>`;
		$(wykopx_notification_summary).prependTo(`header.header > .right > nav > ul`);
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







	// RATING BOX - <section class="rating-box"> -> PLUSOWANIE I MINUSOWANIE

	waitForKeyElements("section.rating-box", ratingBox, false);

	function ratingBox(jNodeRatingBox)
	{
		const ratingBox = jNodeRatingBox[0]; //  =jNode > DOMElement

		const homepagePinnedEntriesPlusesLimit = settings.homepagePinnedEntriesHideBelowLimit; // limit ukrywania wpisow przypietych na glownej

		const plusBtn = ratingBox.querySelector('li.plus');
		let plusesCount = plusBtn ? plusBtn.textContent : 0;
		const minusBtn = ratingBox.querySelector('li.minus');
		let minusesCount = minusBtn ? -1 * minusBtn.textContent : 0;
		let plusesMinusesTotal = plusesCount - minusesCount;

		let plusesBelowLimit = (plusesMinusesTotal < homepagePinnedEntriesPlusesLimit ? true : false); // czy wpis jest poniżej limitu ukrywania wpisow przypietych na glownej

		if (homepagePinnedEntriesPlusesLimit > 0)
		{
			addRatingCountData(ratingBox);
		}

		if (settings.votingExplosion)
		{
			votingExplosion(ratingBox);
		}


		// <section class="rating-box" data-pluses="269" data-minuses="0" data-pluses-minuses-total="269" data-pluses-below-limit="true">
		function addRatingCountData(ratingBox)
		{
			ratingBox.dataset.pluses = plusesCount;
			ratingBox.dataset.minuses = minusesCount;
			ratingBox.dataset.plusesMinusesTotal = plusesMinusesTotal;
			ratingBox.dataset.plusesBelowLimit = plusesBelowLimit;
		}


		// VOTING EXPLOSION
		function votingExplosion(ratingBox)
		{
			ratingBox.addEventListener('click', function (event)
			{
				var clickedButton = event.target;

				let count = 0;
				let vote = "voted"; // "voted", "unvoted"
				let action = "plused"; // "plused", "minused"
				let sign = "+";

				plusesCount = plusBtn ? plusBtn.textContent : 0;
				minusesCount = minusBtn ? -1 * minusBtn.textContent : 0;

				if (clickedButton.matches('button.plus.voted'))			// dodano plusa
				{
					action = "plused";
					vote = "voted";
					count = plusesCount;
				}
				else if (clickedButton.matches('button.plus:not(.voted)'))	// usunieto plusa
				{
					action = "plused";
					vote = "unvoted";
					count = plusesCount;
				}
				else if (clickedButton.matches('button.minus.voted')) 		//  dodano minusa
				{
					action = "minused";
					vote = "voted";
					sign = "-";
					count = minusesCount;
				}
				else if (clickedButton.matches('button.minus:not(.voted)')) // usunięto minusa
				{
					action = "minused";
					vote = "unvoted";
					sign = "-";
					count = minusesCount;
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

						newDiv.classList.add(`wykopxs-vote-animation`, `wykopxs-${vote}`, `wykopxs-${action}`); // class="wykopxs-vote-animation wykopxs-voted wykopxs-plused"

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

						newDiv.classList.add(`wykopxs-${color}`);

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

					addRatingCountData(ratingBox);

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
	}



	//	waitForKeyElements(`body > section > div.main-content > main.main > section > div.content > section.entry-page > section.entry > section.stream > div.content > section.entry`, minusyTutaj, false);

	//  body > section > div.main-content > main.main > section > div.content > section.entry-page > section.entry > section.stream > div.content > section.entry > div#entry-comments > section.stream > div.content > section.reply`

	function minusyTutaj(jNodeEntryBlock)
	{
		const entryBlock = jNodeEntryBlock[0]; // jNode => DOMElement

		alert(entryBlock)
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




	if (settings.linksAnalyzerEnable)
	{
		waitForKeyElements(`section.link-block[id^="link-"]`, linkBlock, false);
		// GM_wrench.waitForKeyElements(`section.link-block[id^="link-"]`, linkBlock, false);
	}

	const apiGetLink = "https://wykop.pl/api/v3/links/";
	/*
	<section id="link-7288349" class="link-block" 
		data-votes-up="183" data-votes-down="5" data-votes-count="178" data-voted="0" data-comments-count="10" data-comments-hot="false" data-hot="false" data-adult="false" data-created-at="2023-11-27 21:12:49" data-published-at="2023-11-28 15:22:38" data-title="Dwie awarie..." data-slug="dwie-awarie-w-ec-bedzin-wznowienie-dostaw-ciepla-w-koncu-tygodnia-rmf-24" data-description="Dwie awarie w (...)" data-source-label="www.rmf24.pl" data-source-u-r-l="https://www.rmf24.pl/regiony/slaskie/news..." data-source-type="anchor" data-tags="slaskie,bedzin,awaria,wydarzenia">
	*/

	function linkBlock(jNodeLinkBlock)
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

					linkBlock.dataset.votesUp = link_data.votes.up;							// 10
					linkBlock.dataset.votesDown = link_data.votes.down;						// -20
					linkBlock.dataset.votesCount = link_data.votes.count;					// -10 (suma wykopów i zakopów)
					link_data.votes.all = link_data.votes.up + link_data.votes.down; 		// 30  (łączna liczba głosów)
					linkBlock.dataset.votesAll = link_data.votes.all;
					link_data.votes.votesDownPercent = 0;
					link_data.votes.votesUpPercent = 0;

					if (link_data.votes.all > 0)
					{
						link_data.votes.votesDownPercent = Math.ceil(link_data.votes.down * 100 / link_data.votes.all);
						link_data.votes.votesUpPercent = Math.ceil(link_data.votes.up * 100 / link_data.votes.all);
					}
					linkBlock.dataset.voted = link_data.voted;
					linkBlock.dataset.commentsCount = link_data.comments.count;
					linkBlock.dataset.commentsHot = link_data.comments.hot;
					linkBlock.dataset.hot = link_data.hot;
					linkBlock.dataset.adult = link_data.adult;
					linkBlock.dataset.createdAt = link_data.created_at;
					linkBlock.dataset.publishedAt = link_data.published_at;
					linkBlock.dataset.title = link_data.title;
					linkBlock.dataset.slug = link_data.slug;
					linkBlock.dataset.description = link_data.description;
					linkBlock.dataset.sourceLabel = link_data.source.label;
					linkBlock.dataset.sourceURL = link_data.source.url;
					linkBlock.dataset.sourceType = link_data.source.type;
					linkBlock.dataset.tags = link_data.tags;

					// Znaleziska sortowane wg liczby wykopów
					if (settings.linksAnalyzerSortByVotesCount)
					{
						linkBlock.style.order = -1 * link_data.votes.count;  // style="order: -321"
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
					if (link_data.votes.all > 0)
					{
						sectionVoteBox.appendChild(votesMeter);
					}

				});
		}
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


	// if (wykopxSettings.getPropertyValue("--enableNotatkowator")) {
	//	waitForKeyElements("section.entry", addWykopXActionBoxToEntryAndComment, false);
	// }




	navigation.addEventListener("navigate", (event) =>
	{
		consoleX(`navigation.addEventListener("navigate", (event) =>`, 1);
		runWithDelay(hashAndPathNameLoad, 1000);
		categoryRedirectToMicroblogButton();
		runWithDelay(countNumberOfNotificationsOnDesktop, 1000);
		runWithDelay(autoOpenMoreContentEverywhere, 2000);
		runWithDelay(tagHeaderEditableLoad, 5000);
		runWithDelay(quickSearchLoad, 5000);

		runWithDelay(addActionBoxesToAllEntriesAndComments, 2000);
	});


	let user = {
		data: null,
		username: null
	};

	window.onload = function (event)
	{
		const topHeaderProfileButton = document.querySelector("body header > div.right > nav > ul > li.account a.avatar");
		user.username = topHeaderProfileButton.getAttribute("href").split('/')[2];
		// user = $("body > section > aside").data("user");

		if (user.username == null)
		{
			consoleX(`Cześć Anon. Nie jesteś zalogowany na Wykopie (⌐ ͡■ ͜ʖ ͡■)`);
		}
		else
		{
			consoleX(`Cześć ${user.username} (⌐ ͡■ ͜ʖ ͡■)`);
		}
		hashAndPathNameLoad();

		runWithDelay(countNumberOfNotificationsOnDesktop, 1000);
		addNotificationSummaryButtonToNavBar();
		addNightModeButtonToNavBar();

		addWykopXButtonsToNavBar();

		createNewProfileDropdownMenuItem("Wykop X - Informacje", "Otwórz stronę Wiki z informacjami o dodatku Wykop X", "wykopx_wiki", undefined, "http://wiki.wykopx.pl/", "_blank", null, null);

		unrollDropdowns();
		focusOnAddingNewMicroblogEntry();
		addExtraButtons();
		addWykopXPromo();

		hideWykopXSPromo();
		// categoryRedirectToMicroblogButton();
		mirkoukrywaczBuildListOfHiddenElements();
		runWithDelay(autoOpenMoreContentEverywhere, 1000);
		refreshOrRedirectOnHomeButtonClick();
		refreshOrRedirectOnMicroblogButtonClick();
		tagHeaderEditableLoad();
		quickSearchLoad();
		runWithDelay(addActionBoxesToAllEntriesAndComments, 2000);
		addObservedTagsToRightSidebar();
	};

})();