import { createHash } from "crypto";
import type { ContractDocumentKey } from "./types";

// Kayıt anında kabul edilen sözleşme/politika metinlerinin güncel sürüm
// kimlikleri (bkz. hukuki/00_INDEKS_ve_RISK_ANALIZI.md ve canlı sayfaların
// başlığındaki "Yürürlük tarihi/Versiyon" satırı — app/kvkk, app/kullanim-
// sartlari, vb.). Bir belgenin canlı sitedeki içeriği maddi olarak
// değiştiğinde buradaki ilgili versiyon da güncellenmelidir; aksi hâlde eski
// bir onay kaydı, kabul edilmemiş güncel bir metne aitmiş gibi yanlış
// yorumlanabilir.
// 24 Ağustos 2026: saha_partner_sozlesmesi v1.1'e yükseltildi — "Kurucu
// Servis" kampanyası iptal edildiği için Madde 6 (Kurucu Servis Programı
// Bilgilendirmesi) kaldırıldı, sonraki maddeler yeniden numaralandırıldı
// (bkz. hukuki/09_Saha_Partner_Sozlesmesi.md ve app/saha-partner-sozlesmesi).
export const CONTRACT_VERSIONS: Record<ContractDocumentKey, string> = {
  saas_kullanim_sartlari: "v1.0-20260820",
  saha_partner_sozlesmesi: "v1.1-20260824",
  kvkk_aydinlatma: "v2.0-20260820",
  yurtdisi_veri_aktarimi: "v2.0-20260820",
  pazarlama_izni: "v1.0-20260820",
};

// Kayıt formunda gösterilecek onay kutucuklarının sırası ve zorunluluk
// bilgisi — hesap türüne göre AYRI: Kullanıcı (Bayi, /kayit) SaaS Sözleşmesi'ni
// onaylar, Saha Partneri (/partner-basvuru) Saha Partner Sözleşmesi'ni
// onaylar; KVKK, yurt dışı aktarım ve pazarlama izni her iki tarafta da aynı
// mantıkla uygulanır (pazarlama her zaman isteğe bağlı). Bkz.
// app/kayit/page.tsx ve app/partner-basvuru/page.tsx.
export const SHOP_CONTRACT_DOCUMENT_ORDER: { key: ContractDocumentKey; required: boolean }[] = [
  { key: "saas_kullanim_sartlari", required: true },
  { key: "kvkk_aydinlatma", required: true },
  { key: "yurtdisi_veri_aktarimi", required: true },
  { key: "pazarlama_izni", required: false },
];

export const PARTNER_CONTRACT_DOCUMENT_ORDER: { key: ContractDocumentKey; required: boolean }[] = [
  { key: "saha_partner_sozlesmesi", required: true },
  { key: "kvkk_aydinlatma", required: true },
  { key: "yurtdisi_veri_aktarimi", required: true },
  { key: "pazarlama_izni", required: false },
];

// Kabul edilen versiyonun sonradan inkâr edilememesi (non-repudiation) için
// bir bütünlük parmak izi üretir. ÖNEMLİ: Bu, ilgili sözleşme metninin
// byte-seviyesinde hash'i DEĞİLDİR — metinler JSX/Markdown olarak ayrı
// dosyalarda yaşadığından tek bir "canonical" metin string'i yoktur. Bunun
// yerine; belge anahtarı + o an yürürlükteki versiyon kimliği + onaylayan
// hesabın kimliği (email/telefon) + onay anının ISO zaman damgası birlikte
// hashlenir. Bu sayede bir onay kaydının sonradan (versiyon veya zaman
// değiştirilerek) değiştirilip değiştirilmediği, aynı girdilerle hash'in
// yeniden üretilip karşılaştırılmasıyla doğrulanabilir.
export function computeAcceptanceHash(params: {
  document: ContractDocumentKey;
  version: string;
  identifier: string;
  acceptedAt: string;
}): string {
  const canonical = `${params.document}|${params.version}|${params.identifier.toLowerCase().trim()}|${params.acceptedAt}`;
  return createHash("sha256").update(canonical).digest("hex");
}
