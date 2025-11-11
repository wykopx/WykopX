







local_limit = 60;
backend_limit = 50;
total = 1000;




local = 70
1 	1 - 70[1, 2]		2(1 + 1)
2	71 - 140[2, 3]
3   141 - 210[3, 4]

local - 120
1 	1 - 120[1, 3]		3(1 + 2)
2	121 - 240[3, 5]
3   241 - 360[5, 8]


local = 240
1 	1 - 240[1, 5]-- 5(1 + 4)
2	241 - 480[5, 10]    6(1 + 5)
3   481 - 720[10, 15]   6(1 + 5)


local = 250
1 	1 - 250[1, 5]-- 5(1 + 4)
2	251 - 500[6, 10]
3   501 - 750[11, 15]



backend - 50

1 1 - 50
2 51 - 100
3 101 - 150
4 151 - 200
5 201 - 250
6 251 - 300
7 301 - 350
8 351 - 400
9 401 - 450
10 450 - 500
11 501 - 550
12 551 - 600
13 601 - 650
14 651 - 700
15 701 - 750

// x = n * (per_page / 50) - 1

x = (n - 1 * 3) + 1
n
1			1 1 - 50  51 - 100 101 - 150
2 151		4 151 - 200 201 - 250 251 - 300
3 301		7 301
4 450		10


100	50

// x = n * (per_page / 50) - 1

n
1	1
2	3
3	5
4   7
5	9
6	11


20	50
1 1 - 20	1
2 21 - 40	1
3








// local_limit = 100
// local.page=1					=> backend.page=1
// local.items.first = 1		=> backend.items.firs = 1
// local.items.last = 100		=> backend.items.last = 50

// local.page=1					=> backend.page=2
// local.items.first = 1		=> backend.items.firs = 51
// local.items.last = 100		=> backend.items.last = 100

// local.page=2					=> backend.page=3
// local.items.first = 101		=> backend.items.firs = 101
// local.items.last = 200		=> backend.items.last = 150

// local.page = 2				=> backend.page = 4
// local.items.first = 101		=> backend.items.firs = 151
// local.items.last = 200		=> backend.items.last = 200

// local.page = 3				=> backend.page = 5
// local.items.first = 201		=> backend.items.firs = 201
// local.items.last = 300		=> backend.items.last = 250


// local.page = 4				=> backend.page = 7
// local.items.first = 301		=> backend.items.firs = 301
// local.items.last = 400		=> backend.items.last = 350




// local_limit = 60
// local.page=1					=> backend.page=1
// local.items.first = 1		=> backend.items.firs = 1
// local.items.last = 60		=> backend.items.last = 50

// local.page=1					=> backend.page=2
// local.items.first = 1		=> backend.items.firs = 51
// local.items.last = 60		=> backend.items.last = 100

// local.page=2					=> backend.page=3
// local.items.first = 61		=> backend.items.firs = 101
// local.items.last = 120		=> backend.items.last = 150

// local.page = 2				=> backend.page = 4
// local.items.first = 101		=> backend.items.firs = 151
// local.items.last = 200		=> backend.items.last = 200

// local.page = 3				=> backend.page = 5
// local.items.first = 201		=> backend.items.firs = 201
// local.items.last = 300		=> backend.items.last = 250

function returnLocalFromBackend(backend)
{
	const local =
	{
		page: Math.ceil(backend.page / (local_limit / backend_limit)),

		item:
		{
			first: (local.page - 1) * local_limit + 1,
			last: Math.min(local.page * local_limit, total)
		}
	}

	return local;
}


function returnBackendFromLocal(local)
{
	const backend = {
		page: Math.ceil(local.page * (local_limit / backend_limit)),
		item: {
			first: (backend.page - 1) * backend_limit + 1,
			last: Math.min(backend.page * backend_limit, total)
		}
	};

	return backend;
}


