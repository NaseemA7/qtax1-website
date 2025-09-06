// reviews.js
(() => {


    // ---- CONFIG ----
    const PLACE_ID = "ChIJO-W7CvrGxokRw-nJ96t51fs";
    const PLACE_URL = "https://maps.app.goo.gl/msnsGAmrp6cpBNxr9"; // optional; used for "Read on Google"
    const BUSINESS_NAME = "QTax1";

    async function fetchAggregate(placeId) {
        const resp = await fetch(`/api/review-aggregate?place_id=${encodeURIComponent(placeId)}`, { credentials: "omit" });
        if (!resp.ok) throw new Error("aggregate fetch failed");
        const j = await resp.json();
        return {
            average: Number(j.avg) || 0,
            count: Number(j.count) || 0,
            url: j.url || "",
            placeId: j.placeId || placeId
        };
    }

    // Static fallback (swap with API response later)
    const STATIC_REVIEWS = [
        { name: "Mike N.", rating: 5, date: "2025-05-12", text: "Great service here. Good tax office to do personal taxes and business . Highly recommend", profileUrl: "" },
        { name: "Jess Simpson", rating: 5, date: "2021-07-30", text: "Love this place. They always go above and beyond to help you. They explain everything so nicely. Sometimes there is a wait, but it’s definitely worth it! I cannot recommend this place enough. I am so grateful for finding this hidden gem.", profileUrl: "" },
        { name: "Jennifer", rating: 5, date: "2025-03-18", text: "Very professional, super quick tax prep - recommend to anyone especially sole proprietors. Very reasonable prices as well!", profileUrl: "" },
        { name: "Bill", rating: 5, date: "2025-05-03", text: "Despite it being the peak of tax season, I was in and out in no time.  The staff is extremely energetic and friendly.  I will definitely go back and highly recommend.", profileUrl: "" },
        { name: "Rashad Utqi", rating: 5, date: "2025-07-22", text: "TurboTax said I owed 2,325.00. I’m a college student. I checked in with my guys here and they fixed it all up for me.", profileUrl: "" },
        { name: "Jenny T.", rating: 5, date: "2025-03-10", text: "Transparent pricing and clear guidance. The best in West Philly.", profileUrl: "" },
    ];

    const INITIAL_COUNT = 3;
    const LOAD_MORE_STEP = 3;

    // ---- DOM refs ----
    const section = document.getElementById("reviews");
    const listEl = document.getElementById("reviewsList");
    const loadMoreBtn = document.getElementById("loadMoreReviews");
    const readOnGoogle = document.getElementById("readOnGoogle");
    const leaveAReview = document.getElementById("leaveAReview");
    const aggRatingEl = document.querySelector(".agg-rating");
    const aggCountEl = document.querySelector(".agg-count");
    const starsHeader = document.querySelector(".reviews-head .stars");
    const ldScript = document.getElementById("reviewsLD");

    if (!section || !listEl) return; // section not present

    // ---- Helpers ----
    const starSvg = (filled = true) => `
    <span class="star" aria-hidden="true">
      <svg viewBox="0 0 20 20" fill="${filled ? '#f59e0b' : '#e5e7eb'}" xmlns="http://www.w3.org/2000/svg" role="img">
        <path d="M10 15.27l-5.18 3.05 1-5.82L.64 7.98l5.86-.85L10 1.67l2.5 5.46 5.86.85-4.18 4.52 1 5.82z"/>
      </svg>
    </span>
  `;

    function renderHeader(average, count) {
        if (starsHeader) {
            starsHeader.innerHTML = "";
            const rounded = Math.round(average);
            for (let i = 1; i <= 5; i++) {
                starsHeader.insertAdjacentHTML("beforeend", starSvg(i <= rounded));
            }
            starsHeader.setAttribute("aria-label", `${average.toFixed(1)} out of 5 stars`);
        }
        if (aggRatingEl) aggRatingEl.textContent = 4.7;
        if (aggCountEl) aggCountEl.textContent = `· 40+ reviews`;
    }

    function cardHtml(r) {
        const initials = (r.name || "?").split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
        const dateStr = new Date(r.date).toLocaleDateString(undefined, { year: "numeric", month: "short" });
        let stars = "";
        for (let i = 1; i <= 5; i++) stars += starSvg(i <= (r.rating || 0));

        return `
      <article class="review-card" role="listitem">
        <div class="reviewer">
          <div class="avatar-mini">${initials}</div>
          <div class="meta">
            <b>${r.name || "Google User"}</b>
            <small>${dateStr}</small>
          </div>
        </div>
        <div class="stars" aria-label="${r.rating || 0} out of 5 stars">${stars}</div>
        <p class="review-text">${r.text}</p>
        <div class="review-actions">
          ${r.profileUrl ? `<a href="${r.profileUrl}" target="_blank" rel="noopener" style="margin-left:10px">Profile</a>` : ""}
        </div>
      </article>
    `;
    }

    function mountCards(data, count) {
        listEl.innerHTML = data.slice(0, count).map(cardHtml).join("");
        wireToggles();
    }

    function wireToggles() {
        listEl.querySelectorAll(".toggle-more").forEach(btn => {
            btn.addEventListener("click", () => {
                const p = btn.closest(".review-card").querySelector(".review-text");
                // toggle clamp
                const expanded = p.style.webkitLineClamp === "unset";
                if (expanded) {
                    p.style.display = "-webkit-box";
                    p.style.webkitLineClamp = "6";
                    p.style.webkitBoxOrient = "vertical";
                    btn.textContent = "More";
                } else {
                    p.style.display = "block";
                    p.style.webkitLineClamp = "unset";
                    btn.textContent = "Less";
                }
            });
        });
    }

    function writeReviewUrl(placeId) {
        return `https://search.google.com/local/writereview?placeid=${encodeURIComponent(placeId)}`;
    }

    function computeAgg(data) {
        const count = data.length || 0;
        const sum = data.reduce((s, r) => s + (Number(r.rating) || 0), 0);
        const avg = count ? (sum / count) : 0;
        return { average: Math.max(0, Math.min(5, avg)), count };
    }

    function setLinks(placeId, placeUrl) {
        if (readOnGoogle) {
            readOnGoogle.href = placeUrl && !placeUrl.includes("REPLACE")
                ? placeUrl
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS_NAME)}`;
        }
        if (leaveAReview) {
            leaveAReview.href = placeId && !placeId.includes("REPLACE")
                ? writeReviewUrl(placeId)
                : writeReviewUrl("");
        }
    }

    function writeJsonLd(avg, count) {
        if (!ldScript) return;
        const ld = {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": BUSINESS_NAME,
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": avg.toFixed(1),
                "reviewCount": count
            }
        };
        ldScript.textContent = JSON.stringify(ld);
    }

    // ---- Init (lazy on view) ----
    async function init() {
        // keep using static cards for now
        const data = STATIC_REVIEWS;

        try {
            // 1) fetch live aggregate (rating + count) from your server
            const agg = await fetchAggregate(PLACE_ID);

            // 2) render header + links with live numbers
            renderHeader(agg.average, agg.count);
            setLinks(agg.placeId, agg.url);
            writeJsonLd(agg.average, agg.count);
        } catch (e) {
            console.error(e);
            // Fallback: compute from static if API fails
            const { average, count } = computeAgg(data);
            renderHeader(average, count);
            setLinks(PLACE_ID, PLACE_URL);
            writeJsonLd(average, count);
        }

        // 3) mobile vs desktop list behavior (unchanged)
        const isMobile = window.matchMedia("(max-width: 640px)").matches;

        let shown;
        if (isMobile) {
            shown = data.length;              // show all + swipe
            mountCards(data, shown);
        } else {
            shown = Math.min(data.length, 3); // 3 → 6 → read on Google
            mountCards(data, shown);

            if (loadMoreBtn) {
                loadMoreBtn.style.cursor = "pointer";
                let phase = 1;

                loadMoreBtn.addEventListener("click", () => {
                    if (phase === 1) {
                        shown = Math.min(data.length, shown + 3); // to 6
                        mountCards(data, shown);
                        if (shown >= 6 || shown >= data.length) {
                            loadMoreBtn.textContent = "Read more reviews on Google";
                            phase = 2;
                        }
                    } else {
                        if (readOnGoogle && readOnGoogle.href) {
                            window.open(readOnGoogle.href, "_blank", "noopener");
                        }
                    }
                });
            }
        }
    }


    if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries, obs) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    init();
                    obs.disconnect();
                }
            });
        }, { rootMargin: "100px" }).observe(section);
    } else {
        init();
    }
})();
