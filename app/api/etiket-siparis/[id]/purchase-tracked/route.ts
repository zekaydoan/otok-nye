import { NextRequest, NextResponse } from "next/server";
import { getCurrentShopId } from "@/lib/auth";
import { updateStickerOrder } from "@/lib/blobStore";

// Sonuç sayfası (bkz. components/PurchaseConversionPing.tsx) her mount
// olduğunda — ilk yüklemede de, F5/geri-ileri/aynı bağlantının tekrar
// açılmasında da — bu uca sorar: "bu sipariş için tarayıcıda Meta Pixel
// Purchase eventini BEN mi göndermeliyim?"
//
// Karar tamamen burada, sunucu tarafında verilir. StickerOrder.metaPurchaseTrackedAt
// alanı, updateStickerOrder'ın zaten kullandığı iyimser kilitleme (etag +
// onlyIfMatch, bkz. lib/blobStore.ts) ile ATOMİK olarak okunup yazılıyor —
// aynı sipariş için iki sekme veya art arda iki F5 aynı anda gelse bile
// yalnızca biri shouldTrack:true alır, çakışan diğer deneme(ler) yeniden
// okuyup "zaten işaretlenmiş" durumunu görür. localStorage/sessionStorage/
// cookie/React state KASITLI OLARAK kullanılmıyor — bunlar farklı cihaz,
// farklı tarayıcı veya önbellek/depolama temizleme durumlarında güvenilir
// değil; kalıcı tek gerçek kaynak veritabanındaki bu alan.
//
// Sıralama tercihi (trade-off): Bu uç nokta ÖNCE işaretler, İSTEMCİ SONRA
// fbq() çağırır (bkz. PurchaseConversionPing.tsx) — yani "duplicate göndermek"
// yerine "aşırı uçta, sekme bu satırdan hemen sonra kapatılırsa o tek
// conversion'ı kaçırmak" riski bilinçli olarak tercih edildi, çünkü asıl
// istenen reklam ölçümünün ÇİFT SAYILMAMASI. Bu son derece nadir kaçırma
// riski, ileride Conversions API eklendiğinde aynı event_id (`purchase_<id>`)
// ile app/api/etiket-siparis/callback/route.ts'ten sunucu tarafından ayrıca
// gönderilerek telafi edilebilir (Meta iki kaynağı otomatik tekilleştirir).
type PurchaseTrackOutcome = "tracked" | "already" | "not_paid" | "forbidden";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const shopId = await getCurrentShopId();
  if (!shopId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  // NOT: outcome, updateStickerOrder'a verilen callback (closure) içinde
  // güncelleniyor. Bunu düz bir `let` değişkeniyle yapmak TypeScript'in
  // `await` sonrası kontrol akışı analizinde değişkeni closure'dan önceki
  // (ilk) değerine dondurmasına yol açıyor — derleme zamanında "forbidden"
  // hiç ulaşılamaz görünüyor ve build TypeScript hatasıyla başarısız oluyor.
  // Bunun yerine bir nesne alanına yazmak bu narrowing sorununu ortadan
  // kaldırıyor (alan her zaman bildirilen birleşim tipiyle okunur).
  const state: { outcome: PurchaseTrackOutcome } = { outcome: "not_paid" };
  let value = 0;

  try {
    const updated = await updateStickerOrder(params.id, (order) => {
      if (order.shopId !== shopId) {
        state.outcome = "forbidden";
        return order;
      }
      if (order.status !== "odendi") {
        state.outcome = "not_paid";
        return order;
      }
      if (order.metaPurchaseTrackedAt) {
        state.outcome = "already";
        return order;
      }
      state.outcome = "tracked";
      return { ...order, metaPurchaseTrackedAt: new Date().toISOString() };
    });
    value = updated.totalPriceTry;
  } catch {
    return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
  }

  if (state.outcome === "forbidden") {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  }
  if (state.outcome === "tracked") {
    return NextResponse.json({ shouldTrack: true, value });
  }
  // "already" (bu sipariş için daha önce gönderilmiş) veya "not_paid" (henüz
  // ödeme onaylanmamış) — iki durumda da istemci Purchase göndermemeli.
  return NextResponse.json({ shouldTrack: false, alreadyTracked: state.outcome === "already" });
}
