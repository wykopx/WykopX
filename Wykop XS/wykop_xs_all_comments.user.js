
// @name						Wykop XS - Rozgrupuj powiadomienia
// @name:pl						Wykop XS - Rozgrupuj powiadomienia
// @name:en						Wykop XS - Ungroup notifications

// @version						3.0.82

// @description 					Wykop XS - All Comments Together | Wejdź na Mikroczat: https://mikroczat.pl Projekt Wykop X: https://wykopx.pl Wiki projektu Wykop X: https://wiki.wykopx.pl
// @description:en 					Wykop XS - All Comments Together | Wykop Live Chat: https://mikroczat.pl | Wykop X Project: https://wykopx.pl | Wiki: https://wiki.wykopx.pl


// Chcesz wesprzeć projekt Wykop X? Postaw kawkę:
// @contributionURL					https://buycoffee.to/wykopx

// @author						Wykop X <wykopx@gmail.com>



// @match						https://wykop.pl/*
// @supportURL						http://wykop.pl/tag/wykopx
// @namespace						Violentmonkey Scripts
// @compatible						chrome, firefox, opera, safari, edge
// @license						No License
// @icon						https://www.google.com/s2/favicons?sz=64&domain=wykop.pl




// ==/UserScript==
(async function ()
{
	const currentVersion = "3.0.82";
	let dev = false;
	const promoString = " - Wykop XS / #wykopx";

	const AWAIT_MILLISECONDS = 1000;

	let show_all_comments_in_one_page = true;
	let MAXIMUM_COMMENTS_IN_ONE_PAGE = 1000; 			// ZABEZPIECZENIE PRZED WPISAMI TAKIMI JAK https://wykop.pl/wpis/57976055/wpis

	// wyliczamy backend limit jako mniejszą liczbę z obecnego limitu 50 albo mniejszą wybraną przez użytkownika
	const BACKEND_LIMIT = 50; 									// limit backendu do faktycznego pobierania 1-50
	let local_limit = 110; 							// 1 | 10 | 20 | 100 - tyle ile użytkownik chce, żeby się wyświetlało




	let per_page_entries = BACKEND_LIMIT;
	if (!show_all_comments_in_one_page) per_page_entries = Math.min(BACKEND_LIMIT, local_limit);



	function getLocalFromPage(pageNumber)
	{
		const local =
		{
			page: pageNumber,

			item:
			{
				first: ((pageNumber - 1) * local_limit) + 1,
				last: ((pageNumber - 1) * local_limit) + local_limit + 1,
			}
		}

		return local;
	}


	function getBackendFromBackendPage(pageStart, pageEnd = pageStart)
	{
		const backend =
		{
			pageStart: pageStart,
			pageEnd: pageEnd,

			item:
			{
				first: ((pageStart - 1) * BACKEND_LIMIT) + 1,
				last: ((pageStart - 1) * BACKEND_LIMIT) + BACKEND_LIMIT + 1,
			}
		}

		return backend;
	}


	function extractPageNumber(url)
	{
		const pattern = /\/strona\/(\d+)/;
		const match = url.match(pattern);
		if (match)
		{
			return parseInt(match[1], 10); // Convert the captured group to a number
		}
		return 1;
	}

	function getBackendPagesFromLocal(local)
	{

		console.log(`getFirstBackendPageFromLocal() local.page: [${local.page}] | local_limit: [${local_limit}] | backend_limit: [${BACKEND_LIMIT}]`);

		let backend =
		{
			//  f(x) = ax - (a - 1)
			//  f(x) = a(x-1) + 1
			pageStart: (Math.floor(local_limit / BACKEND_LIMIT) * (local.page - 1) + 1),
			// pageEnd: 

		};

		backend = getBackendFromBackendPage(backend.pageStart, backend.pageEnd);

		console.log("getFirstBackendPageFromLocal() local: ", local);
		console.log("getFirstBackendPageFromLocal() backend: ", backend);
		console.log(`getFirstBackendPageFromLocal() local.page: ${local.page} | backend.pageStart: ${backend.pageStart}`)

		return backend;
	}





	let xhook = null;
	//XHook - v1.6.2 - https://github.com/jpillora/xhook | Jaime Pillora <dev@jpillora.com> - MIT Copyright 2023
	xhook = function () { "use strict"; const e = (e, t) => Array.prototype.slice.call(e, t); let t = null; "undefined" != typeof WorkerGlobalScope && self instanceof WorkerGlobalScope ? t = self : "undefined" != typeof global ? t = global : window && (t = window); const n = t, o = t.document, r = ["load", "loadend", "loadstart"], s = ["progress", "abort", "error", "timeout"], a = e => ["returnValue", "totalSize", "position"].includes(e), i = function (e, t) { for (let n in e) { if (a(n)) continue; const o = e[n]; try { t[n] = o } catch (e) { } } return t }, c = function (e, t, n) { const o = e => function (o) { const r = {}; for (let e in o) { if (a(e)) continue; const s = o[e]; r[e] = s === t ? n : s } return n.dispatchEvent(e, r) }; for (let r of Array.from(e)) n._has(r) && (t[`on${r}`] = o(r)) }, u = function (e) { if (o && null != o.createEventObject) { const t = o.createEventObject(); return t.type = e, t } try { return new Event(e) } catch (t) { return { type: e } } }, l = function (t) { let n = {}; const o = e => n[e] || [], r = { addEventListener: function (e, t, r) { n[e] = o(e), n[e].indexOf(t) >= 0 || (r = void 0 === r ? n[e].length : r, n[e].splice(r, 0, t)) }, removeEventListener: function (e, t) { if (void 0 === e) return void (n = {}); void 0 === t && (n[e] = []); const r = o(e).indexOf(t); -1 !== r && o(e).splice(r, 1) }, dispatchEvent: function () { const n = e(arguments), s = n.shift(); t || (n[0] = i(n[0], u(s)), Object.defineProperty(n[0], "target", { writable: !1, value: this })); const a = r[`on${s}`]; a && a.apply(r, n); const c = o(s).concat(o("*")); for (let e = 0; e < c.length; e++) { c[e].apply(r, n) } }, _has: e => !(!n[e] && !r[`on${e}`]) }; return t && (r.listeners = t => e(o(t)), r.on = r.addEventListener, r.off = r.removeEventListener, r.fire = r.dispatchEvent, r.once = function (e, t) { var n = function () { return r.off(e, n), t.apply(null, arguments) }; return r.on(e, n) }, r.destroy = () => n = {}), r }; var f = function (e, t) { switch (typeof e) { case "object": return n = e, Object.entries(n).map((([e, t]) => `${e.toLowerCase()}: ${t}`)).join("\r\n"); case "string": return function (e, t) { const n = e.split("\r\n"); null == t && (t = {}); for (let e of n) if (/([^:]+):\s*(.+)/.test(e)) { const e = null != RegExp.$1 ? RegExp.$1.toLowerCase() : void 0, n = RegExp.$2; null == t[e] && (t[e] = n) } return t }(e, t) }var n; return [] }; const d = l(!0), p = e => void 0 === e ? null : e, h = n.XMLHttpRequest, y = function () { const e = new h, t = {}; let n, o, a, u = null; var y = 0; const v = function () { if (a.status = u || e.status, -1 !== u && (a.statusText = e.statusText), -1 === u); else { const t = f(e.getAllResponseHeaders()); for (let e in t) { const n = t[e]; if (!a.headers[e]) { const t = e.toLowerCase(); a.headers[t] = n } } } }, b = function () { x.status = a.status, x.statusText = a.statusText }, g = function () { n || x.dispatchEvent("load", {}), x.dispatchEvent("loadend", {}), n && (x.readyState = 0) }, E = function (e) { for (; e > y && y < 4;)x.readyState = ++y, 1 === y && x.dispatchEvent("loadstart", {}), 2 === y && b(), 4 === y && (b(), "text" in a && (x.responseText = a.text), "xml" in a && (x.responseXML = a.xml), "data" in a && (x.response = a.data), "finalUrl" in a && (x.responseURL = a.finalUrl)), x.dispatchEvent("readystatechange", {}), 4 === y && (!1 === t.async ? g() : setTimeout(g, 0)) }, m = function (e) { if (4 !== e) return void E(e); const n = d.listeners("after"); var o = function () { if (n.length > 0) { const e = n.shift(); 2 === e.length ? (e(t, a), o()) : 3 === e.length && t.async ? e(t, a, o) : o() } else E(4) }; o() }; var x = l(); t.xhr = x, e.onreadystatechange = function (t) { try { 2 === e.readyState && v() } catch (e) { } 4 === e.readyState && (o = !1, v(), function () { if (e.responseType && "text" !== e.responseType) "document" === e.responseType ? (a.xml = e.responseXML, a.data = e.responseXML) : a.data = e.response; else { a.text = e.responseText, a.data = e.responseText; try { a.xml = e.responseXML } catch (e) { } } "responseURL" in e && (a.finalUrl = e.responseURL) }()), m(e.readyState) }; const w = function () { n = !0 }; x.addEventListener("error", w), x.addEventListener("timeout", w), x.addEventListener("abort", w), x.addEventListener("progress", (function (t) { y < 3 ? m(3) : e.readyState <= 3 && x.dispatchEvent("readystatechange", {}) })), "withCredentials" in e && (x.withCredentials = !1), x.status = 0; for (let e of Array.from(s.concat(r))) x[`on${e}`] = null; if (x.open = function (e, r, s, i, c) { y = 0, n = !1, o = !1, t.headers = {}, t.headerNames = {}, t.status = 0, t.method = e, t.url = r, t.async = !1 !== s, t.user = i, t.pass = c, a = {}, a.headers = {}, m(1) }, x.send = function (n) { let u, l; for (u of ["type", "timeout", "withCredentials"]) l = "type" === u ? "responseType" : u, l in x && (t[u] = x[l]); t.body = n; const f = d.listeners("before"); var p = function () { if (!f.length) return function () { for (u of (c(s, e, x), x.upload && c(s.concat(r), e.upload, x.upload), o = !0, e.open(t.method, t.url, t.async, t.user, t.pass), ["type", "timeout", "withCredentials"])) l = "type" === u ? "responseType" : u, u in t && (e[l] = t[u]); for (let n in t.headers) { const o = t.headers[n]; n && e.setRequestHeader(n, o) } e.send(t.body) }(); const n = function (e) { if ("object" == typeof e && ("number" == typeof e.status || "number" == typeof a.status)) return i(e, a), "data" in e || (e.data = e.response || e.text), void m(4); p() }; n.head = function (e) { i(e, a), m(2) }, n.progress = function (e) { i(e, a), m(3) }; const d = f.shift(); 1 === d.length ? n(d(t)) : 2 === d.length && t.async ? d(t, n) : n() }; p() }, x.abort = function () { u = -1, o ? e.abort() : x.dispatchEvent("abort", {}) }, x.setRequestHeader = function (e, n) { const o = null != e ? e.toLowerCase() : void 0, r = t.headerNames[o] = t.headerNames[o] || e; t.headers[r] && (n = t.headers[r] + ", " + n), t.headers[r] = n }, x.getResponseHeader = e => p(a.headers[e ? e.toLowerCase() : void 0]), x.getAllResponseHeaders = () => p(f(a.headers)), e.overrideMimeType && (x.overrideMimeType = function () { e.overrideMimeType.apply(e, arguments) }), e.upload) { let e = l(); x.upload = e, t.upload = e } return x.UNSENT = 0, x.OPENED = 1, x.HEADERS_RECEIVED = 2, x.LOADING = 3, x.DONE = 4, x.response = "", x.responseText = "", x.responseXML = null, x.readyState = 0, x.statusText = "", x }; y.UNSENT = 0, y.OPENED = 1, y.HEADERS_RECEIVED = 2, y.LOADING = 3, y.DONE = 4; var v = { patch() { h && (n.XMLHttpRequest = y) }, unpatch() { h && (n.XMLHttpRequest = h) }, Native: h, Xhook: y }; function b(e, t, n, o) { return new (n || (n = Promise))((function (r, s) { function a(e) { try { c(o.next(e)) } catch (e) { s(e) } } function i(e) { try { c(o.throw(e)) } catch (e) { s(e) } } function c(e) { var t; e.done ? r(e.value) : (t = e.value, t instanceof n ? t : new n((function (e) { e(t) }))).then(a, i) } c((o = o.apply(e, t || [])).next()) })) } const g = n.fetch; function E(e) { return e instanceof Headers ? m([...e.entries()]) : Array.isArray(e) ? m(e) : e } function m(e) { return e.reduce(((e, [t, n]) => (e[t] = n, e)), {}) } const x = function (e, t = { headers: {} }) { let n = Object.assign(Object.assign({}, t), { isFetch: !0 }); if (e instanceof Request) { const o = function (e) { let t = {}; return ["method", "headers", "body", "mode", "credentials", "cache", "redirect", "referrer", "referrerPolicy", "integrity", "keepalive", "signal", "url"].forEach((n => t[n] = e[n])), t }(e), r = Object.assign(Object.assign({}, E(o.headers)), E(n.headers)); n = Object.assign(Object.assign(Object.assign({}, o), t), { headers: r, acceptedRequest: !0 }) } else n.url = e; const o = d.listeners("before"), r = d.listeners("after"); return new Promise((function (t, s) { let a = t; const i = function (e) { if (!r.length) return a(e); const t = r.shift(); return 2 === t.length ? (t(n, e), i(e)) : 3 === t.length ? t(n, e, i) : i(e) }, c = function (e) { if (void 0 !== e) { const n = new Response(e.body || e.text, e); return t(n), void i(n) } u() }, u = function () { if (!o.length) return void l(); const e = o.shift(); return 1 === e.length ? c(e(n)) : 2 === e.length ? e(n, c) : void 0 }, l = () => b(this, void 0, void 0, (function* () { const { url: t, isFetch: o, acceptedRequest: r } = n, c = function (e, t) { var n = {}; for (var o in e) Object.prototype.hasOwnProperty.call(e, o) && t.indexOf(o) < 0 && (n[o] = e[o]); if (null != e && "function" == typeof Object.getOwnPropertySymbols) { var r = 0; for (o = Object.getOwnPropertySymbols(e); r < o.length; r++)t.indexOf(o[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, o[r]) && (n[o[r]] = e[o[r]]) } return n }(n, ["url", "isFetch", "acceptedRequest"]); return e instanceof Request && c.body instanceof ReadableStream && (c.body = yield new Response(c.body).text()), g(t, c).then((e => i(e))).catch((function (e) { return a = s, i(e), s(e) })) })); u() })) }; var w = { patch() { g && (n.fetch = x) }, unpatch() { g && (n.fetch = g) }, Native: g, Xhook: x }; const O = d; return O.EventEmitter = l, O.before = function (e, t) { if (e.length < 1 || e.length > 2) throw "invalid hook"; return O.on("before", e, t) }, O.after = function (e, t) { if (e.length < 2 || e.length > 3) throw "invalid hook"; return O.on("after", e, t) }, O.enable = function () { v.patch(), w.patch() }, O.disable = function () { v.unpatch(), w.unpatch() }, O.XMLHttpRequest = v.Native, O.fetch = w.Native, O.headers = f, O.enable(), O }();


	xhook.before((request, callback) =>
	{
		/* ADBLOCK XHR START */
		const prohibitedUrls = [
			"btloader.com",
			"btmessage.com",
			// "4dex.io",
			// "a-mo.net",
			// "adform.net",
			// "adnxs-simple.com",
			// "connectad.io",
			// "creativecdn.com",
			// "criteo.com",
			// "dns-finder.com",
			// "pubmatic.com",
			// "r2b2.cz",
			// "rubiconproject.com",
			// "smilewanted.com",
			// "smartadserver.com",
			// "spolecznosci.net/",
			// "teads.tv",
			"https://ssp.wp.pl",
			"https://wykop.pl/api/v3/ads",
		];
		if (prohibitedUrls.some((url) => request.url.includes(url))) return;
		/* ADBLOCK XHR END */



		if (request.url.includes("comments")
			&& request.url.includes("page=")
			&& (request.url.includes("links") || request.url.includes("entries")))
		{
			console.log(request);
			console.log(request.url);


			console.log(`BEFORE - request o URL komentarzy: request.url - ${request.url}`);

			const local = {};

			[, local.page] = request.url.match(/page=(\d+)/) || [null, 1];
			local.item = { first: {} }

			// WSZYSTKIE KOMENTARZE NA JEDNEJ STRONIE - START
			if (show_all_comments_in_one_page == true)
			{
				// ZA DUŻO KOMENTARZY, PONAD LIMITEM 500, WIĘC JEDNAK BĘDZIEMY DZIELIĆ NA STRONY PO 500, ale działa tylko gdy przechodzi się na ?page=12 a nie na ?page=1
				if (local.page * 50 > MAXIMUM_COMMENTS_IN_ONE_PAGE)
				{
					console.log(`BEFORE - chcialismy wyswietlic wszystkie komentarze na jednej stronie, ale jest ich za dużo, więc dzielimy je na podstrony`);
					show_all_comments_in_one_page = false;
					local_limit = MAXIMUM_COMMENTS_IN_ONE_PAGE;
				}
				else
				{
					// jeśli chcemy wszystkie komentarze na jednej stronie, kazdy request page=8 (wejście fizycznie na stronę 8) zamieniamy na page=1 a potem obslugujemy wszystkie page=1 -> page=8 w xhook.after();
					request.url = request.url.replace(/page=\d+/, 'page=1');
				}
			}



			// ZMIENIAMY LICZBĘ KOMENTARZY NA PODSTRONACH z 50 na użytkownika
			if (show_all_comments_in_one_page == false)
			{


				// jeśli chcemy mieć paginację Z INNĄ LICZBĄ NIŻ 50 KOMENTARZAMI, musimy obliczyć, którą stronę (backend.pageStart) faktycznie chcemy dostać na podstawie strony, którą użytkownik zażądał (local.page)
				if (local_limit < BACKEND_LIMIT)
				{
					// chcemy mieć na stronie mniej niż 50 komentarzy więc zwyczajnie wybieramy 
					// page= mniejszą niż 50 i ustawiamy limit dla backendu API odpowiedni do local_limit
					request.url = request.url.replace(/page=\d+/, `page=${local.page}`);
				}
				else if (local_limit > BACKEND_LIMIT)
				{

					console.log(`local_limie > BACKEND_LIMIT -> ${local_limit} > ${BACKEND_LIMIT}`);
					// chcemy mieć na stronie więcej niż 50 komentarzy, więc otwieramy w backendzie
					// pierwszą stronę, która zawiera aktualne wpisy
					// czyli np. gdy local_limit wynosi 70, a chcemy 2 stronę, czyli wpisy 71-140
					// to bedziemy chcieli faktycznie od backendu stronę 2 ponieważ komentarz 71 jest na 2. stronie po 50 wpisów (51-100)
					// więć otrzymamy wpisy 51-100 i wybierzemy wpisy od 71-100
					// natomiast potem xhook.after będzie pobierał stronę 3, żeby pobrać wpisy 101-140
					let backend = { pageStart: local.page };
					backend = getBackendPagesFromLocal(local);
					request.url = request.url.replace(/page=\d+/, `page=${backend.pageStart}`);
				}


				// ILE KOMENTARZY NA STRONIE ma być pobranych z backendu (max 50)
				if (request.url.includes("limit=")) request.url = request.url.replace(/limit=\d+/, `limit=${per_page_entries}`); 	// min(x, 50) limit => per_page
				else { request.url += `&limit=${per_page_entries}`; }
			}

			console.log("REQUEST WYSŁANY: ", request.url);
		}

		callback();
	});




	xhook.after((request, response) =>
	{

		if (response.status !== 200 || !response.finalUrl) return;

		if (!response.finalUrl.includes("comments")) return;
		if (!response.finalUrl.includes("page=")) return;
		if (!response.finalUrl.startsWith("https://wykop.pl/api/v3/entries/") && !response.finalUrl.startsWith("https://wykop.pl/api/v3/links/"));

		if (dev) console.log(`AFTER - response.finalUrl - ${response.finalUrl}`);
		if (dev) console.log("AFTER: response: ", response);

		let json = JSON.parse(response.text)

		if (dev) console.log("AFTER -- json", json)
		if (dev) console.log("AFTER -- json.pagination: ", json.pagination);


		// WSZYSTKIE KOMENTARZE NA JEDNEJ STRONIE - START
		if (show_all_comments_in_one_page == true)
		{
			// ZA DUŻO KOMENTARZY, PONAD LIMITEM 500, WIĘC JEDNAK BĘDZIEMY DZIELIĆ NA STRONY PO 500
			if (json.pagination.total > MAXIMUM_COMMENTS_IN_ONE_PAGE)
			{
				console.log(`AFTER - chcielismy wyswietlic wszystkie komentarze na jednej stronie, ale jest ich za dużo, więc JEDNAK dzielimy je na podstrony`);
				show_all_comments_in_one_page = false;
				local_limit = MAXIMUM_COMMENTS_IN_ONE_PAGE;
			}
		}
		// NIE MODYFIKUJEMY PODCZAS POBIERANIA KOLEJNYCH STRON page=2 ... DLA SHOW_ALL_COMMENTS_IN_ONE_PAGE, obsługujemy tylko page=1
		if (show_all_comments_in_one_page == true && !response.finalUrl.includes("page=1")) return;


		// https://wykop.pl/api/v3/entries/79760717/comments?page=1
		// https://wykop.pl/api/v3/links/7627183/comments?page=1&sort=best&ama=true


		const url = new URL(response.finalUrl);
		if (dev) console.log("AFTER: url ", url);
		if (dev) console.log("AFTER: url.pathname", url.pathname);

		let searchParams = new URLSearchParams(url.searchParams)
		let requestPage = parseInt(searchParams.get('page'));

		if (dev) console.log("AFTER: url.searchParams: ");
		if (dev) console.log(`AFTER: pageRequested = searchParams.get('page'): `, requestPage)

		const id = (response.finalUrl.match(/\/links\/(\d+)|\/entries\/(\d+)/) || []).slice(1).find(Boolean);
		if (dev) console.log("AFTER: ID from URL: ", id);

		console.log("local_limit", local_limit)
		console.log("json.data.length", json.data.length)
		console.log("json.pagination.per_page", json.pagination.per_page)
		console.log("json.pagination.total", json.pagination.total)

		// chcemy wyświetlić wszystkie na jednej stronie
		if (show_all_comments_in_one_page)
		{
			const totalPages = Math.ceil(json.pagination.total / json.pagination.per_page);

			console.log("for loop start ---------- SHOW_ALL_COMMENTS_IN_ONE_PAGE");

			console.log("totalPages: ", totalPages);
			console.log("urlPath: ", url.pathname)


			for (let page = 2; page <= totalPages; ++page)
			{
				// 429 too many requests fix
				// await new Promise(resolve => setTimeout(resolve, AWAIT_MILLISECONDS));

				searchParams.set('page', `${page}`);

				if (dev)
				{
					console.log("url.pathname", url.pathname);
					console.log("✔ xhook url.searchParams: ", searchParams);
				}

				/* REQUEST */
				const req = new XMLHttpRequest();
				req.open('GET', `${url.pathname}?${searchParams.toString()}`, false);

				for (let key in request.headers)
				{
					if (request.headers.hasOwnProperty(key)) req.setRequestHeader(key, request.headers[key]);
				}

				req.send(null)

				if (req.status !== 200)
				{
					break;
				}
				/* REQUEST END */

				let data = JSON.parse(req.responseText).data;

				console.log("for loop - data: ", data)
				console.log("for loop - json: ", json)

				if (data.length === 0) break;

				json.data = json.data.concat(data);

				console.log("for loop - json2: ", json)

			}
			if (json.data.length > BACKEND_LIMIT)
			{
				json.pagination.total = parseFloat(`1.${json.data.length}`); // zamiast "234" wyświetlamy 1.234 żeby nie wyświetlała się paginacja
			}
			response.text = JSON.stringify(json);

			return;
		}


		// uzytkownik chce wyswietlic wiecej niż 50 elementów, a jest więcej niż 50 elementów
		if (local_limit > json.data.length && local_limit > json.pagination.per_page)
		{
			console.log(`AFTER: local_limit [${local_limit}] > json.data.length [${json.data.length}] && local_limit > json.pagination.per_page [${json.pagination.per_page}]`);


			console.log("window.location.href", window.location.href)
			const openedCurrentPageNumber = extractPageNumber(window.location.href);
			console.log(`NUMER STRONY OTWARTER Z URL:`, openedCurrentPageNumber);


			// TODO zrobic sprawdzenie czy obecna strona to np. strona/2  strona/3 i pobierac odpowiednio dalsze grupy
			// bazujac na backend page i local_page

			// TYLKO JEŚLI REQUEST JEST DO page=3 na stronie której jesteśmy /strona/3 (nawet pomijając więcej wpisów)
			if (requestPage == openedCurrentPageNumber)
			{
				// pobraliśmy już 50 komentarzy z aktalnej strony requestPage więc teraz bedziemy pobierać kolejne 50 z następnej
				let nextPage = requestPage + 1;

				// sprawdzić nextPage czy jest z local/backend, ale chyba jest ok z requestu


				let commentsFetchedInFirstRequest = json.data.length;							// ile pobralismy w pierwszym requeście
				// let remainingComments = json.pagination.total - json.data.length;  				// local_limit - BACKEND_LIMIT;
				let remainingCommentsToFetch = local_limit - commentsFetchedInFirstRequest;		// ile jeszcze do pobrania
				const totalPagesToFetch = Math.ceil(remainingCommentsToFetch / json.pagination.per_page);

				console.log("requestPage", requestPage)
				console.log("nextPage", nextPage)
				console.log("commentsFetchedInFirstRequest", commentsFetchedInFirstRequest)
				console.log("remainingCommentsToFetch", remainingCommentsToFetch)
				console.log("totalPagesToFetch", totalPagesToFetch)

				let i = 1;

				while (i <= totalPagesToFetch)
				{
					// 429 too many requests fix
					// await new Promise(resolve => setTimeout(resolve, AWAIT_MILLISECONDS));

					console.log(`--- while --- page:   ${nextPage} START | i: ${i}`);

					searchParams.set('page', `${nextPage}`);

					/* REQUEST */
					let req = new XMLHttpRequest();
					req.open('GET', `${url.pathname}?${searchParams.toString()}`, false)

					for (let key in request.headers)
					{
						if (request.headers.hasOwnProperty(key)) req.setRequestHeader(key, request.headers[key]);
					}
					req.send(null);

					if (req.status !== 200) break;
					/* REQUEST END */

					let data = JSON.parse(req.responseText).data;
					if (data.length === 0) break;

					json.data = json.data.concat(data);

					commentsFetchedInFirstRequest += data.length;
					remainingCommentsToFetch -= commentsFetchedInFirstRequest;
					nextPage++;
					i++;
					console.log("while - page: ", nextPage)
					console.log("while - i: ", nextPage)

					console.log(`while - Fetched [${data.length}] comments on page [${nextPage - 1}] and got JSON `, data);
				} // end while

				if (commentsFetchedInFirstRequest > local_limit)
				{
					console.log(`Successfully fetched [${commentsFetchedInFirstRequest}] comments. Slicing to [${local_limit}]`);
					json.data = json.data.slice(0, local_limit); // dla pewnosci
				}
				else
				{
					console.log(`Only [${commentsFetchedInFirstRequest}] comments available in total.`);
				}

				console.log("json.data: ", json.data);
				json.pagination.total = local_limit;	// tu zmienić wyswietlanie na 1.123

				response.text = JSON.stringify(json);
			}

		}



	});



})();