# Vquizion - Interactive Learning & Skill Assessment Platform

Vquizion is a high-performance, client-side web application engineered for rigorous academic assessment, conceptual skill evaluation, and interactive learning. Built entirely with Vanilla JavaScript, semantic HTML5, and pure CSS3, Vquizion delivers an engaging, tactile experience without external framework dependencies.

The platform combines a minimal skeuomorphic design system with an algorithmic question engine capable of generating procedurally computed challenges and serving curated academic question banks across nine comprehensive subjects.

---

## Deployment Link : https://vquizion.vercel.app/

## Architectural Highlights

### 1. Minimal Skeuomorphic Design Language
Vquizion rejects decorative glassmorphism (`backdrop-filter: blur`), translucent blurs, and neon glow effects in favor of clean, functional skeuomorphism:
- Physical tactile depth: Buttons and cards feature solid surfaces, defined border radii, crisp keycaps, and calibrated drop shadows.
- Mechanical interaction feedback: Active states simulate tactile push buttons with realistic vertical depression (`transform: translateY`).
- Inset feedback tracks: Sliders, input fields, and progress bars utilize inset shadows to emulate physical control panels.

### 2. Ergonomic Minimal Color System
- Default Backdrop: Midnight Slate (`#0f172a`), providing high text contrast while eliminating the glare associated with stark white backgrounds.
- Dynamic Theme Engine: An integrated palette switcher located in the top navigation bar allows users to cycle through five curated, non-white minimal themes:
  - Midnight Slate (`#0f172a`) - Default dark slate
  - Deep Indigo (`#1e1b4b`) - Deep saturated indigo
  - Minimal Charcoal (`#18181b`) - Neutral dark charcoal
  - Deep Forest Sage (`#064e3b`) - Calming organic dark green
  - Warm Paper Sand (`#d8cfc4`) - High-contrast minimal warm paper tone
- Persistence: User theme selection is automatically persisted in `localStorage` across browsing sessions.

### 3. Dedicated Two-Phase Answer Workflow
To prevent accidental submissions and ensure deliberate evaluation:
- Selection Phase: Clicking an answer option highlights the candidate choice with an active border and radio indicator without grading. Users can switch their selection freely.
- Confirmation Phase: The option is formally locked and evaluated only when the user clicks the dedicated Confirm Answer button or presses the Enter key.
- Immediate Educational Concept Feedback: Upon confirmation, an informative feedback card expands beneath the question, revealing the full conceptual explanation, derivation, and correct answer before the user advances.

---

## Calibrated Difficulty Matrix

Vquizion enforces a standardized three-tier challenge system across all academic domains:

| Tier | Difficulty Level | Scope and Mathematical / Analytical Rigor |
| :--- | :--- | :--- |
| Easy | 40% Difficulty | Academic foundations. Excludes trivial arithmetic. Covers systems of linear equations, laws of fractional and negative exponents, 3D space diagonals, algorithm Big-O classifications, Snell's law of refraction, cell biology, and foundational international treaties. |
| Medium | 70% Difficulty | Advanced analytical and preparatory level. Encompasses logarithmic equations, radical quadratic roots, double-angle trigonometric identities, bitwise algorithms (Brian Kernighan's bitmask operations), relational database normalization (3NF and BCNF), HTTP/2 binary stream multiplexing, and Le Chatelier's equilibrium shifts. |
| Hard | 100% Difficulty | Master, Olympiad, and University degree standard. Solves calculus integration by parts, arctan standard integrals, matrix characteristic polynomial eigenvalues, Fermat's Little Theorem modular exponentiation, IPv4 VLSM CIDR subnetting, cache memory associativity tag/index/offset bit calculations, Raft distributed consensus quorum invariants, Carnot thermodynamic efficiency, and relativistic Lorentz factor time dilation. |

---

## Question Generation and Curation Engine

### Procedural Generation Subsystem
For STEM disciplines (Mathematics, Technology, and Science), Vquizion incorporates a dynamic procedural generator (`ProceduralQuestionGenerator`):
- Dynamic Parameter Randomization: Mathematical coefficients, matrix elements, exponents, memory addresses, and physical parameters are computed algorithmically on each invocation.
- Automated Step-by-Step Derivations: Explanations are constructed dynamically from the generated parameters, ensuring every problem is accompanied by a mathematically sound proof or derivation.
- Infinite Variety: Generates fresh, non-repeating questions on each quiz session.

### Curated Question Banks
The platform maintains an audited library of 85+ verified questions organized across nine subject areas:
1. Mathematics: Calculus, Linear Algebra, Modular Arithmetic, Trigonometry, and Geometry.
2. Technology: Computer Architecture, Operating Systems, Networking Protocols, Cryptography, Distributed Systems, and Database Theory.
3. Science: Quantum Physics, Thermodynamics, Relativistic Mechanics, Organic Chemistry, Molecular Genetics, and Electrochemistry.
4. History: Diplomatic Treaties, Imperial Politics, Political Revolutions, and Global Conflicts.
5. Geography: Climatology (Koppen classifications), Plate Tectonics, Oceanography, Geomorphology, and Biogeography.
6. Literature: Narratology, Classical Greek Epics, Modernist Literature, Existential Philosophy, and Poetic Meter.
7. Art and Culture: Classical Architectural Orders, Renaissance Techniques (Sfumato, Chiaroscuro), Avant-Garde Movements (Bauhaus, Surrealism, Cubism), and Color Theory.
8. Sports: Historical Olympic Milestones, Regulatory Rules (Offside Law, Shot Clock, Formula 1 DRS), and Endurance Athletics.
9. General Knowledge: International Law, Particle Physics (Standard Model), Astrophysics, and Global Institutions.

### Session Deduplication
The platform maintains a persistent record of previously viewed question IDs in `localStorage`. Consecutive quiz sessions prioritize unseen questions, guaranteeing that learners encounter fresh material during practice.

---

## User Interface and Assessment Lifecycle

1. User Registration: Captures learner profile attributes (Full Name, Age, Educational Qualification, and Primary Subject Focus) to tune initial parameters.
2. Configuration Dashboard: Enables granular customization of:
   - Subject Focus: Interactive selector tiles with custom icon badges.
   - Challenge Tier: Pill selectors for Easy (40%), Medium (70%), and Hard (100%).
   - Question Volume: 5, 10, 15, or 20 questions per session.
   - Countdown Timer: 30 seconds (Fast), 60 seconds (Standard), or 90 seconds (Relaxed).
3. Live Assessment HUD:
   - Question counter and inset visual progress bar.
   - Dynamic Challenge Tier badge (`Hard 100%`, `Medium 70%`, `Easy 40%`).
   - Countdown timer with mechanical color states (Standard, Warning, and Danger pulse).
   - Real-time score accumulator.
   - Timed skip button preventing premature abandonment.
4. Performance Analytics Dashboard:
   - Circular percentage score dial.
   - Metric overview: Correct Answers, Total Duration, Average Pace per Question, and Performance Tier.
   - Collapsible Answer Review Accordion: Compares user selections against correct answers, accompanied by complete educational concept explanations.
   - Social Sharing: Web Share API integration with automatic clipboard fallback.

---

## Audio Synthesis and Accessibility

### Web Audio API Synthesizer
Vquizion features a built-in procedural sound generator using the browser's native `AudioContext`, requiring zero external audio assets:
- Tactile Click: Short triangle-wave frequency sweep simulating a physical mechanical switch.
- Correct Affirmation: Two-tone sine-wave chord progression (D5 to A5 to D6).
- Incorrect Notification: Sawtooth-wave downward pitch glide.
- Timer Tick: Subtle square-wave impulse providing auditory pacing cues.
- Victory Fanfare: Harmonic multi-note arpeggio upon quiz completion.
- Audio Mute: Accessible toggle button with persistent state stored in `localStorage`.

### Keyboard Shortcuts

| Shortcut | Context | Function |
| :--- | :--- | :--- |
| 1, 2, 3, 4 | Quiz View | Select Option A, B, C, or D |
| A, B, C, D | Quiz View | Select Option A, B, C, or D |
| Enter | Quiz View | Confirm Selected Answer / Advance to Next Question |
| S | Quiz View | Skip Question (when timer unlocked) |
| M | Universal | Toggle Audio Mute |

---

## Project Structure

```text
├── index.html        # Semantic HTML5 markup, views, and modal structures
├── style.css         # Minimal skeuomorphic styles, theme tokens, and layouts
├── script.js         # Core application logic, procedural engine, and question banks
└── README.md         # Comprehensive project documentation
```

---
## Automated Verification

The application includes standalone test suites located in the repository scratch space to validate functionality:
- `node -c script.js`: Verifies JavaScript syntax integrity.
- `scratch/test_difficulty_scaling.js`: Validates 135 live questions across all nine subjects, ensuring rigorous mathematical calculations and complete explanations.
- `scratch/test_full_banks.js`: Audits all 85 curated question bank entries for field completeness and distractor validity.
- `scratch/test_confirm_workflow.js`: Verifies the two-phase answer selection and confirm gating mechanism.

---

## License

This project is open-source and available under the terms of the MIT License.
