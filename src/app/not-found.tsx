//HomeClient-NotFound
import Link from "next/link";

export const metadata = {
  title: "الصفحة غير موجودة | شيف العرب",
  description:
    "عذرًا، الصفحة التي تبحث عنها غير موجودة أو ربما تم تغيير رابطها. يمكنك العودة إلى شيف العرب ومتابعة التصفح.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <main
      dir="rtl"
      className="
        relative min-h-[100svh] overflow-hidden
        bg-[#fafafa]
        px-4 py-16
        dark:bg-[#090d12]
        sm:px-6
        lg:px-8
      "
    >
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-0
          bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.12),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.12),transparent_28%)]
          dark:bg-[radial-gradient(circle_at_top_right,rgba(163,230,53,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(251,146,60,0.08),transparent_28%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute -right-24 top-20 h-72 w-72 rounded-full
          bg-lime-300/10 blur-3xl
          dark:bg-lime-400/5
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute -left-24 bottom-10 h-80 w-80 rounded-full
          bg-orange-300/10 blur-3xl
          dark:bg-orange-400/5
        "
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-8rem)] max-w-6xl items-center justify-center">
        <section
          className="
            relative w-full max-w-4xl overflow-hidden
            rounded-[2rem]
            border border-black/[0.06]
            bg-white/85
            shadow-[0_30px_100px_-40px_rgba(0,0,0,0.25)]
            backdrop-blur-xl
            dark:border-white/[0.08]
            dark:bg-[#10161d]/90
            dark:shadow-[0_30px_100px_-40px_rgba(0,0,0,0.8)]
          "
        >
          {/* Top accent */}
          <div className="h-1.5 w-full bg-gradient-to-l from-lime-400 via-yellow-400 to-orange-400" />

          <div className="relative px-6 py-12 sm:px-10 sm:py-16 lg:px-16 lg:py-20">
            {/* Decorative kitchen elements */}
            <div
              aria-hidden="true"
              className="
                absolute left-6 top-7 hidden
                h-16 w-16 rotate-12 items-center justify-center
                rounded-2xl border border-orange-200/70
                bg-orange-50
                text-3xl shadow-sm
                dark:border-orange-400/10
                dark:bg-orange-400/[0.06]
                sm:flex
              "
            >
              🍳
            </div>

            <div
              aria-hidden="true"
              className="
                absolute right-7 top-8 hidden
                h-14 w-14 -rotate-12 items-center justify-center
                rounded-full border border-lime-200/70
                bg-lime-50
                text-2xl shadow-sm
                dark:border-lime-400/10
                dark:bg-lime-400/[0.06]
                sm:flex
              "
            >
              🌿
            </div>

            <div className="mx-auto max-w-2xl text-center">
              {/* Small status */}
              <div
                className="
                  mx-auto mb-6 inline-flex items-center gap-2
                  rounded-full
                  border border-gray-200
                  bg-gray-50
                  px-4 py-2
                  text-sm font-semibold
                  text-gray-600
                  dark:border-white/10
                  dark:bg-white/[0.04]
                  dark:text-gray-300
                "
              >
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-40" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-400" />
                </span>

                يبدو أن هذا الرابط لم يعد متاحًا
              </div>

              {/* 404 */}
              <div className="relative mb-6 select-none">
                <span
                  aria-hidden="true"
                  className="
                    block bg-gradient-to-b
                    from-gray-900 via-gray-700 to-gray-400
                    bg-clip-text
                    text-[7rem] font-black leading-[0.85]
                    tracking-[-0.07em]
                    text-transparent
                    sm:text-[10rem]
                    lg:text-[12rem]
                    dark:from-white
                    dark:via-gray-300
                    dark:to-gray-700
                  "
                >
                  404
                </span>

                <span
                  aria-hidden="true"
                  className="
                    absolute left-1/2 top-1/2
                    h-20 w-20
                    -translate-x-1/2 -translate-y-1/2
                    rounded-full
                    bg-orange-400/10
                    blur-2xl
                    sm:h-28 sm:w-28
                  "
                />
              </div>

              {/* Title */}
              <h1
                className="
                  mb-4
                  text-2xl font-black
                  leading-tight
                  text-gray-950
                  sm:text-3xl
                  lg:text-4xl
                  dark:text-white
                "
              >
                الصفحة دي مش موجودة
                <span className="text-orange-500">!</span>
              </h1>

              {/* Description */}
              <p
                className="
                  mx-auto max-w-xl
                  text-base leading-8
                  text-gray-600
                  sm:text-lg
                  dark:text-gray-400
                "
              >
                ممكن يكون الرابط اتغير، أو الصفحة اتحذفت، أو فيه خطأ بسيط في
                العنوان. متقلقش، تقدر ترجع للرئيسية أو تكمل تصفح وصفات شيف
                العرب.
              </p>

              {/* Buttons */}
              <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="
                    group inline-flex min-h-12
                    items-center justify-center gap-2
                    rounded-xl
                    bg-lime-400
                    px-6 py-3.5
                    text-sm font-extrabold
                    text-gray-950
                    shadow-[0_10px_30px_-12px_rgba(163,230,53,0.8)]
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:bg-lime-300
                    hover:shadow-[0_14px_35px_-12px_rgba(163,230,53,0.9)]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-lime-400
                    focus:ring-offset-2
                    dark:focus:ring-offset-[#10161d]
                    sm:min-w-44
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M3 10.75 12 3l9 7.75V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.75Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  الصفحة الرئيسية

                  <span
                    className="
                      transition-transform duration-300
                      group-hover:-translate-x-1
                    "
                  >
                    ←
                  </span>
                </Link>

                <Link
                  href="/recipes"
                  className="
                    group inline-flex min-h-12
                    items-center justify-center gap-2
                    rounded-xl
                    border border-gray-200
                    bg-white
                    px-6 py-3.5
                    text-sm font-bold
                    text-gray-800
                    shadow-sm
                    transition-all duration-300
                    hover:-translate-y-0.5
                    hover:border-orange-200
                    hover:bg-orange-50
                    hover:text-orange-700
                    focus:outline-none
                    focus:ring-2
                    focus:ring-orange-400
                    focus:ring-offset-2
                    dark:border-white/10
                    dark:bg-white/[0.04]
                    dark:text-gray-200
                    dark:hover:border-orange-400/20
                    dark:hover:bg-orange-400/[0.08]
                    dark:hover:text-orange-300
                    dark:focus:ring-offset-[#10161d]
                    sm:min-w-44
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>

                  تصفح الوصفات
                </Link>
              </div>

              {/* Helpful hint */}
              <div
                className="
                  mx-auto mt-10 flex max-w-lg
                  items-start gap-3
                  rounded-2xl
                  border border-gray-100
                  bg-gray-50/80
                  p-4
                  text-right
                  dark:border-white/[0.06]
                  dark:bg-white/[0.025]
                "
              >
                <div
                  className="
                    mt-0.5 flex h-9 w-9 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-orange-100
                    text-orange-600
                    dark:bg-orange-400/10
                    dark:text-orange-300
                  "
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M12 10v6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 7h.01"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
                  لو وصلت للصفحة دي من رابط محفوظ عندك، جرّب البحث عن الوصفة
                  من جديد لأن اسم الرابط ممكن يكون اتغير.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div
            className="
              border-t border-gray-100
              bg-gray-50/60
              px-6 py-4
              text-center
              dark:border-white/[0.06]
              dark:bg-black/10
            "
          >
            <p className="text-xs text-gray-400 dark:text-gray-500">
              شيف العرب
              <span className="mx-2">•</span>
              نرجّعك للمطبخ في أسرع وقت 👨‍🍳
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}