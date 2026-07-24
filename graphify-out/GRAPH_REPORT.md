# Graph Report - websampah  (2026-07-25)

## Corpus Check
- 234 files · ~333,859 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 3351 nodes · 7906 edges · 175 communities (163 shown, 12 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 156 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4716f666`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- auth.ts
- page.tsx
- ops.ts
- dependencies
- compilerOptions
- devDependencies
- Global Constraints
- install.ts
- Desain: Migrasi Bank Sampah dari Firebase ke Neon Postgres + Next.js
- Bank Sampah — Web PWA (Next.js + Prisma + Neon)
- layout.tsx
- CLAUDE.md
- AGENTS.md
- next.config.ts
- CLAUDE.md
- ResetForm.tsx
- VerifikasiForm.tsx
- page.tsx
- DaftarSW.tsx
- helpers.ts
- jenis.ts
- RiwayatList.tsx
- page.tsx
- RiwayatList.tsx
- kontribusi.ts
- route.ts
- Onboarding.tsx
- page.tsx
- email.ts
- page.tsx
- TombolTema.tsx
- page.tsx
- page.tsx
- UnduhLaporan.tsx
- AppHeader.tsx
- layout.tsx
- layout.tsx
- page.tsx
- page.tsx
- peringkat.test.ts
- page.tsx
- connectSSE
- design-system.mjs
- detect-antipatterns-browser.js
- hook-lib.mjs
- live-inject.mjs
- modern-screenshot.umd.js
- context.mjs
- el
- live-commit-manual-edits.mjs
- live-server.mjs
- checks.mjs
- initPageChat
- impeccable-config.mjs
- css-cascade.mjs
- setLiveState
- hook-admin.mjs
- svelte-component.mjs
- live-wrap.mjs
- live-accept.mjs
- manual-apply.mjs
- doctor.mjs
- concept-seed.mjs
- design-parser.mjs
- initGlobalBar
- showToast
- detect-antipatterns.mjs
- scanCssTextForPulsingDot
- parseAnyColor
- live-copy-edit-agent.mjs
- detect-text.mjs
- hook-before-edit.mjs
- live-poll.mjs
- layout.md
- live.md
- critique-storage.mjs
- live-manual-edit-evidence.mjs
- Responsive Design
- handleManualEditActivity
- collectBrowserFindings
- resolveVarRefs
- runHook
- detect-html.mjs
- resolveLengthPx
- onboard.md
- live.mjs
- detect-url.mjs
- mountSvelteComponentVariant
- manual-edit-routes.mjs
- insert-ui.mjs
- rel
- collectVisualContrastCandidates
- parseAnyColor
- document.md
- The Toolkit
- resolveLengthPx
- captureElementToBlob
- SKILL.md
- live-status.mjs
- impeccable-paths.mjs
- resolveProject
- staleness-deep.mjs
- onAnnotDown
- animate.md
- Handle `generate`
- Generate Report
- checkQuality
- checkQuality
- session-store.mjs
- event-validation.mjs
- serve-question.mjs
- optimize.md
- sampleCssBackground
- StaticElement
- Scan mode (approach C: auto-extract, then confirm descriptive language)
- context-signals.mjs
- broadcastAgentPollingIfChanged
- pin.mjs
- claude_code_zai_env.sh
- Simplify the Design
- Hardening Dimensions
- SAFE_TAGS
- ui-core.mjs
- clarify.md
- critique.md
- Nielsen's 10 Heuristics
- New visual work
- polish.md
- quieter.md
- classSelector
- readConfig
- palette.mjs
- Generate Combined Critique Report
- Init flow
- staleness-notice.mjs
- inline-ignores.mjs
- expandScanTargets
- Common Cognitive Load Violations
- Operate mode depth (and Read notes)
- Shape
- generation-preflight.mjs
- Persona-Based Design Testing
- Extract Flow
- iOS platform
- hook.mjs
- source-lock.mjs
- template-extensions.mjs
- Generate Report
- Cognitive Load Assessment
- CSP detection (first-time only)
- BORDER_SAFE_TAGS
- isScreenReaderOnlyTextStyle
- generate-image.mjs
- source-search.mjs
- Heuristics Scoring Guide
- detect.mjs

## God Nodes (most connected - your core abstractions)
1. `el()` - 69 edges
2. `runHook()` - 39 edges
3. `parseAnyColor()` - 35 edges
4. `collectBrowserFindings()` - 34 edges
5. `parseAnyColor()` - 32 edges
6. `getSessionUser()` - 31 edges
7. `detectHtml()` - 29 edges
8. `setLiveState()` - 29 edges
9. `initGlobalBar()` - 28 edges
10. `main()` - 27 edges

## Surprising Connections (you probably didn't know these)
- `measureHiddenTextDOM()` --indirect_call--> `el()`  [INFERRED]
  .claude/skills/impeccable/scripts/detector/detect-antipatterns-browser.js → .claude/skills/impeccable/scripts/live-browser.js
- `measureHiddenTextDOM()` --indirect_call--> `el()`  [INFERRED]
  .claude/skills/impeccable/scripts/detector/rules/checks.mjs → .claude/skills/impeccable/scripts/live-browser.js
- `latestCritique()` --indirect_call--> `v()`  [INFERRED]
  .claude/skills/impeccable/scripts/context-signals.mjs → .claude/skills/impeccable/scripts/modern-screenshot.umd.js
- `resolveLocalContextDir()` --indirect_call--> `rel()`  [INFERRED]
  .claude/skills/impeccable/scripts/context.mjs → .claude/skills/impeccable/scripts/doctor.mjs
- `nearestTargetContextRoot()` --indirect_call--> `rel()`  [INFERRED]
  .claude/skills/impeccable/scripts/context.mjs → .claude/skills/impeccable/scripts/doctor.mjs

## Import Cycles
- None detected.

## Communities (175 total, 12 thin omitted)

### Community 0 - "auth.ts"
Cohesion: 0.13
Nodes (22): LoginPage(), LoginState, ResetState, ResetForm(), ResetState, VerifikasiBanner(), gantiEmailAction(), loginAction() (+14 more)

### Community 1 - "page.tsx"
Cohesion: 0.13
Nodes (27): PenukaranForm(), JenisPilihan, SetoranForm(), WargaSearch(), batalkanPenukaranAction(), buatPenukaranAction(), BuatPenukaranState, cariWargaAction() (+19 more)

### Community 2 - "ops.ts"
Cohesion: 0.03
Nodes (122): addManualContextText(), applyGlobalBarLabelState(), applyParamValue(), applyPlaceholderSizingStyles(), applySvelteComponentVariantStyle(), bindEditBadgeProxy(), bufferToBase64(), buildCollapsible() (+114 more)

### Community 3 - "dependencies"
Cohesion: 0.06
Nodes (68): addBrowserFindings(), addVisualContrastFindings(), addVisualContrastResult(), analyzeVisualContrast(), analyzeVisualContrastCandidate(), blendRgba(), browserColorsClose(), browserDesignSystemConfig() (+60 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "devDependencies"
Cohesion: 0.12
Nodes (17): dotenv, prisma, tsx, @types/node, @types/qrcode, @types/react, @types/react-dom, typescript (+9 more)

### Community 6 - "Global Constraints"
Cohesion: 0.11
Nodes (17): Global Constraints, Migrasi Neon Postgres + Next.js — Implementation Plan, Self-Review (sudah dijalankan penulis plan), Task 10: Halaman warga (dashboard + scan QR), Task 11: Halaman ops (beranda, setoran, penukaran QR + polling), Task 12: Welcome + PWA + seed ops, Task 13: Skrip migrasi data + gladi bersih vs emulator, Task 14: Deploy Vercel + runbook cutover (+9 more)

### Community 7 - "install.ts"
Cohesion: 0.26
Nodes (9): InstallButtonKecil(), InstallPrompt(), BeforeInstallPromptEvent, isIos(), isStandalone(), promptInstall(), shouldShowWelcome(), subs (+1 more)

### Community 8 - "Desain: Migrasi Bank Sampah dari Firebase ke Neon Postgres + Next.js"
Cohesion: 0.18
Nodes (10): Arsitektur, Desain: Migrasi Bank Sampah dari Firebase ke Neon Postgres + Next.js, Di luar scope, Invarian bisnis (pindahan dari firestore.rules → kode server), Keputusan (dari sesi brainstorming 2026-07-17), Kriteria sukses, Migrasi data (big-bang), Pemetaan query Firestore → SQL/Prisma (+2 more)

### Community 9 - "Bank Sampah — Web PWA (Next.js + Prisma + Neon)"
Cohesion: 0.17
Nodes (11): 1. Kelengkapan PWA teknis, 2. Konsistensi & kelengkapan UI, 3. Implementasikan fitur tambahan berikut (pilih/prioritaskan sesuai arahan saya di bawah), 4. Batasan teknis, 5. Output yang diharapkan, Design system yang sudah ada (WAJIB dipertahankan & dikembangkan, jangan diganti), Halaman & komponen yang sudah ada, KONTEKS PROJECT (+3 more)

### Community 11 - "layout.tsx"
Cohesion: 0.70
Nodes (3): IndikatorOffline(), subscribe(), useOnline()

### Community 13 - "AGENTS.md"
Cohesion: 0.18
Nodes (10): Accessibility & Inclusion, Anti-references, Brand Personality, Design Principles, Platform, Positioning, Product, Product Purpose (+2 more)

### Community 17 - "CLAUDE.md"
Cohesion: 0.13
Nodes (17): GET(), Home(), WargaLayout(), IKON, Item, MENU, muatSetoranOpsAction(), confirmScanAction() (+9 more)

### Community 19 - "ResetForm.tsx"
Cohesion: 0.29
Nodes (6): Anti-Patterns Verdict, Design Health Score (Nielsen) — 29/40 "Good" (naik dari 21), Minor, Persona, Pertanyaan provokatif, Priority Issues

### Community 22 - "page.tsx"
Cohesion: 0.33
Nodes (5): Anti-Patterns Verdict, Design Health Score (Nielsen) — 21/40 "Acceptable", Minor, Persona Red Flags, Priority Issues

### Community 27 - "DaftarSW.tsx"
Cohesion: 0.43
Nodes (5): PeringkatPage(), kuartalRange(), Peringkat, PeringkatBaris, peringkatKuartal()

### Community 29 - "jenis.ts"
Cohesion: 0.30
Nodes (13): isUniqueError(), JenisDTO, muatJenisAction(), pastikanOps(), segarkan(), tambahJenisAction(), toggleJenisAction(), ubahTarifAction() (+5 more)

### Community 31 - "page.tsx"
Cohesion: 0.33
Nodes (7): analitikOps, JenisRingkas, kunciBulan(), labelBulan(), RingkasanBulan, ringkasanBulanIni(), TrenBulan

### Community 32 - "RiwayatList.tsx"
Cohesion: 0.20
Nodes (5): PenukaranRow, Props, RiwayatPage, SetoranRow, STATUS_LABEL

### Community 33 - "kontribusi.ts"
Cohesion: 0.43
Nodes (5): JenisRingkas, kontribusiWarga, kunciBulan(), labelBulan(), TrenBulan

### Community 34 - "route.ts"
Cohesion: 0.24
Nodes (11): RFC-4180, GET(), parseTanggal(), slug(), STATUS, tgl(), bidangCsv(), BOM (+3 more)

### Community 35 - "Onboarding.tsx"
Cohesion: 0.13
Nodes (15): jsqr, next, @node-rs/argon2, @prisma/client, react, react-dom, resend, dependencies (+7 more)

### Community 36 - "page.tsx"
Cohesion: 0.29
Nodes (6): Apply, Live-mode signature params, Set the spatial thesis, Two isolated assessments, Verify, Visitor mode

### Community 37 - "email.ts"
Cohesion: 0.29
Nodes (7): scripts, build, dev, postinstall, start, test, test:db

### Community 44 - "page.tsx"
Cohesion: 0.33
Nodes (5): Before you finish, Scope is sovereign, The amplification, The skeleton test, Why it reads flat

### Community 47 - "page.tsx"
Cohesion: 0.15
Nodes (12): OpsAnalitikPage(), IKON, OpsMenuPage(), TAUTAN, OpsPage(), KontribusiPage(), WargaPage(), PengaturanPage() (+4 more)

### Community 51 - "AppHeader.tsx"
Cohesion: 0.33
Nodes (5): name, prisma, seed, private, version

### Community 52 - "layout.tsx"
Cohesion: 0.40
Nodes (4): qrcode, qrcode, Props, QrFullscreen()

### Community 53 - "layout.tsx"
Cohesion: 0.40
Nodes (3): metadata, outfit, viewport

### Community 56 - "page.tsx"
Cohesion: 0.67
Nodes (3): bacaQr(), BarcodeDetectorLike, ScanQr()

### Community 58 - "peringkat.test.ts"
Cohesion: 0.17
Nodes (17): main(), prisma, PengaturanAkun(), logoutAction(), gantiPasswordAction(), ProfilState, updateProfilAction(), hashPassword() (+9 more)

### Community 60 - "connectSSE"
Cohesion: 0.08
Nodes (67): abortSvelteComponentInjection(), applyParamDefaults(), applyPlaceholderDimensions(), applySavedSessionMeta(), buildInsertPlaceholderSnapshotFromDom(), checkpointPayload(), clampVariantIndex(), clearHandled() (+59 more)

### Community 61 - "design-system.mjs"
Cohesion: 0.08
Nodes (59): addClampEndpoints(), addColorObject(), addDesignColor(), addFontSizeStep(), addRoundedScale(), addRoundedToken(), addSidecarColors(), addSidecarRadii() (+51 more)

### Community 62 - "detect-antipatterns-browser.js"
Cohesion: 0.06
Nodes (55): browserColorsClose(), browserDesignSystemConfig(), browserHasDirectText(), browserPrimaryFont(), browserRadiusTokens(), browserSampleText(), buildSelectorSegment(), checkBrowserDesignSystemSources() (+47 more)

### Community 63 - "hook-lib.mjs"
Cohesion: 0.07
Nodes (55): cursorBlockMessage(), ACK_EXTS, applyPatchText(), clampByte(), clampGroupedToBudget(), clampToBudget(), cleanIgnoreValueDisplay(), CO_SCAN_STYLE_NAMES (+47 more)

### Community 64 - "live-inject.mjs"
Cohesion: 0.07
Nodes (52): detectCsp(), INLINE_HEADER_SIGNALS, LAYOUT_EXTS, MONOREPO_HELPER_SIGNALS, NUXT_ROUTE_RULES_SIGNALS, NUXT_SECURITY_SIGNALS, SCAN_EXTS, SKIP_DIRS (+44 more)

### Community 65 - "modern-screenshot.umd.js"
Cohesion: 0.09
Nodes (52): ae(), be(), bt(), Ce(), Ct(), de(), dt(), _e() (+44 more)

### Community 66 - "context.mjs"
Cohesion: 0.08
Nodes (51): appendAutonomyCounterDirective(), appendDetectorFallback(), appendImageGenDirective(), appendSurfaceBriefContext(), automaticHookMode(), buildMissingTargetDirective(), buildResolvedContextDirective(), buildTargetSelectionDirective() (+43 more)

### Community 67 - "el"
Cohesion: 0.08
Nodes (51): actionLabel(), applyConfigureBarChrome(), bindConfigureCountPillTooltip(), bindConfigureInlineControlHover(), bindConfigureModifierPillHover(), buildConfigureActionControl(), buildConfigureCountControl(), buildConfigureRow() (+43 more)

### Community 68 - "live-commit-manual-edits.mjs"
Cohesion: 0.10
Nodes (50): allEntryIds(), argVal(), buildRepairBatch(), candidatesForEntry(), changedFilesSinceSnapshot(), clearAppliedEntries(), collectApplyOwnedFiles(), collectRollbackFiles() (+42 more)

### Community 69 - "live-server.mjs"
Cohesion: 0.08
Nodes (46): assembleLiveBrowserScript(), assertLiveBrowserScriptParts(), LIVE_BROWSER_SCRIPT_PARTS, readLiveBrowserScriptParts(), resolveLiveBrowserScriptParts(), activeSessionSummaries(), agentPollingConnected(), annotRoot (+38 more)

### Community 70 - "checks.mjs"
Cohesion: 0.08
Nodes (39): checkClippedOverflow(), checkElementClippedOverflow(), checkElementClippedOverflowDOM(), checkElementItalicSerif(), checkElementItalicSerifDOM(), checkElementMotionDOM(), checkElementOversizedH1(), checkElementOversizedH1DOM() (+31 more)

### Community 71 - "initPageChat"
Cohesion: 0.08
Nodes (49): armPageChatForTyping(), attachSteerFocusDebug(), attachSteerFocusGuard(), clearSteerAwaitTimer(), clearSteerFocusRecoverTimer(), collapsePageChat(), expandPageChat(), finishVoiceSession() (+41 more)

### Community 72 - "impeccable-config.mjs"
Cohesion: 0.10
Nodes (47): applyDetectionConfigSource(), clampByte(), cleanIgnoreValueDisplay(), cloneDetectionConfig(), cloneRawDetectionConfig(), colorIgnoreKey(), DEFAULT_DETECTION_CONFIG, DETECTOR_CONFIG_KEYS (+39 more)

### Community 73 - "css-cascade.mjs"
Cohesion: 0.06
Nodes (33): applyStaticDeclaration(), buildBorderOverrideMap(), buildStaticStyleMap(), buildStaticWindow(), collectStaticCssRules(), compareStaticPriority(), cssPropToCamel(), expandStaticBoxValues() (+25 more)

### Community 74 - "setLiveState"
Cohesion: 0.13
Nodes (47): buildPickedAnchorSnapshot(), cancelEditing(), cancelEditingToPicking(), cancelInsertConfigure(), cleanup(), cleanupAcceptedSession(), clearAnnotations(), clearInsertPicking() (+39 more)

### Community 75 - "hook-admin.mjs"
Cohesion: 0.12
Nodes (42): ACTIONS, addIgnoreFile(), addIgnoreRule(), addIgnoreValue(), DETECTOR_CONFIG_KEYS, detectorSection(), fileHasImpeccableHookMarker(), HOOK_MANIFEST_TARGETS (+34 more)

### Community 76 - "svelte-component.mjs"
Cohesion: 0.10
Nodes (44): applyLegacyDeferredAcceptsOnStartup(), appendCssToSvelteStyle(), appendSanitizedCssRule(), applyDeferredSvelteComponentAccepts(), bakeParamValuesInCss(), buildInsertVariantStub(), buildPropContract(), buildPropsScript() (+36 more)

### Community 77 - "live-wrap.mjs"
Cohesion: 0.12
Nodes (38): hasGeneratedHeader(), HEADER_MARKERS, isGeneratedFile(), isGitIgnored(), resolveLiveTemplateExtensions(), argVal(), buildInsertWrapperLines(), computeInsertLine() (+30 more)

### Community 78 - "live-accept.mjs"
Cohesion: 0.12
Nodes (38): acceptCli(), acceptReceiptPath(), argVal(), buildAcceptedWrappedSource(), buildCarbonizeReplacement(), decodeHtmlAttr(), deindentContent(), detectCommentSyntax() (+30 more)

### Community 79 - "manual-apply.mjs"
Cohesion: 0.10
Nodes (36): addOpToManualApplyChunk(), APPLY_EVENT_HARD_TIMEOUT_MS, APPLY_EVENT_SOFT_DEADLINE_MS, buildManualApplyAgentAction(), clearManualApplyTransaction(), collectManualApplyFiles(), compactManualApplyBatch(), compactManualApplyCandidates() (+28 more)

### Community 80 - "doctor.mjs"
Cohesion: 0.13
Nodes (33): applyFixes(), cli(), collect(), readProjectRootPatterns(), renderText(), safeRead(), SCRIPTS_DIR, SEVERITY_LABEL (+25 more)

### Community 81 - "concept-seed.mjs"
Cohesion: 0.12
Nodes (34): API_BASE, API_TIMEOUT_MS, apiBudgetMs(), fetchRoll(), here, loadLocal(), localStates, pingChosen() (+26 more)

### Community 82 - "design-parser.mjs"
Cohesion: 0.15
Nodes (33): buildColor(), CANONICAL_SECTIONS, collectBullets(), collectColorValues(), collectParagraphs(), detectFormat(), extractColors(), extractComponents() (+25 more)

### Community 83 - "initGlobalBar"
Cohesion: 0.11
Nodes (35): agentHasWorkInFlight(), agentStatusText(), barPaletteForTheme(), brandMarkSvg(), buildDesignHeader(), buildParamsPanel(), buildSavingRow(), buildSteerProcessingDots() (+27 more)

### Community 84 - "showToast"
Cohesion: 0.09
Nodes (35): applyEditing(), buildLocatorForLeaf(), canRestoreManualEditElement(), copyEditContainerContext(), copyEditLeafContext(), cssIdent(), directMixedTextRestoreNodes(), documentRefClassSuffix() (+27 more)

### Community 85 - "detect-antipatterns.mjs"
Cohesion: 0.16
Nodes (27): confirm(), detectCli(), formatFindings(), formatFindingSummary(), handleStdin(), printUsage(), createBrowserDetector(), getAP() (+19 more)

### Community 86 - "scanCssTextForPulsingDot"
Cohesion: 0.11
Nodes (34): checkColors(), checkElementAIPaletteDOM(), checkElementGlow(), checkGlow(), checkHtmlPatterns(), collectCssCustomProps(), collectMarqueeKeyframes(), collectPulseKeyframes() (+26 more)

### Community 87 - "parseAnyColor"
Cohesion: 0.12
Nodes (33): checkBorders(), checkCreamPalette(), checkElementBorders(), checkElementBordersDOM(), checkElementColors(), checkElementColorsDOM(), checkElementGlowDOM(), checkElementHoverContrast() (+25 more)

### Community 88 - "live-copy-edit-agent.mjs"
Cohesion: 0.14
Nodes (31): applyMockWrites(), buildCopyEditBatchPrompt(), checkFrameworkSourceSyntax(), chooseCopyEditAgent(), COMMAND_AUTH_CACHE, commandAuthed(), commandExists(), compactBatchForPrompt() (+23 more)

### Community 89 - "detect-text.mjs"
Cohesion: 0.08
Nodes (31): checkPageTypography(), blankCssComments(), CSS_IN_JS_EXTENSIONS, extractCSSinJS(), extractStyleBlocks(), firstOverusedGoogleFont(), hexChannels(), insetStripeColorIsChromatic() (+23 more)

### Community 90 - "hook-before-edit.mjs"
Cohesion: 0.14
Nodes (28): bumpCursorDenial(), detectProposedHtml(), escapeRegExp(), findingSignature(), firstMatch(), firstString(), hasFragmentEditContent(), isInsideProject() (+20 more)

### Community 91 - "live-poll.mjs"
Cohesion: 0.16
Nodes (27): completionAckForAcceptResult(), completionTypeForAcceptResult(), PREVIEW_MODES_WITHOUT_SOURCE_MARKERS, augmentEventWithAcceptHandling(), buildAcceptScriptArgs(), buildPollReplyPayload(), completeAcceptHandling(), EVENT_TYPES_NEEDING_AGENT_REPLY (+19 more)

### Community 92 - "layout.md"
Cohesion: 0.07
Nodes (27): Adaptation Strategies, Assess Adaptation Challenge, Implement & Verify, Orientation & foldables, Phone → Tablet (iPad / large screens), Platform → platform (iOS ↔ Android), Web → native (porting a website or web app), 1. Accessibility (VoiceOver / TalkBack) (+19 more)

### Community 93 - "live.md"
Cohesion: 0.07
Nodes (25): Apply at system scale, Audit before choosing, Choose a strategy, Contrast and perception, Live-mode signature params, Verify, Visitor mode, Cleanup (+17 more)

### Community 94 - "critique-storage.mjs"
Cohesion: 0.18
Nodes (21): coerceSlug(), listSnapshotsForSlug(), main(), nowFilenameStamp(), parseFrontmatter(), readLatestSnapshot(), readTrend(), serializeFrontmatter() (+13 more)

### Community 95 - "live-manual-edit-evidence.mjs"
Cohesion: 0.16
Nodes (26): analyzeSourceHint(), buildCandidatesForOp(), buildContextHintsByRef(), buildManualEditEvidence(), collectSearchFiles(), countOps(), decodeBasicHtml(), escapeRegExp() (+18 more)

### Community 96 - "Responsive Design"
Cohesion: 0.08
Nodes (25): Assess Adaptation Challenge, Breakpoints: Content-Driven, Content Adaptation, Desktop Adaptation (Mobile → Desktop), Detect Input Method, Not Just Screen Size, Email Adaptation (Web → Email), Implement Adaptations, Layout Adaptation Patterns (+17 more)

### Community 97 - "handleManualEditActivity"
Cohesion: 0.17
Nodes (26): clearStoredManualApplyState(), fetchPendingCount(), handleManualEditActivity(), hidePendingApplyDock(), manualApplyLoadingText(), manualApplyStateKey(), manualEditEventForCurrentPage(), numberOrNull() (+18 more)

### Community 98 - "collectBrowserFindings"
Cohesion: 0.12
Nodes (25): browserFindingsFromMap(), checkEdgeFlushCardsDOM(), checkElementBlinkingCursorDOM(), checkElementTextOverflowDOM(), checkFirstViewportColumnOverflowDOM(), checkHeadingRhythmDOM(), checkRepeatedContainerTextDOM(), checkRepeatedContainerTextFromDoc() (+17 more)

### Community 99 - "resolveVarRefs"
Cohesion: 0.11
Nodes (34): ANIMATION_VALUE_KEYWORDS, checkColors(), checkElementGlow(), checkGlow(), checkHoverContrast(), checkHtmlPatterns(), collectCssCustomProps(), collectMarqueeKeyframes() (+26 more)

### Community 100 - "runHook"
Cohesion: 0.19
Nodes (25): main(), ALLOWED_EXTS, appendDesignSystemNote(), bumpEditCount(), dedupeAgainstCache(), depthIsSet(), designSystemOptions(), ensureFile() (+17 more)

### Community 102 - "resolveLengthPx"
Cohesion: 0.12
Nodes (25): checkElementHeroEyebrow(), checkElementHeroEyebrowDOM(), checkElementIconTile(), checkElementIconTileDOM(), checkElementQualityDOM(), checkHeroEyebrow(), checkIconTile(), checkNumberedSectionLabels() (+17 more)

### Community 103 - "onboard.md"
Cohesion: 0.09
Nodes (22): Assess Onboarding Needs, Context Over Ceremony, Contextual Help, Design Onboarding Experiences, Documentation & Help, Empty State Design, Feature Discovery & Adoption, Guided Tours & Walkthroughs (+14 more)

### Community 104 - "live.mjs"
Cohesion: 0.15
Nodes (19): parseCliOptions(), resolveProjectRoot(), resolveTargetSelection(), parseArgs(), getLegacyLiveAnnotationsDir(), parseTargetOptions(), parseTargetPath(), TargetArgError (+11 more)

### Community 105 - "detect-url.mjs"
Cohesion: 0.12
Nodes (33): mergeDesignSystemFindings(), detectUrl(), measureContentHiddenAfterReveal(), runVisualContrastFallback(), serializeDesignSystemForBrowser(), detectText(), extFromFilePath(), runRegexMatchers() (+25 more)

### Community 106 - "mountSvelteComponentVariant"
Cohesion: 0.15
Nodes (23): acceptedDomAlreadyClean(), applyOriginalAttrsToSvelteAnchor(), commitAcceptedSvelteComponentToDom(), elementMatchesOriginalMarkup(), ensureAcceptedDomClean(), findAcceptedRuntimeWrappers(), findLiveElementForOriginalMarkup(), findLiveElementForSvelteManifest() (+15 more)

### Community 107 - "manual-edit-routes.mjs"
Cohesion: 0.19
Nodes (19): args, cwd, pageUrlFilter, remaining, compactManualLogText(), summarizeManualApplyFailures(), summarizeManualDiagnostics(), summarizeManualLogFile() (+11 more)

### Community 108 - "insert-ui.mjs"
Cohesion: 0.11
Nodes (9): clampPlaceholderSize(), computeInsertPosition(), groupSiblingRows(), hitSiblingInsertGap(), horizontalOverlap(), insertCreateDisabledReason(), insertLineCoords(), resizePlaceholderFromEdge() (+1 more)

### Community 109 - "rel"
Cohesion: 0.15
Nodes (22): directChildDirs(), discoverRootsForPattern(), discoverTargetCandidates(), expandSimplePattern(), findTargetExample(), hasFallbackWorkspaceChildren(), isExcludedByWorkspacePattern(), isIgnoredWorkspaceDiscoveryDir() (+14 more)

### Community 110 - "collectVisualContrastCandidates"
Cohesion: 0.12
Nodes (22): addBrowserFindings(), addVisualContrastFindings(), addVisualContrastResult(), analyzeVisualContrast(), analyzeVisualContrastCandidate(), blendRgba(), clampByte(), clearOverlays() (+14 more)

### Community 111 - "parseAnyColor"
Cohesion: 0.17
Nodes (25): checkCreamPalette(), checkElementAIPaletteDOM(), checkElementColors(), checkElementColorsDOM(), checkElementGlowDOM(), checkElementHoverContrast(), checkElementPseudoStripeDOM(), compositeColorOver() (+17 more)

### Community 112 - "document.md"
Cohesion: 0.10
Nodes (16): Codex: Surface Probes & Asset Production, Generate the smallest useful probe set, Inventory implementation fidelity, One approval point, Produce only the assets the build needs, Craft (deprecated alias), Pitfalls, Seed mode (+8 more)

### Community 113 - "The Toolkit"
Cohesion: 0.10
Nodes (20): Animate complex properties, Assess What "Extraordinary" Means Here, For data-heavy interfaces, For functional UI, For performance-critical UI, For visual/marketing surfaces, Implement with Discipline, Interact with the device (+12 more)

### Community 114 - "resolveLengthPx"
Cohesion: 0.13
Nodes (21): checkElementHeroEyebrow(), checkElementHeroEyebrowDOM(), checkElementQualityDOM(), checkHeroEyebrow(), checkNumberedSectionLabels(), checkNumberedSectionLabelsDOM(), checkNumberedSectionLabelsFromDoc(), checkRepeatedSectionKickers() (+13 more)

### Community 115 - "captureElementToBlob"
Cohesion: 0.13
Nodes (21): averageRgb01(), captureAndEmit(), captureChromeNodes(), captureElementFromRenderedAncestor(), captureElementToBlob(), compileShader(), cssColorToRgb01(), dominantRgb01() (+13 more)

### Community 116 - "SKILL.md"
Cohesion: 0.12
Nodes (14): Craft floor, Refuse, Verify, Constraints, Failure modes, Flow, /impeccable hooks, Intentional findings (+6 more)

### Community 117 - "live-status.mjs"
Cohesion: 0.21
Nodes (16): completeCli(), completeThroughServer(), parseArgs(), readServerInfo(), collectManualApplyFiles(), manualApplyReplyCommand(), manualApplyResumeHint(), parseArgs() (+8 more)

### Community 118 - "impeccable-paths.mjs"
Cohesion: 0.21
Nodes (16): firstExisting(), getDesignSidecarCandidates(), getDesignSidecarPath(), getImpeccableDir(), getLegacyLiveConfigPath(), getLegacyLiveServerPath(), getLiveAnnotationsDir(), getLiveConfigPath() (+8 more)

### Community 119 - "resolveProject"
Cohesion: 0.15
Nodes (17): contextSourcePath(), contextSourceStatus(), findMonorepoRoot(), firstExisting(), hasGitBoundary(), isCandidateProjectRoot(), isPathInside(), isPathInsideOrEqual() (+9 more)

### Community 120 - "staleness-deep.mjs"
Cohesion: 0.23
Nodes (16): checkDesignCoverage(), checkDesignDrift(), checkDetectorIgnores(), checkHookInstallation(), checkLegacyLiveState(), checkWorkspaces(), collectHookCommands(), finding() (+8 more)

### Community 121 - "onAnnotDown"
Cohesion: 0.20
Nodes (17): beginEditPin(), buildAnnotationsForCapture(), buildPinElement(), cancelEditingPin(), clampPlaceholderSize(), finalizeEditingPin(), initAnnotOverlay(), localCoords() (+9 more)

### Community 122 - "animate.md"
Cohesion: 0.12
Nodes (14): Accessibility and control, Choose material by meaning, Find the job, Implement to the runtime, Set the motion thesis, Timing and easing, Verify, Visitor mode (+6 more)

### Community 123 - "Handle `generate`"
Cohesion: 0.12
Nodes (16): 1. Read the screenshot (if present), 2. Wrap the element, 3. Load the action's reference, 4. Plan three variants: identity first, then mode, then axes, 5. Apply the freeform prompt (if present), 6. Deliver variants, 7. Parameters (composition-sized, 0–4 per variant), 8. Signal done (+8 more)

### Community 124 - "Generate Report"
Cohesion: 0.13
Nodes (14): 1. Accessibility (A11y), 2. Performance, 3. Theming, 4. Responsive Design, 5. Implementation Integrity (CRITICAL), Audit Health Score, Detailed Findings by Severity, Diagnostic Scan (+6 more)

### Community 125 - "checkQuality"
Cohesion: 0.17
Nodes (15): borderColorsFromStyle(), borderWidthsFromStyle(), checkElementGptBorderShadow(), checkElementGptBorderShadowDOM(), checkGptThinBorderWideShadow(), checkQuality(), colorsNearlyMatch(), cssColorAlpha() (+7 more)

### Community 126 - "checkQuality"
Cohesion: 0.15
Nodes (17): borderColorsFromStyle(), borderWidthsFromStyle(), checkElementGptBorderShadow(), checkElementGptBorderShadowDOM(), checkGptThinBorderWideShadow(), checkQuality(), colorsNearlyMatch(), cssColorAlpha() (+9 more)

### Community 127 - "session-store.mjs"
Cohesion: 0.20
Nodes (12): getLegacyLiveSessionsDir(), safeSessionId(), missedCompletionFromSnapshot(), applyEvent(), baseSnapshot(), COMPLETED_PHASES, GENERATION_FENCED_PHASES, getJournalPath() (+4 more)

### Community 128 - "event-validation.mjs"
Cohesion: 0.25
Nodes (13): FORBIDDEN_MANUAL_EDIT_TEXT_CHARS, INSERT_POSITIONS, isValidId(), isValidVariantId(), validateAnnotationFields(), validateEvent(), validateInsertGenerate(), validateManualEditEvent() (+5 more)

### Community 129 - "serve-question.mjs"
Cohesion: 0.14
Nodes (8): esc(), localImages, page(), payloadPath, portArg, QUESTION_DIR, server, timeoutSec

### Community 130 - "optimize.md"
Cohesion: 0.14
Nodes (13): Animation Performance, Assess Performance Issues, Core Web Vitals Optimization, Cumulative Layout Shift (CLS < 0.1), First Input Delay (FID < 100ms) / INP (< 200ms), Largest Contentful Paint (LCP < 2.5s), Loading Performance, Network Optimization (+5 more)

### Community 131 - "sampleCssBackground"
Cohesion: 0.22
Nodes (14): firstCssUrl(), getLayerValue(), loadVisualContrastImage(), parseObjectPosition(), parsePositionPair(), parsePositionToken(), pickWorstContrastColor(), pointToImageSource() (+6 more)

### Community 133 - "Scan mode (approach C: auto-extract, then confirm descriptive language)"
Cohesion: 0.15
Nodes (13): Component translation rules, Narrative mapping, Scan mode (approach C: auto-extract, then confirm descriptive language), Schema, Step 1: Find the design assets, Step 2: Auto-extract what can be auto-extracted, Step 2b: Stage the frontmatter, Step 3: Ask the user for qualitative language (+5 more)

### Community 134 - "context-signals.mjs"
Cohesion: 0.27
Nodes (11): cli(), COMMON_DEV_PORTS, devServerSignals(), gatherSignals(), gitSignals(), hasCode(), latestCritique(), probePort() (+3 more)

### Community 135 - "broadcastAgentPollingIfChanged"
Cohesion: 0.28
Nodes (12): eventPriority(), selectAvailablePendingEvent(), acknowledgePendingEvent(), broadcastAgentPollingIfChanged(), cancelQueuedAnonymousExitEvents(), findAvailablePendingEvent(), flushPendingPolls(), handlePollGet() (+4 more)

### Community 136 - "pin.mjs"
Cohesion: 0.23
Nodes (11): CODEX_HARNESSES, commandPrefixForSkillsDir(), __dirname, findHarnessDirs(), generatePinnedSkill(), HARNESS_DIRS, loadCommandMetadata(), pin() (+3 more)

### Community 137 - "claude_code_zai_env.sh"
Cohesion: 0.47
Nodes (11): check_nodejs(), configure_claude(), configure_claude_json(), ensure_dir_exists(), install_claude_code(), install_nodejs(), log_error(), log_info() (+3 more)

### Community 138 - "Simplify the Design"
Cohesion: 0.17
Nodes (11): Assess Current State, Code Simplification, Content Simplification, Document Removed Complexity, Information Architecture, Interaction Simplification, Layout Simplification, Plan Simplification (+3 more)

### Community 139 - "Hardening Dimensions"
Cohesion: 0.17
Nodes (11): Accessibility Resilience, Assess Hardening Needs, Edge Cases & Boundary Conditions, Error Handling, Hardening Dimensions, Input Validation & Sanitization, Internationalization (i18n), Performance Resilience (+3 more)

### Community 140 - "SAFE_TAGS"
Cohesion: 0.20
Nodes (12): checkElementMotion(), checkElementMotionDOM(), checkHoverContrast(), checkLayout(), checkMotion(), checkPageLayout(), isCardLike(), isCardLikeDOM() (+4 more)

### Community 142 - "ui-core.mjs"
Cohesion: 0.23
Nodes (10): createLiveBrowserDomHelpers(), activeElementDeep(), appendStyleToLiveUiRoot(), appendToLiveUiRoot(), escapeCssIdent(), getLiveUiElementById(), LIVE_CHROME_MOUNT_CONTRACT, LIVE_UI_COMPONENT_IDS (+2 more)

### Community 143 - "clarify.md"
Cohesion: 0.18
Nodes (10): Actions and navigation, Audit the language, Errors and permissions, Forms, Help and instructional text, Loading, empty, and success states, Rewrite by function, Set the message hierarchy (+2 more)

### Community 144 - "critique.md"
Cohesion: 0.18
Nodes (10): Action Summary, Ask the User, Assessment A: Design Review, Assessment B: Detector + Browser Evidence, Assessment Orchestration, Hard Invariants, Persist the Snapshot, Purpose (+2 more)

### Community 145 - "Nielsen's 10 Heuristics"
Cohesion: 0.18
Nodes (11): 10. Help and Documentation, 1. Visibility of System Status, 2. Match Between System and Real World, 3. User Control and Freedom, 4. Consistency and Standards, 5. Error Prevention, 6. Recognition Rather Than Recall, 7. Flexibility and Efficiency of Use (+3 more)

### Community 146 - "New visual work"
Cohesion: 0.18
Nodes (11): 1. Decide what is already true, 2. Ask what will change the work, 3. Choose the right amount of invention, 4. Commit the world, 5. Record the decision, 6. Build with full commitment, 7. Inspect and finish, Create a whole surface inside an established world (+3 more)

### Community 147 - "polish.md"
Cohesion: 0.18
Nodes (10): 1. Establish the system, 2. Gather the evidence, 3. Triage, 4. Polish the whole path, 5. Verify and finish, Color, imagery, and icons, Content and code, Flow and hierarchy (+2 more)

### Community 148 - "quieter.md"
Cohesion: 0.18
Nodes (10): Assess Current State, Color Refinement, Composition Refinement, Motion Reduction, Plan Refinement, Refine the Design, Simplification, Verify Quality (+2 more)

### Community 149 - "classSelector"
Cohesion: 0.22
Nodes (11): checkEdgeFlushCardsDOM(), checkElementBlinkingCursorDOM(), checkElementTextOverflowDOM(), checkFirstViewportColumnOverflowDOM(), checkRepeatedContainerTextDOM(), classSelector(), collectRepeatedContainerTextFindings(), isRenderedForBrowserRule() (+3 more)

### Community 150 - "readConfig"
Cohesion: 0.20
Nodes (11): applyConfigSource(), applyDetectorConfigSource(), cloneDefaultConfig(), detectorSection(), hookSection(), ignoreValueFilesKey(), mergeIgnoreValues(), numberOr() (+3 more)

### Community 151 - "palette.mjs"
Cohesion: 0.24
Nodes (7): args, buildWeights(), hashUnit(), pickSeed(), seed, SEEDS, weightedPick()

### Community 152 - "Generate Combined Critique Report"
Cohesion: 0.20
Nodes (10): Design Health Score, Design Specificity Verdict, Generate Combined Critique Report, Minor Observations, Overall Impression, Persona Red Flags, Priority Issues, Questions to Consider (+2 more)

### Community 153 - "Init flow"
Cohesion: 0.20
Nodes (10): Completion gate, Init flow, Step 1: Load current state, Step 2: Explore the project, Step 3: Interview for product truth, Step 4: Write PRODUCT.md, Step 5: Configure live mode when useful, Step 6: Wrap up or resume (+2 more)

### Community 154 - "staleness-notice.mjs"
Cohesion: 0.38
Nodes (9): appendStalenessDirective(), buildStalenessDirective(), cachePath(), filterFreshFindings(), pruneCache(), readCache(), readJson(), stalenessCheckDisabled() (+1 more)

### Community 155 - "inline-ignores.mjs"
Cohesion: 0.40
Nodes (9): addRules(), applyInlineIgnores(), getSet(), hasDirectives(), isInlineIgnored(), normalizeRule(), parseInlineIgnores(), parseRuleList() (+1 more)

### Community 156 - "expandScanTargets"
Cohesion: 0.27
Nodes (10): coLocatedStylesheets(), expandScanTargets(), hasPathTraversal(), isInsideProject(), looksLikeProjectRoot(), normalizeScanTargets(), parseStaticStyleImports(), resolveCacheCwd() (+2 more)

### Community 157 - "Common Cognitive Load Violations"
Cohesion: 0.22
Nodes (9): 1. The Wall of Options, 2. The Memory Bridge, 3. The Hidden Navigation, 4. The Jargon Barrier, 5. The Visual Noise Floor, 6. The Inconsistent Pattern, 7. The Multi-Task Demand, 8. The Context Switch (+1 more)

### Community 158 - "Operate mode depth (and Read notes)"
Cohesion: 0.22
Nodes (9): Color, Components, Layout, Motion, Operate mode depth (and Read notes), Product constraints, Product permissions, The product slop test (+1 more)

### Community 159 - "Shape"
Cohesion: 0.22
Nodes (8): Cadence, Confirm and stop, Phase 1: Discovery interview, Phase 2: Resolve the design direction, Phase 3: Write the brief, Round 1: purpose, people, and outcome, Round 2: material, behavior, and boundaries, Shape

### Community 160 - "generation-preflight.mjs"
Cohesion: 0.39
Nodes (8): buildGenerationPreflight(), compactError(), execFileAsync, insertTarget(), normalizeTarget(), replaceTarget(), runGenerationPreflight(), prepareGenerateEventForLease()

### Community 161 - "Persona-Based Design Testing"
Cohesion: 0.25
Nodes (8): 1. Impatient Power User: "Alex", 2. Confused First-Timer: "Jordan", 3. Accessibility-Dependent User: "Sam", 4. Deliberate Stress Tester: "Riley", 5. Distracted Mobile User: "Casey", Persona-Based Design Testing, Project-Specific Personas, Selecting Personas

### Community 163 - "Extract Flow"
Cohesion: 0.25
Nodes (7): Extract Flow, Step 1: Discover the Design System, Step 2: Identify Patterns, Step 3: Plan Extraction, Step 4: Extract & Enrich, Step 5: Migrate, Step 6: Document

### Community 164 - "iOS platform"
Cohesion: 0.25
Nodes (8): Color & materials, Components & controls, iOS platform, Layout & structure, Motion, The iOS slop test, Touch targets, Typography

### Community 165 - "hook.mjs"
Cohesion: 0.39
Nodes (7): allow(), deny(), done(), isStopEvent(), writeAuditLog(), main(), readStdin()

### Community 166 - "source-lock.mjs"
Cohesion: 0.50
Nodes (7): isLiveServerPidReachable(), clearStaleLock(), readLock(), releaseOwnLock(), sleepSync(), sourceLockPath(), withSourceLockSync()

### Community 167 - "template-extensions.mjs"
Cohesion: 0.36
Nodes (6): extensionCache, LIVE_TEMPLATE_EXTENSIONS, mergeExtensions(), normalizeExtensionEntries(), readLiveTemplateExtensions(), safeReadJson()

### Community 168 - "Generate Report"
Cohesion: 0.13
Nodes (14): Android platform, Color & theming, Components & motion, Layout & structure, The Android slop test, Touch targets, Typography, Audit Health Score (+6 more)

### Community 169 - "Cognitive Load Assessment"
Cohesion: 0.29
Nodes (7): Cognitive Load Assessment, Cognitive Load Checklist, Extraneous Load: Bad Design, Germane Load: Learning Effort, Intrinsic Load: The Task Itself, The Working Memory Rule, Three Types of Cognitive Load

### Community 170 - "CSP detection (first-time only)"
Cohesion: 0.29
Nodes (7): append-arrays, append-string, Consent prompt template, CSP detection (first-time only), Drift-heal warning, First-time setup (config missing or invalid), Troubleshooting

### Community 171 - "BORDER_SAFE_TAGS"
Cohesion: 0.43
Nodes (7): checkBorders(), checkElementBorders(), checkElementBordersDOM(), isStatusContextElement(), isTabContextElement(), isNeutralColor(), BORDER_SAFE_TAGS

### Community 174 - "isScreenReaderOnlyTextStyle"
Cohesion: 0.20
Nodes (12): checkTextOcclusionDOM(), clippedByInset(), clippedByRect(), elementDirectText(), expandBoxShorthand(), firstMetricLengthPx(), isLayeredElement(), isOpaqueDecoratedBox() (+4 more)

### Community 175 - "generate-image.mjs"
Cohesion: 0.33
Nodes (4): out, promptFile, quality, size

### Community 176 - "source-search.mjs"
Cohesion: 0.38
Nodes (6): matchesTemplateExtension(), findSessionFile(), findSourceFile(), NEVER_SOURCE_DIRS, SOURCE_SEARCH_DIRS, walk()

### Community 179 - "Heuristics Scoring Guide"
Cohesion: 0.50
Nodes (4): Heuristics Scoring Guide, Issue Severity (P0–P3), Reference Material, Score Summary

### Community 180 - "detect.mjs"
Cohesion: 0.50
Nodes (3): candidates, detectorPath, __dirname

## Knowledge Gaps
- **630 isolated node(s):** `name`, `version`, `private`, `dev`, `build` (+625 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `el()` connect `el` to `ops.ts`, `dependencies`, `SAFE_TAGS`, `classSelector`, `design-system.mjs`, `detect-antipatterns-browser.js`, `checks.mjs`, `initPageChat`, `css-cascade.mjs`, `setLiveState`, `initGlobalBar`, `showToast`, `parseAnyColor`, `detect-text.mjs`, `collectBrowserFindings`, `resolveLengthPx`, `detect-url.mjs`, `collectVisualContrastCandidates`, `parseAnyColor`, `resolveLengthPx`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `v()` connect `modern-screenshot.umd.js` to `ops.ts`, `resolveVarRefs`, `context-signals.mjs`, `css-cascade.mjs`, `parseAnyColor`, `design-parser.mjs`, `initGlobalBar`, `scanCssTextForPulsingDot`, `parseAnyColor`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Why does `ACTIONS` connect `hook-admin.mjs` to `initGlobalBar`, `el`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Are the 43 inferred relationships involving `el()` (e.g. with `browserFindingsFromMap()` and `collectVisualContrastCandidates()`) actually correct?**
  _`el()` has 43 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _630 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12605042016806722 - nodes in this community are weakly interconnected._