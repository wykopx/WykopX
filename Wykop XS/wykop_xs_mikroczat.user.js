// ==UserScript==
// @name        Listy plusujących + MirkoCzat
// @name:pl     Listy plusujących + MirkoCzat
// @name:en     Listy plusujących + MirkoCzat
// @version     3.0.20


// @supportURL  		http://wykop.pl/tag/wykopwnowymstylu
// @contributionURL  	https://buycoffee.to/wykopx


// @author      Wykop X <wykopx@gmail.com>
// @namespace   Violentmonkey Scripts
// @match       https://wykop.pl/*


// @description Wykop X - Mikroczat.pl / Mirkoczat oraz dodanie usuniętej listy plusujących
// @description:en Wykop X - Mikroczat.pl / Mirkoczat and list of entry/comment voters


// @require https://unpkg.com/localforage@1.10.0/dist/localforage.min.js
// @require https://cdn.jsdelivr.net/npm/dayjs@1/dayjs.min.js


// @compatible  chrome, firefox, opera, safari, edge
// @license     No License

// ==/UserScript==
const promoString = "- Wykop X";
const head = document.head;
const styleElement = document.createElement('style');
let CSS = "";

let dev = true;


(async function ()
{
	// MIKROCZAT XS -- START
	let wykopDomain = "https://wykop.pl";
	let wxDomain = "https://wykopx.pl";
	const mikroczatDomain = "https://mikroczat.pl";
	const mikroczatPath = "/chat";
	let mikroczatChannel = "/";
	let mikroczatWindow = null;


	document.addEventListener("mousedown", (event) =>
	{
		if (!event.target.closest(".wykopx_open_mikroczat")) return;
		event.preventDefault();
		let windowOptions = "";
		let mikroczatURL = `${mikroczatDomain}`;

		if (event.shiftKey || event.ctrlKey || event.altKey || event.button === 2)
		{
			windowOptions = "popup";
		}

		// WykopXS unique
		const pathnameArray = new URL(document.URL).pathname.split("/");
		if (pathnameArray[1] == "tag")
		{
			mikroczatChannel = "/" + pathnameArray[2]; // nazwatagu
			mikroczatURL += `${mikroczatPath}${mikroczatChannel}`;
		}


		mikroczatWindow = window.open(mikroczatURL, 'mikroczat', windowOptions);
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
		console.log('Wiadomość z mikroczat.pl', event.data);
		//if (event.data == "MikroCzatOpened") mikroczatWindow.postMessage({ type: "token", token: window.localStorage.getItem("token") }, mikroczatDomain);
		if (event.data == "MikroCzatOpened") mikroczatWindow.postMessage({ type: "TokensObject", token: window.localStorage.getItem("token"), userKeep: window.localStorage.getItem("userKeep") }, mikroczatDomain);


		if (event.data == "MikroCzatLoggedIn") bodySection.dataset.mikroczatLogged = true;
		if (event.data == "MikroCzatClosed")
		{
			bodySection.dataset.mikroczatLogged = false;
			mikroczatWindow = null;
		}
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


	createNewNavBarButton({
		position: "left",
		// text: "Mikro<strong>czat</strong>",
		text: "Czat",
		title: `Otwórz wykopowy MikroCzat`,
		class: "open_mikroczat", // wykopx_open_mikroczat_li
		hideWithoutXStyle: false,
		url: mikroczatDomain,
		target: "mikroczat",
		icon: "https://i.imgur.com/9PvHlaA.png",
		number: null,
	})






	const debounce = (fn, time) =>
	{
		let timeoutHandler;
		return (...args) =>
		{
			clearTimeout(timeoutHandler);
			timeoutHandler = setTimeout(() =>
			{
				fn(...args)
			}, time);
		}
	}
	let debounceAddVotersList = debounce((target) => addVotersList(target), 1000);


	let parentNode = document.body;
	let observer = new MutationObserver((mutations) =>
	{
		mutations.forEach((mutation) =>
		{
			for (let node of mutation.addedNodes)
			{
				if (node.matches && node.matches('section.entry'))
				{
					addVotersList(node);
				}

				else if (node.matches && node.matches('div.content'))
				{
					let sectionEntryArray = node.querySelectorAll('section.entry');
					if (sectionEntryArray)
					{
						sectionEntryArray.forEach((el) =>
						{
							addVotersList(el);
						})
					}
				}

				else if (node.nodeName == "SECTION" && node.parentNode && node.parentNode.matches('div.edit-wrapper')) // node.nodeName === "#text" && 
				{
					let sectionEntryAncestor = node.parentNode.closest('section.entry');
					if (sectionEntryAncestor)
					{
						// addVotersList(sectionEntryAncestor);
					}
				}
			}
		});
	});

	let config = { childList: true, subtree: true };
	observer.observe(parentNode, config);









	CSS += `
	section.entry-voters
	{
		ul
		{
			display: block flex;
			gap: 0.5em;
			align-items: baseline;
			flex-wrap: wrap;

			padding: 0 0 0 0;
			margin: 0;
			list-style-type: none;
			position: relative;
			font-size: 12px;
			color: var(--gullGray);

			
			&::before
			{
				content: "Plusujący: ";
			}

			li
			{
				a.username
				{
					
					span
					{

					}

					&.banned, &.suspended
					{
						color: 
					}
				}

				&.more
				{
					cursor: pointer;
					font-weight: 700;
					text-transform: uppercase;
				}
			}
		}
	}

	section.entry-voters ul li a.username i { display: none; font-size: 0.8em; font-style: normal; bottom: 1px; position: relative; }
	section.entry-voters ul li a.username i:has(+span) { margin-right: 1px; }
	section.entry-voters ul li a.username i.follow-true,
	section.entry-voters ul li a.username i.blacklist-true,
	section.entry-voters ul li a.username i.banned ,
	section.entry-voters ul li a.username i.suspende,
	section.entry-voters ul li a.username i.removed,
	section.entry-voters ul li a.username i.f-gender,
	section.entry-voters ul li a.username i.m-gender
	{ display: inline flex;} 
	
	section.entry-voters ul li a.username i.follow-true::before { content: '🔔'; }
	section.entry-voters ul li a.username i.blacklist-true::before { content: '🚯'; }
	section.entry-voters ul li a.username i.banned::before { content: '🍌'; }
	section.entry-voters ul li a.username i.suspended::before { content: '✖'; }
	section.entry-voters ul li a.username i.removed::before { content: '✖'; }
	section.entry-voters ul li a.username i.f-gender::before { content: '🟣'; font-size: 0.7em; bottom: 3px; }

	section.entry-voters ul li a.username.orange-profile { color: var(--gullGray); }
	section.entry-voters ul li:has(a.username.burgundy-profile) { order: 1; }
	section.entry-voters ul li:has(a.username.green-profile) { order: 3; }
	section.entry-voters ul li:has(a.username.orange-profile) { order: 3; }
	section.entry-voters ul li.more { order: 10; }
	`;

	/* Wykop X Style 3.0 */
	CSS += `
	:root { --kolorBananowy1: rgba(255, 185, 0, 1); }
	section.entry-voters ul li a.username:is(.banned, .suspended):not(.removed) span  { color: var(--kolorBananowy1);
	section.entry-voters ul li a.username.removed { color: rgb(0, 0, 0) }
	[data-night-mode] section.entry-voters ul li a.username.removed { background-color: rgba(255, 255, 255, 0.3); padding-left: 5rem; padding-right: 5rem;
	`

	styleElement.textContent = CSS;
	document.head.appendChild(styleElement);

})();







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


document.addEventListener('click', async function (event)
{
	if (!event.target.matches('li.more span')) return;
	event.preventDefault();
	let voters = await fetchAllVotersFromAPI(event.target.dataset.entryId, event.target.dataset.commentId);
	let entry = event.target.closest(`section.entry`);
	appendVotersToEntry(entry, voters);

}, false);






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
			nav_ul_li.dataset["v-5182b5f6"] = "";
			nav_ul_li_a.dataset["v-5182b5f6"] = "";

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

function getListItemForUser(voter)
{
	let userHTML = `<li data-v-6e6ed6ee="">
				<a data-v-ed9f6c56="" data-v-6e6ed6ee="" href="/ludzie/${voter.username}" class="username`;

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


	if (voter.follow) userHTML += `<i class="follow-true" title="Obserwujesz tego użytkownika"></i>`;
	if (voter.verified) userHTML += `<i class="verified-true" title="Ten użytkownik jest zweryfikowany"></i>`;
	if (voter.blacklist) userHTML += `<i class="blacklist-true" title="Ten użytkownik jest na Twojej czarnej liście"></i>`;
	if (voter.online) userHTML += `<i class="online-true" title="Ten uzytkownik jest teraz online"></i>`;
	if (voter.status == "banned") userHTML += `<i class="banned" title="Użytkownik dostał bana. Z dodatkiem Wykop XS - Ban Info możesz szybko sprawdzić przyczynę i długość trwania bana."></i>`;
	if (voter.status == "suspended") userHTML += `<i class="suspended" title="To konto jest w trakcie usuwania."></i>`;
	if (voter.status == "removed") userHTML += `<i class="removed" title="Konto usunięte"></i>`;
	if (voter.gender == "m") userHTML += `<i class="${voter.gender}-gender" title="Wpis od niebieskiego"></i>`;
	if (voter.gender == "f") userHTML += `<i class="${voter.gender}-gender" title="Plus od różowej"></i>`;

	userHTML += `<span data-v-ed9f6c56="">${voter.username}</span>
				</a>
			</li>`;

	return userHTML;
}


function addVotersList(sectionEntry)
{
	if (sectionEntry && sectionEntry?.__vue__ && sectionEntry?.__vue__.item.votes.up > 0)
	{
		appendVotersToEntry(sectionEntry, sectionEntry?.__vue__?.item?.votes?.users)
	}

}


function appendVotersToEntry(sectionEntry, voters)
{

	const fiveVoters = voters;

	if (!fiveVoters || fiveVoters.length < 1) return false;

	let sectionEntryVotersHTML = `<ul data-v-6e6ed6ee="">`;

	fiveVoters.forEach(voter =>
	{
		sectionEntryVotersHTML += getListItemForUser(voter);
	});

	if (sectionEntry?.__vue__?.item?.votes.up > 5 && voters.length <= 5)
	{
		sectionEntryVotersHTML += `
			<li data-v-6e6ed6ee="" data-no-bubble="" class="more">
				<span data-v-6e6ed6ee="" `;

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
	sectionEntryVoters.setAttribute('data-v-6e6ed6ee', '');
	sectionEntryVoters.setAttribute('data-v-2aacfeb5', '');
	sectionEntryVoters.innerHTML = sectionEntryVotersHTML;

	const sectionEntryVotersElement = sectionEntry.querySelector('section.entry-voters');
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
