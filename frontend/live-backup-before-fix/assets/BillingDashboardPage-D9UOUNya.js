import { C as e, m as t, w as n, x as r, y as i } from "./index-D9iOW1h8.js";
import { t as a } from "./proxy-BuaZjP6Z.js";
import { t as o } from "./use-reduced-motion-DBHp066t.js";
import {
  G as s,
  K as c,
  Z as l,
  a as u,
  b as d,
  dt as f,
  f as p,
  ft as m,
  g as h,
  n as g,
  o as ee,
} from "./fi-BRIJ0Gcm.js";
import { n as te, t as ne } from "./MobileHeader-PXgN6CIQ.js";
import { t as _ } from "./Surface-CgVmhtrI.js";
import {
  a as re,
  i as v,
  n as ie,
  o as ae,
  r as oe,
  s as se,
  t as y,
} from "./billing.api-DXHiuz-2.js";
import { t as ce } from "./PageEyebrow-C_OctKNT.js";
var b = n(e(), 1),
  x = t(),
  S = [100, 200, 300, 400, 500, 1e3];
function C({
  onClose: e,
  onContinue: t,
  currentBalance: n = null,
  loading: r = !1,
  error: i = ``,
}) {
  let [s, c] = (0, b.useState)(`500`),
    p = o();
  (0, b.useEffect)(() => {
    let t = document.body.style.overflow;
    document.body.style.overflow = `hidden`;
    let n = (t) => {
      t.key === `Escape` && !r && e();
    };
    return (
      window.addEventListener(`keydown`, n),
      () => {
        ((document.body.style.overflow = t),
          window.removeEventListener(`keydown`, n));
      }
    );
  }, [e, r]);
  let m = Number(s),
    h = /^\d+$/.test(s) && Number.isSafeInteger(m) && m >= 100 && m <= 5e4;
  return (0, x.jsx)(`div`, {
    className: `fixed inset-0 z-[100] overflow-y-auto bg-black/70 p-3 backdrop-blur-md sm:p-5`,
    onMouseDown: (t) => {
      t.target === t.currentTarget && !r && e();
    },
    children: (0, x.jsx)(`div`, {
      className: `flex min-h-full items-center justify-center`,
      children: (0, x.jsxs)(a.section, {
        role: `dialog`,
        "aria-modal": `true`,
        "aria-labelledby": `add-balance-title`,
        initial: !p && { opacity: 0, y: 12, scale: 0.99 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: p ? void 0 : { opacity: 0, y: 8, scale: 0.99 },
        transition: { duration: 0.18 },
        className: `relative w-full max-w-[860px] overflow-hidden rounded-[24px] border border-white/15 bg-[#17191C] text-white shadow-[0_30px_100px_rgba(0,0,0,0.58)] sm:rounded-[28px]`,
        children: [
          (0, x.jsx)(`div`, {
            className: `pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_0%_0%,rgba(255,255,255,0.07),transparent_70%)]`,
          }),
          (0, x.jsx)(`button`, {
            type: `button`,
            onClick: e,
            disabled: r,
            "aria-label": `Close add balance dialog`,
            className: `absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white/60 transition hover:bg-white/[0.12] hover:text-white disabled:opacity-40 sm:right-5 sm:top-5`,
            children: (0, x.jsx)(f, { size: 17 }),
          }),
          (0, x.jsxs)(`div`, {
            className: `relative grid md:min-h-[430px] md:grid-cols-[0.85fr_1.15fr]`,
            children: [
              (0, x.jsxs)(`aside`, {
                className: `relative hidden flex-col justify-between border-r border-white/10 bg-white/[0.025] p-8 md:flex lg:p-10`,
                children: [
                  (0, x.jsxs)(`div`, {
                    children: [
                      (0, x.jsx)(`p`, {
                        className: `text-base font-bold tracking-[0.22em] text-white`,
                        children: `RIO`,
                      }),
                      (0, x.jsx)(`p`, {
                        className: `mt-1 text-[9px] uppercase tracking-[0.22em] text-white/35`,
                        children: `Career Intelligence`,
                      }),
                    ],
                  }),
                  (0, x.jsxs)(`div`, {
                    className: `my-10 max-w-[290px]`,
                    children: [
                      (0, x.jsx)(`div`, {
                        className: `mb-5 h-1 w-12 rounded-full bg-white`,
                      }),
                      (0, x.jsxs)(`h2`, {
                        className: `text-4xl font-semibold leading-[1.02] tracking-[-0.045em]`,
                        children: [
                          `Add balance,`,
                          (0, x.jsx)(`span`, {
                            className: `mt-2 block font-serif font-normal italic text-white/65`,
                            children: `keep moving.`,
                          }),
                        ],
                      }),
                      (0, x.jsx)(`p`, {
                        className: `mt-5 text-sm leading-6 text-white/45`,
                        children: `Top up your RIO balance securely and continue using your services without interruption.`,
                      }),
                    ],
                  }),
                  (0, x.jsxs)(`div`, {
                    className: `flex items-center gap-2 text-[11px] text-white/40`,
                    children: [
                      (0, x.jsx)(l, { size: 14 }),
                      `Secure payment powered by Razorpay`,
                    ],
                  }),
                ],
              }),
              (0, x.jsxs)(`div`, {
                className: `min-w-0 p-4 pt-16 sm:p-6 sm:pt-16 md:p-8 md:pt-10 lg:p-10 lg:pt-10`,
                children: [
                  (0, x.jsxs)(`div`, {
                    className: `mb-6 md:mb-7`,
                    children: [
                      (0, x.jsx)(`p`, {
                        className: `text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45`,
                        children: `Account balance`,
                      }),
                      (0, x.jsx)(`h3`, {
                        id: `add-balance-title`,
                        className: `mt-2 text-2xl font-semibold tracking-[-0.04em] sm:text-3xl`,
                        children: `Add funds`,
                      }),
                      (0, x.jsx)(`p`, {
                        className: `mt-2 max-w-md text-sm leading-5 text-white/45`,
                        children: `Select a top-up amount or enter a custom value.`,
                      }),
                    ],
                  }),
                  (0, x.jsxs)(`div`, {
                    className: `mb-6 flex items-center justify-between gap-4 border-y border-white/10 py-4`,
                    children: [
                      (0, x.jsxs)(`div`, {
                        children: [
                          (0, x.jsx)(`p`, {
                            className: `text-xs text-white/45`,
                            children: `Current balance`,
                          }),
                          (0, x.jsxs)(`p`, {
                            className: `mt-1 text-xl font-semibold tabular-nums`,
                            children: [
                              n == null
                                ? `—`
                                : Number(n).toLocaleString(`en-IN`),
                              (0, x.jsx)(`span`, {
                                className: `ml-2 text-xs font-normal text-white/40`,
                                children: `INR`,
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, x.jsx)(`span`, {
                        className: `rounded-full border border-emerald-300/20 px-3 py-1.5 text-[10px] font-medium text-emerald-200/90`,
                        children: `Secured`,
                      }),
                    ],
                  }),
                  (0, x.jsxs)(`p`, {
                    className: `text-xs font-medium text-white/65`,
                    children: [
                      `Select amount `,
                      (0, x.jsx)(`span`, {
                        className: `text-white/35`,
                        children: `(INR)`,
                      }),
                    ],
                  }),
                  (0, x.jsx)(`div`, {
                    className: `mt-3 grid grid-cols-3 gap-2 sm:gap-3`,
                    children: S.map((e) => {
                      let t = s === String(e);
                      return (0, x.jsxs)(
                        `button`,
                        {
                          type: `button`,
                          disabled: r,
                          onClick: () => c(String(e)),
                          "aria-pressed": t,
                          className: `min-h-10 rounded-xl border px-2 py-2.5 text-sm font-semibold transition ${t ? `border-white bg-white text-[#17191C]` : `border-white/10 bg-white/[0.025] text-white/75 hover:border-white/25 hover:bg-white/[0.06]`} disabled:cursor-not-allowed disabled:opacity-50`,
                          children: [`₹`, e.toLocaleString(`en-IN`)],
                        },
                        e,
                      );
                    }),
                  }),
                  (0, x.jsx)(`label`, {
                    htmlFor: `custom-topup-amount`,
                    className: `mt-5 block text-xs font-medium text-white/65`,
                    children: `Custom amount`,
                  }),
                  (0, x.jsxs)(`div`, {
                    className: `mt-2 flex items-center rounded-xl border border-white/15 bg-black/20 px-4 transition focus-within:border-white/35`,
                    children: [
                      (0, x.jsx)(`span`, {
                        className: `mr-3 text-lg text-white/40`,
                        children: `₹`,
                      }),
                      (0, x.jsx)(`input`, {
                        id: `custom-topup-amount`,
                        type: `number`,
                        min: `100`,
                        max: `50000`,
                        step: `1`,
                        inputMode: `numeric`,
                        value: s,
                        disabled: r,
                        onChange: (e) => c(e.target.value),
                        placeholder: `100–50,000`,
                        className: `w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-white/25 disabled:opacity-50`,
                      }),
                    ],
                  }),
                  (0, x.jsx)(`p`, {
                    className: `mt-2 text-[10px] leading-4 text-white/35`,
                    children: `Minimum ₹100 · Maximum ₹50,000 · Whole rupees only`,
                  }),
                  i &&
                    (0, x.jsx)(`p`, {
                      role: `alert`,
                      className: `mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-3 py-2.5 text-xs leading-5 text-red-200`,
                      children: i,
                    }),
                  (0, x.jsx)(`button`, {
                    type: `button`,
                    onClick: () => t(m),
                    disabled: r || !h,
                    className: `mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#17191C] transition hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-40`,
                    children: r
                      ? (0, x.jsxs)(x.Fragment, {
                          children: [
                            (0, x.jsx)(`span`, {
                              className: `h-4 w-4 animate-spin rounded-full border-2 border-[#17191C]/25 border-t-[#17191C]`,
                            }),
                            `Processing…`,
                          ],
                        })
                      : (0, x.jsxs)(x.Fragment, {
                          children: [
                            (0, x.jsx)(d, { size: 16 }),
                            `Pay ₹`,
                            Number.isFinite(m)
                              ? m.toLocaleString(`en-IN`)
                              : `0`,
                            (0, x.jsx)(u, { size: 16 }),
                          ],
                        }),
                  }),
                  (0, x.jsxs)(`p`, {
                    className: `mt-3 flex items-center justify-center gap-2 text-[10px] text-white/35 md:hidden`,
                    children: [
                      (0, x.jsx)(l, { size: 13 }),
                      ` Secure payment powered by Razorpay`,
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
var w = [0.22, 1, 0.36, 1],
  le = () =>
    new Promise((e) => {
      if (window.Razorpay) {
        e(!0);
        return;
      }
      let t = document.querySelector(
        `script[src="https://checkout.razorpay.com/v1/checkout.js"]`,
      );
      if (t) {
        (t.addEventListener(`load`, () => e(!0), { once: !0 }),
          t.addEventListener(`error`, () => e(!1), { once: !0 }));
        return;
      }
      let n = document.createElement(`script`);
      ((n.src = `https://checkout.razorpay.com/v1/checkout.js`),
        (n.async = !0),
        (n.onload = () => e(!0)),
        (n.onerror = () => e(!1)),
        document.body.appendChild(n));
    }),
  T = (e) => e?.data?.data ?? e?.data ?? e ?? {},
  E = (e) => {
    let t = T(e);
    return Array.isArray(t)
      ? t
      : Array.isArray(t?.transactions)
        ? t.transactions
        : Array.isArray(t?.data)
          ? t.data
          : Array.isArray(t?.items)
            ? t.items
            : [];
  },
  ue = (e) => {
    let t = Number(e);
    return Number.isFinite(t)
      ? t.toLocaleString(`en-IN`, { maximumFractionDigits: 2 })
      : `—`;
  },
  de = (e) => {
    let t = Number(e);
    return Number.isFinite(t)
      ? `₹${t.toLocaleString(`en-IN`, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `—`;
  },
  D = (e) => {
    let t = Number(e);
    return Number.isFinite(t)
      ? (t / 100).toLocaleString(`en-IN`, {
          style: `currency`,
          currency: `INR`,
          maximumFractionDigits: 2,
        })
      : `—`;
  },
  fe = (e) => {
    let t = Number(e);
    return Number.isFinite(t)
      ? t.toLocaleString(`en-IN`, {
          style: `currency`,
          currency: `INR`,
          maximumFractionDigits: 2,
        })
      : `—`;
  },
  pe = (e) => {
    if (!e) return `Date unavailable`;
    let t = new Date(e);
    return Number.isNaN(t.getTime())
      ? `Date unavailable`
      : t.toLocaleDateString(`en-IN`, {
          day: `numeric`,
          month: `short`,
          year: `numeric`,
        });
  },
  O = (e) => String(e?.status ?? e?.paymentStatus ?? `unknown`).toLowerCase(),
  k = [`paid`, `completed`, `captured`, `success`, `succeeded`];
function me({ status: e }) {
  let t = String(e || `unknown`).toLowerCase(),
    n = k.includes(t),
    r = [`pending`, `created`, `processing`].includes(t);
  return (0, x.jsxs)(`span`, {
    className: `inline-flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.035] px-2.5 py-1 text-[10px] font-medium capitalize text-[#B9BBC2]`,
    children: [
      (0, x.jsx)(n ? p : r ? h : m, { size: 12 }),
      t.replaceAll(`-`, ` `),
    ],
  });
}
function A({ user: e, setUser: t }) {
  let n = i(),
    [l, f] = r(),
    m = o(),
    [S, A] = (0, b.useState)(!1),
    [j, he] = (0, b.useState)(
      () => localStorage.getItem(`rio-sidebar-open`) !== `false`,
    ),
    [M, ge] = (0, b.useState)(null),
    [N, _e] = (0, b.useState)([]),
    [P, F] = (0, b.useState)(null),
    [I, L] = (0, b.useState)(0),
    [R, z] = (0, b.useState)(!0),
    [B, V] = (0, b.useState)(``),
    [ve, H] = (0, b.useState)(!1),
    [U, W] = (0, b.useState)(!1),
    [G, K] = (0, b.useState)(``),
    [ye, q] = (0, b.useState)(!1),
    J = (0, b.useRef)(null);
  ((0, b.useEffect)(() => {
    if (l.get(`addBalance`) !== `1`) return;
    (K(``), H(!0));
    let e = new URLSearchParams(l);
    (e.delete(`addBalance`), f(e, { replace: !0 }));
  }, [l, f]),
    (0, b.useEffect)(() => {
      let e = l.get(`continuePayment`);
      if (!e || !P?.transactionId || e !== P.transactionId || U) return;
      let t = new URLSearchParams(l);
      (t.delete(`continuePayment`), f(t, { replace: !0 }), J.current?.());
    }, [l, f, P?.transactionId, U]));
  let be = e?.name?.trim()?.split(/\s+/)?.[0] || `there`,
    Y = (0, b.useCallback)(async () => {
      (z(!0), V(``));
      try {
        let [e, n, r] = await Promise.allSettled([
          v(),
          re({ page: 1, pageSize: 5 }),
          ae(),
        ]);
        if (e.status === `fulfilled`) {
          let n = T(e.value);
          ge(n);
          let r = n?.balance ?? n?.currentBalance ?? n?.availableBalance;
          r != null &&
            Number.isFinite(Number(r)) &&
            (t?.((e) => ({ ...(e || {}), balance: Number(r) })),
            window.dispatchEvent(new Event(`rio:balance-updated`)));
        }
        if (n.status === `fulfilled`) {
          let e = E(n.value);
          _e(e);
        }
        if (r.status === `fulfilled`) {
          let e = T(r.value);
          F(e && e.transactionId ? e : null);
        } else if (n.status === `fulfilled`) {
          let e = E(n.value).find((e) => {
            let t = O(e),
              n = e?.expiresAt ? new Date(e.expiresAt).getTime() : 0;
            return (
              e?.source === `billing` &&
              [`pending`, `created`, `processing`].includes(t) &&
              Number.isFinite(n) &&
              n > Date.now()
            );
          });
          F(e || null);
        }
        e.status === `rejected` && n.status === `rejected`
          ? V(
              e.reason?.response?.data?.message ||
                n.reason?.response?.data?.message ||
                `We couldn't load your billing information.`,
            )
          : e.status === `rejected`
            ? V(
                e.reason?.response?.data?.message ||
                  `Your billing summary couldn't be loaded.`,
              )
            : n.status === `rejected` &&
              V(
                n.reason?.response?.data?.message ||
                  `Recent transactions couldn't be loaded.`,
              );
      } catch {
        V(`Something went wrong while loading billing data.`);
      } finally {
        z(!1);
      }
    }, [t]),
    X = async (e, t = null) => {
      if (!U) {
        (W(!0), K(``));
        try {
          if (!(await le()))
            throw Error(
              `Razorpay Checkout could not be loaded. Please try again.`,
            );
          let n = t ? { success: !0, data: t } : await oe({ amount: e }),
            r = n?.data;
          if (
            n?.success !== !0 ||
            !r?.orderId ||
            !r?.keyId ||
            !Number.isSafeInteger(r?.amount) ||
            r.amount <= 0
          )
            throw Error(`The payment order response is invalid.`);
          (await new Promise((t, n) => {
            let i = !1,
              a,
              o = (e) => {
                i || ((i = !0), e());
              };
            ((a = new window.Razorpay({
              key: r.keyId,
              amount: r.amount,
              currency: r.currency || `INR`,
              name: `RIO`,
              description: `RIO balance top-up of ₹${(e ?? r.amount / 100).toLocaleString(`en-IN`)}`,
              order_id: r.orderId,
              handler: async (e) => {
                try {
                  if (
                    e?.razorpay_order_id !== r.orderId ||
                    !e?.razorpay_payment_id ||
                    !e?.razorpay_signature
                  )
                    throw Error(
                      `Razorpay returned incomplete payment details.`,
                    );
                  let n = await se({
                      orderId: e.razorpay_order_id,
                      paymentId: e.razorpay_payment_id,
                      signature: e.razorpay_signature,
                    }),
                    i = n?.data;
                  if (
                    n?.success !== !0 ||
                    i?.status !== `paid` ||
                    i?.balanceCreditStatus !== `completed`
                  )
                    throw Error(
                      `Payment received, but balance credit is not confirmed. Please refresh billing before retrying.`,
                    );
                  o(t);
                } catch (e) {
                  o(() => n(e));
                }
              },
              modal: {
                ondismiss: async () => {
                  try {
                    (r.transactionId && (await y(r.transactionId)),
                      await Y(),
                      o(t));
                  } catch (e) {
                    (await Y(), o(() => n(e)));
                  }
                },
              },
              theme: { color: `#17191C` },
            })),
              a.on(`payment.failed`, (e) => {
                o(() =>
                  n(
                    Error(
                      e?.error?.description ||
                        `Payment failed. Please try again.`,
                    ),
                  ),
                );
              }),
              a.open());
          }),
            H(!1),
            await Y());
        } catch (e) {
          let t =
            e?.response?.data?.message ||
            e?.message ||
            `Unable to complete the payment. Please try again.`;
          K(t);
        } finally {
          W(!1);
        }
      }
    },
    Z = async () => {
      if (P?.transactionId && !U) {
        (K(``), W(!0));
        try {
          let e = T(await ie(P.transactionId));
          if (!e?.orderId || !e?.keyId || !Number.isSafeInteger(e?.amount))
            throw Error(`The existing payment order response is invalid.`);
          (W(!1), await X(e.amount / 100, e));
        } catch (e) {
          (K(
            e?.response?.data?.message ||
              e?.message ||
              `Unable to continue this payment.`,
          ),
            W(!1),
            await Y());
        }
      }
    };
  J.current = Z;
  let xe = async () => {
    if (P?.transactionId && !U) {
      (q(!1), W(!0), K(``));
      try {
        (await y(P.transactionId), await Y());
      } catch (e) {
        (K(
          e?.response?.data?.message ||
            e?.message ||
            `Unable to cancel this payment.`,
        ),
          await Y());
      } finally {
        W(!1);
      }
    }
  };
  ((0, b.useEffect)(() => {
    Y();
  }, [Y]),
    (0, b.useEffect)(() => {
      if (!P?.expiresAt) {
        L(0);
        return;
      }
      let e,
        t = () => {
          let t = new Date(P.expiresAt).getTime(),
            n = Math.max(0, Math.ceil((t - Date.now()) / 1e3));
          (L(n),
            n === 0 &&
              (e && window.clearInterval(e),
              (async () => {
                (await Y(), await Y());
              })()));
        };
      return (
        t(),
        (e = window.setInterval(t, 1e3)),
        () => window.clearInterval(e)
      );
    }, [P?.expiresAt, Y]));
  let Se = `${String(Math.floor(I / 60)).padStart(2, `0`)}:${String(I % 60).padStart(2, `0`)}`,
    Q = (0, b.useMemo)(() => {
      let t =
        M?.balance ?? M?.currentBalance ?? M?.availableBalance ?? e?.balance;
      return t != null && Number.isFinite(Number(t)) ? Number(t) : null;
    }, [M, e?.balance]),
    Ce = (0, b.useMemo)(() => N.filter((e) => k.includes(O(e))), [N]),
    $ =
      M?.successfulPayments ??
      M?.successfulTransactions ??
      M?.paidCount ??
      Ce.length,
    we = M?.totalTopUpAmount,
    Te = [
      {
        label: `Available balance`,
        value: Q === null ? `—` : de(Q),
        detail: `Your current account balance`,
        Icon: d,
      },
      {
        label: `Successful transactions`,
        value: ue($),
        detail: `Completed top-ups and balance activity`,
        Icon: p,
      },
      {
        label: `Total top-ups`,
        value: D(we),
        detail: `Total amount added through successful payments`,
        Icon: ee,
      },
    ];
  return (0, x.jsxs)(`div`, {
    className: `relative min-h-screen overflow-x-clip bg-[#17191C] text-white`,
    children: [
      (0, x.jsx)(`div`, {
        "aria-hidden": `true`,
        className: `pointer-events-none fixed inset-0`,
        children: (0, x.jsx)(`div`, {
          className: `absolute inset-0`,
          style: {
            background: `radial-gradient(ellipse 70% 55% at 88% 4%, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.02) 42%, transparent 72%), radial-gradient(ellipse 65% 55% at 0% 92%, rgba(255,255,255,0.03) 0%, transparent 70%), linear-gradient(135deg, #191b1e 0%, #17191c 48%, #141619 100%)`,
          },
        }),
      }),
      (0, x.jsx)(ne, { onOpenNavigation: () => A(!0), user: e }),
      (0, x.jsxs)(`div`, {
        className: `relative z-10 flex min-h-screen`,
        children: [
          (0, x.jsx)(te, {
            mobileOpen: S,
            setMobileOpen: A,
            user: e,
            setUser: t,
            sidebarOpen: j,
            setSidebarOpen: he,
          }),
          (0, x.jsx)(`main`, {
            className: `min-w-0 flex-1 transition-[margin-left] duration-300 ease-out ${j ? `md:ml-[250px]` : `md:ml-[76px]`}`,
            children: (0, x.jsxs)(`div`, {
              className: `mx-auto w-full max-w-[1480px] px-5 pb-22 pt-[88px] sm:px-7 sm:pb-10 lg:px-10 lg:pb-12 lg:pt-10`,
              children: [
                (0, x.jsxs)(a.section, {
                  initial: !m && { opacity: 0, y: 10 },
                  animate: { opacity: 1, y: 0 },
                  transition: { duration: 0.4, ease: w },
                  className: `mb-9 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between`,
                  children: [
                    (0, x.jsxs)(`div`, {
                      className: `max-w-3xl`,
                      children: [
                        (0, x.jsx)(ce, {
                          className: `mb-4`,
                          children: `Billing & account`,
                        }),
                        (0, x.jsxs)(`h1`, {
                          className: `text-[38px] font-semibold leading-[0.98] tracking-[-0.055em] sm:text-[50px] lg:text-[58px]`,
                          children: [
                            `Your balance,`,
                            (0, x.jsx)(`span`, {
                              className: `mt-2 block font-serif font-normal italic tracking-[-0.055em] text-[#A1A1AA]`,
                              children: `clearly accounted for.`,
                            }),
                          ],
                        }),
                        (0, x.jsxs)(`p`, {
                          className: `mt-5 max-w-2xl text-[14px] leading-7 text-[#92949B] sm:text-[15px]`,
                          children: [
                            `Welcome back, `,
                            be,
                            `. Review your available balance and keep track of your billing activity in one place.`,
                          ],
                        }),
                      ],
                    }),
                    (0, x.jsxs)(`div`, {
                      className: `hidden items-center gap-3 sm:flex`,
                      children: [
                        (0, x.jsxs)(`button`, {
                          type: `button`,
                          onClick: () => n(`/billing/history`),
                          className: `group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-[#D4D4D8] transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 sm:px-5`,
                          children: [
                            (0, x.jsx)(h, { size: 14 }),
                            `Transaction history`,
                          ],
                        }),
                        (0, x.jsxs)(`button`, {
                          type: `button`,
                          onClick: () => {
                            (K(``), H(!0));
                          },
                          className: `group inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-semibold text-[#17191C] shadow-[0_10px_30px_rgba(255,255,255,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(255,255,255,0.12)] focus:outline-none focus:ring-2 focus:ring-white/30 sm:px-5`,
                          children: [
                            (0, x.jsx)(s, { size: 14, className: `` }),
                            `Add Balance`,
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                B &&
                  (0, x.jsxs)(`div`, {
                    role: `alert`,
                    className: `mb-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm text-[#D4D4D8]`,
                    children: [
                      (0, x.jsx)(g, {
                        className: `mt-0.5 shrink-0 text-[#A1A1AA]`,
                        size: 16,
                      }),
                      (0, x.jsx)(`span`, {
                        className: `min-w-0 flex-1 leading-6`,
                        children: B,
                      }),
                      (0, x.jsx)(`button`, {
                        type: `button`,
                        onClick: () => void Y(),
                        className: `shrink-0 text-xs font-semibold text-white underline underline-offset-4`,
                        children: `Retry`,
                      }),
                    ],
                  }),
                P &&
                  (0, x.jsx)(`section`, {
                    className: `mb-6 rounded-2xl border border-amber-400/25 bg-amber-400/[0.06] p-5`,
                    children: (0, x.jsxs)(`div`, {
                      className: `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`,
                      children: [
                        (0, x.jsxs)(`div`, {
                          children: [
                            (0, x.jsx)(`p`, {
                              className: `text-sm font-semibold text-amber-300`,
                              children: `Payment pending`,
                            }),
                            (0, x.jsx)(`p`, {
                              className: `mt-1 text-sm text-white/70`,
                              children: `Complete this payment before it expires.`,
                            }),
                            (0, x.jsxs)(`p`, {
                              className: `mt-2 text-xs text-white/50`,
                              children: [`Transaction: `, P.transactionId],
                            }),
                            (0, x.jsx)(`button`, {
                              type: `button`,
                              onClick: () =>
                                n(
                                  `/billing/history?transaction=${encodeURIComponent(P.transactionId)}`,
                                ),
                              className: `mt-2 text-xs font-semibold text-amber-200 underline underline-offset-4 hover:text-amber-100`,
                              children: `View this payment in History`,
                            }),
                            G &&
                              (0, x.jsx)(`p`, {
                                role: `alert`,
                                className: `mt-2 max-w-xl text-xs text-rose-300`,
                                children: G,
                              }),
                          ],
                        }),
                        (0, x.jsxs)(`div`, {
                          className: `flex flex-col gap-3 sm:items-end`,
                          children: [
                            (0, x.jsxs)(`div`, {
                              className: `sm:text-right`,
                              children: [
                                (0, x.jsx)(`p`, {
                                  className: `text-xs text-white/55`,
                                  children: `Time remaining`,
                                }),
                                (0, x.jsx)(`p`, {
                                  className: `mt-1 text-xl font-semibold tabular-nums text-white`,
                                  children: Se,
                                }),
                              ],
                            }),
                            (0, x.jsxs)(`div`, {
                              className: `flex flex-wrap gap-2`,
                              children: [
                                (0, x.jsx)(`button`, {
                                  type: `button`,
                                  disabled: U || I <= 0,
                                  onClick: () => void Z(),
                                  className: `rounded-lg bg-amber-300 px-4 py-2 text-xs font-semibold text-black transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50`,
                                  children: U
                                    ? `Please wait…`
                                    : `Continue Payment`,
                                }),
                                (0, x.jsx)(`button`, {
                                  type: `button`,
                                  disabled: U,
                                  onClick: () => q(!0),
                                  className: `rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50`,
                                  children: `Cancel Payment`,
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                (0, x.jsx)(`section`, {
                  "aria-label": `Billing overview`,
                  className: `mb-9`,
                  children: (0, x.jsx)(`div`, {
                    className: `grid gap-3 md:grid-cols-3`,
                    children: Te.map(
                      ({ label: e, value: t, detail: n, Icon: r }, i) =>
                        (0, x.jsx)(
                          a.div,
                          {
                            initial: !m && { opacity: 0, y: 10 },
                            animate: { opacity: 1, y: 0 },
                            transition: {
                              duration: 0.35,
                              delay: i * 0.055,
                              ease: w,
                            },
                            children: (0, x.jsxs)(_, {
                              className: `h-full p-5 sm:p-6`,
                              children: [
                                (0, x.jsxs)(`div`, {
                                  className: `flex items-start justify-between gap-3`,
                                  children: [
                                    (0, x.jsx)(`p`, {
                                      className: `text-[9px] font-semibold uppercase tracking-[0.15em] text-[#777A82]`,
                                      children: e,
                                    }),
                                    (0, x.jsx)(r, {
                                      size: 17,
                                      className: `shrink-0 text-[#92949B]`,
                                    }),
                                  ],
                                }),
                                (0, x.jsx)(`p`, {
                                  className: `mt-5 break-words text-[30px] font-semibold tracking-[-0.05em] sm:text-[36px]`,
                                  children: R
                                    ? (0, x.jsx)(`span`, {
                                        className: `inline-block h-9 w-24 animate-pulse rounded-lg bg-white/[0.08]`,
                                      })
                                    : t,
                                }),
                                (0, x.jsx)(`p`, {
                                  className: `mt-2 text-[11px] leading-5 text-[#71747C]`,
                                  children: n,
                                }),
                              ],
                            }),
                          },
                          e,
                        ),
                    ),
                  }),
                }),
                (0, x.jsxs)(`section`, {
                  className: `mb-10`,
                  children: [
                    (0, x.jsx)(`div`, {
                      className: `mb-5 flex items-end justify-between gap-4`,
                      children: (0, x.jsxs)(`div`, {
                        className: `w-full text-center sm:w-auto sm:text-left`,
                        children: [
                          (0, x.jsx)(`p`, {
                            className: `text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]`,
                            children: `Account activity`,
                          }),
                          (0, x.jsx)(`h2`, {
                            className: `mt-2 text-[25px] font-semibold tracking-[-0.04em] sm:text-[29px]`,
                            children: `Recent transactions.`,
                          }),
                        ],
                      }),
                    }),
                    (0, x.jsx)(_, {
                      children: R
                        ? (0, x.jsx)(`div`, {
                            className: `divide-y divide-white/[0.07] px-5 sm:px-7`,
                            children: [1, 2, 3].map((e) =>
                              (0, x.jsxs)(
                                `div`,
                                {
                                  className: `flex items-center gap-4 py-5`,
                                  children: [
                                    (0, x.jsx)(`div`, {
                                      className: `h-10 w-10 animate-pulse rounded-full bg-white/[0.06]`,
                                    }),
                                    (0, x.jsxs)(`div`, {
                                      className: `min-w-0 flex-1 space-y-2`,
                                      children: [
                                        (0, x.jsx)(`div`, {
                                          className: `h-3 w-40 animate-pulse rounded bg-white/[0.07]`,
                                        }),
                                        (0, x.jsx)(`div`, {
                                          className: `h-2.5 w-28 animate-pulse rounded bg-white/[0.04]`,
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                e,
                              ),
                            ),
                          })
                        : N.length > 0
                          ? (0, x.jsx)(`div`, {
                              className: `px-5 sm:px-7`,
                              children: N.map((e, t) =>
                                (0, x.jsxs)(
                                  `div`,
                                  {
                                    className: `flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between ${t ? `border-t border-white/[0.07]` : ``}`,
                                    children: [
                                      (0, x.jsxs)(`div`, {
                                        className: `flex min-w-0 items-start gap-3`,
                                        children: [
                                          (0, x.jsx)(`span`, {
                                            className: `mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] text-[#92949B]`,
                                            children: (0, x.jsx)(d, {
                                              size: 16,
                                            }),
                                          }),
                                          (0, x.jsxs)(`div`, {
                                            className: `min-w-0 flex-1`,
                                            children: [
                                              (0, x.jsx)(`p`, {
                                                className: `truncate text-sm font-semibold text-[#D4D4D8]`,
                                                children:
                                                  e?.description ||
                                                  e?.resourceName ||
                                                  e?.serviceName ||
                                                  (e?.source === `balance` ||
                                                  e?.amountUnit ===
                                                    `balance-unit`
                                                    ? String(
                                                        e?.action ||
                                                          `Balance deduction`,
                                                      )
                                                        .replaceAll(`-`, ` `)
                                                        .replace(/^./, (e) =>
                                                          e.toUpperCase(),
                                                        )
                                                    : e?.planName ||
                                                      `Balance purchase`),
                                              }),
                                              (0, x.jsx)(`p`, {
                                                className: `mt-1.5 text-[10px] text-[#777B85]`,
                                                children: pe(
                                                  e?.createdAt || e?.updatedAt,
                                                ),
                                              }),
                                            ],
                                          }),
                                        ],
                                      }),
                                      (0, x.jsxs)(`div`, {
                                        className: `flex items-center justify-between gap-4 pl-[52px] sm:pl-0`,
                                        children: [
                                          (0, x.jsx)(me, { status: O(e) }),
                                          (0, x.jsx)(`span`, {
                                            className: `text-sm font-semibold text-white`,
                                            children:
                                              e?.source === `balance` ||
                                              e?.amountUnit === `balance-unit`
                                                ? (0, x.jsxs)(`span`, {
                                                    className:
                                                      e?.type === `deduction`
                                                        ? `text-red-400`
                                                        : `text-emerald-300`,
                                                    children: [
                                                      e?.type === `deduction`
                                                        ? `−`
                                                        : `+`,
                                                      fe(e?.amount),
                                                    ],
                                                  })
                                                : D(
                                                    e?.amount ??
                                                      e?.amountInPaise,
                                                  ),
                                          }),
                                        ],
                                      }),
                                    ],
                                  },
                                  e?._id ||
                                    e?.transactionId ||
                                    `${e?.createdAt || `transaction`}-${t}`,
                                ),
                              ),
                            })
                          : (0, x.jsx)(`div`, {
                              className: `px-5 py-12 sm:px-7`,
                              children: (0, x.jsxs)(`div`, {
                                className: `flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-3 sm:text-left`,
                                children: [
                                  (0, x.jsx)(`span`, {
                                    className: `flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.025] text-[#858994]`,
                                    children: (0, x.jsx)(d, { size: 16 }),
                                  }),
                                  (0, x.jsxs)(`div`, {
                                    children: [
                                      (0, x.jsx)(`h3`, {
                                        className: `text-sm font-semibold text-[#D4D4D8]`,
                                        children: `Your transactions will appear here.`,
                                      }),
                                      (0, x.jsx)(`p`, {
                                        className: `mx-auto mt-1 max-w-xl text-xs leading-5 text-[#777B85] sm:mx-0`,
                                        children: `Once you have billing activity, you can review its amount, date, and payment status here.`,
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            }),
                    }),
                  ],
                }),
                (0, x.jsxs)(`footer`, {
                  className: `flex flex-col items-center gap-4 border-t border-white/[0.08] pt-7 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left`,
                  children: [
                    (0, x.jsxs)(`div`, {
                      className: `w-full sm:w-auto`,
                      children: [
                        (0, x.jsx)(`p`, {
                          className: `text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]`,
                          children: `Billing overview`,
                        }),
                        (0, x.jsx)(`h2`, {
                          className: `mt-2 text-xl font-semibold tracking-[-0.035em] sm:text-[23px]`,
                          children: `Your account, at a glance.`,
                        }),
                        (0, x.jsx)(`p`, {
                          className: `mx-auto mt-2 max-w-xl text-xs leading-5 text-[#777B85] sm:mx-0`,
                          children: `Your available balance and recent payment activity are displayed here.`,
                        }),
                      ],
                    }),
                    (0, x.jsxs)(`button`, {
                      type: `button`,
                      onClick: () => void Y(),
                      disabled: R,
                      className: `inline-flex items-center justify-center gap-2 self-center rounded-full bg-white px-5 py-3 text-xs font-semibold text-[#17191C] transition hover:-translate-y-0.5 hover:bg-[#E8E8EB] disabled:cursor-not-allowed disabled:opacity-50 sm:self-start`,
                      children: [
                        (0, x.jsx)(c, {
                          size: 14,
                          className: R ? `animate-spin` : ``,
                        }),
                        `Refresh billing`,
                        (0, x.jsx)(u, { size: 14 }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          }),
        ],
      }),
      (0, x.jsx)(`div`, {
        className: `fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.08] bg-[#111315]/90 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:hidden`,
        children: (0, x.jsxs)(`div`, {
          className: `flex items-center gap-2`,
          children: [
            (0, x.jsxs)(`button`, {
              type: `button`,
              onClick: () => n(`/billing/history`),
              className: `group flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-semibold text-[#D4D4D8] transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20`,
              children: [
                (0, x.jsx)(h, { size: 14 }),
                (0, x.jsx)(`span`, { children: `History` }),
              ],
            }),
            (0, x.jsxs)(`button`, {
              type: `button`,
              onClick: () => {
                (K(``), H(!0));
              },
              className: `flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-3 py-3 text-xs font-semibold text-[#17191C] shadow-[0_-10px_35px_rgba(0,0,0,0.22)] transition duration-200 hover:bg-[#E8E8EB] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-white/30`,
              children: [
                (0, x.jsx)(s, { size: 15 }),
                (0, x.jsx)(`span`, { children: `Add balance` }),
                (0, x.jsx)(u, { size: 14 }),
              ],
            }),
          ],
        }),
      }),
      ye &&
        (0, x.jsx)(`div`, {
          className: `fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm`,
          children: (0, x.jsxs)(`section`, {
            role: `alertdialog`,
            "aria-modal": `true`,
            "aria-labelledby": `cancel-payment-title`,
            className: `w-full max-w-md rounded-2xl border border-white/10 bg-[#151719] p-5 shadow-2xl sm:p-6`,
            children: [
              (0, x.jsxs)(`div`, {
                className: `flex items-start gap-3`,
                children: [
                  (0, x.jsx)(`span`, {
                    className: `grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-300/20 bg-amber-300/[.08] text-amber-200`,
                    children: (0, x.jsx)(g, { size: 19 }),
                  }),
                  (0, x.jsxs)(`div`, {
                    className: `min-w-0`,
                    children: [
                      (0, x.jsx)(`h2`, {
                        id: `cancel-payment-title`,
                        className: `text-base font-semibold text-white`,
                        children: `Cancel this payment?`,
                      }),
                      (0, x.jsx)(`p`, {
                        className: `mt-2 text-sm leading-6 text-[#A1A1AA]`,
                        children: `This checkout will be closed. If Razorpay has already captured or is still processing the payment, we will keep the transaction safe and reconcile its status.`,
                      }),
                      P?.transactionId &&
                        (0, x.jsxs)(`p`, {
                          className: `mt-3 break-all font-mono text-[11px] text-[#777B85]`,
                          children: [`Reference: `, P.transactionId],
                        }),
                    ],
                  }),
                ],
              }),
              G &&
                (0, x.jsx)(`p`, {
                  role: `alert`,
                  className: `mt-3 text-xs text-rose-300`,
                  children: G,
                }),
              (0, x.jsxs)(`div`, {
                className: `mt-6 flex justify-end gap-2`,
                children: [
                  (0, x.jsx)(`button`, {
                    type: `button`,
                    onClick: () => q(!1),
                    disabled: U,
                    className: `rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-[#D4D4D8] hover:bg-white/[.05] disabled:opacity-50`,
                    children: `Keep payment`,
                  }),
                  (0, x.jsx)(`button`, {
                    type: `button`,
                    onClick: () => void xe(),
                    disabled: U,
                    className: `rounded-xl bg-amber-300 px-4 py-2.5 text-xs font-semibold text-black hover:bg-amber-200 disabled:opacity-50`,
                    children: U ? `Cancelling…` : `Yes, cancel payment`,
                  }),
                ],
              }),
            ],
          }),
        }),
      ve &&
        (0, x.jsx)(C, {
          onClose: () => {
            U || (H(!1), K(``));
          },
          onContinue: X,
          currentBalance: Q,
          loading: U,
          error: G,
        }),
    ],
  });
}
export { A as default };
