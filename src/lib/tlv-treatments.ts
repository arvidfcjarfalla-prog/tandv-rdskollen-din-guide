/** TLV Referensprislista – Tandpriskollen (gäller fr.o.m. 1 jan 2026) */

export interface TlvTreatment {
  code: string;
  name: string;
  generalPrice: number | null;
  specialistPrice: number | null;
  category: string;
}

export const tlvTreatments: TlvTreatment[] = [
  // 100-serie: Undersökning, riskbedömning och hälsofrämjande åtgärder
  { code: "101", name: "Basundersökning, utförd av tandläkare", generalPrice: 1100, specialistPrice: 1100, category: "Undersökning" },
  { code: "103", name: "Kompletterande eller akut undersökning, utförd av tandläkare", generalPrice: 445, specialistPrice: 585, category: "Undersökning" },
  { code: "107", name: "Omfattande undersökning, utförd av tandläkare", generalPrice: 1275, specialistPrice: 1970, category: "Undersökning" },
  { code: "108", name: "Utredning inklusive undersökning, utförd av tandläkare", generalPrice: 1895, specialistPrice: 2960, category: "Undersökning" },
  { code: "111", name: "Basundersökning, utförd av tandhygienist", generalPrice: 985, specialistPrice: null, category: "Undersökning" },
  { code: "112", name: "Basundersökning med fullständig parodontal undersökning, utförd av tandhygienist", generalPrice: 1285, specialistPrice: null, category: "Undersökning" },
  { code: "113", name: "Akut eller annan undersökning, utförd av tandhygienist", generalPrice: 535, specialistPrice: null, category: "Undersökning" },
  { code: "114", name: "Kompletterande parodontal undersökning eller kariesutredning, utförd av tandhygienist", generalPrice: 785, specialistPrice: null, category: "Undersökning" },
  { code: "115", name: "Konsultation specialisttandvård", generalPrice: null, specialistPrice: 1060, category: "Undersökning" },
  { code: "116", name: "Konsultation specialisttandvård, omfattande", generalPrice: null, specialistPrice: 2080, category: "Undersökning" },
  { code: "121", name: "Röntgenundersökning, en bild", generalPrice: 80, specialistPrice: 120, category: "Röntgen" },
  { code: "123", name: "Röntgenundersökning, helstatus", generalPrice: 1020, specialistPrice: 1595, category: "Röntgen" },
  { code: "124", name: "Panoramaröntgenundersökning", generalPrice: 635, specialistPrice: 1130, category: "Röntgen" },
  { code: "125", name: "Röntgenundersökning, extraoral", generalPrice: 620, specialistPrice: 1125, category: "Röntgen" },
  { code: "126", name: "Röntgenundersökning, omfattande", generalPrice: 1215, specialistPrice: 2075, category: "Röntgen" },
  { code: "127", name: "Röntgenundersökning, delstatus", generalPrice: 235, specialistPrice: 410, category: "Röntgen" },
  { code: "128", name: "Röntgenundersökning, större delstatus", generalPrice: 405, specialistPrice: 625, category: "Röntgen" },
  { code: "131", name: "Tomografiundersökning, en kvadrant eller tandposition 3-3", generalPrice: 1210, specialistPrice: 1555, category: "Röntgen" },
  { code: "132", name: "Tomografiundersökning, två kvadranter eller sinus", generalPrice: 1535, specialistPrice: 2080, category: "Röntgen" },
  { code: "133", name: "Tomografiundersökning, tre kvadranter eller käkleder", generalPrice: 1920, specialistPrice: 2830, category: "Röntgen" },
  { code: "134", name: "Tomografiundersökning, fyra kvadranter", generalPrice: 2255, specialistPrice: 3340, category: "Röntgen" },
  { code: "141", name: "Analoga studiemodeller för behandlingsplanering", generalPrice: 885, specialistPrice: 885, category: "Undersökning" },
  { code: "163", name: "Biopsi", generalPrice: 1260, specialistPrice: 1565, category: "Undersökning" },
  { code: "164", name: "Laboratoriekostnader vid patologianatomisk diagnostik (PAD)", generalPrice: 895, specialistPrice: 895, category: "Undersökning" },

  // 200-serie: Sjukdomsförebyggande åtgärder
  { code: "201", name: "Rådgivande samtal eller instruktion vid risk för munhälsorelaterade sjukdomar", generalPrice: 600, specialistPrice: 600, category: "Förebyggande" },
  { code: "204", name: "Profylaxskena, per skena", generalPrice: 1135, specialistPrice: 1135, category: "Förebyggande" },
  { code: "205", name: "Fluorbehandling, kortare behandlingstid", generalPrice: 245, specialistPrice: 245, category: "Förebyggande" },
  { code: "206", name: "Fluorbehandling", generalPrice: 485, specialistPrice: 485, category: "Förebyggande" },
  { code: "207", name: "Mekaniskt avlägsnande av supragingival tandsten", generalPrice: 375, specialistPrice: 375, category: "Tandsten & rengöring" },
  { code: "208", name: "Mekaniskt avlägsnande av supragingival tandsten, omfattande", generalPrice: 735, specialistPrice: 735, category: "Tandsten & rengöring" },
  { code: "209", name: "Mekaniskt avlägsnande av supragingival tandsten, särskilt tidskrävande", generalPrice: 1145, specialistPrice: 1145, category: "Tandsten & rengöring" },
  { code: "213", name: "Kvalificerat rådgivande samtal för beteendemedicinsk prevention, 60 min eller mer", generalPrice: 1505, specialistPrice: 1505, category: "Förebyggande" },
  { code: "251", name: "Kvalificerat rådgivande samtal, distanskontakt via videolänk, 60 min", generalPrice: 1030, specialistPrice: 1030, category: "Förebyggande" },
  { code: "252", name: "Kvalificerat rådgivande samtal, distanskontakt via videolänk", generalPrice: 480, specialistPrice: 480, category: "Förebyggande" },

  // 300-serie: Sjukdomsbehandlande åtgärder
  { code: "301", name: "Sjukdoms- eller smärtbehandling, mindre omfattande", generalPrice: 450, specialistPrice: 590, category: "Behandling" },
  { code: "302", name: "Sjukdoms- eller smärtbehandling", generalPrice: 840, specialistPrice: 1120, category: "Behandling" },
  { code: "303", name: "Sjukdoms- eller smärtbehandling, omfattande", generalPrice: 1245, specialistPrice: 1665, category: "Behandling" },
  { code: "304", name: "Sjukdoms- eller smärtbehandling, särskilt tidskrävande", generalPrice: 2025, specialistPrice: 2650, category: "Behandling" },
  { code: "311", name: "Information eller instruktion vid munhälsorelaterade sjukdomar", generalPrice: 595, specialistPrice: 595, category: "Behandling" },
  { code: "321", name: "Icke-operativ behandling av kariessjukdom", generalPrice: 600, specialistPrice: 600, category: "Karies" },
  { code: "322", name: "Stegvis exkavering", generalPrice: 1350, specialistPrice: 1350, category: "Karies" },
  { code: "340", name: "Behandling av parodontal sjukdom eller periimplantit", generalPrice: 525, specialistPrice: 575, category: "Parodontit" },
  { code: "341", name: "Behandling av parodontal sjukdom eller periimplantit, omfattande", generalPrice: 920, specialistPrice: 1605, category: "Parodontit" },
  { code: "342", name: "Behandling av parodontal sjukdom eller periimplantit, tidskrävande", generalPrice: 1430, specialistPrice: 2645, category: "Parodontit" },
  { code: "343", name: "Behandling av parodontal sjukdom eller periimplantit, särskilt tidskrävande", generalPrice: 2165, specialistPrice: 4720, category: "Parodontit" },
  { code: "350", name: "Rådgivande samtal, distanskontakt via videolänk", generalPrice: 395, specialistPrice: 395, category: "Behandling" },
  { code: "351", name: "Kvalificerat rådgivande samtal vid sjukdomstillstånd, distanskontakt, 60 min", generalPrice: 1030, specialistPrice: 1030, category: "Behandling" },
  { code: "352", name: "Kvalificerat rådgivande samtal vid sjukdomstillstånd, distanskontakt", generalPrice: 480, specialistPrice: 480, category: "Behandling" },
  { code: "362", name: "Lustgassedering, per gång", generalPrice: 1025, specialistPrice: 1025, category: "Behandling" },

  // 400-serie: Kirurgiska åtgärder
  { code: "402", name: "Tanduttagning, när separation eller friläggning krävs", generalPrice: 1820, specialistPrice: 2380, category: "Kirurgi" },
  { code: "403", name: "Tanduttagning, enkel", generalPrice: 510, specialistPrice: 660, category: "Kirurgi" },
  { code: "404", name: "Kirurgiskt avlägsnande av tänder i samma kvadrant", generalPrice: 3755, specialistPrice: 4800, category: "Kirurgi" },
  { code: "405", name: "Dentoalveolär kirurgi vid komplicerade förhållanden", generalPrice: 4330, specialistPrice: 5520, category: "Kirurgi" },
  { code: "406", name: "Tanduttagning, övertalig tand", generalPrice: 1280, specialistPrice: 1670, category: "Kirurgi" },
  { code: "407", name: "Övrig kirurgi eller plastik", generalPrice: 2470, specialistPrice: 3095, category: "Kirurgi" },
  { code: "408", name: "Preprotetisk friläggning med lambå, omfattande", generalPrice: 5010, specialistPrice: 6475, category: "Kirurgi" },
  { code: "409", name: "Lambåoperation, ytterligare per kvadrant, tilläggsåtgärd", generalPrice: 1550, specialistPrice: 2100, category: "Kirurgi" },
  { code: "410", name: "Tanduttagning, ytterligare vid flera under samma dag, tilläggsåtgärd", generalPrice: 945, specialistPrice: 1290, category: "Kirurgi" },
  { code: "420", name: "Implantat, per styck", generalPrice: 3585, specialistPrice: 3585, category: "Implantat" },
  { code: "421", name: "Operation avseende käkbensförankrade implantat, ett implantat", generalPrice: 3755, specialistPrice: 4715, category: "Implantat" },
  { code: "424", name: "Kirurgisk friläggning av två eller tre implantat vid tvåstegsteknik", generalPrice: 2025, specialistPrice: 2515, category: "Implantat" },
  { code: "425", name: "Operation avseende käkbensförankrade implantat, fyra eller fler", generalPrice: 7520, specialistPrice: 9275, category: "Implantat" },
  { code: "426", name: "Kirurgisk friläggning av fyra eller fler implantat vid tvåstegsteknik", generalPrice: 2705, specialistPrice: 3405, category: "Implantat" },
  { code: "427", name: "Benaugmentation med egen vävnad i en kvadrant", generalPrice: 4720, specialistPrice: 5985, category: "Implantat" },
  { code: "428", name: "Benaugmentation med benersättningsmaterial i en kvadrant", generalPrice: 5680, specialistPrice: 6810, category: "Implantat" },
  { code: "429", name: "Kirurgiskt avlägsnande av implantat", generalPrice: 4655, specialistPrice: 5915, category: "Implantat" },
  { code: "430", name: "Benaugmentation med egen vävnad, tilläggsåtgärd", generalPrice: 1535, specialistPrice: 2085, category: "Implantat" },
  { code: "431", name: "Benaugmentation med benersättningsmaterial, tilläggsåtgärd", generalPrice: 2730, specialistPrice: 3280, category: "Implantat" },
  { code: "433", name: "Sinuslyft utan autologt ben, tilläggsåtgärd", generalPrice: 1035, specialistPrice: 1450, category: "Implantat" },
  { code: "436", name: "Avlägsnande av ett implantat", generalPrice: 805, specialistPrice: 1070, category: "Implantat" },
  { code: "446", name: "Rekonstruktiv behandling med membran (GTR), tilläggsåtgärd", generalPrice: 2035, specialistPrice: 2245, category: "Parodontit" },
  { code: "447", name: "Rekonstruktiv behandling med benersättningsmaterial, tilläggsåtgärd", generalPrice: 1375, specialistPrice: 1515, category: "Parodontit" },
  { code: "448", name: "Fritt bindvävstransplantat vid lambåoperation, tilläggsåtgärd", generalPrice: 755, specialistPrice: 1030, category: "Parodontit" },
  { code: "451", name: "Parodontalkirurgi i en kvadrant eller tandposition 3–3", generalPrice: 3910, specialistPrice: 5300, category: "Parodontit" },
  { code: "452", name: "Parodontalkirurgi i flera kvadranter, omfattande", generalPrice: 5410, specialistPrice: 7285, category: "Parodontit" },
  { code: "453", name: "Kirurgisk behandling av periimplantit i en kvadrant", generalPrice: 4115, specialistPrice: 5585, category: "Parodontit" },

  // 500-serie: Rotbehandling
  { code: "501", name: "Rensning och rotfyllning, en rotkanal", generalPrice: 4105, specialistPrice: 5135, category: "Rotbehandling" },
  { code: "502", name: "Rensning och rotfyllning, två rotkanaler", generalPrice: 4955, specialistPrice: 6225, category: "Rotbehandling" },
  { code: "503", name: "Rensning och rotfyllning, tre rotkanaler", generalPrice: 6225, specialistPrice: 7840, category: "Rotbehandling" },
  { code: "504", name: "Rensning och rotfyllning, fyra eller fler rotkanaler", generalPrice: 6790, specialistPrice: 8545, category: "Rotbehandling" },
  { code: "520", name: "Akut endodontisk behandling, annan behandlare", generalPrice: 1005, specialistPrice: 1310, category: "Rotbehandling" },
  { code: "521", name: "Akut trepanation och kavumextirpation", generalPrice: 885, specialistPrice: 1165, category: "Rotbehandling" },
  { code: "522", name: "Komplicerad rotkanallokalisation", generalPrice: 890, specialistPrice: 1170, category: "Rotbehandling" },
  { code: "523", name: "Stiftborttagning", generalPrice: 1300, specialistPrice: 1720, category: "Rotbehandling" },
  { code: "541", name: "Apikalkirurgisk behandling", generalPrice: 4410, specialistPrice: 5665, category: "Rotbehandling" },

  // 600-serie: Bettfysiologiska åtgärder
  { code: "603", name: "Reponeringsskena, per skena", generalPrice: 6695, specialistPrice: 8150, category: "Bettfysiologi" },
  { code: "604", name: "Mjukplastskena, laboratorieframställd, per skena", generalPrice: 2780, specialistPrice: 3340, category: "Bettfysiologi" },
  { code: "606", name: "Motorisk aktivering", generalPrice: 730, specialistPrice: 750, category: "Bettfysiologi" },
  { code: "607", name: "Bettslipning för ocklusal stabilisering", generalPrice: 825, specialistPrice: 1100, category: "Bettfysiologi" },
  { code: "650", name: "Motorisk aktivering, distanskontakt via videolänk", generalPrice: 480, specialistPrice: 480, category: "Bettfysiologi" },

  // 700-serie: Reparativa åtgärder (fyllningar)
  { code: "701", name: "Fyllning av en yta på framtand eller hörntand", generalPrice: 730, specialistPrice: 730, category: "Fyllning" },
  { code: "702", name: "Fyllning av två ytor på framtand eller hörntand", generalPrice: 1160, specialistPrice: 1160, category: "Fyllning" },
  { code: "703", name: "Fyllning av tre eller flera ytor på framtand eller hörntand", generalPrice: 1420, specialistPrice: 1420, category: "Fyllning" },
  { code: "704", name: "Fyllning av en yta på molar eller premolar", generalPrice: 940, specialistPrice: 940, category: "Fyllning" },
  { code: "707", name: "Krona i plastiskt material, klinikframställd", generalPrice: 2075, specialistPrice: 2075, category: "Fyllning" },
  { code: "708", name: "Stiftförankring i rotkanal vid fyllningsterapi, tilläggsåtgärd", generalPrice: 550, specialistPrice: 550, category: "Fyllning" },
  { code: "711", name: "Fyllning, utförd av tandhygienist", generalPrice: 505, specialistPrice: null, category: "Fyllning" },

  // 800-serie: Protetiska åtgärder
  { code: "800", name: "Permanent tandstödd krona, en per käke", generalPrice: 6825, specialistPrice: 8250, category: "Krona & bro" },
  { code: "801", name: "Permanent tandstödd krona, flera i samma käke", generalPrice: 5275, specialistPrice: 6395, category: "Krona & bro" },
  { code: "802", name: "Laboratorieframställd pelare med intraradikulärt stift", generalPrice: 3880, specialistPrice: 4720, category: "Krona & bro" },
  { code: "803", name: "Klinikframställd pelare med intraradikulärt stift", generalPrice: 1810, specialistPrice: 2295, category: "Krona & bro" },
  { code: "804", name: "Hängande led vid tandstödd protetik, per led", generalPrice: 2815, specialistPrice: 3100, category: "Krona & bro" },
  { code: "805", name: "Laboratorieframställt emaljretinerat brostöd, per stöd", generalPrice: 2165, specialistPrice: 2580, category: "Krona & bro" },
  { code: "806", name: "Radikulärförankring vid avtagbar protes", generalPrice: 4105, specialistPrice: 4945, category: "Protes" },
  { code: "811", name: "Cementering av lossnad protetisk konstruktion, per stöd", generalPrice: 635, specialistPrice: 845, category: "Krona & bro" },
  { code: "812", name: "Reparation av krona eller bro, utan tandteknisk insats", generalPrice: 1625, specialistPrice: 2185, category: "Krona & bro" },
  { code: "813", name: "Broreparation med tandteknisk insats", generalPrice: 5470, specialistPrice: 6865, category: "Krona & bro" },
  { code: "814", name: "Broreparation med tandteknisk insats, omfattande", generalPrice: 9575, specialistPrice: 11805, category: "Krona & bro" },
  { code: "815", name: "Sadelkrona", generalPrice: 6135, specialistPrice: 7390, category: "Krona & bro" },
  { code: "820", name: "Skena med tandersättning för temporärt bruk", generalPrice: 1550, specialistPrice: 1760, category: "Protes" },
  { code: "822", name: "Partiell protes för temporärt bruk, 1–3 tänder", generalPrice: 5000, specialistPrice: 5835, category: "Protes" },
  { code: "823", name: "Partiell protes för temporärt bruk, 4+ tänder", generalPrice: 6785, specialistPrice: 7900, category: "Protes" },
  { code: "824", name: "Partiell protes med gjutet skelett, klammerförankrad", generalPrice: 13620, specialistPrice: 15575, category: "Protes" },
  { code: "825", name: "Komplicerad partiell protes med metallskelett", generalPrice: 15250, specialistPrice: 18510, category: "Protes" },
  { code: "826", name: "Attachments, per styck", generalPrice: 185, specialistPrice: 185, category: "Protes" },
  { code: "832", name: "Lagning av protes eller tillsättning av protestand", generalPrice: 1990, specialistPrice: 2270, category: "Protes" },
  { code: "833", name: "Rebasering av protes där avtryck krävs", generalPrice: 3455, specialistPrice: 4085, category: "Protes" },
  { code: "834", name: "Lagning av protes där avtryck krävs", generalPrice: 2630, specialistPrice: 3050, category: "Protes" },
  { code: "835", name: "Rebasering och lagning av protes", generalPrice: 3975, specialistPrice: 4670, category: "Protes" },
  { code: "836", name: "Komplicerad lagning av protes", generalPrice: 4150, specialistPrice: 4845, category: "Protes" },
  { code: "837", name: "Komplicerad lagning av protes, gjutning och svetsning", generalPrice: 9195, specialistPrice: 10395, category: "Protes" },
  { code: "839", name: "Inmontering av förankringselement, per käke", generalPrice: 3595, specialistPrice: 4290, category: "Protes" },
  { code: "845", name: "Ocklusionskorrigerande bettslipning", generalPrice: 2255, specialistPrice: 2780, category: "Bettfysiologi" },
  { code: "846", name: "Skena för vertikal platsberedning eller bettstabilisering", generalPrice: 4685, specialistPrice: 5660, category: "Bettfysiologi" },
  { code: "847", name: "Klammerplåt", generalPrice: 5650, specialistPrice: 6625, category: "Protes" },
  { code: "848", name: "Betthöjning eller uppbyggnad med fyllningsmaterial, per tandposition", generalPrice: 600, specialistPrice: 810, category: "Bettfysiologi" },
  { code: "850", name: "Implantatstödd krona, en per käke", generalPrice: 10355, specialistPrice: 12035, category: "Implantat" },
  { code: "855", name: "Fästskruv/broskruv vid semipermanent krona på implantat", generalPrice: 620, specialistPrice: 620, category: "Implantat" },
  { code: "856", name: "Långtidstemporär implantatstödd krona/brostöd/hängande led", generalPrice: 2035, specialistPrice: 2310, category: "Implantat" },
  { code: "857", name: "Fästskruv vid långtidstemporär krona på implantat", generalPrice: 620, specialistPrice: 620, category: "Implantat" },
  { code: "858", name: "Distans inkl distansskruv, per styck", generalPrice: 1580, specialistPrice: 1580, category: "Implantat" },
  { code: "859", name: "Integrerad distans/kopplingskomponent vid implantatstödd krona", generalPrice: 1005, specialistPrice: 1005, category: "Implantat" },
  { code: "861", name: "Implantatstödd bro i överkäke på fyra implantat", generalPrice: 36530, specialistPrice: 40735, category: "Implantat" },
  { code: "862", name: "Implantatstödd bro i överkäke på fem implantat", generalPrice: 37845, specialistPrice: 42050, category: "Implantat" },
  { code: "863", name: "Implantatstödd bro i överkäke på sex eller fler implantat", generalPrice: 39160, specialistPrice: 43370, category: "Implantat" },
  { code: "865", name: "Implantatstödd bro i underkäke på fyra eller fler implantat", generalPrice: 35225, specialistPrice: 39010, category: "Implantat" },
  { code: "873", name: "Implantatstödd täckprotes i överkäke på fyra eller fler implantat", generalPrice: 25235, specialistPrice: 28230, category: "Implantat" },
  { code: "874", name: "Tillägg för alveolarbar på två implantat", generalPrice: 5330, specialistPrice: 5750, category: "Implantat" },
  { code: "875", name: "Tillägg för alveolarbar på tre implantat", generalPrice: 6975, specialistPrice: 7395, category: "Implantat" },
  { code: "876", name: "Tillägg för alveolarbar på fyra implantat", generalPrice: 8500, specialistPrice: 8920, category: "Implantat" },
  { code: "877", name: "Implantatstödd täckprotes exkl implantatkomponenter", generalPrice: 17105, specialistPrice: 20105, category: "Implantat" },
  { code: "878", name: "Förankringselement täckprotes, tillägg, per styck", generalPrice: 330, specialistPrice: 330, category: "Implantat" },
  { code: "881", name: "Reparation av fast implantatstödd konstruktion, mindre", generalPrice: 1220, specialistPrice: 1640, category: "Implantat" },
  { code: "883", name: "Reparation/ombyggnad av fast implantatstödd konstruktion med tandteknik", generalPrice: 2515, specialistPrice: 2865, category: "Implantat" },
  { code: "884", name: "Reparation/ombyggnad av implantatstödd bro, omfattande tandteknik", generalPrice: 9815, specialistPrice: 10720, category: "Implantat" },
  { code: "888", name: "Fästskruv/broskruv, per styck", generalPrice: 205, specialistPrice: 205, category: "Implantat" },
  { code: "889", name: "Distansskruv, per styck", generalPrice: 435, specialistPrice: 435, category: "Implantat" },
  { code: "894", name: "Återmontering av implantatstödda konstruktioner, 1–3 implantat", generalPrice: 1235, specialistPrice: 1655, category: "Implantat" },
  { code: "895", name: "Avmontering av implantatstödda konstruktioner, 4+ implantat", generalPrice: 1555, specialistPrice: 2110, category: "Implantat" },
  { code: "896", name: "Återmontering av implantatstödda konstruktioner, 4+ implantat", generalPrice: 1680, specialistPrice: 2235, category: "Implantat" },
  { code: "897", name: "Åtgärdande av tekniska implantatkomplikationer", generalPrice: 2835, specialistPrice: 4135, category: "Implantat" },

  // 900-serie: Tandreglering & utbytesåtgärder
  { code: "900", name: "Tandreglering, en käke, högst 6 månader", generalPrice: 11195, specialistPrice: 14580, category: "Tandreglering" },
  { code: "901", name: "Tandreglering, en käke, högst 1 år", generalPrice: 16800, specialistPrice: 21885, category: "Tandreglering" },
  { code: "902", name: "Tandreglering, en käke, 1–1,5 år", generalPrice: 20940, specialistPrice: 27470, category: "Tandreglering" },
  { code: "903", name: "Tandreglering, en käke, 1,5–2 år", generalPrice: 24700, specialistPrice: 32535, category: "Tandreglering" },
  { code: "904", name: "Tandreglering, en käke, mer än 2 år", generalPrice: 30645, specialistPrice: 40540, category: "Tandreglering" },
  { code: "905", name: "Tandreglering, två käkar, högst 1 år", generalPrice: 23620, specialistPrice: 30425, category: "Tandreglering" },
  { code: "906", name: "Tandreglering, två käkar, 1–1,5 år", generalPrice: 27760, specialistPrice: 36010, category: "Tandreglering" },
  { code: "907", name: "Tandreglering, två käkar, 1,5–2 år", generalPrice: 31900, specialistPrice: 41590, category: "Tandreglering" },
  { code: "908", name: "Tandreglering, två käkar, mer än 2 år", generalPrice: 38475, specialistPrice: 50435, category: "Tandreglering" },
  { code: "921", name: "Utbytesåtgärd: Krona istället för fyllning, fram-/hörntand", generalPrice: 1420, specialistPrice: 1420, category: "Utbyte" },
  { code: "922", name: "Utbytesåtgärd: Krona istället för fyllning, molar/premolar", generalPrice: 1830, specialistPrice: 1830, category: "Utbyte" },
  { code: "923", name: "Utbytesåtgärd: Fasad istället för fyllning, tandposition 1–3", generalPrice: 1420, specialistPrice: 1420, category: "Utbyte" },
  { code: "924", name: "Utbytesåtgärd: Fasad istället för fyllning, tandposition 4–5", generalPrice: 1830, specialistPrice: 1830, category: "Utbyte" },
  { code: "940", name: "Utbytesåtgärd: Ortodontisk slutning av entandslucka", generalPrice: 13365, specialistPrice: 15890, category: "Utbyte" },
  { code: "941", name: "Utbytesåtgärd: Ortodontisk slutning av entandslucka (efter krona)", generalPrice: 8090, specialistPrice: 9495, category: "Utbyte" },

  // Vanliga patientfrågade behandlingar (utan TLV-kod)
  { code: "X01", name: "Akut tandvård", generalPrice: null, specialistPrice: null, category: "Akut" },
  { code: "X02", name: "Basundersökning", generalPrice: null, specialistPrice: null, category: "Undersökning" },
  { code: "X03", name: "Hygienistbehandling", generalPrice: null, specialistPrice: null, category: "Tandsten & rengöring" },
  { code: "X04", name: "Tandblekning (klinik eller hemblekning)", generalPrice: null, specialistPrice: null, category: "Estetik" },
  { code: "X05", name: "Konsultation tandimplantat", generalPrice: null, specialistPrice: null, category: "Implantat" },
  { code: "X06", name: "Konsultation Invisalign", generalPrice: null, specialistPrice: null, category: "Tandreglering" },
  { code: "X07", name: "AirFlow – djuprengöring med pulver och vatten", generalPrice: null, specialistPrice: null, category: "Tandsten & rengöring" },
  { code: "X08", name: "Konsultation tandreglering", generalPrice: null, specialistPrice: null, category: "Tandreglering" },
  { code: "X09", name: "Konsultation estetisk tandvård", generalPrice: null, specialistPrice: null, category: "Estetik" },
  { code: "X10", name: "Onlinetandläkare – digital rådgivning", generalPrice: null, specialistPrice: null, category: "Undersökning" },
  { code: "X11", name: "Basundersökning inför Tiotandvård", generalPrice: null, specialistPrice: null, category: "Undersökning" },
  { code: "X12", name: "Skalfasader (veneers)", generalPrice: null, specialistPrice: null, category: "Estetik" },
  { code: "X13", name: "Implantatutredning", generalPrice: null, specialistPrice: null, category: "Implantat" },
  { code: "X14", name: "Bettfysiologisk undersökning", generalPrice: null, specialistPrice: null, category: "Bettfysiologi" },
  { code: "X15", name: "Bettskena (framtagning och justering)", generalPrice: null, specialistPrice: null, category: "Bettfysiologi" },
  { code: "X16", name: "Fissurförsegling", generalPrice: null, specialistPrice: null, category: "Förebyggande" },
  { code: "X17", name: "Traumaåtgärd – reparation av avbruten tand", generalPrice: null, specialistPrice: null, category: "Akut" },
  { code: "X18", name: "Kontroll av munslemhinna (screening)", generalPrice: null, specialistPrice: null, category: "Undersökning" },
  { code: "X19", name: "Byte av gamla fyllningar", generalPrice: null, specialistPrice: null, category: "Fyllning" },
  { code: "X20", name: "Akut lagning av frakturerad fyllning eller tand", generalPrice: null, specialistPrice: null, category: "Akut" },
];

/** Search treatments by keyword (code or name), returns max 8 results */
export function searchTreatments(query: string, limit = 8): TlvTreatment[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.toLowerCase().trim();
  const results: TlvTreatment[] = [];

  // Exact code match first
  for (const t of tlvTreatments) {
    if (t.code === q || t.code.startsWith(q)) {
      results.push(t);
    }
  }

  // Then name matches
  for (const t of tlvTreatments) {
    if (!results.includes(t) && t.name.toLowerCase().includes(q)) {
      results.push(t);
    }
    if (results.length >= limit) break;
  }

  // Category matches
  if (results.length < limit) {
    for (const t of tlvTreatments) {
      if (!results.includes(t) && t.category.toLowerCase().includes(q)) {
        results.push(t);
      }
      if (results.length >= limit) break;
    }
  }

  return results.slice(0, limit);
}

/** Get unique categories */
export function getCategories(): string[] {
  return [...new Set(tlvTreatments.map((t) => t.category))];
}
