// ==========================================================================
// TACTILE WEB AUDIO SYNTHESIZER
// ==========================================================================
class TactileSoundController {
    constructor() {
        this.ctx = null;
        this.isMuted = localStorage.getItem('quizmaster_muted') === 'true';
        this.initAudioContext();
    }

    initAudioContext() {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx && !this.ctx) {
            this.ctx = new AudioCtx();
        }
    }

    resumeAudio() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('quizmaster_muted', this.isMuted);
        return this.isMuted;
    }

    playClick() {
        if (this.isMuted) return;
        this.initAudioContext();
        this.resumeAudio();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(120, now + 0.04);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.04);
        } catch (e) {
            console.warn('Audio click error', e);
        }
    }

    playCorrect() {
        if (this.isMuted) return;
        this.initAudioContext();
        this.resumeAudio();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc1.type = 'sine';
            osc2.type = 'sine';

            osc1.frequency.setValueAtTime(587.33, now); // D5
            osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.12); // A5

            osc2.frequency.setValueAtTime(880.00, now + 0.1);
            osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.28); // D6

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(this.ctx.destination);

            osc1.start(now);
            osc2.start(now + 0.1);
            osc1.stop(now + 0.4);
            osc2.stop(now + 0.4);
        } catch (e) {
            console.warn('Audio correct error', e);
        }
    }

    playIncorrect() {
        if (this.isMuted) return;
        this.initAudioContext();
        this.resumeAudio();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(130, now + 0.25);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.28);
        } catch (e) {
            console.warn('Audio incorrect error', e);
        }
    }

    playTick() {
        if (this.isMuted) return;
        this.initAudioContext();
        this.resumeAudio();
        if (!this.ctx) return;

        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(750, now);

            gain.gain.setValueAtTime(0.02, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.035);
        } catch (e) {
            console.warn('Audio tick error', e);
        }
    }

    playVictory() {
        if (this.isMuted) return;
        this.initAudioContext();
        this.resumeAudio();
        if (!this.ctx) return;

        try {
            const notes = [440, 554.37, 659.25, 880];
            const now = this.ctx.currentTime;

            notes.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.1);

                gain.gain.setValueAtTime(0.1, now + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.35);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now + idx * 0.1);
                osc.stop(now + idx * 0.1 + 0.35);
            });
        } catch (e) {
            console.warn('Audio victory error', e);
        }
    }
}

// Utility: Fisher-Yates (Knuth) Shuffle
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Utility: HTML Entity Decoder for live API questions
function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// ==========================================================================
// DYNAMIC PROCEDURAL QUESTION GENERATOR
// Produces infinite unique questions with complete step-by-step explanations
// Difficulty Tiers: Easy (40%), Medium (70%), Hard (100% Olympiad / University)
// ==========================================================================
class ProceduralQuestionGenerator {
    static generateRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static normalizeDifficulty(input) {
        if (!input) return 'medium';
        const str = String(input).toLowerCase();
        if (str === 'hard' || str === 'college' || str === 'graduate' || str === 'professional') return 'hard';
        if (str === 'medium' || str === 'high') return 'medium';
        return 'easy';
    }

    // --------------------------------------------------------------------------
    // MATHEMATICS: Easy (40%), Medium (70%), Hard (100%)
    // --------------------------------------------------------------------------
    static generateMathQuestion(diffOrTier) {
        const diff = this.normalizeDifficulty(diffOrTier);
        const id = `proc_math_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        if (diff === 'hard') {
            // 100% Difficulty: Calculus Integrals, Linear Algebra Eigenvalues, Modular Exponentiation
            const types = ['integration_by_parts', 'arctan_integral', 'matrix_eigenvalues', 'modular_exponentiation'];
            const type = types[this.generateRandomInt(0, types.length - 1)];

            if (type === 'integration_by_parts') {
                const k = this.generateRandomInt(2, 5);
                const k2 = k * k;
                return {
                    id,
                    difficulty: 'hard',
                    levelPct: '100%',
                    question: `Evaluate the indefinite integral: ∫ x · e^(${k}x) dx`,
                    correct_answer: `(1/${k})x·e^(${k}x) - (1/${k2})e^(${k}x) + C`,
                    incorrect_answers: [
                        `(1/${k})x·e^(${k}x) + (1/${k2})e^(${k}x) + C`,
                        `x·e^(${k}x) - (1/${k})e^(${k}x) + C`,
                        `(1/${k2})x²·e^(${k}x) + C`
                    ],
                    explanation: `Using Integration by Parts (∫ u dv = u·v - ∫ v du): Let u = x (du = dx) and dv = e^(${k}x) dx (v = (1/${k})e^(${k}x)). Then ∫ x·e^(${k}x) dx = (1/${k})x·e^(${k}x) - ∫ (1/${k})e^(${k}x) dx = (1/${k})x·e^(${k}x) - (1/${k2})e^(${k}x) + C.`
                };
            }

            if (type === 'arctan_integral') {
                const a = this.generateRandomInt(2, 7);
                const a2 = a * a;
                return {
                    id,
                    difficulty: 'hard',
                    levelPct: '100%',
                    question: `Evaluate the standard integral: ∫ 1 / (x² + ${a2}) dx`,
                    correct_answer: `(1/${a}) arctan(x/${a}) + C`,
                    incorrect_answers: [
                        `arctan(x/${a}) + C`,
                        `(1/${a2}) arctan(x) + C`,
                        `ln(x² + ${a2}) + C`
                    ],
                    explanation: `By standard trigonometric substitution (or table integral ∫ 1/(x² + a²) dx = (1/a) arctan(x/a) + C), substituting a = ${a} gives (1/${a}) arctan(x/${a}) + C.`
                };
            }

            if (type === 'matrix_eigenvalues') {
                const l1 = this.generateRandomInt(2, 5);
                const l2 = l1 + this.generateRandomInt(1, 4);
                const trace = l1 + l2;
                const det = l1 * l2;
                const a = l1 + 1;
                const d = trace - a;
                const bc = a * d - det;
                const b = 1;
                const c = bc;

                return {
                    id,
                    difficulty: 'hard',
                    levelPct: '100%',
                    question: `Find the real eigenvalues of matrix A = [[${a}, ${b}], [${c}, ${d}]].`,
                    correct_answer: `λ = ${l1}, λ = ${l2}`,
                    incorrect_answers: [
                        `λ = ${l1 - 1}, λ = ${l2 + 1}`,
                        `λ = ${-l1}, λ = ${-l2}`,
                        `λ = ${trace}, λ = ${det}`
                    ],
                    explanation: `The characteristic equation is det(A - λI) = λ² - Tr(A)λ + det(A) = 0. Here, Tr(A) = ${a} + ${d} = ${trace} and det(A) = (${a})(${d}) - (${b})(${c}) = ${det}. Factoring λ² - ${trace}λ + ${det} = (λ - ${l1})(λ - ${l2}) = 0 yields eigenvalues λ = ${l1} and λ = ${l2}.`
                };
            }

            // modular_exponentiation: Fermat's Little Theorem
            const primes = [11, 13, 17];
            const p = primes[this.generateRandomInt(0, primes.length - 1)];
            const base = this.generateRandomInt(2, 5);
            const rem = this.generateRandomInt(2, 4);
            const k = this.generateRandomInt(5, 12);
            const exp = k * (p - 1) + rem;
            const target = Math.pow(base, rem) % p;
            const wrong1 = (target + 2) % p;
            const wrong2 = (target + p - 1) % p;
            const wrong3 = (target + 3) % p;

            return {
                id,
                difficulty: 'hard',
                levelPct: '100%',
                question: `Using Fermat's Little Theorem, compute the remainder: ${base}^${exp} mod ${p}`,
                correct_answer: String(target),
                incorrect_answers: [String(wrong1), String(wrong2), String(wrong3)].filter(x => x !== String(target)).slice(0, 3),
                explanation: `Since ${p} is prime and gcd(${base}, ${p}) = 1, Fermat's Little Theorem states ${base}^(${p - 1}) ≡ 1 (mod ${p}). Express ${exp} as ${k} × (${p - 1}) + ${rem}. Thus, ${base}^${exp} ≡ (${base}^${p - 1})^${k} · ${base}^${rem} ≡ 1^${k} · ${base}^${rem} ≡ ${Math.pow(base, rem)} ≡ ${target} (mod ${p}).`
            };
        }

        if (diff === 'medium') {
            // 70% Difficulty: Logarithmic Equations, Radical Roots, Double-Angle Trig
            const types = ['log_solve', 'radical_roots', 'trig_double_angle'];
            const type = types[this.generateRandomInt(0, types.length - 1)];

            if (type === 'log_solve') {
                const x = this.generateRandomInt(4, 8);
                const k = this.generateRandomInt(1, 3);
                const prod = x * (x - k);
                return {
                    id,
                    difficulty: 'medium',
                    levelPct: '70%',
                    question: `Solve for real x: log₂(${prod}) = log₂(x) + log₂(x - ${k})`,
                    correct_answer: `x = ${x}`,
                    incorrect_answers: [`x = ${x + 2}`, `x = ${Math.max(1, x - 2)}`, `x = ${x + 4}`],
                    explanation: `By logarithm product rules, log₂(x) + log₂(x - ${k}) = log₂(x(x - ${k})). Equating arguments: x² - ${k}x = ${prod} ⟹ x² - ${k}x - ${prod} = (x - ${x})(x + ${x - k}) = 0. Since arguments to log must be positive, x = ${x}.`
                };
            }

            if (type === 'radical_roots') {
                const b = this.generateRandomInt(2, 6);
                const d = [2, 3, 5, 7][this.generateRandomInt(0, 3)];
                const c = b * b - d;
                return {
                    id,
                    difficulty: 'medium',
                    levelPct: '70%',
                    question: `What are the exact solutions to x² - ${2 * b}x + ${c} = 0?`,
                    correct_answer: `x = ${b} ± √${d}`,
                    incorrect_answers: [
                        `x = ${2 * b} ± √${d}`,
                        `x = ${b} ± √${d + 4}`,
                        `x = ${-b} ± √${d}`
                    ],
                    explanation: `Applying the quadratic formula: x = (-B ± √(B² - 4AC)) / 2A = (${2 * b} ± √(${4 * b * b} - ${4 * c})) / 2 = (${2 * b} ± √(4 · ${d})) / 2 = ${b} ± √${d}.`
                };
            }

            return {
                id,
                difficulty: 'medium',
                levelPct: '70%',
                question: `If cos(θ) = 4/5, what is the exact value of cos(2θ)?`,
                correct_answer: `7/25`,
                incorrect_answers: [`24/25`, `16/25`, `9/25`],
                explanation: `Using the double-angle identity for cosine: cos(2θ) = 2·cos²(θ) - 1 = 2·(4/5)² - 1 = 2·(16/25) - 1 = 32/25 - 25/25 = 7/25.`
            };
        }

        // Easy: 40% Difficulty: System of Linear Equations, 3D Box Diagonals, Combinations
        const types = ['linear_system', 'box_diagonal', 'combinations'];
        const type = types[this.generateRandomInt(0, types.length - 1)];

        if (type === 'linear_system') {
            const x = this.generateRandomInt(2, 6);
            const y = this.generateRandomInt(1, 5);
            const eq1 = 2 * x + 3 * y;
            const eq2 = x - y;
            return {
                id,
                difficulty: 'easy',
                levelPct: '40%',
                question: `Solve the linear system: { 2x + 3y = ${eq1}, x - y = ${eq2} }`,
                correct_answer: `x = ${x}, y = ${y}`,
                incorrect_answers: [
                    `x = ${x + 1}, y = ${y - 1}`,
                    `x = ${y}, y = ${x}`,
                    `x = ${x + 2}, y = ${y + 1}`
                ],
                explanation: `From the second equation, x = y + ${eq2}. Substitute into the first: 2(y + ${eq2}) + 3y = 5y + ${2 * eq2} = ${eq1} ⟹ 5y = ${eq1 - 2 * eq2} ⟹ y = ${y}. Then x = ${y} + ${eq2} = ${x}.`
            };
        }

        if (type === 'box_diagonal') {
            const triples = [
                { l: 2, w: 3, h: 6, d: 7 },
                { l: 1, w: 4, h: 8, d: 9 },
                { l: 4, w: 4, h: 7, d: 9 },
                { l: 3, w: 4, h: 12, d: 13 }
            ];
            const item = triples[this.generateRandomInt(0, triples.length - 1)];
            return {
                id,
                difficulty: 'easy',
                levelPct: '40%',
                question: `Find the interior space diagonal length of a rectangular box with dimensions ${item.l} × ${item.w} × ${item.h}.`,
                correct_answer: `${item.d}`,
                incorrect_answers: [`${item.d + 2}`, `${item.d - 1}`, `${item.l + item.w + item.h}`],
                explanation: `The interior 3D diagonal is d = √(l² + w² + h²) = √(${item.l * item.l} + ${item.w * item.w} + ${item.h * item.h}) = √${item.d * item.d} = ${item.d}.`
            };
        }

        const n = this.generateRandomInt(6, 9);
        const ans = (n * (n - 1)) / 2;
        return {
            id,
            difficulty: 'easy',
            levelPct: '40%',
            question: `How many distinct combinations of 2 items can be chosen from a group of ${n}? (C(${n}, 2))`,
            correct_answer: `${ans}`,
            incorrect_answers: [`${ans + n}`, `${ans - 2}`, `${n * 2}`],
            explanation: `Combinations formula: C(n, r) = n! / (r! · (n - r)!). Here, C(${n}, 2) = (${n} × ${n - 1}) / 2 = ${ans}.`
        };
    }

    // --------------------------------------------------------------------------
    // TECHNOLOGY: Easy (40%), Medium (70%), Hard (100%)
    // --------------------------------------------------------------------------
    static generateTechQuestion(diffOrTier) {
        const diff = this.normalizeDifficulty(diffOrTier);
        const id = `proc_tech_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        if (diff === 'hard') {
            const types = ['subnet_cidr', 'cache_bits', 'raft_consensus', 'amortized_complexity'];
            const type = types[this.generateRandomInt(0, types.length - 1)];

            if (type === 'subnet_cidr') {
                const subnets = [
                    { cidr: '/27', mask: '255.255.255.224', hosts: 30, block: 32 },
                    { cidr: '/28', mask: '255.255.255.240', hosts: 14, block: 16 },
                    { cidr: '/29', mask: '255.255.255.248', hosts: 6, block: 8 }
                ];
                const sub = subnets[this.generateRandomInt(0, subnets.length - 1)];
                return {
                    id,
                    difficulty: 'hard',
                    levelPct: '100%',
                    question: `For an IPv4 network with prefix ${sub.cidr}, what is the maximum number of usable host IP addresses?`,
                    correct_answer: `${sub.hosts} usable hosts`,
                    incorrect_answers: [`${sub.block} usable hosts`, `${sub.hosts + 2} usable hosts`, `${sub.hosts - 4} usable hosts`],
                    explanation: `With a ${sub.cidr} subnet prefix, host bits = 32 - ${parseInt(sub.cidr.replace('/', ''))} = ${32 - parseInt(sub.cidr.replace('/', ''))}. Total IP addresses = 2^${32 - parseInt(sub.cidr.replace('/', ''))} = ${sub.block}. Subtracting 2 (network identifier and broadcast address) yields ${sub.hosts} usable host IPs.`
                };
            }

            if (type === 'cache_bits') {
                return {
                    id,
                    difficulty: 'hard',
                    levelPct: '100%',
                    question: `In a 32-bit physical address system with a 64 KB 4-way set associative cache and 64-byte cache lines, how many bits are used for the Set Index?`,
                    correct_answer: `8 bits`,
                    incorrect_answers: [`6 bits`, `10 bits`, `16 bits`],
                    explanation: `Line offset = log₂(64) = 6 bits. Total lines = 64 KB / 64 B = 1024 lines. Number of sets = 1024 / 4 (ways) = 256 sets. Set index bits = log₂(256) = 8 bits. (Tag bits = 32 - 8 - 6 = 18 bits).`
                };
            }

            if (type === 'raft_consensus') {
                return {
                    id,
                    difficulty: 'hard',
                    levelPct: '100%',
                    question: `In the Raft distributed consensus algorithm, what condition must a candidate satisfy to be elected Leader in term T?`,
                    correct_answer: `Receive votes from a strict majority (quorum) of nodes in term T`,
                    incorrect_answers: [
                        `Receive votes from at least 1/3 of the cluster nodes`,
                        `Possess the lowest numeric node identifier in the cluster`,
                        `Acknowledge an active lease from the previous leader`
                    ],
                    explanation: `Raft guarantees election safety because any two majorities (quorums) must overlap by at least one node. Thus, requiring a strict majority ensures at most one leader can be elected per term.`
                };
            }

            return {
                id,
                difficulty: 'hard',
                levelPct: '100%',
                question: `What is the amortized time complexity of Union-Find operations using both Path Compression and Union by Rank?`,
                correct_answer: `O(α(n)), where α is the Inverse Ackermann function`,
                incorrect_answers: [`O(log n)`, `O(1) strictly`, `O(n log* n)`],
                explanation: `Robert Tarjan proved that combining union-by-rank and path compression bounds the amortized cost of m operations on n elements to O(m · α(n)), where α(n) is the extremely slow-growing inverse Ackermann function (practically ≤ 4 for all realistic n).`
            };
        }

        if (diff === 'medium') {
            const types = ['brian_kernighan', 'db_bcnf', 'http2_features'];
            const type = types[this.generateRandomInt(0, types.length - 1)];

            if (type === 'brian_kernighan') {
                return {
                    id,
                    difficulty: 'medium',
                    levelPct: '70%',
                    question: `In bit manipulation, what does the expression (n & (n - 1)) accomplish?`,
                    correct_answer: `Clears the lowest set bit (rightmost 1-bit) in n`,
                    incorrect_answers: [
                        `Inverts all bits of n`,
                        `Checks whether n is an odd number`,
                        `Multiplies n by 2 using bit-shifting`
                    ],
                    explanation: `Subtracting 1 flips the rightmost set bit and all subsequent zeros to ones. Bitwise ANDing n with (n - 1) resets that rightmost 1-bit to 0, forming the basis of Brian Kernighan’s algorithm for counting set bits in O(set bits) time.`
                };
            }

            if (type === 'db_bcnf') {
                return {
                    id,
                    difficulty: 'medium',
                    levelPct: '70%',
                    question: `In database relational design, what condition is required for a relation to be in Boyce-Codd Normal Form (BCNF)?`,
                    correct_answer: `For every functional dependency X ➔ Y, X must be a superkey`,
                    incorrect_answers: [
                        `All non-prime attributes must depend on the primary key`,
                        `No transitive dependencies exist between non-key attributes`,
                        `Every attribute must contain strictly atomic numeric values`
                    ],
                    explanation: `BCNF is a stricter version of 3NF. While 3NF permits X ➔ Y if Y is a prime attribute, BCNF strictly requires that the determinant X must always be a candidate key (superkey).`
                };
            }

            return {
                id,
                difficulty: 'medium',
                levelPct: '70%',
                question: `Which fundamental enhancement in HTTP/2 resolves the Head-of-Line (HoL) blocking issue present in HTTP/1.1 pipelining?`,
                correct_answer: `Binary framing and bi-directional stream multiplexing over a single TCP connection`,
                incorrect_answers: [
                    `Switching the underlying transport protocol from TCP to UDP`,
                    `Compressing HTTP payloads using gzip instead of brotli`,
                    `Requiring all server responses to be cached indefinitely`
                ],
                explanation: `HTTP/2 introduces a binary framing layer that breaks messages into independent frames interleaved over a single TCP connection, allowing concurrent requests and responses without waiting for earlier ones to finish.`
            };
        }

        // Easy: 40% Difficulty: Big-O, Unit Conversions, Network Ports
        const types = ['big_o', 'byte_units', 'ports'];
        const type = types[this.generateRandomInt(0, types.length - 1)];

        if (type === 'big_o') {
            return {
                id,
                difficulty: 'easy',
                levelPct: '40%',
                question: `What is the worst-case time complexity of the standard QuickSort algorithm when selecting a fixed pivot?`,
                correct_answer: `O(n²)`,
                incorrect_answers: [`O(n log n)`, `O(n)`, `O(log n)`],
                explanation: `If the pivot chosen is consistently the smallest or largest element (such as on an already sorted array with naive pivot selection), the recursion depth becomes n, degrading QuickSort to O(n²).`
            };
        }

        if (type === 'byte_units') {
            const gib = this.generateRandomInt(2, 8);
            const mib = gib * 1024;
            return {
                id,
                difficulty: 'easy',
                levelPct: '40%',
                question: `In standard binary IEC data units, how many Mebibytes (MiB) are in ${gib} Gibibytes (GiB)?`,
                correct_answer: `${mib} MiB`,
                incorrect_answers: [`${gib * 1000} MiB`, `${gib * 512} MiB`, `${mib * 2} MiB`],
                explanation: `In binary data prefixes (IEC standard), 1 GiB = 2¹⁰ MiB = 1024 MiB. Therefore, ${gib} GiB = ${gib} × 1024 = ${mib} MiB.`
            };
        }

        return {
            id,
            difficulty: 'easy',
            levelPct: '40%',
            question: `Which standard TCP port is assigned for secure HTTPS web traffic?`,
            correct_answer: `Port 443`,
            incorrect_answers: [`Port 80`, `Port 22`, `Port 8080`],
            explanation: `By IANA standards, standard unencrypted HTTP uses Port 80, while encrypted HTTP over TLS/SSL (HTTPS) uses Port 443.`
        };
    }

    // --------------------------------------------------------------------------
    // SCIENCE: Easy (40%), Medium (70%), Hard (100%)
    // --------------------------------------------------------------------------
    static generateScienceQuestion(diffOrTier) {
        const diff = this.normalizeDifficulty(diffOrTier);
        const id = `proc_sci_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

        if (diff === 'hard') {
            const types = ['carnot_efficiency', 'lorentz_dilation', 'henderson_hasselbalch', 'de_broglie'];
            const type = types[this.generateRandomInt(0, types.length - 1)];

            if (type === 'carnot_efficiency') {
                const tcC = 27; // 300 K
                const thC = 327; // 600 K
                const eta = ((600 - 300) / 600) * 100;
                return {
                    id,
                    difficulty: 'hard',
                    levelPct: '100%',
                    question: `Calculate the maximum theoretical Carnot heat engine efficiency operating between cold reservoir Tc = ${tcC}°C and hot reservoir Th = ${thC}°C.`,
                    correct_answer: `${eta}%`,
                    incorrect_answers: [`${Math.round((1 - tcC / thC) * 100)}%`, `75%`, `33%`],
                    explanation: `Carnot efficiency requires temperatures in Kelvin: Tc = ${tcC} + 273.15 ≈ 300 K, Th = ${thC} + 273.15 ≈ 600 K. Maximum efficiency η = 1 - (Tc / Th) = 1 - (300 / 600) = 0.50 = 50%.`
                };
            }

            if (type === 'lorentz_dilation') {
                return {
                    id,
                    difficulty: 'hard',
                    levelPct: '100%',
                    question: `According to Special Relativity, if a spacecraft travels at v = 0.8c (where c is the speed of light), what is its Lorentz factor γ?`,
                    correct_answer: `γ = 1.67 (5/3)`,
                    incorrect_answers: [`γ = 1.25 (5/4)`, `γ = 2.00`, `γ = 0.60`],
                    explanation: `The Lorentz factor γ = 1 / √(1 - (v/c)²). For v = 0.8c, v²/c² = 0.64. Then √(1 - 0.64) = √0.36 = 0.6. Thus, γ = 1 / 0.6 = 5/3 ≈ 1.67.`
                };
            }

            if (type === 'henderson_hasselbalch') {
                return {
                    id,
                    difficulty: 'hard',
                    levelPct: '100%',
                    question: `A buffer solution has [A⁻]/[HA] = 10 and the weak acid has pKa = 4.76. What is the solution pH?`,
                    correct_answer: `5.76`,
                    incorrect_answers: [`3.76`, `4.76`, `6.76`],
                    explanation: `Applying the Henderson-Hasselbalch equation: pH = pKa + log₁₀([A⁻] / [HA]) = 4.76 + log₁₀(10) = 4.76 + 1.00 = 5.76.`
                };
            }

            return {
                id,
                difficulty: 'hard',
                levelPct: '100%',
                question: `Which fundamental equation expresses the de Broglie matter wavelength λ of a particle with linear momentum p?`,
                correct_answer: `λ = h / p`,
                incorrect_answers: [`λ = h · p`, `λ = p / c²`, `λ = h / c`],
                explanation: `Louis de Broglie hypothesized wave-particle duality where any moving particle exhibits a matter wavelength λ = h / p (Planck's constant divided by momentum p = mv).`
            };
        }

        if (diff === 'medium') {
            const types = ['centripetal_acc', 'half_life', 'coulombs_law'];
            const type = types[this.generateRandomInt(0, types.length - 1)];

            if (type === 'centripetal_acc') {
                const v = [10, 20, 30][this.generateRandomInt(0, 2)];
                const r = [2, 5, 10][this.generateRandomInt(0, 2)];
                const ac = (v * v) / r;
                return {
                    id,
                    difficulty: 'medium',
                    levelPct: '70%',
                    question: `What is the centripetal acceleration of a vehicle moving at ${v} m/s around a circular track of radius ${r} m?`,
                    correct_answer: `${ac} m/s²`,
                    incorrect_answers: [`${ac / 2} m/s²`, `${v * r} m/s²`, `${ac + 15} m/s²`],
                    explanation: `Centripetal acceleration is defined as ac = v² / r = (${v})² / ${r} = ${v * v} / ${r} = ${ac} m/s².`
                };
            }

            if (type === 'half_life') {
                const halfLife = [5, 10, 15][this.generateRandomInt(0, 2)];
                const elapsed = halfLife * 3;
                return {
                    id,
                    difficulty: 'medium',
                    levelPct: '70%',
                    question: `A radioactive isotope has a half-life of ${halfLife} years. What fraction of the original sample remains after ${elapsed} years?`,
                    correct_answer: `1/8 (12.5%)`,
                    incorrect_answers: [`1/4 (25%)`, `1/16 (6.25%)`, `1/6 (16.7%)`],
                    explanation: `The number of half-lives elapsed is n = ${elapsed} / ${halfLife} = 3. Remaining fraction = (1/2)ⁿ = (1/2)³ = 1/8 (12.5%).`
                };
            }

            return {
                id,
                difficulty: 'medium',
                levelPct: '70%',
                question: `According to Coulomb’s Law, if the distance r between two point charges is tripled (3r), how does the electrostatic force change?`,
                correct_answer: `Decreases by a factor of 9 (F / 9)`,
                incorrect_answers: [
                    `Decreases by a factor of 3 (F / 3)`,
                    `Increases by a factor of 3 (3F)`,
                    `Decreases by a factor of 6 (F / 6)`
                ],
                explanation: `Coulomb's Law states F = k·|q₁·q₂| / r². Force obeys an inverse-square law with respect to distance. Tripling r replaces r² with (3r)² = 9r², reducing the force to F/9.`
            };
        }

        // Easy: 40% Difficulty: Work/Power, Snell's Law, Conservation of Momentum
        const types = ['snells_law', 'work_power', 'periodic_trends'];
        const type = types[this.generateRandomInt(0, types.length - 1)];

        if (type === 'snells_law') {
            return {
                id,
                difficulty: 'easy',
                levelPct: '40%',
                question: `Which fundamental physics law governs the relationship between the angles of incidence and refraction for light passing between media?`,
                correct_answer: `Snell's Law (n₁ sin θ₁ = n₂ sin θ₂)`,
                incorrect_answers: [
                    `Hooke's Law (F = -kx)`,
                    `Bragg's Law (nλ = 2d sin θ)`,
                    `Beer-Lambert Law (A = εlc)`
                ],
                explanation: `Snell's Law of Refraction relates the refractive indices of two media (n₁, n₂) to the sines of the angles of incidence (θ₁) and refraction (θ₂): n₁ sin θ₁ = n₂ sin θ₂.`
            };
        }

        if (type === 'work_power') {
            const f = this.generateRandomInt(20, 50);
            const d = this.generateRandomInt(4, 10);
            const t = 5;
            const w = f * d;
            const p = w / t;
            return {
                id,
                difficulty: 'easy',
                levelPct: '40%',
                question: `If a constant force of ${f} N moves an object ${d} m in ${t} seconds in the direction of the force, what average power is delivered?`,
                correct_answer: `${p} Watts`,
                incorrect_answers: [`${w} Watts`, `${p * 2} Watts`, `${f * t} Watts`],
                explanation: `Work done W = Force × displacement = ${f} N × ${d} m = ${w} Joules. Power P = Work / time = ${w} J / ${t} s = ${p} Watts.`
            };
        }

        return {
            id,
            difficulty: 'easy',
            levelPct: '40%',
            question: `Across a period from left to right on the periodic table, what is the general trend for first ionization energy?`,
            correct_answer: `It generally increases due to increasing effective nuclear charge`,
            incorrect_answers: [
                `It steadily decreases because atomic radius expands`,
                `It remains constant across all main group elements`,
                `It drops to zero for noble gases`
            ],
            explanation: `Across a period, protons are added to the nucleus while electrons enter the same principal energy level. The resulting increase in effective nuclear charge pulls electrons tighter, requiring greater energy to remove an electron.`
        };
    }
}

// ==========================================================================
// MAIN QUIZ APPLICATION CLASS
// ==========================================================================
class QuizApp {
    constructor() {
        this.userData = {
            name: '',
            age: 0,
            qualification: '',
            favoriteSubject: 'general'
        };
        this.quizData = {
            category: 'general',
            difficulty: 'medium',
            questionCount: 10,
            timerDuration: 60
        };
        
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        
        // Two-phase selection state
        this.selectedAnswer = null;
        this.selectedButton = null;
        
        // Timers
        this.timer = null;
        this.skipTimer = null;
        this.questionTimeout = null;
        this.loadingInterval = null;
        
        this.timeRemaining = 0;
        this.skipTimeRemaining = 15;
        this.quizStartTime = null;
        this.totalQuizTime = 0;
        this.isAnswered = false;
        this.questionStartTime = null;
        
        this.sound = new TactileSoundController();
        this.seenQuestionIds = this.loadSeenQuestionIds();
        this.questionBanks = this.initQuestionBanks();

        this.init();
    }

    loadSeenQuestionIds() {
        try {
            const raw = localStorage.getItem('quizmaster_seen_questions');
            return raw ? new Set(JSON.parse(raw)) : new Set();
        } catch (e) {
            return new Set();
        }
    }

    saveSeenQuestionIds() {
        try {
            const arr = Array.from(this.seenQuestionIds).slice(-400);
            localStorage.setItem('quizmaster_seen_questions', JSON.stringify(arr));
        } catch (e) {
            console.warn('Could not save seen question history', e);
        }
    }

    init() {
        this.setupThemePicker();
        this.setupEventListeners();
        this.setupDashboardControls();
        this.setupKeyboardNavigation();
        this.updateSoundIcon();
        this.showPage('registration-page');
    }

    setupThemePicker() {
        const savedTheme = localStorage.getItem('quizmaster_theme') || 'slate';
        if (document.documentElement) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        const themeDots = document.querySelectorAll('.theme-dot');
        themeDots.forEach(dot => {
            const theme = dot.getAttribute('data-theme');
            if (theme === savedTheme) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }

            dot.addEventListener('click', () => {
                const selectedTheme = dot.getAttribute('data-theme');
                if (document.documentElement) {
                    document.documentElement.setAttribute('data-theme', selectedTheme);
                }
                localStorage.setItem('quizmaster_theme', selectedTheme);
                
                themeDots.forEach(d => d.classList.remove('active'));
                dot.classList.add('active');

                if (this.sound) {
                    this.sound.playClick();
                }
            });
        });
    }

    setupEventListeners() {
        const regForm = document.getElementById('registration-form');
        if (regForm) {
            regForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registerUser();
            });
        }
        document.getElementById('register-btn').addEventListener('click', () => this.registerUser());
        document.getElementById('start-quiz-btn').addEventListener('click', () => this.startQuiz());
        
        // Quiz Controls
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('confirm-btn').addEventListener('click', () => this.confirmAnswer());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        
        // Results actions
        document.getElementById('retake-quiz-btn').addEventListener('click', () => this.retakeQuiz());
        document.getElementById('share-results-btn').addEventListener('click', () => this.shareResults());
        document.getElementById('change-settings-btn').addEventListener('click', () => this.changeSettings());

        document.getElementById('sound-toggle-btn').addEventListener('click', () => this.toggleSound());

        const toggleReviewBtn = document.getElementById('toggle-review-btn');
        if (toggleReviewBtn) {
            toggleReviewBtn.addEventListener('click', () => this.toggleReviewSection());
        }
    }

    // Interactive Dashboard Controls (Subject Tiles, Difficulty Pills, Count & Timer Chips)
    setupDashboardControls() {
        // 1. Subject Tiles
        const subjectTiles = document.querySelectorAll('.subject-tile');
        subjectTiles.forEach(tile => {
            tile.addEventListener('click', () => {
                this.sound.playClick();
                subjectTiles.forEach(t => t.classList.remove('active'));
                tile.classList.add('active');
                const subject = tile.getAttribute('data-subject');
                this.quizData.category = subject;
                const hiddenInput = document.getElementById('category');
                if (hiddenInput) hiddenInput.value = subject;
            });
        });

        // 2. Difficulty Pills
        const difficultyPills = document.querySelectorAll('.selector-pill');
        difficultyPills.forEach(pill => {
            pill.addEventListener('click', () => {
                this.sound.playClick();
                difficultyPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                const diff = pill.getAttribute('data-difficulty');
                this.quizData.difficulty = diff;
                const hiddenInput = document.getElementById('difficulty');
                if (hiddenInput) hiddenInput.value = diff;
            });
        });

        // 3. Question Count Chips
        const countChips = document.querySelectorAll('#count-pills-container .chip-pill');
        countChips.forEach(chip => {
            chip.addEventListener('click', () => {
                this.sound.playClick();
                countChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const count = parseInt(chip.getAttribute('data-count'));
                this.quizData.questionCount = count;
                const hiddenInput = document.getElementById('questionCount');
                if (hiddenInput) hiddenInput.value = count;
            });
        });

        // 4. Timer Chips
        const timerChips = document.querySelectorAll('#timer-pills-container .chip-pill');
        timerChips.forEach(chip => {
            chip.addEventListener('click', () => {
                this.sound.playClick();
                timerChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const duration = parseInt(chip.getAttribute('data-timer'));
                this.quizData.timerDuration = duration;
                const hiddenInput = document.getElementById('timerDuration');
                if (hiddenInput) hiddenInput.value = duration;
            });
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') {
                return;
            }

            const activePage = document.querySelector('.page.active');
            if (!activePage) return;

            if (e.key === 'm' || e.key === 'M') {
                this.toggleSound();
                return;
            }

            if (activePage.id === 'quiz-page') {
                // If answer not confirmed yet:
                if (!this.isAnswered) {
                    const answerBtns = document.querySelectorAll('.answer-btn');
                    let targetIdx = -1;
                    if (e.key >= '1' && e.key <= '4') targetIdx = parseInt(e.key) - 1;
                    else if (e.key.toLowerCase() === 'a') targetIdx = 0;
                    else if (e.key.toLowerCase() === 'b') targetIdx = 1;
                    else if (e.key.toLowerCase() === 'c') targetIdx = 2;
                    else if (e.key.toLowerCase() === 'd') targetIdx = 3;

                    if (targetIdx >= 0 && answerBtns[targetIdx]) {
                        answerBtns[targetIdx].click();
                    } else if (e.key === 'Enter') {
                        // Confirm if option is selected
                        const confirmBtn = document.getElementById('confirm-btn');
                        if (confirmBtn && !confirmBtn.disabled) {
                            e.preventDefault();
                            this.confirmAnswer();
                        }
                    } else if ((e.key === 's' || e.key === 'S') && !document.getElementById('skip-btn').disabled) {
                        this.skipQuestion();
                    }
                } else {
                    // If already confirmed: Enter moves to Next Question
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.nextQuestion();
                    }
                }
            }
        });
    }

    toggleSound() {
        const isMuted = this.sound.toggleMute();
        this.updateSoundIcon();
        this.showToast(isMuted ? 'Sound muted 🔇' : 'Sound unmuted 🔊');
    }

    updateSoundIcon() {
        const icon = document.getElementById('sound-icon');
        if (!icon) return;
        icon.className = this.sound.isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-message');
        const toastIcon = document.getElementById('toast-icon');
        if (!toast) return;

        toastMsg.textContent = message;
        toastIcon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-info-circle';
        
        toast.style.display = 'flex';
        toast.classList.add('visible');

        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => { toast.style.display = 'none'; }, 250);
        }, 2200);
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    registerUser() {
        this.sound.playClick();
        const name = document.getElementById('userName').value.trim();
        const age = parseInt(document.getElementById('userAge').value);
        const qualification = document.getElementById('userQualification').value;
        const favoriteSubject = document.getElementById('favoriteSubject').value;

        if (!name) {
            this.showToast('Please enter your full name! 😊', 'error');
            document.getElementById('userName').focus();
            return;
        }
        if (!age || age < 5 || age > 100) {
            this.showToast('Please enter a valid age (5-100)! 📅', 'error');
            document.getElementById('userAge').focus();
            return;
        }
        if (!qualification) {
            this.showToast('Please select your education tier! 📚', 'error');
            document.getElementById('userQualification').focus();
            return;
        }
        if (!favoriteSubject) {
            this.showToast('Please select your primary subject! ❤️', 'error');
            document.getElementById('favoriteSubject').focus();
            return;
        }

        this.userData = { name, age, qualification, favoriteSubject };

        // Update profile bar
        document.getElementById('user-name-display').textContent = name;
        document.getElementById('user-age-display').textContent = age;
        document.getElementById('user-level-display').textContent = this.getQualificationName(qualification);
        document.getElementById('user-subject-display').textContent = this.getSubjectName(favoriteSubject);

        this.syncDashboardToUserPreferences();
        this.showPage('settings-page');
    }

    syncDashboardToUserPreferences() {
        const prefSub = this.userData.favoriteSubject || 'general';
        this.quizData.category = prefSub;

        // Highlight matching tile
        const subjectTiles = document.querySelectorAll('.subject-tile');
        subjectTiles.forEach(tile => {
            if (tile.getAttribute('data-subject') === prefSub) {
                tile.classList.add('active');
            } else {
                tile.classList.remove('active');
            }
        });

        // Set difficulty based on qualification tier
        let defaultDiff = 'medium';
        if (this.userData.qualification === 'elementary') defaultDiff = 'easy';
        else if (this.userData.qualification === 'middle') defaultDiff = 'medium';
        else defaultDiff = 'hard';

        this.quizData.difficulty = defaultDiff;
        const difficultyPills = document.querySelectorAll('.selector-pill');
        difficultyPills.forEach(pill => {
            if (pill.getAttribute('data-difficulty') === defaultDiff) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });
    }

    getQualificationName(qual) {
        const names = {
            elementary: 'Elementary',
            middle: 'Middle School',
            high: 'High School',
            college: 'College / University',
            graduate: 'Graduate Degree',
            professional: 'Professional',
            teacher: 'Educator'
        };
        return names[qual] || qual;
    }

    getSubjectName(subject) {
        const names = {
            mathematics: 'Mathematics',
            science: 'Science',
            history: 'History',
            geography: 'Geography',
            technology: 'Technology',
            literature: 'Literature',
            art: 'Art & Culture',
            sports: 'Sports',
            general: 'General Knowledge'
        };
        return names[subject] || subject;
    }

    mapLevelToTier(qual) {
        if (qual === 'elementary') return 'elementary';
        if (qual === 'middle') return 'middle';
        if (qual === 'high') return 'high';
        return 'college';
    }

    async fetchLiveOpenTDBQuestions(category, difficulty, count) {
        const categoryMap = {
            general: 9,
            science: 17,
            technology: 18,
            mathematics: 19,
            sports: 21,
            geography: 22,
            history: 23,
            art: 25,
            literature: 10
        };

        const catId = categoryMap[category] || 9;
        const diff = difficulty || 'medium';
        const url = `https://opentdb.com/api.php?amount=${count}&category=${catId}&difficulty=${diff}&type=multiple`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) return [];
            const data = await response.json();

            if (data.response_code === 0 && data.results && data.results.length > 0) {
                return data.results.map((item, idx) => ({
                    id: `api_${category}_${Date.now()}_${idx}`,
                    question: decodeHTML(item.question),
                    correct_answer: decodeHTML(item.correct_answer),
                    incorrect_answers: item.incorrect_answers.map(decodeHTML),
                    explanation: `Correct Answer: "${decodeHTML(item.correct_answer)}". Verified under ${item.category} (${item.difficulty} level).`
                }));
            }
        } catch (e) {
            // Silently fallback to procedural and local banks
        }
        return [];
    }

    async assembleFreshQuestions() {
        const targetCount = this.quizData.questionCount;
        const subject = this.quizData.category;
        const diff = this.quizData.difficulty || 'medium';
        let selectedQuestions = [];

        // 1. For STEM subjects (Math, Tech, Science), generate authentic procedural questions matching difficulty
        if (subject === 'mathematics') {
            const procCount = Math.min(targetCount, 6);
            for (let i = 0; i < procCount; i++) {
                selectedQuestions.push(ProceduralQuestionGenerator.generateMathQuestion(diff));
            }
        } else if (subject === 'technology') {
            const procCount = Math.min(targetCount, 5);
            for (let i = 0; i < procCount; i++) {
                selectedQuestions.push(ProceduralQuestionGenerator.generateTechQuestion(diff));
            }
        } else if (subject === 'science') {
            const procCount = Math.min(targetCount, 5);
            for (let i = 0; i < procCount; i++) {
                selectedQuestions.push(ProceduralQuestionGenerator.generateScienceQuestion(diff));
            }
        }

        // 2. Draw from curated question bank matching the chosen difficulty
        if (selectedQuestions.length < targetCount) {
            const subjectBank = this.questionBanks[subject] || this.questionBanks.general;
            let candidatePool = [];

            if (subjectBank[diff]) candidatePool.push(...subjectBank[diff]);

            if (subject !== 'general' && candidatePool.length < targetCount) {
                const genBank = this.questionBanks.general;
                if (genBank[diff]) candidatePool.push(...genBank[diff]);
            }

            let unseen = candidatePool.filter(q => !this.seenQuestionIds.has(q.id));
            if (unseen.length === 0 && candidatePool.length > 0) {
                candidatePool.forEach(q => this.seenQuestionIds.delete(q.id));
                unseen = candidatePool;
            }

            const shuffledPool = shuffleArray(unseen);
            for (const q of shuffledPool) {
                if (selectedQuestions.length >= targetCount) break;
                if (!selectedQuestions.some(existing => existing.question === q.question)) {
                    selectedQuestions.push(q);
                }
            }
        }

        // 3. Fallback procedural generator at exact difficulty if still needed
        while (selectedQuestions.length < targetCount) {
            if (subject === 'technology') {
                selectedQuestions.push(ProceduralQuestionGenerator.generateTechQuestion(diff));
            } else if (subject === 'science') {
                selectedQuestions.push(ProceduralQuestionGenerator.generateScienceQuestion(diff));
            } else {
                selectedQuestions.push(ProceduralQuestionGenerator.generateMathQuestion(diff));
            }
        }

        selectedQuestions = shuffleArray(selectedQuestions);
        selectedQuestions.forEach(q => this.seenQuestionIds.add(q.id));
        this.saveSeenQuestionIds();

        return selectedQuestions.slice(0, targetCount);
    }

    async startQuiz() {
        this.sound.playClick();
        this.showPage('loading-page');
        this.updateLoadingMessage();
        
        this.questions = await this.assembleFreshQuestions();
        
        setTimeout(() => {
            this.initializeQuiz();
            this.showPage('quiz-page');
            this.displayCurrentQuestion();
            this.startTimer();
        }, 1100);
    }

    updateLoadingMessage() {
        if (this.loadingInterval) clearInterval(this.loadingInterval);

        const messages = [
            "Selecting new, unseen questions for your level...",
            "Crafting dynamic challenges with explanations...",
            "Verifying question uniqueness across sessions...",
            "Almost ready! Let's begin learning!"
        ];

        let index = 0;
        const messageElement = document.getElementById('loading-message');
        if (messageElement) messageElement.textContent = messages[0];
        
        this.loadingInterval = setInterval(() => {
            index++;
            if (index < messages.length && messageElement) {
                messageElement.textContent = messages[index];
            } else {
                clearInterval(this.loadingInterval);
                this.loadingInterval = null;
            }
        }, 320);
    }

    initializeQuiz() {
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.quizStartTime = Date.now();
        this.isAnswered = false;
        this.selectedAnswer = null;
        this.selectedButton = null;
        
        document.getElementById('total-questions').textContent = this.questions.length;
        document.getElementById('current-score').textContent = '0';
        this.updateProgressFill();
    }

    updateProgressFill() {
        const fill = document.getElementById('question-progress-fill');
        if (fill && this.questions.length > 0) {
            const pct = Math.round(((this.currentQuestionIndex + 1) / this.questions.length) * 100);
            fill.style.width = `${pct}%`;
        }
    }

    displayCurrentQuestion() {
        if (this.currentQuestionIndex >= this.questions.length) {
            this.finishQuiz();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('question-index-badge').textContent = `Q${this.currentQuestionIndex + 1}`;
        document.getElementById('question-text').textContent = question.question;
        this.updateProgressFill();
        
        // Update HUD difficulty badge
        const diffBadge = document.getElementById('quiz-diff-badge');
        if (diffBadge) {
            const diff = this.quizData.difficulty || 'medium';
            diffBadge.className = `hud-diff-pill pill-${diff}`;
            if (diff === 'hard') diffBadge.textContent = 'Hard 100%';
            else if (diff === 'medium') diffBadge.textContent = 'Medium 70%';
            else diffBadge.textContent = 'Easy 40%';
        }
        
        // Reset selection state
        this.selectedAnswer = null;
        this.selectedButton = null;
        this.isAnswered = false;
        this.questionStartTime = Date.now();
        
        // Shuffle answers uniformly
        const allAnswers = [question.correct_answer, ...question.incorrect_answers];
        const shuffledAnswers = shuffleArray(allAnswers);
        
        const answersContainer = document.getElementById('answers-container');
        answersContainer.innerHTML = '';
        
        const keyLabels = ['A', 'B', 'C', 'D'];

        shuffledAnswers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            
            const keycap = document.createElement('span');
            keycap.className = 'answer-keycap';
            keycap.textContent = keyLabels[index] || (index + 1);

            const textSpan = document.createElement('span');
            textSpan.className = 'answer-btn-text';
            textSpan.textContent = answer;

            const radio = document.createElement('span');
            radio.className = 'answer-radio';

            button.appendChild(keycap);
            button.appendChild(textSpan);
            button.appendChild(radio);
            
            // Clicking an option ONLY selects it (does not grade yet)
            button.addEventListener('click', () => this.selectOption(answer, button));
            answersContainer.appendChild(button);
        });

        // Hide explanation feedback & next button
        document.getElementById('feedback-container').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';
        
        // Show and disable "Confirm Answer" button until an option is picked
        const confirmBtn = document.getElementById('confirm-btn');
        confirmBtn.style.display = 'inline-flex';
        confirmBtn.disabled = true;

        // Reset and display Skip button
        const skipBtn = document.getElementById('skip-btn');
        skipBtn.style.display = 'inline-flex';
        skipBtn.disabled = true;

        this.skipTimeRemaining = Math.min(15, Math.max(5, Math.floor(this.quizData.timerDuration / 3)));
        document.getElementById('skip-text').textContent = `Skip (${this.skipTimeRemaining}s)`;
        
        this.startSkipTimer();
    }

    startSkipTimer() {
        if (this.skipTimer) clearInterval(this.skipTimer);
        
        this.skipTimer = setInterval(() => {
            this.skipTimeRemaining--;
            const skipText = document.getElementById('skip-text');
            const skipBtn = document.getElementById('skip-btn');
            
            if (skipText) {
                skipText.textContent = `Skip (${this.skipTimeRemaining}s)`;
            }
            
            if (this.skipTimeRemaining <= 0) {
                if (skipBtn) skipBtn.disabled = false;
                if (skipText) skipText.textContent = 'Skip Question';
                clearInterval(this.skipTimer);
                this.skipTimer = null;
            }
        }, 1000);
    }

    // ======================================================================
    // PHASE 1: SELECT OPTION (HIGHLIGHT ONLY, NOT GRADED YET)
    // ======================================================================
    selectOption(answer, buttonElement) {
        if (this.isAnswered) return; // Already confirmed
        
        this.sound.playClick();
        this.selectedAnswer = answer;
        this.selectedButton = buttonElement;

        // Remove .selected class from all options
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => btn.classList.remove('selected'));

        // Highlight the selected option
        buttonElement.classList.add('selected');

        // Enable the "Confirm Answer" button
        const confirmBtn = document.getElementById('confirm-btn');
        if (confirmBtn) {
            confirmBtn.disabled = false;
        }
    }

    // ======================================================================
    // PHASE 2: CONFIRM ANSWER (EVALUATES CORRECTNESS & SHOWS EXPLANATION)
    // ======================================================================
    confirmAnswer() {
        if (!this.selectedAnswer || this.isAnswered) return;

        this.isAnswered = true;
        this.clearAllTimers();

        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = this.selectedAnswer === question.correct_answer;
        const timeSpent = Math.max(1, Math.round((Date.now() - this.questionStartTime) / 1000));

        this.userAnswers.push({
            questionNumber: this.currentQuestionIndex + 1,
            question: question.question,
            selectedAnswer: this.selectedAnswer,
            correctAnswer: question.correct_answer,
            isCorrect,
            status: isCorrect ? 'correct' : 'incorrect',
            explanation: question.explanation || `The correct answer is "${question.correct_answer}".`,
            timeSpent
        });

        if (isCorrect) {
            this.score++;
            document.getElementById('current-score').textContent = this.score;
            this.sound.playCorrect();
        } else {
            this.sound.playIncorrect();
        }

        // Apply correct/incorrect visual feedback to buttons
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            btn.disabled = true;
            btn.classList.remove('selected');
            const text = btn.querySelector('.answer-btn-text') ? btn.querySelector('.answer-btn-text').textContent : btn.textContent;
            if (text === question.correct_answer) {
                btn.classList.add('correct');
            } else if (btn === this.selectedButton && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        // Reveal the educational explanation card immediately
        this.showExplanationFeedback(isCorrect, question);

        // Hide Confirm & Skip buttons, reveal Next Question button
        document.getElementById('confirm-btn').style.display = 'none';
        document.getElementById('skip-btn').style.display = 'none';
        document.getElementById('next-btn').style.display = 'inline-flex';

        // Auto-advance timer (gives user 4 seconds to view explanation or click Next immediately)
        this.questionTimeout = setTimeout(() => {
            if (this.isAnswered) this.nextQuestion();
        }, 4500);
    }

    showExplanationFeedback(isCorrect, question) {
        const feedbackContainer = document.getElementById('feedback-container');
        const feedbackIcon = document.getElementById('feedback-icon');
        const feedbackTitle = document.getElementById('feedback-title');
        const explanationText = document.getElementById('explanation-text');
        
        feedbackContainer.className = `explanation-card ${isCorrect ? 'status-correct' : 'status-incorrect'}`;
        
        if (isCorrect) {
            feedbackIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
            feedbackTitle.textContent = 'Correct Answer!';
        } else {
            feedbackIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
            feedbackTitle.textContent = `Incorrect! Correct Answer: "${question.correct_answer}"`;
        }
        
        explanationText.textContent = question.explanation || `The correct answer is "${question.correct_answer}".`;
        feedbackContainer.style.display = 'block';
    }

    skipQuestion() {
        if (this.isAnswered) return;
        
        this.isAnswered = true;
        this.clearAllTimers();
        this.sound.playIncorrect();
        
        const question = this.questions[this.currentQuestionIndex];
        const timeSpent = Math.max(1, Math.round((Date.now() - this.questionStartTime) / 1000));
        
        this.userAnswers.push({
            questionNumber: this.currentQuestionIndex + 1,
            question: question.question,
            selectedAnswer: 'Skipped',
            correctAnswer: question.correct_answer,
            isCorrect: false,
            status: 'skipped',
            explanation: question.explanation || `The correct answer is "${question.correct_answer}".`,
            timeSpent
        });
        
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            btn.disabled = true;
            btn.classList.remove('selected');
            const text = btn.querySelector('.answer-btn-text') ? btn.querySelector('.answer-btn-text').textContent : btn.textContent;
            if (text === question.correct_answer) {
                btn.classList.add('correct');
            }
        });
        
        this.showExplanationFeedback(false, question);

        document.getElementById('confirm-btn').style.display = 'none';
        document.getElementById('skip-btn').style.display = 'none';
        document.getElementById('next-btn').style.display = 'inline-flex';
        
        this.questionTimeout = setTimeout(() => {
            if (this.isAnswered) this.nextQuestion();
        }, 3500);
    }

    nextQuestion() {
        this.sound.playClick();
        this.clearAllTimers();
        this.currentQuestionIndex++;
        
        if (this.currentQuestionIndex < this.questions.length) {
            this.displayCurrentQuestion();
            this.startTimer();
        } else {
            this.finishQuiz();
        }
    }

    startTimer() {
        if (this.timer) clearInterval(this.timer);
        
        this.timeRemaining = this.quizData.timerDuration;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();

            if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
                this.sound.playTick();
            }
            
            if (this.timeRemaining <= 0) {
                this.handleTimeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timer');
        const timerValue = document.getElementById('timer-value');
        if (timerValue) timerValue.textContent = this.timeRemaining;
        
        if (timerElement) {
            timerElement.className = 'tactile-timer-badge';
            if (this.timeRemaining <= 10) {
                timerElement.classList.add('danger');
            } else if (this.timeRemaining <= 20) {
                timerElement.classList.add('warning');
            }
        }
    }

    handleTimeUp() {
        if (this.isAnswered) return;
        this.clearAllTimers();
        this.showToast('⏰ Time’s up!', 'info');
        this.skipQuestion();
    }

    clearAllTimers() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.skipTimer) {
            clearInterval(this.skipTimer);
            this.skipTimer = null;
        }
        if (this.questionTimeout) {
            clearTimeout(this.questionTimeout);
            this.questionTimeout = null;
        }
        if (this.loadingInterval) {
            clearInterval(this.loadingInterval);
            this.loadingInterval = null;
        }
    }

    finishQuiz() {
        this.clearAllTimers();
        this.totalQuizTime = Math.max(1, Math.round((Date.now() - this.quizStartTime) / 1000));
        this.calculateResults();
        this.populateReviewSection();
        this.showPage('results-page');
        this.sound.playVictory();
    }

    calculateResults() {
        const total = this.questions.length;
        const percentage = total > 0 ? Math.round((this.score / total) * 100) : 0;
        const avgTime = total > 0 ? (this.totalQuizTime / total).toFixed(1) : 0;
        
        document.getElementById('final-score').textContent = percentage;
        document.getElementById('correct-answers').textContent = this.score;
        document.getElementById('total-questions-result').textContent = total;
        document.getElementById('time-taken').textContent = this.totalQuizTime;
        
        const avgTimeEl = document.getElementById('avg-time');
        if (avgTimeEl) avgTimeEl.textContent = avgTime;

        let performanceMessage = '';
        let achievementIcon = '🏆';
        let accuracyBadge = 'Mastery';
        
        if (percentage >= 90) {
            performanceMessage = `Outstanding mastery, ${this.userData.name}! Excellent score!`;
            achievementIcon = '🏆';
            accuracyBadge = 'Exceptional';
        } else if (percentage >= 75) {
            performanceMessage = `Great work, ${this.userData.name}! You showed solid comprehension!`;
            achievementIcon = '🥇';
            accuracyBadge = 'Advanced';
        } else if (percentage >= 60) {
            performanceMessage = `Good progress, ${this.userData.name}! Review the explanations below to improve further.`;
            achievementIcon = '🥈';
            accuracyBadge = 'Proficient';
        } else {
            performanceMessage = `Keep learning, ${this.userData.name}! Review the explanations below to master these concepts!`;
            achievementIcon = '🥉';
            accuracyBadge = 'Developing';
        }
        
        const accuracyEl = document.getElementById('accuracy-label');
        if (accuracyEl) accuracyEl.textContent = accuracyBadge;

        const cleanSub = this.getSubjectName(this.userData.favoriteSubject);
        const personalMessage = `Dedicated learner in ${cleanSub} at ${this.getQualificationName(this.userData.qualification)} tier. Systematic practice builds lasting mastery! 🚀`;
        
        document.getElementById('achievement-icon').textContent = achievementIcon;
        document.getElementById('results-title').textContent = `${this.userData.name}'s Performance Dashboard`;
        document.getElementById('performance-message').textContent = performanceMessage;
        document.getElementById('personal-message').textContent = personalMessage;

        const resultsDiffBadge = document.getElementById('results-difficulty-badge');
        if (resultsDiffBadge) {
            const diff = this.quizData.difficulty || 'medium';
            resultsDiffBadge.className = `hud-diff-pill pill-${diff}`;
            if (diff === 'hard') resultsDiffBadge.textContent = 'Hard (100% Difficulty Tier)';
            else if (diff === 'medium') resultsDiffBadge.textContent = 'Medium (70% Difficulty Tier)';
            else resultsDiffBadge.textContent = 'Easy (40% Difficulty Tier)';
        }
    }

    populateReviewSection() {
        const reviewContainer = document.getElementById('review-container');
        if (!reviewContainer) return;

        reviewContainer.innerHTML = '';
        
        this.userAnswers.forEach((ans, idx) => {
            const card = document.createElement('div');
            card.className = `review-item-card is-${ans.status}`;

            const isCorrect = ans.isCorrect;
            const isSkipped = ans.status === 'skipped';

            card.innerHTML = `
                <div class="review-card-top">
                    <div class="review-q-title">Q${idx + 1}. ${ans.question}</div>
                    <span class="review-badge badge-${ans.status}">
                        ${isCorrect ? '<i class="fas fa-check"></i> Correct' : (isSkipped ? '<i class="fas fa-forward"></i> Skipped' : '<i class="fas fa-times"></i> Incorrect')}
                    </span>
                </div>
                <div class="review-answers-comparison">
                    <div class="ans-line">
                        <span class="ans-tag">Your Answer:</span>
                        <span class="ans-text-user ${isCorrect ? 'right' : 'wrong'}">${ans.selectedAnswer}</span>
                    </div>
                    ${!isCorrect ? `
                    <div class="ans-line">
                        <span class="ans-tag">Correct Answer:</span>
                        <span class="ans-text-correct">${ans.correctAnswer}</span>
                    </div>` : ''}
                </div>
                <div class="review-explanation-box">
                    <strong><i class="fas fa-lightbulb color-amber"></i> Educational Concept:</strong>
                    ${ans.explanation}
                </div>
            `;

            reviewContainer.appendChild(card);
        });
    }

    toggleReviewSection() {
        this.sound.playClick();
        const reviewContainer = document.getElementById('review-container');
        const arrow = document.getElementById('review-arrow-icon');
        const text = document.getElementById('toggle-review-text');
        
        if (!reviewContainer) return;

        if (reviewContainer.style.display === 'none' || !reviewContainer.style.display) {
            reviewContainer.style.display = 'flex';
            if (arrow) arrow.className = 'fas fa-chevron-up';
            if (text) text.textContent = 'Hide Questions & Explanations';
        } else {
            reviewContainer.style.display = 'none';
            if (arrow) arrow.className = 'fas fa-chevron-down';
            if (text) text.textContent = 'Review Questions & Detailed Explanations';
        }
    }

    retakeQuiz() {
        this.sound.playClick();
        this.clearAllTimers();
        this.resetQuiz();
        this.startQuiz();
    }

    resetQuiz() {
        this.clearAllTimers();
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.isAnswered = false;
        this.selectedAnswer = null;
        this.selectedButton = null;
        
        const reviewContainer = document.getElementById('review-container');
        if (reviewContainer) reviewContainer.style.display = 'none';
        const arrow = document.getElementById('review-arrow-icon');
        if (arrow) arrow.className = 'fas fa-chevron-down';
        const text = document.getElementById('toggle-review-text');
        if (text) text.textContent = 'Review Questions & Detailed Explanations';
    }

    changeSettings() {
        this.sound.playClick();
        this.clearAllTimers();
        this.resetQuiz();
        this.showPage('settings-page');
    }

    shareResults() {
        this.sound.playClick();
        const percentage = Math.round((this.score / this.questions.length) * 100);
        const subject = this.getSubjectName(this.userData.favoriteSubject);
        const shareText = `🎯 ${this.userData.name} scored ${percentage}% on QuizMaster!\n📚 Subject: ${subject}\n🏆 Score: ${this.score}/${this.questions.length} in ${this.totalQuizTime}s\n\nTest your knowledge at QuizMaster! 🚀`;
        
        if (navigator.share) {
            navigator.share({
                title: 'QuizMaster Results - ' + this.userData.name,
                text: shareText,
                url: window.location.href
            }).catch(() => {
                this.copyShareFallback(shareText);
            });
        } else {
            this.copyShareFallback(shareText);
        }
    }

    copyShareFallback(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('📋 Results copied to clipboard!');
            }).catch(() => {
                this.showToast('Results ready to share!');
                alert(text);
            });
        } else {
            this.showToast('Results ready to share!');
            alert(text);
        }
    }

    initQuestionBanks() {
        return {
        mathematics: {
            hard: [
                {
                    id: 'm_h_1',
                    question: 'What is the Rank-Nullity Theorem for a linear transformation T: V ➔ W where V is finite-dimensional?',
                    correct_answer: 'dim(V) = rank(T) + nullity(T)',
                    incorrect_answers: [
                        'dim(W) = rank(T) - nullity(T)',
                        'dim(V) = rank(T) × nullity(T)',
                        'rank(T) = dim(V) + dim(W)'
                    ],
                    explanation: 'The fundamental Rank-Nullity Theorem states that for any linear map T on finite-dimensional V, the dimension of the domain V equals the dimension of the image (rank) plus the dimension of the kernel (nullity).'
                },
                {
                    id: 'm_h_2',
                    question: 'According to Clairaut\'s Theorem on equality of mixed partial derivatives, under what condition does f_xy = f_yx hold?',
                    correct_answer: 'The second-order mixed partial derivatives f_xy and f_yx are continuous',
                    incorrect_answers: [
                        'f(x, y) must be a polynomial function',
                        'The determinant of the Hessian matrix must be strictly positive',
                        'f(x, y) must be harmonic (satisfy Laplace\'s equation)'
                    ],
                    explanation: 'Clairaut\'s theorem (or Schwarz\'s theorem) states that if the mixed second partial derivatives f_xy and f_yx exist and are continuous on an open disc around a point, they are identical.'
                },
                {
                    id: 'm_h_3',
                    question: 'What is the Maclaurin series expansion for cos(x)?',
                    correct_answer: '∑ (-1)ⁿ · x^(2n) / (2n)! from n = 0 to ∞',
                    incorrect_answers: [
                        '∑ (-1)ⁿ · x^(2n+1) / (2n+1)! from n = 0 to ∞',
                        '∑ x^(2n) / (2n)! from n = 0 to ∞',
                        '∑ (-1)ⁿ · xⁿ / n! from n = 0 to ∞'
                    ],
                    explanation: 'Because cos(x) is an even function with derivative cycle {cos, -sin, -cos, sin}, all odd derivatives at 0 are zero and even terms alternate sign: 1 - x²/2! + x⁴/4! - x⁶/6! + ... = ∑ (-1)ⁿ · x^(2n) / (2n)!.'
                },
                {
                    id: 'm_h_4',
                    question: 'In complex analysis, what necessary condition must a complex function f(z) = u(x,y) + i·v(x,y) satisfy to be holomorphic?',
                    correct_answer: 'The Cauchy-Riemann equations: ∂u/∂x = ∂v/∂y and ∂u/∂y = -∂v/∂x',
                    incorrect_answers: [
                        '∂u/∂x = -∂v/∂y and ∂u/∂y = ∂v/∂x',
                        '∂²u/∂x² + ∂²v/∂y² = 0 strictly',
                        'u(x, y) = v(x, y) everywhere on the domain'
                    ],
                    explanation: 'The Cauchy-Riemann equations ∂u/∂x = ∂v/∂y and ∂u/∂y = -∂v/∂x are fundamental necessary conditions for complex differentiability (analyticity) of f(z) = u + iv.'
                }
            ],
            medium: [
                {
                    id: 'm_m_1',
                    question: 'What is the sum to infinity of the geometric series S = 6 + 3 + 1.5 + 0.75 + ...?',
                    correct_answer: '12',
                    incorrect_answers: ['10', '14', '9'],
                    explanation: 'First term a = 6 and common ratio r = 1/2. Because |r| < 1, the sum to infinity S_∞ = a / (1 - r) = 6 / (1 - 0.5) = 6 / 0.5 = 12.'
                },
                {
                    id: 'm_m_2',
                    question: 'By the Change of Base Formula, how is log_b(a) expressed in terms of natural logarithms?',
                    correct_answer: 'ln(a) / ln(b)',
                    incorrect_answers: ['ln(b) / ln(a)', 'ln(a - b)', 'ln(a) · ln(b)'],
                    explanation: 'The change of base theorem states log_b(a) = log_k(a) / log_k(b). Using natural log base e, log_b(a) = ln(a) / ln(b).'
                },
                {
                    id: 'm_m_3',
                    question: 'If matrix A = [[3, 2], [1, 4]], what is the determinant det(A)?',
                    correct_answer: '10',
                    incorrect_answers: ['14', '8', '12'],
                    explanation: 'For a 2×2 matrix [[a, b], [c, d]], det(A) = ad - bc = (3 × 4) - (2 × 1) = 12 - 2 = 10.'
                },
                {
                    id: 'm_m_4',
                    question: 'What is the exact value of sin(75°) using the angle sum formula sin(45° + 30°)?',
                    correct_answer: '(√6 + √2) / 4',
                    incorrect_answers: ['(√6 - √2) / 4', '(√3 + 1) / 2', '(√2 + 1) / 4'],
                    explanation: 'sin(45° + 30°) = sin(45°)cos(30°) + cos(45°)sin(30°) = (√2/2)(√3/2) + (√2/2)(1/2) = (√6 + √2) / 4.'
                }
            ],
            easy: [
                {
                    id: 'm_e_1',
                    question: 'What does a discriminant Δ = b² - 4ac < 0 indicate about the roots of ax² + bx + c = 0?',
                    correct_answer: 'Two distinct complex (non-real) conjugate roots',
                    incorrect_answers: [
                        'Two identical real roots',
                        'Two distinct rational roots',
                        'One real root and one zero root'
                    ],
                    explanation: 'When Δ < 0, the term √(b² - 4ac) yields an imaginary quantity i·√|Δ|, producing two complex conjugate solutions.'
                },
                {
                    id: 'm_e_2',
                    question: 'Two non-vertical lines in a coordinate plane are perpendicular if and only if:',
                    correct_answer: 'The product of their slopes is -1 (m₁ · m₂ = -1)',
                    incorrect_answers: [
                        'Their slopes are equal (m₁ = m₂)',
                        'The sum of their slopes is zero (m₁ + m₂ = 0)',
                        'Their y-intercepts are reciprocal'
                    ],
                    explanation: 'Perpendicular lines have negative reciprocal slopes (m₂ = -1/m₁), meaning m₁ · m₂ = -1.'
                },
                {
                    id: 'm_e_3',
                    question: 'What is the volume formula for a right circular cone with radius r and height h?',
                    correct_answer: 'V = (1/3)πr²h',
                    incorrect_answers: ['V = πr²h', 'V = (4/3)πr³', 'V = 2πrh'],
                    explanation: 'A cone occupies exactly one-third the volume of a cylinder with identical base radius and height: V = (1/3)πr²h.'
                }
            ]
        },

        technology: {
            hard: [
                {
                    id: 't_h_1',
                    question: 'What is the crucial structural distinction between a B-Tree and a B+ Tree index in modern storage engines?',
                    correct_answer: 'B+ Trees store actual data pointers exclusively in leaf nodes and link leaf nodes sequentially',
                    incorrect_answers: [
                        'B-Trees permit duplicate keys in root nodes whereas B+ Trees forbid them',
                        'B+ Trees only balance upon deletion while B-Trees balance on insertion',
                        'B+ Trees require all keys to be hashed using MD5 or SHA-1'
                    ],
                    explanation: 'In a B+ tree, internal nodes store only routing keys while leaf nodes store all data pointers and are chained via a linked list, enabling extremely fast range scans and higher internal node branching factors.'
                },
                {
                    id: 't_h_2',
                    question: 'In the MESI CPU cache coherence protocol, what does the "Exclusive" (E) state designate?',
                    correct_answer: 'The cache line is present only in the current cache and is clean (matches main memory)',
                    incorrect_answers: [
                        'The cache line is present only in the current cache and has been modified',
                        'The cache line is shared among multiple cores and is read-only',
                        'The cache line has been invalidated by a snoop request'
                    ],
                    explanation: 'MESI stands for Modified, Exclusive, Shared, and Invalid. Exclusive means the cache line resides only in this core’s cache and is identical to main memory (not yet modified).'
                },
                {
                    id: 't_h_3',
                    question: 'Which SQL ANSI isolation level is the minimum required to prevent "Non-Repeatable Reads"?',
                    correct_answer: 'Repeatable Read',
                    incorrect_answers: ['Read Committed', 'Read Uncommitted', 'Serializable'],
                    explanation: 'Read Committed prevents dirty reads. Repeatable Read locks the read rows to ensure that reading the same row twice within a transaction yields identical data, preventing non-repeatable reads.'
                },
                {
                    id: 't_h_4',
                    question: 'In RSA public-key cryptography, how are the public exponent e and private exponent d mathematically related?',
                    correct_answer: 'e · d ≡ 1 (mod φ(n)), where φ(n) = (p - 1)(q - 1)',
                    incorrect_answers: [
                        'e + d = p · q',
                        'e · d = n²',
                        'd ≡ e² (mod n)'
                    ],
                    explanation: 'By Euler\'s totient theorem, the private key d is the modular multiplicative inverse of e modulo φ(n): e · d ≡ 1 (mod (p - 1)(q - 1)).'
                }
            ],
            medium: [
                {
                    id: 't_m_1',
                    question: 'What distinguishes a LEFT OUTER JOIN from an INNER JOIN in relational SQL?',
                    correct_answer: 'LEFT OUTER JOIN preserves all rows from the left table even if no match exists in the right table',
                    incorrect_answers: [
                        'INNER JOIN returns all rows from both tables and fills nulls',
                        'LEFT OUTER JOIN discards unmatched rows from both tables',
                        'INNER JOIN only operates on numeric primary keys'
                    ],
                    explanation: 'LEFT JOIN returns all records from the left table and matched records from the right; columns from the right table contain NULL when there is no match.'
                },
                {
                    id: 't_m_2',
                    question: 'What is the standard header size of a minimum IPv4 packet without optional headers?',
                    correct_answer: '20 bytes',
                    incorrect_answers: ['40 bytes', '8 bytes', '32 bytes'],
                    explanation: 'A baseline IPv4 header contains 5 32-bit words (IHL = 5), which equals 5 × 4 = 20 bytes (compared to IPv6 fixed 40 bytes).'
                },
                {
                    id: 't_m_3',
                    question: 'In Object-Oriented Design, what does the Liskov Substitution Principle (LSP) dictate?',
                    correct_answer: 'Subtypes must be substitutable for their base types without altering program correctness',
                    incorrect_answers: [
                        'Classes should have only one reason to change',
                        'Software entities should be open for modification and closed for extension',
                        'High-level modules should depend directly on low-level concrete classes'
                    ],
                    explanation: 'LSP (the \'L\' in SOLID) asserts that objects of a superclass should be replaceable with objects of its subclasses without breaking application semantics.'
                }
            ],
            easy: [
                {
                    id: 't_e_1',
                    question: 'Which layer of the OSI model is responsible for logical IP routing and packet forwarding?',
                    correct_answer: 'Layer 3 (Network Layer)',
                    incorrect_answers: ['Layer 2 (Data Link Layer)', 'Layer 4 (Transport Layer)', 'Layer 7 (Application Layer)'],
                    explanation: 'The Network Layer (Layer 3) handles end-to-end packet addressing (IP), routing, and subnet management across interconnected networks.'
                },
                {
                    id: 't_e_2',
                    question: 'What is the primary difference between Git Merge and Git Rebase?',
                    correct_answer: 'Rebase rewrites commit history onto a new base commit, while merge creates a dedicated merge commit',
                    incorrect_answers: [
                        'Merge deletes earlier commits while rebase creates branches',
                        'Rebase can only be executed on the remote repository server',
                        'Merge compresses all commits into a single zip file'
                    ],
                    explanation: 'Rebase linearizes project history by reapplying commits one by one on top of the target branch tip, whereas merge joins history with a merge commit.'
                },
                {
                    id: 't_e_3',
                    question: 'How many total binary bits constitute a standard IPv6 address?',
                    correct_answer: '128 bits',
                    incorrect_answers: ['32 bits', '64 bits', '256 bits'],
                    explanation: 'IPv4 addresses use 32 bits (4 bytes), while IPv6 expands the address space to 128 bits (16 bytes, written as 8 groups of 4 hex digits).'
                }
            ]
        },

        science: {
            hard: [
                {
                    id: 's_h_1',
                    question: 'What does the Heisenberg Uncertainty Principle state regarding position (x) and linear momentum (p)?',
                    correct_answer: 'Δx · Δp ≥ ℏ / 2',
                    incorrect_answers: [
                        'Δx · Δp = 0',
                        'Δx / Δp ≥ h',
                        'Δx · Δp ≤ ℏ / 4'
                    ],
                    explanation: 'Derived from non-commuting operators in quantum mechanics ([x, p] = iℏ), the product of standard deviations of position and momentum is bounded below by ℏ/2 (where ℏ = h / 2π).'
                },
                {
                    id: 's_h_2',
                    question: 'What is the rate-limiting, allosterically regulated control enzyme of the Citric Acid (Krebs) Cycle?',
                    correct_answer: 'Isocitrate Dehydrogenase',
                    incorrect_answers: [
                        'Citrate Synthase',
                        'Fumarase',
                        'Malate Dehydrogenase'
                    ],
                    explanation: 'Isocitrate dehydrogenase catalyzes the oxidative decarboxylation of isocitrate to α-ketoglutarate, serving as the major rate-determining regulated step (inhibited by ATP and NADH, activated by ADP).'
                },
                {
                    id: 's_h_3',
                    question: 'In special relativity, what is the full relativistic energy-momentum invariant relation for a particle with rest mass m₀ and momentum p?',
                    correct_answer: 'E² = (p·c)² + (m₀·c²)²',
                    incorrect_answers: [
                        'E = p·c + m₀·c²',
                        'E² = (p·c)² - (m₀·c²)²',
                        'E = (1/2)m₀·v² + p·c'
                    ],
                    explanation: 'The relativistic dispersion relation is E² = (pc)² + (m₀c²)². For a massless photon (m₀ = 0), this simplifies to E = pc; for a particle at rest (p = 0), it becomes Einstein’s E = m₀c².'
                },
                {
                    id: 's_h_4',
                    question: 'During eukaryotic DNA replication, which enzyme synthesizes phosphodiester bonds to seal Okazaki fragments on the lagging strand?',
                    correct_answer: 'DNA Ligase',
                    incorrect_answers: [
                        'DNA Topoisomerase (Gyrase)',
                        'DNA Helicase',
                        'Single-Stranded Binding Protein (SSB)'
                    ],
                    explanation: 'DNA Ligase catalyzes the formation of covalent phosphodiester bonds between adjacent 3\'-hydroxyl and 5\'-phosphate ends of Okazaki fragments after RNA primers are excised.'
                }
            ],
            medium: [
                {
                    id: 's_m_1',
                    question: 'What does Le Chatelier\'s Principle predict will happen to the exothermic equilibrium N₂(g) + 3H₂(g) ⇌ 2NH₃(g) + Heat if temperature is increased?',
                    correct_answer: 'The equilibrium shifts to the left (towards reactants N₂ and H₂)',
                    incorrect_answers: [
                        'The equilibrium shifts to the right (producing more NH₃)',
                        'The equilibrium position and equilibrium constant K remain unchanged',
                        'The total gas pressure drops to zero'
                    ],
                    explanation: 'Because heat is a product of exothermic reactions, increasing temperature adds thermal energy to the system. The system shifts in the endothermic reverse direction (left) to absorb heat.'
                },
                {
                    id: 's_m_2',
                    question: 'According to Bernoulli’s Principle for incompressible non-viscous fluid flow, an increase in fluid velocity results in:',
                    correct_answer: 'A simultaneous decrease in static fluid pressure or potential energy',
                    incorrect_answers: [
                        'A proportional increase in static fluid pressure',
                        'An increase in fluid viscosity',
                        'A decrease in fluid temperature to absolute zero'
                    ],
                    explanation: 'Bernoulli’s equation (P + (1/2)ρv² + ρgh = constant) dictates that along a streamline, an increase in dynamic pressure ((1/2)ρv²) causes a compensating decrease in static pressure P.'
                },
                {
                    id: 's_m_3',
                    question: 'In genetics, during which specific subphase of Meiosis I does crossing over (homologous genetic recombination) occur?',
                    correct_answer: 'Prophase I (Pachytene stage)',
                    incorrect_answers: [
                        'Metaphase II',
                        'Anaphase I',
                        'Telophase I'
                    ],
                    explanation: 'During Prophase I of meiosis (specifically the pachytene stage of synapsis), non-sister chromatids of homologous chromosomes exchange genetic material through chiasmata.'
                }
            ],
            easy: [
                {
                    id: 's_e_1',
                    question: 'What does Newton\'s Third Law of Motion assert?',
                    correct_answer: 'For every action, there is an equal and opposite reaction acting on different bodies',
                    incorrect_answers: [
                        'Force equals mass multiplied by acceleration',
                        'An object in motion remains in motion unless acted on by net external force',
                        'Total momentum of an open system always increases over time'
                    ],
                    explanation: 'Newton\'s Third Law states that when body A exerts a force on body B, body B simultaneously exerts an equal magnitude force in the opposite direction on body A.'
                },
                {
                    id: 's_e_2',
                    question: 'Why does a solution of pH 3 have a hydrogen ion concentration [H⁺] 100 times greater than a solution of pH 5?',
                    correct_answer: 'The pH scale is logarithmic (pH = -log₁₀[H⁺]), so each integer step is a 10-fold change',
                    incorrect_answers: [
                        'pH values change exponentially by factors of 2',
                        'pH is defined as the square root of ion concentration',
                        'Pure water ionizes in ratios of 50 to 1'
                    ],
                    explanation: 'Because pH = -log₁₀[H⁺], a decrease of 2 pH units corresponds to [H⁺] increasing by 10² = 100-fold.'
                },
                {
                    id: 's_e_3',
                    question: 'Which fundamental structural feature distinguishes eukaryotic cells from prokaryotic cells?',
                    correct_answer: 'Eukaryotes have a membrane-bound nucleus and membrane-bound organelles',
                    incorrect_answers: [
                        'Prokaryotes contain mitochondria and chloroplasts',
                        'Only prokaryotes contain DNA and ribosomes',
                        'Eukaryotes lack a phospholipid cell membrane'
                    ],
                    explanation: 'Eukaryotic cells package genetic material inside a true membrane-bound nucleus and contain compartmentalized organelles (mitochondria, ER, Golgi), which prokaryotes lack.'
                }
            ]
        },

        history: {
            hard: [
                {
                    id: 'h_h_1',
                    question: 'Which 1494 treaty negotiated by the Papacy divided newly discovered lands outside Europe between Spain and Portugal along a meridian 370 leagues west of the Cape Verde islands?',
                    correct_answer: 'Treaty of Tordesillas',
                    incorrect_answers: [
                        'Treaty of Utrecht',
                        'Treaty of Zaragoza',
                        'Treaty of Westphalia'
                    ],
                    explanation: 'The Treaty of Tordesillas (1494) established a meridian that awarded newly discovered lands east of the line to Portugal (enabling its claim to Brazil) and west of the line to Castile (Spain).'
                },
                {
                    id: 'h_h_2',
                    question: 'What 1916 secret diplomatic agreement between the United Kingdom and France partitioned the lands of the collapsing Ottoman Empire into spheres of influence?',
                    correct_answer: 'Sykes-Picot Agreement',
                    incorrect_answers: [
                        'Balfour Declaration',
                        'Treaty of Sèvres',
                        'McMahon–Hussein Correspondence'
                    ],
                    explanation: 'Negotiated by Mark Sykes and François Georges-Picot with Russian assent, the Sykes-Picot Agreement partitioned Ottoman Arab provinces into British and French zones of direct control or influence.'
                },
                {
                    id: 'h_h_3',
                    question: 'In 293 AD, Roman Emperor Diocletian instituted which governmental system dividing imperial governance among two Augusti and two Caesars?',
                    correct_answer: 'The Tetrarchy ("Rule of Four")',
                    incorrect_answers: [
                        'The Triumvirate',
                        'The Principate',
                        'The Dominatus Triad'
                    ],
                    explanation: 'Diocletian created the Tetrarchy to stabilize the Roman Empire, appointing two senior emperors (Augusti) and two junior co-emperors (Caesars) ruling designated geographic quadrants.'
                }
            ],
            medium: [
                {
                    id: 'h_m_1',
                    question: 'The Peace of Westphalia (1648) concluding the Thirty Years\' War is historically celebrated for establishing which core tenet of international relations?',
                    correct_answer: 'The principle of Westphalian national sovereignty (non-interference in domestic affairs)',
                    incorrect_answers: [
                        'The unification of the Holy Roman Empire under a single parliament',
                        'The universal outlawing of religious protestantism across Europe',
                        'The formal creation of the League of Nations'
                    ],
                    explanation: 'Westphalia established that sovereign states possess exclusive jurisdiction over their domestic lands and religion, forming the cornerstone of modern international statehood.'
                },
                {
                    id: 'h_m_2',
                    question: 'The Meiji Restoration of 1868 transformed Japan politically by which major shift?',
                    correct_answer: 'Overthrowing the Tokugawa Shogunate and restoring practical imperial governance and rapid industrialization',
                    incorrect_answers: [
                        'Adopting isolationist Sakoku border closure policies',
                        'Ceding Taiwan and Korea to the Qing Dynasty',
                        'Abolishing the Japanese Navy in favor of feudal samurai militias'
                    ],
                    explanation: 'The Meiji Restoration dismantled the 260-year Tokugawa military shogunate, centralizing authority under Emperor Meiji and embarking on sweeping industrialization, modernization, and legal reform.'
                },
                {
                    id: 'h_m_3',
                    question: 'Which 1884–1885 European diplomatic conference formalized the "Scramble for Africa" by establishing the Principle of Effective Occupation?',
                    correct_answer: 'Berlin Conference',
                    incorrect_answers: ['Congress of Vienna', 'Conference of Paris', 'Treaty of Versailles'],
                    explanation: 'Organized by Otto von Bismarck, the Berlin Conference laid out guidelines for European colonial expansion in Africa without consulting any African rulers.'
                }
            ],
            easy: [
                {
                    id: 'h_e_1',
                    question: 'What iconic English charter granted by King John at Runnymede in 1215 established that the monarch was not above the law?',
                    correct_answer: 'Magna Carta (The Great Charter)',
                    incorrect_answers: ['The English Bill of Rights', 'The Petition of Right', 'Habeas Corpus Act'],
                    explanation: 'Magna Carta constrained royal arbitrary authority, protected feudal liberties, and guaranteed that free men could not be imprisoned without lawful judgement of their peers.'
                },
                {
                    id: 'h_e_2',
                    question: 'In what year did the French Revolution break out with the convocation of the Estates-General and the storming of the Bastille?',
                    correct_answer: '1789',
                    incorrect_answers: ['1776', '1804', '1815'],
                    explanation: 'The French Revolution erupted in 1789, overthrowing the Ancien Régime and proclaiming the Declaration of the Rights of Man and of the Citizen.'
                },
                {
                    id: 'h_e_3',
                    question: 'Which international organization was founded in 1945 in San Francisco to maintain international peace following World War II?',
                    correct_answer: 'The United Nations (UN)',
                    incorrect_answers: ['The League of Nations', 'NATO', 'The Warsaw Pact'],
                    explanation: 'The United Nations was chartered in 1945 by 50 founding nations to succeed the ineffective League of Nations and prevent future global warfare.'
                }
            ]
        },

        geography: {
            hard: [
                {
                    id: 'g_h_1',
                    question: 'In the Köppen climate classification system, what specific climatic condition does the classification "Csa" represent?',
                    correct_answer: 'Mediterranean climate with hot, dry summers and mild, wet winters',
                    incorrect_answers: [
                        'Humid subtropical climate with year-round rainfall and tropical typhoons',
                        'Subarctic boreal climate with severe sub-zero winter temperatures',
                        'Semi-arid cold steppe climate characterized by high wind erosion'
                    ],
                    explanation: 'In Köppen classification, \'C\' denotes temperate/mesothermal climates, \'s\' denotes dry summer seasons, and \'a\' denotes hot summer temperatures (warmest month average above 22°C).'
                },
                {
                    id: 'g_h_2',
                    question: 'What is the Wallace Line in biogeography?',
                    correct_answer: 'A faunal boundary line drawn in 1859 separating the ecozones of Asia and Australasia',
                    incorrect_answers: [
                        'A seismic boundary line marking the deepest section of the San Andreas fault',
                        'An oceanographic contour line marking 4,000-meter abyssal plains',
                        'A meteorological jet stream demarcation line in the Southern Hemisphere'
                    ],
                    explanation: 'Discovered by Alfred Russel Wallace, the Wallace Line runs between Borneo and Sulawesi (and Bali/Lombok), marking the deep-water trench dividing Asian placenta mammals from Australasian marsupials.'
                },
                {
                    id: 'g_h_3',
                    question: 'Kaliningrad Oblast, located between Poland and Lithuania on the Baltic Sea, is an administrative exclave of which nation?',
                    correct_answer: 'Russian Federation',
                    incorrect_answers: ['Germany', 'Belarus', 'Latvia'],
                    explanation: 'Formerly Königsberg in East Prussia, Kaliningrad became Soviet territory following WWII and remains a non-contiguous exclave of the Russian Federation.'
                }
            ],
            medium: [
                {
                    id: 'g_m_1',
                    question: 'Due to the Coriolis Effect, moving air currents and oceanic gyres are deflected in which direction in the Northern Hemisphere?',
                    correct_answer: 'To the right of their direction of motion',
                    incorrect_answers: [
                        'To the left of their direction of motion',
                        'Directly towards the geographic South Pole',
                        'Vertically upwards towards the stratosphere'
                    ],
                    explanation: 'Because Earth rotates eastward under moving air masses, the conservation of angular momentum causes objects in the Northern Hemisphere to deflect to their right, and to the left in the Southern Hemisphere.'
                },
                {
                    id: 'g_m_2',
                    question: 'Which narrow strait between the Malay Peninsula and the Indonesian island of Sumatra serves as one of the world\'s most vital maritime shipping bottlenecks?',
                    correct_answer: 'Strait of Malacca',
                    incorrect_answers: ['Strait of Hormuz', 'Bab-el-Mandeb', 'Sunda Strait'],
                    explanation: 'The Strait of Malacca connects the Indian Ocean to the South China Sea and carries approximately 25% of all global seaborne traded goods and oil shipments.'
                },
                {
                    id: 'g_m_3',
                    question: 'What tectonic process formed the Mariana Trench, the deepest trench on Earth at Challenger Deep?',
                    correct_answer: 'Subduction of the denser Pacific oceanic plate beneath the Mariana Plate',
                    incorrect_answers: [
                        'Divergent seafloor spreading creating an expanding oceanic ridge',
                        'Strike-slip transform faulting grinding laterally across continents',
                        'Volcanic caldera collapse following massive hotspot basalt eruptions'
                    ],
                    explanation: 'At convergent plate boundaries, cold, dense oceanic lithosphere plunges beneath another plate into the mantle, carving deep trenches like the Mariana Trench (~11,034 m deep).'
                }
            ],
            easy: [
                {
                    id: 'g_e_1',
                    question: 'The Prime Meridian, established as the reference line of 0° longitude, passes through which observatory?',
                    correct_answer: 'Royal Observatory in Greenwich, London, England',
                    incorrect_answers: [
                        'Observatory of Paris, France',
                        'Smithsonian Astrophysical Observatory in Washington, D.C.',
                        'Teide Observatory in the Canary Islands'
                    ],
                    explanation: 'The International Meridian Conference of 1884 officially established the meridian passing through the Greenwich transit circle as the universal Prime Meridian.'
                },
                {
                    id: 'g_e_2',
                    question: 'Which is the longest continental mountain range in the world, spanning over 7,000 kilometers along western South America?',
                    correct_answer: 'The Andes Mountains',
                    incorrect_answers: ['The Himalayas', 'The Rocky Mountains', 'The Great Dividing Range'],
                    explanation: 'The Andes extend continuously through seven South American nations along the Pacific coast for over 7,000 km (4,350 miles).'
                },
                {
                    id: 'g_e_3',
                    question: 'What is the latitude line for the Tropic of Cancer in the Northern Hemisphere?',
                    correct_answer: 'Approximately 23.5° North',
                    incorrect_answers: ['66.5° North', '0° Equator', '45.0° North'],
                    explanation: 'The Tropic of Cancer lies at approximately 23.44° North of the Equator, representing the northernmost latitude where the Sun can appear directly overhead at the June solstice.'
                }
            ]
        },

        literature: {
            hard: [
                {
                    id: 'l_h_1',
                    question: 'Which poetic rhyme scheme structure was invented by Dante Alighieri for his epic theological masterpiece, The Divine Comedy?',
                    correct_answer: 'Terza Rima (aba bcb cdc ded ...)',
                    incorrect_answers: [
                        'Ottava Rima (abababcc)',
                        'Spenserian Stanza (ababbcbcc)',
                        'Villanelle envelope rhyme'
                    ],
                    explanation: 'Dante invented Terza Rima, a three-line stanza form using interlocking tercet rhymes (aba, bcb, cdc) reflecting the holy Trinity and driving narrative continuity.'
                },
                {
                    id: 'l_h_2',
                    question: 'In Albert Camus\'s 1942 philosophical novel The Stranger (L\'Étranger), what pivotal event precipitates the protagonist Meursault\'s trial and condemnation?',
                    correct_answer: 'His shooting of an unnamed Arab man on an Algiers beach under the blinding glare of the Sun',
                    incorrect_answers: [
                        'His political betrayal of French colonial administrators during an uprising',
                        'His theft of government funds from a maritime shipping company',
                        'His refusal to enlist in the military during World War I'
                    ],
                    explanation: 'Meursault shoots an Arab man on a sun-drenched beach; during his trial, the court condemns him not merely for the homicide, but for his emotional detachment and refusal to weep at his mother\'s funeral.'
                },
                {
                    id: 'l_h_3',
                    question: 'James Joyce\'s landmark 1922 modernist novel Ulysses constructs an intricate modern parallel to Homer\'s Odyssey set entirely in which city on June 16, 1904?',
                    correct_answer: 'Dublin, Ireland',
                    incorrect_answers: ['London, England', 'Edinburgh, Scotland', 'Paris, France'],
                    explanation: 'Ulysses chronicles the movements and thoughts of Leopold Bloom, Stephen Dedalus, and Molly Bloom across Dublin over the course of a single day (June 16, 1904, celebrated as Bloomsday).'
                }
            ],
            medium: [
                {
                    id: 'l_m_1',
                    question: 'In George Orwell’s dystopian novel 1984, what official government language is designed to narrow the range of thought and eliminate political heresy?',
                    correct_answer: 'Newspeak',
                    incorrect_answers: ['Doubletalk', 'Oldspeak', 'Ministry Jargon'],
                    explanation: 'Newspeak is Oceania\'s controlled language engineered by the Party to eradicate nuanced words, making independent concepts (crimethink) literally impossible to formulate.'
                },
                {
                    id: 'l_m_2',
                    question: 'In Fyodor Dostoevsky’s psychological novel Crime and Punishment, what pseudo-philosophical theory motivates Rodion Raskolnikov to murder the pawnbroker?',
                    correct_answer: 'The belief that "extraordinary" men have the moral right to transgress societal laws for greater ends',
                    incorrect_answers: [
                        'A desire to lead a violent nihilist revolution against the Czarist aristocracy',
                        'Delusions caused by an inheritance conspiracy orchestrated by Luzhin',
                        'A religious vow to eliminate money-lenders from St. Petersburg'
                    ],
                    explanation: 'Raskolnikov published an article arguing that exceptional historical figures (like Napoleon) are above ordinary moral conventions. He murders Alyona Ivanovna to test if he is an \'extraordinary man\'.'
                },
                {
                    id: 'l_m_3',
                    question: 'Published in 1818 by Mary Shelley at age 20, which novel is widely credited as the first modern work of science fiction?',
                    correct_answer: 'Frankenstein; or, The Modern Prometheus',
                    incorrect_answers: ['The Time Machine', 'Dracula', 'The Strange Case of Dr Jekyll and Mr Hyde'],
                    explanation: 'Mary Shelley created the science fiction genre by depicting scientific experimentation (galvanism and natural philosophy) rather than supernatural sorcery as the catalyst for Victor Frankenstein\'s creation.'
                }
            ],
            easy: [
                {
                    id: 'l_e_1',
                    question: 'What is the literary term for attributing human feelings, intentions, or characteristics to non-human entities or objects?',
                    correct_answer: 'Personification',
                    incorrect_answers: ['Alliteration', 'Hyperbole', 'Onomatopoeia'],
                    explanation: 'Personification is a figure of speech in which an idea, animal, or inanimate object is given human attributes, emotions, or behaviors (e.g. "the wind whispered through the pines").'
                },
                {
                    id: 'l_e_2',
                    question: 'Which of the following is an example of a dramatic soliloquy in William Shakespeare\'s Hamlet?',
                    correct_answer: '"To be, or not to be, that is the question"',
                    incorrect_answers: [
                        '"Friends, Romans, countrymen, lend me your ears"',
                        '"All the world\'s a stage, and all the men and women merely players"',
                        '"Shall I compare thee to a summer\'s day?"'
                    ],
                    explanation: 'Hamlet\'s Act 3 soliloquy ("To be, or not to be") explores existential suffering, mortality, and the fear of the unknown after death.'
                },
                {
                    id: 'l_e_3',
                    question: 'What is the essential technical difference between a metaphor and a simile?',
                    correct_answer: 'A simile uses connective words such as "like" or "as", whereas a metaphor makes a direct equation',
                    incorrect_answers: [
                        'A metaphor only appears in poetry while similes appear in prose',
                        'A simile exaggerates reality while a metaphor expresses literal facts',
                        'Metaphors must rhyme while similes do not require meter'
                    ],
                    explanation: 'Both compare two unrelated things, but similes employ explicit comparison words like "as brave as a lion", while metaphors state "he is a lion in battle".'
                }
            ]
        },

        art: {
            hard: [
                {
                    id: 'a_h_1',
                    question: 'Which dramatic painting technique, heavily championed by Baroque master Caravaggio, utilizes extreme contrasts of deep dark shadows and piercing shafts of light?',
                    correct_answer: 'Tenebrism (Chiaroscuro)',
                    incorrect_answers: ['Sfumato', 'Impasto', 'Trompe-l\'œil'],
                    explanation: 'Tenebrism (from Italian "tenebroso", meaning dark/gloomy) is a heightened form of chiaroscuro where darkness dominates the canvas and illuminated figures emerge dramatically from black backgrounds.'
                },
                {
                    id: 'a_h_2',
                    question: 'Founded in Weimar, Germany in 1919 by Walter Gropius, which revolutionary school pioneered modern design by uniting fine art, functional craft, and industrial architecture?',
                    correct_answer: 'The Bauhaus',
                    incorrect_answers: ['De Stijl', 'Art Nouveau', 'The Vienna Secession'],
                    explanation: 'The Staatliches Bauhaus revolutionized 20th-century design under the principle that "form follows function", unifying fine art, typography, craft, and mass production.'
                },
                {
                    id: 'a_h_3',
                    question: 'In Classical Greek architecture, which column order is distinguished by ornate capitals adorned with sculpted acanthus leaves?',
                    correct_answer: 'Corinthian Order',
                    incorrect_answers: ['Doric Order', 'Ionic Order', 'Tuscan Order'],
                    explanation: 'The three classical Greek orders are Doric (simple round capital), Ionic (twin spiral volutes), and Corinthian (the most decorative, sculpted with tiered acanthus leaves).'
                }
            ],
            medium: [
                {
                    id: 'a_m_1',
                    question: 'Which Renaissance painting technique, exemplified in Leonardo da Vinci’s Mona Lisa, produces softened transitions of shade without harsh outlines?',
                    correct_answer: 'Sfumato',
                    incorrect_answers: ['Fresco', 'Grisaille', 'Encaustic'],
                    explanation: 'Sfumato (derived from Italian "sfumare", to evaporate like smoke) blends colors and tones imperceptibly to create atmospheric, realistic portraits without crisp contour borders.'
                },
                {
                    id: 'a_m_2',
                    question: 'Which 20th-century avant-garde movement, led by Salvador Dalí and René Magritte, explored dream analysis and subconscious psychoanalytic imagery?',
                    correct_answer: 'Surrealism',
                    incorrect_answers: ['Futurism', 'Dadaism', 'Constructivism'],
                    explanation: 'Launched by André Breton\'s 1924 Surrealist Manifesto and inspired by Freud\'s psychoanalysis, Surrealism sought to liberate the creative unconscious through bizarre, dreamlike juxtapositions.'
                },
                {
                    id: 'a_m_3',
                    question: 'Georges Seurat pioneered which post-impressionist technique of painting in tiny, discrete dots of pure color that blend optically in the viewer\'s eye?',
                    correct_answer: 'Pointillism (Divisionism)',
                    incorrect_answers: ['Action Painting', 'Sgraffito', 'Cloisonnism'],
                    explanation: 'Seurat developed Pointillism (exemplified in "A Sunday on La Grande Jatte"), applying systematic dots of complementary colors based on optical science rather than mixing paints on a palette.'
                }
            ],
            easy: [
                {
                    id: 'a_e_1',
                    question: 'Which Italian master painted the biblical frescoes across the ceiling of the Sistine Chapel between 1508 and 1512?',
                    correct_answer: 'Michelangelo Buonarroti',
                    incorrect_answers: ['Leonardo da Vinci', 'Raphael Sanzio', 'Sandro Botticelli'],
                    explanation: 'Commissioned by Pope Julius II, Michelangelo spent four years painting the Sistine Chapel ceiling, including "The Creation of Adam" and nine scenes from the Book of Genesis.'
                },
                {
                    id: 'a_e_2',
                    question: 'In classical drawing and painting, what is the point on the horizon line where parallel receding lines appear to converge?',
                    correct_answer: 'The Vanishing Point',
                    incorrect_answers: ['The Focal Zenith', 'The Nadir Point', 'The Picture Plane'],
                    explanation: 'In linear perspective codified by Filippo Brunelleschi, orthogonal lines recede toward a common vanishing point on the horizon line to construct three-dimensional depth.'
                },
                {
                    id: 'a_e_3',
                    question: 'Which art movement co-founded by Pablo Picasso and Georges Braque fragmented objects into geometric facets and multiple simultaneous perspectives?',
                    correct_answer: 'Cubism',
                    incorrect_answers: ['Fauvism', 'Romanticism', 'Pop Art'],
                    explanation: 'Beginning around 1907 with Picasso\'s "Les Demoiselles d\'Avignon", Cubism dismantled traditional single-point Renaissance perspective in favor of fractured geometric planes.'
                }
            ]
        },

        sports: {
            hard: [
                {
                    id: 'sp_h_1',
                    question: 'Why was the standard marathon distance officially set to 26 miles 385 yards (42.195 km) at the 1908 London Olympic Games?',
                    correct_answer: 'To start at Windsor Castle and finish precisely in front of the Royal Box at White City Stadium',
                    incorrect_answers: [
                        'It was the exact surveyed distance between Athens and the ancient plain of Marathon',
                        'It represented the maximum distance a human could run without electrolyte depletion',
                        'It was calibrated to equal 100 laps around the Roman Circus Maximus'
                    ],
                    explanation: 'The British Royal Family requested that the marathon begin at Windsor Castle and finish right beneath the Royal Box at White City Stadium, permanently setting the distance to 42.195 km.'
                },
                {
                    id: 'sp_h_2',
                    question: 'In Formula 1 racing regulations, under what condition is a driver permitted to activate the Drag Reduction System (DRS)?',
                    correct_answer: 'Within a designated DRS activation zone when less than 1.0 second behind a preceding car',
                    incorrect_answers: [
                        'Anywhere on the circuit provided engine temperature is below 110°C',
                        'Exclusively during the first three laps of a Grand Prix race',
                        'Only after executing an undercut pit stop for soft compound tires'
                    ],
                    explanation: 'DRS opens an aerodynamic flap on the rear wing to reduce drag and promote overtaking; it is electronically enabled only when a chasing car is within 1 second of the leading car at detection points.'
                },
                {
                    id: 'sp_h_3',
                    question: 'Which French footballer holds the record for the most goals scored in a single FIFA World Cup tournament, scoring 13 goals in 1958?',
                    correct_answer: 'Just Fontaine',
                    incorrect_answers: ['Pelé', 'Gerd Müller', 'Miroslav Klose'],
                    explanation: 'Just Fontaine scored an incredible 13 goals in only 6 matches for France during the 1958 World Cup in Sweden, a record that remains unbroken.'
                }
            ],
            medium: [
                {
                    id: 'sp_m_1',
                    question: 'Which Grand Slam tennis tournament is the only one played on natural grass courts?',
                    correct_answer: 'The Championships, Wimbledon',
                    incorrect_answers: ['The French Open (Roland Garros)', 'The Australian Open', 'The US Open'],
                    explanation: 'Founded in 1877 in London, Wimbledon is the oldest tennis tournament in the world and the only major Grand Slam event retained on traditional grass courts.'
                },
                {
                    id: 'sp_m_2',
                    question: 'In international Association Football (soccer), what constitutes an offside offense at the moment the ball is played?',
                    correct_answer: 'Being closer to the opponent\'s goal line than both the ball and the second-last opponent while involved in active play',
                    incorrect_answers: [
                        'Receiving a ball directly from a corner kick or throw-in',
                        'Crossing into the opponent\'s penalty area before a free kick is struck',
                        'Being in the opponent\'s defensive half when the goalkeeper possesses the ball'
                    ],
                    explanation: 'Under Law 11 of IFAB, an attacker is in an offside position if any part of their head, body, or feet is nearer to the opponents\' goal line than both the ball and second-last opponent (usually the last defender).'
                },
                {
                    id: 'sp_m_3',
                    question: 'What is the official duration of the shot clock in an NBA basketball possession?',
                    correct_answer: '24 seconds',
                    incorrect_answers: ['30 seconds', '35 seconds', '20 seconds'],
                    explanation: 'The NBA introduced the 24-second shot clock in 1954 (conceived by Syracuse Nationals owner Danny Biasone) to accelerate gameplay and prevent stall tactics.'
                }
            ],
            easy: [
                {
                    id: 'sp_e_1',
                    question: 'How many players are fielded on the court for each team during an active NBA or FIBA basketball game?',
                    correct_answer: '5 players',
                    incorrect_answers: ['6 players', '7 players', '4 players'],
                    explanation: 'Standard basketball teams play with 5 active players on the court: Point Guard, Shooting Guard, Small Forward, Power Forward, and Center.'
                },
                {
                    id: 'sp_e_2',
                    question: 'What do the five interlocking rings on the official Olympic flag symbolize?',
                    correct_answer: 'The union of the five participating continents and athletes from around the world',
                    incorrect_answers: [
                        'The five original track and field events in ancient Greece',
                        'The five permanent member nations of the International Olympic Committee',
                        'The five oceans of planet Earth'
                    ],
                    explanation: 'Designed by Pierre de Coubertin in 1913, the five interlocking rings (blue, yellow, black, green, red) represent the five inhabited continents of the world joined in the Olympic movement.'
                },
                {
                    id: 'sp_e_3',
                    question: 'In a standard regulation professional soccer match, how long is each regular half of play (excluding stoppage time)?',
                    correct_answer: '45 minutes',
                    incorrect_answers: ['40 minutes', '50 minutes', '30 minutes'],
                    explanation: 'A regulation soccer game consists of two 45-minute halves for a total of 90 minutes, plus referee stoppage (injury) time added at the end of each half.'
                }
            ]
        },

        general: {
            hard: [
                {
                    id: 'gen_h_1',
                    question: 'Which five nations hold permanent veto-wielding seats on the United Nations Security Council (the P5)?',
                    correct_answer: 'United States, United Kingdom, France, Russia, and China',
                    incorrect_answers: [
                        'United States, Germany, Japan, United Kingdom, and France',
                        'United States, Russia, China, India, and Brazil',
                        'United Kingdom, France, Germany, Italy, and Japan'
                    ],
                    explanation: 'The Permanent Five (P5) members of the UN Security Council are the victorious major powers of World War II granted veto authority over substantive resolutions under the UN Charter.'
                },
                {
                    id: 'gen_h_2',
                    question: 'The International Court of Justice (ICJ), the principal judicial organ of the United Nations, is permanently seated in which city?',
                    correct_answer: 'The Hague, Netherlands (The Peace Palace)',
                    incorrect_answers: ['Geneva, Switzerland', 'New York City, USA', 'Brussels, Belgium'],
                    explanation: 'Established in 1945, the ICJ settles legal disputes between sovereign states and is the only principal UN organ not located in New York City, sitting at The Hague in the Netherlands.'
                },
                {
                    id: 'gen_h_3',
                    question: 'In the Standard Model of particle physics, how many fundamental elementary fermions (quarks and leptons) exist?',
                    correct_answer: '12 elementary fermions (6 quarks and 6 leptons)',
                    incorrect_answers: [
                        '8 elementary fermions (4 quarks and 4 leptons)',
                        '16 elementary fermions (8 quarks and 8 leptons)',
                        '6 elementary fermions'
                    ],
                    explanation: 'The Standard Model classifies 12 fundamental fermions across 3 generations: 6 quarks (up, down, charm, strange, top, bottom) and 6 leptons (electron, muon, tau, and their 3 associated neutrinos).'
                }
            ],
            medium: [
                {
                    id: 'gen_m_1',
                    question: 'What is the approximate speed of sound in dry air at 20°C (68°F) at sea level?',
                    correct_answer: '343 m/s (~1,235 km/h)',
                    incorrect_answers: ['250 m/s (~900 km/h)', '500 m/s (~1,800 km/h)', '150 m/s (~540 km/h)'],
                    explanation: 'The speed of sound in an ideal gas depends on temperature (v ≈ 331.3 + 0.6·T°C m/s). At 20°C, sound propagates through dry air at approximately 343 meters per second (Mach 1).'
                },
                {
                    id: 'gen_m_2',
                    question: 'How many total chromosomes are present in the nucleus of a normal human somatic (diploid) cell?',
                    correct_answer: '46 chromosomes (23 pairs)',
                    incorrect_answers: ['48 chromosomes (24 pairs)', '44 chromosomes (22 pairs)', '23 single chromosomes'],
                    explanation: 'Normal human somatic cells are diploid (2n = 46), consisting of 22 pairs of autosomes and 1 pair of sex chromosomes (XX in females, XY in males).'
                },
                {
                    id: 'gen_m_3',
                    question: 'Which of the original Seven Wonders of the Ancient World is the only one that still remains intact today?',
                    correct_answer: 'The Great Pyramid of Giza (Egypt)',
                    incorrect_answers: [
                        'The Colossus of Rhodes',
                        'The Lighthouse of Alexandria',
                        'The Hanging Gardens of Babylon'
                    ],
                    explanation: 'Constructed around 2560 BC for Pharaoh Khufu, the Great Pyramid of Giza is the oldest of the ancient wonders and the only one that has survived into modern times.'
                }
            ],
            easy: [
                {
                    id: 'gen_e_1',
                    question: 'Which layer of Earth\'s atmosphere is closest to the surface, containing nearly all weather phenomena and atmospheric mass?',
                    correct_answer: 'The Troposphere',
                    incorrect_answers: ['The Stratosphere', 'The Mesosphere', 'The Thermosphere'],
                    explanation: 'The troposphere extends from Earth\'s surface up to roughly 7–20 km altitude and contains approximately 75–80% of the atmosphere\'s total mass and virtually all weather and water vapor.'
                },
                {
                    id: 'gen_e_2',
                    question: 'Which blood group type is medically designated as the "universal red blood cell donor"?',
                    correct_answer: 'O-negative (O-)',
                    incorrect_answers: ['AB-positive (AB+)', 'A-positive (A+)', 'O-positive (O+)'],
                    explanation: 'O-negative red blood cells lack A, B, and Rh surface antigens, meaning they can generally be transfused into patients of any blood group without provoking an acute hemolytic transfusion reaction.'
                },
                {
                    id: 'gen_e_3',
                    question: 'What is the official currency used across the United Kingdom?',
                    correct_answer: 'British Pound Sterling (£)',
                    incorrect_answers: ['Euro (€)', 'Swiss Franc (CHF)', 'Crown (SEK)'],
                    explanation: 'The British Pound Sterling (GBP, £) is the official currency of the United Kingdom and its crown dependencies.'
                }
            ]
        }
    };
    }
}

// Expose classes on window for modularity and testing
window.ProceduralQuestionGenerator = ProceduralQuestionGenerator;
window.QuizApp = QuizApp;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.quizApp = new QuizApp();
});
