# Weryfikacja wersji 5

- Kontrola składni `app.mjs`, `parser.mjs`, `profile.mjs`, `sw.js`: wykonana.
- Testy jednostkowe: daty, zakresy, przełom roku, zdjęcie następnego dnia, wykluczenie szkiców, nieograniczona ekspozycja, sprzeczne daty i zachowawcze wykluczenia z profilu.
- Przetwarzanie rzeczywistego PDF T39 2026 przez dołączony PDF.js i parser: 37 stron, 145 propozycji. Nagłówki wykryte na każdej stronie; nie oznacza to potwierdzenia pełnej poprawności wszystkich bloków.
- Potwierdzone: cykl 23–29.09.2026; naklejka Weekend 25–27.09; rozbieżność plakatów na str. 3; dwa okresy wkładki na str. 13 do ręcznego podziału.
- Brak pełnego testu interfejsu w przeglądarce i na fizycznym iPhonie: środowisko nie udostępniło działającej przeglądarki, instalacja testowej przeglądarki nie powiodła się.

## Pierwsze sprawdzenie po publikacji

1. Zaczekaj na „Gotowa offline”.
2. Importuj PDF, użyj „Akceptuj wszystko” i sprawdź właściwy dzień.
3. Otwórz wycinek materiału i całą stronę PDF.
4. Odhacz zadanie, zamknij i otwórz aplikację: stan powinien pozostać.
5. Włącz tryb samolotowy, otwórz ponownie: sprawdź plan i podgląd.
6. Ustaw parametry sklepu, sprawdź „Poza profilem”, następnie pobierz kopię i zachowaj ją.
