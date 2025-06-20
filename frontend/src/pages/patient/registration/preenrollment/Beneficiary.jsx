import { useState } from "react";

const barangayData = {
  // Cebu City barangays
  cebu_city: [
    "Adlaon",
    "Agsungot",
    "Apas",
    "Babag",
    "Bacayan",
    "Banilad",
    "Basak Pardo",
    "Basak San Nicolas",
    "Binaliw",
    "Bonbon",
    "Budlaan",
    "Buhisan",
    "Bulacao",
    "Buot",
    "Busay",
    "Calamba",
    "Cambinocot",
    "Capitol Site",
    "Carreta",
    "Cogon Pardo",
    "Day-as",
    "Duljo Fatima",
    "Ermita",
    "Guadalupe",
    "Guba",
    "Hipodromo",
    "Inayawan",
    "Kalubihan",
    "Kamagayan",
    "Kamputhaw",
    "Kasambagan",
    "Kinasang-an",
    "Labangon",
    "Lahug",
    "Lorega San Miguel",
    "Lusaran",
    "Luz",
    "Mabini",
    "Mabolo",
    "Malubog",
    "Mambaling",
    "Pahina Central",
    "Pahina San Nicolas",
    "Parian",
    "Paril",
    "Pasil",
    "Poblacion Pardo",
    "Pulangbato",
    "Pung-ol Sibugay",
    "Quiot",
    "Saba",
    "Sambag I",
    "Sambag II",
    "San Antonio",
    "San Jose",
    "San Nicolas Proper",
    "San Roque",
    "Santa Cruz",
    "Santo Niño",
    "Sapangdaku",
    "Sawang Calero",
    "Sinsin",
    "Sirao",
    "Suba",
    "Sudlon I",
    "Sudlon II",
    "T. Padilla",
    "Tabunan",
    "Tagba-o",
    "Talamban",
    "Taptap",
    "Tejero",
    "Tinago",
    "Tisa",
    "To-ong",
    "Zapatera",
  ],

  // Mandaue City barangays
  mandaue: [
    "Alang-alang",
    "Bakilid",
    "Banilad",
    "Basak",
    "Cabancalan",
    "Cambaro",
    "Canduman",
    "Casili",
    "Casuntingan",
    "Centro",
    "Cubacub",
    "Guizo",
    "Ibabao-Estancia",
    "Jagobiao",
    "Labogon",
    "Looc",
    "Maguikay",
    "Mantuyong",
    "Opao",
    "Pagsabungan",
    "Pakna-an",
    "Subangdaku",
    "Tabok",
    "Tingub",
    "Tipolo",
    "Umapad",
  ],

  // Lapu-Lapu City barangays
  lapu_lapu: [
    "Agus",
    "Babag",
    "Bankal",
    "Baring",
    "Basak",
    "Buaya",
    "Calawisan",
    "Canjulao",
    "Caubian",
    "Cawhagan",
    "Caw-oy",
    "Dapdap",
    "Gun-ob",
    "Ibo",
    "Looc",
    "Mactan",
    "Maribago",
    "Marigondon",
    "Opon",
    "Pajac",
    "Pajo",
    "Poblacion",
    "Pangan-an",
    "Pusok",
    "Sabang",
    "San Vicente",
    "Santa Rosa",
    "Subabasbas",
    "Talima",
    "Tingo",
  ],

  // Talisay City barangays
  talisay: [
    "Biasong",
    "Bulacao",
    "Cansojong",
    "Dumlog",
    "Jaclupan",
    "Lagtang",
    "Lawaan I",
    "Lawaan II",
    "Lawaan III",
    "Linao",
    "Maghaway",
    "Manipis",
    "Mohon",
    "Poblacion",
    "Pooc",
    "San Isidro",
    "San Roque",
    "Tabunok",
    "Tangke",
    "Tapul",
  ],

  // Danao City barangays
  danao: [
    "Baliang",
    "Cabancalan",
    "Cahumayan",
    "Cawit",
    "Cogon Cruz",
    "Dungga",
    "Guinsay",
    "Guinacot",
    "Ibo",
    "Langub",
    "Lawaan",
    "Looc",
    "Mabini",
    "Masaba",
    "Masbate",
    "Nagado",
    "Oguis",
    "Poblacion",
    "Sabang",
    "Suba",
    "Taboc",
    "Togonon",
  ],

  // Toledo City barangays
  toledo: [
    "Awihao",
    "Ibo",
    "Bato",
    "Buaya",
    "Bulongan",
    "Cabitoonan",
    "Calongcalong",
    "Cambang-ug",
    "Canayon",
    "Cantabaco",
    "Capitan Claudio",
    "Carmen",
    "Daanglungsod",
    "Don Andres Soriano",
    "Dumlog",
    "Gen. Climaco",
    "Ilihan",
    "Landahan",
    "Loay",
    "Luray I",
    "Luray II",
    "Matab-ang",
    "Media Once",
    "Poblacion",
    "Poog",
    "Putingbato",
    "Sagay",
    "Sam Pedro",
    "San Antonio",
    "San Isidro",
    "San Jose",
    "San Juan",
    "San Rafael",
    "Sangi",
    "Santo Niño",
    "Subayon",
    "Talavera",
    "Tubod",
  ],

  // Carcar City barangays
  carcar: [
    "Bolinawan",
    "Calidngan",
    "Can-asujan",
    "Guadalupe",
    "Liburon",
    "Napo",
    "Ocaña",
    "Perrelos",
    "Poblacion I",
    "Poblacion II",
    "Poblacion III",
    "Tuyom",
    "Valladolid",
    "Valencia",
  ],

  // Naga City barangays
  naga: [
    "Alpaco",
    "Bairan",
    "Balirong",
    "Cabungahan",
    "Cantao-an",
    "Central Poblacion",
    "Cogon",
    "Colon",
    "East Poblacion",
    "Inayagan",
    "Inoburan",
    "Jaguimit",
    "Langtad",
    "Lanas",
    "Lutac",
    "Mainit",
    "Mayana",
    "Naalad",
    "North Poblacion",
    "Pangdan",
    "Patag",
    "South Poblacion",
    "Tagjaguimit",
    "Tangke",
    "Tinaan",
    "Tuyan",
    "Uling",
    "West Poblacion",
  ],

  // Bogo City barangays
  bogo: [
    "Anonang Norte",
    "Anonang Sur",
    "Banban",
    "Binabag",
    "Bungtod",
    "Carbon",
    "Cayang",
    "Cogon",
    "Dakit",
    "Don Pedro Rodriguez",
    "Gairan",
    "Guadalupe",
    "La Paz",
    "Libertad",
    "Lourdes",
    "Malingin",
    "Marangog",
    "Nailon",
    "Odlot",
    "Pandan",
    "Polambato",
    "Sambag",
    "San Vicente",
    "Taytayan",
    "Guadalupe",
  ],

  // Argao barangays
  argao: [
    "Anajao",
    "Apo",
    "Balisong",
    "Binlod",
    "Bogo",
    "Bulasa",
    "Butong",
    "Calagasan",
    "Cambugui",
    "Canbanua",
    "Canbantug",
    "Candabong",
    "Cansumalig",
    "Capio-an",
    "Casay",
    "Catang",
    "Colawin",
    "Conalum",
    "Guiwanon",
    "Gutlang",
    "Jampang",
    "Jomgao",
    "Langtad",
    "Lamacan",
    "Lengigon",
    "Linut-od",
    "Mabasa",
    "Macaas",
    "Mandilikit",
    "Mompeller",
    "Naghalin",
    "Panadtaran",
    "Poblacion",
    "Sabang",
    "Sua",
    "Sumaguan",
    "Tabayag",
    "Talaga",
    "Talo-ot",
    "Tiguib",
    "Tulang",
    "Tulic",
    "Ubaub",
    "Usmad",
  ],

  // Badian barangays
  badian: [
    "Alawijao",
    "Balhaan",
    "Basak",
    "Basiao",
    "Bato",
    "Buguil",
    "Calangcang",
    "Candiis",
    "Dobdob",
    "Ginablan",
    "Lambug",
    "Malhiao",
    "Matutinao",
    "Poblacion",
    "Santicon",
    "Sohoton",
    "Sulsugan",
    "Taytay",
    "Tigbao",
    "Zaragosa",
  ],

  // Balamban barangays
  balamban: [
    "Abucayan",
    "Aliwanay",
    "Binongkalan",
    "Buanoy",
    "Cabagdalan",
    "Cabasiangan",
    "Cantibas",
    "Cansomoroy",
    "Duangan",
    "Ginatilan",
    "Hingatmonan",
    "Lamesa",
    "Lamin",
    "Matun-og",
    "Nangka",
    "Prenza",
    "Singsing",
    "Sunog",
    "Talungon",
    "Triumfo",
    "Vito",
  ],

  // Bantayan barangays
  bantayan: [
    "Atop-atop",
    "Baigad",
    "Binaobao",
    "Botigues",
    "Guiwanon",
    "Hilotongan",
    "Kabac",
    "Kabangbang",
    "Kampingganon",
    "Kang-actol",
    "Kangkaibe",
    "Labad",
    "Lipayran",
    "Luyongbaybay",
    "Mojon",
    "Obo-ob",
    "Patao",
    "Poblacion",
    "Sangat",
    "Suba",
    "Sungko",
    "Tamiao",
  ],

  // Barili barangays
  barili: [
    "Azucena",
    "Bagakay",
    "Balingasag",
    "Balucating",
    "Bare",
    "Bolocboloc",
    "Budbud",
    "Bugnay",
    "Cagay",
    "Calaboon",
    "Campangga",
    "Candugay",
    "Dakit",
    "Giloctog",
    "Guibuangan",
    "Gunting",
    "Hipodromo",
    "Japitan",
    "Kangdampas",
    "Kabadiangan",
    "Lupo",
    "Luhod",
    "Maantil",
    "Malonogon",
    "Mantalongon",
    "Mantayupan",
    "Minolos",
    "Nabunturan",
    "Nasipit",
    "Paril",
    "Patupat",
    "Poblacion",
    "Pangpang",
    "Sabado",
    "Santa Ana",
    "Santa Lucia",
    "Tal-ot",
    "Tuy-anan",
    "Vito",
  ],

  // Consolacion barangays
  consolacion: [
    "Cabangahan",
    "Cansaga",
    "Danglag",
    "Jugan",
    "Lamac",
    "Lanipga",
    "Nangka",
    "Panas",
    "Panoypoy",
    "Pitogo",
    "Poblacion Occidental",
    "Poblacion Oriental",
    "Pulpogan",
    "Sacsac",
    "Tayud",
    "Tilhaong",
    "Tolotolo",
    "Tugbongan",
  ],

  // Cordova barangays
  cordova: [
    "Alegria",
    "Bangbang",
    "Buagsong",
    "Catarman",
    "Cogon",
    "Dapitan",
    "Day-as",
    "Gabi",
    "Gilutongan",
    "Ibabao",
    "Pilipog",
    "Poblacion",
    "San Miguel",
  ],

  // Dalaguete barangays
  dalaguete: [
    "Ablayan",
    "Babayongan",
    "Balud",
    "Banhigan",
    "Bulak",
    "Caliongan",
    "Caleriohan",
    "Casay",
    "Catolohan",
    "Cawayan",
    "Coro",
    "Consolacion",
    "Dugyan",
    "Dumalan",
    "Jolomaynon",
    "Lanao",
    "Langkas",
    "Lumbang",
    "Maloray",
    "Mananggal",
    "Manlapay",
    "Obong",
    "Obo",
    "Panas",
    "Poblacion",
    "Salug",
    "Sacsac",
    "Tabon",
    "Tapul",
    "Tuba",
    "Tuyom",
  ],

  // Liloan barangays
  liloan: [
    "Cabadiangan",
    "Calero",
    "Catarman",
    "Cogon",
    "Cotcot",
    "Jubay",
    "Lataban",
    "Mulao",
    "Poblacion",
    "San Roque",
    "San Vicente",
    "Santo Niño",
    "Tayud",
    "Yati",
  ],

  // Minglanilla barangays
  minglanilla: [
    "Calajoan",
    "Camp 7",
    "Camp 8",
    "Cuanos",
    "Guindaruhan",
    "Linao",
    "Manduang",
    "Pakigne",
    "Poblacion Ward I",
    "Poblacion Ward II",
    "Poblacion Ward III",
    "Poblacion Ward IV",
    "Tubod",
    "Tulay",
    "Tungkil",
    "Tungkop",
    "Vito",
  ],

  // Moalboal barangays
  moalboal: [
    "Agbalanga",
    "Bala",
    "Balabagon",
    "Basdiot",
    "Bugtong",
    "Busay",
    "Lanao",
    "Poblacion East",
    "Poblacion West",
    "Saavedra",
    "Tomonoy",
    "Tuble",
    "Tunga",
    "Tupas",
  ],

  // Oslob barangays
  oslob: [
    "Alo",
    "Bangcogon",
    "Bonbon",
    "Calumpang",
    "Can-ukban",
    "Cañang",
    "Cansalo",
    "Daanlungsod",
    "Hagdan",
    "Lagunde",
    "Looc",
    "Luka",
    "Mainit",
    "Malabuyoc",
    "Montpeller",
    "Nueva Caceres",
    "Poblacion",
    "Pungtod",
    "Taong",
    "Tan-awan",
    "Tumalog",
  ],

  // Tagbilaran City barangays
  tagbilaran: [
    "Bool",
    "Booy",
    "Cabawan",
    "Cogon",
    "Dampas",
    "Dao",
    "Manga",
    "Mansasa",
    "Poblacion I",
    "Poblacion II",
    "Poblacion III",
    "San Isidro",
    "Taloto",
    "Tiptip",
    "Ubujan",
  ],

  // Panglao barangays
  panglao: [
    "Bil-isan",
    "Bolod",
    "Danao",
    "Daulungan",
    "Doljo",
    "Libaong",
    "Looc",
    "Lourdes",
    "Poblacion",
    "Tangnan",
    "Tawala",
  ],

  // Tubigon barangays
  tubigon: [
    "Pinayagan Norte",
    "Pinayagan Sur",
    "Pooc Occidental",
    "Pooc Oriental",
    "Potohan",
    "Bunacan",
    "Cahayag",
    "Cabulihan",
    "Centro",
    "Geronimo",
    "Imelda",
    "Guiwanon",
    "Inaghuban",
    "Maca-as",
    "Panadtaran",
    "Panaytayon",
    "Sikatuna",
    "Ubos Cabawan",
    "Ubojan",
    "Ilihan Norte",
    "Ilihan Sur",
  ],

  // Jagna barangays
  jagna: [
    "Alejawan",
    "Balili",
    "Boctol",
    "Bunga Ilaya",
    "Bunga Mar",
    "Buyog",
    "Cabunga-an",
    "Calabacita",
    "Cambugason",
    "Can-ipol",
    "Can-uba",
    "Canjulao",
    "Cantuyoc",
    "Cantagay",
    "Ipil",
    "Kinagbaan",
    "Laca",
    "Larapan",
    "Lonoy",
    "Looc",
    "Malbog",
    "Naatang",
    "Nausok",
    "Odiong",
    "Pagina",
    "Pangdan",
    "Poblacion",
    "Tejero",
    "Tubod Mar",
    "Tubod Monte",
  ],

  // Anda barangays
  anda: [
    "Bacong",
    "Bad-as",
    "Buenasuerte",
    "Candabong",
    "Casica",
    "Katipunan",
    "Linawan",
    "Lundag",
    "Poblacion",
    "Santa Cruz",
    "Suba",
    "Talisay",
    "Tawid",
    "Virgen",
    "Ubos",
  ],
};

export default function PatinetProfileForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dob: "",
    age: "",
    sex: "",
    civilStatus: "",
    children: 0,
    permanentAddress: "",
    cityMunicipality: "",
    barangay: "",
    contactNumber: "",
    email: "",
    informationSource: "",
    otherPrograms: "",
    education: "",
    occupation: "",
    incomeSource: "",
    income: "",
    emergencyContact1: {
      name: "",
      address: "",
      relationship: "",
      email: "",
      landline: "",
      phone: "",
    },
    emergencyContact2: {
      name: "",
      address: "",
      relationship: "",
      email: "",
      landline: "",
      phone: "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "cityMunicipality") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        barangay: "", // Reset barangay when city changes
      }));
    } else if (name.startsWith("emergencyContact1.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        emergencyContact1: {
          ...prev.emergencyContact1,
          [field]: value,
        },
      }));
    } else if (name.startsWith("emergencyContact2.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        emergencyContact2: {
          ...prev.emergencyContact2,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "children" ? parseInt(value) || 0 : value,
      }));
    }
  };

  const getBarangays = () => {
    if (!formData.cityMunicipality) return [];
    return barangayData[formData.cityMunicipality] || [];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  return (
    <div
      id="step1_page"
      className="h-screen w-[75%] flex flex-col gap-12 bg-[var(--color-gray)] py-12 px-12 overflow-auto"
    >
      <div className="w-full flex justify-between px-9">
        <h1 className="font-bold text-2xl">Patient Profile</h1>
        <div className="flex text-right flex-col">
          <p className="text-sm">STEP 01/02</p>
          <h1 className="font-bold text-[var(--color-black)]">General Data</h1>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-9 flex flex-col gap-10 rounded-2xl"
      >
        <h1 className="font-bold text-2xl">Patient Name</h1>
        <div className="grid grid-cols-2 gap-x-10 gap-y-5">
          <div className="flex gap-2 flex-col">
            <label className=" text-gray2 ">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="border-[var(--color-black)] border-[1px] rounded-md p-2"
            />
          </div>

          <div className="flex gap-2 flex-col">
            <label className="">Middle Name</label>
            <input
              type="text"
              name="middleName"
              value={formData.middleName}
              onChange={handleChange}
              className="border-[var(--color-black)] border-[1px] rounded-md p-2"
            />
          </div>

          <div className="flex gap-2 flex-col">
            <label className="">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="border-[var(--color-black)] border-[1px] rounded-md p-2"
            />
          </div>

          <div className="flex gap-2 flex-col">
            <label className="">Date of Birth</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <img
                  src="/src/assets/images/input_icons/datebirth.svg"
                  alt="Date of Birth Icon"
                />
              </div>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="bg-white border border-[var(--color-black)] text-[var(--color-black)] text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full pl-10 p-2.5"
                placeholder="Select date"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-col">
            <label className="">Age</label>
            <input
              type="text"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="border-[var(--color-black)] border-[1px] rounded-md p-2"
            />
          </div>

          <div className="flex gap-2 flex-col">
            <label className="">Sex</label>
            <div className="relative">
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
                className="border-[var(--color-black)] w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8"
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-black)]">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-col">
            <label className="">Civil Status</label>
            <div className="relative">
              <select
                name="civilStatus"
                value={formData.civilStatus}
                onChange={handleChange}
                className="border-[var(--color-black)] w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8"
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="single">Single</option>
                <option value="cohabitation">Co-Habitation</option>
                <option value="separated">Separated</option>
                <option value="widow">Widow/er</option>
                <option value="married">Married</option>
                <option value="annulled">Annulled</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-black)]">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-col">
            <label className="">Number of Children</label>
            <input
              id="children-input"
              type="number"
              name="children"
              value={formData.children}
              onChange={handleChange}
              className="border-[var(--color-black)] border-[1px] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              min="0"
            />
          </div>
        </div>

        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <h1 className="font-bold text-2xl">Contact & Address</h1>
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              <div className="flex gap-2 flex-col col-span-2">
                <label className="">Permanent Address (Number & Street)</label>
                <input
                  type="text"
                  name="permanentAddress"
                  value={formData.permanentAddress}
                  onChange={handleChange}
                  className="border-[var(--color-black)] border-[1px] rounded-md p-2"
                />
              </div>

              <div className="flex gap-2 flex-col">
                <label className="">City/Municipality</label>
                <div className="relative">
                  <select
                    name="cityMunicipality"
                    value={formData.cityMunicipality}
                    onChange={handleChange}
                    className="border-[var(--color-black)] w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8"
                  >
                    <option value="" disabled>
                      Select City/Municipality
                    </option>
                    {Object.keys(barangayData).map((city) => (
                      <option key={city} value={city}>
                        {city
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-black)]">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-col">
                <label className="">Barangay</label>
                <div className="relative">
                  <select
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleChange}
                    className="border-[var(--color-black)] w-full border-[1px] rounded-md p-2 bg-white appearance-none pr-8"
                    disabled={!formData.cityMunicipality}
                  >
                    <option value="">
                      {formData.cityMunicipality
                        ? "Select Barangay"
                        : "Select City first"}
                    </option>
                    {getBarangays().map((barangay) => (
                      <option key={barangay} value={barangay}>
                        {barangay}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--color-black)]">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-col">
                <label className="text-[var(--color-black)]">
                  Landline Number/Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <img
                      src="/src/assets/images/input_icons/telephone.svg"
                      alt="Telephone Icon"
                    />
                  </div>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="bg-white border border-[var(--color-black)] text-[var(--color-black)] text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full pl-10 p-2.5"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-col">
                <label className="">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <img
                      src="/src/assets/images/input_icons/email.svg"
                      alt="Email Icon"
                    />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-white border border-[var(--color-black)] text-[var(--color-black)] text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full pl-10 p-2.5"
                    placeholder="ejacc@gmail.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h1 className="font-bold text-2xl">Additional Info</h1>
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              <div className="flex gap-2 flex-col col-span-2">
                <label className="">
                  Source of Information (Where did you hear about RAFI-EJACC?):
                </label>
                <textarea
                  name="informationSource"
                  value={formData.informationSource}
                  onChange={handleChange}
                  className="border-[var(--color-black)] border-[1px] rounded-md p-2 h-36 w-[60%] resize-none"
                />
              </div>

              <div className="flex gap-2 flex-col col-span-2">
                <label className="">Other RAFI programs you availed:</label>
                <textarea
                  name="otherPrograms"
                  value={formData.otherPrograms}
                  onChange={handleChange}
                  className="border-[var(--color-black)] border-[1px] rounded-md p-2 h-36 w-[60%] resize-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h1 className="font-bold text-2xl">Socioeconomic Info</h1>
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              <div className="flex gap-2 flex-col">
                <label className="">Highest Educational Attainment</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education}
                  onChange={handleChange}
                  className="border-[var(--color-black)] border-[1px] rounded-md p-2"
                />
              </div>

              <div className="flex gap-2 flex-col">
                <label className="">Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="border-[var(--color-black)] border-[1px] rounded-md p-2"
                />
              </div>

              <div className="flex gap-2 flex-col">
                <label className="">Source of Income</label>
                <input
                  type="text"
                  name="incomeSource"
                  value={formData.incomeSource}
                  onChange={handleChange}
                  className="border-[var(--color-black)] border-[1px] rounded-md p-2"
                />
              </div>

              <div className="flex gap-2 flex-col">
                <label className="">Income</label>
                <input
                  type="text"
                  name="income"
                  value={formData.income}
                  onChange={handleChange}
                  className="border-[var(--color-black)] border-[1px] rounded-md p-2"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h1 className="font-bold text-2xl">Emergency Contact 1</h1>
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              <div className="flex gap-2 flex-col">
                <label className="">Name</label>
                <input
                  type="text"
                  name="emergencyContact1.name"
                  value={formData.emergencyContact1.name}
                  onChange={handleChange}
                  className="border-[var(--color-black)] border-[1px] rounded-md p-2"
                />
              </div>

              <div className="flex gap-2 flex-col">
                <label className="">Address</label>
                <input
                  type="text"
                  name="emergencyContact1.address"
                  value={formData.emergencyContact1.address}
                  onChange={handleChange}
                  className="border-[var(--color-black)] border-[1px] rounded-md p-2"
                />
              </div>

              <div className="flex gap-2 flex-col">
                <label className="">Relationship to Patient</label>
                <input
                  type="text"
                  name="emergencyContact1.relationship"
                  value={formData.emergencyContact1.relationship}
                  onChange={handleChange}
                  className="border-[var(--color-black)] border-[1px] rounded-md p-2"
                />
              </div>

              <div className="flex gap-2 flex-col">
                <label className="">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <img
                      src="/src/assets/images/input_icons/email.svg"
                      alt="Email Icon"
                    />
                  </div>
                  <input
                    type="email"
                    name="emergencyContact1.email"
                    value={formData.emergencyContact1.email}
                    onChange={handleChange}
                    className="bg-white border border-[var(--color-black)] text-[var(--color-black)] text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full pl-10 p-2.5"
                    placeholder="ejacc@gmail.com"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-col">
                <label className="text-[var(--color-black)]">
                  Landline Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <img
                      src="/src/assets/images/input_icons/telephone.svg"
                      alt="Telephone Icon"
                    />
                  </div>
                  <input
                    type="tel"
                    name="emergencyContact1.landline"
                    value={formData.emergencyContact1.landline}
                    onChange={handleChange}
                    className="bg-white border border-[var(--color-black)] text-[var(--color-black)] text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full pl-10 p-2.5"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-col">
                <label className="text-[var(--color-black)]">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <img
                      src="/src/assets/images/input_icons/mobile.svg"
                      alt="Mobile Icon"
                    />
                  </div>
                  <input
                    type="tel"
                    name="emergencyContact1.phone"
                    value={formData.emergencyContact1.phone}
                    onChange={handleChange}
                    className="bg-white border border-[var(--color-black)] text-[var(--color-black)] text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full pl-10 p-2.5"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h1 className="font-bold text-2xl">Emergency Contact 2</h1>
            <div className="grid grid-cols-2 gap-x-10 gap-y-5">
              <div className="flex gap-2 flex-col">
                <label className="">Name</label>
                <input
                  type="text"
                  name="emergencyContact2.name"
                  value={formData.emergencyContact2.name}
                  onChange={handleChange}
                  className="border-[var(--color-black)] border-[1px] rounded-md p-2"
                />
              </div>

              <div className="flex gap-2 flex-col">
                <label className="">Address</label>
                <input
                  type="text"
                  name="emergencyContact2.address"
                  value={formData.emergencyContact2.address}
                  onChange={handleChange}
                  className="border-[var(--color-black)] border-[1px] rounded-md p-2"
                />
              </div>

              <div className="flex gap-2 flex-col">
                <label className="">Relationship to Patient</label>
                <input
                  type="text"
                  name="emergencyContact2.relationship"
                  value={formData.emergencyContact2.relationship}
                  onChange={handleChange}
                  className="border-[var(--color-black)] border-[1px] rounded-md p-2"
                />
              </div>

              <div className="flex gap-2 flex-col">
                <label className="">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <img
                      src="/src/assets/images/input_icons/email.svg"
                      alt="Email Icon"
                    />
                  </div>
                  <input
                    type="email"
                    name="emergencyContact2.email"
                    value={formData.emergencyContact2.email}
                    onChange={handleChange}
                    className="bg-white border border-[var(--color-black)] text-[var(--color-black)] text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full pl-10 p-2.5"
                    placeholder="ejacc@gmail.com"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-col">
                <label className="text-[var(--color-black)]">
                  Landline Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <img
                      src="/src/assets/images/input_icons/telephone.svg"
                      alt="Telephone Icon"
                    />
                  </div>
                  <input
                    type="tel"
                    name="emergencyContact2.landline"
                    value={formData.emergencyContact2.landline}
                    onChange={handleChange}
                    className="bg-white border border-[var(--color-black)] text-[var(--color-black)] text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full pl-10 p-2.5"
                  />
                </div>
              </div>

              <div className="flex gap-2 flex-col">
                <label className="text-[var(--color-black)]">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <img
                      src="/src/assets/images/input_icons/mobile.svg"
                      alt="Date of Birth Icon"
                    />
                  </div>
                  <input
                    type="tel"
                    name="emergencyContact2.phone"
                    value={formData.emergencyContact2.phone}
                    onChange={handleChange}
                    className="bg-white border border-[var(--color-black)] text-[var(--color-black)] text-sm rounded-lg focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] block w-full pl-10 p-2.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end w-full mt-10">
          <button
            type="submit"
            className="text-center font-bold bg-[var(--color-primary)] text-white py-2 w-[45%] border-[1px] border-[var(--color-primary)] hover:border-[var(--color-lightblue)] hover:bg-[var(--color-lightblue)] rounded-md"
          >
            SUBMIT
          </button>
        </div>
      </form>
    </div>
  );
}
