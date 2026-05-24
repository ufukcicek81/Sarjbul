// Şarj Bul V4 ayarları
window.SARJ_BUL_CONFIG = {
  OCM_API_KEY: "9dc1568b-d46c-47c0-b13a-651fb48559ee",
  DEFAULT_LAT: 40.8438,
  DEFAULT_LON: 31.1565,
  DISTANCE_KM: 50,
  MAX_RESULTS: 80,

  // Open Charge Map'te eksik kalan Türkiye istasyonlarını buraya ekliyoruz.
  // Sonraki aşamada bu liste Firebase admin panelinden yönetilecek.
  MANUAL_STATIONS: [
    {
      name: "ZES Düzce Merkez",
      brand: "ZES",
      type: "DC",
      status: "Manuel kayıt",
      address: "Düzce Merkez",
      distance: null,
      power: 150,
      lat: 40.8438,
      lon: 31.1565,
      sockets: "CCS2 / Type 2",
      price: "Operatör fiyatını kontrol et",
      source: "manual"
    }
  ]
};
