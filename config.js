// Şarj Bul V5.1 ayarları
window.SARJ_BUL_CONFIG = {
  OCM_API_KEY: "9dc1568b-d46c-47c0-b13a-651fb48559ee",
  DEFAULT_LAT: 40.8438,
  DEFAULT_LON: 31.1565,
  DISTANCE_KM: 50,
  MAX_RESULTS: 80,

  // Open Charge Map'te eksik kalan Türkiye istasyonları.
  // Bu liste sonraki aşamada Firebase admin panelinden yönetilecek.
  MANUAL_STATIONS: [
    {
      name: "ZES Krempark AVM",
      brand: "ZES",
      type: "DC",
      status: "Konum doğrulanacak",
      address: "Krempark AVM, Kültür Mah., İstanbul Cad., Düzce Merkez",
      distance: null,
      power: 0,
      lat: 40.840618,
      lon: 31.153017,
      sockets: "Soket bilgisi doğrulanacak",
      price: "Operatör uygulamasında",
      source: "manual"
    }
  ]
};
