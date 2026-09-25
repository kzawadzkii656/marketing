# Uruchomienie statystyk dla właściciela aplikacji

Aplikacja na GitHub Pages nie może sama zapisywać plików w GitHubie. Dołączona funkcja Netlify odbiera numer sklepu i zapisuje w **prywatnym** repozytorium jeden plik na sklep i dzień, np. `activity/2026-09-25/Z9164.json`. To jest liczba aktywnych sklepów danego dnia, a nie liczba pracowników, urządzeń czy uruchomień. Numer jest podawany przez użytkownika i nie weryfikuje tożsamości sklepu.

## Konfiguracja — jeden raz

1. Utwórz **osobne prywatne repozytorium GitHub** na statystyki, np. `kzawadzkii656/marketing-statystyki`. Repozytorium aplikacji `marketing` jest publiczne — nie zapisuj tam numerów sklepów ani tokenów.
2. Utwórz GitHub fine-grained personal access token, z dostępem wyłącznie do repozytorium statystyk i uprawnieniem **Contents: Read and write**. Nie wklejaj tokenu do plików, GitHub Codespaces, czatu ani formularza aplikacji.
3. W Netlify utwórz **nową witrynę** połączoną z repozytorium kodu `marketing`. Dołączony `netlify.toml` publikuje wyłącznie małą stronę pomocniczą `netlify/public`, a funkcję z `netlify/functions`. Aplikacja dla pracowników nadal działa pod adresem GitHub Pages.
4. W ustawieniach nowej witryny Netlify dodaj zmienne środowiskowe z dostępem dla **Functions**:
   - `GITHUB_STATS_TOKEN` — token z kroku 2;
   - `GITHUB_STATS_REPO` — np. `kzawadzkii656/marketing-statystyki`.
   Po dodaniu zmiennych uruchom nowy deploy.
5. Wejdź na Netlify i sprawdź adres nowej witryny, np. `https://twoja-nazwa.netlify.app`. W pliku `stats.mjs` ustaw publiczny adres funkcji:

   ```js
   export const STATS_ENDPOINT='https://twoja-nazwa.netlify.app/.netlify/functions/store-usage';
   ```

   Zmień też numer w pierwszej linii `sw.js` z `marketing-sklepu-v7` na `marketing-sklepu-v8`, zapisz obydwa pliki w repozytorium i wypchnij zmiany. Zamknij i otwórz aplikację na telefonie, aby pobrała nowy kod. Numer zapisany lokalnie zostanie wysłany bez ponownego pytania.

6. Po uruchomieniu aplikacji wejdź do prywatnego repozytorium statystyk i sprawdź katalog `activity/RRRR-MM-DD/`. Każdy plik oznacza sklep, z którego aplikacja połączyła się tego dnia. W zakładce **Sklep** aplikacja pokazuje, czy dzisiejsza aktywność została zapisana.

Jeżeli serwer jest niedostępny, aplikacja nadal działa. Ponawia wysyłkę po połączeniu z internetem lub przy następnym uruchomieniu. Nie cofa się automatycznie do dni, w których aplikacja nie była otwierana. Dane w prywatnym repozytorium mogą być niepełne, a numer może zostać podany błędnie lub celowo podszyty — statystyka nie jest systemem kontroli dostępu.
