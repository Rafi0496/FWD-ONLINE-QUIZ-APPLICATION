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
// ==========================================================================
class ProceduralQuestionGenerator {
    static generateRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Dynamic Math Question Generator
    static generateMathQuestion(tier) {
        const id = `proc_math_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        if (tier === 'elementary') {
            const opType = this.generateRandomInt(1, 4);
            let a, b, q, ans, explanation, incorrect;
            
            if (opType === 1) { // Addition
                a = this.generateRandomInt(12, 85);
                b = this.generateRandomInt(15, 75);
                ans = a + b;
                q = `What is ${a} + ${b}?`;
                explanation = `To calculate ${a} + ${b}, add the units and tens places: ${a} + ${b} = ${ans}.`;
                incorrect = [ans - 2, ans + 10, ans - 10, ans + 1].filter(x => x !== ans).slice(0, 3).map(String);
            } else if (opType === 2) { // Subtraction
                a = this.generateRandomInt(45, 99);
                b = this.generateRandomInt(12, a - 5);
                ans = a - b;
                q = `What is ${a} - ${b}?`;
                explanation = `Subtracting ${b} from ${a}: ${a} - ${b} = ${ans}.`;
                incorrect = [ans + 2, ans - 10, ans + 10, ans - 1].filter(x => x !== ans).slice(0, 3).map(String);
            } else if (opType === 3) { // Multiplication
                a = this.generateRandomInt(4, 12);
                b = this.generateRandomInt(4, 12);
                ans = a * b;
                q = `What is ${a} × ${b}?`;
                explanation = `Multiplying ${a} by ${b} equals ${ans} (${a} groups of ${b}).`;
                incorrect = [ans + a, ans - b, ans + 4, ans - 3].filter(x => x !== ans).slice(0, 3).map(String);
            } else { // Division
                ans = this.generateRandomInt(3, 12);
                b = this.generateRandomInt(3, 9);
                a = ans * b;
                q = `What is ${a} ÷ ${b}?`;
                explanation = `Dividing ${a} by ${b}: since ${b} × ${ans} = ${a}, ${a} ÷ ${b} = ${ans}.`;
                incorrect = [ans + 1, ans - 1, ans + 2, ans + 3].filter(x => x !== ans && x > 0).slice(0, 3).map(String);
            }

            return {
                id,
                question: q,
                correct_answer: String(ans),
                incorrect_answers: incorrect,
                explanation: explanation
            };
        }

        if (tier === 'middle') {
            const types = ['algebra', 'percent', 'square_root', 'exponent'];
            const chosen = types[this.generateRandomInt(0, types.length - 1)];

            if (chosen === 'algebra') {
                const x = this.generateRandomInt(3, 15);
                const a = this.generateRandomInt(2, 6);
                const b = this.generateRandomInt(5, 25);
                const c = a * x + b;
                return {
                    id,
                    question: `Solve for x: ${a}x + ${b} = ${c}`,
                    correct_answer: String(x),
                    incorrect_answers: [String(x + 2), String(Math.max(1, x - 2)), String(x + 4)],
                    explanation: `Step 1: Subtract ${b} from both sides: ${a}x = ${c - b}. Step 2: Divide both sides by ${a}: x = ${c - b} ÷ ${a} = ${x}.`
                };
            }

            if (chosen === 'percent') {
                const pct = [10, 15, 20, 25, 30, 40, 50, 75][this.generateRandomInt(0, 7)];
                const total = [40, 60, 80, 120, 150, 200, 240, 300][this.generateRandomInt(0, 7)];
                const ans = (pct / 100) * total;
                return {
                    id,
                    question: `What is ${pct}% of ${total}?`,
                    correct_answer: String(ans),
                    incorrect_answers: [String(ans + 10), String(Math.max(1, ans - 5)), String(ans + 5)],
                    explanation: `To find ${pct}% of ${total}: (${pct} ÷ 100) × ${total} = ${ans}.`
                };
            }

            if (chosen === 'square_root') {
                const root = this.generateRandomInt(11, 20);
                const square = root * root;
                return {
                    id,
                    question: `What is the square root of ${square}? (√${square})`,
                    correct_answer: String(root),
                    incorrect_answers: [String(root - 1), String(root + 1), String(root + 2)],
                    explanation: `Because ${root} × ${root} = ${square}, the principal square root √${square} is ${root}.`
                };
            }

            // Exponent
            const base = this.generateRandomInt(2, 6);
            const exp = base === 2 ? this.generateRandomInt(4, 7) : this.generateRandomInt(2, 4);
            const ans = Math.pow(base, exp);
            return {
                id,
                question: `What is ${base}^${exp} (${base} to the power of ${exp})?`,
                correct_answer: String(ans),
                incorrect_answers: [String(ans - base), String(ans + base * 2), String(base * exp)],
                explanation: `${base}^${exp} means multiplying ${base} by itself ${exp} times: ${Array(exp).fill(base).join(' × ')} = ${ans}.`
            };
        }

        // High / College Tier
        const types = ['derivative_power', 'trig_special', 'quadratic_roots', 'matrix_det'];
        const chosen = types[this.generateRandomInt(0, types.length - 1)];

        if (chosen === 'derivative_power') {
            const n = this.generateRandomInt(3, 8);
            const coeff = this.generateRandomInt(2, 5);
            const newCoeff = coeff * n;
            const newPower = n - 1;
            return {
                id,
                question: `What is the derivative with respect to x of f(x) = ${coeff}x^${n}?`,
                correct_answer: `${newCoeff}x^${newPower}`,
                incorrect_answers: [`${coeff}x^${newPower}`, `${newCoeff}x^${n}`, `${coeff * (n + 1)}x^${n + 1}`],
                explanation: `Applying the Power Rule (d/dx [a·x^n] = a·n·x^(n-1)): (${coeff} × ${n})·x^(${n}-1) = ${newCoeff}x^${newPower}.`
            };
        }

        if (chosen === 'matrix_det') {
            const a = this.generateRandomInt(1, 6);
            const b = this.generateRandomInt(1, 4);
            const c = this.generateRandomInt(1, 5);
            const d = this.generateRandomInt(2, 6);
            const det = (a * d) - (b * c);
            return {
                id,
                question: `What is the determinant of matrix [[${a}, ${b}], [${c}, ${d}]]?`,
                correct_answer: String(det),
                incorrect_answers: [String(det + 3), String(det - 4), String(a * d + b * c)],
                explanation: `The determinant of a 2×2 matrix [[a,b],[c,d]] is calculated as (a·d - b·c) = (${a}·${d}) - (${b}·${c}) = ${a * d} - ${b * c} = ${det}.`
            };
        }

        // Quadratic or general algebra
        const r1 = this.generateRandomInt(1, 5);
        const r2 = this.generateRandomInt(2, 6);
        const bCoeff = -(r1 + r2);
        const cConst = r1 * r2;
        return {
            id,
            question: `What are the roots of x² ${bCoeff >= 0 ? '+ ' + bCoeff : '- ' + Math.abs(bCoeff)}x + ${cConst} = 0?`,
            correct_answer: `x = ${r1}, x = ${r2}`,
            incorrect_answers: [`x = ${-r1}, x = ${-r2}`, `x = ${r1 + 1}, x = ${r2 - 1}`, `x = ${r1 * 2}, x = ${r2}`],
            explanation: `Factoring the quadratic: (x - ${r1})(x - ${r2}) = 0 gives roots x = ${r1} and x = ${r2}.`
        };
    }

    // Dynamic Tech Question Generator
    static generateTechQuestion(tier) {
        const id = `proc_tech_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        if (tier === 'elementary' || tier === 'middle') {
            const dec = this.generateRandomInt(5, 31);
            const bin = dec.toString(2);
            const inc1 = (dec + 1).toString(2);
            const inc2 = (dec - 1).toString(2);
            const inc3 = (dec + 3).toString(2);
            return {
                id,
                question: `What is the binary representation of decimal number ${dec}?`,
                correct_answer: bin,
                incorrect_answers: [inc1, inc2, inc3].filter(x => x !== bin).slice(0, 3),
                explanation: `To convert decimal ${dec} to binary, express it as a sum of powers of 2. In base 2, ${dec} is written as ${bin}.`
            };
        }

        // High / College
        const dec = this.generateRandomInt(16, 255);
        const hex = dec.toString(16).toUpperCase();
        const inc1 = (dec + 16).toString(16).toUpperCase();
        const inc2 = (dec - 1).toString(16).toUpperCase();
        const inc3 = (dec + 4).toString(16).toUpperCase();
        return {
            id,
            question: `What is the hexadecimal (base 16) representation of decimal ${dec}?`,
            correct_answer: `0x${hex}`,
            incorrect_answers: [`0x${inc1}`, `0x${inc2}`, `0x${inc3}`],
            explanation: `Dividing ${dec} by 16 gives quotient ${Math.floor(dec / 16)} and remainder ${dec % 16}, resulting in hex 0x${hex}.`
        };
    }

    // Dynamic Science Question Generator
    static generateScienceQuestion() {
        const id = `proc_sci_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const m = this.generateRandomInt(2, 20); // mass kg
        const a = this.generateRandomInt(2, 12); // accel m/s²
        const f = m * a;
        return {
            id,
            question: `According to Newton's Second Law (F = m·a), what force is required to accelerate a ${m} kg object at ${a} m/s²?`,
            correct_answer: `${f} N`,
            incorrect_answers: [`${f + 10} N`, `${f - 5} N`, `${m + a} N`],
            explanation: `Newton's Second Law states Force = mass × acceleration. Therefore, F = ${m} kg × ${a} m/s² = ${f} Newtons (N).`
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
            favoriteSubject: ''
        };
        this.quizData = {
            category: 'general',
            difficulty: 'easy',
            questionCount: 10,
            timerDuration: 60
        };
        
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        
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
        
        // Persistent seen question set across sessions
        this.seenQuestionIds = this.loadSeenQuestionIds();

        // Massive Question Bank with Detailed Educational Explanations
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
            // Keep recent 400 IDs to avoid infinite growth
            const arr = Array.from(this.seenQuestionIds).slice(-400);
            localStorage.setItem('quizmaster_seen_questions', JSON.stringify(arr));
        } catch (e) {
            console.warn('Could not save seen question history', e);
        }
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.updateSoundIcon();
        this.showPage('registration-page');
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
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        document.getElementById('retake-quiz-btn').addEventListener('click', () => this.retakeQuiz());
        document.getElementById('share-results-btn').addEventListener('click', () => this.shareResults());
        document.getElementById('change-settings-btn').addEventListener('click', () => this.changeSettings());

        document.getElementById('sound-toggle-btn').addEventListener('click', () => this.toggleSound());

        const toggleReviewBtn = document.getElementById('toggle-review-btn');
        if (toggleReviewBtn) {
            toggleReviewBtn.addEventListener('click', () => this.toggleReviewSection());
        }
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
                if (!this.isAnswered) {
                    const answerBtns = document.querySelectorAll('.answer-btn');
                    if (e.key >= '1' && e.key <= '4') {
                        const idx = parseInt(e.key) - 1;
                        if (answerBtns[idx]) answerBtns[idx].click();
                    } else if (e.key.toLowerCase() === 'a' && answerBtns[0]) {
                        answerBtns[0].click();
                    } else if (e.key.toLowerCase() === 'b' && answerBtns[1]) {
                        answerBtns[1].click();
                    } else if (e.key.toLowerCase() === 'c' && answerBtns[2]) {
                        answerBtns[2].click();
                    } else if (e.key.toLowerCase() === 'd' && answerBtns[3]) {
                        answerBtns[3].click();
                    } else if ((e.key === 's' || e.key === 'S') && !document.getElementById('skip-btn').disabled) {
                        this.skipQuestion();
                    }
                } else {
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

        document.getElementById('user-name-display').textContent = name;
        document.getElementById('user-age-display').textContent = age;
        document.getElementById('user-level-display').textContent = this.getQualificationName(qualification);
        document.getElementById('user-subject-display').textContent = this.getSubjectName(favoriteSubject);

        this.setupQuizSettings();
        this.showPage('settings-page');
    }

    getQualificationName(qual) {
        const names = {
            elementary: 'Elementary School',
            middle: 'Middle School',
            high: 'High School',
            college: 'College / University',
            graduate: 'Graduate Degree',
            professional: 'Working Professional',
            teacher: 'Teacher / Educator'
        };
        return names[qual] || qual;
    }

    getSubjectName(subject) {
        const names = {
            mathematics: '🔢 Mathematics',
            science: '🔬 Science',
            history: '📜 History',
            geography: '🌍 Geography',
            technology: '💻 Technology & Coding',
            literature: '📚 Literature & Language',
            art: '🎨 Art & Culture',
            sports: '⚽ Sports & Athletics',
            general: '🌟 General Knowledge'
        };
        return names[subject] || subject;
    }

    setupQuizSettings() {
        const categorySelect = document.getElementById('category');
        categorySelect.value = this.userData.favoriteSubject || 'general';
        
        const difficultySelect = document.getElementById('difficulty');
        if (this.userData.qualification === 'elementary') {
            difficultySelect.value = 'easy';
        } else if (this.userData.qualification === 'middle') {
            difficultySelect.value = 'medium';
        } else {
            difficultySelect.value = 'hard';
        }
        
        const timerSelect = document.getElementById('timerDuration');
        if (this.userData.qualification === 'elementary') {
            timerSelect.value = '90';
        } else {
            timerSelect.value = '60';
        }
    }

    collectQuizSettings() {
        this.quizData.category = document.getElementById('category').value;
        this.quizData.difficulty = document.getElementById('difficulty').value;
        this.quizData.questionCount = parseInt(document.getElementById('questionCount').value);
        this.quizData.timerDuration = parseInt(document.getElementById('timerDuration').value);
    }

    mapLevelToTier(qual) {
        if (qual === 'elementary') return 'elementary';
        if (qual === 'middle') return 'middle';
        if (qual === 'high') return 'high';
        return 'college';
    }

    // ======================================================================
    // FETCH LIVE QUESTIONS FROM OPEN TRIVIA DB API WITH FALLBACK
    // ======================================================================
    async fetchLiveOpenTDBQuestions(category, difficulty, count) {
        const categoryMap = {
            general: 9,      // General Knowledge
            science: 17,     // Science & Nature
            technology: 18,  // Computers
            mathematics: 19, // Mathematics
            sports: 21,      // Sports
            geography: 22,   // Geography
            history: 23,     // History
            art: 25,         // Art
            literature: 10   // Books / Literature
        };

        const catId = categoryMap[category] || 9;
        const diff = difficulty || 'medium';
        const url = `https://opentdb.com/api.php?amount=${count}&category=${catId}&difficulty=${diff}&type=multiple`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
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
                    explanation: `Correct Answer: "${decodeHTML(item.correct_answer)}". This fact is verified under ${item.category} (${item.difficulty} level).`
                }));
            }
        } catch (e) {
            // Silently fallback to procedural & local banks
        }
        return [];
    }

    // ======================================================================
    // GET FRESH UNIQUE QUESTIONS GUARANTEED
    // ======================================================================
    async assembleFreshQuestions() {
        const targetCount = this.quizData.questionCount;
        const subject = this.quizData.category;
        const tier = this.mapLevelToTier(this.userData.qualification);
        let selectedQuestions = [];

        // 1. Attempt live API fetch for variety
        const apiQuestions = await this.fetchLiveOpenTDBQuestions(subject, this.quizData.difficulty, targetCount);
        const freshApi = apiQuestions.filter(q => !this.seenQuestionIds.has(q.id));
        selectedQuestions.push(...freshApi);

        // 2. Add dynamic procedural questions for Math, Tech, and Science
        if (selectedQuestions.length < targetCount) {
            const needed = targetCount - selectedQuestions.length;
            if (subject === 'mathematics') {
                for (let i = 0; i < needed; i++) {
                    selectedQuestions.push(ProceduralQuestionGenerator.generateMathQuestion(tier));
                }
            } else if (subject === 'technology') {
                for (let i = 0; i < Math.min(needed, 4); i++) {
                    selectedQuestions.push(ProceduralQuestionGenerator.generateTechQuestion(tier));
                }
            } else if (subject === 'science') {
                for (let i = 0; i < Math.min(needed, 3); i++) {
                    selectedQuestions.push(ProceduralQuestionGenerator.generateScienceQuestion());
                }
            }
        }

        // 3. Fill from local curated question banks with unseen prioritization
        if (selectedQuestions.length < targetCount) {
            const subjectBank = this.questionBanks[subject] || this.questionBanks.general;
            let candidatePool = [];

            if (subjectBank[tier]) candidatePool.push(...subjectBank[tier]);
            ['college', 'high', 'middle', 'elementary'].forEach(t => {
                if (t !== tier && subjectBank[t]) candidatePool.push(...subjectBank[t]);
            });

            if (subject !== 'general' && candidatePool.length < targetCount) {
                const genBank = this.questionBanks.general;
                if (genBank[tier]) candidatePool.push(...genBank[tier]);
                if (genBank.high) candidatePool.push(...genBank.high);
                if (genBank.middle) candidatePool.push(...genBank.middle);
            }

            // Filter for questions unseen by this user
            let unseen = candidatePool.filter(q => !this.seenQuestionIds.has(q.id));
            if (unseen.length === 0) {
                // If user has seen all, reset history for this subject
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

        // 4. Guaranteed fallback generation if still not enough
        while (selectedQuestions.length < targetCount) {
            selectedQuestions.push(ProceduralQuestionGenerator.generateMathQuestion(tier));
        }

        // Mark all chosen questions as seen in history
        selectedQuestions.forEach(q => this.seenQuestionIds.add(q.id));
        this.saveSeenQuestionIds();

        return selectedQuestions.slice(0, targetCount);
    }

    async startQuiz() {
        this.sound.playClick();
        this.collectQuizSettings();
        this.showPage('loading-page');
        this.updateLoadingMessage();
        
        // Assemble questions asynchronously with guaranteed freshness
        this.questions = await this.assembleFreshQuestions();
        
        setTimeout(() => {
            this.initializeQuiz();
            this.showPage('quiz-page');
            this.displayCurrentQuestion();
            this.startTimer();
        }, 1200);
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
        }, 350);
    }

    initializeQuiz() {
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.score = 0;
        this.quizStartTime = Date.now();
        this.isAnswered = false;
        
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
        
        // Uniform shuffle of answer choices
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

            button.appendChild(keycap);
            button.appendChild(textSpan);
            
            button.addEventListener('click', () => this.selectAnswer(answer, button));
            answersContainer.appendChild(button);
        });

        this.isAnswered = false;
        this.questionStartTime = Date.now();
        
        // Hide explanation feedback container & next button
        document.getElementById('feedback-container').style.display = 'none';
        document.getElementById('next-btn').style.display = 'none';
        
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
            
            if (skipText) skipText.textContent = `Skip (${this.skipTimeRemaining}s)`;
            
            if (this.skipTimeRemaining <= 0) {
                if (skipBtn) skipBtn.disabled = false;
                if (skipText) skipText.textContent = 'Skip Question';
                clearInterval(this.skipTimer);
                this.skipTimer = null;
            }
        }, 1000);
    }

    selectAnswer(selectedAnswer, buttonElement) {
        if (this.isAnswered) return;
        
        this.isAnswered = true;
        this.clearAllTimers();
        
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedAnswer === question.correct_answer;
        const timeSpent = Math.max(1, Math.round((Date.now() - this.questionStartTime) / 1000));
        
        this.userAnswers.push({
            questionNumber: this.currentQuestionIndex + 1,
            question: question.question,
            selectedAnswer,
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
        
        // Highlight answer buttons
        const answerButtons = document.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => {
            btn.disabled = true;
            const text = btn.querySelector('.answer-btn-text') ? btn.querySelector('.answer-btn-text').textContent : btn.textContent;
            if (text === question.correct_answer) {
                btn.classList.add('correct');
            } else if (btn === buttonElement && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        // Show educational explanation immediately
        this.showExplanationFeedback(isCorrect, question);
        
        // Show Next button and hide Skip button
        document.getElementById('next-btn').style.display = 'inline-flex';
        document.getElementById('skip-btn').style.display = 'none';
        
        // Auto advance after 4s (gives user time to read explanation if they don't click next)
        this.questionTimeout = setTimeout(() => {
            if (this.isAnswered) this.nextQuestion();
        }, 4000);
    }

    showExplanationFeedback(isCorrect, question) {
        const feedbackContainer = document.getElementById('feedback-container');
        const feedbackIcon = document.getElementById('feedback-icon');
        const feedbackTitle = document.getElementById('feedback-title');
        const explanationText = document.getElementById('explanation-text');
        
        feedbackContainer.className = `explanation-card ${isCorrect ? 'status-correct' : 'status-incorrect'}`;
        
        if (isCorrect) {
            feedbackIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
            feedbackTitle.textContent = 'Correct!';
        } else {
            feedbackIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
            feedbackTitle.textContent = `Incorrect! Correct answer: "${question.correct_answer}"`;
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
            const text = btn.querySelector('.answer-btn-text') ? btn.querySelector('.answer-btn-text').textContent : btn.textContent;
            if (text === question.correct_answer) {
                btn.classList.add('correct');
            }
        });
        
        this.showExplanationFeedback(false, question);

        document.getElementById('next-btn').style.display = 'inline-flex';
        document.getElementById('skip-btn').style.display = 'none';
        
        this.questionTimeout = setTimeout(() => {
            if (this.isAnswered) this.nextQuestion();
        }, 3000);
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
        
        if (percentage >= 90) {
            performanceMessage = `Outstanding mastery, ${this.userData.name}! Excellent score!`;
            achievementIcon = '🏆';
        } else if (percentage >= 75) {
            performanceMessage = `Great work, ${this.userData.name}! You showed solid comprehension!`;
            achievementIcon = '🥇';
        } else if (percentage >= 60) {
            performanceMessage = `Good progress, ${this.userData.name}! Review the explanations below to improve further.`;
            achievementIcon = '🥈';
        } else {
            performanceMessage = `Keep learning, ${this.userData.name}! Review the explanations below to master these concepts!`;
            achievementIcon = '🥉';
        }
        
        const cleanSub = this.getSubjectName(this.userData.favoriteSubject).replace(/^[^\s]+\s/, '');
        const personalMessage = `Dedicated learner in ${cleanSub} at ${this.getQualificationName(this.userData.qualification)} level. Continuous practice builds mastery! 🚀`;
        
        document.getElementById('achievement-icon').textContent = achievementIcon;
        document.getElementById('results-title').textContent = `${this.userData.name}'s Quiz Report`;
        document.getElementById('performance-message').textContent = performanceMessage;
        document.getElementById('personal-message').textContent = personalMessage;
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
                    <strong><i class="fas fa-lightbulb"></i> Explanation:</strong>
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
            if (text) text.textContent = 'Review Questions & Explanations';
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
        
        const reviewContainer = document.getElementById('review-container');
        if (reviewContainer) reviewContainer.style.display = 'none';
        const arrow = document.getElementById('review-arrow-icon');
        if (arrow) arrow.className = 'fas fa-chevron-down';
        const text = document.getElementById('toggle-review-text');
        if (text) text.textContent = 'Review Questions & Explanations';
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
        const subject = this.getSubjectName(this.userData.favoriteSubject).replace(/^[^\s]+\s/, '');
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

    // ======================================================================
    // STATIC CURATED QUESTION BANKS WITH EXPLANATIONS
    // ======================================================================
    initQuestionBanks() {
        return {
            mathematics: {
                elementary: [
                    {id: 'm_e_1', question: 'What is 7 × 8?', correct_answer: '56', incorrect_answers: ['54', '64', '58'], explanation: '7 multiplied by 8 equals 56.'},
                    {id: 'm_e_2', question: 'What is 100 - 37?', correct_answer: '63', incorrect_answers: ['53', '67', '73'], explanation: '100 minus 37: 100 - 30 = 70, and 70 - 7 = 63.'},
                    {id: 'm_e_3', question: 'How many sides does an octagon have?', correct_answer: '8', incorrect_answers: ['6', '7', '10'], explanation: 'An octagon is an 8-sided polygon (the prefix "oct-" means eight).'},
                    {id: 'm_e_4', question: 'What is 72 ÷ 9?', correct_answer: '8', incorrect_answers: ['6', '7', '9'], explanation: 'Since 9 × 8 = 72, 72 divided by 9 is 8.'}
                ],
                middle: [
                    {id: 'm_m_1', question: 'What is the value of 3⁴ (3 to the 4th power)?', correct_answer: '81', incorrect_answers: ['27', '64', '12'], explanation: '3⁴ = 3 × 3 × 3 × 3 = 81.'},
                    {id: 'm_m_2', question: 'What is the perimeter of a rectangle with length 9 cm and width 4 cm?', correct_answer: '26 cm', incorrect_answers: ['36 cm', '13 cm', '24 cm'], explanation: 'Perimeter of a rectangle = 2 × (length + width) = 2 × (9 + 4) = 2 × 13 = 26 cm.'},
                    {id: 'm_m_3', question: 'What is the sum of angles inside any triangle?', correct_answer: '180°', incorrect_answers: ['360°', '90°', '270°'], explanation: 'In Euclidean geometry, the interior angles of any triangle always add up to 180°.'}
                ],
                high: [
                    {id: 'm_h_1', question: 'What is the Pythagorean theorem relating right triangle sides?', correct_answer: 'a² + b² = c²', incorrect_answers: ['a + b = c', 'a² - b² = c²', 'a² + b² = 2c'], explanation: 'In any right triangle, the square of the hypotenuse (c) is equal to the sum of the squares of the other two legs (a² + b² = c²).'},
                    {id: 'm_h_2', question: 'What is the derivative of sin(x)?', correct_answer: 'cos(x)', incorrect_answers: ['-cos(x)', 'tan(x)', '-sin(x)'], explanation: 'By standard calculus differentiation rules, d/dx [sin(x)] = cos(x).'},
                    {id: 'm_h_3', question: 'What is the value of log₁₀(1000)?', correct_answer: '3', incorrect_answers: ['2', '10', '100'], explanation: 'log₁₀(1000) = 3 because 10³ = 1000.'}
                ],
                college: [
                    {id: 'm_c_1', question: 'What is Euler’s Identity formula relating e, i, and π?', correct_answer: 'e^(iπ) + 1 = 0', incorrect_answers: ['e^(iπ) = 1', 'e^(π) + i = 0', 'e^(2πi) = -1'], explanation: 'Euler\'s identity e^(iπ) + 1 = 0 connects five fundamental mathematical constants (e, i, π, 1, 0).'},
                    {id: 'm_c_2', question: 'What is the integral ∫ e^(2x) dx?', correct_answer: '(1/2)e^(2x) + C', incorrect_answers: ['2e^(2x) + C', 'e^(2x) + C', '(1/4)e^(2x) + C'], explanation: 'By substitution u = 2x, du = 2 dx, ∫ e^(2x) dx = (1/2)e^(2x) + C.'}
                ]
            },
            science: {
                elementary: [
                    {id: 's_e_1', question: 'Which gas do humans require to breathe in?', correct_answer: 'Oxygen', incorrect_answers: ['Carbon Dioxide', 'Nitrogen', 'Helium'], explanation: 'Humans inhale oxygen (O₂) to generate energy through cellular respiration.'},
                    {id: 's_e_2', question: 'What is the freezing point of pure water in Celsius?', correct_answer: '0°C', incorrect_answers: ['32°C', '100°C', '-10°C'], explanation: 'Under standard atmospheric pressure, pure water freezes into ice at 0°C (32°F).'},
                    {id: 's_e_3', question: 'Which planet in our solar system is known as the Red Planet?', correct_answer: 'Mars', incorrect_answers: ['Venus', 'Jupiter', 'Mercury'], explanation: 'Mars appears red due to the prevalence of iron oxide (rust) on its surface.'}
                ],
                middle: [
                    {id: 's_m_1', question: 'What is the powerhouse organelle of eukaryotic cells?', correct_answer: 'Mitochondria', incorrect_answers: ['Nucleus', 'Ribosome', 'Chloroplast'], explanation: 'Mitochondria produce ATP (cellular energy) via oxidative phosphorylation.'},
                    {id: 's_m_2', question: 'What is the chemical formula for water?', correct_answer: 'H₂O', incorrect_answers: ['CO₂', 'HO₂', 'H₂O₂'], explanation: 'Water consists of 2 hydrogen atoms covalently bonded to 1 oxygen atom (H₂O).'},
                    {id: 's_m_3', question: 'Which element has the atomic symbol Au?', correct_answer: 'Gold', incorrect_answers: ['Silver', 'Argon', 'Aluminum'], explanation: 'Au is derived from the Latin word "Aurum", which means gold.'}
                ],
                high: [
                    {id: 's_h_1', question: 'What does the First Law of Thermodynamics state?', correct_answer: 'Energy cannot be created or destroyed, only transformed', incorrect_answers: ['Entropy of an isolated system always increases', 'Absolute zero is unreachable', 'Heat flows spontaneously from cold to hot'], explanation: 'The First Law (Conservation of Energy) states total energy in an isolated system remains constant.'},
                    {id: 's_h_2', question: 'What is the approximate speed of light in a vacuum?', correct_answer: '300,000 km/s', incorrect_answers: ['150,000 km/s', '500,000 km/s', '1,000,000 km/s'], explanation: 'The speed of light c in vacuum is approximately 299,792 km/s (~3 × 10⁸ m/s).'}
                ],
                college: [
                    {id: 's_c_1', question: 'Which subatomic particle mediates the electromagnetic interaction?', correct_answer: 'Photon', incorrect_answers: ['Gluon', 'W Boson', 'Graviton'], explanation: 'In Quantum Electrodynamics (QED), photons are the gauge bosons mediating electromagnetism.'},
                    {id: 's_c_2', question: 'What is the Gibbs free energy criterion for a spontaneous reaction at constant T and P?', correct_answer: 'ΔG < 0', incorrect_answers: ['ΔG > 0', 'ΔG = 0', 'ΔH > 0'], explanation: 'A negative change in Gibbs free energy (ΔG < 0) indicates a thermodynamically favorable (spontaneous) process.'}
                ]
            },
            history: {
                elementary: [
                    {id: 'h_e_1', question: 'Who was the first President of the United States?', correct_answer: 'George Washington', incorrect_answers: ['Abraham Lincoln', 'Thomas Jefferson', 'John Adams'], explanation: 'George Washington served as the first U.S. President from 1789 to 1797.'},
                    {id: 'h_e_2', question: 'In which ancient country were the Pyramids of Giza constructed?', correct_answer: 'Egypt', incorrect_answers: ['Greece', 'Rome', 'Babylon'], explanation: 'The Pyramids of Giza were built by the ancient Egyptian civilization along the Nile river.'}
                ],
                middle: [
                    {id: 'h_m_1', question: 'In which year did World War II end?', correct_answer: '1945', incorrect_answers: ['1939', '1944', '1950'], explanation: 'World War II concluded in 1945 following the surrender of Axis forces in Europe and Japan.'},
                    {id: 'h_m_2', question: 'Which historic document was signed in 1215 limiting royal powers in England?', correct_answer: 'Magna Carta', incorrect_answers: ['Bill of Rights', 'Treaty of Paris', 'Declaration of Rights'], explanation: 'Magna Carta ("Great Charter") was signed by King John in 1215, establishing the rule of law.'}
                ],
                high: [
                    {id: 'h_h_1', question: 'What event triggered the outbreak of World War I in 1914?', correct_answer: 'Assassination of Archduke Franz Ferdinand', incorrect_answers: ['Invasion of Poland', 'Sinking of the Lusitania', 'Russian Revolution'], explanation: 'The assassination of Austro-Hungarian Archduke Franz Ferdinand in Sarajevo triggered the alliance chain of WWI.'},
                    {id: 'h_h_2', question: 'The French Revolution began in 1789 with the storming of which fortress?', correct_answer: 'The Bastille', incorrect_answers: ['Versailles', 'Tuileries', 'Louvre'], explanation: 'The Storming of the Bastille on July 14, 1789 became an iconic symbol of the French Revolution.'}
                ],
                college: [
                    {id: 'h_c_1', question: 'The Peace of Westphalia (1648) established which foundation of modern international relations?', correct_answer: 'National Sovereignty (Westphalian System)', incorrect_answers: ['The European Union', 'Universal Declaration of Human Rights', 'Imperial Mandate'], explanation: 'Westphalia ended the Thirty Years\' War and established the principle of state sovereignty over territory and religion.'}
                ]
            },
            geography: {
                elementary: [
                    {id: 'g_e_1', question: 'What is the largest ocean on planet Earth?', correct_answer: 'Pacific Ocean', incorrect_answers: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean'], explanation: 'The Pacific Ocean covers over 63 million square miles, making it Earth\'s largest ocean.'},
                    {id: 'g_e_2', question: 'What is the capital city of France?', correct_answer: 'Paris', incorrect_answers: ['London', 'Rome', 'Berlin'], explanation: 'Paris is the capital and largest city of France.'}
                ],
                middle: [
                    {id: 'g_m_1', question: 'What is the longest river in the world?', correct_answer: 'Nile River', incorrect_answers: ['Amazon River', 'Mississippi River', 'Yangtze River'], explanation: 'The Nile River in Africa spans approximately 6,650 km (4,132 miles).'},
                    {id: 'g_m_2', question: 'Which is the largest hot desert on Earth?', correct_answer: 'Sahara Desert', incorrect_answers: ['Gobi Desert', 'Kalahari Desert', 'Atacama Desert'], explanation: 'The Sahara in North Africa is the largest hot desert, spanning over 9 million square km.'}
                ],
                high: [
                    {id: 'g_h_1', question: 'Which strait separates Europe from Africa at the entrance to the Mediterranean?', correct_answer: 'Strait of Gibraltar', incorrect_answers: ['Bosphorus Strait', 'Bering Strait', 'Malacca Strait'], explanation: 'The Strait of Gibraltar connects the Atlantic Ocean to the Mediterranean Sea between Spain and Morocco.'},
                    {id: 'g_h_2', question: 'What is the highest mountain peak above sea level?', correct_answer: 'Mount Everest', incorrect_answers: ['K2', 'Kangchenjunga', 'Mount Kilimanjaro'], explanation: 'Mount Everest in the Himalayas stands at 8,848.86 meters (29,031.7 ft) above sea level.'}
                ],
                college: [
                    {id: 'g_c_1', question: 'What tectonic process formed the Mariana Trench?', correct_answer: 'Subduction of the Pacific Plate under the Mariana Plate', incorrect_answers: ['Divergent seafloor spreading', 'Transform fault slipping', 'Continental collision'], explanation: 'The Mariana Trench is an oceanic trench formed by convergent subduction of oceanic lithosphere.'}
                ]
            },
            technology: {
                elementary: [
                    {id: 't_e_1', question: 'What is considered the "brain" of a computer?', correct_answer: 'CPU (Central Processing Unit)', incorrect_answers: ['Hard Drive', 'Monitor', 'RAM'], explanation: 'The CPU performs instructions and calculations, acting as the primary processor.'},
                    {id: 't_e_2', question: 'What does "PC" stand for in computing?', correct_answer: 'Personal Computer', incorrect_answers: ['Private Caller', 'Public Central', 'Program Code'], explanation: 'PC stands for Personal Computer, popularized in the 1980s.'}
                ],
                middle: [
                    {id: 't_m_1', question: 'What does HTML stand for in web development?', correct_answer: 'HyperText Markup Language', incorrect_answers: ['Hyper Tool Modern Logic', 'High Tech Modular Language', 'Home Tool Markup Level'], explanation: 'HTML is the standard markup language used to structure web pages.'},
                    {id: 't_m_2', question: 'How many bits are in one standard byte?', correct_answer: '8 bits', incorrect_answers: ['4 bits', '16 bits', '32 bits'], explanation: '1 Byte is standardized as exactly 8 binary bits.'}
                ],
                high: [
                    {id: 't_h_1', question: 'What is the primary role of DNS on the internet?', correct_answer: 'Translating human domain names into IP addresses', incorrect_answers: ['Encrypting user passwords', 'Routing audio signals', 'Compiling code'], explanation: 'The Domain Name System (DNS) translates human-friendly domains (like example.com) to numeric IP addresses.'},
                    {id: 't_h_2', question: 'What is the time complexity of Binary Search on a sorted array?', correct_answer: 'O(log n)', incorrect_answers: ['O(n)', 'O(n²)', 'O(1)'], explanation: 'Binary search halves the search space with each step, yielding logarithmic O(log n) time.'}
                ],
                college: [
                    {id: 't_c_1', question: 'In the CAP Theorem for distributed data stores, what does CAP stand for?', correct_answer: 'Consistency, Availability, Partition Tolerance', incorrect_answers: ['Concurrency, Atomicity, Performance', 'Caching, Authentication, Privacy', 'Compatibility, Adaptability, Portability'], explanation: 'Eric Brewer\'s CAP theorem proves distributed systems can guarantee at most 2 of Consistency, Availability, and Partition tolerance.'}
                ]
            },
            literature: {
                elementary: [
                    {id: 'l_e_1', question: 'Who wrote the "Harry Potter" book series?', correct_answer: 'J.K. Rowling', incorrect_answers: ['Roald Dahl', 'C.S. Lewis', 'Dr. Seuss'], explanation: 'J.K. Rowling is the British author of the seven-book Harry Potter fantasy series.'}
                ],
                middle: [
                    {id: 'l_m_1', question: 'Who wrote the play "Romeo and Juliet"?', correct_answer: 'William Shakespeare', incorrect_answers: ['Charles Dickens', 'Jane Austen', 'Mark Twain'], explanation: 'William Shakespeare wrote the tragic play Romeo and Juliet in the late 16th century.'}
                ],
                high: [
                    {id: 'l_h_1', question: 'Who authored the classic dystopian novel "1984"?', correct_answer: 'George Orwell', incorrect_answers: ['Aldous Huxley', 'Ray Bradbury', 'H.G. Wells'], explanation: 'George Orwell published 1984 in 1949, introducing concepts like Big Brother and Thoughtcrime.'}
                ],
                college: [
                    {id: 'l_c_1', question: 'Which modernist novel by James Joyce takes place entirely on June 16, 1904?', correct_answer: 'Ulysses', incorrect_answers: ['Finnegans Wake', 'To the Lighthouse', 'The Waste Land'], explanation: 'James Joyce\'s Ulysses chronicles Leopold Bloom\'s passage through Dublin on June 16, 1904.'}
                ]
            },
            art: {
                elementary: [
                    {id: 'a_e_1', question: 'Who painted the iconic portrait Mona Lisa?', correct_answer: 'Leonardo da Vinci', incorrect_answers: ['Vincent van Gogh', 'Pablo Picasso', 'Michelangelo'], explanation: 'Leonardo da Vinci painted the Mona Lisa in Florence during the Italian Renaissance.'}
                ],
                middle: [
                    {id: 'a_m_1', question: 'Who painted "The Starry Night"?', correct_answer: 'Vincent van Gogh', incorrect_answers: ['Claude Monet', 'Salvador Dalí', 'Edvard Munch'], explanation: 'Dutch Post-Impressionist painter Vincent van Gogh created The Starry Night in 1889.'}
                ],
                high: [
                    {id: 'a_h_1', question: 'Which Spanish artist created the surrealist painting "The Persistence of Memory" (melting clocks)?', correct_answer: 'Salvador Dalí', incorrect_answers: ['Pablo Picasso', 'Joan Miró', 'Francisco Goya'], explanation: 'Salvador Dalí painted The Persistence of Memory in 1931 as a prominent Surrealist artwork.'}
                ],
                college: [
                    {id: 'a_c_1', question: 'What Italian Renaissance technique describes subtle transitions of tone without hard borders?', correct_answer: 'Sfumato', incorrect_answers: ['Chiaroscuro', 'Trompe-l\'œil', 'Impasto'], explanation: 'Sfumato (derived from Italian "sfumare", to evaporate like smoke) produces softened edges.'}
                ]
            },
            sports: {
                elementary: [
                    {id: 'sp_e_1', question: 'How many players are on the field for one soccer team?', correct_answer: '11', incorrect_answers: ['9', '10', '12'], explanation: 'A standard association football (soccer) team fields 11 players including 1 goalkeeper.'}
                ],
                middle: [
                    {id: 'sp_m_1', question: 'How many rings are in the Olympic flag symbol?', correct_answer: '5', incorrect_answers: ['4', '6', '7'], explanation: 'The five interlocking Olympic rings represent the five inhabited continents participating in the Games.'}
                ],
                high: [
                    {id: 'sp_h_1', question: 'Which Grand Slam tennis tournament is played on grass courts?', correct_answer: 'Wimbledon', incorrect_answers: ['US Open', 'French Open', 'Australian Open'], explanation: 'Wimbledon Championships in London is the only tennis Grand Slam played on traditional grass.'}
                ],
                college: [
                    {id: 'sp_c_1', question: 'In what year were the first modern Olympic Games held in Athens?', correct_answer: '1896', incorrect_answers: ['1900', '1888', '1904'], explanation: 'The first modern Olympic Games were organized by the IOC and held in Athens, Greece in 1896.'}
                ]
            },
            general: {
                elementary: [
                    {id: 'gen_e_1', question: 'How many days are in a standard leap year?', correct_answer: '366', incorrect_answers: ['365', '364', '360'], explanation: 'A leap year has 366 days because an extra day (February 29) is added.'},
                    {id: 'gen_e_2', question: 'How many continents are there on Earth?', correct_answer: '7', incorrect_answers: ['5', '6', '8'], explanation: 'The 7 continents are Asia, Africa, North America, South America, Antarctica, Europe, and Australia.'}
                ],
                middle: [
                    {id: 'gen_m_1', question: 'What is the smallest independent nation in the world by area?', correct_answer: 'Vatican City', incorrect_answers: ['Monaco', 'San Marino', 'Liechtenstein'], explanation: 'Vatican City covers an area of about 0.49 square kilometers (121 acres).'},
                    {id: 'gen_m_2', question: 'What is the currency of Japan?', correct_answer: 'Yen', incorrect_answers: ['Won', 'Yuan', 'Ringgit'], explanation: 'The Japanese Yen (¥) is the official currency of Japan.'}
                ],
                high: [
                    {id: 'gen_h_1', question: 'Which gas makes up approximately 78% of Earth\'s atmosphere?', correct_answer: 'Nitrogen', incorrect_answers: ['Oxygen', 'Carbon Dioxide', 'Argon'], explanation: 'Earth\'s atmosphere consists of approximately 78% nitrogen, 21% oxygen, and 1% trace gases.'}
                ],
                college: [
                    {id: 'gen_c_1', question: 'Which 1992 treaty formally established the European Union?', correct_answer: 'Maastricht Treaty', incorrect_answers: ['Treaty of Rome', 'Treaty of Lisbon', 'Treaty of Versailles'], explanation: 'The Maastricht Treaty (Treaty on European Union) was signed in 1992 and took effect in 1993.'}
                ]
            }
        };
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.quizApp = new QuizApp();
});

window.ProceduralQuestionGenerator = ProceduralQuestionGenerator;
window.QuizApp = QuizApp;
