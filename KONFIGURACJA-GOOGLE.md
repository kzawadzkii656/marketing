# Konfiguracja właściciela aplikacji (jednorazowo)

Ta wersja działa wyłącznie na GitHub Pages i telefonie, bez backendu, abonamentów i statystyk. Logowanie jest dobrowolne. Tryb lokalny działa bez konfiguracji Google. Nie wymaga Maca. README.md zawiera wyłącznie instrukcję dla użytkownika.

1. Otwórz https://console.cloud.google.com/ i utwórz projekt „Marketing sklepu”.
2. W bibliotece API włącz **Google Calendar API**.
3. W **Google Auth Platform** skonfiguruj nazwę aplikacji, e-mail kontaktowy i odbiorców (**External**, jeśli użytkownicy nie należą do jednej organizacji Workspace).
4. Na etapie testów dodaj swój adres Google w **Audience → Test users**. Każdy tester musi być dopisany. Publiczne udostępnienie wymaga ustawień publikacji zgodnych z wymaganiami Google; konsola wskaże ewentualną weryfikację.
5. W **Data Access** dodaj zakresy `openid`, `email` oraz `https://www.googleapis.com/auth/calendar.app.created`. Ten zakres pozwala zarządzać kalendarzami utworzonymi przez aplikację, bez dostępu do wszystkich prywatnych wydarzeń.
6. W **Clients → Create client** wybierz **Web application**.
7. W **Authorized JavaScript origins** wpisz dokładnie:
   `https://kzawadzkii656.github.io`
   (bez `/marketing/` i bez końcowego ukośnika). Nie konfigurujemy przekierowania — ta wersja używa okna Google.
8. Skopiuj **Client ID**, kończący się `.apps.googleusercontent.com`. Jeśli nie masz pliku `google-config.mjs`, skopiuj `google-config.example.mjs` jako `google-config.mjs`. W pliku `google-config.mjs` umieść go między apostrofami:
   `export const GOOGLE_CLIENT_ID = 'TWOJ_CLIENT_ID.apps.googleusercontent.com';`
   To publiczny identyfikator. **Client secret, tokenu GitHub ani tokenów dostępu nie wpisuj do żadnego pliku.**
9. Opublikuj pliki na GitHub Pages. Po kolejnej zmianie konfiguracji zwiększ numer cache w pierwszej linii `sw.js`, aby zainstalowane aplikacje pobrały nowy plik konfiguracji.
10. Otwórz aplikację z internetem, zamknij i uruchom ponownie. W **Sklep → Kalendarz Google** kliknij **Połącz z Google**. Jeśli Google dopiero się wczytało, kliknij ponownie.

## Próba działania

- Zaloguj się kontem testera i zaakceptuj dostęp. Pojawi się osobny kalendarz „Marketing sklepu”.
- Zatwierdź jedno zadanie testowe. Sprawdź datę i godzinę wydarzenia w Google.
- Odhacz zadanie: odpowiadający wpis powinien zniknąć. Cofnij odhaczenie: powinien wrócić tylko jeden wpis.
- Wyłącz internet, odhacz, włącz internet przy otwartej aplikacji. W razie wygaśnięcia sesji kliknij „Połącz z Google”.

Wersja przeglądarkowa przechowuje token jedynie w pamięci. Po zamknięciu aplikacji lub jego wygaśnięciu wymagane jest ponowne połączenie użytkownika. Nie obiecuje synchronizacji w tle przy zamkniętej aplikacji. Przypomnienia już zapisane obsługuje Google/telefon.

Jeżeli okno logowania nie otwiera się w aplikacji z ekranu początkowego, otwórz ten sam adres w Safari/Chrome i sprawdź ustawienia blokowania okien. Błąd `origin_mismatch` oznacza nieprawidłowe Authorized JavaScript origins. Błąd 403 może oznaczać brak testera, odmowę zgody, niewłączone API lub limit. Usunięcie całego kalendarza w Google wymaga ponownego przygotowania lokalnego połączenia; nie usuwaj go podczas normalnego używania.

## Weryfikacja techniczna

`npm test` sprawdza terminy, zmianę czasu, tworzenie, aktualizację, odhaczenie/cofnięcie, ponawianie po utracie odpowiedzi i utrzymanie zmian po błędzie. Rzeczywiste logowanie i powiadomienia na telefonie wymagają Client ID i próby na koncie użytkownika.

Dokumentacja: https://developers.google.com/identity/oauth2/web/guides/use-token-model oraz https://developers.google.com/workspace/calendar/api/auth


## Wersja 13 — dobrowolne logowanie

Pierwszy ekran oferuje „Korzystaj bez logowania” oraz „Zaloguj przez Google”. W trybie lokalnym nie wczytujemy bibliotek Google i nie wysyłamy danych do Google. Kliknięcie logowania wczytuje bibliotekę; jeśli poprosi o ponowne kliknięcie, kliknij jeszcze raz, aby otworzyć okno zgody.

Wybór trybu lub identyfikator i e-mail konta jest zapamiętany wyłącznie lokalnie przez maksymalnie 30 dni. To wygoda korzystania offline, nie bezpieczna serwerowa autoryzacja ani zabezpieczenie płatnych funkcji. Token kalendarza pozostaje tylko w pamięci; zapamiętanie konta nie przedłuża ważności tokena. Kod strony nadal jest publiczny.

Każde konto ma oddzielną bazę na telefonie. Tryb bez logowania korzysta z dotychczasowej bazy aplikacji. Po zalogowaniu w Sklep można jawnie skopiować jej materiały do konta; źródło zostaje zachowane. Jeśli istnieje połączenie kalendarza v12 tego samego konta, przenosimy także powiązania jego wydarzeń, o ile nowe konto lokalne nie utworzyło już własnego kalendarza. Przy logowaniu do innego konta aplikacja nie wysyła danych poprzedniego użytkownika.

ZIP aktualizacji zawiera `google-config.example.mjs`. Skrypt `przygotuj-konfiguracje.sh` tworzy konfigurację tylko wtedy, gdy jej brakuje, więc istniejący Client ID pozostaje zachowany. Po każdej zmianie Client ID zwiększ numer cache w `sw.js`.
