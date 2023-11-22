let a = [1, 2, 3, 4, 5, 6, 7];
console.log(a.indexOf(3));              //loggt die 3. stelle im array
console.log(a.indexOf(17));             //loggt die 17.stelle im array(nicht vorhanden)
a.push(8);          //fügt 8 an die letzte stelle von a hinzu
a.unshift(0);       //fügt 0 an die erste stelle von a hinzu
console.log(0, a);
let v = a.shift(); // löscht den ersten wert aus a und speichert ihn in v ab
console.log(1, a);
a.unshift(v);       //fügt v an die erste stelle von a dazu
f = a.pop();    //speichert den letzten wert vom Array a in f und löscht diesen aus a
console.log(2, f);
x = a.includes(3);  //speichert ob der Wert 3 im Array a vorhanden ist
console.log(x);
console.log(3, a);
a.splice(1, 1); //entzieht dem element an stelle 1 einen wert
console.log(4, a);
let b = a.map(a => (a*2));
console.log(5, b);
c = a.filter(ueber3);   //speichert in c alle Werte im array a wleche größer als 3 sind
function ueber3(d){
    return d > 3;
}
console.log(6, c);
let str = ["baum","boden", "haus"];
s = str.join("wiese", 2);    //erstellt einen string der allen elementen in str + "wiese" and 3. Stelle 
console.log(7, s);
str.splice(1, 1);       //entzieht dem element an stelle 1 einen wert
console.log(8, str);