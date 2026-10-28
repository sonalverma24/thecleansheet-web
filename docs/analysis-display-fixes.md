# Analysis photo and At a glance display — 28 October 2026

The owner reported missing photos and a missing At a glance section on the new analysis pages.

The PLIX preview had a working Nykaa thumbnail, displayed in a narrow frame. The hero now requests the original asset on Nykaa's image CDN, uses a larger frame, retries the saved URL directly if image optimisation fails, and displays an explicit photo-unavailable placeholder if neither loads. Other image hosts keep their existing URLs.

At a glance previously disappeared whenever the verified-check list was empty. It now stays visible and explains that evidence is still needed, with links to Claim check and Gaps. When verified checks exist, the existing ticks and cautions are retained. No extra safety claims or free-from ticks are inferred from an unverified ingredient list.

The decision rules and grey-rating thresholds have not changed in this display fix. Revert the associated pull request to undo it.
