javascript: (function ()
{
    var url = new URL(location.href);
    if (url.hostname === "wykop.pl")
    {
        if (url.pathname.startsWith("/wpis/"))
        {
            window.open(url.href.replace(/wykop\.pl/g, 'wykopx.pl'));
        }
        else if (url.pathname.startsWith("/tag/"))
        {
            window.open("https://mikroczat.pl/czat/" + url.pathname.split("/tag/")[1]);
        }
        else if (url.pathname.startsWith("/ludzie/") && url.pathname.length > 8)
        {
            window.open("https://mikroczat.pl/pm/@" + url.pathname.split("/ludzie/")[1]);
        }
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
3. W polu adresu URL usuń adres strony na której jesteś i wklej skopiowany powyżej kod
4. Ustaw dowolną nazwą np. 'Wykop' albo 'WX'
4. Gotowe. 

Aby skorzystać z Bookmarklet Wykop X po prostu kliknij jego ikonę
- na stronie dowolnego tagu -> otworzysz kanał na Mikroczacie
- na dowolnej stronie -> otworzysz Mikroblog
- na stronie wpisu -> otworzysz Archiwum X z oryginalną treścią wpisu
*/ 
//        Kliknij, aby zobaczyć treść usuniętego wpisu z Archiwum X
