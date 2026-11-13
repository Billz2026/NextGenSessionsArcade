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
  "starter": "\n2018 Toyota Aygo x-play|84500|Petrol|Manual|1.0 VVT-i|2100|4250|330|3|Partial\n2017 Toyota Auris Icon Hybrid|114000|Hybrid|Automatic|1.8 VVT-i hybrid e-CVT|5300|8250|450|3|Partial\n2018 Toyota Prius Business Edition|118000|Hybrid|Automatic|1.8 VVT-i hybrid e-CVT|7600|10950|480|3|Full\n2018 Toyota C-HR Icon Hybrid|106000|Hybrid|Automatic|1.8 VVT-i hybrid e-CVT|7800|11350|470|3|Partial\n2018 Nissan Micra Acenta|96000|Petrol|Manual|0.9 IG-T 90|2650|4950|375|3|Partial\n2017 Nissan Juke N-Connecta|105000|Petrol|Manual|1.2 DIG-T 115|3350|5750|455|4|Partial\n2016 Nissan Note Acenta|113000|Petrol|Manual|1.2 80|1850|3900|360|4|Partial\n2017 Nissan X-Trail Acenta|115000|Diesel|Manual|1.6 dCi 130|5550|9150|585|4|Partial\n2018 Ford Fiesta Titanium|94000|Petrol|Manual|1.0 EcoBoost 100|3400|6000|440|3|Partial\n2018 Ford Focus ST-Line|101000|Petrol|Manual|1.0 EcoBoost 125|4350|7450|490|3|Partial\n2017 Ford Mondeo Zetec|116000|Diesel|Manual|2.0 TDCi 150|3450|6450|560|4|Partial\n2018 Vauxhall Astra SRi|101000|Petrol|Manual|1.4 Turbo 150|3800|6750|445|3|Partial\n2017 Vauxhall Insignia SRi Nav|111000|Diesel|Manual|1.6 CDTi 136|3800|7150|565|4|Partial\n2019 Vauxhall Crossland X SE|90000|Petrol|Manual|1.2 83|4850|7850|405|3|Partial\n2018 Peugeot 108 Active|90000|Petrol|Manual|1.0 VTi 68|2200|4200|335|3|Partial\n2018 Peugeot 2008 Allure|106000|Petrol|Manual|1.2 PureTech 110|3600|6500|490|4|Partial\n2018 Citroen C1 Feel|89000|Petrol|Manual|1.0 VTi 68|2050|4050|340|3|Partial\n2019 Citroen C3 Feel|92000|Petrol|Manual|1.2 PureTech 82|3500|6300|465|3|Partial\n2018 Renault Clio Dynamique Nav|105000|Petrol|Manual|0.9 TCe 90|2850|5300|385|3|Partial\n2018 Renault Kadjar Dynamique Nav|116000|Diesel|Manual|1.5 dCi 110|4950|8550|585|4|Partial\n2018 Dacia Sandero Ambiance|99000|Petrol|Manual|1.0 SCe 75|1700|3600|340|3|Partial\n2018 Dacia Duster Comfort|104000|Petrol|Manual|1.6 SCe 115|4500|7800|480|3|Partial\n2018 Suzuki Swift SZ3|94000|Petrol|Manual|1.2 Dualjet|3450|6200|355|3|Partial\n2019 Suzuki Ignis SZ3|92000|Petrol|Manual|1.2 Dualjet|3900|6850|355|3|Partial\n2019 Kia Picanto 2|88000|Petrol|Manual|1.0 MPI|3550|6250|340|3|Full\n2018 Kia Sportage 1|112000|Petrol|Manual|1.6 GDi|6250|9900|490|3|Partial\n2018 Hyundai i10 SE|100000|Petrol|Manual|1.0 MPI|2950|5450|340|3|Partial\n2018 Hyundai i30 SE|103000|Petrol|Manual|1.0 T-GDi 120|4550|7850|425|3|Partial\n2018 Skoda Fabia SE|101000|Petrol|Manual|1.0 TSI 95|3550|6350|370|3|Partial\n2018 SEAT Ibiza SE Technology|100000|Petrol|Manual|1.0 TSI 95|3750|6750|385|3|Partial\n2018 Honda Civic SE|110000|Petrol|Manual|1.0 VTEC Turbo 129|5750|9200|500|3|Partial\n2017 Fiat 500 Lounge|85000|Petrol|Manual|1.2 69|2650|4950|340|3|Partial\n2018 Mazda Mazda2 SE-L|98000|Petrol|Manual|1.5 Skyactiv-G 90|3650|6750|380|3|Partial\n\n2018 Volvo V40 D2 Momentum|111000|Diesel|Manual|2.0 D2 120|5100|8800|520|3|Partial\n2017 Mitsubishi ASX 3|106000|Petrol|Manual|1.6 MIVEC|4100|7300|435|4|Partial\n2018 Jeep Renegade Longitude|104000|Diesel|Manual|1.6 MultiJet II 120|5600|9600|550|3|Partial\n2017 Fiat Tipo Easy|108000|Petrol|Manual|1.4 95|2450|5100|410|4|Partial\n2018 Mazda Mazda6 SE-L Nav|110000|Diesel|Manual|2.2 Skyactiv-D 150|5300|8800|610|4|Partial",
  "modern": "\n2022 Toyota Aygo X Pure|42000|Petrol|Manual|1.0 VVT-i|7200|10600|330|2|Full\n2020 Toyota Corolla Icon Hybrid|62000|Hybrid|Automatic|1.8 VVT-i hybrid e-CVT|10500|15000|435|2|Full\n2019 Toyota RAV4 Design Hybrid|74000|Hybrid|Automatic|2.5 VVT-i hybrid AWD-i e-CVT|14800|20500|625|3|Full\n2021 Toyota C-HR Design Hybrid|61000|Hybrid|Automatic|1.8 VVT-i hybrid e-CVT|12500|17700|465|2|Full\n2020 Toyota Prius Business Edition|72000|Hybrid|Automatic|1.8 VVT-i hybrid e-CVT|10200|14400|450|2|Full\n2021 Nissan Juke N-Connecta|56000|Petrol|Manual|1.0 DIG-T 114|9400|13200|435|2|Full\n2023 Nissan Juke Tekna Hybrid|32000|Hybrid|Automatic|1.6 hybrid 143|15700|21300|475|2|Full\n2019 Nissan Qashqai N-Connecta|87000|Petrol|Manual|1.3 DIG-T 140|7600|11050|480|3|Partial\n2021 Nissan X-Trail N-Connecta|73000|Diesel|Manual|1.7 dCi 150|11900|16500|610|3|Full\n2023 Nissan Qashqai N-Connecta e-POWER|38000|Hybrid|Automatic|1.5 e-POWER|17100|23400|535|2|Full\n2020 Ford Fiesta ST-Line|65000|Petrol|Manual|1.0 EcoBoost 125|7300|10900|425|2|Full\n2019 Ford Fiesta ST-2|64000|Petrol|Manual|1.5 EcoBoost 200|9700|14100|575|3|Partial\n2021 Ford Focus Titanium|68000|Petrol|Manual|1.0 EcoBoost 125|7800|11800|420|3|Full\n2021 Ford Kuga Titanium PHEV|58000|Plug-in Hybrid|Automatic|2.5 Duratec PHEV eCVT|11700|16400|595|3|Full\n2021 Vauxhall Astra SRi|56000|Petrol|Manual|1.2 Turbo 145|7550|11050|450|2|Full\n2021 Vauxhall Mokka SRi|46000|Petrol|Automatic|1.2 Turbo 130 EAT8|11300|15950|475|2|Full\n2021 Vauxhall Grandland X Elite|58000|Petrol|Automatic|1.2 Turbo 130 EAT8|11100|15900|525|3|Full\n2020 Vauxhall Insignia SRi Nav|72000|Petrol|Manual|1.5 Turbo 165|7300|11200|525|3|Partial\n2018 Volkswagen Golf GTI Performance|69000|Petrol|Automatic|2.0 TSI 245 PS DSG|13750|18950|625|3|Full\n2019 Volkswagen Golf GTD|74000|Diesel|Automatic|2.0 TDI 184 DSG|11500|16100|620|3|Full\n2021 Volkswagen T-Cross SE|50000|Petrol|Manual|1.0 TSI 110|10000|14500|430|2|Full\n2019 Volkswagen T-Roc SE|68000|Petrol|Automatic|1.5 TSI 150 DSG|11800|16200|460|3|Full\n2020 Volkswagen Tiguan Match|81000|Diesel|Automatic|2.0 TDI 150 DSG|14100|19300|665|3|Full\n2021 Volkswagen ID.3 Life Pro Performance|51000|Electric|Automatic|58 kWh EV|10600|15300|655|2|Full\n2020 Skoda Octavia SE|72000|Petrol|Manual|1.5 TSI 150|8150|12500|460|3|Full\n2020 Skoda Karoq SE|72000|Petrol|Manual|1.5 TSI 150|12200|16950|480|3|Full\n2021 Skoda Kamiq SE L|56000|Petrol|Manual|1.0 TSI 110|9200|13500|420|2|Full\n2020 Skoda Superb SE Technology|87000|Diesel|Automatic|2.0 TDI 150 DSG|12100|17000|590|3|Full\n2020 SEAT Leon FR|73000|Petrol|Manual|1.5 TSI 150|8350|12350|455|3|Partial\n2020 SEAT Arona FR|62000|Petrol|Manual|1.0 TSI 115|9000|13050|420|2|Full\n2021 SEAT Ateca SE Technology|62000|Petrol|Manual|1.5 TSI 150|11500|16000|505|2|Full\n2021 Hyundai i10 SE Connect|48000|Petrol|Manual|1.0 MPI 67|6550|9650|350|2|Full\n2021 Hyundai i20 Premium|49000|Petrol|Manual|1.0 T-GDi 100 MHEV|8500|12500|395|2|Full\n2020 Hyundai Ioniq Premium Hybrid|69000|Hybrid|Automatic|1.6 GDi hybrid DCT|9200|13300|475|2|Full\n2021 Kia Stonic 3|55000|Petrol|Manual|1.0 T-GDi 118|8850|12950|385|2|Full\n2021 Kia Ceed 2|52000|Petrol|Manual|1.0 T-GDi 120|9100|13200|415|2|Full\n2020 Kia Niro 2 Hybrid|61000|Hybrid|Automatic|1.6 GDi hybrid DCT|10200|14650|450|2|Full\n2021 Kia e-Niro 3|62000|Electric|Automatic|64 kWh EV|11000|16150|610|2|Full\n2022 Renault Clio Iconic|47000|Petrol|Manual|1.0 TCe 90|7650|11150|410|2|Full\n2021 Renault Captur Iconic|59000|Petrol|Manual|1.0 TCe 100|8850|13000|430|3|Full\n2020 Renault Zoe GT Line R135|48000|Electric|Automatic|52 kWh EV|6700|9950|610|3|Partial\n2021 Peugeot 2008 Allure|62000|Petrol|Manual|1.2 PureTech 130|9000|13400|515|3|Full\n2021 Peugeot 3008 Allure|74000|Diesel|Automatic|1.5 BlueHDi 130 EAT8|11500|16550|640|3|Full\n2021 Peugeot 5008 Allure|79000|Diesel|Automatic|1.5 BlueHDi 130 EAT8|13600|19000|675|3|Partial\n2021 Citroen C3 Aircross Shine|54000|Petrol|Manual|1.2 PureTech 110|7650|11500|465|2|Full\n2021 Citroen C5 Aircross Shine|69000|Diesel|Automatic|1.5 BlueHDi 130 EAT8|11550|16300|630|3|Partial\n2021 Honda Civic Sport|56000|Petrol|Manual|1.5 VTEC Turbo 182|12300|17450|485|2|Full\n2022 Honda HR-V Advance e:HEV|48000|Hybrid|Automatic|1.5 i-MMD hybrid e-CVT|15200|20750|475|2|Full\n2020 Suzuki Vitara SZ-T|57000|Petrol|Manual|1.4 Boosterjet MHEV|8100|12100|440|2|Full\n2020 Suzuki Swift Sport|55000|Petrol|Manual|1.4 Boosterjet MHEV|10200|14350|450|3|Full\n2020 Mazda Mazda3 SE-L|67000|Petrol|Manual|2.0 Skyactiv-G MHEV|9450|13900|440|2|Full\n2020 Mazda CX-5 SE-L|74000|Petrol|Manual|2.0 Skyactiv-G|12500|17950|525|3|Full\n2022 Dacia Sandero Stepway Comfort|44000|Petrol|Manual|1.0 TCe 90|8050|11800|400|2|Full\n2023 Dacia Jogger Expression|43000|Petrol|Manual|1.0 TCe 110|11100|15850|440|2|Full\n2020 MG MG3 Excite|55000|Petrol|Manual|1.5 VTi-TECH 106|4950|8350|395|3|Partial\n2021 MG ZS Exclusive|59000|Petrol|Manual|1.5 VTi-TECH 106|7750|11550|425|2|Full\n2022 MG HS Excite|53000|Petrol|Manual|1.5 T-GDI 162|10300|14650|475|2|Full\n2019 MINI Hatch Cooper|65000|Petrol|Manual|1.5 TwinPower Turbo|9950|14500|460|2|Full\n2020 MINI Clubman Cooper|55000|Petrol|Manual|1.5 TwinPower Turbo|12000|16750|475|2|Full\n2019 Lexus CT 200h|81000|Hybrid|Automatic|1.8 hybrid e-CVT|11000|15600|480|3|Full\n\n2021 Volvo V60 Momentum B4|58000|Petrol|Automatic|2.0 B4 MHEV automatic|15100|21600|575|2|Full\n2020 Volvo XC60 D4 Momentum|76000|Diesel|Automatic|2.0 D4 AWD automatic|17800|24600|700|3|Full\n2020 Jaguar XE R-Dynamic S D180|67000|Diesel|Automatic|2.0 D180 automatic|13600|19200|645|3|Partial\n2020 Jaguar F-Pace Prestige D180|76000|Diesel|Automatic|2.0 D180 AWD automatic|17700|24600|780|3|Partial\n2019 Land Rover Discovery Sport SE TD4|88000|Diesel|Automatic|2.0 TD4 180 AWD automatic|13700|19000|815|3|Partial\n2021 Mitsubishi Outlander PHEV Dynamic|69000|Plug-in Hybrid|Automatic|2.4 PHEV AWD|12100|17300|700|3|Full\n2020 Jeep Compass Limited|63000|Petrol|Manual|1.4 MultiAir 140|10100|14600|525|3|Partial\n2020 Subaru Forester XE e-BOXER|57000|Hybrid|Automatic|2.0 e-BOXER Lineartronic|15900|22400|595|3|Full\n2020 Subaru XV SE Premium e-BOXER|68000|Hybrid|Automatic|2.0 e-BOXER Lineartronic|13200|18700|565|3|Full",
  "premium": "\n2018 Volkswagen Golf R|59000|Petrol|Automatic|2.0 TSI 310 PS 4MOTION DSG|17800|24300|700|2|Full\n2022 Volkswagen Golf GTI|48000|Petrol|Automatic|2.0 TSI 245 PS DSG|19400|26700|650|2|Full\n2022 Volkswagen ID.4 Life Pro Performance|49000|Electric|Automatic|77 kWh EV|15800|22250|685|2|Full\n2019 Audi A3 Sportback 35 TFSI S line|61000|Petrol|Automatic|1.5 TFSI 150 S tronic|11800|17150|480|2|Full\n2022 Audi S3 Sportback|45000|Petrol|Automatic|2.0 TFSI quattro S tronic|23500|31500|740|2|Full\n2020 Audi Q3 35 TFSI S line|62000|Petrol|Automatic|1.5 TFSI 150 S tronic|17600|24400|585|2|Full\n2020 Audi Q2 30 TFSI Sport|49000|Petrol|Manual|1.0 TFSI 116|11800|16800|480|2|Full\n2020 Audi A4 35 TDI S line|67000|Diesel|Automatic|2.0 TDI S tronic|16500|23000|620|3|Full\n2021 BMW 118i M Sport|50000|Petrol|Automatic|1.5 TwinPower Turbo DCT|15100|21200|525|2|Full\n2019 BMW M140i Shadow Edition|61000|Petrol|Automatic|3.0 turbo straight-six ZF8|20100|28100|795|2|Full\n2022 BMW M135i xDrive|43000|Petrol|Automatic|2.0 turbo xDrive Steptronic|23400|30800|745|2|Full\n2020 BMW X1 sDrive18i Sport|64000|Petrol|Manual|1.5 TwinPower Turbo|13200|18500|550|3|Full\n2019 BMW 520d M Sport|76000|Diesel|Automatic|2.0 diesel Steptronic|17700|24750|700|3|Full\n2022 BMW i4 eDrive40|49000|Electric|Automatic|83.9 kWh RWD EV|23500|32500|795|2|Full\n2021 Mercedes-AMG A35 4MATIC|42000|Petrol|Automatic|2.0 turbo 306 PS DCT|25000|33600|800|2|Full\n2019 Mercedes-Benz C220d AMG Line|67000|Diesel|Automatic|2.0 diesel 9G-Tronic|17000|23750|645|2|Full\n2021 Mercedes-Benz GLA200 AMG Line|49000|Petrol|Automatic|1.3 turbo DCT|18400|25550|570|2|Full\n2020 Mercedes-Benz GLC220d AMG Line|75000|Diesel|Automatic|2.0 diesel 4MATIC 9G-Tronic|22200|30700|725|3|Full\n2019 Hyundai i30 N Performance|60000|Petrol|Manual|2.0 T-GDi 275 PS|16100|22400|720|2|Full\n2022 Kia EV6 GT-Line RWD|42000|Electric|Automatic|77.4 kWh RWD EV|19600|28000|755|2|Full\n2021 Skoda Octavia vRS|49000|Petrol|Automatic|2.0 TSI 245 DSG|16700|23750|610|2|Full\n2022 CUPRA Formentor VZ2 310|41000|Petrol|Automatic|2.0 TSI 310 4Drive DSG|20900|28700|690|2|Full\n2021 Lexus UX 250h F Sport|49000|Hybrid|Automatic|2.0 hybrid e-CVT|17700|25000|535|2|Full\n\n2022 Polestar 2 Long Range Single Motor|47000|Electric|Automatic|78 kWh EV|14700|21600|725|2|Full\n2023 BYD Atto 3 Design|36000|Electric|Automatic|60.48 kWh EV|14300|20400|670|2|Full\n2022 Tesla Model 3 Long Range AWD|57000|Electric|Automatic|Dual-motor AWD EV|17800|25900|745|2|Full\n2021 Range Rover Evoque D180 S|67000|Diesel|Automatic|2.0 D180 AWD automatic|18300|25800|760|3|Partial\n2021 DS DS 7 Crossback E-Tense 225|55000|Plug-in Hybrid|Automatic|1.6 petrol PHEV EAT8|14700|20700|680|3|Full",
  "luxury": "\n2022 Audi RS 3 Sportback|35000|Petrol|Automatic|2.5 TFSI 400 PS quattro S tronic|32800|43900|950|2|Full\n2021 Audi RS Q3 Sportback|39000|Petrol|Automatic|2.5 TFSI 400 quattro S tronic|32400|43500|930|2|Full\n2021 BMW M3 Competition|37000|Petrol|Automatic|3.0 twin-turbo straight-six ZF8|49300|64000|1125|2|Full\n2019 Porsche 718 Cayman 2.0 PDK|39000|Petrol|Automatic|2.0 turbo PDK|28700|38400|900|2|Full\n2022 Range Rover Evoque D200 R-Dynamic S|42000|Diesel|Automatic|2.0 D200 MHEV 4WD automatic|24200|33400|895|3|Full\n2021 Lexus RX 450h F Sport|56000|Hybrid|Automatic|3.5 V6 hybrid e-CVT|30600|40800|820|2|Full\n2021 Mercedes-AMG A45 S 4MATIC+|43000|Petrol|Automatic|2.0 turbo 421 PS DCT|33500|44800|945|2|Full\n2022 Volkswagen Touareg R-Line V6 TDI|50000|Diesel|Automatic|3.0 V6 TDI 4MOTION Tiptronic|32900|43700|965|2|Full\n\n2021 Jaguar F-Type P300 R-Dynamic|40000|Petrol|Automatic|2.0 turbo 300 automatic|31300|41000|930|2|Full\n2021 Land Rover Discovery D250 S|48000|Diesel|Automatic|3.0 D250 MHEV AWD automatic|32700|43800|1000|3|Full"
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
  ]
]);
  const all=Object.values(CATALOGUE).flat();
  if(new Set(all.map(x=>x[0])).size!==all.length)throw new Error('Duplicate UK vehicle derivative');
  window.MotorTradeUKCatalogue=Object.freeze({CATALOGUE,VERIFIED,
    added:all.length,source:'SMMT Q3 2026 used-car model frequencies'});
})();
