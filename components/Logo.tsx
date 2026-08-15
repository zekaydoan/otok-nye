import { BrandMark } from "@/components/icons";

// Uygulama genelinde kullanılan tek marka rozeti bileşeni. Tek yerden
// güncellenebilsin diye her sayfadaki tekrarlanan rozet markup'ı buraya
// taşındı. Jenerik "OK" baş harf kutusu yerine yağ damlası + onay işareti
// birleşimi olan BrandMark ikonunu kullanır — ürünün ne yaptığını (yağ bakım
// kaydı) rakip bir "harf logosu"ndan daha net anlatır.
export default function Logo({
  withText = false,
  size = "md",
}: {
  withText?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const badgeClass =
    size === "sm" ? "h-7 w-7" : size === "lg" ? "h-11 w-11" : "h-8 w-8";
  const iconClass =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";
  const textClass = size === "lg" ? "text-2xl font-extrabold" : "font-bold";

  return (
    <span className="inline-flex shrink-0 items-center gap-2">
      <span
        className={`flex ${badgeClass} items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm`}
      >
        <BrandMark className={iconClass} />
      </span>
      {withText && <span className={`${textClass} text-brand-700`}>OtoHafıza</span>}
    </span>
  );
}
