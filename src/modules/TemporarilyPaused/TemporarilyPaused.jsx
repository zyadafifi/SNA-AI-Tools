import {
  PauseCircle,
  Wrench,
  Clock,
  ArrowLeft,
  RefreshCcw,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { FaArrowDown } from "react-icons/fa";
export function TemporarilyPaused() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-zinc-50 text-zinc-900 relative overflow-hidden"
    >
      {/* خلفيات زخرفية */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[color:var(--primary-color)]/25 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-[color:var(--secondary-color)]/18 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-[30rem] w-[30rem] rounded-full bg-[color:var(--primary-color)]/12 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(to_right,rgba(0,0,0,0.55)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.55)_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-6 py-12">
        {/* الشريط العلوي */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 shadow-sm">
              <Wrench className="h-4 w-4 text-[var(--primary-color)]" />
              <span className="font-medium text-zinc-900 arabic_font">
                وضع الصيانة
              </span>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-600 arabic_font">
                أداة الكتابة موقوفة مؤقتًا
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex arabic_font items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100 transition shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              رجوع
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex arabic_font items-center gap-2 rounded-xl bg-[var(--primary-color)] text-zinc-900 px-3 py-2 text-sm font-semibold hover:bg-[var(--secondary-color)] hover:text-white transition shadow-sm"
            >
              <RefreshCcw className="h-4 w-4" />
              إعادة المحاولة
            </button>
          </div>
        </div>

        {/* القسم الرئيسي */}
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-7 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.25)]">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-[color:var(--primary-color)]/20 border border-[color:var(--primary-color)]/40 p-3">
                <PauseCircle className="h-7 w-7 text-[var(--primary-color)]" />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl arabic_font sm:text-3xl font-bold tracking-tight text-zinc-900">
                    Writing Assistant - قريبًا بإصدار جديد
                  </h1>
                  <span className="inline-flex arabic_font items-center gap-1 rounded-full bg-[color:var(--secondary-color)]/15 border border-[color:var(--secondary-color)]/30 px-2 py-1 text-xs text-[var(--secondary-color)]">
                    <Clock className="h-3.5 w-3.5" />
                    توقف بسيط
                  </span>
                </div>

                <p
                  dir="rtl"
                  className="mt-2 arabic_font text-zinc-600 leading-relaxed"
                >
                  أداة الكتابة متوقفة مؤقتًا، لأننا بنعيد بناءها بشكل كامل.
                  <br />
                  بنطورها وفق أحدث منهج تدريبي، حتي تناسب مستواك الحقيقي، وتخدم
                  أهدافك في الكتابة بدقة أكبر.
                  <br />
                  نسخة أذكى، أبسط، أسرع، وأكثر فعالية في تطوير مهارتك.
                  <br />
                  واذا ودك تطور مهارة الكتابة من الآن، عندنا نظام كامل تقدر تبدأ
                  بيه فورًا: Netflix System Book،
                  <br />
                  من خلاله هتقدر:
                </p>

                <ol
                  dir="rtl"
                  className="mt-2 arabic_font text-zinc-600 leading-relaxed list-decimal pr-3 space-y-2"
                >
                  <li className="arabic_font">
                    تتدرب على كتابة Paragraphs ومقالات كاملة بالإنجليزي.
                  </li>
                  <li className="arabic_font">
                    تدخل الإنجليزي في حياتك اليومية بشكل طبيعي.
                  </li>
                  <li className="arabic_font">
                    تطبق عملي من خلال مسلسلات، أفلام، وبودكاست مرشحة حسب مستواك.
                  </li>
                  <li className="arabic_font">
                    تكتسب مفردات وتراكيب من سياق حقيقي.
                  </li>
                  <li className="arabic_font">
                    تبني لغتك بالطريقة الصحيحة.. وبأقل مجهود.
                  </li>
                </ol>

                <p
                  dir="rtl"
                  className="mt-2 arabic_font text-zinc-600 leading-relaxed"
                >
                  ابدأ في بناء مهاراتك الآن، والنسخه المطوره ستكون اضافه حقيقيه
                  لتقدمك!
                  <br />
                  ولو هدفك تبني أساس قوي في باقي المهارات: سواء في القراءة،
                  التحدث، أو حتي الاستماع.
                  <br />
                  ابدأ بنظام متكامل يمشي معاك خطوة بخطوة.
                </p>
                <div className="flex flex-col items-center justify-center mt-6">
                  {/* Arrow */}
                  <FaArrowDown className=" text-[var(--primary-color)] text-2xl mb-2 animate-bounce drop-shadow-md " />

                  {/* Button */}
                  <a
                    target="_blank"
                    href="https://sna.academy/library-page"
                    className=" bg-[var(--primary-color)] arabic_font text-black px-6 py-2 rounded-lg shadow-md hover:scale-105 hover:shadow-lg transition-all duration-300"
                  >
                    اضغط هنا
                  </a>
                </div>

                {/* شريط التقدم */}
                <div className="mt-5">
                  <div className="flex arabic_font items-center justify-between text-xs text-zinc-500">
                    <span className="arabic_font">تقدّم التحديث</span>
                    <span className="text-zinc-600 arabic_font">
                      جاري العمل…
                    </span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-zinc-200 overflow-hidden">
                    <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] animate-[pulse_2.2s_ease-in-out_infinite]" />
                  </div>
                  <p className="mt-2 arabic_font text-xs text-zinc-500">
                    ملاحظة: جرّب تضغطين{" "}
                    <span className="text-zinc-700 arabic_font">
                      إعادة المحاولة
                    </span>{" "}
                    بعد دقيقة.
                  </p>
                </div>
              </div>
            </div>

            {/* كروت المميزات */}
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <InfoCard
                icon={<Zap className="h-5 w-5 text-[var(--primary-color)]" />}
                title="أسرع"
                desc="استجابة أعلى وتجربة كتابة أنعم."
              />
              <InfoCard
                icon={
                  <ShieldCheck className="h-5 w-5 text-[var(--secondary-color)]" />
                }
                title="أكثر استقرارًا"
                desc="أعطال أقل وحفظ تلقائي أفضل."
              />
              <InfoCard
                icon={
                  <Sparkles className="h-5 w-5 text-[var(--primary-color)]" />
                }
                title="واجهة أنظف"
                desc="تجربة محرر مرتبة ومحسّنة."
              />
            </div>
          </div>

          {/* اللوحة الجانبية */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-7 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.2)]">
            <h2 className="text-lg arabic_font font-semibold text-zinc-900">
              إيش تقدر تسوي الحين
            </h2>

            <div className="mt-4 space-y-3">
              <ActionRow
                title="كمّل التصفح"
                desc="تنقّل بين الأقسام بدون أي انقطاع."
                className="arabic_font"
              />
              <ActionRow
                title="احفظ المسودة عندك"
                desc="لو كتبت شي، انسخ مؤقتًا."
              />
              <ActionRow
                title="أعيد المحاولة قريب"
                desc="بنرجع قريب إن شاء الله — حدّثي الصفحة."
              />
            </div>

            <div className="mt-7 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-zinc-900">الحالة</p>
                <span className="text-xs arabic_font rounded-full bg-[color:var(--secondary-color)]/15 border border-[color:var(--secondary-color)]/30 px-2 py-1 text-[var(--secondary-color)]">
                  أداء منخفض مؤقتًا
                </span>
              </div>
              <div className="mt-3 space-y-2 text-sm text-zinc-700">
                <p className="flex arabic_font items-center justify-between">
                  المحرر
                  <span className="arabic_font text-[var(--secondary-color)]">
                    موقوف
                  </span>
                </p>
                <p className="arabic_font flex items-center justify-between">
                  القراءة
                  <span className="arabic_font text-[var(--primary-color)]">
                    شغّالة
                  </span>
                </p>
                <p className="arabic_font flex items-center justify-between">
                  لوحة التحكم
                  <span className="arabic_font text-[var(--primary-color)]">
                    شغّالة
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* الأسئلة السريعة */}
        <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-7 backdrop-blur-xl shadow-[0_20px_60px_-30px_rgba(0,0,0,0.18)]">
          <h3 className="arabic_font text-base font-semibold text-zinc-900">
            أسئلة سريعة
          </h3>
          <div className="arabic_font mt-4 grid gap-4 sm:grid-cols-2">
            <Faq
              className="arabic_font"
              q="هل بياناتي آمنة؟"
              a="نعم، هذا توقف مؤقت للتحديث، وما فيه أي فقدان بيانات إن شاء الله."
            />
            <Faq
              className="arabic_font"
              q="كم بياخذ وقت؟"
              a="غالبًا وقت قصير، جرّب إعادة المحاولة أو تحديث الصفحة بعد شوي."
            />
          </div>
        </div>

        <div className="mt-10 arabic_font text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} • تنبيه خدمة • صيانة أداة الكتابة
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      <div className="flex items-center gap-2">
        <div className="rounded-xl bg-white border border-zinc-200 p-2">
          {icon}
        </div>
        <p className="font-semibold text-zinc-900 arabic_font">{title}</p>
      </div>
      <p className="mt-2 text-sm text-zinc-600 arabic_font">{desc}</p>
    </div>
  );
}

function ActionRow({ title, desc }) {
  return (
    <div className="rounded-2xl arabic_font border border-zinc-200 bg-zinc-50 p-4 hover:bg-zinc-100 transition">
      <p className="text-sm font-semibold arabic_font text-zinc-900">{title}</p>
      <p className="mt-1 text-sm arabic_font text-zinc-600">{desc}</p>
    </div>
  );
}

function Faq({ q, a }) {
  return (
    <div className="rounded-2xl arabic_font border border-zinc-200 bg-zinc-50 p-4">
      <p className="text-sm arabic_font font-semibold text-zinc-900">{q}</p>
      <p className="mt-1 text-sm arabic_font text-zinc-600">{a}</p>
    </div>
  );
}
