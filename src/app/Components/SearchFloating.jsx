"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import Link from "next/link";
import {
  useRouter,
} from "next/navigation";

import {
  ArrowUpLeft,
  ChefHat,
  Search,
  Sparkles,
  X,
} from "lucide-react";

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 220;
const MAX_RESULTS = 10;

/* =========================================================
   Helpers
   ========================================================= */

function normalizeQuery(
  value,
) {
  return String(
    value || "",
  )
    .trim()
    .replace(
      /\s+/g,
      " ",
    )
    .slice(0, 80);
}

/* =========================================================
   Footer visibility
   ========================================================= */

function useFooterVisibility() {
  const [
    visible,
    setVisible,
  ] = useState(false);

  useEffect(() => {
    const footer =
      document.getElementById(
        "site-footer",
      );

    if (!footer) {
      return;
    }

    /*
     * Fallback للمتصفحات القديمة.
     */
    if (
      typeof IntersectionObserver ===
      "undefined"
    ) {
      const checkFooter =
        () => {
          const rect =
            footer.getBoundingClientRect();

          const nearFooter =
            rect.top <=
              window.innerHeight +
                80 &&
            rect.bottom >= 0;

          setVisible(
            nearFooter,
          );
        };

      checkFooter();

      window.addEventListener(
        "scroll",
        checkFooter,
        {
          passive: true,
        },
      );

      window.addEventListener(
        "resize",
        checkFooter,
        {
          passive: true,
        },
      );

      return () => {
        window.removeEventListener(
          "scroll",
          checkFooter,
        );

        window.removeEventListener(
          "resize",
          checkFooter,
        );
      };
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          setVisible(
            Boolean(
              entry?.isIntersecting,
            ),
          );
        },
        {
          root: null,
          threshold: 0,
          rootMargin:
            "0px 0px 80px 0px",
        },
      );

    observer.observe(
      footer,
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  return visible;
}

/* =========================================================
   Visual viewport
   ========================================================= */

/**
 * بعض الموبايلات تغير ارتفاع الشاشة الحقيقي
 * عند ظهور الكيبورد.
 *
 * visualViewport يعطينا الارتفاع الفعلي المتاح
 * بدل الاعتماد على 100vh فقط.
 */
function useViewportHeight() {
  const [
    height,
    setHeight,
  ] = useState(0);

  useEffect(() => {
    const updateHeight =
      () => {
        const nextHeight =
          window.visualViewport
            ?.height ||
          window.innerHeight;

        setHeight(
          Math.round(
            nextHeight,
          ),
        );
      };

    updateHeight();

    window.addEventListener(
      "resize",
      updateHeight,
      {
        passive: true,
      },
    );

    window.visualViewport
      ?.addEventListener(
        "resize",
        updateHeight,
      );

    return () => {
      window.removeEventListener(
        "resize",
        updateHeight,
      );

      window.visualViewport
        ?.removeEventListener(
          "resize",
          updateHeight,
        );
    };
  }, []);

  return height;
}

/* =========================================================
   Component
   ========================================================= */

export default function SearchFloating() {
  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    results,
    setResults,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState(false);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(0);

  const panelRef =
    useRef(null);

  const inputRef =
    useRef(null);

  const footerVisible =
    useFooterVisibility();

  const viewportHeight =
    useViewportHeight();

  /* =======================================================
     Close
     ======================================================= */

  const close =
    useCallback(() => {
      setOpen(false);
      setActiveIndex(0);
    }, []);

  /* =======================================================
     Focus + outside click + Escape
     ======================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }

    /*
     * Safari وبعض أجهزة Android تحتاج مهلة صغيرة
     * بعد ظهور العنصر قبل focus.
     */
    let focusTimer = 0;

    const frame =
      window.requestAnimationFrame(
        () => {
          focusTimer =
            window.setTimeout(
              () => {
                try {
                  inputRef.current?.focus(
                    {
                      preventScroll:
                        true,
                    },
                  );
                } catch {
                  /*
                   * Fallback للمتصفحات القديمة
                   * التي لا تدعم preventScroll.
                   */
                  inputRef.current?.focus();
                }
              },
              60,
            );
        },
      );

    const handlePointerDown =
      (event) => {
        if (
          panelRef.current &&
          !panelRef.current.contains(
            event.target,
          )
        ) {
          close();
        }
      };

    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          close();
        }
      };

    document.addEventListener(
      "pointerdown",
      handlePointerDown,
      {
        passive: true,
      },
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.cancelAnimationFrame(
        frame,
      );

      if (focusTimer) {
        window.clearTimeout(
          focusTimer,
        );
      }

      document.removeEventListener(
        "pointerdown",
        handlePointerDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
    close,
  ]);

  /* =======================================================
     Search API
     ======================================================= */

  useEffect(() => {
    const safeQuery =
      normalizeQuery(
        query,
      );

    if (
      safeQuery.length <
      MIN_QUERY_LENGTH
    ) {
      setResults([]);
      setLoading(false);
      setError(false);
      setActiveIndex(0);

      return;
    }

    let cancelled = false;

    /*
     * AbortController مدعوم في المتصفحات الحديثة.
     * بنستخدم fallback بسيط لو جهاز قديم جدًا.
     */
    const controller =
      typeof AbortController !==
      "undefined"
        ? new AbortController()
        : null;

    const timer =
      window.setTimeout(
        async () => {
          setLoading(true);
          setError(false);

          try {
            const options = {
              method: "GET",
              headers: {
                Accept:
                  "application/json",
              },
            };

            if (controller) {
              options.signal =
                controller.signal;
            }

            const response =
              await fetch(
                `/api/search?q=${encodeURIComponent(
                  safeQuery,
                )}`,
                options,
              );

            if (
              !response.ok
            ) {
              throw new Error(
                `Search failed: ${response.status}`,
              );
            }

            const payload =
              await response.json();

            if (cancelled) {
              return;
            }

            const nextResults =
              Array.isArray(
                payload?.results,
              )
                ? payload.results
                : [];

            setResults(
              nextResults.slice(
                0,
                MAX_RESULTS,
              ),
            );

            setActiveIndex(0);
          } catch (
            requestError
          ) {
            if (
              cancelled
            ) {
              return;
            }

            if (
              requestError?.name ===
              "AbortError"
            ) {
              return;
            }

            setResults([]);
            setError(true);
          } finally {
            if (
              !cancelled
            ) {
              setLoading(false);
            }
          }
        },
        DEBOUNCE_MS,
      );

    return () => {
      cancelled = true;

      window.clearTimeout(
        timer,
      );

      controller?.abort();
    };
  }, [query]);

  /* =======================================================
     Keyboard navigation
     ======================================================= */

  const handleInputKeyDown =
    useCallback(
      (event) => {
        if (
          event.key ===
            "ArrowDown" &&
          results.length >
            0
        ) {
          event.preventDefault();

          setActiveIndex(
            (current) =>
              (current + 1) %
              results.length,
          );

          return;
        }

        if (
          event.key ===
            "ArrowUp" &&
          results.length >
            0
        ) {
          event.preventDefault();

          setActiveIndex(
            (current) =>
              current <= 0
                ? results.length -
                  1
                : current - 1,
          );

          return;
        }

        if (
          event.key ===
            "Enter" &&
          results.length >
            0
        ) {
          const selected =
            results[
              activeIndex
            ] ||
            results[0];

          if (
            !selected?.slug
          ) {
            return;
          }

          event.preventDefault();

          close();

          router.push(
            `/recipe/${encodeURIComponent(
              selected.slug,
            )}`,
          );
        }
      },
      [
        activeIndex,
        close,
        results,
        router,
      ],
    );

  /* =======================================================
     Hide near footer
     ======================================================= */

  if (
    footerVisible
  ) {
    return null;
  }

  /* =======================================================
     Dynamic mobile heights
     ======================================================= */

  const availableHeight =
    viewportHeight > 0
      ? Math.max(
          280,
          viewportHeight -
            105,
        )
      : undefined;

  const resultsHeight =
    viewportHeight > 0
      ? Math.max(
          150,
          Math.min(
            360,
            viewportHeight -
              245,
          ),
        )
      : 360;

  /* =======================================================
     UI
     ======================================================= */

  return (
    <div
      ref={panelRef}
      dir="rtl"
      className="
        fixed
        right-3
        z-[80]
        sm:right-6
      "
      style={{
        bottom:
          "calc(5rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true);
          }}
          aria-label="فتح البحث عن وصفة"
          aria-expanded={
            false
          }
          className="
            relative
            grid
            h-14
            w-14
            touch-manipulation
            place-items-center
            rounded-2xl
            border
            border-white/20
            bg-orange-500
            text-white
            shadow-xl
            shadow-orange-950/25
            transition
            duration-150

            hover:-translate-y-0.5
            hover:bg-orange-600

            active:scale-95

            focus-visible:outline-none
            focus-visible:ring-4
            focus-visible:ring-orange-300/50
          "
        >
          <Search
            size={24}
            strokeWidth={
              2.4
            }
            aria-hidden="true"
          />

          <span
            aria-hidden="true"
            className="
              absolute
              -right-1
              -top-1
              h-3.5
              w-3.5
              rounded-full
              border-2
              border-white
              bg-emerald-400
            "
          />
        </button>
      ) : (
        <section
          aria-label="البحث عن وصفة"
          role="dialog"
          aria-modal="false"
          className="
            flex
            w-[calc(100vw-1.5rem)]
            max-w-[410px]
            flex-col
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white/95
            shadow-2xl
            backdrop-blur-xl

            dark:border-white/10
            dark:bg-slate-900/95
          "
          style={{
            maxHeight:
              availableHeight
                ? `${availableHeight}px`
                : "calc(100vh - 7rem)",
          }}
        >
          {/* Header */}
          <div
            className="
              shrink-0
              border-b
              border-slate-200
              p-4

              dark:border-white/10
            "
          >
            <div
              className="
                mb-3
                flex
                items-center
                justify-between
                gap-3
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2.5
                "
              >
                <span
                  className="
                    grid
                    h-10
                    w-10
                    shrink-0
                    place-items-center
                    rounded-xl
                    bg-orange-500
                    text-white
                  "
                >
                  <ChefHat
                    size={
                      20
                    }
                    aria-hidden="true"
                  />
                </span>

                <div className="min-w-0">
                  <h2
                    className="
                      flex
                      items-center
                      gap-1.5
                      text-sm
                      font-black
                      text-slate-950

                      dark:text-white
                    "
                  >
                    البحث الذكي

                    <Sparkles
                      size={
                        14
                      }
                      className="text-orange-500"
                      aria-hidden="true"
                    />
                  </h2>

                  <p
                    className="
                      truncate
                      text-[11px]
                      font-semibold
                      text-slate-500

                      dark:text-slate-400
                    "
                  >
                    ابحث في وصفات شيف
                    العرب بسرعة
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  close
                }
                aria-label="إغلاق البحث"
                className="
                  grid
                  h-9
                  w-9
                  shrink-0
                  touch-manipulation
                  place-items-center
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  text-slate-600
                  transition

                  hover:bg-slate-100

                  active:scale-95

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-orange-500

                  dark:border-white/10
                  dark:bg-white/5
                  dark:text-slate-300
                "
              >
                <X
                  size={
                    18
                  }
                  aria-hidden="true"
                />
              </button>
            </div>

            {/* Search input */}
            <div className="relative">
              <Search
                size={19}
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  text-orange-500
                "
              />

              <input
                ref={
                  inputRef
                }
                type="search"
                value={
                  query
                }
                onChange={(
                  event,
                ) => {
                  setQuery(
                    event
                      .target
                      .value,
                  );
                }}
                onKeyDown={
                  handleInputKeyDown
                }
                autoComplete="off"
                autoCorrect="off"
                spellCheck={
                  false
                }
                enterKeyHint="search"
                maxLength={
                  80
                }
                placeholder="مثال: دجاج، أرز، حلويات..."
                aria-label="ابحث عن وصفة"
                className="
                  h-12
                  w-full
                  rounded-2xl
                  border
                  border-slate-200
                  bg-slate-50
                  py-2
                  pl-11
                  pr-11
                  text-base
                  font-bold
                  text-slate-900
                  outline-none
                  transition

                  focus:border-orange-500
                  focus:ring-4
                  focus:ring-orange-500/10

                  dark:border-white/10
                  dark:bg-black/20
                  dark:text-white

                  sm:text-sm
                "
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery(
                      "",
                    );

                    setResults(
                      [],
                    );

                    setError(
                      false,
                    );

                    try {
                      inputRef.current?.focus(
                        {
                          preventScroll:
                            true,
                        },
                      );
                    } catch {
                      inputRef.current?.focus();
                    }
                  }}
                  aria-label="مسح البحث"
                  className="
                    absolute
                    left-2
                    top-1/2
                    grid
                    h-8
                    w-8
                    -translate-y-1/2
                    touch-manipulation
                    place-items-center
                    rounded-lg
                    text-slate-500

                    hover:bg-slate-200
                    active:scale-95

                    dark:hover:bg-white/10
                  "
                >
                  <X
                    size={
                      15
                    }
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div
            className="
              min-h-0
              flex-1
              overscroll-contain
              overflow-y-auto
              p-2
            "
            style={{
              maxHeight:
                `${resultsHeight}px`,
              WebkitOverflowScrolling:
                "touch",
            }}
            aria-live="polite"
          >
            {normalizeQuery(
              query,
            ).length <
            MIN_QUERY_LENGTH ? (
              <div
                className="
                  px-4
                  py-8
                  text-center
                  text-sm
                  font-bold
                  text-slate-500

                  dark:text-slate-400
                "
              >
                اكتب حرفين على الأقل
                لعرض النتائج.
              </div>
            ) : loading ? (
              <div
                className="
                  flex
                  items-center
                  justify-center
                  gap-3
                  px-4
                  py-8
                  text-sm
                  font-bold
                  text-slate-500

                  dark:text-slate-400
                "
              >
                <span
                  className="
                    h-5
                    w-5
                    animate-spin
                    rounded-full
                    border-2
                    border-slate-300
                    border-t-orange-500
                  "
                  aria-hidden="true"
                />

                جاري البحث...
              </div>
            ) : error ? (
              <div
                className="
                  px-4
                  py-8
                  text-center
                "
              >
                <p
                  className="
                    text-sm
                    font-bold
                    text-red-600

                    dark:text-red-400
                  "
                >
                  تعذر إكمال البحث
                  الآن.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    /*
                     * إعادة تشغيل البحث
                     * بتغيير القيمة مؤقتًا.
                     */
                    const current =
                      query;

                    setQuery(
                      "",
                    );

                    window.setTimeout(
                      () => {
                        setQuery(
                          current,
                        );
                      },
                      0,
                    );
                  }}
                  className="
                    mt-3
                    rounded-xl
                    bg-orange-500
                    px-4
                    py-2
                    text-xs
                    font-bold
                    text-white
                    transition

                    hover:bg-orange-600
                    active:scale-95
                  "
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : results.length >
              0 ? (
              <ul
                className="space-y-1"
                aria-label="نتائج البحث"
              >
                {results.map(
                  (
                    recipe,
                    index,
                  ) => {
                    const active =
                      index ===
                      activeIndex;

                    const meta =
                      [
                        recipe.country,
                        recipe.category,
                      ]
                        .filter(
                          Boolean,
                        )
                        .join(
                          " • ",
                        );

                    return (
                      <li
                        key={
                          recipe.slug ||
                          recipe.id
                        }
                      >
                        <Link
                          href={`/recipe/${encodeURIComponent(
                            recipe.slug,
                          )}`}
                          prefetch={
                            false
                          }
                          onClick={
                            close
                          }
                          onMouseEnter={() => {
                            setActiveIndex(
                              index,
                            );
                          }}
                          onFocus={() => {
                            setActiveIndex(
                              index,
                            );
                          }}
                          className={`
                            flex
                            touch-manipulation
                            items-center
                            gap-3
                            rounded-2xl
                            border
                            px-3
                            py-3
                            transition
                            duration-150

                            ${
                              active
                                ? "border-orange-500/40 bg-orange-500/10"
                                : "border-transparent hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                            }
                          `}
                        >
                          <span
                            className={`
                              grid
                              h-10
                              w-10
                              shrink-0
                              place-items-center
                              rounded-xl

                              ${
                                active
                                  ? "bg-orange-500 text-white"
                                  : "bg-slate-100 text-slate-500 dark:bg-white/5 dark:text-slate-300"
                              }
                            `}
                          >
                            <ChefHat
                              size={
                                18
                              }
                              aria-hidden="true"
                            />
                          </span>

                          <span
                            className="
                              min-w-0
                              flex-1
                            "
                          >
                            <span
                              className="
                                line-clamp-2
                                block
                                text-[13px]
                                font-black
                                leading-6
                                text-slate-900

                                dark:text-white
                              "
                            >
                              {
                                recipe.title
                              }
                            </span>

                            {meta && (
                              <span
                                className="
                                  mt-0.5
                                  block
                                  truncate
                                  text-[10px]
                                  font-semibold
                                  text-slate-500

                                  dark:text-slate-400
                                "
                              >
                                {
                                  meta
                                }
                              </span>
                            )}
                          </span>

                          <ArrowUpLeft
                            size={
                              16
                            }
                            aria-hidden="true"
                            className="
                              shrink-0
                              text-orange-500
                            "
                          />
                        </Link>
                      </li>
                    );
                  },
                )}
              </ul>
            ) : (
              <div
                className="
                  px-4
                  py-8
                  text-center
                  text-sm
                  font-bold
                  text-slate-500

                  dark:text-slate-400
                "
              >
                لم نجد وصفة مطابقة.
                جرّب كلمة أبسط.
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}