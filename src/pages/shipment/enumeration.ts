export const barCodeSizeGroup = [
    { title: '30 UP Labels 1" X 2-5/8" on US Letter', width: '66.675', height: '25.4' },
    { title: '21-up labels 63.5mm x 38.1mm on A4', width: '63.5', height: '38.1' },
    { title: '24-up labels 63.5mm x 33.9mm on A4', width: '63.5', height: '33.9' },
    { title: '24-up labels 64.6mm x 33.8mm on A4', width: '64.6', height: '33.8' },
    { title: '24-up labels 66mm x 33.9mm on A4', width: '66', height: '33.9' },
    { title: '24-up labels 66mm x 35mm on A4', width: '66', height: '35' },
    { title: '24-up labels 70mm x 36mm on A4', width: '70', height: '36' },
    { title: '24-up labels 70mm x 37mm on A4', width: '70', height: '37' },
    { title: '24-up labels 70mm x 40mm on A4', width: '70', height: '40' },
    { title: '27-up labels 63.5mm x 29.6mm on A4', width: '63.5', height: '29.6' },
    { title: '40-up labels 52.5mm x 29.7mm on A4', width: '52.5', height: '29.7' },
    { title: '44-up labels 48.5mm x 25.4mm on A4', width: '48.5', height: '25.4' },
]

export const carrierNameGroup = [
    'DHL_EXPRESS_USA_INC',
    'FEDERAL_EXPRESS_CORP',
    'UNITED_STATES_POSTAL_SERVICE',
    'UNITED_PARCEL_SERVICE_INC',
    'Amazon partnered',
    'other',
]

export const pageType = [
    'PackageLabel_Letter_2',
    'PackageLabel_Letter_4',
    'PackageLabel_Letter_6',
    'PackageLabel_Letter_6_CarrierLeft',
    'PackageLabel_A4_2',
    'PackageLabel_A4_4',
    'PackageLabel_Plain_Paper',
    'PackageLabel_Plain_Paper_CarrierBottom',
    'PackageLabel_Thermal',
    'PackageLabel_Thermal_Unified',
    'PackageLabel_Thermal_NonPCP',
    'PackageLabel_Thermal_No_Carrier_Rotation',
];

export const labelType = ['BARCODE_2D', 'UNIQUE', 'PALLET'];

export const steps = [
    {
        title: 'CreateShipment',
        step: '1',
    },
    {
        title: 'PutCartonContents',
        step: '2',
    }
];

export const LabelPrepPreference = [
    "SELLER_LABEL",
    "AMAZON_LABEL_ONLY",
    "AMAZON_LABEL_PREFERRED"
]

export const PrepInstruction = [
    "Polybagging",
    "BubbleWrapping",
    "Taping",
    "BlackShrinkWrapping",
    "Labeling",
    "HangGarment"
]

export const PrepOwner = [
    "AMAZON",
    "SELLER"
]

export const shipToCountryCode = [
    {
        title: 'ShipToCountryCode values forNorth America',
        value: ["CA", "MX", "US"]
    },
    {
        title: 'ShipToCountryCode values forMCI sellers in Europe:',
        value: ["DE", "ES", "FR", "GB", "IT"]
    },
    {
        title: 'ShipToCountryCode values forMCI sellers in Oceania:',
        value: ["AU", "NZ"]
    },
    {
        title: 'ShipToCountryCode values forMCI sellers in Asia:',
        value: ["JP"]
    }
]