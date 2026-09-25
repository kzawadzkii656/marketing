# Marketing sklepu — komplet aplikacji na telefon, v5

Aplikacja PWA: import PDF → sprawdzenie propozycji → zadania na wybrany dzień.
Działa bez konta, abonamentu, klucza API i backendu. Pliki PDF i wykonanie zadań są przechowywane lokalnie w IndexedDB przeglądarki. Kod aplikacji pobierany jest z GitHub Pages. Dokumentów marketingowych nie dodawaj do repozytorium — importujesz je dopiero wewnątrz aplikacji na swoim telefonie.

## Uruchomienie na GitHub (bez kompilowania)

1. Jeśli aktualizujesz istniejącą aplikację, pobierz kopię danych na telefonie w **Sklep → Pobierz kopię**. Aktualizacja samych plików repozytorium zwykle zachowuje dane aplikacji.
2. W repozytorium `kzawadzkii656/marketing` kliknij **Add file → Upload files** i wgraj dostarczony ZIP. Otwórz w repozytorium **Code → Codespaces → Create codespace on main**. W terminalu uruchom:

   ```sh
   unzip -o marketing-sklepu-v5-komplet.zip
   cp -a marketing-app/. .
   git add app.mjs parser.mjs profile.mjs style.css sw.js index.html manifest.webmanifest package.json README.md TESTY.md .nojekyll icons vendor tests
   git commit -m "Aktualizacja aplikacji v5"
   git push
   ```

   Jeśli plik ZIP ma inną nazwę, zmień nazwę w poleceniu `unzip`. Plik `index.html` musi leżeć w głównym katalogu repozytorium. Po udanym wdrożeniu możesz usunąć z repozytorium przesłany ZIP.
3. W repozytorium otwórz **Settings → Pages → Build and deployment**.
4. Wybierz **Deploy from a branch**, następnie gałąź **main** i **/(root)**, kliknij **Save**.
5. Po publikacji otwórz `https://kzawadzkii656.github.io/marketing/`.
6. Na iPhonie otwórz go w Safari → Udostępnij → Dodaj do ekranu początkowego.
7. Uruchom aplikację z nowej ikony i poczekaj, aż w nagłówku pojawi się **Gotowa offline**. Pierwsze przygotowanie wymaga internetu (pobierane są lokalne biblioteki PDF).
8. W **Sklep** ustaw znane parametry placówki, następnie w **Import PDF** wybierz dokument. W **Plan** przejrzyj strony, daty i warianty, a potem kliknij **Akceptuj wszystko**. Wyłączenia znajdziesz pod **Poza profilem**. W razie potrzeby edytuj zadania z poziomu planu.
9. W **Dzisiaj** możesz wybrać dowolną datę, również z wcześniejszego dokumentu.

Opcja GitHub Pages zależy od planu GitHub i widoczności repozytorium. Repozytorium publiczne może zawierać sam kod aplikacji. Ta paczka nie zawiera Twojego PDF ani danych sklepu.
Oficjalna instrukcja: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Co działa

- import tekstowych PDF do 30 MB / 150 stron;
- odczyt nagłówków materiałów i propozycje zakresów dat;
- oznaczanie wielu zakresów / wariantów do sprawdzenia;
- ręczna edycja, dodawanie i duplikowanie pozycji (np. dwóch wkładek Żabkobranie);
- zatwierdzone zadania WYSTAW, ZDEJMIJ, WYDRUKUJ oraz POZOSTAJE;
- automatyczna czynność ZDEJMIJ następnego dnia po końcu zatwierdzonej ekspozycji WYSTAW;
- oryginalne strony PDF w podglądzie, także offline;
- przełączanie między zaimportowanymi dokumentami;
- rozpoznawanie ponownego importu identycznego PDF bez utraty odhaczeń;
- profil sklepu z kategoriami lokalizacji, cenników, wyposażenia i usług; jednoznaczne wyłączenia widoczne w zakładce „Poza profilem”;
- zbiorcza akceptacja wszystkich propozycji i podgląd wycinka oryginalnego PDF przy zadaniu;
- kopia JSON wraz z dokumentami PDF oraz przywracanie;
- responsywny wygląd, ikona i tryb offline.

## Ważne ograniczenia

To **lokalny parser regułowy**, nie usługa AI. Został opracowany pod układ materiałów marketingowych podobny do T39 2026. Przycisk „Akceptuj wszystko” akceptuje też niejednoznaczne propozycje — przejrzyj cały PDF, daty i warianty. Inny układ dokumentu może dać niepełną listę lub błędne podziały. Aplikacja wskazuje strony bez rozpoznanych nagłówków, ale nie wykrywa każdego pominiętego elementu na pozostałych stronach.

- Nie ma OCR skanów ani automatycznej analizy znaczenia ilustracji.
- Profil automatycznie odkłada tylko jednoznacznie wyłączone materiały; nieznana cecha albo złożona instrukcja pozostawia zadanie widoczne. Sprawdź zakładkę „Poza profilem” po każdej zmianie profilu. Pozostałe warianty wymagają decyzji człowieka.
- Wiele okresów w jednym bloku: wybierz daty i duplikuj zadanie. Przykład: str. 13 PDF T39, wkładka Żabkobranie część 1 i część 2.
- Przy sprzecznych datach (np. str. 3 T39) trzeba je ustalić na podstawie źródła; aplikacja nie rozstrzyga automatycznie.
- Domyślne notatki są puste, aby pracownik nie dostał niezweryfikowanej instrukcji. Cały odczytany blok jest w szczegółach zadania.
- Podgląd wycina obszar oryginalnej strony między nagłówkami; granice mogą być niedokładne. Przycisk „Cała strona PDF” pozwala sprawdzić kontekst.
- Samodruki wymagają właściwych osobnych załączników; aplikacja nie tworzy plików do druku z miniatur w instrukcji.
- Nie pobiera danych z SharePoint, nie synchronizuje telefonów i nie wysyła powiadomień push.
- Harmonogram dotyczy aktualnie wybranego PDF; aplikacja nie scala ani nie porównuje automatycznie tygodni.
- Dane przeglądarki mogą zostać usunięte przez użytkownika lub system. Regularnie rób kopie (Sklep → Pobierz kopię).
- Gotowa offline oznacza zapisanie plików aplikacji w cache, nie gwarancję wieczystego przechowywania przez iOS.

## Lokalnie na komputerze

W folderze aplikacji uruchom `python3 -m http.server 8080`, potem otwórz `http://localhost:8080`.
Nie otwieraj `index.html` przez `file://` — moduły i service worker wymagają HTTP/HTTPS. Na telefonie do instalacji i offline używaj adresu HTTPS GitHub Pages; zwykły adres HTTP komputera w sieci lokalnej nie zapewnia pełnego trybu PWA.

## Rozwój i aktualizacja

- `app.mjs` — interfejs, IndexedDB, import/eksport i PDF.
- `parser.mjs` — odczyt bloków i dat, budowanie wydarzeń.
- `profile.mjs` — pola profilu oraz ostrożne reguły wykluczeń.
- `sw.js` — cache offline; po zmianie kodu zwiększ nazwę CACHE, np. v1 → v2. Dopisz nowe pliki do FILES.
- `vendor/` — dołączony PDF.js 5.6.205 i zasoby (licencja Apache-2.0 w LICENSE-pdfjs). Bez zewnętrznego CDN.
- `tests/*.test.mjs` — testy dat, harmonogramu i profilu. Uruchom `npm test` (Node.js 20+). Instalacja npm nie jest wymagana.

Po aktualizacji połącz telefon z internetem, otwórz aplikację, następnie zamknij i ponownie uruchom, by nowe pliki zostały użyte. Nie czyść danych witryny, jeśli nie masz kopii.
