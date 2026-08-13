// Türkiye plaka formatı doğrulama + hızlı marka/model seçimi için yardımcılar.
// Not: Gerçek zamanlı "plaka sorgu" (ruhsat bilgisi çekme) ücretli, resmi/üçüncü taraf bir
// API gerektirir (ör. e-Devlet entegrasyonu veya ticari bir "araç sorgulama" servisi).
// Bu modül, o entegrasyon eklenene kadar hatasız ve hızlı manuel giriş sağlar:
// plaka formatını anında doğrular, marka/model girişini yaygın seçeneklerle hızlandırır.

const PLATE_REGEX = /^(0[1-9]|[1-7][0-9]|8[01])[A-PR-VYZ]{1,3}\d{2,4}$/;

export interface PlateValidation {
  valid: boolean;
  normalized: string;
  message?: string;
}

export function validatePlate(raw: string): PlateValidation {
  const normalized = raw.toUpperCase().replace(/\s|-/g, "").trim();
  if (!normalized) {
    return { valid: false, normalized, message: "Plaka boş olamaz." };
  }
  if (!PLATE_REGEX.test(normalized)) {
    return {
      valid: false,
      normalized,
      message: "Geçerli bir Türkiye plakası girin (örn. 34ABC123).",
    };
  }
  return { valid: true, normalized };
}

// Panelde yazarken formu 34 ABC 123 gibi okunaklı biçimde gösterir.
export function formatPlateForDisplay(raw: string): string {
  const normalized = raw.toUpperCase().replace(/\s|-/g, "").trim();
  const match = normalized.match(/^(\d{2})([A-PR-VYZ]{1,3})(\d{2,4})$/);
  if (!match) return raw.toUpperCase();
  return `${match[1]} ${match[2]} ${match[3]}`;
}

// En yaygın markalar ve Türkiye pazarında sık görülen birkaç model — hızlı seçim içindir,
// listede olmayan marka/model serbest metin olarak da girilebilir.
export const TR_BRAND_MODELS: Record<string, string[]> = {
  Fiat: ["Egea", "Egea Cross", "Doblo", "Fiorino", "Linea", "Punto", "500"],
  Renault: ["Clio", "Megane", "Symbol", "Taliant", "Captur", "Kadjar", "Talisman"],
  Volkswagen: ["Passat", "Golf", "Polo", "Tiguan", "Jetta", "Caddy", "T-Roc"],
  Ford: ["Focus", "Fiesta", "Courier", "Kuga", "Puma", "Transit", "Mondeo"],
  Opel: ["Corsa", "Astra", "Insignia", "Mokka", "Combo", "Crossland"],
  Toyota: ["Corolla", "Yaris", "C-HR", "RAV4", "Hilux", "Auris"],
  Hyundai: ["i20", "i10", "Elantra", "Tucson", "Accent Blue", "Bayon"],
  Peugeot: ["208", "301", "308", "2008", "3008", "Partner"],
  Citroen: ["C3", "C-Elysee", "Berlingo", "C4 Cactus", "C4"],
  Dacia: ["Duster", "Sandero", "Logan", "Jogger"],
  "Mercedes-Benz": ["C Serisi", "E Serisi", "A Serisi", "Vito", "Sprinter", "GLA"],
  BMW: ["3 Serisi", "5 Serisi", "1 Serisi", "X1", "X3", "2 Serisi"],
  Audi: ["A3", "A4", "A6", "Q3", "Q5"],
  Skoda: ["Octavia", "Fabia", "Superb", "Kamiq", "Rapid"],
  Honda: ["Civic", "City", "CR-V", "Jazz"],
  Nissan: ["Qashqai", "Micra", "Juke", "X-Trail"],
  Kia: ["Ceed", "Rio", "Sportage", "Picanto", "Stonic"],
  Seat: ["Leon", "Ibiza", "Arona"],
  Suzuki: ["Vitara", "Swift", "S-Cross"],
  Mazda: ["Mazda3", "CX-5", "Mazda2"],
  Mitsubishi: ["Space Star", "ASX", "Outlander"],
  Jeep: ["Renegade", "Compass"],
  Tofaş: ["Şahin", "Doğan", "Kartal"],
  Diğer: [],
};

export const TR_BRANDS = Object.keys(TR_BRAND_MODELS);
