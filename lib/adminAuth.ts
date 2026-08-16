import { getCurrentShopId } from "./auth";
import { getShopById } from "./blobStore";

// Platform yöneticiliği ayrı bir kullanıcı rolü olarak modellenmedi — bunun yerine
// ADMIN_EMAILS ortam değişkeninde tanımlı e-posta adresleriyle eşleşen oturum
// sahipleri yönetici sayılır (virgülle ayrılmış liste). Bu, tek/az sayıda kişinin
// etiket siparişlerini yönettiği erken aşama için yeterlidir; ölçek büyürse
// Shop.isAdmin gibi kalıcı bir alana taşınabilir.
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

// Giriş yapmış kullanıcı yöneticiyse shopId'sini, değilse null döner. Admin sayfaları
// ve API uçları bu fonksiyonun null dönmediğini kontrol ederek erişimi kısıtlar.
export async function getCurrentAdminShopId(): Promise<string | null> {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return null;

  const shopId = await getCurrentShopId();
  if (!shopId) return null;

  const shop = await getShopById(shopId);
  if (!shop) return null;

  return adminEmails.includes(shop.email.toLowerCase()) ? shopId : null;
}

// Audit log kayıtlarında (bkz. lib/blobStore.ts recordAdminAuditLog) "kim
// yaptı" sorusuna cevap vermek için adminin kendi e-postasını döner. Ayrı bir
// fonksiyon olmasının nedeni: çoğu admin route zaten getCurrentAdminShopId ile
// yetki kontrolü yapıyor, oradan tekrar shop nesnesini çekmek yerine ihtiyaç
// duyulan tek yerde (audit log yazarken) bu kullanılır.
export async function getCurrentAdminEmail(): Promise<string | null> {
  const shopId = await getCurrentShopId();
  if (!shopId) return null;
  const shop = await getShopById(shopId);
  if (!shop) return null;
  return getAdminEmails().includes(shop.email.toLowerCase()) ? shop.email : null;
}
