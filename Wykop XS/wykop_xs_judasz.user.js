// ==UserScript==
// @name							Wykop XS - Judasz
// @name:pl							Wykop XS - Judasz
// @name:en							Wykop XS - Judasz

// @version							3.0.81

// @description 					Wykop XS Judasz
// @description:en 					Wykop XS Judasz


// Chcesz wesprzeć projekt Wykop X? Postaw kawkę:
// @contributionURL					https://buycoffee.to/wykopx

// @author							Wykop X <wykopx@gmail.com>









// @match							https://wykop.pl/*
// @match							https://github.com/wykopx/*

// @supportURL						http://wykop.pl/tag/wykopx
// @namespace						Violentmonkey Scripts
// @compatible						chrome, firefox, opera, safari, edge
// @license							No License
// @icon							https://www.google.com/s2/favicons?sz=64&domain=wykop.pl


// @require							https://unpkg.com/localforage@1.10.0/dist/localforage.min.js
// @require							https://cdn.jsdelivr.net/npm/dayjs@1.11.10/dayjs.min.js
// @require							https://cdn.jsdelivr.net/npm/dayjs@1.11.10/locale/pl.js
// @require							https://cdn.jsdelivr.net/npm/dayjs@1.11.10/plugin/relativeTime.js




// ==/UserScript==


(async function ()
{
	'use strict';


	const currentVersion = "3.0.81";
	let dev = true;


	const root = document.documentElement;
	const head = document.head;
	const body = document.body;
	const bodySection = body.querySelector("section");

	dayjs.locale("pl");
	dayjs.extend(window.dayjs_plugin_relativeTime); //dayjs.extend(relativeTime); // https://day.js.org/docs/en/plugin/relative-time // https://www.jsdelivr.com/package/npm/dayjs?tab=files&path=plugin


	const token = localStorage.getItem('token');

	const seenObjects = [];

	let minInterval = 15000;
	let maxInterval = 30000;
	setTimeout(executeJudeInterval, getRandomInterval());


	function getRandomInterval()
	{
		return Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;
	}



	let reasons_general = ["17", "21", "47", "45", "49", "61", "55", "57", "59"]

	let reasons = {
		"entry": ["39", "35", ...reasons_general],
		"entry_comment": ["39", ...reasons_general],
		"link_comment": ["39", ...reasons_general],
		"link": ["35", "37", "27", "19", "53", ...reasons_general],
	}

	/*
	// entry
	reasons.entry.push("35"); // Nieprawidłowe tagi

	// entry general
	reasons.entry.push("17"); // Treści o charakterze pornograficznym
	reasons.entry.push("21"); // Propagowanie nienawiści lub przemocy, treści drastyczne
	reasons.entry.push("47"); // Atakuje mnie lub narusza moje dobra osobiste
	reasons.entry.push("45"); // Atakuje inne osoby
	reasons.entry.push("49"); // Naruszenie regulaminu - nieodpowiednie treści
	reasons.entry.push("61"); // Nadużycia seksualne wobec nieletnich
	reasons.entry.push("55"); // Treści nieoznaczone jako dozwolone dla osób od lat 12
	reasons.entry.push("57"); // Treści nieoznaczone jako dozwolone dla osób od lat 16
	reasons.entry.push("59"); // Treści nieoznaczone jako dozwolone dla osób od lat 18
	reasons.entry.push("43"); // Inne (extrarequired)
	reasons.entry.push("39"); // Treści reklamowe, spam, flood

	// entry comment general
	reasons.entry_comment.push("17"); // Treści o charakterze pornograficznym
	reasons.entry_comment.push("21"); // Propagowanie nienawiści lub przemocy, treści drastyczne
	reasons.entry_comment.push("47"); // Atakuje mnie lub narusza moje dobra osobiste
	reasons.entry_comment.push("45"); // Atakuje inne osoby
	reasons.entry_comment.push("49"); // Naruszenie regulaminu - nieodpowiednie treści
	reasons.entry_comment.push("61"); // Nadużycia seksualne wobec nieletnich
	reasons.entry_comment.push("55"); // Treści nieoznaczone jako dozwolone dla osób od lat 12
	reasons.entry_comment.push("57"); // Treści nieoznaczone jako dozwolone dla osób od lat 16
	reasons.entry_comment.push("59"); // Treści nieoznaczone jako dozwolone dla osób od lat 18
	reasons.entry_comment.push("43"); // Inne (extrarequired)
	reasons.entry_comment.push("39"); // Treści reklamowe, spam, flood

	// link_comment general
	reasons.link_comment.push("17"); // Treści o charakterze pornograficznym
	reasons.link_comment.push("21"); // Propagowanie nienawiści lub przemocy, treści drastyczne
	reasons.link_comment.push("47"); // Atakuje mnie lub narusza moje dobra osobiste
	reasons.link_comment.push("45"); // Atakuje inne osoby
	reasons.link_comment.push("49"); // Naruszenie regulaminu - nieodpowiednie treści
	reasons.link_comment.push("61"); // Nadużycia seksualne wobec nieletnich
	reasons.link_comment.push("55"); // Treści nieoznaczone jako dozwolone dla osób od lat 12
	reasons.link_comment.push("57"); // Treści nieoznaczone jako dozwolone dla osób od lat 16
	reasons.link_comment.push("59"); // Treści nieoznaczone jako dozwolone dla osób od lat 18
	reasons.link_comment.push("43"); // Inne (extrarequired)
	reasons.link_comment.push("39"); // Treści reklamowe, spam, flood

	// link
	reasons.link.push("37"); // Manipulacja głosami
	reasons.link.push("27"); // Treści reklamowe, spam
	reasons.link.push("19"); // Oszustwo, treść wprowadza w błąd
	reasons.link.push("53"); // Duplikat
	reasons.link.push("35"); // Nieprawidłowe tagi

	// link general
	reasons.link.push("17"); // Treści o charakterze pornograficznym
	reasons.link.push("21"); // Propagowanie nienawiści lub przemocy, treści drastyczne
	reasons.link.push("47"); // Atakuje mnie lub narusza moje dobra osobiste
	reasons.link.push("45"); // Atakuje inne osoby
	reasons.link.push("49"); // Naruszenie regulaminu - nieodpowiednie treści
	reasons.link.push("61"); // Nadużycia seksualne wobec nieletnich
	reasons.link.push("55"); // Treści nieoznaczone jako dozwolone dla osób od lat 12
	reasons.link.push("57"); // Treści nieoznaczone jako dozwolone dla osób od lat 16
	reasons.link.push("59"); // Treści nieoznaczone jako dozwolone dla osób od lat 18
	reasons.link.push("43"); // Inne (extrarequired)
	// BRAK: reasons.link.push("39"); // Treści reklamowe, spam, flood
	*/


	function randomReport(WykopObject)
	{
		const formData = new FormData();
		formData.append("reason", reasons[WykopObject?.__vue__?.item?.resource][Math.floor(Math.random() * reasons[WykopObject?.__vue__?.item?.resource].length)]);
		formData.append('info', '');
		formData.append('agreement', '1');

		return formData;
	}



	async function executeJudeInterval()
	{
		if (dev) console.log(`executeJudeInterval(): [${seenObjects.length}] `);
		// console.log("executeJudeInterval(): ", seenObjects);

		if (seenObjects.length > 0)
		{
			let randomIndex = Math.floor(Math.random() * seenObjects.length);
			let WykopObject = seenObjects.splice(randomIndex, 1)[0];

			if (WykopObject?.__vue__?.item?.id != undefined)
			{
				if (dev) console.log(`seenObjects.length: [${seenObjects.length}] `, WykopObject.__vue__.item.id);

				let judeURL = await getJudenURL(WykopObject);

				if (judeURL != null)
				{
					if (dev) console.log(`judenURL from API: `, judeURL);

					const formData = randomReport(WykopObject)

					let result = await postJudenReport(judeURL, formData);

					if (result.status == "ok")
					{
						let countAll = localStorage.getItem("juden") + 1;
						let countSession = sessionStorage.getItem("juden") + 1;

						localStorage.setItem("juden", countAll);
						sessionStorage.setItem("juden", countSession);

						body.style.setProperty('--juden', `"${countAll}"`);
					}
				}
			}
		}
		setTimeout(executeJudeInterval, getRandomInterval());
	}




	async function getJudenURL(sectionObject)
	{
		// console.log("getJudenURL(): ", sectionObject);

		if (sectionObject.__vue__ == undefined) return null;
		if (sectionObject.__vue__?.item == undefined) return null;
		if (sectionObject.__vue__?.item?.id == undefined) return null;

		try
		{
			const payload = {
				data: {
					type: "entry",
					id: sectionObject.__vue__?.item?.id,
				},
			};

			if (sectionObject.__vue__?.item?.resource == "entry_comment")
			{
				payload.data.type = "entry_comment";
				payload.data.parent_id = sectionObject.__vue__?.item?.parent?.id;
			}

			const response = await fetch("https://wykop.pl/api/v3/reports/reports", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok)
			{
				console.error(`getJudenURL() => Error! status: ${response.statusText}`);
				return null;

				//throw new Error(`HTTP error! status: ${response.status}`);
			}

			if (!response) return null;

			const result = await response.json();
			// console.log("getJudenURL() => result from API: ", result);

			// { data: { url: "https://mod.wykop.pl/create?type=entry&id=80815949&creator=Edgeless&sign=74324130a9e9bf1908d623a2e14e6d7bf632bd30" } }

			if (result?.data?.url)
			{
				return result.data.url;
			}
			else return null;
		}
		catch (error)
		{
			console.error('Error in juden function:', error);
			// throw error;
		}
	}


	async function postJudenReport(reportURL, formData)
	{
		if (dev) console.log("postJudenReport: reportURL: ", reportURL);

		try
		{


			await fetch(reportURL, {
				method: 'POST',
				mode: 'no-cors', // bypass CORS mod.wykop.pl
				body: formData
			});

			// With no-cors, we can't read the response body or status
			if (dev) console.log("postJudenReport() => Request sent (no-cors mode, response not accessible)");

			// Return a dummy response since we can't read the actual one
			return { status: 'ok' };

		}
		catch (error)
		{
			if (dev) console.error('postJudenReport() -> Error in postJudenReport function:', error);
			return { status: 'error', error: error.message };
		}
	}













	let observer = new MutationObserver((mutations) =>
	{
		// if (dev) console.log(`--- [${mutations.length}] mutations: `, mutations);

		mutations.forEach((mutation) =>
		{
			/*/
			if (dev) 
			{
				console.log("> new mutation <", mutation);

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
					console.log(`⭐ mutation.addedNodes.length: [${mutation.addedNodes.length}]`, mutation.addedNodes[0])
				}

				if (mutation.target)
				{
					console.log(`⭐ mutation.target: ${mutation.target.tagName}`, mutation.target)

					if (mutation.target.tagName === "SECTION")
					{

					}
				}
			}
			*/

			// ADDED NODES
			if (mutation.addedNodes.length > 0 && mutation.addedNodes[0] && mutation.addedNodes[0] instanceof Element)
			{
				if (mutation.addedNodes[0].matches("section.entry[id]"))
				{
					const sectionEntry = mutation.addedNodes[0];

					// if (dev) console.log("mutation section.entry[id]", sectionEntry);

					seenObjects.push(sectionEntry)
					console.log(`Entry/comment: ${sectionEntry.__vue__.item.id} added to seenObjects, length: [${seenObjects.length}]`);

					/*
					const sectionCommentsArray = sectionEntry.querySelectorAll("section.entry[id]");
					if (dev) console.log("mutation section.entry[id] - forEach: sectionEntryArray", sectionCommentsArray);

					sectionCommentsArray.forEach((sectionComment) =>
					{
						processSectionEntry(sectionComment)
					})
					*/
				}

				/* 
				else if (mutation.addedNodes[0].matches("div.content:has(>section.entry[id])"))
				{
					const sectionEntriesArray = mutation.addedNodes[0].querySelectorAll("section.entry[id]");
					if (dev) console.log("div.content:has(>section.entry[id]) - forEach: sectionEntriesArray", sectionEntriesArray);

					sectionEntriesArray.forEach((sectionEntry) =>
					{
						processSectionEntry(sectionEntry)
					})
				}
				else if (mutation.target.tagName === "SECTION" && mutation.target.matches("section.entry.detailed[id]"))
				{
					const sectionEntry = mutation.target;
					if (dev) console.log("section.entry.detailed[id]", sectionEntry)
					if (dev) console.log("section.entry.detailed[id]: mutation.target", mutation.target);

					processSectionEntry(sectionEntry);

					const sectionCommentsArray = sectionEntry.querySelectorAll("section.entry[id]");
					if (dev) console.log("mutation 3 - forEach: sectionEntryArray", sectionCommentsArray);

					sectionCommentsArray.forEach((sectionComment) =>
					{
						processSectionEntry(sectionComment)
					})
				}
				else if (mutation.addedNodes[0].matches("aside.profile-top"))
				{
					// animatedAvatar(mutation.addedNodes[0]);
				}
				// LEFT SIDE CATEGORY MENU OPENED
				else if (mutation.addedNodes[0].matches("aside.left-panel.thin-scrollbar"))
				{
					// createLeftPanelButton();
				}
				*/
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

			//const sectionEntryArray = mainSection.querySelectorAll("section.entry[id]");
			// if (dev) console.log("sectionEntryArray", sectionEntryArray);
			/*sectionEntryArray.forEach((sectionEntry) =>
			{
				processSectionEntry(sectionEntry)
			})*/
			const config = {
				childList: true,
				subtree: true,
			};

			observer.observe(mainSection, config);

		}

	});





})();

