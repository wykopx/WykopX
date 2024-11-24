/* 
	----- Zapraszam na tag #wykopx -----

	TEN SKRYPT SŁUŻY DO WYCZYSZCZENIA LISTY OBSERWOWANYCH DYSKUSJI
	Jeśli nie wiesz jak z niego skorzystać, przeczytaj instrukcję poniżej.

	UWAGA! TEN SKRYPT NIE JEST SKRYPTEM DO ViolentMonkey/TamperMonkey
	KOD TEGO SKRYPTU NALEŻY WKLEIĆ GO DO KONSOLI [CTRL + SHIFT + C]	

	INSTRUKCJA:
	1. wejdź na dowolną stronę wykop.pl

	2. otwórz konsolę skrótem [CTRL + SHIFT + C] lub klawiszem [F12]

	3. wpisz w konsoli `allow-pasting` (razem z cudzysłowami ` `) i wciśnij [ENTER]

	4. wklej CAŁY poniższy kod i wciśnij [ENTER]

	5. Na górnej belce Wykopu pojawi się nowy przycisk, który po kliknięciu:

		- sprawdzi ile dyskusji obserwujesz
		- w kilku krokach pozwoli ci wybrać czy chcesz usunąć obserwowane wpisy/znaleziska/komentarze
		- zdecydujesz czy chcesz również usuwać dyskusje, które dodałeś do Ulubionych
		(jeśli chcesz, aby niektóre obserwowane dyskusje nie były usunięte - dodaj je wcześniej do ulubionych)
		- w ostatnim kroku masz możliwość rezygnacji - nic nie zostanie wtedy usunięte

		- w trakcie usuwania pasek postępu pokazywany jest w adresie URL na przykład:
		https://wykop.pl/tag/wykopx/#--usunięto: 178/180 (99%)


	Lista dyskusji, które obserwujesz znajduje się tutaj:
	https://wykop.pl/obserwowane/dyskusje

	Wersja zminimalizowana tego skryptu gotowa do wklejenia= w konsoli:
	https://raw.githubusercontent.com/wykopx/WykopX/refs/heads/main/Wykop%20XS%20-%20skrypty%20do%20konsoli/wykop_xs_czyszczenie_listy_obserwowanych_dyskusji.min.js

	Pełna wersja tego skryptu tutaj:
	https://github.com/wykopx/WykopX/blob/main/Wykop%20XS%20-%20skrypty%20do%20konsoli/wykop_xs_czyszczenie_listy_obserwowanych_dyskusji.js

	Chcesz wesprzeć projekt Wykop X? Postaw kawę:

	@contributionURL				https://buycoffee.to/wykopx

	@author							Wykop X <wykopx@gmail.com>
	@License						No License
	@version						1.0.2

	----- Zapraszam na tag #wykopx -----
*/

let observedLinks = 0;
let observedLinksFavourited = 0;
let observedEntries = 0;
let observedEntriesFavourited = 0;
let observedLinkComments = 0;
let observedLinkCommentsFavourited = 0;
let deleteEntries = true;
let deleteLinks = true;
let deleteLinkComments = true;
let dontDeleteFavourites = true;
let totalToDelete = 0;
console.clear();

async function fetchObservedDiscussionData()
{
	const token = localStorage.getItem('token');
	if (!token) { return new Map(); }
	const dataMap = new Map();


	async function getData(page = '')
	{
		const url = `https://wykop.pl/api/v3/observed/discussions${page ? `?page=${page}` : ''}`;
		const response = await fetch(url, {
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		if (!response.ok) { return null; }
		const result = await response.json();

		result.data.forEach(item =>
		{
			dataMap.set(item.object.id, item);
			if (item.object.resource == "entry")
			{
				observedEntries++;
				if (item.object.favourite) observedEntriesFavourited++;
			}
			else if (item.object.resource == "link")
			{
				observedLinks++;
				if (item.object.favourite) observedLinksFavourited++;
			}
			else if (item.object.resource == "link_comment")
			{
				observedLinkComments++;
				if (item.object.favourite) observedLinkCommentsFavourited++;
			}
		});
		return result.pagination.next;
	}

	let nextPage = await getData();

	// for (let i = 0; i < 3 && nextPage; i++)
	for (let i = 0; nextPage; i++)
	{
		nextPage = await getData(nextPage);
		await delay(100);
	}
	return dataMap;
}

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function deleteSelectedFromMap(dataMap)
{
	const token = localStorage.getItem('token');
	if (!token) { return; }

	const progressURL = new URL(window.location.href)
	const basePathName = `/tag/wykopx`;
	progressURL.pathname = basePathName;
	window.history.pushState({}, '', progressURL);

	let i = 0;
	let deleted = 0;

	for (const [id, item] of dataMap)
	{
		let apiURL = "";

		if (item.object.resource == "entry" && deleteEntries)
		{
			apiURL = `https://wykop.pl/api/v3/entries/${item.object.id}/observed-discussions`;
		}
		else if (item.object.resource == "link" && deleteLinks)
		{
			apiURL = `https://wykop.pl/api/v3/links/${item.object.id}/observed-discussions`;
		}
		else if (item.object.resource == "link_comment" && deleteLinkComments)
		{
			apiURL = `https://wykop.pl/api/v3/links/${item.object.parent.id}/comments/${item.object.id}/observed-discussions`;
		}

		if (item.object.favourite && dontDeleteFavourites) apiURL = "";

		if (apiURL !== "")
		{
			deleted++;

			const response = await fetch(apiURL, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`
				}
			});

			await delay(170);
		}


		i++;
		const newHash = `--usunieto:${deleted}/${totalToDelete}_(${Math.ceil((deleted * 100 / totalToDelete))}%)`; // __przeanalizowano:${i}/${dataMap.size}`;
		window.location.hash = newHash;
	}
}

async function wykopx()
{
	observedLinks = 0;
	observedLinksFavourited = 0;
	observedEntries = 0;
	observedEntriesFavourited = 0;
	observedLinkComments = 0;
	observedLinkCommentsFavourited = 0;
	deleteEntries = false;
	deleteLinks = false;
	deleteLinkComments = false;
	dontDeleteFavourites = true;
	totalToDelete = 0;

	let step = 0;
	let totalSteps = 7;
	alert(`KROK ${++step}/7\nWykop X przeanalizuje teraz obserwowane przez Ciebie dyskusje \n\n> Kliknij [OK] i poczekaj kilka sekund.\n\nSpokojnie, jeszcze nie usuwamy obserwowanych dyskusji.\nPrzejdziemy do tego w następnych krokach.`)

	fetchObservedDiscussionData().then(dataMap =>
	{
		if (dataMap.size === 0)
		{
			totalSteps = 1;
			alert(`KROK ${++step}/${totalSteps}\n\nWykop X przeanalizował Twoje obserwowane:\n- Nie obserwujesz żadnych dyskusji`);
		}
		else
		{
			if (observedEntries == 0) totalSteps--;
			if (observedLinks == 0) totalSteps--;
			if (observedLinkComments == 0) totalSteps--;

			alert(`KROK ${++step}/${totalSteps}\n- Obserwujesz łącznie: (${dataMap.size}) dyskusji\n- Limit obserwowanych dyskusji na wykopie wynosi (1000)\n\nObserwujesz:\n- (${observedEntries}) wpisów na mikroblogu w tym (${observedEntriesFavourited}) wpisów ⭐ Ulubionych\n- (${observedLinks}) znalezisk w tym (${observedLinksFavourited}) znalezisk ⭐ Ulubionych\n- (${observedLinkComments}) komentarzy w znaleziskach w tym (${observedLinkCommentsFavourited}) komentarzy ⭐ Ulubionych\n\n> Kliknij [OK] aby kontynuować`);
			dontDeleteFavourites = confirm(`KROK ${++step}/${totalSteps}\nMożesz teraz wybrać czy chcesz, POMINĄĆ usuwanie dyskusji, które masz oznaczone jako "⭐ Ulubione"\n\n> [OK] jeśli chcesz, żeby 🌟 Ulubione dyskusje NIE ZOSTAŁY USUNIĘTE\n\n> [Anuluj] jeśli CHCESZ USUNĄĆ również 🌟 Ulubione dyskusje`);


			let entriesToDelete = dontDeleteFavourites ? observedEntries - observedEntriesFavourited : observedEntries;
			let linksToDelete = dontDeleteFavourites ? observedLinks - observedLinksFavourited : observedLinks;
			let linkCommentsToDelete = dontDeleteFavourites ? observedLinkComments - observedLinkCommentsFavourited : observedLinkComments;

			if (entriesToDelete > 0) deleteEntries = confirm(`KROK ${++step}/${totalSteps}\nCzy chcesz usunąć (${entriesToDelete}) obserwowanych WPISÓW NA MIKROBLOGU?\n\n> [OK] jeśli chcesz, żeby WPISY zostały usunięte z obserwowanych\n\n> [Anuluj] jeśli nie chcesz usuwać obserwowanych WPISÓW`);
			if (linksToDelete > 0) deleteLinks = confirm(`KROK ${++step}/${totalSteps}\nCzy chcesz usunąć (${linksToDelete}) obserwowanych ZNALEZISK?\n\n> [OK] jeśli chcesz, żeby ZNALEZISKA zostały usunięte z obserwowanych\n\n> [Anuluj] jeśli nie chcesz usuwać obserwowanych ZNALEZISK`);
			if (linkCommentsToDelete > 0) deleteLinkComments = confirm(`KROK ${++step}/${totalSteps}\nCzy chcesz usunąć (${linkCommentsToDelete}) obserwowanych KOMENTARZY W ZNALEZISKACH?\n\n> [OK] jeśli chcesz, żeby KOMENTARZE W ZNALEZISKACH zostały usunięte z obserwowanych\n\n> [Anuluj] jeśli nie chcesz usuwać obserwowanych KOMENTARZY W ZNALEZISKACH`);


			if (!deleteEntries) entriesToDelete = 0;
			if (!deleteLinks) linksToDelete = 0;
			if (!deleteLinkComments) linkCommentsToDelete = 0;

			totalToDelete = entriesToDelete + linksToDelete + linkCommentsToDelete;

			let lastStepText = `⚠ KROK ${++step}/${totalSteps}  - USUWANIE ⚠ \nPo kliknięciu w [OK] ROZPOCZNIE SIĘ USUWANIE!\n\nWykop X usunie:`;
			entriesToDelete > 0 ? lastStepText += `\n- (${entriesToDelete}) obserwowanych wpisów ${dontDeleteFavourites ? "(bez ulubionych)" : "w tym także ulubione"}` : "";
			linksToDelete > 0 ? lastStepText += `\n- (${linksToDelete}) obserwowanych znalezisk ${dontDeleteFavourites ? "(bez ulubionych)" : "w tym także ulubione"}` : "";
			linkCommentsToDelete > 0 ? lastStepText += `\n- (${linkCommentsToDelete}) obserwowanych komentarzy w znaleziskach ${dontDeleteFavourites ? "(bez ulubionych)" : "w tym także ulubione"}` : "";

			lastStepText += `\n\nŁącznie usuniemy (${totalToDelete}) z (${dataMap.size}) obserwowanych dyskusji.\n\n> [OK] aby USUNĄĆ (${totalToDelete}) obserwowanych dyskusji\n> [Anuluj] aby PRZERWAĆ proces usuwania.
`
			if (totalToDelete > 0)
			{
				if (confirm(lastStepText))
				{
					deleteSelectedFromMap(dataMap).then(() =>
					{
						alert('Wszystkie wybrane dyskusje zostały usunięte.');
						window.location.hash = `(づ•﹏•)づ__usunięto_${totalToDelete}_z_${dataMap.size}_obserwowanych_dyskusji`;
					});
				}
			}
			else
			{
				const progressURL = new URL(window.location.href)
				progressURL.pathname = `/tag/wykopx`;
				window.history.pushState({}, '', progressURL);
				window.location.hash = "(づ•﹏•)づ";
				confirm(`⚠ KROK 21/37 ⚠\n\n\nNie to nie ( ͡° ͜ʖ ͡°)`);
			}
		}
	});
}

const button = document.createElement('button');
button.setAttribute("style", "position: fixed; top: 5px; left: 50%; z-index: 999; display: flex; color: rgb(255 255 255 / 0.6); border: 1px solid rgb(0 0 0 / 0.3); background-color: rgb(0 0 0 / 0.2); padding: 10px;")
button.textContent = 'Usuń obserwowane dyskusje';
document.body.insertBefore(button, document.body.firstChild);
button.addEventListener('click', async () => { await wykopx(); });