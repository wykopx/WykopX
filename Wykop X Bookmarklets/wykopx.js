javascript: (function ()
{
    var url = new URL(location.href);
    if (url.hostname === "wykop.pl" && url.pathname.startsWith("/wpis/"))
    {
        window.open(url.href.replace(/wykop\.pl/g, 'wykopx.pl'));
    } else if (url.hostname === "wykop.pl" && url.pathname.startsWith("/tag/"))
    {
        var tag = url.pathname.split("/tag/")[1];
        window.open("https://mikroczat.pl/czat/" + tag);
    }
    else if (url.hostname === "wykop.pl" && url.pathname.startsWith("/ludzie/") && url.pathname.length > 8)
    {
        var pm = url.pathname.split("/ludzie/")[1];
        window.open("https://mikroczat.pl/pm/@" + pm);
    }
})();
