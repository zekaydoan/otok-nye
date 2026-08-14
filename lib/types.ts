export type Plan = "free" | "pro" | "business" | "business_yillik";

export interface FavoriteOil {
  brand: string;
  model: string;
}

export interface Shop {
  id: string;
  name: string; // Firma / tamirci adı
  email: string;
  passwordHash: string;
  phone: string;
  plan: Plan;
  favoriteOils?: FavoriteOil[]; // bakım formunda tek tıkla seçim için
  createdAt: string;
}

export interface PublicShop {
  id: string;
  name: string;
  phone: string;
  plan: Plan;
}

// ---------- Çoklu çalışan hesabı ----------
// Bir dükkanda birden fazla usta panele erişebilsin diye Shop'un (hesap sahibi)
// yanına bağımsız giriş bilgileriyle çalışan hesapları eklenebilir. Çalışan
// hesapları kendi e-posta/şifresiyle giriş yapar ama tüm verileri (araçlar,
// kayıtlar, randevular) hesap sahibiyle aynı shopId altında görür/düzenler —
// aradaki tek fark yetki: yalnızca "sahibi" rolü ekip yönetimi, plan/fatura ve
// firma bilgisi/şifre değişikliği yapabilir (bkz. lib/auth.ts SessionInfo,
// app/api/staff, app/dashboard/ayarlar).
export type StaffRole = "sahibi" | "calisan";

export interface StaffAccount {
  id: string;
  shopId: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  plate: string; // normalize edilmiş plaka (34ABC123)
  plateDisplay: string; // görünen plaka (34 ABC 123)
  brand: string;
  model: string;
  year?: string;
  ownerName?: string;
  ownerPhone?: string;
  reportToken?: string; // paylaşılabilir satış raporu bağlantısı için
  // Aracın bilinen en güncel kilometresi — bir bakım kaydı eklenirken kayıttaki km
  // otomatik olarak buraya yazılır (bkz. blobStore.createOilRecord), ayrıca araç
  // detay sayfasından tam bakım girmeden de elle güncellenebilir (bkz.
  // components/VehicleKmUpdate). Km bazlı bakım hatırlatması (bkz.
  // listUpcomingServicesForShop) bu değeri, son kaydın nextServiceKm hedefiyle
  // karşılaştırarak hesaplanır.
  lastKnownKm?: number;
  lastKnownKmUpdatedAt?: string; // ISO
  createdByShopId: string;
  createdAt: string;
}

export interface OilRecord {
  id: string;
  vehicleId: string;
  shopId: string;
  shopName: string;
  shopPhone?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  oilBrand: string;
  oilModel: string;
  quantityKg: number;
  km?: number;
  filterChanged: boolean;
  note?: string;
  nextServiceDate?: string; // YYYY-MM-DD — sonraki bakım için hatırlatma tarihi
  nextServiceKm?: number;
  hasBeforePhoto?: boolean;
  hasAfterPhoto?: boolean;
  createdAt: string;
}

export const PLAN_LIMITS: Record<
  Plan,
  {
    maxVehicles: number;
    maxStaff: number;
    label: string;
    price: string;
    /** Fatura döngüsünü kısaca belirtir (ör. "/ay", "/yıl") — fiyat kartlarında price'ın yanında gösterilir. */
    period: string;
    /** Kampanya rozeti (ör. "2 Ay Ücretsiz") — sadece bazı planlarda gösterilir. */
    badge?: string;
  }
> = {
  free: { maxVehicles: 15, maxStaff: 1, label: "Ücretsiz", price: "0₺", period: "/ay" },
  pro: { maxVehicles: 250, maxStaff: 5, label: "Pro", price: "499₺", period: "/ay" },
  business: {
    maxVehicles: Infinity,
    maxStaff: Infinity,
    label: "İşletme",
    price: "999₺",
    period: "/ay",
  },
  business_yillik: {
    maxVehicles: Infinity,
    maxStaff: Infinity,
    label: "İşletme (Yıllık)",
    price: "9.990₺",
    period: "/yıl",
    badge: "2 Ay Ücretsiz",
  },
};

// ---------- Randevu ----------
// Ustanın günlük iş listesini planlayabilmesi için basit bir randevu kaydı.
// Sisteme henüz kayıtlı olmayan bir araç için de randevu girilebilsin diye
// vehicleId zorunlu tutulmadı — plaka yalnızca serbest metin olarak saklanır.
// Randevu, bir Vehicle kaydına otomatik/kalıcı olarak bağlanmaz; bakım kaydı
// eklendiğinde ilişki zaten doğal olarak (plaka üzerinden) kurulmuş olur.
export type AppointmentStatus = "bekliyor" | "geldi" | "iptal";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  bekliyor: "Bekleniyor",
  geldi: "Geldi",
  iptal: "İptal",
};

export interface Appointment {
  id: string;
  shopId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  plateDisplay?: string;
  customerName?: string;
  customerPhone?: string;
  note?: string;
  status: AppointmentStatus;
  createdAt: string;
  // Müşteri, WhatsApp hatırlatmasındaki "Evet, randevu oluşturalım" butonuna
  // bastığında sistem tarafından otomatik oluşturulan randevuları elle
  // eklenenlerden ayırt etmek için (bkz. app/api/whatsapp/webhook). Alan
  // tanımsızsa "manuel" kabul edilir — geriye dönük uyumluluk için varsayılan
  // eklenmedi.
  source?: "manuel" | "whatsapp_onay";
  // Bayi panelinde header'daki Randevular rozetinin sayısını hesaplamak için:
  // WhatsApp onayıyla gelen bir randevu, bayi Randevular sayfasını ziyaret
  // edene kadar "yeni" sayılır (bkz. blobStore.markWhatsappAppointmentsSeen).
  seenByShop?: boolean;
}

// ---------- Etiket Mağazası (fiziksel QR etiket siparişi) ----------
// Bayiler panelden dayanıklı, profesyonel basılmış QR etiketi sipariş edip iyzico
// üzerinden ödeme yapabilir. Kargo takibi otomasyonu yok — sipariş durumu
// admin panelinden elle güncellenir (bkz. app/admin/siparisler).
export type StickerOrderStatus =
  | "odeme_bekleniyor" // ödeme başlatıldı, henüz onaylanmadı
  | "odendi" // ödeme onaylandı, üretime alınmayı bekliyor
  | "hazirlaniyor" // admin üretime aldı
  | "kargoda"
  | "teslim_edildi"
  | "odeme_basarisiz"
  | "iptal";

export const STICKER_ORDER_STATUS_LABELS: Record<StickerOrderStatus, string> = {
  odeme_bekleniyor: "Ödeme Bekleniyor",
  odendi: "Ödendi",
  hazirlaniyor: "Hazırlanıyor",
  kargoda: "Kargoda",
  teslim_edildi: "Teslim Edildi",
  odeme_basarisiz: "Ödeme Başarısız",
  iptal: "İptal Edildi",
};

export interface StickerOrderAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  district: string;
  city: string;
  postalCode?: string;
}

export interface StickerOrder {
  id: string;
  shopId: string;
  shopName: string;
  quantity: number;
  unitPriceTry: number;
  totalPriceTry: number;
  status: StickerOrderStatus;
  shippingAddress: StickerOrderAddress;
  contractAcceptedAt: string; // Mesafeli Satış Sözleşmesi onay zamanı
  paymentToken?: string; // iyzico Checkout Form token
  paymentId?: string; // iyzico ödeme onaylandıktan sonra dönen ödeme kimliği
  trackingCarrier?: string;
  trackingNumber?: string;
  adminNote?: string;
  // Etikette basılı görünecek isim/telefon — genelde bayi adı/telefonuyla aynıdır
  // ama sipariş formunda değiştirilebilir (ör. belirli bir ustanın adı/telefonu).
  labelName?: string;
  labelPhone?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------- Etiket Token (fiziksel etiketin üzerindeki benzersiz QR kimliği) ----------
// Sipariş anında hangi aracın plakasının basılacağı bilinmediğinden (etiketler önceden
// toplu üretilip bayiye gönderilir, sonra zamanla farklı araçlara tek tek yapıştırılır),
// her fiziksel etiket plakasız, yalnızca kendine özel bir "token" ile basılır. Bayi
// etiketi bir araca yapıştırıp ilk kez okuttuğunda (bkz. app/e/[token]) token o araca
// kalıcı olarak bağlanır; sonraki okutmalarda doğrudan o aracın sayfasına yönlendirir.
export interface StickerToken {
  token: string;
  shopId: string;
  orderId: string;
  vehicleId?: string;
  createdAt: string;
  boundAt?: string;
}

// ---------- Öneri / Geri Bildirim ----------
// Bayilerin panelden doğrudan OtoHafıza ekibine özellik önerisi ya da geri
// bildirim gönderebildiği basit bir kutu — "sizinle birlikte gelişiyoruz"
// yaklaşımının somut karşılığı. Admin panelinden okundu/okunmadı olarak
// işaretlenebilir; bayiye otomatik bir yanıt gönderilmez (bkz.
// app/dashboard/oneriler, app/admin/oneriler).
export type SuggestionStatus = "yeni" | "okundu";

export const SUGGESTION_STATUS_LABELS: Record<SuggestionStatus, string> = {
  yeni: "Yeni",
  okundu: "Okundu",
};

export interface Suggestion {
  id: string;
  shopId: string;
  shopName: string;
  authorName?: string; // gönderen bir çalışan hesabıysa adı (bkz. StaffAccount)
  message: string;
  status: SuggestionStatus;
  createdAt: string;
}
