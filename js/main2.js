var proizvodi = [];
var kategorije = [];
var brendovi = [];

window.onload = function () {
    /* Funkcija za pozivanja ajaxa */
    function callBackAjax(nazivFajla, rezultat) {
        $.ajax({
            url: "data/" + nazivFajla + ".json",
            method: "get",
            dataType: "json",
            success: function (data) {
                rezultat(data);
            },
            error: function (xhr, error, status) {
                console.log(xhr);
            }
        });
    }

    /* Uzimanje stranice sa koje se poziva js */
    var url = window.location.pathname;
    url = url.substring(url.lastIndexOf('/'));

    if (url == "/" || url == "/index.html") {

        callBackAjax("menu", function (rezultat) {
            ispisMenija(rezultat, 1)
        });
        callBackAjax("kolekcijePrvaStrana", ispisKolekcijePocetna);
        callBackAjax("proizvodi", prikaziNoveProizvode);
        callBackAjax("proizvodi", prikaziTopProizvode);
        callBackAjax("proizvodi", function (rezultat) {
            proizvodi = [...rezultat];
        });
        ispisFooter();

    }
    if (url == "/store.html") {
        callBackAjax("menu", function (rezultat) {
            ispisMenija(rezultat, 2);
        });
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        pomId = params.kat;
        callBackAjax("kategorije", function (rezultat) {
            ispisKategorijaFilter(rezultat, params.kat)
        });
        //callBackAjax("kategorije", ispisKategorijaFilter);
        callBackAjax("brendovi", ispisBrendovaFilter);
        callBackAjax("proizvodi", ispisProizvoda);
        uradiMain();
        ispisFooter();
    }
    var pomId;
    if (url == "/product.html") {
        callBackAjax("menu", function (rezultat) {
            ispisMenija(rezultat, 1)
        });
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        pomId = params.id;
        callBackAjax("kategorije", dohvatiSveKategorije)
        callBackAjax("brendovi", dohvatiSveBrendove)
        callBackAjax("proizvodi", function (rezultat) {
            detaljanIspisProizovoda(rezultat, params.id)
        });
        callBackAjax("proizvodi", dohvatiSveProizvode);
        ispisFooter();
    }
    if (url == "/checkout.html") {
        callBackAjax("menu", function (rezultat) {
            ispisMenija(rezultat);
        });
        callBackAjax("proizvodi", dohvatiSveProizvode)
        setTimeout(function () {
            ispisUnutarPlacanjeProizvode(); // will show devices array
        }, 100)
        ispisFooter();
        
    }
    if (url == "/cart.html") {
        callBackAjax("menu", function (rezultat) {
            ispisMenija(rezultat);
        });
        callBackAjax("proizvodi", function (rezultat) {
            proizvodi = [...rezultat];
            ispisKorpa();
            izdracunajPodatkeRacuna()
        });
        ispisFooter();

    }

    /* Dohvatanje svih brendova */
    function dohvatiSveBrendove(br) {
        for (b of br) {
            brendovi.push(b);
        }
    }

    /* Funkcija za odabir kolicine proizvoda unutar product.html */
    function counter() {
        var proQty = $(".pro-qty");
        proQty.prepend('<span onclick="" class="dec qtybtn minus">-</span>');
        proQty.append('<span class="inc qtybtn plus">+</span>');
        proQty.on("click", ".qtybtn", function () {
            var $button = $(this);
            var oldValue = $button.parent().find("input").val();
            if ($button.hasClass("inc")) {
                var newVal = parseFloat(oldValue) + 1;
            } else {
                // Don't allow decrementing below zero
                if (oldValue > 0) {
                    var newVal = parseFloat(oldValue) - 1;
                } else {
                    newVal = 0;
                }
            }
            $button.parent().find("input").val(newVal);
        });
    }

    /* Ispisivanje proizvoda unutar product.html */
    function detaljanIspisProizovoda(niz, id) {
        let html1 = ``;
        let html2 = ``;
        let html3 = ``;
        let proizvod = niz.find(x => x.id == id)
        html1 += `
            <div class="product-preview">
                <img id="velikaSlika"  src="${proizvod.slike[0].src}" alt="${proizvod.slike[0].naziv}">
            </div>
        `;

        for (let i = 0; i < 3; i++) {
            html2 += `
            <div class="maliBlokSlika">
				<img class="w-inherit malaSlicica" src="${proizvod.slike[i].src}" alt="${proizvod.slike[i].naziv}">
			</div>
            `
        }

        html3 += `
            <h2 class="product-name">${proizvod.naziv}</h2>
            <div>
                ${brojZvezdica(proizvod.brojZvezdica)}
            </div>
            <div>
                <h3 class="product-price">${proizvod.cena.novaCena}<del class="product-old-price">${proizvod.cena.staraCena}</del></h3>
                <span class="product-available">${naStanju(proizvod.stanje)}</span>
            </div>`

        if (naStanju(proizvod.stanje) == "Na stanju")
            html3 += `
            <div class="add-to-cart">
                <button onclick="dugmeDodajUKorpu(${pomId})"  class="add-to-cart-btn"><i class="fa fa-shopping-cart"></i> Dodaj u korpu</button>
            </div>

            <div class="productdetailsquantity">
                <div class="quantity">
                  <div class="pro-qty">
                    <input id="poljeZaKolicinu" type="text" value="1" />
                  </div>
                </div>
            </div>
            `

        html3 += `<ul>
                <li><b>Proizvodjac:</b> ${ispisiNazivBrenda(proizvod.proizvodjacId)} </li>
                <li><b>Garancija:</b> 2 godine</li>
                <li><b>Dostava:</b> ${besplatnaDostava(proizvod.cena.novaCena)}</i></li>
                <li></li>
            </ul>

            <ul class="product-links">
                <li><b>Kategorija:</b> ${ispisKategorije(proizvod.kategorijaID)}</li>
            </ul>
        `

        $("#velikaSLika").html(html1);
        $("#triMaleSlike").html(html2);
        $("#detaljiProizvoda").html(html3);

        ispisTabele(proizvod.karakteristike)
        let xd = $(".malaSlicica");
        for (let i = 0; i < xd.length; i++) {
            xd[i].addEventListener("click", () => {
                uzmiMaleSlike(xd[i])
            })
        }
        counter();
    }

    /* Funkcija za ispisivanje tabele sa svim karakteristikama proizvoda */
    function ispisTabele(obj) {
        html = ``;
        for (kljuc in obj) {
            html += `
             <tr>
                 <th scope="row">${kljuc}</th>
                 <td>${obj[kljuc]}</td>
             </tr>
             `
        }
        $("#teloTabele").html(html)

    }

    /* Funkcija za zamenu velike slicice sa slikom iz manje slicice */
    function uzmiMaleSlike(n) {
        $("#velikaSlika").attr("src", n.src);
    }


    /* Ispis brenda product.html */
    function ispisiNazivBrenda(id) {
        html = ``;
        for (b of brendovi) {
            if (b.id == id)
                html += b.naziv;
        }
        return html;
    }

    /* Ispituje da li je proizvod na stanju */
    function naStanju(stanje) {
        let html = ``;
        if (stanje)
            html += "Na stanju";
        else
            html += "Nije na stanju";
        return html;
    }

    /* Функција ѕа врацанје да ли је достава бесплатна или се плаца */
    function besplatnaDostava(cena) {
        if (cena > 35000)
            return "Besplatna dostava"
        else
            return "+ dostava 500 din"
    }

    /* Ispis menija na svakoj strani */
    function ispisMenija(niz, index) {
        let html = `<ul class="main-nav nav navbar-nav">`;
        for (let i = 0; i < niz.length; i++) {
            if (niz[i].id == index) {
                html += `<li class="active"><a href="${niz[i].href}">${niz[i].naziv}</a></li>`;
            } else {
                html += `<li><a href="${niz[i].href}">${niz[i].naziv}</a></li>`;
            }
        }
        html += `</ul>`;
        $("#responsive-nav").html(html);
    }

    /* Ispis tri grupe proizvoda na prvoj strani */
    function ispisKolekcijePocetna(niz) {
        let html = ``;
        for (let i = 0; i < niz.length; i++) {
            html += `
            
            <div class="col-md-4 col-xs-6">
            <div class="shop">
              <div class="shop-img">
                <img src="${niz[i].slika}" alt="${niz[i].naziv}" onclick=""/>
              </div>
              <div class="shop-body">
                <h3>${niz[i].naziv}<br />Kolekcija</h3>
                <a href="store.html?kat=${niz[i].kat_id}&" class="cta-btn">
                  Kupi sad <i class="fa fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>
          </div>
            `;
        };
        $("#divKolekcije").html(html);
    }
    /* Funkcija za ispisivanje checkbox kategorija na shop stranici */
    function ispisKategorijaFilter(niz, id) {
        let html = ``;
        if (id == undefined) {
            for (n of niz) {
                kategorije.push(n)
                html += `
                    <div class="input-checkbox">
                        <input class="kategorija-check" type="checkbox" value="${n.id}" id="kategorije${n.id}">
                        <label for="kategorije${n.id}">
                            <span></span>
                            ${n.naziv}
                            
                        </label>
                    </div>
                `;
            }
        }
        else {
            for (n of niz) {
                html += `
                <div class="input-checkbox">
                `
                if (n.id == id)
                    html += `
                    <input class="kategorija-check" checked type="checkbox" value="${n.id}" id="kategorije${n.id}">
                    `;
                else
                    html += `<input class="kategorija-check" type="checkbox" value="${n.id}" id="kategorije${n.id}">`

                html += `
                <label for="kategorije${n.id}">
                <span></span>
                ${n.naziv}
                
            </label>
        </div>
                `
            }
        }
        $("#categories").html(html);
    }

    /* Funkcija za ispisivanje brendova i scheckboksova */
    function ispisBrendovaFilter(niz) {
        let html = ``;
        for (n of niz) {
            brendovi.push(n)
            html += `
                <div class="input-checkbox">
                    <input class="brend-check" type="checkbox" value="${n.id}" id="brendovi${n.id}">
                    <label for="brendovi${n.id}">
                        <span></span>
                        ${n.naziv}                    
                    </label>
                </div>
            `;
        }
        $("#brands").html(html);

    }

    /* DOhvatanje svih proizvoda */
    function dohvatiSveProizvode(niz) {
        for (let i = 0; i < niz.length; i++) {
            proizvodi.push(niz[i])
        }
    }

    /* Funkcija za ispisivanje proizvoda unutar stranice store.html */
    function ispisProizvoda(niz) {
        let html = ``;
        niz = sortirajProizvode(niz);
        niz = filterKategorija(niz);
        niz = filterBrendovi(niz);
        niz = filterCene(niz);
        niz = searchProizvode(niz);
        if (niz.length == 0)
            html = `<h2 class="alert-danger">Žao nam je, nemamo proizvode sa izabranim karakteristikama.</h2>`
        for (x of niz) {
            proizvodi.push(x)
            html += `
            <a href="product.html?id=${x.id}&"><div class="col-md-4 col-xs-6">
                <div class="product">
                    <div class="product-img">
                        <img src="${x.slike[0].src}" alt="${x.slike[0].naziv}">
                        ${daLiJeNov(x.novo, x.topPonuda)}
                    </div>
                    <div class="product-body">
                        <p class="product-category"> ${ispisKategorije(x.kategorijaID)} </p>
                        <h3 class="product-name"><a href="#">${x.naziv}</a></h3>
                        <h4 class="product-price">${x.cena.novaCena} <del class="product-old-price">${x.cena.staraCena}</del></h4>
                        <div class="product-rating">
                            ${brojZvezdica(x.brojZvezdica)}
                        </div>
                        <!--<div class="product-btns">
                            <button class="add-to-wishlist"><i class="fa fa-heart-o"></i><span class="tooltipp">Dodaj na listu zelja</span></button>
                            <button class="add-to-compare"><i class="fa fa-exchange"></i><span class="tooltipp">Uporedi</span></button>
                            <button class="quick-view"><i class="fa fa-eye"></i><span class="tooltipp">Pogledaj</span></button>
                        </div>-->
                    </div>
                    <div class="add-to-cart">
                        <button onclick="dodajProizvodKorpa(${x.id})" class="add-to-cart-btn"><i class="fa fa-shopping-cart"></i> Dodaj u korpu</button>
                    </div>
                </div>
            </div></a>
            `
        }
        $("#proizvodi").html(html);
    }
    /* Pretrazivanje proizvoda po tekstu ukucanom u search-box */
    function searchProizvode(niz) {
        let uneoKorisnik = $("#pretraga").val();
        return niz.filter(x => {
            if (x.naziv.toLowerCase().indexOf(uneoKorisnik.toLowerCase().trim()) != -1)
                return x;
        })
    }
    /* Funkcija za ispis broja zvezdica proizvoda */
    function brojZvezdica(br) {
        let html = `<div class="product-rating">`;
        for (let i = 0; i < br; i++) {
            html += `<i class="fa fa-star"></i>`;
        }
        html += `</div>`;
        return html;
    }

    /* Funkcija koja ispisuje da li je proizvod nov */
    function daLiJeNov(nov, top) {
        let html = `<div class="product-label">`;
        if (nov)
            html += `<span class="new">NOVO</span>`;
        if (top)
            html += `<span class="sale">TOP</span>`;
        html += `</div>`
        return html;
    }

    /* Dohvatanje svih kategorija iz jsona */
    function dohvatiSveKategorije(nizKategorija) {
        for (n of nizKategorija)
            kategorije.push(n)
    }

    /* Ispis kategorije unutar proizvoda */
    function ispisKategorije(id) {
        let html = ``;
        kategorije.forEach(element => {
            if (element.id == id)
                html += element.naziv
        })
        return html;

    }

    /* Sortiranjue proizvoda po ceni */
    function sortirajProizvode(niz) {
        let x = $("#sortiranje").val();
        if (x == 0) {
            niz.sort((a, b) => (a.cena.novaCena > b.cena.novaCena) ? 1 : -1);
        }
        else if (x == 1) {
            niz.sort((a, b) => (a.cena.novaCena < b.cena.novaCena) ? 1 : -1);
        }
        else if (x == 2) {
            niz.sort((a, b) => (a.brojZvezdica < b.brojZvezdica) ? 1 : -1);
        }
        else if (x == 3) {
            niz.sort((a, b) => (a.naziv > b.naziv) ? 1 : -1);
        }
        else if (x == 4) {
            niz.sort((a, b) => (a.naziv < b.naziv) ? 1 : -1);
        }
        return niz;
    }

    /* Funkcija za filtriranje proizvoda po kategorijama */
    function filterKategorija(niz) {
        let cekiraneKategorije = [];
        for (let i = 0; i < $(".kategorija-check:checked").length; i++)
            cekiraneKategorije.push(parseInt($(".kategorija-check:checked")[i].value))
        if (cekiraneKategorije.length != 0)
            return niz.filter((x) => cekiraneKategorije.includes(x.kategorijaID));
        return niz;
    }

    /* Funkcija za filtriranje prema brendovima */
    function filterBrendovi(niz) {
        let stikliraniBrendovi = [];
        for (let i = 0; i < $(".brend-check:checked").length; i++)
            stikliraniBrendovi.push(parseInt($(".brend-check:checked")[i].value));
        if (stikliraniBrendovi.length != 0)
            return niz.filter((x) => stikliraniBrendovi.includes(x.proizvodjacId));
        return niz;
    }

    /* Funkcija za filtriranje prema opsegu cene */
    function filterCene(niz) {
        let min = $("#price-min").val();
        let max = $("#price-max").val();
        return niz.filter((x) => {
            if (x.cena.novaCena >= min && x.cena.novaCena <= max)
                return x;
        });
    }

    /* Funkcija za prikaz novih proizvoda na pocetnoj stranici */
    function prikaziNoveProizvode(niz) {
        let html = ``;
        let nizNovih = [];
        niz.forEach(element => {
            if (element.novo)
                nizNovih.push(element);
        });
        for (let i = 0; i < nizNovih.length; i++) {
            html += `
            
            <div class="product">
                <div class="product-img">
                <img src="${nizNovih[i].slike[0].src}" alt="${nizNovih[i].slike[0].naziv}">
                    <div class="product-label">
                        <span class="new">NEW</span>
                    </div>
                </div>
                <div class="product-body">
                    <p class="product-category">  </p>
                    <h3 class="product-name">${nizNovih[i].naziv}<a href="#"></a></h3>
                    <h4 class="product-price">${nizNovih[i].cena.novaCena}<del class="product-old-price">${nizNovih[i].cena.staraCena}</del></h4>
                    ${brojZvezdica(nizNovih[i].brojZvezdica)}
                    <div class="product-btns">
                        <!--<button class="add-to-wishlist"><i class="fa fa-heart-o"></i><span class="tooltipp">add to wishlist</span></button>
                        <button class="add-to-compare"><i class="fa fa-exchange"></i><span class="tooltipp">add to compare</span></button>-->
                        <a href="product.html?id=${nizNovih[i].id}&><button class="quick-view"><i class="fa fa-eye"> PREGLED</i><span class="tooltipp"></span></button></a>
                    </div>
                </div>
                <div class="add-to-cart">
                    <button onclick="dodajProizvodKorpa(${nizNovih[i].id})" class="add-to-cart-btn"><i class="fa fa-shopping-cart"></i> Dodaj u korpu</button>
                </div>
            </div>
            `
        }
        $("#noviProizvodi").html(html);
        lmao()
    }
    /* Funkcija za prikaz proizvoda iz top ponude */
    function prikaziTopProizvode(niz) {
        let html = ``;
        let nizNovih = [];
        niz.forEach(element => {
            if (element.topPonuda)
                nizNovih.push(element);
        });
        for (let i = 0; i < nizNovih.length; i++) {
            html += `
            
            <div class="product">
                <div class="product-img">
                <img src="${nizNovih[i].slike[0].src}" alt="${nizNovih[i].slike[0].naziv}">
                    <div class="product-label">
                        <span class="sale">TOP</span>
                    </div>
                </div>
                <div class="product-body">
                    <p class="product-category">  </p>
                    <h3 class="product-name">${nizNovih[i].naziv}<a href="#"></a></h3>
                    <h4 class="product-price">${nizNovih[i].cena.novaCena}<del class="product-old-price">${nizNovih[i].cena.staraCena}</del></h4>
                    ${brojZvezdica(nizNovih[i].brojZvezdica)}
                    <div class="product-btns">
                        <!--<button class="add-to-wishlist"><i class="fa fa-heart-o"></i><span class="tooltipp">add to wishlist</span></button>
                        <button class="add-to-compare"><i class="fa fa-exchange"></i><span class="tooltipp">add to compare</span></button>-->
                        <a href="product.html?id=${nizNovih[i].id}&><button class="quick-view"><i class="fa fa-eye"> PREGLED</i><span class="tooltipp"></span></button></a>
                    </div>
                </div>
                <div class="add-to-cart">
                    <button onclick="dodajProizvodKorpa(${nizNovih[i].id})" class="add-to-cart-btn"><i class="fa fa-shopping-cart"></i> dodaj u korpu</button>
                </div>
            </div>
            `
        }
        $("#topProizvodi").html(html);
        lmao2();
    }

    /* Funkcija za ucitavanje sliddera in main.js */
    function lmao() {
        $('.products-slick').each(function () {
            var $this = $(this),
                $nav = $this.attr('data-nav');

            $this.slick({
                slidesToShow: 4,
                slidesToScroll: 1,
                autoplay: true,
                infinite: true,
                speed: 300,
                dots: false,
                arrows: true,
                appendArrows: $nav ? $nav : false,
                responsive: [{
                    breakpoint: 991,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    }
                },
                ]
            });
        });
    }
    function lmao2() {
        $('.products-slickk').each(function () {
            var $this = $(this),
                $nav = $this.attr('data-nav');

            $this.slick({
                slidesToShow: 4,
                slidesToScroll: 1,
                autoplay: true,
                infinite: true,
                speed: 300,
                dots: false,
                arrows: true,
                appendArrows: $nav ? $nav : false,
                responsive: [{
                    breakpoint: 991,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    }
                },
                ]
            });
        });
    }

    /* Funkcija za mali ispis korpe kad se klikne na nju */
    function maliPrikazKorpe() {
        let proizvodiKorpaId = uzmiItemIzLocalStorage("proizvodiKorpa");
        if(proizvodiKorpaId){
            html = `<div class="cart-list">`;
            let pomNiz = []
            let nizKolicine = []
            for (x of proizvodi) {
                for (p of proizvodiKorpaId) {
                    if (x.id == p.id) {
                        pomNiz.push(x);
                        nizKolicine.push(p.kolicina)
                    }
                }
            }
            for (let i = 0; i < pomNiz.length; i++) {
                html += `
                    <div class="product-widget">
                        <div class="product-img">
                            <img src="${pomNiz[i].slike[0].src}" alt="">
                        </div>
                        <div class="product-body">
                            <h3 class="product-name"><a href="#">${pomNiz[i].naziv}</a></h3>
                            <h4 class="product-price"><span class="qty">${nizKolicine[i]}x</span>${pomNiz[i].cena.novaCena}</h4>
                        </div>
                        <!--<button class="delete"><i class="fa fa-close"></i></button>-->
                    </div>    
                `
            }
            html += `</div>`;
            html += `
            <div class="cart-summary">
                <small>${pomNiz.length} ${vratiMnozinuJedniuinu(pomNiz.length)}</small>
                <h5>Račun: ${izracunajSumu(proizvodiKorpaId, proizvodi)} rsd.</h5>
            </div>
            `
            html += `
            <div class="cart-btns">
                <a href="cart.html">Pregled korpe</a>
                <a href="checkout.html">Plaćanje  <i class="fa fa-arrow-circle-right"></i></a>
            </div>
            `
            $("#maliPrikazKorpeStavke").html(html);
    
            function izracunajSumu(proizvodiKorpaId, proizvodi) {
                let suma = 0;
                for (p of proizvodiKorpaId) {
                    for (x of proizvodi) {
                        if (p.id == x.id) {
                            suma += p.kolicina * x.cena.novaCena;
                        }
                    }
                }
                return suma;
            }
            function vratiMnozinuJedniuinu(duzina) {
                let html = ``;
                if (duzina % 10 == 1)
                    return html += `Proizvod u korpi`
                else
                    return html += `Proizvoda u korpi`
            }
        }
        else{
            $("#maliPrikazKorpeStavke").html("Korpa je prazna");
        }
    }

    /* Prekopirano iz main.js jer nije htelo da radi kad je u onom fajlu */
    function uradiMain() {
        $('.products-slick').each(function () {
            var $this = $(this),
                $nav = $this.attr('data-nav');

            $this.slick({
                slidesToShow: 4,
                slidesToScroll: 1,
                autoplay: true,
                infinite: true,
                speed: 300,
                dots: false,
                arrows: true,
                appendArrows: $nav ? $nav : false,
                responsive: [{
                    breakpoint: 991,
                    settings: {
                        slidesToShow: 2,
                        slidesToScroll: 1,
                    }
                },
                {
                    breakpoint: 480,
                    settings: {
                        slidesToShow: 1,
                        slidesToScroll: 1,
                    }
                },
                ]
            });
        });

        // Products Widget Slick
        /*$('.products-widget-slick').each(function () {
            var $this = $(this),
                $nav = $this.attr('data-nav');

            $this.slick({
                infinite: true,
                autoplay: true,
                speed: 300,
                dots: false,
                arrows: true,
                appendArrows: $nav ? $nav : false,
            });
        });*/

        /////////////////////////////////////////

        // Product Main img Slick
        $('#product-main-img').slick({
            infinite: true,
            speed: 300,
            dots: false,
            arrows: true,
            fade: true,
            asNavFor: '#product-imgs',
        });

        // Product imgs Slick
        /*$('#product-imgs').slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            arrows: true,
            centerMode: true,
            focusOnSelect: true,
            centerPadding: 0,
            vertical: true,
            asNavFor: '#product-main-img',
            responsive: [{
                breakpoint: 991,
                settings: {
                    vertical: false,
                    arrows: false,
                    dots: true,
                }
            },
            ]
        }); */
        var priceInputMax = document.getElementById('price-max'),
            priceInputMin = document.getElementById('price-min');

        priceInputMax.addEventListener('change', function () {
            updatePriceSlider($(this).parent(), this.value)
        });

        priceInputMin.addEventListener('change', function () {
            updatePriceSlider($(this).parent(), this.value)

        });

        var priceSlider = document.getElementById('price-slider');
        if (priceSlider) {
            noUiSlider.create(priceSlider, {
                start: [10000, 250000],
                connect: true,
                step: 1,
                range: {
                    'min': 10000,
                    'max': 250000
                }
            });

            priceSlider.noUiSlider.on('update', function (values, handle) {
                var value = values[handle];
                handle ? priceInputMax.value = value : priceInputMin.value = value
            });
        }
    }

    /* FUnkcija za dinamicko ispisivanje korpe */
    function ispisKorpa() {
        let velikiHtml = ``;
        let proizvodiKorpa = uzmiItemIzLocalStorage("proizvodiKorpa");
        if(proizvodiKorpa.length==0){
            $("#naslov-korpa").html("Nema proizvoda u korpi... <u><a href='store.html'> nazad u prodavnicu</a></u></br>")
            $("#naslov-korpa").addClass("crveno")
            $("#dugmeDoPlacanja").prop("href", "javascript:void(0)")
            $("#sakrijAkoJePrazno").addClass("hide")
        }
        for (pk of proizvodiKorpa) {
            for (p of proizvodi) {
                if (pk.id == p.id) {
                    velikiHtml += (ispisiUnutarKorpe(p, pk.kolicina));

                }
            }
        }
        $("#sadrzajKorpe").html(velikiHtml);
        function ispisiUnutarKorpe(obj, kolicina) {

            let html = ``;
            html += `
            <div id="divJedanRedKorpa${obj.id}" class="glavniDiv d-flex flex-column justify-content-between align-items-center flex-md-row">
                  <div>
                    <img class="mb-2 malaSlika" src="${obj.slike[0].src}" alt="${obj.slike[0].naziv}" />
                  </div>
                  <div class="fix-duzina-naziv"><h5 class="mb-2">${obj.naziv}</h5></div>
                  <div id="cenaJednogKomada${obj.id}" class="shopingcartprice">${obj.cena.novaCena}</div>
                  <div class="shopingcartquantity" class="mb-2">
                    <div class="counterDiv" class="mb-2">
                      <button onclick="smanji(${obj.id})" id="dugmeMinus${obj.id}" class="btnMinuIPlus">-</button>
                      <input
                        id="text${obj.id}"
                        class="counterInput"
                        type="text"
                        name=""
                        disabled
                        value="${kolicina}"
                      />
                      <button onclick="povecaj(${obj.id})" id="dugmePlus${obj.id}" class="btnMinuIPlus">+</button>
                    </div>
                  </div>
                  <div><p class="shopingcarttotal m-0"  id="ukupnaCena${obj.id}">${izracunajCenu(obj.cena.novaCena, kolicina)}</p></div>
                  <div class="shopingcartitem__close mb-2">
                    <span onclick="izbaciIzKorpe(${obj.id})" class="icon_close alert-danger dugmeIzbrisi">Izbaci</span>
                  </div>
                </div>
            `
            return html;
        }
        function izracunajCenu(cena, kolicina) {
            let html = ``
            return html += cena * kolicina;
        }
        counter();
        $(".minus").on("click", () => {
            $(this).html("lamo")
        });
    }



    /* Funkcija za sladnje porudzbine */
    function posaljiPorudzbinu() {
        if (uzmiItemIzLocalStorage("proizvodiKorpa").length != 0) {
            let brGreski = 0;
            let ime = $("#poljeImePrezime").val();
            if (proveriImePrezime(ime)) $("#greskaIme").hide(); else { ispisiGresku("poljeImePrezime"); brGreski++; }
            let email = $("#poljeEmail").val();
            if (proveraEmail(email)) $("#greskaEmail").hide(); else { ispisiGresku("poljeEmail"); brGreski++; }
            let adresa = $("#poljeAdresa").val();
            if (proveriAdresu(adresa)) $("#greskaAdresa").hide(); else { ispisiGresku("poljeAdresa"); brGreski++; }
            let grad = $("#poljeGrad").val();
            if (proveraGrad(grad)) $("#greskaGrad").hide(); else { ispisiGresku("poljeGrad"); brGreski++; }
            let zip = $("#poljeZip").val();
            if (proveraPostanskiBroj(zip)) $("#greskaZip").hide(); else { ispisiGresku("poljeZip"); brGreski++; }
            let tel = $("#poljeTelefon").val();
            if (proveraTelefon(tel)) $("#greskaTelefon").hide(); else { ispisiGresku("poljeTelefon"); brGreski++; }
            if (!proveriDugmeCheck()) brGreski++;
            let pom = $("input[type=radio][name='payment']:checked").val()
            if (brGreski == 0 && pom == "f") {
                $("#dugmePosalji").addClass("zelenaSlova");
                $("#dugmePosalji").val("Porudžbina poslata!")
                localStorage.removeItem("proizvodiKorpa");
                osveziKorpu();
            }
            else if (brGreski == 0 && pom == "p") {
                let regNaziv = /^[A-Zšđžćč][^<*@#%?/>%$]*$/;
                let regRacun = /^[0-9]{5}-[0-9]{3}-[0-9]{5}$/;
                let nazivFirme = $("#nazivFirme").val();
                let racunFirme = $("#racunFirme").val();
                let greskeFirma = 0;
                if (regNaziv.test(nazivFirme)) {
                    $("#nazivFirme").removeClass("crveinInput")
                }
                else {
                    greskeFirma += 1;
                    $("#nazivFirme").addClass("crveinInput")
                }
                if (regRacun.test(racunFirme)) {
                    $("#racunFirme").removeClass("crveinInput")
                }
                else {
                    greskeFirma += 1;
                    $("#racunFirme").addClass("crveinInput")
                }
                if (greskeFirma == 0) {
                    $("#dugmePosalji").addClass("zelenaSlova");
                    $("#dugmePosalji").val("Porudžbina poslata!")
                    localStorage.removeItem("proizvodiKorpa");
                    osveziKorpu();
                    ispisBrojaStavkiKorpe()
                }
            }
        }
    }
    /* Provera da li je dugme za uslove koriscenja cekirano */
    function proveriDugmeCheck() {
        let dugme = document.getElementById("create-account")
        if (dugme.checked) {
            $("#prihvatam").css("color", "black")
            return true;
        }
        else {
            $("#prihvatam").css("color", "red")
            return false;
        }
    }

    /* Funkcija za ispis gresaka */
    function ispisiGresku(imePolja) {
        let el = $(`#${imePolja}`);
        if (imePolja == "poljeImePrezime") ispisGreskeIspodInputa("greskaIme", "Prva slova velika, maks. 3 reči, samo slova!")/* console.log("Prva slova velika, najviše 3 reči!") */;
        if (imePolja == "poljeEmail") ispisGreskeIspodInputa("greskaEmail", "Email nije u ispravnom formatu!");
        if (imePolja == "poljeAdresa") ispisGreskeIspodInputa("greskaAdresa", "Samo slova i brojevi!");
        if (imePolja == "poljeGrad") ispisGreskeIspodInputa("greskaGrad", "Prva slova velika, maks. 3 reči!");
        if (imePolja == "poljeZip") ispisGreskeIspodInputa("greskaZip", "Samo brojevi, od 4 do 6 cifara!");
        if (imePolja == "poljeTelefon") ispisGreskeIspodInputa("greskaTelefon", "Mora početi sa '06', od 7 do 9 cifara!");
    }

    /* Ispis greske ispod inputa */
    function ispisGreskeIspodInputa(id, greska) {
        $(`#${id}`).html(greska)
        $(`#${id}`).show();
    }

    /* Funkcija za ispitivanje unosa ime-prezimena */
    function proveriImePrezime(ime) {
        let uzorakIme = /^[A-ZČĆŠĐŽ][a-zčćšđž]{2,15}(\s[A-ZČĆŠĐŽ][a-zčćšđž]{2,15})?(\s[A-ZČĆŠĐŽ][a-zčćšđž]{2,20})\s*$/;
        if (uzorakIme.test(ime))
            return true;
        else
            return false;
    }

    /* Funkcija za proveru adrese */
    function proveriAdresu(adresa) {
        let uzorakAdresa = /^[A-ZČĆŠĐŽ][a-zčćšđž]{1,15}(\s[1-9](?:[A-ZČĆŠĐŽ]|[a-zčćšđž]))?(\s[A-ZČĆŠĐŽ][a-zčćšđž]{1,15})?(?:\s[0-9]{0,3}|\s[1-9](?:[A-ZČĆŠĐŽ]|[a-zčćšđž]))?\s*$/;
        if (uzorakAdresa.test(adresa))
            return true;
        else
            return false;
    }
    /* Funkcija za ispitivanje unosa adrese */
    function proveraAdrese(adresa) {
        let uzorakAdresa = /^[\w-.]+@([\w-]+.)+[\w-]{2,4}\s*$/;
        if (uzorakAdresa.test(adresa))
            return true;
        else
            return false;
    }
    /* Funkcija za ispitivanje unosa grada */
    function proveraGrad(grad) {
        let uzorakGrad = /^[A-ZČĆŠĐŽ][a-zčćšđž]{1,15}(\s[A-ZČĆŠĐŽ][a-zčćšđž]{1,15})?(\s[A-ZČĆŠĐŽ][a-zčćšđž]{1,15})?\s*$/;
        if (uzorakGrad.test(grad))
            return true;
        else
            return false;
    }
    /* Funkcija za ispitivanje unosa postanskog broja */
    function proveraPostanskiBroj(broj) {
        let uzorakBroj = /^[0-9]{3,6}\s*$/;
        if (uzorakBroj.test(broj))
            return true;
        else
            return false;
    }
    /* Funkcija za ispitivanje unosa telefona */
    function proveraTelefon(broj) {
        let uzorakBroj = /^06[0-9]{6,9}\s*$/;
        if (uzorakBroj.test(broj))
            return true;
        else
            return false;
    }
    /* Funkcija za ispisivanje proizvoda prilikom placanja */
    function ispisUnutarPlacanjeProizvode() {
        let proizvodiKorpa = uzmiItemIzLocalStorage("proizvodiKorpa");
        let html = ``;
        let suma = 0;
        for (pk of proizvodiKorpa) {
            for (p of proizvodi) {
                if (pk.id == p.id) {
                    suma += pk.kolicina * p.cena.novaCena;
                    html += `
                    <div class="order-col">
                        <div>${pk.kolicina}x ${p.naziv}</div>
                        <div>${p.cena.novaCena}</div>
                    </div>
                    `
                }
            }
        }
        if (suma > 30000) $("#besplatno").html("0.0 RSD"); else $("#besplatno").html("500 RSD");
        $("#porudzbina-stavke").html(html)
        $("#ukupno").html(suma + ",00 RSD")
    }

    /* Funkcija za ispisivanje subskrajbovanja na novosti */
    function napraviSubscribe() {
        let html = ``;
        html += `
        <div class="container">
        <div class="row">
          <div class="col-md-12">
            <div class="newsletter">
              <p>Pretplatite se za <strong>POPUST KODOVE</strong></p>
              <form onsubmit="return false">
                <input
                  class="input"
                  type="email"
                  placeholder="Unesite vaš email"
                  id="emailUnos"
                />
                <button class="newsletter-btn" onClick="proveriEmailSubscribe()">
                  <i class="fa fa-envelope"></i> Pretplata
                </button>
                <p id="text-uspesno" class="text-success lead  velicina-18 " >Uspešno ste se prijavili</p>
                <p id="text-neuspesno" class="text-danger velicina-18 ">Morate uneti email u ispravnom formatu</p>
              </form>
              <ul class="newsletter-follow">
                <li>
                  <a href="https://sr-rs.facebook.com/"><i class="fa fa-facebook"></i></a>
                </li>
                <li>
                  <a href="https://sr-rs.twitter.com/"><i class="fa fa-twitter"></i></a>
                </li>
                <li>
                  <a href="https://sr-rs.instagram.com/"><i class="fa fa-instagram"></i></a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
        `;
        return html;
    }


    $("#newsletter").html(napraviSubscribe());

    $("#sortiranje").on("change", () => {
        callBackAjax("proizvodi", ispisProizvoda);
    });
    $("#categories").on("change", () => {
        callBackAjax("proizvodi", ispisProizvoda);
    });
    $("#brands").on("change", () => {
        callBackAjax("proizvodi", ispisProizvoda);
    });
    $("#price-slider").on("mousemove", () => {
        callBackAjax("proizvodi", ispisProizvoda);
    });
    ispisBrojaStavkiKorpe();

    $("#dugmeZaDodavanjeViseStavki").on("click", () => {
        dugmeDodajUKorpu(pomId)
    });
    $("#maliPrikazKorpe").on("click", () => {
        maliPrikazKorpe();
    });
    $("#dugmePosalji").on("click", () => {
        posaljiPorudzbinu();
    });
    $("#dugmeDoPlacanja").on("click", () => {
    })
    $("#pretraga").keyup(function () {
        callBackAjax("proizvodi", ispisProizvoda);
    })

    $("#text-uspesno").hide();
    $("#text-neuspesno").hide();
}
/* Funkcija za ispitivanje unosa emaila */
function proveraEmail(email) {
    let uzorakEmail = /^[\w-.]+@([\w-]+.)+[\w-]{2,4}\s*$/;
    if (uzorakEmail.test(email))
        return true;
    else
        return false;
}
/* Provera emaila za subscribe */
function proveriEmailSubscribe() {
    let email = $("#emailUnos").val();
    if (proveraEmail(email)) {
        $("#text-uspesno").show().delay(5000).fadeOut();
    }
    else {
        $("#text-neuspesno").show().delay(5000).fadeOut();
    }
}

var brStavki;

function dodajItemULocalStorage(ime, podatak) {
    localStorage.setItem(ime, JSON.stringify(podatak));
}

function uzmiItemIzLocalStorage(ime) {
    return JSON.parse(localStorage.getItem(ime))
}

function ispisBrojaStavkiKorpe() {
    let brojPodataka = uzmiItemIzLocalStorage("proizvodiKorpa");
    if (brojPodataka == null) {
        $("#korpicaBroj").addClass("invisible");
        $("#korpicaBroj").addClass("qty");
    }
    else {
        $("#korpicaBroj").removeClass("invisible");
        $("#korpicaBroj").addClass("visible");
        $("#korpicaBroj").addClass("qty");
        $("#korpicaBroj").html(brojPodataka.length);
    }
}

let proizvodiUnutarKorpe = []
function dodajProizvodKorpa(id, brojStavki) {
    if (brojStavki == undefined)
        brojStavki = 1;

    if (!localStorage.getItem("proizvodiKorpa")) {
        dodajPrviProizvod(id);
    }
    else {
        let korpa = uzmiItemIzLocalStorage("proizvodiKorpa");
        let xd = korpa.find(x => x.id == id)
        if (!xd) {
            dodajNoviProizvod(id)
        }
        else {
            uvecajKolicinu(id)
        }
    }
    ispisBrojaStavkiKorpe();

    /* Funkcija koja dodaje prvi proizvod u korpu koja je prazna */
    function dodajPrviProizvod(idProduct) {
        let zaKorpu = ({
            id: idProduct,
            kolicina: brojStavki
        })
        proizvodiUnutarKorpe.push(zaKorpu);
        dodajItemULocalStorage("proizvodiKorpa", proizvodiUnutarKorpe);
    }

    /* Funkcija za dodavanje proizvoda u korpu koji trenutno nije u korpi */
    function dodajNoviProizvod(idProduct) {
        let zaKorpu = ({
            id: idProduct,
            kolicina: brojStavki
        })
        let korpa = uzmiItemIzLocalStorage("proizvodiKorpa");
        korpa.push(zaKorpu);
        dodajItemULocalStorage("proizvodiKorpa", korpa);
    }

    /* Funkcija za povecavanje kolicine proizvoda koji je vec u korpi */
    function uvecajKolicinu(idProduct) {
        let korpa = uzmiItemIzLocalStorage("proizvodiKorpa");
        let xd = korpa.find(x => x.id == idProduct)
        korpa.filter(x => x.id != idProduct)
        xd.kolicina += parseInt(brojStavki);
        dodajItemULocalStorage("proizvodiKorpa", korpa);
    }
}

/* Funkcija za dodoavanje vise elemenata u korpu sa stranice product.html */
function dugmeDodajUKorpu(id) {
    brStavki = parseInt($("#poljeZaKolicinu").val());
    dodajProizvodKorpa(id, brStavki);
}

/* Povecaj broj kolicine */
function povecaj(id) {
    let broj = parseInt($(`#text${id}`).val());
    broj += 1;
    $(`#text${id}`).val(broj);
    let cena = parseInt($(`#cenaJednogKomada${id}`).html())
    let suma = cena * broj;
    $(`#ukupnaCena${id}`).html(suma)
}
/* Smanji broj kolicine */
function smanji(id) {
    let broj = parseInt($(`#text${id}`).val());
    if (broj != 1) {
        broj -= 1;
        $(`#text${id}`).val(broj);
        let cena = parseInt($(`#cenaJednogKomada${id}`).html())
        let suma = cena * broj;
        $(`#ukupnaCena${id}`).html(suma)
    }
}

/* Funkcija za ispis broja stavki korpe i ukupnog iznosa racuna korpe */
function izdracunajPodatkeRacuna() {
    let korpa = uzmiItemIzLocalStorage("proizvodiKorpa");
    let divovi = $(".glavniDiv .shopingcarttotal")
    let suma = 0;
    for (let i = 0; i < divovi.length; i++) {
        suma += parseInt(divovi[i].textContent)
    }
    $("#ukupanBrojProizvoda").html(korpa.length);
    $("#ukupnaCenaRacuna").html(suma);
}
/* Osvezavanje cele korpe */
function osveziKorpu() {
    let inputi = $(".counterInput");
    let ids;
    let objekti = []
    for (let i = 0; i < inputi.length; i++) {
        objekti.push({
            id: parseInt(inputi[i].id.substr(4, inputi[i].id.length)),
            kolicina: parseInt(inputi[i].value)
        })
    }
    dodajItemULocalStorage("proizvodiKorpa", objekti);
    izdracunajPodatkeRacuna();
}
/* Funkcija za izbacivanje proizvoda iz korpe */
function izbaciIzKorpe(id) {
    let obrisi = $(`#divJedanRedKorpa${id}`)
    obrisi.remove()
    osveziKorpu();
    ispisBrojaStavkiKorpe()
}

/* Ispisivanje futera */
function ispisFooter(){
    html=``;
    html+=`

    <div class="section">
      <div class="container">
        <div class="row">
          <div class="col-md-3 col-xs-6">
            <div class="footer">
              <h3 class="footer-title">O nama</h3>
              <p>
                Electro. je sa Vama od 2012 godine, sa najboljim kvalitetom i
                najnižim cenama! Sve što Vam treba.
              </p>
            </div>
          </div>

          <!-- <div class="col-md-3 col-xs-6">
            <div class="footer">
              <h3 class="footer-title">Kategorije</h3>
              <ul class="footer-links">
                <li><a href="">Frižideri</a></li>
                <li><a href="#">SideBySide frižideri</a></li>
                <li><a href="#">Veš mašine</a></li>
                <li><a href="#">Sušare</a></li>
                <li><a href="#">Ugradne ploče</a></li>
              </ul>
            </div>
          </div> -->

          <div class="clearfix visible-xs"></div>

          <div class="col-md-3 col-xs-6">
            <div class="footer">
              <h3 class="footer-title">Kontakt</h3>
              <ul class="footer-links">
                <li>
                  <a href="javascript:void(0)"
                    ><i class="fa fa-map-marker"></i>Zdravka Čelara 3</a
                  >
                </li>
                <li>
                  <a href="javascript:void(0)"
                    ><i class="fa fa-phone"></i>+381-95-51-84</a
                  >
                </li>
                <li>
                  <a href="javascript:void(0)"
                    ><i class="fa fa-envelope-o"></i
                    >milos.resanovic.7.20@ict.edu.rs</a
                  >
                </li>
              </ul>
            </div>
          </div>

          <div class="col-md-3 col-xs-6">
            <div class="footer">
              <h3 class="footer-title">Linkovi</h3>
              <ul class="footer-links">
                <li><a href="index.html">Početna</a></li>
                <li><a href="store.html">Proizvodi</a></li>
                <li><a href="cart.html">Korpa</a></li>
                <li><a href="checkout.html">Plaćanje</a></li>
                <li><a href="dokumentacijaMR.pdf" target="_blank">Dokumentacija</a></li>
                <li>
                  <a  href="https://milosresanovic.github.io/mrportfolio/" target="_blank">O autoru</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="bottom-footer" class="section">
      <div class="container">
        <div class="row">
          <div class="col-md-12 text-center">
            <ul class="footer-payments">
              <li>
                <a href="#"><i class="fa fa-cc-visa"></i></a>
              </li>
              <li>
                <a href="#"><i class="fa fa-credit-card"></i></a>
              </li>
              <li>
                <a href="#"><i class="fa fa-cc-paypal"></i></a>
              </li>
              <li>
                <a href="#"><i class="fa fa-cc-mastercard"></i></a>
              </li>
              <li>
                <a href="#"><i class="fa fa-cc-discover"></i></a>
              </li>
              <li>
                <a href="#"><i class="fa fa-cc-amex"></i></a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    `
    $("#footer").html(html);
}

