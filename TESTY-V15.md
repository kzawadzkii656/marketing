# Strona aktualizacji dla starszych wersji

- 27 testów `npm test` PASS, w tym pobranie do cache przed aktywacją, brak samoczynnej aktywacji oraz oddzielenie plików kolejnych wersji.
- Symulacja odrębnej strony: okienko gotowej aktualizacji, „Później”, ponowne otwarcie, zgoda, wysłanie żądania aktywacji i przekierowanie na aplikację PASS.
- Wcześniej sprawdzone: tryb bez konta zachowuje PDF-y i nie wykonuje zapytań Google; dane kont są rozdzielone.

Do sprawdzenia po publikacji na telefonach: otwarcie linku do strony aktualizacji, działanie w kontekście zainstalowanej ikony PWA, przejście na nową wersję i zachowanie dokumentów. Safari może trzymać dane witryny otwartej w przeglądarce oddzielnie od zainstalowanej aplikacji. Jeśli link w Safari nie zaktualizuje ikony, otwórz zainstalowaną aplikację z internetem, zamknij ją całkowicie i otwórz ponownie. Żadne skrypty nie kasują danych IndexedDB.

Nie można podmienić zdalnie starej strony głównej już zapisanej w cache. `/aktualizacja.html` jest nowym adresem: przy dostępie do internetu stara wersja pobierze go z sieci. Każda następna wersja musi zmienić `CACHE` w `sw.js`.
