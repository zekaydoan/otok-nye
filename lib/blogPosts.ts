// OtoHafıza Blog — içerik veri katmanı.
//
// Neden CMS/markdown değil de düz TypeScript verisi? Sitede henüz bir içerik
// yönetim sistemi yok ve blog hacmi (birkaç makale) bunu gerektirmiyor. Her
// makale, sırayla render edilen tipli "blok" dizisinden oluşuyor (bkz.
// BlogBlock) — bu, ham HTML string'i + dangerouslySetInnerHTML kullanmaktan
// (XSS riski, biçimlendirme tutarsızlığı) daha güvenli ve tip-denetimli.
//
// Konu seçimi rastgele değil: her başlık, potansiyel müşterilerin (oto
// tamirciler/bayiler VE araç sahipleri) Google'da gerçekten arattığı, ürünle
// doğrudan ilgili sorgulara karşılık geliyor (bkz. araştırma: "yağ değişimi
// kaç km", "oto servis programı", "QR kod araç bakım", "araç bakım
// hatırlatma", "ikinci el araç bakım geçmişi" gibi terimler gerçek arama
// hacmine sahip). Amaç hem organik trafik çekmek hem de OtoHafıza'yı doğal bir
// çözüm olarak konumlandırmak — anahtar kelime doldurmacası değil, gerçek
// soruları eksiksiz yanıtlayan içerik.

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "quote"; text: string }
  | { type: "cta"; text: string; href: string; label: string };

export interface BlogPost {
  slug: string;
  title: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  publishedAt: string; // YYYY-MM-DD
  updatedAt?: string; // YYYY-MM-DD
  readingMinutes: number;
  keywords: string[];
  content: BlogBlock[];
  relatedSlugs: string[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "yag-degisimi-kac-kilometrede-yapilmali",
    title: "Yağ Değişimi Kaç Kilometrede Yapılmalı? 2026 Güncel Rehber",
    metaDescription:
      "Motor yağı değişim aralığı sentetik, yarı sentetik ve mineral yağa göre kaç km'dir? Yağ değişimini geciktirmenin motora verdiği zararı ve takip yöntemlerini anlatıyoruz.",
    excerpt:
      "Sentetik, yarı sentetik ve mineral yağda değişim aralıkları birbirinden çok farklı. Doğru periyodu ve bunu unutmadan nasıl takip edeceğinizi anlatıyoruz.",
    category: "Bakım Rehberi",
    publishedAt: "2026-07-18",
    readingMinutes: 5,
    keywords: [
      "yağ değişimi kaç km",
      "motor yağı ne zaman değiştirilir",
      "yağ değişim periyodu",
      "sentetik yağ değişim aralığı",
    ],
    relatedSlugs: [
      "qr-kodlu-arac-bakim-defteri-nedir-nasil-calisir",
      "oto-servis-otomatik-bakim-hatirlatma-rehberi",
    ],
    content: [
      {
        type: "p",
        text: "\"Yağ değişimi kaç kilometrede yapılmalı?\" sorusunun tek bir doğru cevabı yok — kullandığınız yağ türüne, aracın motoruna ve sürüş alışkanlıklarınıza göre değişiyor. Bu yazıda hem genel aralıkları hem de bu tarihi hiç kaçırmadan takip etmenin pratik yollarını anlatıyoruz.",
      },
      { type: "h2", text: "Yağ türüne göre değişim aralıkları" },
      {
        type: "p",
        text: "Aracınızın kullanım kılavuzu her zaman son sözü söyler, ama piyasadaki genel uygulama şu şekilde özetlenebilir:",
      },
      {
        type: "ul",
        items: [
          "Mineral yağ: 5.000 – 8.000 km arası değişim önerilir. En düşük maliyetli ama en sık değişim gerektiren seçenek.",
          "Yarı sentetik yağ: Genellikle 8.000 – 10.000 km aralığında değişim yeterlidir.",
          "Tam sentetik yağ: Çoğu üretici 10.000 – 15.000 km aralığını tolere eder; bazı modern motorlarda bu süre daha da uzayabilir.",
          "Dizel motorlar: Yakıt sistemi ve turbo yükü nedeniyle genellikle 7.500 – 10.000 km aralığı önerilir.",
        ],
      },
      {
        type: "p",
        text: "Bu rakamlar ortalama koşullar içindir. Sık sık kısa mesafe kullanım, trafik-yoğun şehir içi sürüş, ağır yük taşıma veya çok sıcak/soğuk iklim koşulları yağın daha hızlı yıpranmasına yol açar — bu durumda aralığı %20-30 kısaltmak mantıklıdır.",
      },
      { type: "h2", text: "Km yerine süreye göre de bakmak gerekir" },
      {
        type: "p",
        text: "Az kullanılan bir araçta km sınırına asla ulaşılmasa bile yağ zamanla nem ve oksitlenme nedeniyle özelliğini kaybeder. Bu yüzden çoğu üretici, hangisi önce gelirse kuralını uygular: örneğin \"10.000 km veya 12 ay, hangisi önce dolarsa.\" Yılda 5.000 km bile yapmayan bir araç sahibiyseniz, yağı yine de yılda bir kez değiştirmeniz önerilir.",
      },
      { type: "h2", text: "Yağ değişimini geciktirmenin bedeli" },
      {
        type: "p",
        text: "Geciken yağ değişimi kısa vadede fark edilmez ama motor için birikimli bir hasar anlamına gelir: yağlama özelliğini kaybeden yağ, sürtünmeyi artırır, motor içindeki çamurlaşma (sludge) riskini yükseltir ve uzun vadede yakıt tüketiminden turbo/motor revizyonuna kadar maliyeti katlanarak büyüten sorunlara yol açabilir. Bir yağ değişiminin maliyeti, ihmal edilmiş bir motor tamiratının yanında oldukça küçük kalır.",
      },
      { type: "h2", text: "Yağ değişim tarihini nasıl unutmadan takip edersiniz?" },
      {
        type: "p",
        text: "Sorunun büyük kısmı aslında \"ne zaman\" bilgisinin doğruluğunda değil, bu bilgiyi hatırlamakta yaşanıyor. Kağıt bakım defterleri kaybolur, elle tutulan notlar aracın el değiştirmesiyle birlikte kaybolur, \"bir dahaki sefere hatırlarım\" düşüncesi genelde işe yaramaz.",
      },
      {
        type: "p",
        text: "OtoHafıza gibi QR kodlu bir dijital bakım defteri kullanan bir oto servise yağınızı değiştirttiğinizde, her kayıt otomatik olarak tarihi ve bir sonraki değişim hedefini (tarih ve km olarak) saklar. Aracınıza yapıştırılan küçük bir QR etiketi okutularak tüm geçmiş görülebilir; servis de sisteme kayıtlıysa hedef tarih/km yaklaştığında size otomatik WhatsApp hatırlatması gönderilir.",
      },
      {
        type: "cta",
        text: "Oto tamirciyseniz, müşterilerinize bu hatırlatmayı otomatik göndermek işinizi büyütmenin en kolay yollarından biri.",
        href: "/kayit",
        label: "OtoHafıza'yı ücretsiz deneyin",
      },
      { type: "h2", text: "Özetle" },
      {
        type: "p",
        text: "Yağ değişim aralığı için en doğru kaynak her zaman aracınızın kullanım kılavuzu ve yetkili/güvendiğiniz servisinizdir. Genel kural olarak sentetik yağda 10.000-15.000 km, mineral yağda 5.000-8.000 km aralığını hedefleyebilir, ağır kullanım koşullarında bu süreyi kısaltabilirsiniz. En önemlisi ise bu tarihi bir yere yazıp unutmamak — dijital bir sistemle bu artık sizin hatırlamanızı gerektirmiyor.",
      },
    ],
  },
  {
    slug: "oto-tamirciler-icin-dijital-bakim-takip-sistemi",
    title: "Oto Tamirciler İçin Dijital Bakım Takip Sistemi: Kağıt Deftere Neden Artık Gerek Yok",
    metaDescription:
      "Oto servis programı ararken nelere dikkat etmeli? QR kodlu dijital bakım takip sisteminin kağıt deftere göre avantajlarını ve müşteri sadakatine etkisini anlatıyoruz.",
    excerpt:
      "Kağıt defterde kaybolan kayıtlar, unutulan hatırlatmalar, okunaksız notlar... Dijital bir oto servis takip sistemi bu sorunları nasıl çözüyor?",
    category: "Oto Servis İşletmeciliği",
    publishedAt: "2026-07-25",
    readingMinutes: 6,
    keywords: [
      "oto servis programı",
      "oto tamirci yazılımı",
      "araç bakım takip programı",
      "dijital servis fişi",
    ],
    relatedSlugs: [
      "qr-kodlu-arac-bakim-defteri-nedir-nasil-calisir",
      "oto-servis-otomatik-bakim-hatirlatma-rehberi",
    ],
    content: [
      {
        type: "p",
        text: "Türkiye'de oto tamircilerin büyük bir kısmı hâlâ müşteri ve araç bilgilerini kağıt bir deftere ya da en fazla bir Excel tablosuna yazıyor. Bu yöntem küçük bir işletme için başlangıçta \"yeterli\" görünse de, müşteri sayısı arttıkça ciddi bir maliyete dönüşüyor: kaybolan kayıtlar, okunaksız el yazısı, unutulan bakım hatırlatmaları ve müşteriye \"geçen sefer ne yaptırmıştım\" sorusuna hızlı cevap verememe.",
      },
      { type: "h2", text: "Kağıt defterin gerçek maliyeti" },
      {
        type: "ul",
        items: [
          "Bir müşterinin geçmiş kaydını bulmak dakikalar sürer, bazen hiç bulunamaz.",
          "Defter kaybolursa (yangın, su, kaybolma) yıllara dayanan tüm geçmiş silinir.",
          "Bir sonraki bakım tarihini takip etmek tamamen ustanın hafızasına bağlıdır.",
          "Müşteriye \"araç geçmişi\" konusunda somut, profesyonel bir kanıt gösterilemez.",
          "Birden fazla çalışan aynı deftere yazınca tutarsızlık ve çakışma olur.",
        ],
      },
      {
        type: "p",
        text: "Bunların hiçbiri kötü niyetten kaynaklanmıyor — basitçe, kağıt bir sistemin ölçeklenme sınırı bu. İşletme büyüdükçe bu sınır daha hızlı görünür hale geliyor.",
      },
      { type: "h2", text: "Dijital bir bakım takip sisteminde neler değişir" },
      {
        type: "p",
        text: "İyi bir oto servis programı, kağıt defterin yaptığı her şeyi yapar ama üç ekstra avantaj sağlar: otomasyon, erişilebilirlik ve profesyonel görünüm.",
      },
      { type: "h3", text: "1. Her araç kendi dijital geçmişine sahip olur" },
      {
        type: "p",
        text: "Plaka ile arama yaparak veya araca yapıştırılmış bir QR etiketi okutarak, o aracın bugüne kadarki tüm yağ/bakım geçmişine saniyeler içinde ulaşılır. Yeni bir usta işe başladığında bile önceki kayıtları görebilir.",
      },
      { type: "h3", text: "2. Bakım hatırlatmaları otomatikleşir" },
      {
        type: "p",
        text: "Sistem, bir sonraki bakım tarihi veya kilometresi yaklaşan araçları otomatik listeler; WhatsApp üzerinden tek tıkla (ya da tamamen otomatik) hatırlatma gönderilir. Bu, hem müşteri memnuniyetini artırır hem de aracın tekrar sizin servisinize gelme ihtimalini yükseltir — dijital sistemin en somut ciro etkisi burada ortaya çıkar.",
      },
      { type: "h3", text: "3. Profesyonel bir izlenim bırakır" },
      {
        type: "p",
        text: "Motor kaputuna yapıştırılan, firma adı ve telefonu basılı bir QR etiketi hem markanızı her açılışta müşterinin gözüne sokar hem de \"bu servis işini kayıt altına alıyor, güvenilir\" hissi verir. Bu detay özellikle ikinci el satışta aracın bakımlı olduğunu kanıtlamak isteyen müşteriler için değerli.",
      },
      { type: "h2", text: "Oto servis programı seçerken nelere bakmalı" },
      {
        type: "ul",
        items: [
          "Kurulum kolaylığı: Yazılım kurmadan, tarayıcı üzerinden anında kullanılabiliyor mu?",
          "QR/plaka bazlı hızlı erişim: Kayıt aramak dakikalar değil saniyeler mi sürüyor?",
          "Otomatik hatırlatma: WhatsApp veya SMS ile otomatik bakım hatırlatması var mı?",
          "Çoklu çalışan desteği: Birden fazla usta aynı anda, kendi girişiyle çalışabiliyor mu?",
          "Ücretsiz başlangıç: Küçük bir işletme için gerçekten ücretsiz bir giriş seviyesi var mı?",
        ],
      },
      {
        type: "p",
        text: "OtoHafıza, tam olarak bu ihtiyaçlar için tasarlandı: her araca özel QR etiket, otomatik WhatsApp bakım hatırlatması, çoklu çalışan hesabı ve 15 araca kadar tamamen ücretsiz bir başlangıç planı.",
      },
      {
        type: "cta",
        text: "Kağıt deftere veda etmek için kredi kartı gerekmeden hemen başlayabilirsiniz.",
        href: "/kayit",
        label: "Ücretsiz Hesap Aç",
      },
    ],
  },
  {
    slug: "qr-kodlu-arac-bakim-defteri-nedir-nasil-calisir",
    title: "QR Kodlu Araç Bakım Defteri Nedir, Nasıl Çalışır?",
    metaDescription:
      "QR kodlu araç bakım defteri sistemi nasıl işler? Etiket yapıştırmadan okutmaya, müşterinin geçmişi görmesine kadar adım adım anlatıyoruz.",
    excerpt:
      "Araca yapıştırılan küçük bir QR etiketi, telefonla okutulduğunda o aracın tüm bakım geçmişini gösteriyor. Bu sistem tam olarak nasıl çalışıyor?",
    category: "Ürün Rehberi",
    publishedAt: "2026-08-01",
    readingMinutes: 5,
    keywords: [
      "QR kod araç bakım",
      "dijital servis fişi",
      "e-bakım defteri",
      "QR bakım etiketi",
    ],
    relatedSlugs: [
      "oto-tamirciler-icin-dijital-bakim-takip-sistemi",
      "ikinci-el-arac-alirken-bakim-gecmisi-nasil-kontrol-edilir",
    ],
    content: [
      {
        type: "p",
        text: "Son yıllarda oto servislerde giderek daha sık görülen bir uygulama var: motor kaputunun altına ya da yağ dolum kapağının yanına yapıştırılmış küçük, dayanıklı bir QR etiketi. Bu yazıda bu sistemin ne olduğunu ve teknik olarak nasıl çalıştığını adım adım anlatıyoruz.",
      },
      { type: "h2", text: "QR kodlu bakım defteri nedir?" },
      {
        type: "p",
        text: "Klasik bir kağıt bakım karnesinin dijital karşılığı diyebiliriz — ama tek yönlü değil, çift taraflı çalışır. Servis her bakımda kaydı sisteme girer, araç sahibi ise telefonunun kamerasıyla etikete yapıştırılmış QR kodu okutarak (uygulama indirmeye gerek kalmadan) o aracın tüm geçmişini anında görür.",
      },
      { type: "h2", text: "Sistem adım adım nasıl işler?" },
      {
        type: "ol",
        items: [
          "Servis araç bilgilerini (plaka, marka, model) sisteme kaydeder.",
          "Sistem, o araca özel, benzersiz bir QR kod üretir ve firma adı/telefonu basılı, dayanıklı bir etiket olarak yazdırılır.",
          "Etiket, motor bölmesi gibi görünür ve sıcaklığa/yağa/neme dayanıklı bir yere yapıştırılır.",
          "İlk okutmada etiket o araca kalıcı olarak bağlanır — bir daha karışmaz.",
          "Sonraki her bakımda usta QR kodu okutur, yeni kaydı saniyeler içinde ekler.",
          "Araç sahibi (ya da aracı incelemek isteyen bir alıcı) aynı QR kodu okutarak geçmişi görüntüler.",
        ],
      },
      { type: "h2", text: "Neden kağıt yerine QR kod?" },
      {
        type: "ul",
        items: [
          "Kaybolmaz: Kağıt karne kaybolabilir, QR etiketi araca fiziksel olarak yapışık kalır ve verisi bulutta saklanır.",
          "Değiştirilemez: Kayıtlar sistem tarafından zaman damgalı tutulur, geriye dönük \"düzeltme\" yapılamaz — bu da güvenilirlik sağlar.",
          "Anında erişim: Uygulama indirmeye, hesap açmaya gerek kalmadan, telefon kamerasıyla saniyeler içinde geçmiş görüntülenir.",
          "Reklam değeri: Etiket üzerindeki firma adı/telefonu, aracın her açılışında servisi hatırlatır.",
        ],
      },
      { type: "h2", text: "Sık sorulan sorular" },
      { type: "h3", text: "Etiket yıpranırsa veya sökülürse ne olur?" },
      {
        type: "p",
        text: "Veri her zaman buluttaki hesapta güvende kalır — etiket fiziksel bir erişim noktasıdır, verinin kendisi değil. Etiket zarar görse bile servis panelinden plaka ile arama yaparak geçmişe ulaşılabilir, gerekirse yeni bir etiket sipariş edilebilir.",
      },
      { type: "h3", text: "Araç sahibinin verileri güvende mi?" },
      {
        type: "p",
        text: "Ciddi bir sistem, hangi bilgilerin herkese açık (özet geçmiş) hangilerinin yalnızca yetkili servise özel (detaylı iletişim bilgisi gibi) olduğunu net bir şeklide ayırmalı ve KVKK aydınlatma metnini şeffafça paylaşmalıdır.",
      },
      { type: "h3", text: "Her telefonla çalışır mı?" },
      {
        type: "p",
        text: "Evet — QR kod, günümüz akıllı telefonlarının kamera uygulamasıyla doğrudan okunabiliyor, ayrı bir QR okuyucu uygulaması indirmeye gerek yok.",
      },
      {
        type: "p",
        text: "OtoHafıza tam olarak bu mantıkla çalışıyor: aracı kaydedin, sistem otomatik QR etiketinizi üretsin, araca yapıştırın, her bakımda okutup saniyeler içinde kayıt ekleyin.",
      },
      {
        type: "cta",
        text: "Sistemi kendi işletmenizde nasıl çalıştığını görmek ister misiniz?",
        href: "/kayit",
        label: "Ücretsiz Deneyin",
      },
    ],
  },
  {
    slug: "oto-servis-otomatik-bakim-hatirlatma-rehberi",
    title: "Müşterileriniz Bakım Zamanını Unutuyor mu? Otomatik Bakım Hatırlatma Rehberi",
    metaDescription:
      "Oto servislerde müşteri kaybının en büyük nedenlerinden biri unutulan bakım tarihleri. Otomatik WhatsApp bakım hatırlatmasının işletmenize etkisini anlatıyoruz.",
    excerpt:
      "Bir müşteri bakım tarihini unutup rakip bir servise gidiyorsa, bunun nedeni memnuniyetsizlik değil — sadece hatırlamamak olabilir. Çözüm: otomatik hatırlatma.",
    category: "Müşteri Sadakati",
    publishedAt: "2026-08-08",
    readingMinutes: 5,
    keywords: [
      "araç bakım hatırlatma",
      "oto servis müşteri sadakati",
      "otomatik whatsapp hatırlatma",
      "bakım zamanı hatırlatma sistemi",
    ],
    relatedSlugs: [
      "oto-tamirciler-icin-dijital-bakim-takip-sistemi",
      "yag-degisimi-kac-kilometrede-yapilmali",
    ],
    content: [
      {
        type: "p",
        text: "Bir oto tamirci için en değerli müşteri, işi elinden kaçırdığınız değil, iyi hizmet aldığı hâlde bir sonraki bakımda gelmeyi unuttuğu müşteridir. Çünkü memnuniyetsizlikten değil, tamamen hafızadan kaynaklanan bu kayıp, aslında en kolay çözülebilecek olanıdır.",
      },
      { type: "h2", text: "Müşteriler neden geri gelmiyor?" },
      {
        type: "p",
        text: "Araştırmalar ve saha gözlemleri, oto servislerde tekrar gelmeyen müşterilerin büyük kısmının aslında memnuniyetsiz olmadığını, sadece \"bir sonraki bakım ne zamandı\" bilgisini unuttuğunu gösteriyor. Ortalama bir araç sahibi, son yağ değişiminin üzerinden kaç ay/km geçtiğini takip etmiyor — bu bilgiyi takip etmek servisin işi olmalı, müşterinin değil.",
      },
      { type: "h2", text: "Geleneksel hatırlatma yöntemlerinin sorunu" },
      {
        type: "ul",
        items: [
          "Telefonla arama: Zaman alıcı, çalışan sayısı arttıkça sürdürülebilir değil.",
          "Elle SMS atma: Kimin ne zaman hatırlatılacağını takip etmek yine kağıt/hafızaya bağlı kalır.",
          "Hiç hatırlatmamak: En yaygın durum — ve en büyük ciro kaybı.",
        ],
      },
      { type: "h2", text: "Otomatik hatırlatma nasıl çalışmalı?" },
      {
        type: "p",
        text: "İyi kurgulanmış bir otomatik hatırlatma sistemi, her bakım kaydına girilen \"bir sonraki bakım tarihi/km\" bilgisini arka planda sürekli takip eder ve bu hedef yaklaştığında müşteriye otomatik bir WhatsApp mesajı gönderir — ustanın hiçbir şey hatırlaması ya da elle bir şey yapması gerekmeden.",
      },
      {
        type: "p",
        text: "Daha ileri sistemlerde müşteri mesajdaki \"Evet, randevu oluşturalım\" butonuna dokunduğunda, panelinizde otomatik olarak bir randevu açılır ve size bir bildirimle haber verilir — telefonu hiç açmadan yeni bir randevu kazanmış olursunuz.",
      },
      { type: "h2", text: "Hatırlatmanın dönüşüm oranını artıran ipuçları" },
      {
        type: "ul",
        items: [
          "Zamanlama: Hedef tarihten birkaç gün önce, tam zamanında bir hatırlatma daha etkilidir — çok erken gönderilen mesajlar unutulur.",
          "Kişiselleştirme: Mesajda müşterinin adı, aracın plakası ve son yapılan işlem geçmesi güveni artırır.",
          "Kolay yanıt: Müşterinin tek tıkla \"evet\" diyebileceği bir aksiyon, uzun bir telefon görüşmesinden çok daha yüksek yanıt oranı sağlar.",
          "Kanal seçimi: WhatsApp, SMS'e göre çok daha yüksek okunma oranına sahip — çoğu kullanıcı bildirim geldiği an mesajı görür.",
        ],
      },
      { type: "h2", text: "Bunun işletmenize somut etkisi" },
      {
        type: "p",
        text: "Otomatik hatırlatma, yeni müşteri kazanmaktan çok daha ucuz bir büyüme yöntemidir: zaten sizi bir kez tercih etmiş bir müşteriyi tekrar kazanıyorsunuz. Bu da hem tekrarlayan ciroyu hem de müşteri sadakatini doğrudan artırır — üstelik hiçbir reklam bütçesi harcamadan.",
      },
      {
        type: "p",
        text: "OtoHafıza'da her bakım kaydına girilen bir sonraki bakım tarihi/km otomatik olarak izlenir, hedef yaklaştığında müşteriye otomatik WhatsApp hatırlatması gönderilir ve müşteri \"Evet\" derse panelinizde otomatik randevu açılır.",
      },
      {
        type: "cta",
        text: "Otomatik hatırlatmayı kendi işletmenizde ücretsiz deneyin.",
        href: "/kayit",
        label: "Hemen Başla",
      },
    ],
  },
  {
    slug: "ikinci-el-arac-alirken-bakim-gecmisi-nasil-kontrol-edilir",
    title: "İkinci El Araç Alırken Bakım Geçmişi Nasıl Kontrol Edilir?",
    metaDescription:
      "İkinci el araç alırken bakım geçmişini kontrol etmenin yolları neler? Kağıt servis karnesinden dijital QR kayıtlara kadar güvenilir bakım geçmişi kontrolünü anlatıyoruz.",
    excerpt:
      "İkinci el bir araçta gerçek bakım geçmişini doğrulamak zor olabilir. Kağıt karneden dijital, değiştirilemez kayıtlara kadar kontrol yöntemlerini anlatıyoruz.",
    category: "Araç Sahipleri İçin",
    publishedAt: "2026-08-13",
    readingMinutes: 5,
    keywords: [
      "ikinci el araç bakım geçmişi",
      "araç geçmişi nasıl sorgulanır",
      "bakımlı araç nasıl anlaşılır",
      "servis geçmişi kontrolü",
    ],
    relatedSlugs: [
      "qr-kodlu-arac-bakim-defteri-nedir-nasil-calisir",
      "yag-degisimi-kac-kilometrede-yapilmali",
    ],
    content: [
      {
        type: "p",
        text: "İkinci el araç alırken en çok sorulan sorulardan biri: \"Bu araç gerçekten düzenli bakım görmüş mü, yoksa satıcı bunu sadece söylüyor mu?\" Km göstergesi ve dışarıdan bakım tek başına yeterli kanıt değildir — gerçek bakım geçmişini doğrulamanın birkaç yolu var.",
      },
      { type: "h2", text: "Geleneksel yöntemler ve sınırları" },
      { type: "h3", text: "Kağıt servis karnesi" },
      {
        type: "p",
        text: "Klasik yöntemdir ama ciddi zayıflıkları vardır: kolayca kaybolabilir, sahte kaşe/imza ile doldurulabilir, araç el değiştirdikçe genelde kaybolur ya da eksik kalır. Karnenin varlığı iyi bir işarettir ama tek başına kesin bir kanıt sayılmamalı.",
      },
      { type: "h3", text: "Yetkili servis kayıtları" },
      {
        type: "p",
        text: "Araç hep yetkili serviste bakım gördüyse, şasi numarasıyla marka yetkili servisinden geçmiş sorgulanabilir. Ancak birçok araç sahibi garanti süresi bitince özel/bağımsız servisleri tercih ediyor — bu durumda yetkili servis kaydı yalnızca ilk birkaç yılı kapsar.",
      },
      { type: "h2", text: "Dijital, değiştirilemez kayıtların avantajı" },
      {
        type: "p",
        text: "Son yıllarda bağımsız oto servislerin bir kısmı, QR kodlu dijital bakım defteri sistemleri kullanmaya başladı. Bu sistemlerde her bakım kaydı zaman damgalı olarak sisteme işleniyor ve geriye dönük değiştirilemiyor — bu da kağıt karneye göre çok daha güvenilir bir kanıt sağlıyor.",
      },
      {
        type: "p",
        text: "Aracı incelerken motor kaputunda ya da yağ dolum kapağı civarında küçük bir QR etiketi görürseniz, bunu telefonunuzla okutarak aracın (varsa) tüm bakım geçmişini — tarih, kilometre, yapılan işlem — anında görebilirsiniz. Uygulama indirmenize ya da hesap açmanıza gerek kalmaz.",
      },
      { type: "h2", text: "İkinci el araç incelerken kontrol listesi" },
      {
        type: "ul",
        items: [
          "Aracın üzerinde bir bakım/servis QR etiketi var mı? Varsa mutlaka okutup geçmişi inceleyin.",
          "Kağıt servis karnesi varsa tarihlerin km göstergesiyle tutarlı olup olmadığını kontrol edin.",
          "Yağ değişim aralıklarının makul olup olmadığına bakın (çok seyrek aralıklar ihmal işareti olabilir).",
          "Satıcıdan aracın hep aynı serviste bakım görüp görmediğini sorun — tutarlı bir bakım geçmişi güven artırır.",
          "Şüpheli durumlarda bağımsız bir ekspertiz kontrolünden geçirin; dijital kayıtlar ekspertizin yerini almaz, onu destekler.",
        ],
      },
      { type: "h2", text: "Oto servisler için bir fırsat" },
      {
        type: "p",
        text: "Bu konunun bir de servisler için değerli bir tarafı var: QR kodlu dijital bakım kaydı sunan bir servis, müşterisine sadece bakım hatırlatması değil, aracını sattığında kanıtlanabilir bir bakım geçmişi sunma avantajı da sağlıyor. Bu, hem müşteri sadakatini artıran hem de servisi rakiplerinden ayıran somut bir fark yaratıyor.",
      },
      {
        type: "cta",
        text: "Oto tamirciyseniz, müşterilerinize bu şeffaflığı sunmak için QR kodlu dijital bakım defterini ücretsiz deneyebilirsiniz.",
        href: "/kayit",
        label: "OtoHafıza'yı İnceleyin",
      },
    ],
  },
];

export function listBlogPosts(): BlogPost[] {
  return [...BLOG_POSTS].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  return BLOG_POSTS.find((p) => p.slug === slug) ?? null;
}

export function getRelatedPosts(post: BlogPost): BlogPost[] {
  return post.relatedSlugs
    .map((slug) => getBlogPostBySlug(slug))
    .filter((p): p is BlogPost => !!p);
}
