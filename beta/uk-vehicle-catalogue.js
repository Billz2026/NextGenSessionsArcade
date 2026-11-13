'use strict';
/*
 * UK vehicle catalogue expansion for the 2026 beta only.
 * GENUINE UK MODEL NAMES; representative mileage, condition, histories and
 * ALL trade/retail/repair prices are FICTIONAL game-balancing assumptions.
 * Individual trim+powertrain matches are evidence-backed ONLY when listed
 * in VERIFIED below. Other new derivatives remain SOURCE-VERIFICATION PENDING,
 * and no modelled prices are licensed CAP/hpi, actual hammers or sold prices.
 * Entries are appended to existing tier lists to preserve legacy template IDs.
 * 2026 market population guidance: https://www.smmt.co.uk/vehicle-data/used-car-sales/
 */
(() => {
  const RAW=Object.freeze({
  "starter": "2018 Toyota Aygo x-play|84500|Petrol|Manual|1.0 VVT-i|2100|4250|330|3|Partial\n2017 Toyota Auris Icon Hybrid|114000|Hybrid|Automatic|1.8 VVT-i hybrid e-CVT|5300|8250|450|3|Partial\n2018 Toyota Prius Business Edition|118000|Hybrid|Automatic|1.8 VVT-i hybrid e-CVT|7600|10950|480|3|Full\n2018 Toyota C-HR Icon Hybrid|106000|Hybrid|Automatic|1.8 VVT-i hybrid e-CVT|7800|11350|470|3|Partial\n2018 Nissan Micra Acenta|96000|Petrol|Manual|0.9 IG-T 90|2650|4950|375|3|Partial\n2017 Nissan Juke N-Connecta|105000|Petrol|Manual|1.2 DIG-T 115|3350|5750|455|4|Partial\n2016 Nissan Note Acenta|113000|Petrol|Manual|1.2 80|1850|3900|360|4|Partial\n2017 Nissan X-Trail Acenta|115000|Diesel|Manual|1.6 dCi 130|5550|9150|585|4|Partial\n2018 Ford Fiesta Titanium|94000|Petrol|Manual|1.0 EcoBoost 100|3400|6000|440|3|Partial\n2018 Ford Focus ST-Line|101000|Petrol|Manual|1.0 EcoBoost 125|4350|7450|490|3|Partial\n2017 Ford Mondeo Zetec|116000|Diesel|Manual|2.0 TDCi 150|3450|6450|560|4|Partial\n2018 Vauxhall Astra SRi|101000|Petrol|Manual|1.4 Turbo 150|3800|6750|445|3|Partial\n2017 Vauxhall Insignia SRi Nav|111000|Diesel|Manual|1.6 CDTi 136|3800|7150|565|4|Partial\n2019 Vauxhall Crossland X SE|90000|Petrol|Manual|1.2 83|4850|7850|405|3|Partial\n2018 Peugeot 108 Active|90000|Petrol|Manual|1.0 VTi 68|2200|4200|335|3|Partial\n2018 Peugeot 2008 Allure|106000|Petrol|Manual|1.2 PureTech 110|3600|6500|490|4|Partial\n2018 Citroen C1 Feel|89000|Petrol|Manual|1.0 VTi 68|2050|4050|340|3|Partial\n2019 Citroen C3 Feel|92000|Petrol|Manual|1.2 PureTech 82|3500|6300|465|3|Partial\n2018 Renault Clio Dynamique Nav|105000|Petrol|Manual|0.9 TCe 90|2850|5300|385|3|Partial\n2018 Renault Kadjar Dynamique Nav|116000|Diesel|Manual|1.5 dCi 110|4950|8550|585|4|Partial\n2018 Dacia Sandero Ambiance|99000|Petrol|Manual|1.0 SCe 75|1700|3600|340|3|Partial\n2018 Dacia Duster Comfort|104000|Petrol|Manual|1.6 SCe 115|4500|7800|480|3|Partial\n2018 Suzuki Swift SZ3|94000|Petrol|Manual|1.2 Dualjet|3450|6200|355|3|Partial\n2019 Suzuki Ignis SZ3|92000|Petrol|Manual|1.2 Dualjet|3900|6850|355|3|Partial\n2019 Kia Picanto 2|88000|Petrol|Manual|1.0 MPI|3550|6250|340|3|Full\n2018 Kia Sportage 1|112000|Petrol|Manual|1.6 GDi|6250|9900|490|3|Partial\n2018 Hyundai i10 SE|100000|Petrol|Manual|1.0 MPI|2950|5450|340|3|Partial\n2018 Hyundai i30 SE|103000|Petrol|Manual|1.0 T-GDi 120|4550|7850|425|3|Partial\n2018 Skoda Fabia SE|101000|Petrol|Manual|1.0 TSI 95|3550|6350|370|3|Partial\n2018 SEAT Ibiza SE Technology|100000|Petrol|Manual|1.0 TSI 95|3750|6750|385|3|Partial\n2018 Honda Civic SE|110000|Petrol|Manual|1.0 VTEC Turbo 129|5750|9200|500|3|Partial\n2017 Fiat 500 Lounge|85000|Petrol|Manual|1.2 69|2650|4950|340|3|Partial\n2018 Mazda Mazda2 SE-L|98000|Petrol|Manual|1.5 Skyactiv-G 90|3650|6750|380|3|Partial\n\n2018 Volvo V40 D2 Momentum|111000|Diesel|Manual|2.0 D2 120|5100|8800|520|3|Partial\n2017 Mitsubishi ASX 3|106000|Petrol|Manual|1.6 MIVEC|4100|7300|435|4|Partial\n2018 Jeep Renegade Longitude|104000|Diesel|Manual|1.6 MultiJet II 120|5600|9600|550|3|Partial\n2017 Fiat Tipo Easy|108000|Petrol|Manual|1.4 95|2450|5100|410|4|Partial\n2018 Mazda Mazda6 SE-L Nav|110000|Diesel|Manual|2.2 Skyactiv-D 150|5300|8800|610|4|Partial",
  "modern": "2022 Toyota Aygo X Pure|42000|Petrol|Manual|1.0 VVT-i|7200|10600|330|2|Full\n2020 Toyota Corolla Icon Hybrid|62000|Hybrid|Automatic|1.8 VVT-i hybrid e-CVT|10500|15000|435|2|Full\n2019 Toyota RAV4 Design Hybrid|74000|Hybrid|Automatic|2.5 VVT-i hybrid AWD-i e-CVT|14800|20500|625|3|Full\n2021 Toyota C-HR Design Hybrid|61000|Hybrid|Automatic|1.8 VVT-i hybrid e-CVT|12500|17700|465|2|Full\n2020 Toyota Prius Business Edition|72000|Hybrid|Automatic|1.8 VVT-i hybrid e-CVT|10200|14400|450|2|Full\n2021 Nissan Juke N-Connecta|56000|Petrol|Manual|1.0 DIG-T 114|9400|13200|435|2|Full\n2023 Nissan Juke Tekna Hybrid|32000|Hybrid|Automatic|1.6 hybrid 143|15700|21300|475|2|Full\n2019 Nissan Qashqai N-Connecta|87000|Petrol|Manual|1.3 DIG-T 140|7600|11050|480|3|Partial\n2021 Nissan X-Trail N-Connecta|73000|Diesel|Manual|1.7 dCi 150|11900|16500|610|3|Full\n2023 Nissan Qashqai N-Connecta e-POWER|38000|Hybrid|Automatic|1.5 e-POWER|17100|23400|535|2|Full\n2020 Ford Fiesta ST-Line|65000|Petrol|Manual|1.0 EcoBoost 125|7300|10900|425|2|Full\n2019 Ford Fiesta ST-2|64000|Petrol|Manual|1.5 EcoBoost 200|9700|14100|575|3|Partial\n2021 Ford Focus Titanium|68000|Petrol|Manual|1.0 EcoBoost 125|7800|11800|420|3|Full\n2021 Ford Kuga Titanium PHEV|58000|Plug-in Hybrid|Automatic|2.5 Duratec PHEV eCVT|11700|16400|595|3|Full\n2021 Vauxhall Astra SRi|56000|Petrol|Manual|1.2 Turbo 145|7550|11050|450|2|Full\n2021 Vauxhall Mokka SRi|46000|Petrol|Automatic|1.2 Turbo 130 EAT8|11300|15950|475|2|Full\n2021 Vauxhall Grandland X Elite|58000|Petrol|Automatic|1.2 Turbo 130 EAT8|11100|15900|525|3|Full\n2020 Vauxhall Insignia SRi Nav|72000|Petrol|Manual|1.5 Turbo 165|7300|11200|525|3|Partial\n2018 Volkswagen Golf GTI Performance|69000|Petrol|Automatic|2.0 TSI 245 PS DSG|13750|18950|625|3|Full\n2019 Volkswagen Golf GTD|74000|Diesel|Automatic|2.0 TDI 184 DSG|11500|16100|620|3|Full\n2021 Volkswagen T-Cross SE|50000|Petrol|Manual|1.0 TSI 110|10000|14500|430|2|Full\n2019 Volkswagen T-Roc SE|68000|Petrol|Automatic|1.5 TSI 150 DSG|11800|16200|460|3|Full\n2020 Volkswagen Tiguan Match|81000|Diesel|Automatic|2.0 TDI 150 DSG|14100|19300|665|3|Full\n2021 Volkswagen ID.3 Life Pro Performance|51000|Electric|Automatic|58 kWh EV|10600|15300|655|2|Full\n2020 Skoda Octavia SE First Edition|72000|Petrol|Manual|1.5 TSI 150|8150|12500|460|3|Full\n2020 Skoda Karoq SE|72000|Petrol|Manual|1.5 TSI 150|12200|16950|480|3|Full\n2021 Skoda Kamiq SE L|56000|Petrol|Manual|1.0 TSI 110|9200|13500|420|2|Full\n2020 Skoda Superb SE Technology|87000|Diesel|Automatic|2.0 TDI 150 DSG|12100|17000|590|3|Full\n2020 SEAT Leon FR|73000|Petrol|Manual|1.5 TSI 150|8350|12350|455|3|Partial\n2020 SEAT Arona FR|62000|Petrol|Manual|1.0 TSI 115|9000|13050|420|2|Full\n2021 SEAT Ateca SE Technology|62000|Petrol|Manual|1.5 TSI 150|11500|16000|505|2|Full\n2021 Hyundai i10 SE Connect|48000|Petrol|Manual|1.0 MPI 67|6550|9650|350|2|Full\n2021 Hyundai i20 Premium|49000|Petrol|Manual|1.0 T-GDi 100 MHEV|8500|12500|395|2|Full\n2020 Hyundai Ioniq Premium Hybrid|69000|Hybrid|Automatic|1.6 GDi hybrid DCT|9200|13300|475|2|Full\n2021 Kia Stonic GT-Line S MHEV|55000|Petrol|Manual|1.0 T-GDi 118 MHEV|8850|12950|385|2|Full\n2021 Kia Ceed 2|52000|Petrol|Manual|1.0 T-GDi 120|9100|13200|415|2|Full\n2020 Kia Niro 2 Hybrid|61000|Hybrid|Automatic|1.6 GDi hybrid DCT|10200|14650|450|2|Full\n2021 Kia e-Niro 3|62000|Electric|Automatic|64 kWh EV|11000|16150|610|2|Full\n2022 Renault Clio Iconic|47000|Petrol|Manual|1.0 TCe 90|7650|11150|410|2|Full\n2021 Renault Captur Iconic|59000|Petrol|Manual|1.0 TCe 100|8850|13000|430|3|Full\n2020 Renault Zoe GT Line R135|48000|Electric|Automatic|52 kWh EV|6700|9950|610|3|Partial\n2021 Peugeot 2008 Allure|62000|Petrol|Manual|1.2 PureTech 130|9000|13400|515|3|Full\n2021 Peugeot 3008 Allure|74000|Diesel|Automatic|1.5 BlueHDi 130 EAT8|11500|16550|640|3|Full\n2021 Peugeot 5008 Allure|79000|Diesel|Automatic|1.5 BlueHDi 130 EAT8|13600|19000|675|3|Partial\n2021 Citroen C3 Aircross Shine|54000|Petrol|Manual|1.2 PureTech 110|7650|11500|465|2|Full\n2021 Citroen C5 Aircross Shine|69000|Diesel|Automatic|1.5 BlueHDi 130 EAT8|11550|16300|630|3|Partial\n2021 Honda Civic Sport|56000|Petrol|Manual|1.5 VTEC Turbo 182|12300|17450|485|2|Full\n2022 Honda HR-V Advance e:HEV|48000|Hybrid|Automatic|1.5 i-MMD hybrid e-CVT|15200|20750|475|2|Full\n2020 Suzuki Vitara SZ-T|57000|Petrol|Manual|1.4 Boosterjet MHEV|8100|12100|440|2|Full\n2020 Suzuki Swift Sport|55000|Petrol|Manual|1.4 Boosterjet MHEV|10200|14350|450|3|Full\n2020 Mazda Mazda3 SE-L|67000|Petrol|Manual|2.0 Skyactiv-G MHEV|9450|13900|440|2|Full\n2020 Mazda CX-5 SE-L|74000|Petrol|Manual|2.0 Skyactiv-G|12500|17950|525|3|Full\n2022 Dacia Sandero Stepway Comfort|44000|Petrol|Manual|1.0 TCe 90|8050|11800|400|2|Full\n2023 Dacia Jogger Expression|43000|Petrol|Manual|1.0 TCe 110|11100|15850|440|2|Full\n2020 MG MG3 Excite|55000|Petrol|Manual|1.5 VTi-TECH 106|4950|8350|395|3|Partial\n2021 MG ZS Exclusive|59000|Petrol|Manual|1.5 VTi-TECH 106|7750|11550|425|2|Full\n2022 MG HS Excite|53000|Petrol|Manual|1.5 T-GDI 162|10300|14650|475|2|Full\n2019 MINI Hatch Cooper|65000|Petrol|Manual|1.5 TwinPower Turbo|9950|14500|460|2|Full\n2020 MINI Clubman Cooper|55000|Petrol|Manual|1.5 TwinPower Turbo|12000|16750|475|2|Full\n2019 Lexus CT 200h|81000|Hybrid|Automatic|1.8 hybrid e-CVT|11000|15600|480|3|Full\n\n2021 Volvo V60 Momentum B4|58000|Petrol|Automatic|2.0 B4 MHEV automatic|15100|21600|575|2|Full\n2020 Volvo XC60 D4 Momentum|76000|Diesel|Automatic|2.0 D4 Geartronic|17800|24600|700|3|Full\n2020 Jaguar XE R-Dynamic S D180|67000|Diesel|Automatic|2.0 D180 automatic|13600|19200|645|3|Partial\n2020 Jaguar F-Pace Prestige D180|76000|Diesel|Automatic|2.0 D180 AWD automatic|17700|24600|780|3|Partial\n2019 Land Rover Discovery Sport SE TD4|88000|Diesel|Automatic|2.0 TD4 180 AWD automatic|13700|19000|815|3|Partial\n2021 Mitsubishi Outlander PHEV Dynamic|69000|Plug-in Hybrid|Automatic|2.4 PHEV AWD|12100|17300|700|3|Full\n2020 Jeep Compass Limited|63000|Petrol|Manual|1.4 MultiAir 140|10100|14600|525|3|Partial\n2020 Subaru Forester XE e-BOXER|57000|Hybrid|Automatic|2.0 e-BOXER Lineartronic|15900|22400|595|3|Full\n2020 Subaru XV SE Premium e-BOXER|68000|Hybrid|Automatic|2.0 e-BOXER Lineartronic|13200|18700|565|3|Full",
  "premium": "2018 Volkswagen Golf R|59000|Petrol|Automatic|2.0 TSI 310 PS 4MOTION DSG|17800|24300|700|2|Full\n2022 Volkswagen Golf GTI|48000|Petrol|Automatic|2.0 TSI 245 PS DSG|19400|26700|650|2|Full\n2022 Volkswagen ID.4 Life Pro Performance|49000|Electric|Automatic|77 kWh EV|15800|22250|685|2|Full\n2019 Audi A3 Sportback 35 TFSI S line|61000|Petrol|Automatic|1.5 TFSI 150 S tronic|11800|17150|480|2|Full\n2022 Audi S3 Sportback|45000|Petrol|Automatic|2.0 TFSI quattro S tronic|23500|31500|740|2|Full\n2020 Audi Q3 35 TFSI S line|62000|Petrol|Automatic|1.5 TFSI 150 S tronic|17600|24400|585|2|Full\n2020 Audi Q2 30 TFSI Sport|49000|Petrol|Manual|1.0 TFSI 116|11800|16800|480|2|Full\n2020 Audi A4 35 TDI S line|67000|Diesel|Automatic|2.0 TDI S tronic|16500|23000|620|3|Full\n2021 BMW 118i M Sport|50000|Petrol|Automatic|1.5 TwinPower Turbo DCT|15100|21200|525|2|Full\n2019 BMW M140i Shadow Edition|61000|Petrol|Automatic|3.0 turbo straight-six ZF8|20100|28100|795|2|Full\n2022 BMW M135i xDrive|43000|Petrol|Automatic|2.0 turbo xDrive Steptronic|23400|30800|745|2|Full\n2020 BMW X1 sDrive18i Sport|64000|Petrol|Manual|1.5 TwinPower Turbo|13200|18500|550|3|Full\n2019 BMW 520d M Sport|76000|Diesel|Automatic|2.0 diesel Steptronic|17700|24750|700|3|Full\n2022 BMW i4 eDrive40|49000|Electric|Automatic|83.9 kWh RWD EV|23500|32500|795|2|Full\n2021 Mercedes-AMG A35 4MATIC|42000|Petrol|Automatic|2.0 turbo 306 PS DCT|25000|33600|800|2|Full\n2019 Mercedes-Benz C220d AMG Line|67000|Diesel|Automatic|2.0 diesel 9G-Tronic|17000|23750|645|2|Full\n2021 Mercedes-Benz GLA200 AMG Line|49000|Petrol|Automatic|1.3 turbo DCT|18400|25550|570|2|Full\n2020 Mercedes-Benz GLC220d AMG Line|75000|Diesel|Automatic|2.0 diesel 4MATIC 9G-Tronic|22200|30700|725|3|Full\n2019 Hyundai i30 N Performance|60000|Petrol|Manual|2.0 T-GDi 275 PS|16100|22400|720|2|Full\n2022 Kia EV6 GT-Line RWD|42000|Electric|Automatic|77.4 kWh RWD EV|19600|28000|755|2|Full\n2021 Skoda Octavia vRS|49000|Petrol|Automatic|2.0 TSI 245 DSG|16700|23750|610|2|Full\n2022 CUPRA Formentor VZ2 310|41000|Petrol|Automatic|2.0 TSI 310 4Drive DSG|20900|28700|690|2|Full\n2021 Lexus UX 250h F Sport|49000|Hybrid|Automatic|2.0 hybrid e-CVT|17700|25000|535|2|Full\n\n2022 Polestar 2 Long Range Single Motor|47000|Electric|Automatic|78 kWh EV|14700|21600|725|2|Full\n2023 BYD Atto 3 Design|36000|Electric|Automatic|60.48 kWh EV|14300|20400|670|2|Full\n2022 Tesla Model 3 Long Range AWD|57000|Electric|Automatic|Dual-motor AWD EV|17800|25900|745|2|Full\n2021 Range Rover Evoque D200 S|67000|Diesel|Automatic|2.0 D200 MHEV AWD automatic|18300|25800|760|3|Partial\n2021 DS 7 Crossback E-Tense 225|55000|Plug-in Hybrid|Automatic|1.6 petrol PHEV EAT8|14700|20700|680|3|Full",
  "luxury": "2022 Audi RS 3 Sportback|35000|Petrol|Automatic|2.5 TFSI 400 PS quattro S tronic|32800|43900|950|2|Full\n2021 Audi RS Q3 Sportback|39000|Petrol|Automatic|2.5 TFSI 400 quattro S tronic|32400|43500|930|2|Full\n2021 BMW M3 Competition|37000|Petrol|Automatic|3.0 twin-turbo straight-six ZF8|49300|64000|1125|2|Full\n2019 Porsche 718 Cayman 2.0 PDK|39000|Petrol|Automatic|2.0 turbo PDK|28700|38400|900|2|Full\n2022 Range Rover Evoque D200 R-Dynamic S|42000|Diesel|Automatic|2.0 D200 MHEV 4WD automatic|24200|33400|895|3|Full\n2021 Lexus RX 450h F Sport|56000|Hybrid|Automatic|3.5 V6 hybrid e-CVT|30600|40800|820|2|Full\n2021 Mercedes-AMG A45 S 4MATIC+|43000|Petrol|Automatic|2.0 turbo 421 PS DCT|33500|44800|945|2|Full\n2022 Volkswagen Touareg R-Line V6 TDI|50000|Diesel|Automatic|3.0 V6 TDI 4MOTION Tiptronic|32900|43700|965|2|Full\n\n2021 Jaguar F-Type P300 R-Dynamic|40000|Petrol|Automatic|2.0 turbo 300 automatic|31300|41000|930|2|Full\n2021 Land Rover Discovery D250 S|48000|Diesel|Automatic|3.0 D250 MHEV AWD automatic|32700|43800|1000|3|Full"
});
  const parse=(tier,source)=>Object.freeze(source.trim().split('\n').filter(Boolean).map((line,index)=>{
    const bits=line.trim().split('|');
    if(bits.length!==10)throw new Error('Invalid UK catalogue '+tier+' row '+index);
    const [title,mileage,fuel,gearbox,engine,guide,retail,prep,grade,history]=bits;
    const v=[Number(mileage),Number(guide),Number(retail),Number(prep),Number(grade)];
    if(!v.every(Number.isSafeInteger)||v.some(x=>x<=0)||guide>=Number(retail)||
      !['Petrol','Diesel','Hybrid','Plug-in Hybrid','Electric'].includes(fuel)||
      !['Manual','Automatic'].includes(gearbox)||!['Full','Partial'].includes(history))
      throw new Error('Invalid UK catalogue vehicle '+title);
    return Object.freeze([title,...v.slice(0,1),fuel,gearbox,engine,...v.slice(1),history]);
  }));
  const CATALOGUE=Object.freeze(Object.fromEntries(
    Object.entries(RAW).map(([tier,source])=>[tier,parse(tier,source)])));
  const VERIFIED=Object.freeze([
  [
    "2018 Volkswagen Golf GTI Performance",
    "Petrol",
    "Automatic",
    "2.0 TSI 245 PS DSG",
    "manufacturer",
    "https://www.volkswagen.co.uk/idhub/content/dam/onehub_pkw/importers/gb/downloads/brochures/used-cars/golf-vii-pa/vw_golf_2017-present_jul_2017.pdf",
    "UK Mk7.5 Golf brochure lists GTI Performance 2.0 TSI 245 PS and DSG"
  ],
  [
    "2018 Volkswagen Golf R",
    "Petrol",
    "Automatic",
    "2.0 TSI 310 PS 4MOTION DSG",
    "manufacturer",
    "https://www.volkswagen.co.uk/idhub/content/dam/onehub_pkw/importers/gb/downloads/brochures/used-cars/golf-vii-pa/vw_golf_2017-present_jul_2017.pdf",
    "UK Mk7.5 Golf brochure lists R 2.0 TSI 310 PS 4MOTION and DSG"
  ],
  [
    "2019 Toyota RAV4 Design Hybrid",
    "Hybrid",
    "Automatic",
    "2.5 VVT-i hybrid AWD-i e-CVT",
    "manufacturer",
    "https://media.toyota.co.uk/specifications-and-prices-announced-for-the-all-new-all-hybrid-toyota-rav4/",
    "Toyota UK launch specifications identify Design 2.5 Hybrid CVT AWD-i"
  ],
  [
    "2021 Nissan Juke N-Connecta",
    "Petrol",
    "Manual",
    "1.0 DIG-T 114",
    "manufacturer",
    "https://uk.nissannews.com/en-GB/releases/new-more-efficient-engine-for-juke-as-nissan-launches-happy-holiday-playlist-to-beat-the-winter-blues",
    "Nissan UK confirms the 2021 DIG-T 114 Juke powertrain and existing trim range"
  ],
  [
    "2022 Audi RS 3 Sportback",
    "Petrol",
    "Automatic",
    "2.5 TFSI 400 PS quattro S tronic",
    "manufacturer",
    "https://www.audi-mediacenter.com/en/press-releases/a-feast-for-the-senses-upgrade-for-the-audi-rs-3-16140/download",
    "Audi confirms 2021-on RS 3 2.5 five-cylinder 400 PS; UK RS 3 Sportback sold in 2022"
  ],
  [
    "2019 Hyundai i30 N Performance",
    "Petrol",
    "Manual",
    "2.0 T-GDi 275 PS",
    "manufacturer",
    "https://www.hyundai.news/uk/articles/press-releases/hyundai-motor-uk-announces-i30-n-pricing-and-specifications.html",
    "Hyundai UK confirms 2.0 T-GDi 275 PS i30 N Performance manual"
  ],
  [
    "2018 Toyota Aygo x-play",
    "Petrol",
    "Manual",
    "1.0 VVT-i",
    "manufacturer",
    "https://media.toyota.co.uk/fresh-looks-and-more-fun-from-the-new-toyota-aygo/",
    "Toyota UK 2018 Aygo facelift confirms x-play grade and 1.0 petrol manual; model-year grade, not invented trim."
  ],
  [
    "2017 Toyota Auris Icon Hybrid",
    "Hybrid",
    "Automatic",
    "1.8 VVT-i hybrid e-CVT",
    "corroborated",
    "https://media.toyota.co.uk/new-year-gains-toyotas-2017-verso-auris/",
    "Toyota UK 2017 Auris Icon grade; Toyota 2018 Auris line-up separately confirms 1.8 hybrid. Exact 2017 powertrain/grade combination corroborated, not on one 2017 chart."
  ],
  [
    "2018 Toyota Prius Business Edition",
    "Hybrid",
    "Automatic",
    "1.8 VVT-i hybrid e-CVT",
    "manufacturer",
    "https://media.toyota.co.uk/toyotas-prius-trio-add-new-features-new-performance-data-2018/",
    "Toyota UK 2018 Prius Business Edition explicitly listed; 1.8 hybrid automatic is the fourth-generation UK Prius drivetrain."
  ],
  [
    "2018 Toyota C-HR Icon Hybrid",
    "Hybrid",
    "Automatic",
    "1.8 VVT-i hybrid e-CVT",
    "manufacturer",
    "https://media.toyota.co.uk/toyota-c-hr-uk-headline-pricing-and-equipment-grades-announced-for-new-crossover-range/",
    "Toyota UK C-HR Icon offered with 1.8 petrol-electric hybrid e-CVT; UK launch 2017, continued 2018."
  ],
  [
    "2022 Toyota Aygo X Pure",
    "Petrol",
    "Manual",
    "1.0 VVT-i",
    "manufacturer",
    "https://media.toyota.co.uk/ready-steady-aygo-x/",
    "Toyota UK 2022 Aygo X Pure model explicitly sold with 71bhp 1.0 petrol and five-speed manual."
  ],
  [
    "2020 Toyota Corolla Icon Hybrid",
    "Hybrid",
    "Automatic",
    "1.8 VVT-i hybrid e-CVT",
    "manufacturer",
    "https://media.toyota.co.uk/wp-content/uploads/sites/5/2021/03/1614602906210301MCorolla.pdf",
    "Toyota UK 2020 Corolla published grade/powertrain table: Icon 1.8 VVT-i hybrid 122hp automatic hatchback."
  ],
  [
    "2021 Toyota C-HR Design Hybrid",
    "Hybrid",
    "Automatic",
    "1.8 VVT-i hybrid e-CVT",
    "manufacturer",
    "https://media.toyota.co.uk/wp-content/uploads/sites/5/pdf/Range-Price-List-edited.pdf",
    "Toyota UK price list effective 1 April 2021 explicitly lists C-HR Design 1.8 VVT-i hybrid 122hp automatic; separate from 2.0 Design."
  ],
  [
    "2020 Toyota Prius Business Edition",
    "Hybrid",
    "Automatic",
    "1.8 VVT-i hybrid e-CVT",
    "manufacturer",
    "https://media.toyota.co.uk/wp-content/uploads/sites/5/pdf/210701-Prius-1.pdf",
    "Toyota UK 2020 Prius price list explicitly identifies Business Edition 1.8 VVT-i hybrid automatic 122hp."
  ],
  [
    "2018 Nissan Micra Acenta",
    "Petrol",
    "Manual",
    "0.9 IG-T 90",
    "manufacturer",
    "https://uk.nissannews.com/en-GB/releases/nissan-updates-and-extends-switch-scheme-with-increased-2-000-support-and-attractive-new-year-pcp-offers-on-micra-qashqai-x-trail",
    "Nissan UK January 2018 confirms IG-T 90 on Acenta-based limited edition. Standard Acenta equipment differs from Limited Edition; engine and trim family supported."
  ],
  [
    "2016 Nissan Note Acenta",
    "Petrol",
    "Manual",
    "1.2 80",
    "corroborated",
    "https://uk.nissannews.com/en-GB/releases/deliveries-begin-of-new-nissan-note",
    "Nissan UK launch specifies Acenta and 1.2 80PS petrol manual; 2016 model-year continuation corroborated by used UK examples, not a dated 2016 factory price guide."
  ],
  [
    "2017 Nissan X-Trail Acenta",
    "Diesel",
    "Manual",
    "1.6 dCi 130",
    "corroborated",
    "https://www.nissan-cdn.net/content/dam/Nissan/gb/vehicles/Motability/Motability-Docs/MotobilityPL.pdf",
    "Nissan UK dated list includes 2017 X-Trail Acenta SVP 1.6 dCi 130 manual; check specific standard Acenta/SVP equipment on registration."
  ],
  [
    "2019 Nissan Qashqai N-Connecta",
    "Petrol",
    "Manual",
    "1.3 DIG-T 140",
    "manufacturer",
    "https://uk.nissannews.com/en-GB/releases/a-new-era-of-control-nissan-introduces-propilot-technology-to-the-full-qashqai-range",
    "Nissan UK 2019 table explicitly includes Qashqai N-Connecta 1.3 DIG-T 140 six-speed manual."
  ],
  [
    "2023 Nissan Juke Tekna Hybrid",
    "Hybrid",
    "Automatic",
    "1.6 hybrid 143",
    "manufacturer",
    "https://uk.nissannews.com/en-GB/releases/nissan-juke-new-advanced-powertrain-offers-efficiency-and-responsive-performance",
    "Nissan UK 2022-on Juke Tekna 143PS 1.6 petrol full hybrid automatic; available into 2023."
  ],
  [
    "2023 Nissan Qashqai N-Connecta e-POWER",
    "Hybrid",
    "Automatic",
    "1.5 e-POWER",
    "manufacturer",
    "https://uk.nissannews.com/en-GB/releases/release-6560de8c993be941e3d683276a170d6c-qashqai-e-power-nissans-unique-electrified-powertrain-in-segment-defining-crossover",
    "Nissan UK e-POWER 190 N-Connecta automatic offered 2022 onward; 1.5 petrol generator drives electric motor, not a plug-in EV."
  ],
  [
    "2019 Volkswagen Golf GTD",
    "Diesel",
    "Automatic",
    "2.0 TDI 184 DSG",
    "manufacturer",
    "https://www.volkswagen.co.uk/idhub/content/dam/onehub_pkw/importers/gb/downloads/brochures/used-cars/golf-vii-pa/vw_golf_2017-present_jul_2017.pdf",
    "UK Golf Mk7.5 brochure documents GTD 2.0 TDI 184PS and seven-speed DSG; continuation to 2019."
  ],
  [
    "2021 Volkswagen T-Cross SE",
    "Petrol",
    "Manual",
    "1.0 TSI 110",
    "corroborated",
    "https://www.honestjohn.co.uk/used-prices/Volkswagen/T-Cross/SUV/2021/?q=21+reg+Manual+SE+TSI",
    "2021 UK T-Cross 1.0 TSI 110 SE manual examples. Secondary used-car records; manufacturer specification chart pending."
  ],
  [
    "2019 Volkswagen T-Roc SE",
    "Petrol",
    "Automatic",
    "1.5 TSI 150 DSG",
    "corroborated",
    "https://www.honestjohn.co.uk/used-prices/Volkswagen/T-Roc/2019/?q=SE",
    "2019 UK T-Roc SE 1.5 TSI EVO 150 seven-speed DSG examples; trim and gearbox corroborated by UK used stock."
  ],
  [
    "2020 Volkswagen Tiguan Match",
    "Diesel",
    "Automatic",
    "2.0 TDI 150 DSG",
    "corroborated",
    "https://www.honestjohn.co.uk/used-prices/Volkswagen/Tiguan/2020/?q=2.0+Diesel+Match",
    "2020 UK Tiguan Match 2.0 TDI 150 DSG listed; two-wheel and 4MOTION exist, drive configuration still unspecified in game."
  ],
  [
    "2021 Volkswagen ID.3 Life Pro Performance",
    "Electric",
    "Automatic",
    "58 kWh EV",
    "manufacturer",
    "https://www.volkswagen.co.uk/idhub/content/dam/onehub_pkw/importers/gb/downloads/brochures/used-cars/id-3/id-3-brochure-pricelist-dec-20.pdf",
    "VW UK Dec 2020 spec table explicitly lists ID.3 Life Pro Performance 58kWh, 204PS, single-speed auto."
  ],
  [
    "2022 Volkswagen Golf GTI",
    "Petrol",
    "Automatic",
    "2.0 TSI 245 PS DSG",
    "manufacturer",
    "https://www.volkswagen.co.uk/idhub/content/dam/onehub_pkw/importers/gb/downloads/brochures/used-cars/golf-8-%282020---present%29/golf-8-brochure-pricelist-p11d.pdf",
    "UK 2021-on Golf 8 GTI 2.0 TSI 245PS seven-speed DSG, appropriate to 2022 model year. Not the 300PS Clubsport or Golf R."
  ],
  [
    "2022 Volkswagen ID.4 Life Pro Performance",
    "Electric",
    "Automatic",
    "77 kWh EV",
    "manufacturer",
    "https://www.volkswagen.co.uk/idhub/content/dam/onehub_pkw/importers/gb/downloads/brochures/used-cars/id-4/id4-brochure-pricelist-april-21.pdf",
    "VW UK April 2021 model introduction confirms ID.4 Life Pro Performance 77kWh, 204PS single-speed auto, continued 2022."
  ],
  [
    "2019 Audi A3 Sportback 35 TFSI S line",
    "Petrol",
    "Automatic",
    "1.5 TFSI 150 S tronic",
    "corroborated",
    "https://www.lookers.co.uk/audi/used-car/audi/a3/35-tfsi-s-line-5dr-s-tronic/id/321748",
    "2019 UK Audi franchise-listed 5-door Sportback S line 35 TFSI 1.5 petrol S tronic. A3 S line is not Audi S3."
  ],
  [
    "2022 Audi S3 Sportback",
    "Petrol",
    "Automatic",
    "2.0 TFSI quattro S tronic",
    "corroborated",
    "https://www.autotrader.co.uk/cars/used/audi/hatchback/s3/2022",
    "2022 UK stock includes S3 Sportback 2.0 TFSI quattro S tronic; exact year/gearbox corroborated by UK listings."
  ],
  [
    "2020 Audi Q2 30 TFSI Sport",
    "Petrol",
    "Manual",
    "1.0 TFSI 116",
    "corroborated",
    "https://www.harwoods.co.uk/car/audi/q2/02iQ4000007iLxZIAU",
    "Audi UK franchised listing records 2020 Q2 30 TFSI Sport 1.0 petrol manual 116PS, exact trim and gearbox."
  ],
  [
    "2021 Audi RS Q3 Sportback",
    "Petrol",
    "Automatic",
    "2.5 TFSI 400 quattro S tronic",
    "corroborated",
    "https://www.audi.co.uk/en/models/q3/rs-q3-sportback/",
    "Audi UK confirms RS Q3 Sportback 2.5 five-cylinder 400PS; independent 2021 UK used listings confirm quattro S tronic model-year."
  ],
  [
    "2018 Ford Fiesta Titanium",
    "Petrol",
    "Manual",
    "1.0 EcoBoost 100",
    "manufacturer",
    "https://www.ford.co.uk/content/dam/guxeu/uk/documents/brochures/personal-finance/BRO-All-New_Fiesta_Promotions.pdf",
    "Ford UK original Mk8 Fiesta offer states Titanium 1.0 EcoBoost 100PS; manual shown in the ordinary Fiesta 100PS UK drivetrain; exact 2018 registration not a VIN check."
  ],
  [
    "2018 Ford Focus ST-Line",
    "Petrol",
    "Manual",
    "1.0 EcoBoost 125",
    "corroborated",
    "https://www.lookers.co.uk/ford/used-car/focus/1-0-ecoboost-125-st-line-5dr/id/742153",
    "Lookers Ford 2018 registered BG68OBF matches Mk4 Focus ST-Line, 1.0 EcoBoost 125, manual; distinguishes ST-Line from actual Focus ST."
  ],
  [
    "2019 Ford Fiesta ST-2",
    "Petrol",
    "Manual",
    "1.5 EcoBoost 200",
    "corroborated",
    "https://www.graingermotorgroup.com/mazda/used-cars/fiesta/st-2/15t-ecoboost-st-2-hatchback-3dr-petrol-manual-euro-6-ss-200-ps/14468",
    "2019 registered UK Fiesta ST-2 1.5 EcoBoost 200PS six-speed manual dealer example; consistent with Ford 2018 ST factory technical specification, ST-2 is not ST-Line."
  ],
  [
    "2020 Ford Fiesta ST-Line",
    "Petrol",
    "Manual",
    "1.0 EcoBoost 125",
    "corroborated",
    "https://www.honestjohn.co.uk/used-prices/Ford/Fiesta/2020/?q=1.0+Manual+Petrol+ST-Line",
    "UK 2020 Fiesta ST-Line 1.0 EcoBoost 125 manual advertised examples; ST-Line cosmetic/sports suspension trim, not ST 200PS."
  ],
  [
    "2021 Ford Kuga Titanium PHEV",
    "Plug-in Hybrid",
    "Automatic",
    "2.5 Duratec PHEV eCVT",
    "corroborated",
    "https://www.honestjohn.co.uk/used-prices/Ford/Kuga/2021/?q=2.5+PHEV+Plug-in+Hybrid+Titanium",
    "2021 UK Titanium 2.5 PHEV CVT derivative corroborated; note Ford later offered Titanium Edition, so exact build-date/trim distinction remains an inspection item."
  ],
  [
    "2018 Vauxhall Astra SRi",
    "Petrol",
    "Manual",
    "1.4 Turbo 150",
    "manufacturer",
    "https://www.vauxhall.co.uk/content/dam/vauxhall/Home/PDFs/Cars/astra/price_guides/C1105-10922016_ASTRA_Spec_PG_16_February_2018-1518782860.pdf",
    "Vauxhall UK February 2018 model-year 2018.5 table confirms Astra SRi 1.4 Turbo 150PS MANUAL; not the 1.4 150PS automatic."
  ],
  [
    "2019 Vauxhall Crossland X SE",
    "Petrol",
    "Manual",
    "1.2 83",
    "manufacturer",
    "https://www.vauxhall.co.uk/content/dam/vauxhall/Home/e-brochures/range/cars/19my/brochures/1_April_2019.pdf",
    "Vauxhall UK April 2019 range guide specifically lists Crossland X SE 1.2 83PS; ordinary naturally aspirated five-speed manual, not 110PS Turbo."
  ],
  [
    "2021 Vauxhall Astra SRi",
    "Petrol",
    "Manual",
    "1.2 Turbo 145",
    "corroborated",
    "https://www.exchangeandmart.co.uk/used-cars-for-sale/vauxhall/astra/year-2021",
    "2021 Astra SRi 1.2 Turbo 145PS manual corroborated by UK registered examples; Vauxhall 2019 launch table separately confirms the 145PS 1.2 manual in SRi; do not confuse with 2018 1.4 150PS."
  ],
  [
    "2021 Vauxhall Mokka SRi",
    "Petrol",
    "Automatic",
    "1.2 Turbo 130 EAT8",
    "manufacturer",
    "https://www.media.stellantis.com/uk-en/vauxhall/press/vauxhall-mokka-press-kit",
    "Official 2021 UK Mokka table directly lists SRi 1.2 Turbo 130PS AT8; distinct from 100PS manual and Mokka-e EV."
  ],
  [
    "2019 Kia Picanto 2",
    "Petrol",
    "Manual",
    "1.0 MPI",
    "corroborated",
    "https://used-uk.kia.com/used-car-details/used-kia-picanto-10-mpi-2-silver-frost-manual-petrol/id-6038/",
    "Kia UK dealer network advert for registered 2019 Picanto grade 2 1.0 MPi petrol manual; exact PS not encoded in game's engine field."
  ],
  [
    "2020 Kia Niro 2 Hybrid",
    "Hybrid",
    "Automatic",
    "1.6 GDi hybrid DCT",
    "corroborated",
    "https://used-uk.kia.com/used-car-details/used-kia-niro-16-gdi-2-suv-graphite-automatic-hybrid/id-202609035694673/",
    "Kia UK Assured 2020 Niro 2 1.6 GDi self-charging hybrid auto; 1.6 hybrid uses DCT, not e-CVT and not the separately marketed Niro PHEV."
  ],
  [
    "2021 Kia Ceed 2",
    "Petrol",
    "Manual",
    "1.0 T-GDi 120",
    "corroborated",
    "https://used-uk.kia.com/used-car-details/used-kia-ceed-10-t-gdi-isg-2-hatchback-copper-stone-manual-petrol/id-4873/",
    "Kia UK Assured 2021 Ceed 1.0 T-GDi ISG 2 petrol manual. Engine's 120PS is rounded manufacturer designation; advert title alone does not independently state PS."
  ],
  [
    "2021 Kia e-Niro 3",
    "Electric",
    "Automatic",
    "64 kWh EV",
    "corroborated",
    "https://used-uk.kia.com/used-car-details/used-kia-e-niro-64-kwh-3-suv-interstellar-grey-automatic-electric/id-5644/",
    "Kia UK Assured 2021 e-Niro 3 electric automatic and marketed 64 kWh battery; advertisements inconsistently show nominal versus gross kWh, game refers to nominal 64."
  ],
  [
    "2018 Hyundai i10 SE",
    "Petrol",
    "Manual",
    "1.0 MPI",
    "manufacturer",
    "https://www.hyundai.news/newsroom/dam/uk/press-kits/20181001_i10/hyundai_i10_press_kit_november2018_technical_data.pdf",
    "Hyundai Motor UK November 2018 i10 spec table lists SE 1.0 petrol 67PS five-speed manual (game 1.0 MPI); generation predates 2020 all-new i10."
  ],
  [
    "2018 Hyundai i30 SE",
    "Petrol",
    "Manual",
    "1.0 T-GDi 120",
    "manufacturer",
    "https://www.hyundai.news/newsroom/dam/uk/press-kits/20181001_i30/hyundai_i30_fivedoor_and_tourer_press_kit_november2018_technical_specifications.pdf",
    "Hyundai Motor UK 2018 technical table lists i30 SE 1.0 T-GDi 120PS six-speed manual; trim SE, not N Performance."
  ],
  [
    "2021 Hyundai i10 SE Connect",
    "Petrol",
    "Manual",
    "1.0 MPI 67",
    "manufacturer",
    "https://www.hyundai.news/newsroom/dam/eu/uk/20200113_new_i10/hyundai_uk_i10_technical_data.pdf",
    "Hyundai Motor UK 2020 launch UK table confirms second-generation all-new i10 SE Connect 1.0 MPi 67PS five-speed manual, offered into 2021."
  ],
  [
    "2021 Hyundai i20 Premium",
    "Petrol",
    "Manual",
    "1.0 T-GDi 100 MHEV",
    "manufacturer",
    "https://www.hyundai.news/newsroom/dam/eu/uk/20201021_new_i20_1020/hyundai_new_i20_pricing_spec_tech.pdf",
    "Hyundai UK October 2020 price/spec table confirms i20 Premium 1.0 T-GDi 100PS 48V MHEV six-speed intelligent manual (iMT), distinct from DCT; carried into 2021."
  ],
  [
    "2018 Skoda Fabia SE",
    "Petrol",
    "Manual",
    "1.0 TSI 95",
    "corroborated",
    "https://www.lookers.co.uk/used-car/skoda/fabia/1-0-tsi-se-5dr/id/530011",
    "UK Lookers technical listing shows 2018 Fabia SE 1.0 TSI 95PS petrol five-speed manual; source is dealer rather than an archived MY2018 Škoda factory price guide."
  ],
  [
    "2020 Skoda Superb SE Technology",
    "Diesel",
    "Automatic",
    "2.0 TDI 150 DSG",
    "corroborated",
    "https://www.pistonheads.com/buy/skoda/superb/year/2020",
    "2020 UK Superb 2.0 TDI SE Technology automatic is listed in used stock; secondary corroboration for 150PS DSG; separate current Škoda engine page cannot validate the 2020 build."
  ],
  [
    "2021 Skoda Kamiq SE L",
    "Petrol",
    "Manual",
    "1.0 TSI 110",
    "corroborated",
    "https://www.autouncle.co.uk/en-gb/d/44549703-used-2021-skoda-kamiq-se-l-110-bhp",
    "UK registered 2021 Kamiq SE L 1.0 TSI 110PS six-speed manual stock example; model-year manufacturer spec remains to be sourced."
  ],
  [
    "2021 Skoda Octavia vRS",
    "Petrol",
    "Automatic",
    "2.0 TSI 245 DSG",
    "manufacturer",
    "https://www.skoda.co.uk/news/details/uk-prices-and-specifications-for-fourth-generation-skoda-octavai-vrs",
    "Škoda UK October 2020 launch explicitly details Octavia Mk4 vRS 2.0 TSI 245PS front-wheel-drive 7-speed DSG, first registrations 2020 onward; not vRS iV PHEV."
  ],
  [
    "2018 SEAT Ibiza SE Technology",
    "Petrol",
    "Manual",
    "1.0 TSI 95",
    "corroborated",
    "https://www.cargurus.co.uk/Cars/l-Used-2018-Seat-Ibiza-SE-Technology-ev140359",
    "UK 2018 Ibiza SE Technology 1.0 TSI 95 manual car examples; distinct from the 1.0 MPI non-turbo SE Technology."
  ],
  [
    "2020 SEAT Leon FR",
    "Petrol",
    "Manual",
    "1.5 TSI 150",
    "manufacturer",
    "https://www.seat.co.uk/content/dam/public/seat-website/car-shopping-tools/brochure-download/brochures/new-seat-leon/cars-models-specsbrochure-newleonall-NA-may-2020.pdf",
    "SEAT UK hosted May 2020 new Leon 5-door technical range lists FR 1.5 TSI 150PS 6-speed manual; not 1.5 eTSI DSG hybrid."
  ],
  [
    "2020 SEAT Arona FR",
    "Petrol",
    "Manual",
    "1.0 TSI 115",
    "corroborated",
    "https://www.autouncle.co.uk/en-gb/d/44392931-used-2020-seat-arona-fr-115-bhp",
    "UK registered 2020 SEAT Arona FR 1.0 TSI 115PS manual listing; not the 2021-on facelift 110PS manual."
  ],
  [
    "2021 SEAT Ateca SE Technology",
    "Petrol",
    "Manual",
    "1.5 TSI 150",
    "corroborated",
    "https://www.autouncle.co.uk/en-gb/used-cars/Seat/Ateca/y-2021",
    "2021 UK Ateca SE Technology 1.5 TSI EVO 150PS manual adverts, compatible with SEAT UK 2020 new Ateca engine sheet. SE Technology trim evidence is UK secondary stock."
  ],
  [
    "2018 Peugeot 108 Active",
    "Petrol",
    "Manual",
    "1.0 VTi 68",
    "corroborated",
    "https://www.autouncle.co.uk/en-gb/used-cars/Peugeot/108/y-2018",
    "UK 2018 dealer stock identifies Peugeot 108 Active 1.0 petrol 68PS five-speed manual. 68PS must not be conflated with the 72PS facelift 1.0 VTi."
  ],
  [
    "2018 Peugeot 2008 Allure",
    "Petrol",
    "Manual",
    "1.2 PureTech 110",
    "corroborated",
    "https://www.autouncle.co.uk/en-gb/d/44473027-used-2018-peugeot-2008-allure-110-bhp",
    "UK registered 2018 2008 Allure 1.2 PureTech 110PS manual listed as exact derivative; different from 130PS and EAT6 alternatives."
  ],
  [
    "2021 Peugeot 2008 Allure",
    "Petrol",
    "Manual",
    "1.2 PureTech 130",
    "corroborated",
    "https://www.autouncle.co.uk/en-gb/d/44565065-used-2021-peugeot-2008-allure",
    "UK 2021 2008 Allure 1.2 PureTech 130 manual advertisement corroborates exact engine and gearbox, not the 130 EAT8 or 100PS engine."
  ],
  [
    "2021 Peugeot 3008 Allure",
    "Diesel",
    "Automatic",
    "1.5 BlueHDi 130 EAT8",
    "manufacturer",
    "https://www.media.stellantis.com/uk-en/peugeot/press/peugeot-reveals-updated-3008-and-5008-models",
    "Peugeot UK 3008 facelift 2021 model-year published pricing table explicitly lists Allure 1.5 BlueHDi 130 eight-speed EAT8 automatic."
  ],
  [
    "2021 Peugeot 5008 Allure",
    "Diesel",
    "Automatic",
    "1.5 BlueHDi 130 EAT8",
    "manufacturer",
    "https://www.media.stellantis.com/uk-en/peugeot/press/peugeot-reveals-updated-3008-and-5008-models",
    "Peugeot UK 5008 facelift pricing table lists Allure 1.5 BlueHDi 130 eight-speed EAT8 automatic, distinct from manual diesel or 7-seat petrol."
  ],
  [
    "2018 Citroen C1 Feel",
    "Petrol",
    "Manual",
    "1.0 VTi 68",
    "corroborated",
    "https://www.pistonheads.com/buy/citroen/c1/year/2018",
    "UK 2018 C1 Feel 1.0 VTi 68PS manual listed; same registration year also contains updated 72PS cars: game template is specifically the 68PS earlier engine."
  ],
  [
    "2019 Citroen C3 Feel",
    "Petrol",
    "Manual",
    "1.2 PureTech 82",
    "corroborated",
    "https://www.lookers.co.uk/used-car/citroen/c3/1-2-puretech-82-feel-5dr/id/528065",
    "Lookers UK registration NJ19MBX: 2019 Citroën C3 Feel 1.2 PureTech 82PS petrol manual. Separate from 83PS later homologation."
  ],
  [
    "2021 Citroen C3 Aircross Shine",
    "Petrol",
    "Manual",
    "1.2 PureTech 110",
    "manufacturer",
    "https://www.media.stellantis.com/uk-en/citroen/press/citroen-uk-confirms-pricing-and-specifications-for-new-c3-aircross-suv-as-order-books-open",
    "Citroën UK 2021 UK price/trim/powertrain table explicitly lists Shine 1.2 PureTech 110 six-speed manual."
  ],
  [
    "2021 Citroen C5 Aircross Shine",
    "Diesel",
    "Automatic",
    "1.5 BlueHDi 130 EAT8",
    "manufacturer",
    "https://www.media.stellantis.com/uk-en/citroen/press/citroen-uk-confirms-new-trim-and-pricing-details-for-its-key-models",
    "Citroën UK range listing late 2020/2021 shows Shine 1.5 BlueHDi 130 eight-speed EAT8 automatic; do not confuse with Shine manual or Shine Plus."
  ],
  [
    "2018 Renault Clio Dynamique Nav",
    "Petrol",
    "Manual",
    "0.9 TCe 90",
    "corroborated",
    "https://www.cinch.co.uk/used-cars/renault/clio/details/25b64ed9-a7a9-46e4-8b36-41d5bbf1b61e",
    "UK 2018 Renault Clio Dynamique Nav 0.9 TCe 90PS petrol manual listed by cinch with exact registration year; previous fourth-generation Clio."
  ],
  [
    "2018 Renault Kadjar Dynamique Nav",
    "Diesel",
    "Manual",
    "1.5 dCi 110",
    "manufacturer",
    "https://www.press.renault.co.uk/releases/216",
    "Renault UK factory Kadjar launch specification explicitly lists Dynamique Nav dCi 110 diesel manual; 2018 UK registered exact-trim example independently listed by Lookers."
  ],
  [
    "2022 Renault Clio Iconic",
    "Petrol",
    "Manual",
    "1.0 TCe 90",
    "corroborated",
    "https://www.honestjohn.co.uk/used-prices/Renault/Clio/2022/?q=Iconic+Manual+TCe",
    "UK 2022 TCe 90 manual Clio stock often advertised as Iconic Edition: the game title currently abbreviates it to Iconic. Exact 2022 build-badge should be cross-checked before upgrading to manufacturer."
  ],
  [
    "2021 Renault Captur Iconic",
    "Petrol",
    "Manual",
    "1.0 TCe 100",
    "corroborated",
    "https://www.lookers.co.uk/used-car/renault/captur/1-0-tce-iconic-suv-5dr-petrol-manual-euro-6--s/s---100-ps-/id/855262",
    "Renault franchise 2021 registered Captur 1.0 TCe 100PS Iconic manual exists, although other 2021 batches were TCe 90: do not assume 100PS for every 2021 Captur."
  ],
  [
    "2020 Renault Zoe GT Line R135",
    "Electric",
    "Automatic",
    "52 kWh EV",
    "corroborated",
    "https://www.askcar.co.uk/car/renault-zoe-2020-c8cfc0f8c4c8",
    "Registered UK 2020 Renault Zoe R135 GT Line 52kWh usable battery automatic. Different battery lease and charging options require individual checks."
  ],
  [
    "2018 Dacia Sandero Ambiance",
    "Petrol",
    "Manual",
    "1.0 SCe 75",
    "corroborated",
    "https://www.pistonheads.com/buy/dacia/sandero/year/2018",
    "UK 2018 Sandero 1.0 SCe 75PS Ambiance five-door petrol manual listings; SCe naturally aspirated, not 0.9 TCe."
  ],
  [
    "2018 Dacia Duster Comfort",
    "Petrol",
    "Manual",
    "1.6 SCe 115",
    "corroborated",
    "https://askcar.co.uk/used-cars/dacia/duster/comfort/2018",
    "UK 2018 Duster second-generation Comfort 1.6 SCe 115PS petrol manual multiple dealer adverts. First-generation Duster trims differ."
  ],
  [
    "2022 Dacia Sandero Stepway Comfort",
    "Petrol",
    "Manual",
    "1.0 TCe 90",
    "corroborated",
    "https://www.honestjohn.co.uk/used-prices/Dacia/Sandero--Stepway/SUV/2022/?q=Comfort+TCe",
    "UK 2022 Sandero Stepway Comfort 1.0 TCe 90 petrol manual; separate from Bi-Fuel ECO-G Comfort."
  ],
  [
    "2023 Dacia Jogger Expression",
    "Petrol",
    "Manual",
    "1.0 TCe 110",
    "corroborated",
    "https://www.autouncle.co.uk/en-gb/d/44566306-used-2023-dacia-jogger-expression-110-bhp",
    "2023 UK Jogger Expression 1.0 TCe 110PS petrol manual; seven-seat MPV, not Duster SUV, e.g. Cazoo advert indexed by AutoUncle."
  ],
  [
    "2018 Suzuki Swift SZ3",
    "Petrol",
    "Manual",
    "1.2 Dualjet",
    "corroborated",
    "https://www.lookers.co.uk/used-car/suzuki/swift/1-2-dualjet-sz3-5dr/id/859656",
    "Lookers UK registered DW18GMO Swift SZ3 1.2 Dualjet K12C 90PS five-speed manual. Not Swift Sport Boosterjet."
  ],
  [
    "2019 Suzuki Ignis SZ3",
    "Petrol",
    "Manual",
    "1.2 Dualjet",
    "corroborated",
    "https://askcar.co.uk/car/suzuki-ignis-2019-babcb1c3c2b8",
    "UK 2019 Ignis SZ3 1.2 Dualjet petrol manual 2WD, not the separate SHVS mild-hybrid SZ3."
  ],
  [
    "2020 Suzuki Vitara SZ-T",
    "Petrol",
    "Manual",
    "1.4 Boosterjet MHEV",
    "corroborated",
    "https://www.askcar.co.uk/car/suzuki-vitara-2020-624df18742a6",
    "2020 UK Vitara SZ-T 1.4 Boosterjet 48V mild-hybrid manual FWD. Game fuel 'Petrol' includes mild hybrids, engine annotation identifies MHEV."
  ],
  [
    "2020 Suzuki Swift Sport",
    "Petrol",
    "Manual",
    "1.4 Boosterjet MHEV",
    "corroborated",
    "https://www.lookers.co.uk/used-car/suzuki/swift/1-4-boosterjet-48v-hybrid-sport-5dr/id/605216",
    "UK 2020 Swift Sport 1.4 Boosterjet K14D 48V MHEV 129PS 6-speed manual; distinct from 2018 non-hybrid 140PS Sport."
  ],
  [
    "2020 MG MG3 Excite",
    "Petrol",
    "Manual",
    "1.5 VTi-TECH 106",
    "corroborated",
    "https://www.richardsonsoflincoln.co.uk/used-mg-mg3-lincoln-lincolnshire-8327175",
    "UK 2020 MG3 Excite 1.5 VTi-TECH 106PS petrol five-speed manual, 70-plate example from independent dealer."
  ],
  [
    "2021 MG ZS Exclusive",
    "Petrol",
    "Manual",
    "1.5 VTi-TECH 106",
    "corroborated",
    "https://www.lookers.co.uk/used-car/mg-motor-uk/zs/1-5-vti-tech-exclusive-5dr/id/750199",
    "Lookers MG UK Brighton registered 2021 ZS Exclusive 1.5 VTi-TECH 106PS petrol manual; not 1.0 T-GDI 111PS automatic."
  ],
  [
    "2022 MG HS Excite",
    "Petrol",
    "Manual",
    "1.5 T-GDI 162",
    "corroborated",
    "https://www.lookers.co.uk/used-car/mg-motor-uk/hs/1-5-t-gdi-excite-suv-5dr-petrol-manual-euro-6--s/s---162-ps-/id/787160",
    "Lookers UK registered 2022 MG HS Excite 1.5 T-GDI 162PS petrol manual; different from PHEV HS and automatic Excite."
  ],
  [
    "2018 Honda Civic SE",
    "Petrol",
    "Manual",
    "1.0 VTEC Turbo 129",
    "manufacturer",
    "https://hondanews.eu/gb/en/cars/media/pressreleases/101342/residual-values-and-pricing-announced-for-all-new-honda-civic",
    "Honda UK January 2017 tenth-generation Civic price table explicitly identifies 1.0 129PS VTEC Turbo SE six-speed manual. Continuation to 2018; hatchback versus saloon not encoded in game title."
  ],
  [
    "2021 Honda Civic Sport",
    "Petrol",
    "Manual",
    "1.5 VTEC Turbo 182",
    "manufacturer",
    "https://hondanews.eu/eu/en/cars/media/pressreleases/327918/2021-honda-civic",
    "Honda official 2021 Civic publication documents 1.5 VTEC Turbo 182PS six-speed manual and UK Sport specification family; distinguish from 1.0 SE 126PS and CVT Sport."
  ],
  [
    "2022 Honda HR-V Advance e:HEV",
    "Hybrid",
    "Automatic",
    "1.5 i-MMD hybrid e-CVT",
    "manufacturer",
    "https://hondanews.eu/eu/el/cars/media/pressreleases/345249/honda-confirms-pricing-for-all-new-hr-v-ehev",
    "Honda UK pricing release confirms 2022-model HR-V Advance 1.5 full hybrid e:HEV and electronically managed automatic driveline; not the prior-generation non-hybrid HR-V."
  ],
  [
    "2018 Mazda Mazda2 SE-L",
    "Petrol",
    "Manual",
    "1.5 Skyactiv-G 90",
    "corroborated",
    "https://uk.mazda-press.com/news/2017/new-tech-edition-model-joins-updated-mazda2-range/",
    "Mazda UK 2017 range table includes SE-L 1.5 Skyactiv-G 90PS five-speed manual, whose SE-L 90PS pricing includes navigation. Exact 2018 equipment/badge (SE-L vs SE-L Nav/Nav+) still needs build-period corroboration."
  ],
  [
    "2020 Mazda Mazda3 SE-L",
    "Petrol",
    "Manual",
    "2.0 Skyactiv-G MHEV",
    "manufacturer",
    "https://uk.mazda-press.com/news/2020/mazda3-named-as-2020-world-car-design-of-the-year/?year=2020",
    "Mazda UK 2020 announcement: 2.0 Skyactiv-G 122PS petrol 24V M Hybrid is available as SE-L hatchback with manual transmission. Not the 180PS Skyactiv-X."
  ],
  [
    "2020 Mazda CX-5 SE-L",
    "Petrol",
    "Manual",
    "2.0 Skyactiv-G",
    "manufacturer",
    "https://uk.mazda-press.com/news/2020/2020-mazda-cx-5-continues-winning-formula/",
    "Mazda UK March 2020 14-model CX-5 range lists SE-L trim and 2.0 Skyactiv-G 165PS manual with cylinder deactivation. Body assumed second-generation SUV, drivetrain FWD in this engine configuration."
  ],
  [
    "2021 BMW 118i M Sport",
    "Petrol",
    "Automatic",
    "1.5 TwinPower Turbo DCT",
    "corroborated",
    "https://www.lloydmotorgroup.com/UsedCars/BMW/BMW-1-SERIES-118i-136-M-Sport-5dr-Step-Auto/156140",
    "BMW UK franchise dealer lists 2021 118i 1.5 petrol M Sport automatic dual-clutch DCT. Note late 2021 136PS variants also exist; title does not claim a fixed PS."
  ],
  [
    "2019 BMW M140i Shadow Edition",
    "Petrol",
    "Automatic",
    "3.0 turbo straight-six ZF8",
    "corroborated",
    "https://acgmotors.co.uk/model/m140ishadow/",
    "UK specialist registered 2019 3.0 M140i Shadow Edition petrol 8-speed automatic stock. GPF and modification status vary; do not confuse with F40 M135i xDrive 2.0 four-cylinder."
  ],
  [
    "2022 BMW M135i xDrive",
    "Petrol",
    "Automatic",
    "2.0 turbo xDrive Steptronic",
    "manufacturer",
    "https://www.press.bmwgroup.com/united-kingdom/article/detail/T0296393EN_GB/the-all-new-bmw-1-series?language=en_GB",
    "BMW UK F40 1 Series product release documents M135i xDrive 2.0 four-cylinder 306hp, all-wheel drive, eight-speed Sport automatic. Continued into 2022; LCI changes do not make this an M140i."
  ],
  [
    "2020 BMW X1 sDrive18i Sport",
    "Petrol",
    "Manual",
    "1.5 TwinPower Turbo",
    "corroborated",
    "https://www.hodgsoncarsales.co.uk/used-car-details/used-bmw-x1-15-18i-sport-suv-5dr-petrol-m-suv-mineral-grey-manual-petrol/id-1740/",
    "UK 2020 registered BMW X1 sDrive18i Sport 1.5 petrol 140PS front-drive six-speed manual matching the model/trim/gearbox; not xDrive or Steptronic."
  ],
  [
    "2019 BMW 520d M Sport",
    "Diesel",
    "Automatic",
    "2.0 diesel Steptronic",
    "corroborated",
    "https://www.cinch.co.uk/used-cars/bmw/5-series/details/333398ce-8c9b-4d18-b996-1680697442c8?financeType=any",
    "UK 2019 registered 520d M Sport 2.0 diesel automatic rear-wheel drive listed by cinch. Most use BMW ZF eight-speed Steptronic; body is a saloon in this example, Touring also existed."
  ],
  [
    "2022 BMW i4 eDrive40",
    "Electric",
    "Automatic",
    "83.9 kWh RWD EV",
    "manufacturer",
    "https://www.press.bmwgroup.com/global/article/attachment/T0442767EN/617124",
    "BMW factory eDrive40 engineering sheet specifies RWD electric 340hp, single-speed drive, 83.9kWh GROSS and 81.3kWh NET battery. The game's 83.9 kWh string must be read as gross; source from later spec period supports model technical battery architecture, not VIN-level battery health."
  ],
  [
    "2021 BMW M3 Competition",
    "Petrol",
    "Automatic",
    "3.0 twin-turbo straight-six ZF8",
    "manufacturer",
    "https://www.press.bmwgroup.com/united-kingdom/article/detail/T0327319EN_GB/the-new-bmw-m3-competition-saloon-and-bmw-m4-competition-coup%C3%A9",
    "BMW UK March 2021 G80 M3 Competition saloon confirms 3.0 straight-six twin turbo 510hp rear-drive with eight-speed M Steptronic. Optional M xDrive launched mid-2021 and is NOT assumed by title."
  ],
  [
    "2021 Mercedes-AMG A35 4MATIC",
    "Petrol",
    "Automatic",
    "2.0 turbo 306 PS DCT",
    "corroborated",
    "https://www.motors.co.uk/mercedes-benz/a-class/trim/amg/year/2021/used-cars/",
    "2021 UK AMG A35 4MATIC 2.0 petrol 306PS seven-speed AMG 7G-DCT documented in registered A-Class adverts; not Mercedes A200 AMG Line styling."
  ],
  [
    "2019 Mercedes-Benz C220d AMG Line",
    "Diesel",
    "Automatic",
    "2.0 diesel 9G-Tronic",
    "manufacturer",
    "https://tax.mercedes-benz.co.uk/companycar/tax/history/Mercedes-Benz/C-Class%20Saloon/19",
    "Mercedes-Benz historical UK company-car table lists 2019 C220 d AMG Line 9G-TRONIC PLUS diesel. Game title does not specify saloon vs estate; evidence covers saloon 2.0 diesel automatic."
  ],
  [
    "2021 Mercedes-Benz GLA200 AMG Line",
    "Petrol",
    "Automatic",
    "1.3 turbo DCT",
    "corroborated",
    "https://www.theaa.com/used-cars/mercedes/gla/2021",
    "2021 UK GLA200 AMG Line 1.3 petrol 163PS automatic 7G-DCT advert confirms badge/engine/transmission. Not GLA 35 AMG, and 2021 4MATIC should not be assumed."
  ],
  [
    "2021 Mercedes-AMG A45 S 4MATIC+",
    "Petrol",
    "Automatic",
    "2.0 turbo 421 PS DCT",
    "corroborated",
    "https://www.autouncle.co.uk/en-gb/used-cars/Mercedes/A45%20AMG/y-2021",
    "2021 UK AMG A45 S 4MATIC+ 2.0 turbo petrol 421PS automatic registered hatch examples. Eight-speed DCT detail from model specification; not regular A45 381PS or A35 306PS."
  ],
  [
    "2018 Volvo V40 D2 Momentum",
    "Diesel",
    "Manual",
    "2.0 D2 120",
    "corroborated",
    "https://www.autotrader.co.uk/cars/used/volvo/v40/2018",
    "2018 UK Volvo V40 D2 2.0 diesel 120PS manual Momentum Nav Plus and Momentum Edition stock. Basic title simplifies package; precise 2018 Momentum badge/navigation pack needs source-by-vehicle."
  ],
  [
    "2021 Volvo V60 Momentum B4",
    "Petrol",
    "Automatic",
    "2.0 B4 MHEV automatic",
    "corroborated",
    "https://comcar.co.uk/companycar/tax/history/Volvo/V60/21",
    "Historic 2021 UK V60 B4 (P) Momentum 197hp FWD automatic is 48V mild hybrid petrol. Game fuel Petrol is broad combustion category, not a pure non-electrified petrol; actual UK tax source categorises hybrid petrol/electric."
  ],
  [
    "2020 Volvo XC60 D4 Momentum",
    "Diesel",
    "Automatic",
    "2.0 D4 Geartronic",
    "corroborated",
    "https://www.cinch.co.uk/used-cars/volvo/xc60/30000-price",
    "2020 UK Volvo XC60 D4 Momentum 2.0 190PS diesel Geartronic automatic recorded by UK used-car stock; source does not confirm AWD and the new game variant no longer falsely assumes it. Exact drivetrain still pending VIN check."
  ],
  [
    "2020 Jaguar XE R-Dynamic S D180",
    "Diesel",
    "Automatic",
    "2.0 D180 automatic",
    "corroborated",
    "https://www.wheelerschippingnorton.co.uk/vehicle-details/used-jaguar-xe-d180-r-dynamic-s-for-sale-car-sales-u16288/",
    "Dealer-listed UK 2020 Jaguar XE R-Dynamic S 2.0 D180 diesel 180PS automatic saloon, with engine code AJ20-D4M in technical spec. AWD and RWD both existed; game title does not assert either."
  ],
  [
    "2021 Jaguar F-Type P300 R-Dynamic",
    "Petrol",
    "Automatic",
    "2.0 turbo 300 automatic",
    "corroborated",
    "https://www.autouncle.co.uk/en-gb/d/44574243-used-2021-jaguar-f-type-r-dynamic-300-bhp",
    "UK 2021 F-Type 2.0 P300 R-Dynamic 300PS two-door automatic coupé listing. Roadster also exists; body type absent from game title."
  ],
  [
    "2019 Land Rover Discovery Sport SE TD4",
    "Diesel",
    "Automatic",
    "2.0 TD4 180 AWD automatic",
    "corroborated",
    "https://www.autouncle.co.uk/en-gb/d/44526533-used-2019-land-rover-discovery-sport-se-180-bhp",
    "UK 2019 Discovery Sport 2.0 TD4 180 SE diesel automatic 4WD exact year/trim/engine record; other 2019 TD4 SE Tech, HSE and facelift D180 have different badges."
  ],
  [
    "2022 Range Rover Evoque D200 R-Dynamic S",
    "Diesel",
    "Automatic",
    "2.0 D200 MHEV 4WD automatic",
    "corroborated",
    "https://askcar.co.uk/car/land-rover-range-rover-evoque-2022-fb79f4ea0b8e",
    "UK 2022 Range Rover Evoque 2.0 D200 MHEV R-Dynamic S automatic AWD exact derivative/registration listing. D200 204PS mild-hybrid not D180 180PS."
  ],
  [
    "2021 Land Rover Discovery D250 S",
    "Diesel",
    "Automatic",
    "3.0 D250 MHEV AWD automatic",
    "corroborated",
    "https://www.southgrovemotorcompany.co.uk/used-land-rover-discovery-bolton-lancashire-7432351",
    "UK 2021 full-size Land Rover Discovery D250 MHEV S 3.0 six-cylinder 250PS diesel automatic 4WD registered dealer example; distinct from Discovery Sport and D300."
  ]
]);
  const all=Object.values(CATALOGUE).flat();
  if(new Set(all.map(x=>x[0])).size!==all.length)throw new Error('Duplicate UK vehicle derivative');
  window.MotorTradeUKCatalogue=Object.freeze({CATALOGUE,VERIFIED,
    added:all.length,source:'SMMT Q3 2026 used-car model frequencies'});
})();
