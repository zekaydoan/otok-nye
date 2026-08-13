export type Plan = "free" | "pro" | "business";

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

export const PLAN_LIMITS: Record<Plan, { maxVehicles: number; label: string; price: string }> = {
  free: { maxVehicles: 15, label: "Ücretsiz", price: "0₺/ay" },
  pro: { maxVehicles: 250, label: "Pro", price: "349₺/ay" },
  business: { maxVehicles: Infinity, label: "İşletme", price: "899₺/ay" },
};

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
