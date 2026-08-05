# UAT Checklist — Sanctions Screening Simulator
 
## Filters
- [x] Filter case queue by status (escalated / cleared / all)
- [x] Search/filter by name (live, case-insensitive)
- [ ] Verify filters reset correctly on page reload
## Tooltips
- [x] Hovering chart bars shows exact count and range
- [x] Hovering confidence score shows raw score value
- [x] Hovering status badge explains meaning
- [x] Hovering stat cards explains what each number means
## Loading states
- [x] Initial page load shows skeleton rows, not blank/broken UI
- [x] Changing threshold shows loading skeleton during refetch
- [ ] Verify no flash of empty table before data arrives
## Interactions
- [x] Threshold slider updates table and chart in real time
- [x] Slider value displays correctly at all points (0–100)
- [x] Clicking a case row opens detail modal
- [x] Modal closes on backdrop click or × button
## Navigation
- [ ] All sections reachable via scroll, no dead links
- [x] Page doesn't require reload to reflect threshold/filter changes
## Responsiveness
- [ ] Layout holds at desktop width (1920px)
- [ ] Layout holds at laptop width (1366px)
- [ ] Layout holds at tablet width (768px)
- [ ] Layout holds at mobile width (375px) — table scrolls horizontally
## Edge cases
- [ ] Threshold = 0 (everything matches)
- [ ] Threshold = 100 (almost nothing matches)
- [x] Empty case list state displays correctly ("No cases match...")
- [x] Very long entity names don't break table layout (truncate + tooltip)
## Error handling
- [x] Backend offline → clear error message shown
- [ ] Malformed API response doesn't crash the page
- [ ] Network timeout handled gracefully
## Data correctness
- [ ] Escalated count + Cleared count = Total
- [ ] Escalation rate % matches escalated/total calculation
- [ ] Confidence scores match backend fuzzy-match output
- [ ] Explainability text matches the actual match reasoning
## User workflow validation
- [x] A compliance reviewer can identify a high-risk case within 10 seconds
- [x] "Why this matters" / "Who controls the rail" panels are readable
 
