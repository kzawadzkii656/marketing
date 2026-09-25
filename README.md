# Marketing sklepu — aplikacja na telefon, v1.0

Aplikacja PWA: import PDF → sprawdzenie propozycji → zadania na wybrany dzień.
Działa bez konta, abonamentu, klucza API i backendu. Pliki PDF i wykonanie zadań są przechowywane lokalnie w IndexedDB przeglądarki. Kod aplikacji pobierany jest z GitHub Pages. Dokumentów marketingowych nie dodawaj do repozytorium — importujesz je dopiero wewnątrz aplikacji na swoim telefonie.

## Uruchomienie na GitHub (bez kompilowania)

1. Rozpakuj ZIP.
2. Utwórz nowe repozytorium, np. `marketing-sklepu`.
3. Wgraj **zawartość folderu `marketing-app`**, wraz z folderami `vendor` i `icons`, do głównego katalogu repozytorium. `index.html` ma być od razu w katalogu głównym, nie w podfolderze. Wgrywasz rozpakowane pliki, a nie ZIP. Najwygodniej użyć komputera lub GitHub Desktop (folder vendor zawiera dużo plików).
4. W repozytorium otwórz **Settings → Pages → Build and deployment**.
5. Wybierz **Deploy from a branch**, następnie gałąź **main** i **/(root)**, kliknij **Save**.
6. Po publikacji otwórz wskazany adres, zazwyczaj `https://TWOJ-LOGIN.github.io/marketing-sklepu/`.
7. Na iPhonie otwórz go w Safari → Udostępnij → Dodaj do ekranu początkowego.
8. Uruchom aplikację z nowej ikony i poczekaj, aż w nagłówku pojawi się **Gotowa offline**. Pierwsze przygotowanie wymaga internetu (pobierane są lokalne biblioteki PDF).
9. W zakładce **Import PDF** wybierz dokument. W **Plan → Do sprawdzenia** otwórz każdą pozycję, sprawdź stronę źródłową, daty i wariant. Wpisz krótką instrukcję i zatwierdź. Jeśli materiał nie dotyczy sklepu, wybierz **Nie dotyczy**.
10. W **Dzisiaj** możesz wybrać dowolną datę, również z wcześniejszego dokumentu.

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
- profil sklepu jako notatka pomocnicza;
- kopia JSON wraz z dokumentami PDF oraz przywracanie;
- responsywny wygląd, ikona i tryb offline.

## Ważne granice wersji 1

To **lokalny parser regułowy**, nie usługa AI. Został opracowany pod układ materiałów marketingowych podobny do T39 2026. Każda pozycja jest szkicem do ręcznego zatwierdzenia. Inny układ dokumentu może dać niepełną listę lub błędne podziały. Przejrzyj cały PDF; aplikacja wskazuje strony bez rozpoznanych nagłówków, ale nie wykrywa każdego pominiętego elementu na pozostałych stronach.

- Nie ma OCR skanów ani automatycznej analizy znaczenia ilustracji.
- Profil sklepu nie filtruje sam materiałów. Użytkownik wybiera wariant i oznacza pozostałe jako „Nie dotyczy”.
- Wiele okresów w jednym bloku: wybierz daty i duplikuj zadanie. Przykład: str. 13 PDF T39, wkładka Żabkobranie część 1 i część 2.
- Przy sprzecznych datach (np. str. 3 T39) trzeba je ustalić na podstawie źródła; aplikacja nie rozstrzyga automatycznie.
- Domyślne notatki są puste, aby pracownik nie dostał niezweryfikowanej instrukcji. Cały odczytany blok jest w szczegółach zadania.
- Podgląd to cała oryginalna strona PDF, a nie automatycznie wycięta miniatura materiału.
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
- `sw.js` — cache offline; po zmianie kodu zwiększ nazwę CACHE, np. v1 → v2. Dopisz nowe pliki do FILES.
- `vendor/` — dołączony PDF.js 5.6.205 i zasoby (licencja Apache-2.0 w LICENSE-pdfjs). Bez zewnętrznego CDN.
- `tests/parser.test.mjs` — testy dat i harmonogramu. Uruchom `npm test` (Node.js 20+). Instalacja npm nie jest wymagana.

Po aktualizacji połącz telefon z internetem, otwórz aplikację, następnie zamknij i ponownie uruchom, by nowe pliki zostały użyte. Nie czyść danych witryny, jeśli nie masz kopii.
