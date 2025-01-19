// ==UserScript==
// @name							Wykop XS - Obrazki+
// @name:pl							Wykop XS - Obrazki+
// @name:en							Wykop XS - Images+

// @version							3.0.99

// @description 					Otwiera obrazki z wykopu poprzez www.wykopx.pl - z dodatkowymi funkcjami. Otwórz dowolny obrazek na wykopie i zamień w adresie URL 'wykop.pl' na 'wykopx.pl'. Obrazek możesz obrócić, odbić lustrzanie, udostępnić, skopiować, zapisać, włączyć pełny ekran. Oprócz przycisków masz też wygodne skróty klawiaturowe do każdej z tych akcji.  | Wejdź na Mikroczat: https://mikroczat.pl Projekt Wykop X: https://wykopx.pl Wiki projektu Wykop X: https://wiki.wykopx.pl

// @description:en 					Otwiera obrazki z wykopu poprzez www.wykopx.pl - z dodatkowymi funkcjami. Otwórz dowolny obrazek na wykopie i zamień w adresie URL 'wykop.pl' na 'wykopx.pl'. Obrazek możesz obrócić, odbić lustrzanie, udostępnić, skopiować, zapisać, włączyć pełny ekran. Oprócz przycisków masz też wygodne skróty klawiaturowe do każdej z tych akcji.  | Wykop Live Chat: https://mikroczat.pl | Wykop X Project: https://wykopx.pl | Wiki: https://wiki.wykopx.pl


// Chcesz wesprzeć projekt Wykop X? Postaw kawkę:
// @contributionURL					https://buycoffee.to/wykopx

// @author							Wykop X <wykopx@gmail.com>



// @match							https://wykop.pl/cdn/*
// @supportURL						http://wykop.pl/tag/wykopx
// @namespace						Violentmonkey Scripts
// @compatible						chrome, firefox, opera, safari, edge
// @license							No License

// ==/UserScript==


(async function ()
{
	'use strict';
	function redirect()
	{
		let currentUrl = window.location.href;
		let newUrl = currentUrl.replace("https://wykop.pl", "https://wykopx.pl");
		window.location.replace(newUrl);
	}
	if (window.location.href.startsWith("https://wykop.pl/cdn/")) redirect();

})();


