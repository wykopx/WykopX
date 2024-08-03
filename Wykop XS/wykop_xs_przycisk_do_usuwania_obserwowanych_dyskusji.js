/* 

	TEN SKRYPT SŁUŻY DO WYCZYSZCZENIA LISTY OBSERWOWANYCH DYSKUSJI

	UWAGA! TEN SKRYPT NIE JEST SKRYPTEM DO ViolentMonkey/TamperMonkey

	1. wejdź na dowolną stronę wykop.pl
	2. otwórz narzędzia deweloperskie, a w nich konsolę (skrótem CTRL+SHIFT+C lub F12)
	3. wklej cały poniższy kod i wciśnij ENTER

	Na górnej belce pojawi się nowy przycisk, który
	- podliczy ile dyskusji obserwujesz 
	- zaproponuje usunięcie wszystkich obserwowanych dyskusji
	- da ci możliwość anulowania procesu usuwania

	Usunięcie wszystkich obserwowanych dyskusji trwa około 10 sekund

	Lista dyskusji, które obserwujesz znajduje się tutaj:
	https://wykop.pl/obserwowane/dyskusje


	Chcesz wesprzeć projekt Wykop X? Postaw kawę:

	@contributionURL				https://buycoffee.to/wykopx

	@author							Wykop X <wykopx@gmail.com>
	@License						No License

*/

async function fetchData()
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
		result.data.forEach(item => { dataMap.set(item.object.id, item); });
		return result.pagination.next;
	}

	let nextPage = await getData();

	for (let i = 0; i < 3 && nextPage; i++) { nextPage = await getData(nextPage); }
	return dataMap;
}

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function processMap(dataMap)
{
	const token = localStorage.getItem('token');
	if (!token) { return; }

	const progressURL = new URL(window.location.href)
	const basePathName = `/WykopX.usuwa.obserwowane.dyskusje...(ʘ‿ʘ)...`;

	let i = 0;
	for (const [id, item] of dataMap)
	{
		progressURL.pathname = basePathName + `-${'-'.repeat(i++)}(${i}z${dataMap.size})`;
		window.history.pushState({}, '', progressURL);
		let url = '';
		switch (item.type)
		{
			case 'link':
				url = `https://wykop.pl/api/v3/links/${item.object.id}/observed-discussions`;
				break;
			case 'link_comment':
				url = `https://wykop.pl/api/v3/links/${item.object.parent.id}/comments/${item.object.id}/observed-discussions`;
				break;
			case 'entry':
				url = `https://wykop.pl/api/v3/entries/${item.object.id}/observed-discussions`;
				break;
			default:
				continue;
		}

		const response = await fetch(url, {
			method: 'DELETE',
			headers: {
				'Authorization': `Bearer ${token}`
			}
		});

		await delay(160);
	}
}

async function wykopx()
{
	fetchData().then(dataMap =>
	{
		if (dataMap.size === 0) alert("Nie obserwujesz żadnych dyskusji");

		else if (confirm(`Obserwujesz ${dataMap.size} dyskusji.\nKliknij OK, aby przestać obserwować wszystkie dyskusje.\n\nLimit obserwowanych dyskusji wynosi 100`))
		{
			processMap(dataMap).then(() =>
			{
				alert('Wszystkie obserwowane dyskusje zostały usunięte.');
				location.href = "https://wykop.pl/obserwowane/dyskusje";
			});
		}
	});
}

const button = document.createElement('button');
button.setAttribute("style", "position: fixed; top: 5px; left: 50%; z-index: 999; display: flex; color: rgb(255 255 255 / 0.6); border: 1px solid rgb(0 0 0 / 0.3); background-color: rgb(0 0 0 / 0.2); padding: 10px;")
button.textContent = 'Usuń obserwowane dyskusje';
document.body.insertBefore(button, document.body.firstChild);
button.addEventListener('click', async () => { await wykopx(); });