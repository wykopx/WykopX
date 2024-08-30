javascript: (function ()
{
    var url = new URL(location.href);
    if (url.hostname === "wykop.pl")
    {
		function replaceCensoredWords(text, censoredMap)
		{
			for (let [key, value] of censoredMap)
			{
				text = text.replace(new RegExp(key, 'gi'), value);
			}
			return text;
		}

		let censored = new Map();
		censored.set("a-----l", "alkohol");
		censored.set("a--------a", "amfetamina");
		censored.set("a--------y", "amfetaminy");
		censored.set("b--m", "bdsm");
		censored.set("b---t", "biust");
		censored.set("b-----b", "blowjob");
		censored.set("b---a", "bomba");
		censored.set("b---ę", "bombę");
		censored.set("b---e", "bombe");
		censored.set("b---y", "bomby");
		censored.set("b---s", "boobs");
		censored.set("b--ń", "broń");
		censored.set("b----l", "burdel");
		censored.set("b----c", "bzykac");
		censored.set("b----ć", "bzykać");
		censored.set("b------o", "bzykanko");
		censored.set("c-d", "cbd");
		censored.set("c--j", "chój");
		censored.set("c--j", "chuj");
		censored.set("c--a", "cipa");
		censored.set("c------a", "cipeczka");
		censored.set("c---a", "cipka");
		censored.set("c-c", "cyc");
		censored.set("c--e", "cyce");
		censored.set("c---i", "cycki");
		censored.set("c------i", "cycuszki");
		censored.set("d--------e", "dieselgate");
		censored.set("d---o", "dildo");
		censored.set("d----s", "donbas");
		censored.set("d-------e", "dopalacze");
		censored.set("d---i", "dragi");
		censored.set("d---s", "drags");
		censored.set("d--a", "dupa");
		censored.set("d----a", "dupcia");
		censored.set("d------a", "dupeczka");
		censored.set("d------i", "dupeczki");
		censored.set("d--y", "dupy");
		censored.set("d----a", "dziwka");
		censored.set("e-----y", "ecstasy");
		censored.set("e-------e", "erotyczne");
		censored.set("e-------y", "erotyczny");
		censored.set("e--------m", "erotycznym");
		censored.set("e-----a", "erotyka");
		censored.set("f-----m", "faszyzm");
		censored.set("f----z", "fetysz");
		censored.set("g------a", "gówniana");
		censored.set("g---o", "gówno");
		censored.set("g--------l", "gwałciciel");
		censored.set("g---t", "gwałt");
		censored.set("h-----z", "haszysz");
		censored.set("h------u", "haszyszu");
		censored.set("h----d", "hazard");
		censored.set("h-----a", "heroina");
		censored.set("h-----y", "heroiny");
		censored.set("h-j", "huj");
		censored.set("j---a", "jądra");
		censored.set("j---a", "jajca");
		censored.set("j---ć", "jebać");
		censored.set("j---c", "jebac");
		censored.set("j-----e", "jebanie");
		censored.set("j----y", "jebany");
		censored.set("j-----m", "jebanym");
		censored.set("k--------m", "kanibalizm");
		censored.set("k-----a", "kokaina");
		censored.set("k-----y", "kokainy");
		censored.set("k--s", "koks");
		censored.set("k------z", "koksiarz");
		censored.set("k----m", "kondom");
		censored.set("k---a", "kórwa");
		censored.set("k-----a", "kurewka");
		censored.set("k---a", "kurwa");
		censored.set("k---y", "kurwy");
		censored.set("m-------a", "marihuana");
		censored.set("m------n", "mefedron");
		censored.set("m-------u", "mefedronu");
		censored.set("m--f", "milf");
		censored.set("m----n", "murzyn");
		censored.set("n-----c", "najebac");
		censored.set("n-----ć", "najebać");
		censored.set("n------e", "najebane");
		censored.set("n------i", "najebani");
		censored.set("n---d", "naked");
		censored.set("n------n", "narkoman");
		censored.set("n-------a", "narkomana");
		censored.set("n--------a", "narkomanka");
		censored.set("n--------ę", "narkomankę");
		censored.set("n------k", "narkotyk");
		censored.set("n-------i", "narkotyki");
		censored.set("n-------m", "neonazizm");
		censored.set("n--e", "nude");
		censored.set("o----m", "orgazm");
		censored.set("p-------y", "papierosy");
		censored.set("p-----l", "pedofil");
		censored.set("p-------a", "pedofilia");
		censored.set("p-------w", "pedofilów");
		censored.set("p---s", "penis");
		censored.set("p-----m", "penisem");
		censored.set("p----i", "piersi");
		censored.set("p--o", "piwo");
		censored.set("p-----y", "playboy");
		censored.set("p------y", "pojebany");
		censored.set("p---r", "poker");
		censored.set("p-----b", "pornhub");
		censored.set("p---o", "porno");
		censored.set("p----------a", "prezerwatywa");
		censored.set("p----------y", "prezerwatywy");
		censored.set("p---------a", "prostytucja");
		censored.set("p-------a", "prostytutka");
		censored.set("p-----c", "przemoc");
		censored.set("p--a", "pupa");
		censored.set("p----e", "pupcie");
		censored.set("p--y", "pupy");
		censored.set("r----c", "ruchac");
		censored.set("r----ć", "ruchać");
		censored.set("r------o", "ruchanko");
		censored.set("r--ź", "rzeź");
		censored.set("s-----a", "sadysta");
		censored.set("s-------a", "samobójca");
		censored.set("s---------o", "samobójstwo");
		censored.set("s--s", "seks");
		censored.set("s-x", "sex");
		censored.set("s-------n", "skurwysyn");
		censored.set("s----a", "sperma");
		censored.set("s-------ć", "spieprzyć");
		censored.set("s--------i", "spieprzyli");
		censored.set("s---------m", "spieprzyłam");
		censored.set("s---------m", "spieprzyłem");
		censored.set("s---------a", "strzelanina");
		censored.set("t------i", "tyłeczki");
		censored.set("t----k", "tyłek");
		censored.set("u----i", "używki");
		censored.set("w----a", "wagina");
		censored.set("w----ę", "waginę");
		censored.set("w-----y", "whiskey");
		censored.set("w----y", "whisky");
		censored.set("w------r", "wibrator");
		censored.set("w---a", "wódka");
		censored.set("t---k", "tyłek");
		censored.set("z----l", "zoofil");
		censored.set("z------a", "zoofilia");

		const wrappers = document.querySelectorAll('div.wrapper');
		wrappers.forEach(wrapper =>
		{
			wrapper.innerHTML = replaceCensoredWords(wrapper.innerHTML, censored);
		});
    }
    else if (url.hostname === "mikroczat.pl")
    {

    }
    else
    {
        window.open("https://wykopx.pl/m");
    }
})();
/* 
v.1.0.1

1. Skopiuj cały kod tego skryptu
2. Wciśnij na dowolnej stronie CTRL+D aby otworzyć okno dodawania Ulubionej/Zakładki/Bookmark 
3. W polu adresu URL usuń adres strony na której jesteś i wklej cały skopiowany powyżej kod
4. Ustaw dowolną nazwą np. 'Wykop' albo 'WX'
4. Gotowe. 

Aby skorzystać z Bookmarklet Wykop X po prostu kliknij 
- na dowolnej stronie wykopu z ocenzurowanymi wpisami i komentarzami
*/ 
//        Bookmarklet Wykop X odcenzoruje wszystkie wpisy i komentarze
