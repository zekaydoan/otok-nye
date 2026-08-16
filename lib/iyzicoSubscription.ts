import crypto from "crypto";
import { buildAuthHeaders, getBaseUrl, requireEnv } from "./iyzico";

// iyzico Abonelik (Subscription) API — otomatik tekrarlayan tahsilat.
// AYRI bir üründür (lib/iyzico.ts'teki tek seferlik Checkout Form'dan farklı,
// hesapta ayrıca aktive edilmesi ve ücretli bir eklenti olarak satın alınması
// gerekiyor — bkz. SIRKET_KURULUSU_SONRASI_YAPILACAKLAR.md madde 1).
//
// ÖNEMLİ — DÜRÜSTLÜK NOTU: Bu dosya docs.iyzico.com'daki resmi API referansına
// (Abonelik Ürünü / Ödeme Planı / Abonelik Başlatma / Webhook sayfaları, Ağustos
// 2026) göre yazıldı, ancak gerçek bir iyzico hesabında Abonelik özelliği henüz
// aktive edilmediğinden UÇTAN UCA TEST EDİLMEDİ. Özellikle GET isteklerinin
// (retrieveSubscriptionCheckoutFormResult) imza hesaplaması — path parametresi
// + query string'in imzaya nasıl dahil olduğu — dokümantasyonda net bir örnekle
// gösterilmemişti, en olası yorum uygulandı. Zeki entegrasyon@iyzico.com'dan
// sandbox'ta Abonelik özelliğini aktive ettirdikten sonra, canlıya almadan önce
// bu dosyadaki her fonksiyon gerçek sandbox anahtarlarıyla tek tek test edilmeli.

const SUBSCRIPTION_PRODUCTS_PATH = "/v2/subscription/products";
const SUBSCRIPTION_CHECKOUT_INITIALIZE_PATH = "/v2/subscription/checkoutform/initialize";

// ---------- Ürün ----------

export interface SubscriptionProductResult {
  status: "success" | "failure";
  referenceCode?: string;
  errorMessage?: string;
}

// Bir kez oluşturulup tekrar kullanılır — OtoHafıza için tek bir "OtoHafıza
// Abonelik" ürünü yeterli, her plan (Pro/İşletme/İşletme Yıllık) buna bağlı
// ayrı bir "ödeme planı" olarak tanımlanır (bkz. createPricingPlan).
export async function createSubscriptionProduct(
  name: string,
  description?: string
): Promise<SubscriptionProductResult> {
  const body = { locale: "tr", name, description };
  const bodyJson = JSON.stringify(body);
  const headers = buildAuthHeaders(SUBSCRIPTION_PRODUCTS_PATH, bodyJson);

  const res = await fetch(`${getBaseUrl()}${SUBSCRIPTION_PRODUCTS_PATH}`, {
    method: "POST",
    headers,
    body: bodyJson,
  });
  const data = await res.json();

  return {
    status: data.status === "success" ? "success" : "failure",
    referenceCode: data.data?.referenceCode,
    errorMessage: data.errorMessage,
  };
}

// ---------- Ödeme Planı ----------

export type PaymentInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export interface CreatePricingPlanParams {
  productReferenceCode: string;
  name: string;
  /** Ondalık, nokta ayraçlı metin (ör. "299.00") — lib/iyzico.ts'teki basketItem.price ile aynı kural. */
  price: string;
  paymentInterval: PaymentInterval;
  paymentIntervalCount?: number;
  /** Belirtilmezse abonelik iptal edilene kadar süresiz devam eder. */
  recurrenceCount?: number;
  /** Gün cinsinden ücretsiz deneme süresi — bu süre boyunca karttan hiç tahsilat yapılmaz. */
  trialPeriodDays?: number;
}

export interface PricingPlanResult {
  status: "success" | "failure";
  referenceCode?: string;
  errorMessage?: string;
}

export async function createPricingPlan(
  params: CreatePricingPlanParams
): Promise<PricingPlanResult> {
  const path = `${SUBSCRIPTION_PRODUCTS_PATH}/${params.productReferenceCode}/pricing-plans`;
  const body = {
    locale: "tr",
    name: params.name,
    price: params.price,
    currencyCode: "TRY",
    paymentInterval: params.paymentInterval,
    paymentIntervalCount: params.paymentIntervalCount,
    planPaymentType: "RECURRING",
    recurrenceCount: params.recurrenceCount,
    trialPeriodDays: params.trialPeriodDays,
  };
  const bodyJson = JSON.stringify(body);
  const headers = buildAuthHeaders(path, bodyJson);

  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers,
    body: bodyJson,
  });
  const data = await res.json();

  return {
    status: data.status === "success" ? "success" : "failure",
    referenceCode: data.data?.referenceCode,
    errorMessage: data.errorMessage,
  };
}

// ---------- Abonelik Başlatma (Checkout Form) ----------

export interface SubscriptionBillingAddress {
  address: string;
  contactName: string;
  city: string;
  country: string; // ör. "Turkey"
  zipCode?: string;
}

export interface SubscriptionCustomer {
  name: string;
  surname: string;
  email: string;
  /** +90'lı formatta gönderilmeli (ör. "+905551112233"). */
  gsmNumber: string;
  /** T.C. Kimlik No — iyzico'nun zorunlu tuttuğu alan. */
  identityNumber: string;
  billingAddress: SubscriptionBillingAddress;
}

export interface InitializeSubscriptionParams {
  pricingPlanReferenceCode: string;
  callbackUrl: string;
  customer: SubscriptionCustomer;
  conversationId: string;
  /** PENDING gönderilirse abonelik hemen başlamaz, elle aktive edilmesi gerekir. Varsayılan: ACTIVE. */
  subscriptionInitialStatus?: "ACTIVE" | "PENDING";
}

export interface InitializeSubscriptionResult {
  status: "success" | "failure";
  token?: string;
  checkoutFormContent?: string;
  tokenExpireTime?: number;
  errorMessage?: string;
}

export async function initializeSubscriptionCheckoutForm(
  params: InitializeSubscriptionParams
): Promise<InitializeSubscriptionResult> {
  const body = {
    locale: "tr",
    conversationId: params.conversationId,
    callbackUrl: params.callbackUrl,
    pricingPlanReferenceCode: params.pricingPlanReferenceCode,
    subscriptionInitialStatus: params.subscriptionInitialStatus ?? "ACTIVE",
    customer: params.customer,
  };
  const bodyJson = JSON.stringify(body);
  const headers = buildAuthHeaders(SUBSCRIPTION_CHECKOUT_INITIALIZE_PATH, bodyJson);

  const res = await fetch(`${getBaseUrl()}${SUBSCRIPTION_CHECKOUT_INITIALIZE_PATH}`, {
    method: "POST",
    headers,
    body: bodyJson,
  });
  const data = await res.json();

  return {
    status: data.status === "success" ? "success" : "failure",
    token: data.token,
    checkoutFormContent: data.checkoutFormContent,
    tokenExpireTime: data.tokenExpireTime,
    errorMessage: data.errorMessage,
  };
}

// ---------- Abonelik Başlatma Sonucu (GET — bkz. dosya başındaki dürüstlük notu) ----------

export interface SubscriptionResultData {
  referenceCode?: string;
  customerReferenceCode?: string;
  subscriptionStatus?: "ACTIVE" | "PENDING";
  pricingPlanReferenceCode?: string;
  trialDays?: number;
  startDate?: number;
  endDate?: number;
}

export interface RetrieveSubscriptionResult {
  status: "success" | "failure";
  data?: SubscriptionResultData;
  errorMessage?: string;
}

// DİKKAT: Bu bir GET isteğidir ve gövdesi yoktur. iyzico'nun genel HMAC şemasına
// göre (bkz. docs.iyzico.com "HMACSHA256 Kimlik Doğrulama") istek gövdesi boşsa
// imza yalnızca randomKey+uriPath üzerinden hesaplanır. buildAuthHeaders'a ""
// (boş string) gönderiyoruz — payload = randomKey+uriPath+"" zaten
// randomKey+uriPath'e eşit olduğundan bu doğru sonucu verir (bkz. lib/iyzico.ts).
// Path parametresi olan token'ın imzaya tam olarak hangi biçimde (query string
// dahil/hariç) dahil edilmesi gerektiği dokümantasyonda örneklenmemişti —
// sandbox erişimi olmadan doğrulanamadı.
export async function retrieveSubscriptionCheckoutFormResult(
  token: string
): Promise<RetrieveSubscriptionResult> {
  const path = `/v2/subscription/checkoutform/${token}`;
  const headers = buildAuthHeaders(path, "");

  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: "GET",
    headers,
  });
  const data = await res.json();

  return {
    status: data.status === "success" ? "success" : "failure",
    data: data.data,
    errorMessage: data.errorMessage,
  };
}

// ---------- Webhook Doğrulama ----------

export interface SubscriptionWebhookPayload {
  orderReferenceCode: string;
  customerReferenceCode: string;
  subscriptionReferenceCode: string;
  iyziReferenceCode: string;
  iyziEventType: "subscription.order.success" | "subscription.order.failure" | string;
  iyziEventTime: number;
}

// Webhook'un gerçekten iyzico'dan geldiğini doğrular — bkz. docs.iyzico.com/
// ek-servisler/webhook "Abonelik Bildirimlerinin Doğrulanması". Sıralama
// ÖNEMLİ: merchantId + secretKey + eventType + subscriptionReferenceCode +
// orderReferenceCode + customerReferenceCode, HMAC-SHA256, hex.
// IYZICO_MERCHANT_ID .env.example'a eklendi (iyzico merchant panelinden alınır).
// Webhook signature özelliğinin hesapta aktif olması gerekiyor (aynı
// entegrasyon@iyzico.com talebiyle, Abonelik özelliğiyle birlikte istenebilir).
export function verifySubscriptionWebhookSignature(
  payload: SubscriptionWebhookPayload,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) return false;
  const merchantId = requireEnv("IYZICO_MERCHANT_ID");
  const secretKey = requireEnv("IYZICO_SECRET_KEY");

  const message =
    merchantId +
    secretKey +
    payload.iyziEventType +
    payload.subscriptionReferenceCode +
    payload.orderReferenceCode +
    payload.customerReferenceCode;

  const expected = crypto.createHmac("sha256", secretKey).update(message, "utf-8").digest("hex");

  // Zamanlama saldırılarına karşı sabit-zamanlı karşılaştırma.
  const expectedBuf = Buffer.from(expected, "hex");
  const receivedBuf = Buffer.from(signatureHeader, "hex");
  if (expectedBuf.length !== receivedBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, receivedBuf);
}
