// Store facts remain optional. A blank/unknown value never excludes a task.
const yn=[['','Nie wiem'],['yes','Tak'],['no','Nie']];
export const groups=[
 {name:'Lokalizacja',fields:[['region','Województwo','choice',[['','Nie wiem'],['dolnośląskie','Dolnośląskie'],['kujawsko-pomorskie','Kujawsko-pomorskie'],['lubelskie','Lubelskie'],['lubuskie','Lubuskie'],['łódzkie','Łódzkie'],['małopolskie','Małopolskie'],['mazowieckie','Mazowieckie'],['opolskie','Opolskie'],['podkarpackie','Podkarpackie'],['podlaskie','Podlaskie'],['pomorskie','Pomorskie'],['śląskie','Śląskie'],['świętokrzyskie','Świętokrzyskie'],['warmińsko-mazurskie','Warmińsko-Mazurskie'],['wielkopolskie','Wielkopolskie'],['zachodniopomorskie','Zachodniopomorskie']]]]},
 {name:'Warianty cenowe',fields:[['flex','Sklep FLEX','choice',yn],['beerPrice','Cennik piwa','choice',[['','Nie wiem'],['standard','Standardowy'],['lower','Obniżony']]],['cafePrice','Cennik Żabka Café','choice',[['','Nie wiem'],['STD','STD'],['POD','POD'],['KONTROL','KONTROL']]]]},
 {name:'Chłodnie i dostawy',fields:[['lowCooler','Niska chłodnia','choice',yn],['clgd','Dostawy CLGD','choice',yn],['matcha','Test Matcha','choice',yn],['doubleMilk','Podwójna linia mleczna','choice',yn]]},
 {name:'Lody i zamrażarki',fields:[['freezers','Liczba zamrażarek na lody','choice',[['','Nie wiem'],['0','0'],['1','1'],['2','2 lub więcej']]],['familyFreezers','Zamrażarka lodów familijnych','choice',yn],['smallBoneta','Mała boneta nowego typu','choice',yn],['blueBoneta','Niebieska boneta','choice',yn]]},
 {name:'Pieczywo',fields:[['putka','Pieczywo Putka','choice',yn],['breadIsland','Regał wyspowy Putka','choice',yn]]},
 {name:'Smoothie',fields:[['smoothie','Maszyna smoothie','choice',yn],['smoothieCups','Kubki smoothie w mroźni','choice',yn]]},
 {name:'Gastronomia',fields:[['gastronomyOven','Piec gastronomiczny','choice',yn],['grillStand','Stand grill','choice',yn],['ovenPillar','Słupek przy piecu','choice',yn]]},
 {name:'Kasy i usługi',fields:[['cashDesks','Liczba stanowisk kasowych','choice',[['','Nie wiem'],['1','1'],['2','2 lub więcej']]],['sco','Kasa samoobsługowa','choice',yn],['lotto','Usługa LOTTO','choice',yn]]},
 {name:'Ekrany i ceny',fields:[['promoScreen','Ekran promocji','choice',yn],['windowScreen','Ekran witrynowy','choice',yn],['electronicLabels','Elektroniczne cenówki','choice',yn]]},
 {name:'Ekspozytory',fields:[['b2RegisterFrame','Ramka B2 z boku boksu kasowego','choice',yn],['toyCabinet','Gablota z zabawkami','choice',yn],['epodExtension','Nadstawka na e-papierosy','choice',yn]]},
 {name:'Alkohol i papierosy',fields:[['alcoholLicense','Koncesja alkoholowa','choice',yn],['tobaccoCabinet','Szerokość szafy papierosowej','choice',[['','Nie wiem'],['60','60 cm'],['100','100 cm'],['60-13','60 cm, 13 półek']]]]},
 {name:'Dodatkowa oferta',fields:[['maczfit','Oferta Maczfit','choice',yn],['zabkaSalad','Sałatka marki Żabka','choice',yn]]},
 {name:'System kaucyjny',fields:[['depositCollection','Zbiórka butelek i puszek','choice',[['','Nie wiem'],['machine','Automat'],['manual','Ręcznie u sprzedawcy'],['none','Brak']]],['manualBinOutside','Kosz do zbiórki poza boksem','choice',yn]]}
];
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l').replace(/Ł/g,'L').toLowerCase();
function extractExclusions(source){
 const text=norm(source);
 const sentences=text.split(/(?<=[.!?])\s+|\n/);
 return sentences.filter(s=>/nie (?:obowiazuje|dotyczy)|nie obejmuje/.test(s)&&/sklep/.test(s));
}
export function exclusion(task,profile){
 if(!task.page)return '';
 const facts=profile?.facts||{},title=norm(task.title),source=norm(task.source),city=norm(profile?.city),region=norm(facts.region);
 // Never decide on a PDF block containing several alternatives unless its title is a single variant.
 if(region&&/material obowiazuje tylko w sklepach w wielkopolsce/.test(source)&&region!=='wielkopolskie')return 'Materiał tylko dla Wielkopolski';
 if(city){
  for(const sentence of extractExclusions(task.source)){
   if(/\bczesci\b|\bwybranych\b/.test(sentence))continue;
   if(/standu/.test(sentence)&&/wob/.test(source))continue;
   if((sentence.includes(city)||city.length>4&&city.endsWith('a')&&sentence.includes(city.slice(0,-1)))&&/\b(?:miastach|krakowie|warszawie|gdansku|gdyni|kielcach)\b/.test(sentence))return `Wyłączenie dla miasta: ${profile.city}`;
  }
  if(/tylko w sklepach w warszawie/.test(source)&&city!=='warszawa')return 'Materiał tylko dla Warszawy';
 }
 if(facts.flex==='no'&&/\bfle[xk]\b/.test(title))return 'Materiał dla sklepów FLEX';
 if(facts.flex==='yes'&&/sklepy standard/.test(title))return 'Materiał dla sklepów standardowych';
 if(facts.lowCooler==='no'&&/tylko (?:w )?sklepach z niska chlodnia|wylacznie w sklepach z niska chlodnia/.test(source)&&!/bez niskiej chlodni/.test(source))return 'Wymaga niskiej chłodni';
 if(facts.lowCooler==='yes'&&/tylko (?:w )?sklepach bez niskiej chlodni/.test(source))return 'Materiał dla sklepów bez niskiej chłodni';
 const rules=[
  ['matcha',/wylacznie w sklepach z testem matcha|sklepow objetych testem matcha/,/bez testu matcha/,'Wymaga testu Matcha'],
  ['doubleMilk',/wylacznie w sklepach z podwojna linia mleczna/,null,'Wymaga podwójnej linii mlecznej'],
  ['putka',/wylacznie w sklepach posiadajacych w ofercie pieczywo putka|tylko (?:w )?sklepach z pieczywem putka/,/nie posiadaja|bez pieczywa putka/,'Wymaga pieczywa Putka'],
  ['smoothie',/wylacznie w sklepach ze smoothie|tylko w sklepach.*maszyna do smoothie/,null,'Wymaga smoothie'],
  ['maczfit',/tylko w sklepach z oferta maczfit/,null,'Wymaga oferty Maczfit'],
  ['lotto',/material obowiazuje w sklepach posiadajacych usluge lotto|materialy dla sklepow z usluga lotto/,/bez uslugi lotto/,'Wymaga usługi LOTTO'],
  ['windowScreen',/tylko w sklepach posiadajacych ekran witrynowy/,null,'Wymaga ekranu witrynowego'],
  ['grillStand',/tylko w sklepach ze standem grill/,null,'Wymaga standu grill'],
  ['epodExtension',/tylko dla sklepow z nadstawka e-papierosowa/,null,'Wymaga nadstawki e-papierosowej'],
  ['electronicLabels',/tylko dla sklepow z cenowkami elektronicznymi/,null,'Wymaga cenówek elektronicznych'],
  ['promoScreen',/material nie obowiazuje w sklepach z ekranem promocje/,null,'Nie dotyczy sklepów z ekranem promocji'],
  ['alcoholLicense',/materialy dotycza tylko sklepow z koncesja alkoholowa/,null,'Wymaga koncesji alkoholowej'],
  ['b2RegisterFrame',/tylko w sklepach posiadajacych ramke b2 na boku boksu/,null,'Wymaga ramki B2 przy boksie'],
  ['zabkaSalad',/obowiazuje w sklepach posiadajacych w ofercie salatke marki zabka/,/nie obowiazuje/,'Wymaga sałatki marki Żabka']
 ];
 for(const [key,yes,other,reason] of rules){const value=facts[key];if(value==='no'&&yes.test(source)&&!(other&&other.test(source)))return reason;if(key==='promoScreen'&&value==='yes'&&yes.test(source))return reason}
 if(facts.putka==='yes'&&/wylacznie w sklepach.*nie posiadaja.*pieczywa marki putka/.test(source))return 'Materiał dla sklepów bez Putki';
 if(facts.cashDesks==='1'&&/tylko dla sklepow z dwoma i wiecej stanowiskami kasowymi|z dwoma stanowiskami kasowymi i kasa samoobslugowa/.test(source))return 'Wymaga co najmniej dwóch kas';
 return '';
}
