Aufgabe 1: Die "Ugly Variable" Suche (Grundlagen \w und \W)
Du hast eine Legacy-Codebase geerbt, in der Variablen teilweise unsauber benannt wurden. Aufgabe: Erstelle einen Regex, der alle Variablendeklarationen findet, die mit einem Unterstrich _ beginnen (oft ein Indikator für "private" Variablen in älterem JS/TS-Code), aber keine Variablen matcht, die nur aus einem einzelnen Unterstrich _ bestehen.
Beispiel: _user, _data (Treffer), _ (Kein Treffer).


\b_([a-zA-Z0-9_]+)\b


Aufgabe 2: Log-Datei Normalisierung (Fokus \s)
Du hast ein Log-Format, das unkonsistent ist. Es sieht oft so aus: [INFO]   User:123   Action:login Die Anzahl der Leerzeichen variiert. Aufgabe: Schreibe einen Regex-Ausdruck, um den Zeitstempel (hier den Platzhalter [INFO]) von der User-ID und der Action zu trennen. Nutze \s+, um beliebige Blöcke von Leerzeichen zu erfassen und die Werte in Capture Groups zu gruppieren.


\[(INFO|WARN|ERROR)\]\s+User:(\S+)\s+Action:(\S+)


Aufgabe 3: Refactoring von Debug-Statements
Du möchtest alle console.log()-Aufrufe finden, die einen String als Argument übergeben, um diese zu entfernen. Aufgabe:

Baue einen Regex, der console.log('irgendein Text') findet.
Herausforderung: Erlaube Leerzeichen innerhalb der Klammern, z. B. console.log( 'text' ).
Tipp: Nutze \s* an den passenden Stellen.


console\.log\s*\(\s*('.*?'|".*?")\s*\)


Aufgabe 4: C#-Eigenschafts-Extraktion
In einer C#-Datei möchtest du alle Properties finden, die mit public deklariert sind. Aufgabe: Schreibe einen Regex, der Zeilen wie public int UserId { get; set; } oder public string UserName { get; set; } findet.

Extrahiere den Datentyp (z. B. int oder string) und den Namen der Property (UserId oder UserName) mittels Capture Groups.
Stelle sicher, dass die Leerzeichen zwischen public, Typ und Name korrekt mit \s+ abgehandelt werden.

public\s+(\w+)\s+(\w+)\s*\{\s*get;\s*set;\s*\}