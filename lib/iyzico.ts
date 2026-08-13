import crypto from "crypto";

// iyzico Checkout Form (hosted ödeme sayfası) entegrasyonu — REST API'ye doğrudan
// fetch ile bağlanır (resmi Node SDK yerine), çünkü bu sandbox'ta npm install
// çalıştırılamıyor. Kimlik doğrulama, iyzico'nun IYZWSv2 HMAC-SHA256 şemasını
// kullanır: bkz. https://docs.iyzico.com/en/getting-started/preliminaries/authentication/hmacsha256-auth
//
// ÖNEMLİ: Bu dosya resmi dokümantasyona göre yazıldı ve derlenip statik olarak
// doğrulandı, ancak gerçek bir iyzico sandbox hesabıyla uçtan uca test edilmedi
// (bu ortamda iyzico'nun ağına erişim yok). Canlıya almadan önce IYZICO_API_KEY/
// IYZICO_SECRET_KEY sandbox anahtarlarıyla en az bir tam sipariş + ödeme + callback
// akışını test edin.

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} ortam değişkeni tanımlı değil.`);
  return value;
}

function getBaseUrl(): string {
  return process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com";
}

// randomKey + uriPath + requestBody dizgisinin HMACSHA256 imzasını üretir ve
// IYZWSv2 Authorization başlığını döner. bodyJson, fetch ile gönderilecek istek
// gövdesiyle bayt bayt aynı olmalıdır (imza, tam olarak gönderilen JSON metni
// üzerinden hesaplanır).
function buildAuthHeaders(uriPath: string, bodyJson: string): Record<string, string> {
  const apiKey = requireEnv("IYZICO_API_KEY");
  const secretKey = requireEnv("IYZICO_SECRET_KEY");
  const randomKey = `${Date.now()}${crypto.randomInt(100_000_000, 999_999_999)}`;

  const payload = randomKey + uriPath + bodyJson;
  const encryptedData = crypto.createHmac("sha256", secretKey).update(payload, "utf-8").digest("hex");

  const authorizationString = `apiKey:${apiKey}&randomKey:${randomKey}&signature:${encryptedData}`;
  const base64EncodedAuthorization = Buffer.from(authorizationString, "utf-8").toString("base64");

  return {
    Authorization: `IYZWSv2 ${base64EncodedAuthorization}`,
    "x-iyzi-rnd": randomKey,
    "Content-Type": "application/json",
  };
}

export interface CFBuyer {
  id: string;
  name: string;
  surname: string;
  identityNumber: string; // T.C. Kimlik No — iyzico'nun zorunlu tuttuğu alan
  email: string;
  gsmNumber: string;
  registrationAddress: string;
  city: string;
  country: string;
  zipCode?: string;
  ip: string;
}

export interface CFAddress {
  address: string;
  zipCode?: string;
  contactName: string;
  city: string;
  country: string;
}

export interface CFBasketItem {
  id: string;
  price: string; // ondalık, nokta ayraçlı metin (ör. "290.00")
  name: string;
  category1: string;
  itemType: "PHYSICAL" | "VIRTUAL";
}

export interface CFInitializeParams {
  conversationId: string;
  price: string;
  paidPrice: string;
  callbackUrl: string;
  buyer: CFBuyer;
  shippingAddress: CFAddress;
  billingAddress: CFAddress;
  basketItems: CFBasketItem[];
  basketId?: string;
}

export interface CFInitializeResult {
  status: "success" | "failure";
  token?: string;
  paymentPageUrl?: string;
  checkoutFormContent?: string;
  errorMessage?: string;
}

const CF_INITIALIZE_PATH = "/payment/iyzipos/checkoutform/initialize/auth/ecom";
const CF_RETRIEVE_PATH = "/payment/iyzipos/checkoutform/auth/ecom/detail";

export async function initializeCheckoutForm(params: CFInitializeParams): Promise<CFInitializeResult> {
  const body = {
    locale: "tr",
    conversationId: params.conversationId,
    price: params.price,
    paidPrice: params.paidPrice,
    currency: "TRY",
    basketId: params.basketId,
    paymentGroup: "PRODUCT",
    callbackUrl: params.callbackUrl,
    buyer: params.buyer,
    shippingAddress: params.shippingAddress,
    billingAddress: params.billingAddress,
    basketItems: params.basketItems,
  };
  const bodyJson = JSON.stringify(body);
  const headers = buildAuthHeaders(CF_INITIALIZE_PATH, bodyJson);

  const res = await fetch(`${getBaseUrl()}${CF_INITIALIZE_PATH}`, {
    method: "POST",
    headers,
    body: bodyJson,
  });
  const data = await res.json();

  return {
    status: data.status === "success" ? "success" : "failure",
    token: data.token,
    paymentPageUrl: data.paymentPageUrl,
    checkoutFormContent: data.checkoutFormContent,
    errorMessage: data.errorMessage,
  };
}

export interface CFRetrieveResult {
  status: "success" | "failure";
  paymentStatus?: string; // "SUCCESS" | "FAILURE"
  paymentId?: string;
  conversationId?: string;
  price?: number;
  paidPrice?: number;
  errorMessage?: string;
}

export async function retrieveCheckoutForm(
  token: string,
  conversationId: string
): Promise<CFRetrieveResult> {
  const body = { locale: "tr", conversationId, token };
  const bodyJson = JSON.stringify(body);
  const headers = buildAuthHeaders(CF_RETRIEVE_PATH, bodyJson);

  const res = await fetch(`${getBaseUrl()}${CF_RETRIEVE_PATH}`, {
    method: "POST",
    headers,
    body: bodyJson,
  });
  const data = await res.json();

  return {
    status: data.status === "success" ? "success" : "failure",
    paymentStatus: data.paymentStatus,
    paymentId: data.paymentId ? String(data.paymentId) : undefined,
    conversationId: data.conversationId,
    price: data.price !== undefined ? Number(data.price) : undefined,
    paidPrice: data.paidPrice !== undefined ? Number(data.paidPrice) : undefined,
    errorMessage: data.errorMessage,
  };
}
